const VectorRAG = require('./core/vector-rag.js');
const LongTermMemory = require('./core/long-term-memory.js');
const MemoryExtractor = require('./modules/memory-extractor.js');
const MemoryCompressor = require('./modules/memory-compressor.js');
const ConsistencyChecker = require('./modules/consistency-checker.js');
const CharacterManager = require('./modules/character-manager.js');
const ForeshadowManager = require('./modules/foreshadow-manager.js');

class MemorySystem {
  constructor(options = {}) {
    this.options = Object.assign({
      maxAnchorsPerBucket: 200,
      compressAfterChapters: 25,
      volumeSize: 50,
      enableRAG: true,
      enableAutoExtract: true,
      language: 'zh'
    }, options);

    this.work = null;
    this.rag = null;
    this.longMemory = null;
    this.extractor = new MemoryExtractor(this.options);
    this.compressor = new MemoryCompressor(this.options);
    this.checker = new ConsistencyChecker(this.options);
    this.characterManager = new CharacterManager(this.options);
    this.foreshadowManager = new ForeshadowManager(this.options);
    this._initialized = false;
  }

  init(work = {}) {
    this.work = work;

    if (!this.work.longMemory) {
      this.work.longMemory = LongTermMemory.createEmpty();
    }

    this.longMemory = new LongTermMemory(this.work.longMemory, this.options);

    if (this.options.enableRAG) {
      this.rag = new VectorRAG(this.options);
      if (this.work.chapters && this.work.chapters.length > 0) {
        this.rag.buildIndex(this.work);
      }
    }

    this._initialized = true;
    return this;
  }

  addChapter(chapterIdx, content, title = null) {
    if (!this._initialized) throw new Error('MemorySystem not initialized. Call init() first.');
    if (!content || content.trim().length < 50) return { extracted: 0 };

    if (!this.work.chapters) this.work.chapters = [];
    if (!this.work.chapters[chapterIdx]) {
      this.work.chapters[chapterIdx] = { title: title || (`第${chapterIdx + 1}章`), content: '' };
    }
    this.work.chapters[chapterIdx].content = content;
    if (title) this.work.chapters[chapterIdx].title = title;

    const extracted = this.extractor.extract(this.work, chapterIdx, content);

    this.characterManager.update(this.work, chapterIdx, content, extracted.characters);
    this.foreshadowManager.update(this.work, chapterIdx, content, extracted.foreshadows);

    if (this.rag) {
      this.rag.buildIndex(this.work);
    }

    if (chapterIdx > 0 && chapterIdx % this.options.compressAfterChapters === 0) {
      this.compressor.compress(this.work, chapterIdx);
    }

    this.longMemory.updateChapterIndex(chapterIdx, content, title);

    return {
      extracted: extracted.total || 0,
      categories: extracted.categories || {},
      characters: extracted.characters || [],
      foreshadows: extracted.foreshadows || []
    };
  }

  search(query, topK = 5, opts = {}) {
    if (!this._initialized) throw new Error('MemorySystem not initialized. Call init() first.');

    const results = {
      ragResults: [],
      anchorResults: [],
      characterResults: [],
      foreshadowResults: []
    };

    if (this.rag && this.options.enableRAG) {
      results.ragResults = this.rag.retrieve(query, topK, opts);
    }

    results.anchorResults = this.longMemory.searchAnchors(query, topK, opts);
    results.characterResults = this.characterManager.search(this.work, query);
    results.foreshadowResults = this.foreshadowManager.search(this.work, query);

    return results;
  }

  getContext(chapterIdx, opts = {}) {
    if (!this._initialized) throw new Error('MemorySystem not initialized. Call init() first.');

    const options = Object.assign({
      includeCore: true,
      includeCharacters: true,
      includeRelationships: true,
      includeItems: true,
      includeForeshadows: true,
      includeTimeline: true,
      includeChapterContext: true,
      includeRAG: false,
      ragQuery: '',
      maxItems: 10
    }, opts);

    const context = {
      text: '',
      sections: {}
    };

    const anchors = this.longMemory.getAnchorContext(chapterIdx, options);
    context.sections.anchors = anchors;
    context.text += anchors.text;

    if (options.includeChapterContext) {
      const chapterCtx = this.longMemory.getSurroundingChapters(chapterIdx, 3);
      context.sections.chapters = chapterCtx;
      context.text += chapterCtx.text;
    }

    if (options.includeRAG && options.ragQuery && this.rag) {
      const ragResults = this.rag.retrieve(options.ragQuery, 5, {
        currentChapter: chapterIdx,
        boostRecent: true
      });
      context.sections.rag = ragResults;
      if (ragResults.length > 0) {
        context.text += '\n【RAG 检索片段】\n';
        ragResults.forEach((r, i) => {
          context.text += `${i + 1}. ${r.chunk.title}（相似度 ${r.score.toFixed(3)}）：${r.chunk.rawText}\n`;
        });
      }
    }

    const characterCtx = this.characterManager.getContext(this.work, chapterIdx, options);
    context.sections.characters = characterCtx;
    context.text += characterCtx.text;

    const foreshadowCtx = this.foreshadowManager.getContext(this.work, chapterIdx, options);
    context.sections.foreshadows = foreshadowCtx;
    context.text += foreshadowCtx.text;

    return context;
  }

  getMemoryStats() {
    if (!this._initialized) throw new Error('MemorySystem not initialized. Call init() first.');

    const stats = {
      totalChapters: this.work.chapters ? this.work.chapters.length : 0,
      totalWords: 0,
      anchors: {},
      characterCount: 0,
      foreshadowCount: 0,
      itemCount: 0,
      timelineEvents: 0,
      chapterIndexSize: 0,
      volumeMemories: 0
    };

    if (this.work.chapters) {
      this.work.chapters.forEach(ch => {
        stats.totalWords += (ch.content || '').length;
      });
    }

    const lm = this.work.longMemory;
    if (lm) {
      if (lm.memoryAnchors) {
        Object.keys(lm.memoryAnchors).forEach(key => {
          stats.anchors[key] = Array.isArray(lm.memoryAnchors[key]) ? lm.memoryAnchors[key].length : 0;
        });
      }
      stats.characterCount = lm.characterProfiles ? Object.keys(lm.characterProfiles).length : 0;
      stats.foreshadowCount = lm.foreshadowLedger ? lm.foreshadowLedger.length : 0;
      stats.itemCount = lm.itemLedger ? Object.keys(lm.itemLedger).length : 0;
      stats.timelineEvents = lm.timelineEvents ? lm.timelineEvents.length : 0;
      stats.chapterIndexSize = lm.chapterIndex ? lm.chapterIndex.length : 0;
      stats.volumeMemories = lm.volumeMemories ? lm.volumeMemories.length : 0;
    }

    return stats;
  }

  checkConsistency(chapterIdx = null) {
    if (!this._initialized) throw new Error('MemorySystem not initialized. Call init() first.');
    return this.checker.check(this.work, chapterIdx);
  }

  compress(chapterIdx) {
    if (!this._initialized) throw new Error('MemorySystem not initialized. Call init() first.');
    return this.compressor.compress(this.work, chapterIdx);
  }

  exportMemory() {
    if (!this._initialized) throw new Error('MemorySystem not initialized. Call init() first.');
    return JSON.parse(JSON.stringify(this.work.longMemory || {}));
  }

  importMemory(data) {
    if (!this.work) this.work = {};
    this.work.longMemory = JSON.parse(JSON.stringify(data));
    if (this.longMemory) {
      this.longMemory.data = this.work.longMemory;
    }
    return this;
  }

  addManualMemory(type, content, meta = {}) {
    if (!this._initialized) throw new Error('MemorySystem not initialized. Call init() first.');
    return this.longMemory.addAnchor(type, content, meta);
  }

  getCharacter(name) {
    if (!this._initialized) throw new Error('MemorySystem not initialized. Call init() first.');
    return this.characterManager.get(this.work, name);
  }

  listCharacters(opts = {}) {
    if (!this._initialized) throw new Error('MemorySystem not initialized. Call init() first.');
    return this.characterManager.list(this.work, opts);
  }

  listForeshadows(status = null) {
    if (!this._initialized) throw new Error('MemorySystem not initialized. Call init() first.');
    return this.foreshadowManager.list(this.work, status);
  }

  resolveForeshadow(foreshadowId, chapterIdx, resolution) {
    if (!this._initialized) throw new Error('MemorySystem not initialized. Call init() first.');
    return this.foreshadowManager.resolve(this.work, foreshadowId, chapterIdx, resolution);
  }
}

MemorySystem.VectorRAG = VectorRAG;
MemorySystem.LongTermMemory = LongTermMemory;
MemorySystem.MemoryExtractor = MemoryExtractor;
MemorySystem.MemoryCompressor = MemoryCompressor;
MemorySystem.ConsistencyChecker = ConsistencyChecker;
MemorySystem.CharacterManager = CharacterManager;
MemorySystem.ForeshadowManager = ForeshadowManager;

module.exports = MemorySystem;
