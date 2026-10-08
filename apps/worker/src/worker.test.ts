import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadWorkerEnv } from './env.js';
import { startWorker } from './worker.js';

describe('startWorker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('ticks on the interval until stopped', async () => {
    const tick = vi.fn(() => Promise.resolve());
    const worker = startWorker(tick, 100);

    await vi.advanceTimersByTimeAsync(350);
    expect(tick).toHaveBeenCalledTimes(3);

    await worker.stop();
    await vi.advanceTimersByTimeAsync(500);
    expect(tick).toHaveBeenCalledTimes(3);
  });

  it('reports tick errors without stopping', async () => {
    const onError = vi.fn();
    const tick = vi.fn(() => Promise.reject(new Error('boom')));
    const worker = startWorker(tick, 100, onError);

    await vi.advanceTimersByTimeAsync(250);
    expect(onError).toHaveBeenCalledTimes(2);
    await worker.stop();
  });
});

describe('loadWorkerEnv', () => {
  it('applies defaults', () => {
    expect(loadWorkerEnv({})).toMatchObject({
      REDIS_URL: 'redis://localhost:6379',
      WORKER_TICK_MS: 5000,
    });
  });
});
