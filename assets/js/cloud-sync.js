/**
 * 文心笔匠 云端同步模块 (v47)
 * 
 * 功能：
 * - 注册 / 登录 / 登出
 * - 手动同步：拉取云端作品 / 推送本地作品
 * - 自动同步：定时(1分钟) + 章节保存后触发
 * - 同步 keys/settings + works
 * - 冲突处理：版本号比较，不覆盖
 * 
 * 使用方式：
 *   window.cloud = new CloudSync({ apiBase: 'https://your-domain.com/api' });
 *   所有页面共用同一个实例，挂载在 window.cloud 上。
 */

(function() {

function CloudSync(opts) {
  opts = opts || {};
  this.apiBase = (opts.apiBase || '').replace(/\/$/, '');
  this.token = null;
  this.user = null;
  this.autoSync = !!opts.autoSync;
  // 检测环境：本地开发/移动App用较短间隔，浏览器线上用5分钟
  // （免费KV每天1000次写入，1分钟间隔光keys/settings就消耗2880次/天，必须降低频率）
  var _hostname = '';
  try { _hostname = (location.hostname || ''); } catch(e) { console.warn("[cloud-sync.js]", e); }
  var _isLocalDev = _hostname === 'localhost' || _hostname === '127.0.0.1';
  var _protocol = '';
  try { _protocol = location.protocol || ''; } catch(e) { console.warn("[cloud-sync.js]", e); }
  var _isMobileApp = (_protocol === 'capacitor:' || _protocol === 'ionic:' || _protocol === 'file:');
  var _activeInterval = _isLocalDev ? 30000 : (_isMobileApp ? 120000 : 300000); // 30s/2min/5min
  this.autoInterval = opts.autoInterval || _activeInterval;
  this._timer = null;
  this._syncTimer = null;
  this._callbacks = []; // onSync 回调列表
  this._syncing = false;
  this._pushTimer = null;
  this._kvQuotaExceeded = null;
  this._lastKeysHash = '';
  this._lastSettingsHash = '';
  this._loadToken();
  // 启动自动同步（如果配置了）
  if (this.autoSync) {
    this.startAutoSync();
  }
}

CloudSync.prototype = {

  // ==================== 状态 ====================

  isLoggedIn: function() {
    return !!(this.token && this.user);
  },

  // ========== 事件回调：同步完成后通知页面刷新UI ==========
  onSync: function(cb) {
    if (typeof cb === 'function') this._callbacks.push(cb);
  },
  _fireSync: function(report) {
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        try {
          var evt;
          try {
            evt = new CustomEvent('cloud-sync-complete', { detail: report || {} });
          } catch (e) {
              // IE / old browsers fallback
              evt = document.createEvent('CustomEvent');
              evt.initCustomEvent('cloud-sync-complete', true, true, report || {});
            }
            window.dispatchEvent(evt);
          } catch (evterr) {}
      }
    } catch (outerErr) {}
    try {
      for (var i = 0; i < this._callbacks.length; i++) {
        try { this._callbacks[i](report); } catch (cbErr) {}
      }
    } catch (e) {}
  },

  // ==================== 认证 ====================

  _loadToken: function() {
    try { this.token = localStorage.getItem('wxbj_cloud_token') || ''; } catch(e) { this.token = ''; }
    try { this.user = JSON.parse(localStorage.getItem('wxbj_cloud_user') || 'null'); } catch(e) { this.user = null; }
    // 恢复登录状态后，等待DB初始化完成，然后触发同步
    if (this.isLoggedIn()) {
      var self = this;
      var trySync = function() {
        if (window.DB && window.DB._initialized) {
          setTimeout(function() { self.smartSync().catch(function(){}); }, 300);
        } else {
          setTimeout(trySync, 200);
        }
      };
      setTimeout(trySync, 200);
    }
  },

  _saveToken: function(token, user) {
    this.token = token;
    this.user = user;
    try { localStorage.setItem('wxbj_cloud_token', token); } catch(e) { console.warn("[cloud-sync.js]", e); }
    try { localStorage.setItem('wxbj_cloud_user', JSON.stringify(user)); } catch(e) { console.warn("[cloud-sync.js]", e); }
  },

  _clearToken: function() {
    this.token = null;
    this.user = null;
    try { localStorage.removeItem('wxbj_cloud_token'); } catch(e) { console.warn("[cloud-sync.js]", e); }
    try { localStorage.removeItem('wxbj_cloud_user'); } catch(e) { console.warn("[cloud-sync.js]", e); }
  },

  register: async function(email, password, nickname) {
    var resp = await this._fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password, nickname: nickname || '' })
    });
    if (resp.error) throw new Error(resp.error);
    this._saveToken(resp.token, resp.user);
    this._fireSync({ action: 'register', ok: true });
    var selfr = this;
    setTimeout(function() { selfr.smartSync().catch(function(){}); }, 500);
    return resp;
  },

  login: async function(email, password) {
    var resp = await this._fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password })
    });
    if (resp.error) throw new Error(resp.error);
    this._saveToken(resp.token, resp.user);
    this._fireSync({ action: 'login', ok: true });
    // 登录成功后立即同步一次，确保能看到云端作品
    var self2 = this;
    setTimeout(function() { self2.smartSync().catch(function(){}); }, 500);
    return resp;
  },

  logout: function() {
    this._clearToken();
    this._fireSync({ action: 'logout', ok: true });
  },

  // ==================== Keys & Settings 同步 ====================

  /**
   * 拉取云端 keys
   */
  getKeys: async function() {
    return this._fetch('/user/keys');
  },

  /**
   * 推送 keys 到云端
   */
  putKeys: async function(data) {
    return this._fetch('/user/keys', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * 拉取云端 settings
   */
  getSettings: async function() {
    return this._fetch('/user/settings');
  },

  /**
   * 推送 settings 到云端
   */
  putSettings: async function(data) {
    return this._fetch('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * 同步 keys 和 settings（双向合并）
   * - keys：本地有则推云端，云端有则拉回
   * - settings：本地有则推，云端有的字段若本地为空也拉回
   */
  syncKeysAndSettings: async function() {
    if (!this.isLoggedIn()) return { ok: false, error: '未登录' };
    try {
      var self = this;
      var result = { keys: 0, settings: 0, errors: 0 };

      // 同步 keys（仅变更时写入，避免浪费KV配额）
      try {
        var cloudKeys = await this.getKeys();
        var cloudApiKeys = (cloudKeys && cloudKeys.apiKeys) || {};
        var localApiKeys = (DB && DB.apiKeys) || {};

        // 云端有的 key 追加到本地（避免覆盖）
        var changed = false;
        for (var p in cloudApiKeys) {
          if (!localApiKeys[p]) {
            localApiKeys[p] = cloudApiKeys[p];
            changed = true;
          } else {
            for (var ki = 0; ki < cloudApiKeys[p].length; ki++) {
              if (localApiKeys[p].indexOf(cloudApiKeys[p][ki]) < 0) {
                localApiKeys[p].push(cloudApiKeys[p][ki]);
                changed = true;
              }
            }
          }
        }
        if (DB) DB.apiKeys = localApiKeys;

        // 仅当本地keys与上次推送不同时才写入KV
        var keysJson = JSON.stringify({ apiKeys: localApiKeys });
        if (keysJson !== this._lastKeysHash) {
          await this.putKeys({ apiKeys: localApiKeys });
          this._lastKeysHash = keysJson;
          result.keys = 1;
        }
      } catch(e) { result.errors++; }

      // 同步 settings（仅变更时写入，避免浪费KV配额）
      try {
        var cloudSettings = await this.getSettings();
        var cloudSettingsData = (cloudSettings && cloudSettings.settings) || {};
        var cloudApiConfig = (cloudSettings && cloudSettings.apiConfig) || {};
        var localSettings = (DB && DB.settings) || {};
        var localApiConfig = (DB && DB.apiConfig) || {};

        for (var sk in cloudSettingsData) {
          if (localSettings[sk] === undefined || localSettings[sk] === '') {
            localSettings[sk] = cloudSettingsData[sk];
          }
        }
        if (cloudApiConfig.provider && !localApiConfig.provider) {
          localApiConfig = cloudApiConfig;
        }
        if (DB) { DB.settings = localSettings; DB.apiConfig = localApiConfig; }

        // 仅当本地settings与上次推送不同时才写入KV
        var settingsJson = JSON.stringify({ settings: localSettings, apiConfig: localApiConfig });
        if (settingsJson !== this._lastSettingsHash) {
          await this.putSettings({ settings: localSettings, apiConfig: localApiConfig });
          this._lastSettingsHash = settingsJson;
          result.settings = 1;
        }
      } catch(e) { result.errors++; }

      try { if (DB && DB.save) DB.save(); } catch(e) { console.warn("[cloud-sync.js]", e); }

      result.ok = true;
      return result;
    } catch(e) {
      return { ok: false, error: e.message };
    }
  },

  // ==================== 同步 ====================

  /**
   * 拉取云端作品列表（轻量）
   */
  getWorks: async function() {
    return this._fetch('/works');
  },

  /**
   * 获取云端待删除列表（24h延迟删除标记）
   */
  getPendingDeletes: async function() {
    return this._fetch('/works/pending-deletes');
  },

  /**
   * 推送延迟删除标记到云端
   * 设备A删除作品 → 云端标记删除（保留数据24h）→ 其他设备同步时识别标记并删本地
   */
  pushPendingDelete: async function(workId, title) {
    return this._fetch('/works/' + encodeURIComponent(workId) + '/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || '' })
    });
  },

  /**
   * 拉取单个作品完整数据
   */
  getWork: async function(workId) {
    return this._fetch('/works/' + encodeURIComponent(workId));
  },

  /**
   * 推送作品到云端（含冲突处理）
   * @param {Object} payload - 作品完整数据对象
   * @param {string} payload.workId - 客户端UUID
   * @param {number} payload.version - 本地版本号
   * @returns {Object} { status: 'created'|'updated'|'unchanged', version }
   */
  pushWork: async function(payload) {
    if (!payload.workId) throw new Error('缺少 workId');
    return this._fetch('/works/' + encodeURIComponent(payload.workId), {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  /**
   * 批量同步
   */
  pushBatch: async function(items, device) {
    return this._fetch('/works/sync/batch', {
      method: 'POST',
      body: JSON.stringify({ items: items, device: device || '' })
    });
  },

  /**
   * 删除云端作品
   */
  deleteWork: async function(workId) {
    // 优先使用 POST /works/:id/delete（兼容所有后端版本）
    try {
      return await this._fetch('/works/' + encodeURIComponent(workId) + '/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
    } catch(e) {
      // 如果404说明作品本来就不存在，不算同步失败
      var msg = e && e.message ? String(e.message) : '';
      if (msg.indexOf('404') >= 0 || msg.indexOf('不存在') >= 0 || msg.indexOf('not found') >= 0 || msg.indexOf('Not Found') >= 0) {
        return { ok: true, already_deleted: true };
      }
      throw e;
    }
  },

  // ==================== 快照 ====================

  getSnapshots: async function(workId) {
    return this._fetch('/works/' + encodeURIComponent(workId) + '/snapshots');
  },

  restoreSnapshot: async function(workId, snapId) {
    return this._fetch('/works/' + encodeURIComponent(workId) + '/snapshots/' + snapId + '/restore', {
      method: 'POST'
    });
  },

  // ==================== 智能同步 ====================

  /**
   * 智能双向同步：比较本地/云端版本，自动选择方向
   * 返回同步报告
   */
  smartSync: async function() {
    if (!this.isLoggedIn()) return { ok: false, error: '未登录' };
    // 并发锁：防止自动同步和保存触发的同步同时执行
    if (this._syncing) return { ok: false, error: '同步进行中' };
    // KV配额超限检测：暂停同步5分钟
    if (this._kvQuotaExceeded && Date.now() - this._kvQuotaExceeded < 300000) {
      return { ok: false, error: '云端存储配额已超限，5分钟后重试' };
    }
    this._syncing = true;
    var report = { pushed: 0, pulled: 0, unchanged: 0, errors: 0 };
    try {
      // 1. 获取本地作品列表
      var localWorks = [];
      try {
        if (DB && DB.works) localWorks = DB.works.slice();
      } catch(e) { console.warn("[cloud-sync.js]", e); }

      // 2. 获取云端作品列表
      var cloudResp = await this.getWorks();
      var cloudWorks = (cloudResp && cloudResp.works) ? cloudResp.works : [];
      var cloudMap = {};
      for (var i = 0; i < cloudWorks.length; i++) {
        cloudMap[cloudWorks[i].workId] = cloudWorks[i];
      }

      // 3. 比较版本号，分组收集需要推送和拉取的作品
      var toPush = [];
      var toPull = [];
      for (var j = 0; j < localWorks.length; j++) {
        var lw = localWorks[j];
        if (!lw.id) continue;
        var localVersion = lw._version || 0;
        var cloudVersion = cloudMap[lw.id] ? (cloudMap[lw.id].version || 0) : 0;

        // 本地有编辑标记（_dirty）或云端无此作品（cloudVersion===0）或本地版本更新时，都推送
        if (lw._dirty || cloudVersion === 0 || localVersion > cloudVersion) {
          toPush.push(lw);
        } else if (cloudVersion > localVersion) {
          toPull.push(lw.id);
        } else {
          report.unchanged++;
        }
      }

      // 4. 获取云端延迟删除标记（24h内删除的作品）
      var cloudPendingDeletes = [];
      try {
        var pdResp = await this.getPendingDeletes();
        if (pdResp && pdResp.pendingDeletes) {
          cloudPendingDeletes = pdResp.pendingDeletes;
        }
      } catch(e) { console.warn('[cloud-sync.js] 获取云端删除标记失败:', e); }
      var pendingDeleteMap = {};
      for (var pi = 0; pi < cloudPendingDeletes.length; pi++) {
        pendingDeleteMap[cloudPendingDeletes[pi].workId] = cloudPendingDeletes[pi];
      }

      // 5. 处理云端删除标记：如果本地有此作品，立即删除本地
      var localDeletedCount = 0;
      for (var pdId in pendingDeleteMap) {
        if (pendingDeleteMap.hasOwnProperty(pdId)) {
          for (var li = 0; li < localWorks.length; li++) {
            if (localWorks[li].id === pdId) {
              try {
                if (DB && DB.deleteWork) DB.deleteWork(pdId);
                localDeletedCount++;
              } catch(e) { console.warn('[cloud-sync.js] 本地删除失败:', e); }
              break;
            }
          }
        }
      }
      if (localDeletedCount > 0) {
        report.deleted = (report.deleted || 0) + localDeletedCount;
        // 刷新本地作品列表
        try { if (DB && DB.works) localWorks = DB.works.slice(); } catch(e) {}
      }

      // 6. 云端有但本地没有的作品 → 判断是否拉取
      for (var k = 0; k < cloudWorks.length; k++) {
        var cw = cloudWorks[k];
        var found = false;
        for (var m = 0; m < localWorks.length; m++) {
          if (localWorks[m].id === cw.workId) { found = true; break; }
        }
        if (!found) {
          // 如果在延迟删除列表中 → 跳过（已在其他设备删除）
          if (pendingDeleteMap[cw.workId]) {
            continue;
          }
          // 不在删除列表中 → 拉取（其他设备新建的作品）
          toPull.push(cw.workId);
        }
      }

      // 批量推送（先从 IndexedDB 加载瘦身章节的正文）
      if (toPush.length > 0) {
        try {
          // 加载瘦身章节正文：逐个作品，逐个瘦身章节
          for (var pii = 0; pii < toPush.length; pii++) {
            var pw = toPush[pii];
            if (pw && pw.chapters && pw.id) {
              for (var ci = 0; ci < pw.chapters.length; ci++) {
                var ch = pw.chapters[ci];
                if (ch && ch._slim === true && DB && DB.loadChapterShard) {
                  try {
                    var shard = await DB.loadChapterShard(pw.id, ci);
                    if (shard && shard.content) {
                      ch.content = shard.content;
                      ch._slim = false;
                    }
                  } catch(se) {}
                }
              }
            }
          }
          var batchItems = toPush.map(function(w){ return _packWork(w); });
          var batchResult = await this.pushBatch(batchItems, '');
          if (batchResult && batchResult.results) {
            for (var bi = 0; bi < batchResult.results.length; bi++) {
              var br = batchResult.results[bi];
              if (br.status === 'created' || br.status === 'updated') {
                for (var bj = 0; bj < toPush.length; bj++) {
                  if (toPush[bj].id === br.workId) {
                    toPush[bj]._version = br.version;
                    delete toPush[bj]._dirty;
                    break;
                  }
                }
                report.pushed++;
              }
            }
          }
        } catch(e) {
          // 批量失败回退到逐个推送
          for (var pi = 0; pi < toPush.length; pi++) {
            try {
              var pr = await this.pushWork(_packWork(toPush[pi]));
              if (pr && pr.version) {
                toPush[pi]._version = pr.version;
                delete toPush[pi]._dirty;
                report.pushed++;
              } else {
                report.errors++;
              }
            } catch(_) { report.errors++; }
          }
        }
      }

      // 并行拉取（限制并发3个）
      if (toPull.length > 0) {
        var self = this;
        var concurrency = 3;
        for (var pi = 0; pi < toPull.length; pi += concurrency) {
          var batch = toPull.slice(pi, pi + concurrency);
          var pullResults = await Promise.all(batch.map(function(wid) {
            return self.getWork(wid).catch(function(){ return null; });
          }));
          for (var ri = 0; ri < pullResults.length; ri++) {
            var full = pullResults[ri];
            if (!full || !full.work || !full.work.payload) continue;
            var wid = toPull[pi + ri];
            // 查找本地是否已有
            var existing = false;
            for (var ei = 0; ei < localWorks.length; ei++) {
              if (localWorks[ei].id === wid) {
                _mergeWork(localWorks[ei], full.work.payload);
                localWorks[ei]._version = full.work.version;
                // 拉取后清除脏标记，避免推送逻辑混乱
                delete localWorks[ei]._dirty;
                existing = true;
                break;
              }
            }
            if (!existing) {
              var newWork = full.work.payload;
              newWork._version = full.work.version || 1;
              newWork.id = full.work.workId;
              newWork.title = full.work.title || '';
              if (DB && DB.works) DB.works.push(newWork);
            }
            report.pulled++;
          }
        }
      }

      // 保存本地（立即落盘，避免页面刷新导致拉取数据丢失）
      try { if (DB && DB.flush) DB.flush(); } catch(e) { console.warn("[cloud-sync.js]", e); }

      // 同时同步 keys 和 settings（仅当有实际作品变更时才做，避免浪费KV配额）
      if (report.pushed > 0 || report.pulled > 0 || report.deleted > 0) {
        try {
          await this.syncKeysAndSettings();
        } catch(ksErr) {}
      }

      report.ok = true;
    } catch(e) {
      report.errors++;
      report.ok = false;
      report.error = e.message;
    } finally {
      this._syncing = false;
      this._fireSync(report);
    }
    return report;
  },

  /**
   * 章节保存后快速同步（单作品）
   */
  quickSync: async function(workId) {
    if (!this.isLoggedIn()) return { ok: false, error: '未登录' };
    try {
      var w = null;
      if (DB && DB.works) {
        for (var i = 0; i < DB.works.length; i++) {
          if (DB.works[i].id === workId) { w = DB.works[i]; break; }
        }
      }
      if (!w) return { ok: false, error: '未找到作品' };
      // 从 IndexedDB 加载瘦身章节的正文，避免推送空内容
      if (w.chapters && Array.isArray(w.chapters) && DB && DB.loadChapterShard) {
        for (var ci = 0; ci < w.chapters.length; ci++) {
          var ch = w.chapters[ci];
          if (ch && ch._slim === true) {
            try {
              var shard = await DB.loadChapterShard(w.id, ci);
              if (shard && shard.content) {
                ch.content = shard.content;
                ch._slim = false;
              }
            } catch(se) {}
          }
        }
      }
      var qsResult = await this.pushWork(_packWork(w));
      var evt = { action: 'quickSync', ok: !qsResult.error, workId: workId, pushed: 1 };
      try { for (var qk in qsResult) if (qsResult.hasOwnProperty(qk)) evt[qk] = qsResult[qk]; } catch(_) { console.warn("[cloud-sync.js]", _); }
      this._fireSync(evt);
      return qsResult;
    } catch(e) {
      this._fireSync({ action: 'quickSync', ok: false, error: e.message });
      return { ok: false, error: e.message };
    }
  },

  // ==================== 自动同步 ====================

  startAutoSync: function(interval) {
    if (this._timer) clearInterval(this._timer);
    var self = this;
    this._timer = setInterval(function() {
      if (self.isLoggedIn()) self.smartSync().catch(function(){});
    }, interval || this.autoInterval);
  },

  stopAutoSync: function() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  },

  // ==================== 底层 ====================

  _fetch: async function(path, opts) {
    opts = opts || {};
    if (!this.apiBase) return { error: '未配置后端地址' };
    // KV配额超限检测：如果之前检测到配额超限，暂停写入类请求5分钟
    if (this._kvQuotaExceeded && Date.now() - this._kvQuotaExceeded < 300000) {
      if (opts.method === 'PUT' || opts.method === 'POST' || opts.method === 'DELETE') {
        return { error: '云端存储配额已超限，请稍后再试（每天UTC 0点重置）' };
      }
    }
    var headers = (opts.headers || {});
    headers['Content-Type'] = 'application/json';
    if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
    var resp;
    try {
      resp = await fetch(this.apiBase + path, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body || undefined
      });
    } catch (e) {
      throw new Error('网络连接失败（' + (e && e.message ? e.message : 'unknown') + '）');
    }
    var text = '';
    try { text = await resp.text(); } catch (_) {}
    var data = null;
    try { if (text) data = JSON.parse(text); } catch (_) {}
    if (!data) data = { error: '服务器返回异常（' + (text ? text.substring(0, 30) : '空响应') + '）' };
    if (!resp.ok) {
      // KV配额超限检测：记录时间戳，暂停后续写入
      if (data.error && data.error.indexOf('KV put() limit exceeded') >= 0) {
        this._kvQuotaExceeded = Date.now();
        console.warn('[cloud-sync] KV配额超限，暂停写入5分钟');
      }
      if (resp.status === 401) this._clearToken();
      throw new Error(data.error || '请求失败 ' + resp.status);
    }
    return data;
  }
};

// ==================== 辅助 ====================

function _packWork(w) {
  // 动态计算总字数
  var totalWords = 0;
  if (w.chapters && Array.isArray(w.chapters)) {
    for (var i = 0; i < w.chapters.length; i++) {
      var ch = w.chapters[i];
      if (ch && ch.content) totalWords += ch.content.length;
      else if (ch && ch.wordCount) totalWords += ch.wordCount;
    }
  }
  return {
    workId: w.id || '',
    title: w.title || '',
    category: w.category || '',
    synopsis: w.synopsis || '',
    payload: w,
    version: w._version || 0,
    chapterCount: w.chapters ? w.chapters.length : 0,
    totalWords: totalWords
  };
}

function _mergeWork(local, cloudPayload) {
  if (!cloudPayload || !local) return;
  // 云端数据覆盖本地核心字段，但保留本地特有字段和writing状态
  var localWriting = local._writing;
  // 需要保留的本地特有字段（不被云端覆盖）
  var preserveKeys = {'_version':1,'_writing':1,'_dirty':1,'_fingerprint':1,'_slimMeta':1,'_moduleIdeas':1};
  var keys = Object.keys(cloudPayload);
  for (var i = 0; i < keys.length; i++) {
    if (!preserveKeys[keys[i]]) {
      local[keys[i]] = cloudPayload[keys[i]];
    }
  }
  if (localWriting) local._writing = localWriting;
}

window.CloudSync = CloudSync;

// 自动初始化：如果页面没有手动初始化 cloud，则自动创建实例
if (!window.cloud) {
  var _apiBase;
  var _protocol = (location.protocol || '').toLowerCase();
  var _hostname = location.hostname || '';

  // 检测是否为移动 App (Capacitor/WebView) 环境
  // - Capacitor: capacitor://localhost 或 ionic://localhost
  // - file:// 协议（旧版 WebView）
  // - window.Capacitor / window.Ionic 对象存在
  var _isMobileApp = (_protocol === 'capacitor:' || _protocol === 'ionic:' ||
                      _protocol === 'file:' || window.Capacitor || window.Ionic);

  // 只有当是真正的本地 HTTP 开发环境（浏览器中的 localhost）时才用本地 API
  var _isLocalDev = ((_protocol === 'http:' || _protocol === 'https:') &&
                     (_hostname === 'localhost' || _hostname === '127.0.0.1'));

  if (_isLocalDev) {
    // 真实本地开发（浏览器，且 hostname 是 localhost）
    _apiBase = 'http://localhost:8787/api';
  } else if (_isMobileApp) {
    // 移动 App：使用线上 Cloudflare Pages 地址
    _apiBase = 'https://wxbj-main.pages.dev/api';
  } else {
    // 浏览器线上环境：使用当前 origin 的 /api 路径
    _apiBase = (location.origin && location.origin !== 'null' && _protocol !== 'file:')
      ? (location.origin + '/api')
      : 'https://wxbj-main.pages.dev/api';
  }

  // 同步状态调试：记录当前 API 地址（便于排查 App 与浏览器不同步问题）
  try {
    window.__cloudApiBase = _apiBase;
    console.info('[cloud-sync] API 地址: ' + _apiBase + ' (' +
      (_isLocalDev ? '本地开发' : _isMobileApp ? '移动App' : '浏览器线上') + ')');
  } catch (e) {}

  window.cloud = new CloudSync({ apiBase: _apiBase, autoSync: true });
}

})();