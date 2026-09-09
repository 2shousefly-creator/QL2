// Deliberately imports only Node built-ins: no legacy Push/Firestore/Vite startup.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./client/', import.meta.url));
const portText = process.env.PORT ?? '8080';
if (!/^\d+$/.test(portText) || Number(portText) < 1 || Number(portText) > 65535) {
  console.error('[web] Invalid PORT');
  process.exit(1);
}
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.mp4': 'video/mp4',
};

async function start() {
  const version = JSON.parse(await readFile(path.join(root, 'version.json'), 'utf8'));
  if (typeof version.buildId !== 'string' || !version.buildId) throw new Error('Missing build metadata');
  await stat(path.join(root, 'index.html'));
  let closing = false;
  const server = createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    const json = (status: number, body: object) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify(body));
    };
    try {
      if (closing) return json(503, { error: 'Service shutting down' });
      const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
      if (pathname === '/api/health' && (req.method === 'GET' || req.method === 'HEAD')) {
        return json(200, { status: 'ok', app: 'quan-lo-web', version: version.buildId, timestamp: Date.now() });
      }
      if (/^\/(api|internal)(\/|$)/i.test(pathname)) return json(404, { error: 'API not found' });
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD');
        return json(405, { error: 'Method not allowed' });
      }
      if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').some(p => p.startsWith('.'))) {
        return json(404, { error: 'Not found' });
      }
      let target = path.resolve(root, '.' + pathname);
      if (target !== path.resolve(root) && !target.startsWith(root)) return json(404, { error: 'Not found' });
      let info = await stat(target).catch(() => null);
      if (!info?.isFile()) {
        // Missing files/assets must not be masked by the SPA shell.
        if (path.extname(pathname) || pathname.startsWith('/assets/') || !req.headers.accept?.includes('text/html')) {
          return json(404, { error: 'Not found' });
        }
        target = path.join(root, 'index.html');
        info = await stat(target);
      }
      const relative = path.relative(root, target).replaceAll('\\', '/');
      const cache = /^(index\.html|version\.json|sw\.js|manifest\.webmanifest|connectivity-check\.txt)$/.test(relative)
        ? 'no-store'
        : /^assets\/.+-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/.test(relative)
          ? 'public, max-age=31536000, immutable' : 'public, max-age=3600';
      res.setHeader('Cache-Control', cache);
      res.setHeader('Content-Type', mime[path.extname(target)] ?? 'application/octet-stream');
      res.setHeader('Accept-Ranges', 'bytes');
      const etag = `W/"${info.size}-${Math.trunc(info.mtimeMs)}"`;
      res.setHeader('ETag', etag);
      if (cache !== 'no-store' && req.headers['if-none-match'] === etag) {
        res.writeHead(304); res.end(); return;
      }
      let start = 0;
      let end = info.size - 1;
      let status = 200;
      if (req.headers.range && !req.headers['if-range']) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (match && (match[1] || match[2])) {
          start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
          end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end;
          if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) {
            res.setHeader('Content-Range', `bytes */${info.size}`);
            return json(416, { error: 'Range not satisfiable' });
          }
          status = 206;
          res.setHeader('Content-Range', `bytes ${start}-${end}/${info.size}`);
        }
      }
      res.setHeader('Content-Length', Math.max(0, end - start + 1));
      res.writeHead(status);
      if (req.method === 'HEAD' || info.size === 0) { res.end(); return; }
      const stream = createReadStream(target, { start, end });
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } catch (error) {
      if (!res.headersSent) json(error instanceof URIError ? 400 : 500, { error: 'Request failed' });
      else res.destroy();
    }
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  server.on('error', () => { console.error('[web] Server startup/listen failure'); process.exit(1); });
  server.listen(Number(portText), '0.0.0.0', () => console.log('[web] Listening'));
  const shutdown = () => {
    if (closing) return;
    closing = true;
    server.close(() => process.exit(0));
    setTimeout(() => { server.closeAllConnections(); process.exit(0); }, 8_000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
start().catch(() => { console.error('[web] Startup failed: verify client build and version manifest'); process.exit(1); });
