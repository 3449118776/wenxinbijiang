/* 文心笔匠 v2 增强引擎 - 反套路检测 + 人设矛盾层 */
/* 引擎3: AntiClicheEngine（反套路检测引擎） */
/* 引擎4: CharacterConflictLayer（深层人设矛盾层生成） */

// ========== 引擎3: 反套路检测引擎 ==========
// 网文套路库 — 检测剧情是否落入常见模板
var AntiClicheEngine = {

  // 套路库（每类包含：名称/描述/匹配关键词/严重度）
  CLICHES: {
    'tuohun': {
      name: '退婚流',
      desc: '女方因主角"废柴"上门退婚，主角当场立誓三年后打脸',
      patterns: ['上门退婚', '一纸休书', '当场立誓', '三年之约', '莫欺少年穷', '退婚', '休书', '今日之辱'],
      score: -8,
      category: '剧情模板'
    },
    'dlian': {
      name: '打脸反转',
      desc: '配角嘲讽轻视 → 主角隐藏实力 → 实力展示 → 配角震惊',
      patterns: ['冷笑', '不屑', '轻蔑', '以为', '没想到', '惊呆了', '脸色一变', '怎么可能', '竟然是', '不敢置信'],
      score: -5,
      category: '剧情模板'
    },
    'xiatian': {
      name: '系统面板',
      desc: '机械降神式系统面板/任务奖励机制',
      patterns: ['叮！', '【系统】', '任务发布', '获得奖励', '经验+', '积分+', '等级提升', '新手礼包', '面板'],
      score: -10,
      category: '设定模板'
    },
    'feichai': {
      name: '废柴崛起',
      desc: '主角开局"废柴"被家族放弃，偶得奇遇一飞冲天',
      patterns: ['废柴', '废物', '天才变废', '家族放弃', '众人嘲笑', '经脉尽断', '灵根残缺'],
      score: -6,
      category: '角色模板'
    },
    'mijing': {
      name: '秘境副本',
      desc: '发现/进入秘境 → 打怪捡宝 → 与其他势力争抢 → 最大收益者',
      patterns: ['秘境', '遗迹', '古洞府', '宝藏', '传承', '机缘', '探险', '古墓'],
      score: -4,
      category: '地图模板'
    },
    'yingxiong': {
      name: '英雄救美',
      desc: '女性角色遇险 → 主角关键时刻出手 → 美女倾心',
      patterns: ['救下', '挡在身前', '英雄救美', '以身相许', '芳心暗许', '美目盼兮', '眼神复杂'],
      score: -7,
      category: '角色模板'
    },
    'banzhu': {
      name: '扮猪吃虎',
      desc: '主角隐藏实力扮弱者 → 敌人轻敌 → 实力反转',
      patterns: ['隐藏实力', '扮猪吃虎', '低调', '普通人', '深藏不露', '扮作', '伪装'],
      score: -5,
      category: '角色模板'
    },
    'yaomo': {
      name: '邪魔歪道',
      desc: '非黑即白的正邪对立，邪修=纯粹邪恶无合理动机',
      patterns: ['邪魔外道', '魔教', '邪修', '魔道', '正派', '正邪不两立', '替天行道'],
      score: -6,
      category: '世界观模板'
    },
    'guxun': {
      name: '谚语滥用',
      desc: '过度使用古语/谚语/江湖规矩增加伪深度',
      patterns: ['俗话说', '常言道', '古语有云', '江湖规矩', '老祖宗说的好', '师父曾经说过'],
      score: -4,
      category: '文风问题'
    },
    'wanneng': {
      name: '万能形容词',
      desc: '用"强大/神秘/古老/恐怖"等空洞词汇代替具体描写',
      patterns: ['强大的', '神秘的', '古老的', '恐怖的', '惊人的', '无比', '极其', '异常', '非凡'],
      score: -5,
      category: '文风问题'
    },
    'zhenhan': {
      name: '震惊流',
      desc: '过度使用"XX震惊/震撼/骇然/倒吸一口凉气"制造情绪',
      patterns: ['震惊', '骇然', '震撼', '倒吸一口凉气', '全场寂静', '鸦雀无声', '瞳孔骤缩', '头皮发麻'],
      score: -8,
      category: '文风问题'
    },
    'dengji': {
      name: '等级崩坏',
      desc: '前期设定的境界等级后期形同虚设，越级挑战无代价',
      patterns: ['越境杀敌', '跨级挑战', '以弱胜强', '越级', '打破常规', '战力爆表', '战力压制'],
      score: -6,
      category: '设定崩坏'
    },
    'ziyanziyu': {
      name: '旁白自解',
      desc: '角色内心独白解释设定/剧情，而非通过对话和行动展现',
      patterns: ['心中暗道', '心里想', '暗自思量', '心道', '(主角心想', '他心里明白'],
      score: -4,
      category: '文风问题'
    },
    'huazhuang': {
      name: '易容伪装流',
      desc: '简单面具/斗篷即能骗过所有人，身份伪装过于廉价',
      patterns: ['面具', '斗篷', '伪装', '易容', '蒙面', '黑衣', '无人认出'],
      score: -5,
      category: '剧情模板'
    },
    'yishiye': {
      name: '一夜成名',
      desc: '单章内主角从无名小卒变天下闻名，不合理跃迁',
      patterns: ['一夜成名', '名声大噪', '轰动全城', '名动天下', '震惊四座', '一夜之间'],
      score: -7,
      category: '节奏崩坏'
    },
    'caimiji': {
      name: '踩一捧一',
      desc: '通过贬低他人衬托主角，用对手的愚蠢而非主角实力制造爽感',
      patterns: ['跳梁小丑', '不自量力', '螳臂当车', '井底之蛙', '可笑', '愚蠢', '蠢货'],
      score: -6,
      category: '文风问题'
    },
    'heihua': {
      name: '黑化反转',
      desc: '角色突然黑化/洗白，缺乏合理铺垫',
      patterns: ['黑化', '黑化了', '眼神变冷', '性情大变', '判若两人', '前后判若两人'],
      score: -6,
      category: '角色崩坏'
    },
    'xianren': {
      name: '贵人送宝',
      desc: '神秘老者/前辈莫名器重主角，传授功法/赠送法宝',
      patterns: ['前辈', '老者', '高人', '前辈眼中精光一闪', '有缘人', '老夫观你', '骨骼清奇', '我看好你'],
      score: -7,
      category: '剧情模板'
    },
    'huangmu': {
      name: '皇室贵胄',
      desc: '神秘的皇室身份/隐藏的皇子公主',
      patterns: ['皇子', '公主', '王爷', '皇帝', '陛下', '皇室', '太子', '殿下'],
      score: -5,
      category: '角色模板'
    }
  },

  /**
   * 检测单段文本的套路浓度
   * @param {string} text 要检测的文本（细纲或正文）
   * @returns {{score:number, matched:Array, categoryBreakdown:Object, clicheIndex:number}}
   */
  detectCliches: function(text) {
    if (!text) return { score: 100, matched: [], categoryBreakdown: {}, totalHits: 0, clicheIndex: 0, severity: '原创度高' };
    var lower = text;
    var matched = [];
    var catBreakdown = {};
    var totalScore = 100;

    var clicheKeys = Object.keys(AntiClicheEngine.CLICHES);
    clicheKeys.forEach(function(key) {
      var c = AntiClicheEngine.CLICHES[key];
      var hitCount = c.patterns.reduce(function(n, pattern) {
        if (!pattern) return n;
        var idx = lower.indexOf(pattern);
        var count = 0;
        while (idx >= 0) {
          count++;
          idx = lower.indexOf(pattern, idx + pattern.length);
        }
        return n + count;
      }, 0);

      if (hitCount > 0) {
        matched.push({
          key: key,
          name: c.name,
          desc: c.desc,
          hits: hitCount,
          scoreImpact: c.score * hitCount,
          category: c.category
        });
        catBreakdown[c.category] = (catBreakdown[c.category] || 0) + hitCount;
        totalScore += c.score * hitCount;
      }
    });

    matched.sort(function(a, b) { return b.hits - a.hits; });

    var textLen = (text || '').length;
    var totalHits = matched.reduce(function(n, m) { return n + m.hits; }, 0);
    var clicheIndex = textLen > 0 ? Math.round(totalHits / textLen * 1000 * 10) / 10 : 0;

    totalScore = Math.max(0, Math.min(100, totalScore));

    var severity = '原创度高';
    if (clicheIndex >= 30) severity = '重度套路化';
    else if (clicheIndex >= 15) severity = '中度套路化';
    else if (clicheIndex >= 5) severity = '轻度套路化';

    return {
      score: totalScore,
      matched: matched.slice(0, 15),
      totalHits: totalHits,
      categoryBreakdown: catBreakdown,
      clicheIndex: clicheIndex,
      severity: severity
    };
  },

  /**
   * 生成去套路化建议（基于检测到的套路类型给出具体修改方向）
   * @param {{matched:Array}} detectionResult detectCliches 返回的结果
   * @returns {string[]}
   */
  generateDeforestationTips: function(detectionResult) {
    if (!detectionResult || !detectionResult.matched || detectionResult.matched.length === 0) {
      return ['未检测到明显套路，保持当前方向即可'];
    }
    var tips = [];
    detectionResult.matched.slice(0, 5).forEach(function(m) {
      switch (m.key) {
        case 'tuohun':
          tips.push('【退婚流】试试让退婚的"原因"和女主的"立场"更复杂——她不是简单势利，而是家族博弈的棋子；或者，退婚本身就是主角计划的一部分');
          break;
        case 'dlian':
          tips.push('【打脸流】让"打脸"有代价——每次打脸都会埋下新的更大麻烦；或让被打脸的角色有合理的智力和反击能力');
          break;
        case 'xiatian':
          tips.push('【系统面板】与其机械任务奖励，不如让系统本身有性格/目的/弱点——系统不是万能的，它有自己的需求和隐藏规则');
          break;
        case 'feichai':
          tips.push('【废柴崛起】"废"的原因要具体——不是笼统的"灵根差"，而是某种后天创伤/家族诅咒/主动封印，且与主线矛盾紧密挂钩');
          break;
        case 'yingxiong':
          tips.push('【英雄救美】让女性角色在被救前后有自己的独立目标和行动——她不是奖励品，而是合作关系甚至对主角有威胁');
          break;
        case 'zhenhan':
          tips.push('【震惊流】用具体动作替代"震惊"描写——捏碎茶杯、指节发白、沉默三秒、某个习惯性动作停在半空，而不是空洞的情绪词');
          break;
        case 'wanneng':
          tips.push('【万能形容词】给"强大/神秘"一个可感知的具体指标——如"他的灵压让三炷香同时弯折"而非"他气息非常强大"');
          break;
        case 'mijing':
          tips.push('【秘境副本】让秘境本身是活的、有目的的——它不是随机掉落宝箱的地方，而是某种古老意志/被封印势力的测试场');
          break;
        case 'xianren':
          tips.push('【贵人送宝】前辈的善意要有条件/代价——他传授的功法有暗门、他认定主角是因为主角的某特质恰好契合了他的阴谋');
          break;
        case 'ziyanziyu':
          tips.push('【旁白自解】让信息通过对话和行动泄漏——角色不说但做了什么，比他想什么更有力量');
          break;
        case 'heihua':
          tips.push('【黑化反转】角色转变必须有"伏笔—触发—崩解—新稳态"四步，不能在一章内完成；黑化后也不能放弃原有性格的全部');
          break;
        case 'dengji':
          tips.push('【等级崩坏】给"越级挑战"设定具体且不可再生的代价——生命力/寿元/理智/道心磨损，而不是主角光环');
          break;
        case 'huangmu':
          tips.push('【皇室贵胄】皇室不是万能的地位垫脚石——给皇权设置清晰边界：祖制、藩镇、宫廷斗争、财政限制，让皇室身份本身是枷锁也是资源');
          break;
        default:
          tips.push('【' + m.name + '】套路使用' + m.hits + '次 —— 建议给这类剧情增加独特条件：代价/限制/反套路的结果');
      }
    });

    if (tips.length === 0) tips.push('检测到套路命中，但暂无针对性建议。可考虑：1) 给套路事件增加代价，2) 通过反套路转折，3) 让套路本身成为角色成长的反讽');
    return tips;
  },

  /**
   * 分析细纲的整体套路分布（逐章扫描）
   * @param {string} detailText 细纲文本
   * @returns {{perChapter:Array, overall:Object, worstChapters:Array}}
   */
  analyzeDetailClicheDistribution: function(detailText) {
    if (!detailText) return { perChapter: [], overall: AntiClicheEngine.detectCliches(''), worstChapters: [] };
    var lines = detailText.split('\n').filter(function(l) {
      return /^\s*第[一二三四五六七八九十百千\d]+章/.test(l.trim());
    });
    var perChapter = [];
    lines.forEach(function(line, idx) {
      var r = AntiClicheEngine.detectCliches(line);
      perChapter.push({ chapter: idx + 1, score: r.score, hits: r.totalHits, topMatch: r.matched[0] ? r.matched[0].name : '-' });
    });
    var worst = perChapter.filter(function(c) { return c.score < 70; }).sort(function(a, b) { return a.score - b.score; }).slice(0, 10);
    var overall = AntiClicheEngine.detectCliches(detailText);
    return { perChapter: perChapter, overall: overall, worstChapters: worst };
  }
};

// ========== 引擎4: 角色深层矛盾层生成 ==========
// 角色深层矛盾自动生成 —— 为已有角色补充"矛盾层"/"崩溃点"/"成长弧光"
var CharacterConflictLayer = {

  // 常见矛盾维度（给每个角色自动生成多种矛盾）
  CONFLICT_DIMENSIONS: [
    { key: 'surface_vs_deep', label: '表层性格 ↔ 深层恐惧', prompt: '表面呈现的形象下，隐藏的深层恐惧/创伤是什么？这个恐惧如何在关键时刻扭曲他的决策？' },
    { key: 'public_vs_secret', label: '公开目标 ↔ 秘密动机', prompt: '角色对外宣称的目标/理想，与他私下真正想要的东西是否矛盾？这种分裂如何制造内在冲突？' },
    { key: 'value_vs_reality', label: '核心价值观 ↔ 现实妥协', prompt: '角色最珍视的价值观（如"绝不杀人"/"言出必行"），在什么情况下会被迫妥协？第一次妥协时他如何自圆其说？' },
    { key: 'ability_vs_cost', label: '能力 ↔ 代价', prompt: '角色的核心能力/功法/身份的获得，付出了什么不可逆转的代价？这个代价如何在后期反噬他？' },
    { key: 'identity_vs_role', label: '真实自我 ↔ 社会角色', prompt: '他被迫扮演的社会角色（弟子/兄长/皇子/杀手）与他真实的自我之间有多大张力？' },
    { key: 'trust_vs_betrayal', label: '信任 ↔ 背叛', prompt: '他最信任的人/组织在什么情况下会背叛他？或他自己在什么情况下会背叛他人？' },
    { key: 'rational_vs_emotional', label: '理性 ↔ 情感', prompt: '他的冷静理性与被压抑的情感之间的矛盾。什么事件会打破理性的外壳？' },
    { key: 'past_vs_future', label: '过去 ↔ 未来', prompt: '他试图摆脱的过去（创伤/身份/债务）与他想要走向的未来之间的拉扯' },
    { key: 'self_vs_group', label: '自我 ↔ 集体', prompt: '个人目标与群体利益（师门/家族/国家/团队）之间的冲突。他何时选择自己，何时选择他人？' }
  ],

  // 崩溃点生成规则
  BREAKPOINT_TRIGGERS: [
    { key: 'mortality', label: '致命威胁', desc: '当他的核心能力/生命被真正威胁时，他会放弃什么原则来求生？' },
    { key: 'betrayal', label: '关键背叛', desc: '当他最信任的人背叛他时，他如何崩解——彻底黑化、自我封闭、还是重新审视自我？' },
    { key: 'failure', label: '终极失败', desc: '什么是他最怕的失败？一旦发生，他会如何反应？是沉沦、复仇、还是彻底改变路线？' },
    { key: 'truth', label: '真相揭露', desc: '他长期坚信的"真相"被彻底推翻后，他如何重新构建自我认知？' },
    { key: 'choice', label: '无解选择', desc: '在两个他同样珍视的人/目标之间必须二选一时，他的选择标准和事后创伤是什么？' }
  ],

  // 从人设文本中提取基本信息（简单启发式）
  extractCharacterBasics: function(charText) {
    if (!charText) return { name: '未命名', role: '未知', basics: [], personality: [], abilities: [], raw: '' };
    var basics = [];

    // 提取角色名
    var nameMatch = charText.match(/[【\[]\s*([^\]】\s]{2,6})\s*[】\]]|[《「]([^》」]{2,6})[》」]/);
    var name = nameMatch ? (nameMatch[1] || nameMatch[2] || '未命名') : '未命名';

    // 提取角色身份关键词
    var roleHints = charText.match(/(?:主角|反派|配角|导师|挚友|对手|盟友|隐藏反派|恋人|父亲|母亲|兄长|师弟|师妹|师父|门主|掌门|陛下|皇子|公主)[^，。,\n]{0,20}/g);

    // 提取性格关键词
    var personalityHints = charText.match(/(?:性格|外表|表面|内心|实则|外冷|内热|外柔|内刚|看似|实则|精明|单纯|隐忍|果断|犹豫|冷酷|温柔|热血|理性|感性)[^，。,\n]{0,30}/g);

    // 提取能力/功法
    var abilityHints = charText.match(/(?:功法|能力|秘术|修为|境界|法宝|武器|灵根|血脉)[^，。,\n]{0,30}/g);

    return {
      name: name,
      role: roleHints ? roleHints[0] : '未知',
      basics: basics,
      personality: personalityHints || [],
      abilities: abilityHints || [],
      raw: charText
    };
  },

  /**
   * 为单个角色生成矛盾层（纯逻辑推理，无需AI）
   * @param {{name:string, role:string, personality:string[]}} basics extractCharacterBasics 返回的结果
   * @param {number} dimensionCount 生成几条矛盾（默认4条）
   * @returns {{name:string, conflicts:Array<{type:string, label:string, description:string}>, breakpoints:Array, arc:string[]}}
   */
  generateConflictLayer: function(basics, dimensionCount) {
    dimensionCount = dimensionCount || 4;
    var name = basics.name || '此角色';
    var personality = (basics.personality || []).join('，');
    var abilities = (basics.abilities || []).join('，');

    // 随机选择不重复的维度
    var dims = CharacterConflictLayer.CONFLICT_DIMENSIONS.slice().sort(function() { return 0.5 - Math.random(); }).slice(0, dimensionCount);

    var conflicts = dims.map(function(d) {
      var description = '';
      switch (d.key) {
        case 'surface_vs_deep':
          description = name + '对外呈现的' + (personality ? personality.slice(0, 20) : '形象') + '，与内心深处对某件事的恐惧形成张力——在高压情境下，恐惧会突破表层控制，做出与平时截然不同的决定';
          break;
        case 'public_vs_secret':
          description = name + '公开目标与秘密动机的分裂——他嘴上说是为了A，但实际在追逐B。随着剧情推进，B的重量逐渐压过A，导致盟友困惑、敌人疑惑、最终自我暴露';
          break;
        case 'value_vs_reality':
          description = name + '最珍视的原则（如不伤害无辜），在关键时刻被迫打破。第一次妥协后，他如何自圆其说？这种自洽的裂痕，是后续多次滑落的起点';
          break;
        case 'ability_vs_cost':
          description = name + '的核心能力' + (abilities ? '（' + abilities.slice(0, 15) + '）' : '') + '不是无代价的——每次使用都消耗某种不可再生资源（寿元/情感/理智/记忆），这是他能力的天花板，也是他的死穴';
          break;
        case 'identity_vs_role':
          description = name + '被社会规训扮演的角色，与他真实渴望的自我身份之间的张力。某个关键事件迫使他二选一——选择自我则失去一切社会关系，选择角色则失去自我';
          break;
        case 'trust_vs_betrayal':
          description = name + '最信任的人/组织的背叛是他最恐惧的事。但剧本要设计的是——他自己也会在某种极端条件下背叛他人，而他的道德挣扎是最有张力的部分';
          break;
        case 'rational_vs_emotional':
          description = name + '的理性外壳下压抑的情感——他的冷静不是天生的，而是创伤后自我保护的结果。某件事足以击穿这层保护，让读者看到理性碎片下的真实之人';
          break;
        case 'past_vs_future':
          description = name + '的过去与未来的拉扯——他想告别某段历史，但那段历史通过人/信物/承诺反复回来，最终他必须正面解决而非逃避';
          break;
        case 'self_vs_group':
          description = name + '个人目标与集体利益之间的反复摇摆——他不是恒定的"利己"或"利他"，而是根据具体情境在两者间波动，这制造了角色的不可预测性';
          break;
        default:
          description = name + '存在内在矛盾——表层形象与深层驱动的撕裂';
      }
      return { type: d.key, label: d.label, description: description };
    });

    // 崩溃点
    var breakpoints = CharacterConflictLayer.BREAKPOINT_TRIGGERS.map(function(b) {
      return { label: b.label, desc: b.desc };
    }).slice(0, 3);

    // 成长弧光
    var arc = [
      '起点：' + name + '处于某种稳态——拥有某种信念/习惯/关系网络',
      '扰动：外部事件打破稳态，暴露角色的表层缺陷或深层矛盾',
      '挣扎：角色试图用旧方法解决新问题，失败并付出代价',
      '谷底：角色崩溃或面临崩溃点——价值观/能力/关系同时受冲击',
      '重构：角色在新的认知下重新定义自己——接受、整合、或彻底转变',
      '新稳态：角色以新的自我版本重新进入剧情，但已不可逆地改变了'
    ];

    return {
      name: name,
      conflicts: conflicts,
      breakpoints: breakpoints,
      arc: arc
    };
  },

  /**
   * 批量从整个人设文本中生成矛盾层（从人设文本中按分段解析多个角色）
   * @param {string} charsText 完整人设文本（可能包含多个角色）
   * @returns {Array}
   */
  generateForAll: function(charsText) {
    if (!charsText) return [];
    var segments = charsText.split(/\n\s*\n/).filter(function(s) { return s.trim().length > 10; });
    return segments.map(function(seg) {
      var basics = CharacterConflictLayer.extractCharacterBasics(seg);
      return CharacterConflictLayer.generateConflictLayer(basics, 4);
    });
  }
};

/* ========== 测试用例（手动在控制台执行） ==========
 *
 * // === 引擎3 测试 ===
 * var sampleText = '上门退婚的女子冷笑一声，不屑地看着眼前的废柴。主角当场立誓，莫欺少年穷！全场震惊，所有人都不敢置信地看着他。他的神秘力量令人骇然。';
 * var result = AntiClicheEngine.detectCliches(sampleText);
 * console.log('套路检测结果:', result);
 * console.log('去套路化建议:', AntiClicheEngine.generateDeforestationTips(result));
 *
 * // === 引擎4 测试 ===
 * var charText = '【林青寒】主角，性格外冷内热，实则内心柔软。修炼九天玄冰诀，灵根残缺但得奇遇。表面冷漠，内心深处对家族抛弃有创伤。';
 * var basics = CharacterConflictLayer.extractCharacterBasics(charText);
 * var layer = CharacterConflictLayer.generateConflictLayer(basics, 4);
 * console.log('角色矛盾层:', layer);
 *
 * // === 批量角色测试 ===
 * var charsDoc = '【林青寒】主角，外冷内热，修炼九天玄冰诀。\n\n【苏沐月】女主，理性冷静，实则情感压抑。\n\n【玄夜】反派，看似正义，实则心有执念。';
 * var all = CharacterConflictLayer.generateForAll(charsDoc);
 * console.log('批量生成:', all);
 */
