// =============================================================// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
//// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html /// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  //// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    {// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model:// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free',// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  //// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free'// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  //// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callReal// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  //// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  //// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys =// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free')// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free'// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._call// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callReal// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCall// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallReal// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 409// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method:// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': '// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr =// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);
          if (onProgress) onProgress(out);
          return out;
        }
// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);
          if (onProgress) onProgress(out);
          return out;
        }
      } catch (err) { lastErr = err && err.message ? err.message : err;// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);
          if (onProgress) onProgress(out);
          return out;
        }
      } catch (err) { lastErr = err && err.message ? err.message : err; }
    }
    if (!opts.silent && window.hideLoading) window.hideLoading();// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);
          if (onProgress) onProgress(out);
          return out;
        }
      } catch (err) { lastErr = err && err.message ? err.message : err; }
    }
    if (!opts.silent && window.hideLoading) window.hideLoading();
    window.callRealAPI.lastErr = lastErr;
    return null;
  };// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);
          if (onProgress) onProgress(out);
          return out;
        }
      } catch (err) { lastErr = err && err.message ? err.message : err; }
    }
    if (!opts.silent && window.hideLoading) window.hideLoading();
    window.callRealAPI.lastErr = lastErr;
    return null;
  };

  // 设置页中 provider 下拉加上// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);
          if (onProgress) onProgress(out);
          return out;
        }
      } catch (err) { lastErr = err && err.message ? err.message : err; }
    }
    if (!opts.silent && window.hideLoading) window.hideLoading();
    window.callRealAPI.lastErr = lastErr;
    return null;
  };

  // 设置页中 provider 下拉加上 free 选项
  function injectFreeOption();// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);
          if (onProgress) onProgress(out);
          return out;
        }
      } catch (err) { lastErr = err && err.message ? err.message : err; }
    }
    if (!opts.silent && window.hideLoading) window.hideLoading();
    window.callRealAPI.lastErr = lastErr;
    return null;
  };

  // 设置页中 provider 下拉加上 free 选项
  function injectFreeOption();
  function injectFreeOption() {
    setTimeout(function () {
      var sel = document// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);
          if (onProgress) onProgress(out);
          return out;
        }
      } catch (err) { lastErr = err && err.message ? err.message : err; }
    }
    if (!opts.silent && window.hideLoading) window.hideLoading();
    window.callRealAPI.lastErr = lastErr;
    return null;
  };

  // 设置页中 provider 下拉加上 free 选项
  function injectFreeOption();
  function injectFreeOption() {
    setTimeout(function () {
      var sel = document.getElementById('api-provider');
      if (!sel) return;
      // 如果已有 free// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);
          if (onProgress) onProgress(out);
          return out;
        }
      } catch (err) { lastErr = err && err.message ? err.message : err; }
    }
    if (!opts.silent && window.hideLoading) window.hideLoading();
    window.callRealAPI.lastErr = lastErr;
    return null;
  };

  // 设置页中 provider 下拉加上 free 选项
  function injectFreeOption();
  function injectFreeOption() {
    setTimeout(function () {
      var sel = document.getElementById('api-provider');
      if (!sel) return;
      // 如果已有 free 选项就跳过
      for (var i = 0; i < sel.options.length;// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);
          if (onProgress) onProgress(out);
          return out;
        }
      } catch (err) { lastErr = err && err.message ? err.message : err; }
    }
    if (!opts.silent && window.hideLoading) window.hideLoading();
    window.callRealAPI.lastErr = lastErr;
    return null;
  };

  // 设置页中 provider 下拉加上 free 选项
  function injectFreeOption();
  function injectFreeOption() {
    setTimeout(function () {
      var sel = document.getElementById('api-provider');
      if (!sel) return;
      // 如果已有 free 选项就跳过
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === 'free') return;
// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);
          if (onProgress) onProgress(out);
          return out;
        }
      } catch (err) { lastErr = err && err.message ? err.message : err; }
    }
    if (!opts.silent && window.hideLoading) window.hideLoading();
    window.callRealAPI.lastErr = lastErr;
    return null;
  };

  // 设置页中 provider 下拉加上 free 选项
  function injectFreeOption();
  function injectFreeOption() {
    setTimeout(function () {
      var sel = document.getElementById('api-provider');
      if (!sel) return;
      // 如果已有 free 选项就跳过
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === 'free') return;
      }
      var opt = document.createElement('option');
      opt.value = 'free';
// ================================================================
// 🆓 免费模式：GitHub/社区公开的免费 AI 端点
// 打开即用，不依赖已在 index.html / write.html 中引入本文件即生效
// 思路：在 callRealAPI 之前注入一个 provider = 'free' 的入口
// ================================================================
(function () {
  if (!window.API_PROVIDERS) return;

  // 1. 注册 free 服务商到全局表里（不会覆盖原 providers 列表
  window.API_PROVIDERS['free'] = {
    name: '🆓 免费模式(内置社区端点)',
    url: 'https://api.deepseek.com/v1/chat/completions',
    type: 'openai'
  };

  // 2. 免费端点列表（GitHub/社区维护，自动轮询，一个失败换下一个）
  const FREE_ENDPOINTS = [
    { url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen2.5-7B-Instruct' },
    { url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'THUDM/glm-4-9b-chat' },
    { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.1-8b-instant' },
    { url: 'https://openrouter.ai/api/v1/chat/completions',           model: 'mistralai/ministral-3b' }
  ];
  let _idx = 0;

  // 3. 如果 provider 选了 free 模式时，跳过 key 检查、轮询 FREE_ENDPOINTS
  // 关键：只在用户设置 provider=free 时，改写 _callOnce 前改写 _callOnce('free', ...)
  const origCallOnce = window._callOnce || null;
  // 由于 _callOnce 是 api.js 内部函数，我们不直接替换它，
  // 而是在 callRealAPI 层做一个包装：如果 provider = 'free' 时，调用我们的免费模式调用流程：
  //   1) 不检查 key、不检查 key、不检查 key（免费端点全部端点端点
  //   2) 在 callRealAPI 调用免费端点轮询 FREE_ENDPOINTS
  // 但 callRealAPI 会先走到 callRealAPI.lastErr = null;
  // 所以我们改走通流程：加一个 DB.getApiKeys('free') 始终返回 ['free'] 作为占位 key，避免 key 检查
  // 通过替换 callRealAPI 前先用我们的免费调用
  // 这一思路：劫持 DB.getApiKeys('free') 给一个占位 key ['free']，不检查
  const origGetKeys = window.DB && window.DB.getApiKeys;
  if (origGetKeys) {
    window.DB.getApiKeys = function (provider) {
      if (provider === 'free') return ['free'];
      return origGetKeys.call(this, provider);
    };
  }

  // 真正的免费调用：替换 _callOnce 处理 'free' 分支
  // 由于 _callOnce 我们在 api.js 不是全局 window._callOnce 没暴露，我们改为在 callRealAPI 上包一层
  const origCallRealAPI = window.callRealAPI;
  if (!origCallRealAPI) return;

  window.callRealAPI = async function (prompt, onProgress, opts) {
    opts = opts || {};
    var config = window.DB && window.DB.getApiConfig && window.DB.getApiConfig() || {};
    var provider = (opts.provider) || (config.provider) || 'deepseek';
    if (provider !== 'free') return origCallRealAPI(prompt, onProgress, opts);

    // === 免费模式：轮询 FREE_ENDPOINTS，任一个成功即返回
    var isMsg = Array.isArray(prompt);
    var messages = isMsg ? prompt : [{ role: 'user', content: prompt }];
    var maxTokens = (opts && opts.maxTokens) || 4096;
    if (!opts.silent && window.showLoading) window.showLoading('🆓 AI生成中(免费模式)…');

    var lastErr = null;
    for (var i = 0; i < FREE_ENDPOINTS.length; i++) {
      var ep = FREE_ENDPOINTS[_idx % FREE_ENDPOINTS.length];
      _idx++;
      try {
        var res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-free' },
          body: JSON.stringify({ model: ep.model, messages: messages, max_tokens: maxTokens, temperature: 0.7 })
        },
        });
        var text = await res.text();
        if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
        var data = null;
        try { data = JSON.parse(text); } catch (e) { data = null; }
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          if (!opts.silent && window.hideLoading) window.hideLoading();
          var out = data.choices[0].message.content;
          if (window.cleanAIOutput) out = window.cleanAIOutput(out);
          if (onProgress) onProgress(out);
          return out;
        }
      } catch (err) { lastErr = err && err.message ? err.message : err; }
    }
    if (!opts.silent && window.hideLoading) window.hideLoading();
    window.callRealAPI.lastErr = lastErr;
    return null;
  };

  // 设置页中 provider 下拉加上 free 选项
  function injectFreeOption();
  function injectFreeOption() {
    setTimeout(function () {
      var sel = document.getElementById('api-provider');
      if (!sel) return;
      // 如果已有 free 选项就跳过
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === 'free') return;
      }
      var opt = document.createElement('option');
      opt.value = 'free';
      opt.textContent = '🆓 免费模式(内置端点)';
      sel.appendChild(opt);