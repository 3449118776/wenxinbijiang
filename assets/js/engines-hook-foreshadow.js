// 文心笔匠 v2 增强引擎 - 钩子强度 + 伏笔追踪
// 独立模块，可直接 <script> 引入，不依赖其他文件
// 提供两个全局对象：HookStrengthEngine（钩子强度评分）、ForeshadowTracker（伏笔追踪与回收）

// ========== 引擎1: HookStrengthEngine 钩子强度评分引擎（0-100分） ==========
HookStrengthEngine = {
  // 钩子类型分类（给每章自动打标签）
  TYPES: {
    identity: {
      keywords: ['身份', '真面目', '居然是', '原来', '竟然是', '不是', '实为', '真身', '冒充', '假冒', '代号', '真名'],
      weight: 1.2,
      label: '身份揭示'
    },
    ability: {
      keywords: ['实力', '修为', '境界', '出手', '底牌', '能力', '秘术', '法宝', '真正的', '隐藏的', '觉醒', '突破'],
      weight: 1.1,
      label: '能力觉醒'
    },
    relationship: {
      keywords: ['其实', '一直', '暗中', '默默地', '背后', '敌人', '朋友', '师兄', '师父', '父亲', '母亲', '兄弟', '亲人'],
      weight: 1.3,
      label: '关系反转'
    },
    danger: {
      keywords: ['危险', '袭来', '逼近', '降临', '追杀', '包围', '陷阱', '阴谋', '危机', '险境', '死', '血', '杀'],
      weight: 1.2,
      label: '危险逼近'
    },
    secret: {
      keywords: ['秘密', '真相', '隐藏', '不曾', '从未', '居然', '没想到', '不可思议', '更可怕的是'],
      weight: 1.4,
      label: '秘密揭露'
    },
    mystery: {
      keywords: ['什么', '是谁', '为何', '怎么', '哪里', '那是', '那道', '那个', '未知', '神秘', '诡异', '异象'],
      weight: 1.0,
      label: '神秘未知'
    }
  },

  // 悬念强度词汇（提高评分）
  STRONG_HOOK_WORDS: ['然而', '可', '却', '就在这时', '下一秒', '忽然', '突然', '谁也没想到', '门外', '身后', '真正', '不是', '只听', '传来', '出现', '抬头', '脸色一变', '更', '更可怕的是', '此刻', '此时', '这才', '谁知', '岂知', '不料', '偏偏', '但'],

  // 弱钩子/空钩子检测（降低评分）
  WEAK_HOOK_PATTERNS: [
    /^.{0,3}$/,
    /^(然后|接着|继续|随后|之后|接下来).{0,10}$/,
    /^(主角|他|她|他们).{0,20}$/,
    /^.{0,15}(继续|推进|发展|展开|进行).{0,15}$/
  ],

  /**
   * 分析单条钩子文本的强度
   * @param {string} hookText 章尾钩子字段内容
   * @param {string} chapterText 章末100-300字上下文
   * @returns {{score:number, type:string, depth:number, issues:string[]}}
   */
  analyzeHook: function (hookText, chapterText) {
    if (!hookText || hookText.trim().length < 3) {
      return { score: 0, type: '无', depth: 0, issues: ['钩子缺失或过短'] };
    }
    var text = hookText.trim();
    var issues = [];
    var score = 40;

    // 1) 类型匹配
    var matchedTypes = [];
    var typeKeys = Object.keys(HookStrengthEngine.TYPES);
    typeKeys.forEach(function (type) {
      var t = HookStrengthEngine.TYPES[type];
      var hitCount = t.keywords.reduce(function (n, kw) {
        return n + (text.indexOf(kw) >= 0 ? 1 : 0);
      }, 0);
      if (hitCount > 0) matchedTypes.push({ type: type, label: t.label, hits: hitCount, weight: t.weight });
    });
    if (matchedTypes.length > 0) {
      matchedTypes.sort(function (a, b) { return b.hits * b.weight - a.hits * a.weight; });
      score = Math.min(100, score + matchedTypes[0].hits * 8);
    } else {
      issues.push('未识别到明确悬念类型');
    }

    // 2) 悬念词汇加分
    var strongWordHits = HookStrengthEngine.STRONG_HOOK_WORDS.reduce(function (n, w) {
      return n + (text.indexOf(w) >= 0 ? 1 : 0);
    }, 0);
    score = Math.min(100, score + strongWordHits * 4);

    // 3) 弱钩子模式扣分
    HookStrengthEngine.WEAK_HOOK_PATTERNS.forEach(function (p) {
      if (p.test(text)) {
        score -= 20;
        issues.push('转场式弱钩子');
      }
    });

    // 4) 长度加分（足够长通常信息更完整）
    if (text.length >= 25) score += 8;
    if (text.length >= 50) score += 5;

    // 5) 含问号/感叹号加分（但不滥用）
    var qCount = (text.match(/[？?！!]/g) || []).length;
    if (qCount >= 1 && qCount <= 3) score += 10;
    if (qCount > 3) { score -= 5; issues.push('标点过度'); }

    // 6) 含数字/具体信息加分（有具体事实的钩子比空泛描述更强）
    if (/\d/.test(text) || /[《「【(（]/.test(text) || /[名姓]/.test(text)) score += 6;

    // 7) 含套话/万能词扣分
    if (/非常|十分|特别|相当|无比|极其|万分/.test(text)) score -= 6;

    // 8) 深度评估（是否有多层悬念）
    var depth = 0;
    if (matchedTypes.length >= 2) depth = 2;
    if (/但是|然而|更|却|可/.test(text) && /[？?！!]/.test(text)) depth = Math.max(depth, 2);
    if (strongWordHits >= 2 && text.length > 30) depth = Math.max(depth, 3);

    score = Math.max(0, Math.min(100, score));

    return {
      score: score,
      type: matchedTypes.length > 0 ? matchedTypes[0].label : '通用悬念',
      depth: depth,
      issues: issues,
      raw: text
    };
  },

  /**
   * 批量分析整份细纲的钩子分布
   * @param {string} detailText 细纲文本
   * @returns {{avgScore:number, perChapter:Array, typeDistribution:Object, weakChapters:Array}}
   */
  analyzeAllHooks: function (detailText) {
    var lines = (detailText || '').split('\n').filter(function (l) {
      return /^\s*第[一二三四五六七八九十百千\d]+章/.test(l.trim());
    });
    var results = [];
    var typeDist = {};
    var weak = [];
    var totalScore = 0;
    lines.forEach(function (line, idx) {
      var m = line.match(/章尾钩子[：:]\s*\[?([^\|\]\n]+)\]?/);
      var hook = m ? m[1].trim() : '';
      var analysis = HookStrengthEngine.analyzeHook(hook, line);
      if (analysis.score < 40) weak.push(idx + 1);
      totalScore += analysis.score;
      typeDist[analysis.type] = (typeDist[analysis.type] || 0) + 1;
      results.push({
        chapter: idx + 1,
        hook: analysis.raw,
        score: analysis.score,
        type: analysis.type,
        depth: analysis.depth
      });
    });
    return {
      avgScore: results.length > 0 ? Math.round(totalScore / results.length) : 0,
      total: results.length,
      perChapter: results,
      typeDistribution: typeDist,
      weakChapters: weak
    };
  },

  // 辅助：章节号解析（中文/阿拉伯数字互转）
  _parseChapterNum: function (s) {
    if (!s) return 0;
    if (/^\d+$/.test(s)) return parseInt(s, 10);
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
  }
};

// ========== 引擎2: ForeshadowTracker 伏笔追踪与回收率引擎 ==========
ForeshadowTracker = {

  // 伏笔埋下关键词（伏笔位置检测）
  BURIED_PATTERNS: [
    /(?:此刻|当时|现在|他|她|众人|谁也|没人|没有人)[^，。,\n]{0,20}(?:还|尚|未曾|尚未|不曾|不知道|不清楚|没有想到|不会想到|没意识到)[^，。,\n]{0,30}(?:的|[，。,])/g,
    /(?:日后|后来|将来|未来|某一天|以后)[^，。,\n]{0,20}(?:会|才|将|要)/g,
    /(?:这|那)(?:个|些|件|点|一刻|一时)[^，。,\n]{0,15}(?:似乎|好像|仿佛|隐约|感觉|觉得)[^，。,\n]{0,30}(?:[，。,])/g,
    /(?:心中|心里|暗自|暗暗|私下|暗中)[^，。,\n]{0,25}(?:想|道|琢磨|盘算|打定主意|下定决心)[^，。,\n]{0,40}(?:[，。,])/g,
    /(?:悄悄|偷偷|不动声色|不露声色|暗自)[^，。,\n]{0,20}(?:收藏|收起|藏|收|记|记下|留下)[^，。,\n]{0,25}(?:[，。,])/g,
    /(?:如果|若是|倘若|万一|假使)[^，。,\n]{0,25}(?:的话|,|，)/g,
    /伏笔[：:]\s*\[?([^\]\n]+)\]?/g,
    /(?:隐藏|暗藏|隐秘|秘密|暗中)[^，。,\n]{0,15}(?:力量|势力|身份|目的|真相|计划|阴谋|底牌|后手)/g
  ],

  // 伏笔回收关键词（回收位置检测）
  REVEALED_PATTERNS: [
    /(?:原来|果然|不出|正如|竟然|居然|不曾想到|谁能想到|这一刻)[^，。,\n]{0,40}/g,
    /(?:终于|此刻|此时|现在|这一刻)[^，。,\n]{0,20}(?:明白|知道|懂了|看清|发现|醒悟|回过神|明白了)/g,
    /(?:回|回想起|回忆|忆起|想起|记起)[^，。,\n]{0,25}(?:当初|之前|那时|那时候|当时|此前|曾经|以前)/g
  ],

  /**
   * 从文本中提取所有伏笔（基于多种模式匹配）
   * @param {string} text 要扫描的文本（细纲或正文）
   * @returns {Array<{chapter:number, text:string, type:string, lineIdx:number}>}
   */
  extractForeshadows: function (text) {
    if (!text) return [];
    var results = [];
    var lines = text.split('\n');
    var currentChapter = 0;

    lines.forEach(function (line, lineIdx) {
      // 章节定位
      if (/^\s*第[一二三四五六七八九十百千\d]+章/.test(line.trim())) {
        var m = line.trim().match(/第([一二三四五六七八九十百千\d]+)章/);
        if (m) currentChapter = HookStrengthEngine._parseChapterNum(m[1]);
      }

      // 模式1：细纲"伏笔"字段
      var foreshadowMatch = line.match(/伏笔[：:]\s*\[?([^\]\n]+)\]?/);
      if (foreshadowMatch && foreshadowMatch[1].trim().length > 3) {
        results.push({
          chapter: currentChapter,
          text: foreshadowMatch[1].trim().slice(0, 80),
          type: 'foreshadow_field',
          lineIdx: lineIdx
        });
      }

      // 模式2-8：文本中的伏笔暗示
      ForeshadowTracker.BURIED_PATTERNS.forEach(function (p) {
        p.lastIndex = 0;
        var match;
        while ((match = p.exec(line)) !== null) {
          var snippet = match[0].trim();
          if (snippet.length > 5 && snippet.length < 120) {
            results.push({
              chapter: currentChapter,
              text: snippet.slice(0, 80),
              type: 'context_hint',
              lineIdx: lineIdx
            });
          }
        }
      });
    });

    return results;
  },

  /**
   * 检测伏笔回收情况（从正文/后续章节中寻找回收线索）
   * @param {Array} foreshadows extractForeshadows 返回的列表
   * @param {string} mainText 正文（含后续章节）或细纲后续部分
   * @returns {{total:number, recovered:number, pending:number, rate:number, details:Array}}
   */
  trackRecovery: function (foreshadows, mainText) {
    if (!foreshadows || foreshadows.length === 0) {
      return { total: 0, recovered: 0, pending: 0, rate: 0, details: [] };
    }
    var recovered = 0;
    var details = foreshadows.map(function (fs) {
      var startPos = fs.lineIdx || 0;
      var searchText = mainText.split('\n').slice(startPos + 3).join('\n');
      var isRecovered = false;

      var keywords = fs.text.replace(/[，。,、\.?!！？：:的了是在有和与]/g, '').trim();
      if (keywords.length >= 3) {
        var searchKey = keywords.slice(0, 6);
        if (searchText.length > 0) {
          ForeshadowTracker.REVEALED_PATTERNS.forEach(function (p) {
            p.lastIndex = 0;
            var m;
            while ((m = p.exec(searchText)) !== null) {
              if (m[0].indexOf(searchKey.slice(0, 3)) >= 0) isRecovered = true;
            }
          });
          if (!isRecovered && searchText.indexOf(searchKey) >= 0) isRecovered = true;
        }
      }

      if (isRecovered) recovered++;
      return {
        chapter: fs.chapter,
        text: fs.text,
        status: isRecovered ? 'recovered' : 'pending'
      };
    });
    return {
      total: foreshadows.length,
      recovered: recovered,
      pending: foreshadows.length - recovered,
      rate: foreshadows.length > 0 ? Math.round(recovered / foreshadows.length * 100) : 0,
      details: details
    };
  },

  /**
   * 整合：从细纲中提取伏笔+检测整体健康度
   * @param {string} detailText 细纲文本
   * @returns {{total:number, perChapter:number, topForeshadows:Array, healthScore:number, issues:string[]}}
   */
  analyzeDetailForeshadowHealth: function (detailText) {
    var foreshadows = ForeshadowTracker.extractForeshadows(detailText);
    var chapterCount = ((detailText || '').match(/第[一二三四五六七八九十百千\d]+章/g) || []).length;
    var issues = [];

    var healthScore = 60;
    if (chapterCount > 0) {
      var per10Ch = foreshadows.length / Math.max(1, Math.floor(chapterCount / 10));
      if (per10Ch >= 3 && per10Ch <= 8) healthScore += 20;
      else if (per10Ch < 1) { healthScore -= 20; issues.push('伏笔密度偏低'); }
      else if (per10Ch > 12) { healthScore -= 10; issues.push('伏笔过多可能造成混乱'); }
    }
    if (foreshadows.length === 0) {
      healthScore = 20;
      issues.push('未检测到伏笔');
    }
    healthScore = Math.max(0, Math.min(100, healthScore));

    var topForeshadows = foreshadows.slice(0, 10).map(function (f) {
      return '第' + f.chapter + '章 · ' + f.text;
    });

    return {
      total: foreshadows.length,
      chapterCount: chapterCount,
      perChapter: chapterCount > 0 ? (foreshadows.length / chapterCount).toFixed(2) : 0,
      topForeshadows: topForeshadows,
      healthScore: healthScore,
      issues: issues
    };
  }
};

// 手动测试：
// var demo = '第1章 标题\n内容 章尾钩子[然而就在这时，门外传来了一道身影]\n第2章 标题2\n伏笔[他暗中收藏了一枚玉佩，日后会派上用场]';
// console.log(HookStrengthEngine.analyzeAllHooks(demo));
// console.log(ForeshadowTracker.analyzeDetailForeshadowHealth(demo));
