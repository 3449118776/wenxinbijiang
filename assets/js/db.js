/* 文心笔匠 - 数据存储模块 */

// === 浏览器兼容性补丁：为旧版X5内核添加 NodeList.forEach 支持 ===
if (typeof NodeList !== 'undefined' && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function(callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}
if (typeof HTMLCollection !== 'undefined' && !HTMLCollection.prototype.forEach) {
  HTMLCollection.prototype.forEach = function(callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}
// padStart 兼容（ES2017，老X5不支持）
if (!String.prototype.padStart) {
  String.prototype.padStart = function(targetLength, padString) {
    padString = padString || ' ';
    var s = String(this);
    while (s.length < targetLength) {
      s = padString + s;
    }
    return s;
  };
}
// Object.assign 兼容（ES2015，极老浏览器可能没有）
if (typeof Object.assign !== 'function') {
  Object.assign = function(target) {
    if (target === null || target === undefined) { throw new TypeError('Cannot convert undefined or null to object'); }
    var to = Object(target);
    for (var i = 1; i < arguments.length; i++) {
      var nextSource = arguments[i];
      if (nextSource !== null && nextSource !== undefined) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}
// Object.values 兼容（ES2017，老X5不支持）
if (!Object.values) {
  Object.values = function(obj) {
    var vals = [];
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        vals.push(obj[key]);
      }
    }
    return vals;
  };
}
// Object.entries 兼容（ES2017，老X5不支持）
if (!Object.entries) {
  Object.entries = function(obj) {
    var entries = [];
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        entries.push([key, obj[key]]);
      }
    }
    return entries;
  };
}
// === 兼容性补丁结束 ===

// === 全局版本号：所有页面统一引用 ===
window.APP_VERSION = '4.0';
window.APP_BUILD = '20260610';
window.APP_DATA_VERSION = 44;

const DB = {
  works: [],
  apiConfig: { provider: 'deepseek', model: 'deepseek-chat' },
  apiKeys: {},  // { dashscope: ['key1','key2'], deepseek: ['key1'] }
  settings: { dark: false, fontSize: 15, theme: 'blue', multiAI: false },

  // 初始化
  init() {
    try {
      var saved = localStorage.getItem('wxbj_data_v4');
      if (saved) {
        var data = JSON.parse(saved);
        // 版本校验：旧格式数据自动迁移
        if (!data._version || data._version < 12) {
          console.warn('检测到旧版本数据(v'+(data._version||'?')+')，正在迁移...');
          data._version = 12;
        }
        this.works = data.works || [];
        this.apiConfig = data.apiConfig || this.apiConfig;
        this.apiKeys = data.apiKeys || {};
        this.settings = data.settings || this.settings;
        this._trash = Array.isArray(data._trash) ? data._trash : [];

        // 自动检测拆分存储：如果主key是轻量化的，自动合并
        if (data._split === true) {
          var self = this;
          this.works = this.works.map(function(w) {
            return self._stitchHeavyWork(w);
          });
        }
      }
      // 数据迁移：确保所有作品都有 longMemory 和 settings
      this.works.forEach(w => {
        if (!w.longMemory) w.longMemory = {charStates:[], plotThreads:[], foreshadows:[], charArcs:[], memoryAnchors:{core:[],characterTags:[],relationships:[],items:[],locations:[],promises:[],timeline:[],hooks:[]}, chapterIndex:[], characterHistory:{}, rollingSummary:'', memoryDebt:[], lifecycle:{lastCompressedAt:-1,lastRebuildAt:0}, volumeMemories:[], characterProfiles:{}, foreshadowLedger:[], itemLedger:{}, factionGraph:{}, timelineEvents:[], ultraMeta:{volumeSize:50,lastUltraUpdateAt:-1}, chainConsistency:[]};
        if (!w.longMemory.memoryAnchors) w.longMemory.memoryAnchors = {core:[],characterTags:[],relationships:[],items:[],locations:[],promises:[],timeline:[],hooks:[]};
        if (!Array.isArray(w.longMemory.chapterIndex)) w.longMemory.chapterIndex = [];
        if (!w.longMemory.characterHistory) w.longMemory.characterHistory = {};
        if (!w.longMemory.rollingSummary) w.longMemory.rollingSummary = '';
        if (!Array.isArray(w.longMemory.memoryDebt)) w.longMemory.memoryDebt = [];
        if (!w.longMemory.lifecycle) w.longMemory.lifecycle = {lastCompressedAt:-1,lastRebuildAt:0};
        if (!w.settings) w.settings = {genre:'', concept:'', platform:'general'};
      });
      try { this.ensureAllFingerprints(); } catch(fpErr) {}
      if (this.works.length > 0) this.save();
      // v47修复：标记所有已有作品为脏，强制与云端重新同步
      // 解决历史作品因版本号相同而无法同步的问题
      (this.works || []).forEach(function(w) {
        if (w && w.id) {
          // 保留_version，将dirty重置为true强制推送
          // 如果_version为undefined，说明是从未同步过，不需要处理
          w._dirty = true;
        }
      });
      // v38：启动App记忆自动维护
      try { this.startAutoMaintenance(); } catch(autoErr) {}
      this._initialized = true;
    } catch (e) {
      console.error('DB初始化失败:', e);
    }
  },



  // ========== v40：多作品防串隔离 ==========
  ensureWorkFingerprint(work) {
    if (!work) return '';
    if (!work._fingerprint) {
      var seed = [work.id || '', work.title || '', (work.created || ''), (work.category && (work.category.cat1 || work.category.cat2) || '')].join('|');
      var h = 0;
      for (var i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
      work._fingerprint = 'fp_' + Math.abs(h).toString(36) + '_' + (work.id || '').slice(-6);
    }
    return work._fingerprint;
  },

  ensureAllFingerprints() {
    var self = this;
    (self.works || []).forEach(function(w){ self.ensureWorkFingerprint(w); });
  },

  validateWorkIsolation(work, silent) {
    if (!work || !work.id) return false;
    this.ensureWorkFingerprint(work);
    var currentId = '';
    try { currentId = localStorage.getItem('last_edit_work') || ''; } catch(e) {}
    if (currentId && currentId !== work.id) {
      console.warn('[Isolation] 阻止跨作品保存：current=' + currentId + ', work=' + work.id);
      if (!silent && typeof window.showToast === 'function') {
        window.showToast('⚠️ 已阻止跨作品写入，请刷新页面后再保存', 4500);
      }
      return false;
    }
    return true;
  },

  // ========== v36：App级大容量记忆镜像（IndexedDB） ==========
  _appMemoryDbName: 'wxbj_app_memory_v1',
  _appMemoryStore: 'snapshots',
  _chapterStore: 'chapters',
  _backupStore: 'backups',
  _historyStore: 'chapter_history',

  openAppMemoryDB() {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (!('indexedDB' in window)) { reject(new Error('当前环境不支持 IndexedDB')); return; }
      var req = indexedDB.open(self._appMemoryDbName, 4);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(self._appMemoryStore)) {
          db.createObjectStore(self._appMemoryStore, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(self._chapterStore)) {
          var chStore = db.createObjectStore(self._chapterStore, { keyPath: 'id' });
          try { chStore.createIndex('workId', 'workId', { unique: false }); } catch(e) {}
        }
        if (!db.objectStoreNames.contains(self._backupStore)) {
          var bkStore = db.createObjectStore(self._backupStore, { keyPath: 'id' });
          try { bkStore.createIndex('createdAt', 'createdAt', { unique: false }); } catch(e) {}
        }
        if (!db.objectStoreNames.contains(self._historyStore)) {
          var hs = db.createObjectStore(self._historyStore, { keyPath: 'id' });
          try { hs.createIndex('chapterKey', 'chapterKey', { unique: false }); } catch(e) {}
          try { hs.createIndex('createdAt', 'createdAt', { unique: false }); } catch(e) {}
        }
      };
      req.onsuccess = function(e) { resolve(e.target.result); };
      req.onerror = function() { reject(req.error || new Error('IndexedDB 打开失败')); };
    });
  },

  buildSnapshot() {
    try { this.ensureAllFingerprints(); } catch(fpErr) {}
    return {
      _version: 44,
      id: 'latest',
      savedAt: Date.now(),
      savedAtText: new Date().toISOString(),
      works: this.works || [],
      apiConfig: this.apiConfig || {},
      apiKeys: this.apiKeys || {},
      settings: this.settings || {},
      _trash: this._trash || []
    };
  },

  saveAppMemoryMirror(jsonText) {
    var self = this;
    try {
      var snap = jsonText ? JSON.parse(jsonText) : self.buildSnapshot();
      snap.id = 'latest';
      snap.savedAt = Date.now();
      snap.savedAtText = new Date().toISOString();
      return self.openAppMemoryDB().then(function(db) {
        return new Promise(function(resolve, reject) {
          var tx = db.transaction([self._appMemoryStore], 'readwrite');
          tx.objectStore(self._appMemoryStore).put(snap);
          tx.oncomplete = function() { resolve(true); };
          tx.onerror = function() { reject(tx.error || new Error('App记忆镜像保存失败')); };
        });
      }).catch(function(e) {
        console.warn('[AppMemory] 镜像保存失败:', e && e.message);
        return false;
      });
    } catch(e) {
      console.warn('[AppMemory] 镜像构建失败:', e && e.message);
      return Promise.resolve(false);
    }
  },

  loadAppMemoryMirror() {
    var self = this;
    return self.openAppMemoryDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction([self._appMemoryStore], 'readonly');
        var req = tx.objectStore(self._appMemoryStore).get('latest');
        req.onsuccess = function() { resolve(req.result || null); };
        req.onerror = function() { reject(req.error || new Error('读取App记忆镜像失败')); };
      });
    });
  },


  // v37：章节正文分片存储，每章单独写入 IndexedDB
  // v38：自动维护队列，避免用户手动整理章节分片
  markChapterShardDirty(workId, chapterIdx) {
    if (!workId && workId !== 0) return;
    if (!this._dirtyChapterShards) this._dirtyChapterShards = {};
    this._dirtyChapterShards[workId + '::' + chapterIdx] = { workId: workId, chapterIdx: chapterIdx, ts: Date.now() };
    this.scheduleShardFlush();
  },

  markWorkShardsDirty(work) {
    if (!work || !Array.isArray(work.chapters)) return;
    for (var i = 0; i < work.chapters.length; i++) this.markChapterShardDirty(work.id, i);
  },

  scheduleShardFlush(delay) {
    var self = this;
    delay = delay || 1200;
    if (self._shardFlushTimer) clearTimeout(self._shardFlushTimer);
    self._shardFlushTimer = setTimeout(function() {
      self.flushDirtyChapterShards();
    }, delay);
  },

  flushDirtyChapterShards() {
    var self = this;
    var dirty = self._dirtyChapterShards || {};
    var keys = Object.keys(dirty);
    if (!keys.length) return Promise.resolve(true);
    self._dirtyChapterShards = {};
    self._lastShardFlushAt = Date.now();
    var p = Promise.resolve(true);
    keys.forEach(function(key) {
      var d = dirty[key];
      p = p.then(function() {
        var w = (self.works || []).find(function(x){ return x.id === d.workId; });
        if (!w || !w.chapters || !w.chapters[d.chapterIdx]) return true;
        return self.saveChapterShard(w.id, d.chapterIdx, w.chapters[d.chapterIdx]);
      });
    });
    return p.then(function(){ return true; }).catch(function(e){
      console.warn('[AppMemory] 自动分片刷新失败:', e && e.message);
      return false;
    });
  },

  startAutoMaintenance() {
    var self = this;
    if (self._autoMaintenanceStarted) return;
    self._autoMaintenanceStarted = true;
    setTimeout(function(){ try { self.saveAllChapterShards(); } catch(e) {} }, 3000);
    self._autoShardTimer = setInterval(function(){
      try {
        self.flushDirtyChapterShards();
        self.saveAllChapterShards();
      } catch(e) {}
    }, 60000);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', function(){
        if (document.hidden) {
          try { self.flush(); } catch(e) {}
          try { self.flushDirtyChapterShards(); } catch(e) {}
        }
      });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', function(){
        try { self.flush(); } catch(e) {}
        try { self.flushDirtyChapterShards(); } catch(e) {}
      });
    }
  },

  getAutoMaintenanceStatus() {
    var dirty = this._dirtyChapterShards || {};
    return {
      enabled: !!this._autoMaintenanceStarted,
      pending: Object.keys(dirty).length,
      lastFlushAt: this._lastShardFlushAt || 0
    };
  },

  saveChapterShard(workId, chapterIdx, chapter) {
    var self = this;
    if (!workId || !chapter) return Promise.resolve(false);
    var _work = (self.works || []).find(function(w){ return w.id === workId; });
    var _fp = _work ? self.ensureWorkFingerprint(_work) : '';
    var _title = _work ? (_work.title || '') : '';
    return self.openAppMemoryDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction([self._chapterStore, self._historyStore], 'readwrite');
        var chStore = tx.objectStore(self._chapterStore);
        var histStore = tx.objectStore(self._historyStore);
        var chapterKey = workId + '::' + chapterIdx;
        var now = Date.now();
        var req = chStore.get(chapterKey);
        req.onsuccess = function() {
          var old = req.result;
          if (old && old.content && old.content !== (chapter.content || '')) {
            histStore.put({
              id: chapterKey + '::' + now,
              chapterKey: chapterKey,
              workId: workId,
              workTitle: _title,
              workFingerprint: _fp,
              chapterIdx: chapterIdx,
              title: old.title || '',
              content: old.content || '',
              wordCount: (old.content || '').length,
              createdAt: now
            });
          }
          chStore.put({
            id: chapterKey,
            workId: workId,
            workTitle: _title,
            workFingerprint: _fp,
            chapterIdx: chapterIdx,
            title: chapter.title || '',
            content: chapter.content || '',
            wordCount: (chapter.content || '').length,
            confirmed: !!chapter.confirmed,
            updatedAt: now
          });
        };
        tx.oncomplete = function() { resolve(true); };
        tx.onerror = function() { reject(tx.error || new Error('章节分片保存失败')); };
      });
    }).catch(function(e) {
      console.warn('[AppMemory] 章节分片保存失败:', e && e.message);
      return false;
    });
  },

  saveWorkChapterShards(work) {
    var self = this;
    if (!work || !Array.isArray(work.chapters)) return Promise.resolve(false);
    var chapters = work.chapters;
    // 顺序写，避免移动端一次性开太多事务
    var p = Promise.resolve(true);
    chapters.forEach(function(ch, idx) {
      p = p.then(function(){ return self.saveChapterShard(work.id, idx, ch || {}); });
    });
    return p.then(function(){ return true; });
  },

  saveAllChapterShards() {
    var self = this;
    var works = self.works || [];
    var p = Promise.resolve(true);
    works.forEach(function(w) {
      p = p.then(function(){ return self.saveWorkChapterShards(w); });
    });
    return p.then(function(){ return true; });
  },

  getChapterShardCount() {
    var self = this;
    return self.openAppMemoryDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction([self._chapterStore], 'readonly');
        var req = tx.objectStore(self._chapterStore).count();
        req.onsuccess = function(){ resolve(req.result || 0); };
        req.onerror = function(){ reject(req.error || new Error('统计章节分片失败')); };
      });
    }).catch(function(){ return 0; });
  },


  // ========== v41：自动备份系统 ==========
  buildBackupPayload(includeApiKeys) {
    try { this.ensureAllFingerprints(); } catch(e) {}
    return {
      _version: 44,
      backupType: 'auto-backup',
      exportedAt: new Date().toISOString(),
      works: this.works || [],
      settings: this.settings || {},
      apiConfig: this.apiConfig || {},
      apiKeys: includeApiKeys ? (this.apiKeys || {}) : undefined,
      _trash: this._trash || []
    };
  },

  safeBackupFileName() {
    var d = new Date();
    var ts = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + '_' + String(d.getHours()).padStart(2,'0') + String(d.getMinutes()).padStart(2,'0') + String(d.getSeconds()).padStart(2,'0');
    var count = (this.works || []).length;
    return '文心笔匠_自动备份_' + ts + '_' + count + '本.json';
  },

  saveInternalBackup(payload) {
    var self = this;
    payload = payload || self.buildBackupPayload(false);
    var row = {
      id: 'backup_' + Date.now(),
      createdAt: Date.now(),
      createdAtText: new Date().toISOString(),
      fileName: self.safeBackupFileName(),
      works: (payload.works || []).length,
      bytes: JSON.stringify(payload).length,
      payload: payload
    };
    return self.openAppMemoryDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction([self._backupStore], 'readwrite');
        tx.objectStore(self._backupStore).put(row);
        tx.oncomplete = function() { resolve(row); };
        tx.onerror = function() { reject(tx.error || new Error('内部备份保存失败')); };
      });
    }).then(function(row) {
      self.trimInternalBackups(20);
      return row;
    }).catch(function(e) {
      console.warn('[Backup] 内部备份失败:', e && e.message);
      return null;
    });
  },

  listInternalBackups() {
    var self = this;
    return self.openAppMemoryDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction([self._backupStore], 'readonly');
        var req = tx.objectStore(self._backupStore).getAll();
        req.onsuccess = function() {
          var rows = req.result || [];
          rows.sort(function(a,b){ return (b.createdAt||0) - (a.createdAt||0); });
          resolve(rows);
        };
        req.onerror = function(){ reject(req.error || new Error('读取备份清单失败')); };
      });
    }).catch(function(){ return []; });
  },

  trimInternalBackups(maxCount) {
    var self = this;
    maxCount = maxCount || 20;
    self.listInternalBackups().then(function(rows) {
      if (rows.length <= maxCount) return;
      self.openAppMemoryDB().then(function(db) {
        var tx = db.transaction([self._backupStore], 'readwrite');
        var st = tx.objectStore(self._backupStore);
        rows.slice(maxCount).forEach(function(r){ st.delete(r.id); });
      }).catch(function(e){});
    }).catch(function(e){});
  },

  saveBackupDirectoryHandle(handle) {
    var self = this;
    return self.openAppMemoryDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction([self._appMemoryStore], 'readwrite');
        tx.objectStore(self._appMemoryStore).put({id:'_backup_dir_handle', handle:handle, savedAt:Date.now()});
        tx.oncomplete = function(){ resolve(true); };
        tx.onerror = function(){ reject(tx.error || new Error('备份文件夹保存失败')); };
      });
    });
  },

  loadBackupDirectoryHandle() {
    var self = this;
    return self.openAppMemoryDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction([self._appMemoryStore], 'readonly');
        var req = tx.objectStore(self._appMemoryStore).get('_backup_dir_handle');
        req.onsuccess = function(){ resolve(req.result && req.result.handle ? req.result.handle : null); };
        req.onerror = function(){ reject(req.error || new Error('读取备份文件夹失败')); };
      });
    }).catch(function(){ return null; });
  },

  chooseAutoBackupDirectory() {
    var self = this;
    if (!window.showDirectoryPicker) return Promise.reject(new Error('当前环境不支持选择自动备份文件夹'));
    return window.showDirectoryPicker({mode:'readwrite'}).then(function(handle) {
      return self.saveBackupDirectoryHandle(handle).then(function(){ return handle; });
    });
  },

  writeBackupFile(payload, fileName) {
    var self = this;
    if (!window.showDirectoryPicker) return Promise.resolve(false);
    payload = payload || self.buildBackupPayload(false);
    fileName = fileName || self.safeBackupFileName();
    return self.loadBackupDirectoryHandle().then(function(handle) {
      if (!handle) return false;
      var verify = handle.queryPermission ? handle.queryPermission({mode:'readwrite'}) : Promise.resolve('granted');
      return verify.then(function(state) {
        if (state !== 'granted' && handle.requestPermission) return handle.requestPermission({mode:'readwrite'});
        return state;
      }).then(function(state) {
        if (state !== 'granted') return false;
        return handle.getFileHandle(fileName, {create:true}).then(function(fileHandle) {
          return fileHandle.createWritable().then(function(writable) {
            return writable.write(JSON.stringify(payload, null, 2)).then(function(){ return writable.close(); }).then(function(){ return true; });
          });
        });
      });
    }).catch(function(e) {
      console.warn('[Backup] 文件备份失败:', e && e.message);
      return false;
    });
  },

  scheduleAutoBackup(force) {
    var self = this;
    if (self._autoBackupTimer) clearTimeout(self._autoBackupTimer);
    self._autoBackupTimer = setTimeout(function(){ self.performAutoBackup(!!force); }, force ? 200 : 6000);
  },

  performAutoBackup(force) {
    var self = this;
    var now = Date.now();
    var minGap = 5 * 60 * 1000;
    if (!force && self._lastAutoBackupAt && now - self._lastAutoBackupAt < minGap) return Promise.resolve(false);
    self._lastAutoBackupAt = now;
    var payload = self.buildBackupPayload(false);
    var fileName = self.safeBackupFileName();
    return self.saveInternalBackup(payload).then(function(row) {
      return self.writeBackupFile(payload, fileName).then(function(fileOk) {
        self._lastAutoBackupInfo = {
          at: Date.now(),
          atText: new Date().toISOString(),
          internal: !!row,
          file: !!fileOk,
          fileName: fileName
        };
        return self._lastAutoBackupInfo;
      });
    });
  },



  loadChapterShard(workId, chapterIdx) {
    var self = this;
    return self.openAppMemoryDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction([self._chapterStore], 'readonly');
        var req = tx.objectStore(self._chapterStore).get(workId + '::' + chapterIdx);
        req.onsuccess = function(){ resolve(req.result || null); };
        req.onerror = function(){ reject(req.error || new Error('读取章节分片失败')); };
      });
    }).catch(function(){ return null; });
  },

  listChapterHistory(workId, chapterIdx) {
    var self = this, key = workId + '::' + chapterIdx;
    return self.openAppMemoryDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction([self._historyStore], 'readonly');
        var req = tx.objectStore(self._historyStore).getAll();
        req.onsuccess = function(){
          var rows = (req.result || []).filter(function(r){ return r.chapterKey === key; });
          rows.sort(function(a,b){ return (b.createdAt||0) - (a.createdAt||0); });
          resolve(rows);
        };
        req.onerror = function(){ reject(req.error || new Error('读取章节历史失败')); };
      });
    }).catch(function(){ return []; });
  },

  restoreChapterHistory(historyId) {
    var self = this;
    return self.openAppMemoryDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction([self._historyStore], 'readonly');
        var req = tx.objectStore(self._historyStore).get(historyId);
        req.onsuccess = function(){ resolve(req.result || null); };
        req.onerror = function(){ reject(req.error || new Error('读取历史版本失败')); };
      });
    }).then(function(row){
      if (!row) throw new Error('历史版本不存在');
      var w = (self.works || []).find(function(x){ return x.id === row.workId; });
      if (!w) throw new Error('作品不存在');
      if (!w.chapters) w.chapters = [];
      if (!w.chapters[row.chapterIdx]) w.chapters[row.chapterIdx] = {title:row.title || ('第'+(row.chapterIdx+1)+'章'), content:''};
      w.chapters[row.chapterIdx].title = row.title || w.chapters[row.chapterIdx].title;
      w.chapters[row.chapterIdx].content = row.content || '';
      w.chapters[row.chapterIdx]._slim = false;
      self.saveWork(w);
      return row;
    });
  },

  safeSlimCurrentWork(keepRecent) {
    var self = this, w = self.getWork();
    keepRecent = keepRecent || 5;
    if (!w) return Promise.reject(new Error('请先选择作品'));
    if (!Array.isArray(w.chapters)) return Promise.resolve({slimmed:0});
    return self.saveWorkChapterShards(w).then(function(){
      var maxKeepStart = Math.max(0, w.chapters.length - keepRecent);
      var slimmed = 0, savedChars = 0;
      w.chapters.forEach(function(ch, idx){
        if (!ch) return;
        if (idx >= maxKeepStart) return;
        if (ch.content && ch.content.length > 0) {
          savedChars += ch.content.length;
          ch._shardId = w.id + '::' + idx;
          ch._slim = true;
          ch.wordCount = ch.content.length;
          ch.content = '';
          slimmed++;
        }
      });
      if (!w._slimMeta) w._slimMeta = {};
      w._slimMeta.enabled = true;
      w._slimMeta.keepRecent = keepRecent;
      w._slimMeta.lastSlimAt = Date.now();
      self.saveWork(w);
      return {slimmed:slimmed, savedChars:savedChars};
    });
  },

  exportCurrentWorkBackup() {
    var w = this.getWork();
    if (!w) { if (window.showToast) window.showToast('请先选择作品'); return; }
    var payload = {_version:44, backupType:'single-work', exportedAt:new Date().toISOString(), work:w};
    var blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (w.title || '未命名作品').replace(/[\\/:*?"<>|]/g, '_') + '_单本备份.json';
    a.click();
    URL.revokeObjectURL(url);
    if (window.showToast) window.showToast('✅ 单本备份已导出');
  },

  importSingleWorkBackup(jsonStr) {
    var data = JSON.parse(jsonStr);
    var w = data.work || (data.works && data.works[0]);
    if (!w || !w.id) throw new Error('文件里没有作品数据');
    w.id = 'w_' + Date.now() + '_' + Math.floor(Math.random()*1000);
    w.title = (w.title || '恢复作品') + '（恢复）';
    this.ensureWorkFingerprint(w);
    this.works.push(w);
    this.saveWork(w);
    try { localStorage.setItem('last_edit_work', w.id); } catch(e) {}
    return w;
  },

  buildForeshadowBoard() {
    var out = [];
    (this.works || []).forEach(function(w){
      var lm = w.longMemory || {};
      (lm.foreshadowLedger || []).forEach(function(f){ out.push({work:w.title||'未命名', text:f.text || f.line || '', status:f.status || '未解', chapter:f.chapterIdx}); });
      ((lm.memoryAnchors && lm.memoryAnchors.hooks) || []).forEach(function(f){ out.push({work:w.title||'未命名', text:f.text || '', status:f.status || '未解', chapter:f.chapterIdx}); });
    });
    return out.slice(-120).reverse();
  },

  buildCharacterBoard() {
    var out = [];
    (this.works || []).forEach(function(w){
      var lm = w.longMemory || {};
      Object.keys(lm.characterProfiles || {}).forEach(function(name){
        var p = lm.characterProfiles[name] || {};
        out.push({work:w.title||'未命名', name:name, status:p.status || p.currentStatus || '', location:p.location || '', relationCount:(p.relationships||[]).length});
      });
      (lm.charStates || []).forEach(function(c){ out.push({work:w.title||'未命名', name:c.name, status:c.status||'', location:c.location||'', emotion:c.emotion||''}); });
    });
    return out.slice(-160).reverse();
  },

  buildTimelineBoard() {
    var out = [];
    (this.works || []).forEach(function(w){
      var lm = w.longMemory || {};
      (lm.timelineEvents || []).forEach(function(t){ out.push({work:w.title||'未命名', chapter:t.chapterIdx, time:t.time || '', text:t.text || ''}); });
      (lm.chapterIndex || []).forEach(function(t){ if (t.summary) out.push({work:w.title||'未命名', chapter:t.chapterIdx, time:'', text:t.summary}); });
    });
    return out.slice(-160).reverse();
  },

  getChapterHistoryCount() {
    var self = this;
    return self.openAppMemoryDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction([self._historyStore], 'readonly');
        var req = tx.objectStore(self._historyStore).count();
        req.onsuccess = function(){ resolve(req.result || 0); };
        req.onerror = function(){ reject(req.error || new Error('统计章节历史失败')); };
      });
    }).catch(function(){ return 0; });
  },

  buildSlimHealthReport() {
    var works = this.works || [];
    var totalContent = 0, chapters = 0, biggest = null;
    works.forEach(function(w){
      var wc = 0;
      (w.chapters || []).forEach(function(ch){
        chapters++;
        var n = (ch.content || '').length;
        totalContent += n; wc += n;
      });
      if (!biggest || wc > biggest.words) biggest = {title:w.title || '未命名', words:wc, id:w.id};
    });
    var jsonSize = 0;
    try { jsonSize = JSON.stringify({works:works}).length; } catch(e) {}
    return {
      works: works.length,
      chapters: chapters,
      contentWords: totalContent,
      contentMB: (totalContent * 2 / 1024 / 1024).toFixed(2),
      jsonMB: (jsonSize / 1024 / 1024).toFixed(2),
      biggest: biggest,
      advice: totalContent > 1000000 ? '建议下一步启用破坏性正文瘦身：大JSON只留索引，正文只读分片。' : '当前无需破坏性瘦身，保持兼容模式更安全。'
    };
  },

  buildGlobalHealthReport() {
    var works = this.works || [];
    var report = {works:works.length, chapters:0, words:0, issues:[], memories:0};
    works.forEach(function(w){
      var wWords = 0;
      (w.chapters || []).forEach(function(ch){ report.chapters++; wWords += (ch.content || '').length; });
      report.words += wWords;
      if (!w.world) report.issues.push((w.title||'未命名') + '：缺世界观');
      if (!w.chars) report.issues.push((w.title||'未命名') + '：缺人物人设');
      if (!w.outline) report.issues.push((w.title||'未命名') + '：缺大纲');
      if (!w.detail) report.issues.push((w.title||'未命名') + '：缺细纲');
      if (wWords > 500000 && (!w.longMemory || !w.longMemory.chapterIndex || w.longMemory.chapterIndex.length < 10)) report.issues.push((w.title||'未命名') + '：长篇记忆索引偏少');
      var lm = w.longMemory || {};
      if (lm.chapterIndex) report.memories += lm.chapterIndex.length;
      if (lm.foreshadowLedger) report.memories += lm.foreshadowLedger.length;
      if (lm.characterProfiles) report.memories += Object.keys(lm.characterProfiles).length;
    });
    report.score = Math.max(0, 100 - Math.min(80, report.issues.length * 6));
    return report;
  },

  searchAllWorks(keyword) {
    keyword = String(keyword || '').trim();
    if (!keyword) return [];
    var out = [];
    (this.works || []).forEach(function(w){
      ['world','chars','outline','detail'].forEach(function(k){
        var txt = w[k] || '';
        var idx = txt.indexOf(keyword);
        if (idx >= 0) out.push({work:w.title||'未命名', type:k, chapter:'', text:txt.slice(Math.max(0, idx-40), idx+80)});
      });
      (w.chapters || []).forEach(function(ch, i){
        var txt = ch.content || '';
        var idx = txt.indexOf(keyword);
        if (idx >= 0) out.push({work:w.title||'未命名', type:'正文', chapter:(ch.title || ('第'+(i+1)+'章')), text:txt.slice(Math.max(0, idx-40), idx+100)});
      });
    });
    return out.slice(0, 80);
  },

  exportCurrentWorkTxt() {
    var w = this.getWork();
    if (!w) { if (window.showToast) window.showToast('请先选择作品'); return; }
    var txt = (w.title || '未命名作品') + '\\n\\n';
    (w.chapters || []).forEach(function(ch, i){
      txt += (ch.title || ('第' + (i+1) + '章')) + '\\n\\n' + (ch.content || '') + '\\n\\n';
    });
    var blob = new Blob([txt], {type:'text/plain;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (w.title || '未命名作品').replace(/[\\\\/:*?"<>|]/g, '_') + '_全文.txt';
    a.click();
    URL.revokeObjectURL(url);
    if (window.showToast) window.showToast('✅ 当前作品TXT已导出');
  },

  getBackupStatus() {
    var self = this;
    return Promise.all([self.listInternalBackups(), self.loadBackupDirectoryHandle(), self.getChapterHistoryCount ? self.getChapterHistoryCount() : Promise.resolve(0)]).then(function(res) {
      return {
        internalCount: (res[0] || []).length,
        latest: (res[0] || [])[0] || null,
        hasDirectory: !!res[1],
        supportDirectory: !!window.showDirectoryPicker,
        lastAutoBackup: self._lastAutoBackupInfo || null,
        chapterHistoryCount: res[2] || 0
      };
    });
  },

  restoreFromAppMemoryMirror() {
    var self = this;
    return self.loadAppMemoryMirror().then(function(data) {
      if (!data || !Array.isArray(data.works)) throw new Error('没有可恢复的App记忆镜像');
      self.works = data.works || [];
      self.apiConfig = data.apiConfig || self.apiConfig;
      self.apiKeys = data.apiKeys || {};
      self.settings = data.settings || self.settings;
      self._trash = Array.isArray(data._trash) ? data._trash : [];
      try { self.ensureAllFingerprints(); } catch(fpErr) {}
      try {
        localStorage.setItem('wxbj_data_v4', JSON.stringify({
          _version: 44,
          works: self.works,
          apiConfig: self.apiConfig,
          apiKeys: self.apiKeys,
          settings: self.settings,
          _trash: self._trash || []
        }));
      } catch(e) {}
      return data;
    });
  },

  getAppMemoryReport() {
    var self = this;
    var localSize = 0;
    try {
      var v = localStorage.getItem('wxbj_data_v4') || '';
      localSize = v.length;
    } catch(e) {}
    var works = self.works || [];
    var chapterCount = 0, wordCount = 0, memoryCount = 0;
    works.forEach(function(w) {
      (w.chapters || []).forEach(function(ch) {
        chapterCount++;
        wordCount += (ch.content || '').length;
      });
      var lm = w.longMemory || {};
      if (lm.chapterIndex) memoryCount += lm.chapterIndex.length;
      if (lm.foreshadowLedger) memoryCount += lm.foreshadowLedger.length;
      if (lm.timelineEvents) memoryCount += lm.timelineEvents.length;
      if (lm.characterProfiles) memoryCount += Object.keys(lm.characterProfiles).length;
      if (lm.volumeMemories) memoryCount += lm.volumeMemories.length;
    });
    return Promise.all([self.loadAppMemoryMirror().catch(function(){return null;}), self.getChapterShardCount ? self.getChapterShardCount() : Promise.resolve(0)]).then(function(res) {
      var mirror = res[0], shardCount = res[1] || 0;
      return {
        localSize: localSize,
        localMB: (localSize / 1024 / 1024).toFixed(2),
        works: works.length,
        chapters: chapterCount,
        words: wordCount,
        memoryItems: memoryCount,
        mirror: !!mirror,
        mirrorSavedAt: mirror ? mirror.savedAtText : '',
        mirrorWorks: mirror && mirror.works ? mirror.works.length : 0,
        chapterShards: shardCount,
        autoMaintenance: self.getAutoMaintenanceStatus ? self.getAutoMaintenanceStatus() : {enabled:false,pending:0,lastFlushAt:0}
      };
    }).catch(function() {
      return {
        localSize: localSize,
        localMB: (localSize / 1024 / 1024).toFixed(2),
        works: works.length,
        chapters: chapterCount,
        words: wordCount,
        memoryItems: memoryCount,
        mirror: false,
        mirrorSavedAt: '',
        mirrorWorks: 0,
        chapterShards: 0,
        autoMaintenance: self.getAutoMaintenanceStatus ? self.getAutoMaintenanceStatus() : {enabled:false,pending:0,lastFlushAt:0}
      };
    });
  },

  // 检查是否有任何API Key
  hasAnyKey() {
    return Object.values(this.apiKeys).some(k => k && k.length > 0);
  },

  // 立即保存（返回 true/false，失败时提示用户）
  saveImmediate(notifyFail) {
    try {
      var json = JSON.stringify({
        _version: 44,
        works: this.works,
        apiConfig: this.apiConfig,
        apiKeys: this.apiKeys,
        settings: this.settings,
        _trash: this._trash || []
      });
      // 预检查大小 — 超过2MB时自动启动存储拆分（降低阈值，提前预防溢出）
      if (json.length > 2 * 1024 * 1024) {
        if (typeof window.showToast === 'function') {
          window.showToast('📦 数据较大('+(json.length/1024/1024).toFixed(1)+'MB)，正在优化存储…', 3000);
        }
        // 自动拆分：将各作品的重量级字段存入独立key
        try { this._autoSplitWorks(); } catch(splitErr) { console.warn('[Split] 拆分失败:', splitErr); }
        // 重算轻量化后的JSON
        json = JSON.stringify({
          _version: 44,
          _split: true,
          works: this._makeLightWorks(),
          apiConfig: this.apiConfig,
          apiKeys: this.apiKeys,
          settings: this.settings,
          _trash: this._trash || []
        });
        // 拆分后仍超大，提示用户
        if (json.length > 3.5 * 1024 * 1024) {
          if (typeof window.showToast === 'function') {
            window.showToast('⚠️ 数据接近存储上限('+(json.length/1024/1024).toFixed(1)+'MB)，建议导出备份！', 5000);
          }
        }
      }
      localStorage.setItem('wxbj_data_v4', json);
      // v36/v37：App级大容量镜像 + 章节正文分片，异步写入，不阻塞页面
      try { this.saveAppMemoryMirror(json); } catch(mirrorErr) {}
      try { this.saveAllChapterShards(); } catch(shardErr) {}
      try { this.scheduleAutoBackup(false); } catch(backupErr) {}
      // 自动云端同步：本地保存成功后，延迟3秒推送到云端（防抖）
      try {
        var _cloud = window.cloud;
        if (_cloud && _cloud.isLoggedIn() && !_cloud._pushTimer) {
          _cloud._pushTimer = setTimeout(function() {
            _cloud._pushTimer = null;
            _cloud.smartSync().catch(function(){});
          }, 3000);
        }
      } catch(cloudErr) {}
      return true;
    } catch (e) {
      console.error('DB保存失败:', e);
      // v36：localStorage 超限时仍尝试写入 AppMemory 大容量镜像
      try {
        var jsonFallback = JSON.stringify({
          _version: 44,
          works: this.works,
          apiConfig: this.apiConfig,
          apiKeys: this.apiKeys,
          settings: this.settings,
          _trash: this._trash || []
        });
        this.saveAppMemoryMirror(jsonFallback).then(function(ok){
          try { DB.saveAllChapterShards(); } catch(shardErr) {}
          if (ok && typeof window.showToast === 'function') window.showToast('✅ 已写入App级大容量记忆镜像和章节分片');
        });
      } catch(mirrorErr) {}
      if (notifyFail !== false && typeof window.showToast === 'function') {
        window.showToast('⚠️ 存储空间不足！正在自动导出数据...', 4000);
        // 超限时自动触发导出
        try { this.exportAll(); } catch(expErr) {}
      }
      return false;
    }
  },

  // === 存储拆分：将作品重量级字段存入独立 localStorage key ===
  _SPLIT_KEY_PREFIX: 'wxbj_w_',
  _SPLIT_SUBKEYS: ['world', 'chars', 'outline', 'detail', 'memory', 'longMemory', 'archStatus'],

  _autoSplitWorks() {
    var self = this;
    var works = self.works || [];
    var existingKeys = [];
    var newKeys = [];
    // 先收集当前已有的所有拆分key
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(self._SPLIT_KEY_PREFIX) === 0) existingKeys.push(k);
      }
    } catch(e) {}
    // 逐个写入作品重量级字段（每个子字段独立key），同时记录成功写入的key
    works.forEach(function(w) {
      if (!w || !w.id) return;
      // 元数据key（轻量，始终保留）
      var meta = {
        id: w.id,
        title: w.title || '',
        savedAt: Date.now()
      };
      try {
        localStorage.setItem(self._SPLIT_KEY_PREFIX + w.id, JSON.stringify(meta));
        newKeys.push(self._SPLIT_KEY_PREFIX + w.id);
      } catch(splitErr) {
        console.warn('[Split] 作品 ' + w.id + ' 元数据拆分失败:', splitErr && splitErr.message);
      }
      // 每个子字段独立存储
      self._SPLIT_SUBKEYS.forEach(function(subKey) {
        var val = w[subKey];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) return;
        var subKeyName = self._SPLIT_KEY_PREFIX + w.id + '_' + subKey;
        try {
          var jsonStr = JSON.stringify(val);
          // 单个子字段超过800KB时压缩（截断detail等大字段）
          if (jsonStr.length > 800 * 1024) {
            if (subKey === 'detail') {
              var detailStr = typeof val === 'string' ? val : JSON.stringify(val);
              val = '...(前略)\n' + detailStr.slice(detailStr.length - 600 * 1024);
              jsonStr = JSON.stringify(val);
            } else if (subKey === 'longMemory') {
              val = self._compressLongMemoryForStorage(val);
              jsonStr = JSON.stringify(val);
            } else if (subKey === 'memory') {
              val = val.slice(-100);
              jsonStr = JSON.stringify(val);
            }
          }
          localStorage.setItem(subKeyName, jsonStr);
          newKeys.push(subKeyName);
        } catch(subErr) {
          console.warn('[Split] 作品 ' + w.id + ' 子字段 ' + subKey + ' 拆分失败:', subErr && subErr.message);
          // 子字段存储失败时尝试压缩后重试
          if (subKey === 'longMemory') {
            try {
              var compressed = self._compressLongMemoryForStorage(val, true);
              localStorage.setItem(subKeyName, JSON.stringify(compressed));
              newKeys.push(subKeyName);
            } catch(retryErr) {
              console.warn('[Split] 重试也失败:', retryErr && retryErr.message);
              // 写入失败则保留旧数据：确保该key不会被清理
              if (existingKeys.indexOf(subKeyName) >= 0) newKeys.push(subKeyName);
            }
          } else {
            // 写入失败则保留旧数据：确保该key不会被清理
            if (existingKeys.indexOf(subKeyName) >= 0) newKeys.push(subKeyName);
          }
        }
      });
    });
    // 仅清理已不存在的作品的旧key（即不在newKeys中的key），避免误删写入失败字段的旧数据
    existingKeys.forEach(function(oldKey) {
      if (newKeys.indexOf(oldKey) < 0) {
        try { localStorage.removeItem(oldKey); } catch(e) {}
      }
    });
  },

  _makeLightWorks() {
    var works = this.works || [];
    return works.map(function(w) {
      if (!w) return null;
      var chapterCount = (w.chapters && w.chapters.length) || 0;
      var wordCount = 0;
      if (w.chapters) {
        w.chapters.forEach(function(ch) {
          wordCount += (ch && ch.content ? ch.content.length : 0);
        });
      }
      return {
        id: w.id,
        title: w.title || '',
        desc: w.desc || '',
        category: w.category || {},
        created: w.created || '',
        _fingerprint: w._fingerprint || '',
        _platform: w._platform || '',
        genre: w.genre || '',
        chapterCount: chapterCount,
        wordCount: wordCount,
        chapters: (w.chapters || []).map(function(ch, i) {
          return {
            title: (ch && ch.title) || ('第' + (i + 1) + '章'),
            _slim: (ch && ch._slim) || false,
            _shardId: (ch && ch._shardId) || '',
            wordCount: (ch && ch.content ? ch.content.length : 0),
            confirmed: (ch && ch.confirmed) || false
          };
        }),
        settings: w.settings || {},
        _slimMeta: w._slimMeta || {}
      };
    }).filter(Boolean);
  },

  _stitchHeavyWork(lightWork) {
    if (!lightWork || !lightWork.id) return lightWork;
    var self = this;
    try {
      // 先尝试从子字段key读取（新格式）
      var hasAnySubKey = false;
      self._SPLIT_SUBKEYS.forEach(function(subKey) {
        try {
          var subStr = localStorage.getItem(self._SPLIT_KEY_PREFIX + lightWork.id + '_' + subKey);
          if (subStr) {
            lightWork[subKey] = JSON.parse(subStr);
            hasAnySubKey = true;
          }
        } catch(e) {}
      });
      // 兼容旧格式：如果没找到子字段key，从主key读取
      if (!hasAnySubKey) {
        var heavyStr = localStorage.getItem(self._SPLIT_KEY_PREFIX + lightWork.id);
        if (heavyStr) {
          var heavy = JSON.parse(heavyStr);
          // 旧格式：所有字段在一个key里
          if (heavy.world !== undefined) lightWork.world = heavy.world || '';
          if (heavy.chars !== undefined) lightWork.chars = heavy.chars || '';
          if (heavy.outline !== undefined) lightWork.outline = heavy.outline || '';
          if (heavy.detail !== undefined) lightWork.detail = heavy.detail || '';
          if (heavy.memory !== undefined) lightWork.memory = heavy.memory || [];
          if (heavy.longMemory !== undefined) lightWork.longMemory = heavy.longMemory || {};
          if (heavy.archStatus !== undefined) lightWork.archStatus = heavy.archStatus || {};
        }
      }
      // 确保 longMemory 结构完整
      if (!lightWork.longMemory) lightWork.longMemory = {};
      var lm = lightWork.longMemory;
      if (!lm.memoryAnchors) lm.memoryAnchors = {core:[],characterTags:[],relationships:[],items:[],locations:[],promises:[],timeline:[],hooks:[]};
      if (!Array.isArray(lm.chapterIndex)) lm.chapterIndex = [];
      if (!lm.characterHistory) lm.characterHistory = {};
      if (!lm.rollingSummary) lm.rollingSummary = '';
      if (!Array.isArray(lm.memoryDebt)) lm.memoryDebt = [];
      if (!lm.lifecycle) lm.lifecycle = {lastCompressedAt:-1,lastRebuildAt:0};
      if (!lightWork.archStatus) lightWork.archStatus = { world: 'pending', chars: 'locked', outline: 'locked', detail: 'locked' };
      // 如果lightWork没有chapters内容，保留元数据
      if (lightWork.chapters && lightWork.chapters.length > 0 && typeof lightWork.chapters[0].content === 'undefined') {
        // chapters是轻量化的，需要从IndexedDB懒加载
        // 保持轻量格式，章节内容在write.html中自动加载
      }
      return lightWork;
    } catch(e) {
      console.warn('[Stitch] 作品 ' + lightWork.id + ' 合并失败:', e && e.message);
      return lightWork;
    }
  },

  // 压缩longMemory以适应存储限制（支撑1000章+）
  _compressLongMemoryForStorage(lm, aggressive) {
    if (!lm || typeof lm !== 'object') return lm;
    lm = JSON.parse(JSON.stringify(lm)); // 深拷贝
    var factor = aggressive ? 0.3 : 0.55;
    // characterProfiles: 每个角色的milestones/relationships/items截断
    if (lm.characterProfiles) {
      var names = Object.keys(lm.characterProfiles);
      // 超过80个角色时，只保留最近出现的40个
      if (names.length > 80) {
        var sorted = names.sort(function(a,b){
          return (lm.characterProfiles[b].lastSeen||0) - (lm.characterProfiles[a].lastSeen||0);
        });
        var toRemove = sorted.slice(40);
        toRemove.forEach(function(n){ delete lm.characterProfiles[n]; });
      }
      Object.keys(lm.characterProfiles).forEach(function(name){
        var p = lm.characterProfiles[name];
        if (p.milestones && p.milestones.length > 12) p.milestones = p.milestones.slice(-12);
        if (p.relationships && p.relationships.length > 8) p.relationships = p.relationships.slice(-8);
        if (p.items && p.items.length > 6) p.items = p.items.slice(-6);
      });
    }
    // factionGraph: events截断，超过30个势力时只保留20个
    if (lm.factionGraph) {
      var fNames = Object.keys(lm.factionGraph);
      if (fNames.length > 30) {
        fNames.sort(function(a,b){
          return (lm.factionGraph[b].events||[]).length - (lm.factionGraph[a].events||[]).length;
        });
        fNames.slice(20).forEach(function(n){ delete lm.factionGraph[n]; });
      }
      Object.keys(lm.factionGraph).forEach(function(name){
        var f = lm.factionGraph[name];
        if (f.events && f.events.length > 12) f.events = f.events.slice(-12);
        if (f.allies && f.allies.length > 4) f.allies = f.allies.slice(-4);
        if (f.enemies && f.enemies.length > 4) f.enemies = f.enemies.slice(-4);
      });
    }
    // timelineEvents截断
    if (lm.timelineEvents && lm.timelineEvents.length > 200) lm.timelineEvents = lm.timelineEvents.slice(-200);
    // foreshadowLedger截断
    if (lm.foreshadowLedger && lm.foreshadowLedger.length > 150) lm.foreshadowLedger = lm.foreshadowLedger.slice(-150);
    // itemLedger: history截断，超过40个道具时只保留25个
    if (lm.itemLedger) {
      var iNames = Object.keys(lm.itemLedger);
      if (iNames.length > 40) {
        iNames.sort(function(a,b){
          return (lm.itemLedger[b].lastChapter||0) - (lm.itemLedger[a].lastChapter||0);
        });
        iNames.slice(25).forEach(function(n){ delete lm.itemLedger[n]; });
      }
      Object.keys(lm.itemLedger).forEach(function(name){
        var it = lm.itemLedger[name];
        if (it.history && it.history.length > 10) it.history = it.history.slice(-10);
      });
    }
    // chapterIndex截断（支撑3000章）
    if (lm.chapterIndex && lm.chapterIndex.length > 600) lm.chapterIndex = lm.chapterIndex.slice(-600);
    // volumeMemories: summary截断
    if (lm.volumeMemories) {
      if (lm.volumeMemories.length > 60) lm.volumeMemories = lm.volumeMemories.slice(-60);
      lm.volumeMemories.forEach(function(v){
        if (v.summary && v.summary.length > 500) v.summary = v.summary.slice(-500);
        if (v.events && v.events.length > 6) v.events = v.events.slice(-6);
        if (v.openThreads && v.openThreads.length > 6) v.openThreads = v.openThreads.slice(-6);
      });
    }
    // rollingSummary截断（5层）
    if (lm.rollingSummary) {
      if (typeof lm.rollingSummary === 'object') {
        if (lm.rollingSummary.recent && lm.rollingSummary.recent.length > 1200) lm.rollingSummary.recent = lm.rollingSummary.recent.slice(-1200);
        if (lm.rollingSummary.milestones && lm.rollingSummary.milestones.length > 700) lm.rollingSummary.milestones = lm.rollingSummary.milestones.slice(0, 700);
        if (lm.rollingSummary.eras && lm.rollingSummary.eras.length > 400) lm.rollingSummary.eras = lm.rollingSummary.eras.slice(0, 400);
        if (lm.rollingSummary.ultraEras && lm.rollingSummary.ultraEras.length > 250) lm.rollingSummary.ultraEras = lm.rollingSummary.ultraEras.slice(0, 250);
        if (lm.rollingSummary.megaEras && lm.rollingSummary.megaEras.length > 200) lm.rollingSummary.megaEras = lm.rollingSummary.megaEras.slice(0, 200);
      }
    }
    // memoryAnchors截断
    if (lm.memoryAnchors) {
      Object.keys(lm.memoryAnchors).forEach(function(k){
        if (Array.isArray(lm.memoryAnchors[k]) && lm.memoryAnchors[k].length > 50) {
          lm.memoryAnchors[k] = lm.memoryAnchors[k].slice(-50);
        }
      });
    }
    // characterHistory截断
    if (lm.characterHistory) {
      var chNames = Object.keys(lm.characterHistory);
      if (chNames.length > 60) {
        chNames.sort(function(a,b){
          var la = (lm.characterHistory[a]||[]).length ? lm.characterHistory[a][lm.characterHistory[a].length-1].chapterIdx : 0;
          var lb = (lm.characterHistory[b]||[]).length ? lm.characterHistory[b][lm.characterHistory[b].length-1].chapterIdx : 0;
          return lb - la;
        });
        chNames.slice(40).forEach(function(n){ delete lm.characterHistory[n]; });
      }
      Object.keys(lm.characterHistory).forEach(function(name){
        if (Array.isArray(lm.characterHistory[name]) && lm.characterHistory[name].length > 25) {
          lm.characterHistory[name] = lm.characterHistory[name].slice(-25);
        }
      });
    }
    // charStates截断
    if (lm.charStates && lm.charStates.length > 40) lm.charStates = lm.charStates.slice(-40);
    // plotThreads截断
    if (lm.plotThreads && lm.plotThreads.length > 40) lm.plotThreads = lm.plotThreads.slice(-40);
    // foreshadows截断
    if (lm.foreshadows && lm.foreshadows.length > 40) lm.foreshadows = lm.foreshadows.slice(-40);
    // charArcs截断
    if (lm.charArcs && lm.charArcs.length > 25) lm.charArcs = lm.charArcs.slice(-25);
    // memoryDebt截断
    if (lm.memoryDebt && lm.memoryDebt.length > 15) lm.memoryDebt = lm.memoryDebt.slice(-15);
    // _anchorDigest截断
    if (lm._anchorDigest) {
      Object.keys(lm._anchorDigest).forEach(function(k){
        if (Array.isArray(lm._anchorDigest[k]) && lm._anchorDigest[k].length > 4) {
          lm._anchorDigest[k] = lm._anchorDigest[k].slice(-4);
        }
      });
    }
    return lm;
  },


  // 节流保存：800ms 内多次调用合并为一次（避免高频写入 4MB JSON）
  save(notifyFail) {
    var self = this;
    if (self._saveTimer) clearTimeout(self._saveTimer);
    self._savePending = true;
    self._saveTimer = setTimeout(function() {
      self._savePending = false;
      self.saveImmediate(notifyFail);
    }, 800);
    return true;
  },

  // 强制立即落盘（页面关闭/导出前调用）
  flush() {
    if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
    this._savePending = false;
    return this.saveImmediate(false);
  },

  // 回收站：列出已删除作品（30 天内可恢复）
  listTrash() {
    this._trash = this._trash || [];
    var now = Date.now();
    // 自动清理 30 天以上
    this._trash = this._trash.filter(function(t) { return (now - (t.deletedAt || 0)) < 30*24*3600*1000; });
    return this._trash;
  },

  // 从回收站恢复
  restoreFromTrash(id) {
    this._trash = this._trash || [];
    var idx = this._trash.findIndex(function(t) { return t.work && t.work.id === id; });
    if (idx < 0) return false;
    var w = this._trash[idx].work;
    this._trash.splice(idx, 1);
    if (!this.works.find(function(x) { return x.id === w.id; })) this.works.push(w);
    this.flush();
    return true;
  },

  // 永久清空回收站
  emptyTrash() {
    this._trash = [];
    this.flush();
  },

  // 一键导出全部作品为JSON文件（不含API密钥）
  exportAll(silent) {
    var exportData = {
      _version: 44,
      exportedAt: new Date().toISOString(),
      works: this.works,
      settings: this.settings
    };
    var json = JSON.stringify(exportData, null, 2);
    var blob = new Blob([json], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '文心笔匠_备份_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    if (!silent && typeof window.showToast === 'function') {
      window.showToast('✅ 导出成功！共' + this.works.length + '部作品');
    }
  },

  // 从JSON文件导入作品（合并模式：不覆盖已有ID相同的作品；严格校验）
  importFromJSON(jsonStr) {
    try {
      if (!jsonStr || jsonStr.length > 50 * 1024 * 1024) {
        throw new Error('文件过大或为空（限制 50MB）');
      }
      var data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') throw new Error('文件不是有效 JSON');
      if (!data.works || !Array.isArray(data.works)) throw new Error('文件格式不正确，缺少 works 数组');
      // 版本校验：未来版本可能不兼容
      if (data._version && data._version > window.APP_DATA_VERSION) {
        if (typeof window.showToast === 'function') {
          window.showToast('⚠️ 备份版本(v'+data._version+')较新（当前 v'+window.APP_DATA_VERSION+'），可能不完全兼容', 3000);
        }
      }
      var imported = 0;
      var skipped = 0;
      var rejected = 0;
      for (var i = 0; i < data.works.length; i++) {
        var w = data.works[i];
        // 字段合法性
        if (!w || typeof w !== 'object' || !w.id || typeof w.id !== 'string') { rejected++; continue; }
        if (w.id.length > 100) { rejected++; continue; }
        if (typeof w.title !== 'string') w.title = '未命名';
        if (w.title.length > 200) w.title = w.title.slice(0, 200);
        // 危险字段过滤（不允许导入脚本/原型链污染）
        delete w.__proto__; delete w.constructor; delete w.prototype;
        var exists = this.works.find(function(x) { return x.id === w.id; });
        if (exists) { skipped++; continue; }
        // 字段补全
        if (!w.longMemory) w.longMemory = {charStates:[], plotThreads:[], foreshadows:[], charArcs:[], memoryAnchors:{core:[],characterTags:[],relationships:[],items:[],locations:[],promises:[],timeline:[],hooks:[]}, chapterIndex:[], characterHistory:{}, rollingSummary:'', memoryDebt:[], lifecycle:{lastCompressedAt:-1,lastRebuildAt:0}, volumeMemories:[], characterProfiles:{}, foreshadowLedger:[], itemLedger:{}, factionGraph:{}, timelineEvents:[], ultraMeta:{volumeSize:50,lastUltraUpdateAt:-1}, chainConsistency:[]};
        if (!w.longMemory.memoryAnchors) w.longMemory.memoryAnchors = {core:[],characterTags:[],relationships:[],items:[],locations:[],promises:[],timeline:[],hooks:[]};
        if (!Array.isArray(w.longMemory.chapterIndex)) w.longMemory.chapterIndex = [];
        if (!w.longMemory.characterHistory) w.longMemory.characterHistory = {};
        if (!w.longMemory.rollingSummary) w.longMemory.rollingSummary = '';
        if (!Array.isArray(w.longMemory.memoryDebt)) w.longMemory.memoryDebt = [];
        if (!w.longMemory.lifecycle) w.longMemory.lifecycle = {lastCompressedAt:-1,lastRebuildAt:0};
        if (!w.settings) w.settings = {genre:'', concept:'', platform:'general'};
        if (!w.archStatus) w.archStatus = { world: 'pending', chars: 'locked', outline: 'locked', detail: 'locked' };
        if (!Array.isArray(w.chapters)) w.chapters = [];
        this.ensureWorkFingerprint(w);
        this.works.push(w);
        imported++;
      }
      this.flush();
      if (typeof window.showToast === 'function') {
        var msg = '✅ 导入' + imported + '部作品';
        if (skipped > 0) msg += '（跳过' + skipped + '部已存在的）';
        if (rejected > 0) msg += '（拒绝' + rejected + '部非法的）';
        window.showToast(msg, 3500);
      }
      return { imported: imported, skipped: skipped, rejected: rejected };
    } catch(e) {
      if (typeof window.showToast === 'function') {
        window.showToast('❌ 导入失败：' + e.message);
      }
      return { imported: 0, skipped: 0, error: e.message };
    }
  },

  // 获取当前作品
  getWork() {
    let id = null;
    try { id = localStorage.getItem('last_edit_work'); } catch(e) {}
    if (!id || !this.works) return null;
    return this.works.find(w => w.id === id) || this.works[0];
  },

  // 保存作品（本地编辑后标记为脏，递增版本号，等待云端同步）
  saveWork(work) {
    if (!this.validateWorkIsolation(work)) return false;
    this.ensureWorkFingerprint(work);
    const idx = this.works.findIndex(w => w.id === work.id);
    if (idx >= 0) {
      // 保留并递增_version（云端同步版本），确保每次编辑都能推送
      var oldVersion = this.works[idx]._version || 0;
      work._version = oldVersion + 1;
      work._dirty = true;
      this.works[idx] = work;
    } else {
      work._version = 1;
      work._dirty = true;
      this.works.push(work);
    }
    try { this.markWorkShardsDirty(work); } catch(shardErr) {}
    this.save();
    return true;
  },

  // 创建新作品
  createWork(title, desc, category) {
    // 确保ID绝对唯一（防止同一毫秒创建多个作品时冲突）
    var id;
    do {
      id = 'w_' + Date.now() + '_' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    } while (this.works.some(function(w) { return w.id === id; }));
    const work = {
      id: id,
      title: title || '未命名作品',
      desc: desc || '',
      category: category || {},
      world: '',
      chars: '',
      outline: '',
      detail: '',
      chapters: [],
      archStatus: { world: 'pending', chars: 'locked', outline: 'locked', detail: 'locked' },
      longMemory: {charStates:[], plotThreads:[], foreshadows:[], charArcs:[], memoryAnchors:{core:[],characterTags:[],relationships:[],items:[],locations:[],promises:[],timeline:[],hooks:[]}, chapterIndex:[], characterHistory:{}, rollingSummary:'', memoryDebt:[], lifecycle:{lastCompressedAt:-1,lastRebuildAt:0}, volumeMemories:[], characterProfiles:{}, foreshadowLedger:[], itemLedger:{}, factionGraph:{}, timelineEvents:[], ultraMeta:{volumeSize:50,lastUltraUpdateAt:-1}, chainConsistency:[]},
      settings: {genre:'', concept:'', platform:'general'},
      created: new Date().toISOString(),
      _version: 1,
      _dirty: true
    };
    this.ensureWorkFingerprint(work);
    this.works.push(work);
    this.save();
    try { localStorage.setItem('last_edit_work', work.id); } catch(e) {}
    return work;
  },

  // 删除作品（软删除：进入回收站，30 天可恢复）
  deleteWork(id) {
    var target = this.works.find(function(w) { return w.id === id; });
    this.works = this.works.filter(function(w) { return w.id !== id; });
    if (target) {
      this._trash = this._trash || [];
      // 单部作品体积 <2MB 才入回收站，避免回收站爆掉
      try {
        var size = JSON.stringify(target).length;
        if (size < 2 * 1024 * 1024) {
          this._trash.unshift({ work: target, deletedAt: Date.now() });
          // 最多保留 20 部
          if (this._trash.length > 20) this._trash = this._trash.slice(0, 20);
        }
      } catch(e) {}
    }
    this.flush();
  },

  // 物理删除（不入回收站，用于回收站清空）——同步时通知云端一并删除
  hardDeleteWork(id) {
    this.works = this.works.filter(function(w) { return w.id !== id; });
    // 记录到云端待删列表（如果已在 works/_trash 中有过，说明云端可能存在）
    this._cloudDeleteList = this._cloudDeleteList || [];
    if (this._cloudDeleteList.indexOf(id) < 0) {
      this._cloudDeleteList.push(id);
      // 最多保留 200 个（避免无限增长）
      if (this._cloudDeleteList.length > 200) this._cloudDeleteList = this._cloudDeleteList.slice(-200);
    }
    this.flush();
  },

  // 获取API配置
  getApiConfig() {
    return this.apiConfig;
  },

  // 保存API配置
  saveApiConfig(config) {
    this.apiConfig = config;
    this.save();
    this._cloudSyncKeysAndSettings();
  },

  // 立即触发云端 keys/settings 同步
  _cloudSyncKeysAndSettings() {
    try {
      var _cloud = window.cloud;
      if (_cloud && _cloud.isLoggedIn() && _cloud.syncKeysAndSettings) {
        _cloud.syncKeysAndSettings().catch(function(){});
      }
    } catch(e) {}
  },

  // 获取某个服务商的所有密钥
  getApiKeys(provider) {
    return this.apiKeys[provider] || [];
  },

  // 添加密钥（返回 true 表示新增，false 表示已存在）
  addApiKey(provider, key) {
    if (!key || !key.trim()) return false;
    const k = key.trim();
    if (!this.apiKeys[provider]) this.apiKeys[provider] = [];
    if (!this.apiKeys[provider].includes(k)) {
      this.apiKeys[provider].push(k);
      this.save();
      this._cloudSyncKeysAndSettings();
      return true;
    }
    return false;
  },

  // 批量添加密钥（返回 {added, duplicated} 统计）
  addApiKeys(provider, keys) {
    if (!keys || !keys.length) return { added: 0, duplicated: 0 };
    if (!this.apiKeys[provider]) this.apiKeys[provider] = [];
    let added = 0, dup = 0;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i] && keys[i].trim();
      if (!k) continue;
      if (!this.apiKeys[provider].includes(k)) {
        this.apiKeys[provider].push(k);
        added++;
      } else {
        dup++;
      }
    }
    if (added > 0) { this.save(); this._cloudSyncKeysAndSettings(); }
    return { added, duplicated: dup };
  },

  // 删除密钥
  removeApiKey(provider, index) {
    if (this.apiKeys[provider]) {
      this.apiKeys[provider].splice(index, 1);
      if (this.apiKeys[provider].length === 0) delete this.apiKeys[provider];
      this.save();
      this._cloudSyncKeysAndSettings();
    }
  },

  // 获取设置
  getSettings() {
    return this.settings;
  },

  // 保存设置
  saveSettings(settings) {
    this.settings = settings;
    this.save();
    this._cloudSyncKeysAndSettings();
  }
};

// 挂载到全局
window.DB = DB;

// 初始化
DB.init();
