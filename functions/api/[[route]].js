/**
 * Cloudflare Pages Functions - 核心 API 路由
 * 基于 backend/routes.js 的 Express 逻辑转换为 Pages Functions 语法
 * 使用 KV 存储：WXBJ_DATA
 */

import { hashPassword, verifyPassword, generateJWT, jsonResponse, getUserId, getKV, putKV, deleteKV, nextId } from './_shared.js';

// ========== 路由表：方法 + 路径模式 -> 处理函数 ==========
const routes = [
  // --- 认证 ---
  { method: 'POST', pattern: /^\/api\/auth\/register$/, handler: handleRegister },
  { method: 'POST', pattern: /^\/api\/auth\/login$/, handler: handleLogin },
  { method: 'POST', pattern: /^\/api\/auth\/logout$/, handler: handleLogout },
  // --- 作品 ---
  { method: 'GET', pattern: /^\/api\/works$/, handler: handleListWorks },
  { method: 'GET', pattern: /^\/api\/works\/([^\/]+)$/, handler: handleGetWork },
  { method: 'PUT', pattern: /^\/api\/works\/([^\/]+)$/, handler: handleUpdateWork },
  { method: 'POST', pattern: /^\/api\/works\/([^\/]+)$/, handler: handleUpdateWork },
  { method: 'POST', pattern: /^\/api\/works$/, handler: handleCreateWork },
  { method: 'DELETE', pattern: /^\/api\/works\/([^\/]+)$/, handler: handleDeleteWork },
  { method: 'POST', pattern: /^\/api\/works\/sync\/batch$/, handler: handleBatchSync },
  // --- 快照 ---
  { method: 'GET', pattern: /^\/api\/works\/([^\/]+)\/snapshots$/, handler: handleListSnapshots },
  { method: 'POST', pattern: /^\/api\/works\/([^\/]+)\/snapshots$/, handler: handleCreateSnapshot },
  { method: 'POST', pattern: /^\/api\/works\/([^\/]+)\/snapshots\/([^\/]+)\/restore$/, handler: handleRestoreSnapshot },
  { method: 'DELETE', pattern: /^\/api\/works\/([^\/]+)\/snapshots\/([^\/]+)$/, handler: handleDeleteSnapshot },
  // --- 用户 ---
  { method: 'GET', pattern: /^\/api\/user\/profile$/, handler: handleProfile },
  { method: 'POST', pattern: /^\/api\/user\/password$/, handler: handleChangePassword },
];

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // 匹配路由
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = path.match(route.pattern);
    if (match) {
      try {
        return await route.handler(request, env, match);
      } catch (err) {
        return jsonResponse({ error: err.message || '服务器内部错误' }, 500);
      }
    }
  }
  return jsonResponse({ error: '未找到接口: ' + method + ' ' + path }, 404);
}

// ========== 认证 ==========
async function handleRegister(request, env) {
  const body = await parseBody(request);
  const { email, password, displayName } = body;
  if (!email || !password) return jsonResponse({ error: '邮箱和密码不能为空' }, 400);

  const userId = String(Date.now());
  const hashed = await hashPassword(password);
  const user = {
    id: userId,
    email: email.trim().toLowerCase(),
    displayName: displayName || email.split('@')[0],
    passwordHash: hashed,
    createdAt: new Date().toISOString(),
  };
  await putKV(env, 'user_' + userId, JSON.stringify(user));
  await putKV(env, 'user_email_' + user.email, userId);

  const token = await generateJWT(userId, user.email, env.WXBJ_SECRET || 'wxbj_cloud_secret_2026');
  return jsonResponse({ token, user: { id: userId, email: user.email, displayName: user.displayName } }, 201);
}

async function handleLogin(request, env) {
  const body = await parseBody(request);
  const { email, password } = body;
  if (!email || !password) return jsonResponse({ error: '邮箱和密码不能为空' }, 400);

  const userId = await getKV(env, 'user_email_' + email.trim().toLowerCase());
  if (!userId) return jsonResponse({ error: '用户不存在' }, 404);

  const userStr = await getKV(env, 'user_' + userId);
  if (!userStr) return jsonResponse({ error: '用户数据损坏' }, 500);
  const user = JSON.parse(userStr);

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return jsonResponse({ error: '密码错误' }, 401);

  const token = await generateJWT(user.id, user.email, env.WXBJ_SECRET || 'wxbj_cloud_secret_2026');
  return jsonResponse({ token, user: { id: user.id, email: user.email, displayName: user.displayName } });
}

async function handleLogout() {
  return jsonResponse({ message: '已退出登录' });
}

// ========== 作品 ==========
async function handleListWorks(request, env, _match) {
  const userId = await getUserId(request);
  const worksStr = await getKV(env, 'works_' + userId) || '[]';
  const works = JSON.parse(worksStr);
  return jsonResponse({ works, total: works.length });
}

async function handleCreateWork(request, env, _match) {
  const userId = await getUserId(request);
  const body = await parseBody(request);
  const newId = await nextId(env, 'work');
  const work = {
    id: 'work_' + newId,
    userId,
    title: body.title || '未命名作品',
    content: body.content || '',
    category: body.category || '',
    tags: body.tags || [],
    metadata: body.metadata || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await putKV(env, 'work_' + userId + '_' + work.id, JSON.stringify(work));

  const worksKey = 'works_' + userId;
  const worksStr = await getKV(env, worksKey) || '[]';
  const works = JSON.parse(worksStr);
  works.unshift({ id: work.id, title: work.title, updatedAt: work.updatedAt });
  await putKV(env, worksKey, JSON.stringify(works));

  return jsonResponse(work, 201);
}

async function handleGetWork(request, env, match) {
  const userId = await getUserId(request);
  const workId = match[1];
  const data = await getKV(env, 'work_' + userId + '_' + workId);
  if (!data) return jsonResponse({ error: '作品不存在' }, 404);
  return jsonResponse(JSON.parse(data));
}

async function handleUpdateWork(request, env, match) {
  const userId = await getUserId(request);
  const workId = match[1];
  const body = await parseBody(request);

  const existing = await getKV(env, 'work_' + userId + '_' + workId);
  if (!existing) return jsonResponse({ error: '作品不存在' }, 404);

  const work = JSON.parse(existing);
  work.title = body.title || work.title;
  work.content = body.content !== undefined ? body.content : work.content;
  work.category = body.category || work.category;
  work.tags = body.tags || work.tags;
  work.metadata = { ...(work.metadata || {}), ...(body.metadata || {}) };
  work.updatedAt = new Date().toISOString();

  await putKV(env, 'work_' + userId + '_' + workId, JSON.stringify(work));

  // 更新列表缓存
  const worksKey = 'works_' + userId;
  const worksStr = await getKV(env, worksKey) || '[]';
  const works = JSON.parse(worksStr).map(w => w.id === workId
    ? { id: work.id, title: work.title, updatedAt: work.updatedAt } : w);
  await putKV(env, worksKey, JSON.stringify(works));

  return jsonResponse(work);
}

async function handleDeleteWork(request, env, match) {
  const userId = await getUserId(request);
  const workId = match[1];
  await deleteKV(env, 'work_' + userId + '_' + workId);

  const worksKey = 'works_' + userId;
  const worksStr = await getKV(env, worksKey) || '[]';
  const works = JSON.parse(worksStr).filter(w => w.id !== workId);
  await putKV(env, worksKey, JSON.stringify(works));

  return jsonResponse({ message: '已删除', workId });
}

async function handleBatchSync(request, env) {
  const userId = await getUserId(request);
  const body = await parseBody(request);
  const { upserts = [], deletions = [] } = body;
  const results = { created: [], updated: [], deleted: [] };

  for (const work of upserts) {
    const key = 'work_' + userId + '_' + work.id;
    const existing = await getKV(env, key);
    if (existing) {
      const merged = { ...JSON.parse(existing), ...work, updatedAt: new Date().toISOString() };
      await putKV(env, key, JSON.stringify(merged));
      results.updated.push(work.id);
    } else {
      const newWork = {
        id: work.id || ('work_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
        userId,
        title: work.title || '未命名',
        content: work.content || '',
        category: work.category || '',
        tags: work.tags || [],
        metadata: work.metadata || {},
        createdAt: work.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await putKV(env, 'work_' + userId + '_' + newWork.id, JSON.stringify(newWork));
      results.created.push(newWork.id);
    }
  }

  for (const id of deletions) {
    await deleteKV(env, 'work_' + userId + '_' + id);
    results.deleted.push(id);
  }

  // 重建列表
  const works = [];
  const prefix = 'work_' + userId + '_';
  for (const id of [...results.created, ...results.updated,
                    ...(JSON.parse(await getKV(env, 'works_' + userId) || '[]').map(w => w.id))]) {
    const data = await getKV(env, 'work_' + userId + '_' + id);
    if (data) {
      const w = JSON.parse(data);
      works.push({ id: w.id, title: w.title, updatedAt: w.updatedAt });
    }
  }
  const unique = works.filter((w, i, arr) => arr.findIndex(x => x.id === w.id) === i);
  const filtered = unique.filter(w => !deletions.includes(w.id));
  await putKV(env, 'works_' + userId, JSON.stringify(filtered));

  return jsonResponse(results);
}

// ========== 快照 ==========
async function handleListSnapshots(request, env, match) {
  const userId = await getUserId(request);
  const workId = match[1];
  const data = await getKV(env, 'snapshots_' + userId + '_' + workId) || '[]';
  return jsonResponse({ snapshots: JSON.parse(data), total: JSON.parse(data).length });
}

async function handleCreateSnapshot(request, env, match) {
  const userId = await getUserId(request);
  const workId = match[1];
  const body = await parseBody(request);

  const workStr = await getKV(env, 'work_' + userId + '_' + workId);
  if (!workStr) return jsonResponse({ error: '作品不存在' }, 404);
  const work = JSON.parse(workStr);

  const snapId = 'snap_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  const snapshot = {
    id: snapId,
    workId,
    userId,
    title: body.title || ('快照 ' + new Date().toLocaleString('zh-CN')),
    content: work.content,
    metadata: body.metadata || {},
    createdAt: new Date().toISOString(),
  };

  await putKV(env, 'snapshot_' + userId + '_' + workId + '_' + snapId, JSON.stringify(snapshot));

  const snapsKey = 'snapshots_' + userId + '_' + workId;
  const snapsStr = await getKV(env, snapsKey) || '[]';
  const snaps = JSON.parse(snapsStr);
  snaps.unshift({ id: snapId, title: snapshot.title, createdAt: snapshot.createdAt });
  await putKV(env, snapsKey, JSON.stringify(snaps.slice(0, 20)));

  return jsonResponse(snapshot, 201);
}

async function handleRestoreSnapshot(request, env, match) {
  const userId = await getUserId(request);
  const workId = match[1];
  const snapId = match[2];

  const snapStr = await getKV(env, 'snapshot_' + userId + '_' + workId + '_' + snapId);
  if (!snapStr) return jsonResponse({ error: '快照不存在' }, 404);
  const snapshot = JSON.parse(snapStr);

  const workStr = await getKV(env, 'work_' + userId + '_' + workId);
  if (!workStr) return jsonResponse({ error: '作品不存在' }, 404);
  const work = JSON.parse(workStr);

  // 自动创建恢复前快照
  const autoSnap = {
    id: 'auto_before_restore_' + Date.now(),
    workId,
    userId,
    title: '恢复前自动备份',
    content: work.content,
    createdAt: new Date().toISOString(),
  };
  await putKV(env, 'snapshot_' + userId + '_' + workId + '_' + autoSnap.id, JSON.stringify(autoSnap));

  work.content = snapshot.content;
  work.updatedAt = new Date().toISOString();
  await putKV(env, 'work_' + userId + '_' + workId, JSON.stringify(work));

  const snapsKey = 'snapshots_' + userId + '_' + workId;
  const snapsStr = await getKV(env, snapsKey) || '[]';
  const snaps = JSON.parse(snapsStr);
  snaps.unshift({ id: autoSnap.id, title: autoSnap.title, createdAt: autoSnap.createdAt });
  await putKV(env, snapsKey, JSON.stringify(snaps.slice(0, 20)));

  return jsonResponse({ message: '已恢复', restoredWork: work, sourceSnapshot: snapId });
}

async function handleDeleteSnapshot(request, env, match) {
  const userId = await getUserId(request);
  const workId = match[1];
  const snapId = match[2];
  await deleteKV(env, 'snapshot_' + userId + '_' + workId + '_' + snapId);

  const snapsKey = 'snapshots_' + userId + '_' + workId;
  const snapsStr = await getKV(env, snapsKey) || '[]';
  const snaps = JSON.parse(snapsStr).filter(s => s.id !== snapId);
  await putKV(env, snapsKey, JSON.stringify(snaps));

  return jsonResponse({ message: '已删除', snapshotId: snapId });
}

// ========== 用户 ==========
async function handleProfile(request, env) {
  const userId = await getUserId(request);
  const userStr = await getKV(env, 'user_' + userId);
  if (!userStr) return jsonResponse({ error: '用户不存在' }, 404);
  const user = JSON.parse(userStr);
  return jsonResponse({ id: user.id, email: user.email, displayName: user.displayName, createdAt: user.createdAt });
}

async function handleChangePassword(request, env) {
  const userId = await getUserId(request);
  const body = await parseBody(request);
  const { oldPassword, newPassword } = body;
  if (!oldPassword || !newPassword) return jsonResponse({ error: '旧密码和新密码不能为空' }, 400);

  const userStr = await getKV(env, 'user_' + userId);
  if (!userStr) return jsonResponse({ error: '用户不存在' }, 404);
  const user = JSON.parse(userStr);

  const valid = await verifyPassword(oldPassword, user.passwordHash);
  if (!valid) return jsonResponse({ error: '旧密码错误' }, 401);

  user.passwordHash = await hashPassword(newPassword);
  user.updatedAt = new Date().toISOString();
  await putKV(env, 'user_' + userId, JSON.stringify(user));

  return jsonResponse({ message: '密码已更新' });
}

// ========== 辅助 ==========
async function parseBody(request) {
  try {
    const text = await request.text();
    return text ? JSON.parse(text) : {};
  } catch (e) {
    return {};
  }
}
