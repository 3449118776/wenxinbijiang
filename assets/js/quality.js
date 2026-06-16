// quality.js - 轻量中文网文质量评估
// 暴露 window.QualityEngine：score(result, opts) / attach(work, idx, report) / lastHints(work, idx)
// 主要被 write-editor.js 中的 AI 生成流程调用
(function () {
  // 基础"毒点/模版腔"模式（仅启发式，非严格）
  var POISON_PATTERNS = [
    { name: '空洞震惊', re: /(众人震惊|全场震惊|所有人都惊呆了|一片哗然|全场哗然)/g },
    { name: '空泛叙事', re: /(事情没那么简单|事情变得复杂起来|真正的挑战才刚刚开始|一切才刚刚开始|命运的齿轮开始转动)/g },
    { name: 'AI 腔心理', re: /(他的内心五味杂陈|心中百感交集|空气仿佛凝固|时间仿佛静止|他心中暗想|不禁感叹)/g },
    { name: '万能形容', re: /(极其强大|无比恐怖|深不可测|不可名状|难以言喻)/g },
    { name: '重复口水', re: /(缓缓地.{0,8}缓缓地|慢慢地.{0,8}慢慢地|冷冷.{0,10}冷冷)/g }
  ];

  var HOOK_PATTERN = /(然而|可|却|但|就在这时|谁也没想到|门外|身后|真正|不是|只听|传来|出现|抬头|脸色一变|原来|其实|秘密|问题是|就在此刻|就在那一瞬间)/;

  function countMatches(text, re) {
    try {
      var m = text.match(re);
      return m ? m.length : 0;
    } catch (e) { return 0; }
  }

  function scoreChinese(text) {
    if (!text) return { score: 0, weakness: [], strength: [] };
    var len = text.length;
    var score = 60;
    var weakness = [];
    var strength = [];

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
    var quotes = countMatches(text, /[""""'""'"]|[“""]/g);
    var dialogPairs = Math.floor(quotes / 2);
    if (len >= 1000) {
      if (dialogPairs >= 4) { score += 6; strength.push('对话密度适中'); }
      else if (dialogPairs === 0) { score -= 5; weakness.push('缺少对话'); }
    }

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

    score = Math.max(0, Math.min(100, score));
    return { score: score, weakness: weakness, strength: strength, length: len };
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

  function lastHints(work, chapterIdx) {
    if (!work) return null;
    try {
      if (!work.chapters || !work.chapters[chapterIdx]) return null;
      var r = work.chapters[chapterIdx]._quality;
      if (!r) return null;
      return {
        summary: '质量分 ' + r.score + '/100' + (r.weaknesses.length ? '（' + r.weaknesses.slice(0, 2).join('、') + '）' : ''),
        report: r
      };
    } catch (e) { return null; }
  }

  window.QualityEngine = {
    score: makeReport,
    attach: attach,
    lastHints: lastHints,
    _scoreChinese: scoreChinese,
    _POISON: POISON_PATTERNS
  };
})();
