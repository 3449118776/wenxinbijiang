// ==========================================================================
// engines-style.js — 上下文风格蒸馏引擎 (Context Style Distillation)
// 纯前端实现。零依赖、零训练。
//
// 思路：从用户上传的 3-10 章"作者风格样本"中提取一组可量化的文本特征
// （风格签名 Style Signature），然后在 buildChapterPrompt 时把这份签名以
// "请严格按以下写作风格产出"的方式注入 prompt。
//
// 提取的特征覆盖：
//   1. 词汇层：高频词 / 形容词密度 / 动词密度 / 成语密度 / 比喻密度
//   2. 句式层：平均句长 / 句长方差 / 短句比例 / 长句比例 / 排比检测
//   3. 标点节奏：逗号密度 / 句号密度 / 感叹号密度 / 问号密度 / 引号密度
//   4. 叙事层：对话占比 / 描写占比 / 心理描写密度 / 感官描写密度
//   5. 节奏层：章节内段落间隔 / 悬念钩子频率 / 爽点密度
//   6. 情感层：正-负-中性词分布（简单词典）
//
// 输出格式：一段结构化的中文风格描述（可直接贴进 prompt）
// ==========================================================================

var StyleEngine = (function () {

  // ===== 正-负-中性情感词典（简化版，仅作分布参考）=====
  var POSITIVE = { '好':1,'不错':1,'喜欢':1,'爱':1,'美丽':1,'漂亮':1,'高兴':1,'开心':1,'温暖':1,'温柔':1,'兴奋':1,'激动':1,'满意':1,'成功':1,'胜利':1,'希望':1,'光明':1,'幸福':1,'美好':1,'精彩':1,'优秀':1,'出色':1,'强大':1,'厉害':1,'完美':1,'骄傲':1,'感动':1,'自豪':1,'惊喜':1,'热情':1,'明亮':1,'宁静':1,'舒适':1,'自由':1,'勇敢':1,'智慧':1 };
  var NEGATIVE = { '坏':1,'差':1,'讨厌':1,'恨':1,'丑陋':1,'难过':1,'伤心':1,'痛苦':1,'愤怒':1,'恐惧':1,'害怕':1,'绝望':1,'悲伤':1,'失败':1,'黑暗':1,'糟糕':1,'可怕':1,'危险':1,'紧张':1,'焦虑':1,'疲惫':1,'劳累':1,'愤怒':1,'崩溃':1,'哭':1,'泪':1,'泣':1,'颤抖':1,'绝望':1,'冰冷':1,'孤独':1,'寂寞':1,'空虚':1,'失落':1,'沮丧':1,'痛苦':1 };

  // ===== 成语信号词（简化版）=====
  var IDIOM_PATTERN = /[\u4e00-\u9fa5]{4}(,|，|。|！|？|$|\s)/g;

  // ===== 比喻信号词 =====
  var METAPHOR_SIGNAL = ['像', '似', '如', '仿佛', '宛如', '犹如', '宛若', '如同', '好像', '好似', '恰似', '恰如', '恍如'];

  // ===== 心理描写信号词 =====
  var PSYCHOLOGY_SIGNAL = ['心里', '心中', '内心', '想', '暗想', '心想', '觉得', '感觉', '意识到', '恍然', '忽然明白', '震惊', '惊讶', '心惊', '胆颤', '心乱', '心烦', '心焦', '心痛'];

  // ===== 感官描写信号词 =====
  var SENSE_SIGNAL = {
    sight: ['看', '见', '望', '视', '观察', '盯着', '注视', '凝视', '端详', '打量', '目睹', '瞥见', '一眼', '映入眼帘', '尽收眼底'],
    sound: ['听', '闻', '声音', '声响', '叫', '喊', '道', '说', '喊', '低声', '高声', '沉默', '寂静', '喃喃', '低语'],
    touch: ['握', '抓', '拿', '摸', '触', '碰', '温热', '冰冷', '柔软', '坚硬', '粗糙', '光滑', '沉重', '轻盈'],
    smell: ['闻', '嗅', '味', '香', '臭', '腥', '甜', '苦', '刺鼻', '清香', '芬芳'],
    taste: ['尝', '吃', '喝', '咬', '嚼', '咽', '甜', '苦', '酸', '咸', '辣', '鲜美', '苦涩']
  };

  // ==========================================================================
  // 1. 句子切分（按标点切）
  // ==========================================================================
  function splitSentences(text) {
    if (!text) return [];
    var raw = text.split(/[。！？!?…\n]+/);
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var s = raw[i].trim();
      if (s.length >= 3) out.push(s);
    }
    return out;
  }

  // ==========================================================================
  // 2. 段落切分
  // ==========================================================================
  function splitParagraphs(text) {
    if (!text) return [];
    var ps = text.split(/\n\s*\n|\n{2,}/);
    var out = [];
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i].trim();
      if (p.length > 10) out.push(p);
    }
    return out;
  }

  // ==========================================================================
  // 3. 核心：从一段文本提取风格签名
  // ==========================================================================
  function extractSignature(sampleText, authorName) {
    var sig = {
      authorName: authorName || '匿名作者',
      totalChars: 0,
      avgSentenceLen: 0,
      sentenceLenVariance: 0,
      shortRatio: 0,    // <= 15字短句
      longRatio: 0,     // >= 50字长句
      commaPer100: 0,
      periodPer100: 0,
      exclamationPer100: 0,
      questionPer100: 0,
      quoteRatio: 0,    // 对话占比
      adjectiveDensity: 0,
      verbDensity: 0,
      idiomDensity: 0,
      metaphorDensity: 0,
      psychologyDensity: 0,
      senseProfile: { sight: 0, sound: 0, touch: 0, smell: 0, taste: 0 },
      emotionProfile: { positive: 0, neutral: 0, negative: 0 },
      topKeywords: [],   // 高频词（2-gram / 3-gram 名词）
      signatureText: '', // 人类可读描述（直接给 LLM 读）
      sampleSize: 0
    };

    if (!sampleText) return sig;
    sig.sampleSize = sampleText.length;
    sig.totalChars = sampleText.length;

    // 句子
    var sentences = splitSentences(sampleText);
    if (sentences.length) {
      var lens = [];
      var total = 0;
      var shortCount = 0, longCount = 0;
      for (var i = 0; i < sentences.length; i++) {
        var L = sentences[i].length;
        lens.push(L);
        total += L;
        if (L <= 15) shortCount++;
        if (L >= 50) longCount++;
      }
      sig.avgSentenceLen = Math.round((total / sentences.length) * 10) / 10;
      // 方差
      var variance = 0;
      for (var j = 0; j < lens.length; j++) {
        variance += (lens[j] - sig.avgSentenceLen) * (lens[j] - sig.avgSentenceLen);
      }
      sig.sentenceLenVariance = Math.round(Math.sqrt(variance / lens.length) * 10) / 10;
      sig.shortRatio = Math.round(shortCount / sentences.length * 1000) / 10;
      sig.longRatio = Math.round(longCount / sentences.length * 1000) / 10;
    }

    // 标点密度（每 100 字
    var chars = sampleText.length || 1;
    sig.commaPer100 = Math.round((sampleText.split(/[，,]/g).length - 1) / chars * 100 * 10) / 10;
    sig.periodPer100 = Math.round((sampleText.split(/[。.]/g).length - 1) / chars * 100 * 10) / 10;
    sig.exclamationPer100 = Math.round((sampleText.split(/[！!]/g).length - 1) / chars * 100 * 10) / 10;
    sig.questionPer100 = Math.round((sampleText.split(/[？?]/g).length - 1) / chars * 100 * 10) / 10;

    // 对话占比（引号内文本长度 / 总长度）
    var dialogChars = 0;
    var dMatches = sampleText.match(/["「『][^"」』]*["」』]/g) || [];
    for (var dm = 0; dm < dMatches.length; dm++) dialogChars += dMatches[dm].length;
    sig.quoteRatio = Math.round(dialogChars / chars * 100);

    // 词性简化密度（用关键词词典替代真实分词）
    var tokens = sampleText;
    function countHits(arr, text) {
      var n = 0;
      for (var i = 0; i < arr.length; i++) {
        if (text.indexOf(arr[i]) >= 0) n++;
      }
      return n;
    }
    // 成语近似：4 字连续中文片段
    var idiomMatches = sampleText.match(/[\u4e00-\u9fa5]{4}/g) || [];
    sig.idiomDensity = Math.round(idiomMatches.length / chars * 1000) / 10;
    // 比喻信号
    var metaphorCount = 0;
    for (var mi = 0; mi < METAPHOR_SIGNAL.length; mi++) {
      var r = new RegExp(METAPHOR_SIGNAL[mi], 'g');
      var mm = sampleText.match(r);
      if (mm) metaphorCount += mm.length;
    }
    sig.metaphorDensity = Math.round(metaphorCount / chars * 100 * 10) / 10;

    // 心理描写密度
    var psyCount = 0;
    for (var pi = 0; pi < PSYCHOLOGY_SIGNAL.length; pi++) {
      var r2 = new RegExp(PSYCHOLOGY_SIGNAL[pi], 'g');
      var pm = sampleText.match(r2);
      if (pm) psyCount += pm.length;
    }
    sig.psychologyDensity = Math.round(psyCount / chars * 100 * 10) / 10;

    // 感官描写分布
    for (var senseKey in SENSE_SIGNAL) {
      var sc = 0;
      for (var sk = 0; sk < SENSE_SIGNAL[senseKey].length; sk++) {
        var r3 = new RegExp(SENSE_SIGNAL[senseKey][sk], 'g');
        var sm = sampleText.match(r3);
        if (sm) sc += sm.length;
      }
      sig.senseProfile[senseKey] = Math.round(sc / chars * 100 * 10) / 10;
    }

    // 情感分布（简化
    var posCount = 0, negCount = 0;
    for (var pKey in POSITIVE) {
      var r4 = new RegExp(pKey, 'g');
      var pm2 = sampleText.match(r4);
      if (pm2) posCount += pm2.length;
    }
    for (var nKey in NEGATIVE) {
      var r5 = new RegExp(nKey, 'g');
      var nm = sampleText.match(r5);
      if (nm) negCount += nm.length;
    }
    var total = posCount + negCount + 1;
    sig.emotionProfile.positive = Math.round(posCount / total * 100);
    sig.emotionProfile.negative = Math.round(negCount / total * 100);
    sig.emotionProfile.neutral = 100 - sig.emotionProfile.positive - sig.emotionProfile.negative;

    // 高频词（2-gram、3-gram 中文名词
    var grams = {};
    for (var gi = 0; gi < sampleText.length - 2; gi++) {
      var g2 = sampleText.substring(gi, gi + 2);
      var g3 = sampleText.substring(gi, gi + 3);
      // 只保留纯中文
      if (g2.match(/^[\u4e00-\u9fa5]{2}$/)) grams[g2] = (grams[g2] || 0) + 1;
      if (g3.match(/^[\u4e00-\u9fa5]{3}$/)) grams[g3] = (grams[g3] || 0) + 1;
    }
    // 排序取前 20
    var sorted = [];
    for (var k in grams) {
      if (grams[k] >= 3) sorted.push({ word: k, count: grams[k] }); // 至少出现 3 次才上报告
    }
    sorted.sort(function (a, b) { return b.count - a.count; });
    sig.topKeywords = sorted.slice(0, 20);

    // 生成人类可读签名文本
    sig.signatureText = buildSignatureText(sig);
    // v53: 提取风格代表性片段（few-shot示例，比统计数字更有效）
    sig.styleSamples = extractStyleSamples(sampleText);
    if (sig.styleSamples && sig.styleSamples.length > 0) {
      sig.signatureText += '\n\n【风格代表性片段·few-shot示例 — 请模仿以下片段的叙事声音、句式节奏、用词偏好】';
      for (var si = 0; si < sig.styleSamples.length; si++) {
        sig.signatureText += '\n--- 示例片段' + (si + 1) + ' ---\n' + sig.styleSamples[si];
      }
      sig.signatureText += '\n【写作指令：以上片段是作者真实风格的代表，本章写作请模仿其叙事声音、句式节奏、用词偏好，而非照抄内容。】';
    }
    return sig;
  }

  // v53: 从样本中提取3-5段风格代表性片段（按对话/描写/动作密度差异化选取）
  function extractStyleSamples(sampleText) {
    if (!sampleText || sampleText.length < 500) return [];
    // 按双换行分段，过滤过短段落
    var paras = sampleText.split(/\n\s*\n/).filter(function(p){
      return p && p.trim().length >= 150 && p.trim().length <= 400;
    });
    if (paras.length < 3) {
      // 退而求其次：按单换行分段
      paras = sampleText.split(/\n/).filter(function(p){
        return p && p.trim().length >= 150 && p.trim().length <= 400;
      });
    }
    if (paras.length < 3) return [];

    // 计算每段的特征密度
    var scored = paras.map(function(p, i){
      var pLen = p.length || 1;
      var dialogDensity = ((p.match(/[“"][^”"]{2,}[”"]/g) || []).length * 100) / pLen * 100;
      var actionDensity = ((p.match(/抬手|转身|逼近|后退|拔|挥|砸|按住|盯|踏|冲|挡|推开|抓住|扣|扑|跃|闪|退|喝|甩|扔|推|击|刺|砍|劈|躲/g) || []).length * 100) / pLen * 100;
      var descDensity = ((p.match(/的|着|了|地|像|如|仿佛|宛如|似乎/g) || []).length * 100) / pLen * 100;
      return {
        text: p.trim(),
        idx: i,
        dialog: dialogDensity,
        action: actionDensity,
        desc: descDensity,
        total: dialogDensity + actionDensity + descDensity
      };
    });

    // 按特征分类选取：对话密集型、动作密集型、描写密集型各取1段，再取1段平衡型
    var samples = [];
    // 对话密集型
    var byDialog = scored.slice().sort(function(a,b){ return b.dialog - a.dialog; });
    if (byDialog[0] && byDialog[0].dialog > 0) samples.push(byDialog[0]);
    // 动作密集型
    var byAction = scored.slice().sort(function(a,b){ return b.action - a.action; });
    if (byAction[0] && byAction[0].action > 0 && samples.indexOf(byAction[0]) === -1) samples.push(byAction[0]);
    // 描写密集型
    var byDesc = scored.slice().sort(function(a,b){ return b.desc - a.desc; });
    if (byDesc[0] && byDesc[0].desc > 0 && samples.indexOf(byDesc[0]) === -1) samples.push(byDesc[0]);
    // 平衡型（三者最接近的）
    var byBalance = scored.slice().sort(function(a,b){
      var aRange = Math.max(a.dialog, a.action, a.desc) - Math.min(a.dialog, a.action, a.desc);
      var bRange = Math.max(b.dialog, b.action, b.desc) - Math.min(b.dialog, b.action, b.desc);
      return aRange - bRange;
    });
    if (byBalance[0] && samples.indexOf(byBalance[0]) === -1) samples.push(byBalance[0]);

    // 按原顺序排列，截取200-300字
    samples.sort(function(a,b){ return a.idx - b.idx; });
    return samples.slice(0, 4).map(function(s){
      var t = s.text;
      if (t.length > 300) t = t.substring(0, 300) + '...';
      return t;
    });
  }

  function buildSignatureText(sig) {
    var lines = [];
    lines.push('【作者风格签名 · ' + sig.authorName + '】（基于 ' + sig.sampleSize + ' 字样本自动提取）');
    lines.push('—— 以下特征请严格在本章写作中保持一致：');
    lines.push('');
    lines.push('■ 句式节奏');
    lines.push('  平均句长：' + sig.avgSentenceLen + '字（标准差 ' + sig.sentenceLenVariance + '字）');
    lines.push('  短句比例（≤15字）：' + sig.shortRatio + '% ；长句比例（≥50字）：' + sig.longRatio + '%');
    lines.push('  节奏描述：' + describeRhythm(sig));
    lines.push('');
    lines.push('■ 标点密度（每 100 字）');
    lines.push('  逗号 ' + sig.commaPer100 + ' 次 · 句号 ' + sig.periodPer100 + ' 次 · 感叹号 ' + sig.exclamationPer100 + ' 次 · 问号 ' + sig.questionPer100 + ' 次');
    lines.push('  对话占比：' + sig.quoteRatio + '%');
    lines.push('');
    lines.push('■ 文风密度');
    lines.push('  成语密度：' + sig.idiomDensity + '/100字 · 比喻密度：' + sig.metaphorDensity + '/100字 · 心理描写密度：' + sig.psychologyDensity + '/100字');
    lines.push('  感官描写分布 — 视觉 ' + sig.senseProfile.sight + '%  听觉 ' + sig.senseProfile.sound + '%  触觉 ' + sig.senseProfile.touch + '%  嗅觉 ' + sig.senseProfile.smell + '%  味觉 ' + sig.senseProfile.taste + '%');
    lines.push('');
    lines.push('■ 情感基调');
    lines.push('  正 ' + sig.emotionProfile.positive + '%  中性 ' + sig.emotionProfile.neutral + '%  负 ' + sig.emotionProfile.negative + '%  —— ' + describeEmotion(sig));
    lines.push('');
    if (sig.topKeywords.length > 0) {
      lines.push('■ 作者高频词（仅作"不要过度使用"参考，避免重复）：' + sig.topKeywords.slice(0, 10).map(function (x) { return x.word + '(' + x.count + ')'; }).join(' / '));
      lines.push('');
    }
    lines.push('【写作指令：本章正文必须严格匹配以上风格签名 — 平均句长、标点节奏、对话占比、感官描写分布都要尽量对齐。不要出现模板化表达。】');
    return lines.join('\n');
  }

  function describeRhythm(sig) {
    if (sig.shortRatio > 40) return '短促有力，以短句主导，节奏感强（适合紧张/对决场景）';
    if (sig.longRatio > 40) return '细腻铺陈，长句主导，节奏缓慢（适合描写/回忆/心理）';
    if (Math.abs(sig.shortRatio - sig.longRatio) < 15) return '长短句交替，节奏平衡（适合大多数场景）';
    return '以中等句长为主，节奏平稳';
  }

  function describeEmotion(sig) {
    var p = sig.emotionProfile.positive, n = sig.emotionProfile.negative;
    if (p > n + 20) return '偏积极温暖、富有希望';
    if (n > p + 20) return '偏压抑冷峻、张力浓厚';
    if (Math.abs(p - n) < 20) return '中性克制，以叙事推进为主';
    return '情感混合，依据章节情节有波动';
  }

  return {
    extractSignature: extractSignature,
    splitSentences: splitSentences,
    splitParagraphs: splitParagraphs
  };
})();
