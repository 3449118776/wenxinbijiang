const PLOT_THREAD_STATUS = {
  PENDING: '待解',
  ACTIVE: '进行中',
  RESOLVED: '已解决',
  ABANDONED: '废弃'
};

const CHARACTER_ARC_STAGES = ['引入', '成长', '转折', '高潮', '结局'];

function _shortText(s, n) {
  return String(s || '').replace(/\s+/g, ' ').trim().slice(0, n || 80);
}

function _pushUnique(list, item, keyFn, maxLen) {
  keyFn = keyFn || function(x) { return x.key || x.text || JSON.stringify(x).slice(0, 60); };
  const key = keyFn(item);
  const idx = list.findIndex(function(x) { return keyFn(x) === key; });
  if (idx >= 0) {
    list[idx] = Object.assign({}, list[idx], item, { updatedAt: Date.now() });
  } else {
    list.push(Object.assign({}, item, { createdAt: Date.now(), updatedAt: Date.now() }));
  }
  if (maxLen && list.length > maxLen) list.splice(0, list.length - maxLen);
}

class PlotManager {
  constructor(options = {}) {
    this.options = Object.assign({
      maxPlotThreads: 100,
      maxCharStates: 80,
      maxCharArcs: 50,
      maxMemoryDebt: 80,
      maxChainConsistency: 80
    }, options);
  }

  update(work, chapterIdx, content) {
    if (!work.longMemory) return;
    const lm = work.longMemory;

    this._extractCharStates(lm, chapterIdx, content);
    this._extractPlotThreads(lm, chapterIdx, content);
    this._updateCharArcs(lm, chapterIdx, content);
    this._updateMemoryDebt(lm, chapterIdx);
    this._detectFactions(lm, chapterIdx, content);
  }

  _extractCharStates(lm, chapterIdx, content) {
    if (!lm.charStates) lm.charStates = [];
    if (!content) return;

    const sentences = content.split(/[。！？\n]+/).filter(s => s.trim().length > 5);
    const stateKeywords = {
      '重伤': ['重伤', '受伤', '昏迷', '吐血', '倒下', '濒死'],
      '突破': ['突破', '晋升', '进阶', '觉醒', '升级', '开窍'],
      '逃亡': ['逃亡', '追杀', '躲避', '潜逃', '隐藏身份'],
      '闭关': ['闭关', '修炼', '打坐', '疗伤', '静修'],
      '成婚': ['成婚', '成亲', '大婚', '拜堂', '嫁人', '娶妻'],
      '死亡': ['死亡', '身死', '陨落', '去世', '牺牲', '毙命'],
      '复活': ['复活', '重生', '还魂', '复生', '苏醒'],
      '背叛': ['背叛', '反水', '倒戈', '叛变', '出卖'],
      '归顺': ['归顺', '投降', '投诚', '归附', '臣服'],
      '拜师': ['拜师', '收徒', '师父', '弟子', '徒儿'],
      '夺权': ['夺权', '篡位', '登基', '继位', '称帝'],
      '被捕': ['被捕', '囚禁', '关押', '入狱', '被困']
    };

    sentences.forEach(s => {
      for (const [state, keywords] of Object.entries(stateKeywords)) {
        for (const kw of keywords) {
          if (s.includes(kw)) {
            const charNames = this._extractCharacterNames(s, lm);
            charNames.forEach(name => {
              const ns = {
                name,
                state,
                chapterIdx,
                detail: _shortText(s, 60),
                status: 'active'
              };
              _pushUnique(lm.charStates, ns, x => x.name + ':' + x.state + ':' + x.chapterIdx, this.options.maxCharStates);
            });
            break;
          }
        }
      }
    });
  }

  _extractCharacterNames(sentence, lm) {
    const names = [];
    if (lm.charRoles) {
      Object.keys(lm.charRoles).forEach(name => {
        if (sentence.includes(name) && !names.includes(name)) {
          names.push(name);
        }
      });
    }
    if (lm.characterProfiles) {
      Object.keys(lm.characterProfiles).forEach(name => {
        if (sentence.includes(name) && !names.includes(name)) {
          names.push(name);
        }
      });
    }
    return names.slice(0, 3);
  }

  _extractPlotThreads(lm, chapterIdx, content) {
    if (!lm.plotThreads) lm.plotThreads = [];
    if (!content) return;

    const sentences = content.split(/[。！？\n]+/).filter(s => s.trim().length > 8);
    const threadPatterns = [
      { type: '阴谋', keywords: ['阴谋', '计划', '密谋', '暗中', '策划', '圈套', '陷阱'] },
      { type: '秘密', keywords: ['秘密', '真相', '隐藏', '不为人知', '没有人知道', '未解之谜'] },
      { type: '复仇', keywords: ['报仇', '复仇', '血债', '血仇', '血海深仇', '报仇雪恨'] },
      { type: '寻找', keywords: ['寻找', '找寻', '搜寻', '追查', '调查', '探寻'] },
      { type: '争夺', keywords: ['争夺', '抢夺', '夺取', '争抢', '夺宝', '抢'] },
      { type: '修炼', keywords: ['修炼', '突破', '晋升', '修炼', '闭关', '悟道'] },
      { type: '救援', keywords: ['救援', '营救', '救出', '拯救', '救', '解救'] }
    ];

    sentences.forEach(s => {
      for (const pattern of threadPatterns) {
        for (const kw of pattern.keywords) {
          if (s.includes(kw)) {
            const thread = {
              id: 'pt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              type: pattern.type,
              text: _shortText(s, 80),
              chapterIdx,
              status: PLOT_THREAD_STATUS.PENDING,
              strength: 'normal',
              relatedCharacters: this._extractCharacterNames(s, lm)
            };
            _pushUnique(lm.plotThreads, thread, x => x.text + ':' + x.chapterIdx, this.options.maxPlotThreads);
            break;
          }
        }
      }
    });
  }

  _updateCharArcs(lm, chapterIdx, content) {
    if (!lm.charArcs) lm.charArcs = [];
    if (!content) return;

    const names = this._extractCharacterNames(content, lm);
    const arcKeywords = [
      { stage: '引入', words: ['第一次', '初见', '初次', '认识了', '结识'] },
      { stage: '成长', words: ['成长', '进步', '提升', '变强', '成熟', '蜕变'] },
      { stage: '转折', words: ['转折', '变故', '没想到', '谁知', '岂料', '剧变'] },
      { stage: '高潮', words: ['决战', '大战', '最终', '高潮', '对决', '生死'] },
      { stage: '结局', words: ['结局', '终章', '最后', '落幕', '完结', '终局'] }
    ];

    names.forEach(name => {
      let currentStage = '引入';
      const existing = lm.charArcs.find(c => c.name === name);
      if (existing) currentStage = existing.stage;

      const sentences = content.split(/[。！？\n]+/).filter(s => s.includes(name));
      sentences.forEach(s => {
        for (const arc of arcKeywords) {
          if (arc.words.some(w => s.includes(w))) {
            const stageIdx = CHARACTER_ARC_STAGES.indexOf(arc.stage);
            const currentIdx = CHARACTER_ARC_STAGES.indexOf(currentStage);
            if (stageIdx > currentIdx) {
              currentStage = arc.stage;
            }
            break;
          }
        }
      });

      const arcEntry = {
        name,
        arc: currentStage,
        chapterIdx,
        updatedAt: Date.now()
      };

      const idx = lm.charArcs.findIndex(c => c.name === name);
      if (idx >= 0) {
        lm.charArcs[idx] = arcEntry;
      } else {
        lm.charArcs.push(arcEntry);
      }

      if (lm.charArcs.length > this.options.maxCharArcs) {
        lm.charArcs = lm.charArcs.slice(-this.options.maxCharArcs);
      }
    });
  }

  _updateMemoryDebt(lm, chapterIdx) {
    if (!lm.memoryDebt) lm.memoryDebt = [];

    const debts = [];

    if (lm.foreshadowLedger) {
      lm.foreshadowLedger.forEach(fs => {
        if (fs.status === '未解') {
          const age = chapterIdx - (fs.chapterIdx || 0);
          if (age >= 10) {
            debts.push({
              id: fs.id || ('debt_fs_' + Math.random()),
              type: '伏笔',
              text: _shortText(fs.text, 50),
              chapterIdx: fs.chapterIdx,
              age,
              level: age > 30 ? 'high' : (age > 20 ? 'medium' : 'low'),
              source: 'foreshadow'
            });
          }
        }
      });
    }

    if (lm.plotThreads) {
      lm.plotThreads.forEach(pt => {
        if (pt.status === PLOT_THREAD_STATUS.PENDING || pt.status === PLOT_THREAD_STATUS.ACTIVE) {
          const age = chapterIdx - (pt.chapterIdx || 0);
          if (age >= 15) {
            debts.push({
              id: pt.id || ('debt_pt_' + Math.random()),
              type: '线索-' + pt.type,
              text: _shortText(pt.text, 50),
              chapterIdx: pt.chapterIdx,
              age,
              level: pt.strength === 'high' ? 'high' : 'medium',
              source: 'plotThread'
            });
          }
        }
      });
    }

    if (lm.memoryAnchors && lm.memoryAnchors.promises) {
      lm.memoryAnchors.promises.forEach(p => {
        if (p.status !== '失效' && p.status !== 'resolved') {
          const age = chapterIdx - (p.chapterIdx || 0);
          if (age >= 20) {
            debts.push({
              id: 'debt_promise_' + Math.random(),
              type: '承诺',
              text: _shortText(p.text, 50),
              chapterIdx: p.chapterIdx,
              age,
              level: p.urgent ? 'high' : 'low',
              source: 'promise'
            });
          }
        }
      });
    }

    debts.sort((a, b) => {
      const levelOrder = { high: 0, medium: 1, low: 2 };
      const la = levelOrder[a.level] || 2;
      const lb = levelOrder[b.level] || 2;
      if (la !== lb) return la - lb;
      return b.age - a.age;
    });

    lm.memoryDebt = debts.slice(0, this.options.maxMemoryDebt);

    if (lm._memoryMeta) {
      lm._memoryMeta.activeDebt = lm.memoryDebt.filter(d => d.level === 'high').length;
    }
  }

  _detectFactions(lm, chapterIdx, content) {
    if (!lm.factionGraph) lm.factionGraph = {};
    if (!content) return;

    const factionKeywords = ['家族', '宗门', '教派', '门派', '势力', '组织', '王朝', '帝国', '商会', '世家', '山庄', '阁', '楼', '殿', '宫', '院', '盟', '会', '军', '营'];
    const relationKeywords = ['敌对', '结盟', '友好', '中立', '臣服', '统治', '附属', '合作', '联姻', '世仇'];

    const sentences = content.split(/[。！？\n]+/).filter(s => s.trim().length > 6);

    sentences.forEach(s => {
      factionKeywords.forEach(kw => {
        const pattern = new RegExp('([\\u4e00-\\u9fa5]{2,6})' + kw);
        const match = s.match(pattern);
        if (match) {
          const factionName = match[1] + kw;
          if (factionName.length >= 3 && factionName.length <= 10) {
            if (!lm.factionGraph[factionName]) {
              lm.factionGraph[factionName] = {
                name: factionName,
                type: kw,
                firstChapter: chapterIdx,
                lastSeen: chapterIdx,
                status: 'active',
                members: [],
                relations: {},
                description: ''
              };
            } else {
              lm.factionGraph[factionName].lastSeen = chapterIdx;
            }

            const faction = lm.factionGraph[factionName];
            const charNames = this._extractCharacterNames(s, lm);
            charNames.forEach(name => {
              if (!faction.members.includes(name)) {
                faction.members.push(name);
              }
            });

            relationKeywords.forEach(rk => {
              if (s.includes(rk)) {
                const otherFactions = Object.keys(lm.factionGraph).filter(n => n !== factionName && s.includes(n));
                otherFactions.forEach(other => {
                  if (!faction.relations[other] || faction.relations[other].updatedAt < Date.now() - 1000) {
                    faction.relations[other] = {
                      type: rk,
                      chapterIdx,
                      updatedAt: Date.now()
                    };
                    if (lm.factionGraph[other]) {
                      lm.factionGraph[other].relations = lm.factionGraph[other].relations || {};
                      lm.factionGraph[other].relations[factionName] = {
                        type: rk,
                        chapterIdx,
                        updatedAt: Date.now()
                      };
                    }
                  }
                });
              }
            });
          }
        }
      });
    });
  }

  addChainConsistency(work, report) {
    if (!work.longMemory) return;
    const lm = work.longMemory;
    if (!lm.chainConsistency) lm.chainConsistency = [];

    lm.chainConsistency.push({
      ...report,
      timestamp: Date.now()
    });

    if (lm.chainConsistency.length > this.options.maxChainConsistency) {
      lm.chainConsistency = lm.chainConsistency.slice(-this.options.maxChainConsistency);
    }
  }

  getCharStates(work, opts = {}) {
    if (!work.longMemory || !work.longMemory.charStates) return [];
    let states = [...work.longMemory.charStates];

    if (opts.name) {
      states = states.filter(s => s.name === opts.name);
    }
    if (opts.state) {
      states = states.filter(s => s.state === opts.state);
    }

    states.sort((a, b) => b.chapterIdx - a.chapterIdx);
    if (opts.limit) states = states.slice(0, opts.limit);
    return states;
  }

  getPlotThreads(work, opts = {}) {
    if (!work.longMemory || !work.longMemory.plotThreads) return [];
    let threads = [...work.longMemory.plotThreads];

    if (opts.status) {
      threads = threads.filter(t => t.status === opts.status);
    }
    if (opts.type) {
      threads = threads.filter(t => t.type === opts.type);
    }

    threads.sort((a, b) => b.chapterIdx - a.chapterIdx);
    if (opts.limit) threads = threads.slice(0, opts.limit);
    return threads;
  }

  getCharArcs(work) {
    if (!work.longMemory || !work.longMemory.charArcs) return [];
    return work.longMemory.charArcs;
  }

  getMemoryDebt(work, level = null) {
    if (!work.longMemory || !work.longMemory.memoryDebt) return [];
    let debts = [...work.longMemory.memoryDebt];
    if (level) {
      debts = debts.filter(d => d.level === level);
    }
    return debts;
  }

  getFactions(work, opts = {}) {
    if (!work.longMemory || !work.longMemory.factionGraph) return [];
    const factions = Object.values(work.longMemory.factionGraph);

    if (opts.sortBy === 'lastSeen') {
      factions.sort((a, b) => b.lastSeen - a.lastSeen);
    } else if (opts.sortBy === 'members') {
      factions.sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0));
    }

    if (opts.limit) return factions.slice(0, opts.limit);
    return factions;
  }

  getContext(work, chapterIdx, opts = {}) {
    const context = { text: '', sections: {} };
    const lines = [];

    const highDebts = this.getMemoryDebt(work, 'high').slice(0, 5);
    if (highDebts.length > 0) {
      lines.push('【记忆债务（需尽快兑现）】');
      highDebts.forEach(d => {
        lines.push(`  [${d.type}] ${d.text}（已悬${d.age}章）`);
      });
      lines.push('');
      context.sections.memoryDebt = highDebts;
    }

    const activeThreads = this.getPlotThreads(work, { status: '进行中', limit: 5 });
    const pendingThreads = this.getPlotThreads(work, { status: '待解', limit: 5 });
    if (activeThreads.length > 0 || pendingThreads.length > 0) {
      lines.push('【情节线索追踪】');
      if (activeThreads.length > 0) {
        lines.push('  进行中：');
        activeThreads.forEach(t => {
          lines.push(`    · [${t.type}] ${t.text}`);
        });
      }
      if (pendingThreads.length > 0) {
        lines.push('  待解：');
        pendingThreads.forEach(t => {
          lines.push(`    · [${t.type}] ${t.text}`);
        });
      }
      lines.push('');
      context.sections.plotThreads = { active: activeThreads, pending: pendingThreads };
    }

    const charArcs = this.getCharArcs(work).slice(0, 8);
    if (charArcs.length > 0) {
      lines.push('【角色弧线进度】');
      charArcs.forEach(c => {
        lines.push(`  ${c.name}：${c.arc}（第${c.chapterIdx + 1}章更新）`);
      });
      lines.push('');
      context.sections.charArcs = charArcs;
    }

    const factions = this.getFactions(work, { sortBy: 'lastSeen', limit: 6 });
    if (factions.length > 0) {
      lines.push('【势力图谱】');
      factions.forEach(f => {
        const memberStr = f.members && f.members.length > 0 ? `（成员：${f.members.slice(0, 3).join('、')}）` : '';
        lines.push(`  ${f.name}${memberStr}`);
      });
      lines.push('');
      context.sections.factions = factions;
    }

    context.text = lines.join('\n');
    return context;
  }

  getStats(work) {
    if (!work.longMemory) return {};
    const lm = work.longMemory;
    return {
      charStates: lm.charStates ? lm.charStates.length : 0,
      plotThreads: lm.plotThreads ? lm.plotThreads.length : 0,
      charArcs: lm.charArcs ? lm.charArcs.length : 0,
      memoryDebt: lm.memoryDebt ? lm.memoryDebt.length : 0,
      highDebt: lm.memoryDebt ? lm.memoryDebt.filter(d => d.level === 'high').length : 0,
      factions: lm.factionGraph ? Object.keys(lm.factionGraph).length : 0,
      chainConsistency: lm.chainConsistency ? lm.chainConsistency.length : 0
    };
  }
}

PlotManager.PLOT_THREAD_STATUS = PLOT_THREAD_STATUS;
PlotManager.CHARACTER_ARC_STAGES = CHARACTER_ARC_STAGES;

module.exports = PlotManager;
