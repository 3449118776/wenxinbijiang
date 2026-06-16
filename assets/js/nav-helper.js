/**
 * nav-helper.js - 文心笔匠 导航优化助手
 *
 * 功能：
 * 1. 导航加载遮罩 —— 切换页面时显示过渡动画，用户感知流畅
 * 2. Tab 点击防抖 —— 防止快速连续点击导致多次页面加载
 * 3. 活跃指示器动画 —— tab 切换时指示器平滑滑动
 * 4. 导航状态管理 —— 记录当前页，刷新后正确高亮
 * 5. 页面预加载提示 —— 减少感知等待时间
 *
 * 使用方法：在各页面 <script src="assets/js/ui.js"> 之后引入本文件即可。
 * 各页面的 tab-bar 按钮保持原有 onclick 逻辑不变，navHelper 会自动拦截增强。
 */
(function () {
  'use strict';

  // ===== 配置 =====
  var NAV_LOADING_MIN_MS = 300;  // 加载遮罩最少显示时间（ms），避免闪烁
  var DEBOUNCE_MS = 400;         // 防抖间隔（ms），此时间内重复点击会被忽略

  // ===== 状态 =====
  var _lastNavTime = 0;
  var _navCount = 0;
  var _loadingTimer = null;
  var _hideTimer = null;
  var _indicatorStyleEl = null;
  var _initialized = false;

  // 预定义的 tab 页面路径映射（用于预加载提示和状态判断）
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
      'transition:opacity 0.18s ease';
    document.body.appendChild(el);

    // 注入微调样式（仅首次）
    var style = document.createElement('style');
    style.textContent = [
      '.nav-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px}',
      '.nav-loading-spinner{width:36px;height:36px;border:3px solid #e0e7ff;border-top-color:#6366f1;border-radius:50%;animation:navSpin .7s linear infinite}',
      '.nav-loading-text{font-size:13px;color:#6366f1;font-weight:500}',
      '@keyframes navSpin{to{transform:rotate(360deg)}}',
      // 页面淡入动画
      '.nav-page-ready{animation:navPageIn .25s ease forwards}',
      '@keyframes navPageIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
      // tab 指示器平滑滑动
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
    if (_hideTimer) return; // 已经在隐藏流程中
    // 保证最少显示 NAV_LOADING_MIN_MS，避免闪烁
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
      return false; // 拒绝：点击太快
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

  // ===== 核心导航函数（替换原来的 location.href） =====

  function navigate(url, tabName) {
    if (!canNavigate()) return;

    // 记录导航次数（用于判断是否首次）
    _navCount++;

    // 1. 立即显示加载遮罩（让用户知道系统在响应）
    showNavLoading('页面切换中…');

    // 2. 短暂延迟后跳转（让遮罩先显示出来）
    setTimeout(function () {
      // 3. 更新 localStorage 中的当前页状态
      if (tabName && url) {
        try {
          localStorage.setItem('wxbj_last_page', tabName);
        } catch (e) {}
      }

      // 4. 真正跳转
      window.location.href = url;
    }, 80);
  }

  // ===== 页面就绪动画 =====

  function triggerPageReady() {
    // 给页面主体加一个淡入动画（仅第一次加载时）
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

  // ===== Tab-bar 初始化：拦截原有 onclick 事件 =====

  function initTabBar() {
    if (_initialized) return;
    _initialized = true;

    var tabBars = document.querySelectorAll('.tab-bar');
    tabBars.forEach(function (tabBar) {
      // 给 tab-bar 加动画 class
      tabBar.classList.add('nav-tab-bar');

      var items = tabBar.querySelectorAll('.tab-item');
      items.forEach(function (item) {
        // 提取原始跳转地址
        var onclickAttr = item.getAttribute('onclick') || '';
        var match = onclickAttr.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (!match) return;
        var targetUrl = match[1];

        // 反查 tab 名称
        var tabName = null;
        for (var k in TAB_PAGES) {
          if (TAB_PAGES[k] === targetUrl) {
            tabName = k;
            break;
          }
        }

        // 判断当前页
        var currentPageFile = window.location.pathname.split('/').pop() || 'index.html';
        var isCurrentPage = (targetUrl === currentPageFile) ||
          (targetUrl === '' && currentPageFile === 'index.html');

        // 标记活跃项
        if (isCurrentPage) {
          item.classList.add('active');
          updateTabIndicator(tabBar, item);
        } else {
          item.classList.remove('active');
        }

        // 替换为增强版跳转
        item.setAttribute('data-nav-url', targetUrl);
        item.setAttribute('data-nav-tab', tabName || '');
        item.removeAttribute('onclick');
        item.addEventListener('click', function (e) {
          e.preventDefault();
          var url = this.getAttribute('data-nav-url');
          var name = this.getAttribute('data-nav-tab');
          navigate(url, name);
        });
      });

      // 窗口尺寸变化时重新定位指示器
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
    init: initTabBar
  };

  // ===== DOMContentLoaded 后自动初始化 =====

  function bootstrap() {
    // 等 DB.init 完成（如果有）
    var waitForDB = function (cb, attempts) {
      attempts = attempts || 0;
      if (typeof DB !== 'undefined' && typeof DB.init === 'function') {
        cb();
      } else if (attempts < 20) {
        setTimeout(function () { waitForDB(cb, attempts + 1); }, 50);
      } else {
        cb(); // 超时也继续
      }
    };

    waitForDB(function () {
      // 1. 触发页面就绪动画
      triggerPageReady();

      // 2. 初始化 tab-bar 增强
      initTabBar();

      // 3. 隐藏因导航残留的加载遮罩
      hideNavLoading();
    }, 0);
  }

  // 如果 DOM 已就绪，立即执行；否则等 DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
