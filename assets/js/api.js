/* 文心笔匠 - AI API模块 */

// API服务商配置（无硬编码密钥，URL自动填充）
const API_PROVIDERS = {
  dashscope:   { name: '通义千问',   url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', type: 'openai' },
  deepseek:    { name: 'DeepSeek',   url: 'https://api.deepseek.com/v1/chat/completions', type: 'openai' },
  moonshot:    { name: 'Kimi',       url: 'https://api.moonshot.cn/v1/chat/completions', type: 'openai' },
  zhipu:       { name: '智谱AI',     url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', type: 'openai' },
  volcano:     { name: '火山引擎',   url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', type: 'openai' },
  openai:      { name: 'OpenAI',     url: 'https://api.openai.com/v1/chat/completions', type: 'openai' },
  baidu:       { name: '百度文心',   url: 'https://qianfan.baidubce.com/v2/chat/completions', type: 'openai' },
  spark:       { name: '讯飞星火',   url: 'https://spark-api-open.xf-yun.com/v1/chat/completions', type: 'openai' },
  minimax:     { name: 'MiniMax',    url: 'https://api.minimax.chat/v1/text/chatcompletion_v2', type: 'openai' },
  siliconflow: { name: '硅基流动',   url: 'https://api.siliconflow.cn/v1/chat/completions', type: 'openai' },
  yi:          { name: '零一万物',   url: 'https://api.lingyiwanwu.com/v1/chat/completions', type: 'openai' },
  baichuan:    { name: '百川智能',   url: 'https://api.baichuan-ai.com/v1/chat/completions', type: 'openai' },
  groq:        { name: 'Groq',       url: 'https://api.groq.com/openai/v1/chat/completions', type: 'openai' },
  claude:      { name: 'Claude',     url: 'https://api.anthropic.com/v1/messages', type: 'claude' },
  xai:         { name: 'xAI Grok',   url: 'https://api.x.ai/v1/chat/completions', type: 'openai' },
  mistral:     { name: 'Mistral',    url: 'https://api.mistral.ai/v1/chat/completions', type: 'openai' },
  cohere:      { name: 'Cohere',     url: 'https://api.cohere.com/v1/chat', type: 'openai' },
  together:    { name: 'Together',   url: 'https://api.together.xyz/v1/chat/completions', type: 'openai' },
  anthropic:   { name: 'Anthropic',  url: 'https://api.anthropic.com/v1/messages', type: 'claude' },
  stepfun:     { name: '阶跃星辰',   url: 'https://api.stepfun.com/v1/chat/completions', type: 'openai' },
  qwenlm:      { name: 'QwenLM',     url: 'https://chat.qwen.ai/api/v1/chat/completions', type: 'openai' }
};

const MODEL_CONFIGS = {
  dashscope: [
    { value: 'qwen-max',       label: 'qwen-max (推荐)' },
    { value: 'qwen-plus',      label: 'qwen-plus' },
    { value: 'qwen-turbo',     label: 'qwen-turbo (快速)' },
    { value: 'qwen-long',      label: 'qwen-long (长文本)' },
    { value: 'qwen-max-latest',label: 'qwen-max-latest' }
  ],
  deepseek: [
    { value: 'deepseek-chat',     label: 'DeepSeek-V3' },
    { value: 'deepseek-reasoner', label: 'DeepSeek-R1 (推理)' },
    { value: 'deepseek-coder',    label: 'deepseek-coder' }
  ],
  moonshot: [
    { value: 'moonshot-v1-128k', label: 'Kimi 1.5 (128K)' },
    { value: 'moonshot-v1-32k',  label: 'Kimi 1.5 (32K)' },
    { value: 'moonshot-v1-8k',   label: 'Kimi 1.5 (8K 快速)' }
  ],
  zhipu: [
    { value: 'glm-4-plus',   label: 'GLM-4-Plus (推荐)' },
    { value: 'glm-4',        label: 'GLM-4' },
    { value: 'glm-4-flash',  label: 'GLM-4-Flash (快速)' },
    { value: 'glm-4-air',    label: 'GLM-4-Air (轻量)' },
    { value: 'glm-3-turbo',  label: 'GLM-3-Turbo' }
  ],
  volcano: [
    { value: 'doubao-pro-32k',  label: '豆包4.0-Pro' },
    { value: 'doubao-pro-4k',   label: '豆包4.0' },
    { value: 'doubao-lite-4k',  label: '豆包-Lite' }
  ],
  openai: [
    { value: 'gpt-4o',          label: 'GPT-4o (推荐)' },
    { value: 'gpt-4o-mini',     label: 'GPT-4o-mini (快速)' },
    { value: 'gpt-4-turbo',     label: 'gpt-4-turbo' },
    { value: 'gpt-4',           label: 'gpt-4' },
    { value: 'gpt-3.5-turbo',   label: 'gpt-3.5-turbo' }
  ],
  baidu: [
    { value: 'ernie-4.0-8k',     label: 'ERNIE-4.0 (推荐)' },
    { value: 'ernie-4.0-turbo-8k',label: 'ERNIE-4.0-Turbo' },
    { value: 'ernie-3.5-8k',     label: 'ERNIE-3.5' },
    { value: 'ernie-speed-8k',   label: 'ERNIE-Speed (快速)' },
    { value: 'ernie-lite-8k',    label: 'ERNIE-Lite (轻量)' }
  ],
  spark: [
    { value: 'generalv3.5', label: '星火4.0 Ultra (推荐)' },
    { value: 'generalv3',   label: '星火3.5 Max' },
    { value: 'generalv2',   label: '星火3.0 Pro' },
    { value: 'general',     label: '星火2.0 (轻量)' }
  ],
  minimax: [
    { value: 'MiniMax-Text-01', label: 'MiniMax-Text-01 (推荐)' },
    { value: 'abab6.5s-chat',   label: 'abab6.5s (快速)' },
    { value: 'abab6.5-chat',    label: 'abab6.5' },
    { value: 'abab5.5-chat',    label: 'abab5.5' }
  ],
  siliconflow: [
    { value: 'deepseek-ai/DeepSeek-V3',        label: 'DeepSeek-V3 (推荐)' },
    { value: 'deepseek-ai/DeepSeek-R1',        label: 'DeepSeek-R1 (推理)' },
    { value: 'Qwen/Qwen2.5-72B-Instruct',      label: 'Qwen2.5-72B' },
    { value: 'Qwen/Qwen2.5-32B-Instruct',      label: 'Qwen2.5-32B' },
    { value: 'THUDM/glm-4-9b-chat',            label: 'GLM-4-9B (免费)' },
    { value: 'meta-llama/Meta-Llama-3.1-8B-Instruct', label: 'Llama3.1-8B (免费)' }
  ],
  yi: [
    { value: 'yi-lightning', label: 'yi-lightning (快速)' },
    { value: 'yi-large',     label: 'yi-large' },
    { value: 'yi-medium',    label: 'yi-medium' },
    { value: 'yi-spark',     label: 'yi-spark (轻量)' }
  ],
  baichuan: [
    { value: 'Baichuan4',      label: 'Baichuan4 (推荐)' },
    { value: 'Baichuan3-Turbo',label: 'Baichuan3-Turbo' },
    { value: 'Baichuan3-Turbo-128k', label: 'Baichuan3-Turbo-128K' },
    { value: 'Baichuan2-Turbo',label: 'Baichuan2-Turbo' }
  ],
  groq: [
    { value: 'llama-3.3-70b-versatile',    label: 'Llama3.3-70B (推荐)' },
    { value: 'llama-3.1-8b-instant',       label: 'Llama3.1-8B (快速)' },
    { value: 'mixtral-8x7b-32768',         label: 'Mixtral-8x7B' },
    { value: 'gemma2-9b-it',               label: 'Gemma2-9B' }
  ],
  claude: [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (推荐)' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022',  label: 'Claude 3.5 Haiku (快速)' },
    { value: 'claude-3-opus-20240229',     label: 'Claude 3 Opus' }
  ],
  xai: [
    { value: 'grok-3',     label: 'Grok 3 (推荐)' },
    { value: 'grok-3-fast', label: 'Grok 3 Fast' },
    { value: 'grok-3-mini', label: 'Grok 3 Mini (快速)' }
  ],
  mistral: [
    { value: 'mistral-large-latest', label: 'Mistral Large (推荐)' },
    { value: 'mistral-small-latest', label: 'Mistral Small (快速)' },
    { value: 'codestral-latest',     label: 'Codestral' }
  ],
  cohere: [
    { value: 'command-r-plus-08-2024', label: 'Command R+ (推荐)' },
    { value: 'command-r-08-2024',      label: 'Command R' },
    { value: 'command-nightly',        label: 'Command Nightly' }
  ],
  together: [
    { value: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', label: 'Llama 3.1 405B (推荐)' },
    { value: 'mistralai/Mixtral-8x22B-Instruct-v0.1',          label: 'Mixtral 8x22B' },
    { value: 'deepseek-ai/deepseek-chat',                       label: 'DeepSeek Chat' }
  ],
  anthropic: [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (推荐)' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022',  label: 'Claude 3.5 Haiku (快速)' }
  ],
  stepfun: [
    { value: 'step-1.5-pro',    label: 'Step 1.5 Pro (推荐)' },
    { value: 'step-1.5-flash',  label: 'Step 1.5 Flash (快速)' },
    { value: 'step-1o',         label: 'Step 1o' }
  ],
  qwenlm: [
    { value: 'qwen3-max',       label: 'Qwen3 Max (推荐)' },
    { value: 'qwen3-coder',     label: 'Qwen3 Coder' },
    { value: 'qwen2.5-72b-instruct', label: 'Qwen2.5 72B' }
  ]
};

// 全局重试参数
// 单服务商内：最多轮询到的密钥数（一个服务商内会把该服务商的 key 全部尝试一次，失败后才跨服务商兜底）
const API_MAX_KEY_RETRY  = 999;
// 跨服务商总尝试上限（防死循环，适配更多服务商）
const API_MAX_TOTAL_TRY  = 40;
const DEFAULT_TIMEOUT_MS = 90 * 1000;
const DEFAULT_MAX_TOKENS = 16384; // 默认最大生成 token 数

// 各模型的最大输出 token 数（按模型名前缀匹配）
var MODEL_MAX_OUTPUT = {
  'deepseek-chat': 8192,
  'deepseek-reasoner': 16384,
  'deepseek-coder': 16384,
  'qwen-max': 8192,
  'qwen-plus': 8192,
  'qwen-turbo': 8192,
  'qwen-long': 10000,
  'qwen-max-latest': 8192,
  'qwen3-max': 16384,
  'qwen3-coder': 16384,
  'gpt-4o': 16384,
  'gpt-4o-mini': 16384,
  'gpt-4-turbo': 4096,
  'gpt-4': 8192,
  'gpt-3.5-turbo': 4096,
  'claude-sonnet-4': 16384,
  'claude-3-5-sonnet': 8192,
  'claude-3-5-haiku': 8192,
  'claude-3-opus': 4096,
  'claude-opus-4': 16384,
  'claude-haiku-4': 8192,
  'glm-4-plus': 8192,
  'glm-4': 8192,
  'glm-4-flash': 4096,
  'glm-4-air': 4096,
  'moonshot-v1-128k': 8192,
  'moonshot-v1-32k': 8192,
  'moonshot-v1-8k': 8192,
  'doubao-pro-32k': 4096,
  'doubao-pro-4k': 4096,
  'doubao-lite-4k': 4096,
  'ernie-4.0-8k': 4096,
  'ernie-4.0-turbo-8k': 4096,
  'ernie-3.5-8k': 4096,
  'MiniMax-Text-01': 16384,
  'grok-3': 16384,
  'grok-3-fast': 16384,
  'grok-3-mini': 16384,
  'mistral-large-latest': 8192,
  'step-1.5-pro': 8192,
  'step-1.5-flash': 8192,
  'yi-lightning': 16384,
  'yi-large': 4096,
  'Baichuan4': 4096,
  'Baichuan3-Turbo': 4096,
  'llama-3.3-70b': 32768,
  'llama-3.1-8b': 32768,
  'mixtral-8x7b': 32768,
};

// 根据当前模型获取最大输出 token 数
function getModelMaxOutputTokens() {
  try {
    var config = DB.getApiConfig() || {};
    var model = config.model || '';
    if (!model) return DEFAULT_MAX_TOKENS;
    // 精确匹配
    if (MODEL_MAX_OUTPUT[model]) return MODEL_MAX_OUTPUT[model];
    // 前缀匹配
    for (var key in MODEL_MAX_OUTPUT) {
      if (model.indexOf(key) === 0 || key.indexOf(model) === 0) {
        return MODEL_MAX_OUTPUT[key];
      }
    }
    // 按服务商默认值
    var provider = config.provider || '';
    if (provider === 'groq') return 32768;
    if (provider === 'siliconflow') return 8192;
    if (provider === 'together') return 8192;
  } catch(e) {}
  return DEFAULT_MAX_TOKENS;
}

// 当前使用的密钥索引
let currentKeyIndex = {};
window.currentKeyIndex = currentKeyIndex;

function getApiTimeoutMs() {
  try {
    var s = (DB.getSettings && DB.getSettings()) || {};
    if (s.apiTimeoutSec && s.apiTimeoutSec >= 15 && s.apiTimeoutSec <= 300) {
      return s.apiTimeoutSec * 1000;
    }
  } catch(e) {}
  return DEFAULT_TIMEOUT_MS;
}

// ========== 密钥测试函数（v48 新增）==========
// 用于添加密钥前验证有效性：返回 { success: boolean, message: string, kind?: string }
// 策略：发极简请求；若返回 404（模型/endpoint 不存在）但不是 401/403，则换模型重试
async function testApiKey(provider, key) {
  const providerConfig = API_PROVIDERS[provider];
  if (!providerConfig) {
    return { success: false, message: '未知服务商: ' + provider };
  }
  if (!key || !key.trim()) {
    return { success: false, message: '密钥为空' };
  }
  const trimmedKey = key.trim();

  // v48: 为每个服务商准备多个候选模型（按轻量 → 正常顺序）
  // 第一个失败（404）时换下一个，避免因模型名问题导致有效密钥被误判
  let modelCandidates = [];
  if (provider === 'claude' || provider === 'anthropic') {
    modelCandidates = ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-haiku-4-20250514'];
  } else if (provider === 'deepseek') {
    modelCandidates = ['deepseek-chat', 'deepseek-reasoner'];
  } else if (provider === 'openai') {
    modelCandidates = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
  } else if (provider === 'groq') {
    modelCandidates = ['llama-3-8b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768'];
  } else if (provider === 'zhipu') {
    modelCandidates = ['glm-4-flash', 'glm-4-air', 'glm-4', 'glm-4-plus'];
  } else if (provider === 'dashscope') {
    modelCandidates = ['qwen-turbo', 'qwen-plus', 'qwen-max'];
  } else if (provider === 'moonshot') {
    modelCandidates = ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'];
  } else if (provider === 'volcano') {
    modelCandidates = ['doubao-pro-4k', 'doubao-1-5-pro-32k', 'doubao-lite-4k'];
  } else if (provider === 'baidu') {
    modelCandidates = ['ernie-4.0-8k', 'ernie-3.5-8k'];
  } else if (provider === 'spark') {
    modelCandidates = ['generalv3.5', 'generalv3', 'general'];
  } else if (provider === 'minimax') {
    modelCandidates = ['MiniMax-Text-01', 'abab6.5s-chat'];
  } else if (provider === 'siliconflow') {
    modelCandidates = ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct'];
  } else if (provider === 'yi') {
    modelCandidates = ['yi-lightning', 'yi-large', 'yi-medium'];
  } else if (provider === 'baichuan') {
    modelCandidates = ['Baichuan4', 'Baichuan3-Turbo'];
  } else if (provider === 'xai') {
    modelCandidates = ['grok-2-1212', 'grok-2'];
  } else if (provider === 'mistral') {
    modelCandidates = ['mistral-small-latest', 'mistral-large-latest'];
  } else if (provider === 'cohere') {
    modelCandidates = ['command-r', 'command-r-plus'];
  } else if (provider === 'together') {
    modelCandidates = ['meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'];
  } else if (provider === 'stepfun') {
    modelCandidates = ['step-1-flash'];
  } else if (provider === 'qwenlm') {
    modelCandidates = ['qwen-coder-plus-latest'];
  } else {
    const models = MODEL_CONFIGS[provider] || [];
    modelCandidates = models.map(function(m) { return m.value; });
    if (modelCandidates.length === 0) modelCandidates = ['deepseek-chat'];
  }

  const timeoutMs = 25 * 1000;

  let last404 = null;
  for (let mi = 0; mi < modelCandidates.length; mi++) {
    const model = modelCandidates[mi];
    const ac = new AbortController();
    const timeoutId = setTimeout(function() { ac.abort(); }, timeoutMs);

    try {
      let response;
      if (providerConfig.type === 'claude') {
        response = await fetch(providerConfig.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': trimmedKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 5,
            messages: [{ role: 'user', content: 'hi' }]
          }),
          signal: ac.signal
        });
      } else {
        response = await fetch(providerConfig.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + trimmedKey
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 5,
            temperature: 0.1,
            messages: [{ role: 'user', content: 'hi' }]
          }),
          signal: ac.signal
        });
      }
      clearTimeout(timeoutId);

      // 读取响应体（无论 HTTP 2xx 也要检查内容是否真的成功）
      let text = '';
      let json = null;
      try {
        text = await response.text();
        try { json = JSON.parse(text); } catch(je) { json = null; }
      } catch(te) {}

      // 关键修复：HTTP 200 时也必须验证响应体
      // 很多服务商返回 HTTP 200 但 body 是错误信息
      const bodyCheck = _validateApiResponse(response.status, text, json, providerConfig.type);

      if (response.ok && bodyCheck.ok) {
        // 真正有效：HTTP 2xx 且响应体是正常的 completion
        return { success: true, message: '密钥有效（' + model + '，响应正常）', kind: 'ok' };
      }

      // 以下为失败情况
      const err = _classifyApiError(response.status, text, json);

      // 如果是 404 或模型不存在，尝试下一个模型
      if (response.status === 404 || (err.kind === 'other' && /model|endpoint|not found|不存在|invalid_model|model_not_found/i.test(text))) {
        last404 = err;
        continue;
      }

      return { success: false, message: bodyCheck.message || err.message, kind: err.kind || bodyCheck.kind || 'other', status: response.status };
    } catch(e) {
      clearTimeout(timeoutId);
      if (e && (e.name === 'AbortError' || (e.message && e.message.indexOf('Abort') >= 0))) {
        return { success: false, message: '请求超时（25s），请检查网络或 URL 是否正确', kind: 'timeout' };
      }
      return { success: false, message: '网络错误：' + (e && e.message ? e.message : 'unknown'), kind: 'network' };
    }
  }

  if (last404) {
    return {
      success: false,
      message: '所有测试模型均返回 404（可能该服务商需要先在控制台创建 endpoint，或密钥格式对不上当前服务商）。原始错误：' + last404.message,
      kind: 'model',
      status: 404
    };
  }
  return { success: false, message: '测试失败（未知原因）', kind: 'other' };
}

// 辅助函数：验证 API 响应体是否为真正成功（即便 HTTP 2xx 也可能是错误）
function _validateApiResponse(status, text, json, apiType) {
  if (status < 200 || status >= 300) return { ok: false };
  if (!json) {
    // 200 但非 JSON → 异常
    return { ok: false, message: '服务返回非 JSON（' + (text ? text.substring(0, 40) : '空响应') + '）', kind: 'invalid' };
  }

  // 检查常见错误字段
  if (json.error || json.err || json.code === 'error' || json.object === 'error' || json.status === 'error' || json.error_code) {
    let msg = null;
    if (json.error && typeof json.error === 'string') msg = json.error;
    if (!msg && json.error && json.error.message) msg = json.error.message;
    if (!msg && json.error && typeof json.error === 'object' && json.error.message) msg = json.error.message;
    if (!msg && json.err && typeof json.err === 'string') msg = json.err;
    if (!msg && typeof json.message === 'string') msg = json.message;
    return { ok: false, message: '服务返回错误：' + (msg || '未知错误格式'), kind: 'invalid' };
  }

  // Claude type='claude'：检查 content 字段
  if (apiType === 'claude') {
    if (json.content && Array.isArray(json.content) && json.content.length > 0) return { ok: true };
    if (json.type === 'message') return { ok: true };
    return { ok: false, message: 'Claude 返回格式异常：' + (text ? text.substring(0, 60) : '空'), kind: 'invalid' };
  }

  // OpenAI 兼容：检查 choices 字段或 content 字段
  if (json.choices && Array.isArray(json.choices) && json.choices.length > 0) return { ok: true };
  if (json.data) return { ok: true };

  // 有些服务商返回 content 字段
  if (json.content) return { ok: true };

  // 如果什么都没有，但也是 2xx → 可能是特殊响应
  if (text && text.length > 0 && !/error|fail|invalid/i.test(text.substring(0, 200))) {
    return { ok: true };
  }

  return { ok: false, message: '响应格式异常（HTTP ' + status + '）', kind: 'invalid' };
}

function getAiKey(provider) {
  const keys = DB.getApiKeys(provider);
  if (!keys || keys.length === 0) return '';
  if (currentKeyIndex[provider] === undefined) currentKeyIndex[provider] = 0;
  const idx = currentKeyIndex[provider] % keys.length;
  return keys[idx];
}

function rotateApiKey(provider) {
  const keys = DB.getApiKeys(provider);
  if (!keys || keys.length <= 1) return false;
  currentKeyIndex[provider] = ((currentKeyIndex[provider] || 0) + 1) % keys.length;
  return true;
}

// ================================================================
// 错误分类器：根据 HTTP 状态码 + 响应体错误文案，统一归类
// kind: 'quota'    = 额度/余额不足/超限（换 key 或充值）
// kind: 'invalid'  = 密钥无效 / 未授权 / 格式错误（换 key）
// kind: 'rate'     = 频率超限 / 并发超限（稍后重试或换 key）
// kind: 'network'  = 网络/连接错误（换服务商或重试）
// kind: 'other'    = 其它业务/模型错误
// ================================================================
function _classifyApiError(status, text, json) {
  var kind = 'other';
  var message = text || ('HTTP ' + status);
  var str = (text || '').toLowerCase();

  // 先看状态码大类
  if (status === 401 || status === 403) {
    kind = 'invalid';
    message = '密钥无效或未授权（' + status + '），请检查该服务商密钥是否正确。';
  } else if (status === 402) {
    kind = 'quota';
    message = '该密钥额度已用尽或余额不足，请充值或更换密钥。';
  } else if (status === 429) {
    kind = 'rate';
    message = '请求频率超限或并发已满，稍后重试或切换到其它密钥/服务商。';
  } else if (status >= 500) {
    kind = 'network';
    message = '服务商服务端错误（' + status + '），可能暂时不可用。';
  } else if (status === 404) {
    kind = 'other';
    message = '请求地址或模型不存在（404），请检查配置。';
  } else if (status === 400) {
    kind = 'other';
    message = '请求参数错误（400），可能是模型名/输入长度不支持。';
  }

  // 再根据错误中的关键词，二次修正（最关键）
  // v48: 大幅扩展关键词，覆盖常见服务商（OpenAI/Anthropic/Groq/DeepSeek/智谱/通义/百度/零一/百川/Mistral/CoHere/阶跃/硅基流动 等）的错误格式
  var quotaRE = /(insufficient|quota|balance|exhausted|out of|额度|余额|已用完|套餐|token.*limit|billing|payment|credit|insufficient.*balance|run.*out.*of.*credit|usage.*exceeded|exceeded.*quota|account.*inactive|free.*tier.*ended|premium|trial.*ended|no.*quota|over.*quota|余额不足|没钱|欠费|expired|已过期|insufficient_quota|credit.*exhausted|limit.*exceeded)/i;
  var invalidRE = /(invalid|unauthorized|forbidden|auth|invalid.*api|api.*key.*invalid|key.*not|incorrect|未授权|无效|错误的|不存在的key|wrong.*key|bad.*key|bad.*api|authentication.*failed|cannot.*authorize|invalid.*auth|api.*key.*not|key.*rejected|not.*authorized|认证失败|鉴权失败|无权访问|key.*invalid|wrong.*api|invalid_key|forbidden.*key|apikey.*invalid)/i;
  var rateRE = /(rate.*limit|too.*many|rate|concurrent|server.*busy|频率|并发|太快|retry.*after|请求过多|并发超限|rate.*exceed|throttl|overload|busy|please.*wait|稍候|稍后重试|retryable)/i;
  var networkRE = /(connection.*(refused|reset|timeout)|timeout|timed out|econn|enet|ehost|dns.*fail|network.*error|ssl.*error|tls.*error|fetch.*fail|无法连接|连接超时|网络错误|服务不可用|connection refused|service.*unavailable|503|502|504|gateway|bad gateway)/i;

  if (quotaRE.test(str)) {
    kind = 'quota';
    message = '该密钥额度已用尽或余额不足，请更换密钥或充值后再试。';
  } else if (status !== 429 && status !== 402 && invalidRE.test(str)) {
    kind = 'invalid';
    message = '该服务商密钥无效、格式错误或已被吊销，请更换密钥。';
  } else if (rateRE.test(str)) {
    kind = 'rate';
    message = '请求频率或并发超限，稍后再试或切换到其它密钥/服务商。';
  } else if (networkRE.test(str)) {
    kind = 'network';
    message = '网络连接异常或服务商暂时不可用，请稍后重试。';
  }

  // 同时尝试用 json.error.message / json.message 里的原文拼接（便于用户看到实际信息）
  var raw = '';
  try {
    if (json && json.error) raw = (typeof json.error === 'string') ? json.error : (json.error.message || json.error.code || json.error.type || '');
    else if (json && json.message) raw = json.message;
    else if (json && json.msg) raw = json.msg;
    else if (json && json.error_msg) raw = json.error_msg;
    else if (json && json.data && json.data.error) raw = json.data.error;
  } catch (e) {}
  if (raw && raw.length > 2) message += '（服务商返回：' + String(raw).slice(0, 80) + '）';

  return { kind: kind, message: message, status: status };
}

// ================================================================
// v48: 统一 AI 输出清理 —— 去掉"好的/以下是..."等对话语、清理多余章节前缀
// 调用时机：所有 AI 生成结果返回给用户前都应当调用此函数
// ================================================================
function cleanAIOutput(text, opts) {
  if (!text) return text;
  opts = opts || {};
  var t = String(text);

  // 1) 去除首尾空白
  t = t.trim();

  // 2) 去除对话式开头（中英文都处理）
  var headerRE = /^(好的|好的，|好的。|好的，没问题|明白了|我明白了|收到|以下是|以下为|下面是|根据你的要求|根据要求|按照你提供的|我来帮你|让我来|当然可以|没问题|好的\s*[:：]|Sure|Certainly|Here is|Here are|Below is|Alright|Okay|OK|Great|Let me|I will|I'll)([\s\S]{0,30}?)([:：。!！\n\r]{1,2})/i;
  for (var safety = 0; safety < 5; safety++) {
    var before = t;
    t = t.replace(headerRE, '');
    t = t.trim();
    // 去掉"xxx："形式的短标题（如果后面紧跟内容）
    if (/^[^|\n\r]{0,20}[：:]\s*\n/.test(t)) t = t.replace(/^[^|\n\r]{0,20}[：:]\s*\n/, '');
    if (before === t) break;
  }

  // 3) 去除结尾的"如有需要..."、"希望对你有帮助"等礼貌语
  var footerREs = [
    /\n*(如有需要|希望对你|有帮助|如需修改|请随时|告诉我|请告知|如果需要|可以继续|期待你的|以上为|以上是|---*\s*$)[\s\S]{0,100}$/i,
    /\n*(祝|祝你|愿你)[\s\S]{0,40}$/
  ];
  for (var fi = 0; fi < footerREs.length; fi++) {
    t = t.replace(footerREs[fi], '').trim();
  }

  // 4) 去除只包含标记符号的空行（如单独一行 "---" "===" "***"）
  t = t.replace(/\n[-\*_\=\~]{3,}\s*(?=\n|$)/g, '\n');

  // 5) 合并 3 个以上的连续空行为 2 个
  t = t.replace(/\n{3,}/g, '\n\n');

  // 6) 针对正文写作模式：去除"第N章"的重复标题（如果正文开头就已经是标题）
  if (opts.stripChapterHeader && /^第[一二三四五六七八九十百\d零两]+[章回合篇卷]/.test(t)) {
    // 保留第一行作为标题（不删），但确保不出现"标题 + 空行 + 重复标题"
  }

  // 7) 清理 AI 常见的包裹标记（如 ```markdown ... ```）
  t = t.replace(/^```(markdown|md|text|json|javascript)?[\s\n]*/i, '').replace(/[\s\n]*```$/g, '');

  // 8) 去除"内容如下"之类的过渡语
  t = t.replace(/^(具体内容)?(如下|如下所示|为)[：:。\s]+/i, '').trim();

  return t;
}

// 挂载到全局
window.cleanAIOutput = cleanAIOutput;

// 内部单次调用（不做 key 轮换，由外层负责）
// v48: extraOpts (可选) { maxTokens: number } 用于动态设置输出 token 数
async function _callOnce(provider, key, prompt, model, signal, extraOpts) {
  const providerConfig = API_PROVIDERS[provider];
  if (!providerConfig) throw new Error('未知服务商: ' + provider);
  if (!key) throw new Error('未提供密钥');
  var isMsg = Array.isArray(prompt);
  let response, result = '';

  try {
    if (providerConfig.type === 'claude') {
      // Claude (Anthropic) 专用格式
      var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
      var systemMsg = '';
      var filteredMsgs = [];
      for (var mi = 0; mi < messages.length; mi++) {
        if (messages[mi].role === 'system') {
          systemMsg = messages[mi].content;
        } else {
          filteredMsgs.push(messages[mi]);
        }
      }
      var reqBody = {
        model: model || 'claude-sonnet-4-20250514',
        messages: filteredMsgs,
        max_tokens: (extraOpts && extraOpts.maxTokens) || DEFAULT_MAX_TOKENS
      };
      if (systemMsg) reqBody.system = systemMsg;
      response = await fetch(providerConfig.url, {
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
      var okText = '';
      try { okText = await response.text(); } catch (_) {}
      if (!response.ok) {
        var json = null;
        try { if (okText) json = JSON.parse(okText); } catch (je) {}
        if (!json) json = { error: { message: okText || ('服务器返回异常（HTTP ' + response.status + '）') } };
        var err = _classifyApiError(response.status, okText, json);
        var e = new Error(err.message);
        e.kind = err.kind;
        e.status = response.status;
        e.provider = provider;
        throw e;
      }
      var okData = null;
      try { if (okText) okData = JSON.parse(okText); } catch (je) {}
      if (!okData) {
        var err3 = new Error('服务返回非 JSON：' + (okText ? okText.substring(0, 60) : '空'));
        err3.kind = 'network'; err3.provider = provider; throw err3;
      }
      result = (okData.content && okData.content[0] && okData.content[0].text) || '';
    } else {
      // OpenAI 兼容
      var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
      response = await fetch(providerConfig.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify({
          model: model || 'deepseek-chat',
          messages: messages,
          max_tokens: (extraOpts && extraOpts.maxTokens) || DEFAULT_MAX_TOKENS,
          temperature: 0.7
        }),
        signal: signal
      });
      var okText2 = '';
      try { okText2 = await response.text(); } catch (_) {}
      if (!response.ok) {
        var json2 = null;
        try { if (okText2) json2 = JSON.parse(okText2); } catch (je) {}
        if (!json2) json2 = { error: { message: okText2 || ('服务器返回异常（HTTP ' + response.status + '）') } };
        var err2 = _classifyApiError(response.status, okText2, json2);
        var e2 = new Error(err2.message);
        e2.kind = err2.kind;
        e2.status = response.status;
        e2.provider = provider;
        throw e2;
      }
      var okData2 = null;
      try { if (okText2) okData2 = JSON.parse(okText2); } catch (je) {}
      if (!okData2) {
        var ne2 = new Error('服务返回非 JSON：' + (okText2 ? okText2.substring(0, 60) : '空'));
        ne2.kind = 'network'; ne2.provider = provider; throw ne2;
      }
      result = (okData2.choices && okData2.choices[0] && okData2.choices[0].message && okData2.choices[0].message.content) || '';
    }
  } catch (e) {
    // 网络级错误（如跨域、DNS、断开、AbortError）
    if (e && e.name === 'AbortError') throw e;
    if (e && e.kind) throw e; // 已经归类
    var ne = new Error('网络错误或无法连接到 ' + (providerConfig.name || provider) + '（' + (e && e.message ? e.message : 'unknown') + '）');
    ne.kind = 'network';
    ne.provider = provider;
    throw ne;
  }

  if (!result || !result.trim()) {
    var empty = new Error('服务商返回内容为空');
    empty.kind = 'other';
    empty.provider = provider;
    throw empty;
  }
  // v48: 统一清理 AI 对话语前缀/后缀
  return cleanAIOutput(result);
}

// 单服务商调用：该服务商下的 **全部 key** 都会依次尝试
// 任一 key 成功即返回结果；全部失败返回 null，并把最后一次错误挂在 callRealAPI.lastErr 上
async function callRealAPI(prompt, onProgress, opts) {
  opts = opts || {};
  const config = DB.getApiConfig();
  const provider = (opts.provider) || (config && config.provider) || 'deepseek';
  const model    = (opts.model)    || (config && config.model)    || '';
  const keys = DB.getApiKeys(provider);
  if (!keys || keys.length === 0) {
    if (!opts.silent) showToast('请先在设置中添加 ' + (API_PROVIDERS[provider] ? API_PROVIDERS[provider].name : provider) + ' 的 API 密钥');
    return null;
  }

  if (!opts.silent) showLoading('AI生成中…');
  const timeoutMs = getApiTimeoutMs();
  let lastErr = null;
  // 轮询该服务商下的 **全部** 密钥（上限 API_MAX_KEY_RETRY，避免异常数据导致死循环）
  const total = Math.min(keys.length, API_MAX_KEY_RETRY);
  for (let attempt = 0; attempt < total; attempt++) {
    const key = getAiKey(provider);
    if (!key) break;
    let ac = new AbortController();
    if (opts.signal) { try { opts.signal.addEventListener('abort', function(){ ac.abort(); }); } catch(e){} }
    let aborted = false;
    let timeoutId = setTimeout(function() { aborted = true; ac.abort(); }, timeoutMs);
    try {
      // v48: 如果调用时指定了 maxTokens，优先使用它（覆盖 DEFAULT_MAX_TOKENS）
      var extraOpts = opts.maxTokens ? { maxTokens: opts.maxTokens } : null;
      const result = await _callOnce(provider, key, prompt, model, ac.signal, extraOpts);
      clearTimeout(timeoutId);
      if (!opts.silent) hideLoading();
      if (onProgress && result) onProgress(result);
      return result;
    } catch (e) {
      clearTimeout(timeoutId);
      lastErr = e;
      // 超时 - 尝试下一个 key
      if (aborted || (e && e.name === 'AbortError')) {
        if (!opts.silent && attempt === 0) showToast('请求超时（' + (timeoutMs/1000) + 's），尝试下一个密钥…', { duration: 1800 });
      }
      // 额度/密钥无效：给出针对性提示，并继续切换下一个 key
      if (!opts.silent && e && e.kind === 'quota') {
        showToast((API_PROVIDERS[provider] ? API_PROVIDERS[provider].name : provider) + ' 额度已用尽，尝试下一个密钥…', { duration: 2000 });
      } else if (!opts.silent && e && e.kind === 'invalid') {
        showToast((API_PROVIDERS[provider] ? API_PROVIDERS[provider].name : provider) + ' 密钥无效，尝试下一个密钥…', { duration: 2000 });
      } else if (!opts.silent && e && e.kind === 'rate') {
        showToast((API_PROVIDERS[provider] ? API_PROVIDERS[provider].name : provider) + ' 频率超限，尝试下一个密钥…', { duration: 1800 });
      } else if (!opts.silent && e && e.kind === 'network') {
        if (attempt === 0) showToast((API_PROVIDERS[provider] ? API_PROVIDERS[provider].name : provider) + ' 网络错误，尝试下一个密钥…', { duration: 1800 });
      }
      // 每一个 key 都 rotate 一次，确保下次循环拿到不同的 key（即便只有 1 个也直接退出）
      if (keys.length > 1 && attempt < total - 1) {
        rotateApiKey(provider);
        continue;
      }
      break;
    }
  }
  callRealAPI.lastErr = lastErr;
  if (!opts.silent) hideLoading();
  if (!opts.silent && lastErr) console.warn('[api] '+provider+' 失败：', lastErr && lastErr.message);
  return null;
}

// === 极简分工路由表（按任务类型智能选择服务商顺序） ===
// 每项任务指定 [首选, 备选1, 备选2, ...] 的回退链；__user__ 占位符会被替换成用户当前首选服务商
var TASK_ROUTE = {
  // ===== 一、世界观构建 =====
  world_rules:    ['deepseek', 'dashscope', 'zhipu', 'moonshot', 'baidu', 'siliconflow', 'stepfun'],
  world_creative: ['zhipu', 'deepseek', 'moonshot', 'dashscope', 'claude', 'minimax', 'anthropic'],
  world_names:    ['dashscope', 'zhipu', 'deepseek', 'moonshot', 'baidu', 'yi', 'qwenlm'],
  world_integrate:['moonshot', 'deepseek', 'zhipu', 'dashscope', 'baichuan', 'stepfun'],
  world:          ['deepseek', 'zhipu', 'dashscope', 'moonshot', 'baidu', 'siliconflow'],

  // ===== 二、人物设计 =====
  chars_core:     ['zhipu', 'deepseek', 'moonshot', 'dashscope', 'claude', 'anthropic'],
  chars_minor:    ['volcano', 'zhipu', 'dashscope', 'moonshot', 'baidu', 'yi', 'stepfun'],
  chars_check:    ['deepseek', 'zhipu', 'moonshot', 'volcano', 'spark', 'qwenlm'],
  chars_integrate:['moonshot', 'zhipu', 'deepseek', 'dashscope', 'baichuan', 'minimax'],
  chars:          ['zhipu', 'deepseek', 'volcano', 'moonshot', 'claude', 'anthropic'],

  // ===== 三、大纲体系 =====
  outline_logic:  ['deepseek', 'zhipu', 'moonshot', 'dashscope', 'baidu', 'stepfun'],
  outline_optimize:['zhipu', 'deepseek', 'moonshot', 'dashscope', 'claude', 'minimax', 'anthropic'],
  outline_detail: ['dashscope', 'zhipu', 'deepseek', 'moonshot', 'baidu', 'yi', 'qwenlm'],
  outline_integrate:['moonshot', 'deepseek', 'zhipu', 'dashscope', 'baichuan', 'siliconflow'],
  outline:        ['deepseek', 'zhipu', 'dashscope', 'moonshot', 'baidu', 'stepfun'],

  // ===== 四、章节细纲 =====
  detail_base:    ['dashscope', 'volcano', 'deepseek', 'moonshot', 'baidu', 'siliconflow'],
  detail_emotion: ['volcano', 'dashscope', 'zhipu', 'moonshot', 'minimax', 'claude'],
  detail_check:   ['deepseek', 'zhipu', 'moonshot', 'dashscope', 'spark', 'qwenlm'],
  detail:         ['dashscope', 'volcano', 'deepseek', 'moonshot', 'baidu', 'stepfun'],

  // ===== 五、正文生成 =====
  write_normal:   ['dashscope', 'volcano', 'zhipu', 'deepseek', 'baidu', 'siliconflow', 'qwenlm'],
  write_dialogue: ['volcano', 'dashscope', 'zhipu', 'deepseek', 'minimax', 'stepfun'],
  write_key:      ['zhipu', 'deepseek', 'dashscope', 'volcano', 'claude', 'anthropic'],
  write_context:  ['moonshot', 'deepseek', 'dashscope', 'zhipu', 'baidu', 'siliconflow'],
  write:          ['dashscope', 'volcano', 'zhipu', 'deepseek', 'baidu', 'stepfun'],

  // ===== 六、质检优化 =====
  quality_logic:  ['deepseek', 'moonshot', 'zhipu', 'dashscope', 'spark', 'xai'],
  quality_consist:['moonshot', 'deepseek', 'zhipu', 'dashscope', 'baidu', 'anthropic'],
  quality_polish: ['zhipu', 'dashscope', 'deepseek', 'moonshot', 'claude', 'minimax', 'anthropic'],
  quality_proof:  ['dashscope', 'zhipu', 'moonshot', 'deepseek', 'baidu', 'groq'],
  quality:        ['deepseek', 'moonshot', 'zhipu', 'dashscope', 'baidu', 'xai'],

  // ===== 七、发布运营 =====
  publish_meta:   ['volcano', 'dashscope', 'zhipu', 'moonshot', 'baidu', 'yi'],
  publish_seo:    ['dashscope', 'volcano', 'zhipu', 'moonshot', 'yi', 'qwenlm'],
  publish:        ['volcano', 'dashscope', 'zhipu', 'moonshot', 'baidu', 'stepfun'],

  // ===== 通用 =====
  memory:         ['moonshot', 'deepseek', 'dashscope', 'zhipu', 'baidu', 'qwenlm'],
  consistency:    ['moonshot', 'deepseek', 'zhipu', 'dashscope', 'spark', 'anthropic'],
  fill:           ['deepseek', 'moonshot', 'dashscope', 'zhipu', 'siliconflow', 'together'],
  batch:          ['volcano', 'dashscope', 'deepseek', 'moonshot', 'groq', 'siliconflow', 'together'],
  polish:         ['zhipu', 'dashscope', 'deepseek', 'moonshot', 'claude', 'minimax', 'anthropic'],
  default:        ['__user__', 'deepseek', 'dashscope', 'volcano', 'moonshot', 'zhipu', 'baidu', 'siliconflow', 'groq', 'claude', 'minimax', 'yi', 'baichuan', 'spark', 'xai', 'stepfun', 'qwenlm', 'mistral', 'cohere', 'together']
};

// 跨服务商回退（不写入 DB.apiConfig，避免污染用户设置）
// 支持 taskType 参数，按任务智能选择首发服务商
// 任意服务商有 key 能产出结果即返回；**所有服务商所有 key 都失败时给出明确的总括提示**
// v48: 第4个参数 targetChars（目标中文字数）用于动态设置 max_tokens，避免输出被截断
async function callRealAPIWithFallback(prompt, onProgress, taskType, targetChars) {
  var isMessages = Array.isArray(prompt);
  taskType = taskType || 'default';
  // 根据目标字数动态计算 max_tokens
  // 策略：取「模型最大输出能力」和「目标字数换算」中的较大值，让AI发挥极限
  var dynamicMaxTokens = null;
  var modelMaxTokens = getModelMaxOutputTokens();
  if(targetChars && targetChars > 0){
    // 中文约 1.5 token/字，留 30% 余量
    var charsToTokens = Math.floor(targetChars * 1.5 * 1.3);
    // 取模型极限和字数需求的较大值，不人为设上限
    dynamicMaxTokens = Math.max(charsToTokens, modelMaxTokens);
  } else {
    // 没有指定字数时，直接用模型极限
    dynamicMaxTokens = modelMaxTokens;
  }
  // 最低保底 800
  dynamicMaxTokens = Math.max(800, dynamicMaxTokens);
  var config = DB.getApiConfig() || {};
  var userProvider = config.provider || 'deepseek';
  var route = TASK_ROUTE[taskType] || TASK_ROUTE['default'];

  // 构建实际尝试顺序：路由中 __user__ 替换为用户设的首选；去重；无 key 的跳过
  var seen = {};
  var order = [];
  for (var ri = 0; ri < route.length; ri++) {
    var rp = route[ri];
    if (rp === '__user__') rp = userProvider;
    if (!seen[rp] && API_PROVIDERS[rp]) {
      var rkeys = DB.getApiKeys(rp);
      if (rkeys && rkeys.length > 0) {
        order.push(rp);
        seen[rp] = true;
      }
    }
  }
  // 确保用户首选不在路由表内的也能被尝试
  if (!seen[userProvider]) {
    var ukeys = DB.getApiKeys(userProvider);
    if (ukeys && ukeys.length > 0) order.push(userProvider);
  }
  if (order.length === 0) {
    showToast('⚠️ 未配置任何 AI 密钥，请先在「设置→API 密钥管理」中添加后再试。', { error: true, duration: 4000 });
    return null;
  }

  showLoading('AI生成中，尝试服务商…', true);

  var totalTry = 0;
  var result = null;
  var lastKindSummary = { quota: 0, invalid: 0, rate: 0, network: 0, other: 0 };
  var lastProviderName = '';

  for (var oi = 0; oi < order.length && totalTry < API_MAX_TOTAL_TRY; oi++) {
    var provider = order[oi];
    totalTry++;
    // v48: 构建动态输出选项（如果提供了 targetChars，会覆盖 DEFAULT_MAX_TOKENS）
    var callOpts = { provider: provider, silent: oi !== 0 };
    if (dynamicMaxTokens) callOpts.maxTokens = dynamicMaxTokens;

    if (oi === 0) {
      // 静默尝试首选，用户无感
      showLoading('AI生成中…', true);
      result = await callRealAPI(prompt, onProgress, callOpts);
    } else {
      var name = API_PROVIDERS[provider] ? API_PROVIDERS[provider].name : provider;
      showLoading('切换到 ' + name + ' 重试…', true);
      result = await callRealAPI(prompt, onProgress, callOpts);
    }
    // 统计错误类型
    var le = callRealAPI && callRealAPI.lastErr;
    if (le && le.kind) lastKindSummary[le.kind] = (lastKindSummary[le.kind] || 0) + 1;
    if (result) {
      hideLoading();
      if (oi > 0) {
        showToast('已切换到 ' + (API_PROVIDERS[provider] ? API_PROVIDERS[provider].name : provider) + ' 完成生成', { duration: 2200 });
      }
      return result;
    }
  }

  hideLoading();

  // ===== 全部失败：给出明确、可行动的总括提示（按错误类型占比）=====
  var totalFailed = lastKindSummary.quota + lastKindSummary.invalid + lastKindSummary.rate + lastKindSummary.network + lastKindSummary.other;
  var mainIssue = '无法完成 AI 调用';
  var subHint = '请检查网络连接后重试。';
  if (totalFailed > 0) {
    if (lastKindSummary.quota >= lastKindSummary.invalid && lastKindSummary.quota >= lastKindSummary.network) {
      mainIssue = '🔴 所有可用的 API 密钥额度均已用尽';
      subHint = '请在「设置→API 密钥管理」中更换密钥或充值后再试。';
    } else if (lastKindSummary.invalid > 0 && lastKindSummary.invalid >= lastKindSummary.network) {
      mainIssue = '🔴 你的 key 无法使用（密钥无效或未授权）';
      subHint = '请在「设置→API 密钥管理」中核对密钥格式与所属服务商后再试。';
    } else if (lastKindSummary.network > 0) {
      mainIssue = '⚠️ 当前环境无法连通 AI 服务商';
      subHint = '请检查网络连接、浏览器代理或服务商站点是否正常，然后重试。';
    } else {
      mainIssue = '⚠️ 所有 AI 服务商均未能完成本次生成';
      subHint = '可能是输入内容过长、模型配置错误或服务商临时不可用，请稍后重试。';
    }
  }

  showToast(mainIssue + '。' + subHint, { error: true, duration: 5500 });
  // 继续返回本地兜底文本，保证用户至少看到一个占位
  return generateLocal(prompt);
}

// 本地兜底
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
window.getModelMaxOutputTokens = getModelMaxOutputTokens;
window.testApiKey = testApiKey;

// === v46: 多AI协作调用 —— 同时请求多个服务商，取第一个成功结果 ===
// settings.multiAI: true = 启用协作，false = 单AI模式
async function callMultiAI(prompt, onProgress, taskType) {
  // 读取用户设置
  var useMulti = false;
  try {
    var s = (DB && DB.settings) ? DB.settings : {};
    useMulti = !!s.multiAI;
  } catch(e) {}
  if (!useMulti) {
    return callRealAPIWithFallback(prompt, onProgress, taskType);
  }
  
  // 多AI模式：并行调用路由里有密钥的所有服务商，取第一个成功返回结果
  taskType = taskType || 'default';
  var config = DB.getApiConfig() || {};
  var userProvider = config.provider || 'deepseek';
  var route = TASK_ROUTE[taskType] || TASK_ROUTE['default'];
  
  // 收集所有可用服务商（不重复）
  var seen = {};
  var candidates = [];
  for (var ri = 0; ri < route.length; ri++) {
    var rp = route[ri];
    if (rp === '__user__') rp = userProvider;
    if (!seen[rp] && API_PROVIDERS[rp]) {
      var rkeys = DB.getApiKeys(rp);
      if (rkeys && rkeys.length > 0) {
        candidates.push(rp);
        seen[rp] = true;
      }
    }
  }
  // 如果只有一个，直接返回
  if (candidates.length <= 1) {
    return callRealAPIWithFallback(prompt, onProgress, taskType);
  }
  
  // 并行请求，谁先成功返回谁
  // v46：使用 AbortController，winner 确定后取消其余请求
  var controller = new AbortController();
  var sharedSignal = controller.signal;
  var promises = candidates.map(function(p) {
    return new Promise(function(resolve, reject) {
      callRealAPI(prompt, onProgress, { provider: p, silent: true, signal: sharedSignal }).then(function(r) {
        if (r && r.length > 20 && r.indexOf('AI 暂不可用') < 0) resolve({ provider: p, result: r });
        else reject(new Error(p + ': empty or error'));
      }).catch(reject);
    });
  });
  
  // Promise.race: 取第一个成功返回结果
  try {
    var winner = await Promise.race(promises);
    // 取到结果后立即取消其余请求
    try { controller.abort(); } catch(e) {}
    if (winner && winner.result) {
      if (winner.provider !== candidates[0]) {
        showToast('首服务商额度不足，' + API_PROVIDERS[winner.provider].name + ' 接力成功', { duration: 2000 });
      }
      return winner.result;
    }
  } catch(e) {
    try { controller.abort(); } catch(_) {}
    console.warn('[multiAI] 首请求失败，回退到串行回退', e && e.message);
  }
  
  // 如果所有并行都失败，回退到原来的串行回退机制
  return callRealAPIWithFallback(prompt, onProgress, taskType);
}

window.callMultiAI = callMultiAI;
