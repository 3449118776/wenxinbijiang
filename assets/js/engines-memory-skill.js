// ==========================================================================
// engines-memory-skill.js — 超强记忆推理引擎 (Memory Reasoning Skill)
// 基于现有 longMemory 体系之上，构建推理、预测、分析层
//
// 与现有 longMemory 的关系：本引擎是 longMemory 的"大脑皮层"
//   - longMemory        = 海马体（存储 + 基础提取）—— 已有，不动
//   - MemorySkill       = 前额叶（推理 + 预测 + 决策）—— 本文件新增
//
// 核心能力：
//   PART 1  记忆推理引擎     — 因果推断 / 模式识别 / 缺口检测
//   PART 2  记忆预测引擎     — 基于记忆模式预测后续发展
//   PART 3  叙事一致性引擎   — 跨章节角色一致性 / 时间线 / 世界观
//   PART 4  情感弧线引擎     — 角色情感轨迹追踪 / 转折点检测
//   PART 5  伏笔智能管理     — 伏笔生命周期 / 自动关联 / 到期提醒
//   PART 6  记忆图谱推理     — 知识图谱构建 / 路径查找 / 社区发现
//   PART 7  记忆质量评估     — 记忆密度 / 信息熵 / 覆盖度检测
//   PART 8  写作建议生成     — 基于记忆缺口生成写作建议
//   PART 9  Prompt 智能构建  — 自适应上下文窗口 / 分层注入
//   PART 10 记忆诊断面板     — 健康检查 / 问题定位 / 修复建议
//   PART 11 跨作品记忆迁移   — 写作模式学习 / 风格要素迁移
//   PART 12 记忆快照与回滚   — 时间旅行 / 分支管理
// ==========================================================================

var MemorySkill = (function () {
  'use strict';

  // ==========================================================================
  // === PART 0：基础工具层 ====================================================
  // ==========================================================================

  var STOPWORDS = {};
  (function () {
    var sw = '的 了 是 在 我 你 他 她 它 我们 你们 他们 它们 这个 那个 这些 那些 一 一个 一些 这 那 和 与 及 或 但 但是 然而 不过 因为 所以 因此 于是 然后 接着 之后 之前 现在 过去 将来 已经 正在 会 能 能够 可以 可 就 就是 只是 只有 就是 一下 一直 依然 依旧 很 非常 十分 极其 太 最 更 比较 稍微 几乎 差不多 大概 大约 或许 也许 可能 应该 必须 需要 想 要 来 去 走 跑 看 听 说 做 把 被 将 给 向 往 于 为 对 以 用 从 到 在 其 之 而 所 以 为 因 所以 因此 于是 然后 接着 同时 但是 然而 不过 只是 只有 就是 而且 并且 还 也 都 全 皆 尽 仅 只 光 却 倒 反 反而 尽管 虽然 既然 那么 这样 那样 如何 什么 怎么 为什么 哪里 哪个 谁 多少 几 若 如果 假如 假设 要是 否则 不然 又 再 才 只 都 也 就是 正是 真是 非常 极其 十分 很 太 更 最 好 坏 新 旧 老 大 小 高 矮 长 短 远 近 快 慢 多 少 早 晚 先 后 前 里 外 上 下 左 右 中 内 东 南 西 北 是 否 有 无 没 没有 不 不是 不要 别 非 未 莫 勿 啊 呀 哦 哈 哎 嗯 唉 喔 咦 嘿 嘻 呢 吧 吗 嘛';
    sw.split(/\s+/).forEach(function (w) { STOPWORDS[w] = true; });
  })();

  function tokenize(text) {
    if (!text) return [];
    text = String(text).replace(/[\s\u3000]+/g, ' ');
    var segs = text.split(/[，。！？！？：；、,.!?;:\s]+/).filter(Boolean);
    var tokens = [];
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      for (var j = 0; j < s.length; j++) {
        if (/[a-zA-Z0-9]/.test(s[j])) {
          var k = j;
          while (k < s.length && /[a-zA-Z0-9]/.test(s[k])) k++;
          tokens.push(s.substring(j, k));
          j = k - 1;
        } else {
          if (!STOPWORDS[s[j]]) tokens.push(s[j]);
          if (j + 1 < s.length) {
            var bg = s.substring(j, j + 2);
            if (!STOPWORDS[bg]) tokens.push(bg);
          }
        }
      }
    }
    return tokens;
  }

  function jaccard(a, b) {
    if (!a || !b) return 0;
    var sa = {}, sb = {};
    for (var i = 0; i < a.length; i++) sa[a[i]] = (sa[a[i]] || 0) + 1;
    for (var j = 0; j < b.length; j++) sb[b[j]] = (sb[b[j]] || 0) + 1;
    var inter = 0, union = 0;
    var all = {};
    for (var k in sa) all[k] = true;
    for (var kk in sb) all[kk] = true;
    for (var kkk in all) {
      inter += Math.min(sa[kkk] || 0, sb[kkk] || 0);
      union += Math.max(sa[kkk] || 0, sb[kkk] || 0);
    }
    return union > 0 ? inter / union : 0;
  }

  function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    var m = [];
    for (var i = 0; i <= b.length; i++) { m[i] = [i]; }
    for (var j = 0; j <= a.length; j++) { m[0][j] = j; }
    for (var ib = 1; ib <= b.length; ib++) {
      for (var jb = 1; jb <= a.length; jb++) {
        m[ib][jb] = b.charAt(ib - 1) === a.charAt(jb - 1) ? m[ib - 1][jb - 1] : Math.min(m[ib - 1][jb - 1], m[ib][jb - 1], m[ib - 1][jb]) + 1;
      }
    }
    return m[b.length][a.length];
  }

  // ---- 安全获取 longMemory ----
  function getLM(work) {
    if (!work) return null;
    if (!work.longMemory) {
      if (typeof initLongMemory === 'function') initLongMemory(work);
      else work.longMemory = {};
    }
    return work.longMemory;
  }

  // ==========================================================================
  // === PART 1：记忆推理引擎 ==================================================
  // ==========================================================================

  var Reasoning = {
    // ---- 1.1 因果推断：从记忆中找到事件A→事件B的因果链 ----
    inferCausality: function (work, eventA, eventB) {
      var lm = getLM(work);
      if (!lm) return null;

      var allEvents = [];
      // 收集所有事件源
      (lm.chapterIndex || []).forEach(function (ci) {
        allEvents.push({ text: ci.summary || '', chapter: ci.chapterIdx || 0, source: 'chapterIndex' });
      });
      (lm.timelineEvents || []).forEach(function (te) {
        allEvents.push({ text: te.text || '', chapter: te.chapterIdx || 0, source: 'timeline' });
      });
      (lm.foreshadowLedger || []).forEach(function (fl) {
        allEvents.push({ text: fl.text || '', chapter: fl.chapterIdx || 0, source: 'foreshadow' });
      });
      // 从 memoryAnchors 提取
      var anchors = lm.memoryAnchors || {};
      ['core', 'promises', 'hooks'].forEach(function (k) {
        (anchors[k] || []).forEach(function (a) {
          allEvents.push({ text: a.text || '', chapter: a.chapterIdx || 0, source: 'anchor_' + k });
        });
      });

      // 因果信号词
      var causeWords = ['因为', '由于', '导致', '造成', '引发', '触发', '使得', '让', '迫使', '逼得', '害得', '引起'];
      var effectWords = ['所以', '因此', '于是', '结果', '最终', '终于', '终于', '这才', '从而', '进而'];

      // 找事件A和B之间的中间事件
      var tokensA = tokenize(eventA);
      var tokensB = tokenize(eventB);
      var chain = [];

      allEvents.sort(function (a, b) { return a.chapter - b.chapter; });
      for (var i = 0; i < allEvents.length; i++) {
        var simA = jaccard(tokensA, tokenize(allEvents[i].text));
        var simB = jaccard(tokensB, tokenize(allEvents[i].text));
        if (simA > 0.2 || simB > 0.2) {
          chain.push({
            event: allEvents[i].text.substring(0, 80),
            chapter: allEvents[i].chapter,
            similarityToA: simA,
            similarityToB: simB,
            source: allEvents[i].source
          });
        }
      }

      // 检测因果信号
      var hasCausalLink = chain.some(function (c) {
        return causeWords.some(function (w) { return c.event.indexOf(w) >= 0; }) ||
          effectWords.some(function (w) { return c.event.indexOf(w) >= 0; });
      });

      return {
        chain: chain,
        hasCausalLink: hasCausalLink,
        confidence: hasCausalLink ? 0.7 : chain.length > 1 ? 0.4 : 0.1,
        intermediateEvents: chain.length
      };
    },

    // ---- 1.2 模式识别：检测重复出现的叙事模式 ----
    detectPatterns: function (work) {
      var lm = getLM(work);
      if (!lm) return [];

      // 收集所有章节摘要
      var summaries = (lm.chapterIndex || []).map(function (ci) {
        return { chapter: ci.chapterIdx || 0, text: ci.summary || '' };
      }).filter(function (s) { return s.text.length > 10; });

      if (summaries.length < 5) return [];

      // 模式模板
      var patternTemplates = [
        {
          name: '升级打怪',
          keywords: ['突破', '晋升', '进阶', '击败', '战胜', '修炼', '提升', '实力', '境界'],
          minMatches: 3
        },
        {
          name: '寻宝奇遇',
          keywords: ['发现', '找到', '获得', '得到', '奇遇', '机缘', '传承', '宝物', '秘境', '遗迹'],
          minMatches: 3
        },
        {
          name: '复仇归来',
          keywords: ['复仇', '报仇', '雪恨', '归来', '回归', '复仇者', '仇恨', '血债'],
          minMatches: 2
        },
        {
          name: '身份揭晓',
          keywords: ['真相', '身份', '原来', '竟然是', '竟是', '居然是', '身世', '秘密', '揭晓', '暴露'],
          minMatches: 2
        },
        {
          name: '英雄救美',
          keywords: ['救下', '救了', '保护', '挡在', '护住', '出手', '救走', '救出'],
          minMatches: 2
        },
        {
          name: '势力冲突',
          keywords: ['对抗', '对峙', '冲突', '大战', '厮杀', '围剿', '围攻', '宣战', '决裂'],
          minMatches: 2
        },
        {
          name: '修炼瓶颈',
          keywords: ['瓶颈', '卡住', '无法突破', '停滞', '障碍', '阻碍', '桎梏', '枷锁'],
          minMatches: 2
        },
        {
          name: '以弱胜强',
          keywords: ['弱小', '越级', '跨境', '实力悬殊', '不可思议', '奇迹', '逆转', '逆袭'],
          minMatches: 2
        }
      ];

      var patterns = [];
      for (var p = 0; p < patternTemplates.length; p++) {
        var pt = patternTemplates[p];
        var matches = [];
        for (var s = 0; s < summaries.length; s++) {
          var cnt = 0;
          for (var k = 0; k < pt.keywords.length; k++) {
            if (summaries[s].text.indexOf(pt.keywords[k]) >= 0) cnt++;
          }
          if (cnt >= 2) matches.push(summaries[s].chapter);
        }
        if (matches.length >= pt.minMatches) {
          patterns.push({
            pattern: pt.name,
            occurrences: matches.length,
            chapters: matches,
            density: (matches.length / summaries.length * 100).toFixed(1) + '%'
          });
        }
      }

      return patterns.sort(function (a, b) { return b.occurrences - a.occurrences; });
    },

    // ---- 1.3 缺口检测：发现叙事中缺失的环节 ----
    detectGaps: function (work) {
      var lm = getLM(work);
      if (!lm) return [];

      var gaps = [];
      var chapters = lm.chapterIndex || [];
      var charProfiles = lm.characterProfiles || {};
      var foreshadows = lm.foreshadowLedger || [];

      // 1. 角色缺失：角色在某章后消失
      var charNames = Object.keys(charProfiles);
      if (chapters.length > 10) {
        for (var c = 0; c < Math.min(charNames.length, 20); c++) {
          var name = charNames[c];
          var profile = charProfiles[name];
          if (profile && profile.lastSeen !== undefined) {
            var lastSeen = profile.lastSeen;
            var latestChapter = chapters.length > 0 ? chapters[chapters.length - 1].chapterIdx : 0;
            if (latestChapter - lastSeen > 10 && profile.firstSeen !== undefined && profile.firstSeen < lastSeen) {
              gaps.push({
                type: '角色失踪',
                entity: name,
                detail: name + '自第' + (lastSeen + 1) + '章后未再出现（已过' + (latestChapter - lastSeen) + '章）',
                severity: 'medium',
                suggestion: '考虑安排' + name + '重新出场或交代其去向'
              });
            }
          }
        }
      }

      // 2. 伏笔未解：长期未解的伏笔
      var unresolvedFore = foreshadows.filter(function (f) { return f.status === '未解' || !f.status; });
      for (var f = 0; f < unresolvedFore.length; f++) {
        var uf = unresolvedFore[f];
        var chIdx = uf.chapterIdx || 0;
        var latestCh = chapters.length > 0 ? chapters[chapters.length - 1].chapterIdx : 0;
        if (latestCh - chIdx > 30) {
          gaps.push({
            type: '伏笔过期',
            entity: '伏笔',
            detail: '第' + (chIdx + 1) + '章的伏笔已过' + (latestCh - chIdx) + '章未解：' + (uf.text || '').substring(0, 50),
            severity: 'high',
            suggestion: '建议尽快安排该伏笔的回收或给出解释'
          });
        }
      }

      // 3. 章节密度异常：某段章节记忆过少
      if (chapters.length > 10) {
        var density = {};
        chapters.forEach(function (ch) {
          var vol = Math.floor((ch.chapterIdx || 0) / 20);
          density[vol] = (density[vol] || 0) + 1;
        });
        var avgDensity = chapters.length / Math.max(1, Object.keys(density).length);
        for (var vol in density) {
          if (density[vol] < avgDensity * 0.3) {
            gaps.push({
              type: '记忆稀疏',
              entity: '第' + (parseInt(vol) * 20 + 1) + '-' + ((parseInt(vol) + 1) * 20) + '章',
              detail: '该段记忆密度仅为平均的' + (density[vol] / avgDensity * 100).toFixed(0) + '%',
              severity: 'low',
              suggestion: '该段可能缺乏关键事件，建议补充情节推进'
            });
          }
        }
      }

      // 4. 关系缺失：角色间缺乏互动
      if (charNames.length >= 2) {
        var relAnchors = (lm.memoryAnchors && lm.memoryAnchors.relationships) || [];
        var relPairs = {};
        relAnchors.forEach(function (r) {
          var text = r.text || '';
          for (var a = 0; a < charNames.length; a++) {
            for (var b = a + 1; b < charNames.length; b++) {
              if (text.indexOf(charNames[a]) >= 0 && text.indexOf(charNames[b]) >= 0) {
                var key = charNames[a] + '↔' + charNames[b];
                relPairs[key] = (relPairs[key] || 0) + 1;
              }
            }
          }
        });
        for (var a2 = 0; a2 < Math.min(charNames.length, 8); a2++) {
          for (var b2 = a2 + 1; b2 < Math.min(charNames.length, 8); b2++) {
            var key2 = charNames[a2] + '↔' + charNames[b2];
            if (!relPairs[key2] || relPairs[key2] < 2) {
              // 只提示重要角色对
              var roleA = (lm.charRoles && lm.charRoles[charNames[a2]]) || '配角';
              var roleB = (lm.charRoles && lm.charRoles[charNames[b2]]) || '配角';
              if (roleA === '主角' || roleA === '男主' || roleA === '女主' || roleB === '主角' || roleB === '男主' || roleB === '女主') {
                gaps.push({
                  type: '关系缺失',
                  entity: charNames[a2] + ' ↔ ' + charNames[b2],
                  detail: '这两个角色之间缺乏互动记录',
                  severity: 'low',
                  suggestion: '考虑安排' + charNames[a2] + '与' + charNames[b2] + '的互动场景'
                });
              }
            }
          }
        }
      }

      return gaps;
    },

    // ---- 1.4 矛盾检测：检测记忆中的自相矛盾 ----
    detectContradictions: function (work) {
      var lm = getLM(work);
      if (!lm) return [];

      var contradictions = [];
      var anchors = lm.memoryAnchors || {};

      // 收集所有核心事实
      var coreFacts = (anchors.core || []).map(function (a) {
        return { text: a.text || '', chapter: a.chapterIdx || 0 };
      });

      // 检查核心事实之间的冲突
      var conflictPairs = [
        { a: '活着', b: '死亡', label: '生死矛盾' },
        { a: '朋友', b: '敌人', label: '敌友矛盾' },
        { a: '拥有', b: '失去', label: '得失矛盾' },
        { a: '强大', b: '弱小', label: '强弱矛盾' },
        { a: '在场', b: '不在', label: '行踪矛盾' },
        { a: '知道', b: '不知道', label: '知情矛盾' },
        { a: '男', b: '女', label: '性别矛盾' }
      ];

      for (var i = 0; i < coreFacts.length; i++) {
        for (var j = i + 1; j < coreFacts.length; j++) {
          for (var cp = 0; cp < conflictPairs.length; cp++) {
            var pair = conflictPairs[cp];
            if (coreFacts[i].text.indexOf(pair.a) >= 0 && coreFacts[j].text.indexOf(pair.b) >= 0) {
              // 提取共同实体
              var tokensI = tokenize(coreFacts[i].text);
              var tokensJ = tokenize(coreFacts[j].text);
              var common = tokensI.filter(function (t) { return tokensJ.indexOf(t) >= 0 && t.length >= 2; });
              if (common.length >= 1) {
                contradictions.push({
                  type: pair.label,
                  entity: common.slice(0, 3).join('、'),
                  factA: '第' + (coreFacts[i].chapter + 1) + '章：' + coreFacts[i].text.substring(0, 50),
                  factB: '第' + (coreFacts[j].chapter + 1) + '章：' + coreFacts[j].text.substring(0, 50),
                  severity: 'high'
                });
              }
            }
          }
        }
      }

      return contradictions;
    }
  };

  // ==========================================================================
  // === PART 2：记忆预测引擎 ==================================================
  // ==========================================================================

  var Prediction = {
    // ---- 2.1 基于历史模式预测下一章可能的事件 ----
    predictNextChapter: function (work, currentChapterIdx) {
      var lm = getLM(work);
      if (!lm) return [];

      var predictions = [];
      var chapters = lm.chapterIndex || [];
      var foreshadows = lm.foreshadowLedger || [];
      var plotThreads = lm.plotThreads || [];

      // 1. 伏笔到期预测
      var unresolved = foreshadows.filter(function (f) {
        return (f.status === '未解' || !f.status) && (f.chapterIdx || 0) < currentChapterIdx;
      });
      var overdueForeshadows = unresolved.filter(function (f) {
        return currentChapterIdx - (f.chapterIdx || 0) > 20;
      });
      if (overdueForeshadows.length > 0) {
        predictions.push({
          type: '伏笔回收',
          priority: 'high',
          detail: '有' + overdueForeshadows.length + '个伏笔已过期超过20章，建议安排回收',
          related: overdueForeshadows.slice(0, 3).map(function (f) {
            return '第' + ((f.chapterIdx || 0) + 1) + '章：' + (f.text || '').substring(0, 40);
          })
        });
      } else if (unresolved.length > 0) {
        predictions.push({
          type: '伏笔推进',
          priority: 'medium',
          detail: '有' + unresolved.length + '个未解伏笔，可考虑在近期推进',
          related: unresolved.slice(0, 3).map(function (f) {
            return '第' + ((f.chapterIdx || 0) + 1) + '章：' + (f.text || '').substring(0, 40);
          })
        });
      }

      // 2. 情节线索推进预测
      var pendingThreads = plotThreads.filter(function (t) { return t.status === '待解'; });
      if (pendingThreads.length > 0) {
        predictions.push({
          type: '线索推进',
          priority: 'medium',
          detail: '有' + pendingThreads.length + '条待解情节线索',
          related: pendingThreads.slice(0, 3).map(function (t) { return t.title || ''; })
        });
      }

      // 3. 节奏预测：基于章节间隔模式
      if (chapters.length >= 10) {
        var recentSummaries = chapters.slice(-10).map(function (c) { return c.summary || ''; });
        var actionWords = ['战斗', '击败', '突破', '杀', '斩', '出手', '攻击', '对抗', '冲突', '打斗', '厮杀'];
        var calmWords = ['修炼', '对话', '休息', '日常', '平静', '交易', '学习', '领悟', '思考', '准备'];

        var actionCount = 0, calmCount = 0;
        for (var s = 0; s < recentSummaries.length; s++) {
          for (var a = 0; a < actionWords.length; a++) {
            if (recentSummaries[s].indexOf(actionWords[a]) >= 0) { actionCount++; break; }
          }
          for (var cw = 0; cw < calmWords.length; cw++) {
            if (recentSummaries[s].indexOf(calmWords[cw]) >= 0) { calmCount++; break; }
          }
        }

        if (actionCount > 7) {
          predictions.push({
            type: '节奏调控',
            priority: 'medium',
            detail: '最近10章战斗/冲突密集（' + actionCount + '/10），建议安排过渡章节，给读者喘息空间'
          });
        } else if (calmCount > 7) {
          predictions.push({
            type: '节奏调控',
            priority: 'medium',
            detail: '最近10章偏平静（' + calmCount + '/10），建议安排冲突或高潮提升节奏'
          });
        }
      }

      // 4. 角色发展预测
      var charNames = Object.keys(lm.characterProfiles || {});
      for (var c = 0; c < Math.min(charNames.length, 5); c++) {
        var name = charNames[c];
        var profile = lm.characterProfiles[name];
        if (profile && profile.milestones && profile.milestones.length > 0) {
          var lastMilestone = profile.milestones[profile.milestones.length - 1];
          if (typeof lastMilestone === 'string' && lastMilestone.indexOf('突破') < 0 && lastMilestone.indexOf('觉醒') < 0) {
            // 该角色很久没有成长事件
            if (profile.lastSeen !== undefined && currentChapterIdx - profile.lastSeen > 15) {
              predictions.push({
                type: '角色发展',
                priority: 'low',
                detail: name + '已' + (currentChapterIdx - profile.lastSeen) + '章没有重要发展，建议安排成长事件'
              });
            }
          }
        }
      }

      return predictions.sort(function (a, b) {
        var order = { 'high': 0, 'medium': 1, 'low': 2 };
        return (order[a.priority] || 1) - (order[b.priority] || 1);
      });
    },

    // ---- 2.2 情节走向概率预测 ----
    predictPlotDirection: function (work, currentChapterIdx) {
      var lm = getLM(work);
      if (!lm) return [];

      var directions = [];
      var anchors = lm.memoryAnchors || {};

      // 收集所有待兑现的承诺和钩子
      var promises = (anchors.promises || []).filter(function (p) {
        return p.status !== '已兑现' && p.status !== '失效';
      });
      var hooks = (anchors.hooks || []).filter(function (h) {
        return h.status !== '已兑现' && h.status !== '失效';
      });

      // 根据承诺推断方向
      for (var p = 0; p < Math.min(promises.length, 5); p++) {
        var text = promises[p].text || '';
        if (text.indexOf('报仇') >= 0 || text.indexOf('复仇') >= 0) {
          directions.push({ direction: '复仇线', source: text.substring(0, 40), confidence: 0.8 });
        } else if (text.indexOf('寻找') >= 0 || text.indexOf('找到') >= 0 || text.indexOf('找回') >= 0) {
          directions.push({ direction: '寻找线', source: text.substring(0, 40), confidence: 0.7 });
        } else if (text.indexOf('保护') >= 0 || text.indexOf('守护') >= 0) {
          directions.push({ direction: '守护线', source: text.substring(0, 40), confidence: 0.7 });
        } else if (text.indexOf('突破') >= 0 || text.indexOf('变强') >= 0 || text.indexOf('修炼') >= 0) {
          directions.push({ direction: '成长线', source: text.substring(0, 40), confidence: 0.6 });
        } else {
          directions.push({ direction: '待定', source: text.substring(0, 40), confidence: 0.5 });
        }
      }

      for (var h = 0; h < Math.min(hooks.length, 3); h++) {
        directions.push({ direction: '爽点待释放', source: (hooks[h].text || '').substring(0, 40), confidence: 0.6 });
      }

      return directions;
    }
  };

  // ==========================================================================
  // === PART 3：叙事一致性引擎 ================================================
  // ==========================================================================

  var Consistency = {
    // ---- 3.1 角色一致性检查 ----
    checkCharacterConsistency: function (work, chapterIdx) {
      var lm = getLM(work);
      if (!lm) return { score: 100, issues: [] };

      var issues = [];
      var charProfiles = lm.characterProfiles || {};
      var charRoles = lm.charRoles || {};
      var charAnchors = (lm.memoryAnchors && lm.memoryAnchors.characterTags) || [];

      for (var name in charProfiles) {
        var profile = charProfiles[name];
        if (!profile) continue;

        // 检查角色标签是否矛盾
        var tags = charAnchors.filter(function (a) { return (a.charName || a.text || '').indexOf(name) >= 0; });
        var tagTexts = tags.map(function (t) { return t.text || ''; });

        // 矛盾词对检测
        var contradictionPairs = [
          ['善良', '残忍'], ['懦弱', '勇敢'], ['冷静', '暴躁'],
          ['聪明', '愚笨'], ['富有', '贫穷'], ['高贵', '低贱'],
          ['忠诚', '背叛'], ['诚实', '欺骗'], ['谨慎', '鲁莽']
        ];

        for (var cp = 0; cp < contradictionPairs.length; cp++) {
          var hasA = tagTexts.some(function (t) { return t.indexOf(contradictionPairs[cp][0]) >= 0; });
          var hasB = tagTexts.some(function (t) { return t.indexOf(contradictionPairs[cp][1]) >= 0; });
          if (hasA && hasB) {
            issues.push({
              type: '角色矛盾',
              character: name,
              detail: name + '同时具有"' + contradictionPairs[cp][0] + '"和"' + contradictionPairs[cp][1] + '"的特征，需确认是否有合理转变',
              severity: 'medium'
            });
          }
        }
      }

      return {
        score: Math.max(0, 100 - issues.length * 10),
        issues: issues
      };
    },

    // ---- 3.2 时间线一致性检查 ----
    checkTimelineConsistency: function (work) {
      var lm = getLM(work);
      if (!lm) return { score: 100, issues: [] };

      var issues = [];
      var timeline = lm.timelineEvents || [];
      var chapterIndex = lm.chapterIndex || [];

      // 检查时间线事件是否按章节顺序
      var sorted = timeline.slice().sort(function (a, b) { return (a.chapterIdx || 0) - (b.chapterIdx || 0); });
      for (var i = 1; i < sorted.length; i++) {
        var prev = sorted[i - 1];
        var curr = sorted[i];
        if ((curr.chapterIdx || 0) < (prev.chapterIdx || 0)) {
          issues.push({
            type: '时间线错乱',
            detail: '时间线事件在第' + ((curr.chapterIdx || 0) + 1) + '章和第' + ((prev.chapterIdx || 0) + 1) + '章之间顺序异常',
            severity: 'low'
          });
        }
      }

      return {
        score: Math.max(0, 100 - issues.length * 5),
        issues: issues
      };
    },

    // ---- 3.3 世界观一致性检查 ----
    checkWorldConsistency: function (work) {
      var lm = getLM(work);
      if (!lm) return { score: 100, issues: [] };

      var issues = [];
      var coreAnchors = (lm.memoryAnchors && lm.memoryAnchors.core) || [];

      // 收集世界观规则
      var rules = coreAnchors.filter(function (a) {
        var t = a.text || '';
        return t.indexOf('不能') >= 0 || t.indexOf('无法') >= 0 || t.indexOf('禁止') >= 0 ||
          t.indexOf('只有') >= 0 || t.indexOf('规则') >= 0 || t.indexOf('法则') >= 0;
      });

      // 检查是否有规则被违反的记录
      for (var r = 0; r < rules.length; r++) {
        var rule = rules[r].text || '';
        var ruleChapter = rules[r].chapterIdx || 0;

        // 提取规则中的关键词
        var ruleKeywords = tokenize(rule).filter(function (t) { return t.length >= 2; });

        // 在后续章节中查找可能的违反
        var laterEvents = coreAnchors.filter(function (a) { return (a.chapterIdx || 0) > ruleChapter; });
        for (var le = 0; le < laterEvents.length; le++) {
          var eventText = laterEvents[le].text || '';
          var eventTokens = tokenize(eventText);

          // 如果事件包含"突破"、"打破"等词，且与规则关键词高度重叠
          if ((eventText.indexOf('突破') >= 0 || eventText.indexOf('打破') >= 0 || eventText.indexOf('竟然') >= 0) &&
            jaccard(ruleKeywords, eventTokens) > 0.3) {
            issues.push({
              type: '规则冲突',
              detail: '第' + (ruleChapter + 1) + '章设定的规则可能在第' + ((laterEvents[le].chapterIdx || 0) + 1) + '章被打破：' + rule.substring(0, 40),
              severity: 'medium'
            });
          }
        }
      }

      return {
        score: Math.max(0, 100 - issues.length * 15),
        issues: issues
      };
    },

    // ---- 3.4 全量一致性检查 ----
    fullCheck: function (work, chapterIdx) {
      return {
        character: this.checkCharacterConsistency(work, chapterIdx),
        timeline: this.checkTimelineConsistency(work),
        world: this.checkWorldConsistency(work),
        contradictions: Reasoning.detectContradictions(work),
        overallScore: 0 // 下面计算
      };
    }
  };

  // ==========================================================================
  // === PART 4：情感弧线引擎 ==================================================
  // ==========================================================================

  var EmotionArc = {
    // ---- 情感词典 ----
    _emotionMap: {
      '喜悦': 1.0, '高兴': 0.9, '开心': 0.8, '欢喜': 0.9, '兴奋': 0.8, '激动': 0.7, '满意': 0.6,
      '平静': 0.0, '淡然': 0.0, '从容': 0.0, '冷静': 0.0, '镇定': 0.0,
      '悲伤': -0.8, '难过': -0.7, '伤心': -0.9, '痛哭': -1.0, '哭泣': -0.9, '落泪': -0.8,
      '愤怒': -0.7, '暴怒': -1.0, '恼怒': -0.6, '怒火': -0.8,
      '恐惧': -0.9, '害怕': -0.8, '畏惧': -0.8, '惊惧': -0.9, '骇然': -0.7,
      '绝望': -1.0, '崩溃': -0.9, '心死': -1.0,
      '惊讶': 0.0, '震惊': -0.3, '惊愕': -0.2, '诧异': 0.0,
      '悔恨': -0.8, '愧疚': -0.7, '羞耻': -0.6,
      '坚定': 0.4, '毅然': 0.5, '决绝': 0.3,
      '疑惑': -0.1, '怀疑': -0.2, '困惑': -0.1
    },

    // ---- 4.1 追踪单角色情感轨迹 ----
    trackCharacterEmotion: function (work, characterName) {
      var lm = getLM(work);
      if (!lm) return null;

      var arc = [];
      var emotionAnchors = (lm.memoryAnchors && lm.memoryAnchors.emotionTrack) || [];
      var charAnchors = (lm.memoryAnchors && lm.memoryAnchors.characterTags) || [];

      // 收集该角色的情感相关记忆
      var allAnchors = emotionAnchors.concat(charAnchors).filter(function (a) {
        var text = (a.text || '').toLowerCase();
        var name = characterName.toLowerCase();
        return text.indexOf(name) >= 0 || (a.charName && a.charName.indexOf(characterName) >= 0);
      });

      allAnchors.sort(function (a, b) { return (a.chapterIdx || 0) - (b.chapterIdx || 0); });

      var self = this;
      for (var i = 0; i < allAnchors.length; i++) {
        var text = allAnchors[i].text || '';
        var valence = self._computeValence(text);
        arc.push({
          chapter: allAnchors[i].chapterIdx || 0,
          text: text.substring(0, 50),
          valence: valence,
          dominantEmotion: self._dominantEmotion(text)
        });
      }

      // 检测情感转折点
      var turningPoints = [];
      for (var j = 2; j < arc.length; j++) {
        var prev2 = arc[j - 2].valence;
        var prev1 = arc[j - 1].valence;
        var curr = arc[j].valence;
        // 连续两次同向 → 趋势确认
        if ((prev2 < prev1 && prev1 < curr) || (prev2 > prev1 && prev1 > curr)) {
          if (Math.abs(curr - prev2) > 1.0) {
            turningPoints.push({
              chapter: arc[j].chapter,
              from: arc[j - 2].dominantEmotion,
              to: arc[j].dominantEmotion,
              shift: curr - prev2,
              direction: curr > prev2 ? '上升' : '下降'
            });
          }
        }
      }

      return {
        character: characterName,
        arc: arc,
        turningPoints: turningPoints,
        overallTrend: arc.length >= 2 ? (arc[arc.length - 1].valence - arc[0].valence > 0 ? '上升' : '下降') : '平稳',
        dataPoints: arc.length
      };
    },

    _computeValence: function (text) {
      var total = 0, count = 0;
      for (var emo in this._emotionMap) {
        if (text.indexOf(emo) >= 0) {
          total += this._emotionMap[emo];
          count++;
        }
      }
      return count > 0 ? total / count : 0;
    },

    _dominantEmotion: function (text) {
      var best = '中性', bestScore = 0;
      for (var emo in this._emotionMap) {
        if (text.indexOf(emo) >= 0 && Math.abs(this._emotionMap[emo]) > bestScore) {
          bestScore = Math.abs(this._emotionMap[emo]);
          best = emo;
        }
      }
      return best;
    },

    // ---- 4.2 全作品情感波动分析 ----
    analyzeGlobalEmotion: function (work) {
      var lm = getLM(work);
      if (!lm) return null;

      var chapters = lm.chapterIndex || [];
      if (chapters.length < 5) return null;

      var self = this;
      var chapterEmotions = chapters.map(function (ch) {
        return {
          chapter: ch.chapterIdx || 0,
          valence: self._computeValence(ch.summary || ''),
          emotion: self._dominantEmotion(ch.summary || '')
        };
      });

      // 统计
      var valences = chapterEmotions.map(function (e) { return e.valence; });
      var avgValence = valences.reduce(function (a, b) { return a + b; }, 0) / valences.length;
      var variance = valences.reduce(function (a, b) { return a + (b - avgValence) * (b - avgValence); }, 0) / valences.length;

      // 检测情感"过山车"效应（波动过大）
      var rollerCoaster = variance > 0.5;

      // 检测情感"单调"效应（波动过小）
      var monotonous = variance < 0.1 && chapters.length > 10;

      return {
        chapterEmotions: chapterEmotions,
        averageValence: avgValence,
        variance: variance,
        rollerCoaster: rollerCoaster,
        monotonous: monotonous,
        dominantEmotion: self._dominantEmotion(chapterEmotions.map(function (e) { return e.emotion; }).join(' ')),
        advice: rollerCoaster ? '情感波动过大，读者可能感到疲惫。建议在剧烈情感转折之间加入缓冲章节。' :
          monotonous ? '情感变化过少，可能导致读者感到单调。建议增加情感起伏。' :
            '情感节奏健康，继续保持。'
      };
    }
  };

  // ==========================================================================
  // === PART 5：伏笔智能管理 ==================================================
  // ==========================================================================

  var ForeshadowManager = {
    // ---- 5.1 伏笔生命周期状态 ----
    STATUS: {
      PLANTED: '已埋',
      DEVELOPING: '发展中',
      READY: '待回收',
      RESOLVED: '已回收',
      ABANDONED: '已废弃'
    },

    // ---- 5.2 自动关联伏笔 ----
    autoLinkForeshadows: function (work) {
      var lm = getLM(work);
      if (!lm) return [];

      var foreshadows = lm.foreshadowLedger || [];
      var chapterIndex = lm.chapterIndex || [];
      var links = [];

      for (var f = 0; f < foreshadows.length; f++) {
        var fore = foreshadows[f];
        if (fore.status === '已解') continue;

        var foreTokens = tokenize(fore.text || '');
        if (foreTokens.length === 0) continue;

        // 在后续章节中查找可能的回收
        for (var c = 0; c < chapterIndex.length; c++) {
          var ch = chapterIndex[c];
          if ((ch.chapterIdx || 0) <= (fore.chapterIdx || 0)) continue;

          var chTokens = tokenize(ch.summary || '');
          var sim = jaccard(foreTokens, chTokens);

          if (sim > 0.25) {
            links.push({
              foreshadow: fore.text ? fore.text.substring(0, 50) : '',
              foreshadowChapter: fore.chapterIdx || 0,
              possibleResolution: ch.summary ? ch.summary.substring(0, 50) : '',
              resolutionChapter: ch.chapterIdx || 0,
              similarity: sim,
              confidence: sim > 0.5 ? 'high' : sim > 0.35 ? 'medium' : 'low'
            });
          }
        }
      }

      return links.sort(function (a, b) { return b.similarity - a.similarity; });
    },

    // ---- 5.3 伏笔健康报告 ----
    getHealthReport: function (work) {
      var lm = getLM(work);
      if (!lm) return null;

      var foreshadows = lm.foreshadowLedger || [];
      var total = foreshadows.length;
      var resolved = foreshadows.filter(function (f) { return f.status === '已解'; }).length;
      var unresolved = total - resolved;
      var chapters = lm.chapterIndex || [];
      var latestChapter = chapters.length > 0 ? chapters[chapters.length - 1].chapterIdx : 0;

      // 过期伏笔
      var overdue = foreshadows.filter(function (f) {
        return (f.status !== '已解') && (latestChapter - (f.chapterIdx || 0)) > 30;
      });

      // 即将到期（15-30章）
      var dueSoon = foreshadows.filter(function (f) {
        var age = latestChapter - (f.chapterIdx || 0);
        return (f.status !== '已解') && age >= 15 && age <= 30;
      });

      return {
        total: total,
        resolved: resolved,
        unresolved: unresolved,
        resolutionRate: total > 0 ? (resolved / total * 100).toFixed(1) + '%' : 'N/A',
        overdue: overdue.length,
        dueSoon: dueSoon.length,
        overdueList: overdue.slice(0, 5).map(function (f) {
          return { chapter: (f.chapterIdx || 0) + 1, text: (f.text || '').substring(0, 50) };
        }),
        health: unresolved === 0 ? 'excellent' : overdue.length > 3 ? 'critical' : overdue.length > 0 ? 'warning' : 'good',
        advice: overdue.length > 3 ? '有' + overdue.length + '个伏笔已过期超过30章，强烈建议尽快回收！' :
          overdue.length > 0 ? '有' + overdue.length + '个伏笔已过期，建议安排回收。' :
            dueSoon.length > 0 ? '有' + dueSoon.length + '个伏笔即将到期，请关注。' :
              '伏笔管理良好。'
      };
    }
  };

  // ==========================================================================
  // === PART 6：记忆图谱推理 ==================================================
  // ==========================================================================

  var MemoryGraph = {
    // ---- 6.1 构建角色-事件知识图谱 ----
    buildGraph: function (work) {
      var lm = getLM(work);
      if (!lm) return { nodes: [], edges: [] };

      var nodes = [];
      var edges = [];
      var nodeMap = {};
      var edgeMap = {};

      // 角色节点
      var charProfiles = lm.characterProfiles || {};
      var charRoles = lm.charRoles || {};
      for (var name in charProfiles) {
        var id = 'char_' + name;
        nodeMap[id] = true;
        nodes.push({
          id: id,
          label: name,
          type: 'character',
          role: charRoles[name] || '配角',
          chapters: charProfiles[name].lastSeen || 0
        });
      }

      // 地点节点
      var locAnchors = (lm.memoryAnchors && lm.memoryAnchors.locations) || [];
      var locNames = {};
      for (var l = 0; l < locAnchors.length; l++) {
        var text = locAnchors[l].text || '';
        var locMatch = text.match(/(?:在|到|来|去|进入|离开|回|赶往)([\u4e00-\u9fa5]{2,6}(?:城|镇|村|国|界|域|山|谷|林|海|洞|府|宫|殿|阁|楼|院|堂|庙|塔))/);
        if (locMatch) {
          var locName = locMatch[1];
          locNames[locName] = (locNames[locName] || 0) + 1;
        }
      }
      var topLocs = Object.keys(locNames).sort(function (a, b) { return locNames[b] - locNames[a]; }).slice(0, 15);
      for (var tl = 0; tl < topLocs.length; tl++) {
        var lid = 'loc_' + topLocs[tl];
        nodeMap[lid] = true;
        nodes.push({ id: lid, label: topLocs[tl], type: 'location', weight: locNames[topLocs[tl]] });
      }

      // 道具节点
      var itemAnchors = (lm.memoryAnchors && lm.memoryAnchors.items) || [];
      var itemNames = {};
      for (var it = 0; it < itemAnchors.length; it++) {
        var itext = itemAnchors[it].text || '';
        var itemMatch = itext.match(/(?:剑|刀|枪|戟|斧|锤|鞭|弓|盾|符|丹|药|玉|令|牌|戒|珠|镜|印|幡|扇|鼎|炉|卷|轴|书|秘籍|法宝|神器|仙器|魔器)([\u4e00-\u9fa5]{0,4})/);
        if (itemMatch) {
          var iname = itemMatch[0];
          itemNames[iname] = (itemNames[iname] || 0) + 1;
        }
      }
      var topItems = Object.keys(itemNames).sort(function (a, b) { return itemNames[b] - itemNames[a]; }).slice(0, 10);
      for (var ti = 0; ti < topItems.length; ti++) {
        var iid = 'item_' + topItems[ti];
        nodeMap[iid] = true;
        nodes.push({ id: iid, label: topItems[ti], type: 'item', weight: itemNames[topItems[ti]] });
      }

      // 关系边：角色-角色
      var relAnchors = (lm.memoryAnchors && lm.memoryAnchors.relationships) || [];
      for (var r = 0; r < relAnchors.length; r++) {
        var rtext = relAnchors[r].text || '';
        var involved = [];
        for (var name2 in charProfiles) {
          if (rtext.indexOf(name2) >= 0) involved.push(name2);
        }
        for (var ia = 0; ia < involved.length; ia++) {
          for (var ib = ia + 1; ib < involved.length; ib++) {
            var ekey = 'char_' + involved[ia] + '--char_' + involved[ib];
            if (!edgeMap[ekey]) {
              edgeMap[ekey] = true;
              edges.push({
                source: 'char_' + involved[ia],
                target: 'char_' + involved[ib],
                type: 'relationship',
                label: rtext.substring(0, 20)
              });
            }
          }
        }
      }

      // 关系边：角色-地点
      for (var rl = 0; rl < locAnchors.length; rl++) {
        var ltext = locAnchors[rl].text || '';
        for (var name3 in charProfiles) {
          if (ltext.indexOf(name3) >= 0) {
            for (var tl2 = 0; tl2 < topLocs.length; tl2++) {
              if (ltext.indexOf(topLocs[tl2]) >= 0) {
                var ekey2 = 'char_' + name3 + '--loc_' + topLocs[tl2];
                if (!edgeMap[ekey2]) {
                  edgeMap[ekey2] = true;
                  edges.push({ source: 'char_' + name3, target: 'loc_' + topLocs[tl2], type: 'located_at' });
                }
              }
            }
          }
        }
      }

      return { nodes: nodes, edges: edges };
    },

    // ---- 6.2 查找两个角色之间的最短关系路径 ----
    findRelationPath: function (work, charA, charB) {
      var graph = this.buildGraph(work);
      var startId = 'char_' + charA;
      var endId = 'char_' + charB;

      // BFS
      var visited = {};
      var queue = [[startId]];
      visited[startId] = true;

      while (queue.length > 0) {
        var path = queue.shift();
        var node = path[path.length - 1];

        if (node === endId) {
          return path.map(function (id) {
            var n = graph.nodes.find(function (nd) { return nd.id === id; });
            return n ? n.label : id;
          });
        }

        for (var e = 0; e < graph.edges.length; e++) {
          var edge = graph.edges[e];
          var next = null;
          if (edge.source === node && !visited[edge.target]) next = edge.target;
          else if (edge.target === node && !visited[edge.source]) next = edge.source;

          if (next) {
            visited[next] = true;
            queue.push(path.concat([next]));
          }
        }
      }

      return null; // 无路径
    },

    // ---- 6.3 节点重要性排名（简化 PageRank） ----
    rankNodes: function (work, iterations) {
      var graph = this.buildGraph(work);
      iterations = iterations || 20;
      var nodes = graph.nodes;
      var edges = graph.edges;
      var damping = 0.85;

      // 初始化
      var ranks = {};
      for (var n = 0; n < nodes.length; n++) {
        ranks[nodes[n].id] = 1.0 / nodes.length;
      }

      // 构建邻接表
      var adj = {};
      for (var e = 0; e < edges.length; e++) {
        if (!adj[edges[e].source]) adj[edges[e].source] = [];
        if (!adj[edges[e].target]) adj[edges[e].target] = [];
        adj[edges[e].source].push(edges[e].target);
        adj[edges[e].target].push(edges[e].source);
      }

      // 迭代
      for (var iter = 0; iter < iterations; iter++) {
        var newRanks = {};
        for (var n2 = 0; n2 < nodes.length; n2++) {
          var id = nodes[n2].id;
          var sum = 0;
          var neighbors = adj[id] || [];
          for (var nb = 0; nb < neighbors.length; nb++) {
            var neighborId = neighbors[nb];
            var neighborDegree = (adj[neighborId] || []).length || 1;
            sum += (ranks[neighborId] || 0) / neighborDegree;
          }
          newRanks[id] = (1 - damping) / nodes.length + damping * sum;
        }
        ranks = newRanks;
      }

      // 排序
      var ranked = nodes.map(function (n) {
        return { id: n.id, label: n.label, type: n.type, rank: ranks[n.id] || 0 };
      }).sort(function (a, b) { return b.rank - a.rank; });

      return ranked;
    }
  };

  // ==========================================================================
  // === PART 7：记忆质量评估 ==================================================
  // ==========================================================================

  var Quality = {
    // ---- 7.1 记忆密度分析 ----
    analyzeDensity: function (work) {
      var lm = getLM(work);
      if (!lm) return null;

      var chapters = lm.chapterIndex || [];
      var totalChapters = chapters.length;
      if (totalChapters === 0) return null;

      // 统计各类记忆数量
      var anchors = lm.memoryAnchors || {};
      var anchorCounts = {};
      var totalAnchors = 0;
      for (var k in anchors) {
        anchorCounts[k] = (anchors[k] || []).length;
        totalAnchors += anchorCounts[k];
      }

      var charProfiles = lm.characterProfiles || {};
      var foreshadows = lm.foreshadowLedger || [];
      var timelineEvents = lm.timelineEvents || [];
      var volumeMemories = lm.volumeMemories || [];

      return {
        totalChapters: totalChapters,
        chapterIndexEntries: chapters.length,
        totalAnchors: totalAnchors,
        anchorTypes: anchorCounts,
        characters: Object.keys(charProfiles).length,
        foreshadows: foreshadows.length,
        timelineEvents: timelineEvents.length,
        volumeMemories: volumeMemories.length,
        // 每章平均记忆密度
        anchorsPerChapter: totalChapters > 0 ? (totalAnchors / totalChapters).toFixed(1) : '0',
        // 记忆覆盖率
        chapterIndexCoverage: totalChapters > 0 ? (chapters.length / totalChapters * 100).toFixed(1) + '%' : '0%',
        // 健康评估
        health: totalAnchors / Math.max(1, totalChapters) < 2 ? 'low' :
          totalAnchors / Math.max(1, totalChapters) < 5 ? 'medium' : 'good'
      };
    },

    // ---- 7.2 信息熵计算 ----
    computeEntropy: function (work) {
      var lm = getLM(work);
      if (!lm) return 0;

      var anchors = lm.memoryAnchors || {};
      var allTexts = [];
      for (var k in anchors) {
        (anchors[k] || []).forEach(function (a) {
          allTexts.push(a.text || '');
        });
      }

      if (allTexts.length === 0) return 0;

      // 词频统计
      var wordFreq = {};
      var totalWords = 0;
      for (var i = 0; i < allTexts.length; i++) {
        var tokens = tokenize(allTexts[i]);
        for (var t = 0; t < tokens.length; t++) {
          wordFreq[tokens[t]] = (wordFreq[tokens[t]] || 0) + 1;
          totalWords++;
        }
      }

      // 香农熵
      var entropy = 0;
      for (var w in wordFreq) {
        var p = wordFreq[w] / totalWords;
        entropy -= p * Math.log2(p);
      }

      return entropy;
    },

    // ---- 7.3 覆盖度检测 ----
    checkCoverage: function (work) {
      var lm = getLM(work);
      if (!lm) return null;

      var chapters = lm.chapterIndex || [];
      var totalChapters = chapters.length;
      if (totalChapters === 0) return null;

      // 检查每章的覆盖情况
      var coverage = [];
      var gaps = [];

      for (var i = 0; i < totalChapters; i++) {
        var chapterIdx = chapters[i].chapterIdx || i;
        var hasCore = false, hasChar = false, hasPlot = false, hasLoc = false;

        var anchors = lm.memoryAnchors || {};
        for (var k in anchors) {
          var arr = anchors[k] || [];
          for (var a = 0; a < arr.length; a++) {
            if ((arr[a].chapterIdx || 0) === chapterIdx) {
              if (k === 'core') hasCore = true;
              if (k === 'characterTags') hasChar = true;
              if (k === 'locations') hasLoc = true;
              hasPlot = true;
            }
          }
        }

        var score = (hasCore ? 2 : 0) + (hasChar ? 1 : 0) + (hasPlot ? 1 : 0) + (hasLoc ? 1 : 0);
        coverage.push({ chapter: chapterIdx, score: score, max: 5 });

        if (score <= 1) {
          gaps.push({ chapter: chapterIdx, detail: '第' + (chapterIdx + 1) + '章记忆覆盖不足（得分' + score + '/5）' });
        }
      }

      var avgScore = coverage.reduce(function (a, b) { return a + b.score; }, 0) / coverage.length;

      return {
        coverage: coverage,
        gaps: gaps,
        averageScore: avgScore.toFixed(1),
        totalGaps: gaps.length,
        health: avgScore >= 4 ? 'excellent' : avgScore >= 2.5 ? 'good' : avgScore >= 1.5 ? 'fair' : 'poor'
      };
    }
  };

  // ==========================================================================
  // === PART 8：写作建议生成 ==================================================
  // ==========================================================================

  var Advisor = {
    // ---- 8.1 基于记忆分析生成写作建议 ----
    generateAdvice: function (work) {
      var lm = getLM(work);
      if (!lm) return [];

      var advice = [];
      var chapters = lm.chapterIndex || [];
      var totalChapters = chapters.length;

      // 1. 基于缺口的建议
      var gaps = Reasoning.detectGaps(work);
      for (var g = 0; g < Math.min(gaps.length, 5); g++) {
        if (gaps[g].severity === 'high') {
          advice.push({ priority: 'high', category: '缺口填补', detail: gaps[g].suggestion || gaps[g].detail });
        }
      }

      // 2. 基于预测的建议
      var predictions = Prediction.predictNextChapter(work, totalChapters);
      for (var p = 0; p < Math.min(predictions.length, 3); p++) {
        if (predictions[p].priority === 'high') {
          advice.push({ priority: 'high', category: '情节预测', detail: predictions[p].detail });
        }
      }

      // 3. 基于矛盾的建议
      var contradictions = Reasoning.detectContradictions(work);
      for (var c = 0; c < Math.min(contradictions.length, 3); c++) {
        advice.push({
          priority: 'high',
          category: '矛盾修复',
          detail: '发现' + contradictions[c].type + '：' + (contradictions[c].entity || '')
        });
      }

      // 4. 基于情感弧线的建议
      var emotion = EmotionArc.analyzeGlobalEmotion(work);
      if (emotion && emotion.advice) {
        advice.push({
          priority: emotion.monotonous ? 'medium' : 'low',
          category: '情感节奏',
          detail: emotion.advice
        });
      }

      // 5. 基于伏笔的建议
      var foreReport = ForeshadowManager.getHealthReport(work);
      if (foreReport && foreReport.health !== 'excellent') {
        advice.push({
          priority: foreReport.health === 'critical' ? 'high' : 'medium',
          category: '伏笔管理',
          detail: foreReport.advice
        });
      }

      // 6. 基于记忆密度的建议
      var density = Quality.analyzeDensity(work);
      if (density) {
        if (density.health === 'low') {
          advice.push({
            priority: 'medium',
            category: '记忆密度',
            detail: '每章平均记忆锚点仅' + density.anchorsPerChapter + '个，建议丰富情节细节'
          });
        }
        if (density.characters < 3 && totalChapters > 20) {
          advice.push({
            priority: 'low',
            category: '角色丰富度',
            detail: '长篇作品中角色较少（' + density.characters + '个），可考虑引入新角色'
          });
        }
      }

      // 7. 基于覆盖度的建议
      var coverage = Quality.checkCoverage(work);
      if (coverage && coverage.totalGaps > 0) {
        advice.push({
          priority: 'medium',
          category: '记忆覆盖',
          detail: '有' + coverage.totalGaps + '章记忆覆盖不足，建议补充关键记忆点'
        });
      }

      return advice.sort(function (a, b) {
        var order = { 'high': 0, 'medium': 1, 'low': 2 };
        return (order[a.priority] || 1) - (order[b.priority] || 1);
      });
    },

    // ---- 8.2 生成章节写作引导 ----
    generateChapterGuide: function (work, chapterIdx) {
      var guide = [];
      var lm = getLM(work);
      if (!lm) return guide;

      // 1. 待解伏笔提醒
      var foreshadows = lm.foreshadowLedger || [];
      var relevantFore = foreshadows.filter(function (f) {
        return (f.status !== '已解') && (f.chapterIdx || 0) < chapterIdx;
      }).slice(0, 5);
      if (relevantFore.length > 0) {
        guide.push({
          section: '待解伏笔',
          items: relevantFore.map(function (f) {
            return '第' + ((f.chapterIdx || 0) + 1) + '章：' + (f.text || '').substring(0, 40);
          })
        });
      }

      // 2. 角色当前状态
      var charStates = lm.charStates || [];
      if (charStates.length > 0) {
        guide.push({
          section: '角色状态',
          items: charStates.map(function (cs) {
            return cs.name + '：' + cs.status + (cs.location ? ' | 位于' + cs.location : '') + (cs.emotion ? ' | ' + cs.emotion : '');
          })
        });
      }

      // 3. 待解线索
      var plotThreads = lm.plotThreads || [];
      var pending = plotThreads.filter(function (t) { return t.status === '待解'; }).slice(0, 5);
      if (pending.length > 0) {
        guide.push({
          section: '待推进线索',
          items: pending.map(function (t) { return t.title || ''; })
        });
      }

      // 4. 近期摘要
      var rollingSummary = lm.rollingSummary || {};
      if (rollingSummary.recent && rollingSummary.recent.length > 10) {
        guide.push({
          section: '近期摘要',
          items: [rollingSummary.recent.substring(0, 300)]
        });
      }

      return guide;
    }
  };

  // ==========================================================================
  // === PART 9：Prompt 智能构建 ==============================================
  // ==========================================================================

  var PromptBuilder = {
    // ---- 9.1 自适应上下文窗口构建 ----
    buildAdaptivePrompt: function (work, chapterIdx, userQuery, maxTokens) {
      maxTokens = maxTokens || 4000;
      var lm = getLM(work);
      if (!lm) return '';

      var sections = [];
      var usedTokens = 0;

      // L1: 核心记忆锚点（最高优先级，必须包含）
      var coreText = this._buildCoreAnchors(lm, chapterIdx);
      if (coreText && coreText.length < maxTokens * 0.3) {
        sections.push(coreText);
        usedTokens += coreText.length;
      }

      // L2: 角色状态
      var charText = this._buildCharStates(lm);
      if (charText && usedTokens + charText.length < maxTokens * 0.6) {
        sections.push(charText);
        usedTokens += charText.length;
      }

      // L3: 滚动摘要（根据剩余空间选择层级）
      var remaining = maxTokens - usedTokens;
      if (remaining > 200) {
        var summaryText = this._buildRollingSummary(lm, remaining);
        if (summaryText) {
          sections.push(summaryText);
          usedTokens += summaryText.length;
        }
      }

      // L4: 伏笔提醒
      remaining = maxTokens - usedTokens;
      if (remaining > 150) {
        var foreText = this._buildForeshadowReminder(lm, chapterIdx, remaining);
        if (foreText) {
          sections.push(foreText);
          usedTokens += foreText.length;
        }
      }

      // L5: 用户查询相关的记忆检索
      remaining = maxTokens - usedTokens;
      if (userQuery && remaining > 200) {
        var queryText = this._buildQueryContext(lm, userQuery, remaining);
        if (queryText) {
          sections.push(queryText);
        }
      }

      return sections.join('\n\n');
    },

    _buildCoreAnchors: function (lm, chapterIdx) {
      var anchors = lm.memoryAnchors || {};
      var lines = ['【核心记忆点（必须遵循）】'];
      var anchorOrder = ['core', 'characterTags', 'relationships', 'promises', 'chapterContext'];
      var hasContent = false;

      for (var o = 0; o < anchorOrder.length; o++) {
        var k = anchorOrder[o];
        var arr = (anchors[k] || []).filter(function (a) {
          return (a.chapterIdx || 0) < chapterIdx && a.status !== '已兑现' && a.status !== '失效';
        });
        if (arr.length === 0) continue;
        var names = { core: '核心事实', characterTags: '角色标志', relationships: '关系变化', promises: '承诺禁忌', chapterContext: '章节上下文' };
        lines.push('  ' + (names[k] || k) + '：' + arr.slice(0, 10).map(function (a) { return a.text; }).join('；'));
        hasContent = true;
      }

      return hasContent ? lines.join('\n') : '';
    },

    _buildCharStates: function (lm) {
      var states = lm.charStates || [];
      if (states.length === 0) return '';
      var lines = ['【人物当前状态】'];
      states.forEach(function (cs) {
        lines.push('  ' + cs.name + '：' + cs.status + (cs.location && cs.location !== '未知' ? '，位于' + cs.location : '') + (cs.emotion ? '，情绪[' + cs.emotion + ']' : ''));
      });
      return lines.join('\n');
    },

    _buildRollingSummary: function (lm, maxLen) {
      var rs = lm.rollingSummary || {};
      var texts = [];
      if (rs.recent && rs.recent.length > 10) texts.push(rs.recent);
      if (rs.milestones && rs.milestones.length > 10) texts.push(rs.milestones);
      if (rs.eras && rs.eras.length > 10) texts.push(rs.eras);

      if (texts.length === 0) return '';

      var combined = texts.join('\n');
      if (combined.length > maxLen) {
        combined = combined.substring(0, maxLen);
      }

      return '【全书摘要】\n' + combined;
    },

    _buildForeshadowReminder: function (lm, chapterIdx, maxLen) {
      var foreshadows = lm.foreshadowLedger || [];
      var unresolved = foreshadows.filter(function (f) {
        return (f.status !== '已解') && (f.chapterIdx || 0) < chapterIdx;
      }).slice(0, 8);

      if (unresolved.length === 0) return '';

      var text = '【未解伏笔提醒】\n' + unresolved.map(function (f) {
        return '  第' + ((f.chapterIdx || 0) + 1) + '章：' + (f.text || '').substring(0, 50);
      }).join('\n');

      return text.length > maxLen ? text.substring(0, maxLen) : text;
    },

    _buildQueryContext: function (lm, query, maxLen) {
      var queryTokens = tokenize(query);
      if (queryTokens.length === 0) return '';

      var anchors = lm.memoryAnchors || {};
      var allItems = [];
      for (var k in anchors) {
        (anchors[k] || []).forEach(function (a) {
          allItems.push({ text: a.text || '', chapter: a.chapterIdx || 0, type: k });
        });
      }

      // 评分
      var scored = allItems.map(function (item) {
        var itemTokens = tokenize(item.text);
        return { item: item, score: jaccard(queryTokens, itemTokens) };
      }).filter(function (s) { return s.score > 0.1; })
        .sort(function (a, b) { return b.score - a.score; });

      if (scored.length === 0) return '';

      var text = '【相关记忆检索】\n';
      var used = 0;
      for (var i = 0; i < scored.length && used < maxLen; i++) {
        var entry = '  [' + scored[i].item.type + '] 第' + (scored[i].item.chapter + 1) + '章：' + scored[i].item.text.substring(0, 60) + '\n';
        if (used + entry.length > maxLen) break;
        text += entry;
        used += entry.length;
      }

      return text;
    }
  };

  // ==========================================================================
  // === PART 10：记忆诊断面板 ================================================
  // ==========================================================================

  var Diagnostics = {
    // ---- 10.1 全量健康检查 ----
    fullHealthCheck: function (work) {
      var lm = getLM(work);
      if (!lm) return { status: 'error', message: '无法获取 longMemory' };

      var checks = [];

      // 1. 数据完整性
      var structureCheck = this._checkStructure(lm);
      checks.push(structureCheck);

      // 2. 记忆锚点健康
      var anchorCheck = this._checkAnchors(lm);
      checks.push(anchorCheck);

      // 3. 章节索引健康
      var chapterCheck = this._checkChapterIndex(lm);
      checks.push(chapterCheck);

      // 4. 角色档案健康
      var charCheck = this._checkCharacterProfiles(lm);
      checks.push(charCheck);

      // 5. 伏笔健康
      var foreCheck = this._checkForeshadows(lm);
      checks.push(foreCheck);

      // 6. 存储健康
      var storageCheck = this._checkStorage(lm);
      checks.push(storageCheck);

      var passCount = checks.filter(function (c) { return c.status === 'pass'; }).length;
      var warnCount = checks.filter(function (c) { return c.status === 'warn'; }).length;
      var failCount = checks.filter(function (c) { return c.status === 'fail'; }).length;

      return {
        status: failCount > 0 ? 'critical' : warnCount > 2 ? 'warning' : 'healthy',
        score: Math.round(passCount / checks.length * 100),
        checks: checks,
        summary: passCount + '项通过, ' + warnCount + '项警告, ' + failCount + '项异常'
      };
    },

    _checkStructure: function (lm) {
      var required = ['memoryAnchors', 'chapterIndex', 'characterHistory', 'rollingSummary',
        'characterProfiles', 'foreshadowLedger', 'itemLedger', 'factionGraph', 'timelineEvents'];
      var missing = required.filter(function (k) { return !lm[k]; });
      return {
        name: '数据结构完整性',
        status: missing.length === 0 ? 'pass' : 'fail',
        detail: missing.length === 0 ? '所有必需字段完整' : '缺少字段：' + missing.join(', ')
      };
    },

    _checkAnchors: function (lm) {
      var anchors = lm.memoryAnchors || {};
      var expectedKeys = ['core', 'characterTags', 'relationships', 'items', 'locations', 'promises', 'timeline', 'hooks'];
      var total = 0;
      var empty = [];
      expectedKeys.forEach(function (k) {
        var cnt = (anchors[k] || []).length;
        total += cnt;
        if (cnt === 0) empty.push(k);
      });

      var status = total === 0 ? 'fail' : empty.length > 3 ? 'warn' : 'pass';
      var detail = '共' + total + '条记忆锚点';
      if (empty.length > 0) detail += '，空桶：' + empty.join(', ');

      return { name: '记忆锚点', status: status, detail: detail, total: total };
    },

    _checkChapterIndex: function (lm) {
      var chapters = lm.chapterIndex || [];
      var status = chapters.length === 0 ? 'warn' : 'pass';
      return {
        name: '章节索引',
        status: status,
        detail: '共' + chapters.length + '条章节摘要',
        total: chapters.length
      };
    },

    _checkCharacterProfiles: function (lm) {
      var profiles = lm.characterProfiles || {};
      var names = Object.keys(profiles);
      var incomplete = names.filter(function (n) {
        var p = profiles[n];
        return !p || !p.currentStatus || p.lastSeen === undefined;
      });

      var status = names.length === 0 ? 'warn' : incomplete.length > names.length * 0.5 ? 'warn' : 'pass';
      return {
        name: '角色档案',
        status: status,
        detail: names.length + '个角色，' + incomplete.length + '个档案不完整',
        total: names.length
      };
    },

    _checkForeshadows: function (lm) {
      var foreshadows = lm.foreshadowLedger || [];
      var resolved = foreshadows.filter(function (f) { return f.status === '已解'; }).length;
      var unresolved = foreshadows.length - resolved;
      var rate = foreshadows.length > 0 ? resolved / foreshadows.length : 0;

      var status = rate < 0.3 && foreshadows.length > 5 ? 'warn' : 'pass';
      return {
        name: '伏笔管理',
        status: status,
        detail: foreshadows.length + '个伏笔，' + resolved + '个已解（' + (rate * 100).toFixed(0) + '%）',
        total: foreshadows.length
      };
    },

    _checkStorage: function (lm) {
      var size = 0;
      try { size = JSON.stringify(lm).length; } catch (e) { size = -1; }
      var status = size < 0 ? 'fail' : size > 5 * 1024 * 1024 ? 'warn' : 'pass';
      return {
        name: '存储大小',
        status: status,
        detail: size < 0 ? '无法计算' : (size / 1024 / 1024).toFixed(2) + 'MB',
        size: size
      };
    },

    // ---- 10.2 修复建议 ----
    generateRepairPlan: function (work) {
      var health = this.fullHealthCheck(work);
      if (health.status === 'healthy') return [];

      var plan = [];
      for (var c = 0; c < health.checks.length; c++) {
        var check = health.checks[c];
        if (check.status === 'fail') {
          plan.push({ action: '修复', target: check.name, detail: check.detail, priority: 'high' });
        } else if (check.status === 'warn') {
          plan.push({ action: '优化', target: check.name, detail: check.detail, priority: 'medium' });
        }
      }
      return plan;
    }
  };

  // ==========================================================================
  // === PART 11：跨作品记忆迁移 ==============================================
  // ==========================================================================

  var CrossWork = {
    // ---- 11.1 提取写作模式指纹 ----
    extractStyleFingerprint: function (work) {
      var lm = getLM(work);
      if (!lm) return null;

      var patterns = Reasoning.detectPatterns(work);
      var emotion = EmotionArc.analyzeGlobalEmotion(work);
      var density = Quality.analyzeDensity(work);

      return {
        workTitle: work.title || '未命名',
        totalChapters: (lm.chapterIndex || []).length,
        dominantPatterns: patterns.slice(0, 5).map(function (p) { return p.pattern; }),
        emotionalProfile: emotion ? {
          avgValence: emotion.averageValence,
          variance: emotion.variance,
          dominant: emotion.dominantEmotion
        } : null,
        memoryDensity: density ? density.anchorsPerChapter : 'N/A',
        characterCount: density ? density.characters : 0,
        foreshadowCount: density ? density.foreshadows : 0,
        timestamp: Date.now()
      };
    },

    // ---- 11.2 比较两部作品的记忆模式 ----
    compareWorks: function (workA, workB) {
      var fpA = this.extractStyleFingerprint(workA);
      var fpB = this.extractStyleFingerprint(workB);

      if (!fpA || !fpB) return null;

      var commonPatterns = fpA.dominantPatterns.filter(function (p) {
        return fpB.dominantPatterns.indexOf(p) >= 0;
      });

      return {
        workA: fpA.workTitle,
        workB: fpB.workTitle,
        commonPatterns: commonPatterns,
        uniqueToA: fpA.dominantPatterns.filter(function (p) { return fpB.dominantPatterns.indexOf(p) < 0; }),
        uniqueToB: fpB.dominantPatterns.filter(function (p) { return fpA.dominantPatterns.indexOf(p) < 0; }),
        similarity: fpA.dominantPatterns.length > 0 ?
          (commonPatterns.length / Math.max(fpA.dominantPatterns.length, fpB.dominantPatterns.length) * 100).toFixed(0) + '%' : '0%',
        emotionDiff: fpA.emotionalProfile && fpB.emotionalProfile ?
          Math.abs(fpA.emotionalProfile.avgValence - fpB.emotionalProfile.avgValence).toFixed(2) : 'N/A'
      };
    }
  };

  // ==========================================================================
  // === PART 12：记忆快照与回滚 ==============================================
  // ==========================================================================

  var Snapshots = {
    _snapshots: {},

    // ---- 12.1 创建快照 ----
    create: function (work, label) {
      if (!work || !work.id) return null;
      var lm = getLM(work);
      if (!lm) return null;

      var snapshotId = 'snap_' + work.id + '_' + Date.now();
      var snapshot = {
        id: snapshotId,
        workId: work.id,
        label: label || ('快照_' + new Date().toLocaleString()),
        timestamp: Date.now(),
        data: JSON.parse(JSON.stringify(lm))
      };

      if (!this._snapshots[work.id]) this._snapshots[work.id] = [];
      this._snapshots[work.id].push(snapshot);

      // 最多保留10个快照
      if (this._snapshots[work.id].length > 10) {
        this._snapshots[work.id] = this._snapshots[work.id].slice(-10);
      }

      return snapshotId;
    },

    // ---- 12.2 列出快照 ----
    list: function (workId) {
      return (this._snapshots[workId] || []).map(function (s) {
        return { id: s.id, label: s.label, timestamp: s.timestamp };
      });
    },

    // ---- 12.3 回滚到快照 ----
    rollback: function (work, snapshotId) {
      if (!work || !work.id) return false;
      var snaps = this._snapshots[work.id] || [];
      var snap = snaps.find(function (s) { return s.id === snapshotId; });
      if (!snap) return false;

      // 先创建当前状态的自动快照
      this.create(work, '自动备份（回滚前）');

      // 回滚
      work.longMemory = JSON.parse(JSON.stringify(snap.data));
      return true;
    },

    // ---- 12.4 比较两个快照的差异 ----
    diff: function (workId, snapIdA, snapIdB) {
      var snaps = this._snapshots[workId] || [];
      var snapA = snaps.find(function (s) { return s.id === snapIdA; });
      var snapB = snaps.find(function (s) { return s.id === snapIdB; });
      if (!snapA || !snapB) return null;

      var diff = {
        addedAnchors: {},
        removedAnchors: {},
        modifiedChapters: 0,
        newForeshadows: 0
      };

      var anchorsA = snapA.data.memoryAnchors || {};
      var anchorsB = snapB.data.memoryAnchors || {};

      for (var k in anchorsB) {
        var added = (anchorsB[k] || []).length - (anchorsA[k] || []).length;
        if (added > 0) diff.addedAnchors[k] = added;
        if (added < 0) diff.removedAnchors[k] = -added;
      }

      diff.modifiedChapters = (snapB.data.chapterIndex || []).length - (snapA.data.chapterIndex || []).length;
      diff.newForeshadows = (snapB.data.foreshadowLedger || []).length - (snapA.data.foreshadowLedger || []).length;

      return diff;
    }
  };

  // ==========================================================================
  // === 公开 API =============================================================
  // ==========================================================================

  return {
    // 核心推理
    reasoning: Reasoning,
    prediction: Prediction,
    consistency: Consistency,

    // 高级分析
    emotionArc: EmotionArc,
    foreshadow: ForeshadowManager,
    graph: MemoryGraph,
    quality: Quality,

    // 实用工具
    advisor: Advisor,
    promptBuilder: PromptBuilder,
    diagnostics: Diagnostics,
    crossWork: CrossWork,
    snapshots: Snapshots,

    // 一键式操作
    fullAnalysis: function (work) {
      return {
        patterns: Reasoning.detectPatterns(work),
        gaps: Reasoning.detectGaps(work),
        contradictions: Reasoning.detectContradictions(work),
        predictions: Prediction.predictNextChapter(work, (getLM(work) ? (getLM(work).chapterIndex || []).length : 0)),
        consistency: Consistency.fullCheck(work),
        emotion: EmotionArc.analyzeGlobalEmotion(work),
        foreshadowHealth: ForeshadowManager.getHealthReport(work),
        quality: Quality.analyzeDensity(work),
        coverage: Quality.checkCoverage(work),
        advice: Advisor.generateAdvice(work),
        health: Diagnostics.fullHealthCheck(work)
      };
    },

    quickPrompt: function (work, chapterIdx, query) {
      return PromptBuilder.buildAdaptivePrompt(work, chapterIdx, query, 4000);
    },

    chapterGuide: function (work, chapterIdx) {
      return Advisor.generateChapterGuide(work, chapterIdx);
    },

    // 工具函数
    tokenize: tokenize,
    jaccard: jaccard
  };
})();

// 挂载到全局
window.MemorySkill = MemorySkill;