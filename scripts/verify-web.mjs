import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { once } from 'node:events';
import { createServer } from 'node:net';

// Only loopback HTTP and built files. Never calls GCP or legacy Push.
const reserve = createServer();
reserve.listen(0, '127.0.0.1');
await once(reserve, 'listening');
const port = reserve.address().port;
await new Promise(resolve => reserve.close(resolve));
const child = spawn(process.execPath, ['dist-web/server.mjs'], {
  env: { ...process.env, NODE_ENV: 'production', PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'],
});
const exited = once(child, 'exit');
const base = `http://127.0.0.1:${port}`;
try {
  await Promise.race([once(child.stdout, 'data'), exited.then(() => { throw new Error('Startup failed'); }), new Promise((_, reject) => { const t = setTimeout(() => reject(new Error('Startup timeout')), 10_000); t.unref(); })]);
  const health = await fetch(base + '/api/health');
  assert.equal(health.status, 200);
  const manifest = await (await fetch(base + '/version.json')).json();
  assert.equal((await health.json()).version, manifest.buildId);
  for (const route of ['/', '/profile/nested', '/index.html', '/version.json', '/sw.js']) {
    const response = await fetch(base + route, { headers: { Accept: 'text/html' } });
    assert.equal(response.status, 200, route);
    assert.equal(response.headers.get('cache-control'), 'no-store', route);
  }
  for (const route of ['/api/missing', '/api/push/status', '/internal/push/xp-full', '/.env', '/server.mjs', '/assets/missing.png', '/%2eenv']) {
    const response = await fetch(base + route, { headers: { Accept: 'text/html' } });
    assert.equal(response.status, 404, route);
    assert.match(response.headers.get('content-type'), /application\/json/);
  }
  assert.equal((await fetch(base + '/api/push/register', { method: 'POST' })).status, 404);
  assert.equal((await fetch(base + '/', { method: 'POST' })).status, 405);
  assert.equal((await fetch(base + '/%ZZ')).status, 400);
  const files = await readdir('dist-web/client/assets');
  const js = files.find(f => /^index-.+\.js$/.test(f));
  assert.ok(js);
  const asset = await fetch(base + '/assets/' + js);
  assert.match(asset.headers.get('cache-control'), /immutable/);
  const bundled = await asset.text();
  assert.ok(bundled.includes(manifest.buildId), 'Bundle and manifest must have same build ID');
  assert.ok(!bundled.includes('quan-lo-push-api-953163983006'), 'Web build must remove legacy network calls');
  const head = await fetch(base + '/assets/' + js, { method: 'HEAD' });
  assert.equal(await head.text(), '');
  assert.equal((await fetch(base + '/assets/' + js, { headers: { 'If-None-Match': head.headers.get('etag') } })).status, 304);
  const range = await fetch(base + '/assets/' + js, { headers: { Range: 'bytes=0-15' } });
  assert.equal(range.status, 206);
  assert.equal((await range.arrayBuffer()).byteLength, 16);
  const server = await readFile('dist-web/server.mjs', 'utf8');
  assert.ok(!/firestore|cloudTasks|web-push|from "vite"/.test(server));
  async function checkAssets(dir, relative = '') {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const rel = relative + item.name;
      if (item.isDirectory()) await checkAssets(dir + '/' + item.name, rel + '/');
      else {
        assert.ok((await stat('dist-web/client/' + rel)).isFile(), rel);
        if (rel !== 'version.json') assert.deepEqual(await readFile(dir + '/' + item.name), await readFile('dist-web/client/' + rel), rel);
      }
    }
  }
  await checkAssets('public');
  console.log('PASS web: health, metadata, routes, isolation, cache, ranges, all public assets');
} finally {
  child.kill('SIGTERM');
  await exited;
}
const invalid = spawn(process.execPath, ['dist-web/server.mjs'], { env: { ...process.env, PORT: 'invalid' }, stdio: 'ignore' });
assert.equal((await once(invalid, 'exit'))[0], 1);
console.log('PASS invalid PORT rejected');
