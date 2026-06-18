// quality.js - 轻量中文网文质量评估 v52
// 暴露 window.QualityEngine：score / attach / lastHints / analyzeChapter / learnFromEdit
// 主要被 write-editor.js 中的 AI 生成流程调用
(function () {
  // 基础"毒点/模版腔"模式（仅启发式，非严格）
  var POISON_PATTERNS = [
    { name: '空洞震惊', re: /(众人震惊|全场震惊|所有人都惊呆了|一片哗然|全场哗然)/g },
    { name: '空泛叙事', re: /(事情没那么简单|事情变得复杂起来|真正的挑战才刚刚开始|一切才刚刚开始|命运的齿轮开始转动)/g },
    { name: 'AI 腔心理', re: /(他的内心五味杂陈|心中百感交集|空气仿佛凝固|时间仿佛静止|他心中暗想|不禁感叹|心中暗道|暗自思忖|心中一动)/g },
    { name: '万能形容', re: /(极其强大|无比恐怖|深不可测|不可名状|难以言喻)/g },
    { name: '重复口水', re: /(缓缓地.{0,8}缓缓地|慢慢地.{0,8}慢慢地|冷冷.{0,10}冷冷)/g },
    { name: '量词模板', re: /(一道.{0,6}一抹|一抹.{0,6}一丝|一丝.{0,6}一缕|一缕.{0,6}一道)/g },
    { name: '副词堆砌', re: /(缓缓.{0,6}慢慢|慢慢.{0,6}轻轻|轻轻.{0,6}淡淡)/g }
  ];

  var HOOK_PATTERN = /(然而|可|却|但|就在这时|谁也没想到|门外|身后|真正|不是|只听|传来|出现|抬头|脸色一变|原来|其实|秘密|问题是|就在此刻|就在那一瞬间)/;

  // 信息密度关键词（推进剧情的信号）
  var INFO_DENSITY_SIGNALS = /(发现|揭示|原来|真相|秘密|证据|线索|突破|变化|改变|新|首|第|初|意外|突然|竟然|居然|终于|终于|才|不过|可惜|糟糕|完了|不好)/g;

  function countMatches(text, re) {
    try {
      var m = text.match(re);
      return m ? m.length : 0;
    } catch (e) { return 0; }
  }

  function scoreChinese(text) {
    if (!text) return { score: 0, weakness: [], strength: [], details: {} };
    var len = text.length;
    var score = 60;
    var weakness = [];
    var strength = [];
    var details = {};

    // 基础：长度
    if (len >= 600 && len <= 4000) { score += 10; strength.push('篇幅适中'); }
    else if (len < 300) { score -= 8; weakness.push('篇幅偏短'); }
    else if (len > 5000) { score -= 5; weakness.push('篇幅过长'); }

    // 章末悬念钩子
    var tail = text.slice(-Math.min(400, len));
    if (HOOK_PATTERN.test(tail)) {
      score += 10; strength.push('章末有悬念钩子');
    } else {
      score -= 8; weakness.push('章末缺少悬念钩子');
    }

    // 开篇是否有冲突（前 200 字里是否含强情绪/动作关键词）
    var head = text.slice(0, Math.min(220, len));
    var headAction = /(逼|杀|危|救|断|碎|血|冲|撞|怒|冷|喝|斥|冷喝|一掌|一脚|一剑|一斧|拳|掌|刀|剑|枪|火|崩|裂|轰|命令|圣旨|证据|危局|追杀|伏击|围|冲突)/.test(head);
    if (headAction) { score += 10; strength.push('开篇切入冲突'); }
    else { score -= 6; weakness.push('开篇偏平'); }

    // 对话密度（粗略：中文引号对数量）
    var quotes = countMatches(text, /[""""'""'"]|["""]/g);
    var dialogPairs = Math.floor(quotes / 2);
    if (len >= 1000) {
      if (dialogPairs >= 4 && dialogPairs <= 20) { score += 6; strength.push('对话密度适中'); }
      else if (dialogPairs === 0) { score -= 5; weakness.push('缺少对话'); }
      else if (dialogPairs > 20) { score -= 3; weakness.push('对话过多，叙述不足'); }
    }
    details.dialogPairs = dialogPairs;

    // 动作/细节（粗略：中文标点分句数 & 含动作动词的比例）
    var sentences = text.split(/[。！？!?\n]/).filter(function (s) { return s.trim().length > 2; });
    if (sentences.length > 15 && len >= 1000) strength.push('句式节奏丰富');

    // 毒点检测
    var poisonHits = [];
    POISON_PATTERNS.forEach(function (p) {
      var cnt = countMatches(text, p.re);
      if (cnt >= 2) poisonHits.push(p.name + 'x' + cnt);
    });
    if (poisonHits.length > 0) {
      score -= Math.min(15, poisonHits.length * 5);
      weakness.push('模板化表达：' + poisonHits.join('、'));
    } else {
      strength.push('低模板化');
    }

    // === v52: 信息密度检测 ===
    var infoCount = countMatches(text, INFO_DENSITY_SIGNALS);
    if (len >= 500) {
      var infoPer500 = Math.round(infoCount / (len / 500));
      details.infoPer500 = infoPer500;
      if (infoPer500 >= 3) { score += 5; strength.push('信息密度高（每500字' + infoPer500 + '个信息点）'); }
      else if (infoPer500 < 1) { score -= 5; weakness.push('信息密度过低，可能存在水字数'); }
    }

    // === v52: 对话/叙述比例 ===
    if (len >= 500) {
      // 估算对话占比（引号内容占总字数的比例）
      var dialogChars = 0;
      var dRE = /["""][^""""]*["""]/g;
      var dm;
      while ((dm = dRE.exec(text)) !== null) {
        dialogChars += dm[0].length;
      }
      var dialogRatio = dialogChars / len;
      details.dialogRatio = Math.round(dialogRatio * 100);
      if (dialogRatio > 0.6) { score -= 4; weakness.push('对话占比过高（' + Math.round(dialogRatio * 100) + '%），建议增加叙述和描写'); }
      else if (dialogRatio < 0.05 && len > 1000) { score -= 3; weakness.push('几乎无对话，建议增加人物互动'); }
    }

    // === v52: 段落节奏检测 ===
    var paragraphs = text.split(/\n\n+/);
    details.paragraphCount = paragraphs.length;
    if (paragraphs.length >= 5) {
      var avgParaLen = len / paragraphs.length;
      details.avgParaLen = Math.round(avgParaLen);
      if (avgParaLen > 300) { score -= 3; weakness.push('段落过长（平均' + Math.round(avgParaLen) + '字），建议拆分'); }
    }

    score = Math.max(0, Math.min(100, score));
    return { score: score, weakness: weakness, strength: strength, length: len, details: details };
  }

  function makeReport(result, opts) {
    var info = scoreChinese(result || '');
    var genre = (opts && opts.genre) || '';
    var genreTips = [];
    if (/(玄幻|仙侠)/.test(genre)) genreTips.push('玄幻/仙侠类：注意修炼境界、代价与伏笔的平衡');
    if (/都市/.test(genre)) genreTips.push('都市类：注意职业硬核与情感线的平衡');
    if (/历史/.test(genre)) genreTips.push('历史类：注意时代语境与器物/礼法的合理性');
    if (/科幻/.test(genre)) genreTips.push('科幻类：注意科技设定的自洽与对人性的影响');

    return {
      score: info.score,
      weaknesses: info.weakness,
      strengths: info.strength,
      length: info.length,
      details: info.details,
      genreTips: genreTips,
      updatedAt: Date.now()
    };
  }

  // 把评估结果写到作品对象的章节附加信息中
  function attach(work, chapterIdx, report) {
    if (!work) return;
    try {
      if (!work.chapters) work.chapters = [];
      while (work.chapters.length <= chapterIdx) work.chapters.push({});
      var ch = work.chapters[chapterIdx] = work.chapters[chapterIdx] || {};
      ch._quality = report;
    } catch (e) {}
  }

  // === v52: 返回可操作的短板提示（不只是摘要，而是具体指令） ===
  function lastHints(work, chapterIdx) {
    if (!work) return null;
    try {
      if (!work.chapters || !work.chapters[chapterIdx]) return null;
      var r = work.chapters[chapterIdx]._quality;
      if (!r) return null;
      
      var hints = [];
      // 生成具体可操作的提示
      if (r.weaknesses && r.weaknesses.length) {
        for (var wi = 0; wi < r.weaknesses.length; wi++) {
          var w = r.weaknesses[wi];
          if (w.indexOf('篇幅偏短') >= 0) hints.push('本章字数偏少，下一章请确保内容充实，至少写满1500字');
          else if (w.indexOf('篇幅过长') >= 0) hints.push('本章字数偏多，下一章请控制在2000-3000字，避免信息过载');
          else if (w.indexOf('缺少悬念钩子') >= 0) hints.push('本章结尾缺少悬念钩子，下一章结尾必须在关键时刻断章，让读者忍不住点"下一章"');
          else if (w.indexOf('开篇偏平') >= 0) hints.push('本章开篇不够吸引人，下一章开头300字内必须出现冲突或悬念');
          else if (w.indexOf('模板化表达') >= 0) hints.push('本章出现了AI模板化表达，下一章请避免使用"众人震惊/空气凝固/心中暗道"等套路句式');
          else if (w.indexOf('缺少对话') >= 0) hints.push('本章缺少人物对话，下一章请增加角色互动和对话，让角色"说"而不是光"写"');
          else if (w.indexOf('对话过多') >= 0) hints.push('本章对话占比过高，下一章请增加叙述和描写，平衡对话与叙述的比例');
          else if (w.indexOf('信息密度过低') >= 0) hints.push('本章信息密度不足，下一章请确保每500字至少推进1个新信息点');
          else if (w.indexOf('段落过长') >= 0) hints.push('本章段落偏长，下一章请将长段落拆分为短段落，紧张处用短句制造节奏');
          else hints.push('注意：' + w);
        }
      }
      
      // 质量趋势分析（对比前三章）
      var trend = '';
      if (chapterIdx >= 3) {
        var scores = [];
        for (var ti = Math.max(0, chapterIdx - 3); ti <= chapterIdx; ti++) {
          if (work.chapters[ti] && work.chapters[ti]._quality) {
            scores.push(work.chapters[ti]._quality.score);
          }
        }
        if (scores.length >= 3) {
          var recent = scores.slice(-3);
          if (recent[2] < recent[1] && recent[1] < recent[0]) {
            trend = '⚠️ 质量连续下降（' + recent.join('→') + '），请下一章务必提升质量';
          } else if (recent[2] > recent[1] && recent[1] > recent[0]) {
            trend = '✅ 质量持续上升（' + recent.join('→') + '），保持这个势头';
          } else {
            trend = '质量波动中（' + recent.join('→') + '），注意稳定输出';
          }
        }
      }
      if (trend) hints.push(trend);
      
      return {
        summary: '质量分 ' + r.score + '/100' + (r.weaknesses && r.weaknesses.length ? '（' + r.weaknesses.slice(0, 2).join('、') + '）' : ''),
        report: r,
        hints: hints
      };
    } catch (e) { return null; }
  }

  // === v52: 深度章节分析（比 score 更详细，在生成后调用） ===
  function analyzeChapter(text, work) {
    if (!text) return null;
    var info = scoreChinese(text);
    var analysis = {
      score: info.score,
      weaknesses: info.weakness,
      strengths: info.strength,
      details: info.details,
      // 统计角色出场
      characterAppearances: {},
      // 检测到的伏笔关键词
      foreshadowingDetected: [],
      // 情绪弧线
      emotionArc: []
    };
    
    // 检测角色出场
    if (work && work.chars) {
      var charNameRE = /[【\[]([^】\]\n]{1,12})[】\]]/g;
      var nmMatch;
      while ((nmMatch = charNameRE.exec(work.chars)) !== null) {
        var nm = nmMatch[1].trim();
        if (nm && nm !== '关系网' && nm !== '年龄' && nm !== '外貌') {
          var appearCount = countMatches(text, new RegExp(nm, 'g'));
          if (appearCount > 0) analysis.characterAppearances[nm] = appearCount;
        }
      }
    }
    
    // 检测伏笔关键词
    var foreshadowRE = /(伏笔|悬念|暗线|埋|隐藏|秘密|真相|揭露|反转|意外|惊人|才发现|原来|这才知道|才明白|终于|最终|结局|谜底|揭开|揭晓)/g;
    var fm;
    while ((fm = foreshadowRE.exec(text)) !== null) {
      if (analysis.foreshadowingDetected.indexOf(fm[1]) === -1) {
        analysis.foreshadowingDetected.push(fm[1]);
      }
    }
    
    return analysis;
  }

  // === v52: 用户编辑学习 · 从用户修改中提取偏好 ===
  // 比较 AI 原稿和用户修改后的文本，提取用户偏好
  function learnFromEdit(aiOriginal, userEdited) {
    if (!aiOriginal || !userEdited) return null;
    
    var learnings = {
      userDeleted: [],      // 用户删了什么（AI 写多了）
      userAdded: [],        // 用户加了什么（AI 漏了）
      userRewrote: [],      // 用户重写了什么（AI 写错了）
      stylePrefs: {}        // 风格偏好
    };
    
    // 简单对比：如果用户版本更短，说明用户删了内容
    if (userEdited.length < aiOriginal.length * 0.8) {
      learnings.userDeleted.push('用户删减了大量内容，AI 输出可能过于冗长，请精简');
    }
    
    // 如果用户版本更长，说明用户加了内容
    if (userEdited.length > aiOriginal.length * 1.2) {
      learnings.userAdded.push('用户补充了大量内容，AI 输出可能不够详细，请增加细节');
    }
    
    // 检测 AI 腔是否被删除
    var aiClichés = ['众人震惊', '空气凝固', '心中暗道', '心头一颤', '瞳孔一缩', '嘴角勾起', '目光如炬'];
    var deletedClichés = [];
    aiClichés.forEach(function (c) {
      if (aiOriginal.indexOf(c) >= 0 && userEdited.indexOf(c) === -1) {
        deletedClichés.push(c);
      }
    });
    if (deletedClichés.length > 0) {
      learnings.userDeleted.push('用户删除了AI模板化表达：' + deletedClichés.join('、'));
    }
    
    // 检测用户偏好：如果用户添加了更多对话
    var origQuotes = countMatches(aiOriginal, /["""]/g);
    var editedQuotes = countMatches(userEdited, /["""]/g);
    if (editedQuotes > origQuotes * 1.5) {
      learnings.stylePrefs.moreDialog = true;
      learnings.userAdded.push('用户增加了大量对话，偏好对话更多的写作风格');
    }
    
    // 检测用户偏好：如果用户添加了更多段落分隔
    var origParas = (aiOriginal.match(/\n\n/g) || []).length;
    var editedParas = (userEdited.match(/\n\n/g) || []).length;
    if (editedParas > origParas * 1.5) {
      learnings.stylePrefs.shorterParagraphs = true;
      learnings.userAdded.push('用户增加了段落分隔，偏好更短的段落');
    }
    
    // 检测用户偏好：如果用户删除了大量副词
    var adverbRE = /(缓缓|慢慢|轻轻|淡淡|微微|稍稍|渐渐|悄悄|默默|静静|幽幽)/g;
    var origAdverbs = countMatches(aiOriginal, adverbRE);
    var editedAdverbs = countMatches(userEdited, adverbRE);
    if (origAdverbs > 0 && editedAdverbs < origAdverbs * 0.5) {
      learnings.stylePrefs.lessAdverbs = true;
      learnings.userDeleted.push('用户删除了大量副词，偏好更简洁有力的描写');
    }
    
    // 记录学习时间
    learnings.learnedAt = Date.now();
    learnings.hasLearnings = learnings.userDeleted.length > 0 || learnings.userAdded.length > 0 || learnings.userRewrote.length > 0;
    
    return learnings;
  }

  window.QualityEngine = {
    score: makeReport,
    attach: attach,
    lastHints: lastHints,
    analyzeChapter: analyzeChapter,
    learnFromEdit: learnFromEdit,
    _scoreChinese: scoreChinese,
    _POISON: POISON_PATTERNS
  };
})();