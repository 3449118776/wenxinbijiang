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
  // 1. 中文分词（增强版：2-gram + 3-gram + 字符 bigram
  //    3-gram 对中文专有名词匹配更精准
  // ==========================================================================
  function tokenize(text, opts) {
    if (!text) return [];
    opts = opts || {};
    var minLen = opts.minLen || 1;
    var use3gram = opts.use3gram !== false; // 默认启用3-gram
    text = text.replace(/[\s\u3000]+/g, ' ');
    var segments = text.split(/[，。！？！？：；、,.!?;:\s]+/).filter(function (s) { return s && s.trim(); });
    var tokens = [];
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      for (var j = 0; j < seg.length; j++) {
        if (seg[j].match(/[a-zA-Z0-9]/)) {
          var k = j;
          while (k < seg.length && seg[k].match(/[a-zA-Z0-9]/)) k++;
          var word = seg.substring(j, k);
          if (word.length >= minLen && !STOPWORDS[word]) tokens.push(word);
          j = k - 1;
        } else {
          tokens.push(seg[j]);
          if (j + 1 < seg.length) tokens.push(seg.substring(j, j + 2));
          if (use3gram && j + 2 < seg.length) tokens.push(seg.substring(j, j + 3));
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
  // 3. 构建稀疏向量（TF-IDF 增强版：词频 + 长度加权 + 停用词过滤
  //    3-gram 权重最高（2.5x），2-gram 次之（1.5x），单字最低（0.5x）
  // ==========================================================================
  function buildVector(tokens) {
    var freq = {};
    var lenFreq = {}; // 按长度统计词频
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (STOPWORDS[t]) continue;
      if (t.length < 2 && !t.match(/[a-zA-Z0-9]/)) continue;
      freq[t] = (freq[t] || 0) + 1;
      var len = t.length;
      if (!lenFreq[len]) lenFreq[len] = 0;
      lenFreq[len]++;
    }
    var vec = {};
    var norm = 0;
    for (var k in freq) {
      var w = freq[k];
      if (k.length >= 3) w *= 2.5; // 3-gram 权重最高
      else if (k.length === 2) w *= 1.5; // 2-gram
      else w *= 0.5; // 单字
      vec[k] = w;
      norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    for (var k2 in vec) vec[k2] = vec[k2] / norm;
    return vec;
  }
  // ==========================================================================
  // 3b. BM25 相似度计算（增强版检索排序
  //    对长文本检索效果更好，考虑文档长度归一化
  // ==========================================================================
  function buildBM25Index(index) {
    if (!index || !index.chunks || !index.chunks.length) return index;
    if (index._bm25Ready) return index;
    var N = index.chunks.length;
    var avgdl = 0;
    for (var i = 0; i < N; i++) {
      avgdl += index.chunks[i].text.length;
    }
    avgdl = avgdl / N || 1;
    var df = {};
    for (var j = 0; j < N; j++) {
      var seen = {};
      var ctokens = index.chunks[j].tokens || [];
      for (var k = 0; k < ctokens.length; k++) {
        var t = ctokens[k];
        if (STOPWORDS[t] || t.length < 2) continue;
        if (!seen[t]) {
          df[t] = (df[t] || 0) + 1;
          seen[t] = true;
        }
      }
    }
    index._bm25 = { df: df, avgdl: avgdl, N: N };
    index._bm25Ready = true;
    return index;
  }
  function bm25Score(queryTokens, chunk, bm25Data, k1, b) {
    k1 = k1 || 1.5;
    b = b || 0.75;
    var score = 0;
    var dl = chunk.text.length;
    var avgdl = bm25Data.avgdl;
    var N = bm25Data.N;
    var df = bm25Data.df;
    var freq = {};
    var ct = chunk.tokens || [];
    for (var i = 0; i < ct.length; i++) {
      var t = ct[i];
      if (STOPWORDS[t] || t.length < 2) continue;
      freq[t] = (freq[t] || 0) + 1;
    }
    for (var j = 0; j < queryTokens.length; j++) {
      var qt = queryTokens[j];
      if (STOPWORDS[qt] || qt.length < 2) continue;
      var f = freq[qt] || 0;
      if (f === 0) continue;
      var dfi = df[qt] || 0;
      var idf = Math.log(1 + (N - dfi + 0.5) / (dfi + 0.5));
      var tfNum = f * (k1 + 1);
      var tfDen = f + k1 * (1 - b + b * dl / avgdl);
      score += idf * tfNum / tfDen;
    }
    return score;
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

  // ==========================================================================
  // 9. 通用文本索引构建（用于世界观/人设/大纲/记忆等任意文本的检索
  //    按段落/条目分块，每块单独索引
  // ==========================================================================
  function buildTextIndex(text, opts) {
    opts = opts || {};
    var chunkSize = opts.chunkSize || 300;  // 每块约300字
    var overlap = opts.overlap || 50;       // 重叠50字
    var chunks = [];
    if (!text) return { chunks: chunks, size: 0 };

    // 先按段落拆分
    var paragraphs = text.split(/\n\s*\n/).filter(function(p) { return p && p.trim().length > 5; });
    
    var chunkId = 0;
    for (var i = 0; i < paragraphs.length; i++) {
      var para = paragraphs[i].trim();
      if (para.length < 10) continue;
      
      // 短段落直接作为一块
      if (para.length <= chunkSize) {
        var tokens = tokenize(para);
        chunks.push({
          id: chunkId++,
          text: para,
          tokens: tokens,
          vector: buildVector(tokens),
          section: opts.sectionName || ''
        });
      } else {
        // 长段落按 chunkSize 滑动窗口分块
        for (var pos = 0; pos < para.length; pos += (chunkSize - overlap)) {
          var chunkText = para.substring(pos, pos + chunkSize);
          var ctokens = tokenize(chunkText);
          chunks.push({
            id: chunkId++,
            text: chunkText,
            tokens: ctokens,
            vector: buildVector(ctokens),
            section: opts.sectionName || '',
            paraIdx: i
          });
          if (pos + chunkSize >= para.length) break;
        }
      }
    }
    
    return { chunks: chunks, size: chunks.length };
  }

  // ==========================================================================
  // 10. 通用文本检索（增强版：余弦相似度 + BM25 混合排序 + 结果去重 + query扩展
  // ==========================================================================
  function retrieveText(index, queryText, topK, opts) {
    opts = opts || {};
    topK = topK || 5;
    var threshold = opts.threshold || 0.04;
    var useBM25 = opts.useBM25 !== false;
    var deduplicate = opts.deduplicate !== false;
    var diversity = opts.diversity || 0; // 0-1，多样性控制

    if (!index || !index.chunks || !index.chunks.length) return [];

    // v57: Query 扩展 — 从查询中提取关键名词/角色名并加权
    var qTokens = tokenize(queryText);
    var qVec = buildVector(qTokens);

    // 提取 query 中的关键词（长度>=2 的非停用词），用于 BM25 加权
    var keyTerms = [];
    var seenKey = {};
    for (var qi = 0; qi < qTokens.length; qi++) {
      var qt = qTokens[qi];
      if (qt.length >= 2 && !STOPWORDS[qt] && !seenKey[qt]) {
        keyTerms.push(qt);
        seenKey[qt] = true;
      }
    }

    // 构建 BM25 索引（只构建一次）
    if (useBM25) {
      buildBM25Index(index);
    }

    var scored = [];
    var maxBm25 = 0;
    var tempResults = [];

    for (var i = 0; i < index.chunks.length; i++) {
      var chunk = index.chunks[i];
      var sim = cosineSimilarity(qVec, chunk.vector);
      if (sim <= threshold * 0.5) continue; // 粗筛

      var finalScore = sim;

      // BM25 混合排序
      if (useBM25 && index._bm25) {
        var bm25s = bm25Score(qTokens, chunk, index._bm25);
        if (bm25s > maxBm25) maxBm25 = bm25s;
        tempResults.push({ chunk: chunk, cosine: sim, bm25: bm25s });
      } else {
        if (sim > threshold) {
          scored.push({ chunk: chunk, score: sim });
        }
      }
    }

    // BM25 归一化后与余弦相似度混合
    if (useBM25 && tempResults.length > 0) {
      for (var ti = 0; ti < tempResults.length; ti++) {
        var tr = tempResults[ti];
        var normBm25 = maxBm25 > 0 ? tr.bm25 / maxBm25 : 0;
        // 混合权重：余弦 0.6 + BM25 0.4
        var mixed = tr.cosine * 0.6 + normBm25 * 0.4;
        if (mixed > threshold) {
          scored.push({ chunk: tr.chunk, score: mixed, _cosine: tr.cosine, _bm25: tr.bm25 });
        }
      }
    }

    scored.sort(function (a, b) { return b.score - a.score; });

    // v57: 结果去重（相似度>0.9的视为重复，保留分高的）
    if (deduplicate && scored.length > 1) {
      var unique = [];
      for (var si = 0; si < scored.length; si++) {
        var candidate = scored[si];
        var isDup = false;
        for (var ui = 0; ui < unique.length; ui++) {
          var existing = unique[ui];
          // 用文本相似度判断重复
          var dupSim = _textSimilarity(candidate.chunk.text, existing.chunk.text);
          if (dupSim > 0.85) {
            isDup = true;
            break;
          }
          // 同一章节/同一段落的也去重
          if (candidate.chunk.paraIdx !== undefined && candidate.chunk.paraIdx === existing.chunk.paraIdx &&
              Math.abs(candidate.chunk.id - existing.chunk.id) <= 2) {
            isDup = true;
            break;
          }
        }
        if (!isDup) {
          unique.push(candidate);
        }
      }
      scored = unique;
    }

    // v57: 多样性控制 — 避免同一类型/章节的结果扎堆
    if (diversity > 0 && scored.length > topK) {
      var diverse = [];
      var usedSections = {};
      var remaining = scored.slice();
      while (diverse.length < topK && remaining.length > 0) {
        var picked = null;
        var pickedIdx = -1;
        for (var ri = 0; ri < remaining.length; ri++) {
          var item = remaining[ri];
          var sec = item.chunk.section || item.chunk.paraIdx || 'default';
          var secCount = usedSections[sec] || 0;
          // 多样性惩罚：同一section的第n个，分数乘以 (1 - diversity * 0.2 * n)
          var adjusted = item.score * (1 - diversity * 0.2 * secCount);
          if (adjusted > (picked ? picked._adjusted : -1)) {
            picked = item;
            picked._adjusted = adjusted;
            pickedIdx = ri;
          }
        }
        if (picked) {
          diverse.push(picked);
          var s = picked.chunk.section || picked.chunk.paraIdx || 'default';
          usedSections[s] = (usedSections[s] || 0) + 1;
          remaining.splice(pickedIdx, 1);
        } else {
          break;
        }
      }
      scored = diverse;
    }

    return scored.slice(0, topK);
  }

  // 辅助：计算两段文本的相似度（用于去重
  function _textSimilarity(t1, t2) {
    if (!t1 || !t2) return 0;
    if (t1 === t2) return 1;
    var shorter = t1.length < t2.length ? t1 : t2;
    var longer = t1.length < t2.length ? t2 : t1;
    if (longer.length < 5) return 0;
    // 用公共子串比例近似
    var common = 0;
    var step = Math.max(1, Math.floor(shorter.length / 20));
    for (var i = 0; i < shorter.length - 2; i += step) {
      var sub = shorter.substring(i, i + Math.min(4, shorter.length - i));
      if (longer.indexOf(sub) >= 0) common++;
    }
    return common / Math.max(1, Math.floor(shorter.length / step));
  }

  // ==========================================================================
  // 11. 格式化检索结果为 prompt 注入段
  // ==========================================================================
  function formatTextRetrieval(retrieved, label) {
    if (!retrieved || !retrieved.length) return '';
    var lines = [];
    lines.push('【' + (label || '相关记忆检索') + ' · 共' + retrieved.length + '条】');
    for (var i = 0; i < retrieved.length; i++) {
      var r = retrieved[i];
      lines.push((i + 1) + '. ' + r.chunk.text.trim());
    }
    return lines.join('\n') + '\n\n';
  }

  // ==========================================================================
  // 12. 从结构化记忆条目构建索引（用于 longMemory 各字段检索
  //     items: [{ text: ..., meta: {...} }, ...]
  // ==========================================================================
  function buildMemoryItemIndex(items) {
    var chunks = [];
    if (!items || !items.length) return { chunks: chunks, size: 0 };
    
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var text = item.text || item.content || item.title || item.status || '';
      if (!text) continue;
      var tokens = tokenize(text);
      chunks.push({
        id: i,
        text: text,
        tokens: tokens,
        vector: buildVector(tokens),
        meta: item.meta || item
      });
    }
    
    return { chunks: chunks, size: chunks.length };
  }

  return {
    tokenize: tokenize,
    buildIndex: buildIndex,
    retrieve: retrieve,
    formatForPrompt: formatForPrompt,
    cosineSimilarity: cosineSimilarity,
    extractCharacterNames: extractCharacterNames,
    buildTextIndex: buildTextIndex,
    retrieveText: retrieveText,
    formatTextRetrieval: formatTextRetrieval,
    buildMemoryItemIndex: buildMemoryItemIndex,
    buildBM25Index: buildBM25Index,
    bm25Score: bm25Score,
    // 调试/测试用
    _buildVector: buildVector,
    _extractMetadata: extractMetadata,
    _textSimilarity: _textSimilarity
  };
})();
