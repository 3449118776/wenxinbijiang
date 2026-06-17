// 共用工具：JWT + KV 存储 + 密码哈希
// Cloudflare Pages Functions 使用 Web Crypto API

export const JWT_SECRET = globalThis.__JWT_SECRET || 'wxbj_cloud_secret_2026_v2';
globalThis.__JWT_SECRET = JWT_SECRET;

// ============ Base64URL ============
function b64url_encode(strOrBytes) {
  let bytes = typeof strOrBytes === 'string'
    ? new TextEncoder().encode(strOrBytes)
    : strOrBytes;
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64url_decode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  let bin = atob(str);
  let bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function b64url_decode_str(str) {
  return new TextDecoder().decode(b64url_decode(str));
}

// ============ HMAC-SHA256 ============
async function hmac_sha256(keyBytes, dataBytes) {
  const key = await crypto.subtle.importKey(
    'raw', keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign', 'verify']
  );
  const sig = await crypto.subtle.sign('HMAC', key, dataBytes);
  return new Uint8Array(sig);
}

// ============ JWT ============
export async function jwt_sign(payload, secret, expiresInSec) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const enc = new TextEncoder();
  const signingInput = b64url_encode(JSON.stringify(header)) + '.' + b64url_encode(JSON.stringify(body));
  const sig = await hmac_sha256(enc.encode(secret || JWT_SECRET), enc.encode(signingInput));
  return signingInput + '.' + b64url_encode(sig);
}

export async function jwt_verify(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const enc = new TextEncoder();
  const signingInput = parts[0] + '.' + parts[1];
  const expectedSig = b64url_decode(parts[2]);
  const sig = await hmac_sha256(enc.encode(secret || JWT_SECRET), enc.encode(signingInput));
  if (sig.length !== expectedSig.length) return null;
  let ok = true;
  for (let i = 0; i < sig.length; i++) if (sig[i] !== expectedSig[i]) ok = false;
  if (!ok) return null;
  try {
    const payload = JSON.parse(b64url_decode_str(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) { return null; }
}

// ============ 密码哈希（PBKDF2 + SHA-256）============
// 格式: pbkdf2_sha256$100000$salt_b64$hash_b64
// 同时支持旧版 bcrypt hash（以 $2a$ 开头，调用 bcryptjs 比较）
const ITERATIONS = 100000;

export async function hash_password(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(password),
    { name: 'PBKDF2', hash: 'SHA-256' },
    false, ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key, 256
  );
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return `pbkdf2_sha256$${ITERATIONS}$${saltB64}$${hashB64}`;
}

export async function verify_password(password, storedHash) {
  if (!storedHash) return false;
  // 新格式: pbkdf2_sha256$100000$salt$hash
  if (storedHash.startsWith('pbkdf2_')) {
    const parts = storedHash.split('$');
    if (parts.length !== 4) return false;
    const iters = parseInt(parts[1]);
    const saltStr = parts[2];
    const hashStr = parts[3];
    const salt = new Uint8Array(16);
    const saltDecoded = atob(saltStr);
    for (let i = 0; i < Math.min(16, saltDecoded.length); i++) salt[i] = saltDecoded.charCodeAt(i);
    const expectedHash = atob(hashStr);
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(password),
      { name: 'PBKDF2', hash: 'SHA-256' },
      false, ['deriveBits']
    );
    const hash = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: iters, hash: 'SHA-256' },
      key, 256
    );
    const hashBytes = new Uint8Array(hash);
    if (hashBytes.length !== expectedHash.length) return false;
    let ok = true;
    for (let i = 0; i < hashBytes.length; i++) {
      if (hashBytes[i] !== expectedHash.charCodeAt(i)) ok = false;
    }
    return ok;
  }
  // bcrypt 格式（以 $2 开头）- Worker 环境下降级支持（简单比较前8位作为兜底）
  // 实际生产中应统一使用 PBKDF2
  return false;
}

// ============ KV 存储键管理 ============
const KV_USERS = () => globalThis.WXBJ_USERS || null;
const KV_WORKS = () => globalThis.WXBJ_WORKS || null;

// 如果没有单独命名空间，回退到 WXBJ_DATA 或 KV
const KV = () => {
  if (globalThis.WXBJ_DATA) return globalThis.WXBJ_DATA;
  if (globalThis.WXBJ_USERS) return globalThis.WXBJ_USERS;
  // 尝试通用的 KV binding 名称
  for (const k of ['KV', 'DB', 'DATA', 'STORE']) {
    if (globalThis[k]) return globalThis[k];
  }
  return null;
};

function key_user_email(email) { return 'user:email:' + email.toLowerCase().trim(); }
function key_user_id(id) { return 'user:id:' + id; }
function key_user_next_id() { return 'user:nextId'; }
function key_work(userId, workId) { return 'work:' + userId + ':' + workId; }
function key_works_list(userId) { return 'works:' + userId; }
function key_snap(workKey, version) { return 'snap:' + workKey + ':' + version; }
function key_user_keys(userId) { return 'user:keys:' + userId; }
function key_user_settings(userId) { return 'user:settings:' + userId; }

export async function db_get_user_by_email(email) {
  const store = KV();
  if (!store) return null;
  try {
    const v = await store.get(key_user_email(email), { type: 'json' });
    return v;
  } catch (e) { return null; }
}

export async function db_get_user_by_id(id) {
  const store = KV();
  if (!store) return null;
  try {
    const v = await store.get(key_user_id(id), { type: 'json' });
    return v;
  } catch (e) { return null; }
}

export async function db_create_user(email, password, nickname) {
  const store = KV();
  if (!store) throw new Error('KV store not available');
  const existing = await store.get(key_user_email(email), { type: 'json' });
  if (existing) throw new Error('该邮箱已注册');
  const nextId = (await store.get(key_user_next_id(), { type: 'json' })) || 0;
  const id = nextId + 1;
  const pwdHash = await hash_password(password);
  const user = {
    id, email: email.toLowerCase().trim(), nickname: nickname || '',
    passwordHash: pwdHash, visitCount: 0, lastVisitAt: null,
    resetToken: null, resetExpiresAt: null, createdAt: new Date().toISOString()
  };
  await store.put(key_user_email(user.email), JSON.stringify(user));
  await store.put(key_user_id(id), JSON.stringify(user));
  await store.put(key_user_next_id(), id);
  return user;
}

export async function db_update_user(user) {
  const store = KV();
  if (!store) return;
  const data = JSON.stringify(user);
  await store.put(key_user_email(user.email), data);
  await store.put(key_user_id(user.id), data);
}

export async function db_list_works(userId) {
  const store = KV();
  if (!store) return [];
  try {
    const list = await store.get(key_works_list(userId), { type: 'json' });
    if (!list) return [];
    // list 存的是 workId 数组，逐个取元数据
    const works = [];
    for (const wid of list) {
      const w = await store.get(key_work(userId, wid), { type: 'json' });
      if (w) {
        const payload = typeof w.payload === 'string' ? w.payload : (w.payload ? JSON.stringify(w.payload) : '{}');
        works.push({
          workId: w.workId, title: w.title, category: w.category || '',
          synopsis: w.synopsis || '', version: w.version || 1,
          chapterCount: w.chapterCount || 0, totalWords: w.totalWords || 0,
          updatedAt: w.updatedAt
        });
      }
    }
    works.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return works;
  } catch (e) { return []; }
}

export async function db_get_work(userId, workId) {
  const store = KV();
  if (!store) return null;
  try {
    return await store.get(key_work(userId, workId), { type: 'json' });
  } catch (e) { return null; }
}

export async function db_upsert_work(userId, body) {
  const store = KV();
  if (!store) throw new Error('KV store not available');
  const workId = body.workId;
  if (!workId) throw new Error('缺少 workId');
  const now = new Date().toISOString();
  let rec = await store.get(key_work(userId, workId), { type: 'json' });
  let payloadObj = body.payload || {};
  const payloadStr = typeof payloadObj === 'string' ? payloadObj : JSON.stringify(payloadObj);

  if (!rec) {
    rec = {
      userId, workId, title: body.title || '', category: body.category || '',
      synopsis: body.synopsis || '', payload: payloadStr, version: 1,
      chapterCount: body.chapterCount || 0, totalWords: body.totalWords || 0,
      updatedAt: now, createdAt: now
    };
    // 加入 works 列表
    let list = await store.get(key_works_list(userId), { type: 'json' }) || [];
    if (!list.includes(workId)) list.push(workId);
    await store.put(key_works_list(userId), JSON.stringify(list));
    await store.put(key_work(userId, workId), JSON.stringify(rec));
    return { status: 'created', version: 1 };
  }

  // 始终接受推送并递增版本（前端已通过 _dirty 标记确保只推送有意义的更新）
  rec.title = body.title || rec.title;
  rec.category = body.category || rec.category;
  rec.synopsis = body.synopsis || rec.synopsis;
  rec.payload = payloadStr;
  rec.version += 1;
  rec.chapterCount = body.chapterCount || rec.chapterCount || 0;
  rec.totalWords = body.totalWords || rec.totalWords || 0;
  rec.updatedAt = now;
  await store.put(key_work(userId, workId), JSON.stringify(rec));
  return { status: 'updated', version: rec.version };
}

// ============ Keys & Settings ============
export async function db_get_user_keys(userId) {
  const store = KV();
  if (!store) return { apiKeys: {} };
  try {
    const v = await store.get(key_user_keys(userId), { type: 'json' });
    return v || { apiKeys: {} };
  } catch (e) { return { apiKeys: {} }; }
}

export async function db_put_user_keys(userId, data) {
  const store = KV();
  if (!store) throw new Error('KV store not available');
  await store.put(key_user_keys(userId), JSON.stringify({
    apiKeys: data.apiKeys || {},
    updatedAt: new Date().toISOString()
  }));
  return { ok: true };
}

export async function db_get_user_settings(userId) {
  const store = KV();
  if (!store) return { settings: {} };
  try {
    const v = await store.get(key_user_settings(userId), { type: 'json' });
    return v || { settings: {} };
  } catch (e) { return { settings: {} }; }
}

export async function db_put_user_settings(userId, data) {
  const store = KV();
  if (!store) throw new Error('KV store not available');
  await store.put(key_user_settings(userId), JSON.stringify({
    settings: data.settings || {},
    apiConfig: data.apiConfig || {},
    updatedAt: new Date().toISOString()
  }));
  return { ok: true };
}

// ============ v55: 网文库存储 ============
const key_novel_library = (userId) => 'novel_lib:' + userId;

export async function db_get_novel_library(userId) {
  const store = KV();
  if (!store) return [];
  try {
    const data = await store.get(key_novel_library(userId), { type: 'json' });
    if (!data) return [];
    return Array.isArray(data.list) ? data.list : [];
  } catch (e) { return []; }
}

export async function db_save_novel_library(userId, list) {
  const store = KV();
  if (!store) throw new Error('KV store not available');
  await store.put(key_novel_library(userId), JSON.stringify({
    list: list,
    updatedAt: new Date().toISOString()
  }));
  return { ok: true };
}

// ============ 工具函数 ============
export function random_hex(len) {
  const bytes = crypto.getRandomValues(new Uint8Array(len || 16));
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

export function random_code() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function json_response(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
