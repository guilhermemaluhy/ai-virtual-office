// Builds the server-less demo (demo/dist): one JS + one CSS bundle and an HTML page,
// with data from demo/snapshot.json. Used to share a clickable preview of the office.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('..', import.meta.url));
const outdir = `${root}demo/dist`;
await mkdir(outdir, { recursive: true });

await build({
  entryPoints: { office: `${root}demo/main.tsx` },
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2022',
  jsx: 'automatic',
  outdir,
  alias: { 'next/dynamic': `${root}demo/next-dynamic.tsx` },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.NEXT_PUBLIC_DEMO': '"1"',
    'process.env.NEXT_PUBLIC_API_URL': 'undefined',
  },
  logLevel: 'warning',
});

await writeFile(
  `${outdir}/index.html`,
  `<title>AI Virtual Office</title>
<link rel="stylesheet" href="office.css">
<style>html, body, #root { height: 100%; }</style>
<div id="root"></div>
<script src="office.js"></script>
`,
);
console.info(`demo built in ${outdir}`);
