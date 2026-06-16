/**
 * Cloudflare Pages - JWT 认证中间件
 * 将后端 Express 的 authMiddleware 转换为 Pages Functions 语法
 */

async function verifyJWT(token, secret) {
  // 简易 HS256 JWT 验证（避免外部依赖）
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const encoder = new TextEncoder();
  const data = parts[0] + '.' + parts[1];

  // 计算签名
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  const signature = base64UrlDecode(parts[2]);
  const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
  if (!valid) return null;

  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function base64UrlEncode(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // 公开路由
  const publicPaths = ['/api/auth/register', '/api/auth/login'];
  if (publicPaths.some(p => url.pathname.startsWith(p))) {
    return next();
  }
  // 非 API 请求直接放行
  if (!url.pathname.startsWith('/api/')) {
    return next();
  }

  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) {
    return new Response(JSON.stringify({ error: '请先登录' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  }

  try {
    const secret = env.WXBJ_SECRET || 'wxbj_cloud_secret_2026';
    const decoded = await verifyJWT(token, secret);
    if (!decoded) throw new Error('invalid');

    // 将用户信息放入请求头传递给下游
    const newHeaders = new Headers(request.headers);
    newHeaders.set('X-User-Id', decoded.userId);
    newHeaders.set('X-User-Email', decoded.email || '');

    const newRequest = new Request(request, { headers: newHeaders });
    return context.next();
  } catch (err) {
    return new Response(JSON.stringify({ error: '登录已过期，请重新登录' }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  }
}
