// 全局 CORS 中间件
export async function onRequest(context) {
  const request = context.request;

  // OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
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

  // 仅暴露必要的环境变量到全局
  const allowedKeys = new Set([
    'WXBJ_DATA', 'WXBJ_USERS', 'WXBJ_WORKS', 'WXBJ_SECRET',
    'DATABASE_URL', 'DATABASE_ID'
  ]);
  if (context.env) {
    for (const key of Object.keys(context.env)) {
      if (allowedKeys.has(key)) {
        globalThis[key] = context.env[key];
      }
    }
    if (context.env.WXBJ_SECRET) {
      globalThis.__JWT_SECRET = context.env.WXBJ_SECRET;
    }
  }

  const response = await context.next();

  // 添加 CORS 响应头（仅允许 wxbj-main.pages.dev 及相关域名）
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = origin.endsWith('.pages.dev') || origin.endsWith('.monkeycode-ai.online')
    ? origin : 'https://wxbj-main.pages.dev';

  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', allowedOrigin);
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
