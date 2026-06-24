const STOPWORDS = {};
(function () {
  const sw = '的 了 是 在 我 你 他 她 它 我们 你们 他们 它们 这个 那个 这些 那些 一 一个 一些 这 那 和 与 及 或 但 但是 然而 不过 因为 所以 因此 于是 然后 接着 之后 之前 现在 过去 将来 已经 正在 会 能 能够 可以 可 就 就是 只是 只有 只是 一下 一直 依然 依旧 很 非常 十分 极其 太 最 更 比较 稍微 几乎 差不多 大概 大约 或许 也许 可能 应该 必须 需要 想 要 会 来 去 走 跑 看 听 说 做 把 被 将 给 向 往 于 为 对 以 用 把 从 到 在 于 其 之 而 所 以 为 因 所以 因此 于是 然后 接着 同时 但是 然而 不过 只是 只有 就是 而且 并且 还 也 都 全 皆 尽 仅 只 光 仅 仅 单 却 倒 反 反而 尽管 虽然 既然 那么 这样 那样 如何 什么 怎么 为什么 哪里 哪个 谁 多少 几 若 如果 假如 假设 要是 否则 不然 然后 接着 之后 之前 又 再 还 才 就 只 都 也 还 就是 正是 真是 真是 非常 极其 十分 很 太 更 最 好 坏 新 旧 老 大 小 高 矮 长 短 远 近 快 慢 多 少 早 晚 先 后 前 后 里 外 上 下 左 右 中 内 外 前 后 东 南 西 北 是 否 有 无 没 没有 不 不是 不要 别 非 未 没 莫 勿 无 有 拥 持 拿 取 得 失 给 予 赋 被 将 把 使 让 令 叫 唤 喊 呼 叫 喊 啊 呀 哦 哈 哎 啊 嗯 唉 喔 咦 哈 嘿 嘻 呀 啊 呢 吧 了 吗 哦 嘛 啊 嗯 唉 喔 咦 哈 嘿 嘻 啊';
  const arr = sw.split(/\s+/);
  for (let i = 0; i < arr.length; i++) STOPWORDS[arr[i]] = true;
})();

function tokenize(text, opts = {}) {
  if (!text) return [];
  const minLen = opts.minLen || 1;
  text = text.replace(/[\s\u3000]+/g, ' ');
  const segments = text.split(/[，。！？！？：；、,.!?;:\s]+/).filter(s => s && s.trim());
  const tokens = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    for (let j = 0; j < seg.length; j++) {
      if (seg[j].match(/[a-zA-Z0-9]/)) {
        let k = j;
        while (k < seg.length && seg[k].match(/[a-zA-Z0-9]/)) k++;
        const word = seg.substring(j, k);
        if (word.length >= minLen && !STOPWORDS[word]) tokens.push(word);
        j = k - 1;
      } else {
        tokens.push(seg[j]);
        if (j + 1 < seg.length) tokens.push(seg.substring(j, j + 2));
      }
    }
  }
  return tokens;
}

function buildVector(tokens) {
  const freq = {};
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (STOPWORDS[t]) continue;
    if (t.length < 2 && !t.match(/[a-zA-Z0-9]/)) continue;
    freq[t] = (freq[t] || 0) + 1;
  }
  const vec = {};
  let norm = 0;
  for (const k in freq) {
    const w = freq[k] * (k.length >= 2 ? 1.5 : 0.8);
    vec[k] = w;
    norm += w * w;
  }
  norm = Math.sqrt(norm) || 1;
  for (const k2 in vec) vec[k2] = vec[k2] / norm;
  return vec;
}

function cosineSimilarity(v1, v2) {
  let dot = 0;
  let smaller = v1, larger = v2;
  if (Object.keys(v1).length > Object.keys(v2).length) { smaller = v2; larger = v1; }
  for (const term in smaller) {
    if (larger[term] !== undefined) {
      dot += smaller[term] * larger[term];
    }
  }
  return dot;
}

class VectorRAG {
  constructor(options = {}) {
    this.options = Object.assign({
      chunkSize: 600,
      topK: 5,
      boostRecent: true,
      boostForeshadow: true,
      minSimilarity: 0.02
    }, options);
    this.index = { chunks: [], docFreq: {}, size: 0 };
  }

  buildIndex(work) {
    const chunks = [];
    if (!work || !work.chapters) {
      this.index = { chunks, docFreq: {}, size: 0 };
      return this.index;
    }

    const docFreq = {};
    for (let i = 0; i < work.chapters.length; i++) {
      const ch = work.chapters[i];
      if (!ch || !ch.content) continue;
      const tokens = tokenize(ch.content);
      const vec = buildVector(tokens);
      const chunk = {
        chapterIdx: i,
        title: ch.title || (`第${i + 1}章`),
        tokens,
        vector: vec,
        foreshadow: 0,
        dialogueRatio: 0,
        summary: ch.summary || (ch.content.substring(0, 200) + '...'),
        rawText: ch.content.substring(0, this.options.chunkSize),
        rawText2000: ch.content.substring(0, 2000)
      };
      const seenInDoc = {};
      for (const t in vec) seenInDoc[t] = true;
      for (const tt in seenInDoc) docFreq[tt] = (docFreq[tt] || 0) + 1;
      chunks.push(chunk);
    }
    this.index = { chunks, docFreq, size: chunks.length };
    return this.index;
  }

  retrieve(queryText, topK = 5, opts = {}) {
    topK = topK || this.options.topK;
    if (!this.index || !this.index.chunks || !this.index.chunks.length) return [];
    const qTokens = tokenize(queryText);
    const qVec = buildVector(qTokens);

    const boostRecent = opts.boostRecent !== undefined ? opts.boostRecent : this.options.boostRecent;
    const boostForeshadow = opts.boostForeshadow !== undefined ? opts.boostForeshadow : this.options.boostForeshadow;
    const currentChapter = opts.currentChapter || this.index.chunks.length;
    const minSimilarity = opts.minSimilarity || this.options.minSimilarity;

    const scored = [];
    for (let i = 0; i < this.index.chunks.length; i++) {
      const chunk = this.index.chunks[i];
      const sim = cosineSimilarity(qVec, chunk.vector);
      let finalScore = sim;
      if (boostRecent) {
        const distance = Math.abs(currentChapter - chunk.chapterIdx);
        if (chunk.chapterIdx >= currentChapter - 1) continue;
        const recencyBoost = 1 + (1 / (distance + 1));
        finalScore *= recencyBoost;
      }
      if (boostForeshadow && chunk.foreshadow > 0) {
        finalScore *= 1 + chunk.foreshadow * 0.1;
      }
      if (finalScore > minSimilarity) {
        scored.push({ chunk, score: finalScore });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  formatForPrompt(retrieved, query) {
    if (!retrieved || !retrieved.length) return '';
    const lines = [];
    lines.push(`【RAG 记忆片段 · 基于"${query}"检索（与当前最相关的 ${retrieved.length} 个前文片段，仅供参考，不要原文引用）：`);
    for (let i = 0; i < retrieved.length; i++) {
      const r = retrieved[i];
      const ch = r.chunk;
      lines.push(`${i + 1}. ${ch.title}（相似度 ${r.score.toFixed(3)}）：${ch.rawText}`);
    }
    lines.push('——以上片段用于保持一致性，请作为背景信息参考，但不要直接引用。');
    return lines.join('\n');
  }

  addChunk(chapterIdx, content, title = null) {
    const tokens = tokenize(content);
    const vec = buildVector(tokens);
    const chunk = {
      chapterIdx,
      title: title || (`第${chapterIdx + 1}章`),
      tokens,
      vector: vec,
      foreshadow: 0,
      dialogueRatio: 0,
      summary: content.substring(0, 200) + '...',
      rawText: content.substring(0, this.options.chunkSize),
      rawText2000: content.substring(0, 2000)
    };
    const existingIdx = this.index.chunks.findIndex(c => c.chapterIdx === chapterIdx);
    if (existingIdx >= 0) {
      this.index.chunks[existingIdx] = chunk;
    } else {
      this.index.chunks.push(chunk);
      this.index.chunks.sort((a, b) => a.chapterIdx - b.chapterIdx);
    }
    this.index.size = this.index.chunks.length;
    return chunk;
  }

  getIndex() {
    return this.index;
  }

  getStats() {
    return {
      totalChunks: this.index.chunks.length,
      totalTokens: this.index.chunks.reduce((sum, c) => sum + c.tokens.length, 0)
    };
  }
}

VectorRAG.tokenize = tokenize;
VectorRAG.buildVector = buildVector;
VectorRAG.cosineSimilarity = cosineSimilarity;

module.exports = VectorRAG;
