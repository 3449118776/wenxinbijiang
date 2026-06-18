/* 文心笔匠 v2 增强引擎 - 章节因果验证引擎 */
/* 引擎5: ChapterCausalityEngine（章节因果验证引擎） */
/* 核心假设：
 * 1. 角色在本章做出的任何重大决定，都应有在人设或前文中埋设的理由
 * 2. 任何"突然"揭示的真相，都应在之前有>=2处伏笔信号
 * 3. 任何"反转"都应能在角色人设中找到深层矛盾支撑
 */

var ChapterCausalityEngine = {

  // ========== 信号词库 ==========
  SIGNAL_WORDS: {
    decision: ['决定', '终于', '下定', '决心', '选择', '站了出来', '转过身来', '踏出一步', '答应', '拒绝', '出手'],
    emotion:  ['突然', '然而', '但', '可', '却', '没想到', '竟然', '原来', '此刻', '心中一动'],
    revelation: ['真相是', '原来如此', '并非', '实则', '其实是', '一直以来', '这才明白']
  },

  // 触发条件词（解释了"为什么"角色这样做）
  TRIGGER_WORDS: ['想到', '回忆起', '为了', '因为', '若是', '若不', '否则', '突然想起', '脑中浮现', '恍如昨日', '忆及'],

  // 性格-行为 冲突对（人设X 与 决策Y之间可能矛盾）
  PERSONALITY_CONFLICTS: [
    { personality: ['谨慎', '稳重', '小心', '三思', '保守'], conflict: ['孤注一掷', '冒险', '冲动', '贸然', '毫无准备', '赌上'] },
    { personality: ['冷静', '理性', '淡定', '沉稳'], conflict: ['暴怒', '嘶吼', '疯狂', '失控', '失去理智', '失态'] },
    { personality: ['外冷', '冷漠', '孤僻', '不近人情'], conflict: ['热情', '主动帮助', '救下', '拥抱', '流泪'] },
    { personality: ['善良', '正直', '不杀生'], conflict: ['杀人', '痛下杀手', '残忍', '冷漠旁观'] },
    { personality: ['懦弱', '胆小', '软弱'], conflict: ['挺身而出', '对抗', '挑战', '反抗', '决绝'] },
    { personality: ['高傲', '自负', '不屑'], conflict: ['求助', '下跪', '低头', '哀求', '合作'] }
  ],

  // 世界观规则信号词（从世界观文本中提取"规则类"陈述）
  WORLD_RULE_WORDS: ['不能', '无法', '没人', '从未', '禁止', '禁忌', '只有', '必须', '需', '代价', '最强', '无人能', '不可能'],

  // 与规则冲突的"突破"信号词
  BREAKTHROUGH_WORDS: ['突破', '打破', '做到了', '成功', '击败', '杀死', '掌控', '领悟', '获得', '觉醒'],

  // 特殊条件豁免词（"因为XX，所以是例外"）
  EXCEPTION_WORDS: ['因为', '由于', '此刻', '特殊', '例外', '唯独', '唯有', '这一次', '条件'],

  // 情感强度词（按级别）
  EMOTION_LEVELS: {
    level1: ['安静', '沉默', '想', '回忆', '思索', '出神'],
    level2: ['皱眉', '疑惑', '愕然', '诧异', '意外', '惊讶'],
    level3: ['震惊', '愤怒', '悲伤', '狂喜', '绝望', '恨', '不甘', '恐惧'],
    level4: ['嘶吼', '狂笑', '崩溃', '无法言喻', '失去意识', '瘫倒', '呕血']
  },

  // 实力/战斗相关词
  COMBAT_WORDS: ['击败', '杀死', '对抗', '势均力敌', '压制', '秒杀', '重创', '打退', '战胜'],

  /**
   * 工具：在文本中按关键词查找所有匹配位置
   */
  _findAllMatches: function(text, keywords) {
    if (!text) return [];
    var results = [];
    for (var i = 0; i < keywords.length; i++) {
      var kw = keywords[i];
      if (!kw) continue;
      var idx = text.indexOf(kw);
      while (idx >= 0) {
        results.push({ keyword: kw, index: idx });
        idx = text.indexOf(kw, idx + kw.length);
      }
    }
    results.sort(function(a, b) { return a.index - b.index; });
    return results;
  },

  /**
   * 工具：截取位置前后上下文
   */
  _snippetAround: function(text, index, range) {
    range = range || 80;
    var start = Math.max(0, index - range);
    var end = Math.min(text.length, index + range);
    return text.substring(start, end);
  },

  // ========== 方法1: 提取本章重大决策/行为转折 ==========
  /**
   * 从本章文本中提取"重大决策/行为转折"
   * @param {string} chapterText 本章正文
   * @param {string} charText 角色人设（用于辅助识别）
   * @returns {Array<{snippet:string, signalType:string, chapter:number, keyword:string}>}
   */
  extractChapterDecisions: function(chapterText, charText) {
    if (!chapterText) return [];
    var decisions = [];
    var engine = this;
    var types = ['decision', 'emotion', 'revelation'];

    for (var t = 0; t < types.length; t++) {
      var type = types[t];
      var kws = engine.SIGNAL_WORDS[type];
      var matches = engine._findAllMatches(chapterText, kws);
      for (var i = 0; i < matches.length; i++) {
        var m = matches[i];
        var snippet = engine._snippetAround(chapterText, m.index, 80);
        decisions.push({
          snippet: snippet,
          signalType: type,
          chapter: 1,
          keyword: m.keyword
        });
      }
    }

    // 去重（按位置/内容相似性）
    var seen = {};
    var unique = [];
    for (var j = 0; j < decisions.length; j++) {
      var d = decisions[j];
      var key = d.snippet.substring(0, 40);
      if (seen[key]) continue;
      seen[key] = true;
      unique.push(d);
    }
    return unique;
  },

  // ========== 方法2: 人设一致性检查 ==========
  /**
   * 对每条决策做人设一致性检查
   * @param {Array} decisionList extractChapterDecisions 返回的列表
   * @param {string} charText 角色人设文本
   * @param {Array} personalityHints 可选：已提取的性格关键词
   * @returns {{score:number, issues:Array, riskyDecisions:Array}}
   */
  checkCharacterConsistency: function(decisionList, charText, personalityHints) {
    var engine = this;
    var score = 100;
    var issues = [];
    var riskyDecisions = [];

    if (!decisionList || decisionList.length === 0) {
      return { score: 100, issues: ['未检测到本章重大决策事件，跳过人设一致性检查'], riskyDecisions: [] };
    }

    // 从人设文本提取关键词
    var personality = personalityHints || [];
    if (personality.length === 0 && charText) {
      for (var p = 0; p < engine.PERSONALITY_CONFLICTS.length; p++) {
        var conf = engine.PERSONALITY_CONFLICTS[p];
        for (var q = 0; q < conf.personality.length; q++) {
          if (charText.indexOf(conf.personality[q]) >= 0) {
            personality.push(conf.personality[q]);
          }
        }
      }
    }

    for (var i = 0; i < decisionList.length; i++) {
      var d = decisionList[i];
      var snippet = d.snippet;
      var decisionIssues = [];
      var hasTrigger = false;

      // 检查是否含触发条件词
      for (var tw = 0; tw < engine.TRIGGER_WORDS.length; tw++) {
        if (snippet.indexOf(engine.TRIGGER_WORDS[tw]) >= 0) {
          hasTrigger = true;
          break;
        }
      }

      // 检查人设-决策冲突对
      for (var c = 0; c < engine.PERSONALITY_CONFLICTS.length; c++) {
        var pair = engine.PERSONALITY_CONFLICTS[c];
        var personalityHit = false;
        for (var ph = 0; ph < pair.personality.length; ph++) {
          if (personality.indexOf(pair.personality[ph]) >= 0 || (charText && charText.indexOf(pair.personality[ph]) >= 0)) {
            personalityHit = true;
            break;
          }
        }
        if (!personalityHit) continue;

        for (var ch = 0; ch < pair.conflict.length; ch++) {
          if (snippet.indexOf(pair.conflict[ch]) >= 0) {
            var penalty = hasTrigger ? 5 : 10;
            score -= penalty;
            var issueMsg = '决策"…' + snippet.substring(0, 30) + '…"出现"' + pair.conflict[ch] + '"，与人设"';
            for (var ph2 = 0; ph2 < pair.personality.length; ph2++) {
              if (personality.indexOf(pair.personality[ph2]) >= 0 || (charText && charText.indexOf(pair.personality[ph2]) >= 0)) {
                issueMsg += pair.personality[ph2] + '/';
                break;
              }
            }
            issueMsg = issueMsg.substring(0, issueMsg.length - 1) + '"可能冲突';
            if (hasTrigger) issueMsg += '（检测到触发条件，扣分减半）';
            decisionIssues.push(issueMsg);
            riskyDecisions.push({
              decision: snippet.substring(0, 80),
              conflictWith: pair.personality.join('/'),
              action: pair.conflict[ch],
              hasTrigger: hasTrigger,
              penalty: penalty
            });
          }
        }
      }

      for (var di = 0; di < decisionIssues.length; di++) {
        issues.push(decisionIssues[di]);
      }
    }

    score = Math.max(0, Math.min(100, score));
    return { score: score, issues: issues, riskyDecisions: riskyDecisions };
  },

  // ========== 方法3: 伏笔支撑检查 ==========
  /**
   * 对本章"揭示/反转"类事件做伏笔支撑度检查
   * @param {Array} decisionList extractChapterDecisions 返回的列表
   * @param {string} outlineText 细纲/前文正文摘要
   * @param {number} chapterIndex 当前章节索引
   * @returns {{supportScore:number, unsupportedReveals:Array, suggestions:Array}}
   */
  checkForeshadowSupport: function(decisionList, outlineText, chapterIndex) {
    var engine = this;
    var supportScore = 100;
    var unsupportedReveals = [];
    var suggestions = [];

    if (!decisionList || decisionList.length === 0) {
      return { supportScore: 100, unsupportedReveals: [], suggestions: ['未检测到揭示类事件'] };
    }

    // 只对 revelation / emotion 类型做伏笔检查
    for (var i = 0; i < decisionList.length; i++) {
      var d = decisionList[i];
      if (d.signalType === 'decision') continue;

      var snippet = d.snippet;
      // 提取核心关键词（2-3个字的高频词，简单启发式：去除信号词后剩余的重要名词/动词）
      var signalKws = engine.SIGNAL_WORDS.revelation.concat(engine.SIGNAL_WORDS.emotion);
      var cleaned = snippet;
      for (var sk = 0; sk < signalKws.length; sk++) {
        cleaned = cleaned.split(signalKws[sk]).join('');
      }

      // 提取2-4字候选关键词（去单字虚词）
      var keywords = [];
      var stopWords = ['的', '了', '是', '在', '我', '你', '他', '她', '它', '这', '那', '和', '与', '也', '就', '都', '还', '有', '却', '但'];
      for (var len = 4; len >= 2; len--) {
        for (var pos = 0; pos <= cleaned.length - len; pos++) {
          var kw = cleaned.substring(pos, pos + len);
          var hasStop = false;
          for (var sw = 0; sw < stopWords.length; sw++) {
            if (kw.indexOf(stopWords[sw]) === 0 || kw.indexOf(stopWords[sw]) === kw.length - 1) {
              hasStop = true;
              break;
            }
          }
          if (hasStop) continue;
          if (keywords.indexOf(kw) < 0) keywords.push(kw);
          if (keywords.length >= 8) break;
        }
        if (keywords.length >= 8) break;
      }

      // 在细纲/前文中回溯
      var foreshadowCount = 0;
      if (outlineText) {
        for (var k = 0; k < keywords.length; k++) {
          if (outlineText.indexOf(keywords[k]) >= 0) {
            foreshadowCount++;
            if (foreshadowCount >= 3) break;
          }
        }
      }

      if (foreshadowCount >= 2) {
        // 支撑充足，不扣分
        suggestions.push('揭示"…' + snippet.substring(0, 30) + '…"有' + foreshadowCount + '处伏笔信号，支撑充足');
      } else if (foreshadowCount === 1) {
        supportScore -= 10;
        unsupportedReveals.push({
          reveal: snippet.substring(0, 80),
          foreshadowHits: foreshadowCount,
          suggestion: '支撑不足（仅1处信号），建议在前文至少再埋设1处可被解读为伏笔的细节'
        });
      } else {
        supportScore -= 25;
        unsupportedReveals.push({
          reveal: snippet.substring(0, 80),
          foreshadowHits: 0,
          suggestion: '"空降式"揭示——无前文伏笔！建议：1) 在前2-3章埋设≥2处可被事后解读为信号的细节；2) 或推迟此揭示到更合适的章节'
        });
      }
    }

    supportScore = Math.max(0, Math.min(100, supportScore));
    return { supportScore: supportScore, unsupportedReveals: unsupportedReveals, suggestions: suggestions };
  },

  // ========== 方法4: 世界观规则一致性检查 ==========
  /**
   * 检查本章是否违反世界观设定
   * @param {string} chapterText 本章正文
   * @param {string} worldText 世界观文本
   * @returns {{score:number, violations:Array, exceptions:Array}}
   */
  checkWorldConsistency: function(chapterText, worldText) {
    var engine = this;
    var score = 100;
    var violations = [];
    var exceptions = [];

    if (!worldText) {
      return { score: 100, violations: [], exceptions: [], note: '未提供世界观设定文本，跳过检查' };
    }
    if (!chapterText) {
      return { score: 100, violations: [], exceptions: [] };
    }

    // 从世界观文本提取"规则类"句子
    var worldLines = worldText.split(/[。\n]/);
    var ruleSentences = [];
    for (var w = 0; w < worldLines.length; w++) {
      var line = worldLines[w].trim();
      if (line.length < 6) continue;
      for (var rw = 0; rw < engine.WORLD_RULE_WORDS.length; rw++) {
        if (line.indexOf(engine.WORLD_RULE_WORDS[rw]) >= 0) {
          ruleSentences.push(line);
          break;
        }
      }
    }

    // 将本章按句子分段，检查是否与规则冲突
    var chapterLines = chapterText.split(/[。\n]/);
    for (var c = 0; c < chapterLines.length; c++) {
      var cLine = chapterLines[c].trim();
      if (cLine.length < 8) continue;

      // 检查是否有"突破"类词
      var hasBreakthrough = false;
      for (var bw = 0; bw < engine.BREAKTHROUGH_WORDS.length; bw++) {
        if (cLine.indexOf(engine.BREAKTHROUGH_WORDS[bw]) >= 0) {
          hasBreakthrough = true;
          break;
        }
      }
      if (!hasBreakthrough) continue;

      // 与规则句比对（简单重叠词判断）
      for (var r = 0; r < ruleSentences.length; r++) {
        var rule = ruleSentences[r];
        var overlapHits = 0;
        for (var ow = 2; ow <= 4; ow++) {
          for (var op = 0; op <= rule.length - ow; op++) {
            var piece = rule.substring(op, op + ow);
            if (piece.length < 2) continue;
            if (cLine.indexOf(piece) >= 0) overlapHits++;
            if (overlapHits >= 3) break;
          }
          if (overlapHits >= 3) break;
        }

        if (overlapHits >= 2) {
          // 可能存在冲突，检查本章是否有"例外"解释
          var broaderContext = engine._snippetAround(chapterText, chapterText.indexOf(cLine) >= 0 ? chapterText.indexOf(cLine) : 0, 120);
          var hasException = false;
          for (var ew = 0; ew < engine.EXCEPTION_WORDS.length; ew++) {
            if (broaderContext.indexOf(engine.EXCEPTION_WORDS[ew]) >= 0) {
              hasException = true;
              break;
            }
          }

          if (hasException) {
            exceptions.push({
              context: cLine.substring(0, 80),
              violatedRule: rule.substring(0, 80),
              note: '检测到"特殊条件"解释，冲突被豁免'
            });
          } else {
            score -= 20;
            violations.push({
              context: cLine.substring(0, 80),
              violatedRule: rule.substring(0, 80),
              suggestion: '此处似乎违反了世界观设定"' + rule.substring(0, 40) + '…"，建议：1) 在突破处补充特殊条件/代价解释；2) 或推迟此突破到更合适的章节'
            });
          }
          break;
        }
      }
    }

    score = Math.max(0, Math.min(100, score));
    return { score: score, violations: violations, exceptions: exceptions };
  },

  // ========== 方法5: 情感逻辑链检查 ==========
  /**
   * 检查情感反应是否有合理递进
   * @param {string} chapterText 本章正文
   * @param {string} previousChapterText 上一章文本（可选）
   * @returns {{progressionScore:number, jumpWarnings:Array}}
   */
  checkEmotionalProgression: function(chapterText, previousChapterText) {
    var engine = this;
    var score = 100;
    var jumpWarnings = [];

    if (!chapterText) {
      return { progressionScore: 100, jumpWarnings: [] };
    }

    // 按段落切分
    var paragraphs = chapterText.split(/\n\s*\n/);
    if (paragraphs.length < 2) {
      paragraphs = chapterText.split(/[。\n]/);
    }

    // 逐段记录最高情感级别
    var levelHistory = [];
    for (var p = 0; p < paragraphs.length; p++) {
      var para = paragraphs[p];
      if (!para || para.trim().length < 5) continue;
      var maxLevel = 0;
      for (var lv = 1; lv <= 4; lv++) {
        var key = 'level' + lv;
        var words = engine.EMOTION_LEVELS[key];
        for (var w = 0; w < words.length; w++) {
          if (para.indexOf(words[w]) >= 0) {
            maxLevel = lv;
            break;
          }
        }
        if (maxLevel === lv) break;
      }
      levelHistory.push({ para: p, level: maxLevel, text: para.substring(0, 50) });
    }

    // 检查跳步：从 <=1 跳到 >=3
    for (var i = 1; i < levelHistory.length; i++) {
      var prev = levelHistory[i - 1].level;
      var curr = levelHistory[i].level;
      if (prev <= 1 && curr >= 3) {
        // 检查本段是否有"触发事件"关键词（战斗/背叛/噩耗等）
        var paraText = paragraphs[levelHistory[i].para] || '';
        var triggerWords = ['突然', '噩耗', '背叛', '得知', '发现', '看到', '听见', '袭击', '出手'];
        var hasTrigger = false;
        for (var tw = 0; tw < triggerWords.length; tw++) {
          if (paraText.indexOf(triggerWords[tw]) >= 0) {
            hasTrigger = true;
            break;
          }
        }
        if (!hasTrigger) {
          score -= 10;
          jumpWarnings.push({
            context: levelHistory[i].text,
            fromLevel: prev,
            toLevel: curr,
            suggestion: '情感从级' + prev + '跳到级' + curr + '，缺乏合理递进。建议在中间补充"困惑→不安→对抗"的过渡段落或明确触发事件'
          });
        }
      }
    }

    // 检查过度情绪展示：级3+ 持续超过3段无转折
    var highLevelStreak = 0;
    for (var j = 0; j < levelHistory.length; j++) {
      if (levelHistory[j].level >= 3) {
        highLevelStreak++;
        if (highLevelStreak >= 3) {
          score -= 8;
          jumpWarnings.push({
            context: levelHistory[j].text,
            type: 'over-emotion',
            suggestion: '高强度情绪（级3+）已持续' + highLevelStreak + '段未转折，建议尽快引入新的情节或让情绪回落/转化，避免读者情感疲劳'
          });
          break;
        }
      } else {
        highLevelStreak = 0;
      }
    }

    score = Math.max(0, Math.min(100, score));
    return { progressionScore: score, jumpWarnings: jumpWarnings };
  },

  // ========== 方法6: 实力崩坏检测 ==========
  /**
   * 检查战斗/能力展示是否突破了既有实力体系
   * @param {string} chapterText 本章正文
   * @param {Array} previousPowerEvents 之前的实力事件（可选）
   * @param {string} powerSystemText 力量体系描述
   * @returns {{powerScore:number, powerRisks:Array}}
   */
  checkPowerConsistency: function(chapterText, previousPowerEvents, powerSystemText) {
    var engine = this;
    var score = 100;
    var powerRisks = [];

    if (!chapterText) {
      return { powerScore: 100, powerRisks: [] };
    }

    // 从力量体系文本中提取境界/等级关键词
    var realmKeyWords = [];
    if (powerSystemText) {
      // 简单提取"XX期/XX境/XX级/XX阶"
      var realmPatterns = [/[\u4e00-\u9fa5]{1,6}期/g, /[\u4e00-\u9fa5]{1,6}境/g, /[\u4e00-\u9fa5]{1,6}级/g, /[\u4e00-\u9fa5]{1,6}阶/g, /[\u4e00-\u9fa5]{1,6}重/g];
      for (var rp = 0; rp < realmPatterns.length; rp++) {
        var matches = powerSystemText.match(new RegExp(realmPatterns[rp].source, 'g'));
        if (matches) {
          for (var mk = 0; mk < matches.length; mk++) {
            if (realmKeyWords.indexOf(matches[mk]) < 0 && matches[mk].length >= 2) {
              realmKeyWords.push(matches[mk]);
            }
          }
        }
      }
    }

    // 检测本章战斗词是否与高等级同时出现（可能越级）
    var combatMatches = engine._findAllMatches(chapterText, engine.COMBAT_WORDS);
    for (var cm = 0; cm < combatMatches.length; cm++) {
      var combatPos = combatMatches[cm];
      var context = engine._snippetAround(chapterText, combatPos.index, 60);

      // 检查是否出现境界词
      var realmsInContext = [];
      for (var rk = 0; rk < realmKeyWords.length; rk++) {
        if (context.indexOf(realmKeyWords[rk]) >= 0) {
          realmsInContext.push(realmKeyWords[rk]);
        }
      }

      if (realmsInContext.length >= 2) {
        // 有多个境界同时出现，可能是越级
        var hasException = false;
        for (var ew = 0; ew < engine.EXCEPTION_WORDS.length; ew++) {
          if (context.indexOf(engine.EXCEPTION_WORDS[ew]) >= 0) {
            hasException = true;
            break;
          }
        }
        if (!hasException) {
          score -= 15;
          powerRisks.push({
            context: context.substring(0, 100),
            realms: realmsInContext,
            suggestion: '疑似越级挑战/实力崩坏：对抗对手境界为' + realmsInContext.join('/') + '，但未检测到"特殊条件/代价"解释。建议补充：底牌、代价、或临时的状态增益说明'
          });
        }
      }
    }

    // 检测"突然获得新能力"
    var abilityWords = ['获得了', '领悟了', '觉醒了', '掌握了', '新的能力', '新的功法', '获得传承'];
    for (var aw = 0; aw < abilityWords.length; aw++) {
      if (chapterText.indexOf(abilityWords[aw]) >= 0) {
        var pos = chapterText.indexOf(abilityWords[aw]);
        var ctx = engine._snippetAround(chapterText, pos, 60);
        var foreshadow = false;
        for (var fw = 0; fw < engine.TRIGGER_WORDS.length; fw++) {
          if (ctx.indexOf(engine.TRIGGER_WORDS[fw]) >= 0) {
            foreshadow = true;
            break;
          }
        }
        if (!foreshadow) {
          score -= 10;
          powerRisks.push({
            context: ctx.substring(0, 100),
            type: 'sudden-ability',
            suggestion: '新能力出现，但缺乏前置铺垫。建议在前文埋设资质/传承/伏笔信号，或给出明确的领悟触发条件'
          });
        }
      }
    }

    score = Math.max(0, Math.min(100, score));
    return { powerScore: score, powerRisks: powerRisks };
  },

  // ========== 方法7: 综合因果验证 ==========
  /**
   * 综合调用所有检查，返回完整的因果验证报告
   */
  fullCausalityCheck: function(chapterIndex, chapterText, charText, worldText, outlineText, previousChaptersSummary) {
    var engine = this;

    // 1) 提取决策事件
    var decisions = engine.extractChapterDecisions(chapterText, charText);

    // 2) 人设一致性
    var charResult = engine.checkCharacterConsistency(decisions, charText, []);

    // 3) 伏笔支撑
    var foresightText = outlineText || previousChaptersSummary || '';
    var foresightResult = engine.checkForeshadowSupport(decisions, foresightText, chapterIndex);

    // 4) 世界观一致性
    var worldResult = engine.checkWorldConsistency(chapterText, worldText);

    // 5) 情感逻辑链
    var emotionResult = engine.checkEmotionalProgression(chapterText, previousChaptersSummary);

    // 6) 实力崩坏
    var powerResult = engine.checkPowerConsistency(chapterText, [], worldText);

    // 汇总评分（加权平均）
    var dimensionScores = {
      characterConsistency: charResult.score,
      foreshadowSupport: foresightResult.supportScore,
      worldConsistency: worldResult.score,
      emotionalProgression: emotionResult.progressionScore,
      powerConsistency: powerResult.powerScore
    };

    var overallScore = Math.round(
      dimensionScores.characterConsistency * 0.25 +
      dimensionScores.foreshadowSupport * 0.25 +
      dimensionScores.worldConsistency * 0.20 +
      dimensionScores.emotionalProgression * 0.15 +
      dimensionScores.powerConsistency * 0.15
    );
    overallScore = Math.max(0, Math.min(100, overallScore));

    // 汇总严重问题/警告
    var criticalIssues = [];
    var warnings = [];
    var suggestions = [];
    var highlights = [];

    // 从各检查结果收集问题
    for (var i = 0; i < charResult.riskyDecisions.length; i++) {
      var rd = charResult.riskyDecisions[i];
      var item = {
        type: 'character-consistency',
        severity: rd.penalty >= 10 ? 'critical' : 'warning',
        message: '【人设不一致】' + rd.decision.substring(0, 60) + '… 与人设"' + rd.conflictWith + '"冲突（行为：' + rd.action + '）' + (rd.hasTrigger ? '（有触发条件）' : '')
      };
      if (rd.penalty >= 10) criticalIssues.push(item);
      else warnings.push(item);
    }

    for (var j = 0; j < foresightResult.unsupportedReveals.length; j++) {
      var ur = foresightResult.unsupportedReveals[j];
      var penalty = ur.foreshadowHits === 0 ? 25 : 10;
      var item2 = {
        type: 'foreshadow',
        severity: penalty >= 15 ? 'critical' : 'warning',
        message: '【伏笔不足】揭示"' + ur.reveal.substring(0, 60) + '…" 仅找到' + ur.foreshadowHits + '处伏笔信号。' + ur.suggestion
      };
      if (penalty >= 15) criticalIssues.push(item2);
      else warnings.push(item2);
    }

    for (var k = 0; k < worldResult.violations.length; k++) {
      var v = worldResult.violations[k];
      criticalIssues.push({
        type: 'world-rule',
        severity: 'critical',
        message: '【世界观冲突】"' + v.context.substring(0, 60) + '…" 似乎违反设定"' + v.violatedRule.substring(0, 60) + '…"。' + v.suggestion
      });
    }

    for (var m = 0; m < emotionResult.jumpWarnings.length; m++) {
      var jw = emotionResult.jumpWarnings[m];
      warnings.push({
        type: 'emotion-progression',
        severity: 'warning',
        message: '【情感跳步/过载】"' + jw.context.substring(0, 60) + '…" ' + jw.suggestion
      });
    }

    for (var n = 0; n < powerResult.powerRisks.length; n++) {
      var pr = powerResult.powerRisks[n];
      criticalIssues.push({
        type: 'power-creep',
        severity: 'critical',
        message: '【实力崩坏风险】"' + pr.context.substring(0, 60) + '…" ' + pr.suggestion
      });
    }

    // 汇总建议
    for (var s = 0; s < charResult.issues.length; s++) {
      if (suggestions.indexOf(charResult.issues[s]) < 0) suggestions.push(charResult.issues[s]);
    }
    for (var s2 = 0; s2 < foresightResult.suggestions.length; s2++) {
      suggestions.push(foresightResult.suggestions[s2]);
    }

    // 正面亮点
    if (decisions.length > 0) {
      var wellSupported = 0;
      var hasTriggerCount = 0;
      for (var dd = 0; dd < decisions.length; dd++) {
        for (var tw2 = 0; tw2 < engine.TRIGGER_WORDS.length; tw2++) {
          if (decisions[dd].snippet.indexOf(engine.TRIGGER_WORDS[tw2]) >= 0) {
            hasTriggerCount++;
            break;
          }
        }
      }
      if (hasTriggerCount > 0) {
        highlights.push('本章' + decisions.length + '个重大决策事件中，有' + hasTriggerCount + '个包含"想到/为了/因为"等动机解释，决策动机链较完整');
      }
      if (foresightResult.supportScore >= 90) {
        highlights.push('揭示/反转事件在前文有充足伏笔支撑');
      }
    }

    return {
      overallScore: overallScore,
      dimensionScores: dimensionScores,
      criticalIssues: criticalIssues,
      warnings: warnings,
      suggestions: suggestions,
      decisionsAnalyzed: decisions.length,
      highlights: highlights,
      chapter: chapterIndex
    };
  },

  // ========== 方法8: 人类可读报告生成 ==========
  /**
   * 将结构化报告转为人类可读文本
   */
  generateHumanReport: function(result) {
    if (!result) return '无报告数据';
    var lines = [];
    lines.push('========== 章节因果验证报告 ==========');
    lines.push('章节索引: ' + (result.chapter || '未知'));
    lines.push('综合评分: ' + result.overallScore + '/100');

    var rating = '优秀';
    if (result.overallScore < 60) rating = '严重问题';
    else if (result.overallScore < 75) rating = '需改进';
    else if (result.overallScore < 90) rating = '良好';
    lines.push('评价等级: ' + rating);
    lines.push('');

    lines.push('--- 分维度评分 ---');
    var dims = result.dimensionScores || {};
    lines.push('  人设一致性:     ' + dims.characterConsistency + '/100');
    lines.push('  伏笔支撑度:     ' + dims.foreshadowSupport + '/100');
    lines.push('  世界观合规性:   ' + dims.worldConsistency + '/100');
    lines.push('  情感递进合理性: ' + dims.emotionalProgression + '/100');
    lines.push('  实力体系稳定性: ' + dims.powerConsistency + '/100');
    lines.push('');

    lines.push('--- 分析事件数: ' + result.decisionsAnalyzed + ' ---');
    lines.push('');

    if (result.highlights && result.highlights.length > 0) {
      lines.push('【正面亮点】');
      for (var h = 0; h < result.highlights.length; h++) {
        lines.push('  ✓ ' + result.highlights[h]);
      }
      lines.push('');
    }

    if (result.criticalIssues && result.criticalIssues.length > 0) {
      lines.push('【严重问题】共' + result.criticalIssues.length + '项');
      for (var ci = 0; ci < result.criticalIssues.length; ci++) {
        lines.push('  ✗ ' + result.criticalIssues[ci].message);
      }
      lines.push('');
    }

    if (result.warnings && result.warnings.length > 0) {
      lines.push('【警告提示】共' + result.warnings.length + '项');
      for (var wi = 0; wi < result.warnings.length; wi++) {
        lines.push('  ⚠ ' + result.warnings[wi].message);
      }
      lines.push('');
    }

    if (result.suggestions && result.suggestions.length > 0) {
      lines.push('【改进建议】');
      for (var si = 0; si < Math.min(result.suggestions.length, 10); si++) {
        lines.push('  → ' + result.suggestions[si]);
      }
      lines.push('');
    }

    if (result.overallScore >= 90) {
      lines.push('【总结】本章因果链条较完整，人物决策、情感递进、设定一致性均保持较高水准。');
    } else if (result.overallScore >= 75) {
      lines.push('【总结】本章整体方向正确，但有若干细节可优化——重点处理"警告"部分，能显著提升章节质量。');
    } else if (result.overallScore >= 60) {
      lines.push('【总结】本章存在一定的因果漏洞，建议在"严重问题"和"警告"项中优先挑选2-3个核心矛盾重写。');
    } else {
      lines.push('【总结】本章因果链条存在严重断裂，建议大幅重写——先明确"角色动机链"，再补充伏笔和代价解释。');
    }

    return lines.join('\n');
  }
};

/* ========== 测试用例（手动在控制台执行） ==========
 *
 * // === 方法1: 提取决策 ===
 * var chapterText = '林青寒望着崖下翻涌的云海，终于下定了决心。她转过身来，踏出了那一步——这一次，她选择不再逃避。然而就在此刻，她心中一动，突然想起了师父临终前的那句话。原来如此，并非她不够强，而是她一直以来都在害怕。这才明白，所谓的"外冷"不过是她给自己编织的壳。';
 * var decisions = ChapterCausalityEngine.extractChapterDecisions(chapterText, '');
 * console.log('提取到的决策事件数:', decisions.length);
 * console.log(decisions);
 *
 * // === 方法2: 人设一致性 ===
 * var charText = '【林青寒】主角，性格外冷内热，谨慎冷静，实则内心柔软。修炼九天玄冰诀。';
 * var charCheck = ChapterCausalityEngine.checkCharacterConsistency(decisions, charText);
 * console.log('人设一致性评分:', charCheck.score);
 * console.log('风险决策:', charCheck.riskyDecisions);
 *
 * // === 方法3: 伏笔支撑检查 ===
 * var outlineText = '前章摘要：林青寒曾多次在梦中见到那片云海；师父临终前曾说过一句话，但她当时并不理解；她随身携带一枚玉佩，玉佩中似有奇异波动。';
 * var foresight = ChapterCausalityEngine.checkForeshadowSupport(decisions, outlineText, 5);
 * console.log('伏笔支撑评分:', foresight.supportScore);
 * console.log('未支撑揭示:', foresight.unsupportedReveals);
 *
 * // === 方法4: 世界观一致性 ===
 * var worldText = '【世界观】此大陆修为分为练气、筑基、金丹、元婴、化神五境。化神境无人能突破，是千古难题。禁止修士私斗，但修真界以实力为尊，唯有强者才能立足。';
 * var chapterText2 = '在生死关头，林青寒突破了化神境，她成功地做到了数千年来无人能完成的事。';
 * var worldCheck = ChapterCausalityEngine.checkWorldConsistency(chapterText2, worldText);
 * console.log('世界观评分:', worldCheck.score);
 * console.log('违规则:', worldCheck.violations);
 *
 * // === 方法5: 情感递进检查 ===
 * var chapterText3 = '她沉默地坐在窗前。\n\n她皱眉，有些疑惑。\n\n突然，她嘶吼着，完全崩溃了，无法言喻的痛苦让她失去意识。';
 * var emoCheck = ChapterCausalityEngine.checkEmotionalProgression(chapterText3, '');
 * console.log('情感递进评分:', emoCheck.progressionScore);
 * console.log('跳步警告:', emoCheck.jumpWarnings);
 *
 * // === 方法6: 实力崩坏检查 ===
 * var chapterText4 = '面对元婴期的强敌，她竟然领悟了新的功法，直接击败了对方。';
 * var powerCheck = ChapterCausalityEngine.checkPowerConsistency(chapterText4, [], worldText);
 * console.log('实力评分:', powerCheck.powerScore);
 * console.log('实力风险:', powerCheck.powerRisks);
 *
 * // === 方法7+8: 综合报告 ===
 * var fullChapter = '林青寒望着崖下翻涌的云海，终于下定了决心。她转过身来，踏出了那一步。然而就在此刻，她心中一动，突然想起了师父临终前的那句话。原来如此，并非她不够强，而是她一直以来都在害怕。这才明白，所谓的"外冷"不过是她给自己编织的壳。在生死关头，她孤注一掷地出手，因为她知道，若是不这样做，一切都将结束。';
 * var report = ChapterCausalityEngine.fullCausalityCheck(5, fullChapter, charText, worldText, outlineText, '');
 * console.log(ChapterCausalityEngine.generateHumanReport(report));
 */
