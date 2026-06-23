// 共用工具：JWT + KV 存储 + 密码哈希
// Cloudflare Pages Functions 使用 Web Crypto API

// bcryptjs 依赖（懒加载 - 首次调用时才 import，避免顶层 await）
// 如果不可用，仅影响旧格式密码校验，PBKDF2 不受影响
let _bcryptPromise = null;
function getBcrypt() {
  if (_bcryptPromise === null) {
    _bcryptPromise = (async () => {
      try {
        const mod = await import('bcryptjs');
        return mod && (mod.default || mod);
      } catch (e) {
        console.warn('[shared] bcryptjs 不可用，仅支持 PBKDF2 密码格式');
        return null;
      }
    })();
  }
  return _bcryptPromise;
}

function getJWTSecret() {
  return globalThis.__JWT_SECRET || 'wxbj_cloud_secret_2026_v2_production';
}
const JWT_SECRET_DEFAULT = getJWTSecret();

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
  const sig = await hmac_sha256(enc.encode(secret || getJWTSecret()), enc.encode(signingInput));
  return signingInput + '.' + b64url_encode(sig);
}

export async function jwt_verify(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const enc = new TextEncoder();
  const signingInput = parts[0] + '.' + parts[1];
  let expectedSig, sig;
  try {
    expectedSig = b64url_decode(parts[2]);
    sig = await hmac_sha256(enc.encode(secret || getJWTSecret()), enc.encode(signingInput));
  } catch (e) { return null; }
  if (sig.length !== expectedSig.length) return null;
  let ok = 0;
  for (let i = 0; i < sig.length; i++) ok |= sig[i] ^ expectedSig[i];
  if (ok !== 0) return null;
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
    let ok = 0;
    for (let i = 0; i < hashBytes.length; i++) {
      ok |= hashBytes[i] ^ expectedHash.charCodeAt(i);
    }
    return ok === 0;
  }
  // bcrypt 格式（以 $2 开头）- 使用 bcryptjs 纯 JS 库验证
  if (storedHash.startsWith('$2')) {
    const bcrypt = await getBcrypt();
    if (!bcrypt) {
      console.warn('[verify_password] bcryptjs 不可用，无法验证 bcrypt 格式密码');
      return false;
    }
    return await bcrypt.compare(password, storedHash);
  }
  return false;
}

// ============ KV 存储键管理 ============
const KV_USERS = () => globalThis.WXBJ_USERS || null;
const KV_WORKS = () => globalThis.WXBJ_WORKS || null;

const KV = () => {
  if (globalThis.WXBJ_DATA) return globalThis.WXBJ_DATA;
  if (globalThis.WXBJ_USERS) return globalThis.WXBJ_USERS;
  if (globalThis.WXBJ_WORKS) return globalThis.WXBJ_WORKS;
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
  if (!store) throw new Error('存储未配置');
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await store.get(key_user_email(normalizedEmail), { type: 'json' });
  if (existing) throw new Error('该邮箱已注册');
  const id = await _atomicIncrement(store, key_user_next_id());
  const pwdHash = await hash_password(password);
  const user = {
    id, email: normalizedEmail, nickname: nickname || '',
    passwordHash: pwdHash, visitCount: 0, lastVisitAt: null,
    resetToken: null, resetExpiresAt: null, createdAt: new Date().toISOString()
  };
  await store.put(key_user_email(user.email), JSON.stringify(user));
  await store.put(key_user_id(id), JSON.stringify(user));
  return user;
}

// 原子递增（带重试，减轻 KV 竞态问题）
async function _atomicIncrement(store, key) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const val = (await store.get(key, { type: 'json' })) || 0;
    const next = val + 1;
    await store.put(key, next);
    if (attempt > 0) await new Promise(r => setTimeout(r, 50 << attempt));
    const verify = await store.get(key, { type: 'json' });
    if (verify === next) return next;
  }
  return ((await store.get(key, { type: 'json' })) || 0) + 1;
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
  if (!store) throw new Error('存储未配置');
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
    await store.put(key_work(userId, workId), JSON.stringify(rec));
    let list = await store.get(key_works_list(userId), { type: 'json' }) || [];
    if (!list.includes(workId)) {
      list.push(workId);
      await store.put(key_works_list(userId), JSON.stringify(list));
    }
    return { status: 'created', version: 1 };
  }

  rec.title = body.title || rec.title;
  rec.category = body.category || rec.category;
  rec.synopsis = body.synopsis || rec.synopsis;
  rec.payload = payloadStr;
  rec.version = (rec.version || 0) + 1;
  rec.chapterCount = body.chapterCount || rec.chapterCount || 0;
  rec.totalWords = body.totalWords || rec.totalWords || 0;
  rec.updatedAt = now;
  await store.put(key_work(userId, workId), JSON.stringify(rec));
  return { status: 'updated', version: rec.version };
}

export async function db_delete_work(userId, workId) {
  const store = KV();
  if (!store) throw new Error('存储未配置');
  await store.delete(key_work(userId, workId));
  let list = await store.get(key_works_list(userId), { type: 'json' }) || [];
  list = list.filter(id => id !== workId);
  await store.put(key_works_list(userId), JSON.stringify(list));
  return { ok: true };
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
