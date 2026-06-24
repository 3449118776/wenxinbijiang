const MEMORY_TIER_META = {
  core: { tier: 0, maxRaw: 200, compressAfter: -1, archiveAfter: -1, weight: 12, label: 'L0核心' },
  characterTags: { tier: 1, maxRaw: 120, compressAfter: 25, archiveAfter: 40, weight: 8, label: 'L1角色' },
  relationships: { tier: 1, maxRaw: 120, compressAfter: 25, archiveAfter: 40, weight: 8, label: 'L1关系' },
  items: { tier: 1, maxRaw: 100, compressAfter: 25, archiveAfter: 40, weight: 8, label: 'L1道具' },
  promises: { tier: 1, maxRaw: 80, compressAfter: 20, archiveAfter: 35, weight: 7, label: 'L1承诺' },
  dialogues: { tier: 1, maxRaw: 80, compressAfter: 20, archiveAfter: 35, weight: 7, label: 'L1金句' },
  abilityCosts: { tier: 1, maxRaw: 60, compressAfter: 15, archiveAfter: 25, weight: 7, label: 'L1能力代价' },
  emotionTrack: { tier: 1, maxRaw: 100, compressAfter: 20, archiveAfter: 35, weight: 6, label: 'L1情感轨迹' },
  scenes: { tier: 2, maxRaw: 80, compressAfter: 15, archiveAfter: 25, weight: 5, label: 'L2场景细节' },
  locations: { tier: 2, maxRaw: 80, compressAfter: 15, archiveAfter: 25, weight: 6, label: 'L2地点' },
  timeline: { tier: 2, maxRaw: 60, compressAfter: 15, archiveAfter: 25, weight: 6, label: 'L2时间' },
  hooks: { tier: 2, maxRaw: 80, compressAfter: 15, archiveAfter: 25, weight: 5, label: 'L2钩子' },
  chapterContext: { tier: 1, maxRaw: 60, compressAfter: 8, archiveAfter: 20, weight: 9, label: 'L1章节上下文' }
};

const BUCKET_LABELS = {
  core: 'L0 核心事实（全书级，绝不能写错）',
  characterTags: 'L1 角色记忆点',
  relationships: 'L1 关系变化',
  items: 'L1 道具归属',
  promises: 'L2 承诺/禁忌/时限',
  dialogues: 'L1 角色金句（必须保持角色声音一致）',
  abilityCosts: 'L1 能力代价/反噬（防止无限开挂）',
  emotionTrack: 'L1 情感轨迹（情绪必须连贯）',
  scenes: 'L2 场景细节（感官回响）',
  locations: 'L2 地点状态',
  timeline: 'L2 时间线锚点',
  hooks: 'L3 未兑现爽点钩子',
  chapterContext: 'L1 章节上下文'
};

const PRIORITY_ORDER = ['core', 'characterTags', 'dialogues', 'emotionTrack', 'relationships', 'items', 'abilityCosts', 'promises', 'locations', 'scenes', 'timeline', 'hooks', 'chapterContext'];

function scoreMemoryAnchor(anchor, currentChapterIdx) {
  const tierMeta = MEMORY_TIER_META[anchor.bucket] || { weight: 5, tier: 2 };
  let score = tierMeta.weight;
  const age = currentChapterIdx - (anchor.chapterIdx || 0);
  if (age <= 3) score += 4;
  else if (age <= 10) score += 2;
  else if (age <= 30) score += 1;
  if (anchor.urgent || anchor.level === 'high') score += 3;
  if (anchor.charRole) {
    const roleWeights = { '主角': 5, '女主': 4, '男主': 4, '反派': 4, '配角': 3, '导师': 3, '伙伴': 3, '龙套': 1 };
    score += (roleWeights[anchor.charRole] || 1);
  }
  if (anchor.status === '失效' || anchor.status === 'resolved') score -= 5;
  return score;
}

class LongTermMemory {
  constructor(data = null, options = {}) {
    this.options = Object.assign({
      maxAnchorsPerBucket: 200,
      maxChapterIndex: 3000
    }, options);

    if (!data) {
      this.data = LongTermMemory.createEmpty();
    } else {
      this.data = data;
      this._ensureStructure();
    }
  }

  static createEmpty() {
    return {
      charStates: [],
      plotThreads: [],
      foreshadows: [],
      charArcs: [],
      memoryAnchors: {
        core: [],
        characterTags: [],
        relationships: [],
        items: [],
        locations: [],
        promises: [],
        timeline: [],
        hooks: [],
        dialogues: [],
        abilityCosts: [],
        emotionTrack: [],
        scenes: [],
        chapterContext: []
      },
      charRoles: {},
      chapterIndex: [],
      characterHistory: {},
      rollingSummary: {
        recent: '',
        milestones: '',
        eras: '',
        ultraEras: '',
        megaEras: '',
        _old: ''
      },
      memoryDebt: [],
      lifecycle: {
        lastCompressedAt: -1,
        lastRebuildAt: 0
      },
      volumeMemories: [],
      characterProfiles: {},
      foreshadowLedger: [],
      itemLedger: {},
      factionGraph: {},
      timelineEvents: [],
      ultraMeta: {
        volumeSize: 50,
        lastUltraUpdateAt: -1
      },
      _anchorDigest: {},
      _memoryMeta: {
        lastPriorityRecalc: 0,
        lastConsistencyCheck: 0,
        totalAnchors: 0,
        activeDebt: 0
      }
    };
  }

  _ensureStructure() {
    const empty = LongTermMemory.createEmpty();
    if (!this.data.memoryAnchors) this.data.memoryAnchors = empty.memoryAnchors;
    const anchors = this.data.memoryAnchors;
    Object.keys(empty.memoryAnchors).forEach(key => {
      if (!Array.isArray(anchors[key])) anchors[key] = [];
    });

    if (!Array.isArray(this.data.chapterIndex)) this.data.chapterIndex = [];
    if (!this.data.characterHistory) this.data.characterHistory = {};
    if (!this.data.characterProfiles) this.data.characterProfiles = {};
    if (!Array.isArray(this.data.foreshadowLedger)) this.data.foreshadowLedger = [];
    if (!this.data.itemLedger) this.data.itemLedger = {};
    if (!this.data.factionGraph) this.data.factionGraph = {};
    if (!Array.isArray(this.data.timelineEvents)) this.data.timelineEvents = [];
    if (!Array.isArray(this.data.volumeMemories)) this.data.volumeMemories = [];
    if (!this.data.charRoles) this.data.charRoles = {};
    if (!Array.isArray(this.data.memoryDebt)) this.data.memoryDebt = [];
    if (!this.data.ultraMeta) this.data.ultraMeta = empty.ultraMeta;

    if (!this.data._anchorDigest) {
      this.data._anchorDigest = {};
      Object.keys(empty.memoryAnchors).forEach(k => {
        this.data._anchorDigest[k] = [];
      });
    }

    if (!this.data._memoryMeta) this.data._memoryMeta = empty._memoryMeta;
    if (!this.data.rollingSummary || typeof this.data.rollingSummary === 'string') {
      const oldSummary = typeof this.data.rollingSummary === 'string' ? this.data.rollingSummary : '';
      this.data.rollingSummary = { ...empty.rollingSummary, _old: oldSummary };
    }
  }

  addAnchor(bucket, text, meta = {}) {
    if (!this.data.memoryAnchors[bucket]) {
      this.data.memoryAnchors[bucket] = [];
    }

    const anchor = {
      text,
      chapterIdx: meta.chapterIdx || 0,
      status: meta.status || 'active',
      level: meta.level || 'normal',
      urgent: meta.urgent || false,
      charRole: meta.charRole || null,
      character: meta.character || null,
      tags: meta.tags || [],
      source: meta.source || 'auto',
      createdAt: meta.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    const list = this.data.memoryAnchors[bucket];
    const existingIdx = list.findIndex(a =>
      a.text === text && a.chapterIdx === anchor.chapterIdx
    );

    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...anchor, updatedAt: Date.now() };
    } else {
      list.push(anchor);
    }

    if (list.length > this.options.maxAnchorsPerBucket) {
      list.sort((a, b) => b.chapterIdx - a.chapterIdx);
      list.splice(this.options.maxAnchorsPerBucket);
    }

    this._updateMeta();
    return anchor;
  }

  getAnchors(bucket, opts = {}) {
    const list = this.data.memoryAnchors[bucket] || [];
    let filtered = [...list];

    if (opts.chapterIdx !== undefined) {
      filtered = filtered.filter(a => a.chapterIdx < opts.chapterIdx);
    }
    if (opts.status) {
      filtered = filtered.filter(a => a.status === opts.status);
    }
    if (opts.character) {
      filtered = filtered.filter(a => a.character === opts.character);
    }

    if (opts.sortBy === 'score' && opts.currentChapter !== undefined) {
      filtered.sort((a, b) => scoreMemoryAnchor(b, opts.currentChapter) - scoreMemoryAnchor(a, opts.currentChapter));
    } else {
      filtered.sort((a, b) => b.chapterIdx - a.chapterIdx);
    }

    if (opts.limit) {
      filtered = filtered.slice(0, opts.limit);
    }

    return filtered;
  }

  searchAnchors(query, topK = 5, opts = {}) {
    if (!query) return [];
    const results = [];
    const queryLower = query.toLowerCase();

    Object.keys(this.data.memoryAnchors).forEach(bucket => {
      const list = this.data.memoryAnchors[bucket] || [];
      list.forEach(anchor => {
        if (opts.chapterIdx !== undefined && anchor.chapterIdx >= opts.chapterIdx) return;
        if (anchor.status === '失效') return;

        const textLower = anchor.text.toLowerCase();
        let score = 0;

        if (textLower.includes(queryLower)) {
          score = 10;
          const idx = textLower.indexOf(queryLower);
          if (idx === 0) score += 2;
        } else {
          const queryChars = query.split('');
          let matchCount = 0;
          queryChars.forEach(c => {
            if (textLower.includes(c.toLowerCase())) matchCount++;
          });
          score = matchCount / queryChars.length * 5;
        }

        if (score > 1) {
          const tierMeta = MEMORY_TIER_META[bucket] || { weight: 5 };
          score += tierMeta.weight * 0.3;
          if (anchor.urgent || anchor.level === 'high') score += 2;

          results.push({
            anchor,
            bucket,
            score
          });
        }
      });
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  getAnchorContext(currentChapterIdx, opts = {}) {
    const context = { text: '', buckets: {} };
    const maxItems = opts.maxItems || 10;

    PRIORITY_ORDER.forEach(bucket => {
      const list = this.getAnchors(bucket, {
        chapterIdx: currentChapterIdx,
        status: 'active',
        sortBy: 'score',
        currentChapter: currentChapterIdx,
        limit: bucket === 'core' ? Math.min(12, maxItems) : Math.min(6, maxItems)
      });

      if (!list.length) return;

      const bucketText = [];
      bucketText.push(`【${BUCKET_LABELS[bucket] || bucket}】`);
      list.forEach(a => {
        let line = `  - 第${(a.chapterIdx || 0) + 1}章：`;
        if (a.charRole && a.charRole !== '龙套') line += `[${a.charRole}] `;
        line += a.text;
        if (a.urgent || a.level === 'high') line += ' ⚠️';
        bucketText.push(line);
      });

      const digests = this.data._anchorDigest && this.data._anchorDigest[bucket] ? this.data._anchorDigest[bucket] : [];
      if (digests.length > 0) {
        bucketText.push(`  [早期摘要]${digests.slice(-3).join('；')}`);
      }

      bucketText.push('');
      context.buckets[bucket] = list;
      context.text += bucketText.join('\n');
    });

    return context;
  }

  updateChapterIndex(chapterIdx, content, title = null) {
    if (!Array.isArray(this.data.chapterIndex)) this.data.chapterIndex = [];

    const head = content.slice(0, 120).replace(/\n/g, ' ');
    const sentences = content.split(/[。！？\n]+/).filter(s => s.trim().length > 5);
    const eventWords = ['杀', '击', '破', '碎', '逃', '怒', '夺', '败', '胜', '震惊', '发现', '遇到', '觉醒', '突破', '暴露', '封印', '威胁', '追杀'];
    const events = [];
    for (const s of sentences) {
      if (events.length >= 3) break;
      if (eventWords.some(w => s.includes(w)) && !events.includes(s.trim())) {
        events.push(s.trim().slice(0, 40));
      }
    }
    const tail = content.slice(-80).replace(/\n/g, ' ');

    let summary = head;
    if (events.length > 0) summary += ' -> ' + events.join(' | ');
    if (tail.length > 10 && !head.includes(tail.slice(0, 20))) {
      summary += ' ... ' + tail;
    }
    summary = summary.slice(0, 300);

    const entry = {
      chapterIdx,
      title: title || (`第${chapterIdx + 1}章`),
      summary,
      wordCount: content.length,
      updatedAt: Date.now()
    };

    const existingIdx = this.data.chapterIndex.findIndex(c => c.chapterIdx === chapterIdx);
    if (existingIdx >= 0) {
      this.data.chapterIndex[existingIdx] = entry;
    } else {
      this.data.chapterIndex.push(entry);
      this.data.chapterIndex.sort((a, b) => a.chapterIdx - b.chapterIdx);
    }

    if (this.data.chapterIndex.length > this.options.maxChapterIndex) {
      this.data.chapterIndex.splice(0, this.data.chapterIndex.length - this.options.maxChapterIndex);
    }

    return entry;
  }

  getSurroundingChapters(currentIdx, count = 3) {
    const context = { text: '', chapters: [] };
    if (!this.data.chapterIndex || !this.data.chapterIndex.length) return context;

    const start = Math.max(0, currentIdx - count);
    const end = Math.min(this.data.chapterIndex.length - 1, currentIdx - 1);

    const surrounding = [];
    for (let i = start; i <= end; i++) {
      const ch = this.data.chapterIndex.find(c => c.chapterIdx === i);
      if (ch) surrounding.push(ch);
    }

    if (!surrounding.length) return context;

    context.chapters = surrounding;
    const text = ['【前情回顾】'];
    surrounding.forEach(ch => {
      text.push(`  ${ch.title}：${ch.summary}`);
    });
    text.push('');
    context.text = text.join('\n');

    return context;
  }

  _updateMeta() {
    let total = 0;
    Object.values(this.data.memoryAnchors).forEach(list => {
      if (Array.isArray(list)) total += list.length;
    });
    if (this.data._memoryMeta) {
      this.data._memoryMeta.totalAnchors = total;
    }
  }

  getStats() {
    const stats = {
      anchors: {},
      chapterIndex: this.data.chapterIndex ? this.data.chapterIndex.length : 0,
      characters: this.data.characterProfiles ? Object.keys(this.data.characterProfiles).length : 0,
      foreshadows: this.data.foreshadowLedger ? this.data.foreshadowLedger.length : 0,
      items: this.data.itemLedger ? Object.keys(this.data.itemLedger).length : 0,
      timelineEvents: this.data.timelineEvents ? this.data.timelineEvents.length : 0,
      totalAnchors: 0
    };

    Object.entries(this.data.memoryAnchors).forEach(([bucket, list]) => {
      stats.anchors[bucket] = Array.isArray(list) ? list.length : 0;
      stats.totalAnchors += stats.anchors[bucket];
    });

    return stats;
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this.data));
  }
}

LongTermMemory.MEMORY_TIER_META = MEMORY_TIER_META;
LongTermMemory.BUCKET_LABELS = BUCKET_LABELS;
LongTermMemory.scoreMemoryAnchor = scoreMemoryAnchor;

module.exports = LongTermMemory;
