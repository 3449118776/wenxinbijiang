"use strict";

/* 文心笔匠 - 章节质量引擎 v29
 * 多维度评分：节奏/爽点/钩子/对话/句长方差/重复词/一致性/字数/段落/题材契合
 * 输出：{ score, dims, weaknesses, suggestions, hints }
 */
(function () {
  // 题材爽点关键词
  var GENRE_BEATS = {
    '玄幻': ['炸开', '轰碎', '突破', '晋升', '吐血', '气血翻涌', '倒飞', '一拳', '法宝', '秒杀'],
    '都市': ['打脸', '秒杀', '咆哮', '跪下', '道歉', '转账', '千万', '百万', '怒吼', '闭嘴'],
    '历史': ['拔刀', '落马', '溃败', '跪地', '请罪', '圣旨', '调兵', '斩首', '诛', '降'],
    '科幻': ['破解', '穿透', '击穿', '激活', '超频', '过载', '锁定', '警报', '自毁', '纳米'],
    '悬疑': ['尸体', '凶器', '线索', '指纹', '破绽', '真相', '凶手', '失踪', '证据', '谎言'],
    '言情': ['吻', '拥抱', '心跳', '脸红', '哽咽', '流泪', '告白', '转身', '颤抖', '耳尖'],
    '仙侠': ['剑光', '剑气', '法诀', '心魔', '渡劫', '飞升', '道心', '仙气', '灵韵', '劫雷'],
    '军事': ['开火', '突击', '掩护', '弹药', '撤退', '锁定', '狙击', '爆破', '无线电', '三点钟'],
    '游戏': ['暴击', '技能', '装备', '爆装', '击杀', 'BOSS', '排行榜', '公会', '副本', '金光']
  };
  function getGenreBeats(genre) {
    if (!genre) return [];
    for (var k in GENRE_BEATS) {
      if (genre.indexOf(k) >= 0) return GENRE_BEATS[k];
    }
    return [];
  }
  function splitSentences(text) {
    return (text || '').split(/[。！？!?\n]+/).map(function (s) {
      return s.trim();
    }).filter(Boolean);
  }
  function variance(arr) {
    if (!arr.length) return 0;
    var m = 0;
    for (var i = 0; i < arr.length; i++) m += arr[i];
    m = m / arr.length;
    var v = 0;
    for (var j = 0; j < arr.length; j++) v += (arr[j] - m) * (arr[j] - m);
    return v / arr.length;
  }

  // 主入口
  function qualityScore(text, opts) {
    opts = opts || {};
    var work = opts.work || {};
    var prevContent = opts.prevContent || '';
    var genre = opts.genre || '';
    var dims = {};
    var weaknesses = [];
    var hints = [];
    var len = text.length;
    var paragraphs = text.split(/\n+/).filter(function (p) {
      return p.trim();
    });
    var sentences = splitSentences(text);

    // 1. 字数（2000-3000 最佳）
    var wordScore = 100;
    if (len < 1500) {
      wordScore = Math.max(40, Math.round(len / 15));
      weaknesses.push('字数偏少(' + len + '字)');
      hints.push('每章保持 2000-3000 字');
    } else if (len < 2000) {
      wordScore = 75;
    } else if (len <= 3500) {
      wordScore = 100;
    } else if (len <= 5000) {
      wordScore = 80;
      weaknesses.push('字数偏多');
    } else {
      wordScore = 60;
      weaknesses.push('字数过长(' + len + '字)');
      hints.push('一章控制在 3000 字以内，长则拆章');
    }
    dims.wordCount = wordScore;

    // 2. 段落分布
    var longParas = paragraphs.filter(function (p) {
      return p.length > 200;
    });
    var paraScore = 100;
    if (paragraphs.length < 8) {
      paraScore = 50;
      weaknesses.push('段落过少');
      hints.push('增加分段，避免大段水文，每段 30-150 字');
    }
    if (longParas.length / Math.max(1, paragraphs.length) > 0.25) {
      paraScore = Math.min(paraScore, 60);
      weaknesses.push('大段超过 200 字段落过多');
      hints.push('把超过 200 字的段落拆成 2-3 段');
    }
    dims.paragraphs = paraScore;

    // 3. 句长方差（防 AI 单调节奏）
    var sLens = sentences.map(function (s) {
      return s.length;
    });
    var v = variance(sLens);
    var avg = sLens.length ? sLens.reduce(function (a, b) {
      return a + b;
    }, 0) / sLens.length : 0;
    var rhythmScore = 100;
    if (v < 60) {
      rhythmScore = 55;
      weaknesses.push('句长单调（方差仅 ' + v.toFixed(0) + '）');
      hints.push('交替使用超短句（≤8字）和长句（≥25字），制造节奏');
    } else if (v < 120) {
      rhythmScore = 75;
    }
    if (avg > 38) {
      rhythmScore = Math.min(rhythmScore, 65);
      weaknesses.push('平均句长过长');
      hints.push('多写短句、用句号截断长句');
    }
    dims.rhythm = rhythmScore;

    // 4. 对话比例（理想 25-55%）
    var dialogChars = 0;
    var dlogMatches = text.match(/[“"][^”"]{2,}[”"]/g) || [];
    for (var d = 0; d < dlogMatches.length; d++) dialogChars += dlogMatches[d].length;
    var dialogRatio = len ? dialogChars / len : 0;
    var dialogScore = 100;
    if (dialogRatio < 0.10) {
      dialogScore = 55;
      weaknesses.push('对话过少(' + Math.round(dialogRatio * 100) + '%)');
      hints.push('补 2-3 段对话，让人物开口');
    } else if (dialogRatio < 0.20) {
      dialogScore = 75;
    } else if (dialogRatio > 0.65) {
      dialogScore = 60;
      weaknesses.push('对话过多(' + Math.round(dialogRatio * 100) + '%)');
      hints.push('用动作、表情、环境描写填补对话间隙');
    }
    dims.dialog = dialogScore;

    // 5. 爽点密度（按题材关键词）
    var beats = getGenreBeats(genre);
    var beatHits = 0;
    for (var b = 0; b < beats.length; b++) {
      var re = new RegExp(beats[b], 'g');
      var m = text.match(re);
      if (m) beatHits += m.length;
    }
    var beatPer1k = len ? beatHits / (len / 1000) : 0;
    var beatScore = 100;
    if (beats.length === 0) {
      beatScore = 80;
    } else if (beatPer1k < 0.5) {
      beatScore = 50;
      weaknesses.push('爽点偏少（每千字仅 ' + beatPer1k.toFixed(1) + ' 处）');
      hints.push('围绕「' + beats.slice(0, 4).join('/') + '」补 1-2 个爆点');
    } else if (beatPer1k < 1.2) {
      beatScore = 75;
    } else {
      beatScore = 100;
    }
    dims.beats = beatScore;

    // 6. 章尾钩子
    var tail = text.slice(-160);
    var hookKeys = ['却', '突然', '忽然', '然而', '可是', '就在这时', '下一秒', '可', '只是', '但是', '??', '？', '！'];
    var hookHit = 0;
    for (var h = 0; h < hookKeys.length; h++) if (tail.indexOf(hookKeys[h]) >= 0) hookHit++;
    var endsBlunt = /[。.]$/.test(tail.replace(/\s+$/, ''));
    var hookScore = 100;
    if (hookHit === 0) {
      hookScore = 50;
      weaknesses.push('章尾缺乏钩子');
      hints.push('章尾用「就在这时…」「可下一秒…」类悬念句收束');
    } else if (hookHit === 1) {
      hookScore = 75;
    }
    if (endsBlunt && hookHit < 2) {
      hookScore = Math.min(hookScore, 65);
    }
    dims.hook = hookScore;

    // v45：商业强度附加维度
    var commercialScore = 100;
    var head350 = text.slice(0, 350);
    if (!/(冲突|危机|质问|命令|追杀|退婚|尸体|线索|敌|逼|怒|警报|证据)/.test(head350)) {
      commercialScore -= 18;
      weaknesses.push('开篇商业钩子不够强');
      hints.push('前300字明确给出冲突、危机、身份压迫或悬念线索');
    }
    if ((text.match(/众人震惊|全场震惊|空气仿佛凝固|时间仿佛静止/g) || []).length >= 3) {
      commercialScore -= 12;
      weaknesses.push('套路化/AI腔表达偏多');
      hints.push('用具体动作和后果替代“震惊/凝固”等空泛反应');
    }
    if (len > 1800 && beatPer1k < 0.8 && dialogRatio < 0.18) {
      commercialScore -= 10;
      weaknesses.push('爽点和对话同时偏弱');
      hints.push('补一个人物正面交锋或利益反击场景');
    }
    dims.commercial = Math.max(0, commercialScore);

    // 7. 重复词检测（与前一章对比）
    var repeatScore = 100;
    if (prevContent && prevContent.length > 200) {
      var fillFreq = function fillFreq(t, f) {
        for (var i = 0; i < t.length - 1; i++) {
          var w = t.substr(i, 2);
          if (/[\u4e00-\u9fa5]{2}/.test(w)) f[w] = (f[w] || 0) + 1;
        }
      };
      // 取双字词高频
      var freqA = {},
        freqB = {};
      fillFreq(text, freqA);
      fillFreq(prevContent, freqB);
      var repeated = 0;
      for (var w in freqA) {
        if (freqA[w] >= 5 && freqB[w] >= 5) repeated++;
        if (repeated > 8) break;
      }
      if (repeated >= 6) {
        repeatScore = 60;
        weaknesses.push('与上一章高频词重复明显');
        hints.push('替换重复的双字动词/形容词');
      } else if (repeated >= 3) {
        repeatScore = 80;
      }
    }
    dims.repeat = repeatScore;

    // 8. 设定一致性（用 longMemory）
    var consistencyScore = 100;
    var lm = work.longMemory || {};
    var charNames = (lm.charStates || []).map(function (c) {
      return c.name;
    }).filter(Boolean);
    var unmentioned = 0;
    if (charNames.length) {
      // 主角名应至少出现一次
      var mainName = charNames[0];
      if (mainName && text.indexOf(mainName) < 0) {
        consistencyScore -= 20;
        weaknesses.push('主角「' + mainName + '」未在本章出现');
        hints.push('确保主角「' + mainName + '」至少出场一次');
      }
    }
    // 题材违禁
    if (genre && genre.indexOf('历史') >= 0) {
      var ban = ['空间戒指', '灵气', '炼丹', '系统面板', '修仙者'];
      for (var bi = 0; bi < ban.length; bi++) {
        if (text.indexOf(ban[bi]) >= 0) {
          consistencyScore -= 25;
          weaknesses.push('历史题材出现违禁元素「' + ban[bi] + '」');
          hints.push('删除「' + ban[bi] + '」改为符合朝代设定的描述');
          break;
        }
      }
    }
    consistencyScore = Math.max(0, consistencyScore);
    dims.consistency = consistencyScore;

    // 9. 心理/动作平衡
    var mindHits = (text.match(/心想|心中|暗道|思忖|盘算|心里|脑海|意识到/g) || []).length;
    var actionHits = (text.match(/抬手|转身|走向|抓住|挥|踢|跨|后退|前冲|低头|扭头|盯/g) || []).length;
    var balanceScore = 100;
    if (actionHits === 0) {
      balanceScore = 55;
      weaknesses.push('缺少具体动作描写');
      hints.push('补充人物的动作（抬手/转身/盯住等）');
    } else if (mindHits === 0 && len > 1500) {
      balanceScore = 70;
      weaknesses.push('缺少心理描写');
      hints.push('在关键节点补 1-2 处主角心理活动');
    }
    dims.balance = balanceScore;

    // 10. 章首是否承接上一章
    var connectScore = 100;
    if (prevContent) {
      var prevTail = prevContent.slice(-80);
      var head = text.slice(0, 200);
      // 取上一章末尾的一个高频实体词，看本章开头是否提及
      var lastEnt = (prevTail.match(/[\u4e00-\u9fa5]{2,4}/g) || []).slice(-3);
      var connected = false;
      for (var ei = 0; ei < lastEnt.length; ei++) {
        if (head.indexOf(lastEnt[ei]) >= 0) {
          connected = true;
          break;
        }
      }
      if (!connected) {
        connectScore = 60;
        weaknesses.push('章首与上一章衔接弱');
        hints.push('开头一句承接上章末尾的人物/动作/悬念');
      }
    }
    dims.connect = connectScore;

    // 综合分（加权）
    var weights = {
      wordCount: 7,
      paragraphs: 7,
      rhythm: 10,
      dialog: 9,
      beats: 14,
      hook: 13,
      commercial: 14,
      repeat: 7,
      consistency: 13,
      balance: 7,
      connect: 5
    };
    var total = 0,
      totalW = 0;
    for (var k in dims) {
      var w2 = weights[k] || 5;
      total += dims[k] * w2;
      totalW += w2;
    }
    var score = Math.round(total / totalW);

    // 生成下章 prompt 用的避坑指引
    var nextHints = hints.slice(0, 4);
    return {
      score: score,
      dims: dims,
      weaknesses: weaknesses.slice(0, 8),
      suggestions: hints.slice(0, 8),
      nextHints: nextHints,
      meta: {
        len: len,
        paragraphs: paragraphs.length,
        sentences: sentences.length,
        dialogRatio: dialogRatio,
        beats: beatHits
      }
    };
  }

  // 把质量报告写回章节
  function attachQuality(work, chapterIdx, report) {
    if (!work || !work.chapters || !work.chapters[chapterIdx]) return;
    work.chapters[chapterIdx]._quality = {
      score: report.score,
      dims: report.dims,
      weaknesses: report.weaknesses,
      suggestions: report.suggestions,
      ts: Date.now()
    };
  }

  // 取上一章质量报告，用于下一章 prompt 注入
  function lastQualityHints(work, currentIdx) {
    if (!work || !work.chapters || currentIdx <= 0) return [];
    for (var i = currentIdx - 1; i >= 0; i--) {
      var ch = work.chapters[i];
      if (ch && ch._quality && Array.isArray(ch._quality.suggestions) && ch._quality.suggestions.length) {
        return ch._quality.suggestions.slice(0, 4);
      }
    }
    return [];
  }

  // 暴露
  window.QualityEngine = {
    score: qualityScore,
    attach: attachQuality,
    lastHints: lastQualityHints
  };
})();