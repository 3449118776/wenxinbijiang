// Pages Functions - 统一处理 /api/* 路由
import {
  jwt_sign, jwt_verify, verify_password, hash_password,
  db_get_user_by_email, db_get_user_by_id, db_create_user, db_update_user,
  db_list_works, db_get_work, db_upsert_work,
  random_hex, random_code, json_response,
  setKVStore, KV
} from './_shared.js';

export async function onRequest(context) {
  const req = context.request;
  const url = new URL(req.url);
  const path = url.pathname;

  // 设置 KV 存储（从 context.env 获取）
  if (context.env && context.env.WXBJ_DATA) {
    setKVStore(context.env.WXBJ_DATA);
  }

  // 从 URL 中移除 /api 前缀
  const apiPath = path.replace(/^\/api/, '') || '/';

  // CORS 预检：所有 OPTIONS 请求直接返回成功
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // 公开路由
  if (apiPath === '/auth/register' && req.method === 'POST') return handle_register(req);
  if (apiPath === '/auth/login' && req.method === 'POST') return handle_login(req);
  if (apiPath === '/auth/forgot-password' && req.method === 'POST') return handle_forgot(req);
  if (apiPath === '/auth/reset-password' && req.method === 'POST') return handle_reset(req);
  if (apiPath === '/health' && req.method === 'GET') return json_response({ ok: true, time: Date.now() });

  // AI 代理路由（公开，密钥由前端提供）
  if (apiPath === '/ai/test' && req.method === 'POST') return handle_ai_test(req);
  if (apiPath === '/ai/chat' && req.method === 'POST') return handle_ai_chat(req);

  // 需要认证的路由
  const auth = req.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  const decoded = token ? await jwt_verify(token) : null;

  if (!decoded) return json_response({ error: '请先登录' }, 401);
  const userId = decoded.userId;

  if (apiPath === '/user/profile' && req.method === 'GET') return handle_profile(userId);
  if (apiPath === '/works' && req.method === 'GET') return handle_works_list(userId);
  if (apiPath.match(/^\/works\/[^\/]+$/) && req.method === 'GET') {
    const workId = apiPath.split('/')[2];
    return handle_work_get(userId, workId);
  }
  if (apiPath.match(/^\/works\/[^\/]+$/) && req.method === 'PUT') {
    const workId = apiPath.split('/')[2];
    return handle_work_upsert(req, userId, workId);
  }
  if (apiPath.match(/^\/works\/[^\/]+$/) && req.method === 'DELETE') {
    const workId = apiPath.split('/')[2];
    return handle_work_delete(userId, workId);
  }
  if (apiPath === '/works/sync/batch' && req.method === 'POST') return handle_batch(req, userId);
  if (apiPath.match(/^\/works\/[^\/]+\/delete$/) && req.method === 'POST') {
    const workId = apiPath.split('/')[2];
    return handle_work_delete(userId, workId);
  }

  return json_response({ error: '路由不存在: ' + apiPath }, 404);
}

// ============ 认证 ============
async function handle_register(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, nickname } = body;
    if (!email || !password) return json_response({ error: '邮箱和密码不能为空' }, 400);
    if (String(password).length < 6) return json_response({ error: '密码至少6位' }, 400);
    const user = await db_create_user(email, password, nickname);
    const token = await jwt_sign({ userId: user.id, email: user.email }, null, 30 * 24 * 3600);
    return json_response({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (e) {
    return json_response({ error: e.message || '注册失败' }, 500);
  }
}

async function handle_login(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;
    if (!email || !password) return json_response({ error: '邮箱和密码不能为空' }, 400);
    const user = await db_get_user_by_email(email);
    if (!user) return json_response({ error: '邮箱或密码不正确' }, 401);
    const ok = await verify_password(password, user.passwordHash);
    if (!ok) return json_response({ error: '邮箱或密码不正确' }, 401);
    user.visitCount = (user.visitCount || 0) + 1;
    user.lastVisitAt = new Date().toISOString();
    await db_update_user(user);
    const token = await jwt_sign({ userId: user.id, email: user.email }, null, 30 * 24 * 3600);
    return json_response({ token, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (e) {
    return json_response({ error: e.message || '登录失败' }, 500);
  }
}

async function handle_forgot(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;
    if (!email) return json_response({ error: '请提供邮箱' }, 400);
    const user = await db_get_user_by_email(email);
    if (!user) {
      // 安全：不区分是否存在，防止枚举攻击
      return json_response({ ok: true, message: '如果该邮箱已注册，我们已发送验证码' });
    }
    // 生成6位数字验证码（15分钟有效）
    const code = random_code();
    user.resetToken = code;
    user.resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await db_update_user(user);
    // 演示模式：直接返回验证码（生产环境应接入邮件发送服务）
    return json_response({ ok: true, code: code, token: code });
  } catch (e) {
    return json_response({ error: e.message || '操作失败' }, 500);
  }
}

async function handle_reset(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, code, password, token } = body;
    const resetToken = code || token; // 兼容两种字段名
    if (!email || !resetToken || !password) return json_response({ error: '参数不完整' }, 400);
    if (String(password).length < 6) return json_response({ error: '密码至少6位' }, 400);
    const user = await db_get_user_by_email(email);
    if (!user) return json_response({ error: '用户不存在' }, 404);
    if (!user.resetToken || user.resetToken !== resetToken) return json_response({ error: '验证码不正确' }, 400);
    if (!user.resetExpiresAt || new Date() > new Date(user.resetExpiresAt)) return json_response({ error: '验证码已过期，请重新获取' }, 400);
    user.passwordHash = await hash_password(password);
    user.resetToken = null;
    user.resetExpiresAt = null;
    await db_update_user(user);
    const newToken = await jwt_sign({ userId: user.id, email: user.email }, null, 30 * 24 * 3600);
    return json_response({ token: newToken, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (e) {
    return json_response({ error: e.message || '重置失败' }, 500);
  }
}

// ============ 用户信息 ============
async function handle_profile(userId) {
  try {
    const user = await db_get_user_by_id(userId);
    if (!user) return json_response({ error: '用户不存在' }, 404);
    return json_response({ user: { id: user.id, email: user.email, nickname: user.nickname, visitCount: user.visitCount, lastVisitAt: user.lastVisitAt } });
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

// ============ 作品 ============
async function handle_works_list(userId) {
  try {
    const works = await db_list_works(userId);
    return json_response({ works });
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

async function handle_work_get(userId, workId) {
  try {
    const w = await db_get_work(userId, workId);
    if (!w) return json_response({ error: '作品不存在' }, 404);
    let payload = {};
    try { payload = typeof w.payload === 'string' ? JSON.parse(w.payload) : (w.payload || {}); } catch (e) { payload = {}; }
    return json_response({
      work: {
        id: w.workId, workId: w.workId, title: w.title,
        category: w.category || '', synopsis: w.synopsis || '',
        payload, version: w.version || 1,
        chapterCount: w.chapterCount || 0, totalWords: w.totalWords || 0,
        updatedAt: w.updatedAt
      }
    });
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

async function handle_work_upsert(req, userId, workId) {
  try {
    const body = await req.json().catch(() => ({}));
    body.workId = body.workId || workId;
    const result = await db_upsert_work(userId, body);
    return json_response(result, result.status === 'created' ? 201 : 200);
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

async function handle_batch(req, userId) {
  try {
    const body = await req.json().catch(() => ({}));
    const items = body.items || [];
    const results = [];
    for (const it of items) {
      if (!it.workId) continue;
      try {
        const r = await db_upsert_work(userId, it);
        results.push({ workId: it.workId, ...r });
      } catch (e) {
        results.push({ workId: it.workId, error: e.message });
      }
    }
    return json_response({ results });
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

async function handle_work_delete(userId, workId) {
  try {
    const store = KV();
    if (!store) return json_response({ error: '存储未配置' }, 500);
    const key = 'work:' + userId + ':' + workId;
    await store.delete(key);
    let list = await store.get('works:' + userId, { type: 'json' }) || [];
    list = list.filter(id => id !== workId);
    await store.put('works:' + userId, JSON.stringify(list));
    return json_response({ ok: true });
  } catch (e) {
    return json_response({ error: e.message }, 500);
  }
}

// ============ AI 代理（解决浏览器 CORS 问题）============

// 服务商配置
const AI_PROVIDERS = {
  dashscope:   { url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', type: 'openai' },
  deepseek:    { url: 'https://api.deepseek.com/v1/chat/completions', type: 'openai' },
  moonshot:    { url: 'https://api.moonshot.cn/v1/chat/completions', type: 'openai' },
  zhipu:       { url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', type: 'openai' },
  volcano:     { url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', type: 'openai' },
  openai:      { url: 'https://api.openai.com/v1/chat/completions', type: 'openai' },
  baidu:       { url: 'https://qianfan.baidubce.com/v2/chat/completions', type: 'openai' },
  spark:       { url: 'https://spark-api-open.xf-yun.com/v1/chat/completions', type: 'openai' },
  minimax:     { url: 'https://api.minimax.chat/v1/text/chatcompletion_v2', type: 'openai' },
  siliconflow: { url: 'https://api.siliconflow.cn/v1/chat/completions', type: 'openai' },
  yi:          { url: 'https://api.lingyiwanwu.com/v1/chat/completions', type: 'openai' },
  baichuan:    { url: 'https://api.baichuan-ai.com/v1/chat/completions', type: 'openai' },
  groq:        { url: 'https://api.groq.com/openai/v1/chat/completions', type: 'openai' },
  claude:      { url: 'https://api.anthropic.com/v1/messages', type: 'claude' },
  xai:         { url: 'https://api.x.ai/v1/chat/completions', type: 'openai' },
  mistral:     { url: 'https://api.mistral.ai/v1/chat/completions', type: 'openai' },
  cohere:      { url: 'https://api.cohere.com/v1/chat', type: 'openai' },
  together:    { url: 'https://api.together.xyz/v1/chat/completions', type: 'openai' },
  anthropic:   { url: 'https://api.anthropic.com/v1/messages', type: 'claude' },
  stepfun:     { url: 'https://api.stepfun.com/v1/chat/completions', type: 'openai' },
  qwenlm:      { url: 'https://chat.qwen.ai/api/v1/chat/completions', type: 'openai' },
  openrouter:  { url: 'https://openrouter.ai/api/v1/chat/completions', type: 'openai' },
};

// 各服务商测试用模型
const AI_TEST_MODELS = {
  claude: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  groq: ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'],
  zhipu: ['glm-4-flash', 'glm-4-air', 'glm-4'],
  dashscope: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
  moonshot: ['moonshot-v1-8k', 'moonshot-v1-32k'],
  volcano: ['doubao-pro-4k', 'doubao-lite-4k'],
  baidu: ['ernie-4.0-8k', 'ernie-3.5-8k'],
  spark: ['generalv3.5', 'generalv3'],
  minimax: ['MiniMax-Text-01', 'abab6.5s-chat'],
  siliconflow: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct'],
  yi: ['yi-lightning', 'yi-large'],
  baichuan: ['Baichuan4', 'Baichuan3-Turbo'],
  xai: ['grok-2-1212', 'grok-2'],
  mistral: ['mistral-small-latest', 'mistral-large-latest'],
  cohere: ['command-r', 'command-r-plus'],
  together: ['meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'],
  stepfun: ['step-1-flash', 'step-1.5-flash'],
  qwenlm: ['qwen-coder-plus-latest', 'qwen3-max'],
  openrouter: ['mistralai/ministral-3b', 'google/gemma-3-27b-it'],
};

// AI 密钥测试
async function handle_ai_test(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { provider, key } = body;
    if (!provider) return json_response({ success: false, message: '缺少 provider' }, 400);
    if (!key || !key.trim()) return json_response({ success: false, message: '密钥为空' }, 400);

    const cfg = AI_PROVIDERS[provider];
    if (!cfg) return json_response({ success: false, message: '未知服务商: ' + provider }, 400);

    const models = AI_TEST_MODELS[provider] || ['deepseek-chat'];
    const timeoutMs = 25000;

    for (const model of models) {
      const ac = new AbortController();
      const tid = setTimeout(() => ac.abort(), timeoutMs);

      try {
        let resp;
        if (cfg.type === 'claude') {
          resp = await fetch(cfg.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': key.trim(),
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: model,
              max_tokens: 5,
              messages: [{ role: 'user', content: 'hi' }]
            }),
            signal: ac.signal
          });
        } else {
          resp = await fetch(cfg.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + key.trim()
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
        clearTimeout(tid);

        const text = await resp.text().catch(() => '');
        let json = null;
        try { json = JSON.parse(text); } catch(_) {}

        // 成功
        if (resp.ok) {
          if (cfg.type === 'claude') {
            if (json && json.content && Array.isArray(json.content)) {
              return json_response({ success: true, message: '密钥有效（' + model + '）' });
            }
          } else {
            if (json && json.choices && Array.isArray(json.choices) && json.choices.length > 0) {
              return json_response({ success: true, message: '密钥有效（' + model + '）' });
            }
          }
        }

        // 检查错误类型
        let errMsg = '';
        if (json && json.error) {
          errMsg = typeof json.error === 'string' ? json.error : (json.error.message || '');
        } else if (json && json.message) {
          errMsg = json.message;
        } else {
          errMsg = text.substring(0, 100);
        }

        // 404 或模型不存在 → 换下一个模型
        if (resp.status === 404 || /model|not found|不存在|invalid_model|model_not_found/i.test(text)) {
          continue;
        }

        // 其他错误 → 直接返回
        let kind = 'other';
        if (resp.status === 401 || resp.status === 403) kind = 'invalid';
        else if (resp.status === 402) kind = 'quota';
        else if (resp.status === 429) kind = 'rate';
        else if (resp.status >= 500) kind = 'network';

        return json_response({ success: false, message: errMsg || ('HTTP ' + resp.status), kind, status: resp.status });
      } catch (e) {
        clearTimeout(tid);
        if (e && e.name === 'AbortError') {
          return json_response({ success: false, message: '请求超时（25s）', kind: 'timeout' });
        }
        // 网络错误也换下一个模型试
        continue;
      }
    }

    return json_response({ success: false, message: '所有测试模型均失败（可能需要在该服务商控制台创建 endpoint）', kind: 'model' });
  } catch (e) {
    return json_response({ success: false, message: e.message || '测试异常' }, 500);
  }
}

// AI 对话代理
async function handle_ai_chat(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { provider, key, model, messages, maxTokens, temperature } = body;
    if (!provider) return json_response({ error: '缺少 provider' }, 400);
    if (!key) return json_response({ error: '缺少密钥' }, 400);

    const cfg = AI_PROVIDERS[provider];
    if (!cfg) return json_response({ error: '未知服务商: ' + provider }, 400);

    const ac = new AbortController();
    const tid = setTimeout(() => ac.abort(), 120000); // 2分钟超时

    try {
      let resp;
      if (cfg.type === 'claude') {
        // Claude 格式：分离 system 消息
        let systemMsg = '';
        const filteredMsgs = [];
        for (const m of (messages || [])) {
          if (m.role === 'system') systemMsg = m.content;
          else filteredMsgs.push(m);
        }
        const reqBody = {
          model: model || 'claude-sonnet-4-20250514',
          messages: filteredMsgs,
          max_tokens: maxTokens || 4096
        };
        if (systemMsg) reqBody.system = systemMsg;

        resp = await fetch(cfg.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(reqBody),
          signal: ac.signal
        });
      } else {
        // OpenAI 兼容格式
        resp = await fetch(cfg.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key
          },
          body: JSON.stringify({
            model: model || 'deepseek-chat',
            messages: messages || [],
            max_tokens: maxTokens || 4096,
            temperature: temperature !== undefined ? temperature : 0.7
          }),
          signal: ac.signal
        });
      }
      clearTimeout(tid);

      const text = await resp.text().catch(() => '');
      let json = null;
      try { json = JSON.parse(text); } catch(_) {}

      if (!resp.ok) {
        let errMsg = '';
        if (json && json.error) errMsg = typeof json.error === 'string' ? json.error : (json.error.message || '');
        else if (json && json.message) errMsg = json.message;
        else errMsg = text.substring(0, 200);
        return json_response({ error: errMsg || ('HTTP ' + resp.status), status: resp.status }, resp.status);
      }

      // 提取结果
      let result = '';
      if (cfg.type === 'claude') {
        result = (json && json.content && json.content[0] && json.content[0].text) || '';
      } else {
        result = (json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || '';
      }

      return json_response({ success: true, content: result, raw: json });
    } catch (e) {
      clearTimeout(tid);
      if (e && e.name === 'AbortError') {
        return json_response({ error: '请求超时（120s）' }, 504);
      }
      return json_response({ error: '网络错误：' + (e.message || 'unknown') }, 502);
    }
  } catch (e) {
    return json_response({ error: e.message || 'AI调用异常' }, 500);
  }
}
