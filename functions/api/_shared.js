/**
 * Cloudflare Pages Functions - 共享工具
 * KV 存储辅助 + JWT 签名
 */

async function hashPassword(password) {
  // 简易 PBKDF2 风格哈希
  const encoder = new TextEncoder();
  const salt = 'wxbj_salt_fixed_v2';
  const saltData = encoder.encode(salt);

  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(password + salt),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(password));
  const hashArray = Array.from(new Uint8Array(sig));
  return 'pbkdf2_sha256$10000$' + btoa(String.fromCharCode(...hashArray));
}

async function verifyPassword(password, storedHash) {
  const computed = await hashPassword(password);
  return computed === storedHash;
}

async function generateJWT(userId, email, secret) {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId: String(userId),
    email: email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 3600
  };

  const encHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const encPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const signingString = encHeader + '.' + encPayload;

  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(signingString)));
  const sigStr = Array.from(sig).map(b => String.fromCharCode(b)).join('');
  const encSig = btoa(sigStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return signingString + '.' + encSig;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store'
    }
  });
}

async function getUserId(request) {
  return request.headers.get('X-User-Id') || '';
}

async function getKV(env, key) {
  try {
    return await env.WXBJ_DATA.get(key);
  } catch (e) {
    return null;
  }
}

async function putKV(env, key, value) {
  try {
    await env.WXBJ_DATA.put(key, value);
  } catch (e) {}
}

async function deleteKV(env, key) {
  try {
    await env.WXBJ_DATA.delete(key);
  } catch (e) {}
}

async function nextId(env, prefix) {
  const key = prefix + '_nextId';
  const current = await env.WXBJ_DATA.get(key) || '0';
  const next = parseInt(current) + 1;
  await env.WXBJ_DATA.put(key, String(next));
  return next;
}

export { hashPassword, verifyPassword, generateJWT, jsonResponse, getUserId, getKV, putKV, deleteKV, nextId };
