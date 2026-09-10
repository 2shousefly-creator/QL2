import type { Env, Device } from './types';
export async function hash(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
export async function identity(request: Request) {
  const id = request.headers.get('X-QL-Device-Id') || '';
  const secret = request.headers.get('X-QL-Device-Secret') || '';
  if (!/^[a-f0-9-]{36}$/i.test(id) || !/^[\w-]{43}$/.test(secret)) throw new Response('Unauthorized', { status: 401 });
  return { id, secretHash: await hash(secret) };
}
export async function authenticate(env: Env, id: string, secretHash: string): Promise<Device> {
  const device = await env.DB.prepare('SELECT * FROM push_devices WHERE device_id = ?').bind(id).first<Device>();
  if (!device) throw new Response('Missing device', { status: 404 });
  if (device.device_secret_hash !== secretHash) throw new Response('Unauthorized', { status: 401 });
  return device;
}
