// ====== 跨模块/跨页面 AI 消息链缓存 ======
// 用于架构设计页(architecture.html)和写作页(write.html)共享的模块间上下文记忆。
// 不注入原文/摘要，靠 AI API 的 messages 数组延续对话上下文。

// 模块名 → 对应 prompt 前缀
var _MODULE_CHAT_PROMPTS = {
  world: '请为我的小说构建完整的世界观设定，包括时代背景、地理环境、势力分布、力量体系、核心规则等所有必要维度。',
  chars: '请基于已有的世界观设定，为小说构建完整的人物人设体系，包括所有主要角色的身份、性格、经历、能力和关系网络。',
  outline: '请基于已有的世界观和人物人设，为小说设计完整的全书大纲，包括主线脉络、卷章结构、关键转折点和高潮布局。',
  detail: '请基于已有的世界观、人设和全书大纲，生成详细的章节细纲，包括每章的场景、人物、剧情节点和爆点/悬念。',
  chapter: '请基于已有的世界观、人设、大纲和细纲，生成当前的章节正文。'
};

// 构建前序模块的对话链 messages 数组
// currentModule 为 'chapter' 时包含所有架构模块 + 之前章节
// currentModule 为 'world' 时返回空数组
function buildArchChatChain(work, currentModule) {
  if (!work || !work._archChatChain || !Array.isArray(work._archChatChain)) return [];
  
  var chain = work._archChatChain;
  var result = [];
  for (var i = 0; i < chain.length; i++) {
    // 只返回当前模块之前模块的对话
    if (chain[i]._module === currentModule) break;
    result.push({
      role: chain[i].role,
      content: chain[i].content
    });
  }
  return result;
}

// 追加当前模块的对话到消息链
function appendArchChatMessage(work, module, role, content) {
  if (!work) return;
  if (!work._archChatChain || !Array.isArray(work._archChatChain)) {
    work._archChatChain = [];
  }
  work._archChatChain.push({
    role: role,
    content: content,
    _module: module,
    ts: Date.now()
  });
  // 每次追加后检查是否需要压缩
  compressArchChatChain(work);
}

// ========== 三级记忆压缩策略 ==========
// T1：架构模块 (world/chars/outline/detail) — 永远保留完整原文
// T2：最近 3 章 — 保留完整原文
// T3：更早章节 — 压缩为开头+结尾段落
// 触发条件：链中内容总长度超过 80K 字符

// 阈值（字符数）
var _CHAIN_COMPRESS_THRESHOLD = 80000;
// 保留最近章节数（完整保留）
var _CHAIN_KEEP_LAST_CHAPTERS = 3;

// 压缩单章内容：保留开头和结尾，中间压缩
function _compressChapterContent(content) {
  if (!content || content.length <= 3000) return content;
  var head = content.substring(0, 1500);
  // 找到第一个段落边界
  var headEnd = head.lastIndexOf('\n\n');
  if (headEnd > 800) head = head.substring(0, headEnd);
  
  var tail = content.substring(content.length - 1500);
  var tailStart = tail.indexOf('\n\n');
  if (tailStart > 0 && tailStart < 700) tail = tail.substring(tailStart + 2);
  
  return head + '\n\n...（中间内容已压缩，保留章节首尾关键段落）...\n\n' + tail;
}

// 压缩对话链：按三级策略压缩
function compressArchChatChain(work) {
  if (!work || !work._archChatChain || !Array.isArray(work._archChatChain)) return;
  
  // 1. 统计总长度
  var totalLen = 0;
  for (var i = 0; i < work._archChatChain.length; i++) {
    totalLen += (work._archChatChain[i].content || '').length;
  }
  if (totalLen <= _CHAIN_COMPRESS_THRESHOLD) return;
  
  // 2. 找出所有章节消息的最后 N 条（这些保留完整）
  var chapterEntries = [];
  for (var i = 0; i < work._archChatChain.length; i++) {
    if (work._archChatChain[i]._module === 'chapter') {
      chapterEntries.push(i);
    }
  }
  
  // 3. 需要压缩的章节索引（从旧到新，跳过最后 N 条）
  var compressCount = Math.max(0, chapterEntries.length - _CHAIN_KEEP_LAST_CHAPTERS * 2);
  // 每章节有 user + assistant 两条，所以 *2
  // 但每章只有 assistant 的内容才需要压缩，user 的 prompt 一般较短
  var compressedAny = false;
  for (var ci = 0; ci < compressCount; ci++) {
    var idx = chapterEntries[ci];
    var entry = work._archChatChain[idx];
    if (entry.role === 'assistant' && entry.content && entry.content.length > 3000 && !entry._compressed) {
      entry.content = _compressChapterContent(entry.content);
      entry._compressed = true;
      entry._compressedAt = Date.now();
      compressedAny = true;
    }
  }
  
  // 4. 如果压缩后仍然超阈值，继续压缩更早章节的 user message（更短的 prompt）
  if (compressedAny) {
    // 重新统计
    totalLen = 0;
    for (var i = 0; i < work._archChatChain.length; i++) {
      totalLen += (work._archChatChain[i].content || '').length;
    }
  }
  
  // 5. 极端情况：压缩后仍然超阈值（章节太多），进一步裁剪更早章节的 assistant 到更短
  if (totalLen > _CHAIN_COMPRESS_THRESHOLD) {
    for (var ci = 0; ci < Math.min(compressCount, chapterEntries.length); ci++) {
      var idx = chapterEntries[ci];
      var entry = work._archChatChain[idx];
      if (entry.role === 'assistant' && entry.content && entry.content.length > 800) {
        // 进一步压缩到仅仅 400+400
        if (entry.content.length > 1000) {
          var h = entry.content.substring(0, 400);
          var t = entry.content.substring(entry.content.length - 400);
          entry.content = h + '\n\n...（略）...\n\n' + t;
          entry._compressed = true;
        }
        break; // 一次只压缩一条，避免 O(n)
      }
    }
  }
}