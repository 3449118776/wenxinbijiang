const CHAR_ROLE_WEIGHT = {
  '主角': { weight: 5, maxAnchors: 30, label: '主角', neverForget: true },
  '女主': { weight: 4, maxAnchors: 25, label: '女主', neverForget: true },
  '男主': { weight: 4, maxAnchors: 25, label: '男主', neverForget: true },
  '反派': { weight: 4, maxAnchors: 20, label: '反派', neverForget: false },
  '配角': { weight: 3, maxAnchors: 15, label: '配角', neverForget: false },
  '导师': { weight: 3, maxAnchors: 12, label: '导师', neverForget: false },
  '伙伴': { weight: 3, maxAnchors: 12, label: '伙伴', neverForget: false },
  '龙套': { weight: 1, maxAnchors: 5, label: '龙套', neverForget: false }
};

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

function extractCharNameMap(charsText) {
  const map = { names: [], aliasMap: {}, roles: {} };
  if (!charsText) return map;

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

class CharacterManager {
  constructor(options = {}) {
    this.options = Object.assign({
      maxMilestones: 30,
      maxRelationships: 20,
      maxItems: 15
    }, options);
  }

  update(work, chapterIdx, content, characters = []) {
    if (!work.longMemory) return;
    const lm = work.longMemory;
    if (!lm.characterProfiles) lm.characterProfiles = {};

    const charMap = extractCharNameMap(work.chars || '');
    const names = charMap.names || [];

    characters.forEach(ch => {
      if (ch.name && !names.includes(ch.name)) {
        names.push(ch.name);
      }
      if (ch.role && charMap.roles) {
        charMap.roles[ch.name] = ch.role;
      }
    });

    const sentences = (content || '').split(/[。！？\n]+/).map(function(s) { return s.trim(); }).filter(Boolean);

    names.forEach(function(name) {
      if (!name || name === '主角' || content.indexOf(name) < 0) return;

      if (!lm.characterProfiles[name]) {
        lm.characterProfiles[name] = {
          name: name,
          firstChapter: chapterIdx,
          lastSeen: chapterIdx,
          status: '正常',
          location: '',
          emotion: '',
          relationships: [],
          items: [],
          milestones: [],
          aliases: [],
          role: charMap.roles[name] || '龙套'
        };
      }

      const p = lm.characterProfiles[name];
      p.lastSeen = chapterIdx;
      if (!p.role) p.role = charMap.roles[name] || '龙套';

      const statePatterns = {
        status: ['突破', '晋升', '觉醒', '重伤', '死亡', '复活', '背叛', '归顺', '成婚', '拜师', '夺权', '登基', '封侯', '被捕', '逃亡'],
        relationship: ['救了', '欠', '结盟', '联手', '背叛', '敌对', '仇', '喜欢', '保护', '怀疑', '信任', '决裂', '和解'],
        items: ['得到', '拿到', '交给', '夺走', '抢走', '藏起', '丢失', '归还']
      };
      const itemKeywords = ['剑', '刀', '枪', '信', '令牌', '玉佩', '钥匙', '药', '丹', '卷轴', '账册', '地图', '匣', '戒指', '兵符', '密信', '玉玺', '虎符', '印章', '遗书'];

      sentences.forEach(function(s) {
        if (s.indexOf(name) < 0) return;

        for (const kw of statePatterns.status) {
          if (s.includes(kw)) {
            p.status = kw;
            _pushUnique(p.milestones, {
              chapterIdx: chapterIdx,
              text: _shortText(s, 90)
            }, function(x) { return x.chapterIdx + ':' + x.text.slice(0, 20); }, this.options.maxMilestones);
            break;
          }
        }

        for (const kw of statePatterns.relationship) {
          if (s.includes(kw)) {
            _pushUnique(p.relationships, {
              chapterIdx: chapterIdx,
              text: _shortText(s, 90)
            }, function(x) { return x.chapterIdx + ':' + x.text.slice(0, 24); }, this.options.maxRelationships);
            break;
          }
        }

        for (const kw of statePatterns.items) {
          if (s.includes(kw)) {
            for (const ik of itemKeywords) {
              if (s.includes(ik)) {
                _pushUnique(p.items, {
                  chapterIdx: chapterIdx,
                  text: _shortText(s, 90),
                  item: ik
                }, function(x) { return x.chapterIdx + ':' + x.text.slice(0, 24); }, this.options.maxItems);
                break;
              }
            }
            break;
          }
        }
      }.bind(this));
    }.bind(this));

    if (!lm.charRoles) lm.charRoles = {};
    Object.assign(lm.charRoles, charMap.roles || {});
  }

  get(work, name) {
    if (!work.longMemory || !work.longMemory.characterProfiles) return null;
    return work.longMemory.characterProfiles[name] || null;
  }

  list(work, opts = {}) {
    if (!work.longMemory || !work.longMemory.characterProfiles) return [];

    let characters = Object.values(work.longMemory.characterProfiles);

    if (opts.role) {
      characters = characters.filter(c => c.role === opts.role);
    }

    if (opts.sortBy === 'lastSeen') {
      characters.sort((a, b) => b.lastSeen - a.lastSeen);
    } else if (opts.sortBy === 'role') {
      const roleOrder = ['主角', '女主', '男主', '反派', '导师', '伙伴', '配角', '龙套'];
      characters.sort((a, b) => {
        const aIdx = roleOrder.indexOf(a.role || '龙套');
        const bIdx = roleOrder.indexOf(b.role || '龙套');
        return aIdx - bIdx;
      });
    } else {
      characters.sort((a, b) => a.firstChapter - b.firstChapter);
    }

    if (opts.limit) {
      characters = characters.slice(0, opts.limit);
    }

    return characters;
  }

  search(work, query) {
    if (!query || !work.longMemory || !work.longMemory.characterProfiles) return [];
    const results = [];
    const queryLower = query.toLowerCase();

    Object.values(work.longMemory.characterProfiles).forEach(char => {
      let score = 0;
      const name = char.name || '';
      if (name.toLowerCase().includes(queryLower)) {
        score = 10;
        if (name.toLowerCase().startsWith(queryLower)) score += 2;
      }

      if (char.milestones) {
        char.milestones.forEach(m => {
          if (m.text && m.text.toLowerCase().includes(queryLower)) {
            score = Math.max(score, 6);
          }
        });
      }

      if (score > 0) {
        const roleInfo = CHAR_ROLE_WEIGHT[char.role] || { weight: 1 };
        score += roleInfo.weight * 0.5;
        results.push({ character: char, score });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 10);
  }

  getContext(work, chapterIdx, opts = {}) {
    const context = { text: '', characters: [] };
    if (!work.longMemory || !work.longMemory.characterProfiles) return context;

    const characters = this.list(work, { sortBy: 'role', limit: opts.maxItems || 10 });
    context.characters = characters;

    if (characters.length === 0) return context;

    const lines = ['【角色状态】'];
    characters.forEach(char => {
      let line = `  [${char.role || '龙套'}] ${char.name}`;
      if (char.status && char.status !== '正常') line += `：${char.status}`;
      if (char.lastSeen !== undefined) line += `（末登场：第${char.lastSeen + 1}章）`;
      lines.push(line);

      if (char.milestones && char.milestones.length > 0) {
        const recent = char.milestones.slice(-3);
        recent.forEach(m => {
          lines.push(`    · 第${m.chapterIdx + 1}章：${m.text}`);
        });
      }
    });
    lines.push('');
    context.text = lines.join('\n');

    return context;
  }

  getRoleWeight(name, charRoles) {
    if (!name) return 1;
    let role = '龙套';
    if (charRoles && charRoles[name]) role = charRoles[name];
    if (CHAR_ROLE_WEIGHT[role]) return CHAR_ROLE_WEIGHT[role].weight;
    return 1;
  }
}

CharacterManager.CHAR_ROLE_WEIGHT = CHAR_ROLE_WEIGHT;
CharacterManager.extractCharNameMap = extractCharNameMap;

module.exports = CharacterManager;
