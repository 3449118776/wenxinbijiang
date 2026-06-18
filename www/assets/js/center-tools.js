/* 文心笔匠 - 创作中枢公共函数模块 */
/* 从 center.html 和 settings.html 中提取，消除约250行重复代码 */

function _escapeHtml(s) {
  return String(s || '').replace(/[<>&]/g, function(c) {
    return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c];
  });
}

function renderAppMemoryReport(r) {
  var el = document.getElementById('app-memory-report');
  if (!el) return;
  el.innerHTML =
    '作品：' + r.works + ' 部<br>' +
    '章节：' + r.chapters + ' 章<br>' +
    '正文：约 ' + r.words + ' 字<br>' +
    '记忆条目：' + r.memoryItems + ' 条<br>' +
    '章节分片：' + (r.chapterShards || 0) + ' 片<br>' +
    '自动维护：' + (r.autoMaintenance && r.autoMaintenance.enabled ? '已开启' : '未开启') + '，待刷新 ' + ((r.autoMaintenance && r.autoMaintenance.pending) || 0) + ' 章<br>' +
    '快速存储：' + r.localMB + ' MB<br>' +
    'App镜像：' + (r.mirror ? ('已保存（' + (r.mirrorSavedAt || '') + '）') : '暂无');
}

function checkAppMemoryHealth() {
  if (!DB.getAppMemoryReport) { showToast('当前版本不支持App级记忆'); return; }
  DB.getAppMemoryReport().then(function(r) {
    renderAppMemoryReport(r);
    var msg = 'App记忆体检完成：约' + r.words + '字，快速存储' + r.localMB + 'MB';
    if (parseFloat(r.localMB) > 4) msg += '，建议依赖App镜像';
    showToast(msg, 3500);
  });
}

function forceAppMemoryMirror() {
  if (!DB.saveAppMemoryMirror) { showToast('当前版本不支持App级记忆'); return; }
  DB.flush && DB.flush();
  DB.saveAppMemoryMirror().then(function(ok) {
    if (ok) {
      showToast('✅ App级记忆镜像已保存');
      checkAppMemoryHealth();
    } else {
      showToast('App记忆镜像保存失败', { error: true });
    }
  });
}

function forceChapterShards() {
  if (!DB.saveAllChapterShards) { showToast('当前版本不支持章节分片'); return; }
  DB.flush && DB.flush();
  showToast('正在整理章节正文分片…', 2000);
  DB.saveAllChapterShards().then(function(ok) {
    if (ok) {
      showToast('✅ 章节正文分片已整理');
      checkAppMemoryHealth();
    } else {
      showToast('章节分片整理失败', { error: true });
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
  inp.onchange = function() {
    var f = inp.files && inp.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function() {
      try {
        var w = DB.importSingleWorkBackup(r.result);
        showToast('✅ 已导入：' + (w.title || ''));
      } catch (e) {
        showToast('导入失败：' + (e.message || e), { error: true });
      }
    };
    r.readAsText(f);
  };
  inp.click();
}

function safeSlimCurrentWork() {
  if (!confirm('安全正文瘦身会把较旧章节正文移入章节分片，大JSON只留索引。建议先生成一次备份。继续吗？')) return;
  DB.safeSlimCurrentWork(5).then(function(r) {
    showToast('✅ 已瘦身 ' + r.slimmed + ' 章，约移出 ' + r.savedChars + ' 字', 5000);
    if (typeof runSlimHealthCheck === 'function') runSlimHealthCheck();
  }).catch(function(e) {
    showToast('瘦身失败：' + (e.message || e), { error: true });
  });
}

function showForeshadowBoard() {
  var rows = DB.buildForeshadowBoard ? DB.buildForeshadowBoard() : [];
  renderToolReport('🪝 伏笔看板', rows.length ? rows.map(function(r) {
    return '<div><b>' + _escapeHtml(r.work) + '</b>｜' + _escapeHtml(r.status) + '｜第' + ((r.chapter || 0) + 1) + '章：' + _escapeHtml(r.text) + '</div>';
  }).join('') : '暂无伏笔');
}

function showCharacterBoard() {
  var rows = DB.buildCharacterBoard ? DB.buildCharacterBoard() : [];
  renderToolReport('👤 人物看板', rows.length ? rows.map(function(r) {
    return '<div><b>' + _escapeHtml(r.work) + '</b>｜' + _escapeHtml(r.name) + '｜' + _escapeHtml(r.status || '') + '｜' + _escapeHtml(r.location || '') + '</div>';
  }).join('') : '暂无人物状态');
}

function showTimelineBoard() {
  var rows = DB.buildTimelineBoard ? DB.buildTimelineBoard() : [];
  renderToolReport('⏰ 时间轴看板', rows.length ? rows.map(function(r) {
    return '<div><b>' + _escapeHtml(r.work) + '</b>｜第' + ((r.chapter || 0) + 1) + '章｜' + _escapeHtml(r.time || '') + '：' + _escapeHtml(r.text) + '</div>';
  }).join('') : '暂无时间轴');
}

function renderToolReport(title, html) {
  var el = document.getElementById('app-memory-report');
  if (!el) return;
  el.innerHTML = '<b>' + title + '</b><br>' + html;
}

function runGlobalHealthCheck() {
  if (!DB.buildGlobalHealthReport) { showToast('当前版本不支持全书体检'); return; }
  var r = DB.buildGlobalHealthReport();
  renderToolReport('🩺 全书体检', '总分：' + r.score + '/100<br>作品：' + r.works + ' 本<br>章节：' + r.chapters + ' 章<br>字数：约 ' + r.words + ' 字<br>记忆条目：' + r.memories + '<br>问题：<br>' + (r.issues.length ? r.issues.slice(0, 12).join('<br>') : '暂无明显问题'));
  showToast('全书体检完成：' + r.score + '/100', 3500);
}

function runSlimHealthCheck() {
  if (!DB.buildSlimHealthReport) { showToast('当前版本不支持瘦身体检'); return; }
  var r = DB.buildSlimHealthReport();
  renderToolReport('🧹 正文瘦身体检', '作品：' + r.works + ' 本<br>章节：' + r.chapters + ' 章<br>正文：约 ' + r.contentWords + ' 字 / ' + r.contentMB + 'MB<br>大JSON估算：' + r.jsonMB + 'MB<br>最大作品：' + (r.biggest ? r.biggest.title + '（' + r.biggest.words + '字）' : '无') + '<br>建议：' + r.advice);
  showToast('正文瘦身体检完成', 3000);
}

function runGlobalSearch() {
  var kw = prompt('输入要搜索的人名、道具、伏笔、地点或关键词：');
  if (!kw) return;
  var rows = DB.searchAllWorks ? DB.searchAllWorks(kw) : [];
  renderToolReport('🔎 全书搜索：' + kw, rows.length ? rows.map(function(r) {
    return '<div style="margin:6px 0;"><b>' + r.work + '</b>｜' + r.type + (r.chapter ? '｜' + r.chapter : '') + '<br>' + String(r.text).replace(/[<>&]/g, function(c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; }) + '</div>';
  }).join('') : '没有找到结果');
  showToast('搜索完成，找到 ' + rows.length + ' 条', 3000);
}

function exportCurrentWorkTxt() {
  if (DB.exportCurrentWorkTxt) DB.exportCurrentWorkTxt();
}

function chooseAutoBackupDir() {
  if (!DB.chooseAutoBackupDirectory) { showToast('当前版本不支持自动备份文件夹'); return; }
  DB.chooseAutoBackupDirectory().then(function() {
    showToast('✅ 自动备份文件夹已选择');
    return DB.performAutoBackup(true);
  }).then(function() { checkBackupStatus(); }).catch(function(e) {
    showToast('选择失败：' + (e && e.message ? e.message : '当前环境不支持'), { error: true, duration: 3500 });
  });
}

function forceAutoBackupFile() {
  if (!DB.performAutoBackup) { showToast('当前版本不支持自动备份'); return; }
  DB.flush && DB.flush();
  showToast('正在生成自动备份…', 2000);
  DB.performAutoBackup(true).then(function(info) {
    if (info && info.internal) {
      showToast(info.file ? '✅ 已生成内部备份和本地文件备份' : '✅ 已生成内部备份（当前环境未写出文件）', 3500);
      checkBackupStatus();
    } else {
      showToast('备份生成失败', { error: true });
    }
  });
}

function checkBackupStatus() {
  if (!DB.getBackupStatus) { showToast('当前版本不支持自动备份状态'); return; }
  DB.getBackupStatus().then(function(s) {
    var el = document.getElementById('app-memory-report');
    if (el) {
      var latest = s.latest ? (s.latest.createdAtText + '，' + ((s.latest.bytes || 0) / 1024 / 1024).toFixed(2) + 'MB') : '暂无';
      el.innerHTML = (el.innerHTML || '') +
        '<hr style="border:none;border-top:1px solid #e5e7eb;margin:8px 0;">' +
        '内部备份：' + s.internalCount + ' 份<br>' +
        '最近备份：' + latest + '<br>' +
        '文件夹权限：' + (s.hasDirectory ? '已选择' : '未选择') + '<br>' +
        '文件系统支持：' + (s.supportDirectory ? '支持' : '不支持/需App壳支持') + '<br>' +
        '章节历史版本：' + (s.chapterHistoryCount || 0) + ' 份';
    }
    showToast('自动备份状态：内部' + s.internalCount + '份，文件夹' + (s.hasDirectory ? '已选择' : '未选择'), 3500);
  });
}

function restoreAppMemoryMirror() {
  if (!DB.restoreFromAppMemoryMirror) { showToast('当前版本不支持App级记忆'); return; }
  if (!confirm('确定从App级记忆镜像恢复？当前快速存储会被镜像覆盖。')) return;
  DB.restoreFromAppMemoryMirror().then(function(data) {
    showToast('✅ 已从App记忆镜像恢复，共' + ((data.works && data.works.length) || 0) + '部作品');
    setTimeout(function() { location.reload(); }, 800);
  }).catch(function(e) {
    showToast('恢复失败：' + (e && e.message ? e.message : '没有镜像'), { error: true, duration: 3500 });
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
  } catch(e) { console.warn(e); }
}

function loadMultiAISetting() {
  var el = document.getElementById('multi-ai-toggle');
  if (!el) return;
  try {
    var s = DB.settings;
    el.checked = !!s.multiAI;
    toggleMultiAI(!!s.multiAI);
  } catch(e) {}
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
  overlay.addEventListener('click', function(e) { if (e.target === overlay) hideCustomModal(); });
  document.body.appendChild(overlay);
}

function hideCustomModal() {
  var el = document.getElementById('custom-modal-overlay');
  if (el) el.remove();
}

// HTML转义（兼容center.html中没有引入write-editor.js的场景）
function he(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// 云端实例（全局复用）
window.cloud = null;

function _getCloud() {
  if (!window.cloud) {
    if (typeof CloudSync === 'undefined') {
      console.warn('CloudSync 未加载，跳过云端同步');
      return null;
    }
    var base = localStorage.getItem('wxbj_cloud_base') || '';
    if (!base) {
      // 在 Capacitor/WebView 环境中，本地文件协议下无法使用相对路径
      // 自动切换到远程 API
      var isCapacitor = (typeof window.Capacitor !== 'undefined') ||
        (window.location && window.location.protocol === 'file:') ||
        (window.location && window.location.protocol === 'content:') ||
        (navigator && navigator.userAgent && navigator.userAgent.indexOf('Android') >= 0 && navigator.userAgent.indexOf('wv') >= 0);
      base = isCapacitor ? 'https://wenxin-bijiang.pages.dev/api' : '/api';
    }
    window.cloud = new CloudSync({ apiBase: base });
  }
  return window.cloud;
}

function _updateCloudUI() {
  var c = _getCloud();
  var badge = document.getElementById('cloud-badge');
  var out = document.getElementById('cloud-logged-out');
  var inEl = document.getElementById('cloud-logged-in');
  var userInfo = document.getElementById('cloud-user-info');
  if (!c) {
    if (badge) { badge.textContent = '未登录'; badge.style.background = '#e5e7eb'; badge.style.color = '#6b7280'; }
    if (out) out.style.display = '';
    if (inEl) inEl.style.display = 'none';
    return;
  }
  if (c.isLoggedIn()) {
    if (badge) { badge.textContent = '已登录'; badge.style.background = '#dcfce7'; badge.style.color = '#16a34a'; }
    if (out) out.style.display = 'none';
    if (inEl) inEl.style.display = '';
    if (userInfo && c.user) userInfo.textContent = c.user.email || '';
  } else {
    if (badge) { badge.textContent = '未登录'; badge.style.background = '#e5e7eb'; badge.style.color = '#6b7280'; }
    if (out) out.style.display = '';
    if (inEl) inEl.style.display = 'none';
  }
}

// 配置后端地址
function setCloudBase(base) {
  base = (base || '').replace(/\/$/, '');
  try { localStorage.setItem('wxbj_cloud_base', base); } catch(e) {}
  if (window.cloud) window.cloud.apiBase = base;
  showToast('后端地址已设置为：' + base, { duration: 2000 });
}

// 登录面板
function showLoginPanel() {
  var html = '<div style="padding:8px;">';
  html += '<div style="margin-bottom:10px;">';
  html += '<label style="font-size:12px;color:#6b7280;">后端API地址</label>';
  html += '<input id="cloud-base-input" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:8px;margin-top:2px;" placeholder="https://your-server.com/api" value="' + he(localStorage.getItem('wxbj_cloud_base') || '') + '">';
  html += '</div>';
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

async function cloudLogin() {
  var base = document.getElementById('cloud-base-input').value.trim();
  var email = document.getElementById('cloud-email').value.trim();
  var password = document.getElementById('cloud-password').value.trim();
  if (!email || !password) { showToast('请输入邮箱和密码'); return; }
  if (base) setCloudBase(base);
  try {
    showToast('登录中…', { duration: 3000 });
    await _getCloud().login(email, password);
    _updateCloudUI();
    hideCustomModal();
    showToast('登录成功！');
  } catch(e) {
    showToast('登录失败：' + (e && e.message ? e.message : '未知错误'), { error: true, duration: 3500 });
  }
}

async function cloudRegister() {
  var base = document.getElementById('cloud-base-input').value.trim();
  var email = document.getElementById('cloud-email').value.trim();
  var password = document.getElementById('cloud-password').value.trim();
  if (!email || !password) { showToast('请输入邮箱和密码'); return; }
  if (password.length < 6) { showToast('密码至少6位'); return; }
  if (base) setCloudBase(base);
  try {
    showToast('注册中…', { duration: 3000 });
    await _getCloud().register(email, password, email.split('@')[0] || '');
    _updateCloudUI();
    hideCustomModal();
    showToast('注册成功！已自动登录');
  } catch(e) {
    showToast('注册失败：' + (e && e.message ? e.message : '未知错误'), { error: true, duration: 3500 });
  }
}

function cloudLogout() {
  _getCloud().logout();
  _updateCloudUI();
  showToast('已退出登录');
}

async function cloudSmartSync() {
  try {
    var c = _getCloud();
    if (!c.isLoggedIn()) { showToast('请先登录'); return; }
    showToast('正在智能同步…', { duration: 5000 });
    var report = await c.smartSync();
    var msg = '同步完成：推送 ' + report.pushed + ' 部，拉取 ' + report.pulled + ' 部，无变化 ' + report.unchanged + ' 部';
    if (report.errors > 0) msg += '，错误 ' + report.errors + ' 处';
    showToast(msg);
    document.getElementById('cloud-status').textContent = msg + ' · ' + new Date().toLocaleTimeString();
    // 刷新页面数据
    if (report.pulled > 0) setTimeout(function() { location.reload(); }, 1500);
  } catch(e) {
    showToast('同步失败：' + (e && e.message ? e.message : ''), { error: true });
  }
}

async function cloudPushAll() {
  try {
    var c = _getCloud();
    if (!c.isLoggedIn()) { showToast('请先登录'); return; }
    if (!confirm('将本地所有作品推送到云端。云端同名作品将被更新。继续？')) return;
    showToast('正在上传…', { duration: 10000 });
    if (!DB || !DB.works || DB.works.length === 0) { showToast('没有作品可推送'); return; }
    var items = DB.works.map(function(w) {
      var tw = 0;
      if (w.chapters) w.chapters.forEach(function(c){ if(c.content) tw += c.content.length; });
      // v46：瘦身payload，只保留最近5章完整正文，其余只保留摘要
      var slimW = Object.assign({}, w);
      if (slimW.chapters && slimW.chapters.length > 5) {
        slimW.chapters = slimW.chapters.map(function(ch, ci) {
          if (ci >= slimW.chapters.length - 5) return ch; // 最近5章完整保留
          return { title: ch.title, summary: ch.summary || '', wordCount: ch.wordCount || 0, aiSummary: ch.aiSummary || false };
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
    }).filter(function(x) { return x.workId; });
    var result = await c.pushBatch(items, navigator.userAgent.slice(0, 80));
    var count = result && result.results ? result.results.length : 0;
    showToast('推送完成：' + count + ' 部作品');
  } catch(e) {
    showToast('推送失败：' + (e && e.message ? e.message : ''), { error: true });
  }
}

async function cloudPullAll() {
  try {
    var c = _getCloud();
    if (!c.isLoggedIn()) { showToast('请先登录'); return; }
    if (!confirm('从云端拉取所有作品。本地同名作品将被覆盖。继续？')) return;
    showToast('正在下载…', { duration: 10000 });
    var resp = await c.getWorks();
    var cloudWorks = (resp && resp.works) ? resp.works : [];
    if (cloudWorks.length === 0) { showToast('云端没有作品'); return; }
    var count = 0;
    for (var i = 0; i < cloudWorks.length; i++) {
      var cw = cloudWorks[i];
      var full = await c.getWork(cw.workId);
      if (!full || !full.work || !full.work.payload) continue;
      var pw = full.work.payload;
      pw._version = full.work.version || 1;
      pw.id = full.work.workId;
      pw.title = full.work.title || '';
      // 替换本地同名作品
      var replaced = false;
      if (DB && DB.works) {
        for (var j = 0; j < DB.works.length; j++) {
          if (DB.works[j].id === pw.id) { DB.works[j] = pw; replaced = true; break; }
        }
        if (!replaced) DB.works.push(pw);
      }
      count++;
    }
    try { if (DB && DB.save) DB.save(); } catch(e) {}
    showToast('拉取完成：' + count + ' 部作品，正在刷新…');
    setTimeout(function() { location.reload(); }, 1500);
  } catch(e) {
    showToast('拉取失败：' + (e && e.message ? e.message : ''), { error: true });
  }
}

async function cloudSnapshots() {
  try {
    var c = _getCloud();
    if (!c.isLoggedIn()) { showToast('请先登录'); return; }
    if (!DB || !DB.works || DB.works.length === 0) { showToast('没有作品'); return; }
    // 列出本地作品让用户选择
    var html = '<div style="padding:8px;">';
    html += '<p style="font-size:12px;color:#6b7280;margin-bottom:8px;">选择作品查看云端快照：</p>';
    for (var i = 0; i < DB.works.length; i++) {
      var w = DB.works[i];
      html += '<button onclick="cloudShowSnapshots(\'' + he(w.id || '') + '\')" style="display:block;width:100%;padding:8px;margin:4px 0;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;text-align:left;">' + he(w.title || '未命名') + '</button>';
    }
    html += '</div>';
    showCustomModal('云端快照', html);
  } catch(e) {
    showToast('获取失败：' + (e && e.message ? e.message : ''), { error: true });
  }
}

async function cloudShowSnapshots(workId) {
  try {
    var c = _getCloud();
    var resp = await c.getSnapshots(workId);
    var snaps = (resp && resp.snapshots) ? resp.snapshots : [];
    if (snaps.length === 0) { showToast('暂无快照'); return; }
    var html = '<div style="padding:8px;max-height:400px;overflow:auto;">';
    html += '<p style="font-size:12px;color:#6b7280;">共 ' + snaps.length + ' 个版本。点击恢复：</p>';
    for (var i = 0; i < snaps.length; i++) {
      var s = snaps[i];
      var sizeStr = s.size < 1024 ? s.size + 'B' : s.size < 1048576 ? (s.size / 1024).toFixed(1) + 'KB' : (s.size / 1048576).toFixed(1) + 'MB';
      html += '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:8px;margin:4px 0;">';
      html += '<span style="font-weight:600;">V' + s.version + '</span> · ' + new Date(s.createdAt).toLocaleString();
      html += ' · ' + sizeStr;
      html += ' <button onclick="cloudRestoreSnapshot(\'' + he(workId) + '\',\'' + s.id + '\')" style="float:right;padding:4px 10px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">恢复</button>';
      html += '</div>';
    }
    html += '</div>';
    showCustomModal('版本快照', html);
  } catch(e) {
    showToast('获取快照失败：' + (e && e.message ? e.message : ''), { error: true });
  }
}

async function cloudRestoreSnapshot(workId, snapId) {
  try {
    var c = _getCloud();
    var resp = await c.restoreSnapshot(workId, snapId);
    if (resp && resp.work) {
      var pw = resp.work.payload;
      pw._version = resp.work.version || 1;
      // 替换本地同名作品
      if (DB && DB.works) {
        for (var j = 0; j < DB.works.length; j++) {
          if (DB.works[j].id === workId) { DB.works[j] = pw; break; }
        }
        DB.save();
      }
      showToast('已恢复到 V' + resp.restoredFromVersion + '，正在刷新…');
      setTimeout(function() { location.reload(); }, 1500);
    }
  } catch(e) {
    showToast('恢复失败：' + (e && e.message ? e.message : ''), { error: true });
  }
}

// 页面加载时刷新UI
(function() {
  setTimeout(_updateCloudUI, 200);
})();