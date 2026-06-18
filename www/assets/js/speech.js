// speech.js - 浏览器语音输入（Web Speech API 可选支持）
// 提供 toggleSpeechInput('textarea-id') 用于 architecture.html/write.html 的麦克风按钮
(function () {
  var _recognition = null;
  var _currentTargetId = null;
  var _activeInstance = null;

  function getRecognition() {
    if (_recognition) return _recognition;
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    try {
      var r = new SR();
      r.lang = (navigator && navigator.language) ? navigator.language.replace('-Hant','-HK').replace('-Hans','-CN') : 'zh-CN';
      if (!/^(zh|en)/.test(r.lang)) r.lang = 'zh-CN';
      r.continuous = false;
      r.interimResults = true;
      _recognition = r;
    } catch (e) {
      _recognition = null;
    }
    return _recognition;
  }

  function showToast(msg, opts) {
    // 优先调用全局 toast；退化到 alert
    if (typeof window.showToast === 'function') {
      window.showToast(msg, opts);
    } else {
      try {
        var div = document.createElement('div');
        div.style.cssText = 'position:fixed;top:72px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.82);color:#fff;padding:10px 18px;border-radius:18px;font-size:13px;z-index:9999;';
        div.textContent = msg;
        document.body.appendChild(div);
        setTimeout(function () { div.parentNode && div.parentNode.removeChild(div); }, (opts && opts.duration) || 2400);
      } catch (e) {}
    }
  }

  window.toggleSpeechInput = function (targetId) {
    var el = document.getElementById(targetId);
    if (!el) {
      showToast('未找到目标输入框：' + targetId);
      return;
    }

    // 如果当前正在录音 → 停止
    if (_activeInstance && _currentTargetId === targetId) {
      try { _activeInstance.stop(); } catch (e) {}
      _activeInstance = null;
      _currentTargetId = null;
      return;
    }

    var r = getRecognition();
    if (!r) {
      showToast('当前浏览器不支持语音输入（Web Speech API），请在移动设备上尝试 Chrome/Safari。', { duration: 3800 });
      return;
    }

    _currentTargetId = targetId;
    _activeInstance = r;

    var finalText = el.value || '';
    if (finalText && !/\s$/.test(finalText)) finalText += ' ';

    var interimEl = null;
    try {
      var bar = document.getElementById('speech-status-bar');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'speech-status-bar';
        bar.style.cssText = 'position:fixed;top:112px;left:50%;transform:translateX(-50%);background:#fff;border:1px solid #ddd;border-radius:10px;padding:8px 14px;font-size:12px;color:#333;z-index:9998;box-shadow:0 2px 6px rgba(0,0,0,0.08);max-width:80%;text-align:center;';
        document.body.appendChild(bar);
      }
      interimEl = bar;
      interimEl.style.display = 'block';
      interimEl.textContent = '🎤 录音中：请说话（再次点击按钮结束）';
    } catch (e) {}

    try {
      r.onresult = function (event) {
        var interim = '';
        var finalChunk = '';
        for (var i = event.resultIndex; i < event.results.length; i++) {
          var transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalChunk += transcript;
          else interim += transcript;
        }
        if (finalChunk) {
          finalText += finalChunk;
          el.value = finalText;
          if (typeof el.dispatchEvent === 'function') {
            try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
          }
        }
        if (interimEl) {
          interimEl.textContent = '🎤 录音中（临时）：' + (interim || finalChunk);
        }
      };
      r.onerror = function (event) {
        var err = event && event.error ? event.error : 'unknown';
        showToast('语音输入出错：' + err, { duration: 3000 });
        if (interimEl) interimEl.style.display = 'none';
        _activeInstance = null;
        _currentTargetId = null;
      };
      r.onend = function () {
        if (interimEl) interimEl.style.display = 'none';
        _activeInstance = null;
        _currentTargetId = null;
      };
      r.start();
    } catch (e) {
      showToast('无法启动语音输入：' + (e && e.message ? e.message : e));
      _activeInstance = null;
      _currentTargetId = null;
    }
  };
})();
