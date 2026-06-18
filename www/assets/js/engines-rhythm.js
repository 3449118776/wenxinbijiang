/* 文心笔匠 v2 增强引擎 - 网文节奏参考引擎 */
/* 独立模块，可直接 <script> 引入，不依赖其他文件 */
/* 提供全局对象：RhythmReferenceEngine */

var RhythmReferenceEngine = {

  // ========== 节拍类型定义 ==========
  BEAT_TYPES: {
    setup:        { name: '铺垫',     weight: 0.5, minGap: 1 },
    minor_beat:   { name: '小爆点',   weight: 1.0, minGap: 1 },
    medium_beat:  { name: '中爆点',   weight: 2.0, minGap: 3 },
    major_beat:   { name: '大爆点',   weight: 4.0, minGap: 8 },
    character:    { name: '人设补全', weight: 1.5, minGap: 2 },
    worldbuild:   { name: '世界观展开', weight: 1.2, minGap: 3 },
    foreshadow:   { name: '伏笔埋设', weight: 0.8, minGap: 1 },
    recovery:     { name: '伏笔回收', weight: 2.5, minGap: 5 },
    emotion:      { name: '情感爆发', weight: 2.0, minGap: 4 },
    battle:       { name: '战斗',     weight: 2.0, minGap: 2 },
    dialogue:     { name: '关键对话', weight: 1.3, minGap: 1 },
    revelation:   { name: '真相揭示', weight: 3.5, minGap: 8 },
    transition:   { name: '过渡',     weight: 0.3, minGap: 0 },
    hook:         { name: '章尾钩子', weight: 1.5, minGap: 0 }
  },

  // ========== 信号词库（用于细纲识别） ==========
  SIGNAL_WORDS: {
    minor_beat:  ['打脸', '反杀', '反击', '崭露头角', '小胜', '突破', '逆袭', '小冲突', '小高潮'],
    medium_beat: ['重要打脸', '关键突破', '势力交锋', '重要揭露', '中高潮', '重要反转', '关键线索'],
    major_beat:  ['大反转', '大揭密', '重要战斗', '改变格局', '大高潮', '震惊', '格局', '震撼'],
    revelation:  ['真相', '原来是', '并非', '揭密', '揭开', '其实是', '竟然是'],
    recovery:    ['呼应', '原来', '此前', '当初', '之前伏笔', '伏笔回收', '呼应前文'],
    emotion:     ['泪崩', '心碎', '愤怒', '狂喜', '绝望', '感动', '崩溃', '激动'],
    battle:      ['战', '斗', '杀', '击', '攻', '剑', '刀', '对决', '出手', '激战'],
    dialogue:    ['重要对话', '摊牌', '谈判', '质问', '密谈', '对峙'],
    setup:       ['了解', '调查', '准备', '计划', '布局', '观察', '熟悉'],
    worldbuild:  ['介绍', '解释', '新区域', '新势力', '新规则', '地图', '体系'],
    character:   ['回忆', '往事', '身份', '性格展示', '内心', '独白', '往事'],
    transition:  ['休息', '返程', '途中', '间隔', '时间流逝', '日常', '过渡']
  },

  // ========== 节奏模板库（平台 × 题材） ==========
  // 每个模板是一组规则函数，输入章节号返回期望的节拍数组与强度
  RHYTHM_TEMPLATES: {
    // 模板1：番茄·爽文流（最快节奏）
    fanqie_shuang: function (ch) {
      var expected = [];
      var intensity = 0;
      if (ch <= 3) {
        expected.push('setup');
        expected.push('major_beat');
        expected.push('hook');
        intensity = 5;
      } else {
        if (ch % 10 === 0) {
          expected.push('major_beat');
          intensity += 4;
        } else if (ch % 5 === 0) {
          expected.push('medium_beat');
          intensity += 2;
        } else if (ch % 3 === 0) {
          expected.push('minor_beat');
          intensity += 1;
        } else {
          expected.push('minor_beat');
          intensity += 1;
        }
        if (ch % 7 === 0) expected.push('foreshadow');
        if (ch % 8 === 0) expected.push('character');
        expected.push('hook');
        intensity += 1;
      }
      return { expected: expected, intensity: Math.min(intensity, 5) };
    },

    // 模板2：起点·慢热流（厚重型）
    qidian_slow: function (ch) {
      var expected = [];
      var intensity = 0;
      if (ch <= 5) {
        expected.push('worldbuild');
        expected.push('setup');
        intensity = 1;
        if (ch === 5) {
          expected.push('minor_beat');
          intensity += 1;
        }
      } else if (ch >= 6 && ch <= 8) {
        expected.push('minor_beat');
        intensity = 2;
      } else {
        if (ch % 20 === 0) {
          expected.push('major_beat');
          intensity += 4;
        } else if (ch % 8 === 0) {
          expected.push('medium_beat');
          intensity += 2;
        } else if (ch % 5 === 0) {
          expected.push('character');
          intensity += 1;
        } else if (ch % 4 === 0) {
          expected.push('foreshadow');
          intensity += 1;
        } else {
          expected.push('worldbuild');
          intensity += 1;
        }
      }
      if (ch % 5 === 0) expected.push('hook');
      return { expected: expected, intensity: Math.min(intensity, 5) };
    },

    // 模板3：起点·群像成长流
    qidian_group: function (ch) {
      var expected = [];
      var intensity = 0;
      if (ch % 5 === 0) {
        expected.push('character');
        intensity += 2;
      }
      if (ch % 12 === 0) {
        expected.push('medium_beat');
        intensity += 2;
      }
      if (ch % 25 === 0) {
        expected.push('major_beat');
        intensity += 4;
      }
      if (ch % 8 === 0) {
        expected.push('dialogue');
        intensity += 1;
      }
      if (expected.length === 0) {
        expected.push('setup');
        intensity = 1;
      }
      expected.push('hook');
      intensity += 1;
      return { expected: expected, intensity: Math.min(intensity, 5) };
    },

    // 模板4：悬疑·解谜流
    mystery: function (ch) {
      var expected = [];
      var intensity = 0;
      if (ch % 3 === 0) {
        expected.push('foreshadow');
        intensity += 1;
      }
      if (ch % 6 === 0) {
        expected.push('minor_beat');
        intensity += 1;
      }
      if (ch % 15 === 0) {
        expected.push('medium_beat');
        intensity += 2;
      }
      if (ch % 30 === 0) {
        expected.push('revelation');
        intensity += 4;
      }
      if (ch % 20 === 0) {
        expected.push('recovery');
        intensity += 2;
      }
      if (expected.length === 0) {
        expected.push('dialogue');
        intensity = 1;
      }
      expected.push('hook');
      intensity += 1;
      return { expected: expected, intensity: Math.min(intensity, 5) };
    },

    // 模板5：情感·言情流
    romance: function (ch) {
      var expected = [];
      var intensity = 0;
      if (ch <= 3) {
        expected.push('setup');
        expected.push('character');
        intensity = 1;
      } else if (ch <= 8) {
        expected.push('dialogue');
        intensity = 2;
        if (ch === 8) {
          expected.push('emotion');
          intensity += 2;
        }
      } else if (ch <= 15) {
        expected.push('emotion');
        intensity = 3;
        if (ch === 15) {
          expected.push('major_beat');
          intensity += 2;
        }
      } else {
        if (ch % 7 === 0) {
          expected.push('emotion');
          intensity += 3;
        }
        if (ch % 12 === 0) {
          expected.push('medium_beat');
          intensity += 2;
        }
        if (ch % 20 === 0) {
          expected.push('major_beat');
          intensity += 4;
        }
        if (expected.length === 0) {
          expected.push('dialogue');
          intensity = 1;
        }
      }
      expected.push('hook');
      intensity += 1;
      return { expected: expected, intensity: Math.min(intensity, 5) };
    }
  },

  // 平台+题材到模板的映射
  TEMPLATE_MAP: {
    'qidian:xuanhuan': 'qidian_slow',
    'qidian:xianxia':  'qidian_slow',
    'qidian:dushi':    'qidian_group',
    'qidian:lishi':    'qidian_slow',
    'qidian:kehuan':   'qidian_group',
    'qidian:qunxiang': 'qidian_group',
    'fanqie:shuang':   'fanqie_shuang',
    'fanqie:chongsheng': 'fanqie_shuang',
    'fanqie:chuanyue':  'fanqie_shuang',
    'fanqie:dushi':     'fanqie_shuang',
    'mystery:default':  'mystery',
    'romance:default':  'romance'
  },

  // ========== 辅助工具函数 ==========
  _getTemplate: function (platform, genre) {
    var self = this;
    // 平台名归一化（兼容中英文别名）
    var normalizePlatform = function (p) {
      if (!p) return 'qidian';
      var map = {
        '番茄': 'fanqie',
        'fanqie': 'fanqie',
        'qutu': 'fanqie',
        '起点': 'qidian',
        'qidian': 'qidian',
        '悬疑': 'mystery',
        'mystery': 'mystery',
        '言情': 'romance',
        'romance': 'romance'
      };
      return map[p] || 'qidian';
    };
    // 题材名归一化
    var normalizeGenre = function (g) {
      if (!g) return 'default';
      var map = {
        '修仙': 'xianxia',
        '玄幻': 'xuanhuan',
        '都市': 'dushi',
        '历史': 'lishi',
        '科幻': 'kehuan',
        '重生': 'chongsheng',
        '穿越': 'chuanyue'
      };
      return map[g] || 'default';
    };
    var pNorm = normalizePlatform(platform);
    var gNorm = normalizeGenre(genre);
    var key = pNorm + ':' + gNorm;
    var templateName = this.TEMPLATE_MAP[key];
    if (!templateName) {
      // 回退策略：按平台默认
      if (pNorm === 'fanqie') templateName = 'fanqie_shuang';
      else if (pNorm === 'mystery') templateName = 'mystery';
      else if (pNorm === 'romance') templateName = 'romance';
      else templateName = 'qidian_slow';
    }
    return this.RHYTHM_TEMPLATES[templateName];
  },

  _countBeats: function (beats) {
    var map = {};
    for (var i = 0; i < beats.length; i++) {
      var key = beats[i];
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  },

  _sum: function (arr) {
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += arr[i];
    return s;
  },

  _avg: function (arr) {
    if (!arr || arr.length === 0) return 0;
    return this._sum(arr) / arr.length;
  },

  _intensityToChar: function (level) {
    if (level <= 0) return '·';
    if (level === 1) return '░';
    if (level === 2) return '▒';
    if (level === 3) return '▓';
    if (level === 4) return '█';
    return '█';
  },

  // ========== 方法 1：生成期望节奏 ==========
  generateExpectedRhythm: function (platform, genre, volumeSize) {
    var template = this._getTemplate(platform, genre);
    var size = volumeSize || 50;
    var result = [];
    for (var ch = 1; ch <= size; ch++) {
      var info = template(ch);
      result.push({
        chapter: ch,
        expected: info.expected,
        intensity: info.intensity
      });
    }
    return result;
  },

  // ========== 方法 2：从细纲提取实际节拍 ==========
  extractActualBeatsFromOutline: function (detailText) {
    var result = [];
    if (!detailText) return result;
    var lines = detailText.split('\n');
    var self = this;

    var chapterRe = new RegExp('^\\s*(?:第?\\s*([0-9]+)\\s*[章节篇回]|[Cc]hapter\\s*([0-9]+))', 'i');
    var hookRe = new RegExp('(?:hook|钩子|悬念|追读)', 'i');

    var currentChapter = null;
    var currentBuffer = '';
    var currentHasHook = false;

    function flushChapter() {
      if (currentChapter === null || currentChapter === undefined) return;
      var buffer = currentBuffer;
      var found = {};
      var typeKeys = Object.keys(self.SIGNAL_WORDS);
      for (var ti = 0; ti < typeKeys.length; ti++) {
        var t = typeKeys[ti];
        var words = self.SIGNAL_WORDS[t];
        for (var wi = 0; wi < words.length; wi++) {
          if (buffer.indexOf(words[wi]) !== -1) {
            found[t] = true;
            break;
          }
        }
      }
      if (currentHasHook) found.hook = true;
      var beats = Object.keys(found);
      // 确定主beat：按 BEAT_TYPES 的 weight 排序
      var mainBeat = 'transition';
      var maxWeight = 0;
      for (var bi = 0; bi < beats.length; bi++) {
        var b = beats[bi];
        var weight = (self.BEAT_TYPES[b] || {}).weight || 0;
        if (weight > maxWeight) {
          maxWeight = weight;
          mainBeat = b;
        }
      }
      var intensity = 0;
      for (var bi2 = 0; bi2 < beats.length; bi2++) {
        intensity += (self.BEAT_TYPES[beats[bi2]] || {}).weight || 0;
      }
      intensity = Math.min(Math.round(intensity), 5);
      result.push({
        chapter: currentChapter,
        beats: beats,
        mainBeat: mainBeat,
        intensity: intensity
      });
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var m = line.match(chapterRe);
      if (m) {
        flushChapter();
        currentChapter = parseInt(m[1] || m[2] || '0', 10);
        currentBuffer = line + '\n';
        currentHasHook = hookRe.test(line);
      } else {
        currentBuffer += line + '\n';
        if (hookRe.test(line)) currentHasHook = true;
      }
    }
    flushChapter();
    return result;
  },

  // ========== 方法 3：对比节奏 ==========
  compareRhythm: function (actual, expected) {
    var issues = [];
    var matchCount = 0;
    var totalChapters = Math.min(actual.length, expected.length);

    // 实际章节按 chapter 号索引
    var actualMap = {};
    for (var i = 0; i < actual.length; i++) {
      actualMap[actual[i].chapter] = actual[i];
    }
    var expectedMap = {};
    for (var j = 0; j < expected.length; j++) {
      expectedMap[expected[j].chapter] = expected[j];
    }

    // 按章匹配
    for (var ch = 1; ch <= totalChapters; ch++) {
      var a = actualMap[ch];
      var e = expectedMap[ch];
      if (!a || !e) continue;
      // 检查主beat是否在期望列表中
      if (a.mainBeat && e.expected.indexOf(a.mainBeat) !== -1) {
        matchCount++;
      } else {
        // 检查次要匹配
        var anyMatch = false;
        for (var bi = 0; bi < a.beats.length; bi++) {
          if (e.expected.indexOf(a.beats[bi]) !== -1) {
            anyMatch = true;
            break;
          }
        }
        if (anyMatch) matchCount += 0.5;
        else issues.push('第' + ch + '章：期望 ' + e.expected.join('/') + '，实际为 ' + a.mainBeat);
      }
    }

    var matchScore = totalChapters > 0 ? Math.round((matchCount / totalChapters) * 100) : 0;

    // 疲劳区检测：连续3章以上无强beat (minor_beat/medium_beat/major_beat/revelation/emotion/battle)
    var strongBeatSet = { minor_beat: 1, medium_beat: 1, major_beat: 1, revelation: 1, emotion: 1, battle: 1 };
    var fatigueZones = [];
    var fatigueStart = null;
    var sortedChapters = Object.keys(actualMap).map(function (v) { return parseInt(v, 10); }).sort(function (a, b) { return a - b; });
    var prev = null;
    for (var ci = 0; ci < sortedChapters.length; ci++) {
      var chNum = sortedChapters[ci];
      var act = actualMap[chNum];
      var hasStrong = false;
      for (var bi2 = 0; bi2 < act.beats.length; bi2++) {
        if (strongBeatSet[act.beats[bi2]]) { hasStrong = true; break; }
      }
      if (!hasStrong) {
        if (fatigueStart === null) fatigueStart = chNum;
        prev = chNum;
      } else {
        if (fatigueStart !== null && prev !== null && prev - fatigueStart + 1 >= 3) {
          fatigueZones.push({ from: fatigueStart, to: prev, reason: '连续' + (prev - fatigueStart + 1) + '章无强爆点' });
        }
        fatigueStart = null;
        prev = null;
      }
    }
    if (fatigueStart !== null && prev !== null && prev - fatigueStart + 1 >= 3) {
      fatigueZones.push({ from: fatigueStart, to: prev, reason: '连续' + (prev - fatigueStart + 1) + '章无强爆点' });
    }

    // 过度密集区检测：连续3章以上强度 >= 4
    var overSaturatedZones = [];
    var overStart = null;
    var overPrev = null;
    for (var ci2 = 0; ci2 < sortedChapters.length; ci2++) {
      var chNum2 = sortedChapters[ci2];
      var act2 = actualMap[chNum2];
      if (act2.intensity >= 4) {
        if (overStart === null) overStart = chNum2;
        overPrev = chNum2;
      } else {
        if (overStart !== null && overPrev !== null && overPrev - overStart + 1 >= 3) {
          overSaturatedZones.push({ from: overStart, to: overPrev, reason: '连续' + (overPrev - overStart + 1) + '章高强度，读者可能审美疲劳' });
        }
        overStart = null;
        overPrev = null;
      }
    }
    if (overStart !== null && overPrev !== null && overPrev - overStart + 1 >= 3) {
      overSaturatedZones.push({ from: overStart, to: overPrev, reason: '连续' + (overPrev - overStart + 1) + '章高强度，读者可能审美疲劳' });
    }

    // 缺漏 major_beat / revelation 检测
    for (var ch2 = 1; ch2 <= Math.max(totalChapters, sortedChapters[sortedChapters.length - 1] || 0); ch2++) {
      var e2 = expectedMap[ch2];
      var a2 = actualMap[ch2];
      if (e2) {
        var needsMajor = e2.expected.indexOf('major_beat') !== -1 || e2.expected.indexOf('revelation') !== -1;
        if (needsMajor) {
          if (!a2 || (a2.beats.indexOf('major_beat') === -1 && a2.beats.indexOf('revelation') === -1)) {
            issues.push('第' + ch2 + '章：缺少期望的 ' + (e2.expected.indexOf('major_beat') !== -1 ? '大爆点' : '真相揭示'));
          }
        }
      }
    }

    // 类型均衡度
    var allBeats = [];
    for (var mi = 0; mi < sortedChapters.length; mi++) {
      allBeats = allBeats.concat(actualMap[sortedChapters[mi]].beats);
    }
    var typeBalance = this._countBeats(allBeats);

    // 单调检测
    var dominantType = null;
    var dominantCount = 0;
    var totalBeats = allBeats.length;
    var tbKeys = Object.keys(typeBalance);
    for (var tbi = 0; tbi < tbKeys.length; tbi++) {
      if (typeBalance[tbKeys[tbi]] > dominantCount) {
        dominantCount = typeBalance[tbKeys[tbi]];
        dominantType = tbKeys[tbi];
      }
    }
    if (dominantType && totalBeats > 5 && dominantCount / totalBeats > 0.6) {
      issues.push('类型过于单一：' + (this.BEAT_TYPES[dominantType] || {}).name + ' 占比 ' + Math.round(dominantCount / totalBeats * 100) + '%');
    }

    // 生成建议
    var suggestion = '';
    if (issues.length > 0) {
      // 找出第一个缺 major 或 medium 的位置
      var firstMissing = -1;
      for (var issi = 0; issi < issues.length; issi++) {
        var issText = issues[issi];
        if (issText.indexOf('缺少期望的') !== -1 || issText.indexOf('需要') !== -1) {
          var mNum = issText.match(new RegExp('第([0-9]+)章'));
          if (mNum && firstMissing === -1) firstMissing = parseInt(mNum[1], 10);
        }
      }
      if (firstMissing !== -1) {
        suggestion = '需要在第' + firstMissing + '章附近安排1个中/大爆点';
      } else {
        suggestion = issues[0];
      }
    } else {
      suggestion = '当前节奏与模板匹配良好';
    }

    return {
      matchScore: Math.max(0, Math.min(100, matchScore)),
      rhythmIssues: issues,
      fatigueZones: fatigueZones,
      overSaturatedZones: overSaturatedZones,
      typeBalance: typeBalance,
      suggestion: suggestion
    };
  },

  // ========== 方法 4：滑动窗口密度分析 ==========
  analyzeChapterDensity: function (detailText, windowSize) {
    var actual = this.extractActualBeatsFromOutline(detailText);
    var winSize = windowSize || 10;
    if (actual.length < winSize) {
      return {
        windows: [],
        maxDensity: { from: 0, to: 0, avgIntensity: 0 },
        minDensity: { from: 0, to: 0, avgIntensity: 0 }
      };
    }
    var windows = [];
    for (var i = 0; i <= actual.length - winSize; i++) {
      var slice = actual.slice(i, i + winSize);
      var intensities = [];
      for (var s = 0; s < slice.length; s++) intensities.push(slice[s].intensity);
      var avg = this._avg(intensities);
      windows.push({
        from: slice[0].chapter,
        to: slice[slice.length - 1].chapter,
        avgIntensity: Math.round(avg * 10) / 10
      });
    }
    var maxWin = windows[0];
    var minWin = windows[0];
    for (var w = 0; w < windows.length; w++) {
      if (windows[w].avgIntensity > maxWin.avgIntensity) maxWin = windows[w];
      if (windows[w].avgIntensity < minWin.avgIntensity) minWin = windows[w];
    }
    return {
      windows: windows,
      maxDensity: maxWin,
      minDensity: minWin
    };
  },

  // ========== 方法 5：卷级别节奏报告 ==========
  generateVolumeRhythmReport: function (platform, genre, detailText) {
    var actual = this.extractActualBeatsFromOutline(detailText);
    var volSize = actual.length > 0 ? actual[actual.length - 1].chapter : 30;
    var expected = this.generateExpectedRhythm(platform, genre, volSize);
    var comparison = this.compareRhythm(actual, expected);
    var density = this.analyzeChapterDensity(detailText, 10);

    // 统计总章节数与总节拍数
    var totalChapters = actual.length;
    var totalBeats = 0;
    for (var ci = 0; ci < actual.length; ci++) {
      totalBeats += (actual[ci].beats ? actual[ci].beats.length : 0);
    }

    // 生成可视化文本图：每10章一段，用字符表示强度
    var visualLines = [];
    var segmentSize = 10;
    var totalSegments = Math.ceil(volSize / segmentSize);
    // 实际强度段
    var actualMap = {};
    for (var i = 0; i < actual.length; i++) actualMap[actual[i].chapter] = actual[i];
    var expectedMap = {};
    for (var j = 0; j < expected.length; j++) expectedMap[expected[j].chapter] = expected[j];

    for (var seg = 0; seg < totalSegments; seg++) {
      var startCh = seg * segmentSize + 1;
      var endCh = Math.min((seg + 1) * segmentSize, volSize);
      var actualIntensities = [];
      var expectedIntensities = [];
      for (var c = startCh; c <= endCh; c++) {
        if (actualMap[c]) actualIntensities.push(actualMap[c].intensity);
        if (expectedMap[c]) expectedIntensities.push(expectedMap[c].intensity);
      }
      var actualAvg = this._avg(actualIntensities);
      var expectedAvg = this._avg(expectedIntensities);
      var actualBar = '';
      var expectedBar = '';
      for (var b = 0; b < Math.round(actualAvg); b++) actualBar += this._intensityToChar(Math.round(actualAvg));
      for (var b2 = 0; b2 < Math.round(expectedAvg); b2++) expectedBar += this._intensityToChar(Math.round(expectedAvg));
      var rangeStr = '第' + startCh + '-' + endCh + '章';
      visualLines.push(rangeStr + '  实际: ' + (actualBar || '·') + ' (' + (Math.round(actualAvg * 10) / 10) + ')  期望: ' + (expectedBar || '·') + ' (' + (Math.round(expectedAvg * 10) / 10) + ')');
    }

    // 下一章建议
    var currentChapter = volSize;
    var recentBeats = [];
    for (var ri = Math.max(0, actual.length - 5); ri < actual.length; ri++) {
      recentBeats.push(actual[ri].mainBeat);
    }
    var nextBeat = this.suggestNextBeat(currentChapter, platform, recentBeats, detailText);

    // 类型分布均衡化建议
    var typeBalance = comparison.typeBalance;
    var tbKeys = Object.keys(typeBalance);
    var balanceSuggestion = '';
    if (tbKeys.length > 0) {
      var dominantType2 = null;
      var dominantCount2 = 0;
      for (var ti = 0; ti < tbKeys.length; ti++) {
        if (typeBalance[tbKeys[ti]] > dominantCount2) {
          dominantCount2 = typeBalance[tbKeys[ti]];
          dominantType2 = tbKeys[ti];
        }
      }
      if (dominantType2 && dominantCount2 > (actual.length * 0.5)) {
        balanceSuggestion = '建议增加' + ((this.BEAT_TYPES.character || {}).name) + '、' + ((this.BEAT_TYPES.foreshadow || {}).name) + '等多样化节拍，平衡当前节奏';
      } else {
        balanceSuggestion = '类型分布较为均衡';
      }
    }

    // 具体调整位置建议
    var adjustPositions = [];
    for (var fi = 0; fi < comparison.fatigueZones.length; fi++) {
      adjustPositions.push('第' + comparison.fatigueZones[fi].from + '-' + comparison.fatigueZones[fi].to + '章可加入小/中爆点以打破疲劳');
    }
    for (var oi = 0; oi < comparison.overSaturatedZones.length; oi++) {
      adjustPositions.push('第' + comparison.overSaturatedZones[oi].from + '-' + comparison.overSaturatedZones[oi].to + '章可加入过渡章节缓解读者疲劳');
    }

    return {
      matchScore: comparison.matchScore,
      totalChapters: totalChapters,
      totalBeats: totalBeats,
      rhythmIssues: comparison.rhythmIssues,
      fatigueZones: comparison.fatigueZones,
      overSaturatedZones: comparison.overSaturatedZones,
      typeBalance: comparison.typeBalance,
      typeBalanceSuggestion: balanceSuggestion,
      adjustPositions: adjustPositions,
      visualGraph: visualLines.join('\n'),
      densityReport: density,
      nextBeat: nextBeat,
      suggestion: comparison.suggestion
    };
  },

  // ========== 方法 6：下一章节拍建议 ==========
  suggestNextBeat: function (currentChapter, platform, recentBeats, outlineContext) {
    var recent = recentBeats || [];
    // 最近3章的类型 → 需要避免重复
    var recentSet = {};
    for (var ri = Math.max(0, recent.length - 3); ri < recent.length; ri++) {
      recentSet[recent[ri]] = true;
    }

    var template = this._getTemplate(platform, 'default');
    var nextCh = (currentChapter || 0) + 1;
    var expectedInfo = template(nextCh);
    var recommended = expectedInfo.expected[0] || 'minor_beat';

    // 如果推荐的是最近刚用过的强类型，跳过
    var highImpactSet = { major_beat: 1, revelation: 1 };
    if (recentSet[recommended] && highImpactSet[recommended]) {
      for (var ei = 1; ei < expectedInfo.expected.length; ei++) {
        if (!recentSet[expectedInfo.expected[ei]]) {
          recommended = expectedInfo.expected[ei];
          break;
        }
      }
    }

    // 生成理由
    var reason = '';
    var platformName = platform === 'fanqie' ? '番茄' : (platform === 'qidian' ? '起点' : platform);
    if (recommended === 'minor_beat') reason = '距上次小爆点已多章，符合' + platformName + '节奏规律';
    else if (recommended === 'medium_beat') reason = '按模板推演，第' + nextCh + '章应安排一个中爆点';
    else if (recommended === 'major_beat') reason = '按模板推演，第' + nextCh + '章是大爆点位置';
    else if (recommended === 'revelation') reason = '当前位置应揭开一个关键真相或伏笔';
    else if (recommended === 'character') reason = '建议在本章展示角色内心或补全人设';
    else if (recommended === 'worldbuild') reason = '当前位置适合展开世界观细节';
    else if (recommended === 'foreshadow') reason = '适合埋设新伏笔以驱动后续剧情';
    else if (recommended === 'emotion') reason = '适合安排情感爆发以打动读者';
    else if (recommended === 'battle') reason = '适合安排战斗场面提升节奏强度';
    else if (recommended === 'transition') reason = '适合安排过渡章节以消化前序爆点';
    else if (recommended === 'setup') reason = '适合为后续剧情做铺垫准备';
    else reason = '按模板推演的推荐节拍';

    // 备选：从期望列表的其他项 + 通用补充
    var alternatives = [];
    var candidatePool = expectedInfo.expected.concat(['foreshadow', 'character', 'dialogue', 'setup']);
    for (var ci = 0; ci < candidatePool.length; ci++) {
      if (candidatePool[ci] !== recommended && !recentSet[candidatePool[ci]] && alternatives.indexOf(candidatePool[ci]) === -1) {
        alternatives.push(candidatePool[ci]);
      }
      if (alternatives.length >= 3) break;
    }

    // 应当避免的类型：最近刚用的高强度类型
    var avoid = [];
    var avoidKeys = Object.keys(recentSet);
    for (var ai = 0; ai < avoidKeys.length; ai++) {
      if (highImpactSet[avoidKeys[ai]]) avoid.push(avoidKeys[ai]);
    }

    return {
      recommendedType: recommended,
      reason: reason,
      alternatives: alternatives,
      avoid: avoid
    };
  }
};

/* 手动测试示例：
 *
 * var sampleDetail = [
 *   '第1章：主角林羽穿越到修仙世界，了解到金手指"系统"存在',
 *   '【hook】谁也没想到，这个系统背后藏着惊天秘密',
 *   '第2章：林羽初次突破，在宗门测试中崭露头角，打脸看不起他的师兄',
 *   '【hook】师兄怀恨在心，准备报复',
 *   '第3章：林羽获得新技能，建立短期目标——三个月内进入内门',
 *   '【hook】一场针对他的阴谋正在酝酿',
 *   '第4章：林羽调查宗门内部，回忆起往事中母亲的身份',
 *   '第5章：林羽参加宗门小比，激战中击败对手，获得重要奖励',
 *   '【hook】长老似乎注意到了他的异常',
 *   '第6章：林羽在藏经阁了解更多世界规则，为后续布局做准备',
 *   '第7章：与神秘师姐的重要对话，双方达成默契',
 *   '【hook】师姐的身份原来是……',
 *   '第8章：宗门事件升级，势力交锋白热化，关键突破出现',
 *   '【hook】幕后黑手即将登场',
 *   '第9章：林羽在休息和返程途中，日常互动中展现性格',
 *   '第10章：大反转——系统的真正目的揭开，改变格局的大高潮',
 *   '【hook】更大的威胁正在逼近'
 * ].join('\n');
 *
 * var actual = RhythmReferenceEngine.extractActualBeatsFromOutline(sampleDetail);
 * var expected = RhythmReferenceEngine.generateExpectedRhythm('fanqie', 'shuang', 10);
 * var cmp = RhythmReferenceEngine.compareRhythm(actual, expected);
 * var report = RhythmReferenceEngine.generateVolumeRhythmReport('fanqie', 'shuang', sampleDetail);
 * var next = RhythmReferenceEngine.suggestNextBeat(10, 'fanqie', ['battle','medium_beat','major_beat'], sampleDetail);
 * console.log('匹配度:', cmp.matchScore);
 * console.log('下一章:', next.recommendedType, '-', next.reason);
 */
