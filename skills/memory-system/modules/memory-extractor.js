const MEMORY_TYPES = {
  '人物状态': { priority: 1, icon: '👤', bucket: 'characterTags' },
  '关键事件': { priority: 2, icon: '⚡', bucket: 'core' },
  '新角色': { priority: 2, icon: '🆕', bucket: 'characterTags' },
  '关系变化': { priority: 1, icon: '🔗', bucket: 'relationships' },
  '重要物品': { priority: 2, icon: '📦', bucket: 'items' },
  '地点转移': { priority: 3, icon: '📍', bucket: 'locations' },
  '伏笔悬念': { priority: 1, icon: '❓', bucket: 'hooks' },
  '角色动机': { priority: 2, icon: '🎯', bucket: 'core' },
  '情感线': { priority: 2, icon: '❤️', bucket: 'emotionTrack' },
  '能力变化': { priority: 1, icon: '💪', bucket: 'characterTags' },
  '能力代价': { priority: 2, icon: '⚡', bucket: 'abilityCosts' },
  '势力动态': { priority: 2, icon: '🏰', bucket: 'core' },
  '势力消亡': { priority: 1, icon: '💀', bucket: 'core' },
  '情绪转折': { priority: 2, icon: '😱', bucket: 'emotionTrack' },
  '时间线': { priority: 3, icon: '⏰', bucket: 'timeline' },
  '章节摘要': { priority: 4, icon: '📝', bucket: 'chapterContext' },
  '核心记忆点': { priority: 0, icon: '💎', bucket: 'core' },
  '场景细节': { priority: 3, icon: '🎬', bucket: 'scenes' },
  '对话线索': { priority: 2, icon: '💬', bucket: 'dialogues' },
  '承诺兑现': { priority: 1, icon: '🤝', bucket: 'promises' }
};

const TYPE_ALIASES = {
  '人物状态': ['人物状态', '状态变化', '角色状态', '身体状况', '状态'],
  '关键事件': ['关键事件', '重要事件', '事件', '情节', '剧情转折', '冲突'],
  '新角色': ['新角色', '新出场角色', '新人物', '出场角色'],
  '关系变化': ['关系变化', '人物关系', '关系', '关系转变'],
  '重要物品': ['重要物品', '物品', '道具', '线索', '信物', '武器'],
  '地点转移': ['地点转移', '地点', '场景', '位置'],
  '伏笔悬念': ['伏笔悬念', '伏笔', '悬念', '未解之谜'],
  '角色动机': ['角色动机', '动机', '目标', '计划'],
  '情感线': ['情感线', '感情', '情感', '爱情'],
  '能力变化': ['能力变化', '实力', '突破', '修炼'],
  '能力代价': ['能力代价', '代价', '反噬', '消耗', '副作用'],
  '势力动态': ['势力动态', '势力', '阵营', '势力变化'],
  '势力消亡': ['势力消亡', '势力覆灭', '势力灭亡', '灭门', '覆灭'],
  '情绪转折': ['情绪转折', '情绪变化', '心理转折', '心态转变'],
  '时间线': ['时间线', '时间', '时间节点'],
  '章节摘要': ['章节摘要', '摘要', '总结', '本章概括'],
  '核心记忆点': ['核心记忆点', '核心记忆', '记忆点', '后文必须', '不可更改'],
  '场景细节': ['场景细节', '场景', '环境细节', '感官', '氛围细节'],
  '对话线索': ['对话线索', '对话', '台词线索', '承诺线索', '暗示'],
  '承诺兑现': ['承诺兑现', '承诺', '约定', '发誓', '许诺', '诺言']
};

function normalizeMemoryType(raw) {
  for (const [standard, aliases] of Object.entries(TYPE_ALIASES)) {
    if (aliases.some(a => raw.includes(a))) return standard;
  }
  return '关键事件';
}

function extractCharacterNames(text, charsText = '') {
  const map = { names: [], aliasMap: {}, roles: {} };
  const roleKeywords = {
    '主角': ['主角', '男主', '女主', '主人公', '第一主角'],
    '女主': ['女主', '女主角', '女一'],
    '男主': ['男主', '男主角', '男一'],
    '反派': ['反派', '大反派', '最终boss', '敌人', '敌对', '对手', '幕后黑手'],
    '配角': ['配角', '次要角色', '重要配角'],
    '导师': ['导师', '师傅', '师父', '老师', '引路人'],
    '伙伴': ['伙伴', '队友', '同伴', '挚友', '兄弟', '姐妹'],
    '龙套': ['龙套', '路人', '次要', '背景', '小角色']
  };

  let currentRole = '配角';
  const lines = charsText.split('\n').filter(l => l.trim());
  lines.forEach(l => {
    let detectedRole = null;
    for (const [role, kws] of Object.entries(roleKeywords)) {
      for (const kw of kws) {
        const roleRe = new RegExp('(?:^|[【\\[（(])\\s*' + kw + '\\s*(?:[】\\]）)：:]|$)', 'i');
        if (roleRe.test(l)) { detectedRole = role; break; }
      }
      if (detectedRole) break;
    }
    if (detectedRole) currentRole = detectedRole;

    const m = l.match(/^([^：:：\s]{1,6})[：:：\s]/);
    if (m) {
      const name = m[1].trim();
      const allRoleWords = Object.values(roleKeywords).flat();
      if (allRoleWords.includes(name)) return;
      map.names.push(name);
      if (!map.roles[name]) {
        map.roles[name] = currentRole;
      } else {
        const roleOrder = ['主角', '女主', '男主', '反派', '导师', '伙伴', '配角', '龙套'];
        if (roleOrder.indexOf(currentRole) < roleOrder.indexOf(map.roles[name])) {
          map.roles[name] = currentRole;
        }
      }
      if (name.length >= 2) {
        const sur = name[0];
        if (!map.aliasMap[sur]) map.aliasMap[sur] = { main: name, type: 'surname' };
      }
    }
  });

  const speakerPattern = /([^\s""''「」]{2,4})(?:说|道|喊|叫|喝|问|答)/g;
  const speakers = new Set();
  let m;
  while ((m = speakerPattern.exec(text)) !== null) {
    speakers.add(m[1]);
  }
  speakers.forEach(s => {
    if (!map.names.includes(s) && s.length >= 2 && s.length <= 4) {
      map.names.push(s);
      if (!map.roles[s]) map.roles[s] = '龙套';
    }
  });

  if (map.names.length === 0) map.names.push('主角');
  if (!map.roles[map.names[0]]) map.roles[map.names[0]] = '主角';
  map.aliasMap['他'] = { main: map.names[0], type: 'pronoun' };
  if (map.names.length > 1) {
    map.aliasMap['她'] = { main: map.names[1], type: 'pronoun' };
  } else {
    map.aliasMap['她'] = { main: map.names[0], type: 'pronoun' };
  }
  map.aliasMap['我'] = { main: map.names[0], type: 'pronoun' };

  return map;
}

function extractForeshadows(text, chapterIdx) {
  const foreshadows = [];
  const foreshadowTypes = {
    identity: { label: '身份类', keywords: ['真实身份', '身世秘密', '血脉', '血统', '家族', '被抹去的名字', '其实是', '真正是', '本名', '身世'] },
    power: { label: '能力类', keywords: ['隐藏能力', '未觉醒', '未完成的修炼', '真正用途', '尚未动用', '底牌', '杀手锏', '未施展'] },
    relationship: { label: '关系类', keywords: ['秘密', '过去恩怨', '未公开的关系', '背叛', '忠诚', '其实', '私下', '暗中', '早已相识'] },
    plot: { label: '剧情类', keywords: ['某个大阴谋', '幕后黑手', '未揭示的真相', '历史谜团', '谁也不知道', '真相是', '原来如此'] },
    item: { label: '物品类', keywords: ['玉佩', '信物', '残片', '钥匙', '卷轴', '来历', '物件', '法宝', '古物', '印记'] },
    world: { label: '世界观类', keywords: ['某地的秘密', '规则漏洞', '被遗忘的历史', '禁制的真相', '无人知晓', '传说中', '早已失传'] },
    promise: { label: '承诺类', keywords: ['口头约定', '未兑现誓言', '约定的日子', '要去的地方', '若有朝一日', '等到那时', '约定'] },
    injury: { label: '暗伤类', keywords: ['旧伤', '未治愈的暗疾', '修炼隐患', '精神创伤', '旧疾', '暗伤', '隐患', '心魔'] }
  };

  const suspenseWords = ['似乎', '好像', '仿佛', '隐约', '若有所思', '若有所觉', '不知道', '不会想到', '未曾料到', '日后', '将来', '某一天', '后来'];
  const sentences = text.split(/[。！？\n]+/).filter(s => s.trim().length > 5);

  sentences.forEach((sentence, idx) => {
    for (const [type, info] of Object.entries(foreshadowTypes)) {
      for (const kw of info.keywords) {
        if (sentence.includes(kw)) {
          const hasSuspense = suspenseWords.some(w => sentence.includes(w));
          foreshadows.push({
            type,
            label: info.label,
            text: sentence.trim().slice(0, 100),
            chapterIdx,
            status: '未解',
            strength: hasSuspense ? 'high' : 'normal',
            sentenceIdx: idx
          });
          break;
        }
      }
    }
  });

  const uniqueForeshadows = [];
  const seen = new Set();
  foreshadows.forEach(f => {
    const key = f.type + '::' + f.text.slice(0, 30);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueForeshadows.push(f);
    }
  });

  return uniqueForeshadows.slice(0, 20);
}

function extractItems(text, chapterIdx) {
  const items = [];
  const itemKeywords = ['剑', '刀', '枪', '信', '令牌', '玉佩', '钥匙', '药', '丹', '卷轴', '账册', '地图', '匣', '戒指', '兵符', '密信', '玉玺', '虎符', '印章', '遗书'];
  const actionKeywords = ['得到', '获得', '拿到', '夺走', '抢走', '交给', '藏起', '收起', '丢失', '遗失', '归还', '留下'];

  const re = new RegExp('(' + actionKeywords.join('|') + ').{0,20}(' + itemKeywords.join('|') + ')', 'g');
  let m;
  while ((m = re.exec(text)) !== null) {
    const full = m[0].slice(0, 80);
    const itemName = m[2];
    items.push({
      name: itemName,
      action: m[1],
      text: full,
      chapterIdx,
      status: /丢失|遗失/.test(m[1]) ? '遗失' : (/归还|交给/.test(m[1]) ? '已转交' : '持有中')
    });
  }

  return items.slice(0, 15);
}

function extractLocations(text, chapterIdx) {
  const locations = [];
  const placePattern = /(?:来到|到达|离开|前往|回到|进入|走出)([^\n，。！？]{2,10})/g;
  let m;
  while ((m = placePattern.exec(text)) !== null) {
    const place = m[1].trim();
    if (place.length >= 2 && place.length <= 10) {
      locations.push({
        name: place,
        action: m[0].substring(0, 2),
        chapterIdx,
        text: m[0]
      });
    }
  }
  return [...new Set(locations.map(l => l.name))].map(name => {
    const loc = locations.find(l => l.name === name);
    return loc;
  }).slice(0, 10);
}

function extractTimeline(text, chapterIdx) {
  const events = [];
  const timePatterns = [
    /(三天后|七天后|十日后|一个月后|一年后|三年后|十年后|几日后|数月后|数年后)/g,
    /(第二天|次日|翌日|三日后|五日后)/g,
    /(三年前|十年前|二十年前|百年前|千年前|数万年前)/g,
    /(黎明|清晨|傍晚|深夜|午夜|正午|黄昏|拂晓|破晓)/g
  ];

  timePatterns.forEach(pattern => {
    let m;
    while ((m = pattern.exec(text)) !== null) {
      events.push({
        time: m[0],
        chapterIdx,
        text: m[0]
      });
    }
  });

  return events.slice(0, 10);
}

class MemoryExtractor {
  constructor(options = {}) {
    this.options = Object.assign({
      enableDeepExtract: false,
      maxMemoriesPerChapter: 30,
      language: 'zh'
    }, options);
  }

  extract(work, chapterIdx, content) {
    const result = {
      total: 0,
      categories: {},
      memories: [],
      characters: [],
      foreshadows: [],
      items: [],
      locations: [],
      timeline: []
    };

    if (!content || content.trim().length < 50) return result;

    const charMap = extractCharacterNames(content, work.chars || '');
    result.characters = charMap.names.map(name => ({
      name,
      role: charMap.roles[name] || '龙套',
      chapterIdx
    }));

    result.foreshadows = extractForeshadows(content, chapterIdx);
    result.items = extractItems(content, chapterIdx);
    result.locations = extractLocations(content, chapterIdx);
    result.timeline = extractTimeline(content, chapterIdx);

    const summary = this._extractSummary(content, chapterIdx);
    if (summary) {
      result.memories.push({
        type: '章节摘要',
        content: summary,
        chapterIdx,
        priority: MEMORY_TYPES['章节摘要'].priority
      });
      result.categories['章节摘要'] = 1;
    }

    const coreEvents = this._extractCoreEvents(content, chapterIdx);
    coreEvents.forEach(evt => {
      result.memories.push(evt);
      result.categories[evt.type] = (result.categories[evt.type] || 0) + 1;
    });

    const characterStates = this._extractCharacterStates(content, charMap, chapterIdx);
    characterStates.forEach(state => {
      result.memories.push(state);
      result.categories[state.type] = (result.categories[state.type] || 0) + 1;
    });

    result.total = result.memories.length;

    this._saveToWork(work, chapterIdx, result);

    return result;
  }

  _extractSummary(content, chapterIdx) {
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
    return summary.slice(0, 300);
  }

  _extractCoreEvents(content, chapterIdx) {
    const events = [];
    const sentences = content.split(/[。！？\n]+/).filter(s => s.trim().length > 8);
    const eventKeywords = ['突破', '觉醒', '战败', '击败', '杀死', '死亡', '复活', '背叛', '结盟', '表白', '决裂', '成婚', '拜师', '夺权', '登基', '封侯', '被捕', '逃亡', '发现', '揭露'];

    sentences.forEach(s => {
      for (const kw of eventKeywords) {
        if (s.includes(kw)) {
          events.push({
            type: '核心记忆点',
            content: s.trim().slice(0, 80),
            chapterIdx,
            priority: 0
          });
          break;
        }
      }
    });

    return events.slice(0, 5);
  }

  _extractCharacterStates(content, charMap, chapterIdx) {
    const states = [];
    const stateWords = ['受伤', '突破', '愤怒', '震惊', '昏迷', '逃亡', '战斗', '危险', '重伤', '觉醒', '中毒', '胜利', '崩溃', '紧张', '恐惧', '兴奋', '坚定', '犹豫', '绝望', '释然', '悔恨', '愧疚'];

    charMap.names.forEach(name => {
      const nameRe = new RegExp(name, 'g');
      const matches = content.match(nameRe);
      if (!matches || matches.length < 1) return;

      const sentences = content.split(/[。！？\n]+/);
      for (const s of sentences) {
        if (!s.includes(name)) continue;
        for (const sw of stateWords) {
          if (s.includes(sw)) {
            states.push({
              type: '人物状态',
              content: `${name}：${sw}（${s.trim().slice(0, 50)}）`,
              chapterIdx,
              priority: 1,
              character: name,
              charRole: charMap.roles[name] || '龙套'
            });
            break;
          }
        }
        if (states.length >= 10) break;
      }
    });

    return states;
  }

  _saveToWork(work, chapterIdx, extractResult) {
    if (!work.longMemory) return;
    const lm = work.longMemory;

    extractResult.memories.forEach(mem => {
      const typeInfo = MEMORY_TYPES[mem.type] || MEMORY_TYPES['关键事件'];
      const bucket = typeInfo.bucket || 'core';
      if (!lm.memoryAnchors[bucket]) lm.memoryAnchors[bucket] = [];

      const exists = lm.memoryAnchors[bucket].some(a =>
        a.text === mem.content && a.chapterIdx === chapterIdx
      );
      if (!exists) {
        lm.memoryAnchors[bucket].push({
          text: mem.content,
          chapterIdx,
          status: 'active',
          level: mem.priority <= 1 ? 'high' : 'normal',
          urgent: mem.priority === 0,
          charRole: mem.charRole || null,
          character: mem.character || null,
          source: 'auto-extractor',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
    });

    extractResult.foreshadows.forEach(fs => {
      if (!lm.foreshadowLedger) lm.foreshadowLedger = [];
      const exists = lm.foreshadowLedger.some(f =>
        f.text === fs.text && f.chapterIdx === chapterIdx
      );
      if (!exists) {
        lm.foreshadowLedger.push({
          id: 'fs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          ...fs,
          createdAt: Date.now()
        });
      }
    });

    extractResult.items.forEach(item => {
      if (!lm.itemLedger) lm.itemLedger = {};
      if (!lm.itemLedger[item.name]) {
        lm.itemLedger[item.name] = {
          name: item.name,
          owner: '未知',
          status: item.status,
          history: [],
          lastChapter: chapterIdx
        };
      }
      const ledger = lm.itemLedger[item.name];
      ledger.status = item.status;
      ledger.lastChapter = chapterIdx;
      const historyEntry = { chapterIdx, action: item.action, text: item.text };
      const exists = ledger.history.some(h =>
        h.chapterIdx === chapterIdx && h.text === item.text
      );
      if (!exists) {
        ledger.history.push(historyEntry);
        if (ledger.history.length > 20) ledger.history.shift();
      }
    });

    extractResult.timeline.forEach(evt => {
      if (!lm.timelineEvents) lm.timelineEvents = [];
      const exists = lm.timelineEvents.some(t =>
        t.time === evt.time && t.chapterIdx === chapterIdx
      );
      if (!exists) {
        lm.timelineEvents.push({
          ...evt,
          createdAt: Date.now()
        });
      }
    });
  }
}

MemoryExtractor.MEMORY_TYPES = MEMORY_TYPES;
MemoryExtractor.normalizeMemoryType = normalizeMemoryType;
MemoryExtractor.extractCharacterNames = extractCharacterNames;
MemoryExtractor.extractForeshadows = extractForeshadows;

module.exports = MemoryExtractor;
