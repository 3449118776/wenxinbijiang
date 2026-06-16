/* 文心笔匠 v2 增强引擎 - 伏笔网络引擎 */
// 全生命周期伏笔管理：识别、关联、追踪回收、健康度评分、建议布局
// 独立模块，可直接 <script> 引入，不依赖其他文件
// 全局对象：ForeshadowNetworkEngine

var ForeshadowNetworkEngine = {

  // 8种伏笔类型及其关键词模板
  FORESHADOW_TYPES: {
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
  },

  // 回收信号词：出现在关键词附近即视为"回收"语境
  RECOVERY_SIGNAL_WORDS: ['原来', '果然', '终于', '真相是', '这一刻', '竟是', '居然', '直到此时', '此刻才', '回想起', '想起了', '忆起', '不出所料', '谁能想到'],

  // 身份反转模式（人设反向识别）
  CHARACTER_REVERSE_PATTERNS: [
    '主角隐藏的',
    '实则是',
    '其实是',
    '真实身份是',
    '并非表面上',
    '他真正的',
    '他其实',
    '隐藏着',
    '暗中'
  ],

  // 世界观线索模式
  WORLD_CLUE_PATTERNS: [
    '无人知晓',
    '被遗忘',
    '传说中',
    '早已失传',
    '无人得知',
    '没有人知道',
    '未曾记载',
    '只在古籍中',
    '被封印的历史'
  ],

  // 悬念加强词（提升伏笔强度）
  SUSPENSE_WORDS: ['似乎', '好像', '仿佛', '隐约', '若有所思', '若有所觉', '不知道', '不会想到', '未曾料到', '日后', '将来', '某一天', '后来'],

  // 章节号解析（复用已有逻辑）
  _parseChapterNum: function (s) {
    if (!s) return 0;
    var numPattern = new RegExp('^\\d+$');
    if (numPattern.test(s)) return parseInt(s, 10);
    var map = { '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '百': 100, '千': 1000 };
    var result = 0, current = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (map[c] !== undefined) {
        if (map[c] >= 10) {
          result += (current || 1) * map[c];
          current = 0;
        } else {
          current = map[c];
        }
      }
    }
    result += current;
    return result || 0;
  },

  // 生成伏笔唯一ID
  _makeId: function (idx) {
    return 'fs_' + (idx < 10 ? '00' + idx : idx < 100 ? '0' + idx : idx);
  },

  // 提取文本中的"重要名词"作为关键词（中文：2-6字连续非标点字符）
  _extractKeywords: function (text) {
    if (!text) return [];
    var cleaned = text.replace(/[，。,、\.?!！？：:；;'"''""（()）【】《》\[\]\s\n\r]/g, ' ');
    var tokens = cleaned.split(' ').filter(function (t) { return t.length >= 2 && t.length <= 8; });
    var seen = {};
    var result = [];
    for (var i = 0; i < tokens.length; i++) {
      if (!seen[tokens[i]]) {
        seen[tokens[i]] = 1;
        result.push(tokens[i]);
      }
    }
    return result.slice(0, 8);
  },

  // 对一段文本识别其所属类型（匹配关键词最多的类型）
  _detectType: function (text) {
    var typeKeys = Object.keys(ForeshadowNetworkEngine.FORESHADOW_TYPES);
    var bestType = 'plot';
    var bestHit = 0;
    for (var i = 0; i < typeKeys.length; i++) {
      var kws = ForeshadowNetworkEngine.FORESHADOW_TYPES[typeKeys[i]].keywords;
      var hit = 0;
      for (var j = 0; j < kws.length; j++) {
        if (text.indexOf(kws[j]) >= 0) hit++;
      }
      if (hit > bestHit) {
        bestHit = hit;
        bestType = typeKeys[i];
      }
    }
    return { type: bestType, hit: bestHit };
  },

  // 估算伏笔强度（0-1）：关键词显著性 + 悬念词命中 + 文本长度
  _estimateStrength: function (text) {
    var base = 0.3;
    var kws = ForeshadowNetworkEngine._extractKeywords(text);
    base += Math.min(0.3, kws.length * 0.05);
    var suspenseHits = 0;
    for (var i = 0; i < ForeshadowNetworkEngine.SUSPENSE_WORDS.length; i++) {
      if (text.indexOf(ForeshadowNetworkEngine.SUSPENSE_WORDS[i]) >= 0) suspenseHits++;
    }
    base += Math.min(0.3, suspenseHits * 0.08);
    if (text.length >= 15) base += 0.05;
    if (text.length >= 30) base += 0.05;
    return Math.min(0.95, Math.max(0.1, base));
  },

  // ======= 方法 1: 从细纲/人设/世界观文本中自动识别伏笔 =======
  extractForeshadowsFromOutline: function (detailText, charText, worldText) {
    var results = [];
    var idCounter = 1;

    // --- 子步骤 A: 从细纲提取"伏笔：[xxx]"字段，并做章节定位 ---
    var lines = (detailText || '').split('\n');
    var currentChapter = 0;
    var chapterPattern = new RegExp('^\\s*第[一二三四五六七八九十百千\\d]+章');
    var explicitPattern = new RegExp('伏笔[：:]\\s*\\[?([^\\]\\n]+)\\]?');
    var keywordListAll = [];
    var typeKeys = Object.keys(ForeshadowNetworkEngine.FORESHADOW_TYPES);
    for (var ti = 0; ti < typeKeys.length; ti++) {
      keywordListAll = keywordListAll.concat(ForeshadowNetworkEngine.FORESHADOW_TYPES[typeKeys[ti]].keywords);
    }

    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      if (chapterPattern.test(line.trim())) {
        var cm = line.trim().match(new RegExp('第([一二三四五六七八九十百千\\d]+)章'));
        if (cm) currentChapter = ForeshadowNetworkEngine._parseChapterNum(cm[1]);
      }

      // 显式"伏笔："字段
      var fm = line.match(explicitPattern);
      if (fm && fm[1] && fm[1].trim().length > 3) {
        var rawText = fm[1].trim().slice(0, 120);
        var detect = ForeshadowNetworkEngine._detectType(rawText);
        var kws = ForeshadowNetworkEngine._extractKeywords(rawText);
        results.push({
          id: ForeshadowNetworkEngine._makeId(idCounter++),
          text: rawText,
          chapter: currentChapter,
          type: detect.type,
          keywords: kws,
          status: 'planted',
          plantedAt: currentChapter,
          lastReferencedAt: currentChapter,
          recoveredAt: null,
          references: [currentChapter],
          strength: ForeshadowNetworkEngine._estimateStrength(rawText),
          payoffEstimate: Math.min(0.95, ForeshadowNetworkEngine._estimateStrength(rawText) + 0.1),
          age: 0,
          isHot: false
        });
      }

      // 关键词组合扫描：命中≥2个类型关键词即视为一条隐含伏笔
      var hitList = [];
      for (var ki = 0; ki < keywordListAll.length; ki++) {
        if (line.indexOf(keywordListAll[ki]) >= 0) hitList.push(keywordListAll[ki]);
      }
      if (hitList.length >= 2 && line.length > 10 && line.length < 300) {
        var detect2 = ForeshadowNetworkEngine._detectType(line);
        var snippet = line.trim().slice(0, 120);
        var dup = false;
        for (var ri = 0; ri < results.length; ri++) {
          if (results[ri].chapter === currentChapter && results[ri].text.indexOf(snippet.slice(0, 15)) >= 0) {
            dup = true;
            break;
          }
        }
        if (!dup) {
          results.push({
            id: ForeshadowNetworkEngine._makeId(idCounter++),
            text: snippet,
            chapter: currentChapter,
            type: detect2.type,
            keywords: ForeshadowNetworkEngine._extractKeywords(snippet),
            status: 'planted',
            plantedAt: currentChapter,
            lastReferencedAt: currentChapter,
            recoveredAt: null,
            references: [currentChapter],
            strength: ForeshadowNetworkEngine._estimateStrength(snippet) * 0.85,
            payoffEstimate: ForeshadowNetworkEngine._estimateStrength(snippet),
            age: 0,
            isHot: false
          });
        }
      }
    }

    // --- 子步骤 B: 从人设文本扫描反向识别 ---
    if (charText) {
      var charLines = charText.split('\n');
      for (var ci = 0; ci < charLines.length; ci++) {
        var cl = charLines[ci];
        for (var pi = 0; pi < ForeshadowNetworkEngine.CHARACTER_REVERSE_PATTERNS.length; pi++) {
          if (cl.indexOf(ForeshadowNetworkEngine.CHARACTER_REVERSE_PATTERNS[pi]) >= 0 && cl.length > 10 && cl.length < 300) {
            var snippet3 = cl.trim().slice(0, 120);
            var detect3 = ForeshadowNetworkEngine._detectType(snippet3);
            results.push({
              id: ForeshadowNetworkEngine._makeId(idCounter++),
              text: snippet3,
              chapter: 0,
              type: detect3.type === 'plot' ? 'identity' : detect3.type,
              keywords: ForeshadowNetworkEngine._extractKeywords(snippet3),
              status: 'planted',
              plantedAt: 0,
              lastReferencedAt: 0,
              recoveredAt: null,
              references: [0],
              strength: ForeshadowNetworkEngine._estimateStrength(snippet3),
              payoffEstimate: ForeshadowNetworkEngine._estimateStrength(snippet3) + 0.1,
              age: 0,
              isHot: false
            });
            break;
          }
        }
      }
    }

    // --- 子步骤 C: 从世界观文本扫描线索 ---
    if (worldText) {
      var worldLines = worldText.split('\n');
      for (var wi = 0; wi < worldLines.length; wi++) {
        var wl = worldLines[wi];
        for (var wpi = 0; wpi < ForeshadowNetworkEngine.WORLD_CLUE_PATTERNS.length; wpi++) {
          if (wl.indexOf(ForeshadowNetworkEngine.WORLD_CLUE_PATTERNS[wpi]) >= 0 && wl.length > 10 && wl.length < 300) {
            var snippet4 = wl.trim().slice(0, 120);
            results.push({
              id: ForeshadowNetworkEngine._makeId(idCounter++),
              text: snippet4,
              chapter: 0,
              type: 'world',
              keywords: ForeshadowNetworkEngine._extractKeywords(snippet4),
              status: 'planted',
              plantedAt: 0,
              lastReferencedAt: 0,
              recoveredAt: null,
              references: [0],
              strength: ForeshadowNetworkEngine._estimateStrength(snippet4),
              payoffEstimate: ForeshadowNetworkEngine._estimateStrength(snippet4) + 0.05,
              age: 0,
              isHot: false
            });
            break;
          }
        }
      }
    }

    // 按 strength 降序排序
    results.sort(function (a, b) { return b.strength - a.strength; });
    return results;
  },

  // ======= 方法 2: 构建伏笔网络 =======
  buildNetwork: function (foreshadowList) {
    if (!foreshadowList || foreshadowList.length === 0) {
      return { nodes: [], edges: [], clusters: [], mainChain: [] };
    }
    var nodes = foreshadowList.slice();
    var edges = [];
    var seenPairs = {};

    // 边：两两做关键词重合度，共享≥2个关键词则建立连接
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var pairKey = nodes[i].id + '_' + nodes[j].id;
        if (seenPairs[pairKey]) continue;
        var sharedKws = [];
        var kwsA = nodes[i].keywords || [];
        var kwsB = nodes[j].keywords || [];
        for (var ki = 0; ki < kwsA.length; ki++) {
          for (var kj = 0; kj < kwsB.length; kj++) {
            if (kwsA[ki] === kwsB[kj] || kwsA[ki].indexOf(kwsB[kj]) >= 0 || kwsB[kj].indexOf(kwsA[ki]) >= 0) {
              sharedKws.push(kwsA[ki]);
              break;
            }
          }
        }
        if (sharedKws.length >= 2) {
          seenPairs[pairKey] = 1;
          edges.push({
            from: nodes[i].id,
            to: nodes[j].id,
            sharedKeywords: sharedKws.slice(0, 5),
            weight: Math.min(1.0, sharedKws.length / 3.0)
          });
        }
      }
    }

    // 按章节聚类：同一章出现的多条伏笔形成"伏笔簇"
    var clustersByChapter = {};
    for (var ci = 0; ci < nodes.length; ci++) {
      var ch = nodes[ci].chapter || 0;
      if (!clustersByChapter[ch]) clustersByChapter[ch] = [];
      clustersByChapter[ch].push(nodes[ci].id);
    }
    var clusters = [];
    var clusterKeys = Object.keys(clustersByChapter).sort(function (a, b) { return Number(a) - Number(b); });
    for (var cki = 0; cki < clusterKeys.length; cki++) {
      clusters.push({ chapter: Number(clusterKeys[cki]), ids: clustersByChapter[clusterKeys[cki]] });
    }

    // 主线伏笔链：找引用次数≥3且跨多章的核心伏笔序列
    var candidates = nodes.filter(function (n) {
      return (n.references && n.references.length >= 2) || (n.chapter > 0);
    }).sort(function (a, b) {
      var ra = (a.references || []).length + (a.strength || 0);
      var rb = (b.references || []).length + (b.strength || 0);
      return rb - ra;
    });

    // 建立主链：按 plantedAt 排序的最强前 3-5 条
    var sortedCandidates = candidates.slice(0, Math.min(5, candidates.length));
    sortedCandidates.sort(function (a, b) { return (a.plantedAt || 0) - (b.plantedAt || 0); });
    var mainChain = sortedCandidates.map(function (n) {
      return {
        id: n.id,
        text: n.text,
        type: n.type,
        plantedAt: n.plantedAt,
        references: n.references,
        recoveredAt: n.recoveredAt,
        status: n.status
      };
    });

    return {
      nodes: nodes,
      edges: edges,
      clusters: clusters,
      mainChain: mainChain
    };
  },

  // 从一段中文文本提取 3-4 字的实体短语滑窗（辅助匹配）
  _extractChineseWindows: function (text) {
    if (!text) return [];
    var stripped = text.replace(/[，。,!！？?、；;：:""'（()）【】《》\[\]\s\n\r0-9a-zA-Z]/g, '');
    var windows = [];
    var seen = {};
    for (var wl = 3; wl <= 4; wl++) {
      for (var i = 0; i + wl <= stripped.length; i++) {
        var w = stripped.slice(i, i + wl);
        if (!seen[w]) {
          seen[w] = 1;
          windows.push(w);
        }
      }
    }
    return windows;
  },

  // ======= 方法 3: 追踪某章的伏笔回收事件 =======
  trackRecovery: function (foreshadowList, chapterText, chapterIndex) {
    if (!foreshadowList || foreshadowList.length === 0) return { events: [], updated: [] };
    if (!chapterText) return { events: [], updated: [] };
    var events = [];
    var updated = foreshadowList.slice();

    for (var fi = 0; fi < updated.length; fi++) {
      var fs = updated[fi];
      if (fs.status === 'recovered' || fs.status === 'abandoned') continue;

      var kws = (fs.keywords || []).slice();
      // 补充：从伏笔原文抽取 3-4 字短语滑窗，提升中文场景下回收匹配率
      var windows = ForeshadowNetworkEngine._extractChineseWindows(fs.text);
      for (var wi = 0; wi < windows.length; wi++) {
        if (kws.indexOf(windows[wi]) < 0) kws.push(windows[wi]);
      }
      if (kws.length < 2) continue;

      var hitCount = 0;
      var hitPositions = [];
      for (var ki = 0; ki < kws.length; ki++) {
        if (kws[ki].length < 2) continue;
        var pos = chapterText.indexOf(kws[ki]);
        if (pos >= 0) {
          hitCount++;
          hitPositions.push(pos);
          // 防止同一章因短语过多过度匹配
          if (hitCount >= 4) break;
        }
      }

      if (hitCount >= 2) {
        // 检查是否出现回收信号词
        var hasRecoverySignal = false;
        for (var rsi = 0; rsi < ForeshadowNetworkEngine.RECOVERY_SIGNAL_WORDS.length; rsi++) {
          if (chapterText.indexOf(ForeshadowNetworkEngine.RECOVERY_SIGNAL_WORDS[rsi]) >= 0) {
            hasRecoverySignal = true;
            break;
          }
        }

        // 更新 references / lastReferencedAt
        if (!fs.references) fs.references = [];
        if (fs.references.indexOf(chapterIndex) < 0) {
          fs.references.push(chapterIndex);
        }
        fs.lastReferencedAt = chapterIndex;

        if (hasRecoverySignal) {
          // 标记为回收
          fs.status = 'recovered';
          fs.recoveredAt = chapterIndex;
          events.push({
            foreshadowId: fs.id,
            chapter: chapterIndex,
            text: fs.text,
            type: fs.type,
            event: 'recovered'
          });
        } else {
          // 只有引用，未回收
          if (fs.status === 'planted') fs.status = 'referenced';
          events.push({
            foreshadowId: fs.id,
            chapter: chapterIndex,
            text: fs.text,
            type: fs.type,
            event: 'referenced'
          });
        }
      }
    }

    return { events: events, updated: updated };
  },

  // ======= 方法 4: 分析伏笔网络健康度 =======
  analyzeNetworkHealth: function (network, totalChapters) {
    var nodes = (network && network.nodes) ? network.nodes : [];
    var issues = [];
    var totalCh = totalChapters || 1;
    var totalCount = nodes.length;

    // 维度1：伏笔密度（每章平均）
    var density = totalCount / Math.max(1, totalCh);
    var densityScore = 0;
    if (density >= 0.8 && density <= 2.5) densityScore = 20;
    else if (density >= 0.5 && density < 0.8) { densityScore = 12; issues.push('伏笔密度略低，读者记忆点不足'); }
    else if (density > 2.5 && density <= 4) { densityScore = 12; issues.push('伏笔密度偏高，读者可能混乱'); }
    else if (density < 0.5) { densityScore = 5; issues.push('伏笔过少，故事缺少深层钩子'); }
    else { densityScore = 3; issues.push('伏笔过多过密，需梳理'); }

    // 维度2：类型多样性（8种类型覆盖率 + 均衡度）
    var typeDist = {};
    for (var ti = 0; ti < totalCount; ti++) {
      var t = nodes[ti].type;
      typeDist[t] = (typeDist[t] || 0) + 1;
    }
    var coveredTypes = Object.keys(typeDist).length;
    var diversityScore = Math.min(15, coveredTypes * 2);
    if (coveredTypes < 4) issues.push('伏笔类型单一，建议拓展' + (4 - coveredTypes) + '种不同类型');
    var typeKeys = Object.keys(ForeshadowNetworkEngine.FORESHADOW_TYPES);
    var unusedTypes = [];
    for (var uki = 0; uki < typeKeys.length; uki++) {
      if (!typeDist[typeKeys[uki]]) unusedTypes.push(ForeshadowNetworkEngine.FORESHADOW_TYPES[typeKeys[uki]].label);
    }
    if (unusedTypes.length > 0) issues.push('未使用的伏笔类型：' + unusedTypes.join('、'));

    // 维度3：回收速率
    var plantedCount = 0;
    var recoveredCount = 0;
    for (var ri = 0; ri < totalCount; ri++) {
      if (nodes[ri].status !== 'abandoned') plantedCount++;
      if (nodes[ri].status === 'recovered') recoveredCount++;
    }
    var recoveryRate = plantedCount > 0 ? recoveredCount / plantedCount : 0;
    var recoveryScore = 0;
    if (recoveryRate >= 0.4 && recoveryRate <= 0.75) recoveryScore = 25;
    else if (recoveryRate >= 0.2 && recoveryRate < 0.4) { recoveryScore = 15; issues.push('回收率偏低，挖坑未填，建议尽快安排回收'); }
    else if (recoveryRate < 0.2 && totalCh > 5) { recoveryScore = 5; issues.push('回收率严重偏低，可能导致读者失去耐心'); }
    else if (recoveryRate > 0.75) { recoveryScore = 15; issues.push('回收率过高，伏笔缺乏沉淀，应多埋长线伏笔'); }
    else recoveryScore = 20;

    // 维度4：平均生命周期
    var recovered = nodes.filter(function (n) { return n.status === 'recovered' && n.plantedAt > 0 && n.recoveredAt > 0; });
    var avgLifecycle = 0;
    if (recovered.length > 0) {
      var totalLife = 0;
      for (var rci = 0; rci < recovered.length; rci++) {
        totalLife += (recovered[rci].recoveredAt - recovered[rci].plantedAt);
      }
      avgLifecycle = totalLife / recovered.length;
    }
    var lifecycleScore = 15;
    if (avgLifecycle > 0 && avgLifecycle < 3) { lifecycleScore = 8; issues.push('伏笔回收过快，缺少沉淀感'); }
    else if (avgLifecycle > 20) { lifecycleScore = 8; issues.push('伏笔回收过慢，读者可能遗忘'); }
    else if (avgLifecycle > 0) lifecycleScore = 15;

    // 维度5：主线集中度
    var mainChain = (network && network.mainChain) ? network.mainChain : [];
    var mainChainScore = 0;
    if (mainChain.length >= 2 && mainChain.length <= 5) mainChainScore = 15;
    else if (mainChain.length === 1) { mainChainScore = 10; issues.push('主线伏笔链过少，层次感不足'); }
    else if (mainChain.length > 5) { mainChainScore = 8; issues.push('主线伏笔链过多，读者注意力分散'); }
    else { mainChainScore = 3; issues.push('未识别到主线伏笔链，建议加强核心线索串联'); }

    // 维度6：休眠伏笔数（>15章未被提及）
    var dormant = [];
    for (var di = 0; di < totalCount; di++) {
      if (nodes[di].status === 'recovered' || nodes[di].status === 'abandoned') continue;
      var lastRef = nodes[di].lastReferencedAt || nodes[di].plantedAt || 0;
      var dormancy = totalCh - lastRef;
      if (dormancy > 15 && lastRef > 0) dormant.push(nodes[di]);
    }
    var dormantScore = 10;
    if (dormant.length >= 3) { dormantScore = 3; issues.push('有' + dormant.length + '条伏笔超过15章未被提及，存在遗忘风险'); }
    else if (dormant.length >= 1) { dormantScore = 6; issues.push('有' + dormant.length + '条伏笔长期休眠，建议近期安排引用或回收'); }

    // 维度7：热伏笔信号
    var hotForeshadows = [];
    for (var hi = 0; hi < totalCount; hi++) {
      var nd = nodes[hi];
      if (nd.status === 'recovered' || nd.status === 'abandoned') continue;
      if (!nd.references || nd.references.length < 2) continue;
      // 近3章内是否连续被提及
      var recentCount = 0;
      for (var ri2 = 0; ri2 < nd.references.length; ri2++) {
        if (totalCh - nd.references[ri2] <= 3) recentCount++;
      }
      if (recentCount >= 2) {
        nd.isHot = true;
        hotForeshadows.push(nd);
      }
    }
    var hotScore = 5;
    if (hotForeshadows.length >= 1 && hotForeshadows.length <= 3) hotScore = 10;
    else if (hotForeshadows.length > 3) { hotScore = 7; issues.push('热伏笔过多，安排回收节奏需更均匀'); }

    var score = densityScore + diversityScore + recoveryScore + lifecycleScore + mainChainScore + dormantScore + hotScore;
    score = Math.max(0, Math.min(100, score));

    // 被遗弃的伏笔
    var abandoned = nodes.filter(function (n) { return n.status === 'abandoned'; });

    return {
      score: score,
      dimensions: {
        densityScore: densityScore,
        densityPerChapter: density,
        diversityScore: diversityScore,
        coveredTypes: coveredTypes,
        recoveryScore: recoveryScore,
        recoveryRate: recoveryRate,
        lifecycleScore: lifecycleScore,
        avgLifecycle: avgLifecycle,
        mainChainScore: mainChainScore,
        mainChainLength: mainChain.length,
        dormantScore: dormantScore,
        dormantCount: dormant.length,
        hotScore: hotScore,
        hotCount: hotForeshadows.length
      },
      issues: issues,
      hotForeshadows: hotForeshadows.map(function (h) { return { id: h.id, text: h.text, type: h.type, lastReferencedAt: h.lastReferencedAt }; }),
      dormant: dormant.map(function (d) { return { id: d.id, text: d.text, type: d.type, dormantFor: totalCh - (d.lastReferencedAt || 0) }; }),
      abandoned: abandoned.map(function (a) { return { id: a.id, text: a.text, type: a.type }; })
    };
  },

  // ======= 方法 5: 生成人类可读报告 =======
  generateForeshadowReport: function (network, healthResult) {
    if (!network || !network.nodes || network.nodes.length === 0) {
      return '【伏笔网络报告】\n未检测到足够伏笔数据，无法生成报告。\n';
    }
    var lines = [];
    lines.push('========================================');
    lines.push('        伏笔网络健康度报告');
    lines.push('========================================');
    lines.push('');

    var score = healthResult && healthResult.score ? healthResult.score : 0;
    var dim = healthResult && healthResult.dimensions ? healthResult.dimensions : {};
    lines.push('【综合健康度】' + score + ' / 100');
    lines.push('  - 伏笔总数：' + network.nodes.length + ' 条');
    lines.push('  - 每章平均伏笔：' + (dim.densityPerChapter ? dim.densityPerChapter.toFixed(2) : '0'));
    lines.push('  - 伏笔类型覆盖：' + (dim.coveredTypes || 0) + ' / 8');
    lines.push('  - 回收比例：' + (dim.recoveryRate ? Math.round(dim.recoveryRate * 100) : 0) + '%');
    lines.push('  - 平均生命周期：' + (dim.avgLifecycle ? dim.avgLifecycle.toFixed(1) : 0) + ' 章');
    lines.push('  - 主线伏笔链数：' + (dim.mainChainLength || 0));
    lines.push('  - 休眠伏笔数：' + (dim.dormantCount || 0));
    lines.push('  - 热伏笔数：' + (dim.hotCount || 0));
    lines.push('');

    // 主线伏笔链
    lines.push('----------------------------------------');
    lines.push('【主线伏笔链】');
    if (network.mainChain && network.mainChain.length > 0) {
      for (var mi = 0; mi < network.mainChain.length; mi++) {
        var mc = network.mainChain[mi];
        var typeLabel = ForeshadowNetworkEngine.FORESHADOW_TYPES[mc.type] ? ForeshadowNetworkEngine.FORESHADOW_TYPES[mc.type].label : mc.type;
        var chainText = '  [' + (mi + 1) + '] (' + typeLabel + ') ' + mc.text;
        var timeline = '';
        if (mc.plantedAt > 0) timeline += '[第' + mc.plantedAt + '章埋下]';
        if (mc.references && mc.references.length > 1) {
          for (var rfi = 1; rfi < mc.references.length; rfi++) {
            timeline += ' → [第' + mc.references[rfi] + '章提及]';
          }
        }
        if (mc.recoveredAt) timeline += ' → [第' + mc.recoveredAt + '章回收 ✓]';
        else timeline += ' → [待回收…]';
        lines.push(chainText);
        lines.push('      ' + timeline);
      }
    } else {
      lines.push('  未识别到明显主线伏笔链，建议加强核心线索的跨章串联。');
    }
    lines.push('');

    // 热伏笔（即将回收）
    lines.push('----------------------------------------');
    lines.push('【即将回收 · 热伏笔建议】');
    var hot = healthResult && healthResult.hotForeshadows ? healthResult.hotForeshadows : [];
    if (hot.length > 0) {
      for (var hi = 0; hi < hot.length; hi++) {
        var h = hot[hi];
        var hLabel = ForeshadowNetworkEngine.FORESHADOW_TYPES[h.type] ? ForeshadowNetworkEngine.FORESHADOW_TYPES[h.type].label : h.type;
        lines.push('  · [' + h.id + '] (' + hLabel + ') ' + h.text + ' 【最近引用: 第' + h.lastReferencedAt + '章】');
      }
      lines.push('  建议：近3章内安排一次明确回收，用"原来/果然/终于"等信号词完成闭环。');
    } else {
      lines.push('  当前无连续被提及的热伏笔。建议对重要伏笔增加章节间的"呼唤式"引用。');
    }
    lines.push('');

    // 高遗忘风险伏笔
    lines.push('----------------------------------------');
    lines.push('【遗忘风险 · 长期休眠伏笔】');
    var dormant = healthResult && healthResult.dormant ? healthResult.dormant : [];
    if (dormant.length > 0) {
      for (var di = 0; di < dormant.length; di++) {
        var d = dormant[di];
        var dLabel = ForeshadowNetworkEngine.FORESHADOW_TYPES[d.type] ? ForeshadowNetworkEngine.FORESHADOW_TYPES[d.type].label : d.type;
        lines.push('  · [' + d.id + '] (' + dLabel + ') ' + d.text + ' 【已休眠 ' + d.dormantFor + ' 章】');
      }
      lines.push('  建议：在下一章做一次"温和引用"(角色一句话/物件再现)，唤醒读者记忆。');
    } else {
      lines.push('  状态良好，无超过15章未被提及的伏笔。');
    }
    lines.push('');

    // 问题清单与改进建议
    lines.push('----------------------------------------');
    lines.push('【问题清单与改进建议】');
    var issueList = healthResult && healthResult.issues ? healthResult.issues : [];
    if (issueList.length > 0) {
      for (var ii = 0; ii < issueList.length; ii++) {
        lines.push('  ' + (ii + 1) + '. ' + issueList[ii]);
      }
    } else {
      lines.push('  当前伏笔网络状态优秀，暂未发现明显问题。');
    }
    lines.push('');
    lines.push('========================================');

    return lines.join('\n');
  },

  // ======= 方法 6: 建议下一章应埋设/回收的伏笔类型 =======
  suggestNextForeshadowPlacement: function (network, currentChapter, platform) {
    var nodes = (network && network.nodes) ? network.nodes : [];
    var total = nodes.length;
    var style = platform || 'qidian';

    // 统计各类型分布，找出当前"缺少"的类型
    var typeDist = {};
    var typeKeys = Object.keys(ForeshadowNetworkEngine.FORESHADOW_TYPES);
    for (var tki = 0; tki < typeKeys.length; tki++) typeDist[typeKeys[tki]] = 0;
    for (var ni = 0; ni < total; ni++) {
      if (typeDist[nodes[ni].type] !== undefined) typeDist[nodes[ni].type]++;
    }
    var avgPerType = total > 0 ? total / 8 : 0;

    // 找出"缺少"的类型（低于平均值70%）
    var shortageTypes = [];
    for (var ski = 0; ski < typeKeys.length; ski++) {
      if (typeDist[typeKeys[ski]] < avgPerType * 0.7) {
        shortageTypes.push({
          type: typeKeys[ski],
          label: ForeshadowNetworkEngine.FORESHADOW_TYPES[typeKeys[ski]].label,
          deficit: Math.ceil(avgPerType) - typeDist[typeKeys[ski]]
        });
      }
    }
    shortageTypes.sort(function (a, b) { return b.deficit - a.deficit; });

    // 平台节奏：决定"回收"的节奏
    var suggestPlant = [];
    var suggestRecover = [];
    var nextCh = (currentChapter || 0) + 1;

    // 建议埋设：先补短缺类型，再按平台风格补充
    if (shortageTypes.length > 0) {
      for (var si = 0; si < Math.min(2, shortageTypes.length); si++) {
        suggestPlant.push({
          chapter: nextCh,
          type: shortageTypes[si].type,
          label: shortageTypes[si].label,
          reason: shortageTypes[si].label + '当前不足，建议在第' + nextCh + '章埋设'
        });
      }
    }

    // 按平台风格的节奏建议
    if (style === 'fanqie' || style === 'qiezi' || style === '番茄') {
      // 番茄：每3章小爆点回收 + 每10章大回收
      if (nextCh % 3 === 0) {
        suggestRecover.push({
          chapter: nextCh,
          type: 'mini_payoff',
          label: '小爆点回收',
          reason: '番茄风格·每3章一次小回收，建议在第' + nextCh + '章安排一条中等伏笔回收'
        });
      }
      if (nextCh % 10 === 0) {
        suggestRecover.push({
          chapter: nextCh,
          type: 'major_payoff',
          label: '大回收',
          reason: '番茄风格·每10章一次大回收，建议安排一条核心主线伏笔回收'
        });
      }
    } else {
      // 起点（默认）：每5-8章1次中回收 + 每卷末1次大回收
      if (nextCh % 8 === 0 || nextCh % 5 === 0) {
        suggestRecover.push({
          chapter: nextCh,
          type: 'mid_payoff',
          label: '中型回收',
          reason: '起点风格·建议在第' + nextCh + '章安排一次中型伏笔回收'
        });
      }
      if (nextCh % 20 === 0) {
        suggestRecover.push({
          chapter: nextCh,
          type: 'volume_payoff',
          label: '卷末大回收',
          reason: '起点风格·第' + nextCh + '章属卷末位置，建议安排一条重量级伏笔回收'
        });
      }
    }

    // 推荐具体回收哪条伏笔（优先：热伏笔 > 休眠伏笔 > 未回收的强伏笔）
    var candidates = nodes.filter(function (n) { return n.status !== 'recovered' && n.status !== 'abandoned'; });
    var topToRecover = null;
    var hotNodes = candidates.filter(function (n) { return n.isHot; });
    if (hotNodes.length > 0) {
      hotNodes.sort(function (a, b) { return b.strength - a.strength; });
      topToRecover = hotNodes[0];
    } else {
      candidates.sort(function (a, b) { return b.strength - a.strength; });
      if (candidates.length > 0) topToRecover = candidates[0];
    }
    if (topToRecover && suggestRecover.length > 0) {
      suggestRecover[0].targetForeshadow = {
        id: topToRecover.id,
        text: topToRecover.text,
        type: topToRecover.type
      };
    }

    // 若当前无明确平台节奏建议，仍补充"类型补充"建议
    if (suggestPlant.length === 0 && total > 0) {
      suggestPlant.push({
        chapter: nextCh,
        type: 'item',
        label: '物品类',
        reason: '建议埋设一件与主角相关的信物/物件作为中长期线索'
      });
    }

    return {
      suggestPlant: suggestPlant,
      suggestRecover: suggestRecover
    };
  }
};

// 手动测试示例：
// var detailDemo = [
//   '第1章 初入江湖',
//   '主角在客栈遇到一位老者，实则是早已销声匿迹的前掌门。伏笔[老者腰间玉佩似乎与主角母亲遗物同源]',
//   '主角暗中修炼了一门尚未完成的心法，隐藏能力尚未觉醒。',
//   '',
//   '第3章 夜袭',
//   '黑衣人来袭，主角险死还生，他隐约觉得黑衣人的招式似曾相识。伏笔[黑衣人首领的真实身份是主角失散多年的兄长]',
//   '章尾钩子：然而就在这时，门外传来了一道身影',
//   '',
//   '第5章 真相初现',
//   '主角回想起老者腰间的玉佩，与自己的遗物竟是一对。原来那老者是母亲的师兄，早已约定若有朝一日主角寻来便交给他一封信。',
//   '伏笔[那封信记载着关于血脉的真相和被抹去的名字]',
//   '',
//   '第7章 旧伤发作',
//   '主角修炼隐患爆发，旧伤未愈，暗疾再度发作。伏笔[这暗疾与当年灭门之夜的禁制有关]',
//   '',
//   '第10章 卷末对决',
//   '终于，真相是黑衣人果然是失散多年的兄长，二人于月下相认。'
// ].join('\n');
//
// var charDemo = '主角隐藏的真实身份是某古老家族遗孤，其实是血脉传承者，暗中修炼家族禁术。';
// var worldDemo = '这片大陆上有一处被遗忘的秘境，传说中藏着被封印的历史，无人知晓它的入口。';
//
// var foreshadows = ForeshadowNetworkEngine.extractForeshadowsFromOutline(detailDemo, charDemo, worldDemo);
// console.log('识别伏笔数：' + foreshadows.length);
//
// // 模拟追踪第5章、第10章的回收
// var chapter5Text = '主角回想起老者腰间的玉佩，与自己的遗物竟是一对。原来那老者是母亲的师兄，早已约定若有朝一日主角寻来便交给他一封信。';
// var r5 = ForeshadowNetworkEngine.trackRecovery(foreshadows, chapter5Text, 5);
// foreshadows = r5.updated;
//
// var chapter10Text = '终于，真相是黑衣人果然是失散多年的兄长，二人于月下相认。';
// var r10 = ForeshadowNetworkEngine.trackRecovery(foreshadows, chapter10Text, 10);
// foreshadows = r10.updated;
//
// var network = ForeshadowNetworkEngine.buildNetwork(foreshadows);
// var health = ForeshadowNetworkEngine.analyzeNetworkHealth(network, 10);
// console.log(ForeshadowNetworkEngine.generateForeshadowReport(network, health));
// console.log(ForeshadowNetworkEngine.suggestNextForeshadowPlacement(network, 10, '番茄'));
