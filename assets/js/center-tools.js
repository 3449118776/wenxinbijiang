"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/* 文心笔匠 - 创作中枢公共函数模块 */
/* 从 center.html 和 settings.html 中提取，消除约250行重复代码 */

function _escapeHtml(s) {
  return String(s || '').replace(/[<>&]/g, function (c) {
    return {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;'
    }[c];
  });
}
function renderAppMemoryReport(r) {
  var el = document.getElementById('app-memory-report');
  if (!el) return;
  el.innerHTML = '作品：' + r.works + ' 部<br>' + '章节：' + r.chapters + ' 章<br>' + '正文：约 ' + r.words + ' 字<br>' + '记忆条目：' + r.memoryItems + ' 条<br>' + '章节分片：' + (r.chapterShards || 0) + ' 片<br>' + '自动维护：' + (r.autoMaintenance && r.autoMaintenance.enabled ? '已开启' : '未开启') + '，待刷新 ' + (r.autoMaintenance && r.autoMaintenance.pending || 0) + ' 章<br>' + '快速存储：' + r.localMB + ' MB<br>' + 'App镜像：' + (r.mirror ? '已保存（' + (r.mirrorSavedAt || '') + '）' : '暂无');
}
function checkAppMemoryHealth() {
  if (!DB.getAppMemoryReport) {
    showToast('当前版本不支持App级记忆');
    return;
  }
  DB.getAppMemoryReport().then(function (r) {
    renderAppMemoryReport(r);
    var msg = 'App记忆体检完成：约' + r.words + '字，快速存储' + r.localMB + 'MB';
    if (parseFloat(r.localMB) > 4) msg += '，建议依赖App镜像';
    showToast(msg, 3500);
  });
}
function forceAppMemoryMirror() {
  if (!DB.saveAppMemoryMirror) {
    showToast('当前版本不支持App级记忆');
    return;
  }
  DB.flush && DB.flush();
  DB.saveAppMemoryMirror().then(function (ok) {
    if (ok) {
      showToast('✅ App级记忆镜像已保存');
      checkAppMemoryHealth();
    } else {
      showToast('App记忆镜像保存失败', {
        error: true
      });
    }
  });
}
function forceChapterShards() {
  if (!DB.saveAllChapterShards) {
    showToast('当前版本不支持章节分片');
    return;
  }
  DB.flush && DB.flush();
  showToast('正在整理章节正文分片…', 2000);
  DB.saveAllChapterShards().then(function (ok) {
    if (ok) {
      showToast('✅ 章节正文分片已整理');
      checkAppMemoryHealth();
    } else {
      showToast('章节分片整理失败', {
        error: true
      });
    }
  });
}
function exportSingleWorkBackup() {
  if (DB.exportCurrentWorkBackup) DB.exportCurrentWorkBackup();
}
function importSingleWorkBackup() {
  var inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.json';
  inp.onchange = function () {
    var f = inp.files && inp.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var w = DB.importSingleWorkBackup(r.result);
        showToast('✅ 已导入：' + (w.title || ''));
      } catch (e) {
        showToast('导入失败：' + (e.message || e), {
          error: true
        });
      }
    };
    r.readAsText(f);
  };
  inp.click();
}
function safeSlimCurrentWork() {
  if (!confirm('安全正文瘦身会把较旧章节正文移入章节分片，大JSON只留索引。建议先生成一次备份。继续吗？')) return;
  DB.safeSlimCurrentWork(5).then(function (r) {
    showToast('✅ 已瘦身 ' + r.slimmed + ' 章，约移出 ' + r.savedChars + ' 字', 5000);
    if (typeof runSlimHealthCheck === 'function') runSlimHealthCheck();
  }).catch(function (e) {
    showToast('瘦身失败：' + (e.message || e), {
      error: true
    });
  });
}
function showForeshadowBoard() {
  var rows = DB.buildForeshadowBoard ? DB.buildForeshadowBoard() : [];
  renderToolReport('🪝 伏笔看板', rows.length ? rows.map(function (r) {
    return '<div><b>' + _escapeHtml(r.work) + '</b>｜' + _escapeHtml(r.status) + '｜第' + ((r.chapter || 0) + 1) + '章：' + _escapeHtml(r.text) + '</div>';
  }).join('') : '暂无伏笔');
}
function showCharacterBoard() {
  var rows = DB.buildCharacterBoard ? DB.buildCharacterBoard() : [];
  renderToolReport('👤 人物看板', rows.length ? rows.map(function (r) {
    return '<div><b>' + _escapeHtml(r.work) + '</b>｜' + _escapeHtml(r.name) + '｜' + _escapeHtml(r.status || '') + '｜' + _escapeHtml(r.location || '') + '</div>';
  }).join('') : '暂无人物状态');
}
function showTimelineBoard() {
  var rows = DB.buildTimelineBoard ? DB.buildTimelineBoard() : [];
  renderToolReport('⏰ 时间轴看板', rows.length ? rows.map(function (r) {
    return '<div><b>' + _escapeHtml(r.work) + '</b>｜第' + ((r.chapter || 0) + 1) + '章｜' + _escapeHtml(r.time || '') + '：' + _escapeHtml(r.text) + '</div>';
  }).join('') : '暂无时间轴');
}
function renderToolReport(title, html) {
  var el = document.getElementById('app-memory-report');
  if (!el) return;
  el.innerHTML = '<b>' + title + '</b><br>' + html;
}
function runGlobalHealthCheck() {
  if (!DB.buildGlobalHealthReport) {
    showToast('当前版本不支持全书体检');
    return;
  }
  var r = DB.buildGlobalHealthReport();
  renderToolReport('🩺 全书体检', '总分：' + r.score + '/100<br>作品：' + r.works + ' 本<br>章节：' + r.chapters + ' 章<br>字数：约 ' + r.words + ' 字<br>记忆条目：' + r.memories + '<br>问题：<br>' + (r.issues.length ? r.issues.slice(0, 12).join('<br>') : '暂无明显问题'));
  showToast('全书体检完成：' + r.score + '/100', 3500);
}
function runSlimHealthCheck() {
  if (!DB.buildSlimHealthReport) {
    showToast('当前版本不支持瘦身体检');
    return;
  }
  var r = DB.buildSlimHealthReport();
  renderToolReport('🧹 正文瘦身体检', '作品：' + r.works + ' 本<br>章节：' + r.chapters + ' 章<br>正文：约 ' + r.contentWords + ' 字 / ' + r.contentMB + 'MB<br>大JSON估算：' + r.jsonMB + 'MB<br>最大作品：' + (r.biggest ? r.biggest.title + '（' + r.biggest.words + '字）' : '无') + '<br>建议：' + r.advice);
  showToast('正文瘦身体检完成', 3000);
}
function runGlobalSearch() {
  var kw = prompt('输入要搜索的人名、道具、伏笔、地点或关键词：');
  if (!kw) return;
  var rows = DB.searchAllWorks ? DB.searchAllWorks(kw) : [];
  renderToolReport('🔎 全书搜索：' + kw, rows.length ? rows.map(function (r) {
    return '<div style="margin:6px 0;"><b>' + r.work + '</b>｜' + r.type + (r.chapter ? '｜' + r.chapter : '') + '<br>' + String(r.text).replace(/[<>&]/g, function (c) {
      return {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;'
      }[c];
    }) + '</div>';
  }).join('') : '没有找到结果');
  showToast('搜索完成，找到 ' + rows.length + ' 条', 3000);
}
function exportCurrentWorkTxt() {
  if (DB.exportCurrentWorkTxt) DB.exportCurrentWorkTxt();
}
function chooseAutoBackupDir() {
  if (!DB.chooseAutoBackupDirectory) {
    showToast('当前版本不支持自动备份文件夹');
    return;
  }
  DB.chooseAutoBackupDirectory().then(function () {
    showToast('✅ 自动备份文件夹已选择');
    return DB.performAutoBackup(true);
  }).then(function () {
    checkBackupStatus();
  }).catch(function (e) {
    showToast('选择失败：' + (e && e.message ? e.message : '当前环境不支持'), {
      error: true,
      duration: 3500
    });
  });
}
function forceAutoBackupFile() {
  if (!DB.performAutoBackup) {
    showToast('当前版本不支持自动备份');
    return;
  }
  DB.flush && DB.flush();
  showToast('正在生成自动备份…', 2000);
  DB.performAutoBackup(true).then(function (info) {
    if (info && info.internal) {
      showToast(info.file ? '✅ 已生成内部备份和本地文件备份' : '✅ 已生成内部备份（当前环境未写出文件）', 3500);
      checkBackupStatus();
    } else {
      showToast('备份生成失败', {
        error: true
      });
    }
  });
}
function checkBackupStatus() {
  if (!DB.getBackupStatus) {
    showToast('当前版本不支持自动备份状态');
    return;
  }
  DB.getBackupStatus().then(function (s) {
    var el = document.getElementById('app-memory-report');
    if (el) {
      var latest = s.latest ? s.latest.createdAtText + '，' + ((s.latest.bytes || 0) / 1024 / 1024).toFixed(2) + 'MB' : '暂无';
      el.innerHTML = (el.innerHTML || '') + '<hr style="border:none;border-top:1px solid #e5e7eb;margin:8px 0;">' + '内部备份：' + s.internalCount + ' 份<br>' + '最近备份：' + latest + '<br>' + '文件夹权限：' + (s.hasDirectory ? '已选择' : '未选择') + '<br>' + '文件系统支持：' + (s.supportDirectory ? '支持' : '不支持/需App壳支持') + '<br>' + '章节历史版本：' + (s.chapterHistoryCount || 0) + ' 份';
    }
    showToast('自动备份状态：内部' + s.internalCount + '份，文件夹' + (s.hasDirectory ? '已选择' : '未选择'), 3500);
  });
}
function restoreAppMemoryMirror() {
  if (!DB.restoreFromAppMemoryMirror) {
    showToast('当前版本不支持App级记忆');
    return;
  }
  if (!confirm('确定从App级记忆镜像恢复？当前快速存储会被镜像覆盖。')) return;
  DB.restoreFromAppMemoryMirror().then(function (data) {
    showToast('✅ 已从App记忆镜像恢复，共' + (data.works && data.works.length || 0) + '部作品');
    setTimeout(function () {
      location.reload();
    }, 800);
  }).catch(function (e) {
    showToast('恢复失败：' + (e && e.message ? e.message : '没有镜像'), {
      error: true,
      duration: 3500
    });
  });
}

// 更新时间（状态栏）
function updateStatusTime() {
  var now = new Date();
  var minutes = String(now.getMinutes()).padStart(2, '0');
  var el = document.getElementById('status-time');
  if (el) el.textContent = now.getHours() + ':' + minutes;
}
setInterval(updateStatusTime, 60000);
updateStatusTime();

// === v46: 多AI协作开关 ===
function toggleMultiAI(enabled) {
  try {
    var s = DB.settings;
    s.multiAI = !!enabled;
    DB.save();
    var slider = document.getElementById('multi-ai-slider');
    var bg = slider && slider.parentElement;
    if (slider) slider.style.left = enabled ? '25px' : '3px';
    if (bg) bg.style.background = enabled ? '#6366f1' : '#d1d5db';
    showToast(enabled ? '多AI协作已开启 — 同时请求多个服务商' : '已切换为单AI模式');
  } catch (e) {
    console.warn(e);
  }
}
function loadMultiAISetting() {
  var el = document.getElementById('multi-ai-toggle');
  if (!el) return;
  try {
    var s = DB.settings;
    el.checked = !!s.multiAI;
    toggleMultiAI(!!s.multiAI);
  } catch (e) {}
}
// 页面加载时初始化
document.addEventListener('DOMContentLoaded', loadMultiAISetting);
// settings页面如果已加载，立即初始化
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  setTimeout(loadMultiAISetting, 100);
}

// ================================================================
// v46: 云端同步 UI
// ================================================================

// 通用弹窗（动态内容）
function showCustomModal(title, htmlContent) {
  var overlay = document.createElement('div');
  overlay.id = 'custom-modal-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:9999;display:flex;align-items:center;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:16px;padding:20px;max-width:420px;width:90%;max-height:80vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
  box.innerHTML = '<div style="font-size:16px;font-weight:700;margin-bottom:12px;">' + title + '</div>' + htmlContent;
  overlay.appendChild(box);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) hideCustomModal();
  });
  document.body.appendChild(overlay);
}
function hideCustomModal() {
  var el = document.getElementById('custom-modal-overlay');
  if (el) el.remove();
}

// HTML转义（兼容center.html中没有引入write-editor.js的场景）
function he(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 云端实例（全局复用）
window.cloud = null;
function _getCloud() {
  if (!window.cloud) {
    var base = localStorage.getItem('wxbj_cloud_base') || '';
    // 智能检测：file:// 协议无法使用相对路径，必须配置完整地址
    if (!base) {
      if (window.location.protocol === 'file:') {
        // 本地文件协议，无法使用相对路径，提示用户配置
        console.warn('[Cloud] 本地文件协议(file://)无法使用云端同步，请在登录面板配置完整API地址');
        base = ''; // 空地址，后续请求会提示"未配置后端地址"
      } else {
        // http/https 协议，使用相对路径
        base = window.location.origin + '/api';
      }
    }
    window.cloud = new CloudSync({
      apiBase: base
    });
    // v44+：首次加载云端检查（新设备/本地为空/超1小时未检查时拉取云端数据）
    try { if (typeof window.cloud.firstLoadCheck === 'function') window.cloud.firstLoadCheck(); } catch (e) {}
  }
  return window.cloud;
}
// 云端连接状态检测（异步）
function _checkCloudConnection() {
  var c = _getCloud();
  if (!c.apiBase) {
    showToast('⚠️ 请先在登录面板配置后端API地址', 4000);
    return Promise.resolve(false);
  }
  return c._fetch('/health').then(function (data) {
    if (data && data.ok) {
      console.log('[Cloud] 后端连接正常');
      return true;
    }
    return false;
  }).catch(function (e) {
    console.warn('[Cloud] 后端连接失败:', e.message);
    showToast('⚠️ 后端服务未响应，请检查：1) 是否启动后端服务 2) API地址是否正确', 5000);
    return false;
  });
}
function _updateCloudUI() {
  var c = _getCloud();
  var badge = document.getElementById('cloud-badge');
  var out = document.getElementById('cloud-logged-out');
  var inEl = document.getElementById('cloud-logged-in');
  var userInfo = document.getElementById('cloud-user-info');
  if (c.isLoggedIn()) {
    if (badge) {
      badge.textContent = '已登录';
      badge.style.background = '#dcfce7';
      badge.style.color = '#16a34a';
    }
    if (out) out.style.display = 'none';
    if (inEl) inEl.style.display = '';
    if (userInfo && c.user) userInfo.textContent = c.user.email || '';
  } else {
    if (badge) {
      badge.textContent = '未登录';
      badge.style.background = '#e5e7eb';
      badge.style.color = '#6b7280';
    }
    if (out) out.style.display = '';
    if (inEl) inEl.style.display = 'none';
  }
}

// 配置后端地址
function setCloudBase(base) {
  base = (base || '').replace(/\/$/, '');
  try {
    localStorage.setItem('wxbj_cloud_base', base);
  } catch (e) {}
  if (window.cloud) window.cloud.apiBase = base;
  showToast('后端地址已设置为：' + base, {
    duration: 2000
  });
}

// 登录面板
function showLoginPanel() {
  var html = '<div style="padding:8px;">';
  html += '<div style="margin-bottom:10px;">';
  html += '<label style="font-size:12px;color:#6b7280;">后端API地址</label>';
  html += '<input id="cloud-base-input" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:8px;margin-top:2px;" placeholder="https://your-server.com/api 或 http://localhost:3456/api" value="' + he(localStorage.getItem('wxbj_cloud_base') || '') + '">';
  html += '<div style="font-size:11px;color:#9ca3af;margin-top:4px;">本地开发: http://localhost:3456/api | Cloudflare: https://your-domain.com/api</div>';
  html += '</div>';
  html += '<button onclick="testCloudConnection()" style="width:100%;padding:8px;background:#f3f4f6;border:1px solid #d1d5db;border-radius:8px;margin-bottom:10px;cursor:pointer;font-size:13px;">🔌 测试连接</button>';
  html += '<div style="margin-bottom:10px;">';
  html += '<label style="font-size:12px;color:#6b7280;">邮箱</label>';
  html += '<input id="cloud-email" type="email" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:8px;margin-top:2px;" placeholder="your@email.com">';
  html += '</div>';
  html += '<div style="margin-bottom:10px;">';
  html += '<label style="font-size:12px;color:#6b7280;">密码（至少6位）</label>';
  html += '<input id="cloud-password" type="password" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:8px;margin-top:2px;" placeholder="输入密码">';
  html += '</div>';
  html += '<div style="display:flex;gap:8px;margin-top:12px;">';
  html += '<button onclick="cloudLogin()" style="flex:1;padding:10px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">登录</button>';
  html += '<button onclick="cloudRegister()" style="flex:1;padding:10px;background:#22c55e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">注册</button>';
  html += '</div>';
  html += '</div>';
  showCustomModal('登录 / 注册', html);
}
// 测试云端连接
function testCloudConnection() {
  var baseInput = document.getElementById('cloud-base-input');
  var base = (baseInput.value || '').trim();
  if (!base) {
    showToast('请先输入后端API地址');
    return;
  }
  // 临时设置地址并测试
  setCloudBase(base);
  showToast('正在测试连接...', 1500);
  _checkCloudConnection().then(function (ok) {
    if (ok) {
      showToast('✅ 后端连接成功！');
    }
  });
}
function cloudLogin() {
  return _cloudLogin.apply(this, arguments);
}
function _cloudLogin() {
  _cloudLogin = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var base, email, password, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          base = document.getElementById('cloud-base-input').value.trim();
          email = document.getElementById('cloud-email').value.trim();
          password = document.getElementById('cloud-password').value.trim();
          if (!(!email || !password)) {
            _context.n = 1;
            break;
          }
          showToast('请输入邮箱和密码');
          return _context.a(2);
        case 1:
          if (base) setCloudBase(base);
          _context.p = 2;
          showToast('登录中…', {
            duration: 3000
          });
          _context.n = 3;
          return _getCloud().login(email, password);
        case 3:
          _updateCloudUI();
          hideCustomModal();
          showToast('登录成功！');
          // v44+：登录后立即同步云端作品
          try { if (window.cloud && typeof window.cloud.syncAfterLogin === 'function') window.cloud.syncAfterLogin(); } catch (e) {}
          _context.n = 5;
          break;
        case 4:
          _context.p = 4;
          _t = _context.v;
          showToast('登录失败：' + (_t && _t.message ? _t.message : '未知错误'), {
            error: true,
            duration: 3500
          });
        case 5:
          return _context.a(2);
      }
    }, _callee, null, [[2, 4]]);
  }));
  return _cloudLogin.apply(this, arguments);
}
function cloudRegister() {
  return _cloudRegister.apply(this, arguments);
}
function _cloudRegister() {
  _cloudRegister = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var base, email, password, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          base = document.getElementById('cloud-base-input').value.trim();
          email = document.getElementById('cloud-email').value.trim();
          password = document.getElementById('cloud-password').value.trim();
          if (!(!email || !password)) {
            _context2.n = 1;
            break;
          }
          showToast('请输入邮箱和密码');
          return _context2.a(2);
        case 1:
          if (!(password.length < 6)) {
            _context2.n = 2;
            break;
          }
          showToast('密码至少6位');
          return _context2.a(2);
        case 2:
          if (base) setCloudBase(base);
          _context2.p = 3;
          showToast('注册中…', {
            duration: 3000
          });
          _context2.n = 4;
          return _getCloud().register(email, password, email.split('@')[0] || '');
        case 4:
          _updateCloudUI();
          hideCustomModal();
          showToast('注册成功！已自动登录');
          // v44+：注册后立即同步云端作品
          try { if (window.cloud && typeof window.cloud.syncAfterLogin === 'function') window.cloud.syncAfterLogin(); } catch (e) {}
          _context2.n = 6;
          break;
        case 5:
          _context2.p = 5;
          _t2 = _context2.v;
          showToast('注册失败：' + (_t2 && _t2.message ? _t2.message : '未知错误'), {
            error: true,
            duration: 3500
          });
        case 6:
          return _context2.a(2);
      }
    }, _callee2, null, [[3, 5]]);
  }));
  return _cloudRegister.apply(this, arguments);
}
function cloudLogout() {
  _getCloud().logout();
  _updateCloudUI();
  showToast('已退出登录');
}
function cloudSmartSync() {
  return _cloudSmartSync.apply(this, arguments);
}
function _cloudSmartSync() {
  _cloudSmartSync = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var c, report, msg, _t3;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          _context3.p = 0;
          c = _getCloud();
          if (c.isLoggedIn()) {
            _context3.n = 1;
            break;
          }
          showToast('请先登录');
          return _context3.a(2);
        case 1:
          showToast('正在智能同步…', {
            duration: 5000
          });
          _context3.n = 2;
          return c.smartSync();
        case 2:
          report = _context3.v;
          msg = '同步完成：推送 ' + report.pushed + ' 部，拉取 ' + report.pulled + ' 部，无变化 ' + report.unchanged + ' 部';
          if (report.errors > 0) msg += '，错误 ' + report.errors + ' 处';
          showToast(msg);
          document.getElementById('cloud-status').textContent = msg + ' · ' + new Date().toLocaleTimeString();
          // 刷新页面数据
          if (report.pulled > 0) setTimeout(function () {
            location.reload();
          }, 1500);
          _context3.n = 4;
          break;
        case 3:
          _context3.p = 3;
          _t3 = _context3.v;
          showToast('同步失败：' + (_t3 && _t3.message ? _t3.message : ''), {
            error: true
          });
        case 4:
          return _context3.a(2);
      }
    }, _callee3, null, [[0, 3]]);
  }));
  return _cloudSmartSync.apply(this, arguments);
}
function cloudPushAll() {
  return _cloudPushAll.apply(this, arguments);
}
function _cloudPushAll() {
  _cloudPushAll = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
    var c, items, result, count, _t4;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          _context4.p = 0;
          c = _getCloud();
          if (c.isLoggedIn()) {
            _context4.n = 1;
            break;
          }
          showToast('请先登录');
          return _context4.a(2);
        case 1:
          if (confirm('将本地所有作品推送到云端。云端同名作品将被更新。继续？')) {
            _context4.n = 2;
            break;
          }
          return _context4.a(2);
        case 2:
          showToast('正在上传…', {
            duration: 10000
          });
          if (!(!DB || !DB.works || DB.works.length === 0)) {
            _context4.n = 3;
            break;
          }
          showToast('没有作品可推送');
          return _context4.a(2);
        case 3:
          items = DB.works.map(function (w) {
            var tw = 0;
            if (w.chapters) w.chapters.forEach(function (c) {
              if (c.content) tw += c.content.length;
            });
            // v46：瘦身payload，只保留最近5章完整正文，其余只保留摘要
            var slimW = Object.assign({}, w);
            if (slimW.chapters && slimW.chapters.length > 5) {
              slimW.chapters = slimW.chapters.map(function (ch, ci) {
                if (ci >= slimW.chapters.length - 5) return ch; // 最近5章完整保留
                return {
                  title: ch.title,
                  summary: ch.summary || '',
                  wordCount: ch.wordCount || 0,
                  aiSummary: ch.aiSummary || false
                };
              });
            }
            return {
              workId: w.id || '',
              title: w.title || '',
              category: w.category || '',
              payload: slimW,
              version: w._version || 0,
              chapterCount: w.chapters ? w.chapters.length : 0,
              totalWords: tw
            };
          }).filter(function (x) {
            return x.workId;
          });
          _context4.n = 4;
          return c.pushBatch(items, navigator.userAgent.slice(0, 80));
        case 4:
          result = _context4.v;
          count = result && result.results ? result.results.length : 0;
          showToast('推送完成：' + count + ' 部作品');
          _context4.n = 6;
          break;
        case 5:
          _context4.p = 5;
          _t4 = _context4.v;
          showToast('推送失败：' + (_t4 && _t4.message ? _t4.message : ''), {
            error: true
          });
        case 6:
          return _context4.a(2);
      }
    }, _callee4, null, [[0, 5]]);
  }));
  return _cloudPushAll.apply(this, arguments);
}
function cloudPullAll() {
  return _cloudPullAll.apply(this, arguments);
}
function _cloudPullAll() {
  _cloudPullAll = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
    var c, resp, cloudWorks, count, i, cw, full, pw, replaced, j, _t5;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          _context5.p = 0;
          c = _getCloud();
          if (c.isLoggedIn()) {
            _context5.n = 1;
            break;
          }
          showToast('请先登录');
          return _context5.a(2);
        case 1:
          if (confirm('从云端拉取所有作品。本地同名作品将被覆盖。继续？')) {
            _context5.n = 2;
            break;
          }
          return _context5.a(2);
        case 2:
          showToast('正在下载…', {
            duration: 10000
          });
          _context5.n = 3;
          return c.getWorks();
        case 3:
          resp = _context5.v;
          cloudWorks = resp && resp.works ? resp.works : [];
          if (!(cloudWorks.length === 0)) {
            _context5.n = 4;
            break;
          }
          showToast('云端没有作品');
          return _context5.a(2);
        case 4:
          count = 0;
          i = 0;
        case 5:
          if (!(i < cloudWorks.length)) {
            _context5.n = 13;
            break;
          }
          cw = cloudWorks[i];
          _context5.n = 6;
          return c.getWork(cw.workId);
        case 6:
          full = _context5.v;
          if (!(!full || !full.work || !full.work.payload)) {
            _context5.n = 7;
            break;
          }
          return _context5.a(3, 12);
        case 7:
          pw = full.work.payload;
          pw._version = full.work.version || 1;
          pw.id = full.work.workId;
          pw.title = full.work.title || '';
          // 替换本地同名作品
          replaced = false;
          if (!(DB && DB.works)) {
            _context5.n = 11;
            break;
          }
          j = 0;
        case 8:
          if (!(j < DB.works.length)) {
            _context5.n = 10;
            break;
          }
          if (!(DB.works[j].id === pw.id)) {
            _context5.n = 9;
            break;
          }
          DB.works[j] = pw;
          replaced = true;
          return _context5.a(3, 10);
        case 9:
          j++;
          _context5.n = 8;
          break;
        case 10:
          if (!replaced) DB.works.push(pw);
        case 11:
          count++;
        case 12:
          i++;
          _context5.n = 5;
          break;
        case 13:
          try {
            if (DB && DB.save) DB.save();
          } catch (e) {}
          showToast('拉取完成：' + count + ' 部作品，正在刷新…');
          setTimeout(function () {
            location.reload();
          }, 1500);
          _context5.n = 15;
          break;
        case 14:
          _context5.p = 14;
          _t5 = _context5.v;
          showToast('拉取失败：' + (_t5 && _t5.message ? _t5.message : ''), {
            error: true
          });
        case 15:
          return _context5.a(2);
      }
    }, _callee5, null, [[0, 14]]);
  }));
  return _cloudPullAll.apply(this, arguments);
}
function cloudSnapshots() {
  return _cloudSnapshots.apply(this, arguments);
}
function _cloudSnapshots() {
  _cloudSnapshots = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
    var c, html, i, w, _t6;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          _context6.p = 0;
          c = _getCloud();
          if (c.isLoggedIn()) {
            _context6.n = 1;
            break;
          }
          showToast('请先登录');
          return _context6.a(2);
        case 1:
          if (!(!DB || !DB.works || DB.works.length === 0)) {
            _context6.n = 2;
            break;
          }
          showToast('没有作品');
          return _context6.a(2);
        case 2:
          // 列出本地作品让用户选择
          html = '<div style="padding:8px;">';
          html += '<p style="font-size:12px;color:#6b7280;margin-bottom:8px;">选择作品查看云端快照：</p>';
          for (i = 0; i < DB.works.length; i++) {
            w = DB.works[i];
            html += '<button onclick="cloudShowSnapshots(\'' + he(w.id || '') + '\')" style="display:block;width:100%;padding:8px;margin:4px 0;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;text-align:left;">' + he(w.title || '未命名') + '</button>';
          }
          html += '</div>';
          showCustomModal('云端快照', html);
          _context6.n = 4;
          break;
        case 3:
          _context6.p = 3;
          _t6 = _context6.v;
          showToast('获取失败：' + (_t6 && _t6.message ? _t6.message : ''), {
            error: true
          });
        case 4:
          return _context6.a(2);
      }
    }, _callee6, null, [[0, 3]]);
  }));
  return _cloudSnapshots.apply(this, arguments);
}
function cloudShowSnapshots(_x) {
  return _cloudShowSnapshots.apply(this, arguments);
}
function _cloudShowSnapshots() {
  _cloudShowSnapshots = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(workId) {
    var c, resp, snaps, html, i, s, sizeStr, _t7;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.p = _context7.n) {
        case 0:
          _context7.p = 0;
          c = _getCloud();
          _context7.n = 1;
          return c.getSnapshots(workId);
        case 1:
          resp = _context7.v;
          snaps = resp && resp.snapshots ? resp.snapshots : [];
          if (!(snaps.length === 0)) {
            _context7.n = 2;
            break;
          }
          showToast('暂无快照');
          return _context7.a(2);
        case 2:
          html = '<div style="padding:8px;max-height:400px;overflow:auto;">';
          html += '<p style="font-size:12px;color:#6b7280;">共 ' + snaps.length + ' 个版本。点击恢复：</p>';
          for (i = 0; i < snaps.length; i++) {
            s = snaps[i];
            sizeStr = s.size < 1024 ? s.size + 'B' : s.size < 1048576 ? (s.size / 1024).toFixed(1) + 'KB' : (s.size / 1048576).toFixed(1) + 'MB';
            html += '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:8px;margin:4px 0;">';
            html += '<span style="font-weight:600;">V' + s.version + '</span> · ' + new Date(s.createdAt).toLocaleString();
            html += ' · ' + sizeStr;
            html += ' <button onclick="cloudRestoreSnapshot(\'' + he(workId) + '\',\'' + s.id + '\')" style="float:right;padding:4px 10px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">恢复</button>';
            html += '</div>';
          }
          html += '</div>';
          showCustomModal('版本快照', html);
          _context7.n = 4;
          break;
        case 3:
          _context7.p = 3;
          _t7 = _context7.v;
          showToast('获取快照失败：' + (_t7 && _t7.message ? _t7.message : ''), {
            error: true
          });
        case 4:
          return _context7.a(2);
      }
    }, _callee7, null, [[0, 3]]);
  }));
  return _cloudShowSnapshots.apply(this, arguments);
}
function cloudRestoreSnapshot(_x2, _x3) {
  return _cloudRestoreSnapshot.apply(this, arguments);
} // 页面加载时刷新UI
function _cloudRestoreSnapshot() {
  _cloudRestoreSnapshot = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(workId, snapId) {
    var c, resp, pw, j, _t8;
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.p = _context8.n) {
        case 0:
          _context8.p = 0;
          c = _getCloud();
          _context8.n = 1;
          return c.restoreSnapshot(workId, snapId);
        case 1:
          resp = _context8.v;
          if (!(resp && resp.work)) {
            _context8.n = 6;
            break;
          }
          pw = resp.work.payload;
          pw._version = resp.work.version || 1;
          // 替换本地同名作品
          if (!(DB && DB.works)) {
            _context8.n = 5;
            break;
          }
          j = 0;
        case 2:
          if (!(j < DB.works.length)) {
            _context8.n = 4;
            break;
          }
          if (!(DB.works[j].id === workId)) {
            _context8.n = 3;
            break;
          }
          DB.works[j] = pw;
          return _context8.a(3, 4);
        case 3:
          j++;
          _context8.n = 2;
          break;
        case 4:
          DB.save();
        case 5:
          showToast('已恢复到 V' + resp.restoredFromVersion + '，正在刷新…');
          setTimeout(function () {
            location.reload();
          }, 1500);
        case 6:
          _context8.n = 8;
          break;
        case 7:
          _context8.p = 7;
          _t8 = _context8.v;
          showToast('恢复失败：' + (_t8 && _t8.message ? _t8.message : ''), {
            error: true
          });
        case 8:
          return _context8.a(2);
      }
    }, _callee8, null, [[0, 7]]);
  }));
  return _cloudRestoreSnapshot.apply(this, arguments);
}
(function () {
  setTimeout(_updateCloudUI, 200);
})();