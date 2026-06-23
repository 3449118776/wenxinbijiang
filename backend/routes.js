/**
 * 文心笔匠 后端 —— RESTful 路由
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Work, WorkSnapshot, SyncLog } = require('./models');
const { generateToken, authMiddleware } = require('./auth');

const router = express.Router();

// ============================================================
// 认证
// ============================================================

router.post('/auth/register', async (req, res) => {
  try {
    var _a = req.body, email = _a.email, password = _a.password, nickname = _a.nickname;
    if (!email || !password) return res.status(400).json({ error: '邮箱和密码不能为空' });
    if (password.length < 6) return res.status(400).json({ error: '密码至少6位' });
    var exists = await User.findOne({ where: { email: email } });
    if (exists) return res.status(409).json({ error: '该邮箱已注册' });
    var hash = await bcrypt.hash(password, 10);
    var user = await User.create({ email: email, passwordHash: hash, nickname: nickname || '' });
    var token = generateToken(user.id, user.email);
    res.json({ token: token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (e) {
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    var _a = req.body, email = _a.email, password = _a.password;
    if (!email || !password) return res.status(400).json({ error: '邮箱和密码不能为空' });
    var user = await User.findOne({ where: { email: email } });
    if (!user) return res.status(401).json({ error: '邮箱或密码不正确' });
    var ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: '邮箱或密码不正确' });
    user.visitCount = (user.visitCount || 0) + 1;
    user.lastVisitAt = new Date();
    await user.save();
    var token = generateToken(user.id, user.email);
    res.json({ token: token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (e) {
    console.error('login error:', e.message);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// ============================================================
// 作品列表（轻量，不含payload）
// ============================================================

router.get('/works', authMiddleware, async (req, res) => {
  try {
    var works = await Work.findAll({
      where: { userId: req.userId },
      attributes: ['workId', 'title', 'category', 'synopsis', 'version', 'chapterCount', 'totalWords', 'updatedAt'],
      order: [['updatedAt', 'DESC']]
    });
    res.json({ works: works });
  } catch (e) {
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

// ============================================================
// 单作品完整数据
// ============================================================

router.get('/works/:workId', authMiddleware, async (req, res) => {
  try {
    var work = await Work.findOne({
      where: { userId: req.userId, workId: req.params.workId }
    });
    if (!work) return res.status(404).json({ error: '作品不存在' });
    var p = {};
    try { p = JSON.parse(work.payload || '{}'); } catch (_) { p = {}; }
    res.json({
      work: {
        id: work.id, workId: work.workId, title: work.title,
        category: work.category, synopsis: work.synopsis,
        payload: p, version: work.version,
        chapterCount: work.chapterCount, totalWords: work.totalWords,
        updatedAt: work.updatedAt
      }
    });
  } catch (e) {
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

// ============================================================
// 核心同步：上传 / 保存作品
// ============================================================

router.put('/works/:workId', authMiddleware, async (req, res) => {
  try {
    var body = req.body || {};
    var payloadStr = JSON.stringify(body.payload || {});
    var rec = await Work.findOne({
      where: { userId: req.userId, workId: req.params.workId }
    });

    if (!rec) {
      rec = await Work.create({
        userId: req.userId,
        workId: body.workId || req.params.workId,
        title: body.title || '',
        category: body.category || '',
        synopsis: body.synopsis || '',
        payload: payloadStr,
        version: 1,
        chapterCount: body.chapterCount || 0,
        totalWords: body.totalWords || 0
      });
      await SyncLog.create({
        userId: req.userId, workId: rec.workId, action: 'create',
        device: (body.device || '').slice(0, 100), ip: req.ip
      });
      return res.status(201).json({ status: 'created', version: 1 });
    }

    // 版本比较：客户端版本 ≤ 服务端版本则跳过
    var clientVersion = parseInt(body.version) || 0;
    if (clientVersion <= rec.version && rec.version > 0) {
      return res.json({ status: 'unchanged', version: rec.version });
    }

    // 限制客户端版本号，防止版本号跳跃攻击
    if (clientVersion > rec.version + 100) {
      clientVersion = rec.version + 1;
    }

    // 保存快照（内容去重）
    var hash = crypto.createHash('sha256').update(payloadStr).digest('hex');
    var lastSnap = await WorkSnapshot.findOne({
      where: { workId: rec.id },
      order: [['version', 'DESC']]
    });
    if (!lastSnap || lastSnap.payloadHash !== hash) {
      await WorkSnapshot.create({
        workId: rec.id, payload: payloadStr, payloadHash: hash,
        version: rec.version, size: Buffer.byteLength(payloadStr, 'utf8')
      });
    }

    // 更新作品
    rec.title = body.title || rec.title;
    rec.category = body.category || rec.category;
    rec.synopsis = body.synopsis || rec.synopsis;
    rec.payload = payloadStr;
    rec.version = rec.version + 1;
    rec.chapterCount = body.chapterCount || rec.chapterCount || 0;
    rec.totalWords = body.totalWords || rec.totalWords || 0;
    await rec.save();

    await SyncLog.create({
      userId: req.userId, workId: rec.workId, action: 'sync',
      device: (body.device || '').slice(0, 100), ip: req.ip
    });

    // 清理旧快照：每作品最多保留20条
    var snaps = await WorkSnapshot.findAll({
      where: { workId: rec.id }, order: [['version', 'DESC']]
    });
    if (snaps.length > 20) {
      var toRemove = snaps.slice(20).map(function(s) { return s.id; });
      await WorkSnapshot.destroy({ where: { id: toRemove } });
    }

    res.json({ status: 'updated', version: rec.version });
  } catch (e) {
    console.error('sync error:', e.message);
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

// ============================================================
// 批量同步（多作品一次性提交）
// ============================================================

router.post('/works/sync/batch', authMiddleware, async (req, res) => {
  try {
    var items = req.body.items || [];
    var results = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it.workId) continue;
      var payloadStr = JSON.stringify(it.payload || {});
      var rec = await Work.findOne({
        where: { userId: req.userId, workId: it.workId }
      });
      if (rec) {
        var clientVersion = parseInt(it.version) || 0;
        if (clientVersion <= rec.version && rec.version > 0) {
          results.push({ workId: it.workId, status: 'unchanged', version: rec.version });
          continue;
        }
        var hash = crypto.createHash('sha256').update(payloadStr).digest('hex');
        var lastSnap = await WorkSnapshot.findOne({
          where: { workId: rec.id },
          order: [['version', 'DESC']]
        });
        if (!lastSnap || lastSnap.payloadHash !== hash) {
          await WorkSnapshot.create({
            workId: rec.id, payload: payloadStr, payloadHash: hash,
            version: rec.version, size: Buffer.byteLength(payloadStr, 'utf8')
          });
        }
        rec.title = it.title || rec.title;
        rec.category = it.category || rec.category;
        rec.payload = payloadStr;
        rec.version = rec.version + 1;
        rec.chapterCount = it.chapterCount || rec.chapterCount || 0;
        rec.totalWords = it.totalWords || rec.totalWords || 0;
        await rec.save();
        results.push({ workId: it.workId, status: 'updated', version: rec.version });
      } else {
        rec = await Work.create({
          userId: req.userId, workId: it.workId,
          title: it.title || '', category: it.category || '',
          payload: payloadStr, version: 1,
          chapterCount: it.chapterCount || 0, totalWords: it.totalWords || 0
        });
        results.push({ workId: it.workId, status: 'created', version: 1 });
      }
    }
    await SyncLog.create({
      userId: req.userId, workId: 'batch',
      action: 'batch_sync', device: (req.body.device || '').slice(0, 100), ip: req.ip
    });
    res.json({ results: results });
  } catch (e) {
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

// ============================================================
// 删除作品
// ============================================================

router.delete('/works/:workId', authMiddleware, async (req, res) => {
  try {
    var rec = await Work.findOne({
      where: { userId: req.userId, workId: req.params.workId }
    });
    if (!rec) return res.status(404).json({ error: '作品不存在' });
    await WorkSnapshot.destroy({ where: { workId: rec.id } });
    await rec.destroy();
    await SyncLog.create({
      userId: req.userId, workId: req.params.workId,
      action: 'delete', device: (req.body.device || '').slice(0, 100), ip: req.ip
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('delete error:', e.message);
    res.status(500).json({ error: '删除失败，请稍后重试' });
  }
});

// ============================================================
// 快照管理（云端备份）
// ============================================================

router.get('/works/:workId/snapshots', authMiddleware, async (req, res) => {
  try {
    var rec = await Work.findOne({
      where: { userId: req.userId, workId: req.params.workId }
    });
    if (!rec) return res.status(404).json({ error: '作品不存在' });
    var snaps = await WorkSnapshot.findAll({
      where: { workId: rec.id },
      attributes: ['id', 'version', 'size', 'payloadHash', 'createdAt'],
      order: [['version', 'DESC']],
      limit: 20
    });
    res.json({ snapshots: snaps });
  } catch (e) {
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

router.post('/works/:workId/snapshots/:snapId/restore', authMiddleware, async (req, res) => {
  try {
    var rec = await Work.findOne({
      where: { userId: req.userId, workId: req.params.workId }
    });
    if (!rec) return res.status(404).json({ error: '作品不存在' });
    var snap = await WorkSnapshot.findOne({
      where: { id: req.params.snapId, workId: rec.id }
    });
    if (!snap) return res.status(404).json({ error: '快照不存在' });
    rec.payload = snap.payload;
    rec.version = rec.version + 1;
    await rec.save();
    await SyncLog.create({
      userId: req.userId, workId: rec.workId,
      action: 'restore_v' + snap.version, device: '', ip: req.ip
    });
    var p = {};
    try { p = JSON.parse(rec.payload || '{}'); } catch (_) { p = {}; }
    res.json({ restoredFromVersion: snap.version, work: {
      id: rec.id, workId: rec.workId, title: rec.title,
      payload: p, version: rec.version, updatedAt: rec.updatedAt
    }});
  } catch (e) {
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

// ============================================================
// 用户信息
// ============================================================

router.get('/user/profile', authMiddleware, async (req, res) => {
  try {
    var user = await User.findByPk(req.userId, {
      attributes: ['id', 'email', 'nickname', 'avatar', 'createdAt']
    });
    res.json({ user: user });
  } catch (e) {
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

module.exports = router;