// ================================================================
// 🆓 免费模式：增强免费端点列表
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：如果存在全局 FREE_ENDPOINTS，则追加一些额外的公共端点
// ================================================================
(function () {
  if (typeof window.FREE_ENDPOINTS === 'undefined') return;

  // 增强免费端点（如有需要可在此扩展更多公共端点）
  var extraEndpoints = [
    { url: 'https://openrouter.ai/api/v1/chat/completions', model: 'qwen/qwen-2.5-7b-instruct', key: 'sk-free' }
  ];

  // 去重后并入 FREE_ENDPOINTS
  var existingUrls = window.FREE_ENDPOINTS.map(function (x) { return x.url + '|' + x.model; });
  extraEndpoints.forEach(function (ep) {
    if (existingUrls.indexOf(ep.url + '|' + ep.model) < 0) {
      window.FREE_ENDPOINTS.push(ep);
    }
  });
})();
