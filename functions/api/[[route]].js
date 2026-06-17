// Pages Functions - 统一处理 /api/* 路由
import {
  jwt_sign, jwt_verify, verify_password, hash_password,
  db_get_user_by_email, db_get_user_by_id, db_create_user, db_update_user,
  db_list_works, db_get_work, db_upsert_work,
  db_get_user_keys, db_put_user_keys, db_get_user_settings, db_put_user_settings,
  random_hex, random_code, json_response
} from './_shared.js';

export async function onRequest(context) {
  const req = context.request;
  const url = new URL(req.url);
  const path = url.pathname;

  // 从 URL 中移除 /api 前缀
  const apiPath = path.replace(/^\/api/, '') || '/';

  // 公开路由
  if (apiPath === '/auth/register' && req.method === 'POST') return handle_register(req);
  if (apiPath === '/auth/login' && req.method === 'POST') return handle_login(req);
  if (apiPath === '/auth/forgot-password' && req.method === 'POST') return handle_forgot(req);
  if (apiPath === '/auth/reset-password' && req.method === 'POST') return handle_reset(req);
  if (apiPath === '/health' && req.method === 'GET') return json_response({ ok: true, time: Date.now() });

  // 需要认证的路由
  const auth = req.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  const decoded = token ? await jwt_verify(token) : null;

  if (!decoded) return json_response({ error: '请先登录' }, 401);
  const userId = decoded.userId;

  if (apiPath === '/user/profile' && req.method === 'GET') return handle_profile(userId);
  if (apiPath === '/user/keys' && req.method === 'GET') return handle_keys_get(userId);
  if (apiPath === '/user/keys' && req.method === 'PUT') return handle_keys_put(req, userId);
  if (apiPath === '/user/settings' && req.method === 'GET') return handle_settings_get(userId);
  if (apiPath === '/user/settings' && req.method === 'PUT') return handle_settings_put(req, userId);
  if (apiPath === '/works' && req.method === 'GET') return handle_works_list(userId);
  if (apiPath.match(/^\/works\/[^\/]+$/) && req.method === 'GET') {
    const workId = apiPath.split('/')[2];
    return handle_work_get(userId, workId);
  }
  if (apiPath.match(/^\/works\/[^\/]+$/) && req.method === 'PUT') {
    const workId = apiPath.split('/')[2];
    return handle_work_upsert(req, userId, workId);
  }
  if (apiPath === '/works/sync/batch' && req.method === 'POST') return handle_batch(req, userId);
  if (apiPath.match(/^\/works\/[^\/]+\/delete$/) && req.method === 'POST') {
    const workId = apiPath.split('/')[2];
    return handle_work_delete(userId, workId);
  }

  return json_response({ error: '路由不存在: ' + apiPath }, 404);
}

// ============ 认证 ============
async function handle_register(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, nickname } = body;
    if (!email || !password) return json_response({ error: '邮箱和密码不能为空' }, 400);
    if (String(password).length < 6) return json_response({ error: '密码至少6位' }, 400);
    const user = await db_create_user(email, password, nickname);
    const token = await jwt_sign({ userId: user.id, email: user.email }, null, 30 * 24 * 3600);
    return json_response({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (e) {
    return json_response({ error: e.message || '注册失败' }, 500);
  }
}

async function handle_login(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;
    if (!email || !password) return json_response({ error: '邮箱和密码不能为空' }, 400);
    const user = await db_get_user_by_email(email);
    if (!user) return json_response({ error: '邮箱或密码不正确' }, 401);
    const ok = await verify_password(password, user.passwordHash);
    if (!ok) return json_response({ error: '邮箱或密码不正确' }, 401);
    user.visitCount = (user.visitCount || 0) + 1;
    user.lastVisitAt = new Date().toISOString();
    await db_update_user(user);
    const token = await jwt_sign({ userId: user.id, email: user.email }, null, 30 * 24 * 3600);
    return json_response({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (e) {
    return json_response({ error: e.message || '登录失败' }, 500);
  }
}

async function handle_forgot(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;
    if (!email) return json_response({ error: '请提供邮箱' }, 400);
    const user = await db_get_user_by_email(email);
    if (!user) {
      // 安全：不区分是否存在，防止枚举攻击
      return json_response({ ok: true, message: '如果该邮箱已注册，我们已发送验证码' });
    }
    // 生成6位数字验证码（15分钟有效）
    const code = random_code();
    user.resetToken = code;
    user.resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await db_update_user(user);
    // 演示模式：直接返回验证码（生产环境应接入邮件发送服务）
    return json_response({ ok: true, code: code, token: code });
  } catch (e) {
    return json_response({ error: e.message || '操作失败' }, 500);
  }
}

async function handle_reset(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, code, password, token } = body;
    const resetToken = code || token; // 兼容两种字段名
    if (!email || !resetToken || !password) return json_response({ error: '参数不完整' }, 400);
    if (String(password).length < 6) return json_response({ error: '密码至少6位' }, 400);
    const user = await db_get_user_by_email(email);
    if (!user) return json_response({ error: '用户不存在' }, 404);
    if (!user.resetToken || user.resetToken !== resetToken) return json_response({ error: '验证码不正确' }, 400);
    if (!user.resetExpiresAt || new Date() > new Date(user.resetExpiresAt)) return json_response({ error: '验证码已过期，请重新获取' }, 400);
    user.passwordHash = await hash_password(password);
    user.resetToken = null;
    user.resetExpiresAt = null;
    await db_update_user(user);
    const newToken = await jwt_sign({ userId: user.id, email: user.email }, null, 30 * 24 * 3600);
    return json_response({ token: newToken, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (e) {
    return json_response({ error: e.message || '重置失败' }, 500);
  }
}

// ============ 用户信息 ============
async function handle_profile(userId) {
  try {
    const user = await db_get_user_by_id(userId);
    if (!user) return json_response({ error: '用户不存在' }, 404);
    return json_response({ user: { id: user.id, email: user.email, nickname: user.nickname, visitCount: user.visitCount, lastVisitAt: user.lastVisitAt } });
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

// ============ Keys & Settings ============
async function handle_keys_get(userId) {
  try {
    const data = await db_get_user_keys(userId);
    return json_response(data);
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

async function handle_keys_put(req, userId) {
  try {
    const body = await req.json().catch(() => ({}));
    await db_put_user_keys(userId, body);
    return json_response({ ok: true });
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

async function handle_settings_get(userId) {
  try {
    const data = await db_get_user_settings(userId);
    return json_response(data);
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

async function handle_settings_put(req, userId) {
  try {
    const body = await req.json().catch(() => ({}));
    await db_put_user_settings(userId, body);
    return json_response({ ok: true });
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

// ============ 作品 ============
async function handle_works_list(userId) {
  try {
    const works = await db_list_works(userId);
    return json_response({ works });
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

async function handle_work_get(userId, workId) {
  try {
    const w = await db_get_work(userId, workId);
    if (!w) return json_response({ error: '作品不存在' }, 404);
    let payload = {};
    try { payload = typeof w.payload === 'string' ? JSON.parse(w.payload) : (w.payload || {}); } catch (e) { payload = {}; }
    return json_response({
      work: {
        id: w.workId, workId: w.workId, title: w.title,
        category: w.category || '', synopsis: w.synopsis || '',
        payload, version: w.version || 1,
        chapterCount: w.chapterCount || 0, totalWords: w.totalWords || 0,
        updatedAt: w.updatedAt
      }
    });
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

async function handle_work_upsert(req, userId, workId) {
  try {
    const body = await req.json().catch(() => ({}));
    body.workId = body.workId || workId;
    const result = await db_upsert_work(userId, body);
    return json_response(result, result.status === 'created' ? 201 : 200);
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

async function handle_batch(req, userId) {
  try {
    const body = await req.json().catch(() => ({}));
    const items = body.items || [];
    const results = [];
    for (const it of items) {
      if (!it.workId) continue;
      try {
        const r = await db_upsert_work(userId, it);
        results.push({ workId: it.workId, ...r });
      } catch (e) {
        results.push({ workId: it.workId, error: e.message });
      }
    }
    return json_response({ results });
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

async function handle_work_delete(userId, workId) {
  try {
    const store = globalThis.WXBJ_DATA || globalThis.WXBJ_USERS || globalThis.KV || globalThis.DATA || null;
    if (!store) return json_response({ error: '存储未配置' }, 500);
    const key = 'work:' + userId + ':' + workId;
    await store.delete(key);
    // 从列表移除
    let list = await store.get('works:' + userId, { type: 'json' }) || [];
    list = list.filter(id => id !== workId);
    await store.put('works:' + userId, JSON.stringify(list));
    return json_response({ ok: true });
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}
