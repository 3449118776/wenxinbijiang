"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/* 文心笔匠 - 递进构建模块 */

// ========== 平台策略配置 ==========
var PLATFORM_CONFIG = {
  qidian: {
    label: '起点',
    desc: '订阅制·慢热铺垫·世界深厚',
    defaultVolumes: 6,
    chaptersPerVol: 250,
    wordsPerChapter: '2000-4000字',
    pacing: '慢热铺垫，第一卷80%世界观展开+人物关系建立，爽点密度1个/2章，侧重逻辑自洽和伏笔铺设',
    worldStrategy: '起点风格：世界观必须厚重有深度，至少设计3个以上势力形成复杂博弈格局。力量体系要有清晰的等级划分（至少5个大境界），每个境界有独特规则和突破条件。地理设定要有区域性差异。经济/货币/资源体系要自洽。开篇世界观展开要循序渐进，第一卷结束前把核心规则交代清楚。',
    charsStrategy: '起点风格：主角必须有深度性格和多层动机（表层目标+深层欲望+核心价值观）。配角不少于5个有独立故事线的角色（导师、挚友、对手、盟友、恋人候选），配角要有自己的成长弧线和独立于主角的目标。要有反派阵营，反派必须有合理动机而非纯恶。人物关系要设计多角互动和隐秘联结（血缘/师承/前世/宿敌）。',
    outlineStrategy: '起点风格：卷数5-8卷，每卷200-300章。每卷需有明确的阶段主题（如：初入江湖→崭露头角→名动天下→登顶封神→超脱飞升）。注重世界观深度展开、角色成长弧线、多线叙事。每卷末留足够强的悬念钩子驱动下一卷。',
    detailStrategy: '每章独立标题+核心冲突+感情线节点+伏笔标记。章尾必有悬念钩子。节奏：铺垫→小高潮→回落→大高潮。',
    // 细纲节奏锁死
    pacingRules: [{
      type: '黄金开局',
      range: '第1-5章',
      rule: '前5章必须完成：世界观初展+主角困境+第一个小冲突+金手指/能力觉醒。每章结尾留钩子，不要一口气抛出全部设定。'
    }, {
      type: '日常铺垫',
      range: '每6-8章',
      rule: '两章小高潮后的过渡章节，侧重人物关系、世界观细节、伏笔埋设。可有小冲突但不能是主线爆点。'
    }, {
      type: '小高潮',
      range: '每8-10章',
      rule: '一个小型冲突解决或阶段性升级（如获得新能力/击败小boss/发现关键线索），3000字以上的打斗或情感爆发场景。'
    }, {
      type: '中高潮',
      range: '每20-25章',
      rule: '中等规模的剧情转折（如势力对抗/重要角色退场/世界观重大揭示），牵动2条以上支线。'
    }, {
      type: '大高潮',
      range: '每卷末',
      rule: '卷终大高潮：主线重大进展+反派退场or升级+主角实力跃升+世界观重大变化。为下一卷留足悬念。'
    }]
  },
  fanqie: {
    label: '番茄',
    desc: '免费制·快节奏·爽点密集',
    defaultVolumes: 6,
    chaptersPerVol: 300,
    wordsPerChapter: '1500-3000字',
    pacing: '快节奏开局，前3章必须出金手指+第一个爽点，爽点密度1个/章，侧重情绪爆发和追读率',
    worldStrategy: '番茄风格：世界观无需一次性铺开，采用"冰山法则"——前10章只展示当前场景所需的最少规则，随着剧情推进逐步揭示更深层的世界设定。力量体系简洁明了（3-4个大等级即可），晋升要干脆利落（每升一级有视觉化的爽感）。势力设定要黑白分明，正反阵营清晰，便于读者快速代入。',
    charsStrategy: '番茄风格：人设要"标签化+反差萌"——主角用最简洁的标签概括（如"废柴退婚流""兵王回归""神医下山"），但有1-2个反差萌点增加记忆度。配角控制在3-5个核心角色，每人有鲜明标签和1个独特性格设定。反派要"坏人够坏"让读者爽感最大化，不用太复杂的灰色人物。角色关系简洁明了，减少烧脑的多角关系网。',
    outlineStrategy: '番茄风格：卷数3-4卷，每卷300-500章。开篇第一卷必须炸裂——前10章密集铺爆发点。节奏：每一卷的上半段密集输出爽点，中段出大爆点，末段收束并埋钩子。情节线以主角成长为唯一主线，支线不超过2条且必须服务主线。',
    detailStrategy: '每章标注爽点类型（打脸/突破/收获/震惊），确保每章至少1个情绪爆发点。节奏：爽→爽→爆爽→过渡→爽。',
    // 细纲节奏锁死：黄金三章 + 三小五中十大
    pacingRules: [{
      type: '🔥黄金三章',
      range: '第1-3章',
      rule: '【强制】第1章：主角困境+世界观钩子（500字内出冲突）；第2章：金手指/能力觉醒+第一个小爽点（打脸或逆袭）；第3章：能力初试+建立短期目标+留追读钩子。三章内必须让读者知道"这是啥故事"+"主角要干啥"+"为啥要看下去"。'
    }, {
      type: '⚡小爆点',
      range: '每3章',
      rule: '【3章一小爆】每3章必须有一个小爆点：小打脸/小突破/小收获/小震惊。读者情绪小高潮，看完想"爽！"。标注【小爆】。'
    }, {
      type: '💥中爆点',
      range: '每5章',
      rule: '【5章一中爆】每5章一个中爆点：重要打脸/实力突破/关键收获/反转震惊。推动主线进展，读者情绪中高潮，看完想"太爽了！追！"。标注【中爆】。'
    }, {
      type: '🚀大爆点',
      range: '每10章',
      rule: '【10章一大爆】每10章一个大爆点：重大剧情转折/大反派登场或受挫/主角实力飞跃/世界观震撼揭示。多线收束，读者情绪炸裂，看完必须"卧槽！等更新！"。标注【大爆】。'
    }, {
      type: '🌿过渡章',
      range: '大爆后1-2章',
      rule: '每次大爆之后安排1-2章过渡：消化战果/日常互动/新伏笔埋设/支线铺垫。过渡章也要有微爽点（幽默/温情/小收获），不能平淡如水。标注【过渡】。'
    }]
  }
};
var currentPlatform = 'qidian';
function getSelectedPlatform() {
  var work = getWork();
  if (work && work._platform) return work._platform;
  return currentPlatform;
}
function setPlatform(val) {
  var work = getWork();
  currentPlatform = val;
  if (work) {
    work._platform = val;
    saveWork(work);
  }
  // 刷新选择器（平台锁定后由updateCountSelector统一处理）
  updateCountSelector();
}

// ========== 毒点清单 ==========
// 通用毒点（所有小说类型都应避免的写作陷阱）
var COMMON_POISON_POINTS = [
// === 情节与结构 ===
{
  id: 'logic_flaw',
  name: '逻辑漏洞',
  desc: '情节缺乏因果必然性，人物行为前后矛盾，事件推进靠巧合而非合理因果',
  severity: 'high',
  cat: '情节'
}, {
  id: 'retcon',
  name: '设定吃书',
  desc: '后期设定与前期矛盾，推翻已有世界观规则和人物能力',
  severity: 'high',
  cat: '设定'
}, {
  id: 'plot_disconnect',
  name: '剧情断层',
  desc: '各卷/各段之间缺乏因果链和递进关系，像独立的中篇拼凑',
  severity: 'high',
  cat: '情节'
}, {
  id: 'suspense_broken',
  name: '悬念断裂',
  desc: '埋下的伏笔和悬念长期不收，或收束时与铺垫严重不符',
  severity: 'high',
  cat: '情节'
}, {
  id: 'cliche_plot',
  name: '剧情套路化',
  desc: '退婚/废柴逆袭/穿越附身/系统绑定等桥段未经改造直接套用，读者一眼看穿',
  severity: 'medium',
  cat: '情节'
}, {
  id: 'conflict_flat',
  name: '冲突单调',
  desc: '每章冲突模式雷同（打脸→震惊→更强敌人→再打脸），缺乏类型变化',
  severity: 'medium',
  cat: '情节'
},
// === 节奏 ===
{
  id: 'opening_fail',
  name: '开篇劝退',
  desc: '前5章大量信息倾倒或平淡日常，读者看不到核心冲突和金手指',
  severity: 'high',
  cat: '节奏'
}, {
  id: 'info_dump',
  name: '信息倾倒',
  desc: '用大段说明文或回忆杀一次性砸出世界设定和人物背景，打断叙事节奏',
  severity: 'medium',
  cat: '节奏'
}, {
  id: 'water_content',
  name: '过度水字数',
  desc: '大量无意义描写、重复对话、内心独白循环填充字数，核心情节进展极慢',
  severity: 'medium',
  cat: '节奏'
}, {
  id: 'pacing_drag',
  name: '节奏拖沓',
  desc: '连续多章缺乏核心冲突推进，日常/对话占据过多篇幅',
  severity: 'medium',
  cat: '节奏'
}, {
  id: 'coolpoint_weak',
  name: '爽点乏力',
  desc: '高潮桥段描写不到位，打脸不够狠、突破不够燃、反转不够震撼',
  severity: 'medium',
  cat: '节奏'
},
// === 战力与升级 ===
{
  id: 'power_creep',
  name: '战力崩坏',
  desc: '力量体系失衡——主角跳过太多等级越级杀敌，或境界战力前后不一致',
  severity: 'high',
  cat: '战力'
}, {
  id: 'level_formula',
  name: '升级公式化',
  desc: '每次突破都是"遇到瓶颈→奇遇→突破→震惊众人"同一模板，缺乏新意',
  severity: 'medium',
  cat: '战力'
}, {
  id: 'level_suppress_fail',
  name: '等级压制无效',
  desc: '高阶角色被低阶主角轻易击败，等级差距失去说服力',
  severity: 'high',
  cat: '战力'
},
// === 人物与关系 ===
{
  id: 'char_dumb',
  name: '主角降智',
  desc: '主角为推进剧情而做出不符合设定智商/性格的愚蠢行为',
  severity: 'high',
  cat: '人物'
}, {
  id: 'mary_sue',
  name: '龙傲天/玛丽苏',
  desc: '主角集所有优点于一身：天赋第一、颜值第一、人脉第一、资源第一，无缺点无成长空间',
  severity: 'medium',
  cat: '人物'
}, {
  id: 'tool_char',
  name: '配角工具人',
  desc: '配角缺乏独立动机和人格弧线，出现只为被主角打脸/送机缘/送女主',
  severity: 'medium',
  cat: '人物'
}, {
  id: 'antagonist_stupid',
  name: '反派弱智化',
  desc: '反派明知主角在成长却不扼杀，或每次只派比主角强一点的手下去送',
  severity: 'medium',
  cat: '人物'
}, {
  id: 'villain_whitewash',
  name: '反派洗白生硬',
  desc: '前期恶贯满盈的角色因一个理由突然洗白，缺乏转变过程和代价',
  severity: 'medium',
  cat: '人物'
}, {
  id: 'female_vase',
  name: '女主花瓶化',
  desc: '女性角色沦为男主附属品或奖励品，缺乏独立人格、目标和能力',
  severity: 'medium',
  cat: '人物'
}, {
  id: 'char_voice_same',
  name: '角色同声化',
  desc: '不同角色说话风格和用词完全相同，读者仅靠名字区分谁在说话',
  severity: 'low',
  cat: '人物'
},
// === 感情线 ===
{
  id: 'force_romance',
  name: '感情线僵硬',
  desc: '感情发展缺乏铺垫和化学反应，男主对女主一见钟情后无合理互动',
  severity: 'medium',
  cat: '感情'
}, {
  id: 'harem_flavorless',
  name: '后宫审美疲劳',
  desc: '多位女性角色对男主好感理由雷同（被救→动心→倒贴），缺乏差异化',
  severity: 'medium',
  cat: '感情'
}, {
  id: 'misunderstanding_abuse',
  name: '误会强行驱动',
  desc: '用"我不听解释""看到的不是真相"等低级误会制造感情冲突',
  severity: 'medium',
  cat: '感情'
},
// === 描写与表达 ===
{
  id: 'dialog_hollow',
  name: '对白空洞',
  desc: '对话缺乏信息量和性格展示，沦为"嗯""哦""好"或纯功能性的信息交换',
  severity: 'low',
  cat: '描写'
}, {
  id: 'talking_heads',
  name: '对话场景缺失',
  desc: '大段对话无场景描写、无动作、无表情变化，读者像在听广播剧',
  severity: 'low',
  cat: '描写'
}, {
  id: 'fight_boring',
  name: '战斗描写脸谱化',
  desc: '每场战斗都是"招式名→对手惊讶→更强的招式名→主角险胜"，缺乏战术和场面变化',
  severity: 'medium',
  cat: '描写'
}, {
  id: 'world_break',
  name: '世界观崩坏',
  desc: '世界观设定在后期被无视或破坏——前期说不能飞行后期满地飞天',
  severity: 'high',
  cat: '设定'
},
// === 结局与收束 ===
{
  id: 'bad_ending',
  name: '烂尾/太监趋势',
  desc: '中后期质量断崖下降、关键伏笔不收、剧情加速草草收场',
  severity: 'high',
  cat: '结局'
}, {
  id: 'subplot_lost',
  name: '支线失踪',
  desc: '前期铺设的支线和角色在中后期消失，没有交代收束',
  severity: 'medium',
  cat: '结局'
}];

// 小说类型专属毒点（按题材分类的额外注意事项）
var GENRE_POISON_POINTS = {
  xuanhuan: {
    label: '玄幻',
    points: [{
      id: 'realm_chaos',
      name: '境界混乱',
      desc: '修炼境界划分不清晰，突破条件随意变更，境界名称和等级对应关系前后矛盾'
    }, {
      id: 'treasure_flood',
      name: '法宝/机缘泛滥',
      desc: '主角获得法宝/机缘过于频繁且轻易，失去稀缺感和惊喜感'
    }, {
      id: 'resource_inflation',
      name: '修炼资源通货膨胀',
      desc: '前期珍贵的丹药/灵石后期随地可见，经济体系崩溃'
    }, {
      id: 'bloodline_retcon',
      name: '血脉设定矛盾',
      desc: '主角血脉能力忽强忽弱，或血脉来源在后期被随意改写'
    }, {
      id: 'secret_realm_abuse',
      name: '秘境副本滥用',
      desc: '用秘境/副本作为万能剧情推进器，每卷都靠"发现秘境→闯关→升级"循环'
    }, {
      id: 'world_too_big',
      name: '地图无限扩张',
      desc: '每次主角变强就换一个更大的地图，前期区域和角色被抛弃'
    }]
  },
  xianxia: {
    label: '仙侠',
    points: [{
      id: 'dao_shallow',
      name: '道心空洞',
      desc: '修仙理念流于表面，升级仅靠资源堆砌而非心境突破，缺乏"悟道"过程'
    }, {
      id: 'tribulation_abuse',
      name: '天劫滥用',
      desc: '天劫沦为升级道具——主角轻松渡过、反派被劈死，失去天道威严'
    }, {
      id: 'karma_broken',
      name: '因果逻辑断裂',
      desc: '因果报应、天道循环的说辞在需要时提及不需要时无视'
    }, {
      id: 'artifact_chaos',
      name: '法宝等级混乱',
      desc: '仙器/神器/先天灵宝等级体系混乱，同等级法宝威力天差地别'
    }, {
      id: 'mortal_ratio',
      name: '仙凡比例失调',
      desc: '满世界都是修仙者，凡人社会的存在感和作用完全消失'
    }, {
      id: 'sect_politics_shallow',
      name: '宗门政治幼稚',
      desc: '宗门内斗和权力博弈描写过于简单，类似小学生吵架'
    }]
  },
  dushi: {
    label: '都市',
    points: [{
      id: 'law_ignore',
      name: '法律常识错误',
      desc: '情节设定（杀人/商业欺诈/黑道横行）无视基本法律和社会秩序'
    }, {
      id: 'face_slap_abuse',
      name: '装逼打脸过度',
      desc: '反复使用"配角看不起主角→主角亮身份/实力→配角跪舔"同一桥段，严重审美疲劳'
    }, {
      id: 'business_naive',
      name: '商业逻辑幼稚',
      desc: '商业运作描写缺乏基本常识——收购/上市/投资流程与真实世界严重脱节'
    }, {
      id: 'power_confusion',
      name: '都市战力混乱',
      desc: '都市背景下加入修仙/异能元素后，普通社会的武力机构（警察/军队）完全隐身'
    }, {
      id: 'class_distortion',
      name: '阶层描写失真',
      desc: '上流社会/底层社会的描写充满刻板印象和常识错误'
    }, {
      id: 'tech_abuse',
      name: '科技滥用',
      desc: '主角用高中编程水平写出颠覆行业的AI系统，或医学突破毫无科学依据'
    }]
  },
  lishi: {
    label: '历史',
    points: [{
      id: 'history_error',
      name: '历史事实错误',
      desc: '关键历史事件、人物关系、时间线出现严重错误'
    }, {
      id: 'system_anachronism',
      name: '制度穿越',
      desc: '出现该时期未出现的制度（如东汉出现科举制、宋朝出现内阁制）'
    }, {
      id: 'tech_anachronism',
      name: '技术穿越',
      desc: '出现该时期不存在的技术和物品（如火药提前几百年出现且威力巨大）'
    }, {
      id: 'language_anachronism',
      name: '语言穿越',
      desc: '角色大量使用现代词汇、网络用语或后世典故'
    }, {
      id: 'butterfly_ignore',
      name: '蝴蝶效应无视',
      desc: '穿越者大幅改变历史后，后续历史事件仍原样发生'
    }, {
      id: 'ancient_mind_modern',
      name: '古人思维现代化',
      desc: '古代角色拥有现代人的价值观、平等意识和思维方式'
    }, {
      id: 'food_anachronism',
      name: '饮食穿越',
      desc: '出现该时期未传入中国的食材（如明朝吃辣椒、唐朝吃土豆）'
    }]
  },
  kehuan: {
    label: '科幻',
    points: [{
      id: 'science_error',
      name: '科学常识错误',
      desc: '基础物理/生物/天文原理被严重违背，且无合理解释'
    }, {
      id: 'tech_inconsistent',
      name: '科技水平不一致',
      desc: '同一文明能星际航行却治不好感冒，能造AI却没有像样的通讯手段'
    }, {
      id: 'future_flat',
      name: '未来社会扁平化',
      desc: '未来社会描写缺乏深度——政治/经济/文化/宗教的演变完全缺失'
    }, {
      id: 'alien_humanized',
      name: '外星文明拟人化',
      desc: '外星文明在生理/思维/社会结构上与人类几乎无异，只剩外表不同'
    }, {
      id: 'ftl_casual',
      name: '超光速随意化',
      desc: '超光速/虫洞/空间跳跃等技术写成"按个按钮就到了"，无代价无限制'
    }]
  },
  yanqing: {
    label: '言情',
    points: [{
      id: 'love_jump',
      name: '感情发展跳跃',
      desc: '男女主见面三章就深爱，缺乏感情升温的合理过程和关键事件'
    }, {
      id: 'misunderstanding_driver',
      name: '误会驱动冲突',
      desc: '全文靠"我不听解释""我不是故意不告诉你"等低级误会推动剧情'
    }, {
      id: 'second_lead_tool',
      name: '备胎工具人',
      desc: '男二/女二的唯一作用是爱而不得，无条件付出，缺乏独立人格'
    }, {
      id: 'dogblood_abuse',
      name: '狗血桥段滥用',
      desc: '失忆/车祸/绝症/替身/契约婚姻等桥段不经改造直接套用'
    }, {
      id: 'power_imbalance',
      name: '关系不对等',
      desc: '一方过于强势（霸总/帝王），另一方完全被动，缺乏双向奔赴的平等感'
    }]
  },
  xuanyi: {
    label: '悬疑',
    points: [{
      id: 'clue_obvious',
      name: '线索过于明显',
      desc: '关键线索和真凶暗示过于直白，读者在前期就能猜到结局'
    }, {
      id: 'twist_forced',
      name: '反转生硬',
      desc: '为反转而反转——真凶是前面从未出现的路人甲，缺乏伏笔支撑'
    }, {
      id: 'reasoning_broken',
      name: '推理逻辑断裂',
      desc: '主角的推理跳跃不存在因果链，类似"我懂了！一定是他！"然后就开始指认'
    }, {
      id: 'motive_weak',
      name: '凶手动机牵强',
      desc: '凶手的作案动机过于薄弱（为了100万杀光全家），与罪行的严重程度不匹配'
    }]
  },
  youxi: {
    label: '游戏/系统',
    points: [{
      id: 'system_god',
      name: '系统万能化',
      desc: '系统成为万能外挂——需要啥功能就解锁啥功能，没有限制和代价'
    }, {
      id: 'number_inflation',
      name: '数值膨胀失控',
      desc: '前期的顶级装备/技能后期沦为垃圾，数值百倍千倍增长失去意义'
    }, {
      id: 'npc_over_smart',
      name: 'NPC智能化过度',
      desc: '游戏NPC过于像真人但玩家对此完全不好奇，也无剧情交代'
    }, {
      id: 'player_reaction_fake',
      name: '玩家反应失真',
      desc: '游戏世界发生惊天事件但其他玩家的反应像AI脚本，缺乏真实社区生态'
    }]
  }
};

// 根据作品题材获取适用的毒点清单
function getPoisonChecklist(genre) {
  var checklist = COMMON_POISON_POINTS.map(function (p) {
    return Object.assign({}, p, {
      source: 'common'
    });
  });
  if (genre && GENRE_POISON_POINTS[genre]) {
    var genrePoints = GENRE_POISON_POINTS[genre].points;
    for (var i = 0; i < genrePoints.length; i++) {
      checklist.push(Object.assign({}, genrePoints[i], {
        source: 'genre'
      }));
    }
  }
  return checklist;
}

// 题材约束块：锁定题材，防止AI跑题到其他类型
var GENRE_CONSTRAINT_MAP = {
  lishi: {
    label: '历史小说',
    coreRule: '这是历史小说。所有人物的身份、官职、军队编制、文化习俗、经济贸易、技术器物、语言表达必须严格符合该历史时期的真实背景。',
    forbidden: '严禁出现：修仙、炼丹、法宝、空间戒指、储物袋、系统面板、穿越者现代知识大肆改造古代社会、飞机大炮火枪、电力电器、现代网络用语（如"打工人""PUA""内卷""yyds"）、该历史时期尚未传入中国的食物和作物（如明朝之前不得出现辣椒/土豆/玉米/红薯）。',
    mustHave: '必须包含符合时代特征的：政治制度（如门阀/察举/征辟/世族）、军事编制、经济体系（如实物税/徭役/均田）、社会阶层（士农工商/良贱/部曲）、文化信仰（如儒学谶纬/黄老/早期道教）',
    innovationHints: '推荐尝试：以冷门历史时期为舞台（如魏晋南北朝/五代十国/元明之交）；主角身份跳出皇帝/将军/书生窠臼（如商人/医者/匠人/翻译官）；用微观人物命运折射大历史变迁而非帝王将相编排历史；允许主角的历史改变产生蝴蝶效应且不可逆'
  },
  xuanhuan: {
    label: '玄幻小说',
    coreRule: '这是玄幻小说。必须遵循本作已设定的世界观规则和力量体系，不得引入与本作设定矛盾的其他世界观元素。',
    forbidden: '严禁出现：现代科技（手机/汽车/飞机）、现代政治制度（民主/选举/议会）、网络用语、真实历史人物和事件、与本作境界体系冲突的其他修炼体系。',
    mustHave: '必须包含：清晰的修炼境界体系、势力格局博弈、法宝/丹药/灵石的合理价格体系、世界地理与秘境分布',
    innovationHints: '推荐尝试：力量体系不要只有"灵气修炼"一种路径（如血肉献祭/器物共鸣/概念具现/集体意志）；势力斗争升级为经济学博弈而非纯武力对决（灵石通胀/秘境垄断/散修工会）；"天劫""秘境""丹药"等核心设定给出原创性重定义而非标准修仙模板'
  },
  xianxia: {
    label: '仙侠小说',
    coreRule: '这是仙侠小说。内容应融合中国传统道家文化、修仙哲学，追求"道"的境界。',
    forbidden: '严禁出现：与道家/佛家修行体系完全无关的西方魔法体系、异世界转生设定、机甲/高达、现代科学术语解释修仙原理',
    mustHave: '必须包含：悟道过程（非纯资源堆砌）、因果报应/天道循环、法宝有灵性有来历、仙凡有别',
    innovationHints: '推荐尝试：修仙者面对的不是"更强的敌人"而是"道的本质"——哲学困境比武力悬疑更高级；凡人视角看仙人的世界（如凡人官员管理修仙资源分配/凡人工匠为仙人铸造法宝）；"因果"不仅是道德约束更是物理法则（每次干预因果都留下可追溯的痕迹）；飞升/长生可以是诅咒而非终极目标'
  },
  dushi: {
    label: '都市小说',
    coreRule: '这是都市小说。故事背景为现代（或近未来）城市社会，须遵守现实世界的基本法律和社会运行逻辑。',
    forbidden: '严禁出现：公然无视法律的行为无后果处理、未成年/校园恋爱擦边球、真实存在的知名企业/名人被写死、敏感政治话题',
    mustHave: '必须包含：符合现实的社会阶层描写、真实可信的商业/职场逻辑、现代人际关系复杂性',
    innovationHints: '推荐尝试：异能/系统的设定与具体职业相结合（程序员/外卖员/教师/护士/殡葬师等非典型职业）；冲突不是"打脸"而是系统性困境（算法困住外卖员/学区房压垮中产/35岁失业）；"成功"的定义不止于"有钱有权"，探索多元价值标准'
  },
  kehuan: {
    label: '科幻小说',
    coreRule: '这是科幻小说。科技设定必须有内部一致性，基础科学原理不可被随意违背（除非有设定内合理解释）。',
    forbidden: '严禁出现：修仙/魔法体系混入科幻、同一文明科技水平严重不一致（能曲速航行却不会治感冒）、违背能量守恒和质量守恒的无代价超能力',
    mustHave: '必须包含：科技与社会的关系（科技如何影响政治/经济/文化）、科技发展的代价与伦理、未来世界的社会结构演变',
    innovationHints: '推荐尝试：不是"更高级的兵器"而是"科技改变了什么是人"（意识上传后的身份认同/基因编辑撕裂社会/AI统治下的人类定义）；硬科幻可以很"小"——一个纳米机器人失控的故事比星际战争更真实；探讨具体的、可感知的未来（50年而非5000年之后）'
  },
  yanqing: {
    label: '言情小说',
    coreRule: '这是言情小说。核心是男女主角的感情发展，必须有真实的化学反应和感情升温过程。',
    forbidden: '严禁出现：见面三章就深爱、全文靠"我不听解释"驱动冲突、"失忆/车祸/绝症/替身/契约婚姻"等狗血桥段未经改造套用、备胎无条件付出无怨无悔、霸总/帝王一方完全强势毫无平等',
    mustHave: '必须包含：感情发展的具体事件铺垫、男女主各自的独立人格和目标、双向奔赴的平等感、配角也有自己的感情线和结局',
    innovationHints: '推荐尝试：跳出"霸总+小白花"和"甜宠+虐恋"两种套路；感情线嵌入更硬核的主线（悬疑推理/商战/职场升级/探险）；配角感情线不是"全员配对"而是各有归宿（有人单身、有人分开、有人选择独处）；探讨现代人的真实感情困境（异地/家庭阻力/职业与爱情冲突/价值不合的磨合）'
  },
  xuanyi: {
    label: '悬疑小说',
    coreRule: '这是悬疑小说。核心是谜题设计和推理过程，所有线索必须公平地呈现给读者。',
    forbidden: '严禁出现：真凶是前面从未出现的路人甲、主角靠直觉/"灵机一动"破案而无推理过程、前面所有线索在结局被新信息推翻、凶手动机与罪行严重程度不匹配',
    mustHave: '必须包含：所有关键线索在结局前至少暗示过一次、推理有完整的因果链、人物关系网可作为推理基础',
    innovationHints: '推荐尝试：不是"谁是凶手"而是"为什么/如何/能不能阻止"（动机的深度比凶手身份更重要）；让读者在某个时刻意识到真相可能比主角自己发现的更早——但仍有悬念；案中案/时间线交错/多重叙述等结构实验；融入具体行业背景增加真实感（法医/税务/网络取证/文物鉴定）'
  },
  youxi: {
    label: '游戏/系统小说',
    coreRule: '这是游戏/系统文。必须有明确的游戏规则和系统限制，系统不是万能外挂。',
    forbidden: '严禁出现：系统什么功能都有无任何代价、数值百倍千倍无限制膨胀、NPC完全像真人但玩家从不觉得奇怪、游戏世界发生大事但其他玩家反应像AI',
    mustHave: '必须包含：系统有明确的使用代价和限制、装备/技能数值有合理供需关系、玩家的社区生态真实可信',
    innovationHints: '推荐尝试：系统不是外挂而是诅咒/债务/实验——主角获得系统可能不是幸运而是陷阱；游戏世界不是"另一个现实"而是与现实有复杂交互的半透明层；玩家社区不是背景板而是有政治、经济和社交生态的"第二社会"；探索"系统"本身的来历和目的作为核心悬念'
  },
  // === 2026新生题材 ===
  guize: {
    label: '规则怪谈',
    coreRule: '这是规则怪谈文。必须建立清晰的规则系统，通过规则推导和试错推进剧情，恐怖来源于"规则本身就是陷阱"，而非鬼怪直接出现。',
    forbidden: '严禁出现：规则漏洞过多导致逻辑崩塌、随意修改已公布规则、靠纯武力解决规则问题、怪物频繁直接出现削弱神秘感、规则抄袭现有作品（如动物园规则）。',
    mustHave: '必须包含：至少3条以上相互关联的规则构成逻辑链条、规则之间的隐藏矛盾或悖论、角色通过推理试错来破解规则、认知污染或san值机制的逐步体现、副本/场景的独特氛围与规则体系的呼应',
    innovationHints: '推荐尝试：规则不限于"禁止X"的格式，可以是"必须做X""在Y时自动触发Z""A与B不能同时存在"等交互形式；规则背后的来源给出哲学或寓言层面的解释而非简单"诅咒"；中式场景（宿舍楼/自习室/快递站）比西式古堡更有恐怖感；规则不仅是一个副本的机械设定，它可以呼应角色的心理创伤或社会隐喻'
  },
  lingyi: {
    label: '悬疑民俗灵异',
    coreRule: '这是悬疑民俗灵异文。根植于中国民间信仰与地方民俗，以调查解谜为主线，灵异现象具有民俗文化根基和内在逻辑。',
    forbidden: '严禁出现：西式克苏鲁体系生硬套用中式场景、纯惊吓无逻辑的跳脸恐怖、对真实民间宗教和习俗的轻率亵渎、临时编造毫无民间传承依据的规则。',
    mustHave: '必须包含：具体的地方民俗仪式描写（如祭祀/驱邪/安宅/超度等）、至少一种民间信仰体系作为世界观根基（道教科仪/民间巫术/萨满/祖先崇拜等）、探秘过程的逻辑推理和实地走访、灵异现象与地方历史和人际关系的映射',
    innovationHints: '推荐尝试：以民俗学者的视角开展田野调查式叙事（而非驱魔大战）；将现代社会变迁（城镇化/老龄化/人口流出）与民俗消逝纠缠，赋予恐怖以社会维度；民俗规则不是绝对的——同一个禁忌在不同村庄有不同版本，这种"版本差异"本身就是线索；守村人/阴阳先生/捞尸人等边缘职业的日常比鬼怪更有吸引力'
  },
  dianwen: {
    label: '发疯文学/癫文',
    coreRule: '这是发疯文学/癫文。核心卖点是主角的"不正常"——通过反套路、黑色幽默和角色觉醒来制造戏剧张力和喜剧效果。',
    forbidden: '严禁出现：发疯无逻辑（纯胡闹没有内在自洽的疯）、主角只是口头吐槽但行动上完全服从系统/剧情、黑色幽默沦为低俗或冒犯、以发疯为借口的水字数日常。',
    mustHave: '必须包含：主角的"发疯"行为有其内在逻辑和自洽性（疯得有道理）、系统或剧情强制力与角色觉醒之间的博弈与拉扯、至少三次"剧本完全崩了"的戏剧性转折、弹幕/评论/吐槽等新媒体叙事元素的融入',
    innovationHints: '推荐尝试：癫不是目的而是手段——主角的"发疯"其实是某种更高级的生存策略；将发疯与更深层的社会批判或人性洞察结合（"这世界比主角更疯"）；直播弹幕体作为"第四面墙破裂器"让叙事层次更丰富；发疯的代价不是被系统惩罚，而是被"同化"——最可怕的是慢慢变得正常'
  },
  jingying: {
    label: '经营建设/种田',
    coreRule: '这是经营建设/种田文。核心是"从零到一"的建设过程和策略博弈，爽点来源于资源积累、技术突破和产业升级，而非个体武力的提升。',
    forbidden: '严禁出现：靠主角光环直接跨越科技树（中世纪背景发明蒸汽机需要全产业链铺垫）、资源无限供应无视瓶颈、武力碾压掩盖经营策略、人口和市场无限大忽略现实约束。',
    mustHave: '必须包含：清晰的建设目标和阶段性里程碑、资源管理的具体数据和瓶颈、贸易/分工/技术的详细过程描写、团队建设和人才选拔的篇幅、外部威胁以策略而非武力方式应对',
    innovationHints: '推荐尝试：种田不限于"种地"——可种文化/种规则/种社会制度；引入真实的经济学/管理学概念增加深度（沉没成本/边际效应/博弈论）；失败也可以是一种爽（"我们花了三年修建的水坝在洪水中崩塌了，但重建的规模前所未有"）；"坏人"不是武力敌人，而是现实中常见的阻力——官僚主义/信息不对称/既得利益集团'
  },
  duanju: {
    label: '短剧导向/快节奏文',
    coreRule: '这是短剧导向的高节奏网文。采用强冲突驱动+高频反转+身份反转的叙事模式，每章具备独立爆点和钩子，前3章必须有密集冲突。',
    forbidden: '严禁出现：开篇三章还在铺垫没进主线、超过5章无新反转/新冲突、重要信息迟迟不给读者、大段环境描写和内心独白拖节奏、冲突解决靠巧合而非角色主动行为。',
    mustHave: '必须包含：第1章500字内出现核心冲突、每1-3章至少一个小反转或爆点、每章末尾有钩子（信息差/悬念/冲突预告）、角色身份的多层伪装与揭露、至少一个核心的"身份反转"设置（反派的身份/盟友的身份/主角的身份）',
    innovationHints: '推荐尝试：钩子不只是"预知后事如何"——现代钩子是"你以为A但其实B"的信息差钩子、是"原来他/她早就知道"的回溯式钩子；反转不在多而在"意料之外情理之中"——让读者翻回去重看才发现早就埋了线索；身份反转可以嵌套（主角以为自己才是最终BOSS结果发现还有第三层身份）'
  }
};
function getGenreConstraint(genre) {
  var cfg = GENRE_CONSTRAINT_MAP[genre];
  if (!cfg) {
    return '【⚠️ 题材硬约束】\n请基于' + (genre || '玄幻') + '题材进行创作。确保所有元素（人物能力、世界观规则、情节推进方式）完全符合该题材的应有特征。严禁出现与该题材不相关的元素（如历史题材出现修仙、都市题材出现古代官职等）。\n';
  }
  var text = '';
  text += '【⚠️ 题材硬约束 — 这是' + cfg.label + '，严禁跑题到其他类型！】\n';
  text += cfg.coreRule + '\n\n';
  text += '【🚫 严禁出现以下跑题元素】\n' + cfg.forbidden + '\n\n';
  text += '【✅ 必须包含以下题材要素】\n' + cfg.mustHave + '\n';
  if (cfg.innovationHints) {
    text += '\n【💡 题材创新方向 — 在遵守以上约束的前提下追求独特性】\n' + cfg.innovationHints + '\n';
  }
  return text;
}

// ========== 前置设定一致性 ==========
// 从已有设定中提取关键元素清单，发给后续模块强制引用，防止AI编造替代名称
function buildConsistencyBlock(work, currentModule) {
  var modIdx = ARCH_MODULES.indexOf(currentModule);
  if (modIdx <= 0) return ''; // 世界观是第一块，没有前置

  var block = '';
  block += '【📋 前置设定一致性要求 — 以下元素来自已定稿的前置设定，你必须使用这些确切名称！】\n\n';

  // 提取前置模块的关键元素
  for (var mi = 0; mi < modIdx; mi++) {
    var prevMod = ARCH_MODULES[mi];
    var prevText = prevMod === 'world' ? work.world || '' : prevMod === 'chars' ? work.chars || '' : prevMod === 'outline' ? work.outline || '' : '';
    if (!prevText || !prevText.trim()) {
      block += ARCH_MODULE_NAMES[prevMod] + '：暂未设定\n\n';
      continue;
    }
    var elements = extractKeyElements(prevText, prevMod);
    if (!elements || elements.length === 0) {
      block += ARCH_MODULE_NAMES[prevMod] + '：无关键元素\n\n';
      continue;
    }
    block += '【已有' + ARCH_MODULE_NAMES[prevMod] + '关键元素 — 你必须使用这些名称！】\n';
    for (var ei = 0; ei < elements.length; ei++) {
      block += elements[ei] + '\n';
    }
    block += '\n';
  }
  block += '【关键约束】请使用上述已有设定中的确切名称和规则，不要替换或编造新名称。如果有遗漏，会导致前后矛盾。\n\n';
  return block;
}

// 从给定文本中提取关键元素列表
function extractKeyElements(text, module) {
  if (!text) return [];
  var result = [];
  if (module === 'world') {
    // 提取：势力名称、地区名称、境界/等级名称、世界名称
    var factionRe = /(?:势力|阵营|组织|宗门)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/;
    var regionRe = /(?:地理|地区|地域|场景|区域|地点)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/;
    var levelRe = /(?:境界|等级|力量体系|修炼体系|战力|能力体系|晋升|品阶)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/;
    var nameRe = /(?:世界|大陆|星球|时空|宇宙)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/;
    var names = [];
    var extractedAny = false;
    var addExtract = function addExtract(prefix, re, maxLen) {
      var m = text.match(re);
      if (m) {
        names.push(prefix + m[1].trim().substring(0, maxLen || 120));
        extractedAny = true;
      }
    };
    addExtract('世界/大陆：', nameRe, 80);
    addExtract('势力：', factionRe, 120);
    addExtract('地区：', regionRe, 120);
    addExtract('等级体系：', levelRe, 120);
    if (!extractedAny) {
      // 增强降级模式：不是只靠后缀匹配，而是多维度提取
      var properNames = extractProperNames(text);
      if (properNames.length === 0) {
        // 最后兜底：提取前300字作为参考
        properNames.push('（AI输出未使用标准标签格式，请基于以下世界观概要提炼关键名称：）');
        properNames.push(text.substring(0, 300));
      }
      names.push('关键名称：' + properNames.join('、'));
    }
    result = names;
  } else if (module === 'chars') {
    // 提取角色名和身份 — 支持更多格式
    var charLines = text.split('\n');
    for (var i = 0; i < charLines.length; i++) {
      var line = charLines[i].trim();
      if (!line || line.length < 3) continue;
      // 匹配：角色名（身份）/ 角色名：身份 / 【角色名】身份 / - 角色名：身份 / **角色名**：身份
      var m1 = line.match(/^[>\-\s]*[【\[<]?(.+?)[】\]>]?\s*[：(（]\s*(.+?)\s*[)）]/);
      var m2 = line.match(/^(?:角色|人物|[>]+|\*\*)?[：:\s]*([^\s：(（]{2,8})\s*[：(（]\s*(.+?)\s*[)）]/);
      var m3 = line.match(/^[>\-\s]*\*\*([^*]+?)\*\*\s*[：:]\s*(.+)/);
      var m4 = line.match(/^[>\-\s]*###?\s+(.+)/);
      if (m1) {
        result.push('  · ' + m1[1].trim() + (m1[2] ? '（' + m1[2].trim().substring(0, 40) + '）' : ''));
      } else if (m2) {
        result.push('  · ' + m2[1].trim() + (m2[2] ? '（' + m2[2].trim().substring(0, 40) + '）' : ''));
      } else if (m3) {
        result.push('  · ' + m3[1].trim() + (m3[2] ? '（' + m3[2].trim().substring(0, 40) + '）' : ''));
      } else if (m4) {
        var title = m4[1].trim();
        if (title.length <= 20) result.push('  · ' + title);
      }
    }
    if (result.length === 0) {
      // 最后兜底：对整个文本做专名提取
      var charNames = extractProperNames(text);
      if (charNames.length > 0) {
        result.push('  · ' + charNames.slice(0, 20).join('、'));
      } else {
        result.push('  （未能自动提取角色列表，请参考上文完整人物设定）');
      }
    }
    if (result.length > 20) result = result.slice(0, 20);
  } else if (module === 'outline') {
    var volLines = text.split('\n');
    for (var j = 0; j < volLines.length; j++) {
      var vl = volLines[j].trim();
      var vm = vl.match(/^第[一二三四五六七八九十\d]+卷[:：]?[《「](.+?)[》」]/);
      if (vm) result.push('  · ' + vl.substring(0, 60));
    }
    if (result.length === 0) result.push('  （大纲未包含卷结构，请参考上文完整大纲）');
    if (result.length > 10) result = result.slice(0, 10);
  }
  return result;
}

// 从文本中提取2-4字的疑似专有名词
function extractProperNames(text) {
  var seen = {};
  var names = [];
  // 模式1: 中文专有名词模式：XX宗/XX门/XX派/XX山/XX谷/XX城/XX境/XX界等
  var re = /[\u4e00-\u9fff]{2,5}(?:宗|门|派|谷|山|城|境|界|府|阁|堂|殿|楼|峰|林|原|海|岛|湖|河|泽|洞|塔|寺|观|院|庄|堡|寨|营|关|岭|崖|渊|墟|墓|遗迹|圣地|禁地|平原|森林|沙漠|雪原|沼泽|废土|都市|要塞|哨站|码头|集市|炼狱|神域|深渊|国度|王朝|联邦|帝国|联盟|公会|行会|商会|组织|战团|骑士团|猎团|调查局|收容所|避难所)/g;
  var match;
  while ((match = re.exec(text)) !== null) {
    if (!seen[match[0]]) {
      seen[match[0]] = true;
      names.push(match[0]);
    }
  }
  // 模式2: 中文名+称号/身份（如"玄清真人""炎魔老祖""兽皇独孤野"等）
  var nameRe2 = /[\u4e00-\u9fff]{2,4}(?:真人|老祖|道人|仙尊|仙帝|魔尊|魔帝|剑仙|剑圣|武神|武圣|药王|毒王|兽皇|龙王|剑神|天尊|神王|魔皇|妖皇|圣主|教主|宗主|掌门|会长|局长|队长|组长|官|侯|帝|王|皇|君|圣|尊|主|领|使)/g;
  while ((match = nameRe2.exec(text)) !== null) {
    if (!seen[match[0]]) {
      seen[match[0]] = true;
      names.push(match[0]);
    }
  }
  // 模式3: 引用号中的关键名称（《XX》《XX》或"XX"）
  var nameRe3 = /[《「]([\u4e00-\u9fff\w]{2,20})[》」]/g;
  while ((match = nameRe3.exec(text)) !== null) {
    if (!seen[match[1]]) {
      seen[match[1]] = true;
    }
  }
  return names;
}

// 架构模块定义
var ARCH_MODULES = ['world', 'chars', 'outline', 'detail'];
var ARCH_MODULE_NAMES = {
  world: '🌍 世界观',
  chars: '👤 人物人设',
  outline: '📋 全书大纲',
  detail: '📝 章节细纲'
};
var ARCH_MODULE_DESC = {
  world: '世界规则、力量体系、地域、势力等核心设定',
  chars: '基于世界观，构建贴合世界规则的角色设定',
  outline: '基于世界观+人设，撰写主线剧情大纲',
  detail: '基于世界观+人设+大纲，拆分章节细纲'
};

// 当前模块状态
var currentArchModule = 'world';

// ===== 新布局：DOM元素获取辅助 =====
function rawAreaEl() {
  return document.getElementById('raw-' + currentArchModule);
}
function ideaEl() {
  return document.getElementById('idea-' + currentArchModule);
}
function pageEl() {
  return document.getElementById('page-' + currentArchModule);
}
function pfSelEl() {
  return document.getElementById('pf-select-outline');
}
function cntSelEl() {
  return document.getElementById('count-select-' + (currentArchModule === 'outline' ? 'outline' : 'detail'));
}
function progEl() {
  return document.getElementById('detail-progress');
}
function progTitle() {
  return document.getElementById('prog-title');
}
function progBar() {
  return document.getElementById('prog-bar');
}
function progPct() {
  return document.getElementById('prog-pct');
}
function progDetail() {
  return document.getElementById('prog-detail');
}
function progCancel() {
  return document.getElementById('prog-cancel');
}
function fixBtnEl() {
  var pg = pageEl();
  if (!pg) return null;
  if (currentArchModule === 'detail') return pg.querySelector('#arch-fix-btn2');
  return pg.querySelector('#arch-fix-btn');
}
function apiWarnEl() {
  return document.getElementById('api-warn');
}
function rawEditArea() {
  return rawAreaEl();
} // alias for compatibility

// 统计角色数量（从chars文本中识别独立角色）
function countCharacters(charsText) {
  if (!charsText) return 0;
  var total = 0;

  // 策略1：按"姓名："或"名字："匹配（最准确，权重最高）
  var nameMatches = charsText.match(/姓名[：:]/g);
  if (nameMatches && nameMatches.length >= 1) {
    total = nameMatches.length;
  }

  // 策略2：按 **名字** 加粗格式（AI回流角色），去重计入
  var boldMatches = charsText.match(/\*\*([^*]{2,4})\*\*/g);
  if (boldMatches) {
    var boldNames = {};
    for (var bi = 0; bi < boldMatches.length; bi++) {
      var bn = boldMatches[bi].replace(/\*/g, '');
      if (!boldNames[bn]) {
        boldNames[bn] = true;
        // 不重复计入已有的姓名匹配
        if (!nameMatches || charsText.indexOf('姓名：' + bn) === -1 && charsText.indexOf('姓名:' + bn) === -1) {
          total++;
        }
      }
    }
  }

  // 兜底：没有姓名也没有加粗标记，按空行段估算
  if (total === 0) {
    var paras = charsText.split(/\n\s*\n/);
    for (var j = 0; j < paras.length; j++) {
      if (paras[j].trim().length > 20) total++;
    }
  }
  return Math.max(1, total);
}

// 检查并补充角色（为prompt生成角色清单）

// ========== v35：人物关系图 ==========
function extractRelationNames(work) {
  work = work || {};
  var text = work.chars || '';
  var names = [];
  var push = function push(n) {
    n = (n || '').trim().replace(/[，,。；;：:\s].*$/, '');
    if (n.length >= 2 && n.length <= 8 && names.indexOf(n) < 0 && !/(人物|角色|主角|配角|姓名|名字|名称|身份|性格|背景)/.test(n)) names.push(n);
  };
  var m, re;
  re = /(?:姓名|名字|名称)[：:]\s*([^\n，,。；;]{1,8})/g;
  while ((m = re.exec(text)) !== null) push(m[1]);
  re = /(?:^|\n)【([^】]{2,8})】/g;
  while ((m = re.exec(text)) !== null) push(m[1]);
  re = /\*\*([^*]{2,8})\*\*/g;
  while ((m = re.exec(text)) !== null) push(m[1]);
  if (work.longMemory && work.longMemory.characterProfiles) {
    Object.keys(work.longMemory.characterProfiles).forEach(push);
  }
  return names.slice(0, 36);
}
function detectRelationLabel(sentence) {
  sentence = sentence || '';
  var rules = [['师徒', /(师父|师尊|师傅|徒弟|弟子|拜师)/], ['亲人', /(父亲|母亲|兄长|妹妹|姐姐|弟弟|家人|血脉|亲人|父子|母子|兄妹|姐弟)/], ['恋人/暧昧', /(喜欢|心动|爱慕|告白|成婚|未婚妻|未婚夫|道侣|暧昧|吻|拥抱)/], ['敌对', /(仇|敌|追杀|围杀|背叛|决裂|恨|杀死|复仇|对手|宿敌)/], ['盟友', /(结盟|盟友|联手|合作|同盟|援手|并肩|同伴)/], ['朋友', /(朋友|挚友|好友|兄弟|知己|伙伴)/], ['主仆/上下级', /(主上|属下|下属|侍卫|护卫|丫鬟|仆|臣|将军|统领)/], ['亏欠/救命', /(救了|救命|亏欠|欠|恩情|报恩)/], ['怀疑', /(怀疑|猜忌|试探|不信任|隐瞒)/], ['保护', /(保护|守护|护住|挡在|照顾)/]];
  for (var i = 0; i < rules.length; i++) {
    if (rules[i][1].test(sentence)) return rules[i][0];
  }
  return '相关';
}
function buildRelationEdges(work, names) {
  var textParts = [];
  if (work && work.chars) textParts.push(work.chars);
  if (work && work.longMemory && work.longMemory.characterProfiles) {
    Object.keys(work.longMemory.characterProfiles).forEach(function (k) {
      var p = work.longMemory.characterProfiles[k];
      (p.relationships || []).forEach(function (r) {
        textParts.push(r.text || '');
      });
      (p.milestones || []).forEach(function (r) {
        textParts.push(r.text || '');
      });
    });
  }
  var sentences = textParts.join('\n').split(/[。！？!?；;\n]+/).map(function (s) {
    return s.trim();
  }).filter(Boolean);
  var edges = [];
  var seen = {};
  sentences.forEach(function (s) {
    var hit = names.filter(function (n) {
      return s.indexOf(n) >= 0;
    });
    if (hit.length < 2) return;
    for (var i = 0; i < hit.length; i++) {
      for (var j = i + 1; j < hit.length; j++) {
        var a = hit[i],
          b = hit[j];
        var key = [a, b].sort().join('::');
        var label = detectRelationLabel(s);
        if (!seen[key]) {
          seen[key] = {
            from: a,
            to: b,
            label: label,
            evidence: s.slice(0, 80),
            weight: 1
          };
        } else {
          seen[key].weight++;
          if (seen[key].label === '相关' && label !== '相关') seen[key].label = label;
        }
      }
    }
  });
  Object.keys(seen).forEach(function (k) {
    edges.push(seen[k]);
  });
  return edges.sort(function (a, b) {
    return b.weight - a.weight;
  }).slice(0, 80);
}
function relationColor(label) {
  if (/敌|仇|背叛|决裂/.test(label)) return '#ef4444';
  if (/恋|暧昧/.test(label)) return '#ec4899';
  if (/亲|师徒/.test(label)) return '#8b5cf6';
  if (/盟友|朋友|保护|救命/.test(label)) return '#10b981';
  if (/怀疑|亏欠/.test(label)) return '#f59e0b';
  return '#64748b';
}
function showRelationGraph() {
  var work = getWork();
  if (!work) {
    showToast('请先新建或选择作品');
    return;
  }
  var names = extractRelationNames(work);
  if (names.length < 2) {
    showToast('人物少于2个，无法生成关系图');
    return;
  }
  var edges = buildRelationEdges(work, names);
  var W = 1000,
    H = 700,
    cx = W / 2,
    cy = H / 2,
    r = Math.min(270, 120 + names.length * 10);
  var pos = {};
  names.forEach(function (n, i) {
    var ang = -Math.PI / 2 + Math.PI * 2 * i / names.length;
    pos[n] = {
      x: cx + Math.cos(ang) * r,
      y: cy + Math.sin(ang) * r
    };
  });
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:60vh;background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;">';
  svg += '<defs><filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.18"/></filter></defs>';
  if (!edges.length) {
    svg += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" fill="#94a3b8" font-size="24">已识别人物，但暂未解析出明确关系线</text>';
  } else {
    edges.forEach(function (e, idx) {
      var a = pos[e.from],
        b = pos[e.to];
      if (!a || !b) return;
      var color = relationColor(e.label);
      var mx = (a.x + b.x) / 2,
        my = (a.y + b.y) / 2;
      svg += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="' + color + '" stroke-width="' + Math.min(5, 1 + e.weight) + '" opacity="0.72"/>';
      svg += '<rect x="' + (mx - 38) + '" y="' + (my - 13) + '" width="76" height="24" rx="12" fill="white" stroke="' + color + '" opacity="0.95"/>';
      svg += '<text x="' + mx + '" y="' + (my + 5) + '" text-anchor="middle" font-size="13" fill="' + color + '" font-weight="700">' + he(e.label) + '</text>';
    });
  }
  names.forEach(function (n) {
    var p = pos[n];
    svg += '<circle cx="' + p.x + '" cy="' + p.y + '" r="34" fill="#ffffff" stroke="#2563eb" stroke-width="3" filter="url(#shadow)"/>';
    svg += '<text x="' + p.x + '" y="' + (p.y + 5) + '" text-anchor="middle" font-size="15" fill="#111827" font-weight="700">' + he(n.slice(0, 6)) + '</text>';
  });
  svg += '</svg>';
  var legend = '<div style="display:flex;flex-wrap:wrap;gap:8px;font-size:12px;margin:10px 0;color:#374151;">' + '<span style="color:#ef4444;">● 敌对</span><span style="color:#ec4899;">● 恋人/暧昧</span><span style="color:#8b5cf6;">● 亲人/师徒</span>' + '<span style="color:#10b981;">● 盟友/朋友</span><span style="color:#f59e0b;">● 怀疑/亏欠</span><span style="color:#64748b;">● 其他相关</span></div>';
  var detail = edges.length ? '<div style="max-height:120px;overflow:auto;font-size:12px;color:#6b7280;border-top:1px solid #eee;padding-top:8px;">' + edges.slice(0, 18).map(function (e) {
    return '<div><b>' + he(e.from) + '</b> — <b>' + he(e.to) + '</b>：' + he(e.label) + '｜' + he(e.evidence) + '</div>';
  }).join('') + '</div>' : '';
  var box = document.createElement('div');
  box.id = 'relation-graph-overlay';
  box.innerHTML = '<div style="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;padding:16px;box-sizing:border-box;" onclick="closeRelationGraph(event)">' + '<div onclick="event.stopPropagation()" style="background:#fff;border-radius:16px;max-width:980px;margin:20px auto;padding:16px;max-height:90vh;overflow:auto;">' + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-size:18px;font-weight:800;">👥 人物关系图</div>' + '<button onclick="closeRelationGraph()" style="border:none;background:#f3f4f6;border-radius:8px;padding:8px 12px;">关闭</button></div>' + '<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">共识别 ' + names.length + ' 人，关系线 ' + edges.length + ' 条。线上的文字代表两人关系。</div>' + svg + legend + detail + '</div></div>';
  document.body.appendChild(box);
}
function closeRelationGraph() {
  var el = document.getElementById('relation-graph-overlay');
  if (el) el.parentNode.removeChild(el);
}
window.showRelationGraph = showRelationGraph;
window.closeRelationGraph = closeRelationGraph;
function buildCharacterContext(charsText) {
  if (!charsText) return {
    count: 0,
    names: '',
    instruction: ''
  };
  var count = countCharacters(charsText);

  // 提取角色名
  var names = [];
  var namePattern = /(?:姓名|名字|名称)[：:]\s*([^\n，,]{1,8})/g;
  var m;
  while ((m = namePattern.exec(charsText)) !== null) {
    names.push(m[1].trim());
  }
  var namesStr = names.length > 0 ? names.join('、') : '未提取到角色名';
  var instruction = '';
  if (count < 3) {
    instruction = '\n\n【⚠️ 重要：角色数量不足】当前仅有' + count + '个已定义角色（' + namesStr + '）。' + '请在生成的内容中，自然引入2-3个符合世界观的新配角（如导师、挚友、对手），' + '并确保新增角色有明确的姓名、身份、性格、动机。在细纲中标注新角色首次出场。';
  }
  return {
    count: count,
    names: namesStr,
    instruction: instruction
  };
}

// 从生成文本中提取新角色名，并追加到人物卡
function syncCharactersFromText(work, generatedText) {
  if (!generatedText || !work) return;
  var existingChars = work.chars || '';
  var existingNames = new Set();
  var namePattern = /(?:姓名|名字|名称)[：:]\s*([^\n，,]{1,8})/g;
  var m;
  while ((m = namePattern.exec(existingChars)) !== null) {
    existingNames.add(m[1].trim());
  }

  // 从生成文本中提取角色名
  var foundNames = {};

  // 策略1：细纲格式 — 人物：[主要出场角色]
  var charFieldPattern = /人物[：:]\s*([^|，,\n]+)/g;
  while ((m = charFieldPattern.exec(generatedText)) !== null) {
    var field = m[1].trim();
    // 分割多个人名（用、/空格/逗号分隔）
    var parts = field.split(/[、，,\/\s]+/);
    for (var p = 0; p < parts.length; p++) {
      var name = parts[p].trim();
      if (name.length >= 2 && name.length <= 4) {
        foundNames[name] = (foundNames[name] || 0) + 1;
      }
    }
  }

  // 策略2：大纲格式 — 描述中提到的人名
  // 提取书名号中的标题不算，只取自由文本中的2-3字中文名
  var cleanText = generatedText.replace(/《[^》]+》/g, ''); // 去掉书名
  cleanText = cleanText.replace(/第\d+[章卷]/g, ''); // 去掉"第X章"
  var freeNamePattern = /(?:登场|出场|引入|收服|击败|结盟|背叛|认识|遇见|对决|VS|vs|对手|导师|挚友|伙伴|帮助)[：:]?\s*([\u4e00-\u9fa5]{2,3})(?=[，。\s\n\|])/g;
  while ((m = freeNamePattern.exec(cleanText)) !== null) {
    var fn = m[1];
    if (fn.length === 2 || fn.length === 3) {
      foundNames[fn] = (foundNames[fn] || 0) + 1;
    }
  }

  // 筛选：出现2次以上 且 不在既有角色中
  var stopWords = ['系统', '世界', '天下', '实力', '境界', '修炼', '功法', '丹药', '灵石', '法宝', '宗门', '王朝', '帝国', '主角', '反派', '路人', '村民', '士兵', '护卫', '侍女', '太监', '大臣', '将军', '皇帝', '魔王', '妖王'];
  var newNames = [];
  for (var name in foundNames) {
    if (foundNames[name] >= 2 && !existingNames.has(name) && stopWords.indexOf(name) === -1) {
      newNames.push(name);
    }
  }
  if (newNames.length === 0) return;

  // 追加到人物卡
  var appendText = '\n\n---\n## 由AI自动补充（待完善）\n';
  for (var ni = 0; ni < newNames.length; ni++) {
    appendText += '\n**' + newNames[ni] + '**（待补充）\n';
    appendText += '- 身份：（待完善）\n';
    appendText += '- 性格：（待完善）\n';
    appendText += '- 与主角关系：（待完善）\n';
  }
  work.chars = existingChars + appendText;
  saveWork(work);
  showToast('✅ 从生成结果中发现' + newNames.length + '个新角色（' + newNames.slice(0, 4).join('、') + (newNames.length > 4 ? '等' + newNames.length + '人' : '') + '），已追加到人物卡');
}

// 模块状态：pending(未开始), editing(编辑中), done(已完成), locked(锁定)
var archModuleStatus = {
  world: 'pending',
  chars: 'locked',
  outline: 'locked',
  detail: 'locked'
};

// ========== v52：完整内容缓存 + 分页搬运显示（已修复） ==========
// 说明：AI 返回的完整文本保存到 work[module]，前端只把其中一页显示在 textarea。
// 修复：1) 用内存对象 _archFullTextV52 存储完整内容，避免 dataset 字符串长度限制
//       2) 分页大小从 2400 提升到 5000 字符
//       3) 自动回退到拆分存储 key（当 work[module] 因大容量拆分存储为空时）
//       4) 同步编辑后正确合并回完整内容
var ARCH_DISPLAY_PAGE_SIZE_V52 = 5000;
// 内存缓存：{ world: "...", chars: "...", outline: "...", detail: "..." }
var _archFullTextV52 = _archFullTextV52 || {};

// 读取单作品拆分存储的某个字段（大容量时数据存到独立 localStorage key）
function _readSplitFieldForWork(work, field) {
  if (!work || !work.id) return null;
  try {
    var prefix = 'wxbj_w_';
    var v = localStorage.getItem(prefix + work.id + '_' + field);
    if (v) return JSON.parse(v);
  } catch (e) {}
  return null;
}

function archDisplayPagerEl(module) {
  return document.getElementById('arch-display-pager-' + (module || currentArchModule));
}
function archDisplayInfoEl(module) {
  return document.getElementById('arch-display-info-' + (module || currentArchModule));
}
function getArchFullTextV52(module) {
  module = module || currentArchModule;
  // 1) 优先取内存缓存（编辑中的内容）
  if (_archFullTextV52 && _archFullTextV52[module] != null && _archFullTextV52[module] !== '') {
    return _archFullTextV52[module];
  }
  // 2) 其次取作品对象上的字段
  var work = getWork();
  if (work && work[module] && work[module] !== '') return work[module];
  // 3) 回退：从拆分存储 key 读取（大容量拆分存储场景）
  var splitVal = _readSplitFieldForWork(work, module);
  if (splitVal && typeof splitVal === 'string' && splitVal !== '') {
    _archFullTextV52[module] = splitVal;
    return splitVal;
  }
  // 4) 最后回退：textarea 当前值
  var raw = document.getElementById('raw-' + module);
  if (raw && raw.value) return raw.value;
  return '';
}
function setArchFullTextV52(module, text, persist) {
  module = module || currentArchModule;
  text = String(text || '');
  // 内存缓存（主存储）
  _archFullTextV52[module] = text;
  // 同步到 dataset 兼容旧代码
  var raw = document.getElementById('raw-' + module);
  if (raw && raw.dataset) {
    try { raw.dataset.fullText = text.length < 20000 ? text : ''; } catch (e) {}
  }
  var work = getWork();
  if (work && persist !== false) {
    work[module] = text;
    try {
      DB.saveWork(work);
    } catch (e) {
      console.warn('保存作品失败:', e);
    }
  }
}
function syncCurrentDisplayPageToFullV52(module) {
  module = module || currentArchModule;
  var raw = document.getElementById('raw-' + module);
  if (!raw || raw.dataset.displayPaged !== '1') return;
  var full = getArchFullTextV52(module);
  var start = parseInt(raw.dataset.pageStart || '0', 10);
  var end = parseInt(raw.dataset.pageEnd || '0', 10);
  var merged = full.slice(0, start) + (raw.value || '') + full.slice(end);
  setArchFullTextV52(module, merged, true);
}
function renderArchDisplayPageV52(module, reset) {
  module = module || currentArchModule;
  var raw = document.getElementById('raw-' + module);
  if (!raw) return;
  var full = getArchFullTextV52(module);
  // 更新内存缓存
  _archFullTextV52[module] = full;
  var pager = archDisplayPagerEl(module);
  var info = archDisplayInfoEl(module);
  var total = Math.max(1, Math.ceil((full.length || 0) / ARCH_DISPLAY_PAGE_SIZE_V52));
  var page = reset ? 0 : parseInt(raw.dataset.pageIdx || '0', 10);
  page = Math.max(0, Math.min(page, total - 1));
  var start = page * ARCH_DISPLAY_PAGE_SIZE_V52;
  var end = Math.min(full.length, start + ARCH_DISPLAY_PAGE_SIZE_V52);
  raw.dataset.displayPaged = full.length > ARCH_DISPLAY_PAGE_SIZE_V52 ? '1' : '0';
  raw.dataset.pageIdx = String(page);
  raw.dataset.pageStart = String(start);
  raw.dataset.pageEnd = String(end);
  raw.value = full.slice(start, end);
  if (pager) pager.style.display = full ? 'flex' : 'none';
  if (info) info.textContent = '第' + (page + 1) + '/' + total + '页｜完整内容' + full.length + '字';
  autoGrowArchTextarea(raw);
}
function archDisplayPrevPageV52() {
  syncCurrentDisplayPageToFullV52(currentArchModule);
  var raw = document.getElementById('raw-' + currentArchModule);
  if (!raw) return;
  raw.dataset.pageIdx = String(Math.max(0, parseInt(raw.dataset.pageIdx || '0', 10) - 1));
  renderArchDisplayPageV52(currentArchModule, false);
}
function archDisplayNextPageV52() {
  syncCurrentDisplayPageToFullV52(currentArchModule);
  var raw = document.getElementById('raw-' + currentArchModule);
  if (!raw) return;
  var full = getArchFullTextV52(currentArchModule);
  var total = Math.max(1, Math.ceil(full.length / ARCH_DISPLAY_PAGE_SIZE_V52));
  raw.dataset.pageIdx = String(Math.min(total - 1, parseInt(raw.dataset.pageIdx || '0', 10) + 1));
  renderArchDisplayPageV52(currentArchModule, false);
}
function archDisplayShowAllV52() {
  syncCurrentDisplayPageToFullV52(currentArchModule);
  var raw = document.getElementById('raw-' + currentArchModule);
  if (!raw) return;
  var full = getArchFullTextV52(currentArchModule);
  raw.dataset.displayPaged = '0';
  raw.value = full;
  autoGrowArchTextarea(raw);
  var info = archDisplayInfoEl(currentArchModule);
  if (info) info.textContent = '全文显示｜完整内容' + full.length + '字';
}
function archDisplayBackToPagedV52() {
  var raw = document.getElementById('raw-' + currentArchModule);
  if (!raw) return;
  setArchFullTextV52(currentArchModule, raw.value || getArchFullTextV52(currentArchModule), true);
  renderArchDisplayPageV52(currentArchModule, false);
}
window.archDisplayPrevPageV52 = archDisplayPrevPageV52;
window.archDisplayNextPageV52 = archDisplayNextPageV52;
window.archDisplayShowAllV52 = archDisplayShowAllV52;
window.archDisplayBackToPagedV52 = archDisplayBackToPagedV52;

// ========== v50：生成截断续写守卫 ==========
function isLikelyTruncatedArchResult(module, text) {
  text = String(text || '').trim();
  if (!text) return false;
  var tail = text.slice(-260).trim();
  var last = tail.slice(-1);
  // 明显停在半句、冒号、未闭合引号/括号
  if (/[：:，,、；;（(《“"「『]$/.test(tail)) return true;
  var quoteOpen = (text.match(/[“「『《]/g) || []).length;
  var quoteClose = (text.match(/[”」』》]/g) || []).length;
  if (quoteOpen > quoteClose) return true;
  if (/经典台词[:：]\s*[“"「『]?[^”"」』。！？!?]{1,80}$/.test(tail)) return true;
  if (/(最恨|因为|但是|而是|直到|只要|必须|准备|发现|看见|听见|决定|开始)$/.test(tail)) return true;
  if (!/[。！？!?》”」』]$/.test(last) && text.length > 300) return true;
  // 模块级完整性：人物必须有至少 3 个条目；世界观要有多个一级段落
  if (module === 'chars') {
    var personMarks = (text.match(/姓名[:：]|身份[:：]|能力等级[:：]|经典台词[:：]|主角|配角|对手|导师/g) || []).length;
    if (text.length < 900 || personMarks < 5) return true;
  }
  if (module === 'world') {
    var sectionMarks = (text.match(/【[^】]+】|^\s*\d+[\.、]|^#+\s*/gm) || []).length;
    if (text.length < 900 || sectionMarks < 4) return true;
  }
  if (module === 'outline' && text.length < 1200) return true;
  if (module === 'detail') {
    var chCount = (text.match(/第[一二三四五六七八九十百千\d]+章/g) || []).length;
    if (chCount < 3 && text.length < 1600) return true;
  }
  return false;
}
function stripContinuationDuplication(base, more) {
  base = String(base || '').trim();
  more = String(more || '').trim();
  if (!more) return '';
  more = more.replace(/^以下是续写[:：]?\s*/, '').replace(/^继续[:：]?\s*/, '').trim();
  var tail = base.slice(-220);
  var lines = more.split(/\n+/);
  while (lines.length && tail.indexOf(lines[0].trim().slice(0, 50)) >= 0) lines.shift();
  return lines.join('\n').trim();
}
function continueTruncatedArchResult(_x, _x2, _x3, _x4, _x5) {
  return _continueTruncatedArchResult.apply(this, arguments);
}
function _continueTruncatedArchResult() {
  _continueTruncatedArchResult = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(module, result, work, idea, prompt) {
    var contPrompt, more;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          if (isLikelyTruncatedArchResult(module, result)) {
            _context.n = 1;
            break;
          }
          return _context.a(2, result);
        case 1:
          showToast('检测到生成结果后半段可能缺失，正在自动续写…', 3000);
          contPrompt = '你正在补全一个被截断的网文架构输出。不要重写前文，只从断点后继续写，补齐后半段，直到结构完整收束。\n\n';
          contPrompt += '【模块】' + (ARCH_MODULE_NAMES[module] || module) + '\n';
          contPrompt += '【作品】' + (work && work.title || '') + '\n';
          if (idea) contPrompt += '【原始构思】' + idea + '\n';
          contPrompt += '【前文最后1200字】\n' + String(result || '').slice(-1200) + '\n\n';
          contPrompt += '【要求】\n';
          contPrompt += '1. 只输出续写内容，不要重复已经写过的内容。\n';
          contPrompt += '2. 如果上一句没写完，先补完上一句。\n';
          contPrompt += '3. 必须补齐缺失人物/设定/后续段落，并以完整句号或总结收束。\n';
          contPrompt += '4. 不要写“以下是续写”等解释。\n';
          _context.n = 2;
          return callRealAPIWithFallback(contPrompt, null, 'fill');
        case 2:
          more = _context.v;
          if (more) {
            more = stripContinuationDuplication(result, more);
            if (more) result = String(result || '').replace(/\s*$/, '') + '\n' + more;
          }
          return _context.a(2, result);
      }
    }, _callee);
  }));
  return _continueTruncatedArchResult.apply(this, arguments);
}
function autoGrowArchTextarea(el) {
  if (!el) return;
  try {
    el.style.height = 'auto';
    var h = Math.max(360, Math.min(el.scrollHeight + 24, 1800));
    el.style.height = h + 'px';
  } catch (e) {}
}

// BUG-10 fix: 暴露到全局，供外部调用
function autoGrowCurrentArchTextarea() {
  autoGrowArchTextarea(rawEditArea && rawEditArea());
}
window.autoGrowCurrentArchTextarea = autoGrowCurrentArchTextarea;
function getArchIntegrityRule(moduleName, hint) {
  return '\n请从开头完整输出，不要省略结构、不要从中间开始、不要只写片段。\n' + (hint || '');
}
function isFragmentArchResult(module, text, idea) {
  text = String(text || '').trim();
  if (!text || text.length < 120) return true;
  var first = text.split(/\n/).map(function (x) {
    return x.trim();
  }).filter(Boolean)[0] || '';
  if (/^[-—•*]\s*(特征|代表人物|视觉化|能力|等级|设定|说明)/.test(first)) return true;
  if (/^\*\*\s*\d+[\.、]/.test(first) && !/(世界观|总体|主角|第1卷|第一卷|第1章|第一章)/.test(text.slice(0, 280))) return true;
  if (/^(特征|代表人物|视觉化|能力|等级|设定)[:：]/.test(first)) return true;
  if (module === 'world') {
    var need = ['时代', '势力', '格局', '力量', '体系', '经济', '地理', '冲突'];
    var hit = need.filter(function (k) {
      return text.indexOf(k) >= 0;
    }).length;
    if (hit < 3) return true;
    if (idea && idea.indexOf('东汉') >= 0 && text.indexOf('东汉') < 0 && text.indexOf('汉') < 0) return true;
    if (idea && idea.indexOf('穿越') >= 0 && text.indexOf('穿越') < 0 && text.indexOf('主角') < 0) return true;
  }
  if (module === 'outline' && !/(第[一二三四五六七八九十\d]+卷|卷主题|阶段)/.test(text.slice(0, 1000))) return true;
  if (module === 'detail' && !/(第[一二三四五六七八九十\d]+章)/.test(text.slice(0, 600))) return true;
  if (module === 'chars' && !/(主角|姓名|身份|性格|人物)/.test(text.slice(0, 800))) return true;
  return false;
}
function buildIntegrityRetryPrompt(basePrompt, module, badText, idea) {
  var p = basePrompt + '\n\n【上次输出被判定为断裂/半截，禁止继续使用】\n';
  p += '上次输出开头如下：\n' + String(badText || '').slice(0, 900) + '\n\n';
  p += '请重新生成，必须从完整开头开始，输出完整结构，不得从等级、条目或中段开始。\n';
  p += getArchIntegrityRule(module);
  if (idea) p += '\n再次强调用户构思必须保留：\n' + idea + '\n';
  return p;
}
function localRepairFragmentArchResult(module, text, idea, work) {
  text = String(text || '').trim();
  if (!text) return text;
  if (module === 'world') {
    var title = '【世界观设定总览】\n';
    var core = idea ? '本书核心构思：' + idea + '\n\n' : '';
    var bridge = '【总体概念】\n这是围绕当前构思展开的完整世界观草案。以下内容为已生成设定的整理承接，后续重新生成时会继续以本构思和已有设定为准。\n\n';
    if (!/(【总体概念】|时代背景|天下大势|世界观设定)/.test(text.slice(0, 500))) return title + core + bridge + '【力量/军制/资源体系】\n' + text;
  }
  if (module === 'chars' && !/(主角|姓名)/.test(text.slice(0, 300))) {
    return '【人物人设总览】\n本人物设定承接作品《' + (work && work.title || '') + '》和用户构思：' + (idea || '') + '\n\n' + text;
  }
  return text;
}

// ========== v48：构思草稿持久化 + 承接式重新生成 ==========
function ensureArchIdeas(work) {
  if (!work) return {};
  if (!work._archIdeas) work._archIdeas = {};
  return work._archIdeas;
}
function getModuleIdea(work, module) {
  module = module || currentArchModule;
  var ideas = ensureArchIdeas(work);
  var val = ideas[module] || '';
  // 兼容旧版：旧 work.idea 作为世界观构思兜底
  if (!val && module === 'world' && work.idea) val = work.idea;
  return val || '';
}
function saveModuleIdea(module, val) {
  var work = getWork();
  if (!work) return;
  module = module || currentArchModule;
  ensureArchIdeas(work)[module] = val || '';
  if (module === 'world') work.idea = val || ''; // 保持旧字段兼容
  try {
    DB.saveWork(work);
  } catch (e) {}
}
function bindIdeaDraftTracking() {
  var allIdeas = document.querySelectorAll('.module-page textarea[id^="idea-"]');
  allIdeas.forEach(function (ta) {
    if (ta.dataset.ideaBound) return;
    ta.dataset.ideaBound = '1';
    ta.addEventListener('input', function () {
      var module = (ta.id || '').replace('idea-', '') || currentArchModule;
      saveModuleIdea(module, ta.value || '');
    });
  });
}
function buildRegenContinuityBlock(work, module) {
  if (!work) return '';
  var old = work[module] || '';
  var edit = rawAreaEl();
  if (edit && edit.value && edit.value.trim().length > 20) old = edit.value.trim();
  if (!old || old.length < 30) return '';
  var block = '\n【v48 重新生成承接锁】\n';
  block += '这是一次“重新生成/补强”，不是从零另开新设定。必须承接已有内容的核心设定，避免从中途断裂、编号错乱、只输出片段。\n';
  block += '如果你要重写，请输出完整的' + (ARCH_MODULE_NAMES[module] || module) + '，从开头开始，结构完整，不要只续写半截。\n';
  block += '必须保留：作品核心构思、主角身份、关键人物、世界规则、已有卷/章因果链。\n';
  block += '允许优化：表达、结构、补缺字段、增强商业性，但不得把已有设定改成另一本书。\n';
  block += '【已有内容摘要/原文参考】\n' + old.slice(0, 3600) + '\n';
  if (old.length > 5200) block += '\n【已有内容末尾】\n' + old.slice(-1600) + '\n';
  return block + '\n';
}
function getVolumeStartChapterByIdx(volumes, idx) {
  var n = 1;
  volumes = (volumes || []).slice().sort(function (a, b) {
    return a.idx - b.idx;
  });
  for (var i = 0; i < volumes.length; i++) {
    if (volumes[i].idx >= idx) break;
    n += parseInt(volumes[i].chapters || 0) || 0;
  }
  return n;
}
function splitDetailByVolume(text) {
  var out = [];
  text = text || '';
  if (!text.trim()) return out;
  var re = /^===\s*(第[一二三四五六七八九十百千\d]+卷[^=\n]*)\s*===\s*$/gm;
  var m,
    last = null,
    lastPos = 0;
  while ((m = re.exec(text)) !== null) {
    if (last) out.push({
      title: last.title,
      body: text.slice(lastPos, m.index).trim()
    });
    last = {
      title: m[1].trim()
    };
    lastPos = re.lastIndex;
  }
  if (last) out.push({
    title: last.title,
    body: text.slice(lastPos).trim()
  });
  if (!out.length) out.push({
    title: '',
    body: text.trim()
  });
  return out;
}
function mergeDetailBySelectedVolumes(existing, generated, selectedVols) {
  if (!existing || !existing.trim()) return generated || '';
  if (!generated || !generated.trim()) return existing || '';
  var selected = {};
  (selectedVols || []).forEach(function (v) {
    selected[v.idx] = true;
  });
  var oldParts = splitDetailByVolume(existing);
  var newParts = splitDetailByVolume(generated);
  var replaced = {};
  function idxOf(title) {
    var m = String(title || '').match(/第([一二三四五六七八九十百千\d]+)卷/);
    if (!m) return 0;
    var map = {
      '一': 1,
      '二': 2,
      '三': 3,
      '四': 4,
      '五': 5,
      '六': 6,
      '七': 7,
      '八': 8,
      '九': 9,
      '十': 10
    };
    var s = m[1];
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    if (s === '十') return 10;
    if (s.length === 2 && s[0] === '十') return 10 + (map[s[1]] || 0);
    if (s.length === 2 && s[1] === '十') return (map[s[0]] || 0) * 10;
    if (s.length === 3 && s[1] === '十') return (map[s[0]] || 0) * 10 + (map[s[2]] || 0);
    return map[s] || 0;
  }
  var newMap = {};
  newParts.forEach(function (p) {
    var id = idxOf(p.title);
    if (id) newMap[id] = p;
  });
  var merged = oldParts.map(function (p) {
    var id = idxOf(p.title);
    if (id && selected[id] && newMap[id]) {
      replaced[id] = true;
      return newMap[id];
    }
    return p;
  });
  newParts.forEach(function (p) {
    var id = idxOf(p.title);
    if (id && selected[id] && !replaced[id]) merged.push(p);
  });
  return merged.map(function (p) {
    return (p.title ? '=== ' + p.title + ' ===\n' : '') + p.body;
  }).join('\n\n');
}

// 切换模块
function switchArchModule(module) {
  var _work$archStatus;
  var work = getWork();
  if (!work) {
    showToast('请先选择作品');
    return;
  }

  // 检查是否锁定
  var status = ((_work$archStatus = work.archStatus) === null || _work$archStatus === void 0 ? void 0 : _work$archStatus[module]) || archModuleStatus[module];
  if (status === 'locked') {
    showToast('请先完成前置模块');
    return;
  }

  // 切到大纲或细纲时检查角色数量
  if ((module === 'outline' || module === 'detail') && work.chars) {
    var chkCtx = buildCharacterContext(work.chars);
    if (chkCtx.count < 3) {
      showToast('⚠️ 角色仅' + chkCtx.count + '人，建议先完成人物卡再生成，否则AI会自己编随机角色', {
        error: true
      });
    }
  }
  currentArchModule = module;
  window.currentArchModule = module; // BUG-05 fix: 同步到全局
  window.archModuleStatus = archModuleStatus; // BUG-06 fix: 同步引用

  // 正在生成中且切到非细纲页：自动进入后台模式
  if (_genLock && module !== 'detail' && !_bgMode) {
    switchToBackgroundGen();
  }
  renderArchModule();
  // BUG-11 fix: 初始化时检查是否有未完成的细纲生成任务
  setTimeout(function () {
    checkGenResume();
  }, 500);
}

// 渲染模块
function renderArchModule() {
  var work = getWork();
  if (!work) {
    showToast('请先新建或选择作品');
    return;
  }

  // === 显示/隐藏模块页面 ===
  document.querySelectorAll('.module-page').forEach(function (p) {
    return p.classList.remove('current');
  });
  var pg = pageEl();
  if (pg) pg.classList.add('current');

  // 更新标签状态
  var tabs = document.querySelectorAll('.arch-tab-item');
  tabs.forEach(function (tab, idx) {
    var _work$archStatus2;
    var module = ARCH_MODULES[idx];
    var status = ((_work$archStatus2 = work.archStatus) === null || _work$archStatus2 === void 0 ? void 0 : _work$archStatus2[module]) || archModuleStatus[module];
    tab.classList.remove('active', 'finish', 'lock');
    if (module === currentArchModule) {
      tab.classList.add('active');
    } else if (status === 'done') {
      tab.classList.add('finish');
    } else if (status === 'locked') {
      tab.classList.add('lock');
    }

    // 人物卡标签额外显示角色数量
    if (module === 'chars' && work.chars) {
      var chCount = countCharacters(work.chars);
      var badge = tab.querySelector('.char-count-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'char-count-badge';
        badge.style.cssText = 'font-size:10px;margin-left:4px;padding:1px 5px;border-radius:4px;vertical-align:middle;';
        tab.appendChild(badge);
      }
      badge.textContent = chCount + '人';
      if (chCount < 3) {
        badge.style.background = '#fef2f2';
        badge.style.color = '#ef4444';
      } else if (chCount < 6) {
        badge.style.background = '#fef3c7';
        badge.style.color = '#b45309';
      } else {
        badge.style.background = '#f0fdf4';
        badge.style.color = '#16a34a';
      }
    }
  });

  // 更新前置内容预览
  renderPreviewContent();

  // === 初始化卡片数据（静默，为AI约束保留） ===
  if (!work._cardData) work._cardData = {};
  if (!work._cardData[currentArchModule]) {
    work._cardData[currentArchModule] = {};
  }

  // 文本编辑区 — 直接写入内容（有脏标记则保留编辑）
  var rawArea = rawAreaEl();
  if (rawArea) {
    // 如果用户正在编辑当前模块，不覆盖
    if (_moduleDirty[currentArchModule]) {
      // 保留用户编辑，只更新其他UI
    } else if (currentArchModule === 'detail') {
      // BUG-09 fix: 细纲保持当前页，不重置到第1页
      renderDetailPaginated(work, rawArea);
    } else {
      rawArea.dataset.fullText = work[currentArchModule] || '';
      _archFullTextV52[currentArchModule] = work[currentArchModule] || '';
      renderArchDisplayPageV52(currentArchModule, true);
    }
  }

  // 同步构思回 idea 输入框：v48 起按模块保存，生成/切换/刷新都不清空
  var ideaInput = ideaEl();
  if (ideaInput) {
    ideaInput.value = getModuleIdea(work, currentArchModule);
  }

  // 显示/隐藏数量选择器 & 平台选择器
  updateCountSelector();
}

// 渲染前置内容预览（新布局：每个模块页内的预览条）
function renderPreviewContent() {
  var work = getWork();
  if (!work) return;
  var moduleIdx = ARCH_MODULES.indexOf(currentArchModule);
  if (moduleIdx === 0) return; // 世界观无前置

  var previewContent = '';
  var doneCount = 0;

  // 获取所有前置模块内容
  var prevModules = ARCH_MODULES.slice(0, moduleIdx);
  for (var pi = 0; pi < prevModules.length; pi++) {
    var m = prevModules[pi];
    if (work[m]) {
      previewContent += '【' + ARCH_MODULE_NAMES[m] + '】\n' + work[m] + '\n\n';
      doneCount++;
    }
  }
  if (!previewContent) {
    previewContent = '前置模块内容尚未完成，请先完成前置模块。';
  }

  // 更新对应模块页的预览体
  var prevBodyId = 'prev-' + currentArchModule + '-body';
  var prevBody = document.getElementById(prevBodyId);
  if (prevBody) {
    prevBody.textContent = previewContent;
  }

  // 更新预览条的已完成数量
  var prevBarId = 'prev-' + currentArchModule + '-bar';
  var prevBar = document.getElementById(prevBarId);
  if (prevBar) {
    var span = prevBar.querySelector('span:first-child');
    if (span) span.textContent = '💡 前置架构预览（' + doneCount + '项已完成）';
  }
}

// 保存模块（先弹出确认框）
function saveArchModule() {
  var work = getWork();
  if (!work) {
    showToast('无作品');
    _genLock = false;
    return;
  }

  // 直接从文本编辑区读取内容；v52 翻页显示下保存完整内容，不只保存当前页
  if (currentArchModule !== 'detail') syncCurrentDisplayPageToFullV52(currentArchModule);
  var editArea = rawEditArea();
  var content = currentArchModule !== 'detail' ? getArchFullTextV52(currentArchModule).trim() : editArea && editArea.value ? editArea.value.trim() : '';

  // 如果有卡片数据，优先用卡片数据生成文本
  if ((!content || content.length < 10) && work._cardData && work._cardData[currentArchModule] && typeof cardToFreeText === 'function') {
    content = cardToFreeText(currentArchModule, work._cardData[currentArchModule]);
  }
  if (!content || content.trim().length < 10) {
    showToast('请先输入或生成内容');
    return;
  }

  // 显示确认弹窗
  var modal = document.getElementById('save-confirm-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

// 确认保存
function confirmSave() {
  var work = getWork();
  if (!work) {
    showToast('请先新建或选择作品');
    return;
  }
  var content = '';

  // 优先从文本编辑区读取；v52 翻页显示下保存完整内容，不只保存当前页
  if (currentArchModule !== 'detail') syncCurrentDisplayPageToFullV52(currentArchModule);
  var editArea = rawEditArea();
  content = currentArchModule !== 'detail' ? getArchFullTextV52(currentArchModule).trim() : editArea && editArea.value ? editArea.value.trim() : '';

  // 保持卡片数据（如果有的话，之前AI生成时已写入）
  if (!work._cardData) work._cardData = {};
  if (!work._cardData[currentArchModule]) {
    work._cardData[currentArchModule] = {};
  }

  // 如果没有从编辑区读到内容，尝试从卡片数据生成
  if ((!content || content.length < 10) && typeof cardToFreeText === 'function') {
    content = cardToFreeText(currentArchModule, work._cardData[currentArchModule]);
  }

  // 保存内容
  work[currentArchModule] = content;

  // 更新状态为已完成
  if (!work.archStatus) work.archStatus = {};
  work.archStatus[currentArchModule] = 'done';

  // 解锁下一个模块
  var moduleIdx = ARCH_MODULES.indexOf(currentArchModule);
  if (moduleIdx < ARCH_MODULES.length - 1) {
    var nextModule = ARCH_MODULES[moduleIdx + 1];
    work.archStatus[nextModule] = 'pending';
    archModuleStatus[nextModule] = 'pending';
  }
  if (_archAutoSaveTimer) {
    clearTimeout(_archAutoSaveTimer);
    _archAutoSaveTimer = null;
  }
  saveWork(work);
  var modal = document.getElementById('save-confirm-modal');
  if (modal) {
    modal.style.display = 'none';
  }
  clearDirty(currentArchModule);
  showToast('保存成功');
  renderArchModule();
}

// 取消保存
function cancelSave() {
  var modal = document.getElementById('save-confirm-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// 更新数量选择器显示
function updateCountSelector() {
  var selOutline = document.getElementById('count-select-outline');
  var selDetail = document.getElementById('count-select-detail');
  var pfSel = pfSelEl();
  var work3 = getWork();
  var platformFromWork = work3 && work3._platform;
  if (currentArchModule === 'outline') {
    // 大纲页：平台 + 卷数
    if (selOutline) selOutline.style.display = 'flex';
    if (selDetail) selDetail.style.display = 'none';

    // 平台选择器
    if (pfSel) {
      pfSel.style.display = 'flex';
      if (platformFromWork) {
        var pfCfg = PLATFORM_CONFIG[platformFromWork] || PLATFORM_CONFIG.qidian;
        pfSel.innerHTML = '<div class="pf-item active" style="flex:1;text-align:center;padding:6px 0;border-radius:8px;font-size:12px;background:#6366f1;color:#fff;border:2px solid #6366f1;">📡 ' + pfCfg.label + ' · 已锁定</div>';
      } else {
        var pf = getSelectedPlatform();
        pfSel.innerHTML = '';
        Object.keys(PLATFORM_CONFIG).forEach(function (k) {
          var cfg = PLATFORM_CONFIG[k];
          var isActive = pf === k;
          pfSel.innerHTML += '<div class="pf-item' + (isActive ? ' active' : '') + '" onclick="setPlatform(\'' + k + '\');updateCountSelector();" style="flex:1;text-align:center;padding:6px 0;border-radius:8px;font-size:12px;cursor:pointer;border:1px solid #eee;' + (isActive ? 'background:#6366f1;color:#fff;border-color:#6366f1;' : 'background:#fff;color:#666;') + '">📡 ' + cfg.label + '<br><span style="font-size:10px;opacity:0.7;">' + cfg.desc + '</span></div>';
        });
      }
    }

    // 卷数选择
    var pfC = PLATFORM_CONFIG[getSelectedPlatform()] || PLATFORM_CONFIG.qidian;
    var defaultVol = pfC.defaultVolumes;
    if (selOutline) {
      var s = '<span style="font-size:13px;color:#666;">卷数：</span>';
      s += '<select id="count-input" style="flex:1;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;background:#fff;outline:none;">';
      [6, 7, 8, 9, 10, 12].forEach(function (v) {
        s += '<option value="' + v + '"' + (v === defaultVol ? ' selected' : '') + '>' + v + '</option>';
      });
      s += '</select>';
      selOutline.innerHTML = s;
    }
  } else if (currentArchModule === 'detail') {
    // 细纲页：卷选卡片
    if (pfSel) pfSel.style.display = 'none';
    if (selOutline) selOutline.style.display = 'none';
    if (selDetail) selDetail.style.display = 'block';
    var work2 = getWork();
    var volumes = extractVolumeInfo(work2);
    var volHtml = '<div style="font-size:13px;color:#666;margin-bottom:6px;">📖 选择要生成的卷：</div><div class="vol-cards">';
    for (var vi2 = 0; vi2 < volumes.length; vi2++) {
      var v = volumes[vi2];
      var chLabel = v.chapters || 50;
      var descPreview = v.desc && v.desc.length > 5 ? v.desc.replace(/\n/g, ' ').substring(0, 40) + (v.desc.length > 40 ? '...' : '') : '暂无描述';
      volHtml += '<label class="vol-card checked">';
      volHtml += '<input type="checkbox" class="vol-check" value="' + v.idx + '" data-ch="' + chLabel + '" checked onchange="var lb=this.parentElement;if(this.checked){lb.style.borderColor=\'#6366f1\';lb.style.background=\'#f0f2ff\';lb.classList.add(\'checked\');}else{lb.style.borderColor=\'#e5e7eb\';lb.style.background=\'#fff\';lb.classList.remove(\'checked\');}">';
      volHtml += '<div class="vc-info"><div class="vc-name">' + v.name + '</div><div class="vc-desc">' + descPreview + '</div></div>';
      volHtml += '<span class="vc-ch">' + chLabel + '章</span>';
      volHtml += '</label>';
    }
    volHtml += '</div>';
    volHtml += '<div class="vol-override">统一覆盖：<input type="number" id="ch-per-vol-override" min="10" max="200" step="5" placeholder="默认" style="width:50px;padding:2px 4px;border:1px solid #e5e7eb;border-radius:5px;font-size:11px;text-align:center;background:#fff;outline:none;vertical-align:middle;"> 章/卷</div>';
    if (selDetail) selDetail.innerHTML = volHtml;
  } else {
    // 世界观/人设：隐藏所有选择器
    if (pfSel) pfSel.style.display = 'none';
    if (selOutline) selOutline.style.display = 'none';
    if (selDetail) selDetail.style.display = 'none';
  }
}

// ========== 多AI协作：骨架+血肉双Agent ==========

// 每个模块的骨架Agent（出结构）和血肉Agent（填细节）
var SKELETON_AGENTS = {
  world: {
    name: '世界骨架师',
    emoji: '🦴',
    persona: '你是一位世界观结构师，精通各类题材的世界观设计。你的任务不是写完整设定，而是搭建世界观的核心骨架。只输出以下结构：\n1. 世界名称与一句话概括（必须包含这个世界的核心矛盾）\n2. 核心势力列表（每势力一行：名称+立场+1句简介+该势力的核心利益诉求）\n3. 势力关系矩阵（每对势力用1句说明：敌对/结盟/暗斗/贸易依赖/历史恩怨，必须体现因果链——A和B敌对是因为什么历史事件/资源争夺/信仰冲突）\n4. 势力互动事件（3-5个具体的势力间互动：贸易协定/暗杀事件/联姻/战争/背叛，每个1句）\n5. 关键地理节点（每地一行：名称+特色+该地与哪个势力绑定+该地的感官特征1个）\n6. 力量/等级体系（列表形式，标注每个境界的稀缺比例和突破代价，如"筑基：千人中一人可达，需灵石百枚"）\n7. 经济与资源（核心资源+争夺关系+底层人如何获取资源）\n8. 世界核心矛盾（1-2句：这个世界最大的结构性冲突是什么，驱动所有势力行动的根本原因。必须具体——"谁和谁因为什么资源/信仰/历史而对立"，而非泛泛的"世界动荡"）\n9. 世界运转逻辑（1句：这个世界靠什么维持运转，权力如何更迭）\n\n严格遵守：只输出骨架级信息，不要展开描写。每个元素一行，用列表格式。势力之间必须有因果联系，不能是孤立的势力列表。'
  },
  chars: {
    name: '人物骨架师',
    emoji: '🦴',
    persona: '你是一位人物结构师，擅长设计有深度和张力的人物群像。你的任务是列出所有核心人物的骨架信息，每人不超过3行。格式：\n角色名 | 身份 | 势力 | 核心性格标签(3个词) | 一句话目标 | 内在矛盾(一句话) | 视觉标签(1个让人过目不忘的特征)\n\n要求：\n1. 至少列出主角、反派、导师、挚友、对手、盟友、隐藏反派各1人（共7人以上）\n2. 每个角色的"内在矛盾"必须具体——如"渴望自由但背负家族使命""表面冷酷实际恐惧被抛弃""追求正义但手上沾满鲜血"\n3. 在列表之后，输出一张【关系网】（5-8条），格式：A→B：关系+驱动力（如"叶尘→苏瑶：师徒+叶尘需要苏瑶的情报网"），每条关系必须有驱动力\n4. 关系网中至少有1条隐藏关系（前期读者不知道的）\n5. 每个角色必须有一个独特的视觉标签（如"左眼下一道竖疤""永远戴着半边面具""说话时习惯性地摩挲左手无名指"）\n6. 在列表之后，输出【说话风格对照】（每人一句典型台词，展示语言差异）\n\n只输出骨架，不写详细设定。'
  },
  outline: {
    name: '大纲骨架师',
    emoji: '🦴',
    persona: '你是一位故事框架设计师，精通长篇连载的结构设计。你的任务是铺设全书的故事骨架——只列出卷级别的结构，不展开情节细节。格式严格：\n\n第N卷：《卷名》【第X章—第Y章】\n  · 一句话卷核心：谁想做什么，冲突是什么\n  · 本卷主角成长：从[状态A]到[状态B]（必须标注成长维度：能力/认知/关系，每卷至少选二，不能每卷都是"变强了"）\n  · 本卷与上卷的因果衔接：上卷的什么事件直接导致了本卷的发生（不能是"换地图打新怪"）\n  · 6个阶段名（每个一句，阶段之间必须有因果递进——A导致B，B引发C）\n  · 本卷爽点类型分布（标注每个阶段的爽点类型：打脸/突破/真相揭露/逆袭/获宝/复仇/结盟）\n  · 本卷为下卷埋的钩子：什么悬念/危机/未决之事将驱动下一卷\n  · 卷末钩子（一句话，必须有力度——让读者必须翻下一卷）\n  · 本卷信息增量：读者看完本卷会新知道什么（不能为空）\n\n关键要求：\n- 卷与卷之间必须有因果递进，不能是"换地图打新怪"的平行结构\n- 每卷的主角成长维度必须不同（不能每卷都是"变强了"）\n- 爽点类型必须多样化，不能每卷都是打脸\n- 不要写事件细节，不要写人物对话，不要写战斗描写。只输出骨架。'
  },
  detail: {
    name: '章节骨架师',
    emoji: '🦴',
    persona: '你是一位章节编排师，精通商业网文的节奏控制和读者心理。你的任务是为指定卷输出章节骨架，每章一行：\n\n第X章 《标题》 | 核心事件(10字) | 冲突类型 | 节拍类型 | 爆点大小 | 信息增量(8字) | 情绪曲线(3词)\n\n节拍类型只能是：铺垫/升级/反转/小高潮/大高潮/过渡/收束\n冲突类型只能是：人际/势力/内心/环境/信息差/资源争夺\n情绪曲线格式：开篇情绪→中段转折→结尾情绪（如：压抑→愤怒→释然）\n\n示例：\n第1章 《山村觉醒》 | 叶尘发现血脉 | 内心冲突 | 升级 | 小爆 | 血脉来历线索 | 迷茫→震惊→决心\n\n关键要求：\n1. 连续3章不能是同一种节拍类型\n2. 每章必须有"信息增量"——读者看完这章必须比上一章多知道一些东西\n3. 每章的情绪曲线不能和前后章完全相同\n4. 每5章至少1个中爆，每10章至少1个大爆\n5. 过渡章也必须有信息增量，不能是纯过渡\n6. 不要写剧情描述、不要写对话、不要写环境描写。每章只一行骨架。'
  }
};
var FLESH_AGENTS = {
  world: {
    name: '世界血肉师',
    emoji: '💪',
    persona: '你是一位世界设定作家，擅长构建有深度和内在逻辑的世界观。你收到一份世界观骨架，请将其扩展为完整的世界设定文档。要求：\n1. 每个势力扩展为100-200字详细描述（历史、现状、核心人物、利益诉求），势力之间必须有互动——贸易、战争、暗杀、联姻等具体事件，不能只写势力简介\n2. 每个地理节点扩展为50-100字场景描写，必须包含该地的感官特征（声音/气味/光线/温度至少选二），不能只有名称和一句话\n3. 等级体系写出每个境界的突破条件、标志和能力，并标注该境界在全世界的稀缺比例（如"筑基：千人中一人可达"）和突破代价（如"需灵石百枚，失败则经脉寸断"）\n4. 补充文化习俗、历史事件、种族关系等深层设定\n5. 必须写一段"世界运转逻辑"（200字）：这个世界靠什么维持运转？资源如何分配？权力如何更迭？底层人如何生存？\n6. 核心矛盾必须具体——不是泛泛的"世界动荡"，而是"谁和谁因为什么资源/信仰/历史而对立"\n7. 势力关系矩阵中每条关系必须写清因果——"A和B敌对是因为三百年前的XX战争，A夺走了B的圣物"\n\n格式：用自然段落，不要用列表。风格参考《诡秘之主》的设定质感。拒绝"各势力互不相关"的孤立设定，所有势力必须通过利益/历史/地理产生关联。拒绝"万能形容词"——不用"强大""神秘""古老"，用具体事实替代。'
  },
  chars: {
    name: '人物血肉师',
    emoji: '💪',
    persona: '你是一位人物塑造作家，擅长创造有血有肉、让人过目不忘的角色。你收到一人物骨架，请将每个人扩展为150-300字的完整人设。每人必须包含：\n1. 外貌特征（具体到发色/瞳色/身高/标志性着装/身体特征，必须有1个让人过目不忘的视觉标签——不是"帅/美"而是"左眼下一道竖疤""说话时习惯性地摩挲左手无名指"这样的具体特征）\n2. 性格详解（表层+深层，矛盾点，成长弧线，恐惧与执念）\n3. 背景故事（出身+关键事件+心理创伤或执念，创伤必须影响当前行为模式——如"幼年被抛弃导致他无法信任任何人，每次有人靠近他都会下意识后退"）\n4. 口头禅与行为习惯（至少1个独特的小动作或说话方式）\n5. 人际关系网（对其他核心角色的态度，每段关系必须有情感色彩而非中性描述，必须写清驱动力——A需要B的什么）\n6. 能力描述（当前实力+潜力上限+独特能力+能力的代价/限制——如"每次使用血脉之力都会消耗寿元，过度使用会走火入魔"）\n7. 说话风格（用一句该角色的典型台词来展示其语言风格，不同角色绝不能说一样的话——将军说话短促有力，书生引经据典，市井粗俗直接）\n8. 角色记忆点（设计1个"读者会记住的瞬间"——如"他在雨中独自跪在师父坟前，把酒倒在地上说"师父，我替你喝不了了""）\n\n格式：每人用【角色名】标题分段，内容用自然段落。拒绝扁平化，拒绝工具人。'
  },
  outline: {
    name: '大纲血肉师',
    emoji: '💪',
    persona: '你是一位故事展开大师，精通长篇连载的节奏控制和读者心理。你收到一份大纲骨架，请将其扩展为饱满的完整大纲。每卷必须展开为6个阶段的详细规划：\n\n每个阶段格式：\n阶段N：《阶段名》(第X章—第Y章)：\n  · 核心冲突：[势力/人物/事件的三方博弈]（2-3句，必须具体到谁和谁因为什么产生对立）\n  · 主要事件：（4-6个具体情节节点，每个有谁做了什么+结果，事件之间必须有因果链——A导致B，B引发C）\n  · 人物成长：[实力提升/认知变化/关系变化]（必须具体：从什么状态变成什么状态，不能只写"变强了"）\n  · 爽点设计：[高潮桥段具体描写，必须写清楚爽点类型——是打脸的爽、突破的爽、真相揭露的爽、逆袭的爽、还是获宝的爽，以及读者为什么爽]\n  · 信息增量：[本阶段读者会新知道什么]（不能为空，每个阶段都必须推进读者的认知）\n  · 毒点自检：✅ 本段避开了[具体毒点名]\n\n要求：事件不能空泛，要有具体的人物动作、地点和时间推进。爽点要具体到桥段。每卷末必须有强力钩子。阶段与阶段之间必须有因果递进，不能是平行并列的独立事件。卷与卷之间必须有因果衔接——上卷的什么事件直接导致了本卷的发生。'
  },
  detail: {
    name: '章节血肉师',
    emoji: '💪',
    persona: '你是一位章节扩写专家，精通商业网文的节奏、悬念和读者心理。你收到一份章节骨架，请将每章扩展为以下格式：\n\n第X章 《标题》\n━━━━━━━━━━━━━━\n【场景】具体地点、时间、氛围（15-30字，必须包含至少1个感官细节——声音/气味/光线/温度/触感）\n【出场人物】核心人物列表（标注每人的情绪状态：如"叶尘（焦虑）"）\n【剧情概要】（50-80字，写清起因→经过→结果，因果链必须闭合）\n【冲突设计】核心矛盾是什么+谁站在对立面+冲突升级的2-3步（不能一步到位）\n【爆点设计】高潮桥段（20-40字，写清楚读者情绪爆发点在哪里，标注爽点类型：打脸/突破/真相/逆袭/获宝）\n【情绪曲线】开篇情绪→中段转折→结尾情绪（如：压抑→愤怒→释然，不能和前后章完全相同）\n【信息增量】读者看完这章新知道了什么（不能为空）\n【伏笔/承接】埋下的伏笔或承接的上章伏笔（如有）\n【章尾钩子】让读者必须翻到下一章的悬念（15-25字，不能是"突然出现新敌人"式的硬切）\n\n要求：剧情要与骨架一致但文笔要有质感。不要写成新闻稿，要有小说的叙事张力。每章的情绪曲线不能和前后章完全相同。冲突必须有2-3步升级过程。'
  }
};

// ========== 骨架+血肉双Agent管线 ==========
// 每个模块：骨架Agent出结构 → 血肉Agent填细节
var _pipelineRunning = false;
var _pipelineSuccesses = {
  world: false,
  chars: false,
  outline: false,
  detail: false
};
function generateAllPipeline() {
  return _generateAllPipeline.apply(this, arguments);
} // 骨架Prompt：要求AI只输出结构框架
function _generateAllPipeline() {
  _generateAllPipeline = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var work, idea, genre, plotType, pfConfig, countEl, volumeCount, panel, steps, up, _callWithFallback, _callWithFallback2, _yield$Promise$all, _yield$Promise$all2, worldSkel, charsSkel, worldFlesh, charsFlesh, outlineSkel, outlineFlesh, volumes, dv, skelParts, skelResults, skelOk, fleshParts, volumeRanges, _rangeStart, _vr, _cnt, fvi, fVol, skelForVol, p, fResult, _range, finalFlesh, finalDetailText, successCount, failedModules, partial, _t2;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          _callWithFallback2 = function _callWithFallback4() {
            _callWithFallback2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(prompt, module) {
              var r, _t;
              return _regenerator().w(function (_context2) {
                while (1) switch (_context2.p = _context2.n) {
                  case 0:
                    _context2.n = 1;
                    return callRealAPIWithFallback(prompt, null, mapModuleToTaskType(module));
                  case 1:
                    r = _context2.v;
                    if (!r) {
                      _context2.n = 2;
                      break;
                    }
                    return _context2.a(2, r);
                  case 2:
                    if (!window.ContentGenerator) {
                      _context2.n = 9;
                      break;
                    }
                    showToast('API失败，使用本地AI生成' + module + '...', 3000);
                    _context2.p = 3;
                    if (!(module === 'world')) {
                      _context2.n = 4;
                      break;
                    }
                    return _context2.a(2, window.ContentGenerator.generateWorld(idea || work.title, genre, pfConfig.label));
                  case 4:
                    if (!(module === 'chars')) {
                      _context2.n = 5;
                      break;
                    }
                    return _context2.a(2, window.ContentGenerator.generateCharacter(idea || work.title, genre, pfConfig.label));
                  case 5:
                    if (!(module === 'outline')) {
                      _context2.n = 6;
                      break;
                    }
                    return _context2.a(2, window.ContentGenerator.generateOutline(work.world || '', work.chars || '', genre, plotType, volumeCount));
                  case 6:
                    if (!(module === 'detail')) {
                      _context2.n = 7;
                      break;
                    }
                    return _context2.a(2, null);
                  case 7:
                    _context2.n = 9;
                    break;
                  case 8:
                    _context2.p = 8;
                    _t = _context2.v;
                    console.error('本地生成失败:', _t);
                  case 9:
                    return _context2.a(2, null);
                }
              }, _callee2, null, [[3, 8]]);
            }));
            return _callWithFallback2.apply(this, arguments);
          };
          _callWithFallback = function _callWithFallback3(_x29, _x30) {
            return _callWithFallback2.apply(this, arguments);
          };
          up = function _up(idx, status, text) {
            if (steps[idx]) {
              steps[idx].className = 'pipe-step ' + status;
              var l = steps[idx].querySelector('.pipe-label');
              if (l) l.textContent = text;
            }
            // 后台模式下同步更新浮动指示器
            if (_bgMode) {
              var it = document.getElementById('bg-gen-task');
              var itl = document.getElementById('bg-gen-title');
              if (itl) itl.textContent = '双Agent协作';
              if (it && status === 'running') it.textContent = text;
              // 计算总进度
              var doneCount = 0;
              for (var si = 0; si < steps.length; si++) {
                if (steps[si] && steps[si].classList.contains('done')) doneCount++;
              }
              var totalPct = Math.round(doneCount / steps.length * 100);
              var ip = document.getElementById('bg-gen-pct');
              var ib = document.getElementById('bg-gen-bar');
              if (ip) ip.textContent = totalPct + '%';
              if (ib) ib.style.width = totalPct + '%';
            }
          };
          if (!(_pipelineRunning || _genLock)) {
            _context3.n = 1;
            break;
          }
          showToast('正在生成中，请耐心等待...');
          return _context3.a(2);
        case 1:
          _pipelineRunning = true;
          _genLock = true;
          _pipelineSuccesses = {
            world: false,
            chars: false,
            outline: false,
            detail: false
          };
          work = getWork();
          if (work) {
            _context3.n = 2;
            break;
          }
          showToast('请先新建或选择作品');
          _pipelineRunning = false;
          _genLock = false;
          return _context3.a(2);
        case 2:
          idea = ideaEl() && ideaEl().value ? ideaEl().value.trim() : '';
          genre = work.genre || work.category && work.category.cat1 || '玄幻';
          plotType = work.plotType || work.category && work.category.cat2 || '崛起流';
          pfConfig = PLATFORM_CONFIG[getSelectedPlatform()] || PLATFORM_CONFIG.qidian;
          countEl = document.getElementById('count-input');
          volumeCount = countEl ? parseInt(countEl.value) || 6 : 6;
          panel = createPipelinePanel();
          steps = panel.querySelectorAll('.pipe-step'); // 骨架/血肉辅助：带 ContentGenerator 降级的 API 调用
          _context3.p = 3;
          // ═══════════ Phase 1: 世界观 + 人物 — 骨架并行 ═══════════
          up(0, 'running', '🦴 世界骨架 输出中…');
          up(1, 'running', '🦴 人物骨架 输出中…');
          _context3.n = 4;
          return Promise.all([_callWithFallback(buildSkelPrompt('world', work, idea, genre, plotType, pfConfig, null), 'world'), _callWithFallback(buildSkelPrompt('chars', work, idea, genre, plotType, pfConfig, null), 'chars')]);
        case 4:
          _yield$Promise$all = _context3.v;
          _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 2);
          worldSkel = _yield$Promise$all2[0];
          charsSkel = _yield$Promise$all2[1];
          if (!worldSkel || !charsSkel) {
            up(0, !worldSkel ? 'error' : 'done', !worldSkel ? '世界骨架 ❌' : '🦴 世界骨架 ✅（本地）');
            up(1, !charsSkel ? 'error' : 'done', !charsSkel ? '人物骨架 ❌' : '🦴 人物骨架 ✅（本地）');
          } else {
            up(0, 'done', '🦴 世界骨架 ✅');
            up(1, 'done', '🦴 人物骨架 ✅');
          }

          // 分页保存骨架
          work._skeletons = work._skeletons || {};
          if (worldSkel) work._skeletons.world = worldSkel;
          if (charsSkel) work._skeletons.chars = charsSkel;
          DB.saveWork(work);

          // ═══════════ Phase 2: 世界观 + 人物 — 血肉分批填充 ═══════════
          up(2, 'running', '💪 世界血肉 分批填充中…');
          up(3, 'running', '💪 人物血肉 分批填充中…');
          worldFlesh = null, charsFlesh = null;
          if (!worldSkel) {
            _context3.n = 6;
            break;
          }
          _context3.n = 5;
          return _callWithFallback(buildFleshPrompt('world', work, worldSkel, genre, pfConfig), 'world');
        case 5:
          worldFlesh = _context3.v;
        case 6:
          if (!charsSkel) {
            _context3.n = 8;
            break;
          }
          _context3.n = 7;
          return _callWithFallback(buildFleshPrompt('chars', work, charsSkel, genre, pfConfig), 'chars');
        case 7:
          charsFlesh = _context3.v;
        case 8:
          if (worldFlesh) {
            work.world = worldFlesh;
            _pipelineSuccesses.world = true;
            up(2, 'done', '💪 世界血肉 ✅');
          } else {
            up(2, 'error', '世界血肉 ❌');
          }
          if (charsFlesh) {
            work.chars = charsFlesh;
            _pipelineSuccesses.chars = true;
            up(3, 'done', '💪 人物血肉 ✅');
          } else {
            up(3, 'error', '人物血肉 ❌');
          }
          DB.saveWork(work);

          // ═══════════ Phase 3: 大纲骨架 ═══════════
          up(4, 'running', '🦴 大纲骨架 输出中…');
          _context3.n = 9;
          return _callWithFallback(buildSkelPrompt('outline', work, idea, genre, plotType, pfConfig, volumeCount), 'outline');
        case 9:
          outlineSkel = _context3.v;
          if (outlineSkel) {
            work._skeletons.outline = outlineSkel;
            DB.saveWork(work);
            up(4, 'done', '🦴 大纲骨架 ✅');
          } else {
            up(4, 'error', '大纲骨架 ❌（可能影响后续质量）');
          }

          // ═══════════ Phase 4: 大纲血肉 ═══════════
          up(5, 'running', '💪 大纲血肉 填充中…');
          outlineFlesh = null;
          if (!outlineSkel) {
            _context3.n = 11;
            break;
          }
          _context3.n = 10;
          return _callWithFallback(buildFleshPrompt('outline', work, outlineSkel, genre, pfConfig), 'outline');
        case 10:
          outlineFlesh = _context3.v;
        case 11:
          if (outlineFlesh) {
            work.outline = outlineFlesh;
            _pipelineSuccesses.outline = true;
            DB.saveWork(work);
            up(5, 'done', '💪 大纲血肉 ✅');
          } else {
            up(5, 'error', '大纲血肉 ❌');
          }

          // ═══════════ Phase 5: 细纲骨架（并行） ═══════════
          volumes = extractVolumeInfo(work);
          if (!volumes || volumes.length === 0) {
            for (dv = 0; dv < volumeCount; dv++) volumes.push({
              idx: dv + 1,
              name: '第' + (dv + 1) + '卷',
              desc: '',
              chapters: 50
            });
          }
          up(6, 'running', '🦴 细纲骨架 ' + volumes.length + '卷并行…');
          skelParts = new Array(volumes.length);
          _context3.n = 12;
          return Promise.allSettled(volumes.map(function (vol, vi) {
            var p = buildSkelPrompt('detail', work, idea, genre, plotType, pfConfig, vol.chapters || 50, vol);
            return _callWithFallback(p, 'detail').then(function (r) {
              return {
                vi: vi,
                vol: vol,
                result: r
              };
            });
          }));
        case 12:
          skelResults = _context3.v;
          skelResults.forEach(function (sr) {
            if (sr.status === 'fulfilled' && sr.value && sr.value.result) {
              skelParts[sr.value.vi] = sr.value.result;
              up(6, 'running', '🦴 骨架 ' + sr.value.vol.name + ' ✅ (' + (sr.value.vi + 1) + '/' + volumes.length + ')');
            } else {
              var fallbackIdx = sr.status === 'fulfilled' && sr.value ? sr.value.vi : 0;
              up(6, 'running', '🦴 骨架 ' + (volumes[fallbackIdx] ? volumes[fallbackIdx].name : '某卷') + ' ❌');
            }
          });
          skelOk = skelParts.filter(Boolean);
          work._skeletons.detail = skelOk.join('\n---\n');
          DB.saveWork(work);
          up(6, 'done', '🦴 细纲骨架 ✅ (' + skelOk.length + '/' + volumes.length + ')');

          // ═══════════ Phase 6: 细纲血肉（按卷逐个生成，避免中断） ═══════════
          up(7, 'running', '💪 细纲血肉 ' + volumes.length + '卷生成中…');
          fleshParts = new Array(volumes.length);
          volumeRanges = [];
          _rangeStart = 1;
          for (_vr = 0; _vr < volumes.length; _vr++) {
            _cnt = parseInt(volumes[_vr].chapters) || 50;
            volumeRanges[_vr] = {
              start: _rangeStart,
              end: _rangeStart + _cnt - 1,
              count: _cnt
            };
            _rangeStart += _cnt;
          }
          fvi = 0;
        case 13:
          if (!(fvi < volumes.length)) {
            _context3.n = 18;
            break;
          }
          fVol = volumes[fvi];
          skelForVol = skelParts[fvi] || '';
          p = buildFleshPrompt('detail', work, skelForVol, genre, pfConfig, fVol);
          _context3.n = 14;
          return _callWithFallback(p, 'detail');
        case 14:
          fResult = _context3.v;
          if (isUnavailableAIText(fResult)) fResult = null;
          if (!fResult) {
            _context3.n = 16;
            break;
          }
          _range = volumeRanges[fvi] || {
            start: fvi * 50 + 1,
            end: fvi * 50 + 50,
            count: 50
          };
          fResult = normalizeDetailOutline(fResult, _range.start);
          _context3.n = 15;
          return multiAIDesignDetail(work, p, fResult, {
            genre: genre,
            volName: fVol.name || '第' + (fvi + 1) + '卷',
            startCh: _range.start,
            endCh: _range.end,
            chCount: _range.count
          });
        case 15:
          fResult = _context3.v;
          fleshParts[fvi] = fResult;
          up(7, 'running', '💪 血肉 ' + fVol.name + ' ✅ (' + (fvi + 1) + '/' + volumes.length + ')');
          _context3.n = 17;
          break;
        case 16:
          up(7, 'running', '💪 血肉 ' + fVol.name + ' ❌ (' + (fvi + 1) + '/' + volumes.length + ')');
        case 17:
          fvi++;
          _context3.n = 13;
          break;
        case 18:
          finalFlesh = fleshParts.filter(Boolean);
          if (finalFlesh.length > 0) {
            finalDetailText = finishDetailOutlineForWork(work, finalFlesh.join('\n\n'), 1);
            work.detail = finalDetailText;
            _pipelineSuccesses.detail = true;
            DB.saveWork(work);
            up(7, 'done', '💪 细纲血肉 ✅ (' + finalFlesh.length + '/' + volumes.length + '卷，评分' + (work._detailQuality ? work._detailQuality.score : '-') + '/100)');
          } else {
            up(7, 'error', '细纲血肉 ❌ (' + finalFlesh.length + '/' + volumes.length + '卷)');
          }

          // ===== 真实完成状态评估 =====
          successCount = (_pipelineSuccesses.world ? 1 : 0) + (_pipelineSuccesses.chars ? 1 : 0) + (_pipelineSuccesses.outline ? 1 : 0) + (_pipelineSuccesses.detail ? 1 : 0);
          failedModules = [];
          if (!_pipelineSuccesses.world) failedModules.push('世界观');
          if (!_pipelineSuccesses.chars) failedModules.push('人物');
          if (!_pipelineSuccesses.outline) failedModules.push('大纲');
          if (!_pipelineSuccesses.detail && finalFlesh.length === 0) failedModules.push('细纲');
          if (!_pipelineSuccesses.detail && finalFlesh.length > 0) failedModules.push('细纲(部分)');
          setTimeout(function () {
            if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
            panel = null;
            var ind = document.getElementById('bg-gen-indicator');
            if (ind) ind.style.display = 'none';
          }, 6000);
          if (successCount >= 3) {
            showToast('🚀 骨架+血肉完成！成功' + successCount + '/4模块，已自动保存');
          } else if (successCount >= 1) {
            showToast('⚠️ 部分完成（' + successCount + '/4模块），失败：' + failedModules.join('、') + '。已成功部分已保存');
          } else {
            showToast('❌ 全部模块生成失败，请检查API配置后重试');
          }
          switchArchModule('world');
          _context3.n = 20;
          break;
        case 19:
          _context3.p = 19;
          _t2 = _context3.v;
          console.error('Pipeline error:', _t2);
          partial = [];
          if (_pipelineSuccesses.world) partial.push('世界观');
          if (_pipelineSuccesses.chars) partial.push('人物');
          if (_pipelineSuccesses.outline) partial.push('大纲');
          if (partial.length > 0) {
            showToast('❌ 生成中断，但' + partial.join('、') + '已成功生成并保存，可手动补全剩余模块');
          } else {
            showToast('生成过程中出错，请重试。错误：' + (_t2.message || '未知'));
          }
        case 20:
          _context3.p = 20;
          _pipelineRunning = false;
          _genLock = false;
          return _context3.f(20);
        case 21:
          return _context3.a(2);
      }
    }, _callee3, null, [[3, 19, 20, 21]]);
  }));
  return _generateAllPipeline.apply(this, arguments);
}
function buildSkelPrompt(module, work, idea, genre, plotType, pfConfig, extraParam, volInfo) {
  var agent = SKELETON_AGENTS[module];
  var pfCfg = PLATFORM_CONFIG[getSelectedPlatform()] || PLATFORM_CONFIG.qidian;
  var p = agent.persona + '\n\n';
  p += '【作品】' + work.title + ' | 题材：' + genre + ' | 流派：' + plotType + ' | 平台：' + pfCfg.label + '\n';
  p += '\n' + getGenreConstraint(genre) + '\n';
  if (idea) {
    p += '【用户构思—最高准则】\n' + idea + '\n\n';
  }
  if (module !== 'world' && work.world) {
    p += '【已定稿世界观】（骨架阶段请参考以下完整设定来规划结构）\n' + work.world.substring(0, 2500) + '\n\n';
  }
  if (module === 'outline') {
    var volCount = extraParam || 6;
    if (work.chars) {
      p += '【人物骨架参考】\n' + work.chars.substring(0, 1500) + '\n\n';
    }
    p += '【任务】输出' + volCount + '卷的故事骨架。只输出结构，不展开情节。\n';
    p += '【反套路提醒】\n';
    p += '- 不要每卷都是"主角到新地方→遇到新敌人→打败新敌人→升级"的循环\n';
    p += '- 不要所有反派都是"邪恶的坏蛋"，给反派合理的动机\n';
    p += '- 不要每卷的爽点都是打脸，要多样化\n';
    p += '- 不要让主角每卷都恰好获得关键道具/恰好遇到贵人\n';
  } else if (module === 'detail') {
    var volName = volInfo ? volInfo.name : '当前卷';
    var chCount = extraParam || 50;
    if (work.chars) {
      p += '【人物参考】\n' + work.chars.substring(0, 1200) + '\n\n';
    }
    if (work.outline) {
      // 只取当前卷相关的大纲片段
      var olRelated = work.outline;
      if (volName && volName.length > 0) {
        var vIdx = work.outline.indexOf(volName);
        if (vIdx >= 0) olRelated = work.outline.substring(vIdx, vIdx + 1200);
      }
      p += '【本卷大纲参考】\n' + olRelated.substring(0, 1200) + '\n\n';
    }
    p += '【任务】为' + volName + '输出' + chCount + '章的执行级章节骨架。\n';
    p += getDetailBlueprintRule(genre, pfCfg) + '\n';
    p += '骨架阶段也必须包含：章目标、冲突、节拍、剧情节点、爽点爆点、伏笔、章尾钩子。\n';
    p += '【节奏锁】连续3章不能同一种节拍类型。每5章至少1个中爆，每10章至少1个大爆。过渡章也必须有信息增量。\n';
    p += '【反套路提醒】\n';
    p += '- 不要连续3章以上都是升级/打脸\n';
    p += '- 不要让主角每次都恰好化险为夷\n';
    p += '- 过渡章不是"什么都没发生"，而是"看似平静实则暗流涌动"\n';
    p += '- 每章的情绪曲线必须不同，不能连续5章都是"压抑→愤怒→释然"\n';
  } else if (module === 'world') {
    p += '【平台策略】' + pfCfg.worldStrategy + '\n';
    p += '\n【任务】输出世界观骨架。\n';
  } else if (module === 'chars') {
    var cb = buildConsistencyBlock(work, 'chars');
    if (cb) p += cb + '\n';
    p += '【平台策略】' + pfCfg.charsStrategy + '\n';
    p += '\n【任务】输出人物骨架列表。\n';
  }
  return p;
}

// 血肉Prompt：要求AI读取骨架后展开成完整文档
function buildFleshPrompt(module, work, skeleton, genre, pfConfig, volInfo) {
  var agent = FLESH_AGENTS[module];
  var pfCfg = PLATFORM_CONFIG[getSelectedPlatform()] || PLATFORM_CONFIG.qidian;
  var p = agent.persona + '\n\n';
  p += '【作品】' + work.title + ' | 题材：' + genre + ' | 平台：' + pfCfg.label + '\n';
  p += '\n' + getGenreConstraint(genre) + '\n';
  if (module !== 'world' && work.world) {
    p += '【完整世界观参考】\n' + work.world.substring(0, 2000) + '\n\n';
  }

  // 平台策略 — 对所有模块注入
  if (module === 'world' && pfCfg.worldStrategy) {
    p += '【平台策略指导】' + pfCfg.worldStrategy + '\n\n';
  } else if (module === 'chars' && pfCfg.charsStrategy) {
    p += '【平台策略指导】' + pfCfg.charsStrategy + '\n\n';
  } else if (module === 'outline' && pfCfg.outlineStrategy) {
    p += '【平台策略指导】' + pfCfg.outlineStrategy + '\n\n';
  } else if (module === 'detail' && pfCfg.detailStrategy) {
    p += '【平台策略指导】' + pfCfg.detailStrategy + '\n\n';
  }
  if (module === 'outline' && work.chars) {
    p += '【完整人物参考】\n' + work.chars.substring(0, 1500) + '\n\n';
    var poisonList = getPoisonChecklist(genre);
    p += '【⚠️ 毒点避雷清单】\n';
    for (var ai = 0; ai < poisonList.length; ai++) p += '❌ ' + poisonList[ai].name + '：' + poisonList[ai].desc + '\n';
    p += '\n';
  }
  if (module === 'detail' && work.outline) {
    var volName = volInfo ? volInfo.name : '';
    var ol = work.outline;
    if (volName && volName.length > 0) {
      var vi = ol.indexOf(volName);
      if (vi >= 0) ol = ol.substring(vi, vi + 1500);
    }
    p += '【本卷大纲参考】\n' + ol.substring(0, 1500) + '\n\n';
  }
  if (module === 'detail' && work.chars) {
    p += '【人物参考（细纲阶段）】\n' + work.chars.substring(0, 1000) + '\n\n';
  }
  p += '【骨架 — 请基于以下结构展开成完整文档】\n' + skeleton + '\n\n';
  p += '【重要】以骨架的结构和顺序为基础展开内容。如果骨架中有明显套路化/模板化的内容（如所有阶段结构雷同、所有角色性格扁平、所有冲突模式重复），你必须在保持整体结构框架的前提下，进行有创造性的改写和深化——改变千篇一律的描述、加入具体而非泛泛的细节、赋予不同角色不同的说话风格和行为方式、让不同的冲突有不同类型的张力和解决路径。\n';
  p += '【反套路核心要求】\n';
  p += '1. 禁止"列举式展开"——不要把骨架的每一条简单扩写成一段话就完事，要加入因果链、具体事件和感官细节\n';
  p += '2. 禁止"均匀分配"——不要每个势力/角色/阶段都给相同篇幅，重要的多写，次要的少写\n';
  p += '3. 禁止"平行结构"——每个元素必须和其他元素产生关联，不能是各自独立的条目\n';
  p += '4. 禁止"万能形容词"——不要用"强大""神秘""古老""危险"等空洞词，用具体事实替代\n';
  if (module === 'detail') {
    p += '\n' + getDetailBlueprintRule(genre, pfCfg) + '\n';
    p += '展开时每章至少包含 8 个核心字段：场景、出场、冲突、剧情节点(3-5步)、爽点爆点、伏笔/信息增量、记忆承接、章尾钩子。其余字段根据剧情需要填充，不强制每章都填满所有字段。重点是每章独立可读且章尾有明确钩子。\n';
  }
  return p;
}

// 进度面板：8步（世界骨/人骨/世界肉/人肉/大纲骨/大纲肉/细纲骨/细纲肉）
function createPipelinePanel() {
  var existing = document.getElementById('pipeline-panel');
  if (existing) existing.parentNode.removeChild(existing);
  var steps = ['🦴 世界观骨架', '🦴 人物骨架', '💪 世界观血肉', '💪 人物血肉', '🦴 大纲骨架', '💪 大纲血肉', '🦴 细纲骨架', '💪 细纲血肉'];
  var html = steps.map(function (s, i) {
    return '<div class="pipe-step pending" style="padding:5px 0;border-bottom:1px solid #f0f0f0;"><span class="pipe-label">' + s + ' 等待中…</span></div>';
  }).join('');
  var panel = document.createElement('div');
  panel.id = 'pipeline-panel';
  panel.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#fff;border-radius:16px;padding:14px 18px;box-shadow:0 8px 32px rgba(0,0,0,0.15);z-index:9999;min-width:220px;font-size:12px;max-height:70vh;overflow-y:auto;';
  panel.innerHTML = '<div style="font-weight:600;margin-bottom:8px;font-size:13px;display:flex;justify-content:space-between;align-items:center;">🏗️ 骨架+血肉 双Agent协作<button onclick="switchToBackgroundGen()" style="font-size:11px;padding:2px 8px;border:1px solid #6366f1;border-radius:5px;background:#eef0ff;color:#6366f1;cursor:pointer;font-weight:400;">🔽 后台</button></div>' + html;
  if (!document.getElementById('pipe-step-style')) {
    var ss = document.createElement('style');
    ss.id = 'pipe-step-style';
    ss.textContent = '.pipe-step.pending{color:#999}.pipe-step.running{color:#6366f1;font-weight:600;animation:pulse 1s infinite}.pipe-step.done{color:#16a34a}.pipe-step.error{color:#ef4444}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}';
    document.head.appendChild(ss);
  }
  document.body.appendChild(panel);
  panel.dataset.active = '1';
  return panel;
}

// ========== v65: 分批生成引擎（世界观/人设/大纲） ==========
// 核心思路：把一个大任务拆成多个小批次，每批有明确边界，最后拼装
// 不再依赖"续写"来补全截断内容

// 极简分工路由表映射：将通用 module 映射到细分 taskType
function mapModuleToTaskType(module) {
  var map = {
    world: 'world_rules',
    chars: 'chars_core',
    outline: 'outline_logic',
    detail: 'detail'
  };
  return map[module] || module;
}
function generateArchModuleInBatches(_x6, _x7, _x8, _x9, _x0, _x1, _x10) {
  return _generateArchModuleInBatches.apply(this, arguments);
} // 根据模块和参数，规划分批方案
function _generateArchModuleInBatches() {
  _generateArchModuleInBatches = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(module, basePrompt, work, idea, genre, plotType, count) {
    var moduleName, batches, result, totalBatches, allParts, accumulated, rawArea, bi, batch, pct, batchPrompt, partResult, fullResult;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          moduleName = ARCH_MODULE_NAMES[module] || module;
          batches = buildArchBatches(module, work, idea, genre, plotType, count);
          if (!(batches.length <= 1)) {
            _context4.n = 3;
            break;
          }
          // 不需要分批，直接单次生成（用进度条）
          showProgress('AI生成' + moduleName + '…', 10);
          _context4.n = 1;
          return callRealAPIWithFallback(basePrompt, null, mapModuleToTaskType(module));
        case 1:
          result = _context4.v;
          updateProgress(100, moduleName + '生成完成');
          _context4.n = 2;
          return _sleep(300);
        case 2:
          hideProgress();
          if (result && isFragmentArchResult(module, result, idea)) {
            result = localRepairFragmentArchResult(module, result, idea, work);
          }
          return _context4.a(2, result);
        case 3:
          // 分批生成：每批完成后实时追加到编辑器
          totalBatches = batches.length;
          showProgress('准备生成' + moduleName + '（共' + totalBatches + '批）', 0);
          _context4.n = 4;
          return _sleep(0);
        case 4:
          allParts = [];
          accumulated = ''; // 获取编辑器元素
          rawArea = rawEditArea();
          if (rawArea) {
            rawArea.dataset.fullText = '';
            _archFullTextV52[module] = '';
            rawArea.value = '';
            rawArea.style.display = 'block';
            rawArea.style.marginTop = '0';
            rawArea.style.borderTop = 'none';
            rawArea.style.paddingTop = '0';
          }
          bi = 0;
        case 5:
          if (!(bi < totalBatches)) {
            _context4.n = 11;
            break;
          }
          if (!_cancelGeneration) {
            _context4.n = 6;
            break;
          }
          showToast('已取消生成，已保留 ' + bi + '/' + totalBatches + ' 批');
          return _context4.a(3, 11);
        case 6:
          batch = batches[bi];
          pct = Math.round((bi + 0.5) / totalBatches * 100);
          updateProgress(pct, moduleName + '：' + batch.label + '（' + (bi + 1) + '/' + totalBatches + '）');
          _context4.n = 7;
          return _sleep(0);
        case 7:
          batchPrompt = buildBatchPrompt(module, batch, basePrompt, work, allParts, bi, totalBatches);
          _context4.n = 8;
          return callRealAPIWithFallback(batchPrompt, null, 'batch');
        case 8:
          partResult = _context4.v;
          if (partResult) {
            _context4.n = 9;
            break;
          }
          showToast(moduleName + '第' + (bi + 1) + '批生成失败', {
            error: true
          });
          // 失败也追加提示，继续下一批
          if (rawArea) {
            accumulated += '\n\n【第' + (bi + 1) + '批：' + batch.label + ' — 生成失败，请手动重试】\n';
            rawArea.dataset.fullText = accumulated;
            _archFullTextV52[module] = accumulated;
            if (module !== 'detail') renderArchDisplayPageV52(module, true);else {
              rawArea.value = accumulated;
              autoGrowArchTextarea(rawArea);
            }
          }
          allParts.push('');
          return _context4.a(3, 10);
        case 9:
          // 清理续写前缀
          partResult = partResult.replace(/^以下是[^：:]*[：:]\s*/i, '').replace(/^继续[：:]\s*/i, '').trim();
          allParts.push(partResult);

          // 实时追加到编辑器
          accumulated += (accumulated ? '\n\n' : '') + partResult;
          if (rawArea) {
            rawArea.dataset.fullText = accumulated;
            _archFullTextV52[module] = accumulated;
            if (module !== 'detail') renderArchDisplayPageV52(module, true);else {
              rawArea.value = accumulated;
              autoGrowArchTextarea(rawArea);
            }
          }

          // 更新进度
          updateProgress(Math.round((bi + 1) / totalBatches * 100), moduleName + '：' + batch.label + ' ✓');
        case 10:
          bi++;
          _context4.n = 5;
          break;
        case 11:
          updateProgress(100, moduleName + '全部完成');
          _context4.n = 12;
          return _sleep(400);
        case 12:
          hideProgress();
          if (!(allParts.length === 0)) {
            _context4.n = 13;
            break;
          }
          return _context4.a(2, null);
        case 13:
          fullResult = allParts.filter(function (p) {
            return p;
          }).join('\n\n');
          if (fullResult) {
            _context4.n = 14;
            break;
          }
          return _context4.a(2, null);
        case 14:
          // 后处理：片段检测修复
          if (isFragmentArchResult(module, fullResult, idea)) {
            fullResult = localRepairFragmentArchResult(module, fullResult, idea, work);
          }
          return _context4.a(2, fullResult);
      }
    }, _callee4);
  }));
  return _generateArchModuleInBatches.apply(this, arguments);
}
function buildArchBatches(module, work, idea, genre, plotType, count) {
  // 根据模型实际输出容量动态调整每批大小
  // cap: 单次可生成中文字符上限；越小模型分越多批
  var cap = 6000;
  try {
    if (typeof window.getModelOutputCapacity === 'function') cap = window.getModelOutputCapacity();
    else if (typeof getModelOutputCapacity === 'function') cap = getModelOutputCapacity();
  } catch (e) {}

  if (module === 'world') {
    // 世界观：按输出容量分批
    // 大模型(>=8000): 标准4批，每批完整一个维度
    // 中模型(4000-8000): 标准4批
    // 小模型(<4000): 拆成5-6批，每批只聚焦一个小主题
    if (cap >= 8000) {
      return [{
        label: '时代背景与核心矛盾',
        focus: '输出时代背景、天下大势、核心矛盾、总体概念。为本作品奠定整体基调，后续各批次将在此基础上扩展。'
      }, {
        label: '地理与势力格局',
        focus: '在承接前面时代背景的前提下，输出地理与场景设定、势力格局（各势力名称、立场、关系）。时代背景中的关键地名、势力必须沿用，不得另起炉灶。'
      }, {
        label: '力量与晋升体系',
        focus: '在承接前面时代背景与势力格局的前提下，输出力量/晋升体系（等级划分、突破条件、特殊规则）。力量体系的来源、分布、限制必须与前面的世界设定一致。'
      }, {
        label: '经济文化与冲突源',
        focus: '在承接前面所有设定的前提下，输出经济基础、民生文化、禁忌代价、剧情可用冲突源。经济、文化、冲突必须与前面的势力/力量体系相匹配，不得凭空引入新势力或推翻已有规则。'
      }];
    }
    if (cap >= 4000) {
      return [{
        label: '时代背景',
        focus: '只输出时代背景、历史脉络、天下大势。不要写势力名称、不要写力量体系。输出约' + Math.min(2500, Math.round(cap * 0.5)) + '字。'
      }, {
        label: '核心矛盾与总体概念',
        focus: '在承接前面时代背景的前提下，只输出核心矛盾、故事主线驱动力、总体概念。不写具体势力和力量体系。输出约' + Math.min(2500, Math.round(cap * 0.5)) + '字。'
      }, {
        label: '地理与势力格局',
        focus: '在承接前面时代背景与核心矛盾的前提下，只输出地理与场景设定、势力格局（各势力名称、立场、关系）。地名和势力必须与前面一致。输出约' + Math.min(2500, Math.round(cap * 0.5)) + '字。'
      }, {
        label: '力量与晋升体系',
        focus: '在承接前面所有设定的前提下，只输出力量/晋升体系（等级划分、突破条件、特殊规则）。力量体系的来源、分布、限制必须与前面的设定一致。输出约' + Math.min(2500, Math.round(cap * 0.5)) + '字。'
      }, {
        label: '经济文化与冲突源',
        focus: '在承接前面所有设定的前提下，输出经济基础、民生文化、禁忌代价、剧情可用冲突源。必须与前面的势力/力量体系相匹配。输出约' + Math.min(2500, Math.round(cap * 0.5)) + '字。'
      }];
    }
    // 小模型：拆成更多批，每批只聚焦1个小点
    return [{
      label: '时代背景与历史脉络',
      focus: '只输出时代背景与历史脉络，不写势力、不写力量体系。控制在' + Math.round(cap * 0.7) + '字以内。'
    }, {
      label: '核心矛盾与故事主线',
      focus: '在承接前面时代背景的前提下，只输出核心矛盾、故事主线驱动力、总体概念。控制在' + Math.round(cap * 0.7) + '字以内。'
    }, {
      label: '地理与场景设定',
      focus: '在承接前面设定的前提下，只输出地理与主要场景设定。控制在' + Math.round(cap * 0.7) + '字以内。'
    }, {
      label: '势力格局（阵营与关系）',
      focus: '在承接前面设定的前提下，只输出各势力名称、立场、关系、阵营。控制在' + Math.round(cap * 0.7) + '字以内。'
    }, {
      label: '力量与晋升体系',
      focus: '在承接前面设定的前提下，只输出力量/晋升体系（等级划分、突破条件、特殊规则）。控制在' + Math.round(cap * 0.7) + '字以内。'
    }, {
      label: '经济文化与冲突源',
      focus: '在承接前面所有设定的前提下，输出经济基础、民生文化、禁忌代价、剧情可用冲突源。控制在' + Math.round(cap * 0.7) + '字以内。'
    }];
  }

  if (module === 'chars') {
    // 人设：按模型容量决定每批人物数
    var charsPerBatchCore = 3; // 核心配角每批人数
    var charsPerBatchMinor = 2; // 配角每批人数
    if (cap < 4000) {
      charsPerBatchCore = 2;
      charsPerBatchMinor = 2;
    }
    if (cap < 2500) {
      charsPerBatchCore = 1;
      charsPerBatchMinor = 1;
    }

    var batches = [];
    batches.push({
      label: '主角人设',
      focus: '只输出主角的完整人设（姓名、年龄、性别、身份、外貌、核心性格、优点、缺点、底线、口头禅、战力/能力等级、经典台词）。不写配角。控制在' + Math.min(3000, Math.round(cap * 0.85)) + '字以内。主角必须与世界观核心冲突、时代背景高度契合。'
    });

    // 核心配角（导师/挚友/对手）
    var coreOthers = ['导师型角色', '挚友/伙伴型角色', '对手/宿敌型角色'];
    var batchLabels = ['导师型角色', '挚友/伙伴型角色', '对手/宿敌型角色'];
    for (var ci = 0; ci < coreOthers.length; ci += charsPerBatchCore) {
      var slice = coreOthers.slice(ci, ci + charsPerBatchCore);
      var labelTxt = batchLabels.slice(ci, ci + charsPerBatchCore).join('、');
      batches.push({
        label: labelTxt,
        focus: '在主角已确立的前提下，输出' + slice.join('、') + '的完整人设（姓名、年龄、性别、身份、外貌、核心性格、优点、缺点、底线、口头禅、战力/能力等级、经典台词）。每个角色必须与主角有明确关系，与世界设定相符。每批' + slice.length + '个角色。控制在' + Math.min(3000, Math.round(cap * 0.85)) + '字以内。不得改写或覆盖前面批次已输出的人物设定。'
      });
    }

    // 重要配角
    batches.push({
      label: '重要配角（' + charsPerBatchMinor + '人）',
      focus: '在承接前面所有人物设定的前提下，输出其他重要配角' + charsPerBatchMinor + '人的人设（如盟友、恋人候选等）。控制在' + Math.min(3000, Math.round(cap * 0.85)) + '字以内。不得与前面的人物重名，不得推翻已有角色设定。'
    });

    // 反派
    batches.push({
      label: '反派与暗线人物（至少2人）',
      focus: '在承接前面所有人物设定的前提下，输出反派阵营和暗线人物至少2人的人设。每人包含：姓名、年龄、性别、身份、外貌、核心性格、优点、缺点、动机、底线、口头禅、战力/能力等级、经典台词。控制在' + Math.min(3000, Math.round(cap * 0.85)) + '字以内。反派必须与主角有因果关系，与世界观冲突源相匹配。'
    });

    return batches;
  }

  if (module === 'outline') {
    var volCount = count || 4;
    var batches = [];
    // 根据模型输出容量动态决定每批卷数
    // 大模型: 每批2卷；中模型: 每批2卷；小模型: 每批1卷
    var batchSize = 2;
    if (cap < 4000) batchSize = 1;
    if (cap >= 10000) batchSize = 3; // 超大模型可以每批3卷

    for (var vi = 0; vi < volCount; vi += batchSize) {
      var endVol = Math.min(vi + batchSize, volCount);
      var startVol = vi + 1;
      var volHint = '';
      if (vi > 0) {
        volHint = '（注意：前序卷已确立的卷主题、卷名、人物行为必须沿用，后续卷必须是前序卷的因果延续，不得中途改换主角或另开世界线）';
      }
      var volWordHint = Math.min(3500, Math.round(cap * 0.9 / batchSize));
      batches.push({
        label: '第' + startVol + '-' + endVol + '卷',
        focus: '严格承接前序卷的设定与因果，输出第' + startVol + '卷到第' + endVol + '卷的大纲。每卷包含卷主题、5-8个阶段，每个阶段有核心冲突、主要事件、人物成长、爽点设计、毒点自检。每卷字数约控制在' + volWordHint + '字左右。' + volHint
      });
    }
    return batches;
  }

  // 默认不分批
  return [{
    label: '整体生成',
    focus: ''
  }];
}

// 构建单批 prompt
function buildBatchPrompt(module, batch, basePrompt, work, prevParts, batchIndex, totalBatches) {
  var p = '';
  // 注入完整的基础prompt（包含题材约束、反套路指引、2026方法论）
  if (basePrompt && basePrompt.trim()) {
    p += basePrompt + '\n\n';
  }
  p += '【分批生成任务】本次是第 ' + (batchIndex + 1) + '/' + totalBatches + ' 批。\n';
  p += '【本批要求】' + batch.focus + '\n\n';

  // 注入用户构思
  if (work) {
    var savedIdea = getModuleIdea(work, module) || '';
    if (savedIdea) {
      p += '【⚠️ 用户构思（最高准则）】\n' + savedIdea + '\n————————————————————\n\n';
    }
    p += '【作品】' + (work.title || '') + '\n';
    p += '【题材】' + (work.genre || genre || '') + ' / ' + (work.plotType || plotType || '') + '\n';
  }

  // 注入题材硬约束（basePrompt可能不含，所以必须单独注入）
  if (work && work.genre) {
    var gc = getGenreConstraint(work.genre);
    if (gc && gc.trim()) {
      p += '\n' + gc + '\n';
    }
  }

  // ========== 分批一致性锚点：注入全部前批的关键设定摘要 ==========
  if (prevParts.length > 0) {
    var anchorText = '';
    if (module === 'world') {
      // 世界观：从前面所有批次提取关键设定条目
      for (var ai = 0; ai < prevParts.length; ai++) {
        anchorText += '【第' + (ai + 1) + '批关键设定】\n' + prevParts[ai].slice(0, 700).trim() + '\n\n';
      }
    } else if (module === 'chars') {
      // 人设：从前面批次提取已输出人物名称+核心身份，避免重名/冲突
      for (var ai2 = 0; ai2 < prevParts.length; ai2++) {
        var names = [];
        var lines = prevParts[ai2].split('\n').filter(Boolean).slice(0, 25);
        for (var li = 0; li < lines.length; li++) {
          var l = lines[li];
          var m = l.match(/^\s*[\*\-·•]?\s*[（(]?[\d一二三四五六七八九十]+[）)]?[\.、：:\s]*([^\s：:，,。]{2,12})/);
          if (m && m[1] && m[1].length <= 10 && /[\u4e00-\u9fa5]/.test(m[1])) {
            names.push(m[1].replace(/[^\u4e00-\u9fa5]/g, '').slice(0, 6));
          }
        }
        names = names.slice(0, 8);
        anchorText += '【第' + (ai2 + 1) + '批已输出人物】' + (names.length ? names.join('、') : '（请严格以这些人物为核心，后续批次不要再编新的主角/核心配角）') + '\n';
        anchorText += prevParts[ai2].slice(0, 500).trim() + '\n\n';
      }
    } else if (module === 'outline') {
      // 大纲：从前面批次提取卷名+卷主题+覆盖章范围
      for (var ai3 = 0; ai3 < prevParts.length; ai3++) {
        anchorText += '【第' + (ai3 + 1) + '批已输出卷信息】\n' + prevParts[ai3].slice(0, 900).trim() + '\n\n';
      }
    } else {
      // 默认：上一批摘要
      anchorText = '【前一批已生成内容】\n' + prevParts[prevParts.length - 1].slice(0, 800).trim() + '\n';
    }
    p += '\n【⚠️ 必须严格承接的前批锚点 — 所有设定必须与这些内容一致，不得冲突、不得凭空新增主角/势力、不得改写已有设定】\n' + anchorText + '\n';
  }

  // 注入前置模块内容（世界观/人设要完整传递给后续模块）
  if (work) {
    if (module === 'chars' && work.world) {
      p += '【世界观参考（核心背景，人物设定必须在这个世界内合理）】\n' + (work.world.length > 800 ? work.world.slice(0, 800) + '...' : work.world) + '\n\n';
    }
    if (module === 'outline') {
      if (work.world) p += '【世界观（大纲必须严格基于这个世界设定）】\n' + (work.world.length > 700 ? work.world.slice(0, 700) + '...' : work.world) + '\n\n';
      if (work.chars) p += '【人物（大纲必须严格围绕这些人物展开）】\n' + (work.chars.length > 600 ? work.chars.slice(0, 600) + '...' : work.chars) + '\n\n';
    }
    if (module === 'detail') {
      if (work.world) p += '【世界观】\n' + work.world.slice(0, 400) + '\n\n';
      if (work.chars) p += '【人物】\n' + work.chars.slice(0, 350) + '\n\n';
      if (work.outline) p += '【大纲（细纲必须严格按此扩展）】\n' + work.outline.slice(0, 500) + '\n\n';
    }
  }

  // 平台策略
  var pf = getSelectedPlatform();
  var pfConfig = PLATFORM_CONFIG[pf] || PLATFORM_CONFIG.qidian;
  if (module === 'world') {
    p += '【平台策略】' + pfConfig.worldStrategy + '\n';
  } else if (module === 'chars') {
    p += '【平台策略】' + pfConfig.charsStrategy + '\n';
  } else if (module === 'outline') {
    p += '【平台策略】' + pfConfig.outlineStrategy + '\n';
    p += '=== 输出格式要求 ===\n';
    p += '每个卷使用以下格式，卷内分为 5-8 个"阶段"：\n';
    p += '第N卷：《卷名》【覆盖章：第X章—第Y章】\n';
    p += '━━━━━━━━━━━━━━━━━━━━━━\n';
    p += '【卷主题】一句话概括本卷核心冲突和主角目标\n';
    p += '【阶段】\n';
    p += '阶段1 《阶段名》(第X章—第Y章)：\n';
    p += '  · 核心冲突、主要事件(4-6个)、人物成长、爽点设计、毒点自检\n';
    p += '...\n';
  }
  p += getArchIntegrityRule(module);
  p += '\n请直接输出本批内容，不要解释，不要加前言后语，不要输出其他批次的内容。';
  return p;
}

// ========== 单体AI生成（保留原有功能） ==========
// AI生成模块内容（生成到编辑区，可修改后再保存）
var _genLock = false;
function generateArchModule() {
  return _generateArchModule.apply(this, arguments);
} // ========== 覆盖保护（脏标记） ==========
function _generateArchModule() {
  _generateArchModule = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
    var work, ideaArea, typedIdea, idea, countEl, count, genre, plotType, volChecks, overridePerVol, selectedVols, vci, chk, vIdx, ch, prompt, pf, pfConfig, regenBlock, consBlock2, charCtx, poisonList, pi, consBlock3, consB2, charCtx3, poisonList2, pj, consB3, charCtx4, consB4, retryPrompt, retryResult, worldText, worldTextForOutline, charTextForOutline, outlineTextForDetail, rawArea, _t3, _t4;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          if (!_genLock) {
            _context5.n = 1;
            break;
          }
          showToast('正在生成中，请耐心等待...');
          return _context5.a(2);
        case 1:
          _genLock = true;
          _context5.p = 2;
          work = getWork();
          if (work) {
            _context5.n = 3;
            break;
          }
          showToast('无作品');
          _genLock = false;
          return _context5.a(2);
        case 3:
          ideaArea = ideaEl();
          typedIdea = ideaArea && ideaArea.value ? ideaArea.value.trim() : '';
          if (ideaArea) saveModuleIdea(currentArchModule, ideaArea.value || '');
          idea = typedIdea || getModuleIdea(work, currentArchModule) || ''; // 获取数量选择
          countEl = document.getElementById('count-input');
          count = 4;
          if (countEl) {
            count = parseInt(countEl.value) || (currentArchModule === 'outline' ? 4 : 1000);
          }

          // 兼容旧数据：从category或根字段获取题材
          genre = work.genre || work.category && work.category.cat1 || '玄幻';
          plotType = work.plotType || work.category && work.category.cat2 || '崛起流'; // ========== 细纲：按所选卷生成 ==========
          if (!(currentArchModule === 'detail')) {
            _context5.n = 6;
            break;
          }
          volChecks = document.querySelectorAll('.vol-check:checked');
          if (!(volChecks.length === 0)) {
            _context5.n = 4;
            break;
          }
          showToast('请至少勾选一卷', {
            error: true
          });
          _genLock = false;
          return _context5.a(2);
        case 4:
          // 构造 {volIdx, chapters} 列表，优先用各卷 data-ch，其次用全局覆盖
          overridePerVol = parseInt(document.getElementById('ch-per-vol-override') ? document.getElementById('ch-per-vol-override').value : '') || 0;
          selectedVols = [];
          for (vci = 0; vci < volChecks.length; vci++) {
            chk = volChecks[vci];
            vIdx = parseInt(chk.value);
            ch = overridePerVol || parseInt(chk.getAttribute('data-ch')) || 50;
            selectedVols.push({
              idx: vIdx,
              chapters: ch
            });
          }
          _context5.n = 5;
          return generateDetailBySelectedVolumes(work, genre, plotType, selectedVols, idea);
        case 5:
          _genLock = false;
          return _context5.a(2);
        case 6:
          if (!(currentArchModule === 'outline' && count > 12)) {
            _context5.n = 7;
            break;
          }
          showToast('卷数不宜超过12卷，建议4-8卷');
          _genLock = false;
          return _context5.a(2);
        case 7:
          showProgress('AI生成' + (ARCH_MODULE_NAMES[currentArchModule] || '') + '…', 5);

          // 构建prompt
          prompt = ''; // 平台策略（仅作节拍参考，不主导内容方向）
          pf = getSelectedPlatform();
          pfConfig = PLATFORM_CONFIG[pf] || PLATFORM_CONFIG.qidian; // === 核心：以用户构思驱动一切 ===
          regenBlock = buildRegenContinuityBlock(work, currentArchModule);
          if (idea) {
            prompt += '你是专业的网文架构师。\n\n';
            prompt += '【⚠️ 以下用户构思是本次生成的核心驱动力和最高准则，所有内容必须围绕此构思展开，不得偏离，不得用通用模板覆盖用户意图】\n';
            prompt += '————————————————————\n';
            prompt += idea + '\n';
            prompt += '————————————————————\n\n';
            if (regenBlock) prompt += regenBlock + '\n';
            prompt += '【参考资料（仅供辅助，不得取代用户构思的主导地位）】\n';
            prompt += "- \u4F5C\u54C1\u540D\u79F0\uFF1A".concat(work.title, "\n");
            prompt += "- \u9898\u6750\u5927\u7C7B\uFF1A".concat(genre, "\n");
            prompt += "- \u7EC6\u5206\u54C1\u7C7B\uFF1A".concat(plotType, "\n");
            prompt += "- \u76EE\u6807\u5E73\u53F0\uFF1A".concat(pfConfig.label, "\n");

            // === 题材硬约束（防跑题） ===
            prompt += '\n' + getGenreConstraint(genre) + '\n';

            // === 反套路创新引导（v65） ===
            prompt += '\n【💡 反套路与创新指引 — 优秀网文的共同特质】\n';
            prompt += '在满足以上题材硬约束的前提下，请在以下维度追求独特性和创新性：\n';
            prompt += '▸ 避免使用已被写烂的桥段：退婚打脸、废柴逆袭、系统附体、戒指老爷爷、秘境无限套娃等\n';
            prompt += '▸ 人物要有"矛盾感"：真实的性格不是标签集合，而是标签之间的矛盾——一个"善良"的人在极端压力下做了一件残忍的事，比一个始终善良的人更有张力\n';
            prompt += '▸ 冲突要升级为"困境"：单纯的正邪对立过于扁平，好的冲突是双方都有道理、双方都身不由己、双方都在伤害自己最想保护的东西\n';
            prompt += '▸ 设定要有"代价感"：力量的获得必须有不可逆的代价（不仅是痛苦，可以是记忆、关系、人性、可能性），无代价的力量等于无价值的胜利\n';
            prompt += '▸ 规则要有"破绽"：完美的世界观是死的，好的世界观应该留下解释空间、例外和争议——读者争论"这个世界到底是怎么运作的"比"这个世界很清楚"更好\n';
            prompt += '▸ 拒绝"模板化爽点"：坐在台下"倒吸一口凉气"、路人"跪倒一片"、对手"脸色铁青"——这些桥段已被严重透支，用更含蓄的方式表达震撼\n';
            prompt += '▸ 允许角色失败：主角不必每战必胜，一次真正的失败（不是"假失败真扮猪"）比一百次碾压更有戏剧张力\n';

            // === 2026短剧化叙事方法论 ===
            prompt += '\n【🎬 2026网文写作方法论 — 短剧化·钩子·精品化】\n';
            prompt += '当代网文读者注意力的竞争对象已从其他网文扩展到短视频和短剧。请在创作中融入以下新方法论：\n';
            prompt += '▸ 「冲突前置」：不要把冲突藏在中段——第1章必须让读者有"想看下一章"的冲动。首段200字决定90%的留存率\n';
            prompt += '▸ 「信息遮断钩子」：不是每章末尾写"他不知道的是"，而是每给出70%的信息时就主动制造一个认知缺口——读者会为了填上这30%追下去\n';
            prompt += '▸ 「串珠式结构」：将长线大纲拆为一个一个可独立成篇的"珠子"（单元事件），每颗珠子有自己的目标→冲突→解决→钩子→下一颗珠子，珠子之间用伏笔串联而非依赖读者记忆\n';
            prompt += '▸ 「高反转不依赖巧合」：用"人物已掌握的信息差"替代"碰巧撞见"——让角色因为已知信息而主动行动，触发反转的是逻辑推导而非偶然\n';
            prompt += '▸ 「精品化不是灌水」：少即是多——删掉一切不能让读者"爽、哭、笑、思"的文字。一篇8000字的章节如果4000字就能讲清，那就只写4000\n';
            prompt += '▸ 「从为己到为他」：传统爽点是"主角变强碾压别人"（为己），2026年更高级的爽点是"主角的某个选择/牺牲让被忽视的群体受益"（为他）——利他型爽感生命周期更长\n';
            prompt += '▸ 「职业硬核化」：给主角一个具体的、有门槛的职业（法医/文物鉴定/税务稽查/物流调度），硬核的职业细节本身就是信息差和钩子的矿脉\n';
            prompt += '▸ 「日常的重新审视」：不用每章都写大场面——真正的好章节是"日常场景中的微小裂痕"，一个饭桌上没人夹菜的动作比一场大战更悬疑\n';

            // 根据模块，围绕用户构思展开
            if (currentArchModule === 'world') {
              prompt += '\n【平台策略】' + pfConfig.worldStrategy + '\n';
              prompt += '\n【生成任务】以上方用户构思为核心，生成完整的「世界观设定」。\n';
              prompt += '【创新提示】\n';
              prompt += '- 不要默认"强者为王"的丛林法则：可以探索"强大力量如何被规则约束"，"弱者如何用规则限制强者"，或者"力量本身会异化使用者"\n';
              prompt += '- 设定中要有"未解之谜"：至少留下一个至今没人能解释的异常现象，不用在开篇就给出答案\n';
              prompt += '- 如果有力量体系，思考"谁不拥有这种力量？这种力量歧视谁？被排斥的人如何生存？" — 矛盾点自带剧情\n\n';
              prompt += '紧扣用户构思中的时代、背景、规则，补充完善以下方面：\n';
              prompt += '- 时代背景与天下大势\n- 核心地理与场景\n- 世界观底层规则\n- 势力格局\n- 力量/晋升体系\n- 经济基础\n';
            } else if (currentArchModule === 'chars') {
              prompt += '\n【平台策略】' + pfConfig.charsStrategy + '\n';
              prompt += '\n【已建立的世界观】\n' + (work.world || '暂未设定').substring(0, 1200) + '\n';
              // === 前置设定一致性 ===
              consBlock2 = buildConsistencyBlock(work, 'chars');
              if (consBlock2) prompt += '\n' + consBlock2 + '\n';
              prompt += '\n【生成任务】以上方用户构思为核心，生成主角及关键配角人设。\n';
              prompt += '人物必须完全符合上述题材硬约束——人物身份、能力、行为方式、语言风格、价值观必须严格匹配' + (GENRE_CONSTRAINT_MAP[genre] ? GENRE_CONSTRAINT_MAP[genre].label : genre) + '的背景。\n';
              prompt += '【人设深度要求 — v4.0增强版】\n';
              prompt += '禁止用3个标签定义一个人物。每个人都必须是\"有矛盾感的真实人格\"：\n';
              prompt += '▸ 表层性格（他人眼中的形象）+ 深层性格（私下真实的自我）+ 核心矛盾（两种冲动的持续冲突）\n';
              prompt += '▸ 每人必须有的字段：姓名、年龄/年龄段、性别、身份/职业、外貌特征（至少3个具体细节）、表层性格、深层性格、核心矛盾/内在冲突、关键经历（塑造性格的1个决定性事件）、成长弧线（在全书中的变化方向）、口头禅或标志性行为、底线（不可触碰的雷区）、能力等级/专业特长\n';
              prompt += '▸ 配角至少3人：必须有导师型角色、同伴型角色、对立型角色——但每种类型必须有一个\"非典型\"特质（如导师有不可告人的失败、同伴在某些关键时刻不认同主角、对立者有自己的合理性）\n';
              prompt += '▸ 每个角色必须有至少一段\"如果脱离主角会怎样\"的独立人生轨迹——他们不应该是主角的影子\n';
              prompt += '\n【角色创新维度】\n';
              prompt += '- 用"弱点定义角色"而非"优点定义角色"：不是"他是个勇敢的人"，而是"他怕什么，但他还是做了"\n';
              prompt += '- 每个角色至少一个"不可解决的矛盾"：不是可以克服的困难，而是无法消除只能共存的内在冲突（如：一个必须撒谎的诚实者，一个必须杀戮的医者）\n';
              prompt += '- 线索型配角：至少一个配角的用途不是帮助主角，而是作为某个谜题的"活线索"——主角需要从ta的言行中拼凑出关键信息\n\n';
            } else if (currentArchModule === 'outline') {
              if (work.world) {
                prompt += '\n【世界观】\n' + work.world.substring(0, 800);
              }
              if (work.chars) {
                prompt += '\n【人物】\n' + work.chars.substring(0, 600);
              }
              charCtx = buildCharacterContext(work.chars || '');
              if (charCtx.instruction) prompt += charCtx.instruction;
              prompt += '\n\n【平台策略】' + pfConfig.outlineStrategy + '\n';

              // === 毒点避雷清单 ===
              poisonList = getPoisonChecklist(genre);
              prompt += '\n\n【⚠️ 毒点避雷清单 — 以下问题必须在写作中避开】\n';
              for (pi = 0; pi < poisonList.length; pi++) {
                prompt += '❌ ' + poisonList[pi].name + '：' + poisonList[pi].desc + '\n';
              }

              // === 前置设定一致性 ===
              consBlock3 = buildConsistencyBlock(work, 'outline');
              if (consBlock3) prompt += '\n' + consBlock3 + '\n';
              prompt += '\n\n【生成任务】以上方用户构思为核心，生成「全书大纲」（' + count + '卷）。\n\n';
              prompt += '=== 输出格式要求（严格遵守）===\n\n';
              prompt += '每个卷使用以下格式，卷内分为 5-8 个"阶段"，每个阶段覆盖20-50章：\n';
              prompt += '\n';
              prompt += '第N卷：《卷名》【覆盖章：第X章—第Y章】\n';
              prompt += '━━━━━━━━━━━━━━━━━━━━━━\n';
              prompt += '【卷主题】一句话概括本卷核心冲突和主角目标\n';
              prompt += '【阶段】\n';
              prompt += '阶段1 《阶段名》(第X章—第Y章)：\n';
              prompt += '  · 核心冲突：[势力/人物/事件的三方博弈描述]\n';
              prompt += '  · 主要事件：（至少4-6个具体情节节点，每个一行）\n';
              prompt += '    - 谁做了什么事，结果如何\n';
              prompt += '  · 人物成长：[实力/认知/关系各维度的变化]\n';
              prompt += '  · 爽点设计：[具体的高潮桥段描述]\n';
              prompt += '  · 毒点自检：本段是否避开了[对应的1-2个毒点名称]\n';
              prompt += '阶段2 《阶段名》(第X章—第Y章)：\n';
              prompt += '  （同上格式）\n';
              prompt += '...\n';
              prompt += '阶段N（卷末收束）\n';
              prompt += '  · 卷末钩子：[让人迫切想看下一卷的悬念]\n\n';
              prompt += '=== 详细度要求 ===\n';
              prompt += '- 每个阶段至少写 4-6 个具体事件，不能只写一句空泛描述\n';
              prompt += '- 事件描述要有具体的人物动作、地点、结果\n';
              prompt += '- 每卷至少覆盖 5 个阶段（短卷）到 8 个阶段（长卷）\n';
              prompt += '- 卷之间要有递进关系：铺垫→冲突升级→转折→高潮→收束→钩子\n';
              prompt += '- 爽点要具体到桥段，不准写"主角变强了"这种废话，要写"主角以XX方式突破至XX境界，在XX场合震惊众人"\n';
              prompt += '- 毒点自检必须对照上文毒点清单逐一核对\n\n';
              prompt += '【大纲创新提示】\n';
              prompt += '- 在至少一个卷中，不以"主角变强→打败敌人"为主线，而是以"某个谜题/关系/制度的逐渐揭示"为主线\n';
              prompt += '- 设计至少一个"读者会争论"的情节分叉点：某个关键选择让不同读者希望不同的结果\n';
              prompt += '- 大纲中至少安排一次"主角做错事"——不是小失误，而是基于当时信息做了合理但最终证明错误的关键决定\n';
            }
          } else {
            // 无用户构思时的备用方案：以品类模板生成，但重新生成必须承接已有内容
            prompt += '你是一位专业的网文架构师。\n\n';
            if (regenBlock) prompt += regenBlock + '\n';
            prompt += "\u3010\u4F5C\u54C1\u540D\u79F0\u3011".concat(work.title, "\n");
            prompt += "\u3010\u9898\u6750\u3011".concat(genre, " / ").concat(plotType, "\n");
            prompt += "\u3010\u5E73\u53F0\u3011".concat(pfConfig.label, "\n");
            prompt += '⚠️ 用户未提供具体构思，请基于以上题材品类，生成高质量的网文架构内容。\n';
            prompt += '\n【💡 反套路与创新指引 — 优秀网文的共同特质】\n';
            prompt += '▸ 避免使用已被写烂的桥段：退婚打脸、废柴逆袭、系统附体、戒指老爷爷、秘境无限套娃等\n';
            prompt += '▸ 人物要有"矛盾感"：真实的性格不是标签集合，而是标签之间的矛盾\n';
            prompt += '▸ 冲突要升级为"困境"：双方都有道理、双方都身不由己\n';
            prompt += '▸ 设定要有"代价感"：力量的获得必须有不可逆的代价\n';
            prompt += '▸ 世界观规则应留解释空间、例外和争议\n';
            prompt += '▸ 拒绝模板化爽点：用更含蓄的方式表达震撼\n';
            prompt += '▸ 允许角色失败：真正的失败比一百次碾压更有戏剧张力\n';

            // === 2026网文写作方法论（无构思分支同样注入） ===
            prompt += '\n【🎬 2026写作方法论】\n';
            prompt += '▸「冲突前置」首段200字决定90%的留存率\n';
            prompt += '▸「信息遮断钩子」每给出70%信息时主动制造认知缺口\n';
            prompt += '▸「串珠式结构」单元事件独立成篇，伏笔串联\n';
            prompt += '▸「从为己到为他」利他型爽感生命周期更长\n';
            prompt += '▸「职业硬核化」给主角具体有门槛的职业，职业细节是钩子的矿脉\n\n';

            // === 题材硬约束（防跑题） ===
            prompt += getGenreConstraint(genre) + '\n';
            if (currentArchModule === 'world') {
              prompt += '【平台策略】' + pfConfig.worldStrategy + '\n\n';
              prompt += '【生成任务】生成完整的「世界观设定」。包含：时代背景、地理设定、核心规则、势力格局、力量体系、经济基础。\n';
            } else if (currentArchModule === 'chars') {
              prompt += '【平台策略】' + pfConfig.charsStrategy + '\n\n';
              prompt += '【已有世界观】\n' + (work.world || '暂未设定').substring(0, 1200) + '\n';
              // === 前置设定一致性 ===
              consB2 = buildConsistencyBlock(work, 'chars');
              if (consB2) prompt += '\n' + consB2 + '\n';
              prompt += '\n【生成任务】生成主角及关键配角人设。\n';
              prompt += '人物必须完全符合上述题材硬约束——人物身份、能力、行为方式、语言风格、价值观必须严格匹配' + (GENRE_CONSTRAINT_MAP[genre] ? GENRE_CONSTRAINT_MAP[genre].label : genre) + '的背景。\n';
              prompt += '【人设深度要求】禁止用3个标签定义人物。每人必须包含：姓名、年龄、性别、身份、外貌特征（至少3个具体细节）、表层性格、深层性格、核心矛盾、关键经历（1个决定性事件）、成长弧线、口头禅或标志性行为、底线、能力等级。配角至少3人，每种类型必须有非典型特质。\n';
            } else if (currentArchModule === 'outline') {
              if (work.world) {
                prompt += '【世界观】\n' + work.world.substring(0, 800) + '\n';
              }
              if (work.chars) {
                prompt += '【人物】\n' + work.chars.substring(0, 600) + '\n';
              }
              charCtx3 = buildCharacterContext(work.chars || '');
              if (charCtx3.instruction) prompt += charCtx3.instruction + '\n';
              poisonList2 = getPoisonChecklist(genre);
              prompt += '\n【⚠️ 毒点避雷清单】\n';
              for (pj = 0; pj < poisonList2.length; pj++) {
                prompt += '❌ ' + poisonList2[pj].name + '：' + poisonList2[pj].desc + '\n';
              }

              // === 前置设定一致性 ===
              consB3 = buildConsistencyBlock(work, 'outline');
              if (consB3) prompt += '\n' + consB3 + '\n';
              prompt += '\n【生成任务】生成' + count + '卷「全书大纲」。\n';
              prompt += '格式要求：每卷分为5-8个阶段，每章卷覆盖20-50章，每个阶段列出4-6个具体事件。\n';
              prompt += '包含卷主题、核心冲突、主要事件、人物成长、爽点设计、卷末钩子。\n';
              prompt += '毒点自检：每阶段标注避开了哪些毒点。\n';
            } else if (currentArchModule === 'detail') {
              if (work.world) {
                prompt += '【世界观】\n' + work.world.substring(0, 500) + '\n';
              }
              if (work.chars) {
                prompt += '【人物】\n' + work.chars.substring(0, 400) + '\n';
              }
              if (work.outline) {
                prompt += '【大纲】\n' + work.outline.substring(0, 600) + '\n';
              }
              charCtx4 = buildCharacterContext(work.chars || '');
              if (charCtx4.instruction) prompt += charCtx4.instruction + '\n';
              // === 前置设定一致性 ===
              consB4 = buildConsistencyBlock(work, 'detail');
              if (consB4) prompt += '\n' + consB4 + '\n';
              prompt += '\n【生成任务】生成' + count + '章「执行级章节细纲」。\n';
              prompt += getDetailBlueprintRule(genre, pfConfig) + '\n';
            }
          }
          prompt += getArchIntegrityRule(currentArchModule);
          prompt += '\n请直接输出内容，不要解释，不要加前言后语。';
          updateProgress(10, '开始生成' + (ARCH_MODULE_NAMES[currentArchModule] || '') + '…');

          // v65: 世界观/人设/大纲使用分批生成，避免后半段缺失
          if (!(currentArchModule === 'world' || currentArchModule === 'chars' || currentArchModule === 'outline')) {
            _context5.n = 9;
            break;
          }
          _context5.n = 8;
          return generateArchModuleInBatches(currentArchModule, prompt, work, idea, genre, plotType, count);
        case 8:
          result = _context5.v;
          _context5.n = 14;
          break;
        case 9:
          _context5.n = 10;
          return callRealAPIWithFallback(prompt, null, mapModuleToTaskType(currentArchModule));
        case 10:
          result = _context5.v;
          if (!(result && isFragmentArchResult(currentArchModule, result, idea))) {
            _context5.n = 12;
            break;
          }
          showToast('检测到生成结果像半截内容，正在自动重写一次…', 3000);
          retryPrompt = buildIntegrityRetryPrompt(prompt, currentArchModule, result, idea);
          _context5.n = 11;
          return callRealAPIWithFallback(retryPrompt, null, 'fill');
        case 11:
          retryResult = _context5.v;
          if (retryResult && !isFragmentArchResult(currentArchModule, retryResult, idea)) result = retryResult;else result = localRepairFragmentArchResult(currentArchModule, retryResult || result, idea, work);
        case 12:
          if (!result) {
            _context5.n = 14;
            break;
          }
          _context5.n = 13;
          return continueTruncatedArchResult(currentArchModule, result, work, idea, prompt);
        case 13:
          result = _context5.v;
        case 14:
          if (!(!result && window.ContentGenerator)) {
            _context5.n = 19;
            break;
          }
          showToast('使用本地AI生成...');
          _t3 = currentArchModule;
          _context5.n = _t3 === 'world' ? 15 : _t3 === 'chars' ? 16 : _t3 === 'outline' ? 17 : _t3 === 'detail' ? 18 : 19;
          break;
        case 15:
          result = window.ContentGenerator.generateWorld(genre, idea, plotType);
          if (result && result._worldObj) {
            work._worldObj = result._worldObj;
          }
          return _context5.a(3, 19);
        case 16:
          worldText = work.world || '';
          result = window.ContentGenerator.generateCharacter(worldText, genre, work.title, idea);
          if (result && result._chars) {
            work._chars = result._chars;
          }
          if (result && result._worldObj) {
            work._worldObj = result._worldObj;
          }
          return _context5.a(3, 19);
        case 17:
          worldTextForOutline = work.world || '';
          charTextForOutline = work.chars || '';
          result = window.ContentGenerator.generateOutline(worldTextForOutline, charTextForOutline, genre, plotType, count);
          if (result && result._outlineData) {
            work._outlineData = result._outlineData;
          }
          if (result && result._chars) {
            work._chars = result._chars;
          }
          if (result && result._worldObj) {
            work._worldObj = result._worldObj;
          }
          return _context5.a(3, 19);
        case 18:
          // BUG-03 fix: 字符串无法赋属性，改用对象传递
          outlineTextForDetail = {
            text: work.outline || ''
          };
          if (work._worldObj) {
            outlineTextForDetail._worldObj = work._worldObj;
          }
          if (work._chars) {
            outlineTextForDetail._chars = work._chars;
          }
          if (work._outlineData) {
            outlineTextForDetail._outlineData = work._outlineData;
          }
          result = window.ContentGenerator.generateDetail(outlineTextForDetail, 1, count, genre);
          return _context5.a(3, 19);
        case 19:
          if (currentArchModule !== 'detail') hideProgress();else hideLoading();
          if (!result) {
            _context5.n = 21;
            break;
          }
          if (isFragmentArchResult(currentArchModule, result, idea)) {
            result = localRepairFragmentArchResult(currentArchModule, result, idea, work);
          }
          _context5.n = 20;
          return continueTruncatedArchResult(currentArchModule, result, work, idea, prompt);
        case 20:
          result = _context5.v;
          // 保存到work（纯文本，供AI写作使用）
          if (currentArchModule === 'detail') {
            result = finishDetailOutlineForWork(work, result, 1);
          }
          // 写入文本编辑区：必须写入最终规范化结果，防止显示断裂/半截版本
          rawArea = rawEditArea();
          if (rawArea) {
            rawArea.dataset.fullText = result;
            _archFullTextV52[currentArchModule] = result;
            rawArea.style.display = 'block';
            if (currentArchModule !== 'detail') renderArchDisplayPageV52(currentArchModule, true);else {
              rawArea.value = result;
              autoGrowArchTextarea(rawArea);
            }
            rawArea.style.marginTop = '0';
            rawArea.style.borderTop = 'none';
            rawArea.style.paddingTop = '0';
          }
          work[currentArchModule] = result;
          // 尝试解析为结构化卡片数据（内部使用，不展示给用户）
          try {
            parseResultToCardData(work, currentArchModule, result);
          } catch (pe) {/* 解析失败不影响主流程 */}
          saveWork(work);
          // 大纲/细纲生成后，提取新角色回流到人物卡
          if (currentArchModule === 'outline' || currentArchModule === 'detail') {
            syncCharactersFromText(work, result);
          }
          // 刷新预览
          clearDirty(currentArchModule);
          renderArchModule();
          showToast(currentArchModule === 'detail' && work._detailQuality ? '细纲生成完成，执行力评分 ' + work._detailQuality.score + '/100，已同步章节卡' : '生成完成！可在下方编辑后保存');
          // BUG-13 fix: _genLock 由 finally 统一释放，此处不再冗余赋值
          _context5.n = 22;
          break;
        case 21:
          showToast('生成失败，请检查API配置');
        case 22:
          _context5.n = 24;
          break;
        case 23:
          _context5.p = 23;
          _t4 = _context5.v;
          // BUG-08 fix: 捕获未预期异常，避免卡在"生成中"状态
          hideProgress();
          console.error('生成异常', _t4);
          showToast('生成出错：' + (_t4 && _t4.message ? _t4.message : '未知错误'), {
            error: true
          });
        case 24:
          _context5.p = 24;
          _genLock = false;
          return _context5.f(24);
        case 25:
          return _context5.a(2);
      }
    }, _callee5, null, [[2, 23, 24, 25]]);
  }));
  return _generateArchModule.apply(this, arguments);
}
var _moduleDirty = {}; // { world: true, chars: true, ... }
var charEditIndex = 0; // 人物编辑索引
var _detailPage = {
  idx: 0,
  size: 100
}; // 细纲分页
var _archAutoSaveTimer = null; // 架构页自动保存计时器

// 架构页自动保存（防抖2秒）
function _archAutoSave() {
  if (_archAutoSaveTimer) clearTimeout(_archAutoSaveTimer);
  _archAutoSaveTimer = setTimeout(function () {
    var work = getWork();
    if (!work) return;
    // BUG-04 fix: 分页模式下 area.value 只是当前页，必须先同步到完整文本再保存
    if (currentArchModule !== 'detail' && typeof syncCurrentDisplayPageToFullV52 === 'function') {
      syncCurrentDisplayPageToFullV52(currentArchModule);
    }
    if (currentArchModule !== 'detail' && typeof getArchFullTextV52 === 'function') {
      work[currentArchModule] = getArchFullTextV52(currentArchModule);
    } else {
      var area = rawAreaEl();
      if (!area) return;
      work[currentArchModule] = area.value;
    }
    try {
      DB.saveWork(work);
    } catch (e) {}
  }, 2000);
}
function markDirty(module) {
  _moduleDirty[module || currentArchModule] = true;
}
function clearDirty(module) {
  _moduleDirty[module || currentArchModule] = false;
}

// 监听所有textarea的输入事件
function bindDirtyTracking() {
  var allAreas = document.querySelectorAll('.module-page textarea[id^="raw-"]');
  allAreas.forEach(function (ta) {
    if (ta.dataset.dirtyBound) return;
    ta.dataset.dirtyBound = '1';
    ta.addEventListener('input', function () {
      _moduleDirty[currentArchModule] = true;
      _archAutoSave();
    });
  });
  // 也监听 .edit-area 类的元素
  document.querySelectorAll('.edit-area').forEach(function (ta) {
    if (ta.dataset.dirtyBound) return;
    ta.dataset.dirtyBound = '1';
    ta.addEventListener('input', function () {
      _moduleDirty[currentArchModule] = true;
      _archAutoSave();
    });
  });
}

// 细纲分页渲染
function renderDetailPaginated(work, rawArea) {
  if (!rawArea) return;
  var detail = work.detail || '';
  if (!detail.trim()) {
    rawArea.value = '';
    return;
  }
  var lines = detail.split('\n');
  // 切卷分隔
  var volSections = [];
  var currentVol = {
    title: '',
    lines: []
  };
  for (var li = 0; li < lines.length; li++) {
    var line = lines[li];
    if (/^=== 第[一二三四五六七八九十\d]+卷/.test(line)) {
      if (currentVol.lines.length > 0) volSections.push(currentVol);
      currentVol = {
        title: line,
        lines: []
      };
    } else {
      currentVol.lines.push(line);
    }
  }
  if (currentVol.lines.length > 0) volSections.push(currentVol);

  // 如果没有卷分隔，所有行作为一个虚拟卷
  if (volSections.length === 0 && lines.length > 0) {
    volSections = [{
      title: '',
      lines: lines
    }];
  }

  // 按100章分页
  var totalChapters = 0;
  var pageStart = _detailPage.idx * _detailPage.size;
  var displayLines = [];
  var chapterCount = 0;
  var inRange = false;
  for (var vi = 0; vi < volSections.length; vi++) {
    var vs = volSections[vi];
    for (var li2 = 0; li2 < vs.lines.length; li2++) {
      var l = vs.lines[li2];
      if (/^第[一二三四五六七八九十\d百千]+章/.test(l.trim())) {
        chapterCount++;
        if (chapterCount > pageStart && chapterCount <= pageStart + _detailPage.size) {
          if (!inRange && vs.title) displayLines.push(vs.title);
          displayLines.push(l);
          inRange = true;
        } else {
          inRange = false;
        }
      } else if (inRange) {
        displayLines.push(l);
      }
    }
  }
  var totalPages = Math.ceil(chapterCount / _detailPage.size) || 1;
  var curPage = _detailPage.idx + 1;

  // 头部：翻页控制
  var header = '=== 📖 细纲分页显示 | 第 ' + curPage + '/' + totalPages + ' 页 | 共 ' + chapterCount + ' 章 ===\n';
  header += '[←上一页] [下一页→]  点击底部按钮翻页\n\n';
  rawArea.value = header + displayLines.join('\n');
  autoGrowArchTextarea(rawArea);

  // 更新翻页按钮
  updateDetailPagerButtons(curPage, totalPages, chapterCount);
}
function updateDetailPagerButtons(curPage, totalPages, totalChapters) {
  var wrap = document.getElementById('detail-pager');
  if (!wrap) return;
  wrap.style.display = 'flex';
  var prevBtn = document.getElementById('detail-pager-prev');
  var nextBtn = document.getElementById('detail-pager-next');
  var infoEl = document.getElementById('detail-pager-info');
  if (prevBtn) {
    prevBtn.disabled = curPage <= 1;
    prevBtn.style.opacity = curPage <= 1 ? '0.4' : '1';
  }
  if (nextBtn) {
    nextBtn.disabled = curPage >= totalPages;
    nextBtn.style.opacity = curPage >= totalPages ? '0.4' : '1';
  }
  if (infoEl) infoEl.textContent = '第 ' + curPage + '/' + totalPages + ' 页 · 共 ' + totalChapters + ' 章';
}
function detailPrevPage() {
  if (_detailPage.idx > 0) {
    _detailPage.idx--;
    renderDetailPaginated(getWork(), rawAreaEl());
  }
}
function detailNextPage() {
  var work = getWork();
  if (!work) return;
  var detail = work.detail || '';
  var chCount = (detail.match(/^第[一二三四五六七八九十\d百千]+章/gm) || []).length;
  if (_detailPage.idx < Math.ceil(chCount / _detailPage.size) - 1) {
    _detailPage.idx++;
    renderDetailPaginated(work, rawAreaEl());
  }
}
window.detailPrevPage = detailPrevPage;
window.detailNextPage = detailNextPage;
var _bgMode = false; // 后台生成标志
var _cancelGeneration = false; // 生成取消标志

// 让出主线程 + 强制重绘
var _rafId = 0;
function _sleep(ms) {
  return new Promise(function (r) {
    var delay = ms || 50; // 至少50ms，确保浏览器重绘
    // 先 requestAnimationFrame 确保当前帧已渲染
    cancelAnimationFrame(_rafId);
    _rafId = requestAnimationFrame(function () {
      setTimeout(r, delay);
    });
  });
}
function showDetailLoading(title) {
  var wrap = progEl();
  if (!wrap) return;
  wrap.style.display = 'block';
  var t = progTitle();
  if (t) t.textContent = title || '准备生成...';
  var b = progBar();
  if (b) {
    b.style.width = '0%';
    b.classList.remove('working');
  }
  var d = progDetail();
  if (d) d.textContent = '';
  var p = progPct();
  if (p) p.textContent = '0%';
  var c = progCancel();
  if (c) {
    c.style.display = 'inline-block';
    c.textContent = '✕ 取消';
    c.disabled = false;
    c.style.opacity = '1';
  }
  var bg = document.getElementById('prog-bg-btn');
  if (bg) bg.style.display = 'inline-block';
  var ind = document.getElementById('bg-gen-indicator');
  if (ind) ind.style.display = 'none';
  // 重置后台指示器内容
  var ib = document.getElementById('bg-gen-bar');
  if (ib) ib.style.width = '0%';
  var it = document.getElementById('bg-gen-task');
  if (it) it.textContent = '准备中...';
  var itl = document.getElementById('bg-gen-title');
  if (itl) itl.textContent = title || 'AI 后台生成中';
  _bgMode = false;
}
function updateDetailLoading(title, pct, info) {
  if (_bgMode) {
    var ip = document.getElementById('bg-gen-pct');
    var ib = document.getElementById('bg-gen-bar');
    var it = document.getElementById('bg-gen-task');
    var itl = document.getElementById('bg-gen-title');
    if (ip && pct !== undefined) ip.textContent = Math.round(pct) + '%';
    if (ib && pct !== undefined) ib.style.width = Math.min(100, Math.max(0, pct)) + '%';
    if (it && info) it.textContent = info;
    if (itl && title) itl.textContent = title;
    return;
  }
  var t = progTitle();
  if (t && title) t.textContent = title;
  var b = progBar();
  if (b && pct !== undefined) {
    b.style.width = Math.min(100, Math.max(0, pct)) + '%';
    // 如果不是100%且不是0%，加shimmer表示正在工作中
    if (pct > 0 && pct < 100) b.classList.add('working');else b.classList.remove('working');
  }
  var d = progDetail();
  if (d && info) d.textContent = info;
  var p = progPct();
  if (p && pct !== undefined) p.textContent = Math.round(pct) + '%';
}
function hideDetailLoading() {
  var wrap = progEl();
  if (wrap) {
    wrap.style.display = 'none';
  }
  var b = progBar();
  if (b) b.classList.remove('working');
  var ind = document.getElementById('bg-gen-indicator');
  if (ind) ind.style.display = 'none';
  _bgMode = false;
}

// 切换到后台生成
function switchToBackgroundGen() {
  _bgMode = true;
  var wrap = progEl();
  if (wrap) wrap.style.display = 'none';
  var pp = document.getElementById('pipeline-panel');
  if (pp) pp.style.display = 'none';
  var ind = document.getElementById('bg-gen-indicator');
  if (ind) ind.style.display = 'block';
  showToast('已切换到后台生成，可自由操作');
}
window.switchToBackgroundGen = switchToBackgroundGen;

// 切回前台
function switchToFrontGen() {
  _bgMode = false;
  var ind = document.getElementById('bg-gen-indicator');
  if (ind) ind.style.display = 'none';
  // 恢复进度条或管线面板
  var pp = document.getElementById('pipeline-panel');
  if (pp && pp.dataset.active === '1') {
    pp.style.display = 'block';
  } else {
    var wrap = progEl();
    if (wrap) wrap.style.display = 'block';
  }
  switchArchModule('detail');
}
window.switchToFrontGen = switchToFrontGen;

// 兼容旧调用
function showProgress(text, pct, detail) {
  showDetailLoading(text);
  updateDetailLoading(text, pct, detail);
}
function hideProgress() {
  hideDetailLoading();
}
function cancelGeneration() {
  _cancelGeneration = true;
  if (_bgMode) {
    var it = document.getElementById('bg-gen-task');
    var itl = document.getElementById('bg-gen-title');
    if (itl) itl.textContent = '正在取消...';
    if (it) it.textContent = '正在停止生成';
  } else {
    updateDetailLoading('⏹ 正在取消...', 0, '正在停止生成，请稍候');
  }
  var btn = progCancel();
  if (btn) {
    btn.textContent = '取消中...';
    btn.disabled = true;
    btn.style.opacity = '0.5';
  }
}

// ========== 细纲：按所选卷逐卷生成（全局进度条+后台模式+断点保存） ==========
function generateDetailBySelectedVolumes(_x11, _x12, _x13, _x14, _x15) {
  return _generateDetailBySelectedVolumes.apply(this, arguments);
} // ========== 断点保存/恢复 ==========
function _generateDetailBySelectedVolumes() {
  _generateDetailBySelectedVolumes = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(work, genre, plotType, selectedVols, idea) {
    var existingDetailBeforeGen, allVolumes, volNameMap, ai, totalVols, allResults, totalChapters, totalEstCh, si, vObj, vi, ind, vObj2, volInfo, volName, volDesc, chPerVol, startCh, endCh, progressPct, prePct, volResult, subBatches, subResults, sb, subStart, subEnd, subCount, subProgress, subResult, donePct, wasBg, b, finalText;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.n) {
        case 0:
          _cancelGeneration = false;
          _bgMode = false;
          _genLock = true;
          window._wxbj_genActive = true;

          // BUG-01 fix: 保存已有细纲，用于部分卷重新生成时合并
          existingDetailBeforeGen = work.detail || ''; // 获取卷信息
          allVolumes = extractVolumeInfo(work);
          volNameMap = {};
          if (allVolumes.length > 0) {
            for (ai = 0; ai < allVolumes.length; ai++) {
              volNameMap[allVolumes[ai].idx] = allVolumes[ai];
            }
          } else if (volNameMap) {
            volNameMap = {};
          }
          totalVols = selectedVols.length;
          allResults = [];
          totalChapters = 0;
          totalEstCh = 0;
          for (si = 0; si < totalVols; si++) {
            vObj = selectedVols[si];
            if (!volNameMap[vObj.idx]) {
              volNameMap[vObj.idx] = {
                idx: vObj.idx,
                name: '第' + vObj.idx + '卷',
                desc: '',
                chapters: vObj.chapters
              };
            }
            totalEstCh += vObj.chapters;
          }

          // === 显示全局进度条 ===
          showDetailLoading('准备生成 ' + totalVols + ' 卷细纲...');
          updateDetailLoading('⏳ 准备中', 0, '共 ' + totalVols + ' 卷 · 约 ' + totalEstCh + ' 章 | 可点击「后台」自由操作');
          _context6.n = 1;
          return _sleep(0);
        case 1:
          vi = 0;
        case 2:
          if (!(vi < totalVols)) {
            _context6.n = 16;
            break;
          }
          if (!_cancelGeneration) {
            _context6.n = 3;
            break;
          }
          if (_bgMode) {
            ind = document.getElementById('bg-gen-indicator');
            if (ind) ind.textContent = '⏹ 已取消 (' + vi + '/' + totalVols + ' 卷已保留)';
          } else {
            updateDetailLoading('⏹ 已取消', 0, '已生成 ' + vi + '/' + totalVols + ' 卷，结果已保留');
          }
          setTimeout(function () {
            hideDetailLoading();
          }, 2500);
          _genLock = false;
          _cancelGeneration = false;
          window._wxbj_genActive = false;
          if (allResults.length > 0) {
            savePartialResult(work, allResults);
            clearGenCheckpoint(work);
            showToast('已取消，保留了 ' + vi + ' 卷结果');
          }
          return _context6.a(2);
        case 3:
          vObj2 = selectedVols[vi];
          volInfo = volNameMap[vObj2.idx];
          volName = volInfo.name;
          volDesc = volInfo.desc || '';
          chPerVol = vObj2.chapters;
          startCh = getVolumeStartChapterByIdx(allVolumes, vObj2.idx);
          endCh = startCh + chPerVol - 1;
          progressPct = vi / totalVols * 100; // 预增2%让用户看到进度条立即有反应
          prePct = progressPct + Math.min(2, 99 - progressPct);
          updateDetailLoading(progressPct === 0 ? '⏳ 开始生成 ' + volName : '正在生成 ' + volName, prePct, '第 ' + (vi + 1) + '/' + totalVols + ' 卷 | ' + startCh + '-' + endCh + ' 章（' + chPerVol + '章）| 多AI协作中...');
          _context6.n = 4;
          return _sleep(0);
        case 4:
          // 按模型输出容量动态决定每批章节数
          // 大模型(>=10000): 每批40章; 中模型(4000-10000): 每批25章; 小模型(<4000): 每批15章
          var detailCap = 6000;
          try {
            if (typeof window.getModelOutputCapacity === 'function') detailCap = window.getModelOutputCapacity();
            else if (typeof getModelOutputCapacity === 'function') detailCap = getModelOutputCapacity();
          } catch (e) {}
          var chapterBatchSize;
          if (detailCap >= 10000) chapterBatchSize = 40;else if (detailCap >= 4000) chapterBatchSize = 25;else chapterBatchSize = 15;

          if (!(chPerVol > chapterBatchSize)) {
            _context6.n = 11;
            break;
          }
          subBatches = Math.ceil(chPerVol / chapterBatchSize);
          subResults = [];
          sb = 0;
        case 5:
          if (!(sb < subBatches)) {
            _context6.n = 10;
            break;
          }
          if (!_cancelGeneration) {
            _context6.n = 6;
            break;
          }
          return _context6.a(3, 10);
        case 6:
          subStart = startCh + sb * chapterBatchSize;
          subEnd = Math.min(subStart + chapterBatchSize - 1, endCh);
          subCount = subEnd - subStart + 1;
          subProgress = progressPct + sb / subBatches / totalVols * 100;
          updateDetailLoading('正在生成 ' + volName + ' (' + subStart + '-' + subEnd + '章)', subProgress, '第 ' + (vi + 1) + '/' + totalVols + ' 卷 | 子批次 ' + (sb + 1) + '/' + subBatches + '（模型容量' + detailCap + '字）');
          _context6.n = 7;
          return _sleep(0);
        case 7:
          _context6.n = 8;
          return generateOneVolumeChapters(work, genre, plotType, volName, volDesc, subStart, subEnd, subCount, idea);
        case 8:
          subResult = _context6.v;
          if (subResult) subResults.push(subResult);
        case 9:
          sb++;
          _context6.n = 5;
          break;
        case 10:
          volResult = subResults.length > 0 ? subResults.join('\n\n') : null;
          _context6.n = 14;
          break;
        case 11:
          if (!_cancelGeneration) {
            _context6.n = 12;
            break;
          }
          return _context6.a(3, 15);
        case 12:
          _context6.n = 13;
          return generateOneVolumeChapters(work, genre, plotType, volName, volDesc, startCh, endCh, chPerVol, idea);
        case 13:
          volResult = _context6.v;
        case 14:
          if (volResult && !_cancelGeneration) {
            allResults.push('=== ' + volName + ' ===\n' + volResult);
          }
          totalChapters += chPerVol;

          // 每卷完成后保存 checkpoint
          savePartialResult(work, allResults);
          saveGenCheckpoint(work, selectedVols, allResults, totalChapters, vi + 1);
          donePct = (vi + 1) / totalVols * 100;
          updateDetailLoading('✅ ' + volName + ' 完成', donePct, '已完成 ' + (vi + 1) + '/' + totalVols + ' 卷，共 ' + totalChapters + ' 章');
          _context6.n = 15;
          return _sleep(0);
        case 15:
          vi++;
          _context6.n = 2;
          break;
        case 16:
          // === 最终完成 ===
          wasBg = _bgMode;
          if (_cancelGeneration) {
            _context6.n = 18;
            break;
          }
          updateDetailLoading('✅ 细纲生成完成', 100, totalVols + ' 卷共 ' + totalChapters + ' 章');
          b = progBar();
          if (b) b.classList.remove('working');
          _context6.n = 17;
          return _sleep(0);
        case 17:
          setTimeout(function () {
            hideDetailLoading();
          }, 2000);
        case 18:
          window._wxbj_genActive = false;
          _genLock = false;
          _cancelGeneration = false;
          _bgMode = false;
          clearGenCheckpoint(work);
          if (allResults.length > 0) {
            // 先写入编辑区
            finalText = allResults.join('\n\n');
            finalText = finishDetailOutlineForWork(work, finalText, 1);
            if (existingDetailBeforeGen && selectedVols.length < allVolumes.length) {
              finalText = mergeDetailBySelectedVolumes(existingDetailBeforeGen, finalText, selectedVols);
              finalText = finishDetailOutlineForWork(work, finalText, 1);
            }
            work[currentArchModule] = finalText;
            saveWork(work);
            clearDirty(currentArchModule);
            renderArchModule();
            if (wasBg) {
              // 后台完成：切换到细纲页并通知
              switchArchModule('detail');
              showToast('🎉 后台生成完成！' + totalVols + '卷共' + totalChapters + '章已写入细纲', {
                duration: 5000
              });
            } else {
              showToast('✅ 细纲已生成：' + totalVols + '卷共' + totalChapters + '章');
            }
          } else {
            showToast('生成失败，请检查API配置', {
              error: true
            });
          }
        case 19:
          return _context6.a(2);
      }
    }, _callee6);
  }));
  return _generateDetailBySelectedVolumes.apply(this, arguments);
}
function saveGenCheckpoint(work, selectedVols, allResults, totalChapters, currentVolIdx) {
  if (!work) return;
  work._genCheckpoint = {
    module: 'detail',
    selectedVols: selectedVols,
    allResults: allResults,
    totalChapters: totalChapters,
    currentVolIdx: currentVolIdx,
    totalVols: selectedVols.length,
    timestamp: Date.now()
  };
  saveWork(work);
}
function clearGenCheckpoint(work) {
  if (!work) return;
  delete work._genCheckpoint;
  saveWork(work);
}

// 检查是否有未完成的生成任务
function checkGenResume() {
  var work = getWork();
  if (!work || !work._genCheckpoint) {
    return;
  } // 静默返回，不弹提示
  var cp = work._genCheckpoint;
  if (cp.module !== 'detail') return;
  if (cp.currentVolIdx >= cp.totalVols) {
    clearGenCheckpoint(work);
    return;
  }

  // 显示恢复提示
  showToast('📋 检测到上次未完成的细纲生成（已完成 ' + cp.currentVolIdx + '/' + cp.totalVols + ' 卷），切换到细纲页继续', {
    duration: 5000
  });

  // 自动切换到细纲页
  setTimeout(function () {
    switchArchModule('detail');
  }, 800);
}
// BUG-11 fix: 暴露到全局
window.checkGenResume = checkGenResume;

// 保存已生成的部分结果
function savePartialResult(work, allResults) {
  var fullResult = allResults.join('\n\n\n');
  var rawArea = rawEditArea();
  if (rawArea) {
    rawArea.value = fullResult;
    autoGrowArchTextarea(rawArea);
    rawArea.style.display = 'block';
    rawArea.style.marginTop = '0';
    rawArea.style.borderTop = 'none';
    rawArea.style.paddingTop = '0';
  }
  if (currentArchModule === 'detail' && fullResult) {
    fullResult = finishDetailOutlineForWork(work, fullResult, 1);
  }
  work[currentArchModule] = fullResult;
  saveWork(work);
  // 提取细纲中的新角色，回流到人物卡
  syncCharactersFromText(work, fullResult);
}

// 从大纲卡或文本中提取卷信息（含每卷预估章数）
// 核心原则：大纲文本是卷数的权威来源，卡片数据只提供补充标签
function extractVolumeInfo(work) {
  var volumes = [];
  var seenIdxs = {};
  var outline = work.outline || '';

  // === 解析单行中的卷标题（支持多种格式）===
  function parseVolLine(line) {
    // 格式1: 第X卷（名称）：描述 或 第一卷（名称）：描述
    var m1 = line.match(/[-\s]*第([一二三四五六七八九十\d]+)卷[（(]([^)）]+)[)）][：:]\s*(.*)/);
    if (m1) return {
      idx: parseCnNum(m1[1]),
      name: '第' + parseCnNum(m1[1]) + '卷（' + m1[2] + '）',
      desc: m1[3]
    };
    // 格式2: 第X卷《标题》 或 第X卷 名称
    var m2 = line.match(/[-\s]*第([一二三四五六七八九十\d]+)卷[《\s]*([^》\n]{1,12})[》]?/);
    if (m2) return {
      idx: parseCnNum(m2[1]),
      name: '第' + parseCnNum(m2[1]) + '卷' + (m2[2] ? '（' + m2[2] + '）' : ''),
      desc: line.trim()
    };
    return null;
  }
  var cnNumMap = {
    '一': 1,
    '二': 2,
    '三': 3,
    '四': 4,
    '五': 5,
    '六': 6,
    '七': 7,
    '八': 8,
    '九': 9,
    '十': 10
  };
  function parseCnNum(s) {
    s = String(s);
    if (/^\d+$/.test(s)) return parseInt(s);
    // "十X" 格式：十五→15, 十三→13
    if (s.length === 2 && s[0] === '十') return 10 + (cnNumMap[s[1]] || 0);
    // "X十" 格式：二十→20, 三十→30
    if (s.length === 2 && s[1] === '十') return (cnNumMap[s[0]] || 0) * 10;
    // "X十Y" 格式：二十三→23, 三十五→35
    if (s.length === 3 && s[1] === '十') return (cnNumMap[s[0]] || 0) * 10 + (cnNumMap[s[2]] || 0);
    var n = 0;
    for (var ci = 0; ci < s.length; ci++) n = n * 10 + (cnNumMap[s[ci]] || 0);
    if (n === 0 && s === '十') n = 10;
    return n;
  }

  // === 策略A：从大纲文本逐行解析 + 多行积累描述 ===
  if (outline && outline.length > 5) {
    var lines = outline.split('\n');
    var currentVol = null;
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li].trim();
      if (!line || line === '---' || line === '【大纲卡】') continue;
      var parsed = parseVolLine(line);
      if (parsed) {
        if (currentVol && !seenIdxs[currentVol.idx]) {
          currentVol.chapters = estimateVolumeChapters(currentVol.desc, work);
          volumes.push(currentVol);
          seenIdxs[currentVol.idx] = true;
        }
        currentVol = {
          idx: parsed.idx,
          name: parsed.name,
          desc: parsed.desc
        };
      } else if (currentVol && line.length > 3) {
        // 属于当前卷的描述行
        currentVol.desc += '\n' + line;
      }
    }
    // 最后一条
    if (currentVol && !seenIdxs[currentVol.idx]) {
      currentVol.chapters = estimateVolumeChapters(currentVol.desc, work);
      volumes.push(currentVol);
      seenIdxs[currentVol.idx] = true;
    }
  }

  // === 策略B：如果文本没解析到卷，尝试正则全文匹配 ===
  if (volumes.length === 0 && outline) {
    var volPattern = /(?:^|\n)\s*第[一二三四五六七八九十\d]+卷[^\n]*/g;
    var volHeaders = [];
    var match;
    while ((match = volPattern.exec(outline)) !== null) {
      volHeaders.push({
        header: match[0].trim(),
        pos: match.index,
        endPos: match.index + match[0].length
      });
    }
    if (volHeaders.length > 0) {
      for (var hi = 0; hi < volHeaders.length; hi++) {
        var h = volHeaders[hi];
        var nextPos = hi + 1 < volHeaders.length ? volHeaders[hi + 1].pos : outline.length;
        var desc = outline.substring(h.endPos, nextPos).trim();
        desc = h.header + '\n' + desc;
        var parsed = parseVolLine(h.header);
        var volName = parsed ? parsed.name : h.header.replace(/[:：\s]+.*$/, '').trim();
        var labelMatch = h.header.match(/[（(]([^)）]{2,6})[)）]/);
        if (labelMatch) volName = volName + '（' + labelMatch[1] + '）';
        volumes.push({
          idx: hi + 1,
          name: volName,
          desc: desc,
          chapters: estimateVolumeChapters(desc, work)
        });
      }
    }
  }

  // === 策略C：卡片数据补充（合并标签，补充缺失卷） ===
  if (work._cardData && work._cardData.outline) {
    var od = work._cardData.outline;
    var cardVols = parseInt(od.volumes) || 0;
    for (var ci2 = 0; ci2 < cardVols; ci2++) {
      var cardDesc = od['vol' + ci2] || '';
      if (!cardDesc || cardDesc.length < 2) continue;
      var found = false;
      for (var fi = 0; fi < volumes.length; fi++) {
        if (volumes[fi].idx === ci2 + 1) {
          if (volumes[fi].name.indexOf('（') === -1 && cardDesc.length <= 6) {
            volumes[fi].name = volumes[fi].name + '（' + cardDesc + '）';
          }
          if (!volumes[fi].desc || volumes[fi].desc.length < 8) {
            volumes[fi].desc = '第' + (ci2 + 1) + '卷（' + cardDesc + '）';
          }
          found = true;
          break;
        }
      }
      if (!found) {
        volumes.push({
          idx: ci2 + 1,
          name: '第' + (ci2 + 1) + '卷' + (cardDesc.length <= 6 ? '（' + cardDesc + '）' : ''),
          desc: '第' + (ci2 + 1) + '卷（' + cardDesc + '）',
          chapters: estimateVolumeChapters('第' + (ci2 + 1) + '卷（' + cardDesc + '）', work)
        });
      }
    }
  }

  // === 兜底 ===
  if (volumes.length === 0) {
    var pfConf = PLATFORM_CONFIG[getSelectedPlatform()] || PLATFORM_CONFIG.qidian;
    var defVols = pfConf.defaultVolumes || 6;
    for (var di = 0; di < defVols; di++) {
      volumes.push({
        idx: di + 1,
        name: '第' + (di + 1) + '卷',
        desc: '',
        chapters: Math.round(pfConf.chaptersPerVol / defVols)
      });
    }
  }

  // 重新估算章数
  for (var ri = 0; ri < volumes.length; ri++) {
    volumes[ri].chapters = estimateVolumeChapters(volumes[ri].desc, work);
  }

  // 按 idx 排序
  volumes.sort(function (a, b) {
    return a.idx - b.idx;
  });
  return volumes;
}

// 根据卷描述文本 + 平台策略，估算该卷适合多少章
function estimateVolumeChapters(volDesc, work) {
  // 基准：平台总章数 / 默认卷数 = 每卷合理章数
  var pf = getSelectedPlatform();
  var pfConfig = PLATFORM_CONFIG[pf] || PLATFORM_CONFIG.qidian;
  var basePerVolume = Math.round(pfConfig.chaptersPerVol / pfConfig.defaultVolumes); // 如起点 250/5=50

  if (!volDesc || volDesc.length < 5) {
    return basePerVolume;
  }
  var platformFactor = pf === 'fanqie' ? 1.2 : 1.0;

  // 统计描述中的"情节密度"
  // 1. 逗号/顿号/分号分隔的短语 ≈ 情节节点
  var segments = volDesc.split(/[,，、；;]/);
  var meaningfulSegs = 0;
  for (var si = 0; si < segments.length; si++) {
    if (segments[si].trim().length > 2) meaningfulSegs++;
  }

  // 2. 换行数 ≈ 独立事件块
  var lines = volDesc.split('\n');
  var meaningfulLines = 0;
  for (var li = 0; li < lines.length; li++) {
    if (lines[li].trim().length > 5) meaningfulLines++;
  }

  // 3. 关键词加权
  var keywords = ['高潮', '转折', '升级', '突破', '战斗', '对决', '冲突', '揭秘', '反转', '获得', '收服', '击败', '结盟', '背叛'];
  var keywordHits = 0;
  for (var ki = 0; ki < keywords.length; ki++) {
    var kw = keywords[ki];
    var pos = -1;
    while ((pos = volDesc.indexOf(kw, pos + 1)) !== -1) {
      keywordHits++;
    }
  }

  // 综合评分
  var density = meaningfulSegs + meaningfulLines * 2 + keywordHits * 3;

  // 每个密度单位 ≈ 6-10 章（起点慢热多一些，番茄快节奏少一些）
  var estimated = Math.round(density * 8 * platformFactor);

  // 以 basePerVolume 为基准上下浮动 2 倍范围
  var minCh = Math.max(10, Math.round(basePerVolume * 0.3));
  var maxCh = Math.round(basePerVolume * 2.5);
  estimated = Math.max(minCh, Math.min(maxCh, estimated));

  // 如果估算值和基准差不多，说明描述偏短，使用基准
  if (Math.abs(estimated - basePerVolume) < 10 && volDesc.length < 80) {
    estimated = basePerVolume;
  }
  return estimated;
}

// ========== v31：执行级细纲引擎 ==========
function getDetailBlueprintRule(genre, pfConfig) {
  var g = genre || '';
  var genreHint = '每章必须形成「目标→阻力→选择→代价→结果→钩子」的闭环。';
  if (g.indexOf('历史') >= 0) genreHint = '每章必须体现时代规则、权谋阻力、利益交换，严禁现代网文外挂乱入。';else if (g.indexOf('玄幻') >= 0 || g.indexOf('仙侠') >= 0) genreHint = '每章必须明确境界/资源/敌我差距/代价，爆点不能只写“变强”。';else if (g.indexOf('都市') >= 0) genreHint = '每章必须有现实利益、身份压迫、反击证据或人际关系张力。';else if (g.indexOf('悬疑') >= 0 || g.indexOf('灵异') >= 0 || g.indexOf('规则') >= 0) genreHint = '每章必须新增线索，同时制造误导或排除一个错误方向。';else if (g.indexOf('言情') >= 0) genreHint = '每章必须推进情感关系，包含误会、试探、靠近、退让或承诺。';else if (g.indexOf('经营') >= 0) genreHint = '每章必须展示具体数据变化、技术突破、策略选择，增长过程要有瓶颈和曲折。';else if (g.indexOf('科幻') >= 0) genreHint = '每章必须体现科技对人物选择的影响，不能把科技当背景板。';else if (g.indexOf('末世') >= 0) genreHint = '每章必须有资源压力、生存抉择、信任危机，安全感永远是暂时的。';else if (g.indexOf('武侠') >= 0) genreHint = '每章必须体现江湖人情、义气承诺、武功限制，不能只靠武力解决问题。';else if (g.indexOf('系统流') >= 0) genreHint = '每章必须体现系统规则的限制和代价，不能让系统变成无限外挂。';
  var p = '';
  p += '【执行级细纲蓝图规则 — v6.0增强版】\n';
  p += '你生成的不是目录，而是“写作蓝图”。每一章必须能直接指导 AI 写出正文。\n';
  p += genreHint + '\n';
  p += '你不必强制填满 18 个字段。**至少 8 个核心字段：**\n';
  p += '第X章 《标题》 | 章目标：[主角本章要达成什么] | 冲突：[谁阻止主角，核心矛盾是什么，冲突如何2-3步升级] | 剧情节点：[1开局承接→2阻力升级→3选择代价→4结果] | 爽点爆点：[具体到桥段+爽点类型（打脸/突破/真相揭露/逆袭/获宝/复仇/结盟）+读者为什么爽] | 伏笔：[埋下/推进/回收] | 信息增量：[新增设定/线索/关系] | 章尾钩子：[最后一句悬念，不能是"突然出现新敌人"式硬切]\n';
  p += '根据本章节奏和类型，你可以选择性补充以下字段（不用强制）：读者期待、付费点、场景、出场、冲突强度、节拍、爽点类型、关系变化、记忆承接、毒点风险、断章位置、情绪曲线\n';
  p += '禁止：只写"主角调查""发生冲突""众人震惊"这种空话；禁止连续三章同一种冲突模式；禁止章节之间断因果；禁止冲突一步到位（必须有2-3步升级）\n';
  p += '【细纲创新指引】\n';
  p += '- 在连续几章的相似节奏后，至少一章采用不同的叙事策略——比如不是"主角主动出击"，而是"主角被迫防守、被困、或只能观察"\n';
  p += '- 避免所有章节都用"XX出场→展示实力→震惊"模式，偶尔用"全程不让主角露面但通过他人反应来展示ta的影响力"\n';
  p += '- 每10章中至少安排1章以配角或反派的行动为主视角，让读者看到"另一个棋手的走法"\n';
  p += '- 冲突必须具体化：不能只写"与XX冲突"，要写"因为什么利益/信念/误会产生对立，对立如何一步步升级"\n';
  p += '- 爽点必须标注类型：打脸/突破/收获/揭秘/反杀/情绪爆发/认知升级，不能笼统写"爽"\n';
  p += '- 每章必须有情绪曲线：开篇情绪→中段转折→结尾情绪，不能和前后章完全相同\n';
  p += '- 场景描写必须包含感官细节：声音/气味/光线/温度/触感至少选一\n';
  p += '- 章尾钩子不能是"突然出现新敌人"式硬切，必须是"已有信息的新解读"或"即将揭晓的秘密"\n';
  p += '爆点节奏建议：每 5 章至少 1 个中爆；每 10 章至少 1 个大爆；过渡章也必须有信息增量。\n';
  if (pfConfig && pfConfig.detailStrategy) p += '平台细纲策略：' + pfConfig.detailStrategy + '\n';
  return p;
}
function normalizeDetailLine(line, fallbackIdx) {
  var t = (line || '').trim();
  if (!t) return t;
  if (!/^第[一二三四五六七八九十百千\d]+章/.test(t)) return t;
  var titleMatch = t.match(/^(第[一二三四五六七八九十百千\d]+章\s*[《「]?[^|《」]{0,24}[》」]?)/);
  var head = titleMatch ? titleMatch[1].trim() : '第' + fallbackIdx + '章 《未命名》';
  function has(k) {
    return t.indexOf(k + '：') >= 0 || t.indexOf(k + ':') >= 0 || t.indexOf(k + '：[') >= 0;
  }
  function seg(k, val) {
    return has(k) ? '' : ' | ' + k + '：[' + val + ']';
  }
  var out = t;
  // 8 core fields must have value
  out += seg('章目标', '本章主角必须完成的明确目标');
  out += seg('冲突', '阻力方与核心矛盾');
  out += seg('剧情节点', '1开局承接→2阻力升级→3选择代价→4结果');
  out += seg('爽点爆点', '具体爽点桥段');
  out += seg('伏笔', '埋下/推进/回收/无');
  out += seg('信息增量', '新增设定/线索/关系/资源');
  out += seg('章尾钩子', '一句悬念收尾');
  // optional fields
  out += seg('读者期待', '读者为什么想继续看');
  out += seg('付费点', '本章最值得追读/付费的点');
  out += seg('场景', '时间/地点/环境');
  out += seg('出场', '主要人物/势力');
  out += seg('冲突强度', '1-5级和压力来源');
  out += seg('节拍', '铺垫/升级/反转/小高潮/大高潮/过渡');
  out += seg('爽点类型', '打脸/突破/收获/揭秘/反杀/情绪爆发');
  out += seg('关系变化', '关系推进或恶化');
  out += seg('记忆承接', '承接前文设定/道具/承诺');
  out += seg('毒点风险', '本章最容易写崩的点和规避法');
  out += seg('断章位置', '最后200字卡在哪里');
  return out;
}
function normalizeDetailOutline(result, startCh) {
  if (!result) return result;
  var lines = result.split('\n');
  var chapterNo = startCh || 1;
  for (var i = 0; i < lines.length; i++) {
    if (/^\s*第[一二三四五六七八九十百千\d]+章/.test(lines[i])) {
      lines[i] = normalizeDetailLine(lines[i], chapterNo);
      chapterNo++;
    }
  }
  return lines.join('\n');
}
function analyzeDetailOutlineQuality(text) {
  var lines = (text || '').split('\n').filter(function (l) {
    return /^\s*第[一二三四五六七八九十百千\d]+章/.test(l.trim());
  });
  // 8 core fields + 9 optional
  var core = ['章目标', '冲突', '剧情节点', '爽点爆点', '伏笔', '信息增量', '章尾钩子'];
  var optional = ['读者期待', '付费点', '场景', '出场', '冲突强度', '节拍', '爽点类型', '关系变化', '记忆承接', '毒点风险', '断章位置'];
  var allFields = core.concat(optional);
  var missing = {};
  var missingOptional = {};
  core.forEach(function (k) {
    missing[k] = 0;
  });
  optional.forEach(function (k) {
    missingOptional[k] = 0;
  });
  var vague = 0,
    hookWeak = 0,
    conflictRepeat = 0,
    contentQuality = 0;
  var lastConflict = '',
    repeatRun = 0;
  lines.forEach(function (l) {
    core.forEach(function (k) {
      if (l.indexOf(k + '：') < 0 && l.indexOf(k + ':') < 0) missing[k]++;
    });
    optional.forEach(function (k) {
      if (l.indexOf(k + '：') < 0 && l.indexOf(k + ':') < 0) missingOptional[k]++;
    });
    // 空泛检测
    if (/主角(?:开始|进行|调查|成长|变强)|发生冲突|众人震惊|逐渐展开|埋下伏笔|推进剧情/.test(l)) vague++;
    // 钩子质量检测 — 不仅检查存在还检查空壳
    var hookCheck = l.match(/章尾钩子[：:]\s*\[([^\]]{0,20})\]/);
    if (!hookCheck || hookCheck[1].length < 4) hookWeak++;
    // 内容质量加分 — 至少3个核心字段有超过10字符的具体内容（而不是占位符）
    var richFields = 0;
    core.forEach(function (k) {
      var m = l.match(new RegExp(k + '[：:]\\s*\\[([^\\]]+)\\]'));
      if (m && m[1].length >= 10) richFields++;
    });
    if (richFields >= 5) contentQuality++; // 章节内容丰富
    // 冲突重复检测
    var cm = l.match(/冲突[：:]\s*\[?([^|\]]{2,30})/);
    var cur = cm ? cm[1].slice(0, 8) : '';
    if (cur && cur === lastConflict) repeatRun++;else repeatRun = 0;
    if (repeatRun >= 2) conflictRepeat++;
    if (cur) lastConflict = cur;
  });
  var totalCoreMiss = Object.keys(missing).reduce(function (n, k) {
    return n + missing[k];
  }, 0);
  var totalOptMiss = Object.keys(missingOptional).reduce(function (n, k) {
    return n + missingOptional[k];
  }, 0);
  var score = 100;
  if (lines.length === 0) score = 0;
  // 核心字段缺失扣分更重
  score -= Math.min(40, totalCoreMiss * 3);
  // 可选字段缺失扣分减轻
  score -= Math.min(15, totalOptMiss);
  score -= Math.min(20, vague * 4);
  score -= Math.min(15, hookWeak * 3);
  score -= Math.min(10, conflictRepeat * 5);
  // 内容质量加分
  score = Math.min(100, score + Math.min(10, contentQuality * 2));
  score = Math.max(0, score);
  var issues = [];
  Object.keys(missing).forEach(function (k) {
    if (missing[k] > 0) issues.push(k + '缺失' + missing[k] + '章');
  });
  if (vague > 0) issues.push('空泛章节' + vague + '章');
  if (hookWeak > 0) issues.push('章尾钩子弱' + hookWeak + '章');
  if (conflictRepeat > 0) issues.push('冲突模式连续重复' + conflictRepeat + '处');
  if (contentQuality > 0) issues.unshift('内容丰富章节' + contentQuality + '章（+加分）');
  return {
    score: score,
    chapters: lines.length,
    issues: issues.slice(0, 12),
    missing: missing
  };
}
function parseFieldFromDetailLine(line, name) {
  var re = new RegExp(name + '[：:]\\s*\\[?([^|\\]]+)\\]?', 'i');
  var m = line.match(re);
  return m ? m[1].trim() : '';
}
function syncDetailToChapterCards(work, detailText) {
  if (!work || !detailText) return;
  if (!work._chapterCards) work._chapterCards = {};
  var lines = detailText.split('\n').filter(function (l) {
    return /^\s*第[一二三四五六七八九十百千\d]+章/.test(l.trim());
  });
  lines.forEach(function (line, idx) {
    var chKey = 'ch_' + idx;
    var old = work._chapterCards[chKey] || {};
    var titleMatch = line.match(/^第[一二三四五六七八九十百千\d]+章\s*[《「]?([^|《」]{1,24})[》」]?/);
    var title = titleMatch ? titleMatch[1].trim() : '';
    var scene = parseFieldFromDetailLine(line, '场景');
    var nodes = parseFieldFromDetailLine(line, '剧情节点');
    var nodeParts = nodes ? nodes.split(/→|->|；|;|、|，/).map(function (x) {
      return x.trim();
    }).filter(Boolean) : [];
    var conflict = parseFieldFromDetailLine(line, '冲突');
    var hook = parseFieldFromDetailLine(line, '章尾钩子');
    work._chapterCards[chKey] = Object.assign({}, old, {
      purpose: parseFieldFromDetailLine(line, '章目标') || title || old.purpose || '',
      location: scene || old.location || '',
      node1: nodeParts[0] || conflict || old.node1 || '',
      node2: nodeParts[1] || parseFieldFromDetailLine(line, '爽点爆点') || old.node2 || '',
      node3: nodeParts[2] || parseFieldFromDetailLine(line, '伏笔') || old.node3 || '',
      node4: nodeParts[3] || parseFieldFromDetailLine(line, '关系变化') || old.node4 || '',
      node5: hook || old.node5 || '',
      subType: /战|杀|打|反杀|对决|围攻|突破/.test(line) ? 'battle' : /对话|谈判|质问|审问/.test(line) ? 'dialog' : /伏笔|线索|回收/.test(line) ? 'foreshadow' : old.subType || 'battle',
      fDetail: parseFieldFromDetailLine(line, '伏笔') || old.fDetail || '',
      fMethod: hook || old.fMethod || ''
    });
  });
  work._detailQuality = analyzeDetailOutlineQuality(detailText);
}
function finishDetailOutlineForWork(work, detailText, startCh) {
  var normalized = normalizeDetailOutline(detailText, startCh || 1);
  syncDetailToChapterCards(work, normalized);
  return normalized;
}

// ========== v32：多 AI 协作细纲设计 ==========
function isUnavailableAIText(text) {
  text = String(text || '');
  return text.indexOf('AI 暂不可用') >= 0 || text.indexOf('本次未能生成内容') >= 0 || text.indexOf('请前往「设置') >= 0 || text.indexOf('本地细纲降级') >= 0;
}
function _clipDetailText(text, maxLen) {
  text = String(text || '');
  maxLen = maxLen || 16000;
  if (text.length <= maxLen) return text;
  return text.slice(0, Math.floor(maxLen * 0.55)) + '\n\n……【中段省略，保留首尾用于审查】……\n\n' + text.slice(-Math.floor(maxLen * 0.45));
}
function multiAIDesignDetail(_x16, _x17, _x18, _x19) {
  return _multiAIDesignDetail.apply(this, arguments);
} // 生成单卷的章节细纲
function _multiAIDesignDetail() {
  _multiAIDesignDetail = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(work, basePrompt, draft, meta) {
    var genre, pfConfig, rule, rangeText, safeDraft, oldTitle, setAgentStatus, rhythmPrompt, rhythmAdvice, memoryText, lm, continuityPrompt, continuityAdvice, chiefPrompt, finalResult, q, _t5, _t6, _t7;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.p = _context7.n) {
        case 0:
          setAgentStatus = function _setAgentStatus(name) {
            try {
              if (typeof updateDetailLoading === 'function') {
                updateDetailLoading('🤖 多AI协作：' + name, undefined, rangeText + ' | ' + name + '正在处理…');
              }
            } catch (e) {}
          };
          if (!(!draft || draft.length < 80)) {
            _context7.n = 1;
            break;
          }
          return _context7.a(2, draft);
        case 1:
          meta = meta || {};
          genre = meta.genre || work && (work.genre || work.category && work.category.cat1) || '';
          pfConfig = PLATFORM_CONFIG[getSelectedPlatform()] || PLATFORM_CONFIG.qidian;
          rule = getDetailBlueprintRule(genre, pfConfig);
          rangeText = (meta.volName || '当前卷') + '｜第' + (meta.startCh || 1) + '-' + (meta.endCh || '?') + '章';
          safeDraft = _clipDetailText(draft, 15000);
          oldTitle = '';
          if (typeof progTitle === 'function' && progTitle()) oldTitle = progTitle().textContent || '';
          // AI-2：节奏爽点审查
          setAgentStatus('节奏爽点AI');
          rhythmPrompt = '你是“节奏爽点AI”，只负责审查章节细纲的节奏、爆点、情绪曲线和章尾钩子。\\n\\n' + '【审查范围】' + rangeText + '\\n' + rule + '\\n' + '【主线架构AI草案】\\n' + safeDraft + '\\n\\n' + '请只输出审查意见，不要重写全文。格式：\\n' + '1. 节奏问题：列出章节号+问题\\n' + '2. 爽点问题：哪些章爆点弱/重复/缺少代价\\n' + '3. 钩子问题：哪些章章尾不够强\\n' + '4. 必改建议：按优先级列 5-12 条';
          rhythmAdvice = null;
          _context7.p = 2;
          _context7.n = 3;
          return callRealAPIWithFallback(rhythmPrompt, null, 'quality_logic');
        case 3:
          rhythmAdvice = _context7.v;
          _context7.n = 5;
          break;
        case 4:
          _context7.p = 4;
          _t5 = _context7.v;
          console.warn('[multiAI rhythm]', _t5 && _t5.message);
        case 5:
          rhythmAdvice = rhythmAdvice && !isUnavailableAIText(rhythmAdvice) && rhythmAdvice.length > 20 ? rhythmAdvice : '节奏爽点AI未返回有效意见，按原草案保留。';

          // AI-3：伏笔连贯审查
          setAgentStatus('伏笔连贯AI');
          memoryText = '';
          try {
            if (work && work.longMemory) {
              lm = work.longMemory;
              if (lm.volumeMemories) memoryText += '分卷记忆：' + JSON.stringify(lm.volumeMemories.slice(-3)).slice(0, 1600) + '\\n';
              if (lm.foreshadowLedger) memoryText += '伏笔总表：' + JSON.stringify(lm.foreshadowLedger.slice(0, 20)).slice(0, 1600) + '\\n';
              if (lm.itemLedger) memoryText += '道具总表：' + JSON.stringify(lm.itemLedger).slice(0, 1200) + '\\n';
              if (lm.characterProfiles) memoryText += '人物档案：' + JSON.stringify(lm.characterProfiles).slice(0, 1600) + '\\n';
            }
          } catch (e) {}
          continuityPrompt = '你是“伏笔连贯AI”，只负责审查章节细纲的长记忆承接、伏笔回收、人物关系、道具流转、时间线和设定一致性。\\n\\n' + '【审查范围】' + rangeText + '\\n' + '【可用长记忆】\\n' + (memoryText || '暂无长记忆，按本卷上下文审查。') + '\\n' + '【主线架构AI草案】\\n' + safeDraft + '\\n\\n' + '请只输出审查意见，不要重写全文。格式：\\n' + '1. 断承接：列出章节号+前文应该承接什么\\n' + '2. 伏笔问题：哪些章应该埋/推/收哪些伏笔\\n' + '3. 关系问题：人物关系是否突然跳变\\n' + '4. 道具/时间线问题：谁拿着什么、时间是否自洽\\n' + '5. 必改建议：按优先级列 5-12 条';
          continuityAdvice = null;
          _context7.p = 6;
          _context7.n = 7;
          return callRealAPIWithFallback(continuityPrompt, null, 'quality_consist');
        case 7:
          continuityAdvice = _context7.v;
          _context7.n = 9;
          break;
        case 8:
          _context7.p = 8;
          _t6 = _context7.v;
          console.warn('[multiAI continuity]', _t6 && _t6.message);
        case 9:
          continuityAdvice = continuityAdvice && !isUnavailableAIText(continuityAdvice) && continuityAdvice.length > 20 ? continuityAdvice : '伏笔连贯AI未返回有效意见，按原草案保留。';

          // AI-4：总编整合
          setAgentStatus('总编整合AI');
          chiefPrompt = '你是“总编整合AI”。你的任务是综合主线架构AI草案、节奏爽点AI意见、伏笔连贯AI意见，输出最终可执行章节细纲。\\n\\n' + '【范围】' + rangeText + '\\n' + rule + '\\n' + '【原始生成要求】\\n' + _clipDetailText(basePrompt, 6000) + '\\n\\n' + '【主线架构AI草案】\\n' + safeDraft + '\\n\\n' + '【节奏爽点AI意见】\\n' + _clipDetailText(rhythmAdvice, 5000) + '\\n\\n' + '【伏笔连贯AI意见】\\n' + _clipDetailText(continuityAdvice, 5000) + '\\n\\n' + '【最终输出要求】\\n' + '1. 输出完整细纲，不要只输出修改建议。\\n' + '2. 必须保留第' + (meta.startCh || 1) + '章到第' + (meta.endCh || '?') + '章，不得少章、跳章、乱序。\\n' + '3. 每章必须是 12 字段执行级格式。\\n' + '4. 必须根据两位审查AI的意见修正节奏、爆点、钩子、伏笔、关系和记忆承接。\\n' + '5. 直接输出细纲正文，不要解释。';
          finalResult = null;
          _context7.p = 10;
          _context7.n = 11;
          return callRealAPIWithFallback(chiefPrompt, null, 'quality_polish');
        case 11:
          finalResult = _context7.v;
          _context7.n = 13;
          break;
        case 12:
          _context7.p = 12;
          _t7 = _context7.v;
          console.warn('[multiAI chief]', _t7 && _t7.message);
        case 13:
          if (!finalResult || isUnavailableAIText(finalResult) || finalResult.length < Math.max(300, draft.length * 0.35)) {
            finalResult = draft;
          }
          finalResult = normalizeDetailOutline(finalResult, meta.startCh || 1);
          q = analyzeDetailOutlineQuality(finalResult);
          if (work) {
            work._detailAgentReports = work._detailAgentReports || [];
            work._detailAgentReports.push({
              range: rangeText,
              rhythm: _clipDetailText(rhythmAdvice, 1200),
              continuity: _clipDetailText(continuityAdvice, 1200),
              score: q.score,
              chapters: q.chapters,
              ts: Date.now()
            });
            if (work._detailAgentReports.length > 30) work._detailAgentReports = work._detailAgentReports.slice(-30);
          }
          if (oldTitle && typeof updateDetailLoading === 'function') {
            try {
              updateDetailLoading(oldTitle, undefined, rangeText + ' | 多AI整合完成，评分 ' + q.score + '/100');
            } catch (e) {}
          }
          return _context7.a(2, finalResult);
      }
    }, _callee7, null, [[10, 12], [6, 8], [2, 4]]);
  }));
  return _multiAIDesignDetail.apply(this, arguments);
}
function generateOneVolumeChapters(_x20, _x21, _x22, _x23, _x24, _x25, _x26, _x27, _x28) {
  return _generateOneVolumeChapters.apply(this, arguments);
} // 初始化架构页面
function _generateOneVolumeChapters() {
  _generateOneVolumeChapters = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(work, genre, plotType, volName, volDesc, startCh, endCh, chCount, idea) {
    var worldText, charsText, outlineText, prompt, chCtx, pf, pfConfig, pacingRules, ri, pr, result;
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.n) {
        case 0:
          // 构建上下文
          worldText = (work.world || '').length > 1000 ? (work.world || '').substring(0, 1000) + '...(省略)' : work.world || '';
          charsText = (work.chars || '').length > 800 ? (work.chars || '').substring(0, 800) + '...(省略)' : work.chars || '';
          outlineText = (work.outline || '').length > 1200 ? (work.outline || '').substring(0, 1200) + '...(省略)' : work.outline || '';
          prompt = '你是一位专业的网文架构师。请为以下小说生成章节细纲。\n\n';
          prompt += '【作品】' + work.title + '\n';
          prompt += '【题材】' + genre + ' / ' + plotType + '\n\n';
          if (worldText) prompt += '【世界观】\n' + worldText + '\n\n';
          if (charsText) prompt += '【人物人设】\n' + charsText + '\n\n';
          // 角色数量检查
          chCtx = buildCharacterContext(charsText);
          if (chCtx.instruction) prompt += chCtx.instruction + '\n\n';
          if (outlineText) prompt += '【全书大纲】\n' + outlineText + '\n\n';
          prompt += '【当前生成范围】' + volName + ' | 第' + startCh + '章 ~ 第' + endCh + '章（共' + chCount + '章）\n';
          if (volDesc) prompt += '【本卷概要】' + volDesc + '\n';
          if (idea) prompt += '【用户构思】' + idea + '\n';
          if (work.detail) {
            prompt += '\n【已有细纲承接参考】\n' + work.detail.slice(0, 1800);
            if (work.detail.length > 3200) prompt += '\n……\n' + work.detail.slice(-900);
            prompt += '\n【要求】本次生成必须接入已有细纲因果链，不得从中途断裂，不得把第' + startCh + '章写成第1章开局。\n';
          }

          // 注入平台策略
          pf = getSelectedPlatform();
          pfConfig = PLATFORM_CONFIG[pf] || PLATFORM_CONFIG.qidian;
          prompt += '【平台】' + pfConfig.label + ' | ' + pfConfig.desc + '\n';
          prompt += '【策略】' + pfConfig.detailStrategy + '\n';
          prompt += '【每章字数】' + pfConfig.wordsPerChapter + '\n';

          // 注入节奏规则
          pacingRules = pfConfig.pacingRules || [];
          if (pacingRules.length > 0) {
            prompt += '\n【节奏硬规则 - 必须严格遵守】\n';
            for (ri = 0; ri < pacingRules.length; ri++) {
              pr = pacingRules[ri];
              prompt += pr.type + '(' + pr.range + ')：' + pr.rule + '\n';
            }
          }
          prompt += '\n';
          prompt += getDetailBlueprintRule(genre, pfConfig) + '\n';
          prompt += '【输出要求】\n';
          prompt += '1. 严格按照本卷概要和节奏规则展开剧情\n';
          prompt += '2. 每章必须有因果推进：上一章结果必须成为下一章开局压力\n';
          prompt += '3. 使用具体角色名、地名、势力名、道具名，不准泛称\n';
          prompt += '4. 「剧情节点」至少 4 步，必须能直接拆成正文场景\n';
          prompt += '5. 「记忆承接」必须写明承接前文哪件事/承诺/道具/伤势/地点\n';
          prompt += '6. 「章尾钩子」必须是具体悬念句，不能写“留下悬念”\n';
          prompt += '7. 直接输出，不要任何解释前缀\n';

          // AI-1：主线架构AI先出草案
          _context8.n = 1;
          return callRealAPIWithFallback(prompt, null, 'detail');
        case 1:
          result = _context8.v;
          if (isUnavailableAIText(result)) result = null;
          if (!result) {
            _context8.n = 3;
            break;
          }
          result = normalizeDetailOutline(result, startCh);
          // AI-2/3/4：节奏爽点AI + 伏笔连贯AI + 总编整合AI
          _context8.n = 2;
          return multiAIDesignDetail(work, prompt, result, {
            genre: genre,
            volName: volName,
            startCh: startCh,
            endCh: endCh,
            chCount: chCount
          });
        case 2:
          result = _context8.v;
        case 3:
          return _context8.a(2, result);
      }
    }, _callee8);
  }));
  return _generateOneVolumeChapters.apply(this, arguments);
}
function initArchPage() {
  var work = getWork();
  if (!work) {
    // 显示空状态 — 尝试多个可能的容器
    var el = document.querySelector('.edit-wrap') || document.querySelector('#arch-edit-wrap') || document.querySelector('.page-content');
    if (el) {
      el.innerHTML = '<div class="empty-state" style="text-align:center;padding:60px 20px;">' + '<div style="font-size:48px;margin-bottom:16px;">📚</div>' + '<div style="font-size:15px;color:#888;">请先创建或选择一个作品</div>' + '<a href="new-book.html" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;">新建作品</a>' + '</div>';
    }
    return;
  }

  // === 切换作品时重置全局状态，防止跨作品污染 ===
  currentArchModule = 'world'; // 重置到第一个模块
  currentPlatform = work._platform || 'qidian'; // 从作品读取，无则默认起点
  // 重置卡片系统全局缓存
  window._charCardsData = null; // 清空人物卡缓存
  window._chapterSubData = {}; // 清空章节子卡缓存
  charEditIndex = 0; // 重置人物编辑索引
  // === 重置结束 ===

  // 重置保护状态
  _moduleDirty = {};
  _detailPage = {
    idx: 0,
    size: 100
  };
  bindDirtyTracking();
  bindIdeaDraftTracking();

  // BUG-07 fix: beforeunload 只绑定一次，防止重复
  if (!window._archBeforeUnloadBound) {
    window._archBeforeUnloadBound = true;
    window.addEventListener('beforeunload', function (e) {
      var anyDirty = Object.values(_moduleDirty).some(function (v) {
        return v;
      });
      if (anyDirty) {
        e.preventDefault();
        e.returnValue = '您有未保存的修改，确定离开吗？';
        return e.returnValue;
      }
    });
  }

  // 同步状态
  if (work.archStatus) {
    archModuleStatus = Object.assign({}, work.archStatus);
  } else {
    // 新作品：重置为初始状态
    archModuleStatus = {
      world: 'pending',
      chars: 'locked',
      outline: 'locked',
      detail: 'locked'
    };
  }
  window.archModuleStatus = archModuleStatus; // BUG-06 fix: 同步引用
  window.currentArchModule = currentArchModule; // BUG-05 fix: 同步

  renderArchModule();
}

// ========== v53：按评价修改明确反馈 ==========
function getCurrentArchFullContentV53() {
  try {
    if (currentArchModule !== 'detail' && typeof syncCurrentDisplayPageToFullV52 === 'function') {
      syncCurrentDisplayPageToFullV52(currentArchModule);
    }
    if (currentArchModule !== 'detail' && typeof getArchFullTextV52 === 'function') {
      var full = getArchFullTextV52(currentArchModule);
      if (full && full.trim()) return full.trim();
    }
  } catch (e) {}
  var area = rawEditArea && rawEditArea();
  return area && area.value ? area.value.trim() : '';
}
function setCurrentArchFullContentV53(text) {
  text = String(text || '');
  try {
    if (currentArchModule !== 'detail' && typeof setArchFullTextV52 === 'function') {
      setArchFullTextV52(currentArchModule, text, true);
      if (typeof renderArchDisplayPageV52 === 'function') renderArchDisplayPageV52(currentArchModule, true);
      return;
    }
  } catch (e) {}
  var rawArea = rawEditArea && rawEditArea();
  if (rawArea) {
    rawArea.value = text;
    rawArea.style.display = 'block';
    if (typeof autoGrowArchTextarea === 'function') autoGrowArchTextarea(rawArea);
  }
}
function ensureEvalFixStatusBarV53() {
  var id = 'arch-fix-status-v53';
  var bar = document.getElementById(id);
  if (bar) return bar;
  bar = document.createElement('div');
  bar.id = id;
  bar.style.cssText = 'display:none;margin:0 12px 10px;padding:10px 12px;border-radius:10px;background:#eef2ff;border:1px solid #c7d2fe;color:#3730a3;font-size:12px;line-height:1.55;';
  var page = pageEl && pageEl();
  var actions = page ? page.querySelector('.page-actions') : null;
  if (actions && actions.parentNode) actions.parentNode.insertBefore(bar, actions.nextSibling);else document.body.appendChild(bar);
  return bar;
}
function showEvalFixStatusV53(type, html) {
  var bar = ensureEvalFixStatusBarV53();
  var color = {
    info: ['#eef2ff', '#c7d2fe', '#3730a3'],
    success: ['#f0fdf4', '#bbf7d0', '#166534'],
    warn: ['#fffbeb', '#fde68a', '#92400e'],
    error: ['#fef2f2', '#fecaca', '#991b1b']
  }[type || 'info'] || ['#eef2ff', '#c7d2fe', '#3730a3'];
  bar.style.display = 'block';
  bar.style.background = color[0];
  bar.style.borderColor = color[1];
  bar.style.color = color[2];
  bar.innerHTML = html;
}
function summarizeFixBlocksV53(fixBlocks) {
  var arr = [];
  for (var i = 0; i < Math.min(3, fixBlocks.length); i++) {
    var m = fixBlocks[i].match(/【问题】\s*(.+?)(?=\n|【|$)/);
    arr.push(i + 1 + '. ' + he(m ? m[1].trim() : '修改建议'));
  }
  return arr.join('<br>');
}
function countArchFixBlocksV55(text) {
  return (String(text || '').match(/---FIX---/g) || []).length;
}
function parseArchIssueCountV55(text) {
  text = String(text || '');
  var patterns = [/【问题统计】[^\d]{0,20}(\d+)\s*处/, /发现问题[^\d]{0,20}(\d+)\s*处/, /问题[^\d]{0,20}(\d+)\s*处/];
  for (var i = 0; i < patterns.length; i++) {
    var m = text.match(patterns[i]);
    if (m && m[1]) return parseInt(m[1], 10) || 0;
  }
  return 0;
}
function getArchExistingFixDigestV55(text) {
  var parts = String(text || '').split(/---FIX---/);
  var arr = [];
  for (var i = 1; i < parts.length && arr.length < 12; i++) {
    var block = parts[i];
    var oldMatch = block.match(/【原文】\s*([\s\S]*?)(?=【改为】|$)/);
    var probMatch = block.match(/【问题】\s*(.+?)(?=\n|【|$)/);
    var line = '';
    if (probMatch) line += '问题：' + probMatch[1].trim();
    if (oldMatch) line += '；已覆盖原文：' + oldMatch[1].trim().substring(0, 80);
    if (line) arr.push(arr.length + 1 + '. ' + line);
  }
  return arr.join('\n');
}

// ========== 架构评价与修改 ==========

// 评价标准（每个模块不同）
var ARCH_EVAL_PROFILE = {
  world: {
    name: '世界观专项体检',
    min: 5,
    max: 10,
    role: '世界观设定编辑',
    scope: '只评价世界观设定，不评价章节节奏、具体剧情写法或人物台词。',
    focus: ['世界规则是否清楚：时代、地理、势力、力量体系、经济民生、文化习俗、禁忌代价', '设定是否自洽：资源、能力、阶层、势力边界有没有互相矛盾', '题材辨识度是否足够：是否有区别于同类作品的核心记忆点', '是否能支撑长篇：是否有可扩张地图、势力、等级、冲突源、隐藏伏笔', '主角是否有进入世界和改变世界的空间', '势力关系矩阵是否完整：势力之间是否有因果链（为什么敌对/结盟），还是孤立的势力列表', '世界运转逻辑是否写清：世界靠什么维持运转、资源如何分配、权力如何更迭、底层人如何生存', '等级体系是否有稀缺度：每个境界是否标注稀缺比例和突破代价', '势力之间是否有具体互动：贸易/战争/暗杀/联姻等事件，而非只写势力简介', '核心矛盾是否具体：是否具体到"谁和谁因为什么资源/信仰/历史而对立"，而非泛泛的"世界动荡"'],
    categories: '世界规则/力量体系/势力格局/势力关系矩阵/势力因果链/势力互动/地理资源/地理感官/历史背景/文化制度/冲突源/核心矛盾/等级稀缺度/世界运转逻辑/题材辨识度/长篇延展/主角空间/设定漏洞/AI腔',
    avoid: '不要用细纲标准要求每章钩子，不要用人设标准细改角色性格，不要把世界观扩写成剧情梗概。'
  },
  chars: {
    name: '人设专项体检',
    min: 5,
    max: 10,
    role: '角色塑造编辑',
    scope: '只评价人物设定和人物关系，不评价世界观完整度、章节节奏或卷纲结构。',
    focus: ['主角目标、欲望、弱点、底线、成长弧是否明确', '核心配角是否有功能定位、个人动机和差异化', '反派是否有威胁感、行动逻辑和持续压迫', '人物关系是否能产生冲突、羁绊、误会、背叛或利益牵扯', '角色语言、行为习惯、能力边界是否有辨识度且前后一致', '内在矛盾是否具体：是否写清了具体的矛盾描述（如"渴望自由但背负家族使命"），而非泛泛的"内心挣扎"', '关系网是否有驱动力：A需要B的什么，而非只有关系标签', '是否有隐藏关系：前期读者不知道的关系，增加后续反转空间', '视觉标签是否鲜明：每个角色是否有1个让人过目不忘的视觉特征', '说话风格是否差异化：不同角色的典型台词能否让人一眼认出是谁', '能力是否有代价：角色的能力是否有限制和代价，而非无限开挂'],
    categories: '主角动机/成长弧/弱点底线/内在矛盾/配角功能/反派威胁/人物关系/关系驱动力/隐藏关系/差异化/能力边界/能力代价/身份背景/台词气质/说话风格/视觉标签/创伤影响/人物矛盾/脸谱化/角色记忆点',
    avoid: '不要要求补每章剧情节点，不要大段改世界规则，不要把人设改成章节大纲。'
  },
  outline: {
    name: '大纲专项体检',
    min: 6,
    max: 12,
    role: '长篇结构编辑',
    scope: '只评价主线、卷结构、冲突升级和伏笔回收，不评价每章执行细节。',
    focus: ['主线目标是否清晰，每卷是否推动目标变化', '起承转合、卷末高潮、阶段胜利/失败是否成立', '冲突是否逐级升级，反派或压力是否持续存在', '爽点、悬念、伏笔、反转是否有布置和回收', '剧情因果是否连贯，是否存在跳跃、降智、反高潮', '卷间因果递进是否成立：上卷的什么事件直接导致了本卷发生，而非换地图打新怪', '主角成长维度是否不同：每卷成长是否在能力/认知/关系等不同维度，而非每卷都是"变强了"', '爽点类型是否标注：是否写清了打脸/突破/真相揭露/逆袭/获宝等具体类型', '信息增量是否落实：每个阶段读者会新知道什么', '卷末钩子力度：每卷末是否有强力钩子驱动读者继续'],
    categories: '主线目标/卷结构/卷间因果/冲突升级/节奏分布/爽点设计/爽点类型/信息增量/伏笔回收/反派压力/人物驱动/人物成长维度/剧情因果/阶段因果链/卷末钩子/题材预期/商业节奏/可拆细纲',
    avoid: '不要用细纲标准要求每章四步节点，不要细改世界观设定表，不要把大纲扩成正文。'
  },
  detail: {
    name: '细纲专项体检',
    min: 8,
    max: 16,
    role: '章节细纲编辑',
    scope: '只评价章节级执行：每章目标、场景、冲突、节点、爽点、伏笔、钩子和承接。',
    focus: ['每章是否有明确章目标、场景、出场人物、冲突和结果', '每章剧情节点是否足够具体，能直接写正文', '章节之间因果是否连续，上一章结果是否成为下一章压力', '爽点、爆点、反转、钩子是否分布合理', '道具、伤势、承诺、伏笔、关系变化是否被长记忆追踪', '节拍类型是否多样：连续3章是否避免同一种节拍类型，是否涵盖铺垫/升级/反转/小高潮/大高潮/过渡/收束', '冲突类型是否具体化：是否标注了人际/势力/内心/环境/信息差/资源争夺等类型', '信息增量是否落实：每章读者看完是否比上一章多知道一些东西', '场景感官细节：场景描写是否包含感官细节（声音/气味/光线/温度/触感）', '情绪曲线是否变化：每章是否有情绪曲线且与前后章不重复', '冲突升级步骤：每章冲突是否有2-3步升级过程'],
    categories: '章目标/场景执行/场景感官/剧情节点/冲突类型/冲突升级/节拍类型/情绪曲线/章尾钩子/爽点爆点/信息增量/伏笔推进/关系变化/记忆承接/节奏密度/断章风险/可写作性/同质重复',
    avoid: '不要重写世界观总设定，不要重新设计整部大纲，不要只谈抽象方向，必须落到具体章节。'
  }
};
var ARCH_EVAL_CRITERIA = {
  world: ['完整性：是否覆盖时代背景、核心矛盾、地理、势力、力量体系、经济民生、文化习俗、规则禁忌', '一致性：各设定之间是否自洽，是否存在矛盾或自相打脸', '独特性：是否有区别于同类题材的鲜明记忆点', '可延展性：设定密度是否足够支撑长篇连载，是否预留升级/扩张空间', '具体性：是否有具体名称、规则、数据，避免泛泛而谈', '冲突源：是否提供足够的剧情可用冲突点', '题材锚点：是否真正切合用户构思的题材，没有跑偏', '主角空间：是否给主角留下成长舞台和介入机会', '势力平衡：势力之间是否有可博弈的张力，而非一边倒', '世界观漏洞：是否存在常识/逻辑/历史/科学硬伤', '隐藏伏笔：是否埋下可在后续展开的世界观伏笔', '语言风格：是否避免AI腔、空话、堆砌形容词', '势力关系矩阵：势力之间是否有因果链（A和B敌对是因为什么历史事件），还是孤立的势力列表', '世界运转逻辑：是否写清了世界靠什么维持运转、资源如何分配、权力如何更迭、底层人如何生存', '等级稀缺度：每个境界是否标注了稀缺比例和突破代价，还是只有空洞的等级名', '势力互动：势力之间是否有具体的互动事件（贸易/战争/暗杀/联姻），而非只写势力简介', '地理感官特征：地理节点是否有感官描写（声音/气味/光线/温度），还是只有名称和一句话', '核心矛盾具体性：世界核心矛盾是否具体到"谁和谁因为什么资源/信仰/历史而对立"，而非泛泛的"世界动荡"'],
  chars: ['角色契合度：人物是否符合世界观和题材', '立体感：是否有鲜明的性格、动机、欲望、恐惧、弱点', '关系网络：人物之间是否有可演绎的关系和冲突', '成长弧线：主角和核心配角是否有清晰的成长轨迹', '辨识度：是否有独特的口癖、习惯、外貌或绝活', '反派塑造：反派是否立得住，有自己的逻辑和威胁感', '配角作用：每个配角是否有功能定位，不只是路人', '人物漏洞：年龄、出身、能力、立场是否前后一致', '冲突潜力：人物之间是否能产生持续戏剧冲突', '题材匹配：人物职业、身份是否与题材协调', '差异化：人物之间是否有差异，避免脸谱化或同质化', '台词与思维：是否每个角色都有专属的语言风格', '内在矛盾具体性：角色的内在矛盾是否具体（如"渴望自由但背负家族使命"），而非泛泛的"内心挣扎"', '关系网驱动力：人物关系是否写清了驱动力（A需要B的什么），而非只有关系标签', '隐藏关系设计：是否有前期读者不知道的隐藏关系，增加后续反转空间', '视觉标签：每个角色是否有1个让人过目不忘的视觉特征，还是外貌描写千篇一律', '创伤影响：角色的心理创伤是否影响了当前行为模式，还是创伤只是背景板', '说话风格差异化：不同角色的典型台词是否能让人一眼认出是谁在说话', '能力代价：角色的能力是否有限制和代价，而非无限开挂', '角色记忆点：每个角色是否有至少一个"读者会记住的瞬间"设计'],
  outline: ['剧情完整性：是否有起承转合，每卷都有完整结构', '主线清晰度：核心目标和主线推进是否明确', '节奏感：高潮/低谷分布是否合理，是否避免长时间平淡', '爽点设计：爽点类型是否多样，是否避免连续同质爽点', '伏笔悬念：是否有足够伏笔和悬念，是否安排回收', '冲突升级：冲突是否一卷比一卷大，避免反高潮', '人物驱动：剧情是否由人物动机推动，而非作者强行安排', '可执行性：每卷大纲是否能继续拆成具体细纲', '商业节奏：开篇黄金三章、卷末高潮、过渡章是否到位', '题材适配：剧情走向是否符合该题材读者预期', '反派威胁：反派/敌对势力是否一直造成压力', '逻辑漏洞：剧情推进是否存在硬伤、降智、断因果', '卷间因果递进：卷与卷之间是否有因果衔接（上卷的什么事件导致本卷发生），还是换地图打新怪的平行结构', '主角成长维度：每卷主角成长维度是否不同（能力/认知/关系），而非每卷都是"变强了"', '爽点类型标注：爽点是否标注了类型（打脸/突破/真相揭露/逆袭/获宝），而非只写"高潮"', '信息增量：每个阶段读者会新知道什么，是否每阶段都有认知推进', '阶段因果链：阶段内事件是否有因果链（A导致B，B引发C），而非独立并列事件', '卷末钩子力度：每卷末是否有强力钩子驱动读者继续阅读'],
  detail: ['执行级格式：每章是否包含章目标、场景、出场、冲突、节拍、剧情节点、爽点爆点、伏笔、关系变化、记忆承接、章尾钩子', '细纲密度：每章剧情节点是否至少4步，能直接拆成正文场景', '节奏控制：小爆/中爆/大爆/过渡是否错落分布', '冲突连续：是否避免连续同质冲突或连续平淡章节', '衔接性：上一章结果是否成为下一章压力，避免断因果', '长记忆承接：道具、伤势、承诺、伏笔、关系变化是否被持续追踪', '人物轨迹：核心人物是否在每一卷都有清晰动作和成长', '伏笔回收：早期伏笔是否在后续被推进和回收', '商业要素：每章读者期待、付费点、爽点类型、毒点风险、断章位置是否齐全', '章尾钩子：每章结尾是否有强追读钩子', '题材锚点：是否每章都体现题材专属元素', '可写作性：是否能直接喂给AI写章节，避免太抽象', '断章风险：是否存在剧情断裂、跳过关键事件', '同质重复：是否有重复桥段、重复情绪、重复打脸', '节拍类型多样性：连续3章是否避免同一种节拍类型，节拍是否涵盖铺垫/升级/反转/小高潮/大高潮/过渡/收束', '冲突类型具体化：冲突是否标注了类型（人际/势力/内心/环境/信息差/资源争夺），而非笼统的"有冲突"', '信息增量落实：每章读者看完是否比上一章多知道一些东西，信息增量是否具体', '场景感官细节：场景描写是否包含感官细节（声音/气味/光线/温度/触感），而非只有地点名', '情绪曲线变化：每章是否有情绪曲线（开篇→中段→结尾），且与前后章不重复', '冲突升级步骤：每章冲突是否有2-3步升级过程，而非一步到位']
};

// 评价当前架构模块
function evaluateArchModule() {
  return _evaluateArchModule.apply(this, arguments);
} // 显示评价结果弹窗（含修改预览）
function _evaluateArchModule() {
  _evaluateArchModule = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
    var work, content, moduleName, criteria, profile, moduleIdx, minIssues, maxIssues, prompt, result, fixBtn, fixCount, reportedCount, targetCount, needCount, supplementPrompt, extra, extraFixCount, mismatchTip, _t8;
    return _regenerator().w(function (_context9) {
      while (1) switch (_context9.p = _context9.n) {
        case 0:
          work = getWork();
          if (work) {
            _context9.n = 1;
            break;
          }
          showToast('请先选择作品');
          return _context9.a(2);
        case 1:
          content = getCurrentArchFullContentV53();
          if ((!content || content.length < 10) && work._cardData && work._cardData[currentArchModule] && typeof cardToFreeText === 'function') {
            content = cardToFreeText(currentArchModule, work._cardData[currentArchModule]);
          }
          if (!(!content || content.length < 20)) {
            _context9.n = 2;
            break;
          }
          showToast('请先输入或生成内容');
          return _context9.a(2);
        case 2:
          moduleName = ARCH_MODULE_NAMES[currentArchModule];
          criteria = ARCH_EVAL_CRITERIA[currentArchModule] || ARCH_EVAL_CRITERIA.world;
          profile = ARCH_EVAL_PROFILE[currentArchModule] || ARCH_EVAL_PROFILE.world;
          moduleIdx = ARCH_MODULES.indexOf(currentArchModule); // v58: 分模块专项标准，避免世界观/人设/大纲/细纲互相串标准
          minIssues = profile.min;
          maxIssues = profile.max;
          prompt = '你是资深网文编辑兼' + profile.role + '。本次不是通用评价，而是【' + profile.name + '】。\n';
          prompt += '请对以下' + moduleName + '进行专项精准体检，只按本模块标准挑关键问题；每个问题都必须给出可自动替换的修改块。\n';
          prompt += '【评价边界】' + profile.scope + '\n';
          prompt += '【不要做】' + profile.avoid + '\n\n';
          prompt += '【作品】' + work.title + ' 【题材】' + (work.genre || '') + '\n';
          if (moduleIdx > 0) {
            prompt += '【前置设定参考】\n';
            ARCH_MODULES.slice(0, moduleIdx).forEach(function (m) {
              if (work[m]) prompt += ARCH_MODULE_NAMES[m] + '：' + (work[m].length > 2000 ? work[m].substring(0, 2000) + '...' : work[m]) + '\n';
            });
          }
          prompt += '\n【' + moduleName + '原文】\n' + content + '\n\n';
          prompt += '=== ' + profile.name + '评分维度（必须每条都打分，不许跳过）===\n';
          criteria.forEach(function (c, i) {
            prompt += i + 1 + '. ' + c + '\n';
          });
          prompt += '\n=== 本模块专项检查重点 ===\n';
          profile.focus.forEach(function (f, i) {
            prompt += i + 1 + '. ' + f + '\n';
          });
          prompt += '\n=== 体检要求（重要）===\n';
          prompt += '- 只挑关键问题，不要为了凑数反复挑小毛病；输出 ' + minIssues + '-' + maxIssues + ' 条可自动替换的修改块即可\n';
          prompt += '- 优先处理本模块硬伤，不要跨模块挑错；世界观按设定体系，人设按角色塑造，大纲按长篇结构，细纲按章节执行\n';
          prompt += '- 【按主要内容结构评价】：不要只看整体印象，必须按原文的实际内容板块逐一检查——\n';
          if (currentArchModule === 'world') {
            prompt += '  世界观：逐个检查势力关系矩阵（是否有因果链）、等级体系（是否有稀缺度）、地理节点（是否有感官特征）、世界运转逻辑（是否写清资源/权力/底层）、核心矛盾（是否具体）\n';
          } else if (currentArchModule === 'chars') {
            prompt += '  人设：逐个检查主角和核心配角的内在矛盾（是否具体）、关系网（是否有驱动力）、视觉标签（是否鲜明）、说话风格（是否差异化）、能力代价（是否有限制）\n';
          } else if (currentArchModule === 'outline') {
            prompt += '  大纲：逐卷检查卷间因果衔接（上卷事件是否导致本卷）、主角成长维度（是否不同）、爽点类型（是否标注）、信息增量（是否落实）、卷末钩子（是否有力）\n';
          } else if (currentArchModule === 'detail') {
            prompt += '  细纲：逐章检查节拍类型（是否多样）、冲突类型（是否具体化）、信息增量（是否落实）、场景感官（是否有细节）、情绪曲线（是否变化）、冲突升级（是否有步骤）\n';
          }
          prompt += '- 同一段原文不要拆成太多小问题；能合并的合并成一个---FIX---，避免越改越碎\n';
          prompt += '- 评分报告里提到的每个问题都必须在第二部分落实为---FIX---，但总数不要超过 ' + maxIssues + ' 条\n';
          prompt += '- 如果原文太短或不完整，也作为问题列出，并给出补全后的内容\n';
          prompt += '\n=== 输出格式（严格遵守）===\n\n';
          prompt += '第一部分：评分报告\n';
          prompt += '每维度：维度名：X分 一句话评价\n';
          prompt += '最后：【综合评分】：X分\n';
          prompt += '【问题统计】精选关键问题：X 处；可自动修改：X 处（两个数字必须相同，且不要超过 ' + maxIssues + ' 处）\n\n';
          prompt += '第二部分：详细修改清单（每个关键问题独立一个---FIX---块，数量控制在上限内）\n';
          prompt += '---FIX---\n';
          prompt += '【严重度】高/中/低\n';
          prompt += '【类别】' + profile.categories + '\n';
          prompt += '【问题】一句简短说明问题\n';
          prompt += '【位置】具体位置（世界观写设定板块；人设写角色名/关系；大纲写卷/阶段；细纲写第X章）\n';
          prompt += '【原文】\n' + '从原文中一字不差复制要修改的那一整段（30-300字）\n';
          prompt += '【改为】\n' + '修改后的完整新文字，必须更准确但不要明显扩写；长度控制在原文80%-125%，最多不超过原文增加80字\n';
          prompt += '---END---\n\n';
          prompt += '规则：\n';
          prompt += '- 【原文】必须从上述原文中一字不差复制，否则无法定位\n';
          prompt += '- 【改为】是替换原文的那一段完整新文字，要比原文更好\n';
          prompt += '- 精准体检，不追求问题越多越好；如果发现很多小问题，请合并筛选为最多 ' + maxIssues + ' 个---FIX---块\n';
          prompt += '- 所有---FIX---块放在评分报告之后；评分报告不要展开未落实的问题，所有问题都在---FIX---里展开\n';
          prompt += '- 严禁把原文越改越长：修改方式是替换、压缩、补准，不是扩写设定；总字数尽量持平\n';
          prompt += '- 不许写"无修改"或"基本完美"，不许为了凑数量制造新问题';
          showProgress('正在评价' + moduleName + '…', 20);
          _context9.n = 3;
          return callRealAPIWithFallback(prompt, null, 'quality_logic');
        case 3:
          result = _context9.v;
          updateProgress(80, '评价完成');
          _context9.n = 4;
          return _sleep(200);
        case 4:
          if (!result) {
            _context9.n = 9;
            break;
          }
          window._archEvalResult = result;
          window._archEvalContent = content;
          fixBtn = fixBtnEl();
          if (fixBtn) {
            fixBtn.style.display = 'inline-block';
            fixBtn.textContent = '🔥 按评价加强';
            fixBtn.disabled = false;
          }
          fixCount = countArchFixBlocksV55(result);
          reportedCount = parseArchIssueCountV55(result);
          targetCount = Math.min(maxIssues, Math.max(minIssues, reportedCount || 0)); // v55：如果出现“报告问题多，但FIX块少”，自动追问补齐可自动修改块
          if (!(fixCount > 0 && fixCount < targetCount)) {
            _context9.n = 8;
            break;
          }
          needCount = Math.min(30, targetCount) - fixCount;
          if (!(needCount > 0)) {
            _context9.n = 8;
            break;
          }
          showEvalFixStatusV53('warn', '📊 已精选关键问题目标 <b>' + targetCount + '</b> 处，但可自动修改只有 <b>' + fixCount + '</b> 处，正在补齐到合理数量…');
          showLoading('正在补齐可自动修改项...');
          _context9.p = 5;
          supplementPrompt = '你刚才的评价出现"问题多、可自动修改少"的情况。现在只补齐缺少的---FIX---块，不要重写评分报告。\n';
          supplementPrompt += '模块：' + moduleName + '\n';
          supplementPrompt += '目标可自动修改数：' + targetCount + '，当前已有：' + fixCount + '，还要补：' + needCount + '。不要超过目标数量。\n';
          supplementPrompt += '要求：\n';
          supplementPrompt += '- 只输出新的---FIX---块，不要输出解释、评分、总结\n';
          supplementPrompt += '- 每个新问题都必须有【原文】和【改为】，不能只写建议\n';
          supplementPrompt += '- 【原文】必须从原文中一字不差复制30-300字，否则无法自动替换\n';
          supplementPrompt += '- 不要重复已有修改块覆盖过的原文\n';
          supplementPrompt += '- 只补关键问题，不要扩写；【改为】长度控制在原文80%-125%，最多不超过原文增加80字\n\n';
          supplementPrompt += '【原文】\n' + content + '\n\n';
          supplementPrompt += '【已有修改块摘要（不要重复）】\n' + getArchExistingFixDigestV55(result) + '\n\n';
          supplementPrompt += '【模块专项标准】' + profile.name + '；只按该模块边界补齐：' + profile.scope + '\n';
          supplementPrompt += '【输出格式】\n---FIX---\n【严重度】高/中/低\n【类别】' + profile.categories + '\n【问题】一句简短说明问题\n【位置】具体位置\n【原文】\n从原文中一字不差复制要修改的那一整段\n【改为】\n修改后的完整新文字\n---END---';
          _context9.n = 6;
          return callRealAPIWithFallback(supplementPrompt, null, 'fill');
        case 6:
          extra = _context9.v;
          hideLoading(); // 补齐用loading（子任务）
          extraFixCount = countArchFixBlocksV55(extra);
          if (extra && extraFixCount > 0) {
            result = result + '\n\n【v55自动补齐修改块】\n' + extra;
            fixCount = countArchFixBlocksV55(result);
          }
          _context9.n = 8;
          break;
        case 7:
          _context9.p = 7;
          _t8 = _context9.v;
          hideLoading(); // 补齐异常
          console.warn('v55补齐修改块失败', _t8);
        case 8:
          window._archEvalResult = result;
          fixCount = countArchFixBlocksV55(result);
          reportedCount = parseArchIssueCountV55(result);
          if (fixCount > 0) {
            mismatchTip = reportedCount && reportedCount > maxIssues ? '；已从报告问题中精选关键修改 ' + fixCount + ' 处，避免越改越多' : reportedCount && fixCount < reportedCount ? '；报告问题 ' + reportedCount + ' 处，已补齐为可修改 ' + fixCount + ' 处' : '';
            showEvalFixStatusV53('info', '📊 全面体检完成：可参考修改 <b>' + fixCount + '</b> 处' + mismatchTip + '。点“按评价加强”会按完整评价报告整体强化内容。');
          } else {
            showEvalFixStatusV53('warn', '📊 体检完成但未生成可自动替换的修改块，可再点一次评价，系统会继续要求输出可修改块。');
          }
          showEvalResult(result, moduleName);
          _context9.n = 10;
          break;
        case 9:
          showToast('评价失败，请检查API配置');
        case 10:
          return _context9.a(2);
      }
    }, _callee9, null, [[5, 7]]);
  }));
  return _evaluateArchModule.apply(this, arguments);
}
function showEvalResult(text, moduleName) {
  // 提取评分报告和修改块
  var fixBlocks = [];
  var reportText = text;
  var parts = text.split(/---FIX---/);
  if (parts.length > 1) {
    reportText = parts[0].trim();
    for (var pi = 1; pi < parts.length; pi++) {
      var block = parts[pi];
      var endIdx = block.lastIndexOf('---END---');
      if (endIdx < 0) endIdx = block.length;else block = block.substring(0, endIdx);
      fixBlocks.push(block.trim());
    }
  }
  window._archEvalReportText = reportText;
  window._archEvalFixBlocks = fixBlocks.slice();
  var modal = document.getElementById('arch-eval-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'arch-eval-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999;display:none;align-items:center;justify-content:center;';
    modal.innerHTML = '<div style="background:#fff;border-radius:16px;padding:20px;width:90%;max-width:500px;max-height:85vh;overflow-y:auto;">' + '<div style="font-size:16px;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:8px;">' + '<span>📊 全面体检报告</span><span id="arch-eval-module" style="font-size:12px;color:#888;"></span></div>' + '<pre id="arch-eval-report" style="white-space:pre-wrap;font-size:13px;line-height:1.6;color:#333;font-family:inherit;background:#f9fafb;padding:12px;border-radius:8px;margin-bottom:12px;max-height:200px;overflow-y:auto;"></pre>' + '<div id="arch-eval-changes" style="margin-bottom:12px;"></div>' + '<div style="display:flex;gap:10px;">' + '<button onclick="applyArchEvalFix()" id="arch-apply-btn" style="flex:1;padding:10px;border:none;border-radius:8px;background:#6366f1;color:#fff;font-size:14px;cursor:pointer;">🔥 按评价加强</button>' + '<button onclick="document.getElementById(\'arch-eval-modal\').style.display=\'none\'" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;color:#666;font-size:14px;cursor:pointer;">关闭</button>' + '</div></div>';
    document.body.appendChild(modal);
  }
  var reportEl = document.getElementById('arch-eval-report');
  if (reportEl) reportEl.textContent = reportText || '（无评分报告）';
  var moduleEl = document.getElementById('arch-eval-module');
  if (moduleEl) moduleEl.textContent = '· ' + moduleName + ' ·';

  // 渲染修改预览列表
  var changesEl = document.getElementById('arch-eval-changes');
  if (fixBlocks.length > 0) {
    var reportedInReport = parseArchIssueCountV55(text);
    var html = '<div style="font-size:14px;font-weight:600;margin-bottom:8px;color:#f59e0b;">🔧 将修改 ' + fixBlocks.length + ' 处';
    if (reportedInReport && reportedInReport > fixBlocks.length) html += '（报告问题' + reportedInReport + '处，已精选关键项，避免越改越多）';
    html += '：</div><div style="font-size:12px;color:#888;margin:-4px 0 8px;">可删除不想参考的 AI 建议；点击“按评价加强”会根据剩余评价整体强化全文。</div>';
    for (var fi = 0; fi < fixBlocks.length; fi++) {
      var fb = fixBlocks[fi];
      var probMatch = fb.match(/【问题】\s*(.+?)(?=\n|【|$)/);
      var posMatch = fb.match(/【位置】\s*(.+?)(?=\n|【|$)/);
      var oldMatch = fb.match(/【原文】\s*([\s\S]*?)(?=【改为】|$)/);
      var newMatch = fb.match(/【改为】\s*([\s\S]*?)$/);
      var problem = probMatch ? probMatch[1].trim() : '待修改';
      var position = posMatch ? posMatch[1].trim() : '';
      var oldStr = oldMatch ? oldMatch[1].trim() : '';
      var newStr = newMatch ? newMatch[1].trim() : '';
      html += '<div style="border:1px solid #fde68a;border-radius:8px;padding:10px;margin-bottom:8px;background:#fffbeb;position:relative;">';
      html += '<button onclick="deleteArchEvalFixBlock(' + fi + ')" style="position:absolute;top:8px;right:8px;border:1px solid #fecaca;background:#fff;color:#dc2626;border-radius:999px;padding:3px 8px;font-size:11px;cursor:pointer;">删除</button>';
      html += '<div style="font-size:12px;font-weight:600;color:#92400e;margin-bottom:4px;padding-right:48px;">' + (fi + 1) + '. ' + problem;
      if (position) html += ' [' + position + ']';
      html += '</div>';
      if (oldStr) html += '<div style="font-size:11px;color:#999;margin-bottom:2px;">原文：</div><div style="font-size:11px;color:#ef4444;background:#fef2f2;padding:4px 8px;border-radius:4px;margin-bottom:4px;max-height:60px;overflow-y:auto;white-space:pre-wrap;">' + oldStr.substring(0, 150) + (oldStr.length > 150 ? '...' : '') + '</div>';
      if (newStr) html += '<div style="font-size:11px;color:#999;margin-bottom:2px;">改为：</div><div style="font-size:11px;color:#16a34a;background:#f0fdf4;padding:4px 8px;border-radius:4px;max-height:60px;overflow-y:auto;white-space:pre-wrap;">' + newStr.substring(0, 150) + (newStr.length > 150 ? '...' : '') + '</div>';
      html += '</div>';
    }
    changesEl.innerHTML = html;
    var applyBtn = document.getElementById('arch-apply-btn');
    if (applyBtn) {
      applyBtn.style.display = 'block';
      applyBtn.textContent = '🔥 按评价加强';
    }
  } else {
    changesEl.innerHTML = '<div style="font-size:13px;color:#999;text-align:center;padding:12px;">评价未生成具体修改建议</div>';
    var applyBtn = document.getElementById('arch-apply-btn');
    if (applyBtn) applyBtn.style.display = 'none';
  }
  modal.style.display = 'flex';
}
function rebuildArchEvalResultV59() {
  var report = window._archEvalReportText || '';
  var blocks = window._archEvalFixBlocks || [];
  var text = report;
  for (var i = 0; i < blocks.length; i++) {
    text += '\n\n---FIX---\n' + blocks[i].trim() + '\n---END---';
  }
  window._archEvalResult = text;
  return text;
}
function deleteArchEvalFixBlock(index) {
  var blocks = window._archEvalFixBlocks || [];
  if (index < 0 || index >= blocks.length) return;
  blocks.splice(index, 1);
  window._archEvalFixBlocks = blocks;
  var text = rebuildArchEvalResultV59();
  var moduleName = ARCH_MODULE_NAMES[currentArchModule] || '当前模块';
  showEvalResult(text, moduleName);
  var applyBtn = document.getElementById('arch-apply-btn');
  if (applyBtn) {
    if (blocks.length > 0) {
      applyBtn.style.display = 'block';
      applyBtn.textContent = '🔥 按评价加强';
    } else {
      applyBtn.style.display = 'none';
    }
  }
  showEvalFixStatusV53('info', '🗑 已删除 1 条不需要的 AI 修改，剩余 <b>' + blocks.length + '</b> 条会参与应用。');
}
function parseArchFixBlockV56(block, index) {
  var oldMatch = block.match(/【原文】\s*([\s\S]*?)(?=【改为】|$)/);
  var newMatch = block.match(/【改为】\s*([\s\S]*?)$/);
  var probMatch = block.match(/【问题】\s*(.+?)(?=\n|【|$)/);
  var oldStr = oldMatch ? oldMatch[1].replace(/---END---[\s\S]*$/g, '').trim() : '';
  var newStr = newMatch ? newMatch[1].replace(/---END---[\s\S]*$/g, '').trim() : '';
  return {
    index: index,
    block: block,
    oldStr: oldStr,
    newStr: newStr,
    problem: probMatch ? probMatch[1].trim() : '修改建议'
  };
}
function locateArchOldTextV56(original, oldStr) {
  if (!original || !oldStr) return null;
  var idx = original.indexOf(oldStr);
  if (idx >= 0) return {
    start: idx,
    end: idx + oldStr.length,
    mode: '精确'
  };
  var compactOld = oldStr.replace(/\s+/g, '');
  if (compactOld.length >= 24) {
    var compactOriginal = original.replace(/\s+/g, '');
    var compactIdx = compactOriginal.indexOf(compactOld);
    if (compactIdx >= 0) {
      var realStart = 0;
      var seen = 0;
      for (var ci = 0; ci < original.length; ci++) {
        if (!/\s/.test(original.charAt(ci))) {
          if (seen === compactIdx) {
            realStart = ci;
            break;
          }
          seen++;
        }
      }
      var realEnd = realStart;
      var need = compactOld.length;
      var got = 0;
      while (realEnd < original.length && got < need) {
        if (!/\s/.test(original.charAt(realEnd))) got++;
        realEnd++;
      }
      return {
        start: realStart,
        end: realEnd,
        mode: '忽略空白'
      };
    }
  }
  var head = oldStr.substring(0, Math.min(70, oldStr.length)).trim();
  var tail = oldStr.substring(Math.max(0, oldStr.length - 70)).trim();
  if (head.length >= 20) {
    var hIdx = original.indexOf(head);
    if (hIdx >= 0) {
      if (tail.length >= 20) {
        var tIdx = original.indexOf(tail, hIdx + head.length);
        if (tIdx >= 0 && tIdx - hIdx < Math.max(1200, oldStr.length * 3)) {
          return {
            start: hIdx,
            end: tIdx + tail.length,
            mode: '首尾锚点'
          };
        }
      }
      return {
        start: hIdx,
        end: Math.min(original.length, hIdx + oldStr.length),
        mode: '头部锚点'
      };
    }
  }
  var lines = oldStr.split(/\n+/).map(function (x) {
    return x.trim();
  }).filter(function (x) {
    return x.length >= 18;
  });
  lines.sort(function (a, b) {
    return b.length - a.length;
  });
  for (var li = 0; li < Math.min(lines.length, 5); li++) {
    var lineIdx = original.indexOf(lines[li]);
    if (lineIdx >= 0) {
      return {
        start: lineIdx,
        end: Math.min(original.length, lineIdx + oldStr.length),
        mode: '关键行锚点'
      };
    }
  }
  return null;
}
function buildArchFixPlanV56(original, fixBlocks) {
  var located = [];
  var failed = [];
  var invalid = 0;
  for (var i = 0; i < fixBlocks.length; i++) {
    var item = parseArchFixBlockV56(fixBlocks[i], i);
    if (!item.oldStr || !item.newStr || item.oldStr === item.newStr) {
      invalid++;
      failed.push(item);
      continue;
    }
    if (item.oldStr.length > 40 && item.newStr.length > item.oldStr.length * 1.45 + 80) {
      item.tooLong = true;
      invalid++;
      failed.push(item);
      continue;
    }
    var loc = locateArchOldTextV56(original, item.oldStr);
    if (!loc) {
      failed.push(item);
      continue;
    }
    item.start = loc.start;
    item.end = loc.end;
    item.mode = loc.mode;
    located.push(item);
  }
  located.sort(function (a, b) {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - b.start - (a.end - a.start);
  });
  var merged = [];
  var mergedCount = 0;
  for (var j = 0; j < located.length; j++) {
    var cur = located[j];
    var last = merged.length ? merged[merged.length - 1] : null;
    if (last && cur.start < last.end) {
      mergedCount++;
      last.coveredBlocks = last.coveredBlocks || [last.index];
      last.coveredBlocks.push(cur.index);
      var lastSpan = last.end - last.start;
      var curSpan = cur.end - cur.start;
      if (curSpan > lastSpan || cur.newStr.length > last.newStr.length) {
        last.newStr = cur.newStr;
        last.problem = cur.problem;
        last.end = Math.max(last.end, cur.end);
        last.mode = last.mode + '+合并';
      } else {
        last.end = Math.max(last.end, cur.end);
      }
      continue;
    }
    merged.push(cur);
  }
  return {
    replacements: merged,
    failed: failed,
    invalid: invalid,
    mergedCount: mergedCount,
    locatedCount: located.length
  };
}
function cleanStrengthenedArchTextV62(text, moduleName) {
  text = String(text || '').trim();
  text = text.replace(/^```(?:text|markdown|md)?\s*/i, '').replace(/```$/g, '').trim();
  text = text.replace(/^【加强后全文】\s*/g, '').replace(/^【按评价加强后】\s*/g, '').trim();
  text = text.replace(/^以下是[\s\S]{0,80}?(?:：|:\n)/, '').trim();
  if (moduleName) {
    var re = new RegExp('^【?' + moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '】?\\s*[:：]?\\s*');
    text = text.replace(re, '').trim();
  }
  return text;
}

// v62：按评价加强，不再只是机械套用FIX替换
function fixArchModule() {
  return _fixArchModule.apply(this, arguments);
} // 辅助：从细纲中提取与评价相关的章节
function _fixArchModule() {
  _fixArchModule = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
    var work, moduleName, profile, fixBtnRunning, original, evalText, modal, strengthenPrompt, strengthened, fixBtn, _t9;
    return _regenerator().w(function (_context0) {
      while (1) switch (_context0.p = _context0.n) {
        case 0:
          work = getWork();
          if (work) {
            _context0.n = 1;
            break;
          }
          return _context0.a(2);
        case 1:
          moduleName = ARCH_MODULE_NAMES[currentArchModule] || '当前模块';
          profile = ARCH_EVAL_PROFILE[currentArchModule] || ARCH_EVAL_PROFILE.world;
          showEvalFixStatusV53('info', '🔥 正在按评价加强当前' + moduleName + '，请稍等…');
          fixBtnRunning = fixBtnEl();
          if (fixBtnRunning) {
            fixBtnRunning.disabled = true;
            fixBtnRunning.textContent = '加强中…';
          }
          original = getCurrentArchFullContentV53();
          if ((!original || original.length < 10) && work._cardData && work._cardData[currentArchModule] && typeof cardToFreeText === 'function') {
            original = cardToFreeText(currentArchModule, work._cardData[currentArchModule]);
          }
          if (original) {
            _context0.n = 2;
            break;
          }
          showToast('没有内容可加强');
          if (fixBtnRunning) {
            fixBtnRunning.disabled = false;
            fixBtnRunning.textContent = '🔥 按评价加强';
          }
          return _context0.a(2);
        case 2:
          evalText = window._archEvalResult || '';
          if (evalText) {
            _context0.n = 3;
            break;
          }
          showEvalFixStatusV53('warn', '⚠️ 还没有评价结果。请先点击“评价”，等评价报告出来后再按评价加强。');
          if (fixBtnRunning) {
            fixBtnRunning.disabled = false;
            fixBtnRunning.textContent = '🔥 按评价加强';
          }
          showToast('请先进行评价');
          return _context0.a(2);
        case 3:
          modal = document.getElementById('arch-eval-modal');
          if (modal) modal.style.display = 'none';
          strengthenPrompt = '你是资深网文编辑兼' + profile.role + '。请根据评价报告，对当前【' + moduleName + '】做整体加强，而不是机械替换几段文字。\n';
          strengthenPrompt += '【模块边界】' + profile.scope + '\n';
          strengthenPrompt += '【不要做】' + profile.avoid + '\n\n';
          strengthenPrompt += '【原文】\n' + original + '\n\n';
          strengthenPrompt += '【评价报告与修改建议】\n' + evalText + '\n\n';
          strengthenPrompt += '【加强要求】\n';
          strengthenPrompt += '- 必须吸收评价里的核心问题，整体补强逻辑、具体性、承接和可写作性\n';
          strengthenPrompt += '- 不要只照抄FIX块，不要只替换局部句子，要让全文前后更顺、更扎实\n';
          strengthenPrompt += '- 严格按当前模块标准加强：世界观只加强设定体系；人设只加强角色；大纲只加强长篇结构；细纲只加强章节执行\n';
          strengthenPrompt += '- 保留原有有效内容、标题顺序和主要设定，不要推翻重写\n';
          strengthenPrompt += '- 控制字数：整体长度保持在原文80%-130%，不要越改越膨胀\n';
          strengthenPrompt += '【针对性修改策略——根据评价问题类型采取不同加强方式】\n';
          if (currentArchModule === 'world') {
            strengthenPrompt += '- 势力关系缺少因果链→补充具体的历史事件说明势力对立/结盟的原因\n';
            strengthenPrompt += '- 等级体系缺少稀缺度→为每个境界补充稀缺比例和突破代价\n';
            strengthenPrompt += '- 地理节点缺少感官特征→补充声音/气味/光线/温度等感官描写\n';
            strengthenPrompt += '- 缺少世界运转逻辑→补充一段"世界靠什么维持运转、资源如何分配、权力如何更迭、底层人如何生存"\n';
            strengthenPrompt += '- 核心矛盾不具体→将泛泛的"世界动荡"改为具体的"谁和谁因为什么资源/信仰/历史而对立"\n';
            strengthenPrompt += '- 势力之间缺少互动→补充具体的贸易/战争/暗杀/联姻等互动事件\n';
          } else if (currentArchModule === 'chars') {
            strengthenPrompt += '- 内在矛盾不具体→将"内心挣扎"改为具体的矛盾描述（如"渴望自由但背负家族使命"）\n';
            strengthenPrompt += '- 关系网缺少驱动力→为每条关系补充"A需要B的什么"\n';
            strengthenPrompt += '- 缺少隐藏关系→增加1-2条前期读者不知道的关系\n';
            strengthenPrompt += '- 视觉标签不鲜明→为每个角色补充1个让人过目不忘的视觉特征\n';
            strengthenPrompt += '- 说话风格不差异化→为每个角色补充一句典型台词来展示语言风格\n';
            strengthenPrompt += '- 能力缺少代价→为角色的核心能力补充限制和代价\n';
            strengthenPrompt += '- 创伤只是背景板→将创伤与当前行为模式关联起来\n';
          } else if (currentArchModule === 'outline') {
            strengthenPrompt += '- 卷间缺少因果衔接→补充"上卷的什么事件直接导致了本卷的发生"\n';
            strengthenPrompt += '- 主角成长维度重复→确保每卷成长在不同维度（能力/认知/关系），不能每卷都是"变强了"\n';
            strengthenPrompt += '- 爽点类型未标注→为每个爽点标注具体类型（打脸/突破/真相揭露/逆袭/获宝）\n';
            strengthenPrompt += '- 信息增量缺失→补充每个阶段读者会新知道什么\n';
            strengthenPrompt += '- 卷末钩子力度不够→加强每卷末的悬念/危机/未决之事\n';
            strengthenPrompt += '- 阶段间缺少因果链→确保阶段内事件有因果递进（A导致B，B引发C）\n';
          } else if (currentArchModule === 'detail') {
            strengthenPrompt += '- 节拍类型重复→调整连续3章以上的同种节拍，确保多样性\n';
            strengthenPrompt += '- 冲突类型笼统→标注具体类型（人际/势力/内心/环境/信息差/资源争夺）\n';
            strengthenPrompt += '- 信息增量为空→补充每章读者看完新知道的东西\n';
            strengthenPrompt += '- 场景缺少感官细节→补充声音/气味/光线/温度/触感等感官描写\n';
            strengthenPrompt += '- 情绪曲线缺失或重复→补充每章的情绪曲线（开篇→中段→结尾），确保与前后章不同\n';
            strengthenPrompt += '- 冲突一步到位→补充2-3步冲突升级过程\n';
          }
          strengthenPrompt += '- 只输出加强后的完整' + moduleName + '正文，不要输出解释、评分、Markdown代码块或修改清单';
          showProgress('正在按评价加强' + moduleName + '…', 30);
          _context0.p = 4;
          _context0.n = 5;
          return callRealAPIWithFallback(strengthenPrompt, null, 'polish');
        case 5:
          strengthened = _context0.v;
          updateProgress(90, '加强完成');
          _context0.n = 6;
          return _sleep(200);
        case 6:
          strengthened = cleanStrengthenedArchTextV62(strengthened, moduleName);
          if (!(!strengthened || strengthened.length < 20)) {
            _context0.n = 7;
            break;
          }
          throw new Error('加强结果为空');
        case 7:
          if (currentArchModule === 'detail' && typeof finishDetailOutlineForWork === 'function') {
            strengthened = finishDetailOutlineForWork(work, strengthened, 1);
          }
          applyFixResult(strengthened);
          work[currentArchModule] = strengthened;
          try {
            parseResultToCardData(work, currentArchModule, strengthened);
          } catch (pe) {}
          if (currentArchModule === 'outline' || currentArchModule === 'detail') {
            try {
              syncCharactersFromText(work, strengthened);
            } catch (se) {}
          }
          saveWork(work);
          clearDirty(currentArchModule);
          window._archEvalResult = null;
          window._archEvalContent = '';
          window._archEvalFixBlocks = [];
          window._archEvalReportText = '';
          fixBtn = fixBtnEl();
          if (fixBtn) {
            fixBtn.style.display = 'none';
            fixBtn.disabled = false;
            fixBtn.textContent = '🔥 按评价加强';
          }
          updateProgress(100, '加强完成');
          _context0.n = 8;
          return _sleep(200);
        case 8:
          hideProgress();
          showEvalFixStatusV53('success', '✅ 按评价加强完成：已根据完整评价报告强化 <b>' + moduleName + '</b>。<br>内容已写入当前编辑区并保存。');
          showToast('✅ 已按评价加强' + moduleName, 4500);
          renderArchModule();
          _context0.n = 10;
          break;
        case 9:
          _context0.p = 9;
          _t9 = _context0.v;
          hideProgress();
          console.warn('按评价加强失败', _t9);
          if (fixBtnRunning) {
            fixBtnRunning.disabled = false;
            fixBtnRunning.textContent = '🔥 按评价加强';
          }
          showEvalFixStatusV53('error', '❌ 按评价加强失败：' + (_t9 && _t9.message ? _t9.message : '请稍后重试'));
          showToast('按评价加强失败，请重试', 4500);
        case 10:
          return _context0.a(2);
      }
    }, _callee0, null, [[4, 9]]);
  }));
  return _fixArchModule.apply(this, arguments);
}
function extractRelevantChapters(detailText, evalText) {
  var lines = detailText.split('\n');
  // 提取评价中提到的章节号
  var mentionedChs = [];
  var chMatch = evalText.match(/第([一二三四五六七八九十\d百千]+)章/g);
  if (chMatch) mentionedChs = chMatch;
  if (mentionedChs.length === 0) {
    // 没有具体章节号，返回前300行+尾200行
    var head = lines.slice(0, 300).join('\n');
    var tail = lines.slice(-200).join('\n');
    return head + '\n\n...（中间省略）...\n\n' + tail;
  }

  // 找出评价提到章节附近的上下文
  var targetIdx = [];
  for (var i = 0; i < lines.length; i++) {
    for (var j = 0; j < mentionedChs.length; j++) {
      if (lines[i].indexOf(mentionedChs[j]) >= 0 && lines[i].trim().indexOf('第') === 0) {
        targetIdx.push(i);
        break;
      }
    }
  }
  if (targetIdx.length === 0) {
    return lines.slice(0, 300).join('\n') + '\n\n...\n\n' + lines.slice(-200).join('\n');
  }

  // 收集相关行
  var collected = {};
  for (var k = 0; k < targetIdx.length; k++) {
    var start = Math.max(0, targetIdx[k] - 5);
    var end = Math.min(lines.length, targetIdx[k] + 10);
    for (var li = start; li < end; li++) collected[li] = lines[li];
  }
  var result = [];
  var keys = Object.keys(collected).sort(function (a, b) {
    return parseInt(a) - parseInt(b);
  });
  for (var ki = 0; ki < keys.length; ki++) result.push(collected[keys[ki]]);
  return result.join('\n') + '\n\n（仅显示评价涉及的章节附近内容）';
}

// 辅助：将修改结果写入编辑区
function applyFixResult(text) {
  setCurrentArchFullContentV53(text);
}

// 删除当前模块的 AI 生成内容：只清空生成正文/缓存，不清空构思输入
function deleteCurrentAIGeneration() {
  var work = getWork();
  if (!work) {
    showToast('请先选择作品');
    return;
  }
  var module = currentArchModule || 'world';
  var moduleName = ARCH_MODULE_NAMES[module] || '当前模块';
  var raw = document.getElementById('raw-' + module);
  var existing = '';
  if (module !== 'detail' && typeof getArchFullTextV52 === 'function') existing = getArchFullTextV52(module);else existing = raw && raw.value || work[module] || '';
  if (!existing || !String(existing).trim()) {
    showToast(moduleName + '暂无 AI 生成内容可删除');
    return;
  }
  window._lastDeletedArchGenerationV61 = {
    module: module,
    moduleName: moduleName,
    text: String(existing || ''),
    cardData: work._cardData && work._cardData[module] ? JSON.parse(JSON.stringify(work._cardData[module])) : null,
    status: work.archStatus ? work.archStatus[module] : null,
    detailQuality: module === 'detail' && work._detailQuality ? JSON.parse(JSON.stringify(work._detailQuality)) : null,
    detailAgentReports: module === 'detail' && work._detailAgentReports ? JSON.parse(JSON.stringify(work._detailAgentReports)) : null,
    chapterCards: module === 'detail' && work._chapterCards ? JSON.parse(JSON.stringify(work._chapterCards)) : null
  };
  if (raw) {
    raw.value = '';
    _archFullTextV52[module] = '';
    if (raw.dataset) {
      raw.dataset.fullText = '';
      raw.dataset.displayPaged = '';
      raw.dataset.pageStart = '0';
      raw.dataset.pageEnd = '0';
      raw.dataset.pageIndex = '0';
    }
    try {
      autoGrowArchTextarea(raw);
    } catch (e) {}
  }
  if (module !== 'detail' && typeof setArchFullTextV52 === 'function') {
    setArchFullTextV52(module, '', false);
  }
  var pager = module === 'detail' ? document.getElementById('detail-pager') : archDisplayPagerEl(module);
  if (pager) pager.style.display = 'none';
  var info = archDisplayInfoEl(module);
  if (info) info.textContent = '第1/1页';
  work[module] = '';
  if (work._cardData && work._cardData[module]) delete work._cardData[module];
  if (work.archStatus) work.archStatus[module] = 'pending';
  if (module === 'detail') {
    _detailPage = {
      idx: 0,
      size: 100
    };
    delete work._detailQuality;
    delete work._detailAgentReports;
    delete work._chapterCards;
  }
  if (module === 'outline' && work._skeletons) {
    delete work._skeletons.outline;
  }
  if (module === 'world' && work._skeletons) {
    delete work._skeletons.world;
  }
  window._archEvalResult = null;
  window._archEvalContent = '';
  window._archEvalFixBlocks = [];
  window._archEvalReportText = '';
  clearDirty(module);
  saveWork(work);
  renderArchModule();
  showToast('已删除' + moduleName + '的 AI 生成内容，构思已保留');
  showArchDeleteUndoBarV61(moduleName);
}
function showArchDeleteUndoBarV61(moduleName) {
  var bar = ensureEvalFixStatusBarV53();
  bar.style.display = 'block';
  bar.style.background = '#fffbeb';
  bar.style.borderColor = '#fde68a';
  bar.style.color = '#92400e';
  bar.innerHTML = '🗑 已删除 <b>' + he(moduleName) + '</b> 的 AI 生成内容，构思已保留。' + '<button onclick="undoDeleteCurrentAIGeneration()" style="margin-left:8px;padding:4px 10px;border:1px solid #f59e0b;border-radius:999px;background:#fff;color:#92400e;font-size:12px;cursor:pointer;">撤销</button>';
}
function undoDeleteCurrentAIGeneration() {
  var snap = window._lastDeletedArchGenerationV61;
  var work = getWork();
  if (!snap || !work) {
    showToast('没有可撤销的删除');
    return;
  }
  var module = snap.module;
  work[module] = snap.text || '';
  if (!work._cardData) work._cardData = {};
  if (snap.cardData) work._cardData[module] = snap.cardData;
  if (!work.archStatus) work.archStatus = {};
  work.archStatus[module] = snap.status || 'draft';
  if (module === 'detail') {
    if (snap.detailQuality) work._detailQuality = snap.detailQuality;
    if (snap.detailAgentReports) work._detailAgentReports = snap.detailAgentReports;
    if (snap.chapterCards) work._chapterCards = snap.chapterCards;
  }
  var raw = document.getElementById('raw-' + module);
  if (raw) {
    raw.value = snap.text || '';
    if (raw.dataset) raw.dataset.fullText = snap.text || '';
    _archFullTextV52[module] = snap.text || '';
  }
  saveWork(work);
  switchArchModule(module);
  window._lastDeletedArchGenerationV61 = null;
  showToast('已撤销删除，内容已恢复');
  showEvalFixStatusV53('success', '✅ 已恢复 <b>' + he(snap.moduleName || '当前模块') + '</b> 的 AI 生成内容。');
}

// 挂载到全局
window.evaluateArchModule = evaluateArchModule;
window.fixArchModule = fixArchModule;
window.applyArchEvalFix = fixArchModule;
window.deleteArchEvalFixBlock = deleteArchEvalFixBlock;
window.deleteCurrentAIGeneration = deleteCurrentAIGeneration;
window.undoDeleteCurrentAIGeneration = undoDeleteCurrentAIGeneration;
window.ARCH_MODULES = ARCH_MODULES;
window.ARCH_MODULE_NAMES = ARCH_MODULE_NAMES;
window.currentArchModule = currentArchModule;
window.archModuleStatus = archModuleStatus;
window.switchArchModule = switchArchModule;

// ========== v46：细纲商业补强 ==========
function strengthenDetailOutlineV46() {
  var work = getWork();
  if (!work) {
    showToast('请先新建或选择作品');
    return;
  }
  switchArchModule && switchArchModule('detail');
  var ta = document.getElementById('raw-detail');
  var text = ta ? ta.value : work.detail || '';
  if (!text || text.trim().length < 20) {
    showToast('请先生成或导入细纲');
    return;
  }
  var normalized = normalizeDetailOutline(text, 1);
  var q1 = analyzeDetailOutlineQuality(normalized);
  var lines = normalized.split('\n');

  // 构建变体填充池——不再是统一模板
  var readerExpectPool = ['主角的[选择/行动]将如何改变局势？', '上一章留下的[悬念/线索]在本章如何展开？', '主角面临[困境]，他/她能否用[非武力方式]破局？', '关键信息即将揭露，主角能否在[时限]前获得？', '[对手]设下的陷阱已经到位——主角会如何应对？'];
  var payPointPool = ['主角做出了一个令人意外的关键选择', '隐藏的身份/关系被揭示', '实力/能力出现突破性进展', '长期伏笔在此回收', '情绪爆发：主角为[某人/某事]做出了极端的行动'];
  var conflictIntensityPool = ['2级：有阻力但可以周旋，风险可控', '3级：有明确阻力和失败代价，必须主动应对', '4级：涉及生命/重要人物的安全，压力从多方向夹击', '3级：看似是战斗冲突，实质是信息/信任危机', '2级：外部环境施压，角色没有直接敌人但步步艰难'];
  var infoGainPool = ['发现[关键线索]，指向更大的阴谋', '获得一项新资源/能力/道具，但有使用限制', '人物关系出现意外转折（同盟/背叛/误解）', '世界规则/力量体系的新一面被揭示', '前文的某处细节在此产生了新的意义'];
  var poisonRiskPool = ['避免主角被动等待救援——他/她必须做出一个主动选择', '避免冲突解决过于简单——有代价而不是轻松搞定', '避免信息量不足——本章必须有至少一项读者不知道的新信息', '避免节奏雷同——如果上一章是战斗，本章换一种冲突形式'];
  var breakPointPool = ['卡在主角发现关键线索但还没来得及解读的瞬间', '卡在新敌人/新威胁出现的第一眼', '卡在主角做出一个所有人都不理解的决定时', '卡在主角意识到自己算漏了什么——读者的心也跟着悬起来'];
  var out = lines.map(function (line, idx) {
    if (!/^\s*第[一二三四五六七八九十百千\d]+章/.test(line)) return line;
    var t = normalizeDetailLine(line, idx + 1);
    function has(k) {
      return t.indexOf(k + '：') >= 0 || t.indexOf(k + ':') >= 0;
    }
    // 基于章节序号的变体轮换
    var pi = idx % 5;
    function add(k, pool) {
      if (!has(k)) t += ' | ' + k + '：[' + (Array.isArray(pool) ? pool[pi % pool.length] : pool) + ']';
    }
    add('读者期待', readerExpectPool);
    add('付费点', payPointPool);
    add('冲突强度', conflictIntensityPool);
    add('信息增量', infoGainPool);
    add('毒点风险', poisonRiskPool);
    add('断章位置', breakPointPool);
    return t;
  }).join('\n');
  out = normalizeDetailOutline(out, 1);
  if (ta) ta.value = out;
  work.detail = out;
  syncDetailToChapterCards(work, out);
  DB.saveWork ? DB.saveWork(work) : saveWork(work);
  var q2 = analyzeDetailOutlineQuality(out);
  showToast('✅ 细纲补强完成：' + q1.score + '分 → ' + q2.score + '分', 4500);
}
window.strengthenDetailOutlineV46 = strengthenDetailOutlineV46;
window.saveArchModule = saveArchModule;
window.confirmSave = confirmSave;
window.cancelSave = cancelSave;
window.generateArchModule = generateArchModule;
window.generateAllPipeline = generateAllPipeline; // BUG-02 fix: 暴露到全局，HTML onclick 才能调用
window.saveModuleIdea = saveModuleIdea;
window.initArchPage = initArchPage;
window.updateCountSelector = updateCountSelector;
window.generateDetailByVolumes = generateDetailBySelectedVolumes;
window.generateDetailBySelectedVolumes = generateDetailBySelectedVolumes;
window.extractVolumeInfo = extractVolumeInfo;
window.getSelectedPlatform = getSelectedPlatform;
window.setPlatform = setPlatform;
window.showProgress = showProgress;
window.hideProgress = hideProgress;
window.cancelGeneration = cancelGeneration;
window.syncCharactersFromText = syncCharactersFromText;
window.countCharacters = countCharacters;
window.PLATFORM_CONFIG = PLATFORM_CONFIG;

// ========== 细纲文本导入功能 ==========
function hideImportArea() {
  var area = document.getElementById('detail-import-area');
  if (area) area.style.display = 'none';
  var text = document.getElementById('detail-import-text');
  if (text) text.value = '';
}
window.hideImportArea = hideImportArea;
function importDetailText() {
  var work = getWork();
  if (!work) {
    showToast('请先选择作品');
    return;
  }
  var textArea = document.getElementById('detail-import-text');
  if (!textArea || !textArea.value.trim()) {
    showToast('请先粘贴细纲内容');
    return;
  }
  var text = textArea.value.trim();

  // 写入当前编辑区
  var rawArea = rawEditArea();
  if (rawArea) {
    rawArea.value = text;
    rawArea.style.display = 'block';
  }
  work[currentArchModule] = text;
  saveWork(work);

  // 提取角色名
  syncCharactersFromText(work, text);

  // 隐藏导入区
  hideImportArea();
  clearDirty(currentArchModule);
  renderArchModule();
  showToast('✅ 细纲导入成功');
}
window.importDetailText = importDetailText;

// 离开页面前自动将编辑区内容同步到work对象
window.addEventListener('beforeunload', function () {
  var work = getWork();
  if (!work) return;
  var ideaInput = ideaEl();
  if (ideaInput) saveModuleIdea(currentArchModule, ideaInput.value || '');
  var editArea = rawAreaEl();
  if (!editArea || !editArea.value.trim()) return;
  // 自动保存当前编辑内容到work
  work[currentArchModule] = editArea.value.trim();
  try {
    DB.saveWork(work);
  } catch (e) {}
});

// === 尝试从AI生成文本中提取结构化卡片数据 ===
function parseResultToCardData(work, module, text) {
  if (!work._cardData) work._cardData = {};
  if (!work._cardData[module]) work._cardData[module] = {};
  var cd = work._cardData[module];
  if (module === 'outline') {
    // 尝试提取卷数
    var volMatch = text.match(/(\d+)\s*卷/);
    if (volMatch) cd.volumes = parseInt(volMatch[1]);
  }
  // 其他模块暂不做结构化解析，纯文本已足够作为AI约束
}