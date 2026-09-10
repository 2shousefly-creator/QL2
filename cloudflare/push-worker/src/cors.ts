const origins = new Set(['https://quanloweb.web.app', 'http://localhost:5173', 'http://localhost:3000']);
export function cors(request: Request): Headers {
  const origin = request.headers.get('Origin');
  if (origin && !origins.has(origin)) throw new Response('Forbidden origin', { status: 403 });
  if (!origin && request.method !== 'GET') throw new Response('Origin required', { status: 403 });
  const headers = new Headers({
    'Cache-Control': 'no-store', 'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-QL-Device-Id, X-QL-Device-Secret',
  });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  return headers;
}
