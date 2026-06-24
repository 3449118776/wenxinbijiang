const MEMORY_TIER_META = {
  core: { tier: 0, compressAfter: -1, archiveAfter: -1, weight: 12 },
  characterTags: { tier: 1, compressAfter: 25, archiveAfter: 40, weight: 8 },
  relationships: { tier: 1, compressAfter: 25, archiveAfter: 40, weight: 8 },
  items: { tier: 1, compressAfter: 25, archiveAfter: 40, weight: 8 },
  promises: { tier: 1, compressAfter: 20, archiveAfter: 35, weight: 7 },
  dialogues: { tier: 1, compressAfter: 20, archiveAfter: 35, weight: 7 },
  abilityCosts: { tier: 1, compressAfter: 15, archiveAfter: 25, weight: 7 },
  emotionTrack: { tier: 1, compressAfter: 20, archiveAfter: 35, weight: 6 },
  scenes: { tier: 2, compressAfter: 15, archiveAfter: 25, weight: 5 },
  locations: { tier: 2, compressAfter: 15, archiveAfter: 25, weight: 6 },
  timeline: { tier: 2, compressAfter: 15, archiveAfter: 25, weight: 6 },
  hooks: { tier: 2, compressAfter: 15, archiveAfter: 25, weight: 5 },
  chapterContext: { tier: 1, compressAfter: 8, archiveAfter: 20, weight: 9 }
};

function scoreAnchor(anchor, currentChapterIdx) {
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

class MemoryCompressor {
  constructor(options = {}) {
    this.options = Object.assign({
      maxAnchorsPerBucket: 200,
      compressAfterChapters: 25,
      digestKeepCount: 3,
      volumeSize: 50
    }, options);
  }

  compress(work, currentChapterIdx) {
    if (!work.longMemory) return { compressed: 0 };
    const lm = work.longMemory;
    if (!lm.memoryAnchors) return { compressed: 0 };

    let totalCompressed = 0;
    const results = {
      compressed: 0,
      byBucket: {},
      volumeCreated: false,
      timestamp: Date.now()
    };

    Object.keys(lm.memoryAnchors).forEach(bucket => {
      const bucketResult = this._compressBucket(
        bucket,
        lm.memoryAnchors[bucket],
        currentChapterIdx
      );
      if (bucketResult.compressed > 0) {
        lm.memoryAnchors[bucket] = bucketResult.remaining;
        if (!lm._anchorDigest) lm._anchorDigest = {};
        if (!lm._anchorDigest[bucket]) lm._anchorDigest[bucket] = [];
        lm._anchorDigest[bucket].push(bucketResult.digest);
        if (lm._anchorDigest[bucket].length > 10) {
          lm._anchorDigest[bucket].splice(0, lm._anchorDigest[bucket].length - 10);
        }
        totalCompressed += bucketResult.compressed;
        results.byBucket[bucket] = bucketResult.compressed;
      }
    });

    results.compressed = totalCompressed;

    if (currentChapterIdx > 0 && currentChapterIdx % this.options.volumeSize === 0) {
      const volumeResult = this._createVolumeMemory(work, currentChapterIdx);
      results.volumeCreated = true;
      results.volumeIndex = volumeResult.index;
    }

    if (lm.lifecycle) {
      lm.lifecycle.lastCompressedAt = currentChapterIdx;
    }

    return results;
  }

  _compressBucket(bucket, anchors, currentChapterIdx) {
    const tierMeta = MEMORY_TIER_META[bucket];
    if (!tierMeta || tierMeta.compressAfter === -1) {
      return { compressed: 0, remaining: anchors, digest: '' };
    }

    const compressAge = tierMeta.compressAfter;
    const maxCount = this.options.maxAnchorsPerBucket;

    if (!anchors || anchors.length <= maxCount) {
      return { compressed: 0, remaining: anchors || [], digest: '' };
    }

    const sorted = [...anchors].sort((a, b) => {
      return scoreAnchor(b, currentChapterIdx) - scoreAnchor(a, currentChapterIdx);
    });

    const toCompress = sorted.slice(maxCount);
    const remaining = sorted.slice(0, maxCount);

    if (toCompress.length === 0) {
      return { compressed: 0, remaining: anchors, digest: '' };
    }

    const digest = this._generateDigest(bucket, toCompress);

    return {
      compressed: toCompress.length,
      remaining,
      digest
    };
  }

  _generateDigest(bucket, anchors) {
    if (!anchors || anchors.length === 0) return '';

    const keyPoints = anchors
      .filter(a => a.level === 'high' || a.urgent)
      .slice(0, 5)
      .map(a => a.text.slice(0, 30));

    if (keyPoints.length === 0) {
      keyPoints.push(...anchors.slice(0, 3).map(a => a.text.slice(0, 30)));
    }

    const chapterRange = anchors.length > 1
      ? `第${Math.min(...anchors.map(a => a.chapterIdx || 0)) + 1}-${Math.max(...anchors.map(a => a.chapterIdx || 0)) + 1}章`
      : `第${(anchors[0].chapterIdx || 0) + 1}章`;

    return `${chapterRange}${keyPoints.length > 0 ? '：' + keyPoints.join('；') : ''}`;
  }

  _createVolumeMemory(work, currentChapterIdx) {
    if (!work.longMemory) return { index: -1 };
    const lm = work.longMemory;
    if (!lm.volumeMemories) lm.volumeMemories = [];

    const volumeSize = this.options.volumeSize;
    const volumeIdx = Math.floor(currentChapterIdx / volumeSize);
    const startChapter = volumeIdx * volumeSize;
    const endChapter = Math.min(currentChapterIdx, (volumeIdx + 1) * volumeSize - 1);

    const volumeMemory = {
      index: volumeIdx,
      startChapter,
      endChapter,
      createdAt: Date.now(),
      summary: '',
      keyEvents: [],
      characterStates: {},
      majorForeshadows: [],
      anchorDigest: {}
    };

    if (lm.chapterIndex) {
      const volChapters = lm.chapterIndex.filter(
        c => c.chapterIdx >= startChapter && c.chapterIdx <= endChapter
      );
      volumeMemory.summary = volChapters
        .slice(-5)
        .map(c => c.summary)
        .join(' | ')
        .slice(0, 500);
    }

    if (lm.memoryAnchors && lm._anchorDigest) {
      Object.keys(lm._anchorDigest).forEach(bucket => {
        const digests = lm._anchorDigest[bucket] || [];
        if (digests.length > 0) {
          volumeMemory.anchorDigest[bucket] = digests.slice(-5).join('；');
        }
      });
    }

    if (lm.foreshadowLedger) {
      volumeMemory.majorForeshadows = lm.foreshadowLedger
        .filter(f => f.chapterIdx >= startChapter && f.chapterIdx <= endChapter && f.strength === 'high')
        .map(f => ({ id: f.id, text: f.text, type: f.type, status: f.status }))
        .slice(0, 10);
    }

    if (lm.characterProfiles) {
      Object.entries(lm.characterProfiles).forEach(([name, profile]) => {
        if (profile.lastSeen >= startChapter && profile.lastSeen <= endChapter) {
          volumeMemory.characterStates[name] = {
            role: profile.role,
            status: profile.status,
            lastSeen: profile.lastSeen
          };
        }
      });
    }

    const existingIdx = lm.volumeMemories.findIndex(v => v.index === volumeIdx);
    if (existingIdx >= 0) {
      lm.volumeMemories[existingIdx] = volumeMemory;
    } else {
      lm.volumeMemories.push(volumeMemory);
    }

    if (lm.ultraMeta) {
      lm.ultraMeta.lastUltraUpdateAt = currentChapterIdx;
    }

    return { index: volumeIdx, volumeMemory };
  }

  getCompressionStats(work) {
    if (!work.longMemory || !work.longMemory.memoryAnchors) {
      return { total: 0, compressed: 0, compressionRatio: 0 };
    }

    const lm = work.longMemory;
    let totalActive = 0;
    let totalDigest = 0;

    Object.keys(lm.memoryAnchors).forEach(bucket => {
      totalActive += (lm.memoryAnchors[bucket] || []).length;
    });

    if (lm._anchorDigest) {
      Object.values(lm._anchorDigest).forEach(digests => {
        totalDigest += (digests || []).length;
      });
    }

    return {
      activeAnchors: totalActive,
      digestCount: totalDigest,
      volumeMemories: lm.volumeMemories ? lm.volumeMemories.length : 0,
      lastCompressedAt: lm.lifecycle ? lm.lifecycle.lastCompressedAt : -1
    };
  }

  rebuild(work, currentChapterIdx) {
    if (!work.longMemory) return { rebuilt: false };
    const lm = work.longMemory;

    let totalRebuilt = 0;

    if (lm.memoryAnchors) {
      Object.keys(lm.memoryAnchors).forEach(bucket => {
        const list = lm.memoryAnchors[bucket] || [];
        const sorted = list.sort((a, b) =>
          scoreAnchor(b, currentChapterIdx) - scoreAnchor(a, currentChapterIdx)
        );
        const maxCount = this.options.maxAnchorsPerBucket;
        if (sorted.length > maxCount) {
          const toDigest = sorted.slice(maxCount);
          lm.memoryAnchors[bucket] = sorted.slice(0, maxCount);

          if (!lm._anchorDigest) lm._anchorDigest = {};
          if (!lm._anchorDigest[bucket]) lm._anchorDigest[bucket] = [];

          const digest = this._generateDigest(bucket, toDigest);
          lm._anchorDigest[bucket].push(digest);
          totalRebuilt += toDigest.length;
        }
      });
    }

    if (lm.lifecycle) {
      lm.lifecycle.lastRebuildAt = currentChapterIdx;
    }

    return { rebuilt: true, count: totalRebuilt };
  }
}

MemoryCompressor.MEMORY_TIER_META = MEMORY_TIER_META;
MemoryCompressor.scoreAnchor = scoreAnchor;

module.exports = MemoryCompressor;
