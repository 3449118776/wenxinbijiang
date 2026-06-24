const FORESHADOW_TYPES = {
  identity: {
    label: '身份类',
    keywords: ['真实身份', '身世秘密', '血脉', '血统', '家族', '被抹去的名字', '其实是', '真正是', '本名', '身世']
  },
  power: {
    label: '能力类',
    keywords: ['隐藏能力', '未觉醒', '未完成的修炼', '真正用途', '尚未动用', '底牌', '杀手锏', '未施展']
  },
  relationship: {
    label: '关系类',
    keywords: ['秘密', '过去恩怨', '未公开的关系', '背叛', '忠诚', '其实', '私下', '暗中', '早已相识']
  },
  plot: {
    label: '剧情类',
    keywords: ['某个大阴谋', '幕后黑手', '未揭示的真相', '历史谜团', '谁也不知道', '真相是', '原来如此']
  },
  item: {
    label: '物品类',
    keywords: ['玉佩', '信物', '残片', '钥匙', '卷轴', '来历', '物件', '法宝', '古物', '印记']
  },
  world: {
    label: '世界观类',
    keywords: ['某地的秘密', '规则漏洞', '被遗忘的历史', '禁制的真相', '无人知晓', '传说中', '早已失传']
  },
  promise: {
    label: '承诺类',
    keywords: ['口头约定', '未兑现誓言', '约定的日子', '要去的地方', '若有朝一日', '等到那时', '约定']
  },
  injury: {
    label: '暗伤类',
    keywords: ['旧伤', '未治愈的暗疾', '修炼隐患', '精神创伤', '旧疾', '暗伤', '隐患', '心魔']
  }
};

const RECOVERY_SIGNAL_WORDS = ['原来', '果然', '终于', '真相是', '这一刻', '竟是', '居然', '直到此时', '此刻才', '回想起', '想起了', '忆起', '不出所料', '谁能想到'];
const SUSPENSE_WORDS = ['似乎', '好像', '仿佛', '隐约', '若有所思', '若有所觉', '不知道', '不会想到', '未曾料到', '日后', '将来', '某一天', '后来'];

class ForeshadowManager {
  constructor(options = {}) {
    this.options = Object.assign({
      maxForeshadows: 200,
      autoDetect: true
    }, options);
  }

  update(work, chapterIdx, content, foreshadows = []) {
    if (!work.longMemory) return;
    const lm = work.longMemory;
    if (!lm.foreshadowLedger) lm.foreshadowLedger = [];

    foreshadows.forEach(fs => {
      const exists = lm.foreshadowLedger.some(f =>
        f.text === fs.text && f.chapterIdx === chapterIdx
      );
      if (!exists) {
        lm.foreshadowLedger.push({
          id: 'fs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          type: fs.type || 'plot',
          label: fs.label || '剧情类',
          text: fs.text,
          chapterIdx,
          status: fs.status || '未解',
          strength: fs.strength || 'normal',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
    });

    this._detectRecoveries(work, chapterIdx, content);

    if (lm.foreshadowLedger.length > this.options.maxForeshadows) {
      lm.foreshadowLedger.sort((a, b) => {
        const priority = { 'high': 0, 'normal': 1, 'low': 2 };
        const aP = priority[a.strength] || 1;
        const bP = priority[b.strength] || 1;
        if (aP !== bP) return aP - bP;
        return b.chapterIdx - a.chapterIdx;
      });
      lm.foreshadowLedger.splice(this.options.maxForeshadows);
    }

    return lm.foreshadowLedger.length;
  }

  _detectRecoveries(work, chapterIdx, content) {
    const lm = work.longMemory;
    if (!lm.foreshadowLedger) return;

    const sentences = content.split(/[。！？\n]+/).filter(s => s.trim().length > 5);

    lm.foreshadowLedger.forEach(fs => {
      if (fs.status !== '未解') return;

      let hasRecovery = false;
      for (const signal of RECOVERY_SIGNAL_WORDS) {
        if (content.includes(signal)) {
          const fsKeywords = fs.text.split(/[，。、\s]+/).filter(w => w.length >= 2);
          const matches = fsKeywords.filter(kw => content.includes(kw)).length;
          if (matches >= 2) {
            hasRecovery = true;
            break;
          }
        }
      }

      if (hasRecovery) {
        fs.status = '已回收';
        fs.resolvedChapter = chapterIdx;
        fs.updatedAt = Date.now();
        if (!fs.resolution) {
          const relatedSentence = sentences.find(s => {
            return RECOVERY_SIGNAL_WORDS.some(w => s.includes(w));
          });
          if (relatedSentence) {
            fs.resolution = relatedSentence.trim().slice(0, 100);
          }
        }
      }
    });
  }

  list(work, status = null) {
    if (!work.longMemory || !work.longMemory.foreshadowLedger) return [];
    let list = [...work.longMemory.foreshadowLedger];

    if (status) {
      list = list.filter(f => f.status === status);
    }

    list.sort((a, b) => {
      const statusOrder = { '未解': 0, '已回收': 1, '失效': 2 };
      const aS = statusOrder[a.status] || 0;
      const bS = statusOrder[b.status] || 0;
      if (aS !== bS) return aS - bS;
      return b.chapterIdx - a.chapterIdx;
    });

    return list;
  }

  get(work, foreshadowId) {
    if (!work.longMemory || !work.longMemory.foreshadowLedger) return null;
    return work.longMemory.foreshadowLedger.find(f => f.id === foreshadowId) || null;
  }

  resolve(work, foreshadowId, chapterIdx, resolution) {
    if (!work.longMemory || !work.longMemory.foreshadowLedger) return null;
    const fs = work.longMemory.foreshadowLedger.find(f => f.id === foreshadowId);
    if (!fs) return null;

    fs.status = '已回收';
    fs.resolvedChapter = chapterIdx;
    fs.resolution = resolution || fs.resolution || '';
    fs.updatedAt = Date.now();

    return fs;
  }

  add(work, foreshadow) {
    if (!work.longMemory) return null;
    const lm = work.longMemory;
    if (!lm.foreshadowLedger) lm.foreshadowLedger = [];

    const newFs = {
      id: 'fs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: foreshadow.type || 'plot',
      label: foreshadow.label || FORESHADOW_TYPES[foreshadow.type]?.label || '剧情类',
      text: foreshadow.text || '',
      chapterIdx: foreshadow.chapterIdx || 0,
      status: foreshadow.status || '未解',
      strength: foreshadow.strength || 'normal',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    lm.foreshadowLedger.push(newFs);
    return newFs;
  }

  search(work, query) {
    if (!query || !work.longMemory || !work.longMemory.foreshadowLedger) return [];
    const results = [];
    const queryLower = query.toLowerCase();

    work.longMemory.foreshadowLedger.forEach(fs => {
      let score = 0;
      const text = (fs.text || '').toLowerCase();

      if (text.includes(queryLower)) {
        score = 10;
        const idx = text.indexOf(queryLower);
        if (idx === 0) score += 2;
      } else {
        const queryChars = query.split('');
        let matchCount = 0;
        queryChars.forEach(c => {
          if (text.includes(c.toLowerCase())) matchCount++;
        });
        score = matchCount / queryChars.length * 5;
      }

      if (score > 1) {
        if (fs.status === '未解') score += 2;
        if (fs.strength === 'high') score += 1;
        results.push({ foreshadow: fs, score });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 10);
  }

  getContext(work, chapterIdx, opts = {}) {
    const context = { text: '', foreshadows: [] };
    if (!work.longMemory || !work.longMemory.foreshadowLedger) return context;

    const unresolved = this.list(work, '未解');
    const recent = unresolved.slice(0, opts.maxItems || 8);
    context.foreshadows = recent;

    if (recent.length === 0) return context;

    const lines = ['【伏笔追踪（未回收）】'];
    recent.forEach(fs => {
      const age = chapterIdx - (fs.chapterIdx || 0);
      let line = `  [${fs.label}] 第${(fs.chapterIdx || 0) + 1}章（已悬${age}章）：${fs.text || ''}`;
      if (fs.strength === 'high') line += ' ⚠️';
      lines.push(line);
    });

    const hangingDebt = unresolved.filter(f => {
      const age = chapterIdx - (f.chapterIdx || 0);
      return age >= 10;
    }).length;
    if (hangingDebt > 0) {
      lines.push(`  [提醒] 有${hangingDebt}个伏笔悬挂超过10章，建议尽快回收`);
    }

    lines.push('');
    context.text = lines.join('\n');

    return context;
  }

  getStats(work) {
    if (!work.longMemory || !work.longMemory.foreshadowLedger) {
      return { total: 0, unresolved: 0, resolved: 0, byType: {} };
    }

    const stats = {
      total: work.longMemory.foreshadowLedger.length,
      unresolved: 0,
      resolved: 0,
      byType: {}
    };

    work.longMemory.foreshadowLedger.forEach(fs => {
      if (fs.status === '未解') stats.unresolved++;
      else if (fs.status === '已回收') stats.resolved++;

      if (!stats.byType[fs.type]) stats.byType[fs.type] = 0;
      stats.byType[fs.type]++;
    });

    return stats;
  }

  getForeshadowTypes() {
    return FORESHADOW_TYPES;
  }
}

ForeshadowManager.FORESHADOW_TYPES = FORESHADOW_TYPES;
ForeshadowManager.RECOVERY_SIGNAL_WORDS = RECOVERY_SIGNAL_WORDS;
ForeshadowManager.SUSPENSE_WORDS = SUSPENSE_WORDS;

module.exports = ForeshadowManager;
