"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/* 文心笔匠 - 语音输入模块（移动端优化） */

// 语音识别状态
var speechRecognition = null;
var isListening = false;
var currentTarget = null;

// 初始化语音识别
function initSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('浏览器不支持语音识别');
    return false;
  }
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  speechRecognition = new SpeechRecognition();

  // 配置（移动端优化）
  speechRecognition.lang = 'zh-CN'; // 中文
  speechRecognition.continuous = true; // 连续识别
  speechRecognition.interimResults = true; // 显示中间结果
  speechRecognition.maxAlternatives = 1;

  // 识别结果
  speechRecognition.onresult = function (event) {
    var transcript = '';
    for (var i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    if (currentTarget) {
      // 追加到目标输入框
      currentTarget.value = transcript;
      // 触发输入事件
      currentTarget.dispatchEvent(new Event('input', {
        bubbles: true
      }));
    }
  };

  // 识别结束
  speechRecognition.onend = function () {
    if (isListening) {
      // 自动重启（连续模式）
      try {
        speechRecognition.start();
      } catch (e) {
        stopSpeechInput();
      }
    } else {
      updateSpeechButton(false);
    }
  };

  // 错误处理
  speechRecognition.onerror = function (event) {
    console.error('语音识别错误:', event.error);
    if (event.error === 'no-speech') {
      showToast('未检测到语音，请说话');
    } else if (event.error === 'audio-capture') {
      showToast('无法获取麦克风，请检查权限');
    } else if (event.error === 'not-allowed') {
      showToast('麦克风权限被拒绝');
    } else {
      showToast('语音识别出错: ' + event.error);
    }
    stopSpeechInput();
  };
  return true;
}

// 开始语音输入
function startSpeechInput(targetId) {
  var target = document.getElementById(targetId) || document.querySelector(targetId);
  if (!target) {
    showToast('找不到输入框');
    return;
  }
  currentTarget = target;
  if (!speechRecognition) {
    if (!initSpeechRecognition()) {
      showToast('您的浏览器不支持语音输入');
      return;
    }
  }
  try {
    speechRecognition.start();
    isListening = true;
    updateSpeechButton(true);
    showToast('🎤 开始录音，请说话...');

    // 防止页面滚动（移动端）
    document.body.classList.add('speech-active');
  } catch (e) {
    if (e.name === 'InvalidStateError') {
      // 已经在运行，先停止再开始
      speechRecognition.stop();
      setTimeout(function () {
        speechRecognition.start();
        isListening = true;
        updateSpeechButton(true);
      }, 100);
    } else {
      showToast('启动语音失败: ' + e.message);
    }
  }
}

// 停止语音输入
function stopSpeechInput() {
  if (speechRecognition) {
    speechRecognition.stop();
  }
  isListening = false;
  currentTarget = null;
  updateSpeechButton(false);
  document.body.classList.remove('speech-active');
  showToast('录音结束');
}

// 切换语音输入
function toggleSpeechInput(targetId) {
  if (isListening) {
    stopSpeechInput();
  } else {
    startSpeechInput(targetId);
  }
}

// 更新语音按钮状态
function updateSpeechButton(active) {
  var buttons = document.querySelectorAll('.speech-btn');
  buttons.forEach(function (btn) {
    if (active) {
      btn.classList.add('recording');
      btn.innerHTML = '🔴 停止';
    } else {
      btn.classList.remove('recording');
      btn.innerHTML = '🎤 语音';
    }
  });
}

// 检查麦克风权限
function checkMicPermission() {
  return _checkMicPermission.apply(this, arguments);
} // 请求麦克风权限
function _checkMicPermission() {
  _checkMicPermission = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var result, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          _context.n = 1;
          return navigator.permissions.query({
            name: 'microphone'
          });
        case 1:
          result = _context.v;
          return _context.a(2, result.state);
        case 2:
          _context.p = 2;
          _t = _context.v;
          return _context.a(2, 'unknown');
      }
    }, _callee, null, [[0, 2]]);
  }));
  return _checkMicPermission.apply(this, arguments);
}
function requestMicPermission() {
  return _requestMicPermission.apply(this, arguments);
} // 挂载到全局
function _requestMicPermission() {
  _requestMicPermission = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var stream, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          _context2.p = 0;
          _context2.n = 1;
          return navigator.mediaDevices.getUserMedia({
            audio: true
          });
        case 1:
          stream = _context2.v;
          stream.getTracks().forEach(function (track) {
            return track.stop();
          });
          return _context2.a(2, true);
        case 2:
          _context2.p = 2;
          _t2 = _context2.v;
          showToast('无法获取麦克风权限');
          return _context2.a(2, false);
      }
    }, _callee2, null, [[0, 2]]);
  }));
  return _requestMicPermission.apply(this, arguments);
}
window.startSpeechInput = startSpeechInput;
window.stopSpeechInput = stopSpeechInput;
window.toggleSpeechInput = toggleSpeechInput;
window.initSpeechRecognition = initSpeechRecognition;
window.isSpeechSupported = function () {
  return !!speechRecognition || initSpeechRecognition();
};