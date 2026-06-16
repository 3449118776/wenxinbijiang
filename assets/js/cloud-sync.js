"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * 文心笔匠 云端同步模块 (v46)
 * 
 * 功能：
 * - 注册 / 登录 / 登出
 * - 手动同步：拉取云端作品 / 推送本地作品
 * - 自动同步：定时 + 章节保存后触发
 * - 冲突处理：版本号比较，不覆盖
 * 
 * 使用方式：
 *   window.cloud = new CloudSync({ apiBase: 'https://your-domain.com/api' });
 *   所有页面共用同一个实例，挂载在 window.cloud 上。
 */

(function () {
  function CloudSync(opts) {
    opts = opts || {};
    this.apiBase = (opts.apiBase || '').replace(/\/$/, '');
    this.token = null;
    this.user = null;
    this.autoSync = !!opts.autoSync;
    this.autoInterval = opts.autoInterval || 300000; // 5 分钟
    this._timer = null;
    this._loadToken();
  }
  CloudSync.prototype = {
    // ==================== 状态 ====================
    isLoggedIn: function isLoggedIn() {
      return !!(this.token && this.user);
    },
    // ==================== 认证 ====================
    _loadToken: function _loadToken() {
      try {
        this.token = localStorage.getItem('wxbj_cloud_token') || '';
      } catch (e) {
        this.token = '';
      }
      try {
        this.user = JSON.parse(localStorage.getItem('wxbj_cloud_user') || 'null');
      } catch (e) {
        this.user = null;
      }
    },
    _saveToken: function _saveToken(token, user) {
      this.token = token;
      this.user = user;
      try {
        localStorage.setItem('wxbj_cloud_token', token);
      } catch (e) {}
      try {
        localStorage.setItem('wxbj_cloud_user', JSON.stringify(user));
      } catch (e) {}
    },
    _clearToken: function _clearToken() {
      this.token = null;
      this.user = null;
      try {
        localStorage.removeItem('wxbj_cloud_token');
      } catch (e) {}
      try {
        localStorage.removeItem('wxbj_cloud_user');
      } catch (e) {}
    },
    register: function () {
      var _register = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(email, password, nickname) {
        var resp;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              _context.n = 1;
              return this._fetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                  email: email,
                  password: password,
                  nickname: nickname || ''
                })
              });
            case 1:
              resp = _context.v;
              if (!resp.error) {
                _context.n = 2;
                break;
              }
              throw new Error(resp.error);
            case 2:
              this._saveToken(resp.token, resp.user);
              return _context.a(2, resp);
          }
        }, _callee, this);
      }));
      function register(_x, _x2, _x3) {
        return _register.apply(this, arguments);
      }
      return register;
    }(),
    login: function () {
      var _login = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(email, password) {
        var resp;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              _context2.n = 1;
              return this._fetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                  email: email,
                  password: password
                })
              });
            case 1:
              resp = _context2.v;
              if (!resp.error) {
                _context2.n = 2;
                break;
              }
              throw new Error(resp.error);
            case 2:
              this._saveToken(resp.token, resp.user);
              return _context2.a(2, resp);
          }
        }, _callee2, this);
      }));
      function login(_x4, _x5) {
        return _login.apply(this, arguments);
      }
      return login;
    }(),
    logout: function logout() {
      this._clearToken();
    },
    // ==================== 同步 ====================

    /**
     * 拉取云端作品列表（轻量）
     */
    getWorks: function () {
      var _getWorks = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              return _context3.a(2, this._fetch('/works'));
          }
        }, _callee3, this);
      }));
      function getWorks() {
        return _getWorks.apply(this, arguments);
      }
      return getWorks;
    }(),
    /**
     * 拉取单个作品完整数据
     */
    getWork: function () {
      var _getWork = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(workId) {
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              return _context4.a(2, this._fetch('/works/' + encodeURIComponent(workId)));
          }
        }, _callee4, this);
      }));
      function getWork(_x6) {
        return _getWork.apply(this, arguments);
      }
      return getWork;
    }(),
    /**
     * 推送作品到云端（含冲突处理）
     * @param {Object} payload - 作品完整数据对象
     * @param {string} payload.workId - 客户端UUID
     * @param {number} payload.version - 本地版本号
     * @returns {Object} { status: 'created'|'updated'|'unchanged', version }
     */
    pushWork: function () {
      var _pushWork = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(payload) {
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              if (payload.workId) {
                _context5.n = 1;
                break;
              }
              throw new Error('缺少 workId');
            case 1:
              return _context5.a(2, this._fetch('/works/' + encodeURIComponent(payload.workId), {
                method: 'PUT',
                body: JSON.stringify(payload)
              }));
          }
        }, _callee5, this);
      }));
      function pushWork(_x7) {
        return _pushWork.apply(this, arguments);
      }
      return pushWork;
    }(),
    /**
     * 批量同步
     */
    pushBatch: function () {
      var _pushBatch = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(items, device) {
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              return _context6.a(2, this._fetch('/works/sync/batch', {
                method: 'POST',
                body: JSON.stringify({
                  items: items,
                  device: device || ''
                })
              }));
          }
        }, _callee6, this);
      }));
      function pushBatch(_x8, _x9) {
        return _pushBatch.apply(this, arguments);
      }
      return pushBatch;
    }(),
    /**
     * 删除云端作品
     */
    deleteWork: function () {
      var _deleteWork = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(workId) {
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.n) {
            case 0:
              return _context7.a(2, this._fetch('/works/' + encodeURIComponent(workId), {
                method: 'DELETE'
              }));
          }
        }, _callee7, this);
      }));
      function deleteWork(_x0) {
        return _deleteWork.apply(this, arguments);
      }
      return deleteWork;
    }(),
    // ==================== 快照 ====================

    getSnapshots: function () {
      var _getSnapshots = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(workId) {
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.n) {
            case 0:
              return _context8.a(2, this._fetch('/works/' + encodeURIComponent(workId) + '/snapshots'));
          }
        }, _callee8, this);
      }));
      function getSnapshots(_x1) {
        return _getSnapshots.apply(this, arguments);
      }
      return getSnapshots;
    }(),
    restoreSnapshot: function () {
      var _restoreSnapshot = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(workId, snapId) {
        return _regenerator().w(function (_context9) {
          while (1) switch (_context9.n) {
            case 0:
              return _context9.a(2, this._fetch('/works/' + encodeURIComponent(workId) + '/snapshots/' + snapId + '/restore', {
                method: 'POST'
              }));
          }
        }, _callee9, this);
      }));
      function restoreSnapshot(_x10, _x11) {
        return _restoreSnapshot.apply(this, arguments);
      }
      return restoreSnapshot;
    }(),
    // ==================== 智能同步 ====================

    /**
     * 智能双向同步：比较本地/云端版本，自动选择方向
     * 返回同步报告
     */
    smartSync: function () {
      var _smartSync = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
        var report, localWorks, cloudResp, cloudWorks, cloudMap, i, toPush, toPull, j, lw, localVersion, cloudVersion, k, cw, found, m, batchItems, batchResult, bi, br, bj, pi, pr, self, concurrency, batch, pullResults, ri, full, wid, existing, ei, newWork, _t, _t2, _t3;
        return _regenerator().w(function (_context0) {
          while (1) switch (_context0.p = _context0.n) {
            case 0:
              if (this.isLoggedIn()) {
                _context0.n = 1;
                break;
              }
              return _context0.a(2, {
                ok: false,
                error: '未登录'
              });
            case 1:
              report = {
                pushed: 0,
                pulled: 0,
                unchanged: 0,
                errors: 0
              };
              _context0.p = 2;
              // 1. 获取本地作品列表
              localWorks = [];
              try {
                if (DB && DB.works) localWorks = DB.works.slice();
              } catch (e) {}

              // 2. 获取云端作品列表
              _context0.n = 3;
              return this.getWorks();
            case 3:
              cloudResp = _context0.v;
              cloudWorks = cloudResp && cloudResp.works ? cloudResp.works : [];
              cloudMap = {};
              for (i = 0; i < cloudWorks.length; i++) {
                cloudMap[cloudWorks[i].workId] = cloudWorks[i];
              }

              // 3. 比较版本号，分组收集需要推送和拉取的作品
              toPush = [];
              toPull = [];
              j = 0;
            case 4:
              if (!(j < localWorks.length)) {
                _context0.n = 7;
                break;
              }
              lw = localWorks[j];
              if (lw.id) {
                _context0.n = 5;
                break;
              }
              return _context0.a(3, 6);
            case 5:
              localVersion = lw._version || 0;
              cloudVersion = cloudMap[lw.id] ? cloudMap[lw.id].version || 0 : 0;
              if (cloudVersion === 0 || localVersion > cloudVersion) {
                toPush.push(lw);
              } else if (cloudVersion > localVersion) {
                toPull.push(lw.id);
              } else {
                report.unchanged++;
              }
            case 6:
              j++;
              _context0.n = 4;
              break;
            case 7:
              k = 0;
            case 8:
              if (!(k < cloudWorks.length)) {
                _context0.n = 13;
                break;
              }
              cw = cloudWorks[k];
              found = false;
              m = 0;
            case 9:
              if (!(m < localWorks.length)) {
                _context0.n = 11;
                break;
              }
              if (!(localWorks[m].id === cw.workId)) {
                _context0.n = 10;
                break;
              }
              found = true;
              return _context0.a(3, 11);
            case 10:
              m++;
              _context0.n = 9;
              break;
            case 11:
              if (!found) toPull.push(cw.workId);
            case 12:
              k++;
              _context0.n = 8;
              break;
            case 13:
              if (!(toPush.length > 0)) {
                _context0.n = 28;
                break;
              }
              _context0.p = 14;
              batchItems = toPush.map(function (w) {
                return _packWork(w);
              });
              _context0.n = 15;
              return this.pushBatch(batchItems, '');
            case 15:
              batchResult = _context0.v;
              if (!(batchResult && batchResult.results)) {
                _context0.n = 21;
                break;
              }
              bi = 0;
            case 16:
              if (!(bi < batchResult.results.length)) {
                _context0.n = 21;
                break;
              }
              br = batchResult.results[bi];
              if (!(br.status === 'created' || br.status === 'updated')) {
                _context0.n = 20;
                break;
              }
              bj = 0;
            case 17:
              if (!(bj < toPush.length)) {
                _context0.n = 19;
                break;
              }
              if (!(toPush[bj].id === br.workId)) {
                _context0.n = 18;
                break;
              }
              toPush[bj]._version = br.version;
              return _context0.a(3, 19);
            case 18:
              bj++;
              _context0.n = 17;
              break;
            case 19:
              report.pushed++;
            case 20:
              bi++;
              _context0.n = 16;
              break;
            case 21:
              _context0.n = 28;
              break;
            case 22:
              _context0.p = 22;
              _t = _context0.v;
              pi = 0;
            case 23:
              if (!(pi < toPush.length)) {
                _context0.n = 28;
                break;
              }
              _context0.p = 24;
              _context0.n = 25;
              return this.pushWork(_packWork(toPush[pi]));
            case 25:
              pr = _context0.v;
              if (pr && pr.version) {
                toPush[pi]._version = pr.version;
                report.pushed++;
              }
              _context0.n = 27;
              break;
            case 26:
              _context0.p = 26;
              _t2 = _context0.v;
            case 27:
              pi++;
              _context0.n = 23;
              break;
            case 28:
              if (!(toPull.length > 0)) {
                _context0.n = 38;
                break;
              }
              self = this;
              concurrency = 3;
              pi = 0;
            case 29:
              if (!(pi < toPull.length)) {
                _context0.n = 38;
                break;
              }
              batch = toPull.slice(pi, pi + concurrency);
              _context0.n = 30;
              return Promise.all(batch.map(function (wid) {
                return self.getWork(wid).catch(function () {
                  return null;
                });
              }));
            case 30:
              pullResults = _context0.v;
              ri = 0;
            case 31:
              if (!(ri < pullResults.length)) {
                _context0.n = 37;
                break;
              }
              full = pullResults[ri];
              if (!(!full || !full.work || !full.work.payload)) {
                _context0.n = 32;
                break;
              }
              return _context0.a(3, 36);
            case 32:
              wid = toPull[pi + ri]; // 查找本地是否已有
              existing = false;
              ei = 0;
            case 33:
              if (!(ei < localWorks.length)) {
                _context0.n = 35;
                break;
              }
              if (!(localWorks[ei].id === wid)) {
                _context0.n = 34;
                break;
              }
              _mergeWork(localWorks[ei], full.work.payload);
              localWorks[ei]._version = full.work.version;
              existing = true;
              return _context0.a(3, 35);
            case 34:
              ei++;
              _context0.n = 33;
              break;
            case 35:
              if (!existing) {
                newWork = full.work.payload;
                newWork._version = full.work.version || 1;
                newWork.id = full.work.workId;
                newWork.title = full.work.title || '';
                if (DB && DB.works) DB.works.push(newWork);
              }
              report.pulled++;
            case 36:
              ri++;
              _context0.n = 31;
              break;
            case 37:
              pi += concurrency;
              _context0.n = 29;
              break;
            case 38:
              // 保存本地
              try {
                if (DB && DB.save) DB.save();
              } catch (e) {}
              report.ok = true;
              _context0.n = 40;
              break;
            case 39:
              _context0.p = 39;
              _t3 = _context0.v;
              report.errors++;
              report.ok = false;
              report.error = _t3.message;
            case 40:
              return _context0.a(2, report);
          }
        }, _callee0, this, [[24, 26], [14, 22], [2, 39]]);
      }));
      function smartSync() {
        return _smartSync.apply(this, arguments);
      }
      return smartSync;
    }(),
    /**
     * 章节保存后快速同步（单作品）
     */
    quickSync: function () {
      var _quickSync = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(workId) {
        var w, i, _t4;
        return _regenerator().w(function (_context1) {
          while (1) switch (_context1.p = _context1.n) {
            case 0:
              if (this.isLoggedIn()) {
                _context1.n = 1;
                break;
              }
              return _context1.a(2, {
                ok: false,
                error: '未登录'
              });
            case 1:
              _context1.p = 1;
              w = null;
              if (!(DB && DB.works)) {
                _context1.n = 4;
                break;
              }
              i = 0;
            case 2:
              if (!(i < DB.works.length)) {
                _context1.n = 4;
                break;
              }
              if (!(DB.works[i].id === workId)) {
                _context1.n = 3;
                break;
              }
              w = DB.works[i];
              return _context1.a(3, 4);
            case 3:
              i++;
              _context1.n = 2;
              break;
            case 4:
              if (w) {
                _context1.n = 5;
                break;
              }
              return _context1.a(2, {
                ok: false,
                error: '未找到作品'
              });
            case 5:
              _context1.n = 6;
              return this.pushWork(_packWork(w));
            case 6:
              return _context1.a(2, _context1.v);
            case 7:
              _context1.p = 7;
              _t4 = _context1.v;
              return _context1.a(2, {
                ok: false,
                error: _t4.message
              });
          }
        }, _callee1, this, [[1, 7]]);
      }));
      function quickSync(_x12) {
        return _quickSync.apply(this, arguments);
      }
      return quickSync;
    }(),
    // ==================== 自动同步 ====================
    startAutoSync: function startAutoSync(interval) {
      if (this._timer) clearInterval(this._timer);
      var self = this;
      this._timer = setInterval(function () {
        if (self.isLoggedIn()) self.smartSync().catch(function () {});
      }, interval || this.autoInterval);
    },
    stopAutoSync: function stopAutoSync() {
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    },
    // === v44+：首次加载云端检查（解决 APP 与网页内容不一致）===
    firstLoadCheck: function () {
      if (!this.isLoggedIn()) return;
      // 设备指纹：根据 userAgent + 当前时间戳简化判断
      var DEVICE_KEY = 'wxbj_device_fingerprint';
      var LAST_CLOUD_CHECK_KEY = 'wxbj_last_cloud_check';
      var now = Date.now();
      var localEmpty = !DB || !DB.works || DB.works.length === 0;
      var isNewDevice = false;
      try {
        isNewDevice = !localStorage.getItem(DEVICE_KEY);
        if (isNewDevice) {
          localStorage.setItem(DEVICE_KEY, 'v1_' + now);
        }
      } catch (e) {}
      var lastCheck = 0;
      try { lastCheck = parseInt(localStorage.getItem(LAST_CLOUD_CHECK_KEY) || '0', 10); } catch (e) {}
      // 触发条件：新设备 OR 本地无数据 OR 超过1小时未检查
      var shouldCheck = isNewDevice || localEmpty || (now - lastCheck > 60 * 60 * 1000);
      if (!shouldCheck) return;
      // 标记已检查（避免重复触发）
      try { localStorage.setItem(LAST_CLOUD_CHECK_KEY, String(now)); } catch (e) {}
      var self = this;
      setTimeout(function () {
        try {
          self.smartSync().then(function (report) {
            if (report && (report.pulled > 0 || report.pushed > 0)) {
              try { DB.save(); } catch (e) {}
            }
          }).catch(function () {});
        } catch (e) {}
      }, 1500); // 延迟执行，避免阻塞页面初始化
      this.startAutoSync(this.autoInterval);
    },
    // === v44+：登录后立即同步（防止新设备登录后看不到云端数据）===
    syncAfterLogin: function () {
      var self = this;
      setTimeout(function () {
        try { self.smartSync().then(function () { try { DB.save(); } catch (e) {} }); } catch (e) {}
      }, 800);
    },
    // ==================== 底层 ====================

    _fetch: function () {
      var _fetch2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(path, opts) {
        var headers, resp, data;
        return _regenerator().w(function (_context10) {
          while (1) switch (_context10.n) {
            case 0:
              opts = opts || {};
              if (this.apiBase) {
                _context10.n = 1;
                break;
              }
              return _context10.a(2, {
                error: '未配置后端地址'
              });
            case 1:
              headers = opts.headers || {};
              headers['Content-Type'] = 'application/json';
              if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
              _context10.n = 2;
              return fetch(this.apiBase + path, {
                method: opts.method || 'GET',
                headers: headers,
                body: opts.body || undefined
              });
            case 2:
              resp = _context10.v;
              _context10.n = 3;
              return resp.json().catch(function () {
                return {
                  error: '服务器返回异常'
                };
              });
            case 3:
              data = _context10.v;
              if (resp.ok) {
                _context10.n = 4;
                break;
              }
              if (resp.status === 401) this._clearToken();
              throw new Error(data.error || '请求失败 ' + resp.status);
            case 4:
              return _context10.a(2, data);
          }
        }, _callee10, this);
      }));
      function _fetch(_x13, _x14) {
        return _fetch2.apply(this, arguments);
      }
      return _fetch;
    }()
  };

  // ==================== 辅助 ====================

  function _packWork(w) {
    // 动态计算总字数
    var totalWords = 0;
    if (w.chapters && Array.isArray(w.chapters)) {
      for (var i = 0; i < w.chapters.length; i++) {
        var ch = w.chapters[i];
        if (ch && ch.content) totalWords += ch.content.length;else if (ch && ch.wordCount) totalWords += ch.wordCount;
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
    // 云端数据覆盖本地核心字段，但保留本地writing状态
    var localWriting = local._writing;
    var keys = Object.keys(cloudPayload);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] !== '_version' && keys[i] !== '_writing') {
        local[keys[i]] = cloudPayload[keys[i]];
      }
    }
    if (localWriting) local._writing = localWriting;
  }
  window.CloudSync = CloudSync;
})();