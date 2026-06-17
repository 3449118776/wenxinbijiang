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

// === Loading：进度条模式（替代 spinner）===
var _loadingText = '';
var _loadingPct = 0;
var _loadingTimer = null;
var _loadingInc = 0;
var _loadingHideTimers = []; // hideLoading 的淡出定时器，showLoading 时需清除
function showLoading(text, keepProgress) {
  _loadingText = text || '加载中…';
  if (!keepProgress) {
    _loadingPct = 0;
    _loadingInc = 0;
  }
  if (_loadingTimer && !keepProgress) clearInterval(_loadingTimer);
  // 清除 hideLoading 留下的淡出定时器，防止 loading 被意外隐藏
  if (_loadingHideTimers.length) {
    _loadingHideTimers.forEach(function(t){ clearTimeout(t); });
    _loadingHideTimers = [];
  }

  var el = document.querySelector('#app-loading');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-loading';
    el.innerHTML =
      '<div class="loading-content">'
      + '<div class="loading-progress-bar"><div class="loading-progress-fill" id="loading-pct-bar"></div></div>'
      + '<div class="loading-text-wrap"><span class="loading-text">' + _loadingText + '</span><span class="loading-pct">' + Math.round(_loadingPct) + '%</span></div>'
      + '</div>';
    document.body.appendChild(el);
  } else {
    el.querySelector('.loading-text').textContent = _loadingText;
    if (!keepProgress) {
      el.querySelector('.loading-pct').textContent = '0%';
      el.querySelector('.loading-progress-fill').style.width = '0%';
    }
    el.style.opacity = '1';
  }
  el.style.display = 'flex';

  // 模拟进度增长（因为不确定实际进度）
  if (!keepProgress) {
    _loadingTimer = setInterval(function() {
      if (_loadingPct < 85) {
        // 前期加速
        _loadingInc = Math.random() * 3 + 1;
        _loadingPct = Math.min(85, _loadingPct + _loadingInc);
        var fill = el.querySelector('.loading-progress-fill');
        var pctEl = el.querySelector('.loading-pct');
        if (fill) fill.style.width = _loadingPct + '%';
        if (pctEl) pctEl.textContent = Math.round(_loadingPct) + '%';
      }
    }, 200);
  }
}

function hideLoading() {
  if (_loadingTimer) { clearInterval(_loadingTimer); _loadingTimer = null; }
  // 清除可能残留的淡出定时器
  _loadingHideTimers.forEach(function(t){ clearTimeout(t); });
  _loadingHideTimers = [];
  var el = document.querySelector('#app-loading');
  if (!el) return;
  
  // 完成进度条
  var fill = el.querySelector('.loading-progress-fill');
  var pctEl = el.querySelector('.loading-pct');
  if (fill) fill.style.width = '100%';
  if (pctEl) pctEl.textContent = '100%';
  
  var t1 = setTimeout(function() {
    el.style.opacity = '0';
    var t2 = setTimeout(function() {
      if (el.style.opacity === '0') el.style.display = 'none';
    }, 300);
    _loadingHideTimers.push(t2);
  }, 200);
  _loadingHideTimers.push(t1);
}

// 外部可调用：更新加载进度（0-100）
window.updateLoadingProgress = function(pct, text) {
  var el = document.querySelector('#app-loading');
  if (!el) return;
  _loadingPct = Math.max(0, Math.min(100, pct));
  var fill = el.querySelector('.loading-progress-fill');
  var pctEl = el.querySelector('.loading-pct');
  var txtEl = el.querySelector('.loading-text');
  if (fill) fill.style.width = _loadingPct + '%';
  if (pctEl) pctEl.textContent = Math.round(_loadingPct) + '%';
  if (text && txtEl) txtEl.textContent = text;
};

// 注入 loading 进度条样式（只注入一次）
(function() {
  if (document.getElementById('loading-style')) return;
  var s = document.createElement('style');
  s.id = 'loading-style';
  s.textContent = 
    '#app-loading{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.25);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:10000;transition:opacity 0.3s;pointer-events:none;}'
    + '.loading-content{width:320px;text-align:center;background:#fff;border-radius:12px;padding:20px 24px;box-shadow:0 8px 32px rgba(0,0,0,0.2);pointer-events:auto;}'
    + '.loading-progress-bar{height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;margin-bottom:12px;}'
    + '.loading-progress-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);width:0%;border-radius:4px;transition:width 0.2s ease;}'
    + '.loading-text-wrap{display:flex;justify-content:space-between;align-items:center;}'
    + '.loading-text{font-size:13px;color:#333;}'
    + '.loading-pct{font-size:13px;color:#6366f1;font-weight:600;min-width:40px;text-align:right;}';
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
