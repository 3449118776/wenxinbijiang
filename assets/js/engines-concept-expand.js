/* 文心笔匠 v2 增强引擎 - 概念自动展开引擎 */
/*
 * 引擎对象：ConceptExpansionEngine
 * 功能定位：从一句话概念 → 结构化骨架
 * 引擎是纯规则/关键词驱动的"大纲骨架建议器"，不使用 AI 生成，
 * 为作者提供"构思起点"——作者在此基础上修改、补充、生成真正的细纲。
 *
 * 入口方法：
 *   1. analyzeConcept(conceptText)        — 关键词提取
 *   2. selectTemplate(analysis, platform)  — 匹配 2-3 个骨架模板
 *   3. expandToVolumeOutline(concept, template, platform) — 生成多卷大纲骨架
 *   4. suggestCoreCharacters(concept, template)           — 生成角色骨架提示
 *   5. suggestCoreConflictsChain(template, volumeCount)   — 核心矛盾链
 *   6. generateInfoIncrementPlan(analysis, template)      — 信息增量规划
 *   7. fullExpansion(concept, platform, volumeCount)      — 综合入口
 */

// ========== 关键词信号库（中文题材/身份/金手指/冲突/场景/风格） ==========
var _CE_SIGNAL_LIBRARY = {
  // 题材信号 — 每一类用关键词正则数组匹配
  genre: [
    { key: '玄幻', words: ['玄幻', '灵气', '修炼', '境界', '宗门', '功法', '秘境', '洞天', '气运', '大陆'] },
    { key: '仙侠', words: ['修仙', '飞升', '飞剑', '灵根', '道心', '元婴', '金丹', '天劫', '仙缘', '因果'] },
    { key: '都市', words: ['都市', '城市', '职场', '商场', '豪门', '异能', '系统', '老板', '总裁', '创业'] },
    { key: '历史', words: ['历史', '王朝', '朝廷', '世家', '兵马', '古代', '东汉', '三国', '唐朝', '明朝', '穿越回', '乱世'] },
    { key: '末世', words: ['末世', '丧尸', '废土', '变异', '幸存者', '末日前', '末日', '感染', '辐射'] },
    { key: '科幻', words: ['科幻', '星际', '机甲', '宇宙', '基因', '人工智能', 'AI', '未来', '赛博', '银河'] },
    { key: '武侠', words: ['武侠', '江湖', '门派', '武功', '内力', '剑法', '武林', '镖局', '侠客', '帮派'] },
    { key: '言情', words: ['言情', '恋爱', '暗恋', '豪门千金', '霸总', '契约婚姻', '心动', '告白', '感情线'] },
    { key: '悬疑', words: ['悬疑', '推理', '破案', '凶手', '线索', '侦探', '调查', '灵异', '诅咒', '凶案'] },
    { key: '游戏', words: ['游戏', '系统', '面板', '任务', '副本', '玩家', 'NPC', '技能树', '网游', '电竞'] },
    { key: '规则怪谈', words: ['规则', '禁忌', '副本', '收容', '异常', '污染', 'san值'] },
    { key: '经营建设', words: ['经营', '种田', '建设', '贸易', '商会', '殖民地', '发展势力', '资源', '基建'] }
  ],
  // 主角身份/状态信号
  protagonist: [
    { key: '放逐', words: ['放逐', '流放', '赶出家门', '逐出', '遗弃', '荒村'] },
    { key: '废柴', words: ['废柴', '废物', '无法修炼', '废灵根', '废物少爷', '被看不起'] },
    { key: '天才', words: ['天才', '天纵奇才', '天之骄子', '惊才绝艳', '第一'] },
    { key: '重生', words: ['重生', '重生回', '回到过去', '前世', '重来一次', '弥补遗憾'] },
    { key: '穿越', words: ['穿越', '穿越到', '异世', '异世界', '魂穿', '身穿'] },
    { key: '失忆', words: ['失忆', '失去记忆', '忘了自己是谁', '身份成谜'] },
    { key: '孤儿', words: ['孤儿', '父母双亡', '被收养', '身世不明'] },
    { key: '落魄', words: ['落魄', '家道中落', '一贫如洗', '穷困潦倒', '流浪'] },
    { key: '天之骄子', words: ['天之骄子', '嫡子', '少主', '继承人', '名门'] },
    { key: '隐藏身份', words: ['隐藏身份', '伪装', '秘密身份', '双面', '马甲', '其实是'] }
  ],
  // 金手指/核心机制信号
  powerMechanism: [
    { key: '系统', words: ['系统', '面板', '任务奖励', '数值化', '签到', '打卡'] },
    { key: '传承', words: ['传承', '上古', '祖师', '血脉传承', '古老的力量', '继承'] },
    { key: '空间', words: ['空间', '储物', '随身空间', '空间戒指', '灵田', '小世界'] },
    { key: '天赋', words: ['天赋', '先天道体', '特殊体质', '天生', '异象'] },
    { key: '血脉', words: ['血脉', '龙族', '神兽', '返祖', '觉醒血脉'] },
    { key: '功法', words: ['功法', '秘籍', '心法', '残卷', '神秘功法'] },
    { key: '异能', words: ['异能', '超能力', '觉醒', '精神力', '念力', '元素'] },
    { key: '时间', words: ['时间', '时光', '回溯', '预知', '重来', '时间倒流'] },
    { key: '重生优势', words: ['先知', '信息差', '前世记忆', '知道未来'] },
    { key: '游戏面板', words: ['游戏面板', '经验值', '等级', '技能', '装备', 'HP', 'MP'] }
  ],
  // 核心冲突信号
  conflict: [
    { key: '复仇', words: ['复仇', '报仇', '血仇', '灭门', '报复'] },
    { key: '颠覆', words: ['颠覆', '推翻', '逆天', '反叛', '反抗'] },
    { key: '拯救', words: ['拯救', '救赎', '挽救', '拯救世界', '救世'] },
    { key: '守护', words: ['守护', '保护', '守护家人', '守护爱人', '保卫'] },
    { key: '登顶', words: ['登顶', '登顶之路', '称王', '称帝', '称霸', '天下第一'] },
    { key: '寻找', words: ['寻找', '找寻', '查探', '追查', '寻找真相'] },
    { key: '解谜', words: ['解谜', '解密', '揭开真相', '真相是', '谜团'] },
    { key: '逃亡', words: ['逃亡', '追杀', '被追杀', '逃命', '流亡'] },
    { key: '生存', words: ['生存', '求生', '活下去', '活下来', '挣扎求存'] },
    { key: '逆袭', words: ['逆袭', '翻身', '打脸', '崛起', '扬眉吐气'] }
  ],
  // 起点场景信号
  setting: [
    { key: '家族', words: ['家族', '家宅', '大宅', '分家', '主家', '世家'] },
    { key: '宗门', words: ['宗门', '门派', '山门', '弟子', '外门', '内门'] },
    { key: '校园', words: ['校园', '学校', '学院', '班级', '老师', '同学'] },
    { key: '城市', words: ['城市', '都市', '街区', '公司', '写字楼'] },
    { key: '废墟', words: ['废墟', '废弃', '遗迹', '遗址', '破旧', '古城'] },
    { key: '战场', words: ['战场', '军营', '前线', '战争', '军营'] },
    { key: '山林', words: ['山林', '深山', '山脉', '山谷', '村落', '小镇'] },
    { key: '小镇', words: ['小镇', '村庄', '荒村', '偏远', '边陲'] },
    { key: '星舰', words: ['星舰', '飞船', '空间站', '殖民', '外星'] },
    { key: '皇宫', words: ['皇宫', '皇城', '宫殿', '朝堂', '京城'] }
  ],
  // 风格信号
  style: [
    { key: '黑暗', words: ['黑暗', '压抑', '残酷', '血腥', '绝望', '黑暗风格'] },
    { key: '热血', words: ['热血', '燃', '战斗', '火爆', '激情'] },
    { key: '轻松', words: ['轻松', '悠闲', '日常', '佛系', '慢节奏'] },
    { key: '搞笑', words: ['搞笑', '欢乐', '沙雕', '吐槽', '玩梗'] },
    { key: '理性', words: ['理性', '冷静', '智谋', '算计', '思考', '逻辑'] },
    { key: '冷酷', words: ['冷酷', '杀伐', '狠辣', '无情', '果决'] },
    { key: '温暖', words: ['温暖', '治愈', '温情', '感动', '人情味'] },
    { key: '爽文', words: ['爽文', '装逼', '打脸', '无敌流', '一路横推'] },
    { key: '正剧', words: ['正剧', '严肃', '宏大叙事', '史诗', '厚重'] },
    { key: '悬疑', words: ['悬疑感', '扑朔迷离', '悬念', '诡异', '神秘'] }
  ]
};

// ========== 模板库（每类题材存 1-2 个经典结构） ==========
var _CE_TEMPLATE_LIBRARY = {
  template_xianxia_revenge: {
    id: 'template_xianxia_revenge',
    name: '修仙复仇流',
    tagline: '觉醒→小范围冲突→宗门风波→地图升级→大势力冲突→终极对决',
    applicableGenres: ['玄幻', '仙侠'],
    recommendedVolumes: 6,
    requiredForeshadowTypes: ['仇人真实身份', '主角血脉来历', '传承的代价', '幕后黑手'],
    keyScenes: [
      '放逐场景——主角受辱离开',
      '金手指觉醒/传承获得',
      '第一次亲手击败仇人',
      '宗门大比崭露头角',
      '秘境历练遭遇强敌',
      '家族/旧势力回归清算',
      '发现仇人背后的更大势力',
      '道心抉择——复仇与守护的冲突',
      '地图升级——踏入更高层次世界',
      '终极对决——仇人/幕后势力覆灭',
      '结局留白——主角的代价与新生'
    ],
    volumes: [
      { phase: '觉醒', title: '第一卷·觉醒', coreConflict: '主角从绝境中获得传承/能力，初步站稳脚跟', worldReveal: '世界基本规则、修炼体系入门、主角家乡的势力格局', characterArc: '从受害者心态→开始主动掌握命运', endHook: '家族追兵赶到 / 第一个小仇人登场' },
      { phase: '小冲突', title: '第二卷·崭露头角', coreConflict: '主角在本地/宗门的小规模冲突中快速成长', worldReveal: '更广泛的地域势力、修炼境界的真实差距', characterArc: '从自保→主动挑衅/争取资源', endHook: '得罪了某一方势力，被盯上' },
      { phase: '宗门风波', title: '第三卷·宗门风云', coreConflict: '卷入宗门/地方势力内部斗争，主角被迫站队', worldReveal: '宗门政治、派系博弈、更高层人物登场', characterArc: '从单打独斗→开始拉帮结派', endHook: '宗门内部出现内鬼/更大阴谋暴露' },
      { phase: '地图升级', title: '第四卷·更广阔的世界', coreConflict: '主角离开舒适区，踏入更强的地图', worldReveal: '更大的地理范围、更高阶的修炼者社群、世界本质的初步暗示', characterArc: '从青年才俊→一方人物', endHook: '发现仇人或幕后势力参与了更大事件' },
      { phase: '大势力冲突', title: '第五卷·势力对决', coreConflict: '主角已具备与大势力掰手腕的实力，展开势力级博弈', worldReveal: '世界顶层势力格局、历史真相碎片', characterArc: '从一人崛起→领导/代表一方势力', endHook: '终极对手正式露面，揭开阴谋全貌' },
      { phase: '终极对决', title: '第六卷·逆天翻覆', coreConflict: '主角与最终对手的决战，世界观终极揭示', worldReveal: '世界真相、传承的真正目的、主角身份谜底', characterArc: '从复仇者→重塑规则者', endHook: '战后世界的新秩序与主角的归宿' }
    ]
  },
  template_xianxia_growth: {
    id: 'template_xianxia_growth',
    name: '修仙成长流',
    tagline: '入宗→修炼→宗门大比→秘境历练→域外→飞升',
    applicableGenres: ['玄幻', '仙侠'],
    recommendedVolumes: 6,
    requiredForeshadowTypes: ['飞升真相', '主角特殊体质的来历', '世界之上还有世界', '道侣/挚友的伏笔'],
    keyScenes: [
      '入宗测试——主角资质初显',
      '首次突破瓶颈',
      '宗门大比/演武对决',
      '组队进入秘境',
      '秘境中获得关键机缘',
      '与敌对势力的生死战',
      '道心考验/心魔劫',
      '离开宗门远行历练',
      '踏入域外语境/更高文明',
      '飞升/破碎虚空——最终跨越'
    ],
    volumes: [
      { phase: '入宗', title: '第一卷·初入修行', coreConflict: '主角踏进修仙世界，建立基础', worldReveal: '宗门规则、基础修炼体系、师兄弟关系', characterArc: '凡人→入门修士', endHook: '意外获得特殊机缘/被某位长老看上' },
      { phase: '修炼沉淀', title: '第二卷·日积月累', coreConflict: '主角在修炼中遇到瓶颈，寻找突破之道', worldReveal: '修炼的深层原理、资源稀缺性、同辈竞争', characterArc: '从浮躁→懂得厚积薄发', endHook: '得知即将举行宗门大比/秘境开启' },
      { phase: '宗门大比', title: '第三卷·名动宗门', coreConflict: '主角在大比/考验中一路逆袭', worldReveal: '同辈天才的多样性、各脉传承的差异', characterArc: '从默默无闻→宗门新星', endHook: '因大比成绩获得进入秘境的资格' },
      { phase: '秘境历练', title: '第四卷·秘境奇遇', coreConflict: '秘境中的危险与机缘，团队合作与背叛', worldReveal: '秘境来历、古老传承、失落文明碎片', characterArc: '从单人修炼→懂得团队与信任', endHook: '带出的关键物品引起外界注意' },
      { phase: '域外远征', title: '第五卷·走出天地', coreConflict: '主角离开熟悉地域，面对全新规则与更强存在', worldReveal: '更广阔的大陆/星域、域外势力与文明', characterArc: '从宗门弟子→一方代表', endHook: '发现飞升/长生并非终点' },
      { phase: '飞升/终极', title: '第六卷·大道归一', coreConflict: '主角冲击终极境界，面对天道/规则的终极考验', worldReveal: '世界本质、修炼的终极意义', characterArc: '从修行者→规则的理解者/重塑者', endHook: '飞升后的留白或新的开始' }
    ]
  },
  template_urban_counterattack: {
    id: 'template_urban_counterattack',
    name: '都市逆袭流',
    tagline: '低谷→发现能力→初步变现→小规模冲突→资本战→行业颠覆',
    applicableGenres: ['都市', '游戏'],
    recommendedVolumes: 6,
    requiredForeshadowTypes: ['主角能力的真正来源', '对手背后的资本集团', '某个关键人物的双重身份', '能力的代价/限制'],
    keyScenes: [
      '人生最低谷——被开除/被退婚/家道中落',
      '金手指觉醒——能力第一次显现',
      '第一桶金——能力初露锋芒的变现',
      '小规模打脸——第一个对手的溃败',
      '结识关键人脉——导师/伙伴/投资人',
      '建立事业雏形——创业/团队成型',
      '资本战/商战——与大公司正面碰撞',
      '行业规则重塑——主角成为新规则制定者',
      '感情线收束——伴侣关系的确认与考验',
      '最终决战——对手集团瓦解/对手认输'
    ],
    volumes: [
      { phase: '低谷', title: '第一卷·人生低谷', coreConflict: '主角面临多重困境，被逼到绝境', worldReveal: '行业环境、社会阶层差距、主角的基础资源', characterArc: '从迷茫→找到唯一的突破口', endHook: '能力/系统/机缘以意想不到的方式出现' },
      { phase: '发现能力', title: '第二卷·初露锋芒', coreConflict: '主角测试并初步掌控自己的优势', worldReveal: '能力的基本规则、市场/社会对能力的反应', characterArc: '从被动→主动利用优势', endHook: '第一次引起某些人的注意（好与坏并存）' },
      { phase: '初步变现', title: '第三卷·第一桶金', coreConflict: '主角将能力转化为现实收益，建立初步基础', worldReveal: '行业的利润结构、资本如何看待新兴玩家', characterArc: '从一无所有→初步站稳脚跟', endHook: '初步的成功引起了更强对手的警觉' },
      { phase: '小规模冲突', title: '第四卷·正面碰撞', coreConflict: '主角与老牌势力/竞争对手发生多次摩擦', worldReveal: '行业潜规则、对手的手段与资源', characterArc: '从单打独斗→懂得结盟与借力', endHook: '对手联合起来，准备给主角致命一击' },
      { phase: '资本战', title: '第五卷·资本对决', coreConflict: '升级为资本层面的较量——并购、融资、舆论战', worldReveal: '金融运作规则、媒体与舆论的力量、政策环境', characterArc: '从个人英雄→组织领导者', endHook: '最大对手祭出终极杀招，主角陷入危局' },
      { phase: '行业颠覆', title: '第六卷·重塑格局', coreConflict: '主角反杀并颠覆整个行业的旧秩序', worldReveal: '行业的未来走向、主角事业的社会意义', characterArc: '从创业者→行业标杆/新规则制定者', endHook: '事业登顶后的人生选择与留白' }
    ]
  },
  template_historical_uprising: {
    id: 'template_historical_uprising',
    name: '历史崛起流',
    tagline: '困境→立足→发展势力→军政突破→格局重塑→登顶/隐退',
    applicableGenres: ['历史', '武侠'],
    recommendedVolumes: 6,
    requiredForeshadowTypes: ['历史走向的关键节点', '主角带来的蝴蝶效应', '主要盟友与对手的早期出场', '某个历史人物的真实性格'],
    keyScenes: [
      '穿越/觉醒于乱世——开篇困境',
      '第一次生存考验——谋生/避祸',
      '获得第一份资本/地盘/人脉',
      '小型战役/政斗胜利',
      '与关键历史人物的相遇与博弈',
      '势力扩张——收编/结盟/战争',
      '决定性战役/政治事件',
      '朝堂博弈/制度设计',
      '历史分水岭——主角选择改变走向',
      '功成名就/功成身退——结局'
    ],
    volumes: [
      { phase: '困境', title: '第一卷·乱世求生', coreConflict: '主角在陌生/危险的时代环境中挣扎求生', worldReveal: '时代背景、社会结构、主角最初的社会位置', characterArc: '从现代人/普通人→初步适应乱世规则', endHook: '卷入某个事件，无法再独善其身' },
      { phase: '立足', title: '第二卷·建立根基', coreConflict: '主角获得第一份势力/地盘/职业立足点', worldReveal: '地方势力分布、经济与军事基础规则', characterArc: '从求生者→有根基的一方人物', endHook: '某个更大的机会/威胁正在逼近' },
      { phase: '发展势力', title: '第三卷·羽翼渐丰', coreConflict: '主角通过各种手段扩张势力', worldReveal: '更高级别的政治/军事规则、关键历史事件的脉络', characterArc: '从参与者→操盘者之一', endHook: '成为某大势力眼中的棋子或威胁' },
      { phase: '军政突破', title: '第四卷·破局之战', coreConflict: '关键战役/政治事件，主角势力迎来质的飞跃', worldReveal: '顶级政治博弈、国家间的大战略', characterArc: '从一方势力→能影响大局的力量', endHook: '历史的走向因主角而发生显著偏离' },
      { phase: '格局重塑', title: '第五卷·改天换地', coreConflict: '主角参与/主导塑造新的政治格局与社会秩序', worldReveal: '制度设计、文化/经济体系重建', characterArc: '从武将/谋士→核心决策者', endHook: '内部矛盾/外部威胁悄然酝酿' },
      { phase: '登顶/隐退', title: '第六卷·功成名就', coreConflict: '主角面临最终的权力/人生抉择', worldReveal: '新时代的长远走向、历史对主角的评价', characterArc: '从决策者→历史人物（登顶或隐退）', endHook: '主角的遗产与后世影响' }
    ]
  },
  template_scifi_survival: {
    id: 'template_scifi_survival',
    name: '科幻求生流',
    tagline: '灾难→求生→发现真相→组织/反抗→终极选择',
    applicableGenres: ['科幻', '末世'],
    recommendedVolumes: 5,
    requiredForeshadowTypes: ['灾难的真正原因', '某个组织的秘密计划', '主角与灾难的隐秘联系', '外部救援/更高级文明存在与否'],
    keyScenes: [
      '灾难降临——开篇事件震撼',
      '主角在废墟中第一日求生',
      '发现幸存者/同伴',
      '资源争夺战/人性考验',
      '发现反常线索——灾难并非偶然',
      '遭遇反派组织/变异体/AI',
      '深入源头——真相接近',
      '组织反抗/逃亡计划成型',
      '最终抉择——牺牲/对抗/逃亡',
      '新世界的曙光或绝望'
    ],
    volumes: [
      { phase: '灾难降临', title: '第一卷·世界崩溃', coreConflict: '灾难突如其来，主角的世界彻底崩塌', worldReveal: '灾难类型、社会崩坏过程、主角最初处境', characterArc: '从普通市民→幸存者', endHook: '发现灾难远比想象中严重/有规律' },
      { phase: '求生', title: '第二卷·挣扎求存', coreConflict: '主角在资源极端匮乏环境中求生与组队', worldReveal: '生存规则、其他幸存者生态、威胁来源', characterArc: '从慌乱→冷静求生者', endHook: '发现某个反常现象/信号/组织痕迹' },
      { phase: '发现真相', title: '第三卷·真相之影', coreConflict: '主角深入调查灾难的原因与幕后力量', worldReveal: '灾难的非自然性、组织/AI/外星势力的存在', characterArc: '从被动求生→主动调查者', endHook: '揭开第一层真相，但带来更大的疑问' },
      { phase: '组织反抗', title: '第四卷·集结与反抗', coreConflict: '主角集结同伴，与幕后力量正面冲突', worldReveal: '更广阔的世界局势、其他幸存者组织', characterArc: '从个人→领导者', endHook: '最终的真相/抉择即将到来' },
      { phase: '终极选择', title: '第五卷·人类的未来', coreConflict: '面临终极抉择——逃亡/对抗/同化/升华', worldReveal: '灾难的终极来源与目的、人类的处境本质', characterArc: '从反抗者→人类命运的选择者', endHook: '新世界的形态与未来的不确定性' }
    ]
  },
  template_wuxia_jianghu: {
    id: 'template_wuxia_jianghu',
    name: '武侠江湖流',
    tagline: '家仇/师仇→学艺→江湖历练→恩怨纠葛→幕后黑手→最终对决',
    applicableGenres: ['武侠', '历史'],
    recommendedVolumes: 6,
    requiredForeshadowTypes: ['仇人并非纯恶的一面', '主角恩师的隐秘过去', '武林秘籍的真正代价', '幕后黑手的早期出场'],
    keyScenes: [
      '家破人亡/师门覆灭——仇恨开端',
      '死里逃生与偶遇高人',
      '学艺过程——数年苦练与心境变化',
      '初入江湖——第一次行侠仗义',
      '遭遇关键人物——朋友/爱人/对手',
      '卷入江湖事件/门派恩怨',
      '发现仇敌线索——复仇之路',
      '得知真相并不简单——道德困境',
      '与幕后势力的全面对决',
      '大仇得报后——江湖从此再无此人'
    ],
    volumes: [
      { phase: '血海深仇', title: '第一卷·血海深仇', coreConflict: '主角人生被彻底摧毁，死里逃生', worldReveal: '江湖基本生态、仇家势力轮廓', characterArc: '从幸福少年→身负血仇的复仇者', endHook: '濒死之际被神秘人物救下' },
      { phase: '学艺', title: '第二卷·苦修学艺', coreConflict: '主角在隐居之地苦练武功与心性', worldReveal: '武学原理、师父的故事与禁忌', characterArc: '从仇恨驱动→懂得武道不止于复仇', endHook: '艺成下山，踏入真正的江湖' },
      { phase: '江湖历练', title: '第三卷·江湖风波', coreConflict: '主角在江湖中经历事件、结识朋友与对手', worldReveal: '江湖门派格局、各地风土人情', characterArc: '从稚嫩→成熟的江湖人', endHook: '第一次与仇家中层人物交锋' },
      { phase: '恩怨纠葛', title: '第四卷·爱恨交织', coreConflict: '复仇过程中卷入情感、友情与道德困境', worldReveal: '仇家中也有善者、正邪并非泾渭分明', characterArc: '从纯粹复仇者→有人性复杂面的侠客', endHook: '发现仇人的背后还有更深的幕后' },
      { phase: '幕后黑手', title: '第五卷·拨云见日', coreConflict: '主角追查并对抗真正的幕后势力', worldReveal: '事件的根源与幕后集团的野心', characterArc: '从私人复仇→武林正义的承载者', endHook: '终极决战即将到来' },
      { phase: '最终对决', title: '第六卷·江湖再见', coreConflict: '与幕后主使的终极对决，个人恩怨与江湖命运交汇', worldReveal: '所有恩怨的最终清算、江湖新格局', characterArc: '从复仇者→选择继续江湖或隐退的侠客', endHook: '传说归于江湖，新的故事正在酝酿' }
    ]
  },
  template_school_mystery: {
    id: 'template_school_mystery',
    name: '校园悬疑流',
    tagline: '异常事件→调查→线索拼图→人性揭示→代价/救赎',
    applicableGenres: ['悬疑', '规则怪谈', '都市'],
    recommendedVolumes: 5,
    requiredForeshadowTypes: ['事件与多年前旧案的关联', '关键角色的隐藏秘密', '主角自己也有未被揭示的过去', '超自然元素的本质'],
    keyScenes: [
      '异常事件初次发生——主角目击/卷入',
      '主角决定调查——动机确立',
      '获得第一位同伴/盟友',
      '第一个关键线索——指向某个方向',
      '关键人物审讯/对峙——揭示一面',
      '转折点——线索拼图初具轮廓',
      '主角发现自己也与事件有关',
      '危险升级——有人死亡/失踪',
      '最终揭晓——人性黑暗面或超自然真相',
      '代价与救赎——事件结束后的余波'
    ],
    volumes: [
      { phase: '异常事件', title: '第一卷·异常开端', coreConflict: '校园里出现离奇事件，主角被卷入', worldReveal: '校园规则、关键人物群像、历史传闻', characterArc: '从旁观者→好奇调查者', endHook: '主角发现第一条无法解释的线索' },
      { phase: '调查', title: '第二卷·深入调查', coreConflict: '主角与同伴系统性调查，与多方人物接触', worldReveal: '更多角色的秘密、事件历史脉络', characterArc: '从好奇→认真对待', endHook: '发现一个关键人物/地点/物品' },
      { phase: '线索拼图', title: '第三卷·真相轮廓', coreConflict: '线索逐渐串联，事件轮廓浮出水面', worldReveal: '事件与多年前旧案的关联、主要嫌疑人身份', characterArc: '从调查者→意识到危险的人', endHook: '主角自身也被卷入事件因果' },
      { phase: '人性揭示', title: '第四卷·人心深渊', coreConflict: '揭开人性或组织的阴暗面，正邪边界模糊', worldReveal: '核心动机、人性的脆弱与残酷', characterArc: '从追求真相→面对道德困境', endHook: '事件升级，有人付出代价' },
      { phase: '代价与救赎', title: '第五卷·终局与余波', coreConflict: '事件最终解决，但所有人都付出代价', worldReveal: '事件完整真相、各人物结局', characterArc: '从调查者→被事件永久改变的人', endHook: '事件解决，但某条线索暗示故事并未结束' }
    ]
  },
  template_apocalypse_evolution: {
    id: 'template_apocalypse_evolution',
    name: '末世进化流',
    tagline: '末世降临→求生→建立据点→势力冲突→进化终极',
    applicableGenres: ['末世', '科幻', '玄幻'],
    recommendedVolumes: 5,
    requiredForeshadowTypes: ['进化体系的终极方向', '主角的特殊体质/来源', '末世真正原因与幕后', '最终敌人的伏笔'],
    keyScenes: [
      '末世倒计时/首日降临——震撼开篇',
      '主角觉醒进化能力',
      '初期资源争夺与人性考验',
      '建立第一个据点/团队',
      '遭遇其他幸存者势力',
      '第一次势力间大规模冲突',
      '发现进化体系的更深层规则',
      '主角团队遭遇背叛或重大损失',
      '终极进化挑战——身体/精神双重考验',
      '末世后的新世界秩序'
    ],
    volumes: [
      { phase: '降临', title: '第一卷·末世降临', coreConflict: '文明崩溃，主角在混乱中觉醒能力', worldReveal: '灾难类型、变异体系基本规则', characterArc: '从普通人→初觉醒者', endHook: '发现进化不止一种路径' },
      { phase: '求生', title: '第二卷·废墟求生', coreConflict: '主角在末世中求生并集结同伴', worldReveal: '资源分布、变异体生态、其他幸存者', characterArc: '从独自求生→团队核心', endHook: '发现相对安全的地点可作为据点' },
      { phase: '建立据点', title: '第三卷·新的家园', coreConflict: '主角团队建设据点并应对内外威胁', worldReveal: '据点运营规则、区域势力分布', characterArc: '从团队成员→据点领导者', endHook: '更强的外部势力开始注意到这里' },
      { phase: '势力冲突', title: '第四卷·势力对决', coreConflict: '与其他大型幸存者势力发生正面冲突', worldReveal: '各大势力的理念与方式差异', characterArc: '从据点首领→区域势力代表', endHook: '发现末世与进化的深层真相' },
      { phase: '进化终极', title: '第五卷·新人类', coreConflict: '主角挑战进化的终极形态，面对终极抉择', worldReveal: '末世真正目的、进化的代价与本质', characterArc: '从进化者→新人类/超维存在', endHook: '新世界的曙光或诅咒——人类何去何从' }
    ]
  },
  template_rebirth_regret: {
    id: 'template_rebirth_regret',
    name: '重生悔恨流',
    tagline: '死亡重生→纠正遗憾→规避悲剧→超越原轨迹→新命运抉择',
    applicableGenres: ['都市', '历史', '言情', '玄幻'],
    recommendedVolumes: 5,
    requiredForeshadowTypes: ['前世悲剧的真正根源（并非表面原因）', '重生不是偶然', '重要人物在前世未展现的一面', '重生者的精神代价'],
    keyScenes: [
      '前世死亡场景——悔恨与不甘',
      '重生回到关键节点——震撼与确认',
      '第一个改变——救下/改变前世的某个事件',
      '弥补对某人的遗憾',
      '利用先知优势建立初步基础',
      '遭遇前世的敌人/盟友——这次不同的选择',
      '发现前世的真相并非自己理解的那样',
      '蝴蝶效应——某些改变导致新的问题',
      '面对新敌人/新挑战（前世不存在的）',
      '最终抉择——接受新命运 vs 回到原点'
    ],
    volumes: [
      { phase: '重生', title: '第一卷·重生归来', coreConflict: '主角带着前世记忆回到关键节点，决定改变一切', worldReveal: '时间点的世界状态、主角前世的遗憾清单', characterArc: '从死亡的悔恨者→第二次人生的掌控者', endHook: '第一个改变产生了意想不到的连锁反应' },
      { phase: '纠正遗憾', title: '第二卷·弥补过去', coreConflict: '主角逐一纠正前世的错误与遗憾', worldReveal: '人物的另一面、事件的更多维度', characterArc: '从弥补者→开始思考"想要的未来"', endHook: '某个关键人物这次的反应与前世不同' },
      { phase: '规避悲剧', title: '第三卷·阻止悲剧', coreConflict: '主角试图阻止前世的重大悲剧事件', worldReveal: '悲剧的深层原因、蝴蝶效应带来的新变量', characterArc: '从预防者→意识到无法控制一切', endHook: '发现悲剧背后有人为操纵——前世未知的真相' },
      { phase: '超越原轨迹', title: '第四卷·脱离剧本', coreConflict: '主角的人生已经完全偏离前世轨道，面对全新挑战', worldReveal: '新的敌人/盟友/机遇、未知领域', characterArc: '从依赖先知→依靠自身能力', endHook: '终极抉择的契机出现' },
      { phase: '新命运', title: '第五卷·新的人生', coreConflict: '主角面对前世没有的终极选择——成为谁', worldReveal: '重生的意义、前世与今生的完整因果', characterArc: '从重生者→独立完整的新人生主人', endHook: '人生的答案——某些遗憾无法重来，但可以被超越' }
    ]
  },
  template_powershadow_hidden: {
    id: 'template_powershadow_hidden',
    name: '隐藏身份流',
    tagline: '有秘密身份→日常+秘密双线→身份危机→真相抉择',
    applicableGenres: ['都市', '玄幻', '仙侠', '言情', '悬疑'],
    recommendedVolumes: 5,
    requiredForeshadowTypes: ['主角身份的多重层面', '重要角色各自也有秘密', '揭露时刻的连锁反应', '身份暴露的代价与后果'],
    keyScenes: [
      '主角双重生活首次展现——日常 vs 秘密',
      '第一个接近主角秘密的人登场',
      '秘密身份险些暴露——惊险时刻',
      '重要角色对主角产生怀疑',
      '双线冲突同时爆发——疲于应付',
      '某条线索指向主角真实身份',
      '盟友/爱人得知真相——信任考验',
      '敌人利用主角的身份设下圈套',
      '主动或被迫揭露身份——关键时刻',
      '真相后的新世界——关系重塑与抉择'
    ],
    volumes: [
      { phase: '双面人生', title: '第一卷·双面人生', coreConflict: '主角在两种身份间切换，生活呈现双重面貌', worldReveal: '两个世界的规则、主角选择双重身份的原因', characterArc: '从熟练伪装→偶尔出现身份困惑', endHook: '某个关键人物开始怀疑主角的秘密' },
      { phase: '双线并行', title: '第二卷·双线压力', coreConflict: '两边的压力同时升级，主角越来越难以维持伪装', worldReveal: '两个世界各自的势力与威胁', characterArc: '从游刃有余→精疲力竭', endHook: '某件事让主角意识到伪装不是长久之计' },
      { phase: '身份危机', title: '第三卷·身份危机', coreConflict: '主角的秘密面临被彻底揭穿的风险', worldReveal: '秘密的代价、他人因主角隐瞒而受到的伤害', characterArc: '从维持者→开始考虑坦白的可能性', endHook: '关键事件迫使主角必须做出选择' },
      { phase: '真相', title: '第四卷·真相时刻', coreConflict: '主角主动/被动揭露真相，各方关系剧烈震荡', worldReveal: '所有秘密的全貌、不同角色的真实态度', characterArc: '从双面人→选择成为谁', endHook: '敌人利用真相发动总攻' },
      { phase: '抉择', title: '第五卷·新的自己', coreConflict: '以真面目面对世界，解决最终问题', worldReveal: '主角真正想要的人生是什么', characterArc: '从多身份者→完整统一的自我', endHook: '真相之后的生活——自由与代价' }
    ]
  }
};

// ========== 核心引擎对象 ==========
var ConceptExpansionEngine = {

  VERSION: '2.0.0',
  TEMPLATE_LIBRARY: _CE_TEMPLATE_LIBRARY,
  SIGNAL_LIBRARY: _CE_SIGNAL_LIBRARY,

  /* ------------------------------------------------------------------
   * 方法 1：analyzeConcept(conceptText)
   * 概念文本关键词分析 — 提取题材/主角状态/金手指/冲突/场景/风格信号
   * ------------------------------------------------------------------ */
  analyzeConcept: function(conceptText) {
    var text = (conceptText || '').toString().trim();
    if (!text) {
      return {
        rawText: '',
        wordCount: 0,
        genreSignals: [],
        protagonistState: [],
        powerMechanism: [],
        conflict: [],
        setting: [],
        style: [],
        summary: '空概念文本，无法提取信号。请输入至少包含一个关键词的概念描述。'
      };
    }

    // 统计每个信号库的命中
    var scanSignals = function(libEntry) {
      var hits = [];
      for (var i = 0; i < libEntry.length; i++) {
        var item = libEntry[i];
        var count = 0;
        for (var j = 0; j < item.words.length; j++) {
          var re = new RegExp(item.words[j], 'g');
          var m = text.match(re);
          if (m) count += m.length;
        }
        if (count > 0) {
          hits.push({ key: item.key, count: count, examples: item.words.slice(0, 3) });
        }
      }
      // 按命中数排序
      hits.sort(function(a, b) { return b.count - a.count; });
      return hits;
    };

    var genreSignals = scanSignals(this.SIGNAL_LIBRARY.genre);
    var protagonistState = scanSignals(this.SIGNAL_LIBRARY.protagonist);
    var powerMechanism = scanSignals(this.SIGNAL_LIBRARY.powerMechanism);
    var conflict = scanSignals(this.SIGNAL_LIBRARY.conflict);
    var setting = scanSignals(this.SIGNAL_LIBRARY.setting);
    var style = scanSignals(this.SIGNAL_LIBRARY.style);

    // 字数与语句数
    var wordCount = text.replace(/\s+/g, '').length;
    var sentenceCount = text.split(/[。！？.!?]/).filter(function(s){ return s.trim().length > 0; }).length;

    // 生成摘要
    var summaryParts = [];
    if (genreSignals.length > 0) summaryParts.push('题材：' + genreSignals.slice(0,2).map(function(x){ return x.key; }).join('/'));
    if (protagonistState.length > 0) summaryParts.push('主角：' + protagonistState.slice(0,2).map(function(x){ return x.key; }).join('/'));
    if (powerMechanism.length > 0) summaryParts.push('金手指：' + powerMechanism.slice(0,2).map(function(x){ return x.key; }).join('/'));
    if (conflict.length > 0) summaryParts.push('冲突：' + conflict.slice(0,2).map(function(x){ return x.key; }).join('/'));
    if (setting.length > 0) summaryParts.push('场景：' + setting.slice(0,2).map(function(x){ return x.key; }).join('/'));
    if (style.length > 0) summaryParts.push('风格：' + style.slice(0,2).map(function(x){ return x.key; }).join('/'));

    return {
      rawText: text,
      wordCount: wordCount,
      sentenceCount: sentenceCount,
      genreSignals: genreSignals,
      protagonistState: protagonistState,
      powerMechanism: powerMechanism,
      conflict: conflict,
      setting: setting,
      style: style,
      summary: summaryParts.length > 0
        ? summaryParts.join(' | ')
        : '未检测到明确信号词。建议概念中包含：题材（如"修仙"）、主角处境（如"被放逐"）、金手指类型（如"传承"）、核心冲突（如"复仇"）等关键词。'
    };
  },

  /* ------------------------------------------------------------------
   * 方法 2：selectTemplate(analysisResult, platform)
   * 根据分析结果从模板库中选择最匹配的 2-3 个骨架模板
   * ------------------------------------------------------------------ */
  selectTemplate: function(analysis, platform) {
    var analysisResolved = analysis || {};
    if (typeof analysisResolved === 'string') {
      analysisResolved = this.analyzeConcept(analysisResolved);
    }

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
    var platformResolved = normalizePlatform(platform);
    var isFastPace = platformResolved === 'fanqie';

    var genreHits = analysisResolved.genreSignals || [];
    var protagonistHits = analysisResolved.protagonistState || [];
    var conflictHits = analysisResolved.conflict || [];
    var mainGenre = genreHits.length > 0 ? genreHits[0].key : null;
    var mainProtagonist = protagonistHits.length > 0 ? protagonistHits[0].key : null;
    var mainConflict = conflictHits.length > 0 ? conflictHits[0].key : null;

    // 遍历所有模板计算匹配度（0-100）
    var candidates = [];
    var lib = this.TEMPLATE_LIBRARY;
    for (var key in lib) {
      if (!lib.hasOwnProperty(key)) continue;
      var tpl = lib[key];

      var score = 0;
      // 题材匹配 — 权重最高 40
      if (mainGenre && tpl.applicableGenres) {
        var genreMatchIdx = tpl.applicableGenres.indexOf(mainGenre);
        if (genreMatchIdx >= 0) score += 40 - genreMatchIdx * 8;
      }
      // 主角类型间接匹配 — 通过模板名/副标题关键词 + 主角信号
      if (mainProtagonist) {
        var tplText = (tpl.name + tpl.tagline + tpl.id);
        // 复仇与放逐/废柴/孤儿相关
        if ((mainProtagonist === '放逐' || mainProtagonist === '废柴' || mainProtagonist === '孤儿' || mainProtagonist === '落魄')
            && /复仇|逆袭|血海|重生|隐藏/.test(tplText)) score += 15;
        // 天才/天之骄子与成长流匹配
        if ((mainProtagonist === '天才' || mainProtagonist === '天之骄子')
            && /成长|修炼|登顶|江湖/.test(tplText)) score += 15;
        // 重生与重生悔恨流匹配
        if (mainProtagonist === '重生' && /重生|悔恨/.test(tplText)) score += 25;
        // 隐藏身份与隐藏身份流匹配
        if (mainProtagonist === '隐藏身份' && /隐藏|秘密|双面/.test(tplText)) score += 25;
        // 穿越/失忆与历史/悬疑匹配
        if ((mainProtagonist === '穿越' || mainProtagonist === '失忆')
            && /乱世|历史|悬疑|异常/.test(tplText)) score += 15;
      }
      // 冲突匹配 — 权重 30
      if (mainConflict) {
        var tplAllText = (tpl.name + tpl.tagline + tpl.id + JSON.stringify(tpl.keyScenes));
        if (mainConflict === '复仇' && /复仇|血海|报仇|对决/.test(tplAllText)) score += 30;
        if (mainConflict === '颠覆' && /颠覆|逆天|反抗|翻覆/.test(tplAllText)) score += 28;
        if (mainConflict === '拯救' && /拯救|救世|守护|生存/.test(tplAllText)) score += 25;
        if (mainConflict === '守护' && /守护|保护|家园|据点/.test(tplAllText)) score += 25;
        if (mainConflict === '登顶' && /登顶|崛起|称霸|飞升/.test(tplAllText)) score += 28;
        if (mainConflict === '逆袭' && /逆袭|翻身|崛起|成长|修炼/.test(tplAllText)) score += 28;
        if (mainConflict === '寻找' && /寻找|调查|真相|悬疑|线索/.test(tplAllText)) score += 25;
        if (mainConflict === '解谜' && /解谜|线索|真相|悬疑|异常/.test(tplAllText)) score += 28;
        if (mainConflict === '逃亡' && /逃亡|求生|追杀|灾难/.test(tplAllText)) score += 25;
        if (mainConflict === '生存' && /求生|生存|末世|废墟|据点/.test(tplAllText)) score += 28;
      }
      // 平台偏好微调
      if (isFastPace && /逆袭|重生|隐藏|爽文|打脸/.test(tpl.id + tpl.name)) score += 5;
      if (!isFastPace && /成长|历练|江湖|格局|宏大/.test(tpl.tagline)) score += 3;

      // 基础分保底 — 任何模板至少 10 分（用于无信号情况下也有推荐）
      score = Math.max(score, 8);

      candidates.push({
        templateId: tpl.id,
        templateName: tpl.name,
        tagline: tpl.tagline,
        recommendedVolumes: tpl.recommendedVolumes,
        applicableGenres: tpl.applicableGenres.slice(),
        keyScenes: tpl.keyScenes.slice(),
        requiredForeshadowTypes: tpl.requiredForeshadowTypes.slice(),
        volumes: tpl.volumes.map(function(v){ return Object.assign({}, v); }),
        matchScore: Math.min(score, 100)
      });
    }

    // 按匹配度降序
    candidates.sort(function(a, b) { return b.matchScore - a.matchScore; });

    var topCount = Math.min(3, candidates.length);
    var top = candidates.slice(0, topCount);

    return {
      platform: platformResolved,
      mainGenre: mainGenre,
      mainProtagonist: mainProtagonist,
      mainConflict: mainConflict,
      candidates: top,
      summary: '推荐前 ' + top.length + ' 个模板：' + top.map(function(t){ return t.templateName + '（' + t.matchScore + '分）'; }).join('、')
    };
  },

  /* ------------------------------------------------------------------
   * 方法 3：expandToVolumeOutline(concept, templateChoice, platform)
   * 按选定模板生成多卷大纲骨架
   * ------------------------------------------------------------------ */
  expandToVolumeOutline: function(concept, templateChoice, platform) {
    var analysis = typeof concept === 'string' ? this.analyzeConcept(concept) : concept;
    var tpl;

    if (!templateChoice) {
      var selected = this.selectTemplate(analysis, platform);
      tpl = selected.candidates[0];
    } else if (typeof templateChoice === 'string') {
      tpl = this.TEMPLATE_LIBRARY[templateChoice];
      if (!tpl) {
        var sel2 = this.selectTemplate(analysis, platform);
        tpl = sel2.candidates[0];
      }
    } else {
      tpl = templateChoice;
    }

    // 平台名归一化（兼容中英文别名）
    var normalizePlatform = function (p) {
      if (!p) return 'qidian';
      var map = {
        '番茄': 'fanqie',
        'fanqie': 'fanqie',
        'qutu': 'fanqie',
        '起点': 'qidian',
        'qidian': 'qidian'
      };
      return map[p] || 'qidian';
    };
    var platformResolved = normalizePlatform(platform);
    var isFastPace = platformResolved === 'fanqie';

    // 根据平台调整每卷章节数
    var baseChapters = isFastPace ? 40 : 25;
    var totalVolumes = tpl.volumes.length;

    // 生成每卷的大纲对象
    var outline = [];
    for (var i = 0; i < totalVolumes; i++) {
      var v = tpl.volumes[i];
      var volNum = i + 1;
      var chapters = baseChapters;

      // 根据卷位置调整：首末卷稍短、中间卷稍长
      if (volNum === 1) chapters = Math.round(baseChapters * (isFastPace ? 0.8 : 0.8));
      else if (volNum === totalVolumes) chapters = Math.round(baseChapters * (isFastPace ? 1.2 : 1.0));
      else chapters = Math.round(baseChapters * (isFastPace ? 1.05 : 1.0));

      // 信息增量 — 越往后揭示越多
      var infoIncrement = Math.min(3 + Math.floor(i / 2), 7);

      // 建议 beats 配置
      var minorBeats = Math.round(chapters * 0.7);
      var mediumBeats = Math.round(chapters * 0.2);
      var majorBeats = 1 + (i === totalVolumes - 1 ? 1 : 0);
      var foreshadowCount = Math.max(5, Math.round(chapters * 0.3));

      var mainEvents = this._buildMainEvents(analysis, tpl, i, volNum, totalVolumes);
      var subPlots = this._buildSubPlots(analysis, tpl, i, volNum);
      var foreshadowNeeded = this._buildForeshadow(analysis, tpl, i, totalVolumes);
      var endHook = this._buildEndHook(analysis, tpl, i, totalVolumes);
      var worldRevealList = this._buildWorldReveal(analysis, tpl, i);

      outline.push({
        volume: volNum,
        title: v.title || ('第' + this._toChineseNum(volNum) + '卷'),
        phase: v.phase || '',
        chapters: chapters,
        coreConflict: v.coreConflict || '',
        mainEvents: mainEvents,
        subPlots: subPlots,
        worldReveal: worldRevealList,
        infoIncrement: infoIncrement,
        characterArc: v.characterArc || '',
        foreshadowNeeded: foreshadowNeeded,
        endHook: endHook,
        suggestedBeats: {
          minor: minorBeats,
          medium: mediumBeats,
          major: majorBeats,
          foreshadow: foreshadowCount
        }
      });
    }

    return {
      platform: platformResolved,
      templateId: tpl.id || 'unknown',
      templateName: tpl.name || '未命名模板',
      totalVolumes: totalVolumes,
      totalChaptersEstimate: outline.reduce(function(acc, v){ return acc + v.chapters; }, 0),
      volumes: outline,
      summary: '按「' + (tpl.name || '') + '」模板生成 ' + totalVolumes + ' 卷骨架，约 ' +
               outline.reduce(function(acc, v){ return acc + v.chapters; }, 0) + ' 章。'
    };
  },

  // 辅助：生成一卷的主事件清单
  _buildMainEvents: function(analysis, tpl, idx, volNum, totalVols) {
    var events = [];
    var v = tpl.volumes[idx];
    var phase = v.phase || '';
    var conceptText = analysis.rawText || '';

    // 基础骨架事件
    events.push('【开场】' + phase + '阶段开始——主角当前处境展现，新的冲突引子出现。');
    events.push('【目标确立】主角明确本卷要达成的目标——与' + (v.coreConflict ? v.coreConflict.substring(0, 20) : '核心冲突') + '相关。');
    events.push('【第一次行动】主角首次主动出击，尝试推进目标，遭遇初步阻碍。');
    events.push('【关键发现】通过行动/调查/机缘，获得改变局势的关键信息或物品。');
    events.push('【内部考验】主角团队/关系/信念层面出现裂缝或考验。');
    events.push('【转折事件】某次重大行动成功或失败，局势方向改变。');
    events.push('【对手升级】原本的对手变得更强/有新对手登场，压力升级。');
    events.push('【卷末高潮】本卷核心冲突爆发，主角面临该阶段最严峻的挑战。');

    // 根据概念文本的金手指注入具体事件
    if (analysis.powerMechanism && analysis.powerMechanism.length > 0) {
      var mech = analysis.powerMechanism[0].key;
      events.splice(3, 0, '【金手指本卷使用】' + this._describeMechanismUse(mech, volNum, totalVols));
    }

    // 根据题材/冲突添加最后一个事件
    if (analysis.conflict && analysis.conflict.length > 0) {
      events.push('【卷末事件性质】偏向' + analysis.conflict[0].key + '方向——与本卷核心冲突紧密呼应。');
    }

    return events;
  },

  // 辅助：金手指使用描述
  _describeMechanismUse: function(mech, volNum, totalVols) {
    var ratio = volNum / totalVols;
    var stage = '初期觉醒';
    if (ratio > 0.25 && ratio <= 0.55) stage = '中期熟练掌握';
    else if (ratio > 0.55 && ratio <= 0.8) stage = '后期深化运用';
    else if (ratio > 0.8) stage = '终极形态挑战';

    var descMap = {
      '系统': '系统发布新任务/解锁新功能——主角的依赖感 vs 系统规则的限制',
      '传承': '传承力量新层次觉醒——伴随代价与身体/精神的考验',
      '空间': '随身空间展现新能力——或暴露新的限制条件',
      '天赋': '天赋显现未发现的一面——触发新的修炼路径',
      '血脉': '血脉浓度/活跃度提升——出现明显的身体变化与外部反应',
      '功法': '功法修至新层次——遇到瓶颈或领悟新招式',
      '异能': '异能使用频率与强度增加——但代价也在累积',
      '时间': '时间类能力的边界被测试——可能导致反噬或副作用',
      '重生优势': '利用前世记忆获取关键信息——但开始遇到前世未知的变化',
      '游戏面板': '等级/装备/技能体系推进——遇到难以数值化的对手'
    };
    return stage + '：' + (descMap[mech] || (mech + '能力的新阶段'));
  },

  // 辅助：副线提示
  _buildSubPlots: function(analysis, tpl, idx, volNum) {
    var subs = [];
    subs.push('【情感副线】主角与核心人物的关系推进——友谊/爱情/师徒情等有明确节点事件。');
    subs.push('【势力副线】某势力/组织在本卷的动向——不直接关联主线但有后续影响。');
    subs.push('【个人副线】某个配角在本卷经历个人成长或挫折——为其后续选择做铺垫。');

    // 如果有风格/题材信号，加一条题材相关副线
    if (analysis.genreSignals && analysis.genreSignals.length > 0) {
      subs.push('【' + analysis.genreSignals[0].key + '元素副线】与' + analysis.genreSignals[0].key + '特色规则相关的一条支线。');
    }
    return subs;
  },

  // 辅助：世界揭示清单
  _buildWorldReveal: function(analysis, tpl, idx) {
    var v = tpl.volumes[idx];
    var reveals = [];
    if (v.worldReveal) reveals.push('【模板建议】' + v.worldReveal);
    reveals.push('【信息控制原则】本卷每 3-4 章仅揭示 1 条核心信息——避免信息倾倒。');
    reveals.push('【读者理解门槛】新信息需与主角已知信息有明确对比，让读者能跟随主角理解。');

    if (analysis.powerMechanism && analysis.powerMechanism.length > 0) {
      reveals.push('【金手指相关】关于' + analysis.powerMechanism[0].key + '的某种深层规则/代价在本卷被揭示。');
    }
    return reveals;
  },

  // 辅助：伏笔建议
  _buildForeshadow: function(analysis, tpl, idx, totalVols) {
    var fores = [];
    var required = tpl.requiredForeshadowTypes || [];
    // 按阶段分配伏笔
    if (idx < Math.floor(totalVols / 3)) {
      fores.push('【长伏笔】为最后一卷的关键转折埋下最早的一条线索——此时读者不会注意。');
      if (required[0]) fores.push('【题材专属伏笔】' + required[0] + '——在此卷中以象征/碎片形式初现。');
    } else if (idx < totalVols - 1) {
      fores.push('【中伏笔】上一卷的某条线索在此卷"偶然"重现，开始变得重要。');
      if (required[1]) fores.push('【题材专属伏笔】' + required[1] + '——有明确指向性的事件出现。');
      fores.push('【角色伏笔】某配角的一句话/一个行为——事后回看意义重大。');
    } else {
      fores.push('【伏笔回收】所有主要伏笔在本卷必须至少回收 80%——不可全部推到结局。');
      fores.push('【新伏笔】仅为番外/续作服务的新伏笔——不影响本篇完整性。');
    }
    return fores;
  },

  // 辅助：卷末钩子生成
  _buildEndHook: function(analysis, tpl, idx, totalVols) {
    var v = tpl.volumes[idx];
    var base = v.endHook || ('本卷末出现某种冲击性事件——迫使主角重新评估一切。');

    // 最后一卷不要求钩子
    if (idx === totalVols - 1) {
      return '【终卷收束】无需留钩子——但需有"余韵"——读者合上本书后仍在思考的某个问题或画面。';
    }
    return '【卷末钩子】' + base + '——悬念强度为该卷最高，直接驱动读者进入下一卷。';
  },

  // 辅助：数字转中文
  _toChineseNum: function(n) {
    var map = ['零','一','二','三','四','五','六','七','八','九','十'];
    if (n <= 10) return map[n];
    if (n < 20) return '十' + (n % 10 === 0 ? '' : map[n % 10]);
    var tens = Math.floor(n / 10);
    var remain = n % 10;
    return map[tens] + '十' + (remain === 0 ? '' : map[remain]);
  },

  /* ------------------------------------------------------------------
   * 方法 4：suggestCoreCharacters(concept, templateChoice)
   * 生成角色骨架提示清单
   * ------------------------------------------------------------------ */
  suggestCoreCharacters: function(concept, templateChoice) {
    var analysis = typeof concept === 'string' ? this.analyzeConcept(concept) : concept;
    var tpl;
    if (!templateChoice) {
      tpl = this.selectTemplate(analysis).candidates[0];
    } else if (typeof templateChoice === 'string') {
      tpl = this.TEMPLATE_LIBRARY[templateChoice] || this.selectTemplate(analysis).candidates[0];
    } else {
      tpl = templateChoice;
    }

    var mainGenre = (analysis.genreSignals && analysis.genreSignals[0]) ? analysis.genreSignals[0].key : '玄幻';
    var mainProtagonist = (analysis.protagonistState && analysis.protagonistState[0]) ? analysis.protagonistState[0].key : '放逐';
    var mainConflict = (analysis.conflict && analysis.conflict[0]) ? analysis.conflict[0].key : '复仇';
    var mainMech = (analysis.powerMechanism && analysis.powerMechanism[0]) ? analysis.powerMechanism[0].key : '传承';

    // 主角 tagline 合成
    var protagonistTagline = this._protagonistTagline(mainProtagonist, mainGenre, mainMech);

    return {
      protagonist: {
        tagline: protagonistTagline,
        coreNeed: '必须设计主角至少一个"表面欲望"和一个"深层渴望"——两者可以冲突。',
        keyConflicts: [
          '对' + mainConflict + '过程中的自我怀疑——行动是否会让自己变成讨厌的人？',
          mainMech + '的诱惑与代价——力量是否会吞噬原本的自己？',
          '与至少一位核心配角的立场对立——情感与目标不可兼得。'
        ],
        suggestedArc: '受害者 → 反抗者 → 建设者 → 超越者（可按需调整阶段数）',
        designHints: [
          '请给主角至少一个"看似优点实则缺点"的特质（如过度自信 = 鲁莽）。',
          '请给主角至少一个"看似缺点实则优势"的特质（如多愁善感 = 洞察人心）。',
          '请给主角设计一个明确的"不能做之事"——作为其人格底线。'
        ]
      },
      rivals: [
        {
          role: '直接对手',
          archetype: mainGenre + '语境下与主角目标直接冲突的同辈/同领域人物',
          needThis: '必须比主角早 3 章（或更早）出场——读者需要先有印象。',
          designHints: '该对手要有独立于主角的目标和动机——不是为了"当主角对手"而存在。'
        },
        {
          role: '阶段性强敌',
          archetype: '某一阶段（如某卷）的主要障碍——实力/地位/资源显著高于主角',
          needThis: '必须有"为什么主角打不过"的清晰说明——不是对手强得无逻辑。',
          designHints: '该角色可以在被击败后转为中立/盟友/提供关键信息——角色应有多面性。'
        }
      ],
      mentors: [
        {
          role: '神秘导师',
          archetype: '隐居的上代强者/知情者/过来人',
          needThis: '必须有合理的不出手理由——不能"师父太强直接替主角解决一切"。',
          designHints: '导师本人应有未解的个人遗憾/执念——这将影响他/她对主角的教导方式。'
        }
      ],
      allies: [
        {
          role: '挚友/兄弟/伙伴',
          archetype: '不完美但忠诚——能力与主角互补',
          needThis: '应有独立目标——不可单纯为主角服务。',
          designHints: '伙伴的核心诉求在某个时刻必须与主角目标冲突——考验关系。'
        }
      ],
      loveInterests: [
        {
          role: '感情线对象',
          archetype: '身份/立场与主角对立或有差距——并非无脑倒贴',
          needThis: '感情线必须与主线缠结——不可独立成章。',
          designHints: '该角色的能力/背景/秘密应能推动主线——而非仅是情感调味。'
        }
      ],
      villains: [
        {
          role: '大反派/幕后黑手',
          archetype: '某种秩序的维护者或破坏者——有完整哲学',
          needThis: '动机不能仅是"邪恶"——需要有自洽的立场与代价。',
          designHints: '反派与主角的核心价值观应存在某种"镜像"关系——读者能理解其选择。'
        }
      ],
      extras: [
        {
          role: '功能性关键角色',
          archetype: '推动特定情节的一次性/阶段性角色（如情报商、医者、守门人等）',
          needThis: '每卷至少设计 2-3 个阶段角色。',
          designHints: '此类角色不必复杂，但需有"超出功能的一丝人格"——一句台词或一个习惯。'
        }
      ],
      summary: '共设计：主角 1 位 + 对手 2 位 + 导师 1 位 + 伙伴 1 位 + 感情对象 1 位 + 反派 1 位 + 功能性角色若干。建议最终作品中活跃角色不超过 12 人，避免读者认知过载。'
    };
  },

  // 辅助：主角标语合成
  _protagonistTagline: function(state, genre, mech) {
    var stateText = {
      '放逐': '被家族放逐的天才少年',
      '废柴': '看似废柴实则有大机缘的少年',
      '天才': '天赋异禀但命运多舛的青年',
      '重生': '带着前世记忆归来的重生者',
      '穿越': '从现代穿越到异世的清醒者',
      '失忆': '失去过往记忆、身份成谜的人',
      '孤儿': '身世不明、独自面对世界的少年',
      '落魄': '家道中落、从云端跌落的青年',
      '天之骄子': '出身名门、前途光明但骤遇剧变的青年',
      '隐藏身份': '有秘密身份的双面角色'
    };
    var base = stateText[state] || '有特殊经历的青年';
    return base + '——以' + mech + '为核心能力，在' + genre + '世界中踏上' + '一段成长与抉择的道路。';
  },

  /* ------------------------------------------------------------------
   * 方法 5：suggestCoreConflictsChain(templateChoice, volumeCount)
   * 生成核心矛盾链
   * ------------------------------------------------------------------ */
  suggestCoreConflictsChain: function(templateChoice, volumeCount) {
    var tpl;
    if (typeof templateChoice === 'string') {
      tpl = this.TEMPLATE_LIBRARY[templateChoice];
    } else if (templateChoice && templateChoice.templateId) {
      tpl = this.TEMPLATE_LIBRARY[templateChoice.templateId] || templateChoice;
    } else {
      tpl = templateChoice;
    }
    if (!tpl) {
      return { error: '未找到有效的模板，请先调用 selectTemplate() 或传入模板名。' };
    }

    var vols = tpl.volumes || [];
    var n = volumeCount || vols.length;
    var chain = [];

    // 冲突升级路径模板
    var escalationLevels = [
      '个人层面：生存 vs 压迫',
      '小范围：主角 vs 直接对手',
      '组织层面：主角派系 vs 敌对派系',
      '区域层面：主角势力 vs 区域势力',
      '世界观层面：主角理念 vs 旧秩序',
      '终极层面：主角 vs 世界规则/幕后力量'
    ];

    for (var i = 0; i < n; i++) {
      var level = Math.min(i, escalationLevels.length - 1);
      var v = vols[i] || {};
      var volNum = i + 1;
      var conflict;
      if (v.coreConflict) {
        conflict = v.coreConflict;
      } else {
        conflict = escalationLevels[level];
      }

      // 升级点描述
      var escalationPoint;
      if (i === 0) escalationPoint = '主角从"被动承受"转为"主动行动"的那一刻';
      else if (i === n - 1) escalationPoint = '主角解决冲突的方式必须展示其完整成长——不能用与第一卷相同的策略';
      else escalationPoint = '某件事让主角意识到"问题比我想的更大"——冲突范围从个人扩展到更大范畴';

      chain.push({
        volume: volNum,
        mainConflict: conflict,
        escalationPoint: escalationPoint,
        intensity: Math.round((i + 1) / n * 100),
        scale: escalationLevels[level]
      });
    }

    return {
      templateName: tpl.name,
      chain: chain,
      principle: '每卷的冲突必须在"范围/烈度/代价"三个维度中至少有一个维度升级，避免重复模式。冲突强度曲线应为：低→中→高→最高→回落，而非全程维持高强度。',
      summary: '从第 1 卷的个人层面冲突逐步升级到第 ' + n + ' 卷的终极对决，确保每卷的主要矛盾有清晰升级维度。'
    };
  },

  /* ------------------------------------------------------------------
   * 方法 6：generateInfoIncrementPlan(analysis, templateChoice)
   * 生成每卷"必须揭示的信息"清单——用于检查"信息倾倒"问题
   * ------------------------------------------------------------------ */
  generateInfoIncrementPlan: function(analysis, templateChoice) {
    var analysisResolved = typeof analysis === 'string' ? this.analyzeConcept(analysis) : analysis;

    var tpl;
    if (!templateChoice) {
      tpl = this.selectTemplate(analysisResolved).candidates[0];
    } else if (typeof templateChoice === 'string') {
      tpl = this.TEMPLATE_LIBRARY[templateChoice] || this.selectTemplate(analysisResolved).candidates[0];
    } else {
      tpl = templateChoice;
    }

    var totalVols = tpl.volumes ? tpl.volumes.length : 6;
    var plan = [];

    // 每卷的信息揭示规划
    for (var i = 0; i < totalVols; i++) {
      var volNum = i + 1;
      var v = tpl.volumes[i] || {};

      // 每卷建议揭示信息条数
      var infoItems = [];
      if (i === 0) {
        // 第一卷：密集世界介绍
        infoItems.push('【世界规则基础】世界是什么样的——地理/制度/力量体系简介（通过角色行动展现，而非旁白）');
        infoItems.push('【主角处境】主角是谁——身份、处境、短期目标');
        infoItems.push('【核心冲突引子】是什么推动主角不能再原地不动');
        infoItems.push('【金手指规则】主角的核心能力/优势是什么——有什么明确限制');
        infoItems.push('【关键角色初印象】2-3 名核心配角的第一印象——性格与初步动机');
      } else if (i === totalVols - 1) {
        // 最后一卷：大揭示
        infoItems.push('【终极真相】贯穿全书的最大谜团揭晓');
        infoItems.push('【反派动机】大反派的完整动机/哲学立场揭晓');
        infoItems.push('【主角身份真相】主角自身的某个重大谜底（如血脉/出身/预言身份）');
        infoItems.push('【代价与结局】所有主要角色的命运代价揭晓——没有免费的胜利');
      } else {
        // 中间卷：稳定节奏 3-5 条
        infoItems.push('【阶段揭示 A】与本卷核心冲突直接相关的一条关键信息');
        infoItems.push('【阶段揭示 B】关于某势力/组织/力量体系的一条深度信息');
        infoItems.push('【伏笔种子】为后续卷埋下的一条线索——以细节/对白/象征等方式');
        infoItems.push('【角色深度】某配角的过去或动机的一条揭示');
        if (i === Math.floor(totalVols / 2)) {
          infoItems.push('【中期大揭示】全书约 50% 处应有一条"让读者重新理解整个故事"的大揭示');
        }
      }

      // 节奏控制
      var paceNote;
      if (i === 0) paceNote = '第一卷信息密集度高，需以"角色行动驱动揭示"——避免一次性长篇介绍。建议前 10 章只介绍最必要信息，其余通过行动自然带出。';
      else if (i === totalVols - 1) paceNote = '终卷的大揭示必须有前面至少 2 卷的铺垫——不可以凭空出现。';
      else paceNote = '本卷稳定输出：每 3-4 章揭示 1 条核心信息。卷末至少有 1 条令人惊讶的揭示作为钩子。';

      plan.push({
        volume: volNum,
        title: v.title || ('第' + this._toChineseNum(volNum) + '卷'),
        infoCount: infoItems.length,
        items: infoItems,
        pacingNote: paceNote,
        warning: infoItems.length > 6 ? '⚠️ 本卷信息过多——建议拆分或推迟部分内容到下一卷。' : '✓ 信息量合理。'
      });
    }

    return {
      templateName: tpl.name,
      totalVolumes: totalVols,
      plan: plan,
      principles: [
        '原则一：先提出问题再给出答案——不要先解释世界再让主角行动。',
        '原则二：每 3-4 章揭示 1 条核心信息，避免信息倾倒。',
        '原则三：每次揭示必须改变主角或读者对某事的理解——否则该信息不必要。',
        '原则四：中期（约 50% 处）必须有一次大揭示，让读者重新审视整个故事。',
        '原则五：最终卷的大揭示必须有前面至少 2 卷的铺垫支撑。'
      ],
      summary: '共规划 ' + totalVols + ' 卷信息增量，平均每卷 ' +
               Math.round(plan.reduce(function(acc, p){ return acc + p.items.length; }, 0) / plan.length) +
               ' 条核心信息，请在写作时对照检查是否存在信息倾倒。'
    };
  },

  /* ------------------------------------------------------------------
   * 方法 7：fullExpansion(concept, platform, volumeCount) — 综合入口
   * 一键调用所有方法生成完整骨架建议报告
   * ------------------------------------------------------------------ */
  fullExpansion: function(concept, platform, volumeCount) {
    var conceptText = typeof concept === 'string' ? concept : (concept.rawText || '');
    var analysis = typeof concept === 'string' ? this.analyzeConcept(concept) : concept;
    // 平台名归一化
    var normalizePlatform = function (p) {
      if (!p) return 'qidian';
      var map = {
        '番茄': 'fanqie',
        'fanqie': 'fanqie',
        'qutu': 'fanqie',
        '起点': 'qidian',
        'qidian': 'qidian'
      };
      return map[p] || 'qidian';
    };
    var platformResolved = normalizePlatform(platform);
    var selection = this.selectTemplate(analysis, platformResolved);
    var primaryTpl = selection.candidates[0];

    // 如果用户指定了卷数，重新调整生成
    var volTpl = primaryTpl;
    if (volumeCount && volumeCount !== primaryTpl.recommendedVolumes) {
      volTpl = this._adjustTemplateToVolumes(primaryTpl, volumeCount);
    }

    var outline = this.expandToVolumeOutline(analysis, volTpl, platformResolved);
    var characters = this.suggestCoreCharacters(analysis, volTpl);
    var conflicts = this.suggestCoreConflictsChain(volTpl, outline.totalVolumes);
    var infoPlan = this.generateInfoIncrementPlan(analysis, volTpl);

    // 生成人类可读的综合报告
    var reportLines = [];
    reportLines.push('========== 文心笔匠 v2 · 概念自动展开引擎报告 ==========');
    reportLines.push('概念文本：' + analysis.rawText);
    reportLines.push('平台：' + platformResolved);
    reportLines.push('');
    reportLines.push('【1. 概念关键词分析】');
    reportLines.push('    ' + analysis.summary);
    reportLines.push('');
    reportLines.push('【2. 模板推荐】');
    for (var si = 0; si < selection.candidates.length; si++) {
      var c = selection.candidates[si];
      reportLines.push('    ' + (si + 1) + '. ' + c.templateName + '（匹配度：' + c.matchScore + '）— ' + c.tagline);
    }
    reportLines.push('    本次采用：' + primaryTpl.templateName);
    reportLines.push('');
    reportLines.push('【3. 多卷大纲骨架】');
    reportLines.push('    共 ' + outline.totalVolumes + ' 卷，约 ' + outline.totalChaptersEstimate + ' 章（按平台预估）');
    for (var vi = 0; vi < outline.volumes.length; vi++) {
      var vv = outline.volumes[vi];
      reportLines.push('    卷' + vv.volume + '「' + vv.title + '」' + vv.chapters + '章 · 核心冲突：' + vv.coreConflict.substring(0, 30));
    }
    reportLines.push('');
    reportLines.push('【4. 核心角色骨架】');
    reportLines.push('    主角：' + characters.protagonist.tagline);
    reportLines.push('    核心配角：对手 2 位 + 导师 1 位 + 伙伴 1 位 + 感情对象 1 位 + 反派 1 位');
    reportLines.push('    设计要求：每个角色须有独立动机与阶段性成长弧线。');
    reportLines.push('');
    reportLines.push('【5. 核心矛盾链】');
    reportLines.push('    ' + conflicts.summary);
    reportLines.push('');
    reportLines.push('【6. 信息增量规划】');
    reportLines.push('    ' + infoPlan.summary);
    reportLines.push('');
    reportLines.push('【7. 下一步建议】');
    reportLines.push('    a. 阅读完整骨架对象（outline/characters/conflicts/infoPlan），按需求修改。');
    reportLines.push('    b. 挑选 1-2 个你最想保留的元素，其余大胆替换或改造。');
    reportLines.push('    c. 在模板基础上补充：主角具体姓名、世界的地理/货币/时间单位等细节。');
    reportLines.push('    d. 用细纲生成工具从卷级大纲进一步下钻到章节级。');
    reportLines.push('    e. 至少设计 1 个"与模板期望相反"的情节——避免落入俗套。');
    reportLines.push('========================================================');

    return {
      meta: {
        version: this.VERSION,
        timestamp: new Date().toISOString(),
        concept: conceptText,
        platform: platformResolved
      },
      analysis: analysis,
      templateSelection: selection,
      templateMatches: selection.candidates,
      outline: outline,
      volumeOutline: outline.volumes,
      characters: characters,
      conflicts: conflicts,
      infoPlan: infoPlan,
      report: reportLines.join('\n')
    };
  },

  // 辅助：根据用户指定卷数调整模板
  _adjustTemplateToVolumes: function(tpl, targetVols) {
    if (!tpl.volumes || tpl.volumes.length === targetVols) return tpl;

    // 简单策略：卷数过少时在中间卷"拆分"，过多时合并相邻卷
    var current = tpl.volumes.slice();
    var adjustedTpl = Object.assign({}, tpl);
    adjustedTpl.recommendedVolumes = targetVols;

    if (targetVols > current.length) {
      // 扩展：在最后两卷之间插入若干"额外历练/探索"卷
      var extra = targetVols - current.length;
      for (var i = 0; i < extra; i++) {
        var insertPos = current.length - 1 - i;
        current.splice(insertPos, 0, {
          phase: '扩展探索' + (i + 1),
          title: '第' + this._toChineseNum(insertPos + 1) + '卷·额外探索',
          coreConflict: '主角在主线推进之间的一段重要探索/历练——推动能力或信息增量',
          characterArc: '深化某一技能/心智层次',
          endHook: '探索带来意外收获——对最终决战有关键帮助'
        });
      }
    } else if (targetVols < current.length) {
      // 压缩：从后往前合并相邻卷
      while (current.length > targetVols) {
        var mid = Math.floor(current.length / 2);
        // 合并 mid 和 mid+1
        var merged = Object.assign({}, current[mid], {
          title: current[mid].title + '·' + (current[mid + 1].title || '').replace(/^第.+卷·/, ''),
          coreConflict: (current[mid].coreConflict || '') + '；同时推进' + (current[mid + 1].coreConflict || ''),
          characterArc: (current[mid].characterArc || '') + '与' + (current[mid + 1].characterArc || '')
        });
        current.splice(mid, 2, merged);
      }
    }
    adjustedTpl.volumes = current;
    return adjustedTpl;
  }
};

// ========== 手动测试示例注释（不执行，仅用于开发参考） ==========
/*
  === 手动测试用例 ===

  // 测试 1：修仙复仇题材（最经典场景）
  var concept1 = '一个被家族放逐的少年，在废弃宗门遗址获得上古传承，踏上颠覆修仙界的道路。';
  var result1 = ConceptExpansionEngine.fullExpansion(concept1, 'qidian');
  console.log(result1.analysis.summary);
  console.log(result1.templateSelection.candidates[0].templateName);
  console.log(result1.outline.volumes.length + ' 卷');

  // 测试 2：都市逆袭题材
  var concept2 = '被开除的社畜程序员觉醒系统，凭借系统在都市创业逆袭，最终颠覆行业。';
  var result2 = ConceptExpansionEngine.fullExpansion(concept2, 'fanqie');
  console.log(result2.report);

  // 测试 3：末世进化题材
  var concept3 = '末世降临，丧尸横行，主角在废墟中觉醒异能，建立幸存者据点对抗进化丧尸与人类敌人。';
  var result3 = ConceptExpansionEngine.fullExpansion(concept3, 'qidian');
  console.log(result3.conflicts.chain.map(function(c){ return '卷' + c.volume + ': ' + c.mainConflict; }).join('\n'));

  // 测试 4：重生悔恨流
  var concept4 = '前世被兄弟背叛家破人亡，重生回到二十岁，利用先知纠正遗憾规避悲剧，重新走上巅峰。';
  var result4 = ConceptExpansionEngine.fullExpansion(concept4, 'fanqie');
  console.log(result4.infoPlan.plan[0].items);

  // 测试 5：单独调用某个方法
  var analysis = ConceptExpansionEngine.analyzeConcept(concept1);
  var selection = ConceptExpansionEngine.selectTemplate(analysis, 'qidian');
  var chars = ConceptExpansionEngine.suggestCoreCharacters(analysis, selection.candidates[0]);
  console.log(JSON.stringify(chars.protagonist, null, 2));
*/

// ========== Node.js 环境下支持 module.exports 供测试 ==========
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConceptExpansionEngine;
}
