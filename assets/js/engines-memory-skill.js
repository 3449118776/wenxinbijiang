// ==========================================================================
// engines-memory-skill.js — 超强记忆引擎 (Super Memory Skill)
// 纯前端实现。零外部依赖。
//
// 六大核心子系统：
//   1. 记忆摄入 (MemoryIngestion)    — 从章节中自动提取结构化记忆
//   2. 记忆检索 (MemoryRetrieval)    — 语义+关键词+时序多维度检索
//   3. 记忆压缩 (MemoryCompression)  — 智能摘要化，支撑百万字长篇
//   4. 记忆关联 (MemoryLinking)      — 构建实体-事件-伏笔知识图谱
//   5. 记忆优化 (MemoryOptimization) — 重要性评分、冗余检测、冲突解决
//   6. 记忆查询 (MemoryQuery)        — 多跳查询、上下文注入、prompt 构建
//
// 设计目标：支撑 1000+ 章、200万+ 字的长篇小说记忆管理
// ==========================================================================

var MemorySkill = (function () {
  'use strict';

  // ==========================================================================
  // === 第一部分：基础工具层 ==================================================
  // ==========================================================================

  // ---- 中文停用词 ----
  var STOPWORDS = {};
  (function () {
    var sw = '的 了 是 在 我 你 他 她 它 我们 你们 他们 它们 这个 那个 这些 那些 一 一个 一些 这 那 和 与 及 或 但 但是 然而 不过 因为 所以 因此 于是 然后 接着 之后 之前 现在 过去 将来 已经 正在 会 能 能够 可以 可 就 就是 只是 只有 只是 一下 一直 依然 依旧 很 非常 十分 极其 太 最 更 比较 稍微 几乎 差不多 大概 大约 或许 也许 可能 应该 必须 需要 想 要 会 来 去 走 跑 看 听 说 做 把 被 将 给 向 往 于 为 对 以 用 从 到 在 于 其 之 而 所 以 为 因 所以 因此 于是 然后 接着 同时 但是 然而 不过 只是 只有 就是 而且 并且 还 也 都 全 皆 尽 仅 只 光 却 倒 反 反而 尽管 虽然 既然 那么 这样 那样 如何 什么 怎么 为什么 哪里 哪个 谁 多少 几 若 如果 假如 假设 要是 否则 不然 又 再 才 只 都 也 就是 正是 真是 非常 极其 十分 很 太 更 最 好 坏 新 旧 老 大 小 高 矮 长 短 远 近 快 慢 多 少 早 晚 先 后 前 里 外 上 下 左 右 中 内 东 南 西 北 是 否 有 无 没 没有 不 不是 不要 别 非 未 莫 勿 啊 呀 哦 哈 哎 嗯 唉 喔 咦 嘿 嘻 呢 吧 吗 嘛';
    var arr = sw.split(/\s+/);
    for (var i = 0; i < arr.length; i++) STOPWORDS[arr[i]] = true;
  })();

  // ---- 中文分词（2-gram + 单字） ----
  function tokenize(text, minLen) {
    if (!text) return [];
    minLen = minLen || 1;
    text = String(text).replace(/[\s\u3000]+/g, ' ');
    var segments = text.split(/[，。！？！？：；、,.!?;:\s]+/).filter(function (s) { return s && s.trim(); });
    var tokens = [];
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      for (var j = 0; j < seg.length; j++) {
        if (/[a-zA-Z0-9]/.test(seg[j])) {
          var k = j;
          while (k < seg.length && /[a-zA-Z0-9]/.test(seg[k])) k++;
          var word = seg.substring(j, k);
          if (word.length >= minLen && !STOPWORDS[word]) tokens.push(word);
          j = k - 1;
        } else {
          if (!STOPWORDS[seg[j]]) tokens.push(seg[j]);
          if (j + 1 < seg.length) {
            var bigram = seg.substring(j, j + 2);
            if (!STOPWORDS[bigram]) tokens.push(bigram);
          }
        }
      }
    }
    return tokens;
  }

  // ---- 简单哈希 ----
  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return h;
  }

  // ---- TF-IDF 计算 ----
  function computeTFIDF(docs) {
    var df = {}; // document frequency
    var N = docs.length;
    for (var d = 0; d < N; d++) {
      var tokens = docs[d].tokens || [];
      var seen = {};
      for (var t = 0; t < tokens.length; t++) {
        var tok = tokens[t];
        if (!seen[tok]) {
          df[tok] = (df[tok] || 0) + 1;
          seen[tok] = true;
        }
      }
    }
    for (var dd = 0; dd < N; dd++) {
      var tf = {};
      var toks = docs[dd].tokens || [];
      for (var tt = 0; tt < toks.length; tt++) {
        tf[toks[tt]] = (tf[toks[tt]] || 0) + 1;
      }
      docs[dd]._tfidf = {};
      for (var tk in tf) {
        var idf = Math.log((N + 1) / ((df[tk] || 0) + 1)) + 1;
        docs[dd]._tfidf[tk] = tf[tk] * idf;
      }
    }
    return docs;
  }

  // ---- 余弦相似度 ----
  function cosineSimilarity(vecA, vecB) {
    var dot = 0, normA = 0, normB = 0;
    for (var k in vecA) {
      dot += vecA[k] * (vecB[k] || 0);
      normA += vecA[k] * vecA[k];
    }
    for (var kb in vecB) {
      normB += vecB[kb] * vecB[kb];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // ---- 编辑距离（用于实体名模糊匹配） ----
  function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    var matrix = [];
    for (var i = 0; i <= b.length; i++) matrix[i] = [i];
    for (var j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (var ib = 1; ib <= b.length; ib++) {
      for (var jb = 1; jb <= a.length; jb++) {
        if (b.charAt(ib - 1) === a.charAt(jb - 1)) {
          matrix[ib][jb] = matrix[ib - 1][jb - 1];
        } else {
          matrix[ib][jb] = Math.min(matrix[ib - 1][jb - 1] + 1, matrix[ib][jb - 1] + 1, matrix[ib - 1][jb] + 1);
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // ==========================================================================
  // === 第二部分：记忆类型定义 ================================================
  // ==========================================================================

  var MEMORY_TYPES = {
    CHARACTER: 'character',       // 角色状态记忆
    PLOT: 'plot',                 // 情节事件记忆
    WORLD: 'world',               // 世界观规则记忆
    ITEM: 'item',                 // 道具/物品记忆
    RELATIONSHIP: 'relationship', // 人际关系记忆
    FORESHADOW: 'foreshadow',     // 伏笔记忆
    LOCATION: 'location',         // 地点记忆
    DIALOGUE: 'dialogue',         // 关键对话记忆
    EMOTION: 'emotion',           // 情感节点记忆
    CONFLICT: 'conflict'          // 冲突记忆
  };

  // ---- 记忆重要性等级 ----
  var IMPORTANCE_LEVELS = {
    CRITICAL: 5,   // 核心设定，不可遗忘
    HIGH: 4,       // 重要情节转折
    MEDIUM: 3,     // 一般事件
    LOW: 2,        // 过渡性内容
    TRIVIAL: 1     // 可遗忘的细节
  };

  // ==========================================================================
  // === 第三部分：核心记忆存储 ================================================
  // ==========================================================================

  // ---- 记忆条目结构 ----
  // {
  //   id: string,           // 唯一标识
  //   type: string,         // 记忆类型 (MEMORY_TYPES)
  //   content: string,      // 记忆内容
  //   summary: string,      // 压缩后的摘要
  //   entities: [string],   // 关联实体
  //   chapterIdx: number,   // 来源章节
  //   timestamp: number,    // 创建时间
  //   importance: number,   // 重要性 (1-5)
  //   links: [string],      // 关联的其他记忆ID
  //   tags: [string],       // 标签
  //   confidence: number,   // 可信度 (0-1)
  //   accessCount: number,  // 被检索次数
  //   lastAccessAt: number, // 最后访问时间
  //   decayFactor: number,  // 衰减因子
  //   _tfidf: {},           // TF-IDF 向量（内部）
  //   _embedding: []         // 语义向量（内部，轻量级）
  // }

  var MemoryStore = {
    _memories: [],           // 全部记忆
    _byType: {},             // 按类型索引
    _byEntity: {},           // 按实体索引
    _byChapter: {},          // 按章节索引
    _invertedIndex: {},      // 倒排索引
    _nextId: 1,
    _dirty: false,

    // ---- 生成唯一ID ----
    _genId: function () {
      return 'mem_' + (this._nextId++) + '_' + Date.now().toString(36);
    },

    // ---- 添加记忆 ----
    add: function (memory) {
      if (!memory || !memory.content) return null;
      memory.id = memory.id || this._genId();
      memory.type = memory.type || MEMORY_TYPES.PLOT;
      memory.importance = memory.importance || IMPORTANCE_LEVELS.MEDIUM;
      memory.timestamp = memory.timestamp || Date.now();
      memory.accessCount = memory.accessCount || 0;
      memory.lastAccessAt = memory.lastAccessAt || 0;
      memory.decayFactor = memory.decayFactor || 1.0;
      memory.confidence = memory.confidence || 1.0;
      memory.entities = memory.entities || [];
      memory.links = memory.links || [];
      memory.tags = memory.tags || [];
      memory.tokens = tokenize(memory.content);
      memory.summary = memory.summary || '';

      // 去重检查
      var dup = this._findDuplicate(memory);
      if (dup) {
        // 合并而非重复添加
        return this._merge(dup, memory);
      }

      this._memories.push(memory);

      // 更新索引
      this._indexByType(memory);
      this._indexByEntity(memory);
      this._indexByChapter(memory);
      this._indexInverted(memory);
      this._dirty = true;

      return memory;
    },

    // ---- 批量添加 ----
    addBatch: function (memories) {
      var self = this;
      var added = 0;
      for (var i = 0; i < memories.length; i++) {
        if (self.add(memories[i])) added++;
      }
      return added;
    },

    // ---- 去重检测 ----
    _findDuplicate: function (memory) {
      var threshold = 0.85;
      var candidates = this._byType[memory.type] || [];
      for (var i = 0; i < candidates.length; i++) {
        var sim = this._contentSimilarity(memory.content, candidates[i].content);
        if (sim >= threshold) return candidates[i];
      }
      return null;
    },

    _contentSimilarity: function (a, b) {
      if (!a || !b) return 0;
      var tokensA = tokenize(a);
      var tokensB = tokenize(b);
      if (tokensA.length === 0 || tokensB.length === 0) return 0;
      var setA = {};
      for (var i = 0; i < tokensA.length; i++) setA[tokensA[i]] = (setA[tokensA[i]] || 0) + 1;
      var setB = {};
      for (var j = 0; j < tokensB.length; j++) setB[tokensB[j]] = (setB[tokensB[j]] || 0) + 1;
      var intersection = 0, union = 0;
      var allTokens = {};
      for (var k in setA) { allTokens[k] = true; }
      for (var k2 in setB) { allTokens[k2] = true; }
      for (var k3 in allTokens) {
        intersection += Math.min(setA[k3] || 0, setB[k3] || 0);
        union += Math.max(setA[k3] || 0, setB[k3] || 0);
      }
      return union > 0 ? intersection / union : 0;
    },

    // ---- 合并重复记忆 ----
    _merge: function (existing, incoming) {
      existing.accessCount++;
      existing.lastAccessAt = Date.now();
      existing.confidence = Math.min(1, (existing.confidence || 1) + 0.1);
      if (incoming.importance > existing.importance) {
        existing.importance = incoming.importance;
      }
      // 合并实体
      for (var i = 0; i < incoming.entities.length; i++) {
        if (existing.entities.indexOf(incoming.entities[i]) < 0) {
          existing.entities.push(incoming.entities[i]);
        }
      }
      // 合并标签
      for (var j = 0; j < incoming.tags.length; j++) {
        if (existing.tags.indexOf(incoming.tags[j]) < 0) {
          existing.tags.push(incoming.tags[j]);
        }
      }
      // 如果新内容更长，保留新内容
      if (incoming.content.length > existing.content.length) {
        existing.content = incoming.content;
      }
      this._dirty = true;
      return existing;
    },

    // ---- 索引更新 ----
    _indexByType: function (memory) {
      if (!this._byType[memory.type]) this._byType[memory.type] = [];
      this._byType[memory.type].push(memory);
    },

    _indexByEntity: function (memory) {
      var self = this;
      (memory.entities || []).forEach(function (e) {
        if (!self._byEntity[e]) self._byEntity[e] = [];
        if (self._byEntity[e].indexOf(memory) < 0) self._byEntity[e].push(memory);
      });
    },

    _indexByChapter: function (memory) {
      var key = String(memory.chapterIdx);
      if (!this._byChapter[key]) this._byChapter[key] = [];
      this._byChapter[key].push(memory);
    },

    _indexInverted: function (memory) {
      var self = this;
      var seen = {};
      (memory.tokens || []).forEach(function (tok) {
        if (seen[tok]) return;
        seen[tok] = true;
        if (!self._invertedIndex[tok]) self._invertedIndex[tok] = [];
        self._invertedIndex[tok].push(memory);
      });
    },

    // ---- 获取记忆 ----
    get: function (id) {
      for (var i = 0; i < this._memories.length; i++) {
        if (this._memories[i].id === id) {
          this._memories[i].accessCount++;
          this._memories[i].lastAccessAt = Date.now();
          return this._memories[i];
        }
      }
      return null;
    },

    // ---- 按类型获取 ----
    getByType: function (type) {
      return this._byType[type] || [];
    },

    // ---- 按实体获取 ----
    getByEntity: function (entity) {
      return this._byEntity[entity] || [];
    },

    // ---- 按章节获取 ----
    getByChapter: function (chapterIdx) {
      return this._byChapter[String(chapterIdx)] || [];
    },

    // ---- 按章节范围获取 ----
    getByChapterRange: function (from, to) {
      var results = [];
      for (var i = from; i <= to; i++) {
        var ch = this._byChapter[String(i)];
        if (ch) results = results.concat(ch);
      }
      return results;
    },

    // ---- 获取全部 ----
    getAll: function () {
      return this._memories.slice();
    },

    // ---- 获取总数 ----
    count: function () {
      return this._memories.length;
    },

    // ---- 删除记忆 ----
    remove: function (id) {
      var idx = -1;
      for (var i = 0; i < this._memories.length; i++) {
        if (this._memories[i].id === id) { idx = i; break; }
      }
      if (idx < 0) return false;
      var mem = this._memories[idx];
      this._memories.splice(idx, 1);
      // 清理索引（简化：重建索引）
      this._rebuildIndexes();
      this._dirty = true;
      return true;
    },

    // ---- 重建全部索引 ----
    _rebuildIndexes: function () {
      this._byType = {};
      this._byEntity = {};
      this._byChapter = {};
      this._invertedIndex = {};
      for (var i = 0; i < this._memories.length; i++) {
        var m = this._memories[i];
        this._indexByType(m);
        this._indexByEntity(m);
        this._indexByChapter(m);
        this._indexInverted(m);
      }
    },

    // ---- 清空 ----
    clear: function () {
      this._memories = [];
      this._byType = {};
      this._byEntity = {};
      this._byChapter = {};
      this._invertedIndex = {};
      this._dirty = false;
    },

    // ---- 统计 ----
    stats: function () {
      return {
        total: this._memories.length,
        byType: Object.keys(this._byType).reduce(function (acc, k) {
          acc[k] = (this._byType[k] || []).length; return acc;
        }.bind(this), {}),
        byChapter: Object.keys(this._byChapter).length,
        entities: Object.keys(this._byEntity).length,
        invertedTerms: Object.keys(this._invertedIndex).length
      };
    }
  };

  // ==========================================================================
  // === 第四部分：记忆摄入引擎 (Memory Ingestion) =============================
  // ==========================================================================

  var MemoryIngestion = {
    // ---- 角色名提取模式 ----
    _namePatterns: [
      // 姓氏 + 名字（2-3字）
      /(?:[李王张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段雷钱汤尹黎易常武乔贺赖龚文]{1})(?:[\u4e00-\u9fa5]{1,2})(?:道|人|君|王|帝|尊|圣|仙|佛|魔|妖|鬼|神|侠|医|师|者|生|公|子|兄|弟|姐|妹|叔|伯|姨|婶|爷|奶|婆|翁|老|少|儿|童|女|男|汉|夫|妇|娘|姑|嫂|舅|甥)?/g,
      // 常见称呼模式
      /(?:[林苏沈][\u4e00-\u9fa5]{1,2})/g,
      // 称号型（XX王、XX帝等）
      /[\u4e00-\u9fa5]{1,3}(?:王|帝|皇|尊|圣|仙|佛|魔|神|主|君|侯|将|相)/g
    ],

    // ---- 从章节文本中提取所有记忆 ----
    ingestFromChapter: function (chapterText, chapterIdx, chapterTitle, workContext) {
      if (!chapterText) return [];
      workContext = workContext || {};
      var memories = [];
      var self = this;

      // 1. 提取角色状态记忆
      var charMemories = self._extractCharacterMemories(chapterText, chapterIdx, workContext);
      memories = memories.concat(charMemories);

      // 2. 提取情节事件记忆
      var plotMemories = self._extractPlotMemories(chapterText, chapterIdx);
      memories = memories.concat(plotMemories);

      // 3. 提取世界观规则记忆
      var worldMemories = self._extractWorldMemories(chapterText, chapterIdx);
      memories = memories.concat(worldMemories);

      // 4. 提取道具记忆
      var itemMemories = self._extractItemMemories(chapterText, chapterIdx);
      memories = memories.concat(itemMemories);

      // 5. 提取人际关系记忆
      var relMemories = self._extractRelationshipMemories(chapterText, chapterIdx, workContext);
      memories = memories.concat(relMemories);

      // 6. 提取伏笔记忆
      var foreMemories = self._extractForeshadowMemories(chapterText, chapterIdx);
      memories = memories.concat(foreMemories);

      // 7. 提取地点记忆
      var locMemories = self._extractLocationMemories(chapterText, chapterIdx);
      memories = memories.concat(locMemories);

      // 8. 提取关键对话记忆
      var dialMemories = self._extractDialogueMemories(chapterText, chapterIdx);
      memories = memories.concat(dialMemories);

      // 9. 提取情感节点
      var emoMemories = self._extractEmotionMemories(chapterText, chapterIdx);
      memories = memories.concat(emoMemories);

      // 10. 提取冲突记忆
      var conflictMemories = self._extractConflictMemories(chapterText, chapterIdx);
      memories = memories.concat(conflictMemories);

      return memories;
    },

    // ---- 提取角色名 ----
    _extractNames: function (text) {
      var names = {};
      for (var p = 0; p < this._namePatterns.length; p++) {
        var matches = text.match(this._namePatterns[p]);
        if (matches) {
          for (var m = 0; m < matches.length; m++) {
            names[matches[m]] = (names[matches[m]] || 0) + 1;
          }
        }
      }
      // 过滤（至少出现2次）
      var result = [];
      for (var n in names) {
        if (names[n] >= 2 && n.length >= 2 && n.length <= 5) {
          result.push(n);
        }
      }
      return result;
    },

    // ---- 角色状态记忆 ----
    _extractCharacterMemories: function (text, chapterIdx, ctx) {
      var memories = [];
      var names = this._extractNames(text);
      var knownNames = ctx.knownNames || [];

      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        // 找到角色在文本中的位置
        var idx = text.indexOf(name);
        if (idx < 0) continue;

        // 提取角色相关上下文（前后各80字）
        var start = Math.max(0, idx - 80);
        var end = Math.min(text.length, idx + name.length + 80);
        var context = text.substring(start, end);

        // 状态检测
        var status = this._detectCharacterStatus(context, name);
        var emotion = this._detectEmotion(context);

        memories.push({
          type: MEMORY_TYPES.CHARACTER,
          content: context.replace(/\n/g, ' '),
          summary: name + '：' + status + '，情绪' + emotion,
          entities: [name],
          chapterIdx: chapterIdx,
          importance: knownNames.indexOf(name) >= 0 ? IMPORTANCE_LEVELS.HIGH : IMPORTANCE_LEVELS.MEDIUM,
          tags: ['角色', name, status, emotion],
          confidence: 0.8
        });
      }
      return memories;
    },

    _detectCharacterStatus: function (context, name) {
      var statusSignals = {
        '受伤': ['受伤', '流血', '伤口', '疼痛', '重伤', '轻伤', '昏迷'],
        '修炼': ['修炼', '突破', '进阶', '晋升', '感悟', '闭关', '打坐'],
        '战斗': ['战斗', '出手', '攻击', '斩杀', '秒杀', '对战', '厮杀'],
        '移动': ['前往', '来到', '离开', '赶到', '返回', '抵达', '出发'],
        '对话': ['说道', '问道', '答道', '笑道', '冷声道', '淡淡道'],
        '思考': ['心想', '暗想', '思索', '沉思', '思考', '沉吟'],
        '观察': ['看到', '望去', '扫视', '注视', '观察', '打量'],
        '获得': ['得到', '获得', '拿到', '入手', '得到', '获取'],
        '失去': ['失去', '损失', '被夺', '消失', '破碎', '毁灭'],
        '隐藏': ['隐藏', '潜伏', '隐匿', '伪装', '遮掩', '掩饰']
      };
      for (var status in statusSignals) {
        for (var s = 0; s < statusSignals[status].length; s++) {
          if (context.indexOf(statusSignals[status][s]) >= 0) return status;
        }
      }
      return '出场';
    },

    _detectEmotion: function (context) {
      var emotions = {
        '愤怒': ['愤怒', '怒', '暴怒', '恼怒', '怒火', '怒意'],
        '悲伤': ['悲伤', '难过', '伤心', '悲痛', '哭泣', '落泪', '泪'],
        '喜悦': ['高兴', '喜悦', '开心', '欢喜', '笑', '乐', '喜'],
        '恐惧': ['恐惧', '害怕', '恐惧', '畏惧', '惊惧', '骇然'],
        '惊讶': ['惊讶', '震惊', '惊愕', '吃惊', '愕然', '诧异'],
        '冷静': ['冷静', '平静', '淡然', '从容', '淡定', '镇定'],
        '紧张': ['紧张', '紧绷', '不安', '焦虑', '忐忑', '焦躁'],
        '轻蔑': ['轻蔑', '不屑', '嘲讽', '冷笑', '嗤笑', '鄙夷'],
        '坚定': ['坚定', '坚决', '毅然', '决然', '果决', '断然'],
        '疑惑': ['疑惑', '不解', '困惑', '纳闷', '怀疑', '诧异']
      };
      for (var emo in emotions) {
        for (var e = 0; e < emotions[emo].length; e++) {
          if (context.indexOf(emotions[emo][e]) >= 0) return emo;
        }
      }
      return '中性';
    },

    // ---- 情节事件记忆 ----
    _extractPlotMemories: function (text, chapterIdx) {
      var memories = [];
      var eventSignals = [
        { pattern: /(?:突然|忽然|就在这时|正在此时|猛然|骤然)[\s\S]{0,30}?[,，。！]/, label: '突发事件' },
        { pattern: /(?:决定|决心|下定|选择|作出)[\s\S]{0,30}?[,，。！]/, label: '角色决策' },
        { pattern: /(?:真相|原来|竟是|竟然是|居然是|实则)[\s\S]{0,40}?[,，。！]/, label: '真相揭示' },
        { pattern: /(?:突破|晋升|进阶|觉醒|领悟|突破)[\s\S]{0,30}?[,，。！]/, label: '实力突破' },
        { pattern: /(?:击败|斩杀|秒杀|打败|战胜|击杀)[\s\S]{0,30}?[,，。！]/, label: '战斗结果' },
        { pattern: /(?:获得|得到|入手|取得|收获)[\s\S]{0,30}?[,，。！]/, label: '获得物品' },
        { pattern: /(?:离开|出发|前往|启程|动身)[\s\S]{0,30}?[,，。！]/, label: '地点转移' },
        { pattern: /(?:死亡|陨落|毙命|毙|殒命|逝去)[\s\S]{0,30}?[,，。！]/, label: '角色死亡' }
      ];

      for (var s = 0; s < eventSignals.length; s++) {
        var match = text.match(eventSignals[s].pattern);
        if (match) {
          for (var m = 0; m < match.length; m++) {
            if (match[m].length > 5) {
              memories.push({
                type: MEMORY_TYPES.PLOT,
                content: match[m].replace(/\n/g, ' '),
                summary: eventSignals[s].label + '：' + match[m].replace(/\n/g, ' ').substring(0, 60),
                entities: this._extractNames(match[m]),
                chapterIdx: chapterIdx,
                importance: IMPORTANCE_LEVELS.HIGH,
                tags: ['情节', eventSignals[s].label],
                confidence: 0.7
              });
            }
          }
        }
      }
      return memories;
    },

    // ---- 世界观规则记忆 ----
    _extractWorldMemories: function (text, chapterIdx) {
      var memories = [];
      var rulePatterns = [
        /(?:不能|无法|没人|从未|禁止|禁忌|只有|必须|需|代价|最强|无人能|不可能|规则是|定律|法则)[\s\S]{0,40}?[,，。！]/g,
        /(?:修为|境界|等级|层次|品阶|阶位|级别)[\s\S]{0,30}?[,，。！]/g,
        /(?:功法|武技|法术|神通|秘术|禁术|绝学)[\s\S]{0,30}?[,，。！]/g
      ];

      for (var r = 0; r < rulePatterns.length; r++) {
        var matches = text.match(rulePatterns[r]);
        if (matches) {
          for (var m = 0; m < Math.min(matches.length, 3); m++) {
            if (matches[m].length > 8) {
              memories.push({
                type: MEMORY_TYPES.WORLD,
                content: matches[m].replace(/\n/g, ' '),
                summary: '规则：' + matches[m].replace(/\n/g, ' ').substring(0, 60),
                entities: [],
                chapterIdx: chapterIdx,
                importance: IMPORTANCE_LEVELS.CRITICAL,
                tags: ['世界观', '规则'],
                confidence: 0.6
              });
            }
          }
        }
      }
      return memories;
    },

    // ---- 道具记忆 ----
    _extractItemMemories: function (text, chapterIdx) {
      var memories = [];
      var itemPatterns = [
        /(?:法宝|武器|丹药|灵药|神器|圣器|仙器|魔器|秘籍|功法|卷轴|令牌|戒指|剑|刀|枪|弓|盾|符|阵|鼎|炉|镜|珠|印|幡|扇|锤|斧|戟|鞭|针|索|环|钩|叉|锏|镗|棍|棒|拐|流星)[\s\S]{0,20}?/g
      ];

      for (var p = 0; p < itemPatterns.length; p++) {
        var matches = text.match(itemPatterns[p]);
        if (matches) {
          var seen = {};
          for (var m = 0; m < matches.length; m++) {
            var item = matches[m].trim();
            if (item.length >= 2 && item.length <= 30 && !seen[item]) {
              seen[item] = true;
              memories.push({
                type: MEMORY_TYPES.ITEM,
                content: item,
                summary: '道具：' + item,
                entities: [item],
                chapterIdx: chapterIdx,
                importance: IMPORTANCE_LEVELS.MEDIUM,
                tags: ['道具', item],
                confidence: 0.5
              });
            }
          }
        }
      }
      return memories;
    },

    // ---- 人际关系记忆 ----
    _extractRelationshipMemories: function (text, chapterIdx, ctx) {
      var memories = [];
      var names = this._extractNames(text);
      var relPatterns = [
        { pattern: /(?:师徒|师傅|徒弟|师父|弟子|师尊|徒儿|师|徒)/g, label: '师徒' },
        { pattern: /(?:兄弟|兄妹|姐弟|姐妹|手足|大哥|二哥|三弟|四妹)/g, label: '手足' },
        { pattern: /(?:父|母|子|女|父亲|母亲|儿子|女儿|爹|娘|爸|妈)/g, label: '亲子' },
        { pattern: /(?:夫妻|丈夫|妻子|相公|娘子|夫君|夫人|夫君|爱妻)/g, label: '夫妻' },
        { pattern: /(?:朋友|知己|挚友|好友|至交|故交|老友)/g, label: '朋友' },
        { pattern: /(?:敌人|仇人|宿敌|死敌|对手|仇敌|冤家)/g, label: '敌对' },
        { pattern: /(?:主仆|主人|仆人|侍从|丫鬟|侍卫|随从|手下)/g, label: '主仆' },
        { pattern: /(?:恋人|情侣|相爱|爱慕|喜欢|暗恋|倾心|心动)/g, label: '恋人' }
      ];

      for (var r = 0; r < relPatterns.length; r++) {
        var matches = text.match(relPatterns[r].pattern);
        if (matches && matches.length >= 1 && names.length >= 2) {
          // 找到最近的两个人名
          var relContext = '';
          for (var m = 0; m < matches.length; m++) {
            var idx = text.indexOf(matches[m]);
            if (idx >= 0) {
              var start = Math.max(0, idx - 60);
              var end = Math.min(text.length, idx + 60);
              relContext = text.substring(start, end).replace(/\n/g, ' ');
              break;
            }
          }
          if (relContext && names.length >= 1) {
            memories.push({
              type: MEMORY_TYPES.RELATIONSHIP,
              content: relContext,
              summary: relPatterns[r].label + '关系：' + names.slice(0, 3).join('、'),
              entities: names.slice(0, 3),
              chapterIdx: chapterIdx,
              importance: IMPORTANCE_LEVELS.HIGH,
              tags: ['关系', relPatterns[r].label].concat(names.slice(0, 3)),
              confidence: 0.6
            });
          }
        }
      }
      return memories;
    },

    // ---- 伏笔记忆 ----
    _extractForeshadowMemories: function (text, chapterIdx) {
      var memories = [];
      var forePatterns = [
        /(?:隐隐|似乎|仿佛|好像|总觉得|有种预感|不对劲|不寻常|古怪|异常|诡异|奇怪|蹊跷|可疑|不安|不详|诡异)[\s\S]{0,40}?[,，。！]/g,
        /(?:日后|后来|将来|以后|往后的|未来|终有一天|有朝一日)[\s\S]{0,30}?[,，。！]/g,
        /(?:秘密|隐秘|隐藏|未解|谜团|谜题|疑问|悬念|疑点|未解之谜)[\s\S]{0,30}?[,，。！]/g
      ];

      for (var f = 0; f < forePatterns.length; f++) {
        var matches = text.match(forePatterns[f]);
        if (matches) {
          for (var m = 0; m < Math.min(matches.length, 3); m++) {
            if (matches[m].length > 8) {
              memories.push({
                type: MEMORY_TYPES.FORESHADOW,
                content: matches[m].replace(/\n/g, ' '),
                summary: '伏笔：' + matches[m].replace(/\n/g, ' ').substring(0, 60),
                entities: this._extractNames(matches[m]),
                chapterIdx: chapterIdx,
                importance: IMPORTANCE_LEVELS.HIGH,
                tags: ['伏笔', '未解'],
                confidence: 0.5
              });
            }
          }
        }
      }
      return memories;
    },

    // ---- 地点记忆 ----
    _extractLocationMemories: function (text, chapterIdx) {
      var memories = [];
      var locPatterns = [
        /(?:[来到达到抵达前往进入离开出自在][\u4e00-\u9fa5]{2,6}(?:城|镇|村|国|界|域|山|谷|林|海|河|湖|洞|府|宫|殿|阁|楼|院|堂|庙|寺|塔|墓|冢|原|漠|岛|峰|崖|渊|谷|泽|泊|潭|泉|瀑|森|墟|境|界|遗址|遗迹))/g
      ];
      var seen = {};
      for (var p = 0; p < locPatterns.length; p++) {
        var matches = text.match(locPatterns[p]);
        if (matches) {
          for (var m = 0; m < matches.length; m++) {
            var loc = matches[m].replace(/[来到达到抵达前往进入离开出自在]/g, '');
            if (loc.length >= 2 && !seen[loc]) {
              seen[loc] = true;
              memories.push({
                type: MEMORY_TYPES.LOCATION,
                content: matches[m],
                summary: '地点：' + loc,
                entities: [loc],
                chapterIdx: chapterIdx,
                importance: IMPORTANCE_LEVELS.MEDIUM,
                tags: ['地点', loc],
                confidence: 0.7
              });
            }
          }
        }
      }
      return memories;
    },

    // ---- 关键对话记忆 ----
    _extractDialogueMemories: function (text, chapterIdx) {
      var memories = [];
      // 匹配引号内的对话
      var dialoguePattern = /(?:[""「『])([\s\S]{20,150}?)(?:["」』])/g;
      var match;
      while ((match = dialoguePattern.exec(text)) !== null) {
        var content = match[1].replace(/\n/g, ' ');
        if (content.length > 20) {
          memories.push({
            type: MEMORY_TYPES.DIALOGUE,
            content: content,
            summary: '对话：' + content.substring(0, 50),
            entities: this._extractNames(content),
            chapterIdx: chapterIdx,
            importance: IMPORTANCE_LEVELS.MEDIUM,
            tags: ['对话'],
            confidence: 0.8
          });
        }
      }
      return memories.slice(0, 5); // 最多5条关键对话
    },

    // ---- 情感节点记忆 ----
    _extractEmotionMemories: function (text, chapterIdx) {
      var memories = [];
      var emoPatterns = [
        /(?:怒|暴怒|怒火|愤怒|怒气|怒意|狂怒)[\s\S]{0,30}?[,，。！]/g,
        /(?:哭|泪|泣|落泪|流泪|哭泣|痛哭|悲泣|泪流)[\s\S]{0,30}?[,，。！]/g,
        /(?:笑|大笑|狂笑|微笑|含笑|冷笑|苦笑|惨笑|欢笑)[\s\S]{0,30}?[,，。！]/g,
        /(?:震惊|震撼|惊骇|骇然|惊惧|恐惧|畏惧|恐怖)[\s\S]{0,30}?[,，。！]/g
      ];

      for (var ep = 0; ep < emoPatterns.length; ep++) {
        var matches = text.match(emoPatterns[ep]);
        if (matches) {
          for (var m = 0; m < Math.min(matches.length, 2); m++) {
            if (matches[m].length > 8) {
              memories.push({
                type: MEMORY_TYPES.EMOTION,
                content: matches[m].replace(/\n/g, ' '),
                summary: '情感：' + matches[m].replace(/\n/g, ' ').substring(0, 40),
                entities: this._extractNames(matches[m]),
                chapterIdx: chapterIdx,
                importance: IMPORTANCE_LEVELS.MEDIUM,
                tags: ['情感'],
                confidence: 0.7
              });
            }
          }
        }
      }
      return memories;
    },

    // ---- 冲突记忆 ----
    _extractConflictMemories: function (text, chapterIdx) {
      var memories = [];
      var conflictPatterns = [
        /(?:对峙|对质|冲突|矛盾|分歧|争执|争吵|争斗|决裂|翻脸|撕破脸|不死不休|势不两立|水火不容|针锋相对|剑拔弩张)[\s\S]{0,40}?[,，。！]/g,
        /(?:背叛|出卖|叛变|倒戈|反水|叛逃|背弃|辜负|欺骗|算计|陷害|阴谋|诡计)[\s\S]{0,40}?[,，。！]/g
      ];

      for (var cp = 0; cp < conflictPatterns.length; cp++) {
        var matches = text.match(conflictPatterns[cp]);
        if (matches) {
          for (var m = 0; m < Math.min(matches.length, 2); m++) {
            if (matches[m].length > 8) {
              memories.push({
                type: MEMORY_TYPES.CONFLICT,
                content: matches[m].replace(/\n/g, ' '),
                summary: '冲突：' + matches[m].replace(/\n/g, ' ').substring(0, 50),
                entities: this._extractNames(matches[m]),
                chapterIdx: chapterIdx,
                importance: IMPORTANCE_LEVELS.HIGH,
                tags: ['冲突'],
                confidence: 0.7
              });
            }
          }
        }
      }
      return memories;
    }
  };

  // ==========================================================================
  // === 第五部分：记忆检索引擎 (Memory Retrieval) =============================
  // ==========================================================================

  var MemoryRetrieval = {
    // ---- 关键词检索 ----
    searchByKeyword: function (query, opts) {
      opts = opts || {};
      var limit = opts.limit || 20;
      var types = opts.types || null;
      var chapterFrom = opts.chapterFrom;
      var chapterTo = opts.chapterTo;
      var minImportance = opts.minImportance || 0;

      var queryTokens = tokenize(query);
      if (queryTokens.length === 0) return [];

      // 倒排索引召回
      var candidates = {};
      for (var t = 0; t < queryTokens.length; t++) {
        var tok = queryTokens[t];
        var docs = MemoryStore._invertedIndex[tok] || [];
        for (var d = 0; d < docs.length; d++) {
          candidates[docs[d].id] = (candidates[docs[d].id] || 0) + 1;
        }
      }

      // 评分排序
      var results = [];
      for (var id in candidates) {
        var mem = MemoryStore.get(id);
        if (!mem) continue;
        if (types && types.indexOf(mem.type) < 0) continue;
        if (mem.importance < minImportance) continue;
        if (chapterFrom !== undefined && mem.chapterIdx < chapterFrom) continue;
        if (chapterTo !== undefined && mem.chapterIdx > chapterTo) continue;

        // 综合评分 = 关键词匹配 + 重要性 + 衰减补偿
        var score = candidates[id] * 2 + mem.importance * 1.5 + mem.accessCount * 0.1;
        // 时间衰减补偿：越近的越重要
        var age = Date.now() - mem.timestamp;
        var recency = Math.exp(-age / (30 * 24 * 3600 * 1000)); // 30天半衰期
        score += recency * 3;

        results.push({ memory: mem, score: score });
      }

      results.sort(function (a, b) { return b.score - a.score; });
      return results.slice(0, limit).map(function (r) { return r.memory; });
    },

    // ---- 语义检索（基于 TF-IDF 余弦相似度） ----
    searchBySemantic: function (query, opts) {
      opts = opts || {};
      var limit = opts.limit || 20;
      var types = opts.types || null;
      var minImportance = opts.minImportance || 0;

      var queryTokens = tokenize(query);
      if (queryTokens.length === 0) return [];

      // 构建 query TF-IDF
      var queryTF = {};
      for (var t = 0; t < queryTokens.length; t++) {
        queryTF[queryTokens[t]] = (queryTF[queryTokens[t]] || 0) + 1;
      }

      // 计算 DF
      var allDocs = MemoryStore.getAll();
      var N = allDocs.length;
      var df = {};
      for (var d = 0; d < N; d++) {
        var seen = {};
        var toks = allDocs[d].tokens || [];
        for (var dt = 0; dt < toks.length; dt++) {
          if (!seen[toks[dt]]) {
            df[toks[dt]] = (df[toks[dt]] || 0) + 1;
            seen[toks[dt]] = true;
          }
        }
      }

      // 构建 query TF-IDF 向量
      var queryVec = {};
      for (var qk in queryTF) {
        var idf = Math.log((N + 1) / ((df[qk] || 0) + 1)) + 1;
        queryVec[qk] = queryTF[qk] * idf;
      }

      // 计算相似度
      var results = [];
      for (var i = 0; i < allDocs.length; i++) {
        var mem = allDocs[i];
        if (types && types.indexOf(mem.type) < 0) continue;
        if (mem.importance < minImportance) continue;

        var memVec = this._getOrComputeTFIDF(mem, N, df);
        var sim = cosineSimilarity(queryVec, memVec);

        // 综合评分
        var score = sim * 10 + mem.importance * 1.5 + mem.accessCount * 0.05;
        if (sim > 0.05) {
          results.push({ memory: mem, score: score, similarity: sim });
        }
      }

      results.sort(function (a, b) { return b.score - a.score; });
      return results.slice(0, limit).map(function (r) { return r.memory; });
    },

    _getOrComputeTFIDF: function (memory, N, df) {
      if (memory._tfidf && Object.keys(memory._tfidf).length > 0) return memory._tfidf;
      var tf = {};
      var toks = memory.tokens || [];
      for (var t = 0; t < toks.length; t++) {
        tf[toks[t]] = (tf[toks[t]] || 0) + 1;
      }
      memory._tfidf = {};
      for (var k in tf) {
        var idf = Math.log((N + 1) / ((df[k] || 0) + 1)) + 1;
        memory._tfidf[k] = tf[k] * idf;
      }
      return memory._tfidf;
    },

    // ---- 混合检索（关键词 + 语义） ----
    search: function (query, opts) {
      opts = opts || {};
      var keywordResults = this.searchByKeyword(query, opts);
      var semanticResults = this.searchBySemantic(query, opts);

      // 合并去重
      var seen = {};
      var merged = [];
      for (var k = 0; k < keywordResults.length; k++) {
        if (!seen[keywordResults[k].id]) {
          seen[keywordResults[k].id] = true;
          merged.push(keywordResults[k]);
        }
      }
      for (var s = 0; s < semanticResults.length; s++) {
        if (!seen[semanticResults[s].id]) {
          seen[semanticResults[s].id] = true;
          merged.push(semanticResults[s]);
        }
      }

      // 重新排序
      merged.sort(function (a, b) {
        return (b.importance || 0) - (a.importance || 0) ||
          (b.accessCount || 0) - (a.accessCount || 0) ||
          (b.timestamp || 0) - (a.timestamp || 0);
      });

      return merged.slice(0, opts.limit || 20);
    },

    // ---- 时序检索（按时间线） ----
    searchByTimeline: function (opts) {
      opts = opts || {};
      var from = opts.from || 0;
      var to = opts.to || 999999;
      var types = opts.types || null;
      var limit = opts.limit || 50;

      var results = MemoryStore.getByChapterRange(from, to);
      if (types) {
        results = results.filter(function (m) { return types.indexOf(m.type) >= 0; });
      }
      results.sort(function (a, b) { return (a.chapterIdx || 0) - (b.chapterIdx || 0); });
      return results.slice(0, limit);
    },

    // ---- 实体检索（查某个角色的所有相关记忆） ----
    searchByEntity: function (entity, opts) {
      opts = opts || {};
      var limit = opts.limit || 50;
      var results = MemoryStore.getByEntity(entity);

      // 模糊匹配（编辑距离 ≤ 1）
      if (results.length === 0) {
        var allEntities = Object.keys(MemoryStore._byEntity);
        for (var e = 0; e < allEntities.length; e++) {
          if (levenshtein(entity, allEntities[e]) <= 1) {
            results = results.concat(MemoryStore.getByEntity(allEntities[e]));
          }
        }
      }

      results.sort(function (a, b) { return (a.chapterIdx || 0) - (b.chapterIdx || 0); });
      return results.slice(0, limit);
    },

    // ---- 上下文检索（构建 RAG 上下文） ----
    retrieveContext: function (query, opts) {
      opts = opts || {};
      var maxTokens = opts.maxTokens || 4000;
      var results = this.search(query, { limit: opts.limit || 30, types: opts.types, minImportance: opts.minImportance || 2 });

      var context = '';
      var tokenCount = 0;
      for (var i = 0; i < results.length; i++) {
        var mem = results[i];
        var entry = '【' + (mem.summary || mem.content.substring(0, 60)) + '】（第' + (mem.chapterIdx + 1) + '章' +
          (mem.entities.length > 0 ? '，涉及：' + mem.entities.slice(0, 3).join('、') : '') + '）\n';
        if (tokenCount + entry.length > maxTokens) break;
        context += entry;
        tokenCount += entry.length;
      }
      return context;
    },

    // ---- 多跳查询（通过关联链查找） ----
    multiHopQuery: function (startEntity, maxHops, opts) {
      maxHops = maxHops || 2;
      opts = opts || {};
      var visited = {};
      var results = [];
      var queue = [{ entity: startEntity, hop: 0 }];
      visited[startEntity] = true;

      while (queue.length > 0) {
        var current = queue.shift();
        if (current.hop > maxHops) continue;

        var memories = MemoryStore.getByEntity(current.entity);
        for (var m = 0; m < memories.length; m++) {
          var mem = memories[m];
          if (results.indexOf(mem) < 0) results.push(mem);

          // 通过关联实体跳转
          if (current.hop < maxHops) {
            for (var e = 0; e < mem.entities.length; e++) {
              var nextEntity = mem.entities[e];
              if (!visited[nextEntity]) {
                visited[nextEntity] = true;
                queue.push({ entity: nextEntity, hop: current.hop + 1 });
              }
            }
          }
        }
      }

      return results.slice(0, opts.limit || 50);
    }
  };

  // ==========================================================================
  // === 第六部分：记忆压缩引擎 (Memory Compression) ===========================
  // ==========================================================================

  var MemoryCompression = {
    // ---- 压缩策略配置 ----
    _config: {
      // 章节阈值：超过此数量触发压缩
      chapterThreshold: 50,
      // 每卷章节数
      volumeSize: 50,
      // 压缩后保留的记忆数上限
      maxCompressedPerVolume: 30,
      // 摘要最大长度
      maxSummaryLength: 200
    },

    // ---- 按卷压缩（将每N章压缩为卷级摘要） ----
    compressByVolume: function (fromChapter, toChapter) {
      var memories = MemoryStore.getByChapterRange(fromChapter, toChapter);
      if (memories.length === 0) return null;

      // 按类型分组
      var grouped = {};
      for (var i = 0; i < memories.length; i++) {
        var m = memories[i];
        if (!grouped[m.type]) grouped[m.type] = [];
        grouped[m.type].push(m);
      }

      // 为每种类型生成摘要
      var volumeSummary = {
        volumeRange: fromChapter + '-' + toChapter,
        fromChapter: fromChapter,
        toChapter: toChapter,
        summaries: {},
        keyEvents: [],
        characterChanges: [],
        createdAt: Date.now()
      };

      for (var type in grouped) {
        var group = grouped[type];
        // 按重要性排序取前N条
        group.sort(function (a, b) { return (b.importance || 0) - (a.importance || 0); });
        var top = group.slice(0, this._config.maxCompressedPerVolume);

        // 生成摘要
        var summary = top.map(function (m) {
          return m.summary || m.content.substring(0, 60);
        }).join('；');

        volumeSummary.summaries[type] = summary.substring(0, this._config.maxSummaryLength * 2);
      }

      // 提取关键事件（PLOT + CONFLICT 类型中重要性最高的）
      var allKeyEvents = memories.filter(function (m) {
        return (m.type === MEMORY_TYPES.PLOT || m.type === MEMORY_TYPES.CONFLICT) && m.importance >= IMPORTANCE_LEVELS.HIGH;
      });
      allKeyEvents.sort(function (a, b) { return (b.importance || 0) - (a.importance || 0); });
      volumeSummary.keyEvents = allKeyEvents.slice(0, 10).map(function (m) {
        return m.summary || m.content.substring(0, 60);
      });

      // 提取角色变化（CHARACTER 类型）
      var charChanges = grouped[MEMORY_TYPES.CHARACTER] || [];
      charChanges.sort(function (a, b) { return (b.importance || 0) - (a.importance || 0); });
      volumeSummary.characterChanges = charChanges.slice(0, 8).map(function (m) {
        return m.summary || m.content.substring(0, 60);
      });

      return volumeSummary;
    },

    // ---- 全量压缩（生成多卷摘要） ----
    fullCompress: function (totalChapters, volumeSize) {
      volumeSize = volumeSize || this._config.volumeSize;
      var volumeSummaries = [];
      for (var start = 0; start < totalChapters; start += volumeSize) {
        var end = Math.min(start + volumeSize - 1, totalChapters - 1);
        var summary = this.compressByVolume(start, end);
        if (summary) volumeSummaries.push(summary);
      }
      return volumeSummaries;
    },

    // ---- 滚动摘要（最近N章的精简总结） ----
    rollingSummary: function (latestChapter, windowSize) {
      windowSize = windowSize || 10;
      var from = Math.max(0, latestChapter - windowSize);
      var memories = MemoryStore.getByChapterRange(from, latestChapter);
      if (memories.length === 0) return '';

      // 按重要性加权拼接
      memories.sort(function (a, b) { return (b.importance || 0) - (a.importance || 0); });
      var parts = memories.slice(0, 20).map(function (m) {
        return m.summary || m.content.substring(0, 50);
      });

      return parts.join('；').substring(0, 500);
    },

    // ---- 角色档案压缩（将某角色的所有记忆压缩为档案） ----
    compressCharacterProfile: function (entityName) {
      var memories = MemoryStore.getByEntity(entityName);
      if (memories.length === 0) return null;

      memories.sort(function (a, b) { return (a.chapterIdx || 0) - (b.chapterIdx || 0); });

      var profile = {
        name: entityName,
        firstAppearance: memories[0].chapterIdx,
        lastAppearance: memories[memories.length - 1].chapterIdx,
        totalAppearances: memories.length,
        milestones: [],
        relationships: [],
        items: [],
        statusChanges: [],
        createdAt: Date.now()
      };

      for (var i = 0; i < memories.length; i++) {
        var m = memories[i];
        if (m.type === MEMORY_TYPES.PLOT && m.importance >= IMPORTANCE_LEVELS.HIGH) {
          profile.milestones.push({
            chapter: m.chapterIdx,
            event: m.summary || m.content.substring(0, 60)
          });
        }
        if (m.type === MEMORY_TYPES.RELATIONSHIP) {
          profile.relationships.push({
            chapter: m.chapterIdx,
            detail: m.summary || m.content.substring(0, 40)
          });
        }
        if (m.type === MEMORY_TYPES.ITEM) {
          profile.items.push({
            chapter: m.chapterIdx,
            item: m.content
          });
        }
        if (m.type === MEMORY_TYPES.CHARACTER) {
          profile.statusChanges.push({
            chapter: m.chapterIdx,
            status: m.summary || m.content.substring(0, 40)
          });
        }
      }

      return profile;
    },

    // ---- 记忆清理（遗忘低重要性旧记忆） ----
    prune: function (opts) {
      opts = opts || {};
      var maxAge = opts.maxAge || 90 * 24 * 3600 * 1000; // 90天
      var minImportance = opts.minImportance || IMPORTANCE_LEVELS.LOW;
      var maxMemories = opts.maxMemories || 5000;

      var all = MemoryStore.getAll();
      var now = Date.now();
      var removed = 0;

      // 策略1：超过最大记忆数，删除最不重要的
      if (all.length > maxMemories) {
        all.sort(function (a, b) {
          // 综合排序：重要性 + 最近访问 + 时间
          var scoreA = (a.importance || 0) * 100 + (a.accessCount || 0) * 2 + (now - a.timestamp) / 86400000;
          var scoreB = (b.importance || 0) * 100 + (b.accessCount || 0) * 2 + (now - b.timestamp) / 86400000;
          return scoreA - scoreB;
        });
        var toRemove = all.slice(0, all.length - maxMemories);
        for (var r = 0; r < toRemove.length; r++) {
          if (toRemove[r].importance <= minImportance) {
            MemoryStore.remove(toRemove[r].id);
            removed++;
          }
        }
      }

      // 策略2：删除过期且不重要的记忆
      var remaining = MemoryStore.getAll();
      for (var i = remaining.length - 1; i >= 0; i--) {
        var mem = remaining[i];
        var age = now - mem.timestamp;
        if (age > maxAge && mem.importance <= minImportance && mem.accessCount < 3) {
          MemoryStore.remove(mem.id);
          removed++;
        }
      }

      return removed;
    }
  };

  // ==========================================================================
  // === 第七部分：记忆关联引擎 (Memory Linking) ===============================
  // ==========================================================================

  var MemoryLinking = {
    // ---- 自动发现关联 ----
    autoLink: function (memory, threshold) {
      threshold = threshold || 0.3;
      var all = MemoryStore.getAll();
      var links = [];

      for (var i = 0; i < all.length; i++) {
        var other = all[i];
        if (other.id === memory.id) continue;

        // 实体重叠
        var entityOverlap = 0;
        for (var e = 0; e < memory.entities.length; e++) {
          if (other.entities.indexOf(memory.entities[e]) >= 0) entityOverlap++;
        }
        if (entityOverlap >= 1) {
          links.push({ id: other.id, strength: entityOverlap * 0.4, reason: 'entity_overlap' });
          continue;
        }

        // 内容相似度
        var sim = MemoryStore._contentSimilarity(memory.content, other.content);
        if (sim >= threshold) {
          links.push({ id: other.id, strength: sim * 0.8, reason: 'content_similar' });
          continue;
        }

        // 同章节关联
        if (other.chapterIdx === memory.chapterIdx) {
          links.push({ id: other.id, strength: 0.2, reason: 'same_chapter' });
        }
      }

      memory.links = links.sort(function (a, b) { return b.strength - a.strength; }).slice(0, 10);
      return memory;
    },

    // ---- 构建知识图谱 ----
    buildKnowledgeGraph: function () {
      var all = MemoryStore.getAll();
      var graph = {
        nodes: [],
        edges: [],
        entityIndex: {}
      };

      // 构建节点
      for (var i = 0; i < all.length; i++) {
        var m = all[i];
        graph.nodes.push({
          id: m.id,
          type: m.type,
          label: (m.summary || m.content).substring(0, 30),
          importance: m.importance,
          chapter: m.chapterIdx
        });

        // 实体索引
        for (var e = 0; e < m.entities.length; e++) {
          var entity = m.entities[e];
          if (!graph.entityIndex[entity]) graph.entityIndex[entity] = [];
          graph.entityIndex[entity].push(m.id);
        }
      }

      // 构建边（基于实体共现）
      for (var entity in graph.entityIndex) {
        var memIds = graph.entityIndex[entity];
        for (var a = 0; a < memIds.length; a++) {
          for (var b = a + 1; b < memIds.length; b++) {
            graph.edges.push({
              source: memIds[a],
              target: memIds[b],
              label: entity,
              weight: 1
            });
          }
        }
      }

      return graph;
    },

    // ---- 查找相关记忆（通过关联链） ----
    findRelated: function (memoryId, maxDepth, maxResults) {
      maxDepth = maxDepth || 2;
      maxResults = maxResults || 20;
      var visited = {};
      var results = [];
      var queue = [{ id: memoryId, depth: 0 }];
      visited[memoryId] = true;

      while (queue.length > 0 && results.length < maxResults) {
        var current = queue.shift();
        var mem = MemoryStore.get(current.id);
        if (!mem) continue;

        if (current.depth > 0 && results.indexOf(mem) < 0) {
          results.push(mem);
        }

        if (current.depth >= maxDepth) continue;

        for (var l = 0; l < mem.links.length; l++) {
          var linkId = mem.links[l].id || mem.links[l];
          if (!visited[linkId]) {
            visited[linkId] = true;
            queue.push({ id: linkId, depth: current.depth + 1 });
          }
        }
      }

      return results;
    }
  };

  // ==========================================================================
  // === 第八部分：记忆优化引擎 (Memory Optimization) ==========================
  // ==========================================================================

  var MemoryOptimization = {
    // ---- 重要性自动评分 ----
    autoScore: function (memory) {
      var score = IMPORTANCE_LEVELS.MEDIUM;

      // 规则1：包含关键信号词 → 提升重要性
      var criticalWords = ['死亡', '突破', '觉醒', '真相', '背叛', '决战', '结局', '秘密', '终极', '毁灭', '重生', '涅槃'];
      for (var c = 0; c < criticalWords.length; c++) {
        if (memory.content.indexOf(criticalWords[c]) >= 0) {
          score = Math.max(score, IMPORTANCE_LEVELS.CRITICAL);
          break;
        }
      }

      // 规则2：涉及多个实体 → 提升重要性
      if (memory.entities.length >= 3) score = Math.max(score, IMPORTANCE_LEVELS.HIGH);

      // 规则3：内容长度 → 内容越丰富越重要
      if (memory.content.length > 200) score = Math.max(score, IMPORTANCE_LEVELS.HIGH);
      else if (memory.content.length < 30) score = Math.min(score, IMPORTANCE_LEVELS.LOW);

      // 规则4：伏笔类型 → 自动提升
      if (memory.type === MEMORY_TYPES.FORESHADOW) score = Math.max(score, IMPORTANCE_LEVELS.HIGH);
      if (memory.type === MEMORY_TYPES.WORLD) score = Math.max(score, IMPORTANCE_LEVELS.HIGH);

      memory.importance = score;
      return memory;
    },

    // ---- 冗余检测 ----
    detectRedundancy: function (threshold) {
      threshold = threshold || 0.9;
      var all = MemoryStore.getAll();
      var redundant = [];

      for (var i = 0; i < all.length; i++) {
        for (var j = i + 1; j < all.length; j++) {
          var sim = MemoryStore._contentSimilarity(all[i].content, all[j].content);
          if (sim >= threshold) {
            redundant.push({
              memA: all[i].id,
              memB: all[j].id,
              similarity: sim,
              summaryA: all[i].summary || all[i].content.substring(0, 40),
              summaryB: all[j].summary || all[j].content.substring(0, 40)
            });
          }
        }
      }

      return redundant;
    },

    // ---- 一致性检查 ----
    checkConsistency: function () {
      var issues = [];
      var all = MemoryStore.getAll();

      // 检查实体状态不一致
      var entityStates = {};
      for (var i = 0; i < all.length; i++) {
        var m = all[i];
        if (m.type !== MEMORY_TYPES.CHARACTER) continue;
        for (var e = 0; e < m.entities.length; e++) {
          var ent = m.entities[e];
          if (!entityStates[ent]) entityStates[ent] = [];
          entityStates[ent].push({
            chapter: m.chapterIdx,
            status: m.summary || m.content.substring(0, 40),
            timestamp: m.timestamp
          });
        }
      }

      // 检测状态跳跃
      for (var entName in entityStates) {
        var states = entityStates[entName];
        states.sort(function (a, b) { return a.chapter - b.chapter; });
        for (var s = 1; s < states.length; s++) {
          if (states[s].chapter - states[s - 1].chapter <= 1) {
            // 相邻章节状态剧烈变化
            if (this._isStatusJump(states[s - 1].status, states[s].status)) {
              issues.push({
                entity: entName,
                type: 'status_jump',
                from: states[s - 1],
                to: states[s],
                severity: 'warning'
              });
            }
          }
        }
      }

      return issues;
    },

    _isStatusJump: function (statusA, statusB) {
      var jumpPairs = [
        ['受伤', '战斗'],
        ['昏迷', '突破'],
        ['死亡', '出场'],
        ['失去', '获得']
      ];
      for (var j = 0; j < jumpPairs.length; j++) {
        if (statusA.indexOf(jumpPairs[j][0]) >= 0 && statusB.indexOf(jumpPairs[j][1]) >= 0) {
          return true;
        }
      }
      return false;
    },

    // ---- 全量优化 ----
    fullOptimize: function () {
      var all = MemoryStore.getAll();
      var optimized = 0;

      // 1. 自动评分
      for (var i = 0; i < all.length; i++) {
        this.autoScore(all[i]);
        optimized++;
      }

      // 2. 冗余检测并合并
      var redundant = this.detectRedundancy(0.9);
      var merged = {};
      for (var r = 0; r < redundant.length; r++) {
        var pair = redundant[r];
        if (!merged[pair.memA] && !merged[pair.memB]) {
          var memA = MemoryStore.get(pair.memA);
          var memB = MemoryStore.get(pair.memB);
          if (memA && memB) {
            MemoryStore._merge(memA, memB);
            MemoryStore.remove(pair.memB);
            merged[pair.memA] = true;
            merged[pair.memB] = true;
            optimized++;
          }
        }
      }

      // 3. 一致性检查
      var issues = this.checkConsistency();

      MemoryStore._dirty = true;
      return { optimized: optimized, redundant: redundant.length, issues: issues };
    }
  };

  // ==========================================================================
  // === 第九部分：记忆查询与 Prompt 构建 ======================================
  // ==========================================================================

  var MemoryQuery = {
    // ---- 构建注入上下文的 Prompt ----
    buildContextPrompt: function (query, opts) {
      opts = opts || {};
      var context = MemoryRetrieval.retrieveContext(query, opts);

      if (!context) return '';

      return [
        '【以下是系统从历史章节中检索到的相关记忆，请严格遵循这些信息进行创作】',
        '',
        context,
        '',
        '【记忆检索结束】'
      ].join('\n');
    },

    // ---- 构建完整的角色状态摘要 ----
    buildCharacterStateSummary: function (entityName) {
      var memories = MemoryRetrieval.searchByEntity(entityName, { limit: 20 });
      if (memories.length === 0) return '';

      var profile = MemoryCompression.compressCharacterProfile(entityName);
      if (!profile) return '';

      var lines = [
        '【角色档案：' + entityName + '】',
        '首次出场：第' + (profile.firstAppearance + 1) + '章',
        '最近出场：第' + (profile.lastAppearance + 1) + '章',
        '出场次数：' + profile.totalAppearances + '次',
      ];

      if (profile.milestones.length > 0) {
        lines.push('关键节点：');
        for (var m = 0; m < Math.min(profile.milestones.length, 5); m++) {
          lines.push('  - 第' + (profile.milestones[m].chapter + 1) + '章：' + profile.milestones[m].event);
        }
      }

      if (profile.relationships.length > 0) {
        lines.push('人际关系：');
        for (var r = 0; r < Math.min(profile.relationships.length, 3); r++) {
          lines.push('  - 第' + (profile.relationships[r].chapter + 1) + '章：' + profile.relationships[r].detail);
        }
      }

      if (profile.statusChanges.length > 0) {
        lines.push('最近状态变化：');
        var recent = profile.statusChanges.slice(-3);
        for (var s = 0; s < recent.length; s++) {
          lines.push('  - 第' + (recent[s].chapter + 1) + '章：' + recent[s].status);
        }
      }

      return lines.join('\n');
    },

    // ---- 构建伏笔追踪面板 ----
    buildForeshadowBoard: function () {
      var foreshadows = MemoryStore.getByType(MEMORY_TYPES.FORESHADOW);
      foreshadows.sort(function (a, b) { return (a.chapterIdx || 0) - (b.chapterIdx || 0); });

      if (foreshadows.length === 0) return '（暂无伏笔）';

      var lines = ['【伏笔追踪面板】'];
      for (var i = 0; i < foreshadows.length; i++) {
        var f = foreshadows[i];
        var status = f.tags.indexOf('已解') >= 0 ? '✅已解' : '⏳未解';
        lines.push((i + 1) + '. [' + status + '] 第' + (f.chapterIdx + 1) + '章：' + (f.summary || f.content.substring(0, 50)));
      }
      return lines.join('\n');
    },

    // ---- 构建全量剧情摘要 ----
    buildPlotSummary: function (fromChapter, toChapter) {
      var plotMemories = MemoryRetrieval.searchByTimeline({
        from: fromChapter || 0,
        to: toChapter || 999999,
        types: [MEMORY_TYPES.PLOT, MEMORY_TYPES.CONFLICT],
        limit: 100
      });

      if (plotMemories.length === 0) return '';

      var lines = ['【剧情摘要】'];
      var currentChapter = -1;
      for (var i = 0; i < plotMemories.length; i++) {
        var p = plotMemories[i];
        if (p.chapterIdx !== currentChapter) {
          currentChapter = p.chapterIdx;
          lines.push('');
          lines.push('--- 第' + (currentChapter + 1) + '章 ---');
        }
        lines.push('  - ' + (p.summary || p.content.substring(0, 60)));
      }
      return lines.join('\n');
    },

    // ---- 导出记忆为 JSON ----
    exportToJSON: function () {
      var all = MemoryStore.getAll();
      // 移除内部字段
      return all.map(function (m) {
        var clean = {};
        for (var k in m) {
          if (k.charAt(0) !== '_') clean[k] = m[k];
        }
        return clean;
      });
    },

    // ---- 从 JSON 导入记忆 ----
    importFromJSON: function (data) {
      if (!Array.isArray(data)) return 0;
      var added = 0;
      for (var i = 0; i < data.length; i++) {
        if (MemoryStore.add(data[i])) added++;
      }
      return added;
    }
  };

  // ==========================================================================
  // === 第十部分：记忆生命周期管理 ============================================
  // ==========================================================================

  var MemoryLifecycle = {
    // ---- 记忆衰减（遗忘曲线模拟） ----
    applyDecay: function () {
      var all = MemoryStore.getAll();
      var now = Date.now();
      var decayed = 0;

      for (var i = 0; i < all.length; i++) {
        var mem = all[i];
        var daysSinceCreation = (now - mem.timestamp) / (24 * 3600 * 1000);
        var daysSinceAccess = (now - mem.lastAccessAt) / (24 * 3600 * 1000);

        // 艾宾浩斯遗忘曲线简化版
        // 重要性越高，衰减越慢
        var decayRate = 0.05 / mem.importance;
        var accessBonus = Math.exp(-daysSinceAccess / 30); // 30天内访问过有加成
        mem.decayFactor = Math.max(0.1, 1.0 - daysSinceCreation * decayRate * (1 - accessBonus * 0.5));

        decayed++;
      }

      return decayed;
    },

    // ---- 记忆加固（重要记忆被多次访问后加固） ----
    reinforce: function () {
      var all = MemoryStore.getAll();
      var reinforced = 0;

      for (var i = 0; i < all.length; i++) {
        var mem = all[i];
        // 访问次数越多，重要性微调
        if (mem.accessCount >= 10 && mem.importance < IMPORTANCE_LEVELS.CRITICAL) {
          mem.importance = Math.min(IMPORTANCE_LEVELS.CRITICAL, mem.importance + 1);
          reinforced++;
        } else if (mem.accessCount >= 5 && mem.importance < IMPORTANCE_LEVELS.HIGH) {
          mem.importance = Math.min(IMPORTANCE_LEVELS.HIGH, mem.importance + 1);
          reinforced++;
        }
      }

      return reinforced;
    },

    // ---- 周期维护 ----
    maintenance: function () {
      var results = {
        decay: this.applyDecay(),
        reinforce: this.reinforce(),
        prune: MemoryCompression.prune({ maxMemories: 5000 }),
        issues: MemoryOptimization.checkConsistency()
      };
      MemoryStore._dirty = true;
      return results;
    }
  };

  // ==========================================================================
  // === 第十一部分：与 DB.longMemory 的桥接层 =================================
  // ==========================================================================

  var Bridge = {
    // ---- 从 DB.longMemory 加载到 MemorySkill ----
    loadFromDB: function (work) {
      if (!work || !work.longMemory) return 0;
      var lm = work.longMemory;

      MemoryStore.clear();

      // 加载 chapterIndex
      if (Array.isArray(lm.chapterIndex)) {
        for (var i = 0; i < lm.chapterIndex.length; i++) {
          var ci = lm.chapterIndex[i];
          if (ci && ci.summary) {
            MemoryStore.add({
              type: MEMORY_TYPES.PLOT,
              content: ci.summary,
              summary: ci.summary ? ci.summary.substring(0, 80) : '',
              chapterIdx: ci.chapterIdx || i,
              importance: IMPORTANCE_LEVELS.MEDIUM,
              entities: ci.entities || [],
              tags: ['chapter_index']
            });
          }
        }
      }

      // 加载 memoryAnchors
      if (lm.memoryAnchors) {
        var anchorTypes = {
          core: MEMORY_TYPES.PLOT,
          characterTags: MEMORY_TYPES.CHARACTER,
          relationships: MEMORY_TYPES.RELATIONSHIP,
          items: MEMORY_TYPES.ITEM,
          locations: MEMORY_TYPES.LOCATION,
          promises: MEMORY_TYPES.FORESHADOW,
          timeline: MEMORY_TYPES.PLOT,
          hooks: MEMORY_TYPES.FORESHADOW
        };

        for (var key in anchorTypes) {
          var anchors = lm.memoryAnchors[key] || [];
          for (var a = 0; a < anchors.length; a++) {
            if (anchors[a] && anchors[a].text) {
              MemoryStore.add({
                type: anchorTypes[key],
                content: anchors[a].text,
                summary: anchors[a].text ? anchors[a].text.substring(0, 60) : '',
                chapterIdx: anchors[a].chapterIdx || 0,
                importance: IMPORTANCE_LEVELS.MEDIUM,
                entities: anchors[a].entities || [],
                tags: [key]
              });
            }
          }
        }
      }

      // 加载 characterProfiles
      if (lm.characterProfiles) {
        for (var name in lm.characterProfiles) {
          var profile = lm.characterProfiles[name];
          if (profile && profile.currentStatus) {
            MemoryStore.add({
              type: MEMORY_TYPES.CHARACTER,
              content: name + '：' + (profile.currentStatus || ''),
              summary: name + '：' + (profile.currentStatus || ''),
              chapterIdx: profile.lastSeen || 0,
              importance: IMPORTANCE_LEVELS.HIGH,
              entities: [name],
              tags: ['character_profile']
            });
          }
        }
      }

      // 加载 foreshadowLedger
      if (Array.isArray(lm.foreshadowLedger)) {
        for (var f = 0; f < lm.foreshadowLedger.length; f++) {
          var fs = lm.foreshadowLedger[f];
          if (fs && fs.text) {
            MemoryStore.add({
              type: MEMORY_TYPES.FORESHADOW,
              content: fs.text,
              summary: fs.text ? fs.text.substring(0, 60) : '',
              chapterIdx: fs.chapterIdx || 0,
              importance: IMPORTANCE_LEVELS.HIGH,
              entities: fs.entities || [],
              tags: fs.status === '已解' ? ['foreshadow', '已解'] : ['foreshadow', '未解']
            });
          }
        }
      }

      // 加载 timelineEvents
      if (Array.isArray(lm.timelineEvents)) {
        for (var t = 0; t < lm.timelineEvents.length; t++) {
          var te = lm.timelineEvents[t];
          if (te && te.text) {
            MemoryStore.add({
              type: MEMORY_TYPES.PLOT,
              content: te.text,
              summary: te.text ? te.text.substring(0, 60) : '',
              chapterIdx: te.chapterIdx || 0,
              importance: IMPORTANCE_LEVELS.MEDIUM,
              entities: te.entities || [],
              tags: ['timeline']
            });
          }
        }
      }

      // 加载 volumeMemories
      if (Array.isArray(lm.volumeMemories)) {
        for (var v = 0; v < lm.volumeMemories.length; v++) {
          var vm = lm.volumeMemories[v];
          if (vm && vm.summary) {
            MemoryStore.add({
              type: MEMORY_TYPES.PLOT,
              content: vm.summary,
              summary: '卷' + (vm.volumeIdx || v + 1) + '摘要：' + (vm.summary ? vm.summary.substring(0, 60) : ''),
              chapterIdx: vm.fromChapter || 0,
              importance: IMPORTANCE_LEVELS.HIGH,
              entities: [],
              tags: ['volume_summary']
            });
          }
        }
      }

      return MemoryStore.count();
    },

    // ---- 保存到 DB.longMemory ----
    saveToDB: function (work) {
      if (!work) return false;
      if (!work.longMemory) {
        work.longMemory = {
          charStates: [], plotThreads: [], foreshadows: [], charArcs: [],
          memoryAnchors: { core: [], characterTags: [], relationships: [], items: [], locations: [], promises: [], timeline: [], hooks: [] },
          chapterIndex: [], characterHistory: {}, rollingSummary: '', memoryDebt: [],
          lifecycle: { lastCompressedAt: -1, lastRebuildAt: 0 },
          volumeMemories: [], characterProfiles: {}, foreshadowLedger: [],
          itemLedger: {}, factionGraph: {}, timelineEvents: [],
          ultraMeta: { volumeSize: 50, lastUltraUpdateAt: -1 }, chainConsistency: []
        };
      }

      var lm = work.longMemory;

      // 更新 chapterIndex
      var plotMemories = MemoryStore.getByType(MEMORY_TYPES.PLOT);
      lm.chapterIndex = plotMemories.map(function (m) {
        return {
          chapterIdx: m.chapterIdx,
          summary: m.summary || m.content,
          entities: m.entities || [],
          importance: m.importance
        };
      });

      // 更新 memoryAnchors
      var anchorMap = {
        core: MEMORY_TYPES.PLOT,
        characterTags: MEMORY_TYPES.CHARACTER,
        relationships: MEMORY_TYPES.RELATIONSHIP,
        items: MEMORY_TYPES.ITEM,
        locations: MEMORY_TYPES.LOCATION,
        promises: MEMORY_TYPES.FORESHADOW,
        timeline: MEMORY_TYPES.PLOT,
        hooks: MEMORY_TYPES.FORESHADOW
      };

      for (var key in anchorMap) {
        var type = anchorMap[key];
        var mems = MemoryStore.getByType(type);
        lm.memoryAnchors[key] = mems.map(function (m) {
          return {
            text: m.content,
            chapterIdx: m.chapterIdx,
            entities: m.entities || [],
            importance: m.importance
          };
        }).slice(-50); // 最多保留50条
      }

      // 更新 foreshadowLedger
      var foreshadows = MemoryStore.getByType(MEMORY_TYPES.FORESHADOW);
      lm.foreshadowLedger = foreshadows.map(function (m) {
        return {
          text: m.content,
          chapterIdx: m.chapterIdx,
          status: (m.tags || []).indexOf('已解') >= 0 ? '已解' : '未解',
          entities: m.entities || []
        };
      }).slice(-150);

      // 更新 timelineEvents
      lm.timelineEvents = plotMemories.filter(function (m) {
        return m.importance >= IMPORTANCE_LEVELS.HIGH;
      }).map(function (m) {
        return {
          chapterIdx: m.chapterIdx,
          time: '',
          text: m.summary || m.content,
          entities: m.entities || []
        };
      }).slice(-200);

      // 更新 characterProfiles
      var allEntities = Object.keys(MemoryStore._byEntity);
      lm.characterProfiles = lm.characterProfiles || {};
      for (var e = 0; e < allEntities.length; e++) {
        var entity = allEntities[e];
        var profile = MemoryCompression.compressCharacterProfile(entity);
        if (profile) {
          lm.characterProfiles[entity] = lm.characterProfiles[entity] || {};
          lm.characterProfiles[entity].currentStatus = profile.statusChanges.length > 0 ?
            profile.statusChanges[profile.statusChanges.length - 1].status : '';
          lm.characterProfiles[entity].lastSeen = profile.lastAppearance;
          lm.characterProfiles[entity].firstSeen = profile.firstAppearance;
          lm.characterProfiles[entity].milestones = (lm.characterProfiles[entity].milestones || []).concat(
            profile.milestones.map(function (m) { return m.event; })
          ).slice(-12);
          lm.characterProfiles[entity].relationships = (lm.characterProfiles[entity].relationships || []).concat(
            profile.relationships.map(function (r) { return r.detail; })
          ).slice(-8);
          lm.characterProfiles[entity].items = (lm.characterProfiles[entity].items || []).concat(
            profile.items.map(function (it) { return it.item; })
          ).slice(-6);
        }
      }

      // 更新 rollingSummary
      var lastChapter = 0;
      for (var i = 0; i < plotMemories.length; i++) {
        lastChapter = Math.max(lastChapter, plotMemories[i].chapterIdx || 0);
      }
      lm.rollingSummary = MemoryCompression.rollingSummary(lastChapter, 10);

      // 更新 lifecycle
      lm.lifecycle = lm.lifecycle || { lastCompressedAt: -1, lastRebuildAt: 0 };
      lm.lifecycle.lastRebuildAt = Date.now();

      return true;
    }
  };

  // ==========================================================================
  // === 第十二部分：一键式高级 API ============================================
  // ==========================================================================

  // ---- 从章节文本全自动摄入 + 优化 + 保存 ----
  function autoIngestChapter(work, chapterText, chapterIdx, chapterTitle) {
    // 1. 从 DB 加载现有记忆
    Bridge.loadFromDB(work);

    // 2. 摄入新章节
    var newMemories = MemoryIngestion.ingestFromChapter(chapterText, chapterIdx, chapterTitle, {
      knownNames: Object.keys(MemoryStore._byEntity)
    });
    MemoryStore.addBatch(newMemories);

    // 3. 自动评分
    for (var i = 0; i < newMemories.length; i++) {
      MemoryOptimization.autoScore(newMemories[i]);
    }

    // 4. 自动关联
    for (var j = 0; j < newMemories.length; j++) {
      MemoryLinking.autoLink(newMemories[j]);
    }

    // 5. 如果记忆过多，触发压缩
    if (MemoryStore.count() > 3000) {
      MemoryCompression.prune({ maxMemories: 3000 });
    }

    // 6. 保存回 DB
    Bridge.saveToDB(work);

    return {
      ingested: newMemories.length,
      total: MemoryStore.count(),
      stats: MemoryStore.stats()
    };
  }

  // ---- 一键查询（用于构建 Prompt） ----
  function queryForPrompt(work, currentChapterIdx, contextQuery) {
    // 从 DB 加载
    Bridge.loadFromDB(work);

    var result = {
      // 最近章节的滚动摘要
      rollingSummary: MemoryCompression.rollingSummary(currentChapterIdx, 10),

      // 当前上下文相关的记忆
      context: contextQuery ? MemoryRetrieval.retrieveContext(contextQuery, {
        limit: 20,
        minImportance: 2
      }) : '',

      // 伏笔面板
      foreshadowBoard: MemoryQuery.buildForeshadowBoard(),

      // 最近N章的关键事件
      recentEvents: MemoryRetrieval.searchByTimeline({
        from: Math.max(0, currentChapterIdx - 10),
        to: currentChapterIdx,
        types: [MEMORY_TYPES.PLOT, MEMORY_TYPES.CONFLICT],
        limit: 30
      }).map(function (m) { return m.summary || m.content.substring(0, 60); }),

      // 统计
      stats: MemoryStore.stats()
    };

    return result;
  }

  // ---- 一键维护 ----
  function autoMaintain(work) {
    Bridge.loadFromDB(work);
    var result = MemoryLifecycle.maintenance();
    Bridge.saveToDB(work);
    return result;
  }

  // ---- 智能搜索 ----
  function smartSearch(work, query, opts) {
    Bridge.loadFromDB(work);
    return MemoryRetrieval.search(query, opts);
  }

  // ---- 构建完整 Prompt 注入 ----
  function buildFullPromptInjection(work, currentChapterIdx, userQuery) {
    Bridge.loadFromDB(work);

    var parts = [];

    // 1. 滚动摘要
    var summary = MemoryCompression.rollingSummary(currentChapterIdx, 10);
    if (summary) parts.push('【近期剧情摘要】\n' + summary);

    // 2. 伏笔提醒
    var foreshadows = MemoryQuery.buildForeshadowBoard();
    if (foreshadows && foreshadows.indexOf('暂无') < 0) parts.push(foreshadows);

    // 3. 用户查询相关的记忆
    if (userQuery) {
      var context = MemoryQuery.buildContextPrompt(userQuery, { limit: 15, minImportance: 2 });
      if (context) parts.push(context);
    }

    // 4. 关键角色状态
    var allEntities = Object.keys(MemoryStore._byEntity);
    var topEntities = allEntities.sort(function (a, b) {
      return (MemoryStore._byEntity[b] || []).length - (MemoryStore._byEntity[a] || []).length;
    }).slice(0, 5);

    for (var e = 0; e < topEntities.length; e++) {
      var charSummary = MemoryQuery.buildCharacterStateSummary(topEntities[e]);
      if (charSummary) parts.push(charSummary);
    }

    return parts.join('\n\n');
  }

  // ==========================================================================
  // === 公开 API =============================================================
  // ==========================================================================

  return {
    // 常量
    MEMORY_TYPES: MEMORY_TYPES,
    IMPORTANCE_LEVELS: IMPORTANCE_LEVELS,

    // 核心存储
    store: MemoryStore,

    // 子系统
    ingestion: MemoryIngestion,
    retrieval: MemoryRetrieval,
    compression: MemoryCompression,
    linking: MemoryLinking,
    optimization: MemoryOptimization,
    query: MemoryQuery,
    lifecycle: MemoryLifecycle,
    bridge: Bridge,

    // 高级 API
    autoIngestChapter: autoIngestChapter,
    queryForPrompt: queryForPrompt,
    autoMaintain: autoMaintain,
    smartSearch: smartSearch,
    buildFullPromptInjection: buildFullPromptInjection,

    // 工具函数
    tokenize: tokenize,
    hashStr: hashStr
  };
})();

// 挂载到全局
window.MemorySkill = MemorySkill;