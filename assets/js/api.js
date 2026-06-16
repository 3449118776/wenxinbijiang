"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/* 文心笔匠 - AI API模块 */

// API服务商配置（无硬编码密钥，URL自动填充）
var API_PROVIDERS = {
  dashscope: {
    name: '通义千问',
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    type: 'openai'
  },
  deepseek: {
    name: 'DeepSeek',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  },
  moonshot: {
    name: 'Kimi',
    url: 'https://api.moonshot.cn/v1/chat/completions',
    type: 'openai'
  },
  zhipu: {
    name: '智谱AI',
    url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    type: 'openai'
  },
  volcano: {
    name: '火山引擎',
    url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    type: 'openai'
  },
  openai: {
    name: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    type: 'openai'
  },
  baidu: {
    name: '百度文心',
    url: 'https://qianfan.baidubce.com/v2/chat/completions',
    type: 'openai'
  },
  spark: {
    name: '讯飞星火',
    url: 'https://spark-api-open.xf-yun.com/v1/chat/completions',
    type: 'openai'
  },
  minimax: {
    name: 'MiniMax',
    url: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
    type: 'openai'
  },
  siliconflow: {
    name: '硅基流动',
    url: 'https://api.siliconflow.cn/v1/chat/completions',
    type: 'openai'
  },
  yi: {
    name: '零一万物',
    url: 'https://api.lingyiwanwu.com/v1/chat/completions',
    type: 'openai'
  },
  baichuan: {
    name: '百川智能',
    url: 'https://api.baichuan-ai.com/v1/chat/completions',
    type: 'openai'
  },
  groq: {
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    type: 'openai'
  },
  claude: {
    name: 'Claude',
    url: 'https://api.anthropic.com/v1/messages',
    type: 'claude'
  }
};
// maxOutputChars: 该模型单次可靠输出的中文字符上限（约 = max_tokens * 1.5，保守值）
// maxTokens: 传给 API 的 max_tokens 请求参数
// 小模型（flash/turbo/lite/speed/mini/lightning）输出小，必须多分几批
// 大模型（max/plus/pro/v3/sonnet）输出大，每批可以覆盖更多内容
var MODEL_CONFIGS = {
  dashscope: [{
    value: 'qwen-max',
    label: 'qwen-max (推荐)',
    maxOutputChars: 12000,
    maxTokens: 8192
  }, {
    value: 'qwen-plus',
    label: 'qwen-plus',
    maxOutputChars: 8000,
    maxTokens: 6144
  }, {
    value: 'qwen-turbo',
    label: 'qwen-turbo (快速)',
    maxOutputChars: 3500,
    maxTokens: 2048
  }, {
    value: 'qwen-long',
    label: 'qwen-long (长文本)',
    maxOutputChars: 6000,
    maxTokens: 4096
  }, {
    value: 'qwen-max-latest',
    label: 'qwen-max-latest',
    maxOutputChars: 12000,
    maxTokens: 8192
  }],
  deepseek: [{
    value: 'deepseek-chat',
    label: 'DeepSeek-V3',
    maxOutputChars: 12000,
    maxTokens: 8192
  }, {
    value: 'deepseek-reasoner',
    label: 'DeepSeek-R1 (推理)',
    maxOutputChars: 10000,
    maxTokens: 8192
  }, {
    value: 'deepseek-coder',
    label: 'deepseek-coder',
    maxOutputChars: 8000,
    maxTokens: 6144
  }],
  moonshot: [{
    value: 'moonshot-v1-128k',
    label: 'Kimi 1.5 (128K)',
    maxOutputChars: 10000,
    maxTokens: 8192
  }, {
    value: 'moonshot-v1-32k',
    label: 'Kimi 1.5 (32K)',
    maxOutputChars: 8000,
    maxTokens: 6144
  }, {
    value: 'moonshot-v1-8k',
    label: 'Kimi 1.5 (8K 快速)',
    maxOutputChars: 3500,
    maxTokens: 2048
  }],
  zhipu: [{
    value: 'glm-4-plus',
    label: 'GLM-4-Plus (推荐)',
    maxOutputChars: 10000,
    maxTokens: 8192
  }, {
    value: 'glm-4',
    label: 'GLM-4',
    maxOutputChars: 8000,
    maxTokens: 6144
  }, {
    value: 'glm-4-flash',
    label: 'GLM-4-Flash (快速)',
    maxOutputChars: 3000,
    maxTokens: 2048
  }, {
    value: 'glm-4-air',
    label: 'GLM-4-Air (轻量)',
    maxOutputChars: 4500,
    maxTokens: 3072
  }, {
    value: 'glm-3-turbo',
    label: 'GLM-3-Turbo',
    maxOutputChars: 4000,
    maxTokens: 2560
  }],
  volcano: [{
    value: 'doubao-pro-32k',
    label: '豆包4.0-Pro',
    maxOutputChars: 10000,
    maxTokens: 8192
  }, {
    value: 'doubao-pro-4k',
    label: '豆包4.0',
    maxOutputChars: 3500,
    maxTokens: 2048
  }, {
    value: 'doubao-lite-4k',
    label: '豆包-Lite',
    maxOutputChars: 2500,
    maxTokens: 1536
  }],
  openai: [{
    value: 'gpt-4o',
    label: 'GPT-4o (推荐)',
    maxOutputChars: 14000,
    maxTokens: 16384
  }, {
    value: 'gpt-4o-mini',
    label: 'GPT-4o-mini (快速)',
    maxOutputChars: 8000,
    maxTokens: 8192
  }, {
    value: 'gpt-4-turbo',
    label: 'gpt-4-turbo',
    maxOutputChars: 12000,
    maxTokens: 8192
  }, {
    value: 'gpt-4',
    label: 'gpt-4',
    maxOutputChars: 6000,
    maxTokens: 4096
  }, {
    value: 'gpt-3.5-turbo',
    label: 'gpt-3.5-turbo',
    maxOutputChars: 3000,
    maxTokens: 2048
  }],
  baidu: [{
    value: 'ernie-4.0-8k',
    label: 'ERNIE-4.0 (推荐)',
    maxOutputChars: 5500,
    maxTokens: 4096
  }, {
    value: 'ernie-4.0-turbo-8k',
    label: 'ERNIE-4.0-Turbo',
    maxOutputChars: 5000,
    maxTokens: 4096
  }, {
    value: 'ernie-3.5-8k',
    label: 'ERNIE-3.5',
    maxOutputChars: 4500,
    maxTokens: 3072
  }, {
    value: 'ernie-speed-8k',
    label: 'ERNIE-Speed (快速)',
    maxOutputChars: 3000,
    maxTokens: 2048
  }, {
    value: 'ernie-lite-8k',
    label: 'ERNIE-Lite (轻量)',
    maxOutputChars: 2500,
    maxTokens: 1536
  }],
  spark: [{
    value: 'generalv3.5',
    label: '星火4.0 Ultra (推荐)',
    maxOutputChars: 7000,
    maxTokens: 6144
  }, {
    value: 'generalv3',
    label: '星火3.5 Max',
    maxOutputChars: 5000,
    maxTokens: 4096
  }, {
    value: 'generalv2',
    label: '星火3.0 Pro',
    maxOutputChars: 4000,
    maxTokens: 3072
  }, {
    value: 'general',
    label: '星火2.0 (轻量)',
    maxOutputChars: 3000,
    maxTokens: 2048
  }],
  minimax: [{
    value: 'MiniMax-Text-01',
    label: 'MiniMax-Text-01 (推荐)',
    maxOutputChars: 8000,
    maxTokens: 6144
  }, {
    value: 'abab6.5s-chat',
    label: 'abab6.5s (快速)',
    maxOutputChars: 5000,
    maxTokens: 4096
  }, {
    value: 'abab6.5-chat',
    label: 'abab6.5',
    maxOutputChars: 4500,
    maxTokens: 3072
  }, {
    value: 'abab5.5-chat',
    label: 'abab5.5',
    maxOutputChars: 3500,
    maxTokens: 2560
  }],
  siliconflow: [{
    value: 'deepseek-ai/DeepSeek-V3',
    label: 'DeepSeek-V3 (推荐)',
    maxOutputChars: 10000,
    maxTokens: 8192
  }, {
    value: 'deepseek-ai/DeepSeek-R1',
    label: 'DeepSeek-R1 (推理)',
    maxOutputChars: 8000,
    maxTokens: 6144
  }, {
    value: 'Qwen/Qwen2.5-72B-Instruct',
    label: 'Qwen2.5-72B',
    maxOutputChars: 9000,
    maxTokens: 6144
  }, {
    value: 'Qwen/Qwen2.5-32B-Instruct',
    label: 'Qwen2.5-32B',
    maxOutputChars: 7000,
    maxTokens: 4096
  }, {
    value: 'THUDM/glm-4-9b-chat',
    label: 'GLM-4-9B (免费)',
    maxOutputChars: 3500,
    maxTokens: 2048
  }, {
    value: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    label: 'Llama3.1-8B (免费)',
    maxOutputChars: 3000,
    maxTokens: 2048
  }],
  yi: [{
    value: 'yi-lightning',
    label: 'yi-lightning (快速)',
    maxOutputChars: 4000,
    maxTokens: 2560
  }, {
    value: 'yi-large',
    label: 'yi-large',
    maxOutputChars: 8000,
    maxTokens: 6144
  }, {
    value: 'yi-medium',
    label: 'yi-medium',
    maxOutputChars: 5000,
    maxTokens: 4096
  }, {
    value: 'yi-spark',
    label: 'yi-spark (轻量)',
    maxOutputChars: 3500,
    maxTokens: 2048
  }],
  baichuan: [{
    value: 'Baichuan4',
    label: 'Baichuan4 (推荐)',
    maxOutputChars: 8000,
    maxTokens: 6144
  }, {
    value: 'Baichuan3-Turbo',
    label: 'Baichuan3-Turbo',
    maxOutputChars: 5000,
    maxTokens: 4096
  }, {
    value: 'Baichuan3-Turbo-128k',
    label: 'Baichuan3-Turbo-128K',
    maxOutputChars: 6000,
    maxTokens: 4096
  }, {
    value: 'Baichuan2-Turbo',
    label: 'Baichuan2-Turbo',
    maxOutputChars: 4000,
    maxTokens: 2560
  }],
  groq: [{
    value: 'llama-3.3-70b-versatile',
    label: 'Llama3.3-70B (推荐)',
    maxOutputChars: 6000,
    maxTokens: 4096
  }, {
    value: 'llama-3.1-8b-instant',
    label: 'Llama3.1-8B (快速)',
    maxOutputChars: 3500,
    maxTokens: 2048
  }, {
    value: 'mixtral-8x7b-32768',
    label: 'Mixtral-8x7B',
    maxOutputChars: 4500,
    maxTokens: 3072
  }, {
    value: 'gemma2-9b-it',
    label: 'Gemma2-9B',
    maxOutputChars: 3500,
    maxTokens: 2048
  }],
  claude: [{
    value: 'claude-sonnet-4-20250514',
    label: 'Claude Sonnet 4 (推荐)',
    maxOutputChars: 15000,
    maxTokens: 16384
  }, {
    value: 'claude-3-5-sonnet-20241022',
    label: 'Claude 3.5 Sonnet',
    maxOutputChars: 14000,
    maxTokens: 16384
  }, {
    value: 'claude-3-5-haiku-20241022',
    label: 'Claude 3.5 Haiku (快速)',
    maxOutputChars: 6000,
    maxTokens: 4096
  }, {
    value: 'claude-3-opus-20240229',
    label: 'Claude 3 Opus',
    maxOutputChars: 12000,
    maxTokens: 8192
  }]
};

// 获取当前模型的实际输出容量（中文字符数）——用于动态分配分批大小
function getModelOutputCapacity() {
  try {
    var config = DB.getApiConfig && DB.getApiConfig() || {};
    var provider = config.provider || 'deepseek';
    var model = config.model || '';
    var models = MODEL_CONFIGS[provider] || [];
    var matched = null;
    if (model) {
      for (var i = 0; i < models.length; i++) {
        if (models[i].value === model) {
          matched = models[i];
          break;
        }
      }
    }
    if (!matched && models.length > 0) matched = models[0];
    if (matched && matched.maxOutputChars) return matched.maxOutputChars;
  } catch (e) {}
  // 兜底：按 DEFAULT 估算
  return Math.min(6000, Math.round(DEFAULT_MAX_TOKENS * 1.3));
}

// 获取当前模型应传给 API 的 max_tokens
function getModelMaxTokens() {
  try {
    var config = DB.getApiConfig && DB.getApiConfig() || {};
    var provider = config.provider || 'deepseek';
    var model = config.model || '';
    var models = MODEL_CONFIGS[provider] || [];
    var matched = null;
    if (model) {
      for (var i = 0; i < models.length; i++) {
        if (models[i].value === model) {
          matched = models[i];
          break;
        }
      }
    }
    if (!matched && models.length > 0) matched = models[0];
    if (matched && matched.maxTokens) return matched.maxTokens;
  } catch (e) {}
  return DEFAULT_MAX_TOKENS;
}

// 全局重试参数
var API_MAX_KEY_RETRY = 3; // 单服务商内最多换 3 次密钥
var API_MAX_TOTAL_TRY = 14; // 跨服务商总尝试上限（防死循环，适配更多服务商）
var DEFAULT_TIMEOUT_MS = 90 * 1000;
var DEFAULT_MAX_TOKENS = 16384; // 默认最大生成 token 数

// 当前使用的密钥索引
var currentKeyIndex = {};
window.currentKeyIndex = currentKeyIndex;
function getApiTimeoutMs() {
  try {
    var s = DB.getSettings && DB.getSettings() || {};
    if (s.apiTimeoutSec && s.apiTimeoutSec >= 15 && s.apiTimeoutSec <= 300) {
      return s.apiTimeoutSec * 1000;
    }
  } catch (e) {}
  return DEFAULT_TIMEOUT_MS;
}
function getAiKey(provider) {
  var keys = DB.getApiKeys(provider);
  if (!keys || keys.length === 0) return '';
  if (currentKeyIndex[provider] === undefined) currentKeyIndex[provider] = 0;
  var idx = currentKeyIndex[provider] % keys.length;
  return keys[idx];
}
function rotateApiKey(provider) {
  var keys = DB.getApiKeys(provider);
  if (!keys || keys.length <= 1) return false;
  currentKeyIndex[provider] = ((currentKeyIndex[provider] || 0) + 1) % keys.length;
  return true;
}

// 内部带重试计数的实际调用
// v46：prompt 可以是字符串或消息数组 [{role,content},...]
function _callOnce(_x, _x2, _x3, _x4, _x5) {
  return _callOnce2.apply(this, arguments);
} // 单服务商调用（含密钥轮换，重试封顶）
function _callOnce2() {
  _callOnce2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(provider, key, prompt, model, signal) {
    var providerConfig, isMsg, response, result, messages, systemMsg, filteredMsgs, mi, reqBody, msg, errData, data;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          providerConfig = API_PROVIDERS[provider];
          if (providerConfig) {
            _context.n = 1;
            break;
          }
          throw new Error('未知服务商: ' + provider);
        case 1:
          isMsg = Array.isArray(prompt);
          result = '';
          if (!(providerConfig.type === 'claude')) {
            _context.n = 7;
            break;
          }
          // Claude (Anthropic) 专用格式
          messages = isMsg ? prompt : [{
            role: 'user',
            content: prompt
          }]; // 分离 system 消息
          systemMsg = '';
          filteredMsgs = [];
          for (mi = 0; mi < messages.length; mi++) {
            if (messages[mi].role === 'system') {
              systemMsg = messages[mi].content;
            } else {
              filteredMsgs.push(messages[mi]);
            }
          }
          reqBody = {
            model: model || 'claude-sonnet-4-20250514',
            messages: filteredMsgs,
            max_tokens: getModelMaxTokens()
          };
          if (systemMsg) reqBody.system = systemMsg;
          _context.n = 2;
          return fetch(providerConfig.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': key,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify(reqBody),
            signal: signal
          });
        case 2:
          response = _context.v;
          if (response.ok) {
            _context.n = 5;
            break;
          }
          if (!(response.status === 429 || response.status === 402 || response.status === 401)) {
            _context.n = 3;
            break;
          }
          msg = 'API 配额不足或授权错误，请检查密钥或余额。';
          if (response.status === 429) msg = 'API 请求频率超限，请稍后重试或切换服务商。';
          if (response.status === 401) msg = 'API 密钥无效，请检查密钥是否正确。';
          throw new Error(msg + ' 服务商：' + provider + '，状态码：' + response.status);
        case 3:
          _context.n = 4;
          return response.json().catch(function () {
            return {};
          });
        case 4:
          errData = _context.v;
          throw new Error(errData && errData.error && errData.error.message || 'HTTP ' + response.status);
        case 5:
          _context.n = 6;
          return response.json();
        case 6:
          data = _context.v;
          result = data.content && data.content[0] && data.content[0].text || '';
          _context.n = 13;
          break;
        case 7:
          // OpenAI 兼容：直接传递消息数组或包装为单条消息
          messages = isMsg ? prompt : [{
            role: 'user',
            content: prompt
          }];
          _context.n = 8;
          return fetch(providerConfig.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + key
            },
            body: JSON.stringify({
              model: model || 'deepseek-chat',
              messages: messages,
              max_tokens: getModelMaxTokens(),
              temperature: 0.7
            }),
            signal: signal
          });
        case 8:
          response = _context.v;
          if (response.ok) {
            _context.n = 11;
            break;
          }
          if (!(response.status === 429 || response.status === 402 || response.status === 401)) {
            _context.n = 9;
            break;
          }
          msg = 'API 配额不足或授权错误，请检查密钥或余额。';
          if (response.status === 429) msg = 'API 请求频率超限，请稍后重试或切换服务商。';
          if (response.status === 401) msg = 'API 密钥无效，请检查密钥是否正确。';
          throw new Error(msg + ' 服务商：' + provider + '，状态码：' + response.status);
        case 9:
          _context.n = 10;
          return response.json().catch(function () {
            return {};
          });
        case 10:
          errData = _context.v;
          throw new Error(errData && errData.error && errData.error.message || 'HTTP ' + response.status);
        case 11:
          _context.n = 12;
          return response.json();
        case 12:
          data = _context.v;
          result = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '';
        case 13:
          return _context.a(2, result);
      }
    }, _callee);
  }));
  return _callOnce2.apply(this, arguments);
}
function callRealAPI(_x6, _x7, _x8) {
  return _callRealAPI.apply(this, arguments);
} // === v47 极简分工路由表（按用户定义的AI专长分配） ===
// 每项任务指定 [首选, 备选1, 备选2, ...] 的回退链
function _callRealAPI() {
  _callRealAPI = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(prompt, onProgress, opts) {
    var config, provider, model, keys, timeoutMs, lastErr, tryLimit, attempt, key, ac, aborted, timeoutId, result, _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          opts = opts || {};
          config = DB.getApiConfig();
          provider = opts.provider || config && config.provider || 'dashscope';
          model = opts.model || config && config.model || '';
          keys = DB.getApiKeys(provider);
          if (!(!keys || keys.length === 0)) {
            _context2.n = 1;
            break;
          }
          if (!opts.silent) showToast('请先在设置中添加 ' + (API_PROVIDERS[provider] ? API_PROVIDERS[provider].name : provider) + ' 的 API 密钥');
          return _context2.a(2, null);
        case 1:
          if (!opts.silent) showLoading('AI生成中…');
          timeoutMs = getApiTimeoutMs();
          lastErr = null;
          tryLimit = Math.min(keys.length, API_MAX_KEY_RETRY);
          attempt = 0;
        case 2:
          if (!(attempt < tryLimit)) {
            _context2.n = 9;
            break;
          }
          key = getAiKey(provider);
          if (key) {
            _context2.n = 3;
            break;
          }
          return _context2.a(3, 9);
        case 3:
          ac = new AbortController();
          if (opts.signal) {
            try {
              opts.signal.addEventListener('abort', function () {
                ac.abort();
              });
            } catch (e) {}
          }
          aborted = false;
          timeoutId = setTimeout(function () {
            aborted = true;
            ac.abort();
          }, timeoutMs);
          _context2.p = 4;
          _context2.n = 5;
          return _callOnce(provider, key, prompt, model, ac.signal);
        case 5:
          result = _context2.v;
          clearTimeout(timeoutId);
          if (!opts.silent) hideLoading();
          if (onProgress && result) onProgress(result);
          return _context2.a(2, result);
        case 6:
          _context2.p = 6;
          _t = _context2.v;
          clearTimeout(timeoutId);
          lastErr = _t;
          if (aborted || _t && _t.name === 'AbortError') {
            if (!opts.silent && attempt === 0) showToast('请求超时（' + timeoutMs / 1000 + 's），可在设置中调整');
          }
          if (!(keys.length > 1 && attempt < tryLimit - 1)) {
            _context2.n = 7;
            break;
          }
          rotateApiKey(provider);
          return _context2.a(3, 8);
        case 7:
          return _context2.a(3, 9);
        case 8:
          attempt++;
          _context2.n = 2;
          break;
        case 9:
          if (!opts.silent) hideLoading();
          if (!opts.silent && lastErr) console.warn('[api] ' + provider + ' 失败：', lastErr && lastErr.message);
          return _context2.a(2, null);
      }
    }, _callee2, null, [[4, 6]]);
  }));
  return _callRealAPI.apply(this, arguments);
}
var TASK_ROUTE = {
  // ===== 一、世界观构建 =====
  world_rules: ['deepseek', 'dashscope', 'zhipu', 'moonshot', 'baidu', 'siliconflow'],
  world_creative: ['zhipu', 'deepseek', 'moonshot', 'dashscope', 'claude', 'minimax'],
  world_names: ['dashscope', 'zhipu', 'deepseek', 'moonshot', 'baidu', 'yi'],
  world_integrate: ['moonshot', 'deepseek', 'zhipu', 'dashscope', 'baichuan'],
  world: ['deepseek', 'zhipu', 'dashscope', 'moonshot', 'baidu'],
  // ===== 二、人物设计 =====
  chars_core: ['zhipu', 'deepseek', 'moonshot', 'dashscope', 'claude'],
  chars_minor: ['volcano', 'zhipu', 'dashscope', 'moonshot', 'baidu', 'yi'],
  chars_check: ['deepseek', 'zhipu', 'moonshot', 'volcano', 'spark'],
  chars_integrate: ['moonshot', 'zhipu', 'deepseek', 'dashscope', 'baichuan'],
  chars: ['zhipu', 'deepseek', 'volcano', 'moonshot', 'claude'],
  // ===== 三、大纲体系 =====
  outline_logic: ['deepseek', 'zhipu', 'moonshot', 'dashscope', 'baidu'],
  outline_optimize: ['zhipu', 'deepseek', 'moonshot', 'dashscope', 'claude', 'minimax'],
  outline_detail: ['dashscope', 'zhipu', 'deepseek', 'moonshot', 'baidu', 'yi'],
  outline_integrate: ['moonshot', 'deepseek', 'zhipu', 'dashscope', 'baichuan'],
  outline: ['deepseek', 'zhipu', 'dashscope', 'moonshot', 'baidu'],
  // ===== 四、章节细纲 =====
  detail_base: ['dashscope', 'volcano', 'deepseek', 'moonshot', 'baidu', 'siliconflow'],
  detail_emotion: ['volcano', 'dashscope', 'zhipu', 'moonshot', 'minimax'],
  detail_check: ['deepseek', 'zhipu', 'moonshot', 'dashscope', 'spark'],
  detail: ['dashscope', 'volcano', 'deepseek', 'moonshot', 'baidu'],
  // ===== 五、正文生成 =====
  write_normal: ['dashscope', 'volcano', 'zhipu', 'deepseek', 'baidu', 'siliconflow'],
  write_dialogue: ['volcano', 'dashscope', 'zhipu', 'deepseek', 'minimax'],
  write_key: ['zhipu', 'deepseek', 'dashscope', 'volcano', 'claude'],
  write_context: ['moonshot', 'deepseek', 'dashscope', 'zhipu', 'baidu'],
  write: ['dashscope', 'volcano', 'zhipu', 'deepseek', 'baidu'],
  // ===== 六、质检优化 =====
  quality_logic: ['deepseek', 'moonshot', 'zhipu', 'dashscope', 'spark'],
  quality_consist: ['moonshot', 'deepseek', 'zhipu', 'dashscope', 'baidu'],
  quality_polish: ['zhipu', 'dashscope', 'deepseek', 'moonshot', 'claude', 'minimax'],
  quality_proof: ['dashscope', 'zhipu', 'moonshot', 'deepseek', 'baidu', 'groq'],
  quality: ['deepseek', 'moonshot', 'zhipu', 'dashscope', 'baidu'],
  // ===== 七、发布运营 =====
  publish_meta: ['volcano', 'dashscope', 'zhipu', 'moonshot', 'baidu'],
  publish_seo: ['dashscope', 'volcano', 'zhipu', 'moonshot', 'yi'],
  publish: ['volcano', 'dashscope', 'zhipu', 'moonshot', 'baidu'],
  // ===== 通用 =====
  memory: ['moonshot', 'deepseek', 'dashscope', 'zhipu', 'baidu'],
  consistency: ['moonshot', 'deepseek', 'zhipu', 'dashscope', 'spark'],
  fill: ['deepseek', 'moonshot', 'dashscope', 'zhipu', 'siliconflow'],
  batch: ['volcano', 'dashscope', 'deepseek', 'moonshot', 'groq', 'siliconflow'],
  polish: ['zhipu', 'dashscope', 'deepseek', 'moonshot', 'claude', 'minimax'],
  default: ['__user__', 'deepseek', 'dashscope', 'volcano', 'moonshot', 'zhipu', 'baidu', 'siliconflow', 'groq', 'claude', 'minimax', 'yi', 'baichuan', 'spark']
};

// 跨服务商回退（不写入 DB.apiConfig，避免污染用户设置）
// v47：先试用户首选/猜测的服务商；失败后，遍历所有有 key 的服务商；全失败明确提示
function callRealAPIWithFallback(_x9, _x0, _x1) {
  return _callRealAPIWithFallback.apply(this, arguments);
} // 本地兜底
function _callRealAPIWithFallback() {
  _callRealAPIWithFallback = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(prompt, onProgress, taskType) {
    var isMessages, config, userProvider, allProviders, providersWithKeys, i, p, kks, seen, order, route, ri, rp, j, pp, totalTry, result, oi, provider;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          isMessages = Array.isArray(prompt);
          taskType = taskType || 'default';
          config = DB.getApiConfig() || {};
          userProvider = config.provider || 'deepseek'; // === 收集所有有 key 的服务商 ===
          allProviders = Object.keys(API_PROVIDERS);
          providersWithKeys = [];
          for (i = 0; i < allProviders.length; i++) {
            p = allProviders[i];
            kks = DB.getApiKeys(p);
            if (kks && kks.length > 0) providersWithKeys.push(p);
          }
          if (!(providersWithKeys.length === 0)) {
            _context3.n = 1;
            break;
          }
          showToast('⚠️ 未配置任何 AI 密钥，请在设置中添加');
          return _context3.a(2, null);
        case 1:
          // === 构建尝试顺序 ===
          // 1. 用户选的服务商放在第一位
          // 2. 然后按 TASK_ROUTE 中该任务的推荐顺序排
          // 3. 剩余的有 key 服务商兜底
          seen = {};
          order = []; // 先加用户首选
          if (providersWithKeys.indexOf(userProvider) >= 0) {
            order.push(userProvider);
            seen[userProvider] = true;
          }
          // 再加任务路由推荐
          route = TASK_ROUTE[taskType] || TASK_ROUTE['default'];
          for (ri = 0; ri < route.length; ri++) {
            rp = route[ri];
            if (rp === '__user__') rp = userProvider;
            if (!seen[rp] && providersWithKeys.indexOf(rp) >= 0) {
              order.push(rp);
              seen[rp] = true;
            }
          }
          // 最后加剩余的有 key 服务商（兜底）
          for (j = 0; j < providersWithKeys.length; j++) {
            pp = providersWithKeys[j];
            if (!seen[pp]) {
              order.push(pp);
              seen[pp] = true;
            }
          }

          // === 按顺序调用 ===
          totalTry = 0;
          result = null;
          oi = 0;
        case 2:
          if (!(oi < order.length && totalTry < API_MAX_TOTAL_TRY)) {
            _context3.n = 8;
            break;
          }
          provider = order[oi];
          if (!(oi === 0)) {
            _context3.n = 4;
            break;
          }
          _context3.n = 3;
          return callRealAPI(prompt, onProgress, {
            provider: provider
          });
        case 3:
          result = _context3.v;
          _context3.n = 6;
          break;
        case 4:
          showToast('切换到 ' + API_PROVIDERS[provider].name + ' 重试…', {
            duration: 1500
          });
          _context3.n = 5;
          return callRealAPI(prompt, onProgress, {
            provider: provider
          });
        case 5:
          result = _context3.v;
        case 6:
          totalTry++;
          if (!result) {
            _context3.n = 7;
            break;
          }
          return _context3.a(2, result);
        case 7:
          oi++;
          _context3.n = 2;
          break;
        case 8:
          // === 全失败：明确提示 ===
          showToast('⚠️ key 不可用请重新再试', {
            error: true,
            duration: 3500
          });
          return _context3.a(2, null);
      }
    }, _callee3);
  }));
  return _callRealAPIWithFallback.apply(this, arguments);
}
function generateLocal(prompt) {
  // 不再静默返回 null，给一个明确的占位让上层界面不挂死
  var hint = '【AI 暂不可用】\n\n本次未能生成内容，可能原因：\n1. 当前未配置任何 API 密钥\n2. 网络阻塞或服务商超时\n3. 密钥额度耗尽或被风控\n\n请前往「设置 → API 密钥管理」检查后重试。';
  return hint;
}

// 挂载到全局
window.callRealAPI = callRealAPI;
window.callRealAPIWithFallback = callRealAPIWithFallback;
window.getAiKey = getAiKey;
window.API_PROVIDERS = API_PROVIDERS;
window.MODEL_CONFIGS = MODEL_CONFIGS;
window.getApiTimeoutMs = getApiTimeoutMs;
window.getModelOutputCapacity = getModelOutputCapacity;
window.getModelMaxTokens = getModelMaxTokens;

// === v46: 多AI协作调用 —— 同时请求多个服务商，取第一个成功结果 ===
// settings.multiAI: true = 启用协作，false = 单AI模式
function callMultiAI(_x10, _x11, _x12) {
  return _callMultiAI.apply(this, arguments);
}
function _callMultiAI() {
  _callMultiAI = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(prompt, onProgress, taskType) {
    var useMulti, s, config, userProvider, route, seen, candidates, ri, rp, rkeys, controller, sharedSignal, promises, winner, _t2;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          // 读取用户设置
          useMulti = false;
          try {
            s = DB && DB.settings ? DB.settings : {};
            useMulti = !!s.multiAI;
          } catch (e) {}
          if (useMulti) {
            _context4.n = 1;
            break;
          }
          return _context4.a(2, callRealAPIWithFallback(prompt, onProgress, taskType));
        case 1:
          // 多AI模式：并行调用路由里有密钥的所有服务商，取第一个成功返回结果
          taskType = taskType || 'default';
          config = DB.getApiConfig() || {};
          userProvider = config.provider || 'deepseek';
          route = TASK_ROUTE[taskType] || TASK_ROUTE['default']; // 收集所有可用服务商（不重复）
          seen = {};
          candidates = [];
          for (ri = 0; ri < route.length; ri++) {
            rp = route[ri];
            if (rp === '__user__') rp = userProvider;
            if (!seen[rp] && API_PROVIDERS[rp]) {
              rkeys = DB.getApiKeys(rp);
              if (rkeys && rkeys.length > 0) {
                candidates.push(rp);
                seen[rp] = true;
              }
            }
          }
          // 如果只有一个，直接返回
          if (!(candidates.length <= 1)) {
            _context4.n = 2;
            break;
          }
          return _context4.a(2, callRealAPIWithFallback(prompt, onProgress, taskType));
        case 2:
          // 并行请求，谁先成功返回谁
          // v46：使用 AbortController，winner 确定后取消其余请求
          controller = new AbortController();
          sharedSignal = controller.signal;
          promises = candidates.map(function (p) {
            return new Promise(function (resolve, reject) {
              callRealAPI(prompt, onProgress, {
                provider: p,
                silent: true,
                signal: sharedSignal
              }).then(function (r) {
                if (r && r.length > 20 && r.indexOf('AI 暂不可用') < 0) resolve({
                  provider: p,
                  result: r
                });else reject(new Error(p + ': empty or error'));
              }).catch(reject);
            });
          }); // Promise.race: 取第一个成功返回结果
          _context4.p = 3;
          _context4.n = 4;
          return Promise.race(promises);
        case 4:
          winner = _context4.v;
          // 取到结果后立即取消其余请求
          try {
            controller.abort();
          } catch (e) {}
          if (!(winner && winner.result)) {
            _context4.n = 5;
            break;
          }
          if (winner.provider !== candidates[0]) {
            showToast('首服务商额度不足，' + API_PROVIDERS[winner.provider].name + ' 接力成功', {
              duration: 2000
            });
          }
          return _context4.a(2, winner.result);
        case 5:
          _context4.n = 7;
          break;
        case 6:
          _context4.p = 6;
          _t2 = _context4.v;
          try {
            controller.abort();
          } catch (_) {}
          console.warn('[multiAI] 首请求失败，回退到串行回退', _t2 && _t2.message);
        case 7:
          return _context4.a(2, callRealAPIWithFallback(prompt, onProgress, taskType));
      }
    }, _callee4, null, [[3, 6]]);
  }));
  return _callMultiAI.apply(this, arguments);
}
window.callMultiAI = callMultiAI;