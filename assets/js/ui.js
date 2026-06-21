/* 文心笔匠 - UI工具模块 */

// === Toast：状态重置 + 队列 ===
var _toastTimer = null;
function showToast(msg, opts) {
  // 兼容旧调用：showToast('xxx', 3000)
  if (typeof opts === 'number') opts = { duration: opts };
  opts = opts || {};
  var t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  // v48: 支持 type 参数 (success/info/warn/error) + 旧式 opts.error 兼容
  var type = opts.type || (opts.error ? 'error' : 'default');
  var bgMap = {
    error:   '#ef4444',  // 红
    warn:    '#f59e0b',  // 橙黄
    success: '#10b981',  // 绿
    info:    '#3b82f6',  // 蓝
    default: '#333333'
  };
  t.textContent = msg;
  t.style.background = bgMap[type] || bgMap.default;
  t.style.color = '#fff';
  t.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  var duration = Math.max(800, opts.duration || 2000);
  _toastTimer = setTimeout(function() {
    t.classList.remove('show');
    if (typeof opts.onClose === 'function') {
      try { opts.onClose(); } catch(e) {}
    }
  }, duration);
}

// === Loading：单一连续进度条（从0动画到100，永不中途重置）===
// 核心原则：
// 1. showLoading(text) — 如已显示只更新文字；未显示则从0起步
// 2. updateLoadingProgress(pct, text) — 动画缓慢推进到目标百分比（不是跳变）
// 3. hideLoading() — 先推进到100停留2秒，再淡出
// 4. 动画由 requestAnimationFrame 驱动，easeOutCubic 缓动，视觉为缓慢填充

var _loadingTarget = 0;        // 目标百分比（0-100）
var _loadingCurrent = 0;       // 当前显示百分比（动画值）
var _loadingText = '';
var _loadingAnimRAF = null;    // 动画帧 id
var _loadingHideTimers = [];   // hideLoading 的淡出定时器
var _loadingIsVisible = false; // 当前是否显示
var _loadingLastStepTime = 0;  // 上次动画帧时间

function _applyLoadingUI(pct, text) {
  // 更新 #app-loading
  var el = document.querySelector('#app-loading');
  if (el) {
    var fill = el.querySelector('.loading-progress-fill');
    var pctEl = el.querySelector('.loading-pct');
    var txtEl = el.querySelector('.loading-text');
    var subEl = el.querySelector('.loading-subtitle');
    if (fill) fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = Math.round(pct) + '%';
    if (text && txtEl) txtEl.textContent = text;
    if (text && subEl) subEl.textContent = text;
  }
  // 更新 architecture.html 页面内的进度条
  var progBar = document.getElementById('prog-bar');
  var progPct = document.getElementById('prog-pct');
  var progDetail = document.getElementById('prog-detail');
  var progTitle = document.getElementById('prog-title');
  if (progBar) progBar.style.width = pct + '%';
  if (progPct) progPct.textContent = Math.round(pct) + '%';
  if (text && progDetail) progDetail.textContent = text;
  if (text && progTitle) progTitle.textContent = text;
}

function _ensureLoadingElement() {
  var el = document.querySelector('#app-loading');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-loading';
    el.innerHTML =
      '<div class="loading-content">'
      + '<div class="loading-logo">✍️</div>'
      + '<div class="loading-title">文心笔匠</div>'
      + '<div class="loading-subtitle">正在准备创作环境…</div>'
      + '<div class="loading-progress-bar"><div class="loading-progress-fill" style="width:0%"></div></div>'
      + '<div class="loading-text-wrap"><span class="loading-text">加载中…</span><span class="loading-pct">0%</span></div>'
      + '</div>';
    document.body.appendChild(el);
  }
  // architecture.html 页面内的进度条
  var detailProg = document.getElementById('detail-progress');
  if (detailProg) detailProg.style.display = '';
  return el;
}

function _tickLoadingAnim() {
  if (!_loadingIsVisible) return;
  var now = performance.now();
  var dt = Math.min(100, now - _loadingLastStepTime); // 最大步长100ms，防止暂停后跳变
  _loadingLastStepTime = now;

  var diff = _loadingTarget - _loadingCurrent;
  if (Math.abs(diff) < 0.15) {
    _loadingCurrent = _loadingTarget;
    _applyLoadingUI(_loadingCurrent, _loadingText);
    _loadingAnimRAF = null;
    return; // 到达目标，停止动画
  }

  // 动画速度：每秒推进差值的 65%（接近目标时变慢）
  // 用 easeOutCubic 风格：接近目标时推进速度递减
  var stepRatio = 1 - Math.pow(0.001, dt / 1000); // 每秒剩余1‰
  // 保证最小推进速度（让用户感觉到"在动"）
  var minStep = dt / 200; // 每秒至少推进5%
  var step = Math.max(Math.abs(diff) * stepRatio, Math.min(Math.abs(diff), minStep));
  if (diff < 0) step = -step;
  _loadingCurrent += step;
  // 边界
  if (_loadingCurrent < 0) _loadingCurrent = 0;
  if (_loadingCurrent > 100) _loadingCurrent = 100;

  _applyLoadingUI(_loadingCurrent, _loadingText);
  _loadingAnimRAF = requestAnimationFrame(_tickLoadingAnim);
}

function _startLoadingAnimIfNeeded() {
  if (_loadingAnimRAF) return;
  if (Math.abs(_loadingTarget - _loadingCurrent) < 0.15) return;
  _loadingLastStepTime = performance.now();
  _loadingAnimRAF = requestAnimationFrame(_tickLoadingAnim);
}

function showLoading(text, keepProgress) {
  // 清除之前的淡出定时器
  if (_loadingHideTimers.length) {
    _loadingHideTimers.forEach(function(t){ clearTimeout(t); });
    _loadingHideTimers = [];
  }

  if (text) _loadingText = text;

  // 如果已经可见 → 只更新文字，保持当前进度（永不重置！）
  if (_loadingIsVisible) {
    _applyLoadingUI(_loadingCurrent, _loadingText);
    return;
  }

  // 不可见 → 新建或显示，从0起步
  _loadingIsVisible = true;
  if (!keepProgress) {
    _loadingCurrent = 0;
    _loadingTarget = 0;
  }
  var el = _ensureLoadingElement();
  el.style.display = 'flex';
  el.style.opacity = '1';
  _applyLoadingUI(_loadingCurrent, _loadingText);
}

// 显式重置到0% — 仅在用户明确开启新任务时调用
function resetLoading(text) {
  if (text) _loadingText = text;
  _loadingCurrent = 0;
  _loadingTarget = 0;
  var el = _ensureLoadingElement();
  el.style.display = 'flex';
  el.style.opacity = '1';
  _loadingIsVisible = true;
  _applyLoadingUI(0, _loadingText);
}

window.updateLoadingProgress = function(pct, text) {
  // 先停掉之前的虚拟推进（如果有）
  if (_autoTimer) { clearTimeout(_autoTimer); _autoTimer = null; }
  var newTarget = Math.max(0, Math.min(100, pct));
  if (newTarget < _loadingCurrent - 0.5) return;
  _loadingTarget = newTarget;
  if (text) _loadingText = text;

  if (!_loadingIsVisible) {
    var el = _ensureLoadingElement();
    el.style.display = 'flex';
    el.style.opacity = '1';
    _loadingIsVisible = true;
  }
  _applyLoadingUI(_loadingCurrent, _loadingText);
  _startLoadingAnimIfNeeded();
};

// v58: 虚拟推进器 —— 在非流式 API 调用期间缓慢推进度条，避免长时间停在同一个数字上
var _autoTimer = null;
var _autoTargetPct = 0;
window.startAutoLoadingProgress = function(targetPct, text) {
  if (_autoTimer) { clearTimeout(_autoTimer); _autoTimer = null; }
  _autoTargetPct = Math.max(_loadingTarget, Math.min(100, targetPct));
  if (text) _loadingText = text;
  if (!_loadingIsVisible) {
    var el = _ensureLoadingElement();
    el.style.display = 'flex';
    el.style.opacity = '1';
    _loadingIsVisible = true;
  }
  function tick() {
    // 每 400ms 推进一小段，最终缓慢趋近 _autoTargetPct
    var remaining = _autoTargetPct - _loadingCurrent;
    if (remaining <= 0.2) { _autoTimer = null; return; }
    var step = Math.max(0.3, remaining / 40); // 每次推进一点点，接近目标时减速
    _loadingTarget = Math.min(_autoTargetPct, _loadingCurrent + step);
    _applyLoadingUI(_loadingCurrent, _loadingText);
    _startLoadingAnimIfNeeded();
    _autoTimer = setTimeout(tick, 400);
  }
  tick();
};
window.stopAutoLoadingProgress = function() {
  if (_autoTimer) { clearTimeout(_autoTimer); _autoTimer = null; }
  // 停后让进度条动画追上当前 target（立即应用到最终位置）
  _loadingCurrent = _loadingTarget;
  _applyLoadingUI(_loadingCurrent, _loadingText);
};

function hideLoading() {
  // 清除淡出定时器
  if (_loadingHideTimers.length) {
    _loadingHideTimers.forEach(function(t){ clearTimeout(t); });
    _loadingHideTimers = [];
  }
  if (!_loadingIsVisible) return;

  // 先推进到100%
  _loadingTarget = 100;
  _applyLoadingUI(_loadingCurrent, _loadingText);
  _startLoadingAnimIfNeeded();

  // 2秒后淡出 — 让用户看到100%完成
  var t1 = setTimeout(function() {
    var el = document.querySelector('#app-loading');
    if (el) el.style.opacity = '0';
    var detailProg = document.getElementById('detail-progress');
    if (detailProg) detailProg.style.display = 'none';
    var t2 = setTimeout(function() {
      var el2 = document.querySelector('#app-loading');
      if (el2 && el2.style.opacity === '0') el2.style.display = 'none';
      _loadingIsVisible = false;
    }, 300);
    _loadingHideTimers.push(t2);
  }, 2000);
  _loadingHideTimers.push(t1);
}

// 注入 loading 进度条样式（只注入一次）
(function() {
  if (document.getElementById('loading-style')) return;
  var s = document.createElement('style');
  s.id = 'loading-style';
  s.textContent = 
    '#app-loading{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.88);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:100000;transition:opacity 0.35s;pointer-events:none;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}'
    + '.loading-content{width:300px;text-align:center;background:#fff;border-radius:20px;padding:28px 28px 24px;box-shadow:0 12px 48px rgba(99,102,241,0.18),0 2px 8px rgba(0,0,0,0.08);pointer-events:auto;border:1px solid rgba(99,102,241,0.1);}'
    + '.loading-logo{font-size:32px;margin-bottom:16px;}'
    + '.loading-title{font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:4px;}'
    + '.loading-subtitle{font-size:12px;color:#9ca3af;margin-bottom:20px;}'
    + '.loading-progress-bar{height:10px;background:#f1f5f9;border-radius:6px;overflow:hidden;margin-bottom:14px;}'
    + '.loading-progress-fill{height:100%;width:0%;border-radius:6px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa);background-size:200% 100%;animation:loadingShimmer 1.8s ease infinite;}'
    + '.loading-text-wrap{display:flex;justify-content:space-between;align-items:center;}'
    + '.loading-text{font-size:13px;color:#6b7280;}'
    + '.loading-pct{font-size:13px;color:#6366f1;font-weight:700;min-width:44px;text-align:right;}'
    + '.loading-dots{font-size:13px;color:#6366f1;letter-spacing:2px;}'
    + '@keyframes loadingShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}'
    + '@keyframes loadingPulse{0%,100%{opacity:1}50%{opacity:0.6}}';
  document.head.appendChild(s);
})();

function showModal(id) {
  var m = document.querySelector('#' + id);
  if (m) m.classList.add('open');
}
function hideModal(id) {
  var m = document.querySelector('#' + id);
  if (m) m.classList.remove('open');
}

function fmtDate(d) {
  if (!d) return '';
  var date = new Date(d);
  return date.toLocaleDateString('zh-CN').replace(/\//g, '-');
}

function safeFileName(name) {
  return (name || '').replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
}

function getWork() { return window.DB.getWork(); }
function saveWork(work) { window.DB.saveWork(work); }

// ========== v47: 进度条 loading ==========
var _progressEl = null;
function showProgress(text, percent) {
  percent = percent || 0;
  if (!_progressEl) {
    _progressEl = document.createElement('div');
    _progressEl.id = 'app-progress';
    _progressEl.innerHTML =
      '<div class="progress-ring"><svg viewBox="0 0 80 80"><circle class="progress-ring-bg" cx="40" cy="40" r="34"/><circle class="progress-ring-fill" cx="40" cy="40" r="34"/></svg><div class="progress-pct">0%</div></div>'
      + '<div class="progress-text">' + (text || '处理中…') + '</div>';
    document.body.appendChild(_progressEl);
  }
  _progressEl.style.display = 'flex';
  _progressEl.style.opacity = '1';
  _updateProgressUI(percent, text);
}

function updateProgress(percent, text) {
  if (!_progressEl) { showProgress(text || '处理中…', percent); return; }
  _updateProgressUI(percent, text);
}

function hideProgress() {
  if (!_progressEl) return;
  _progressEl.style.opacity = '0';
  setTimeout(function() {
    if (_progressEl && _progressEl.style.opacity === '0') _progressEl.style.display = 'none';
  }, 400);
}

function _updateProgressUI(percent, text) {
  if (!_progressEl) return;
  percent = Math.max(0, Math.min(100, Math.round(percent)));
  var fill = _progressEl.querySelector('.progress-ring-fill');
  var pctEl = _progressEl.querySelector('.progress-pct');
  var txtEl = _progressEl.querySelector('.progress-text');
  if (fill) {
    var circumference = 2 * Math.PI * 34;
    var offset = circumference * (1 - percent / 100);
    fill.style.strokeDasharray = circumference;
    fill.style.strokeDashoffset = offset;
  }
  if (pctEl) pctEl.textContent = percent + '%';
  if (txtEl && text) txtEl.textContent = text;
}

// 挂载到全局
window.showToast = showToast;
window.showLoading = showLoading;
window.resetLoading = resetLoading;
window.hideLoading = hideLoading;
window.showProgress = showProgress;
window.updateProgress = updateProgress;
window.hideProgress = hideProgress;
window.showModal = showModal;
window.hideModal = hideModal;
window.fmtDate = fmtDate;
window.safeFileName = safeFileName;
window.getWork = getWork;
window.saveWork = saveWork;

// === 全局错误边界：捕获未处理的异常，防止白屏 ===
window.addEventListener('error', function(e) {
  var msg = '页面出现异常，请刷新重试';
  try {
    if (e && e.error && e.error.message) {
      msg = '异常：' + (e.error.message || '').substring(0, 80);
    }
    console.error('[ErrorBoundary]', e.error || e.message);
  } catch(ignore) {}
  try { showToast(msg, { error: true, duration: 5000 }); } catch(ignore) {}
});

// 捕获未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', function(e) {
  try {
    console.error('[UnhandledRejection]', e.reason);
    var msg = '操作失败：' + ((e.reason && e.reason.message) || e.reason || '未知错误');
    showToast(msg.substring(0, 120), { error: true, duration: 4000 });
  } catch(ignore) {}
});
