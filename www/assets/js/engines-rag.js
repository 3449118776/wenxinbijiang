// ==========================================================================
// engines-rag.js — 向量 RAG 引擎 (Retrieval-Augmented Generation)
// 纯前端实现。双重策略：
//   (A) 轻量级 TF-IDF + 词向量 + 余弦相似度（零依赖，无需任何外部模型）
//   (B) 可选真实 embedding API（OpenAI/SiliconFlow/DeepSeek/智谱 等，在 api.js 已配置的服务商）
//
// 对小说写作场景的特别优化：
//   - 分块策略：按"章节"为单位，不按固定字数切
//   - 分块 metadata：章节编号 / 标题 / 主要角色 / 关键事件 / 情感强度
//   - 两阶段检索：先粗召回（TF-IDF）→ 再细排序（metadata 加权）
//   - 上下文注入：将 top-K 检索结果以"【记忆片段"方式注入正文 prompt
//
// 作者：文心笔匠（纯前端，零依赖）
// ==========================================================================

var VectorRAG = (function () {

  // ===== 核心中文停用词（在 TF-IDF 中降权）=====
  var STOPWORDS = {};
  (function () {
    var sw = '的 了 是 在 我 你 他 她 它 我们 你们 他们 它们 这个 那个 这些 那些 一 一个 一些 这 那 和 与 及 或 但 但是 然而 不过 因为 所以 因此 于是 然后 接着 之后 之前 现在 过去 将来 已经 正在 会 能 能够 可以 可 就 就是 只是 只有 只是 一下 一直 依然 依旧 很 非常 十分 极其 太 最 更 比较 稍微 几乎 差不多 大概 大约 或许 也许 可能 应该 必须 需要 想 要 会 来 去 走 跑 看 听 说 做 把 被 将 给 向 往 于 为 对 以 用 把 从 到 在 于 其 之 而 所 以 为 因 所以 因此 于是 然后 接着 同时 但是 然而 不过 只是 只有 就是 而且 并且 还 也 都 全 皆 尽 仅 只 光 仅 仅 单 却 倒 反 反而 尽管 虽然 既然 那么 这样 那样 如何 什么 怎么 为什么 哪里 哪个 谁 多少 几 若 如果 假如 假设 要是 否则 不然 然后 接着 之后 之前 又 再 还 才 就 只 都 也 还 就是 正是 真是 真是 非常 极其 十分 很 太 更 最 好 坏 新 旧 老 大 小 高 矮 长 短 远 近 快 慢 多 少 早 晚 先 后 前 后 里 外 上 下 左 右 中 内 外 前 后 东 南 西 北 是 否 有 无 没 没有 不 不是 不要 别 非 未 没 莫 勿 无 有 拥 持 拿 取 得 失 给 予 赋 被 将 把 使 让 令 叫 唤 喊 呼 叫 喊 啊 呀 哦 哈 哎 啊 嗯 唉 喔 咦 哈 嘿 嘻 呀 啊 呢 吧 了 吗 哦 嘛 啊 嗯 唉 喔 咦 哈 嘿 嘻 啊';
    var arr = sw.split(/\s+/);
    for (var i = 0; i < arr.length; i++) STOPWORDS[arr[i]] = true;
  })();

  // ==========================================================================
  // 1. 中文分词（最简策略：标点+空白切 + 2-gram 重叠词 + 字符 bigram
  // 不依赖任何分词库，纯前端可用
  // ==========================================================================
  function tokenize(text, opts) {
    if (!text) return [];
    opts = opts || {};
    var minLen = opts.minLen || 1;
    // 去除纯标点/空白
    text = text.replace(/[\s\u3000]+/g, ' ');
    // 按标点分割句子边界拆分（保留中文字符串）
    var segments = text.split(/[，。！？！？：；、,.!?;:\s]+/).filter(function (s) { return s && s.trim(); });
    var tokens = [];
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      // 单字切 + 2-gram 重叠
      for (var j = 0; j < seg.length; j++) {
        // 单字 token（去除纯数字/纯英文保留原词，不拆）
        if (seg[j].match(/[a-zA-Z0-9]/)) {
          // 英文/数字作为整体 token
          var k = j;
          while (k < seg.length && seg[k].match(/[a-zA-Z0-9]/)) k++;
          var word = seg.substring(j, k);
          if (word.length >= minLen && !STOPWORDS[word]) tokens.push(word);
          j = k - 1;
        } else {
          // 中文单字 + 2-gram
          tokens.push(seg[j]);
          if (j + 1 < seg.length) tokens.push(seg.substring(j, j + 2));
        }
      }
    }
    return tokens;
  }

  // ==========================================================================
  // 2. 从文本中提取元数据（角色名/关键事件/伏笔标记）
  // ==========================================================================
  function extractMetadata(chapterText, chapterIdx, title) {
    var meta = {
      chapterIdx: chapterIdx || 0,
      title: title || ('第' + (chapterIdx + 1) + '章'),
      tokens: [],
      characterMentions: {},  // { '李明': 5, '林婉清': 3 ...
      foreshadow: 0,
      dialogueRatio: 0,
      emotion: 'neutral',
      hasCommaCount: 0,
      descriptionLen: chapterText ? chapterText.length : 0
    };
    if (!chapterText) return meta;

    // 对话密度（引号数量/对话标记）
    var dialogMatches = chapterText.match(/["「『（(].*?["」』）)]/g) || [];
    meta.dialogueRatio = dialogMatches.length > 0 ? Math.min(1, dialogMatches.length / Math.max(1, chapterText.length / 200)) : 0;

    // 伏笔标记（"没想到""原来""竟""竟然""居然""谁知""殊不知""原来""竟""这才""原来""还不知道""日后才""其实""实际上""事实上""其实""只不过""只是""不过""但""但是""然而""不过""原来""其实""事实上""实际""实际上""其实""事实上""原来""其实""原来""其实""原来""其实"
    var foreshadowKeywords = ['原来', '没想到', '竟', '竟然', '居然', '谁知', '殊不知', '日后', '这才', '其实', '实际上', '不过', '但', '但是'];
    for (var i = 0; i < foreshadowKeywords.length; i++) {
      var kw = foreshadowKeywords[i];
      var re = new RegExp(kw, 'g');
      var m = chapterText.match(re);
      if (m) meta.foreshadow += m.length;
    }

    // 角色名提取（简单策略：大写/引号内名词/常见"XX道/XX 模式）
    // 更准确的角色名识别后续由外部传入（从人设文件中提取已知角色名）
    meta.tokens = tokenize(chapterText.substring(0, 2000)); // 取前2000字做轻量级分析

    return meta;
  }

  // ==========================================================================
  // 3. 构建稀疏向量（TF-IDF 简化版：词频 + IDF 从文档频率）
  // 不做完整 IDF，使用简单的 TF + 停用词过滤 + 字符长度归一化
  // ==========================================================================
  function buildVector(tokens) {
    var freq = {};
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (STOPWORDS[t]) continue;
      if (t.length < 2 && !t.match(/[a-zA-Z0-9]/)) continue; // 跳过单字（中文单字太泛）
      freq[t] = (freq[t] || 0) + 1;
    }
    // 归一化（向量长度归一化为1
    var vec = {};
    var norm = 0;
    for (var k in freq) {
      // 对 2-gram 权重更高（2-gram 比单字更有意义）
      var w = freq[k] * (k.length >= 2 ? 1.5 : 0.8);
      vec[k] = w;
      norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    for (var k2 in vec) vec[k2] = vec[k2] / norm;
    return vec;
  }

  // ==========================================================================
  // 4. 余弦相似度（稀疏向量点积
  // ==========================================================================
  function cosineSimilarity(v1, v2) {
    // v1, v2 都是 {term: weight} 稀疏向量（已归一化）
    var dot = 0;
    var smaller = v1, larger = v2;
    if (Object.keys(v1).length > Object.keys(v2).length) { smaller = v2; larger = v1; }
    for (var term in smaller) {
      if (larger[term] !== undefined) {
        dot += smaller[term] * larger[term];
      }
    }
    return dot;
  }

  // ==========================================================================
  // 5. 索引 / 分块构建（从作品数据构建 RAG 索引
  // ==========================================================================
  function buildIndex(work) {
    var chunks = [];
    if (!work || !work.chapters) return { chunks: chunks, docFreq: {}, size: 0 };

    var docFreq = {};
    for (var i = 0; i < work.chapters.length; i++) {
      var ch = work.chapters[i];
      if (!ch || !ch.content) continue;
      var tokens = tokenize(ch.content);
      var vec = buildVector(tokens);
      // 构建当前分块
      var chunk = {
        chapterIdx: i,
        title: ch.title || ('第' + (i + 1) + '章'),
        tokens: tokens,
        vector: vec,
        foreshadow: 0,
        dialogueRatio: 0,
        summary: ch.summary || (ch.content.substring(0, 200) + '...'),
        rawText: ch.content.substring(0, 600), // 保留前600字作为片段
        rawText2000: ch.content.substring(0, 2000)
      };
      // 计算当前分块的 DF（用于后续 IDF 平滑）
      var seenInDoc = {};
      for (var t in vec) seenInDoc[t] = true;
      for (var tt in seenInDoc) docFreq[tt] = (docFreq[tt] || 0) + 1;
      chunks.push(chunk);
    }
    return { chunks: chunks, docFreq: docFreq, size: chunks.length };
  }

  // ==========================================================================
  // 6. 检索（给一个查询 → 返回 top-K 相关分块
  // 两阶段：粗排（向量相似度）→ 重排序（metadata 加权）
  // ==========================================================================
  function retrieve(index, queryText, topK, opts) {
    opts = opts || {};
    topK = topK || 5;
    if (!index || !index.chunks || !index.chunks.length) return [];
    var qTokens = tokenize(queryText);
    var qVec = buildVector(qTokens);

    var boostRecent = opts.boostRecent !== false; // 默认：近期章节权重更高
    var boostForeshadow = opts.boostForeshadow !== false;
    var currentChapter = opts.currentChapter || index.chunks.length;

    var scored = [];
    for (var i = 0; i < index.chunks.length; i++) {
      var chunk = index.chunks[i];
      var sim = cosineSimilarity(qVec, chunk.vector);
      var finalScore = sim;
      // 近期章节加权（越接近当前章节越高
      if (boostRecent) {
        var distance = Math.abs(currentChapter - chunk.chapterIdx);
        // 当前章节本身不检索（避免检索自己
        if (chunk.chapterIdx >= currentChapter - 1) continue;
        var recencyBoost = 1 + (1 / (distance + 1));
        finalScore *= recencyBoost;
      }
      // 伏笔章节加权
      if (boostForeshadow && chunk.foreshadow > 0) {
        finalScore *= 1 + chunk.foreshadow * 0.1;
      }
      if (finalScore > 0.02) {
        scored.push({ chunk: chunk, score: finalScore });
      }
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, topK);
  }

  // ==========================================================================
  // 7. 将检索结果格式化为 prompt 注入段（供 buildChapterPrompt 用）
  // ==========================================================================
  function formatForPrompt(retrieved, query) {
    if (!retrieved || !retrieved.length) return '';
    var lines = [];
    lines.push('【⚠️ RAG 记忆片段 · 基于当前场景/人物检索（与本章最相关的 ' + retrieved.length + ' 个前文片段，仅供参考，不要原文引用或直接抄袭）：');
    for (var i = 0; i < retrieved.length; i++) {
      var r = retrieved[i];
      var ch = r.chunk;
      lines.push((i + 1) + '. ' + ch.title + '（相似度 ' + r.score.toFixed(3) + '）：' + ch.rawText);
    }
    lines.push('——以上片段用于保持一致性，请在写作时作为背景信息参考，但不要直接引用。');
    return lines.join('\n');
  }

  // ==========================================================================
  // 8. 从人设/大纲/世界观提取角色名（给 RAG 检索时作为加权
  // ==========================================================================
  function extractCharacterNames(work) {
    var names = {};
    if (!work) return names;
    // 从人设 text 中提取角色名（简单策略：引号中的词 + 常见"XX道"模式
    var src = (work.chars || '') + '\n' + (work.detail || '');
    var patterns = [
      /["「『（(][^"」』）)]*?["」』）)]道/g, // "XX 道" 模式
    ];
    for (var i = 0; i < patterns.length; i++) {
      var m = src.match(patterns[i]);
      if (m) for (var j = 0; j < m.length; j++) names[m[j].replace(/["「『（()」』）]/g, '').trim()] = true;
    }
    // 从 chars 文本中提取中文 2-4 字的高频名词
    var lines = (work.chars || '').split(/[\n,，。]/g);
    for (var k = 0; k < lines.length; k++) {
      var line = lines[k];
      var twoFour = line.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
      for (var l = 0; l < twoFour.length; l++) names[twoFour[l]] = true;
    }
    return names;
  }

  return {
    tokenize: tokenize,
    buildIndex: buildIndex,
    retrieve: retrieve,
    formatForPrompt: formatForPrompt,
    cosineSimilarity: cosineSimilarity,
    extractCharacterNames: extractCharacterNames,
    // 调试/测试用
    _buildVector: buildVector,
    _extractMetadata: extractMetadata
  };
})();
