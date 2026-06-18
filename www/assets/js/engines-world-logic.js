/* 文心笔匠 v2 增强引擎 - 世界观逻辑一致性 */
/* 引擎5: WorldLogicEngine（世界观逻辑一致性引擎） */
/* 功能：从世界观自由文本中提取结构（势力/力量/地理/资源/历史），并检测逻辑自洽性 */

// ========== 引擎5: 世界观逻辑一致性引擎 ==========
// 自动从世界观文本中提取结构并检测逻辑问题
var WorldLogicEngine = {

  // 势力关键词（用于自动提取势力）
  FACTION_KEYWORDS: ['家族', '宗门', '教派', '王朝', '帝国', '势力', '组织', '商会', '盟', '联盟', '部族', '部落', '院', '阁', '宫', '殿', '府', '山庄', '门派', '帮', '会'],

  // 境界/等级关键词
  REALM_KEYWORDS: ['境界', '等级', '修为', '层次', '阶位', '品级', '阶段', '层', '级', '品'],

  // 地理关键词
  GEOGRAPHY_KEYWORDS: ['大陆', '域', '州', '州府', '疆域', '地区', '山脉', '河流', '森林', '沙漠', '沼泽', '海域', '岛屿', '城', '镇', '村', '秘境', '遗迹', '深渊', '禁地'],

  // 资源关键词
  RESOURCE_KEYWORDS: ['灵石', '丹药', '法宝', '功法', '材料', '矿石', '灵脉', '灵田', '资源', '货币', '黄金', '白银', '粮食', '粮草', '税收', '财富'],

  // 矛盾/问题检测规则
  LOGIC_CHECKS: {
    // 检测1：设定自相矛盾
    selfContradiction: {
      label: '设定自相矛盾',
      patterns: [
        { find: /(?:是|为)[^，。,\n]{0,10}(?:唯一|仅有|只有)[^，。,\n]{0,30}/g, warnIfAfter: /(?:另有|还有|其他|第二个|第三个|不止)[^，。,\n]{0,30}/g }
      ]
    },
    // 检测2："最强大的X"过度使用
    strongestOveruse: {
      label: '"最强"滥用',
      patterns: []
    },
    // 检测3：资源无限假设
    infiniteResource: {
      label: '资源无限假设',
      patterns: []
    },
    // 检测4：战力等级压制无效
    powerLevelBreakdown: {
      label: '战力等级压制无效',
      patterns: []
    },
    // 检测5：时间线混乱（如果有时间相关标记）
    timelineIssue: {
      label: '时间线可能冲突',
      patterns: []
    }
  },

  /**
   * 从世界观文本中提取结构化信息（势力/力量体系/地理/资源/历史）
   * @param {string} worldText 世界观自由文本
   * @returns {{factions:Array, powerSystem:Array, geography:Array, resources:Array, histories:Array, stats:Object}}
   */
  extractWorldStructure: function (worldText) {
    if (!worldText) return { factions: [], powerSystem: [], geography: [], resources: [], histories: [], stats: {} };
    var lines = worldText.split('\n').filter(function (l) { return l.trim().length > 3; });

    var factions = [];
    var powerSystem = [];
    var geography = [];
    var resources = [];
    var histories = [];

    // 启发式：逐行扫描关键词
    lines.forEach(function (line) {
      WorldLogicEngine.FACTION_KEYWORDS.forEach(function (kw) {
        var m = line.match(new RegExp('([^\\s，。,【《「(（]{2,12}' + kw + ')', 'g'));
        if (m) m.forEach(function (f) {
          if (factions.indexOf(f) < 0 && f.length <= 15) factions.push(f);
        });
      });

      WorldLogicEngine.REALM_KEYWORDS.forEach(function (kw) {
        var m = line.match(new RegExp('([一二三四五六七八九十0-9]{1,3}[级阶品层境界位][^，。,\\s]{0,8}|练气|筑基|金丹|元婴|化神|渡劫|大乘|天仙|金仙|大罗|混沌|神|圣|帝|皇|尊|王|侯)', 'g'));
        if (m) m.forEach(function (p) {
          if (powerSystem.indexOf(p) < 0 && p.length <= 10) powerSystem.push(p);
        });
      });

      WorldLogicEngine.GEOGRAPHY_KEYWORDS.forEach(function (kw) {
        var m = line.match(new RegExp('([^\\s，。,【《「(（]{2,12}' + kw + ')', 'g'));
        if (m) m.forEach(function (g) {
          if (geography.indexOf(g) < 0 && g.length <= 15) geography.push(g);
        });
      });

      WorldLogicEngine.RESOURCE_KEYWORDS.forEach(function (kw) {
        if (line.indexOf(kw) >= 0 && resources.indexOf(kw) < 0) resources.push(kw);
      });

      // 历史事件检测（含年份/年代/时间标记）
      if (/(?:千年前|百年前|十年前|年前|上古|远古|古代|近代|现代|公元|\d+年)/.test(line)) {
        var snippet = line.trim().slice(0, 60);
        if (histories.indexOf(snippet) < 0) histories.push(snippet);
      }
    });

    return {
      factions: factions.slice(0, 20),
      powerSystem: powerSystem.slice(0, 20),
      geography: geography.slice(0, 20),
      resources: resources.slice(0, 20),
      histories: histories.slice(0, 20),
      stats: {
        totalLines: lines.length,
        factionCount: factions.length,
        realmCount: powerSystem.length,
        geographyCount: geography.length,
        resourceCount: resources.length
      }
    };
  },

  /**
   * 检测势力博弈矩阵 —— 推断势力之间的关系模式
   * @param {{factions:Array}} structure extractWorldStructure 返回的结果
   * @param {string} worldText 原始文本
   * @returns {{matrix:Object, isolated:Array, conflicts:Array, description:string}}
   */
  generateFactionMatrix: function (structure, worldText) {
    var factions = structure.factions || [];
    if (factions.length < 2) {
      return { matrix: {}, isolated: factions, conflicts: [], description: '势力数量不足，无法形成博弈矩阵。建议至少设计3个势力形成三角牵制' };
    }

    var matrix = {};
    var isolated = [];
    var conflicts = [];

    factions.forEach(function (f1) {
      matrix[f1] = {};
      var anyRelation = false;
      factions.forEach(function (f2) {
        if (f1 === f2) return;
        var relKey = f1 + '··' + f2;
        var reverseKey = f2 + '··' + f1;
        var cooccur = worldText.indexOf(f1) >= 0 && worldText.indexOf(f2) >= 0;
        var rel = '未定义';
        if (cooccur) {
          var section = worldText.slice(Math.max(0, worldText.indexOf(f1) - 100), worldText.indexOf(f1) + 200);
          if (/敌对|对抗|攻打|战争|侵略|仇恨|仇|敌|对峙/.test(section)) rel = '敌对';
          else if (/同盟|合作|联手|结盟|建交|朋友|盟友|支援|帮助/.test(section)) rel = '同盟';
          else if (/中立|观望|旁观|不参与|保持距离/.test(section)) rel = '中立';
          else rel = '有互动';
          anyRelation = true;
        }
        if (!matrix[reverseKey]) matrix[f1][f2] = rel;
      });
      if (!anyRelation) isolated.push(f1);
    });

    if (isolated.length > Math.floor(factions.length / 2)) {
      conflicts.push('超过半数势力与其他势力无明确关系，势力博弈感弱');
    }
    if (factions.length < 3) conflicts.push('势力数量不足3个，难以形成多角博弈');

    var description = '共识别' + factions.length + '个势力，其中' + isolated.length + '个孤立势力，' + conflicts.length + '项建议改进';

    return { matrix: matrix, isolated: isolated, conflicts: conflicts, description: description };
  },

  /**
   * 检测力量体系的设定一致性
   * @param {{powerSystem:Array}} structure
   * @param {string} worldText
   * @returns {{score:number, issues:string[]}}
   */
  checkPowerConsistency: function (structure, worldText) {
    var realms = structure.powerSystem || [];
    var issues = [];
    var score = 70;

    if (realms.length === 0) {
      issues.push('未检测到清晰的境界/等级体系描述');
      score = 20;
    } else if (realms.length < 3) {
      issues.push('等级层次偏少，建议至少5-8个大境界形成进阶梯度');
      score -= 15;
    } else if (realms.length > 15) {
      issues.push('等级层次过多，可能造成记忆负担和战力崩坏风险');
      score -= 10;
    }

    var strongestCount = (worldText.match(/(?:最强|第一|绝顶|巅峰|至高|无上|无敌)[^，。,\n]{0,15}/g) || []).length;
    if (strongestCount > 3) {
      issues.push('"最强/第一/巅峰"等绝对称号出现' + strongestCount + '次——多人自称"最强"会导致战力体系失去锚点');
      score -= strongestCount * 2;
    }

    if (/(?:越境|越阶|越级|越等级|打破境界|打破等级|战力不匹配|战力不符)/.test(worldText)) {
      score -= 10;
      issues.push('文本暗示"越级挑战"为常态——如果高境界对低境界没有有效压制手段，等级体系终将虚设');
    }

    if (/(?:无数|海量|无穷|无限|取之不尽|用之不竭)/.test(worldText)) {
      score -= 10;
      issues.push('出现"无数/海量/无限"等表述——资源若无限则失去价值，经济体系将崩溃');
    }

    score = Math.max(0, Math.min(100, score));
    return { score: score, issues: issues, realmCount: realms.length, strongestCount: strongestCount };
  },

  /**
   * 综合分析 —— 对整份世界观给出逻辑健康度报告
   * @param {string} worldText
   * @returns {{overall:number, structure:Object, factionMatrix:Object, powerCheck:Object, suggestions:string[]}}
   */
  analyzeWorldHealth: function (worldText) {
    var structure = WorldLogicEngine.extractWorldStructure(worldText);
    var factionMatrix = WorldLogicEngine.generateFactionMatrix(structure, worldText);
    var powerCheck = WorldLogicEngine.checkPowerConsistency(structure, worldText);

    var suggestions = [];
    var overall = Math.round((powerCheck.score + (factionMatrix.conflicts.length > 0 ? 60 : 90) + (structure.stats.totalLines > 20 ? 80 : 60)) / 3);

    if (structure.factions.length < 3) suggestions.push('【势力数量】建议至少设计3个及以上势力，形成牵制博弈格局——当前仅' + structure.factions.length + '个');
    if (factionMatrix.isolated.length > 0) suggestions.push('【孤立势力】以下势力与其他势力关系不明：' + factionMatrix.isolated.slice(0, 5).join('、') + '——建议为每个势力设计至少1个盟友和1个对手');
    if (powerCheck.issues.length > 0) powerCheck.issues.forEach(function (i) { suggestions.push('【力量体系】' + i); });
    if (factionMatrix.conflicts.length > 0) factionMatrix.conflicts.forEach(function (c) { suggestions.push('【势力博弈】' + c); });
    if (structure.resources.length < 3) suggestions.push('【资源体系】建议明确1-2种核心稀缺资源及其获得/消耗/流通方式——这是驱动势力博弈的根本');
    if (structure.geography.length < 3) suggestions.push('【地理设定】建议设计至少3个有差异化特征的地理区域，并定义区域之间的交通/通信难度');
    if (structure.histories.length < 2) suggestions.push('【历史背景】建议设计1-2段对当前局势有深远影响的历史事件——它们是人物动机和世界观张力的源头');
    if (suggestions.length === 0) suggestions.push('当前世界观逻辑较为完整，可继续深化细节');

    return {
      overall: overall,
      structure: structure,
      factionMatrix: factionMatrix,
      powerCheck: powerCheck,
      suggestions: suggestions
    };
  }
};

/* ===== 测试用例（可在浏览器控制台手动执行） =====
 *
 * var sample = '轩辕大陆由三大家族主宰：东方家、南宫家、西门家。\n' +
 *   '东方家是大陆最强的家族，擅长炼丹。南宫家是最强的剑修世家。\n' +
 *   '修炼体系为：练气、筑基、金丹、元婴、化神。\n' +
 *   '三大灵石矿脉分布在北境沙漠、东海岛屿、南山山脉。\n' +
 *   '千年前轩辕大帝一统大陆，留下无数宝藏。\n' +
 *   '东方家与南宫家敌对多年，西门家保持中立。';
 *
 * var report = WorldLogicEngine.analyzeWorldHealth(sample);
 * console.log('健康度:', report.overall);
 * console.log('建议:', report.suggestions);
 *
 */
