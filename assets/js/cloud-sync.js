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
  this.autoInterval = opts.autoInterval || 60000; // 1 分钟（原5分钟太慢）
  this._timer = null;
  this._syncTimer = null;
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
    try { localStorage.setItem('wxbj_cloud_token', token); } catch(e) {}
    try { localStorage.setItem('wxbj_cloud_user', JSON.stringify(user)); } catch(e) {}
  },

  _clearToken: function() {
    this.token = null;
    this.user = null;
    try { localStorage.removeItem('wxbj_cloud_token'); } catch(e) {}
    try { localStorage.removeItem('wxbj_cloud_user'); } catch(e) {}
  },

  register: async function(email, password, nickname) {
    var resp = await this._fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password, nickname: nickname || '' })
    });
    if (resp.error) throw new Error(resp.error);
    this._saveToken(resp.token, resp.user);
    return resp;
  },

  login: async function(email, password) {
    var resp = await this._fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password })
    });
    if (resp.error) throw new Error(resp.error);
    this._saveToken(resp.token, resp.user);
    // 登录成功后立即同步一次，确保能看到云端作品
    setTimeout(() => { this.smartSync().catch(() => {}); }, 500);
    return resp;
  },

  logout: function() {
    this._clearToken();
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

      // 同步 keys
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
            // 本地云端都有，合并去重
            for (var ki = 0; ki < cloudApiKeys[p].length; ki++) {
              if (localApiKeys[p].indexOf(cloudApiKeys[p][ki]) < 0) {
                localApiKeys[p].push(cloudApiKeys[p][ki]);
                changed = true;
              }
            }
          }
        }
        if (DB) DB.apiKeys = localApiKeys;

        // 本地 keys 推云端（整体覆盖）
        await this.putKeys({ apiKeys: localApiKeys });
        result.keys = 1;
      } catch(e) { result.errors++; }

      // 同步 settings
      try {
        var cloudSettings = await this.getSettings();
        var cloudSettingsData = (cloudSettings && cloudSettings.settings) || {};
        var cloudApiConfig = (cloudSettings && cloudSettings.apiConfig) || {};
        var localSettings = (DB && DB.settings) || {};
        var localApiConfig = (DB && DB.apiConfig) || {};

        // 云端有但本地空的字段，拉回来
        for (var sk in cloudSettingsData) {
          if (localSettings[sk] === undefined || localSettings[sk] === '') {
            localSettings[sk] = cloudSettingsData[sk];
          }
        }
        if (cloudApiConfig.provider && !localApiConfig.provider) {
          localApiConfig = cloudApiConfig;
        }
        if (DB) { DB.settings = localSettings; DB.apiConfig = localApiConfig; }

        // 本地 settings 推云端
        await this.putSettings({ settings: localSettings, apiConfig: localApiConfig });
        result.settings = 1;
      } catch(e) { result.errors++; }

      // 保存本地（防抖）
      try { if (DB && DB.save) DB.save(); } catch(e) {}

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
    return this._fetch('/works/' + encodeURIComponent(workId), { method: 'DELETE' });
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
    this._syncing = true;
    var report = { pushed: 0, pulled: 0, unchanged: 0, errors: 0 };
    try {
      // 1. 获取本地作品列表
      var localWorks = [];
      try {
        if (DB && DB.works) localWorks = DB.works.slice();
      } catch(e) {}

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
      var trash = [];
      try {
        trash = DB._trash || [];
      } catch(e) {}

      // 获取云端待删除列表（hardDeleteWork 产生的记录）
      var cloudDeleteList = [];
      try {
        if (DB && DB._cloudDeleteList && DB._cloudDeleteList.length > 0) {
          cloudDeleteList = DB._cloudDeleteList.slice();
        }
      } catch(e) {}

      var toDeleteOnCloud = [];
      for (var k = 0; k < cloudWorks.length; k++) {
        var cw = cloudWorks[k];
        var found = false;
        for (var m = 0; m < localWorks.length; m++) {
          if (localWorks[m].id === cw.workId) { found = true; break; }
        }
        if (!found) {
          // 检查是否在回收站
          var inTrash = false;
          for (var ti = 0; ti < trash.length; ti++) {
            if (trash[ti] && trash[ti].work && trash[ti].work.id === cw.workId) {
              inTrash = true;
              break;
            }
          }
          // 检查是否在云端待删列表
          var inDeleteList = cloudDeleteList.indexOf(cw.workId) >= 0;

          if (inTrash || inDeleteList) {
            toDeleteOnCloud.push(cw.workId);
          } else {
            toPull.push(cw.workId);
          }
        }
      }
      // 云端待删列表中本地不存在且云端也没有的作品，从列表中清理
      if (cloudDeleteList.length > 0 && toDeleteOnCloud.length > 0) {
        toDeleteOnCloud = toDeleteOnCloud.concat(
          cloudDeleteList.filter(function(id) { return toDeleteOnCloud.indexOf(id) < 0; })
        );
      }

      if (toDeleteOnCloud.length > 0) {
        var deletedIds = [];
        for (var di = 0; di < toDeleteOnCloud.length; di++) {
          try {
            await this.deleteWork(toDeleteOnCloud[di]);
            report.deleted = (report.deleted || 0) + 1;
            deletedIds.push(toDeleteOnCloud[di]);
          } catch(e) {
            report.errors++;
          }
        }
        // 清理本地云端待删除列表（只有成功删除的才移除）
        if (deletedIds.length > 0 && DB && DB._cloudDeleteList) {
          try {
            DB._cloudDeleteList = DB._cloudDeleteList.filter(function(id) {
              return deletedIds.indexOf(id) < 0;
            });
          } catch(e) {}
        }

        cloudWorks = cloudWorks.filter(function(cw) {
          return toDeleteOnCloud.indexOf(cw.workId) < 0;
        });
        for (var i = 0; i < cloudWorks.length; i++) {
          cloudMap[cloudWorks[i].workId] = cloudWorks[i];
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
      try { if (DB && DB.flush) DB.flush(); } catch(e) {}

      // 同时同步 keys 和 settings（每次完整同步都顺带做）
      try {
        await this.syncKeysAndSettings();
      } catch(ksErr) {}

      report.ok = true;
    } catch(e) {
      report.errors++;
      report.ok = false;
      report.error = e.message;
    } finally {
      this._syncing = false;
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
      return await this.pushWork(_packWork(w));
    } catch(e) {
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
  if (_protocol === 'file:' || !location.hostname || location.origin === 'null' || location.origin === null) {
    // file:// 协议或无域名环境下，云端同步不可用（保留本地数据即可）
    _apiBase = '';
  } else if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    _apiBase = 'http://localhost:8787/api';
  } else {
    _apiBase = location.origin + '/api';
  }
  window.cloud = new CloudSync({ apiBase: _apiBase, autoSync: true });
}

})();