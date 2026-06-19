/**
 * nav-helper.js - 文心笔匠 导航优化助手 v2
 *
 * 优化：
 * 1. 即时跳转（去掉80ms延迟）
 * 2. hover/touch 预加载（prefetch 页面资源）
 * 3. ViewTransition API 平滑过渡
 * 4. 减轻遮罩时间，减少等待感
 */
(function () {
  'use strict';

  // ===== 配置 =====
  var NAV_LOADING_MIN_MS = 120;  // 加载遮罩最少显示时间（ms），降至120ms减少感知延迟
  var DEBOUNCE_MS = 200;         // 防抖间隔（ms），200ms足够防误触

  // ===== 状态 =====
  var _lastNavTime = 0;
  var _navCount = 0;
  var _loadingTimer = null;
  var _hideTimer = null;
  var _indicatorStyleEl = null;
  var _initialized = false;
  var _prefetched = {}; // 已预加载的页面

  // 预定义的 tab 页面路径映射
  var TAB_PAGES = {
    'index':      'index.html',
    'architecture': 'architecture.html',
    'settings':   'settings.html',
    'write':      'write.html',
    'work-list':  'work-list.html',
    'center':     'center.html',
    'new-book':   'new-book.html',
    'data-predict': 'data-predict.html'
  };

  // ===== 加载遮罩层 =====

  function getOrCreateLoadingEl() {
    var el = document.getElementById('nav-loading-overlay');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'nav-loading-overlay';
    el.innerHTML =
      '<div class="nav-loading-inner">' +
        '<div class="nav-loading-spinner"></div>' +
        '<div class="nav-loading-text">加载中…</div>' +
      '</div>';
    el.style.cssText =
      'position:fixed;inset:0;z-index:99999;' +
      'background:rgba(255,255,255,0.92);' +
      'display:flex;align-items:center;justify-content:center;' +
      'opacity:0;pointer-events:none;' +
      'transition:opacity 0.12s ease';
    document.body.appendChild(el);

    var style = document.createElement('style');
    style.textContent = [
      '.nav-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px}',
      '.nav-loading-spinner{width:36px;height:36px;border:3px solid #e0e7ff;border-top-color:#6366f1;border-radius:50%;animation:navSpin .7s linear infinite}',
      '.nav-loading-text{font-size:13px;color:#6366f1;font-weight:500}',
      '@keyframes navSpin{to{transform:rotate(360deg)}}',
      '.nav-page-ready{animation:navPageIn .25s ease forwards}',
      '@keyframes navPageIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
      '.nav-tab-bar{position:relative;overflow:hidden}',
      '.nav-tab-indicator{position:absolute;bottom:0;height:2px;background:#6366f1;border-radius:2px 2px 0 0;transition:left .22s cubic-bezier(.4,0,.2,1),width .22s cubic-bezier(.4,0,.2,1);pointer-events:none}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);

    return el;
  }

  function showNavLoading(text) {
    if (typeof text === 'string') {
      var txtEl = document.querySelector('.nav-loading-text');
      if (txtEl) txtEl.textContent = text;
    }
    var el = getOrCreateLoadingEl();
    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';
  }

  function hideNavLoading() {
    if (_hideTimer) return;
    var elapsed = Date.now() - _lastNavTime;
    var delay = Math.max(0, NAV_LOADING_MIN_MS - elapsed);
    _hideTimer = setTimeout(function () {
      _hideTimer = null;
      var el = document.getElementById('nav-loading-overlay');
      if (el) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      }
    }, delay);
  }

  // ===== 防抖检查 =====

  function canNavigate() {
    var now = Date.now();
    if (now - _lastNavTime < DEBOUNCE_MS) {
      return false;
    }
    _lastNavTime = now;
    return true;
  }

  // ===== Tab 活跃指示器 =====

  function updateTabIndicator(tabBar, activeItem) {
    if (!tabBar || !activeItem) return;
    var barRect = tabBar.getBoundingClientRect();
    var itemRect = activeItem.getBoundingClientRect();
    var left = itemRect.left - barRect.left;
    var width = itemRect.width;

    var indicator = tabBar.querySelector('.nav-tab-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'nav-tab-indicator';
      tabBar.appendChild(indicator);
    }
    indicator.style.left = left + 'px';
    indicator.style.width = width + 'px';
  }

  // ===== v2: 页面预加载（hover/touch时提前加载） =====

  function prefetchPage(url) {
    if (!url || _prefetched[url]) return;
    _prefetched[url] = true;
    
    // 使用 prefetch 预加载页面 HTML
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);
    
    // 同时预加载该页面的关键 JS
    var pageName = url.replace(/\.html$/, '');
    var jsMap = {
      'architecture': 'architecture.html',
      'write': 'write.html',
      'settings': 'settings.html',
      'work-list': 'work-list.html',
      'index': 'index.html'
    };
    // 预加载 settings 页面可能需要的资源
    if (url === 'settings.html') {
      var prefetchApi = document.createElement('link');
      prefetchApi.rel = 'prefetch';
      prefetchApi.href = 'assets/js/api.js';
      prefetchApi.as = 'script';
      document.head.appendChild(prefetchApi);
    }
  }

  // ===== v2: 核心导航（即时跳转，无延迟） =====

  function navigate(url, tabName) {
    if (!canNavigate()) return;

    _navCount++;

    // 1. 立即显示加载遮罩
    showNavLoading('页面切换中…');

    // 2. 更新 localStorage
    if (tabName && url) {
      try {
        localStorage.setItem('wxbj_last_page', tabName);
      } catch (e) {}
    }

    // 3. v2: 使用 ViewTransition 或立即跳转（去掉80ms延迟）
    if (document.startViewTransition) {
      document.startViewTransition(function () {
        window.location.href = url;
      });
    } else {
      // 无 ViewTransition 支持时直接跳转，不延迟
      window.location.href = url;
    }
  }

  // ===== 页面就绪动画 =====

  function triggerPageReady() {
    if (_navCount <= 1) {
      var main = document.querySelector('.page-body,main,.main-content,#main-content,body');
      if (main) {
        main.classList.add('nav-page-ready');
        setTimeout(function () {
          try { main.classList.remove('nav-page-ready'); } catch (e) {}
        }, 600);
      }
    }
  }

  // ===== Tab-bar 初始化：拦截原有 onclick + 添加预加载 =====

  function initTabBar() {
    if (_initialized) return;
    _initialized = true;

    var tabBars = document.querySelectorAll('.tab-bar');
    tabBars.forEach(function (tabBar) {
      tabBar.classList.add('nav-tab-bar');

      var items = tabBar.querySelectorAll('.tab-item');
      items.forEach(function (item) {
        var onclickAttr = item.getAttribute('onclick') || '';
        var match = onclickAttr.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (!match) return;
        var targetUrl = match[1];

        var tabName = null;
        for (var k in TAB_PAGES) {
          if (TAB_PAGES[k] === targetUrl) {
            tabName = k;
            break;
          }
        }

        var currentPageFile = window.location.pathname.split('/').pop() || 'index.html';
        var isCurrentPage = (targetUrl === currentPageFile) ||
          (targetUrl === '' && currentPageFile === 'index.html');

        if (isCurrentPage) {
          item.classList.add('active');
          updateTabIndicator(tabBar, item);
        } else {
          item.classList.remove('active');
        }

        item.setAttribute('data-nav-url', targetUrl);
        item.setAttribute('data-nav-tab', tabName || '');
        item.removeAttribute('onclick');

        item.addEventListener('click', function (e) {
          e.preventDefault();
          var url = this.getAttribute('data-nav-url');
          var name = this.getAttribute('data-nav-tab');
          navigate(url, name);
        });

        // v2: hover/touch 时预加载目标页面
        if (!isCurrentPage && targetUrl) {
          item.addEventListener('mouseenter', function () {
            prefetchPage(targetUrl);
          }, { once: true });
          item.addEventListener('touchstart', function () {
            prefetchPage(targetUrl);
          }, { once: true, passive: true });
        }
      });

      window.addEventListener('resize', (function (bar) {
        var debounce = null;
        return function () {
          if (debounce) clearTimeout(debounce);
          debounce = setTimeout(function () {
            var active = bar.querySelector('.tab-item.active');
            if (active) updateTabIndicator(bar, active);
          }, 120);
        };
      })(tabBar), { passive: true });
    });
  }

  // ===== 全局暴露 =====

  window.navHelper = {
    navigate: navigate,
    showLoading: showNavLoading,
    hideLoading: hideNavLoading,
    init: initTabBar,
    prefetch: prefetchPage
  };

  // ===== DOMContentLoaded 后自动初始化 =====

  function bootstrap() {
    var waitForDB = function (cb, attempts) {
      attempts = attempts || 0;
      if (typeof DB !== 'undefined' && typeof DB.init === 'function') {
        cb();
      } else if (attempts < 20) {
        setTimeout(function () { waitForDB(cb, attempts + 1); }, 50);
      } else {
        cb();
      }
    };

    waitForDB(function () {
      triggerPageReady();
      initTabBar();
      hideNavLoading();
    }, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();