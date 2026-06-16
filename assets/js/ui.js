"use strict";

/* 文心笔匠 - UI工具模块 */

// === Toast：状态重置 + 队列 ===
var _toastTimer = null;
function showToast(msg, opts) {
  // 兼容旧调用：showToast('xxx', 3000)
  if (typeof opts === 'number') opts = {
    duration: opts
  };
  opts = opts || {};
  var t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  // 强制重置样式，避免上次错误样式残留
  t.textContent = msg;
  t.style.background = opts.error ? '#ef4444' : '#333';
  t.style.color = '#fff';
  t.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  var duration = Math.max(800, opts.duration || 2000);
  _toastTimer = setTimeout(function () {
    t.classList.remove('show');
    if (typeof opts.onClose === 'function') {
      try {
        opts.onClose();
      } catch (e) {}
    }
  }, duration);
}

// === Loading：双向互锁，防 hide/show 竞态 ===
var _hideTimer = null;
var _loadingDepth = 0;
function showLoading(text) {
  _loadingDepth++;
  // 关闭中的计时立即清掉
  if (_hideTimer) {
    clearTimeout(_hideTimer);
    _hideTimer = null;
  }
  var el = document.querySelector('#app-loading');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-loading';
    el.innerHTML = '<div class="loading-spinner">' + '<svg viewBox="0 0 50 50" width="40" height="40">' + '<circle cx="25" cy="25" r="20" fill="none" stroke="#e0e0e0" stroke-width="4"/>' + '<circle cx="25" cy="25" r="20" fill="none" stroke="#6366f1" stroke-width="4" stroke-linecap="round" stroke-dasharray="80 50" class="loading-spin-circle"/>' + '</svg>' + '</div>' + '<div class="loading-text" style="font-size:14px;color:#888;margin-top:10px;">' + (text || '加载中…') + '</div>';
    document.body.appendChild(el);
  } else {
    var txtEl = el.querySelector('.loading-text');
    if (txtEl) txtEl.textContent = text || '加载中…';
    el.style.opacity = '1';
  }
  el.style.display = 'flex';
}
function hideLoading() {
  if (_loadingDepth > 0) _loadingDepth--;
  if (_loadingDepth > 0) return; // 仍有未结束的 loading
  var el = document.querySelector('#app-loading');
  if (!el) return;
  if (_hideTimer) clearTimeout(_hideTimer);
  el.style.opacity = '0';
  _hideTimer = setTimeout(function () {
    // 只有在没有新 showLoading 把 opacity 改回 1 时才隐藏
    if (el && el.style.opacity === '0' && _loadingDepth === 0) {
      el.style.display = 'none';
    }
    _hideTimer = null;
  }, 300);
}

// 注入 loading 动画样式（只注入一次）
(function () {
  if (document.getElementById('loading-spin-style')) return;
  var s = document.createElement('style');
  s.id = 'loading-spin-style';
  s.textContent = '#app-loading{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10000;transition:opacity 0.3s;}' + '.loading-spinner{animation:loading-spin 1s linear infinite;}' + '.loading-spin-circle{animation:loading-dash 1.5s ease-in-out infinite;}' + '@keyframes loading-spin{100%{transform:rotate(360deg)}}' + '@keyframes loading-dash{0%{stroke-dasharray:1 200;stroke-dashoffset:0}50%{stroke-dasharray:80 50;stroke-dashoffset:-35}100%{stroke-dasharray:80 50;stroke-dashoffset:-125}}';
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
function getWork() {
  return window.DB.getWork();
}
function saveWork(work) {
  window.DB.saveWork(work);
}

// ========== v47: 进度条 loading ==========
var _progressEl = null;
function showProgress(text, percent) {
  percent = percent || 0;
  if (!_progressEl) {
    _progressEl = document.createElement('div');
    _progressEl.id = 'app-progress';
    _progressEl.innerHTML = '<div class="progress-ring"><svg viewBox="0 0 80 80"><circle class="progress-ring-bg" cx="40" cy="40" r="34"/><circle class="progress-ring-fill" cx="40" cy="40" r="34"/></svg><div class="progress-pct">0%</div></div>' + '<div class="progress-text">' + (text || '处理中…') + '</div>';
    document.body.appendChild(_progressEl);
  }
  _progressEl.style.display = 'flex';
  _progressEl.style.opacity = '1';
  _updateProgressUI(percent, text);
}
function updateProgress(percent, text) {
  if (!_progressEl) {
    showProgress(text || '处理中…', percent);
    return;
  }
  _updateProgressUI(percent, text);
}
function hideProgress() {
  if (!_progressEl) return;
  _progressEl.style.opacity = '0';
  setTimeout(function () {
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
window.addEventListener('error', function (e) {
  var msg = '页面出现异常，请刷新重试';
  try {
    if (e && e.error && e.error.message) {
      msg = '异常：' + (e.error.message || '').substring(0, 80);
    }
    console.error('[ErrorBoundary]', e.error || e.message);
  } catch (ignore) {}
  try {
    showToast(msg, {
      error: true,
      duration: 5000
    });
  } catch (ignore) {}
});

// 捕获未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', function (e) {
  try {
    console.error('[UnhandledRejection]', e.reason);
    var msg = '操作失败：' + (e.reason && e.reason.message || e.reason || '未知错误');
    showToast(msg.substring(0, 120), {
      error: true,
      duration: 4000
    });
  } catch (ignore) {}
});