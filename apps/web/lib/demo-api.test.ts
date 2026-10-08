import { describe, expect, it } from 'vitest';
import snapshot from '../demo/snapshot.json';
import { createDemoApi, type DemoSnapshot } from './demo-api';

const demo = () => createDemoApi(snapshot as DemoSnapshot, () => new Date('2026-10-08T12:00:00Z'));

describe('demo api', () => {
  it('serves the captured office', async () => {
    const api = demo();
    expect(await api.agents()).toHaveLength(15);
    expect((await api.summary()).marketplaces).toHaveLength(2);
    expect((await api.agent('ml-atendimento')).tasks.length).toBeGreaterThan(0);
  });

  it('decides once and frees the agent when nothing else is pending', async () => {
    const api = demo();
    const [first] = (await api.pendingApprovals()).filter((a) => a.requestedBy === 'ml-ads');
    if (!first) throw new Error('snapshot has no ml-ads approval');
    const before = (await api.summary()).pendingApprovals;

    await api.decide(first.id, 'approved');
    expect((await api.summary()).pendingApprovals).toBe(before - 1);
    expect((await api.agents()).find((a) => a.id === 'ml-ads')?.state).toBe('working');
    await expect(api.decide(first.id, 'rejected')).rejects.toThrow(/já foi aprovado/);
  });

  it('keeps instances isolated from the snapshot', async () => {
    const a = demo();
    const [approval] = await a.pendingApprovals();
    if (!approval) throw new Error('no approvals');
    await a.decide(approval.id, 'rejected');
    expect(await demo().pendingApprovals()).toHaveLength(snapshot.approvals.length);
  });
});
