/**
 * Pages Functions 全功能测试脚本
 * - 模拟 Cloudflare KV binding (内存版)
 * - 模拟 Web Crypto API
 * - 模拟 context.env
 * - 直接调用 _shared.js 中的导出函数
 */

// ============== 1. 模拟 Cloudflare 环境 ==============

// 模拟 Web Crypto API
const { webcrypto } = require('crypto');
globalThis.crypto = webcrypto;

// 模拟 Cloudflare TextEncoder/TextDecoder
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = require('util').TextEncoder;
  globalThis.TextDecoder = require('util').TextDecoder;
}

// 内存版 KV store
class MemoryKV {
  constructor() {
    this.data = new Map();
  }
  async get(key, opts) {
    const v = this.data.get(key);
    if (v === undefined) return null;
    if (opts && opts.type === 'json') {
      try { return JSON.parse(v); } catch (e) { return null; }
    }
    return v;
  }
  async put(key, value) {
    this.data.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  }
  async delete(key) {
    this.data.delete(key);
  }
  async list() {
    const out = {};
    for (const [k, v] of this.data) out[k] = v;
    return out;
  }
}

const kv = new MemoryKV();
globalThis.WXBJ_DATA = kv;
globalThis.__JWT_SECRET = 'test_secret_key_2026';

// ============== 2. 动态 import 修复后的 _shared.js ==============
// 由于 _shared.js 使用 ESM 语法 (export)，我们用动态 import
let db_create_user, db_get_user_by_email, db_get_user_by_id, db_update_user,
    db_list_works, db_get_work, db_upsert_work, db_list_snapshots, db_restore_snapshot,
    jwt_sign, jwt_verify, hash_password, verify_password;

(async () => {
  const url = require('url');
  const shared = await import(url.pathToFileURL(__dirname + '/functions/api/_shared.js').href);
  db_create_user = shared.db_create_user;
  db_get_user_by_email = shared.db_get_user_by_email;
  db_get_user_by_id = shared.db_get_user_by_id;
  db_update_user = shared.db_update_user;
  db_list_works = shared.db_list_works;
  db_get_work = shared.db_get_work;
  db_upsert_work = shared.db_upsert_work;
  db_list_snapshots = shared.db_list_snapshots;
  db_restore_snapshot = shared.db_restore_snapshot;
  jwt_sign = shared.jwt_sign;
  jwt_verify = shared.jwt_verify;
  hash_password = shared.hash_password;
  verify_password = shared.verify_password;

  // ============== 3. 测试框架 ==============
  const results = [];
  async function test(name, fn) {
    try {
      await fn();
      results.push({ name, status: '✅ PASS' });
      console.log(`✅ PASS: ${name}`);
    } catch (e) {
      results.push({ name, status: '❌ FAIL', error: e.message });
      console.log(`❌ FAIL: ${name}\n   ${e.message}`);
    }
  }
  function assert(cond, msg) {
    if (!cond) throw new Error(msg || 'assertion failed');
  }
  function assertEq(a, b, msg) {
    if (a !== b) throw new Error(msg || `expected ${b}, got ${a}`);
  }

  // ============== 4. 全部测试用例 ==============
  console.log('\n========== 开始全部功能测试 ==========\n');

  // ====== 认证模块 ======
  await test('AUTH-1: 用户注册', async () => {
    const user = await db_create_user('alice@example.com', 'password123', 'Alice');
    assert(user.id > 0, '用户ID应大于0');
    assertEq(user.email, 'alice@example.com');
    assertEq(user.nickname, 'Alice');
  });

  await test('AUTH-2: 重复邮箱注册失败', async () => {
    let err = null;
    try { await db_create_user('alice@example.com', 'password123'); } catch (e) { err = e; }
    assert(err, '应抛出错误');
  });

  await test('AUTH-3: 密码哈希与验证', async () => {
    const hash = await hash_password('mypassword');
    assert(hash.startsWith('pbkdf2_'), '应使用 pbkdf2 格式');
    const ok1 = await verify_password('mypassword', hash);
    const ok2 = await verify_password('wrongpass', hash);
    assert(ok1, '正确密码应通过');
    assert(!ok2, '错误密码应失败');
  });

  await test('AUTH-4: JWT 签发与验证', async () => {
    const token = await jwt_sign({ userId: 1, email: 'a@b.com' }, null, 3600);
    const decoded = await jwt_verify(token);
    assert(decoded, 'token 应可验证');
    assertEq(decoded.userId, 1);
    assertEq(decoded.email, 'a@b.com');
  });

  await test('AUTH-5: 无效 token 验证失败', async () => {
    const r = await jwt_verify('invalid.token.here');
    assert(r === null, '无效 token 应返回 null');
  });

  // ====== 作品模块 ======
  let workId1, workId2, token1;

  await test('WORK-1: 上传第一个作品（创建）', async () => {
    workId1 = 'work-uuid-001';
    const result = await db_upsert_work(1, {
      workId: workId1,
      title: '《测试小说》',
      category: '玄幻',
      synopsis: '测试简介',
      payload: { chapters: [{ title: '第一章', content: '内容' }] },
      chapterCount: 1,
      totalWords: 100
    });
    assertEq(result.status, 'created');
    assertEq(result.version, 1);
  });

  await test('WORK-2: 重复上传相同 workId 创建新版本', async () => {
    const result = await db_upsert_work(1, {
      workId: workId1,
      title: '《测试小说》',
      category: '玄幻',
      payload: { chapters: [{ title: '第一章', content: '更新后的内容' }] },
      chapterCount: 1,
      totalWords: 200,
      version: 2  // 客户端应有新版本号 2
    });
    assertEq(result.status, 'updated');
    assertEq(result.version, 2);
  });

  await test('WORK-3: 版本号 ≤ 服务端 → unchanged', async () => {
    const result = await db_upsert_work(1, {
      workId: workId1,
      title: '标题',
      payload: { x: 1 },
      version: 1  // 旧版本号
    });
    assertEq(result.status, 'unchanged');
  });

  await test('WORK-4: 拉取作品列表', async () => {
    const works = await db_list_works(1);
    assert(works.length >= 1, '至少有1个作品');
    const w = works.find(x => x.workId === workId1);
    assert(w, '应能找到 workId1');
    assertEq(w.title, '《测试小说》');
  });

  await test('WORK-5: 拉取单作品完整数据', async () => {
    const w = await db_get_work(1, workId1);
    assert(w, '作品应存在');
    assertEq(w.version, 2);
    let p = typeof w.payload === 'string' ? JSON.parse(w.payload) : w.payload;
    assertEq(p.chapters[0].content, '更新后的内容');
  });

  // ====== 快照模块（修复后新增） ======
  await test('SNAP-1: 列出作品快照（更新后应有快照）', async () => {
    const snaps = await db_list_snapshots(1, workId1);
    assert(snaps.length >= 1, '至少应有1个快照');
    const s = snaps[0];
    assert(s.id, '快照应有 id');
    assert(s.version, '快照应有 version');
    assert(s.payloadHash, '快照应有 payloadHash');
    assert(s.createdAt, '快照应有 createdAt');
    assert(typeof s.size === 'number', '快照应有 size');
  });

  await test('SNAP-2: SHA256 内容去重（相同 payload 不增加快照）', async () => {
    // 模拟：先用一个 payloadA 创建 v=2 快照，然后再次上传相同 payloadA
    // 客户端版本号会因其他原因递增
    const before = (await db_list_snapshots(1, workId1)).length;
    const curVer = (await db_get_work(1, workId1)).version;
    const r = await db_upsert_work(1, {
      workId: workId1, title: 't',
      payload: { chapters: [{ title: '第一章', content: '更新后的内容' }] },
      version: curVer + 1
    });
    assertEq(r.status, 'updated');
    const after = (await db_list_snapshots(1, workId1)).length;
    // 数量应不变（去重，因为内容哈希相同）
    assertEq(after, before, '快照数量应不变（SHA256 去重）');
    const w = await db_get_work(1, workId1);
    assertEq(w.version, curVer + 1, '作品 version 应递增');
  });

  await test('SNAP-3: 不同内容创建新快照', async () => {
    const before = (await db_list_snapshots(1, workId1)).length;
    const curVer = (await db_get_work(1, workId1)).version;
    await db_upsert_work(1, {
      workId: workId1, title: 't', payload: { chapters: [{ title: '第二章', content: '全新内容' }] },
      version: curVer + 1
    });
    const after = (await db_list_snapshots(1, workId1)).length;
    assert(after > before, '快照数量应增加');
  });

  await test('SNAP-4: 最多保留 20 个快照', async () => {
    // 创建 workId2，循环上传 25 次
    workId2 = 'work-stress-002';
    for (let i = 0; i < 25; i++) {
      await db_upsert_work(1, {
        workId: workId2,
        title: '压力测试',
        payload: { content: 'v' + i },
        version: i + 1
      });
    }
    const snaps = await db_list_snapshots(1, workId2);
    assert(snaps.length <= 20, '快照数量应 ≤ 20，实际: ' + snaps.length);
    assertEq(snaps.length, 20, '快照数量应恰好 20');
  });

  await test('SNAP-5: 恢复到指定版本', async () => {
    const snaps = await db_list_snapshots(1, workId1);
    assert(snaps.length >= 1);
    // 选择中间一个快照恢复
    const target = snaps[Math.floor(snaps.length / 2)];
    const result = await db_restore_snapshot(1, workId1, target.id);
    assertEq(result.restoredFromVersion, target.version);
    assert(result.work, '应返回恢复后的作品');
    // 恢复后版本应递增
    assert(result.work.version > 0, '恢复后版本应大于0');
  });

  await test('SNAP-6: 恢复不存在的快照 → 抛错', async () => {
    let err = null;
    try { await db_restore_snapshot(1, workId1, 'nonexistent_snap_id'); } catch (e) { err = e; }
    assert(err, '应抛出错误');
  });

  await test('SNAP-7: 快照列表按时间倒序', async () => {
    const snaps = await db_list_snapshots(1, workId1);
    for (let i = 1; i < snaps.length; i++) {
      assert(new Date(snaps[i - 1].createdAt) >= new Date(snaps[i].createdAt),
        '快照应按时间倒序');
    }
  });

  // ====== 边界测试 ======
  await test('EDGE-1: 跨用户隔离 - 用户2看不到用户1的作品', async () => {
    const user2 = await db_create_user('bob@example.com', 'pass1234');
    const works = await db_list_works(user2.id);
    assert(works.length === 0, '用户2不应有作品');
  });

  await test('EDGE-2: 跨用户拉取作品 → null', async () => {
    const w = await db_get_work(2, workId1);
    assert(w === null, '用户2应无法获取用户1的作品');
  });

  await test('EDGE-3: 跨用户快照列表 → []', async () => {
    const snaps = await db_list_snapshots(2, workId1);
    assertEq(snaps.length, 0);
  });

  await test('EDGE-4: 缺少 workId 上传 → 抛错', async () => {
    let err = null;
    try { await db_upsert_work(1, { title: 'x', payload: {} }); } catch (e) { err = e; }
    assert(err, '应抛错');
  });

  await test('EDGE-5: 上传空 payload 也应成功', async () => {
    const r = await db_upsert_work(1, {
      workId: 'empty-payload-test', title: '空', payload: {}, version: 1
    });
    assertEq(r.status, 'created');
  });

  // ============== 5. 输出测试结果 ==============
  const passed = results.filter(r => r.status.includes('PASS')).length;
  const failed = results.filter(r => r.status.includes('FAIL')).length;
  console.log('\n========== 测试结果 ==========');
  console.log(`总计: ${results.length} | 通过: ${passed} | 失败: ${failed}`);
  if (failed > 0) {
    console.log('\n失败用例:');
    results.filter(r => r.status.includes('FAIL')).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 全部测试通过！');
  }
})().catch(e => {
  console.error('测试启动失败:', e);
  process.exit(1);
});
