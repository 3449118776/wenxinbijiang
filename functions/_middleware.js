// 全局 CORS 中间件
export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

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

  // 暴露环境变量（KV binding）到全局
  for (const key of Object.keys(context.env || {})) {
    globalThis[key] = context.env[key];
  }
  // JWT 密钥从环境变量读取
  if (context.env && context.env.WXBJ_SECRET) {
    globalThis.__JWT_SECRET = context.env.WXBJ_SECRET;
  }

  const response = await context.next();

  // 添加 CORS 响应头
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
