// Captures the seeded API state into demo/snapshot.json for the server-less demo build.
// Usage: API running with seeded data → node scripts/demo-snapshot.mjs [apiUrl]
import { writeFile } from 'node:fs/promises';

const api = process.argv[2] ?? 'http://localhost:3001';
const get = async (path) => {
  const response = await fetch(`${api}${path}`);
  if (!response.ok) throw new Error(`${path} → ${response.status}`);
  return response.json();
};

const [agents, approvals, summary, tasks] = await Promise.all([
  get('/agents'),
  get('/approvals?status=pending'),
  get('/dashboard/summary'),
  get('/tasks'),
]);

const out = new URL('../demo/snapshot.json', import.meta.url);
await writeFile(out, `${JSON.stringify({ agents, approvals, summary, tasks }, null, 2)}\n`);
console.info(
  `demo snapshot: ${agents.length} agents, ${approvals.length} approvals, ${tasks.length} tasks`,
);
