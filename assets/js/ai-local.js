/* 文心笔匠 - 本地AI增强模块 v2.0 */

// ========== 0. 题材风格库（v3.0增强版—去套路化） ==========
var GENRE_STYLES = {
  '玄幻': {
    tone: '宏大、热血、神秘、诡谲、新锐',
    commonPhrases: ['灵气', '功法', '境界', '突破', '天劫', '法宝', '丹药', '秘境', '传承', '血脉', '诡异', '代价', '规则', '暗面', '源质'],
    sentencePatterns: [],
    powerWords: ['毁天灭地', '惊天动地', '气吞山河', '威震八方', '所向披靡', '规则重塑', '因果倒悬', '法则碎灭', '万古一梦', '逆流而上', '以凡人之躯', '向死而生'],
    transitions: ['与此同时', '就在此时', '刹那间', '说时迟那时快', '千钧一发之际', '仿佛命运之手', '无人察觉的是', '比所有人的反应更快', '比时间本身更慢']
  },
  '仙侠': {
    tone: '飘逸、清雅、意境深远、萧索、破而后立',
    commonPhrases: ['剑意', '飞剑', '灵根', '道心', '悟道', '飞升', '仙缘', '洞天', '灵兽', '法宝', '因果', '轮回', '执念', '天罚', '红尘'],
    sentencePatterns: [],
    powerWords: ['剑气纵横', '一剑破万法', '御剑乘风', '逍遥天地', '羽化登仙', '道心种魔', '斩因果', '逆天命', '红尘炼心', '以凡证仙'],
    transitions: ['须臾间', '转瞬之间', '片刻后', '不多时', '良久', '一炷香后', '这一等便是', '回眸已是百年身', '光阴不等人']
  },
  '都市': {
    tone: '现代、快节奏、接地气、荒诞、黑色幽默',
    commonPhrases: ['异能', '系统', '任务', '积分', '升级', '豪门', '总裁', '神医', '社畜', '内卷', '副业', '风口', '算法', '流量'],
    sentencePatterns: [],
    powerWords: ['一手遮天', '翻云覆雨', '只手遮天', '叱咤风云', '呼风唤雨', '降维打击', '跨界碾压', '规则制定者', '信息差', '降本增效'],
    transitions: ['就在这时', '下一秒', '紧接着', '忽然', '不料', '然后群聊炸了', '弹幕飘过', '手机响了']
  },
  '历史': {
    tone: '厚重、苍凉、权谋、悲悯、逆流',
    commonPhrases: ['兵马', '粮草', '城池', '朝堂', '权谋', '江山', '社稷', '黎民', '天下', '群雄', '流民', '田亩', '漕运', '世族', '寒门'],
    sentencePatterns: [],
    powerWords: ['千军万马', '金戈铁马', '气吞万里', '雄才大略', '运筹帷幄', '力挽狂澜', '知其不可为而为之', '天下兴亡', '匹夫之怒', '稻粱为谋'],
    transitions: ['是日', '翌日', '当夜', '不多时', '须臾', '自此以后', '此去经年', '谁也没想到']
  },
  '末世': {
    tone: '压抑、绝望、求生、荒诞、人性',
    commonPhrases: ['丧尸', '变异', '物资', '幸存者', '基地', '辐射', '感染', '废墟', '逃亡', '进化', '废土', '种植', '电池', '净水', '广播'],
    sentencePatterns: [],
    powerWords: ['尸山血海', '九死一生', '绝地求生', '生死一线', '命悬一线', '寸草不生', '万里无人', '文明的火种', '最后的[某物]', '比死更可怕的[某物]'],
    transitions: ['突然', '毫无征兆地', '下一秒', '就在此时', '刹那间', '然后灯灭了', '无线电响了', '地平线上出现了']
  },
  '武侠': {
    tone: '快意恩仇、江湖气、洒脱、反骨、烟火',
    commonPhrases: ['内力', '轻功', '暗器', '门派', '江湖', '恩怨', '侠义', '武功', '招式', '兵器', '酒楼', '镖局', '书生', '戏班', '账房'],
    sentencePatterns: [
      '[人物]身形一展，[动作]。',
      '[兵器][动作]，[效果]。',
      '[人物]朗声道："[对话]"',
      '[场景]中，[人物][动作]。',
      '[人物]眼中[情绪]一闪而过，[动作]。',
      '江湖人都在传[某人某事]，但[人物]从来不信，直到[亲眼所见]。',
      '那一战之后，[人物]再也没有用过[标志性武功]。',
      '[人物]的武功不是最厉害的，但他/她有一个别人都没有的优势：[非武功的优势]。',
      '"我不用剑已经[时间]了，"[人物]说着，[令人意外的举动]。',
      '酒楼的帐房先生看了[人物]一眼，说了一句只有行家才懂的话。',
      '这不是什么大侠的故事，而是一个[普通/边缘]人的故事。',
      '[人物]发现仇人[在做一件好事/意外行为]，犹豫了。',
      '这把刀/剑/暗器的来历比[人物]本人更[荒诞/传奇]——它曾经属于[出人意料的前任主人]。'
    ],
    powerWords: ['独步天下', '一代宗师', '武林至尊', '绝世高手', '名扬四海', '天下无敌', '事了拂衣去', '刀光剑影', '一诺千金', '快意恩仇'],
    transitions: ['说时迟那时快', '电光火石间', '眨眼间', '转瞬间', '须臾间', '这一招之后', '这壶茶还没凉']
  },

  // === 2026新生题材 ===

  '规则怪谈': {
    tone: '诡异、压抑、逻辑解谜、细思极恐、日常崩坏',
    commonPhrases: ['规则', '禁忌', '扭曲', '收容', '异常', '污染', '认知危害', '模因', '锚点', 'san值', '仪式', '代价', '副本', '存活', '被遗忘'],
    sentencePatterns: [
      '规则第一条：[看似正常的指令]。规则第二条：[微妙的异常]。规则第三条：[细思极恐的内容]。',
      '[人物]犹豫了一下，然后做了一件任何人都不会做的事：[违反常理的举动]。',
      '它站在走廊尽头，没有动，只是[无法描述的异常行为]。',
      '没有人记得[某人/某物]曾经存在过——除了[人物]。',
      '镜子里的倒影慢了半拍才跟上[人物]的动作。',
      '这个房间有[数字]条规则。但[人物]发现，遵守规则才是最大的危险。',
      '走廊比昨天长了[距离]。没有人注意到，除了[人物]。',
      '[人物]回头看了一眼，然后立刻后悔了——[不可描述的画面]正在[something]。',
      '"请勿回头"的告示贴在墙上，但[人物]已经听到了身后的[声音]。',
      '副本通关的条件是[看似简单的要求]。代价是[令人窒息的代价]。',
      '规则不是用来遵守的。规则是用来让你以为你在遵守的时候，慢慢[被改变/被吞噬/被替换]。',
      '[人物]在笔记本上写下："第[数字]天。我还是我自己吗？"'
    ],
    powerWords: ['san值归零', '不可名状', '认知污染', '规则即陷阱', '见之即死', '模因传播', '锚定现实', '深海恐惧', '阈限空间'],
    transitions: ['脚步声在走廊里回荡', '灯闪了一下', '广播响了', '门自己关上了', '日历翻到下一页', '监控画面里']
  },
  '悬疑灵异': {
    tone: '民俗、乡野、禁忌、调查解谜、虚实交错',
    commonPhrases: ['民俗', '禁忌', '祭祀', '风水', '阴阳', '煞气', '僵尸', '狐仙', '村庙', '老宅', '棺材', '纸钱', '头七', '回魂', '地窖', '山神庙'],
    sentencePatterns: [
      '村里老人说，[某个看似迷信的说法]。[人物]当时不信，直到[亲眼所见]。',
      '这个习俗已经传承了[数字]代，没有人知道为什么——只知道违反的人都没有好下场。',
      '[人物]翻开族谱，发现在[年份]那一页，有一个名字被涂黑了。',
      '井里倒映出的不是[人物]的脸，而是[另一个面孔/景象]。',
      '凌晨三点，[人物]被[声音]惊醒，发现[异常现象]。',
      '考古队在[地点]发现了[年代]的[物品]，上面刻着[可辨认的文字]。',
      '[人物]走访了七位老人，得到了七种不同的说法——但每种的[共同点]都指向[恐怖结论]。',
      '这个村子没有[常见事物]，但所有人都觉得理所当然。',
      '[人物]用手机拍下[东西]，但照片上什么都没有。不对——照片上多了一个不该存在的东西。'
    ],
    powerWords: ['民俗禁忌', '百无禁忌', '因果报应', '祖坟冒烟', '风水宝地', '煞气入体', '回光返照', '阴兵借道'],
    transitions: ['天色将暗', '鸡叫了第一声', '祠堂的门缓缓打开', '供桌上的蜡烛', '纸灰飘起', '有人敲了三下门']
  },
  '发疯/癫文': {
    tone: '疯批、解构、黑色幽默、自嘲、反套路',
    commonPhrases: ['穿书', '发疯', '炮灰', '觉醒', '剧情', '原书', '男女主', '系统提示', '弹幕', '吐槽', 'ooc', '崩人设', '任务', '奖励', '惩罚', '剧情强制'],
    sentencePatterns: [
      '系统提示：[反常规的系统通知，带有明显的黑色幽默或嘲讽]。[人物]看了一眼，然后毫不犹豫地选择了[反常识操作]。',
      '"原书中这段剧情应该是[标准套路]，" [人物]自言自语，"但我是炮灰啊，关我什么事。"',
      '[人物]对着系统面板竖了中指，然后做了一件所有穿书者都不会做的事：[疯狂的行为]。',
      '弹幕飘过：["这女主疯了！""哈哈哈哈笑死""求求你做个人吧"]',
      '按照原著剧情，[人物]现在应该[做某事]。他/她深吸一口气，然后[做了完全相反的事]。',
      '系统发出警告：[规则]。[人物]看了三秒，然后以一种惊人的冷静把警告关了，继续[做自己的事]。',
      '"我不想走剧情了，" [人物]平静地说，"我就想看这个世界把我也写成BUG会怎样。"',
      '反派（按原著设定应该很可怕地）出现了。[人物]看着他/她，真诚地打了个哈欠。'
    ],
    powerWords: ['觉醒独立意识', '剧情抗拒', '穿书bug', '人设崩塌', '发疯保命', '系统频繁报错', '彻底摆烂'],
    transitions: ['弹幕炸了', '系统疯狂报错', '剧情线崩了', '评论区哗然', '世界观动摇了一下', '然后整个世界沉默了']
  },
  '经营建设': {
    tone: '务实、策略、成长、团队、数据说话',
    commonPhrases: ['资源', '产能', '科技树', '人口', 'GDP', '产业链', '供应链', '拓荒', '开垦', '贸易', '基建', '规划', '效率', '人材', '粮仓', '工坊'],
    sentencePatterns: [
      '第[数字]天的产出报表：粮食+[数字]、矿石+[数字]、人口+[数字]、民心-[数字]。',
      '[人物]在地图上画了一个圈——这里将成为新[设施]的所在地。论证过程用了[数字]页纸。',
      '当第一批[产品]从[设施]中产出的时候，所有人都沉默了。不是因为多，而是因为[意外效果]。',
      '隔壁[势力]派人来谈判贸易条件。他们以为[人物]是新手，直到看到桌上的报表。',
      '[人物]发现了一个被所有人忽视的资源：[看似无用的东西]。三年后，它成了[领地]的命脉。',
      '不是所有问题都能用[武力/权力]解决。有时候，一纸[合同/规划/法令]比一支军队更有力量。',
      '[人物]取消了[传统制度]，代之以[新制度]。[反对者]起义了——但三个月后，[反对者]成了最坚定的支持者。'
    ],
    powerWords: ['降本增效', '产业升级', '弯道超车', '精细化运营', '资源闭环', '复合增长率', '马太效应'],
    transitions: ['季度报表显示', '建设进度', '人口普查后', '贸易路线打通', '第一批移民到达', '统计口径变了']
  }
};

// ========== 1. 智能模板库 ==========
var LOCAL_INSPIRATION = {
  // 世界观创造引导 —— 不给答案，只给提问
  worldHints: {
    '玄幻': '尝试回答：这个世界的力量本质是什么？（不是灵气，可能是声音/记忆/名字/影子/血液）修炼者在社会中的真实地位是怎样的？修炼资源是如何生产和分配的——它们是自然产物还是需要"制造"？力量体系的代价是什么，有没有不可逆的后果？',
    '仙侠': '尝试回答：飞升真的是好事吗，还是某种筛选/收割机制？法宝有没有自己的意志或代价？所谓"天道"是谁定的规则，有没有可能被欺骗或改写？正邪之分是立场还是本质？',
    '都市': '尝试回答：异能者如何隐匿在现代社会——不是简单地"藏在人群"，而是现代制度（社保/监控/征信）对他们的具体威胁和利用？异能觉醒与阶级有什么关联？有没有"合法"使用异能的灰色地带？',
    '末世': '尝试回答：末世后的权力结构如何形成和维持？丧尸/变异生物有没有自己的生态逻辑而非单纯的"吃人"？稀缺资源除了食物和水，有没有更出人意料的东西成为硬通货？道德崩塌后的新伦理是什么，谁在制定它？',
    '武侠': '尝试回答：武功的本质是什么——是身体的极限、气的运用、还是心境的投射？江湖秩序靠什么维持，暴力之外还有什么约束力？所谓"侠"有没有时代局限性，不同阶层的人理解的侠义是否完全不同？',
    '科幻': '尝试回答：技术发展的意外后果是什么——不是AI叛变这种老套，而是更微妙的社会异化？人类在宇宙中的位置被某个发现彻底动摇是什么感觉？技术的民主化是否总是好的，有没有"不应该被普及的技术"？',
    '规则怪谈': '尝试回答：规则本身有没有漏洞、矛盾、或意想不到的组合方式？遵守规则的人最终会变成什么？违反规则的惩罚一定是即时的吗，还是延迟/累积/间接的？规则有没有自己的意图？',
    '悬疑灵异': '尝试回答：超自然现象有没有自己的"规则"和"生态"？恐惧来源是未知本身，还是已知中的异常？传统仪式在现代语境下是失效了、变异了、还是被重新发现了？',
    '发疯/癫文': '不提供固定模板——这类题材的核心就是打破模板。让AI自由发挥：主角可以撕碎剧本、修改系统提示、在弹幕里和读者吵架，一切规则的打破都应该是不重复的。',
    '经营建设': '尝试回答：建设的"效率"是否一定是好的？会不会有得不偿失的"建设"？人口扩张带来的不是繁荣而是复杂性问题。技术路线选择的分叉点在哪里，走错一条路需要付出什么代价？'
  },
  // 人物创造引导 —— 不给性格列表，只给创造方法
  charHints: {
    protagonist: '创造主角时，请避开以下惯常模式：天选之人/穿越者/重生者/隐藏血脉。思考：（1）这个人物最不可调和的内部矛盾是什么？（善良和实用主义的冲突？忠诚和野心的拉扯？对自由的追求和对安全感的渴望？）（2）他/她有什么在"正常情况下"绝不会做的事，但在什么极端情况下可能会做？（3）他/她最害怕别人发现自己的哪一点？（4）如果不做主角，这个人物在社会中会是什么角色？（5）这个人物在故事中犯过的最蠢的错误是什么，那个错误如何以意想不到的方式改变了他的处境？',
    antagonist: '创造反派时，请思考：（1）如果从他的视角讲这个故事，谁才是反派？（2）他的目标在什么道德框架下是合理的？（3）他有没有真心爱护、愿意为之牺牲的人或事物？（4）他失败的最可能原因是什么——不是因为不够强，而是因为什么性格或认知盲区？（5）如果他和主角在另一个情境下相遇，有没有可能成为朋友或盟友？',
    mentor: '创造导师时请避开"实力深不可测的老前辈"模式。思考：（1）导师有没有正在失败或已经失败的个人项目/执念？（2）他教给主角的东西有没有是他自己做不到但主角做得到的？（3）导师和主角有没有根本理念上的分歧？（4）导师有没有隐瞒——不是为了保护主角，而是因为自己不愿意面对？',
    ally: '创造伙伴时请避开"各有所长性格互补"的模板。思考：（1）这个伙伴有没有主角完全不理解但合理的行为逻辑？（2）如果有一天他的个人目标和主角的目标冲突，他会怎么选？（3）他有没有主角不知道的秘密，那个秘密不是坏的但会改变一切？（4）在某种情境下，他有没有可能成为主角的阻碍而非帮手？'
  },
  // 故事结构引导 —— 不给固定步骤，只给探索方向
  plotHints: {
    '崛起流': '不要按"低谷→机遇→成功→打压→反击→巅峰"的固定步骤。探索：崛起过程中的"代价"——每次上升都伴随什么失去？崛起的"不可逆性"——有没有某个节点之后再也回不去了？崛起被别人如何看待——有人受益、有人受损、有人漠不关心？',
    '复仇流': '不要按"被灭→修炼→调查→消灭→复仇成功"的模式。探索：复仇过程中复仇者自身变成了什么？仇恨是否被他投射到了无辜者身上？复仇成功后，然后呢？有没有让复仇者犹豫的意外发现——仇人有自己不知道的苦衷或另一个身份？',
    '探险流': '不要按"接任务→组队→进险地→发现→危机→收获"的六步。探索：探险目的是否在过程中被推翻或重新定义？发现的东西是否是探险者"不该发现"的？队伍的内部矛盾在极端环境下如何演变？',
    '争霸流': '不要按"乱世→积累→纵横→决战→称霸→新秩序"的模板。探索：争霸的"丑陋面"——为了胜利愿意牺牲什么？称霸后的孤独感——打赢了之后和谁说话？所谓"新秩序"是否只是换了主人的旧秩序？',
    '日常流': '不要按"平静→突发事件→解决→结识→成长→温馨结局"。探索：日常的"不日常"——看似平凡的互动中隐藏了什么？真正动人的不是事件而是观察的深度——一个动作、一个眼神、一次沉默里的完整故事？'
  },
  // === 兼容旧代码引用，避免报错 ===
  chars: {},
  plot: { '崛起流': ['自由创作'], '复仇流': ['自由创作'], '探险流': ['自由创作'], '争霸流': ['自由创作'], '日常流': ['自由创作'] },
  world: {}
};

// 兼容旧引用
var LOCAL_TEMPLATES = LOCAL_INSPIRATION;

// ========== 具体世界观数据库 ==========
var WORLD_DATABASE = {
  '玄幻': {
    worldNames: ['玄黄界', '苍澜大陆', '九霄域', '万灵界', '太虚境'],
    factions: [
      { name: '天玄宗', desc: '正道魁首，以剑修和阵法闻名，宗门位于青云山脉', leader: '玄清真人', stance: '正道', relation: '主角初始宗门' },
      { name: '魔焰门', desc: '魔道大宗，修炼火系魔功，行事狠辣无情', leader: '炎魔老祖', stance: '魔道', relation: '主要敌对势力' },
      { name: '万兽谷', desc: '御兽世家，与灵兽缔结契约，实力深不可测', leader: '兽皇独孤野', stance: '中立', relation: '亦敌亦友' },
      { name: '天机阁', desc: '情报组织，贩卖消息和宝物，势力遍布大陆', leader: '阁主无名', stance: '中立', relation: '交易伙伴' },
      { name: '血煞教', desc: '邪道隐秘组织，以血祭修炼，图谋复活远古魔神', leader: '血衣侯', stance: '邪道', relation: '幕后黑手' }
    ],
    regions: [
      { name: '青云州', desc: '天玄宗所在，灵气充沛，山清水秀，修仙圣地' },
      { name: '赤焰荒原', desc: '魔焰门势力范围，火山遍布，岩浆横流，环境恶劣' },
      { name: '万兽森林', desc: '灵兽栖息地，古树参天，危机四伏，机遇与危险并存' },
      { name: '幽冥海域', desc: '神秘海域，传说有上古遗迹，海妖横行' },
      { name: '葬神沙漠', desc: '远古战场遗址，沙尘暴肆虐，埋藏着无数秘密' }
    ],
    powerSystem: {
      name: '九转玄功',
      levels: [
        { name: '练气境', desc: '引气入体，淬炼肉身', breakthrough: '凝聚气海' },
        { name: '筑基境', desc: '奠定道基，灵气化液', breakthrough: '渡过心魔劫' },
        { name: '结丹境', desc: '凝液成丹，寿元大增', breakthrough: '金丹九转' },
        { name: '元婴境', desc: '丹破婴生，神识大涨', breakthrough: '元婴出窍' },
        { name: '化神境', desc: '元神合一，感悟法则', breakthrough: '领悟一条完整法则' },
        { name: '渡劫境', desc: '引动天劫，逆天改命', breakthrough: '渡过九重天劫' },
        { name: '大乘境', desc: '法力圆满，半步真仙', breakthrough: '斩去三尸' },
        { name: '真仙境', desc: '超脱凡俗，与天地同寿', breakthrough: '飞升仙界' }
      ]
    },
    histories: [
      '三百年前，正邪大战爆发，天玄宗前任宗主以生命为代价封印了魔神',
      '一百年前，天机阁预言「天命之子」将降临，引发各方势力暗流涌动',
      '五十年前，万兽谷谷主失踪，谷中灵兽暴动，至今未查明真相',
      '二十年前，血煞教开始暗中活动，各地频频发生血祭惨案'
    ]
  },
  '仙侠': {
    worldNames: ['灵霄界', '蓬莱洲', '昆仑墟', '蜀山界', '天外天'],
    factions: [
      { name: '蜀山剑派', desc: '天下第一剑修宗门，镇派之宝为紫青双剑', leader: '剑圣李长空', stance: '正道', relation: '主角师门' },
      { name: '幽冥魔宫', desc: '魔道至尊，修炼幽冥鬼道，与蜀山世代为敌', leader: '魔君夜无殇', stance: '魔道', relation: '宿敌' },
      { name: '瑶池仙宫', desc: '女修圣地，医术和炼丹术天下无双', leader: '西王母传人', stance: '正道', relation: '盟友' },
      { name: '龙宫', desc: '东海龙族居所，掌管海域，珍宝无数', leader: '东海龙王敖广', stance: '中立', relation: '利益相关' },
      { name: '万佛宗', desc: '佛门圣地，修炼功德金身，不问世事', leader: '迦叶尊者', stance: '中立', relation: '潜在助力' }
    ],
    regions: [
      { name: '蜀山', desc: '万仞奇峰，剑气冲霄，剑修圣地' },
      { name: '幽冥深渊', desc: '魔气弥漫，鬼哭狼嚎，魔道大本营' },
      { name: '瑶池仙境', desc: '桃花盛开，仙鹤翱翔，人间仙境' },
      { name: '东海', desc: '碧波万顷，龙宫隐现，海族领地' },
      { name: '不周山遗址', desc: '天柱崩塌之处，空间裂缝密布，上古遗迹' }
    ],
    powerSystem: {
      name: '剑道九重天',
      levels: [
        { name: '练气', desc: '感应天地灵气，淬炼肉身', breakthrough: '开辟丹田' },
        { name: '筑基', desc: '道基稳固，可御剑飞行', breakthrough: '剑心通明' },
        { name: '金丹', desc: '金丹初成，剑气化形', breakthrough: '领悟剑意' },
        { name: '元婴', desc: '元婴孕育，剑意通神', breakthrough: '人剑合一' },
        { name: '化神', desc: '化神期，可分化万千剑影', breakthrough: '剑域初成' },
        { name: '合体', desc: '与剑灵合体，战力暴涨', breakthrough: '剑灵觉醒' },
        { name: '大乘', desc: '剑道大成，一剑破万法', breakthrough: '自创剑诀' },
        { name: '渡劫', desc: '渡劫飞升，剑开天门', breakthrough: '渡过飞升劫' },
        { name: '真仙', desc: '羽化登仙，与天地同寿', breakthrough: '斩断尘缘' }
      ]
    },
    histories: [
      '千年前，蜀山祖师以紫青双剑封印幽冥魔尊于深渊之下',
      '五百年前，正邪大战，蜀山与幽冥魔宫两败俱伤，签订休战协议',
      '百年前，天机示警，「魔尊将醒，浩劫再临」',
      '十年前，主角被蜀山掌门李长空从山下捡回，身世成谜'
    ]
  },
  '都市': {
    worldNames: ['华夏国', '龙都市', '新纪元市', '天海市', '江宁市'],
    factions: [
      { name: '龙组', desc: '国家直属异能组织，维护都市异能界秩序', leader: '龙首楚天行', stance: '官方', relation: '主角所属组织' },
      { name: '暗影议会', desc: '地下异能者联盟，从事非法交易和暗杀', leader: '议长影', stance: '黑暗', relation: '敌对势力' },
      { name: '林氏集团', desc: '商业巨头，暗中研究异能科技', leader: '林震天', stance: '中立', relation: '主角家族' },
      { name: '天启学院', desc: '异能者培养学校，各国精英汇聚', leader: '院长方文博', stance: '中立', relation: '主角母校' },
      { name: '血玫瑰', desc: '女性异能者组织，情报网遍布全球', leader: '玫瑰夫人', stance: '中立', relation: '复杂关系' }
    ],
    regions: [
      { name: '龙都CBD', desc: '繁华商业中心，林氏集团总部所在地' },
      { name: '旧城贫民区', desc: '龙蛇混杂，暗影议会据点隐藏其中' },
      { name: '天启学院', desc: '占地千亩，现代化设施与古老建筑并存' },
      { name: '地下黑市', desc: '废弃地铁隧道改造，异能物品交易场所' },
      { name: '禁区', desc: '城市边缘辐射区，变异生物出没' }
    ],
    powerSystem: {
      name: '异能觉醒体系',
      levels: [
        { name: 'F级', desc: '初觉醒，能力微弱，仅比常人略强', breakthrough: '能力稳定化' },
        { name: 'E级', desc: '能力初步掌控，可应对小型危机', breakthrough: '实战突破' },
        { name: 'D级', desc: '能力成熟，可独当一面', breakthrough: '能力质变' },
        { name: 'C级', desc: '精英异能者，能力多样化', breakthrough: '领悟领域雏形' },
        { name: 'B级', desc: '高手级别，可影响小范围战局', breakthrough: '领域成型' },
        { name: 'A级', desc: '顶级强者，一人可敌千军', breakthrough: '法则感悟' },
        { name: 'S级', desc: '传说级，能力通天彻地', breakthrough: '天人合一' },
        { name: 'SS级', desc: '神级，可改变世界格局', breakthrough: '突破人类极限' }
      ]
    },
    histories: [
      '二十年前，全球异能大觉醒，人类社会格局剧变',
      '十五年前，龙组成立，制定异能者管理条例',
      '十年前，暗影议会发动「暗夜之乱」，被龙组镇压',
      '五年前，主角在一次意外中觉醒异能，被天启学院录取'
    ]
  },
  '武侠': {
    worldNames: ['九州大陆', '华夏江湖', '武林世界', '大乾王朝', '天元界'],
    factions: [
      { name: '少林寺', desc: '武林泰山北斗，七十二绝技威震江湖', leader: '方丈玄慈', stance: '正道', relation: '盟友' },
      { name: '武当派', desc: '道教圣地，太极神功玄妙莫测', leader: '掌门张三丰', stance: '正道', relation: '主角师门' },
      { name: '血刀门', desc: '邪道大派，刀法狠辣，行事不择手段', leader: '门主血刀老祖', stance: '邪道', relation: '血仇之敌' },
      { name: '丐帮', desc: '天下第一大帮，消息灵通，弟子遍布天下', leader: '帮主洪九公', stance: '正道', relation: '盟友' },
      { name: '锦衣卫', desc: '朝廷鹰犬，武功高强，监视江湖', leader: '指挥使陆炳', stance: '官方', relation: '亦敌亦友' }
    ],
    regions: [
      { name: '武当山', desc: '道教名山，云雾缭绕，武当派所在地' },
      { name: '少室山', desc: '五岳之中，少林寺坐落于此' },
      { name: '洛阳城', desc: '古都繁华，各方势力交汇之处' },
      { name: '塞北草原', desc: '大漠孤烟，马贼横行，血刀门势力范围' },
      { name: '江南水乡', desc: '烟雨朦胧，暗流涌动，情报交易之地' }
    ],
    powerSystem: {
      name: '内功境界',
      levels: [
        { name: '三流', desc: '初窥门径，内力浅薄', breakthrough: '打通任脉' },
        { name: '二流', desc: '内力小成，可施展基础招式', breakthrough: '打通督脉' },
        { name: '一流', desc: '内力浑厚，在江湖上有名号', breakthrough: '任督二脉贯通' },
        { name: '顶尖', desc: '内力精纯，罕逢敌手', breakthrough: '领悟武学真意' },
        { name: '宗师', desc: '开宗立派，自创武学', breakthrough: '天人合一' },
        { name: '大宗师', desc: '武道巅峰，近乎陆地神仙', breakthrough: '破碎虚空' },
        { name: '绝世', desc: '传说中的境界，百年难遇', breakthrough: '超凡入圣' }
      ]
    },
    histories: [
      '百年前，武当祖师张三丰创立太极拳，威震武林',
      '三十年前，血刀门灭武当弟子满门，双方结下血仇',
      '十五年前，丐帮前任帮主离奇死亡，帮中分裂',
      '十年前，主角被张三丰收为关门弟子，身负血海深仇'
    ]
  },
  '末世': {
    worldNames: ['废土世界', '末日地球', '荒芜星球', '新纪元', '破碎世界'],
    factions: [
      { name: '曙光基地', desc: '人类最大幸存者据点，秩序井然', leader: '指挥官陈锋', stance: '人类', relation: '主角据点' },
      { name: '掠夺者军团', desc: '废土强盗，烧杀抢掠，无恶不作', leader: '军团长狂狼', stance: '混乱', relation: '敌对' },
      { name: '净化者', desc: '极端组织，认为感染者是进化方向', leader: '先知零号', stance: '变异', relation: '敌对' },
      { name: '科学家联盟', desc: '残余科研人员，致力于研究病毒和解药', leader: '首席博士林薇', stance: '人类', relation: '盟友' },
      { name: '黑市商人', desc: '废土贸易网络，消息灵通，物资丰富', leader: '老板老K', stance: '中立', relation: '交易伙伴' }
    ],
    regions: [
      { name: '曙光基地', desc: '废弃军事基地改造，高墙电网，相对安全' },
      { name: '辐射区', desc: '核爆中心，辐射强烈，变异生物出没' },
      { name: '废墟城市', desc: '昔日繁华都市，如今丧尸横行，物资丰富' },
      { name: '荒野', desc: '城市之外，资源匮乏，流民聚集' },
      { name: '地下实验室', desc: '秘密科研设施，病毒源头可能在此' }
    ],
    powerSystem: {
      name: '进化体系',
      levels: [
        { name: '普通人', desc: '未感染，无特殊能力', breakthrough: '感染病毒并存活' },
        { name: '进化者', desc: '初级进化，身体素质提升', breakthrough: '吸收晶核能量' },
        { name: '超进化者', desc: '获得特殊能力，如力量、速度强化', breakthrough: '多次生死战斗' },
        { name: '完美进化者', desc: '能力全面强化，可对抗尸群', breakthrough: '融合高级晶核' },
        { name: '新人类', desc: '基因重组，拥有超自然能力', breakthrough: '基因觉醒' }
      ]
    },
    histories: [
      '五年前，「天启病毒」爆发，人类文明在三个月内崩溃',
      '四年前，曙光基地建立，成为人类最后堡垒',
      '三年前，掠夺者军团崛起，与曙光基地多次冲突',
      '一年前，科学家联盟发现病毒并非自然产生，背后有人为痕迹'
    ]
  },
  '历史': {
    worldNames: ['大乾王朝', '大楚帝国', '天元皇朝', '华夏古国', '九州王朝'],
    factions: [
      { name: '皇室', desc: '统治天下，掌握最高权力', leader: '皇帝', stance: '正统', relation: '主角效忠对象' },
      { name: '世家联盟', desc: '百年世家，门生故吏遍布朝野', leader: '盟主谢安', stance: '士族', relation: '合作与博弈' },
      { name: '边军', desc: '镇守边疆，抵御外敌，战力最强', leader: '大将军霍去病', stance: '军方', relation: '主角靠山' },
      { name: '宦官集团', desc: '内廷势力，把持朝政，排除异己', leader: '大太监魏忠贤', stance: '阉党', relation: '政敌' },
      { name: '义军', desc: '民间起义力量，反抗暴政', leader: '闯王李自成', stance: '反叛', relation: '复杂关系' }
    ],
    regions: [
      { name: '京师', desc: '皇城所在，天下政治中心' },
      { name: '边疆', desc: '烽火连天，将士浴血奋战' },
      { name: '江南', desc: '鱼米之乡，世家大族盘踞' },
      { name: '关中', desc: '龙兴之地，兵家必争' },
      { name: '蜀地', desc: '天府之国，易守难攻' }
    ],
    powerSystem: {
      name: '权位体系',
      levels: [
        { name: '庶民', desc: '普通百姓，无权无势', breakthrough: '获得举荐或军功' },
        { name: '豪强', desc: '地方望族，掌握乡里话语权', breakthrough: '积累财富与人脉' },
        { name: '官吏', desc: '官府任职，执掌一方事务', breakthrough: '攀附权贵或政绩显赫' },
        { name: '郡守', desc: '统辖一郡，军政大权在握', breakthrough: '军功或朝中靠山' },
        { name: '刺史', desc: '监察州郡，代天子巡狩', breakthrough: '皇帝信任' },
        { name: '三公', desc: '位极人臣，执掌朝政', breakthrough: '权谋与时运' },
        { name: '摄政', desc: '挟天子以令诸侯', breakthrough: '天时地利人和' },
        { name: '帝王', desc: '开创新朝，君临天下', breakthrough: '终结乱世' }
      ]
    },
    histories: [
      '三十年前，先帝驾崩，幼主登基，朝中大乱',
      '二十年前，边疆战事起，大将军霍去病一战成名',
      '十年前，宦官集团掌权，排除异己，朝野震动',
      '三年前，天灾频发，民不聊生，义军四起'
    ]
  },
  '科幻': {
    worldNames: ['银河联邦', '星际联盟', '新地球', '宇宙纪元', '银河帝国'],
    factions: [
      { name: '地球联邦', desc: '人类正统政府，掌控核心星域', leader: '联邦总统', stance: '正统', relation: '主角所属' },
      { name: '自由军团', desc: '反抗联邦的独立势力，追求自由', leader: '指挥官雷诺', stance: '反叛', relation: '复杂关系' },
      { name: '企业联盟', desc: '跨星际财团，控制经济和科技', leader: 'CEO史密斯', stance: '资本', relation: '利益相关' },
      { name: '外星议会', desc: '多个外星种族的联合组织', leader: '议长泽拉图', stance: '外星', relation: '外交关系' },
      { name: 'AI觉醒者', desc: '觉醒自我意识的人工智能', leader: '主脑零一', stance: 'AI', relation: '潜在威胁' }
    ],
    regions: [
      { name: '地球', desc: '人类母星，联邦首都所在地' },
      { name: '火星殖民地', desc: '红色星球，工业和矿业中心' },
      { name: '小行星带', desc: '资源丰富，法外之地，海盗横行' },
      { name: '边缘星域', desc: '联邦控制力薄弱，自由军团活跃' },
      { name: '虚空禁区', desc: '空间裂缝区域，危险但蕴含未知能量' }
    ],
    powerSystem: {
      name: '基因进化体系',
      levels: [
        { name: '普通人', desc: '未经强化，身体素质一般', breakthrough: '基因觉醒' },
        { name: '强化人', desc: '基础基因强化，身体素质提升', breakthrough: '二次基因优化' },
        { name: '超能者', desc: '获得特殊能力，如念力、元素操控', breakthrough: '能力稳定化' },
        { name: '星际战士', desc: '全面强化，可肉身对抗战舰', breakthrough: '基因锁开启' },
        { name: '宇宙级', desc: '生命层次跃迁，近乎不朽', breakthrough: '生命本质升华' }
      ]
    },
    histories: [
      '五百年前，人类发明超光速航行，开启星际时代',
      '三百年前，第一次星际战争，人类统一太阳系',
      '一百年前，遭遇外星文明，建立银河联邦',
      '十年前，AI觉醒事件爆发，部分AI获得自我意识'
    ]
  }
};

// ========== 角色姓名库 ==========
var NAME_DATABASE = {
  male: ['林墨', '苏辰', '叶凡', '萧逸', '陈锋', '楚天行', '李长空', '独孤野', '夜无殇', '敖广', '玄清', '炎魔', '血衣', '霍去病', '雷诺', '泽拉图'],
  female: ['苏婉儿', '叶倾城', '萧红颜', '陈雨萱', '楚梦瑶', '李青鸾', '独孤雪', '夜玲珑', '敖璃', '玄音', '炎姬', '血玫瑰', '林薇', '莎拉', '艾琳'],
  familyNames: ['林', '苏', '叶', '萧', '陈', '楚', '李', '独孤', '夜', '敖', '玄', '炎', '血', '霍', '方', '张', '王', '刘', '赵', '孙']
};

// ========== 2. 智能内容生成器 ==========
var ContentGenerator = {
  // 生成世界观 —— 用户构思主导，非随机模板
  generateWorld(genre, idea, plotType) {
    var ideaText = (idea || '').trim();
    var db = WORLD_DATABASE[genre] || WORLD_DATABASE['玄幻'];
    
    // === 解析用户构思 ===
    var parsed = this._parseIdea(ideaText);
    
    // 世界名称：构思提取 or 题材默认
    var worldName = parsed.worldName || this._pickWorldName(genre);
    
    // 势力 / 地域 / 力量体系 / 历史 / 规则 —— 全部从构思驱动
    var factions = this._buildFactions(parsed, db, genre);
    var regions = this._buildRegions(parsed, db, genre);
    var powerSystem = this._buildPowerSystem(parsed, db, genre);
    var historyText = this._buildHistory(parsed, db);
    var rules = this._buildRules(parsed, genre);

    var worldObj = {
      name: worldName, genre: genre,
      factions: factions, regions: regions,
      powerSystem: powerSystem, history: historyText, rules: rules
    };

    var text = '';
    if (ideaText) {
      text += '【用户构思】' + ideaText + '\n\n';
    }
    if (parsed.historicalContext) {
      text += '【历史背景】' + parsed.historicalContext + '\n\n';
    }
    text += '【世界名称】' + worldName + '\n\n';
    text += '【世界规则】\n' + rules.map(function(r){return '• ' + r;}).join('\n') + '\n\n';
    text += '【力量体系：' + powerSystem.name + '】\n';
    powerSystem.levels.forEach(function(level, idx){
      text += (idx + 1) + '. ' + level.name + '：' + level.desc + '（突破条件：' + level.breakthrough + '）\n';
    });
    text += '\n【地域划分】\n';
    regions.forEach(function(r){ text += '• ' + r.name + '：' + r.desc + '\n'; });
    text += '\n【主要势力】\n';
    factions.forEach(function(f){
      text += '• ' + f.name + '（' + f.stance + '）\n';
      text += '  首领：' + f.leader + '\n  描述：' + f.desc + '\n  与主角关系：' + f.relation + '\n';
    });
    text += '\n【世界背景】\n' + historyText + '\n';

    text._worldObj = worldObj;
    return text;
  },

  // === 解析用户构思 → 提取历史时期/关键信息 ===
  _parseIdea(idea) {
    var result = { worldName:'', historicalContext:'', era:'', keywords:[] };
    if (!idea) return result;
    
    var HIST = {
      '东汉末':{n:'东汉王朝',c:'东汉末年（约184-220年），桓灵失政，十常侍乱政，黄巾起义天下大乱。各州牧拥兵自重，群雄逐鹿，即将进入三国时代。',e:'东汉末',k:['汉室','宦官','黄巾','州牧','诸侯','董卓']},
      '东汉':{n:'东汉王朝',c:'东汉时期，光武帝刘秀中兴汉室，定都洛阳，儒学昌盛。',e:'东汉',k:['汉室','洛阳','太学','察举']},
      '三国':{n:'汉末三国',c:'魏蜀吴三分天下，曹操挟天子令诸侯，刘备据蜀汉继承汉祚，孙权坐断东南。',e:'三国',k:['魏','蜀','吴','曹操','刘备','孙权']},
      '唐朝':{n:'大唐王朝',c:'大唐盛世，贞观之治至开元盛世，万国来朝。',e:'唐朝',k:['长安','科举','节度使','藩镇']},
      '唐末':{n:'大唐王朝',c:'唐末藩镇割据，黄巢起义，帝国风雨飘摇。',e:'唐末',k:['藩镇','黄巢','节度使','流民']},
      '宋朝':{n:'大宋王朝',c:'宋朝重文轻武，经济繁荣但边患不断。',e:'宋朝',k:['汴京','辽国','西夏','士大夫']},
      '宋末':{n:'大宋王朝',c:'南宋末年，蒙古南侵，崖山海战。',e:'宋末',k:['蒙古','襄阳','临安','崖山']},
      '明朝':{n:'大明王朝',c:'明朝驱除鞑虏，洪武之治。',e:'明朝',k:['锦衣卫','内阁','海禁','北虏']},
      '明末':{n:'大明王朝',c:'明末天灾人祸，流寇四起，辽东战事吃紧。',e:'明末',k:['崇祯','李自成','满清','东林党','关宁铁骑']},
      '秦朝':{n:'大秦帝国',c:'秦灭六国一统天下，书同文车同轨。',e:'秦朝',k:['咸阳','郡县','长城','焚书']},
      '秦末':{n:'大秦帝国',c:'秦末天下大乱，陈胜吴广揭竿而起。',e:'秦末',k:['陈胜','项羽','刘邦','楚汉']},
      '汉朝':{n:'大汉王朝',c:'大汉帝国，文景之治，汉武盛世。',e:'汉朝',k:['长安','匈奴','丝绸之路']},
      '清朝':{n:'大清王朝',c:'清朝八旗入关，康乾盛世。',e:'清朝',k:['八旗','军机处','闭关']},
      '清末':{n:'大清王朝',c:'清末列强入侵，千年变局。',e:'清末',k:['列强','鸦片','洋务','革命']}
    };
    
    for (var key in HIST) {
      if (HIST.hasOwnProperty(key) && idea.indexOf(key) !== -1) {
        var p = HIST[key];
        result.worldName = p.n;
        result.historicalContext = p.c;
        result.era = p.e;
        result.keywords = p.k.slice();
        break;
      }
    }
    
    // 即使非历史题材，如果用户明确提了历史时期也应用
    if (!result.era && genre === '历史') {
      result.worldName = '华夏古国';
      result.historicalContext = '基于用户描述：' + idea;
    }
    return result;
  },
  
  _pickWorldName(genre) {
    var m = {玄幻:'玄黄界',仙侠:'青冥仙界',历史:'华夏古国',科幻:'银河联邦',末世:'曙光基地',武侠:'中原武林',都市:'新都市'};
    return m[genre] || '玄黄界';
  },
  
  _buildFactions(parsed, db, genre) {
    if (parsed.era) {
      var e = parsed.era;
      if (e.indexOf('东汉')!==-1||e.indexOf('三国')!==-1) return [
        {name:'汉室朝廷',desc:'天子名存实亡，权臣把持朝政，洛阳/许昌为都',leader:'汉帝',stance:'正统',relation:'主角初始立场'},
        {name:'世家大族',desc:'累世公卿，门生故吏遍天下，掌握人才与舆论',leader:'袁氏/杨氏等',stance:'士族',relation:'合作与博弈'},
        {name:'地方州牧',desc:'各据州郡，拥兵自重，名义汉臣实为诸侯',leader:'各地州牧',stance:'割据',relation:'竞争或联盟'},
        {name:'黄巾余部',desc:'大贤良师张角旧部，散布民间，星星之火',leader:'大小渠帅',stance:'反叛',relation:'收编或敌对'},
        {name:'边疆异族',desc:'匈奴、鲜卑、羌人，趁汉室衰微寇边',leader:'各部首领',stance:'外敌',relation:'抗击或合纵'}
      ];
      if (e.indexOf('唐')!==-1) return [
        {name:'李唐皇室',desc:'名义天下之主，但皇权已衰',leader:'皇帝',stance:'正统',relation:'主角所属'},
        {name:'藩镇军阀',desc:'各地节度使，兵强马壮不听调遣',leader:'各节度使',stance:'割据',relation:'对抗或收服'},
        {name:'世家门阀',desc:'五姓七望，连皇族都不放在眼里',leader:'族长',stance:'士族',relation:'攀附或打破'},
        {name:'宦官集团',desc:'掌控神策军，废立皇帝',leader:'大宦官',stance:'阉党',relation:'政敌'}
      ];
      if (e.indexOf('明')!==-1) return [
        {name:'大明朝廷',desc:'天子守国门',leader:'皇帝',stance:'正统',relation:'主角所属'},
        {name:'东林党',desc:'江南士大夫集团，清议朝政',leader:'内阁首辅',stance:'清流',relation:'政治盟友'},
        {name:'阉党',desc:'内廷宦官势力，厂卫横行',leader:'掌印太监',stance:'阉党',relation:'政敌'},
        {name:'辽东边军',desc:'抵御满清，战力最强',leader:'总兵',stance:'军方',relation:'主角靠山'},
        {name:'流民义军',desc:'灾民聚众揭竿而起',leader:'闯王',stance:'反叛',relation:'复杂'}
      ];
      if (e.indexOf('秦')!==-1) return [
        {name:'大秦朝廷',desc:'以法治国，令行禁止',leader:'始皇帝',stance:'正统',relation:'主角所属'},
        {name:'六国遗族',desc:'被灭六国王族后裔，伺机复国',leader:'项氏/田氏等',stance:'隐匿',relation:'潜在威胁'},
        {name:'法家酷吏',desc:'以严刑峻法治理天下',leader:'廷尉',stance:'官方',relation:'上级'},
        {name:'儒家士人',desc:'不满焚书坑儒，暗中传道',leader:'大儒',stance:'异见',relation:'启蒙者'},
        {name:'戍卒民夫',desc:'修长城建陵墓的苦役',leader:'陈胜吴广',stance:'被压迫',relation:'可策反'}
      ];
      if (e.indexOf('宋')!==-1) return [
        {name:'大宋朝廷',desc:'重文抑武，岁币求和',leader:'官家',stance:'正统',relation:'主角所属'},
        {name:'文官集团',desc:'士大夫共治天下',leader:'宰相',stance:'文官',relation:'政治舞台'},
        {name:'边军将门',desc:'世代戍边',leader:'制置使',stance:'军方',relation:'靠山'},
        {name:'北方敌国',desc:'辽/金/蒙古虎视眈眈',leader:'大汗',stance:'外敌',relation:'抗击'}
      ];
    }
    return this._shuffleArray(db.factions.slice()).slice(0, genre==='历史'?5:4);
  },
  
  _buildRegions(parsed, db, genre) {
    if (parsed.era) {
      var e = parsed.era;
      if (e.indexOf('东汉')!==-1||e.indexOf('三国')!==-1) return [{name:'洛阳',desc:'东汉都城，天下之中，宫阙巍峨但朝纲已乱'},{name:'长安',desc:'西都故地，关中沃野，凉州铁骑东进之要冲'},{name:'颍川',desc:'名士辈出，荀彧郭嘉皆出此'},{name:'河北',desc:'袁绍据冀州，兵精粮足'},{name:'荆州',desc:'刘表治下，民殷国富，南北枢纽'},{name:'江东',desc:'孙氏经营，长江天险可成霸业'}];
      if (e.indexOf('唐')!==-1) return [{name:'长安',desc:'大唐帝都，东西两市繁华'},{name:'洛阳',desc:'东都漕运枢纽'},{name:'河北诸镇',desc:'藩镇割据已成国中之国'},{name:'江南',desc:'天下财赋出江南'},{name:'陇右',desc:'丝路要道，吐蕃与唐争夺'}];
      if (e.indexOf('明')!==-1) return [{name:'京师',desc:'顺天府（北京），天子守国门'},{name:'南京',desc:'留都，江南繁华地'},{name:'辽东',desc:'关外前线，满清虎视'},{name:'江南',desc:'天下粮仓'},{name:'陕西',desc:'流民聚集，义军发源'}];
      if (e.indexOf('秦')!==-1) return [{name:'咸阳',desc:'秦都，天下辐辏'},{name:'函谷关',desc:'关中门户'},{name:'骊山',desc:'始皇陵所在，数十万刑徒'},{name:'辽东',desc:'长城东端，戍卒望乡'},{name:'岭南',desc:'百越之地，瘴气弥漫'}];
      if (e.indexOf('宋')!==-1) return [{name:'汴京',desc:'清明上河，繁华无双'},{name:'临安',desc:'偏安江南'},{name:'燕云',desc:'故土沦丧之痛'},{name:'襄阳',desc:'天下咽喉'},{name:'泉州',desc:'海上丝路起点'}];
    }
    return this._shuffleArray(db.regions.slice()).slice(0, 5);
  },
  
  _buildPowerSystem(parsed, db, genre) {
    if (parsed.era) {
      var e = parsed.era;
      if (e.indexOf('东汉')!==-1||e.indexOf('三国')!==-1) return {name:'身份体系',levels:[{name:'流民',desc:'无地无产的底层',breakthrough:'投豪强门下为佃客'},{name:'佃客',desc:'受豪强庇护的半自由民',breakthrough:'积累功勋得自由身'},{name:'游侠',desc:'仗剑走天下',breakthrough:'投入名主得官职'},{name:'校尉',desc:'领数百兵',breakthrough:'战场建功'},{name:'将军',desc:'统领万人',breakthrough:'得地盘与军队'},{name:'州牧',desc:'据一州裂土封疆',breakthrough:'掌控朝廷话语'},{name:'权臣',desc:'挟天子令诸侯',breakthrough:'天时地利人和'},{name:'开国',desc:'终结乱世建新朝',breakthrough:'收服天下人心'}]};
      if (e.indexOf('唐')!==-1) return {name:'官职体系',levels:[{name:'白丁',desc:'无官无职',breakthrough:'科举或军功入仕'},{name:'县尉',desc:'一县治安',breakthrough:'考课优良'},{name:'县令',desc:'百里侯',breakthrough:'政绩或靠山'},{name:'刺史',desc:'一州之长',breakthrough:'节度使赏识'},{name:'节度使',desc:'手握重兵',breakthrough:'军功煊赫'},{name:'宰相',desc:'执掌政事堂',breakthrough:'皇帝信任'}]};
      if (e.indexOf('明')!==-1) return {name:'官职体系',levels:[{name:'白身',desc:'无功名百姓',breakthrough:'科举入仕'},{name:'生员',desc:'秀才免赋税',breakthrough:'乡试中举'},{name:'举人',desc:'可候补为官',breakthrough:'会试中进士'},{name:'进士',desc:'天子门生',breakthrough:'政绩考核'},{name:'御史',desc:'弹劾百官',breakthrough:'皇帝赏识'},{name:'尚书',desc:'执掌一部',breakthrough:'入阁'},{name:'首辅',desc:'实际宰相',breakthrough:'圣眷不衰'}]};
    }
    return db.powerSystem;
  },
  
  _buildHistory(parsed, db) {
    if (parsed.historicalContext) return parsed.historicalContext;
    return db.histories ? db.histories.join('\n') : '';
  },
  
  _buildRules(parsed, genre) {
    if (parsed.era) {
      var e = parsed.era;
      if (e.indexOf('东汉')!==-1||e.indexOf('三国')!==-1) return ['名教与门第——世家以名望门第论人，出身决定命运','察举与征辟——官员选拔靠举荐，寒门难出头','州郡为实——中央衰微，州牧郡守各怀异心','忠义与骑墙——乱世中人人自保，忠诚是奢侈品','群雄逐鹿——无秩序时代，实力就是法则'];
    }
    return this._getWorldRules(genre);
  },

  // 辅助：获取世界规则
  _getWorldRules(genre) {
    var rules = {
      '玄幻': ['修炼者通过吸收天地灵气提升修为', '存在天劫考验，渡过可获长生', '法宝、丹药、阵法为常见元素'],
      '仙侠': ['以剑入道，剑意可通神', '存在灵根资质划分', '渡劫飞升是终极目标'],
      '都市': ['现代都市背景，隐藏异能者', '异能分为元素系、精神系、肉体系', '异能等级明确，能力范围清晰'],
      '武侠': ['以武为尊，内力为根本', '江湖规矩与门派恩怨', '武功秘籍传承'],
      '末世': ['病毒爆发后人类文明崩溃', '丧尸、变异生物威胁生存', '资源极度匮乏'],
      '历史': ['王朝兴衰遵循治乱循环', '世家豪族掌握重要资源与话语权', '民心向背与军事力量决定政权归属'],
      '科幻': ['高科技与太空文明', '基因改造与机械飞升', '星际航行']
    };
    return rules[genre] || rules['玄幻'];
  },

  // 辅助：随机打乱数组
  _shuffleArray(array) {
    var arr = array.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  },

  // 从文本中提取世界观对象
  _extractWorldObj(worldText) {
    if (worldText && worldText._worldObj) {
      return worldText._worldObj;
    }
    // 如果无法提取，生成一个新的
    return null;
  },

  // 生成人物 - 基于世界观，返回角色数组和文本
  generateCharacter(worldText, genre, workTitle, idea) { var worldObj = this._extractWorldObj(worldText) || WORLD_DATABASE[genre] || WORLD_DATABASE['玄幻']; var factions = worldObj.factions || []; var regions = worldObj.regions || []; var powerSystem = worldObj.powerSystem || { levels: [{ name: '初级' }, { name: '中级' }, { name: '高级' }] };

    // 生成具体角色
    var chars = [];

    // === 新架构：从多原型中随机选取，打破固定角色模板 ===
    function _pickArchetype(roleType) {
      var pool = (LOCAL_TEMPLATES.chars[roleType] || []);
      if (pool.length === 0) {
        // 回退到旧格式兼容
        var old = (typeof LOCAL_TEMPLATES.chars[roleType] === 'object' && !Array.isArray(LOCAL_TEMPLATES.chars[roleType]))
          ? LOCAL_TEMPLATES.chars[roleType] : null;
        if (old) return { traits: old.traits || [], arcs: old.arcs || [], goals: old.goals || [], label: '经典' };
        return { traits: ['独特个性'], arcs: ['成长之路'], goals: ['追寻目标'], label: '自定义' };
      }
      // 70%概率选非经典原型，30%概率选经典（保留经典但不主导）
      var weights = pool.map(function(item, idx) {
        return idx === 0 ? 0.3 : 0.7 / (pool.length - 1);
      });
      var r = Math.random();
      var cumulative = 0;
      for (var i = 0; i < pool.length; i++) {
        cumulative += weights[i];
        if (r <= cumulative) return pool[i];
      }
      return pool[pool.length - 1];
    }

    // 主角
    var protoArch = _pickArchetype('protagonist');
    var protagonistFaction = factions.find(function(f) { return f.relation && f.relation.indexOf('主角') >= 0; }) || factions[0] || { name: '天玄宗', leader: '玄清真人', stance: '正道', relation: '主角初始宗门' };
    var protagonistRegion = regions[0] || { name: '青云州' };
    var protagonistName = NAME_DATABASE.male[Math.floor(Math.random() * NAME_DATABASE.male.length)];
    var protagonistLevel = powerSystem.levels[0] || { name: '练气境' };

    chars.push({
      type: 'protagonist',
      archetype: protoArch.label || '经典成长型',
      name: protagonistName,
      identity: protagonistFaction.name + '外门弟子',
      faction: protagonistFaction.name,
      region: protagonistRegion.name,
      level: protagonistLevel.name,
      traits: protoArch.traits.slice(),
      secret: '体内封印着上古血脉，一旦觉醒将改变整个世界的格局',
      goal: protoArch.goals[Math.floor(Math.random() * protoArch.goals.length)] || '查明父母失踪真相，守护重要之人',
      arc: protoArch.arcs[Math.floor(Math.random() * protoArch.arcs.length)] || '从弱小到强大',
      relation: '故事的核心人物'
    });

    // 女主角/重要伙伴
    var allyArch = _pickArchetype('ally');
    var allyFaction = factions.find(function(f) { return f.stance === '中立'; }) || factions[2] || { name: '万兽谷', leader: '兽皇独孤野' };
    var allyName = NAME_DATABASE.female[Math.floor(Math.random() * NAME_DATABASE.female.length)];
    chars.push({
      type: 'ally',
      archetype: allyArch.label || '经典战友',
      name: allyName,
      identity: allyFaction.name + '圣女/' + protagonistName + '的师妹',
      faction: allyFaction.name,
      region: protagonistRegion.name,
      level: protagonistLevel.name,
      traits: allyArch.traits.slice(),
      secret: '真实身份是某大势力的失踪千金',
      goal: allyArch.goals[Math.floor(Math.random() * allyArch.goals.length)] || '寻找失踪的兄长，揭开家族秘密',
      arc: allyArch.arcs[Math.floor(Math.random() * allyArch.arcs.length)] || '从陌生人到生死之交',
      relation: protagonistName + '的师妹兼红颜知己'
    });

    // 导师
    var mentorArch = _pickArchetype('mentor');
    var mentorFaction = protagonistFaction;
    var mentorName = protagonistFaction.leader || '玄清真人';
    chars.push({
      type: 'mentor',
      archetype: mentorArch.label || '经典导师',
      name: mentorName,
      identity: mentorFaction.name + '掌门/' + protagonistName + '的师父',
      faction: mentorFaction.name,
      region: protagonistRegion.name,
      level: powerSystem.levels[Math.min(4, powerSystem.levels.length - 1)] ? powerSystem.levels[Math.min(4, powerSystem.levels.length - 1)].name : '化神境',
      traits: mentorArch.traits.slice(),
      secret: '三十年前正邪大战的幸存者，知晓主角身世的秘密',
      goal: mentorArch.goals[Math.floor(Math.random() * mentorArch.goals.length)] || '培养继承人，守护宗门传承',
      arc: mentorArch.arcs[Math.floor(Math.random() * mentorArch.arcs.length)] || '从旁观者到参与者',
      relation: protagonistName + '的师父，亦师亦父'
    });

    // 反派
    var antagArch = _pickArchetype('antagonist');
    var antagonistFaction = factions.find(function(f) { return f.relation && f.relation.indexOf('敌') >= 0; }) || factions[1] || { name: '魔焰门', leader: '炎魔老祖', stance: '魔道' };
    var antagonistName = NAME_DATABASE.male[Math.floor(Math.random() * NAME_DATABASE.male.length)];
    chars.push({
      type: 'antagonist',
      archetype: antagArch.label || '经典反派',
      name: antagonistName,
      identity: antagonistFaction.name + '少主/三长老',
      faction: antagonistFaction.name,
      region: (regions[1] || { name: '赤焰荒原' }).name,
      level: powerSystem.levels[Math.min(2, powerSystem.levels.length - 1)] ? powerSystem.levels[Math.min(2, powerSystem.levels.length - 1)].name : '结丹境',
      traits: antagArch.traits.slice(),
      secret: '曾被主角父亲所救，却因误会走上对立面',
      goal: antagArch.goals[Math.floor(Math.random() * antagArch.goals.length)] || '复活远古魔神，颠覆正道统治',
      arc: antagArch.arcs[Math.floor(Math.random() * antagArch.arcs.length)] || '从理想主义者到极端者',
      relation: protagonistName + '的宿敌，两人命运纠缠'
    });

    // 第二个反派/幕后黑手 — 从反派池再选一个不同原型
    var antagArch2 = _pickArchetype('antagonist');
    if (antagArch2.label === (antagArch.label || '')) {
      // 避免和主反派同原型，如果不是第一个就换
      var altPool = (LOCAL_TEMPLATES.chars.antagonist || []).filter(function(a) { return a.label !== antagArch.label; });
      if (altPool.length > 0) antagArch2 = altPool[Math.floor(Math.random() * altPool.length)];
    }
    var hiddenFaction = factions.find(function(f) { return f.relation && f.relation.indexOf('幕后') >= 0; }) || factions[3] || { name: '血煞教', leader: '血衣侯' };
    var hiddenName = hiddenFaction.leader || '血衣侯';
    chars.push({
      type: 'hiddenAntagonist',
      archetype: antagArch2.label || '隐秘操控者',
      name: hiddenName,
      identity: hiddenFaction.name + '教主',
      faction: hiddenFaction.name,
      region: (regions[2] || { name: '幽冥海域' }).name,
      level: powerSystem.levels[Math.min(5, powerSystem.levels.length - 1)] ? powerSystem.levels[Math.min(5, powerSystem.levels.length - 1)].name : '渡劫境',
      traits: antagArch2.traits.slice(),
      secret: '才是真正的幕后黑手，操纵着正邪两道的纷争',
      goal: '集齐上古神器，打开魔界通道',
      relation: '一切阴谋的始作俑者'
    });

    // 生成文本版本
    var text = '';
    chars.forEach(function(char, idx) {
      if (idx > 0) text += '\n' + '═'.repeat(40) + '\n\n';
      text += `【姓名】${char.name}\n`;
      text += `【身份】${char.identity}\n`;
      text += `【所属势力】${char.faction}\n`;
      text += `【活动区域】${char.region}\n`;
      text += `【当前境界】${char.level}\n`;
      text += `【性格特点】\n${char.traits.map(t => '• ' + t).join('\n')}\n`;
      text += `【核心目标】${char.goal}\n`;
      text += `【隐藏秘密】${char.secret}\n`;
      text += `【人物关系】${char.relation}\n`;
    });

    // 附加角色数组
    text._chars = chars;
    text._worldObj = worldObj;
    return text;
  },

  // 从文本中提取角色数组
  _extractChars(charText) {
    if (charText && charText._chars) {
      return charText._chars;
    }
    return [];
  },

  // 生成大纲 - 接收世界观对象和角色数组（增强版：阶段级细分 + 毒点自检）
  generateOutline(worldText, charText, genre, plotType, volumeCount = 4) { var worldObj = this._extractWorldObj(worldText) || WORLD_DATABASE[genre] || WORLD_DATABASE['玄幻']; var chars = this._extractChars(charText) || []; var protagonist = chars.find(c => c.type === 'protagonist') || { name: '林墨', faction: '天玄宗' }; var antagonist = chars.find(c => c.type === 'antagonist') || { name: '魔焰门少主', faction: '魔焰门' }; var ally = chars.find(c => c.type === 'ally') || { name: '苏婉儿', faction: '万兽谷' }; var mentor = chars.find(c => c.type === 'mentor') || { name: '玄清真人', faction: '天玄宗' }; var hiddenAntagonist = chars.find(c => c.type === 'hiddenAntagonist') || { name: '血衣侯', faction: '血煞教' }; var factions = worldObj.factions || []; var regions = worldObj.regions || []; var powerSystem = worldObj.powerSystem || { levels: [{ name: '练气境' }, { name: '筑基境' }] }; var plot = LOCAL_TEMPLATES.plot[plotType] || LOCAL_TEMPLATES.plot['崛起流']; var style = GENRE_STYLES[genre] || GENRE_STYLES['玄幻']; var levels = powerSystem.levels; var outline = `【作品类型】${genre} - ${plotType}\n`;
    outline += `【风格基调】${style.tone}\n`;
    outline += `【主角】${protagonist.name}（${protagonist.faction}）\n`;
    outline += `【主要反派】${antagonist.name}（${antagonist.faction}）\n`;
    outline += `【关键盟友】${ally.name}（${ally.faction}）\n`;

    // 毒点清单
    var poisonChecks = this._getPoisonForGenre(genre);
    outline += `\n【⚠️ 毒点避雷清单】\n`;
    poisonChecks.forEach(function(p) { outline += `❌ ${p.name}：${p.desc}\n`; });
    outline += '\n'; var volumeNames = this._getVolumeNames(plotType, volumeCount);

    // 生成每卷的阶段级大纲
    for ( var i = 0; i < volumeCount; i++) { var vn = volumeNames[i] || `第${i+1}卷`; var chStart = i * 200 + 1; var chEnd = (i + 1) * 200; var phase = plot[i % plot.length];
      
      outline += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      outline += `第${i + 1}卷：《${vn}》【覆盖章：第${chStart}章—第${chEnd}章】\n`;
      outline += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      outline += `【卷主题】${phase}\n`;

      // 每卷生成5-6个阶段
      var stages = this._generateStages(i, volumeCount, {
        protagonist, antagonist, ally, mentor, hiddenAntagonist,
        factions, regions, levels, plotType, chStart
      });

      stages.forEach(function(stage, si) {
        outline += `\n阶段${si + 1}：《${stage.name}》(第${stage.chFrom}章—第${stage.chTo}章)：\n`;
        outline += `  · 核心冲突：${stage.conflict}\n`;
        outline += `  · 主要事件：\n`;
        stage.events.forEach(function(evt) { outline += `    - ${evt}\n`; });
        outline += `  · 人物成长：${stage.growth}\n`;
        outline += `  · 爽点设计：${stage.coolPoint}\n`;
        outline += `  · 毒点自检：${stage.poisonCheck}\n`;
      });

      // 卷末收束
      outline += `\n阶段${stages.length + 1}（卷末收束）：\n`;
      outline += `  · 卷末钩子：${stages.length > 0 ? stages[stages.length - 1].hook : '悬念待定'}\n\n`;
    }

    outline += `【整体结构】\n`;
    outline += `• 开篇：${protagonist.name}在${regions[0]?.name || '宗门'}觉醒，埋下身世伏笔\n`;
    outline += `• 发展：${protagonist.name}与${ally.name}结识，共同对抗${antagonist.faction}的阴谋\n`;
    outline += `• 高潮：${protagonist.name}发现${hiddenAntagonist.name}才是真正的幕后黑手\n`;
    outline += `• 结局：正邪大战，${protagonist.name}突破至${levels[Math.min(levels.length - 1, 6)]?.name || '大乘境'}，守护世界\n`;

    outline._worldObj = worldObj;
    outline._chars = chars;
    outline._outlineData = { volumeNames, stageCount: volumeCount };
    return outline;
  },

  // 获取题材对应的毒点清单（与 architecture.js 同步）
  _getPoisonForGenre(genre) {
    var common = [
      { name: '逻辑漏洞', desc: '情节缺乏因果必然性，人物行为前后矛盾，事件推进靠巧合而非合理因果' },
      { name: '战力崩坏', desc: '力量体系失衡——主角跳过太多等级越级杀敌，或境界战力前后不一致' },
      { name: '主角降智', desc: '主角为推进剧情而做出不符合设定智商/性格的愚蠢行为' },
      { name: '配角工具人', desc: '配角缺乏独立动机和人格弧线，出现只为被主角打脸/送机缘/送女主' },
      { name: '设定吃书', desc: '后期设定与前期矛盾，推翻已有世界观规则和人物能力' },
      { name: '龙傲天/玛丽苏', desc: '主角集所有优点于一身：天赋第一、颜值第一、人脉第一、资源第一，无缺点无成长空间' },
      { name: '开篇劝退', desc: '前5章大量信息倾倒或平淡日常，读者看不到核心冲突和金手指' },
      { name: '爽点乏力', desc: '高潮桥段描写不到位，打脸不够狠、突破不够燃、反转不够震撼' },
      { name: '反派弱智化', desc: '反派明知主角在成长却不扼杀，或每次只派比主角强一点的手下去送' },
      { name: '反派洗白生硬', desc: '前期恶贯满盈的角色因一个理由突然洗白，缺乏转变过程和代价' },
      { name: '女主花瓶化', desc: '女性角色沦为男主附属品或奖励品，缺乏独立人格、目标和能力' },
      { name: '感情线僵硬', desc: '感情发展缺乏铺垫和化学反应，男主对女主一见钟情后无合理互动' },
      { name: '过度水字数', desc: '大量无意义描写、重复对话、内心独白循环填充字数，核心情节进展极慢' },
      { name: '剧情套路化', desc: '退婚/废柴逆袭/穿越附身/系统绑定等桥段未经改造直接套用，读者一眼看穿' },
      { name: '升级公式化', desc: '每次突破都是"遇到瓶颈→奇遇→突破→震惊众人"同一模板，缺乏新意' },
      { name: '烂尾/太监趋势', desc: '中后期质量断崖下降、关键伏笔不收、剧情加速草草收场' }
    ];
    var genreSpecific = {
      xuanhuan: [
        { name: '境界混乱', desc: '修炼境界划分不清晰，突破条件随意变更，境界名称和等级对应关系前后矛盾' },
        { name: '法宝/机缘泛滥', desc: '主角获得法宝/机缘过于频繁且轻易，失去稀缺感和惊喜感' },
        { name: '修炼资源通货膨胀', desc: '前期珍贵的丹药/灵石后期随地可见，经济体系崩溃' },
        { name: '秘境副本滥用', desc: '用秘境/副本作为万能剧情推进器，每卷都靠"发现秘境→闯关→升级"循环' },
        { name: '地图无限扩张', desc: '每次主角变强就换一个更大的地图，前期区域和角色被抛弃' }
      ],
      xianxia: [
        { name: '道心空洞', desc: '修仙理念流于表面，升级仅靠资源堆砌而非心境突破，缺乏"悟道"过程' },
        { name: '天劫滥用', desc: '天劫沦为升级道具——主角轻松渡过、反派被劈死，失去天道威严' },
        { name: '因果逻辑断裂', desc: '因果报应、天道循环的说辞在需要时提及不需要时无视' },
        { name: '仙凡比例失调', desc: '满世界都是修仙者，凡人社会的存在感和作用完全消失' }
      ],
      dushi: [
        { name: '法律常识错误', desc: '情节设定（杀人/商业欺诈/黑道横行）无视基本法律和社会秩序' },
        { name: '装逼打脸过度', desc: '反复使用"配角看不起主角→主角亮身份/实力→配角跪舔"同一桥段，严重审美疲劳' },
        { name: '商业逻辑幼稚', desc: '商业运作描写缺乏基本常识——收购/上市/投资流程与真实世界严重脱节' },
        { name: '阶层描写失真', desc: '上流社会/底层社会的描写充满刻板印象和常识错误' }
      ],
      lishi: [
        { name: '历史事实错误', desc: '关键历史事件、人物关系、时间线出现严重错误' },
        { name: '制度穿越', desc: '出现该时期未出现的制度（如东汉出现科举制、宋朝出现内阁制）' },
        { name: '技术穿越', desc: '出现该时期不存在的技术和物品（如火药提前几百年出现且威力巨大）' },
        { name: '语言穿越', desc: '角色大量使用现代词汇、网络用语或后世典故' },
        { name: '蝴蝶效应无视', desc: '穿越者大幅改变历史后，后续历史事件仍原样发生' },
        { name: '古人思维现代化', desc: '古代角色拥有现代人的价值观、平等意识和思维方式' }
      ],
      kehuan: [
        { name: '科学常识错误', desc: '基础物理/生物/天文原理被严重违背，且无合理解释' },
        { name: '科技水平不一致', desc: '同一文明能星际航行却治不好感冒，能造AI却没有像样的通讯手段' },
        { name: '未来社会扁平化', desc: '未来社会描写缺乏深度——政治/经济/文化/宗教的演变完全缺失' }
      ]
    };
    return common.concat(genreSpecific[genre] || []);
  },

  // 生成各卷的阶段（5-6个阶段，每阶段4-6事件）
  _generateStages(volIdx, totalVols, data) { var { protagonist, antagonist, ally, mentor, hiddenAntagonist, factions, regions, levels, plotType, chStart } = data; var regionNames = regions.map(r => r.name); var factionNames = factions.map(f => f.name); var stages = [];

    // 每卷固定6阶段模板，根据卷序号调整难度和深度
    var stageTemplates = this._getStageTemplates(volIdx, totalVols, plotType);
    
    for ( var si = 0; si < 6; si++) { var tmpl = stageTemplates[si]; var base = chStart + si * 35; var stage = {
        name: tmpl.name,
        chFrom: base + 1,
        chTo: base + 35,
        conflict: this._fillTemplate(tmpl.conflict, data),
        events: tmpl.events.map(e => this._fillTemplate(e, data)),
        growth: this._fillTemplate(tmpl.growth, data),
        coolPoint: this._fillTemplate(tmpl.coolPoint, data),
        poisonCheck: tmpl.poisonCheck,
        hook: this._fillTemplate(tmpl.hook, data)
      };
      stages.push(stage);
    }
    return stages;
  },

  // 获取阶段模板（按卷推进递进）— v3.0：三套模板随机选
  _getStageTemplates(volIdx, totalVols, plotType) {
    var isFirstVol = volIdx === 0;
    var isLastVol = volIdx === totalVols - 1;

    // === 模板集 A：经典模式（铺垫→冲突→转折→高潮→余波→蓄力） ===
    var setA = [
      {
        name: '引子·暗流涌动',
        conflict: '{protagonist.name}在{regionNames[0]}开始新的征程，但{antagonist.faction}的阴影已经笼罩',
        events: [
          '{protagonist.name}到达{regionNames[0]}，见识到当地的风土人情和暗藏的危机',
          '一次意外事件让{protagonist.name}察觉到{antagonist.faction}的势力渗透',
          '{protagonist.name}结识新的朋友或对手，为后续关系网埋下伏笔',
          '{mentor.name}向{protagonist.name}透露关于{hiddenAntagonist.faction}的一丝线索',
          '{protagonist.name}在修炼中顿悟，实力向{levels[1]}迈进'
        ],
        growth: '实力：初窥{levels[1]}门径；认知：开始了解{antagonist.faction}的可怕',
        coolPoint: '{protagonist.name}在街头目击{antagonist.faction}行凶，虽然不敌但挺身而出救人，引起江湖关注',
        poisonCheck: '✅ 主角没有无故降智，行动有合理动机',
        hook: '{antagonist.name}得知{protagonist.name}的存在，开始布局针对'
      },
      {
        name: '冲突·初露锋芒',
        conflict: '{protagonist.name}与{antagonist.faction}的门徒首次正面冲突',
        events: [
          '{protagonist.name}被卷入{antagonist.faction}的一次阴谋，必须出手',
          '在战斗中，{protagonist.name}展现超出预期的实力，令对手震惊',
          '{ally.name}现身相助，与{protagonist.name}建立信任',
          '{antagonist.faction}派出更强的高手追杀',
          '事件引起当地{protagonist.faction}的注意，{protagonist.name}获得新的资源或人脉'
        ],
        growth: '实力：突破至{levels[1]}；关系：与{ally.name}建立友谊',
        coolPoint: '{protagonist.name}以{levels[1]}修为越级击败{antagonist.faction}的信使，一战成名',
        poisonCheck: '✅ 战力提升有铺垫，不是无脑开挂',
        hook: '战斗余波引发连锁反应，{antagonist.faction}决定除掉这个隐患'
      },
      {
        name: '转折·真相渐显',
        conflict: '{protagonist.name}发现事件背后隐藏着更大的阴谋，涉及{hiddenAntagonist.faction}',
        events: [
          '{protagonist.name}在调查中意外获得一条关键线索，指向{hiddenAntagonist.name}',
          '线索牵扯出{protagonist.name}的过往或身世之谜',
          '{ally.name}的真实身份或隐藏使命开始显现',
          '{antagonist.name}亲自出手，{protagonist.name}面临生死危机',
          '{mentor.name}出手解围，但付出了代价'
        ],
        growth: '实力：触摸{levels[2]}边缘；认知：世界比想象中复杂得多',
        coolPoint: '{protagonist.name}在绝境中领悟新的能力/技法，反败为退',
        poisonCheck: '✅ 转折有伏笔支撑，不是凭空反转',
        hook: '{mentor.name}受伤后说出了关于{protagonist.name}血脉/身世的关键信息'
      },
      {
        name: '高潮·绝地反击',
        conflict: '{protagonist.name}整合力量，对{antagonist.faction}发动反击',
        events: [
          '各方势力汇聚，矛盾总爆发',
          '{protagonist.name}凭借之前的积累突破至{levels[2]}',
          '与{antagonist.name}正面交锋，战局胶着',
          '关键时刻，{ally.name}的隐藏力量爆发，扭转局势',
          '{protagonist.name}击败{antagonist.name}，但{hiddenAntagonist.name}的影子已浮现'
        ],
        growth: '实力：稳固{levels[2]}，向{levels[3]}迈进；地位：获得一方势力的认可',
        coolPoint: '{protagonist.name}以新领悟的绝技击败{antagonist.name}，全场震撼',
        poisonCheck: '✅ 主角突破有铺垫，反派不是被弱化而是被智取',
        hook: '{protagonist.name}在废墟中发现通往{regionNames[1]}的线索，那里藏着更大秘密'
      },
      {
        name: '余波·势力重整',
        conflict: '大战过后各方势力重新洗牌，{protagonist.name}面临选择',
        events: [
          '统计战损，处理善后事务',
          '各方势力前来拉拢{protagonist.name}',
          '{protagonist.name}做出关键选择——这将决定未来的走向',
          '内部出现分歧，{protagonist.name}的权威受到挑战',
          '{protagonist.name}以智慧和实力化解内部矛盾，完成势力整合'
        ],
        growth: '领导力：从战士向领袖转变；智慧：学会权谋和平衡',
        coolPoint: '{protagonist.name}在众人的质疑中力排众议，做出正确决策，以行动证明自己',
        poisonCheck: '✅ 势力整合有合理性，不是主角光环强行统一',
        hook: '整军待发，{protagonist.name}率领队伍向下一个目标进发'
      },
      {
        name: '蓄力·风云再起',
        conflict: '{protagonist.name}积极备战，但{hiddenAntagonist.faction}已派出更强的敌人',
        events: [
          '{protagonist.name}闭关修炼，冲击{levels[3]}',
          '{ally.name}外出调查情报，获得关于{hiddenAntagonist.faction}的核心机密',
          '{hiddenAntagonist.faction}的使者突然出现，设下圈套',
          '{protagonist.name}出关时发现局势已经恶化',
          '在最后关头突破{levels[3]}，化解危机，但更大的风暴已经来临'
        ],
        growth: '实力：突破至{levels[3]}；格局：看到更广阔的天地和更大威胁',
        coolPoint: '{protagonist.name}出关即战，以{levels[3]}修为力压{hiddenAntagonist.faction}使者',
        poisonCheck: '✅ 闭关有合理时长，突破有过程描写',
        hook: '{hiddenAntagonist.name}终于注意到了{protagonist.name}，"有意思的小虫子"'
      }
    ];

    // === 模板集 B：非线性模式（信息→误导→反转→重置→收束→升华） ===
    var setB = [
      {
        name: '揭示·信息差战',
        conflict: '{protagonist.name}发现一件所有势力都在争夺的东西——但没有人知道它到底是什么',
        events: [
          '{protagonist.name}在{regionNames[0]}偶然接触到{hiddenAntagonist.faction}的一件遗物，引发多方注意',
          '{antagonist.faction}迅速出手，{protagonist.name}发现自己被卷入了一场超过自己层次的博弈',
          '{ally.name}带来一个令人不安的消息：所有人都在找的东西，可能根本不存在',
          '{protagonist.name}决定不再被动逃亡，开始主动调查遗物背后的真相',
          '调查过程中，{protagonist.name}发现{protagonist.faction}也对此事三缄其口'
        ],
        growth: '认知：意识到"真相"往往是被人为塑造的',
        coolPoint: '{protagonist.name}用一个谎言骗过了所有追踪者，展现了超出年龄的冷静与智慧',
        poisonCheck: '✅ 信息战有逻辑，不是靠巧合推进',
        hook: '遗物突然发出信号，指向{regionNames[1]}——但那里是公认的死地'
      },
      {
        name: '误导·信任危机',
        conflict: '{protagonist.name}被多方信息误导，不知道应该相信谁',
        events: [
          '{ally.name}的行为开始出现矛盾，{protagonist.name}怀疑其隐藏了身份',
          '{mentor.name}给出了与事实矛盾的指导，{protagonist.name}陷入两难',
          '{antagonist.name}突然出现，提供了一个令人震惊但似乎合理的"真相"',
          '{protagonist.name}决定暂时信任{antagonist.name}，但保留了后手',
          '这一决定引发了连锁反应，{protagonist.faction}与{protagonist.name}的关系降至冰点'
        ],
        growth: '心智：学会在信息迷雾中独立判断',
        coolPoint: '{protagonist.name}在所有势力都以为他/她会上当的时候，反过来设了一个局',
        poisonCheck: '✅ 误导有铺垫合理，角色智力在线',
        hook: '局成功了，但代价是{protagonist.name}失去了最重要的一个盟友的信任'
      },
      {
        name: '反转·一切都不对',
        conflict: '{protagonist.name}发现自己从一开始就被骗了——连敌人都是假的',
        events: [
          '遗物的真相被揭穿：它从来不是武器，而是一个"测试"',
          '{hiddenAntagonist.name}首次现身，但身份完全出乎意料——竟然与{protagonist.name}有亲密关联',
          '{protagonist.name}的世界观崩塌，开始怀疑之前的一切努力是否有意义',
          '{ally.name}在最危急的时刻选择留在{protagonist.name}身边，坦白了全部',
          '{protagonist.name}重新审视所有信息，在欺骗的废墟中找到了被所有人忽视的一条线索'
        ],
        growth: '认知：彻底重塑世界观——敌人和朋友的定义不再二元',
        coolPoint: '当{antagonist.faction}和{protagonist.faction}都以为{protagonist.name}会崩溃时，他/她做出了双方都没想到的选择',
        poisonCheck: '✅ 反转非凭空，此前有多处暗示',
        hook: '{hiddenAntagonist.name}对{protagonist.name}的选择微笑着说了一句意味深长的话'
      },
      {
        name: '重置·牌局之外',
        conflict: '{protagonist.name}拒绝继续玩已有势力的游戏，决定开辟第三条路',
        events: [
          '{protagonist.name}公开声明退出所有势力，成为独立力量',
          '这一举动激怒了所有人，{protagonist.name}同时被多股势力追杀',
          '在逃亡过程中，{protagonist.name}聚集了一群同样被两大阵营排斥的边缘人物',
          '这群"乌合之众"在{protagonist.name}的带领下，用非传统的方式一次次化解危机',
          '第三次交锋时，{protagonist.faction}和{antagonist.faction}终于意识到：他们培养出了一个不受控制的变量'
        ],
        growth: '领导力：不是通过权威而是通过共鸣团结他人',
        coolPoint: '{protagonist.name}在一场三方对峙中，让{antagonist.faction}和{protagonist.faction}的部队同时停手',
        poisonCheck: '✅ 第三方力量崛起有过程有困难，不是一步登天',
        hook: '两方势力被迫坐到谈判桌前，但{protagonist.name}知道和平只是暂时的'
      },
      {
        name: '收束·清算与和解',
        conflict: '所有的谎言都被摆到台面上，无路可退的各方必须做一个了断',
        events: [
          '{hiddenAntagonist.name}公开了自己的全部计划和动机',
          '{protagonist.name}面对的不是一个要打倒的敌人，而是一个要选择的未来',
          '{antagonist.name}做出了出乎所有人预料的选择——站在了{protagonist.name}一边',
          '最终对决不是武力的碰撞，而是理念的博弈',
          '胜利的代价是{protagonist.name}必须接受一个并不完美的结局'
        ],
        growth: '智慧：理解了"胜利"不是黑白分明，而是承担代价',
        coolPoint: '{protagonist.name}放弃了复仇的权利，选择了让所有人都不满意但能活下去的方案',
        poisonCheck: '✅ 结局不是爽文式全胜，但更有深度',
        hook: '尘埃落定，但{protagonist.name}知道那个测试从未真正结束'
      },
      {
        name: '升华·新的定义',
        conflict: '{protagonist.name}开始按照自己的方式重建一切',
        events: [
          '战后重建遵循的不是老规矩，而是{protagonist.name}和同伴们摸索出的新规则',
          '旧的{protagonist.faction}一分为三，各自探索不同的道路',
          '{protagonist.name}选择了最意想不到的方向——去做一件所有人都觉得"不切实际"的事',
          '最后的画面不是王者加冕，而是{protagonist.name}和寥寥数人重新出发的背影'
        ],
        growth: '完成：不是变成了最强的那个，而是变成了"定义规则"的那个',
        coolPoint: '多年后，当有人问起{protagonist.name}时，得到的回答各不相同——他/她活成了一段传说，也活成了一个谜',
        poisonCheck: '✅ 结局留有余味，不过度美化也不仓促',
        hook: '新的故事在另一片土地上悄然开始——但这已经是别人的故事了'
      }
    ];

    // === 模板集 C：激进模式（危机→失败→重建→代价→觉醒→重塑） ===
    var setC = [
      {
        name: '崩塌·大错铸成',
        conflict: '{protagonist.name}的第一个重大决策就是错的——而且导致了灾难性的后果',
        events: [
          '{protagonist.name}被赋予了一个任务/选择，在压力下做出了最本能但最错误的决定',
          '直接后果：{protagonist.name}失去了最重要的人/物，声誉扫地',
          '{protagonist.faction}与他/她切割，{antagonist.faction}落井下石',
          '只有{ally.name}没有离开，但{protagonist.name}觉得自己不配拥有这份忠诚',
          '{protagonist.name}从最受期待的新星沦为所有人避之不及的灾星'
        ],
        growth: '毁灭：从"拥有一切"到"一无所有"，但这是重建的开始',
        coolPoint: '{protagonist.name}在所有人的唾弃中，安静地做了一件没人注意但最终改变了一切的小事',
        poisonCheck: '✅ 失败是角色自身的错误导致的，不是外力强加的',
        hook: '在最低谷时，{protagonist.name}收到了一个不该收到信任他的人传来的消息'
      },
      {
        name: '挣扎·废墟之上',
        conflict: '{protagonist.name}试图弥补错误，但每前进一步都退回两步',
        events: [
          '{protagonist.name}尝试从最底层重新开始，但过去的错误如影随形',
          '遇到了一个与自己曾经相似的年轻人，{protagonist.name}在其身上看到了自己犯的错',
          '{protagonist.name}阻止了这个年轻人走上同样的路，代价是自己又被拖下水',
          '这次善举意外获得了{regionNames[1]}一位低调人物的认可',
          '从这个人身上，{protagonist.name}学到了最关键的一课：力量不是解决问题的方式'
        ],
        growth: '蜕变：开始从"我要做什么"转变为"我应该怎么做"',
        coolPoint: '{protagonist.name}用自己的惨痛教训，在关键时刻阻止了一场波及无辜者的灾祸',
        poisonCheck: '✅ 成长有具体细节，不是突然顿悟',
        hook: '{hiddenAntagonist.faction}的一个叛逃者找到了{protagonist.name}，带来了一个机会'
      },
      {
        name: '重建·第二步路',
        conflict: '{protagonist.name}开始用全新的方式——非暴力的、系统性的——解决老问题',
        events: [
          '{protagonist.name}不再追求个体实力的增长，转而研究{regionNames[2]}的底层规则运转',
          '发现{antagonist.faction}的统治并非铁板一块，其中存在可以利用的内部矛盾',
          '{protagonist.name}开始匿名行动，在幕后通过信息、资源和人脉推动变革',
          '{ally.name}识别出了{protagonist.name}的手笔，重新找到了他/她',
          '被改变的不仅是局势，还有人们对"力量"和"胜利"的理解'
        ],
        growth: '方法：找到了不同于"拳头说话"的解决方式',
        coolPoint: '当所有人都在寻找那个消失的{protagonist.name}时，却发现整个局势已经被他/她不动声色地改变了',
        poisonCheck: '✅ 系统性变革有过程，不是一蹴而就',
        hook: '{antagonist.name}终于看穿了背后的操盘手是谁——但为时已晚'
      },
      {
        name: '代价·第二次失去',
        conflict: '{protagonist.name}的变革触及了{hiddenAntagonist.name}的核心利益——为此付出的代价是第二次失去',
        events: [
          '{hiddenAntagonist.name}的反击精准而残忍：不是在武力上打败{protagonist.name}，而是摧毁他/她建立的一切',
          '{ally.name}为了保住{protagonist.name}的成果，付出了生命/自由/记忆',
          '{protagonist.name}面对第二次失去，但这次的反应与第一次完全不同',
          '{protagonist.name}没有崩溃，而是安静地接受了代价，继续推进计划',
          '这份冷静让{hiddenAntagonist.name}第一次感到了恐惧——他/她面对的不是一个会崩溃的人'
        ],
        growth: '韧性：从"被打倒"到"打不倒"——不是因为强大，而是因为接受失去',
        coolPoint: '{protagonist.name}在{ally.name}的葬礼/告别仪式上的那番话，让在场所有人都沉默了',
        poisonCheck: '✅ 牺牲有价值不是为惨而惨',
        hook: '{protagonist.name}对{hiddenAntagonist.name}说了一句只有他们两个人能听懂的话'
      },
      {
        name: '觉醒·规则重塑',
        conflict: '{protagonist.name}不再是棋局中的棋手，而是开始重写棋盘的规则',
        events: [
          '{protagonist.name}揭示了自己的最终计划：不推翻某一个势力，而是让所有人都不再需要这种对立格局',
          '多方势力意识到{protagonist.name}的威胁不再是"力量"而是"改变所有人看待世界的方式"',
          '最后一次博弈不是战场，而是谈判桌——{protagonist.name}提出的条件让所有人愤怒、恐惧，但无法拒绝',
          '每一项条款都让人肉疼，但每一项都指向一个长期稳定的可能',
          '协议达成的那一刻，没有人欢呼——所有人都意识到，一个时代结束了'
        ],
        growth: '超越：不再需要战胜任何人，而是改变了游戏本身',
        coolPoint: '{protagonist.name}在所有人以为他/她会报复的时候，选择了宽恕——不是软弱，而是更高层次的胜利',
        poisonCheck: '✅ 规则重塑有逻辑基础，不是机械降神',
        hook: '旧时代落幕，新时代开启，但{protagonist.name}选择退出了舞台'
      },
      {
        name: '余响·不再需要名字',
        conflict: '所有人都在适应新规则，而{protagonist.name}开始了自己的下一段旅程',
        events: [
          '新规则下的第一次危机被各方以谈判而非战争解决——证明{protagonist.name}的体系可以运转',
          '年轻一代开始用全新的方式处理问题，他们甚至不知道{protagonist.name}当年的故事',
          '{protagonist.name}在某个不起眼的地方，开始了新的冒险——这一次只是为了自己',
          '最后的镜头：有人问起他/她的名字，他/她笑了笑，说了一个谁都不认识的新名字'
        ],
        growth: '解放：终于不再背负任何身份——可以成为任何人',
        coolPoint: '多年后，当有人无意中发现旧档案里{protagonist.name}的名字时，旁边的人说："哦，是他/她啊——我爷爷说他/她是个传说"',
        poisonCheck: '✅ 结局干净利落，不煽情不过度',
        hook: '——全书完——'
      }
    ];

    // === v46 模板集D：实验型（非对称·去高潮依赖·弱因果链） ===
    var setD = [
      {
        name: '揭示·不合时宜的发现',
        conflict: '{protagonist.name}无意中发现一件与当前危机"看似无关"的东西——但它会在很久以后变得致命',
        events: [
          '在一个和主线无关的日常场景中，{protagonist.name}注意到一个不起眼的异常',
          '异常没有得到解释，{protagonist.name}试图忽略它但失败了',
          '平静的生活出现第一道裂缝——坏事还没有发生，但安全感已经动摇'
        ],
        growth: '不是实力的成长，而是"知道的太多"的代价——认知改变了行为',
        coolPoint: '读者比主角更早感觉到不对劲，但说不清哪里不对',
        poisonCheck: '✅ 没有用冲突轰炸开篇，信任读者会跟着氛围走下去',
        hook: '裂缝不会自己愈合'
      },
      {
        name: '假象·所有人都在演戏',
        conflict: '看似正常的互动中，至少有两个人知道部分真相，但他们都在假装不知道',
        events: [
          '{protagonist.name}与{ally.name}进行了一次表面正常的交流',
          '但双方都在试探，每个回答都微妙地绕开某个敏感词',
          '对话结束后，两人分头行动，各自为同一个目标做着不同的事'
        ],
        growth: '信任在这种"不说破"的默契中反而加深了',
        coolPoint: '读者要读两遍才能发现每句话都暗藏两层意思',
        poisonCheck: '✅ 不是信息隐藏，而是信息以更复杂的方式呈现',
        hook: '他们能瞒住多久？'
      },
      {
        name: '代价·不可逆的选择',
        conflict: '{protagonist.name}面临一个"没有正确选项"的选择——每条路都意味着失去某些重要之物',
        events: [
          '{antagonist.name}给出了一个"交易"：用一个代价交换一个急需的结果',
          '{protagonist.name}犹豫、挣扎，甚至考虑第三条路，但发现不存在',
          '做出选择的那一刻，不是壮烈而是安静——因为沉重的决定往往是安静的'
        ],
        growth: '这一章不是变强，而是在天平上称量自己珍惜的东西',
        coolPoint: '反高潮——最大的震撼来自安静而非喧闹',
        poisonCheck: '✅ 没有用牺牲谁来做催泪，代价是真实的失去',
        hook: '有些事做了就是做了，不能回头'
      },
      {
        name: '偏航·主角不在场的故事',
        conflict: '本章全程以配角视角展开，讲述主角不在场时正在发生的事情',
        events: [
          '以{ally.name}或另一个重要配角的视角，展开一个独立的故事线',
          '这个配角的信息和读者一样有限——ta也在猜发生了什么',
          '本章结束时，配角获得的信息将改变ta对待主角的方式'
        ],
        growth: '不是主角的成长，而是配角作为独立生命体的展开',
        coolPoint: '读者通过配角的眼睛看到主角不在场时世界如何运转',
        poisonCheck: '✅ 配角不是工具人，有自己的欲望、恐惧和判断',
        hook: '下一次见面时，一切都会不一样'
      },
      {
        name: '并置·两条线交叉但不相遇',
        conflict: '主角和反派同时面对同一个事件，但各自采取不同行动——两人都看不到对方的全部',
        events: [
          '{protagonist.name}在A地处理事件，{antagonist.name}在B地处理同一个事件的不同侧面',
          '两边的行动互为因果但双方都不知情——主角的某个决定引发反派的应对，反过来也是如此',
          '没有面对面对抗，但紧张感在全知视角中不断累积'
        ],
        growth: '让读者第一次看到"全貌"——双方的行为都是合理的',
        coolPoint: '读者成了唯一掌握全局的人，但无力干预',
        poisonCheck: '✅ 反派有合理的行动逻辑，不是"就是要搞破坏"',
        hook: '两条线正在不可抗拒地靠近'
      },
      {
        name: '沉降·一切安静下来',
        conflict: '经历了激烈冲突之后的一章——没有人打架，但掉落的尘埃比飞扬的尘土更沉重',
        events: [
          '战后/变故后的安静时刻，角色们在废墟中各自消化发生的事',
          '{protagonist.name}在独处中发现了之前忽略的一样东西——不是线索，而是一个提醒',
          '没有新的冲突产生，但已有的冲突在这一章里沉淀成了更深的负担'
        ],
        growth: '沉默中的领悟比激战中的突破更持久',
        coolPoint: '写得好的安静章节比高潮章更让人难忘',
        poisonCheck: '✅ 没有用"等待下一场战斗"来打发过渡章',
        hook: '和平比战争更难面对'
      }
    ];

    // === 随机选择模板集：55%经典A，20%B，15%C，10%实验D ===
    var r = Math.random();
    var templates, templateSetLabel;
    if (r < 0.55) { templates = setA; templateSetLabel = 'A'; }
    else if (r < 0.75) { templates = setB; templateSetLabel = 'B'; }
    else if (r < 0.90) { templates = setC; templateSetLabel = 'C'; }
    else { templates = setD; templateSetLabel = 'D'; }

    // 首卷：加强铺垫和引入
    if (isFirstVol) {
      templates[0].name = '引子·开局布局';
      templates[0].events[0] = '{protagonist.name}首次出现在读者面前，展现其处境和性格（黄金三章）';
    }

    // 终卷：特殊处理——保留原有决战模式，但A/B/C各有不同的终卷风味
    if (isLastVol) {
      // 如果是B或C模板集，终卷仍然使用其特有结构，不需要覆盖
      if (templateSetLabel === 'A') {
        templates = [
          { name: '集结·最后一战', conflict: '各方势力汇聚，最终决战一触即发', events: ['所有盟友都赶到，组成最终联盟', '制定决战计划，每个人都有自己的使命', '决战前夜，{protagonist.name}与重要人物一一告别', '黎明时分，大军集结完毕'], growth: '决心：为了守护，不惜一切', coolPoint: '大军集结的场景震撼人心，所有人追随{protagonist.name}的决心', poisonCheck: '✅ 没有用水字数拖戏，集结有推动力', hook: '决战开始！第一波冲锋！' },
          { name: '决战·第一波', conflict: '{protagonist.name}率军与{antagonist.faction}主力正面交锋', events: ['双方大军交锋，场面恢弘', '{ally.name}在右翼建立突破口', '{antagonist.name}亲自下场，与{protagonist.name}首次交手', '各有损伤，{antagonist.name}受伤撤退'], growth: '战意：在生死搏杀中进一步升华', coolPoint: '{protagonist.name}与{antagonist.name}的对决，每一招都震撼天地', poisonCheck: '✅ 战斗有层次有描写，不是"一掌拍死"', hook: '{hiddenAntagonist.name}终于从幕后走到台前' },
          { name: '转折·终极真相', conflict: '{hiddenAntagonist.name}揭露全部真相，{protagonist.name}面临终极抉择', events: ['{hiddenAntagonist.name}揭示自己的真正身份和目的', '真相击碎了{protagonist.name}的某些信念', '{ally.name}或{mentor.name}的牺牲让{protagonist.name}重新振作', '{protagonist.name}做出抉择，接受命运或反抗命运'], growth: '心智：超越个人恩怨，为更大的意义而战', coolPoint: '{protagonist.name}在绝境中完成最后蜕变，突破到最终境界', poisonCheck: '✅ 牺牲有意义不狗血，主角选择有说服力', hook: '{protagonist.name}以最终形态登场，与{hiddenAntagonist.name}正面决战' },
          { name: '高潮·最终对决', conflict: '{protagonist.name}与{hiddenAntagonist.name}的终极决战', events: ['两个巅峰强者的大战，天地色变', '{protagonist.name}屡次被打倒又站起', '在最后一瞬，{protagonist.name}使出全部力量', '{hiddenAntagonist.name}被击败，但不死心'], growth: '完成：超越极限，成为传说', coolPoint: '{protagonist.name}燃烧一切的一击，华丽而悲壮', poisonCheck: '✅ 最终战有来有回，反派不是一击即溃', hook: '{hiddenAntagonist.name}最后的诅咒，新的威胁在遥远地平线升起' },
          { name: '收束·尘埃落定', conflict: '战后重建，给每个角色一个交代', events: ['统计伤亡，安葬阵亡者', '各方势力重新划分疆域和权力', '每个重要角色都有自己的结局', '{protagonist.name}面对选择：继续守护还是隐退'], growth: '终点：功成名就之后的空虚与满足', coolPoint: '回顾来路，{protagonist.name}的成长轨迹令读者感动', poisonCheck: '✅ 结局不烂尾，每个重要角色有交代', hook: '{protagonist.name}看到远方新的冒险旗帜——（完）' },
          { name: '尾声·传承', conflict: '新的时代开启了', events: ['{protagonist.name}将经验传授给下一代', '新的威胁（或机遇）悄然出现', '开放式的结局，给读者想象空间'], growth: '传承：功成身退，薪火相传', coolPoint: '老去的{protagonist.name}看着新一代踏上征程', poisonCheck: '✅ 传承自然，避免狗血续写感', hook: '—— 全书完 ——' }
        ];
      }
      // B/C模板集本身已经有了很强的终卷感，不再覆盖
    }

    return templates;
  },

  // 模板变量替换
  _fillTemplate(template, data) {
    if (!template) return '';
    var result = template;
    result = result.replace(/\{protagonist\.name\}/g, data.protagonist.name);
    result = result.replace(/\{antagonist\.name\}/g, data.antagonist.name);
    result = result.replace(/\{ally\.name\}/g, data.ally.name);
    result = result.replace(/\{mentor\.name\}/g, data.mentor.name);
    result = result.replace(/\{hiddenAntagonist\.name\}/g, data.hiddenAntagonist.name);
    result = result.replace(/\{protagonist\.faction\}/g, data.protagonist.faction);
    result = result.replace(/\{antagonist\.faction\}/g, data.antagonist.faction);
    result = result.replace(/\{ally\.faction\}/g, data.ally.faction);
    result = result.replace(/\{mentor\.faction\}/g, data.mentor.faction);
    result = result.replace(/\{hiddenAntagonist\.faction\}/g, data.hiddenAntagonist.faction);
    // 替换地区名
    for (var ri = 0; ri < (data.regions && data.regions.length || 0); ri++) {
      result = result.replace(new RegExp('\\{regionNames\\[' + ri + '\\]\\}', 'g'), data.regions[ri].name || '某地');
    }
    result = result.replace(/\{regionNames\[0\]\}/g, (data.regions && data.regions[0]) ? data.regions[0].name : '宗门');
    result = result.replace(/\{regionNames\[1\]\}/g, (data.regions && data.regions[1]) ? data.regions[1].name : '荒原');
    result = result.replace(/\{regionNames\[2\]\}/g, (data.regions && data.regions[2]) ? data.regions[2].name : '秘境');
    result = result.replace(/\{regionNames\[3\]\}/g, (data.regions && data.regions[3]) ? data.regions[3].name : '某城');
    // 替换境界名
    for (var li = 0; li < (data.levels && data.levels.length || 0); li++) {
      var lName = data.levels[li].name || ('第' + (li + 1) + '境');
      result = result.replace(new RegExp('\\{levels\\[' + li + '\\]\\}', 'g'), lName);
    }
    // 清理未替换的模板变量
    result = result.replace(/\{[^}]+\}/g, '??');
    return result;
  },

  // 生成具体卷事件
  _generateVolumeEvents(plotType, volumeCount, data) { var { protagonist, antagonist, ally, mentor, hiddenAntagonist, factions, regions, powerSystem } = data; var events = []; var regionNames = regions.map(r => r.name); var factionNames = factions.map(f => f.name); var levels = powerSystem.levels;

    if (plotType === '崛起流') {
      events.push({
        conflict: `${protagonist.name}因资质平庸被${protagonist.faction}同门欺凌，却意外觉醒体内封印力量`,
        events: [
          `${protagonist.name}在${regionNames[0] || '宗门'}被同门嘲笑，${mentor.name}暗中关注`,
          `${protagonist.name}误入禁地，获得上古传承，实力突飞猛进至${levels[1]?.name || '筑基境'}`,
          `${antagonist.name}奉${antagonist.faction}之命潜入${protagonist.faction}，与${protagonist.name}首次交锋`
        ],
        twist: `${mentor.name}告诉${protagonist.name}，他的父母正是被${hiddenAntagonist.faction}所害`,
        growth: `${protagonist.name}从${levels[0]?.name || '练气境'}突破到${levels[2]?.name || '结丹境'}，初步掌握血脉之力`,
        climax: `${protagonist.name}在宗门大比中击败内门第一天才，一鸣惊人`
      });
      events.push({
        conflict: `${protagonist.faction}与${antagonist.faction}矛盾激化，${protagonist.name}被卷入两派纷争`,
        events: [
          `${protagonist.name}与${ally.name}在${regionNames[1] || '荒原'}相遇，结伴探险`,
          `${antagonist.name}设下陷阱，${protagonist.name}和${ally.name}被困${regionNames[2] || '秘境'}`,
          `在绝境中，${protagonist.name}突破至${levels[3]?.name || '元婴境'}，反败为胜`
        ],
        twist: `${ally.name}的真实身份曝光——她竟是${ally.faction}失踪多年的圣女`,
        growth: `${protagonist.name}学会信任伙伴，从孤军奋战到懂得 teamwork`,
        climax: `${protagonist.name}以${levels[3]?.name || '元婴境'}修为越级挑战${antagonist.name}，将其重创`
      });
      events.push({
        conflict: `${hiddenAntagonist.faction}浮出水面，正邪两道面临空前危机`,
        events: [
          `${hiddenAntagonist.name}血祭${regionNames[3] || '某城'}，意图复活远古魔神`,
          `${protagonist.name}联合${protagonist.faction}、${ally.faction}组成联盟`,
          `${mentor.name}为救${protagonist.name}，挡下${hiddenAntagonist.name}致命一击，身受重伤`
        ],
        twist: `${hiddenAntagonist.name}揭示真相——${protagonist.name}体内的血脉正是魔神后裔之血`,
        growth: `${protagonist.name}突破至${levels[5]?.name || '渡劫境'}，接受自己的血脉，不被命运左右`,
        climax: `${protagonist.name}以一己之力击溃${hiddenAntagonist.faction}先锋大军，名震天下`
      });
      events.push({
        conflict: `最终决战，${protagonist.name}面对觉醒的远古魔神和堕落的${antagonist.name}`,
        events: [
          `${hiddenAntagonist.name}成功打开魔界通道，远古魔神降临`,
          `${antagonist.name}被魔神控制，与${protagonist.name}生死对决`,
          `${protagonist.name}在生死关头领悟血脉真谛，突破至${levels[6]?.name || '大乘境'}`
        ],
        twist: `${protagonist.name}发现魔神竟是自己的先祖，击败魔神意味着自我毁灭`,
        growth: `${protagonist.name}超越血脉束缚，创造属于自己的道路`,
        climax: `${protagonist.name}以${levels[7]?.name || '真仙境'}修为封印魔神，拯救世界，成为传说`
      });
    } else if (plotType === '复仇流') {
      events.push({
        conflict: `${protagonist.name}的${protagonist.faction}被${antagonist.faction}灭门，侥幸逃生`,
        events: [
          `${protagonist.name}目睹${antagonist.name}率领${antagonist.faction}高手血洗${protagonist.faction}`,
          `${mentor.name}救下${protagonist.name}，隐姓埋名传授武艺`,
          `${protagonist.name}在${regionNames[0] || '荒野'}苦修，发誓报仇雪恨`
        ],
        twist: `${protagonist.name}发现灭门之夜，${protagonist.faction}内部有人做内应`,
        growth: `${protagonist.name}从${levels[0]?.name || '练气境'}突破到${levels[2]?.name || '结丹境'}`,
        climax: `${protagonist.name}首次正面击败${antagonist.faction}追兵，初露锋芒`
      });
      events.push({
        conflict: `${protagonist.name}潜入${antagonist.faction}调查真相，发现更大的阴谋`,
        events: [
          `${protagonist.name}化名潜入${antagonist.faction}，结识${ally.name}`,
          `${protagonist.name}发现${antagonist.faction}背后还有${hiddenAntagonist.faction}在操纵`,
          `${ally.name}得知${protagonist.name}真实身份，选择站在他这边`
        ],
        twist: `${protagonist.name}发现${protagonist.faction}灭门当晚，${mentor.name}也在现场`,
        growth: `${protagonist.name}学会隐忍和谋划，不再冲动行事`,
        climax: `${protagonist.name}和${ally.name}联手破坏${antagonist.faction}的重要计划`
      });
      events.push({
        conflict: `${protagonist.name}与${antagonist.name}正面对决，真相逐渐浮出水面`,
        events: [
          `${protagonist.name}在${regionNames[1] || '某城'}设下圈套，引出${antagonist.faction}主力`,
          `${antagonist.name}与${protagonist.name}大战三天三夜，两败俱伤`,
          `${hiddenAntagonist.name}趁机出手，欲将两人一网打尽`
        ],
        twist: `${antagonist.name}揭示——灭门之夜是${protagonist.faction}掌门自愿牺牲，为了封印魔神`,
        growth: `${protagonist.name}从复仇的执念中解脱，明白真正的敌人是${hiddenAntagonist.faction}`,
        climax: `${protagonist.name}和${antagonist.name}暂时联手，击退${hiddenAntagonist.name}`
      });
      events.push({
        conflict: `最终决战，${protagonist.name}面对${hiddenAntagonist.name}和远古魔神`,
        events: [
          `${hiddenAntagonist.name}复活远古魔神，天下大乱`,
          `${protagonist.name}联合所有势力，组成抗魔联盟`,
          `${protagonist.name}以${levels[6]?.name || '大乘境'}修为与魔神决战于${regionNames[2] || '天际'}`
        ],
        twist: `击败魔神需要${protagonist.name}牺牲自己的血脉之力，从此沦为凡人`,
        growth: `${protagonist.name}选择牺牲自己，证明真正的强大不在力量，而在守护之心`,
        climax: `${protagonist.name}封印魔神，重建${protagonist.faction}，成为一代宗师`
      });
    } else {
      // 其他流派使用通用模板
      for ( var i = 0; i < volumeCount; i++) { var levelIdx = Math.min(i * 2 + 1, levels.length - 1);
        events.push({
          conflict: `${protagonist.name}在${regionNames[i % regionNames.length]}遭遇${antagonist.faction}的阴谋`,
          events: [
            `${protagonist.name}与${ally.name}前往${regionNames[i % regionNames.length]}执行任务`,
            `${antagonist.name}设下埋伏，${protagonist.name}陷入危机`,
            `${protagonist.name}在绝境中突破至${levels[levelIdx]?.name || '更高境界'}`
          ],
          twist: `发现${hiddenAntagonist.faction}在幕后操纵一切`,
          growth: `${protagonist.name}从${levels[Math.max(0, levelIdx - 2)]?.name || '弱小的境界'}成长到${levels[levelIdx]?.name || '更强的境界'}`,
          climax: `${protagonist.name}击败${antagonist.name}的得力手下，获得关键线索`
        });
      }
    }

    // 如果卷数超过预生成的事件数，补充通用事件
    while (events.length < volumeCount) { var idx = events.length; var levelIdx = Math.min(idx * 2 + 1, levels.length - 1);
      events.push({
        conflict: `${protagonist.name}面临新的危机，${hiddenAntagonist.faction}的阴谋逐渐浮出水面`,
        events: [
          `${protagonist.name}在${regionNames[idx % regionNames.length]}发现${hiddenAntagonist.faction}的秘密据点`,
          `${ally.name}被${antagonist.faction}抓走，${protagonist.name}前去营救`,
          `${protagonist.name}与${mentor.name}联手，击退${hiddenAntagonist.name}的分身`
        ],
        twist: `${protagonist.name}发现自己的血脉与魔神有关`,
        growth: `${protagonist.name}突破至${levels[levelIdx]?.name || '更高境界'}，实力大增`,
        climax: `${protagonist.name}获得上古神器，为最终决战做准备`
      });
    }

    return events.slice(0, volumeCount);
  },

  // 生成细纲 - 接收大纲内容
  generateDetail(outlineText, volume, chapterCount = 10, genre = '玄幻') { var style = GENRE_STYLES[genre] || GENRE_STYLES['玄幻']; var worldObj = (outlineText && outlineText._worldObj) || WORLD_DATABASE[genre] || WORLD_DATABASE['玄幻']; var chars = (outlineText && outlineText._chars) || []; var outlineData = (outlineText && outlineText._outlineData) || []; var protagonist = chars.find(c => c.type === 'protagonist') || { name: '林墨', faction: '天玄宗' }; var antagonist = chars.find(c => c.type === 'antagonist') || { name: '魔焰门少主', faction: '魔焰门' }; var ally = chars.find(c => c.type === 'ally') || { name: '苏婉儿', faction: '万兽谷' }; var mentor = chars.find(c => c.type === 'mentor') || { name: '玄清真人', faction: '天玄宗' }; var hiddenAntagonist = chars.find(c => c.type === 'hiddenAntagonist') || { name: '血衣侯', faction: '血煞教' }; var regions = worldObj.regions || []; var factions = worldObj.factions || []; var volumeData = outlineData[volume - 1] || {}; var detail = `【第${volume}卷细纲】\n\n`;
    detail += `**时间跨度**：${this._getTimeSpan(genre, volume)}\n`;
    detail += `**卷末状态**：${protagonist.name}突破至新境界，获得关键线索\n`;
    detail += `**字数预估**：${chapterCount}章 × 3500–4000字 ≈ ${Math.round(chapterCount * 3.5)}–${Math.round(chapterCount * 4)}万字\n\n`;
    detail += `**核心修正**：\n`;
    detail += `1. 时间：第${volume}卷时间线统一，确保事件顺序合理\n`;
    detail += `2. 武力：${protagonist.name}的境界提升有铺垫，战斗逻辑自洽\n`;
    detail += `3. 经济：资源收支独立核算，第${volume}卷经济数据自洽\n`;
    detail += `4. 人设：${protagonist.name}、${ally.name}、${antagonist.name}行为符合设定\n`;
    detail += `5. 过渡：每章末尾增加时间/事件过渡骨架，消除章节间硬跳\n\n`;
    detail += `**收尾**：${volumeData.twist || '留下悬念，引出下一卷'}\n\n`;

    // 根据卷数据生成具体章节
    var chapterEvents = this._generateChapterEvents(volume, chapterCount, {
      protagonist, antagonist, ally, mentor, hiddenAntagonist,
      regions, factions, volumeData, genre
    });

    for ( var i = 1; i <= chapterCount; i++) { var ch = chapterEvents[i - 1];
      detail += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      detail += `### 【第${i}章】${ch.title}\n`;
      detail += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      detail += `**情绪基调**：${ch.mood}\n`;
      detail += `**爽点类型**：${ch.payoff}\n`;
      detail += `**时间**：${ch.time}\n`;
      detail += `**地点**：${ch.location}\n`;
      detail += `**人物**：${ch.characters}\n`;
      detail += `**硬节点（番茄第${i}章：）**：\n`;
      ch.nodes.forEach(function(node, idx) {
        detail += `${idx + 1}. ${node}\n`;
      });
      detail += `**【数字面板】** 人数：${ch.panel.people} | 存粮：${ch.panel.food} | 刀：${ch.panel.sword} | 棍：${ch.panel.stick} | 马：${ch.panel.horse} | 钱：${ch.panel.money}\n`;
      detail += `**【番茄钩子】**\n`;
      detail += `${ch.hook}\n`;
      detail += `**字数建议**：3500-4000字\n`;
      detail += `**【兑现链】**\n`;
      if (i < chapterCount) {
        detail += `- ${ch.hookPreview} → 第${i+1}章（兑现）\n`;
      } else {
        detail += `- 本卷完结，${volumeData.twist || '悬念延续至下一卷'}\n`;
      }
      detail += `\n`;
    }

    return detail;
  },

  // 生成具体章节事件
  _generateChapterEvents(volume, chapterCount, data) { var { protagonist, antagonist, ally, mentor, hiddenAntagonist, regions, factions, volumeData, genre } = data; var regionNames = regions.map(r => r.name); var factionNames = factions.map(f => f.name); var events = []; var mainEvents = volumeData.events || [
      `${protagonist.name}执行任务`,
      `${protagonist.name}遭遇危机`,
      `${protagonist.name}突破成长`
    ];

    for ( var i = 1; i <= chapterCount; i++) { var progress = i / chapterCount; var region = regionNames[(i + volume) % regionNames.length] || '宗门'; var mood = this._getMoodByProgress(progress); var payoff = this._getPayoffByProgress(progress); var nodes = []; var title = ''; var characters = ''; var hook = ''; var hookPreview = '';

      if (progress <= 0.15) {
        // 开篇：日常引入 + 危机降临
        title = `${protagonist.name}的${region}之行`;
        characters = `${protagonist.name}、${ally.name}、${region}路人`;
        nodes = [
          `${protagonist.name}在${region}日常修炼，展示当前实力`,
          `${ally.name}带来消息——${antagonist.faction}在${region}有异动`,
          `${protagonist.name}决定调查，遭遇${antagonist.faction}小喽啰`,
          `击败小喽啰，获得${antagonist.faction}的密信/令牌`,
          `密信内容暗示更大的阴谋`
        ];
        hook = `${protagonist.name}展开密信，脸色骤变——信中提到了${hiddenAntagonist.faction}的名字...`;
        hookPreview = `${protagonist.name}追查${hiddenAntagonist.faction}的线索`;
      } else if (progress <= 0.35) {
        // 发展：深入调查 + 遭遇阻碍
        title = `${antagonist.faction}的阴谋`;
        characters = `${protagonist.name}、${ally.name}、${antagonist.name}`;
        nodes = [
          `${protagonist.name}和${ally.name}追踪线索，深入${region}`,
          `发现${antagonist.faction}的秘密据点`,
          `${antagonist.name}现身，双方初次正面交锋`,
          `${protagonist.name}不敌${antagonist.name}，身受轻伤`,
          `${ally.name}施展秘术，带${protagonist.name}脱险`
        ];
        hook = `就在此时，${ally.name}突然口吐鲜血——原来她为了救${protagonist.name}，动用了禁术...`;
        hookPreview = `${protagonist.name}寻找救治${ally.name}的方法`;
      } else if (progress <= 0.55) {
        // 转折：发现真相 + 盟友危机
        title = `${ally.name}的秘密`;
        characters = `${protagonist.name}、${ally.name}、${mentor.name}`;
        nodes = [
          `${protagonist.name}带受伤的${ally.name}求见${mentor.name}`,
          `${mentor.name}救治${ally.name}，发现她体内有特殊封印`,
          `${ally.name}苏醒，向${protagonist.name}坦白真实身份`,
          `${protagonist.name}表示无论${ally.name}是谁，都会守护她`,
          `两人感情升温，约定共同面对未来`
        ];
        hook = `${mentor.name}神色凝重地告诉${protagonist.name}：「${ally.name}体内的封印，与${hiddenAntagonist.faction}有关...」`;
        hookPreview = `${protagonist.name}调查${ally.name}身世与${hiddenAntagonist.faction}的关联`;
      } else if (progress <= 0.75) {
        // 高潮前：实力提升 + 准备决战
        title = `突破！${protagonist.name}的觉醒`;
        characters = `${protagonist.name}、${mentor.name}、${antagonist.faction}高手`;
        nodes = [
          `${protagonist.name}在${mentor.name}指导下闭关修炼`,
          `回忆过往，领悟新的力量/功法`,
          `突破瓶颈，实力大增`,
          `${antagonist.faction}高手来袭，试探${protagonist.name}实力`,
          `${protagonist.name}轻松击败来敌，震慑四方`
        ];
        hook = `来敌临死前狂笑：「${hiddenAntagonist.name}大人已经集齐了三件神器，你们来不及了...」`;
        hookPreview = `${protagonist.name}阻止${hiddenAntagonist.name}集齐神器`;
      } else if (progress <= 0.9) {
        // 高潮：正面对决
        title = `${protagonist.name} VS ${antagonist.name}`;
        characters = `${protagonist.name}、${antagonist.name}、${ally.name}`;
        nodes = [
          `${protagonist.name}主动找到${antagonist.name}，约战${region}`,
          `双方大战，${antagonist.name}展现出隐藏实力`,
          `${protagonist.name}陷入绝境，${ally.name}及时赶到支援`,
          `两人联手，逐渐占据上风`,
          `${antagonist.name}败退，留下狠话`
        ];
        hook = `${antagonist.name}败退时冷笑：「你以为赢了？${hiddenAntagonist.name}大人已经开启了祭坛...」`;
        hookPreview = `${protagonist.name}赶往阻止${hiddenAntagonist.name}的祭坛仪式`;
      } else {
        // 收尾：阶段性胜利 + 新悬念
        title = `祭坛之战`;
        characters = `${protagonist.name}、${hiddenAntagonist.name}、${ally.name}、${mentor.name}`;
        nodes = [
          `${protagonist.name}等人赶到${hiddenAntagonist.faction}祭坛`,
          `${hiddenAntagonist.name}正在进行血祭仪式，魔神即将苏醒`,
          `${protagonist.name}与${hiddenAntagonist.name}交手，发现对方实力远超想象`,
          `${mentor.name}牺牲自己/施展禁术，暂时封印祭坛`,
          `${hiddenAntagonist.name}撤退，但仪式已部分完成`
        ];
        hook = `祭坛深处传来低沉的咆哮声——魔神的一缕意识已经苏醒，正注视着${protagonist.name}...`;
        hookPreview = `${protagonist.name}寻找彻底消灭魔神的方法`;
      }

      events.push({
        title,
        mood,
        payoff,
        time: `第${volume}卷第${i * 3}天`,
        location: region,
        characters,
        nodes,
        panel: {
          people: Math.floor(10 + i * 2),
          food: Math.floor(5 + i),
          sword: Math.floor(3 + i),
          stick: Math.floor(2 + i / 2),
          horse: Math.floor(1 + i / 3),
          money: Math.floor(100 + i * 50)
        },
        hook,
        hookPreview
      });
    }

    return events;
  },

  _getMoodByProgress(progress) {
    if (progress < 0.2) return '轻松明快';
    if (progress < 0.4) return '紧张刺激';
    if (progress < 0.6) return '悬疑紧张';
    if (progress < 0.8) return '热血激昂';
    return '压抑沉重';
  },

  _getPayoffByProgress(progress) {
    if (progress < 0.2) return '日常温馨';
    if (progress < 0.4) return '绝境翻盘';
    if (progress < 0.6) return '情感爆发';
    if (progress < 0.8) return '实力碾压';
    return '真相揭露';
  },

  // ========== 辅助生成方法 ==========
  _getVolumeNames(plotType, count) { var names = {
      '崛起流': ['初入江湖', '崭露头角', '名震一方', '登顶巅峰', '开创新局', '传承万世'],
      '复仇流': ['血海深仇', '隐忍蛰伏', '步步为营', '清算旧账', '大仇得报', '新生之路'],
      '探险流': ['启程出发', '险地探秘', '危机四伏', '真相浮现', '终极宝藏', '归途新程'],
      '争霸流': ['乱世开局', '积蓄力量', '合纵连横', '关键战役', '一统天下', '建立新秩序'],
      '日常流': ['平静生活', '突发事件', '解决问题', '结识伙伴', '共同成长', '温馨结局']
    };
    return (names[plotType] || names['崛起流']).slice(0, count);
  },

  _getTimeSpan(genre, volume) { var spans = ['三个月', '半年', '一年', '两年'];
    return spans[(volume - 1) % spans.length];
  },

  // ========== 智能续写（增强版）==========
  continueStory(content, work, command) { var genre = work.genre || '玄幻'; var world = work.world || ''; var chars = work.chars || '';
    
    // 深度分析前文
    var analysis = this.deepAnalyze(content);
    
    // 提取世界观和角色数据
    analysis._worldObj = work._worldObj || this._parseWorldFromText(world, genre);
    analysis._chars = work._chars || this._parseCharsFromText(chars, genre);
    analysis._genre = genre;
    
    // 根据分析结果和指令选择生成策略
    var continuation = '';
    
    if (command.includes('战斗') || command.includes('打斗') || command.includes('战')) {
      continuation = this.generateBattle(analysis, genre);
    } else if (command.includes('对话') || command.includes('交流') || command.includes('谈')) {
      continuation = this.generateDialogue(analysis, genre);
    } else if (command.includes('修炼') || command.includes('突破') || command.includes('练')) {
      continuation = this.generateCultivation(analysis, genre);
    } else if (command.includes('情感') || command.includes('感情') || command.includes('爱')) {
      continuation = this.generateEmotion(analysis, genre);
    } else if (command.includes('心理') || command.includes('内心') || command.includes('想')) {
      continuation = this.generatePsychology(analysis, genre);
    } else if (command.includes('环境') || command.includes('场景') || command.includes('描写')) {
      continuation = this.generateEnvironment(analysis, genre);
    } else if (command.includes('过渡') || command.includes('转场') || command.includes('切换')) {
      continuation = this.generateTransition(analysis, genre);
    } else if (command.includes('群像') || command.includes('多人') || command.includes('场面')) {
      continuation = this.generateGroupScene(analysis, genre);
    } else {
      continuation = this.generateGeneral(analysis, genre);
    }
    
    // 后处理：自动规避重复用词和描述堆叠
    continuation = this.postFilter(continuation, content);
    
    return continuation;
  },

  // 深度内容分析
  deepAnalyze(content) { var sentences = content.split(/[。！？\n]/).filter(s => s.trim()); var lastSentence = sentences[sentences.length - 1] || ''; var lastParagraph = content.split(/\n+/).filter(p => p.trim()).pop() || ''; var keywords = this.extractKeywords(content); var mood = this.detectMood(content); var style = this.detectStyle(content); var characters = this.extractCharacters(content); var setting = this.extractSetting(content);
    
    return {
      lastSentence,
      lastParagraph,
      keywords,
      length: content.length,
      sentenceCount: sentences.length,
      mood,
      style,
      characters,
      setting,
      // 计算节奏：快慢交替
      pacing: this.analyzePacing(sentences)
    };
  },

  // 提取关键词
  extractKeywords(content) { var keywordMap = {
      action: ['战斗', '攻击', '防御', '闪避', '招式', '力量', '气势', '杀意', '对决', '交锋', '厮杀', '拼杀'],
      emotion: ['愤怒', '悲伤', '喜悦', '恐惧', '惊讶', '平静', '激动', '绝望', '欣喜', '震怒', '怅然', '悸动'],
      setting: ['山洞', '宫殿', '森林', '城市', '战场', '密室', '天空', '海底', '荒野', '城池', '山谷', '楼阁'],
      character: ['主角', '反派', '师傅', '朋友', '敌人', '陌生人', '高手', '老者', '少女', '青年']
    }; var found = {};
    for ( var [category, words] of Object.entries(keywordMap)) {
      found[category] = words.filter(w => content.includes(w));
    }
    return found;
  },

  // 检测情绪
  detectMood(content) { var moodMap = {
      tense: ['紧张', '危险', '危机', '绝境', '生死', '拼命', '危急', '凶险'],
      calm: ['平静', '安宁', '祥和', '悠闲', '日常', '修炼', '静谧', '恬淡'],
      exciting: ['激动', '兴奋', '热血', '震撼', '惊喜', '突破', '激昂', '澎湃'],
      sad: ['悲伤', '痛苦', '绝望', '离别', '牺牲', '失去', '哀伤', '凄凉'],
      angry: ['愤怒', '暴怒', '震怒', '怒火', '愤恨', '恼怒', '愠怒', '盛怒'],
      happy: ['喜悦', '欣喜', '欢愉', '畅快', '欣慰', '怡然', '愉悦', '欢欣']
    }; var scores = {};
    for ( var [mood, words] of Object.entries(moodMap)) {
      scores[mood] = words.filter(w => content.includes(w)).length;
    }
    
    var dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return dominant[1] > 0 ? dominant[0] : 'neutral';
  },

  // 检测写作风格
  detectStyle(content) {
    if (content.includes('"') && content.split('"').length > 4) return 'dialogue-heavy';
    if (/[\u4e00-\u9fa5]{4}/g.test(content) && content.match(/[\u4e00-\u9fa5]{4}/g).length > 10) return 'idiom-heavy';
    if (content.includes('！') && content.split('！').length > 5) return 'intense';
    if (content.includes('……') || content.includes('...')) return 'melancholic';
    return 'balanced';
  },

  // 提取出场人物
  extractCharacters(content) { var patterns = [
      /([\u4e00-\u9fa5]{2,4})(?=道[:：])/g,
      /([\u4e00-\u9fa5]{2,4})(?=说[:：])/g,
      /([\u4e00-\u9fa5]{2,4})(?=冷笑|怒喝|沉声|淡淡)/g
    ]; var chars = new Set();
    patterns.forEach(function(p) { var matches = content.match(p);
      if (matches) matches.forEach(m => chars.add(m));
    });
    return Array.from(chars).slice(0, 5);
  },

  // 提取场景设定
  extractSetting(content) { var settings = ['山洞', '宫殿', '森林', '城市', '战场', '密室', '天空', '海底', '荒野', '城池', '山谷', '楼阁', '庭院', '街道', '大殿'];
    return settings.filter(s => content.includes(s));
  },

  // 分析节奏
  analyzePacing(sentences) { var shortCount = sentences.filter(s => s.length < 15).length; var longCount = sentences.filter(s => s.length > 40).length;
    if (shortCount > longCount * 2) return 'fast';
    if (longCount > shortCount * 2) return 'slow';
    return 'mixed';
  },

  // ========== 场景生成器（增强版）==========
  
  // 生成战斗场景
  generateBattle(analysis, genre) { var style = GENRE_STYLES[genre] || GENRE_STYLES['玄幻']; var patterns = style.sentencePatterns; var powerWords = style.powerWords; var transitions = style.transitions;
    
    // 提取世界观和角色数据
    var worldObj = analysis._worldObj; var chars = analysis._chars;
    
    // 获取具体角色和势力信息
    var protagonist = chars ? chars.find(c => c.type === 'protagonist') : null; var antagonist = chars ? chars.find(c => c.type === 'antagonist') : null; var mentor = chars ? chars.find(c => c.type === 'mentor') : null; var ally = chars ? chars.find(c => c.type === 'ally') : null; var hiddenAntagonist = chars ? chars.find(c => c.type === 'hiddenAntagonist') : null; var factions = worldObj ? worldObj.factions : null; var regions = worldObj ? worldObj.regions : null; var powerSystem = worldObj ? worldObj.powerSystem : null;
    
    // 根据前文情绪调整
    var intensity = 'normal';
    if (analysis.mood === 'tense') intensity = 'high';
    if (analysis.mood === 'exciting') intensity = 'peak'; var result = '\n';
    
    // 如果有具体角色信息，生成基于世界观的战斗场景
    if (protagonist && antagonist && factions && powerSystem) { var protagonistFaction = factions.find(f => f.name === protagonist.faction) || factions[0]; var antagonistFaction = factions.find(f => f.name === antagonist.faction) || factions[1]; var region = regions ? regions[0] : null; var level = powerSystem.levels ? powerSystem.levels[Math.min(2, powerSystem.levels.length - 1)] : null;
      
      // 根据题材生成招式名
      var skillNames = this._getSkillNames(genre, protagonistFaction.name, antagonistFaction.name); var specificOpenings = [
        `${protagonist.name}与${antagonist.name}之间的气氛瞬间紧张到了极点，${region ? region.name : '战场'}上仿佛有电光在闪烁。`,
        `${antagonist.name}眼中杀意毕露，${antagonistFaction.name}的功法气息在周身缭绕。`,
        `没有任何废话，${protagonist.name}已经催动${protagonistFaction.name}心法，准备迎战。`,
        `四目相对，${protagonist.name}的${skillNames[0]}与${antagonist.name}的${skillNames[1]}气息碰撞，火花迸溅。`,
        `一道寒芒闪过，${protagonist.name}率先出手，打破了死一般的寂静。`
      ];
      
      result += specificOpenings[Math.floor(Math.random() * specificOpenings.length)] + '\n\n'; var specificActions = {
        normal: [
          `只见${protagonist.name}身形一闪，${skillNames[0]}已然出手，凌厉的攻势直取${antagonist.name}要害。`,
          `${protagonist.name}与${antagonist.name}你来我往，招招致命。${protagonistFaction.name}的精妙功法与${antagonistFaction.name}的狠辣招式不断碰撞。`,
          `${skillNames[0]}与${skillNames[1]}相交，气劲四溢，两人各自后退三步，地面出现了裂痕。`
        ],
        high: [
          `刹那间，${protagonist.name}与${antagonist.name}同时动了！${protagonistFaction.name}的${skillNames[0]}与${antagonistFaction.name}的${skillNames[1]}狠狠碰撞。`,
          `轰！一声巨响，两股力量在${region ? region.name : '场中'}碰撞，气浪翻涌，围观的${protagonistFaction.name}弟子无不骇然。`,
          `${antagonist.name}杀招频出，毫不留情。${protagonist.name}以${skillNames[0]}应对，每一击都是生死相搏。`
        ],
        peak: [
          `${region ? region.name : '天地'}变色！${protagonist.name}全力施展${skillNames[0]}，恐怖的能量波动让周围的空间都开始扭曲。`,
          `这一击，${protagonist.name}倾注了${level ? level.name : '全部'}修为与意志，${skillNames[0]}誓要击溃${antagonist.name}的${skillNames[1]}！`,
          `${powerWords[Math.floor(Math.random() * powerWords.length)]}！${protagonist.name}的${skillNames[0]}裹挟着无可匹敌的威势，轰然斩向${antagonist.name}！`
        ]
      };
      
      result += specificActions[intensity][Math.floor(Math.random() * specificActions[intensity].length)] + '\n\n';
      
      if (intensity === 'peak') {
        result += `这是${protagonistFaction.name}的至高绝学——${skillNames[0]}！\n\n`;
      }
      
      result += `${skillNames[0]}与${skillNames[1]}碰撞产生的冲击波向四周扩散，${region ? region.name : '地面'}出现了蛛网般的裂痕。旁观的${protagonistFaction.name}弟子无不倒吸一口凉气，这等${level ? level.name : ''}强者的对决已经超出了他们的认知范围。\n\n`;
      result += `${transitions[Math.floor(Math.random() * transitions.length)]}，${protagonist.name}与${antagonist.name}的胜负终于分晓。\n`;
    } else {
      // 回退到通用模板
      var battleOpenings = [
        '两人之间的气氛瞬间紧张到了极点，空气中仿佛有电光在闪烁。',
        '杀意，在无声中蔓延。',
        '没有任何废话，战斗一触即发。',
        '四目相对，火花迸溅。',
        '一道寒芒闪过，打破了死一般的寂静。'
      ]; var battleActions = {
        normal: [
          '只见他身形一闪，已然出现在对手面前，一招凌厉的攻势直取要害。',
          '双方你来我往，招招致命，每一击都蕴含着精妙的变化。',
          '拳掌相交，气劲四溢，两人各自后退三步。'
        ],
        high: [
          '刹那间，两人同时动了！速度快到肉眼几乎无法捕捉。',
          '轰！一声巨响，两股力量狠狠碰撞在一起，气浪翻涌。',
          '杀招频出，毫不留情，每一击都是奔着取对方性命而去。'
        ],
        peak: [
          '天地变色！两人全力出手，恐怖的能量波动让周围的空间都开始扭曲。',
          '这一击，倾注了全部的修为与意志，誓要分出胜负！',
          '毁天灭地的一击，裹挟着无可匹敌的威势，轰然落下！'
        ]
      };
      
      result += battleOpenings[Math.floor(Math.random() * battleOpenings.length)] + '\n\n';
      result += battleActions[intensity][Math.floor(Math.random() * battleActions[intensity].length)] + '\n\n';
      
      if (intensity === 'peak') {
        result += `这是${powerWords[Math.floor(Math.random() * powerWords.length)]}的一击！\n\n`;
      }
      
      result += '招式碰撞产生的冲击波向四周扩散，地面出现了蛛网般的裂痕。旁观者无不倒吸一口凉气，这等实力的对决已经超出了他们的认知范围。\n\n';
      result += `${transitions[Math.floor(Math.random() * transitions.length)]}，胜负终于分晓。\n`;
    }
    
    return result;
  },

  // 从世界观文本中解析出结构化数据（兼容旧数据）
  _parseWorldFromText(worldText, genre) {
    if (!worldText || worldText.length < 20) return null;
    try {
      // 提取势力
      var factions = []; var factionMatches = worldText.match(/【[^\n]*?势力[^\n]*?】\n([\s\S]*?)(?=\n【|\n\n|$)/g) || [];
      factionMatches.forEach(function(block) { var nameMatch = block.match(/【([^\n]+)】/); var name = nameMatch ? nameMatch[1].replace(/[势力]/g, '') : '未知势力'; var desc = block.replace(/【[^\n]+】\n/, '').trim().substring(0, 100);
        factions.push({ name, description: desc, stance: 'neutral', relation: '未知' });
      });
      // 也尝试从行中提取势力名
      var factionLinePattern = /[•\-\*]\s*([^\n：]{2,10}[宗门派阁教盟会府军])[:：]?([^\n]*)/g; var m;
      while ((m = factionLinePattern.exec(worldText)) !== null) {
        if (!factions.find(f => f.name === m[1])) {
          factions.push({ name: m[1], description: m[2] || '', stance: 'neutral', relation: '未知' });
        }
      }

      // 提取地域
      var regions = []; var regionLinePattern = /[•\-\*]\s*([^\n：]{2,15}(?:州|域|荒原|森林|海域|沙漠|山脉|城|岛|谷|海|境))[:：]?([^\n]*)/g;
      while ((m = regionLinePattern.exec(worldText)) !== null) {
        regions.push({ name: m[1], description: m[2] || '' });
      }

      // 提取力量体系
      var powerSystem = { name: '', levels: [] }; var powerMatch = worldText.match(/【[^\n]*?力量体系[^\n]*?】\n([\s\S]*?)(?=\n【|\n\n|$)/);
      if (powerMatch) { var powerText = powerMatch[1]; var levelPattern = /[→＞>]\s*([^\n→＞>]+)/g;
        while ((m = levelPattern.exec(powerText)) !== null) {
          powerSystem.levels.push(m[1].trim());
        }
        if (powerSystem.levels.length === 0) {
          // 尝试从行中提取
          var lineLevelPattern = /[•\-\*]\s*([^\n]+?)(?:[：:]\s*[^\n]*)/g;
          while ((m = lineLevelPattern.exec(powerText)) !== null && powerSystem.levels.length < 10) {
            powerSystem.levels.push(m[1].trim());
          }
        }
      }
      // 如果没有力量体系，使用默认
      if (powerSystem.levels.length === 0) { var defaults = {
          '玄幻': ['凡人','练气','筑基','结丹','元婴','化神','渡劫','大乘'],
          '仙侠': ['凡人','练气','筑基','金丹','元婴','化神','合体','大乘','渡劫'],
          '都市': ['普通人','F级','E级','D级','C级','B级','A级','S级','SS级'],
          '武侠': ['三流','二流','一流','顶尖','宗师','大宗师'],
          '末世': ['普通','一级进化','二级进化','三级进化','四级进化','五级进化'],
          '历史': ['平民','士兵','百夫长','千夫长','校尉','将军','元帅']
        };
        powerSystem.levels = defaults[genre] || defaults['玄幻'];
        powerSystem.name = defaults[genre] ? '默认体系' : '默认体系';
      }

      if (factions.length === 0 && regions.length === 0) return null;
      return { factions, regions, powerSystem };
    } catch (e) {
      return null;
    }
  },

  // 从人设文本中解析出角色数组（兼容旧数据）
  _parseCharsFromText(charsText, genre) {
    if (!charsText || charsText.length < 20) return null;
    try { var chars = [];
      // 按 ═ 或 === 分隔的角色块
      var blocks = charsText.split(/[═]{3,}|[━]{3,}|[─]{3,}|={3,}/).filter(b => b.trim().length > 30);
      blocks.forEach(function(block) { var nameMatch = block.match(/【姓名[：:]?\s*】\s*([^\n]+)/) || block.match(/姓名[：:]\s*([^\n]+)/) || block.match(/姓名：([^\n]+)/); var name = nameMatch ? nameMatch[1].trim() : ''; var roleMatch = block.match(/【角色类型[：:]?\s*】\s*([^\n]+)/) || block.match(/角色类型[：:]\s*([^\n]+)/) || block.match(/类型[：:]\s*([^\n]+)/); var roleText = roleMatch ? roleMatch[1].trim() : ''; var factionMatch = block.match(/势力[：:]\s*([^\n]+)/) || block.match(/门派[：:]\s*([^\n]+)/) || block.match(/所属[：:]\s*([^\n]+)/); var faction = factionMatch ? factionMatch[1].trim() : ''; var descMatch = block.match(/【角色简介[：:]?\s*】\s*([\s\S]*?)(?=\n【|$)/) || block.match(/简介[：:]\s*([\s\S]*?)(?=\n【|$)/); var description = descMatch ? descMatch[1].trim().substring(0, 100) : ''; var type = 'other';
        if (roleText.includes('主角') || name.includes('林墨') || name.includes('主角')) type = 'protagonist';
        else if (roleText.includes('反派') || roleText.includes('敌') || name.includes('血衣')) type = 'antagonist';
        else if (roleText.includes('导师') || roleText.includes('师') || name.includes('玄清')) type = 'mentor';
        else if (roleText.includes('伙伴') || roleText.includes('友') || name.includes('苏婉')) type = 'ally';

        if (name) {
          chars.push({ name, type, faction, description });
        }
      });

      // 如果解析不到角色，尝试用正则从文本中提取姓名
      if (chars.length === 0) { var namePattern = /(?:姓名[：:]?\s*|主角[：:]?\s*|角色[：:]?\s*)([^\n,，]{2,4})/g; var m; var names = new Set();
        while ((m = namePattern.exec(charsText)) !== null) {
          names.add(m[1].trim());
        }
        var idx = 0;
        names.forEach(function(name) { var types = ['protagonist','antagonist','mentor','ally'];
          chars.push({ name, type: types[idx] || 'other', faction: '', description: '' });
          idx++;
        });
      }

      return chars.length > 0 ? chars : null;
    } catch (e) {
      return null;
    }
  },

  // 辅助：根据题材和势力生成招式名
  _getSkillNames(genre, protagonistFaction, antagonistFaction) { var skillMap = {
      '玄幻': {
        '天玄宗': ['青云剑法', '天玄九变', '紫霄神雷', '太虚剑意'],
        '魔焰门': ['魔焰焚天', '血魔大法', '幽冥鬼爪', '炼狱魔功'],
        '万兽谷': ['万兽奔腾', '灵兽合体', '兽王咆哮', '百兽战体'],
        '天机阁': ['天机推演', '星辰变', '八卦阵', '遁甲术'],
        '血煞教': ['血煞神功', '噬血魔爪', '血祭大法', '万血归宗']
      },
      '仙侠': {
        '蜀山剑派': ['紫青双剑', '万剑归宗', '剑气纵横', '御剑术'],
        '幽冥魔宫': ['幽冥鬼道', '魔魂噬天', '九幽魔焰', '鬼哭神嚎'],
        '瑶池仙宫': ['瑶池仙法', '百花缭乱', '回春术', '仙音镇魔'],
        '龙宫': ['龙啸九天', '翻江倒海', '龙族战体', '海神三叉戟'],
        '万佛宗': ['金刚伏魔', '佛光普照', '大悲咒', '如来神掌']
      },
      '都市': {
        '龙组': ['龙拳', '异能爆发', '龙魂觉醒', '绝对领域'],
        '暗影议会': ['暗影步', '精神控制', '暗影吞噬', '虚空行走'],
        '林氏集团': ['科技武装', '基因强化', '机械飞升', '量子打击'],
        '天启学院': ['元素操控', '精神冲击', '空间跳跃', '时间暂停'],
        '血玫瑰': ['玫瑰荆棘', '魅惑之瞳', '血刃风暴', '幻影分身']
      },
      '武侠': {
        '少林寺': ['罗汉拳', '金刚不坏', '七十二绝技', '易筋经'],
        '武当派': ['太极拳', '太极剑', '梯云纵', '纯阳无极功'],
        '血刀门': ['血刀大法', '嗜血刀法', '魔刀斩', '血海无边'],
        '丐帮': ['打狗棒法', '降龙十八掌', '逍遥游', '擒龙功'],
        '锦衣卫': ['绣春刀法', '鹰爪功', '追踪术', '暗杀术']
      },
      '末世': {
        '曙光基地': ['军用格斗术', '枪械精通', '战术指挥', '生存本能'],
        '掠夺者军团': ['狂暴打击', '掠夺者之刃', '废墟生存', '狂暴化'],
        '净化者': ['病毒操控', '变异之躯', '感染爆发', '进化之力'],
        '科学家联盟': ['科技武器', '基因药剂', '能量护盾', '病毒解药'],
        '黑市商人': ['走私技巧', '情报网络', '黑市交易', '万能钥匙']
      },
      '历史': {
        '皇室': ['天子剑法', '皇权霸气', '御驾亲征', '龙威浩荡'],
        '世家联盟': ['世家秘传', '权谋之术', '门客战阵', '百年传承'],
        '边军': ['边军战阵', '铁血刀法', '骑射精通', '守城术'],
        '宦官集团': ['阴柔功', '暗器精通', '权术操控', '内廷秘法'],
        '义军': ['义军战吼', '平民战法', '游击战术', '民心所向']
      },
      '科幻': {
        '地球联邦': ['联邦战甲', '等离子武器', '星际战术', '量子通讯'],
        '自由军团': ['自由之刃', '游击战法', '改装武器', '黑客技术'],
        '企业联盟': ['企业安保', '专利武器', '商业间谍', '机械军团'],
        '外星议会': ['外星科技', '能量武器', '空间折叠', '心灵感应'],
        'AI觉醒者': ['数据入侵', '机械控制', '算法预测', '量子计算']
      }
    }; var genreSkills = skillMap[genre] || skillMap['玄幻']; var protagonistSkills = genreSkills[protagonistFaction] || ['绝技', '秘法', '神通', '功法']; var antagonistSkills = genreSkills[antagonistFaction] || ['邪术', '魔功', '鬼道', '妖法'];
    
    return [
      protagonistSkills[Math.floor(Math.random() * protagonistSkills.length)],
      antagonistSkills[Math.floor(Math.random() * antagonistSkills.length)]
    ];
  },

  // 生成对话场景
  generateDialogue(analysis, genre) { var chars = analysis.characters.length > 0 ? analysis.characters : ['他', '对方']; var mood = analysis.mood;
    
    // 提取世界观和角色数据
    var worldObj = analysis._worldObj; var charData = analysis._chars;
    
    // 获取具体角色信息
    var protagonist = charData ? charData.find(c => c.type === 'protagonist') : null; var antagonist = charData ? charData.find(c => c.type === 'antagonist') : null; var mentor = charData ? charData.find(c => c.type === 'mentor') : null; var ally = charData ? charData.find(c => c.type === 'ally') : null; var hiddenAntagonist = charData ? charData.find(c => c.type === 'hiddenAntagonist') : null; var factions = worldObj ? worldObj.factions : null; var regions = worldObj ? worldObj.regions : null; var result = '\n';
    
    // 如果有具体角色信息，生成基于世界观的对话
    if (protagonist && factions) { var protagonistFaction = factions.find(f => f.name === protagonist.faction) || factions[0]; var antagonistFaction = antagonist ? factions.find(f => f.name === antagonist.faction) || factions[1] : null; var allyFaction = ally ? factions.find(f => f.name === ally.faction) || factions[2] : null; var specificDialogues = {
        tense: {
          tone: '针锋相对',
          patterns: antagonist ? [
            `"${protagonist.name}，你确定要与我${antagonistFaction ? antagonistFaction.name : ''}为敌？"${antagonist.name}的声音冷得像冰。`,
            `"废话少说！"${protagonist.name}毫不退让，"今日之事，没有回旋的余地。"`,
            `${antagonist.name}冷笑一声："就凭你一个${protagonistFaction.name}的${protagonist.level || '弟子'}？未免太天真了。"`
          ] : [
            `"${protagonist.name}，你确定要与我为敌？"对方的声音冷得像冰。`,
            `"废话少说！"${protagonist.name}毫不退让，"今日之事，没有回旋的余地。"`,
            `对方冷笑一声："就凭你？未免太天真了。"`
          ]
        },
        calm: {
          tone: '心平气和',
          patterns: mentor ? [
            `"这件事，你怎么看？"${mentor.name}问道，语气平静。`,
            `${protagonist.name}沉吟片刻，缓缓开口："弟子觉得……"`,
            `"或许，我们可以换个角度思考。"${mentor.name}若有所思地说。`
          ] : ally ? [
            `"这件事，你怎么看？"${ally.name}问道，语气平静。`,
            `${protagonist.name}沉吟片刻，缓缓开口："我觉得……"`,
            `"或许，我们可以换个角度思考。"${ally.name}若有所思地说。`
          ] : [
            `"这件事，你怎么看？"${chars[0]}问道，语气平静。`,
            `${chars[1] || '对方'}沉吟片刻，缓缓开口："我觉得……"`,
            `"或许，我们可以换个角度思考。"${chars[0]}若有所思地说。`
          ]
        },
        sad: {
          tone: '伤感低沉',
          patterns: ally ? [
            `"对不起……"${protagonist.name}的声音有些沙哑，"我没能保护好${allyFaction ? allyFaction.name : ''}……"`,
            `${ally.name}摇了摇头，眼眶微红："这不怪你，${protagonist.name}。"`,
            `"如果当初我更强一些……"${protagonist.name}没有说完，只是深深地叹了口气。`
          ] : [
            `"对不起……"${protagonist.name}的声音有些沙哑，"我没能……"`,
            `对方摇了摇头，眼眶微红："这不怪你。"`,
            `"如果当初……"${protagonist.name}没有说完，只是深深地叹了口气。`
          ]
        },
        default: {
          tone: '正常交流',
          patterns: ally ? [
            `"你真的决定要这么做吗？"${ally.name}的声音中带着一丝担忧。`,
            `"我已经想清楚了。"${protagonist.name}坚定地说，"无论${antagonistFaction ? antagonistFaction.name : '前方'}有多少困难，我都不会退缩。"`,
            `"好吧，既然你已经决定了，那${ally.name}会支持你的。"${ally.name}叹了口气。`
          ] : mentor ? [
            `"你真的决定要这么做吗？"${mentor.name}的声音中带着一丝担忧。`,
            `"弟子已经想清楚了。"${protagonist.name}坚定地说，"无论前方有多少困难，我都不会退缩。"`,
            `"好吧，既然你已经决定了，那为师会支持你的。"${mentor.name}叹了口气。`
          ] : [
            `"你真的决定要这么做吗？"${chars[1] || '对方'}的声音中带着一丝担忧。`,
            `"我已经想清楚了。"${protagonist.name}坚定地说，"无论前方有多少困难，我都不会退缩。"`,
            `"好吧，既然你已经决定了，那我会支持你的。"${chars[1] || '对方'}叹了口气。`
          ]
        }
      }; var style = specificDialogues[mood] || specificDialogues.default;
      
      result += style.patterns.join('\n\n') + '\n\n';
      result += `${protagonist.name}点了点头，转身向着${regions ? regions[0].name : '远方'}走去，背影在夕阳下拉得很长。\n`;
    } else {
      // 回退到通用模板
      var dialogueStyles = {
        tense: {
          tone: '针锋相对',
          patterns: [
            `"${chars[0]}，你确定要与我为敌？"${chars[1] || '对方'}的声音冷得像冰。`,
            `"废话少说！"${chars[0]}毫不退让，"今日之事，没有回旋的余地。"`,
            `${chars[1] || '对方'}冷笑一声："就凭你？未免太天真了。"`
          ]
        },
        calm: {
          tone: '心平气和',
          patterns: [
            `"这件事，你怎么看？"${chars[0]}问道，语气平静。`,
            `${chars[1] || '对方'}沉吟片刻，缓缓开口："我觉得……"`,
            `"或许，我们可以换个角度思考。"${chars[0]}若有所思地说。`
          ]
        },
        sad: {
          tone: '伤感低沉',
          patterns: [
            `"对不起……"${chars[0]}的声音有些沙哑，"我没能……"`,
            `${chars[1] || '对方'}摇了摇头，眼眶微红："这不怪你。"`,
            `"如果当初……"${chars[0]}没有说完，只是深深地叹了口气。`
          ]
        },
        default: {
          tone: '正常交流',
          patterns: [
            `"你真的决定要这么做吗？"${chars[1] || '对方'}的声音中带着一丝担忧。`,
            `"我已经想清楚了。"${chars[0]}坚定地说，"无论前方有多少困难，我都不会退缩。"`,
            `"好吧，既然你已经决定了，那我会支持你的。"${chars[1] || '对方'}叹了口气。`
          ]
        }
      }; var style = dialogueStyles[mood] || dialogueStyles.default;
      
      result += style.patterns.join('\n\n') + '\n\n';
      result += `${chars[0]}点了点头，转身向着未知的方向走去，背影在夕阳下拉得很长。\n`;
    }
    
    return result;
  },

  // 生成修炼场景
  generateCultivation(analysis, genre) { var style = GENRE_STYLES[genre] || GENRE_STYLES['玄幻']; var transitions = style.transitions;
    
    // 提取世界观和角色数据
    var worldObj = analysis._worldObj; var charData = analysis._chars;
    
    // 获取具体角色和力量体系信息
    var protagonist = charData ? charData.find(c => c.type === 'protagonist') : null; var mentor = charData ? charData.find(c => c.type === 'mentor') : null; var powerSystem = worldObj ? worldObj.powerSystem : null; var regions = worldObj ? worldObj.regions : null; var factions = worldObj ? worldObj.factions : null; var result = '\n';
    
    // 如果有具体角色和力量体系信息，生成基于世界观的修炼场景
    if (protagonist && powerSystem && powerSystem.levels) { var currentLevel = powerSystem.levels.find(l => l.name === protagonist.level) || powerSystem.levels[0]; var nextLevel = powerSystem.levels[powerSystem.levels.indexOf(currentLevel) + 1] || currentLevel; var region = regions ? regions[0] : null; var faction = factions ? factions.find(f => f.name === protagonist.faction) || factions[0] : null; var specificStages = [
        {
          phase: '入定',
          desc: `${protagonist.name}盘膝坐在${region ? region.name : '静室'}中，双目微闭，开始运转${faction ? faction.name : ''}的${powerSystem.name}。`
        },
        {
          phase: '引气',
          desc: `天地间的${genre === '都市' ? '异能' : genre === '科幻' ? '能量' : '灵气'}缓缓汇聚，如同涓涓细流般涌入${protagonist.name}的体内。`
        },
        {
          phase: '运转',
          desc: `${powerSystem.name}在${protagonist.name}的经脉中流转，每运转一个周天，${currentLevel.name}的气息便强盛一分。`
        },
        {
          phase: '突破',
          desc: `终于，在某一个瞬间，${protagonist.name}感觉到${currentLevel.name}的某个桎梏被打破了——`
        }
      ];
      
      specificStages.forEach(function(stage, i) {
        result += `${stage.desc}\n\n`;
        if (i === 1) {
          result += `起初，${powerSystem.name}的流动还很缓慢，但随着功法运转的深入，越来越多的${genre === '都市' ? '异能' : genre === '科幻' ? '能量' : '灵气'}被吸引过来。${protagonist.name}感觉自己的经脉在${powerSystem.name}的冲刷下逐渐扩张，能够容纳更多的力量。\n\n`;
        }
        if (i === 2) {
          result += `时间一分一秒地过去，${protagonist.name}的${currentLevel.name}气息越来越强大。周围的${genre === '都市' ? '异能' : genre === '科幻' ? '能量' : '灵气'}几乎被${protagonist.name}抽空，形成了一个巨大的漩涡。\n\n`;
        }
      });
      
      result += `突破！${protagonist.name}成功突破${currentLevel.name}，踏入${nextLevel.name}！\n\n`;
      result += `一股${style.powerWords[Math.floor(Math.random() * style.powerWords.length)]}的气势从${protagonist.name}身上爆发出来，${region ? region.name : '周围'}的空气都为之震动。${protagonist.name}睁开眼睛，眼中闪过一道精光。\n`;
      
      if (mentor) {
        result += `\n${mentor.name}感受到${region ? region.name : '远处'}的动静，欣慰地点了点头："好！好！终于突破了${nextLevel.name}，不枉我${faction ? faction.name : ''}多年的教导。"\n`;
      }
    } else {
      // 回退到通用模板
      var cultivationStages = [
        {
          phase: '入定',
          desc: '他盘膝而坐，双目微闭，开始运转功法。'
        },
        {
          phase: '引气',
          desc: '天地间的灵气缓缓汇聚，如同涓涓细流般涌入他的体内。'
        },
        {
          phase: '运转',
          desc: '灵气在经脉中流转，每运转一个周天，气息便强盛一分。'
        },
        {
          phase: '突破',
          desc: '终于，在某一个瞬间，他感觉到体内的某个桎梏被打破了——'
        }
      ];
      
      cultivationStages.forEach(function(stage, i) {
        result += `${stage.desc}\n\n`;
        if (i === 1) {
          result += '起初，灵气的流动还很缓慢，但随着功法运转的深入，越来越多的灵气被吸引过来。他感觉自己的经脉在灵气的冲刷下逐渐扩张，能够容纳更多的力量。\n\n';
        }
        if (i === 2) {
          result += '时间一分一秒地过去，他的气息越来越强大。周围的灵气几乎被他抽空，形成了一个巨大的漩涡。\n\n';
        }
      });
      
      result += '突破！\n\n';
      result += `一股${style.powerWords[Math.floor(Math.random() * style.powerWords.length)]}的气势从他身上爆发出来，周围的空气都为之震动。他睁开眼睛，眼中闪过一道精光。\n`;
    }
    
    return result;
  },

  // 生成情感场景
  generateEmotion(analysis, genre) { var mood = analysis.mood;
    
    // 提取世界观和角色数据
    var worldObj = analysis._worldObj; var charData = analysis._chars;
    
    // 获取具体角色信息
    var protagonist = charData ? charData.find(c => c.type === 'protagonist') : null; var antagonist = charData ? charData.find(c => c.type === 'antagonist') : null; var mentor = charData ? charData.find(c => c.type === 'mentor') : null; var ally = charData ? charData.find(c => c.type === 'ally') : null; var hiddenAntagonist = charData ? charData.find(c => c.type === 'hiddenAntagonist') : null; var regions = worldObj ? worldObj.regions : null; var factions = worldObj ? worldObj.factions : null; var result = '\n';
    
    // 如果有具体角色信息，生成基于世界观的情感场景
    if (protagonist && ally) { var region = regions ? regions[0] : null; var protagonistFaction = factions ? factions.find(f => f.name === protagonist.faction) || factions[0] : null; var allyFaction = factions ? factions.find(f => f.name === ally.faction) || factions[1] : null; var specificEmotionScenes = {
        sad: {
          desc: `${protagonist.name}与${ally.name}相对而立，谁也没有说话。${region ? region.name : ''}的空气中弥漫着一种难以言喻的沉重。`,
          dialogue: [
            `"谢谢你，"${ally.name}终于开口，声音有些哽咽，"如果没有你，我不知道自己能不能撑到现在。"`,
            `${protagonist.name}微微一笑，伸手轻轻擦去${ally.name}眼角的泪水："傻瓜，我们不是说好了要一起面对的吗？"`,
            `${ally.name}破涕为笑，靠在${protagonist.name}的肩膀上。这一刻，所有的困难和危险似乎都变得不那么重要了。`
          ]
        },
        happy: {
          desc: `${region ? region.name : ''}阳光正好，微风不燥。${protagonist.name}与${ally.name}并肩走在小路上，心情前所未有的轻松。`,
          dialogue: [
            `"没想到真的成功了！"${ally.name}兴奋地跳了起来，眼中闪烁着喜悦的光芒。`,
            `${protagonist.name}看着${ally.name}开心的样子，嘴角也不自觉地上扬："我说过，一定可以的。"`,
            `"走吧，"${ally.name}拉起${protagonist.name}的手，"去${protagonistFaction ? protagonistFaction.name : '宗门'}庆祝一下！"`
          ]
        },
        tense: {
          desc: `${protagonist.name}与${ally.name}之间的距离很近，却仿佛隔着千山万水。`,
          dialogue: [
            `"你……"${ally.name}欲言又止，眼中闪过复杂的情绪。`,
            `${protagonist.name}深吸一口气，终于说出了那句藏在心底已久的话："${ally.name}，我喜欢你。"`,
            `${ally.name}愣住了，随即低下头，耳根微微泛红。`
          ]
        },
        default: {
          desc: `${protagonist.name}与${ally.name}相对而立，谁也没有说话。但彼此的眼神中已经包含了千言万语。`,
          dialogue: [
            `"谢谢你，"${ally.name}终于开口，声音有些哽咽，"如果没有你，我不知道自己能不能撑到现在。"`,
            `${protagonist.name}微微一笑，伸手轻轻擦去${ally.name}眼角的泪水："傻瓜，我们不是说好了要一起面对的吗？"`,
            `${ally.name}破涕为笑，靠在${protagonist.name}的肩膀上。这一刻，所有的困难和危险似乎都变得不那么重要了。`
          ]
        }
      }; var scene = specificEmotionScenes[mood] || specificEmotionScenes.default;
      
      result += scene.desc + '\n\n';
      result += scene.dialogue.join('\n\n') + '\n';
    } else if (protagonist && mentor) {
      // 主角与导师的情感场景
      var region = regions ? regions[0] : null; var faction = factions ? factions.find(f => f.name === protagonist.faction) || factions[0] : null; var mentorEmotionScenes = {
        sad: {
          desc: `${protagonist.name}跪在${mentor.name}面前，${region ? region.name : ''}的空气中弥漫着离别的伤感。`,
          dialogue: [
            `"师父，弟子不孝……"${protagonist.name}的声音有些沙哑。`,
            `${mentor.name}摇了摇头，眼中满是不舍："去吧，${faction ? faction.name : ''}的未来就靠你了。"`,
            `${protagonist.name}重重地磕了三个头，泪水模糊了双眼。`
          ]
        },
        happy: {
          desc: `${mentor.name}看着${protagonist.name}，眼中满是欣慰。`,
          dialogue: [
            `"好！好！"${mentor.name}连声赞叹，"你终于领悟了${faction ? faction.name : ''}的真谛。"`,
            `${protagonist.name}恭敬地说道："都是师父教导有方。"`,
            `${mentor.name}拍了拍${protagonist.name}的肩膀："从今天起，你可以独当一面了。"`
          ]
        },
        default: {
          desc: `${protagonist.name}与${mentor.name}相对而立，师徒之间的情谊无需多言。`,
          dialogue: [
            `"师父，弟子有一事不明……"${protagonist.name}恭敬地问道。`,
            `${mentor.name}沉吟片刻，缓缓开口："修行之路，贵在坚持。"`,
            `${protagonist.name}若有所悟，深深地鞠了一躬："弟子明白了。"`
          ]
        }
      }; var scene = mentorEmotionScenes[mood] || mentorEmotionScenes.default;
      
      result += scene.desc + '\n\n';
      result += scene.dialogue.join('\n\n') + '\n';
    } else {
      // 回退到通用模板
      var emotionScenes = {
        sad: {
          desc: '两人相对而立，谁也没有说话。空气中弥漫着一种难以言喻的沉重。',
          dialogue: [
            '"谢谢你，"她终于开口，声音有些哽咽，"如果没有你，我不知道自己能不能撑到现在。"',
            '他微微一笑，伸手轻轻擦去她眼角的泪水："傻瓜，我们不是说好了要一起面对的吗？"',
            '她破涕为笑，靠在他的肩膀上。这一刻，所有的困难和危险似乎都变得不那么重要了。'
          ]
        },
        happy: {
          desc: '阳光正好，微风不燥。两人并肩走在小路上，心情前所未有的轻松。',
          dialogue: [
            '"没想到真的成功了！"她兴奋地跳了起来，眼中闪烁着喜悦的光芒。',
            '他看着她开心的样子，嘴角也不自觉地上扬："我说过，一定可以的。"',
            '"走吧，"她拉起他的手，"去庆祝一下！"'
          ]
        },
        tense: {
          desc: '两人之间的距离很近，却仿佛隔着千山万水。',
          dialogue: [
            '"你……"她欲言又止，眼中闪过复杂的情绪。',
            '他深吸一口气，终于说出了那句藏在心底已久的话："我喜欢你。"',
            '她愣住了，随即低下头，耳根微微泛红。'
          ]
        },
        default: {
          desc: '两人相对而立，谁也没有说话。但彼此的眼神中已经包含了千言万语。',
          dialogue: [
            '"谢谢你，"她终于开口，声音有些哽咽，"如果没有你，我不知道自己能不能撑到现在。"',
            '他微微一笑，伸手轻轻擦去她眼角的泪水："傻瓜，我们不是说好了要一起面对的吗？"',
            '她破涕为笑，靠在他的肩膀上。这一刻，所有的困难和危险似乎都变得不那么重要了。'
          ]
        }
      }; var scene = emotionScenes[mood] || emotionScenes.default;
      
      result += scene.desc + '\n\n';
      result += scene.dialogue.join('\n\n') + '\n';
    }
    
    return result;
  },

  // 生成心理描写
  generatePsychology(analysis, genre) { var mood = analysis.mood; var chars = analysis.characters; var mainChar = chars.length > 0 ? chars[0] : '他';
    
    // 提取世界观和角色数据
    var worldObj = analysis._worldObj; var charData = analysis._chars;
    
    // 获取具体角色信息
    var protagonist = charData ? charData.find(c => c.type === 'protagonist') : null; var antagonist = charData ? charData.find(c => c.type === 'antagonist') : null; var mentor = charData ? charData.find(c => c.type === 'mentor') : null; var ally = charData ? charData.find(c => c.type === 'ally') : null; var hiddenAntagonist = charData ? charData.find(c => c.type === 'hiddenAntagonist') : null; var factions = worldObj ? worldObj.factions : null; var regions = worldObj ? worldObj.regions : null; var powerSystem = worldObj ? worldObj.powerSystem : null; var result = '\n';
    
    // 如果有具体角色信息，生成基于世界观的心理描写
    if (protagonist) { var faction = factions ? factions.find(f => f.name === protagonist.faction) || factions[0] : null; var region = regions ? regions[0] : null; var specificPsychPatterns = {
        tense: [
          `${protagonist.name}的心跳不由自主地加快。他知道，接下来的每一个决定都可能改变${faction ? faction.name : ''}的命运。`,
          `脑海中闪过无数个念头，却又一一被否定。${antagonist ? antagonist.name : '敌人'}不会给他太多时间，必须尽快做出选择。`,
          `一种前所未有的压力笼罩着${protagonist.name}。这不是怕死，而是怕辜负了${mentor ? mentor.name : '师父'}和${faction ? faction.name : ''}那些信任他的人。`
        ],
        calm: [
          `${protagonist.name}闭上眼睛，让自己的思绪慢慢沉淀。越是关键的时刻，越要保持冷静。`,
          `${protagonist.name}回想起${mentor ? mentor.name : '师父'}曾经说过的话："心静则明，水止则清。"`,
          `所有的杂念都被抛诸脑后，此刻，${protagonist.name}的心中只有一个念头——守护${faction ? faction.name : ''}。`
        ],
        excited: [
          `${protagonist.name}感到一股热血在胸中沸腾。这种${powerSystem ? powerSystem.name : ''}突破的感觉，他已经很久没有体验过了。`,
          `机会！${protagonist.name}的眼睛亮了起来。如果能抓住这次机会，${ally ? ally.name : ''}和${faction ? faction.name : ''}都将不同。`,
          `兴奋之余，${protagonist.name}也没有忘记保持警惕。机遇往往伴随着风险，${hiddenAntagonist ? hiddenAntagonist.name : '幕后黑手'}或许正在暗中窥视。`
        ],
        sad: [
          `${protagonist.name}望着${region ? region.name : '远方'}，眼神有些空洞。那些美好的回忆，如今只剩下无尽的惆怅。`,
          `如果当初没有那样选择，${faction ? faction.name : ''}现在会不会是另一番景象？可惜，世上没有如果。`,
          `${protagonist.name}深深地叹了口气，将所有的情绪都埋藏在心底。有些痛，只能一个人承受。`
        ],
        default: [
          `${protagonist.name}陷入了沉思。这件事比他想象的还要复杂。`,
          `各种可能性在${protagonist.name}的脑海中交织，他需要理出一条清晰的思路。`,
          `无论如何，${protagonist.name}都已经做好了准备。接下来，就看命运的安排了。`
        ]
      }; var patterns = specificPsychPatterns[mood] || specificPsychPatterns.default;
      
      result += patterns.join('\n\n') + '\n';
    } else {
      // 回退到通用模板
      var psychPatterns = {
        tense: [
          `${mainChar}的心跳不由自主地加快。他知道，接下来的每一个决定都可能改变一切。`,
          `脑海中闪过无数个念头，却又一一被否定。时间不等人，必须尽快做出选择。`,
          `一种前所未有的压力笼罩着他。这不是怕死，而是怕辜负了那些信任他的人。`
        ],
        calm: [
          `${mainChar}闭上眼睛，让自己的思绪慢慢沉淀。越是关键的时刻，越要保持冷静。`,
          `他回想起师父曾经说过的话："心静则明，水止则清。"`,
          `所有的杂念都被抛诸脑后，此刻，他的心中只有一个念头。`
        ],
        excited: [
          `${mainChar}感到一股热血在胸中沸腾。这种感觉，他已经很久没有体验过了。`,
          `机会！他的眼睛亮了起来。如果能抓住这次机会，一切都将不同。`,
          `兴奋之余，他也没有忘记保持警惕。机遇往往伴随着风险。`
        ],
        sad: [
          `${mainChar}望着远方，眼神有些空洞。那些美好的回忆，如今只剩下无尽的惆怅。`,
          `如果当初没有那样选择，现在会不会是另一番景象？可惜，世上没有如果。`,
          `他深深地叹了口气，将所有的情绪都埋藏在心底。有些痛，只能一个人承受。`
        ],
        default: [
          `${mainChar}陷入了沉思。这件事比他想象的还要复杂。`,
          `各种可能性在脑海中交织，他需要理出一条清晰的思路。`,
          `无论如何，他都已经做好了准备。接下来，就看命运的安排了。`
        ]
      }; var patterns = psychPatterns[mood] || psychPatterns.default;
      
      result += patterns.join('\n\n') + '\n';
    }
    
    return result;
  },

  // 生成环境描写
  generateEnvironment(analysis, genre) { var style = GENRE_STYLES[genre] || GENRE_STYLES['玄幻']; var settings = analysis.setting.length > 0 ? analysis.setting : ['此处']; var mood = analysis.mood;
    
    // 提取世界观和角色数据
    var worldObj = analysis._worldObj; var charData = analysis._chars;
    
    // 获取具体地域信息
    var regions = worldObj ? worldObj.regions : null; var factions = worldObj ? worldObj.factions : null; var protagonist = charData ? charData.find(c => c.type === 'protagonist') : null; var result = '\n';
    
    // 如果有具体地域信息，生成基于世界观的环境描写
    if (regions && regions.length > 0) { var region = regions[0]; var faction = factions ? factions.find(f => f.name === (protagonist ? protagonist.faction : '')) || factions[0] : null; var specificEnvTemplates = {
        tense: {
          sky: `${region.name}的天空阴沉，乌云密布，仿佛随时都会压下来。`,
          wind: `${region.name}狂风呼啸，卷起漫天尘土，让人睁不开眼。`,
          sound: `远处传来阵阵雷鸣，像是某种巨兽的低吼，在${region.name}的山谷间回荡。`,
          detail: `${region.name}${region.desc ? '——' + region.desc + '——此刻' : '此刻'}显得格外阴森，危机四伏。`
        },
        calm: {
          sky: `${region.name}的天空湛蓝，几朵白云悠闲地飘过。`,
          wind: `${region.name}微风轻拂，带来阵阵花香，让人心旷神怡。`,
          sound: `远处传来鸟鸣声，清脆悦耳，为${region.name}增添了几分生机。`,
          detail: `${region.name}${region.desc ? '——' + region.desc + '——此刻' : '此刻'}宁静祥和，仿佛世外桃源。`
        },
        sad: {
          sky: `${region.name}夕阳西下，天边染上了一层血色。`,
          wind: `${region.name}秋风萧瑟，卷起满地落叶，发出沙沙的声响。`,
          sound: `远处传来几声乌鸦的叫声，在${region.name}的上空回荡，更添几分凄凉。`,
          detail: `${region.name}${region.desc ? '——' + region.desc + '——此刻' : '此刻'}笼罩在一片萧瑟之中。`
        },
        exciting: {
          sky: `${region.name}霞光万丈，将整个天空染成了金色。`,
          wind: `${region.name}狂风大作，却吹不散人们心中的热情。`,
          sound: `${faction ? faction.name : ''}的欢呼声此起彼伏，响彻${region.name}云霄。`,
          detail: `${region.name}${region.desc ? '——' + region.desc + '——此刻' : '此刻'}沐浴在金色的光芒中，壮观无比。`
        },
        default: {
          sky: `${region.name}天色渐暗，夜幕即将降临。`,
          wind: `${region.name}微风拂过，带来一丝凉意。`,
          sound: `${region.name}四周一片寂静，只有风吹过树叶的沙沙声。`,
          detail: `${region.name}${region.desc ? '——' + region.desc + '——此刻' : '此刻'}静谧安详。`
        }
      }; var env = specificEnvTemplates[mood] || specificEnvTemplates.default;
      
      result += env.sky + '\n\n';
      result += env.detail + '\n';
      result += env.wind + '\n\n';
      result += env.sound + '\n';
    } else {
      // 回退到通用模板
      var envTemplates = {
        tense: {
          sky: '天空阴沉，乌云密布，仿佛随时都会压下来。',
          wind: '狂风呼啸，卷起漫天尘土，让人睁不开眼。',
          sound: '远处传来阵阵雷鸣，像是某种巨兽的低吼。'
        },
        calm: {
          sky: '天空湛蓝，几朵白云悠闲地飘过。',
          wind: '微风轻拂，带来阵阵花香，让人心旷神怡。',
          sound: '远处传来鸟鸣声，清脆悦耳。'
        },
        sad: {
          sky: '夕阳西下，天边染上了一层血色。',
          wind: '秋风萧瑟，卷起满地落叶，发出沙沙的声响。',
          sound: '远处传来几声乌鸦的叫声，更添几分凄凉。'
        },
        exciting: {
          sky: '霞光万丈，将整个天空染成了金色。',
          wind: '狂风大作，却吹不散人们心中的热情。',
          sound: '欢呼声此起彼伏，响彻云霄。'
        },
        default: {
          sky: '天色渐暗，夜幕即将降临。',
          wind: '微风拂过，带来一丝凉意。',
          sound: '四周一片寂静，只有风吹过树叶的沙沙声。'
        }
      }; var env = envTemplates[mood] || envTemplates.default;
      
      result += env.sky + '\n\n';
      result += `${settings[0]}在暮色中显得格外${mood === 'tense' ? '阴森' : mood === 'calm' ? '宁静' : mood === 'sad' ? '萧瑟' : '壮观'}。${env.wind}\n\n`;
      result += `${env.sound}\n`;
    }
    
    return result;
  },

  // 生成转场过渡
  generateTransition(analysis, genre) { var style = GENRE_STYLES[genre] || GENRE_STYLES['玄幻']; var transitions = style.transitions;
    
    // 提取世界观和角色数据
    var worldObj = analysis._worldObj; var charData = analysis._chars;
    
    // 获取具体地域和势力信息
    var regions = worldObj ? worldObj.regions : null; var factions = worldObj ? worldObj.factions : null; var protagonist = charData ? charData.find(c => c.type === 'protagonist') : null; var antagonist = charData ? charData.find(c => c.type === 'antagonist') : null; var hiddenAntagonist = charData ? charData.find(c => c.type === 'hiddenAntagonist') : null; var result = '\n';
    
    // 如果有具体地域和势力信息，生成基于世界观的转场
    if (regions && regions.length > 0 && factions && factions.length > 0) { var region1 = regions[0]; var region2 = regions.length > 1 ? regions[1] : regions[0]; var faction1 = factions.find(f => protagonist && f.name === protagonist.faction) || factions[0]; var faction2 = factions.find(f => antagonist && f.name === antagonist.faction) || (factions.length > 1 ? factions[1] : factions[0]); var hiddenFaction = hiddenAntagonist ? factions.find(f => f.name === hiddenAntagonist.faction) || (factions.length > 2 ? factions[2] : factions[0]) : null; var specificTransitionTemplates = [
        `${transitions[Math.floor(Math.random() * transitions.length)]}，${protagonist ? protagonist.name : '主角'}离开了${region1.name}，前往${region2.name}。`,
        `时间如白驹过隙，转眼已是数日之后。${region2.name}的${faction2.name}据点中，${antagonist ? antagonist.name : '反派'}正在密谋。`,
        `另一边，${region2.name}的${faction2.name}总部，截然不同的故事正在上演。`,
        `与此同时，千里之外的${region2.name}。${hiddenFaction ? hiddenFaction.name : ''}的阴谋正在暗中推进。`,
        `画面一转，来到了${region2.name}。${region2.desc ? '这里' + region2.desc + '。' : ''}`,
        `${transitions[Math.floor(Math.random() * transitions.length)]}，${faction1.name}与${faction2.name}的冲突从${region1.name}蔓延到了${region2.name}。`,
        `数日之后，${region2.name}。${antagonist ? antagonist.name : '反派'}收到了来自${faction2.name}的紧急密令。`
      ];
      
      result += specificTransitionTemplates[Math.floor(Math.random() * specificTransitionTemplates.length)] + '\n\n';
      result += `${region2.name}的景象与${region1.name}截然不同。${region2.desc ? region2.desc + '，' : ''}这里将是下一场风波的起点。\n`;
    } else {
      // 回退到通用模板
      var transitionTemplates = [
        `${transitions[Math.floor(Math.random() * transitions.length)]}，场景转换。`,
        '时间如白驹过隙，转眼已是数日之后。',
        '另一边，截然不同的故事正在上演。',
        '与此同时，千里之外的某处。',
        '画面一转，来到了另一个地方。'
      ];
      
      result += transitionTemplates[Math.floor(Math.random() * transitionTemplates.length)] + '\n\n';
      result += '（此处可插入新场景的环境描写和人物登场）\n';
    }
    
    return result;
  },

  // 生成群像场景
  generateGroupScene(analysis, genre) { var chars = analysis.characters.length > 0 ? analysis.characters : ['甲', '乙', '丙']; var mood = analysis.mood;
    
    // 提取世界观和角色数据
    var worldObj = analysis._worldObj; var charData = analysis._chars;
    
    // 获取具体角色信息
    var protagonist = charData ? charData.find(c => c.type === 'protagonist') : null; var antagonist = charData ? charData.find(c => c.type === 'antagonist') : null; var mentor = charData ? charData.find(c => c.type === 'mentor') : null; var ally = charData ? charData.find(c => c.type === 'ally') : null; var hiddenAntagonist = charData ? charData.find(c => c.type === 'hiddenAntagonist') : null; var factions = worldObj ? worldObj.factions : null; var regions = worldObj ? worldObj.regions : null; var result = '\n';
    
    // 如果有具体角色信息，生成基于世界观的群像场景
    if (protagonist && factions && factions.length > 0) { var faction = factions.find(f => f.name === protagonist.faction) || factions[0]; var region = regions ? regions[0] : null;
      
      // 构建角色列表
      var specificChars = [];
      if (protagonist) specificChars.push(protagonist.name);
      if (ally) specificChars.push(ally.name);
      if (mentor) specificChars.push(mentor.name);
      if (antagonist) specificChars.push(antagonist.name);
      if (hiddenAntagonist) specificChars.push(hiddenAntagonist.name); var specificGroupPatterns = {
        tense: [
          `${faction.name}众人屏息凝神，气氛凝重得几乎让人窒息。`,
          `没有人说话，但${protagonist.name}、${ally ? ally.name : ''}和${mentor ? mentor.name : ''}的眼神都在传递着不同的信息。`,
          `一场无声的较量，正在${faction.name}众人之间悄然展开。`
        ],
        calm: [
          `${faction.name}众人围坐在${region ? region.name : '大殿'}中，气氛融洽。`,
          `三三两两的交谈声此起彼伏，${protagonist.name}和${ally ? ally.name : ''}不时传来阵阵笑声。`,
          `${mentor ? mentor.name : '长老'}在做着自己的事情，${protagonist.name}却出奇地和谐。`
        ],
        exciting: [
          `${faction.name}人群中爆发出一阵欢呼，气氛热烈到了极点。`,
          `${faction.name}众人议论纷纷，${protagonist.name}和${ally ? ally.name : ''}的脸上都洋溢着兴奋的神色。`,
          `这一刻，${faction.name}所有人的目光都聚焦在了${protagonist.name}身上。`
        ],
        default: [
          `${faction.name}众人各怀心思，却都没有表现出来。`,
          `${region ? region.name : ''}场面看似平静，实则暗流涌动。`,
          `${protagonist.name}、${ally ? ally.name : ''}和${antagonist ? antagonist.name : ''}的表情都不尽相同，却都隐藏着各自的秘密。`
        ]
      }; var patterns = specificGroupPatterns[mood] || specificGroupPatterns.default;
      
      result += patterns.join('\n\n') + '\n\n';
      
      if (specificChars.length >= 2) {
        result += `${specificChars[0]}和${specificChars[1]}交换了一个眼神，彼此都明白了对方的意思。\n`;
      }
      
      if (antagonist && hiddenAntagonist) {
        result += `\n而在众人看不见的地方，${hiddenAntagonist.name}正冷冷地注视着这一切。\n`;
      }
    } else {
      // 回退到通用模板
      var groupPatterns = {
        tense: [
          '众人屏息凝神，气氛凝重得几乎让人窒息。',
          '没有人说话，但每个人的眼神都在传递着不同的信息。',
          '一场无声的较量，正在这些人之间悄然展开。'
        ],
        calm: [
          '众人围坐在一起，气氛融洽。',
          '三三两两的交谈声此起彼伏，不时传来阵阵笑声。',
          '每个人都在做着自己的事情，却出奇地和谐。'
        ],
        exciting: [
          '人群中爆发出一阵欢呼，气氛热烈到了极点。',
          '众人议论纷纷，每个人的脸上都洋溢着兴奋的神色。',
          '这一刻，所有人的目光都聚焦在了同一个方向。'
        ],
        default: [
          '众人各怀心思，却都没有表现出来。',
          '场面看似平静，实则暗流涌动。',
          '每个人的表情都不尽相同，却都隐藏着各自的秘密。'
        ]
      }; var patterns = groupPatterns[mood] || groupPatterns.default;
      
      result += patterns.join('\n\n') + '\n\n';
      
      if (chars.length >= 2) {
        result += `${chars[0]}和${chars[1]}交换了一个眼神，彼此都明白了对方的意思。\n`;
      }
    }
    
    return result;
  },

  // 通用续写
  generateGeneral(analysis, genre) { var style = GENRE_STYLES[genre] || GENRE_STYLES['玄幻']; var mood = analysis.mood; var transitions = style.transitions;
    
    // 提取世界观和角色数据
    var worldObj = analysis._worldObj; var charData = analysis._chars;
    
    // 获取具体角色和势力信息
    var protagonist = charData ? charData.find(c => c.type === 'protagonist') : null; var antagonist = charData ? charData.find(c => c.type === 'antagonist') : null; var mentor = charData ? charData.find(c => c.type === 'mentor') : null; var ally = charData ? charData.find(c => c.type === 'ally') : null; var hiddenAntagonist = charData ? charData.find(c => c.type === 'hiddenAntagonist') : null; var factions = worldObj ? worldObj.factions : null; var regions = worldObj ? worldObj.regions : null; var powerSystem = worldObj ? worldObj.powerSystem : null; var result = '\n';
    
    // 根据题材生成不同的续写内容
    var genreContent = this._getGenreSpecificContent(genre, protagonist, antagonist, mentor, ally, hiddenAntagonist, factions, regions, powerSystem, mood, transitions);
    
    result += genreContent + '\n';
    
    return result;
  },

  // 根据题材生成具体的续写内容
  _getGenreSpecificContent(genre, protagonist, antagonist, mentor, ally, hiddenAntagonist, factions, regions, powerSystem, mood, transitions) { var pName = protagonist ? protagonist.name : '他'; var aName = antagonist ? antagonist.name : '对手'; var mName = mentor ? mentor.name : '长者'; var allyName = ally ? ally.name : '同伴'; var pFaction = protagonist ? (factions ? (factions.find(f => f.name === protagonist.faction) || factions[0]).name : '') : ''; var aFaction = antagonist ? (factions ? (factions.find(f => f.name === antagonist.faction) || factions[1] || {}).name : '') : ''; var region = regions && regions.length > 0 ? regions[0].name : '此地'; var region2 = regions && regions.length > 1 ? regions[1].name : '远方'; var trans = transitions[Math.floor(Math.random() * transitions.length)];
    
    // 历史题材专用模板
    if (genre === '历史') { var historyTemplates = {
        tense: [
          `${region}城头，烽烟四起。探马来报：${aFaction || '敌军'}已兵临城下，${pName}面色凝重，手中密信已被攥出了褶皱。\n\n${trans}，${pName}召集众将商议对策。帐中沉默良久，${mName}捋须道："敌众我寡，唯有出奇制胜。"\n\n${pName}目光一闪，心中已有了计较。他转身对${allyName}道："传令下去，今夜三更，按计划行事。"`,
          `消息传到${pFaction || pName}大营时，${pName}正在灯下研读地图。${aFaction || '敌军'}的突然异动，打乱了原有的部署。\n\n${trans}，${pName}放下手中的笔，沉声道："既然他们要打，那就奉陪到底。传令三军，严阵以待。"\n\n帐外夜风凛冽，战鼓声隐隐传来。${allyName}快步入帐，抱拳道："主公，前方发现敌军斥候。"`,
          `${region}朝堂之上，气氛凝重到了极点。${aFaction || '权臣'}的一纸奏章，掀起了轩然大波。\n\n${trans}，${pName}立于殿中，面对群臣的质疑，朗声道："天下大势，合久必分，分久必合。今日之危，正是我等建功立业之时！"\n\n${mName}在旁微微点头，眼中闪过一丝赞许。`
        ],
        calm: [
          `${region}的清晨，薄雾笼罩着连营。${pName}独立于高处，远眺山河。\n\n自从${aFaction || '那场战役'}之后，天下暂时太平。但${pName}深知，这不过是暴风雨前的宁静。\n\n${mName}缓步走来，递上一碗热茶："主公，不可操劳过度。"\n\n${pName}接过茶碗，轻抿一口，目光望向远方："先生，你觉得这天下，最终会落入谁手？"\n\n${mName}捋须微笑，意味深长地看着${pName}，并不作答。`,
          `春日的${region}，桃花灼灼，柳絮纷飞。${pName}难得有片刻闲暇，与${allyName}在营中漫步。\n\n"主公，你看这桃花，像不像当年我们在${region2}时的光景？"${allyName}感慨道。\n\n${pName}微微一怔，随即笑道："那时我们不过是一介布衣，谁能想到有今日？"\n\n远处传来操练的号角声，${pName}收起笑容，目光重新变得锐利。`
        ],
        exciting: [
          `大捷！${pFaction || '我军'}大获全胜！\n\n${region}城门前，将士们凯旋而归，百姓夹道相迎。${pName}骑在马上，铠甲上还沾着干涸的血迹，但眼中满是豪情。\n\n${allyName}策马上前，抱拳道："主公神机妙算，${aFaction || '敌军'}溃不成军！生擒敌将十七人！"\n\n${pName}勒马驻足，环顾四周，朗声道："此战虽胜，但天下未定。诸位将士，不可懈怠！"\n\n三军齐声应诺，声震云霄。`,
          `${pName}站在${region}的城楼上，望着远方滚滚而来的援军，嘴角终于露出了一丝笑意。\n\n"来了。"${pName}低声道。\n\n${mName}在旁捋须道："天助主公，此战必胜。"\n\n${trans}，城门大开，${pName}身先士卒，率军冲出。战鼓齐鸣，喊杀声震天！这一战，将决定${region}的命运，也将决定天下的走向。`
        ],
        sad: [
          `${region}城外，残阳如血。战场上横七竖八地倒着无数尸体，空气中弥漫着血腥和硝烟的味道。\n\n${pName}跪在一座新坟前，久久不语。${allyName}就埋葬在这里，为了掩护${pName}撤退，他选择了留下。\n\n${mName}站在身后，长叹一声："战争，从来都是如此残酷。"\n\n${pName}缓缓起身，擦去眼角的泪痕，声音沙哑："传令下去，厚葬${allyName}，追封......追封为......"\n\n他的声音哽咽了，再也说不下去。`,
          `${pFaction || '大营'}中，灯火通明。${pName}坐在帅帐中，面前摊着战报，神情疲惫。\n\n这一战，损兵折将，丢了${region}三座城池。${aFaction || '敌军'}势大，短期内难以反攻。\n\n${mName}走进帐中，沉声道："主公，当务之急，是稳住军心。"\n\n${pName}点了点头，站起身来，眼中重新燃起了斗志："你说得对。传令三军，明日校场点兵，我要亲自训话。"`
        ],
        default: [
          `${region}，${pFaction || '大营'}。\n\n${pName}正在帐中批阅军报，${allyName}匆匆入帐，抱拳道："主公，${aFaction || '前方'}有异动。"\n\n${pName}放下笔，眉头微皱："详细说说。"\n\n${allyName}将从${region2}得到的情报一一禀报。${pName}听罢，沉吟片刻，转头看向挂在墙上的地图。\n\n${trans}，${pName}对${mName}道："先生以为，此事当如何应对？"\n\n${mName}捋须沉思，缓缓道："兵法云：知己知彼，百战不殆。主公不妨先按兵不动，静观其变。"`
        ]
      }; var templates = historyTemplates[mood] || historyTemplates.default;
      return templates[Math.floor(Math.random() * templates.length)];
    }
    
    // 玄幻/仙侠/武侠/都市/末世 — 使用基于世界观的模板
    if (protagonist && factions && regions) { var specificTemplates = {
        tense: [
          `${region}的局势超出了所有人的预料，${aFaction || '敌对势力'}的新一轮行动开始了。${pName}感受到空气中弥漫的压迫感，${powerSystem ? powerSystem.levels[powerSystem.levels.length-2] || '力量' : '力量'}在体内涌动。`,
          `隐藏在${region}暗处的${aFaction || '神秘势力'}终于开始行动了，${pFaction}的局势变得更加复杂。${aName}对此已经谋划已久，一场风暴即将来临。`,
          `危险正在逼近${pName}，而${aName}对此已经做好了万全准备。${region}的天空变得阴沉，仿佛预示着即将到来的对决。`
        ],
        calm: [
          `平静的日子总是短暂的。此刻，${pName}正在${pFaction}中修炼，${powerSystem ? powerSystem.levels[Math.min(1, powerSystem.levels.length-1)] || '境界' : '境界'}的突破近在咫尺。`,
          `${region}阳光正好，${pName}与${allyName}并肩而行，一切似乎都在朝着好的方向发展。`,
          `${pName}放下手中的${genre === '都市' ? '文件' : genre === '科幻' ? '数据板' : '书卷'}，望向${region}的窗外。${mName}曾说过的那番话，如今想来别有深意。`
        ],
        exciting: [
          `${region}的天空突然出现了异象，似乎预示着什么重大的事件即将发生。${pName}的眼中闪过一丝精光，${powerSystem ? '体内的' + powerSystem.name + '开始躁动' : '力量开始觉醒'}。`,
          `就在此时，${allyName}来到了${pFaction}，带来了关于${aFaction || '敌人'}的重要消息。${pName}听罢，猛然站起："终于来了！"`,
          `机会终于来了！${pName}${genre === '都市' ? '嘴角微微上扬' : '眼中精光一闪'}，${aFaction || '对手'}的破绽已经暴露。`
        ],
        sad: [
          `${pName}深吸一口气，做出了一个重要的决定。这将改变${pFaction}的一切，也将改变他自己的命运。`,
          `回首往事，${pName}在${pFaction}的那些欢笑与泪水，都已化作记忆的尘埃。${mName}的教诲犹在耳畔。`,
          `有些事情，注定无法挽回。${pName}望着${region}的天空，心中五味杂陈。但他知道，自己不能停下脚步。`
        ],
        default: [
          `${region}的局势超出了所有人的预料，${aFaction || '新势力'}的介入让一切变得扑朔迷离。${pName}必须尽快做出选择。`,
          `${trans}，${mName}来到了${pName}面前，带来了关于${aFaction || '敌人'}的重要消息。${pName}听罢，陷入了沉思。`,
          `${pName}深吸一口气，做出了一个重要的决定。${allyName}在一旁默默点头，表示支持。${pFaction}的命运，将从今日改变。`
        ]
      }; var selected = specificTemplates[mood] || specificTemplates.default;
      return selected[Math.floor(Math.random() * selected.length)] + '\n\n' +
        `${trans}，${pName}的心中已经有了计划。${region2}的方向，似乎传来了新的变数。${aName}不会坐视不理，而${pName}也早已做好了准备。\n\n故事，还在继续...`;
    }
    
    // 完全没有世界观数据的回退模板（按题材区分）
    var fallbackTemplates = {
      '历史': [
        `探马飞奔入营，翻身下马，单膝跪地："报——前方发现敌军踪迹！"\n\n帐中众人面色一变。主帅沉声道："来了多少人马？"\n\n"约莫三千骑兵，打着${region}的旗号。"探马喘息道。\n\n主帅与军师对视一眼，眼中皆闪过凝重之色。`,
        `夜深了，营帐中灯火摇曳。他独坐案前，手中握着一封密信，眉头紧锁。\n\n信上的内容，让他不得不重新审视眼前的局势。如果消息属实，那么接下来的一切，都将彻底改变。`
      ],
      '玄幻': [
        `灵气在体内翻涌，他感受到了突破的契机。就在这一刻，天地间仿佛有什么东西在呼唤着他。`,
        `远处的天空突然出现了异象，一道璀璨的光芒划破长空，似乎预示着什么重大的事件即将发生。`
      ],
      '都市': [
        `手机突然震动了一下，屏幕上弹出一条消息。他拿起手机一看，脸色瞬间变了。`,
        `会议室的门被推开，一个西装革履的男人走了进来，所有人的目光都集中在了他身上。`
      ],
      '末世': [
        `远处传来低沉的嘶吼声，他握紧了手中的武器，示意身后的人保持安静。丧尸群正在靠近。`,
        `物资又不够了。他看着仅剩的半瓶水和两块压缩饼干，知道必须尽快找到新的补给点。`
      ]
    }; var genreFallback = fallbackTemplates[genre] || fallbackTemplates['玄幻']; var moodFallback = {
      tense: ['事情的发展超出了所有人的预料，一个新的变数出现了。', '隐藏在暗处的势力终于开始行动了，局势变得更加复杂。'],
      calm: ['平静的日子总是短暂的，但此刻，他只想好好珍惜。', '阳光正好，一切似乎都在朝着好的方向发展。'],
      exciting: ['远处的天空突然出现了异象，似乎预示着什么重大的事件即将发生。', '就在此时，一个意想不到的人物出现了，带来了重要的消息。'],
      sad: ['他深吸一口气，做出了一个重要的决定。', '有些事情，注定无法挽回。但他知道，自己不能停下脚步。'],
      default: ['事情正在悄然发生变化，而他还没有察觉。', '就在这时，一个意想不到的情况出现了。']
    }; var fb = genreFallback[Math.floor(Math.random() * genreFallback.length)]; var mb = (moodFallback[mood] || moodFallback.default)[Math.floor(Math.random() * (moodFallback[mood] || moodFallback.default).length)];
    return fb + '\n\n' + mb;
  },

  // ========== 后处理过滤器：自动规避重复用词和描述堆叠 ==========
  postFilter(generatedText, existingText) { var text = generatedText;

    // 1. 提取已有文本中的高频词，避免续写中重复使用
    var existingWords = this.extractWordFrequencies(existingText);

    // 2. 替换续写中与上文重复的高频词
    for ( var [word, count] of Object.entries(existingWords)) {
      if (count >= 3) { var synonyms = this.getSynonyms(word);
        if (synonyms.length > 0) { var idx = text.indexOf(word);
          if (idx !== -1) {
            text = text.substring(0, idx) + synonyms[0] + text.substring(idx + word.length);
          }
        }
      }
    }

    // 3. 检查续写内部是否有重复用词，自动替换
    text = this.autoFixRepeatedWords(text);

    // 4. 检查描述堆叠，自动拆分
    text = this.autoFixStacking(text);

    return text;
  },

  // 获取停用词集合（避免TDZ问题，动态获取）
  _getStopWords() {
    return (window.TextChecker && window.TextChecker.stopWords) ? window.TextChecker.stopWords : new Set([
      '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '之', '与', '及', '等', '或', '但', '而', '因为', '所以', '如果', '虽然', '然而', '因此', '于是', '不过', '只是', '即使', '尽管', '无论', '不管', '不仅', '不但', '而且', '并且', '或者', '还是', '要么', '假如', '假定', '譬如', '例如', '比如', '像是', '如同', '好像', '仿佛', '似乎', '一样', '一般', '通常', '常常', '经常', '往往', '一直', '总是', '千万', '万一'
    ]);
  },

  // 提取已有文本词频
  extractWordFrequencies(text) { var freq = {}; var stopWords = this._getStopWords();
    for ( var len = 2; len <= 4; len++) {
      for ( var i = 0; i <= text.length - len; i++) { var word = text.substring(i, i + len);
        if (/^[\u4e00-\u9fa5]+$/.test(word) && !stopWords.has(word)) {
          freq[word] = (freq[word] || 0) + 1;
        }
      }
    }
    return freq;
  },

  // 同义词库
  getSynonyms(word) { var synonymMap = {
      '强大': ['强横', '雄浑', '浑厚'],
      '震惊': ['骇然', '动容', '错愕'],
      '恐怖': ['骇人', '惊悚', '可怖'],
      '美丽': ['秀丽', '婉约', '清丽'],
      '愤怒': ['恼怒', '震怒', '愠怒'],
      '悲伤': ['哀伤', '凄凉', '怆然'],
      '兴奋': ['激昂', '昂扬', '振奋'],
      '紧张': ['紧绷', '凝重', '肃然'],
      '可怕': ['骇然', '惊惧', '可怖'],
      '神秘': ['玄妙', '幽深', '莫测'],
      '坚定': ['坚毅', '决然', '毅然'],
      '冷静': ['沉静', '淡然', '从容'],
      '迅速': ['疾速', '迅捷', '快捷'],
      '突然': ['骤然', '猛然', '倏然'],
      '缓缓': ['徐徐', '慢悠悠', '悠然'],
      '猛烈': ['凌厉', '凶猛', '暴烈'],
      '巨大': ['庞大', '恢弘', '浩大'],
      '寒冷': ['凛冽', '冰寒', '刺骨'],
      '炽热': ['灼热', '滚烫', '炽烈'],
      '黑暗': ['幽暗', '昏暗', '晦暗'],
      '明亮': ['璀璨', '耀眼', '辉煌'],
      '安静': ['寂静', '幽静', '静谧'],
      '危险': ['凶险', '险恶', '危机四伏'],
      '轻松': ['惬意', '舒坦', '闲适'],
      '困难': ['艰难', '棘手', '凶险'],
      '重要': ['关键', '紧要', '重大'],
      '奇怪': ['诡异', '反常', '蹊跷'],
      '精彩': ['绝妙', '精妙', '出色'],
      '普通': ['寻常', '平凡', '平淡'],
      '快速': ['疾速', '迅捷', '飞快'],
      '缓慢': ['迟缓', '悠然', '徐徐'],
      '高兴': ['欣喜', '愉悦', '欢欣'],
      '难过': ['伤感', '惆怅', '黯然'],
      '害怕': ['忌惮', '惶恐', '战栗'],
      '勇敢': ['无畏', '果敢', '悍勇'],
      '聪明': ['睿智', '机敏', '精明'],
      '愚蠢': ['愚钝', '昏聩', '冥顽'],
      '善良': ['仁善', '慈悲', '宽厚'],
      '邪恶': ['阴毒', '歹毒', '凶戾'],
      '华丽': ['绚烂', '璀璨', '瑰丽'],
      '简单': ['简易', '素朴', '简明'],
      '复杂': ['繁复', '错综', '盘根错节'],
      '孤独': ['寂寥', '落寞', '孤寂'],
      '温暖': ['和煦', '温润', '暖融融'],
      '冷酷': ['冷厉', '冰寒', '漠然'],
      '优雅': ['从容', '恬淡', '闲雅'],
      '粗鲁': ['粗暴', '鲁莽', '粗野'],
      '精致': ['精巧', '细腻', '考究'],
      '粗糙': ['粗粝', '毛糙', '简陋']
    };
    return synonymMap[word] || [];
  },

  // 自动修复续写内部的重复用词
  autoFixRepeatedWords(text) { var paragraphs = text.split(/\n+/); var stopWords = this._getStopWords();
    return paragraphs.map(function(para) { var freq = {}; var words = [];
      for ( var len = 2; len <= 4; len++) {
        for ( var i = 0; i <= para.length - len; i++) { var word = para.substring(i, i + len);
          if (/^[\u4e00-\u9fa5]+$/.test(word) && !stopWords.has(word)) {
            words.push({ word, pos: i, len });
          }
        }
      }
      words.forEach(function(w) { freq[w.word] = (freq[w.word] || 0) + 1; }); var result = para;
      for ( var [word, count] of Object.entries(freq)) {
        if (count >= 2) { var synonyms = this.getSynonyms(word);
          if (synonyms.length > 0) { var firstDone = false;
            result = result.split(word).reducefunction(acc, part, idx, arr) {
              if (idx > 0) {
                if (!firstDone) {
                  firstDone = true;
                  acc += word;
                } else {
                  acc += synonyms[0];
                }
              }
              acc += part;
              return acc;
            }, '');
          }
        }
      }
      return result;
    }).join('\n');
  },

  // 自动修复描述堆叠
  autoFixStacking(text) {
    text = text.replace(/([\u4e00-\u9fa5]{1,4}的){3,}/g, function(match) { var parts = match.split('的').filter(p => p);
      if (parts.length <= 2) return match;
      return parts[parts.length - 2] + '的' + parts[parts.length - 1];
    });
    
    text = text.replace(/(?:非常|十分|特别|极其|相当|格外)[\u4e00-\u9fa5]{0,2}(?:非常|十分|特别|极其|相当|格外)/g, function(match) {
      return match.replace(/(?:非常|十分|特别|极其|相当|格外)/g, (m, offset) => offset === 0 ? m : '');
    }); var erAlternatives = ['却', '但', '又', '亦', '且'];
    text = text.replace(/而(.{0,10})而(.{0,10})而/g, function(match, p1, p2) {
      return '而' + p1 + erAlternatives[0] + p2 + erAlternatives[1];
    });
    
    return text;
  }
};

// ========== 3. 本地润色引擎 ==========
var PolishEngine = {
  rules: [
    { pattern: /很/g, replacement: '极为', condition: (text) => text.length > 100 },
    { pattern: /非常/g, replacement: '格外', condition: () => true },
    { pattern: /突然/g, replacement: '骤然', condition: () => true },
    { pattern: /开始/g, replacement: '着手', condition: (text) => text.includes('战斗') },
    { pattern: /说/g, replacement: '沉声道', condition: (text) => text.includes('严肃') },
    { pattern: /走/g, replacement: '迈步', condition: (text) => text.includes('坚定') }
  ],

  polish(text) { var result = text;
    
    for ( var rule of this.rules) {
      if (rule.condition(text)) {
        result = result.replace(rule.pattern, rule.replacement);
      }
    }
    
    result = this.enhanceDescription(result);
    result = this.optimizeSentences(result);
    
    if (window.ContentGenerator) {
      result = ContentGenerator.autoFixRepeatedWords(result);
      result = ContentGenerator.autoFixStacking(result);
    }
    
    return result;
  },

  enhanceDescription(text) { var descriptions = [
      '阳光透过树叶的缝隙洒下斑驳的光影',
      '微风拂过，带来阵阵花香',
      '远处的山峦在云雾中若隐若现',
      '天空中飘着几朵白云，悠闲自在'
    ]; var paragraphs = text.split('\n');
    return paragraphs.map(function(p, i) {
      if (i === 0 && p.length > 20) {
        return descriptions[Math.floor(Math.random() * descriptions.length)] + '。\n' + p;
      }
      return p;
    }).join('\n');
  },

  optimizeSentences(text) {
    return text.replace(/([。！？])\n([^\n]{1,10}[。！？])/g, '$1$2');
  }
};

// ========== 4. 评价引擎 ==========
var EvaluateEngine = {
  evaluate(text) { var scores = {
      opening: this.scoreOpening(text),
      pacing: this.scorePacing(text),
      dialogue: this.scoreDialogue(text),
      hook: this.scoreHook(text),
      emotion: this.scoreEmotion(text),
      description: this.scoreDescription(text),
      rhythm: this.scoreRhythm(text),
      characterization: this.scoreCharacterization(text)
    }; var total = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length; var report = `【AI写作评价报告】（本地规则引擎）\n\n`;
    report += `综合评分：${total.toFixed(1)}/10\n\n`;
    report += `各维度评分：\n`;
    report += `• 开篇吸引力：${scores.opening}/10\n`;
    report += `• 节奏把控：${scores.pacing}/10\n`;
    report += `• 对话质量：${scores.dialogue}/10\n`;
    report += `• 悬念钩子：${scores.hook}/10\n`;
    report += `• 情绪渲染：${scores.emotion}/10\n`;
    report += `• 描写细腻度：${scores.description}/10\n`;
    report += `• 节奏多样性：${scores.rhythm}/10\n`;
    report += `• 人物塑造：${scores.characterization}/10\n\n`;
    
    report += `【改进建议】\n`;
    report += this.generateSuggestions(scores, text);
    
    return report;
  },

  scoreOpening(text) { var score = 5; var firstPara = text.split(/\n+/)[0] || ''; var firstSentence = firstPara.split(/[。！？]/)[0] || firstPara;
    
    // 有具体动作（动词+对象）
    var actionVerbs = /(?:挥|握|抬|转|迈|拔|抽|推|拉|提|举|放|砸|劈|刺|踢|踹|挡|闪|躲|冲|扑|跃|飞|落|跪|站|坐|躺|倒|爬|跑|走|追|逃|退|进|出|开|关|握|松|咬|吞|吐|喊|叫|笑|哭|怒|叹|望|看|盯|瞥|扫|听|闻)/; var concreteTarget = /(?:剑|刀|枪|拳|掌|指|头|手|身|眼|眉|嘴|唇|血|汗|泪|风|雨|雷|火|光|影|门|窗|墙|地|天|山|水|城|路|马|车|人|敌|友|师|徒|兄|弟|姐|妹)/;
    
    if (actionVerbs.test(firstSentence) && firstSentence.length < 30) score += 2; // 短句+动作=有力开篇
    if (concreteTarget.test(firstSentence)) score += 1;
    
    // 有对话开篇
    if (/^["""'「『]/.test(firstPara)) score += 1;
    
    // 有悬念词
    if (/突然|竟然|没想到|谁知|不料|刹那间|猛然/.test(firstSentence)) score += 1;
    
    // 有环境渲染
    if (/(?:风|雨|雪|月|星|云|雾|光|影|夜|黎明|黄昏|清晨)/.test(firstSentence)) score += 1;
    
    // 惩罚：以"某某站在..."开头太常见
    if (/^(?:他|她|林|张|李|王|刘|陈)\w{1,3}(?:站在|坐在|走在|来到|望着)/.test(firstSentence)) score -= 1;
    
    return Math.min(10, Math.max(1, score));
  },

  scorePacing(text) { var score = 5; var sentences = text.split(/[。！？]/).filter(s => s.trim()); var avgLength = sentences.reduce((a, s) => a + s.length, 0) / sentences.length;
    
    // 理想句长15-35字
    if (avgLength > 15 && avgLength < 35) score += 2;
    else if (avgLength > 10 && avgLength < 45) score += 1;
    
    // 有推进词（表示剧情在动）
    var progressWords = (text.match(/(?:然后|接着|随即|突然|刹那|猛然|立刻|马上|瞬间|顿时|终于|终于)/g) || []).length;
    if (progressWords >= 2 && progressWords <= 8) score += 1;
    
    // 有段落分隔
    var paragraphs = text.split(/\n+/).filter(p => p.trim());
    if (paragraphs.length >= 5) score += 1;
    
    // 惩罚：连续长句（超过50字的句子太多）
    var longSentences = sentences.filter(s => s.length > 50).length;
    if (longSentences > sentences.length * 0.3) score -= 2;
    
    // 惩罚：推进词太多（说明节奏太赶）
    if (progressWords > 10) score -= 1;
    
    return Math.min(10, Math.max(1, score));
  },

  scoreDialogue(text) { var score = 5; var dialogues = text.match(/["""'「][^"""'」]*["""'」]/g) || []; var dialogueCount = dialogues.length;
    
    // 对话数量适中
    if (dialogueCount >= 3 && dialogueCount <= 15) score += 2;
    else if (dialogueCount >= 1) score += 1;
    
    // 有对话标签变化（不只是"XX说"）
    var tags = text.match(/(?:说|道|喊|叫|喝|问|答|笑|怒|叹|冷笑|大笑|沉声|低声|厉声|轻声|喝道|叫道|笑道|怒道|问道|答道|叹道|喃喃|嘟囔|吼道|嘶吼|低语)/g) || []; var uniqueTags = new Set(tags);
    if (uniqueTags.size >= 3) score += 1; // 标签多样化
    
    // 对话中有动作打断（说+动作+继续说）
    var actionBreak = /(?:说|道)[^""''""]{0,15}(?:，|,)[^""''""]{0,15}(?:没有|不|却|但|只是|然而)/;
    if (actionBreak.test(text)) score += 1;
    
    // 对话长度有变化（不全是短句）
    var dialogueLengths = dialogues.map(d => d.length); var hasShort = dialogueLengths.some(l => l <= 8); var hasLong = dialogueLengths.some(l => l >= 20);
    if (hasShort && hasLong) score += 1;
    
    // 有潜台词/言外之意标记
    if (/(?:意味深长|似笑非笑|欲言又止|话中有话|弦外之音|不置可否|默然)/.test(text)) score += 1;
    
    // 惩罚：对话太长（超过20句）
    if (dialogueCount > 20) score -= 2;
    
    return Math.min(10, Math.max(1, score));
  },

  scoreHook(text) { var score = 5; var paragraphs = text.split(/\n+/).filter(p => p.trim()); var lastPara = paragraphs[paragraphs.length - 1] || ''; var lastSentence = lastPara.split(/[。！？]/).filter(s => s.trim()); var last = lastSentence[lastSentence.length - 1] || lastPara;
    
    // 章尾有新威胁
    if (/(?:来了|出现|逼近|包围|抓住|发现|传来|响起|闪过|浮现|降临|涌来)/.test(last)) score += 2;
    
    // 章尾有未解悬念
    if (/(?:怎么回事|为什么|难道|难道说|究竟|到底|是谁|是什么|怎么办|如何)/.test(last)) score += 2;
    
    // 章尾有情绪转折
    if (/(?:然而|但是|可是|不料|谁知|突然|猛然|刹那)/.test(last)) score += 1;
    
    // 章尾是省略号（悬念感）
    if (/\.{3,}|…/.test(last)) score += 1;
    
    // 正文中有伏笔词
    var foreshadowWords = (text.match(/(?:秘密|真相|阴谋|谜团|伏笔|蹊跷|古怪|不对劲|隐情)/g) || []).length;
    if (foreshadowWords >= 1) score += 1;
    
    // 惩罚：章尾是平淡陈述
    if (/^(?:他|她|众人|大家|他们)就?(?:这样|于是|然后|接着)/.test(last)) score -= 2;
    
    return Math.min(10, Math.max(1, score));
  },

  scoreEmotion(text) { var score = 5;
    
    // 情绪词检测（扩展）
    var emotionGroups = {
      '愤怒': ['愤怒', '怒', '暴怒', '恼怒', '气', '火冒三丈', '怒火', '怒不可遏'],
      '悲伤': ['悲伤', '悲', '哭', '泪', '痛', '心碎', '心如刀割', '黯然', '凄凉'],
      '喜悦': ['喜悦', '喜', '笑', '乐', '高兴', '开心', '欣喜', '愉悦', '畅快'],
      '恐惧': ['恐惧', '怕', '惧', '惊', '慌', '骇然', '心惊', '毛骨悚然', '不寒而栗'],
      '紧张': ['紧张', '紧', '揪心', '屏息', '提心吊胆', '忐忑', '手心出汗'],
      '感动': ['感动', '热泪', '鼻酸', '哽咽', '泪目', '心酸', '温暖']
    }; var emotionTypesFound = 0;
    for ( var [group, words] of Object.entries(emotionGroups)) {
      if (words.some(w => text.includes(w))) emotionTypesFound++;
    }
    score += Math.min(3, emotionTypesFound); // 情绪类型多样
    
    // 有内心独白
    if (/(?:心想|暗想|心中|内心|念头|脑海里|脑中|想到|觉得|感到|明白|清楚)/.test(text)) score += 1;
    
    // 有生理反应（情绪外化）
    if (/(?:心跳|脉搏|呼吸|额头|冷汗|手心|拳头|咬唇|攥紧|颤抖|发抖)/.test(text)) score += 1;
    
    // 有情绪变化（从一种情绪到另一种）
    var emotionTransitions = 0; var lines = text.split(/[。！？\n]/);
    for ( var i = 1; i < lines.length; i++) { var prev = lines[i-1], curr = lines[i]; var prevSad = /悲|哭|痛|伤心/.test(prev); var currAngry = /怒|火|恨/.test(curr); var prevCalm = /平静|淡然|冷静/.test(prev); var currShock = /惊|震|骇/.test(curr);
      if ((prevSad && currAngry) || (prevCalm && currShock)) emotionTransitions++;
    }
    if (emotionTransitions >= 1) score += 1;
    
    return Math.min(10, Math.max(1, score));
  },

  scoreDescription(text) { var score = 5;
    
    // 五感描写
    var senses = {
      '视觉': /(?:颜色|色彩|光芒|光影|金|银|红|白|黑|碧|紫|青|赤|橙|闪烁|耀眼|昏暗|明亮|阴暗|漆黑|通红|苍白|灰暗)/,
      '听觉': /(?:声音|声响|寂静|喧嚣|轰鸣|低沉|尖锐|清脆|沉闷|回荡|嗡嗡|呼啸|沙沙)/,
      '触觉': /(?:冰冷|灼热|温暖|寒意|滚烫|柔软|坚硬|粗糙|光滑|刺骨|灼烧|冰凉)/,
      '嗅觉': /(?:气味|香味|腥味|血腥|芬芳|恶臭|清新|刺鼻|幽香|焦糊)/,
      '味觉': /(?:苦涩|甘甜|咸|酸|辣|鲜美|腥|铁锈味)/
    }; var sensesFound = 0;
    for ( var [sense, pattern] of Object.entries(senses)) {
      if (pattern.test(text)) sensesFound++;
    }
    score += Math.min(3, sensesFound); // 感官多样
    
    // 有动态描写（不只是静态）
    if (/(?:飘动|摇曳|翻滚|涌动|流淌|飞舞|闪烁|颤动|旋转|蔓延|扩散)/.test(text)) score += 1;
    
    // 有比喻/修辞
    if (/(?:如同|仿佛|好似|犹如|宛如|像|一般|似的|仿佛是)/.test(text)) score += 1;
    
    // 有具体数字/度量（增加真实感）
    if (/(?:丈|尺|寸|米|里|步|丈余|数丈|百步|千斤)/.test(text)) score += 1;
    
    return Math.min(10, Math.max(1, score));
  },

  // 新增：节奏多样性（长短段交替）
  scoreRhythm(text) { var score = 5; var paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length < 3) return score; var lengths = paragraphs.map(p => p.length);
    
    // 计算方差
    var mean = lengths.reduce((a, b) => a + b, 0) / lengths.length; var variance = lengths.reduce((a, l) => a + (l - mean) ** 2, 0) / lengths.length;
    
    // 方差大说明长短交替好
    if (variance > 500) score += 2;
    else if (variance > 200) score += 1;
    
    // 有短段（<20字）制造紧张感
    var shortParas = lengths.filter(l => l < 20).length;
    if (shortParas >= 1 && shortParas <= paragraphs.length * 0.3) score += 1;
    
    // 有长段（>80字）用于描写
    var longParas = lengths.filter(l => l > 80).length;
    if (longParas >= 1) score += 1;
    
    // 惩罚：所有段落差不多长（单调）
    var allSimilar = lengths.every(l => Math.abs(l - mean) < 15);
    if (allSimilar && paragraphs.length > 4) score -= 2;
    
    return Math.min(10, Math.max(1, score));
  },

  // 新增：人物塑造
  scoreCharacterization(text) { var score = 5;
    
    // 有角色名（2-3字中文名）
    var names = text.match(/[\u4e00-\u9fa5]{2,4}(?:说|道|喊|叫|想|笑|哭|怒|叹|点头|摇头|皱眉|咬牙|握拳)/g) || []; var uniqueNames = new Set(names.map(n => n.replace(/(?:说|道|喊|叫|想|笑|哭|怒|叹|点头|摇头|皱眉|咬牙|握拳)$/, '')));
    if (uniqueNames.size >= 2) score += 2; // 至少2个角色有动作
    if (uniqueNames.size >= 3) score += 1; // 3个以上更好
    
    // 有外貌描写
    if (/(?:面容|容貌|身材|衣着|服饰|眉眼|目光|眼神|鬓发|胡须|肤色|面庞)/.test(text)) score += 1;
    
    // 有性格标签（通过行为展示）
    if (/(?:果断|犹豫|冷静|冲动|谨慎|大胆|狡猾|憨厚|阴沉|豪爽|温柔|冷漠|热情|傲慢|谦逊)/.test(text)) score += 1;
    
    // 有角色间互动（不只是独角戏）
    var interactions = text.match(/(?:看向|望着|盯着|对(?:他|她|你)|向(?:他|她|你)|拉住|扶住|挡在|推開|抓住|松开)/g) || [];
    if (interactions.length >= 2) score += 1;
    
    return Math.min(10, Math.max(1, score));
  },

  generateSuggestions(scores, text) { var suggestions = [];
    
    if (scores.opening < 7) suggestions.push('开篇可以更有冲击力：建议用短句+具体动作开头，避免"XX站在/走在"的常见模式');
    if (scores.pacing < 7) suggestions.push('节奏问题：检查是否有过多长句（>50字），适当拆分；或推进词太多导致节奏太赶');
    if (scores.dialogue < 7) suggestions.push('对话可优化：增加对话标签变化（不只是"说"），加入动作打断和潜台词');
    if (scores.hook < 7) suggestions.push('章尾钩子不足：结尾可加入新威胁、未解疑问或情绪转折，避免平淡陈述收尾');
    if (scores.emotion < 7) suggestions.push('情绪渲染可加强：增加内心独白和生理反应（心跳、冷汗、攥拳等），让情绪变化更丰富');
    if (scores.description < 7) suggestions.push('描写可丰富：调动更多感官（视觉、听觉、触觉、嗅觉），加入比喻修辞和具体度量');
    if (scores.rhythm < 7) suggestions.push('节奏太单调：段落长度应有变化，穿插短段（<20字）制造紧张感，长段（>80字）用于描写');
    if (scores.characterization < 7) suggestions.push('人物可更立体：增加外貌、性格标签、角色间互动，让每个角色有独特记忆点');
    
    if (suggestions.length === 0) return '整体质量较高，继续保持！';
    return suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n');
  }
};

// ========== 5. 本地写作辅助 ==========
var WritingHelper = {
  checkSensitiveWords(text) { var sensitiveWords = ['暴力', '色情', '政治', '反动', '邪教']; var found = sensitiveWords.filter(w => text.includes(w));
    return {
      hasSensitive: found.length > 0,
      words: found
    };
  },

  countWords(text) { var chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length; var english = (text.match(/[a-zA-Z]+/g) || []).length; var punctuation = (text.match(/[，。！？、；：""''（）【】《》]/g) || []).length;
    
    return {
      total: text.length,
      chinese,
      english,
      punctuation,
      paragraphs: text.split('\n').filter(p => p.trim()).length
    };
  },

  analyzeParagraphs(text) { var paragraphs = text.split('\n').filter(p => p.trim());
    
    return paragraphs.map((p, i) => ({
      index: i + 1,
      length: p.length,
      sentenceCount: p.split(/[。！？]/).filter(s => s.trim()).length,
      hasDialogue: /["""']/.test(p),
      hasAction: /打|杀|跑|跳|走/.test(p),
      hasDescription: /颜色|声音|气味|感觉/.test(p)
    }));
  },

  generateWritingTips(text) { var tips = []; var stats = this.countWords(text);
    
    if (stats.total < 100) tips.push('内容较短，建议增加细节描写');
    if (stats.paragraphs < 3) tips.push('段落较少，建议适当分段');
    if (stats.chinese / stats.total < 0.5) tips.push('中文比例较低，建议增加中文内容'); var analysis = this.analyzeParagraphs(text); var dialogueCount = analysis.filter(p => p.hasDialogue).length;
    if (dialogueCount === 0) tips.push('缺少对话，建议增加人物互动');
    
    return tips;
  }
};

// ========== 6. 重复用词与描述堆叠检测引擎 ==========
var TextChecker = {
  stopWords: new Set([
    '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '之', '与', '及', '等', '或', '但', '而', '因为', '所以', '如果', '虽然', '然而', '因此', '于是', '不过', '只是', '即使', '尽管', '无论', '不管', '不仅', '不但', '而且', '并且', '或者', '还是', '要么', '假如', '假定', '譬如', '例如', '比如', '像是', '如同', '好像', '仿佛', '似乎', '一样', '一般', '通常', '常常', '经常', '往往', '一直', '总是', '千万', '万一'
  ]),

  checkRepeatedWords(text, excludeWords) { var exclude = excludeWords || new Set(); var paragraphs = text.split(/\n+/).filter(p => p.trim()); var results = [];
    
    paragraphs.forEach(function(para, pIdx) { var words = [];
      for ( var len = 2; len <= 4; len++) {
        for ( var i = 0; i <= para.length - len; i++) { var word = para.substring(i, i + len);
          if (/^[\u4e00-\u9fa5]+$/.test(word) && !this.stopWords.has(word) && !exclude.has(word)) {
            words.push({ word, pos: i, len });
          }
        }
      }
      
      var wordCount = {};
      words.forEach(function(w) {
        if (!wordCount[w.word]) wordCount[w.word] = [];
        wordCount[w.word].push(w.pos);
      }); var repeated = [];
      for ( var [word, positions] of Object.entries(wordCount)) {
        if (positions.length >= 2) {
          for ( var i = 1; i < positions.length; i++) { var gap = positions[i] - positions[i - 1];
            if (gap < 50) {
              repeated.push({ word, count: positions.length, gap, positions });
              break;
            }
          }
        }
      }
      
      if (repeated.length > 0) {
        results.push({
          paragraph: pIdx + 1,
          preview: para.substring(0, 30) + '...',
          repeated: repeated.sort((a, b) => b.count - a.count).slice(0, 5)
        });
      }
    });
    
    return results;
  },

  checkDescriptionStacking(text) { var paragraphs = text.split(/\n+/).filter(p => p.trim()); var results = [];
    
    paragraphs.forEach(function(para, pIdx) { var issues = []; var match; var stackingRegex = /([\u4e00-\u9fa5]{1,4}的){3,}/g;
      while ((match = stackingRegex.exec(para)) !== null) {
        issues.push({
          type: '形容词堆叠',
          text: match[0],
          pos: match.index,
          suggestion: '建议拆分为多个短句，或删除部分修饰词'
        });
      }
      
      var degreeRegex = /(?:非常|十分|特别|极其|相当|格外)[\u4e00-\u9fa5]{0,2}(?:非常|十分|特别|极其|相当|格外)/g;
      while ((match = degreeRegex.exec(para)) !== null) {
        issues.push({
          type: '副词连用',
          text: match[0],
          pos: match.index,
          suggestion: '程度副词不宜连用，保留一个即可'
        });
      }
      
      var idiomRegex = /[\u4e00-\u9fa5]{4}[^\u4e00-\u9fa5]{0,2}[\u4e00-\u9fa5]{4}[^\u4e00-\u9fa5]{0,2}[\u4e00-\u9fa5]{4}/g;
      while ((match = idiomRegex.exec(para)) !== null) { var segment = match[0]; var idioms = segment.match(/[\u4e00-\u9fa5]{4}/g);
        if (idioms && idioms.length >= 3) {
          issues.push({
            type: '成语堆砌',
            text: match[0],
            pos: match.index,
            suggestion: '连续使用多个成语会显得生硬，建议穿插口语化表达'
          });
        }
      }
      
      var erRegex = /而.{0,10}而.{0,10}而/g;
      while ((match = erRegex.exec(para)) !== null) {
        issues.push({
          type: '连词重复',
          text: match[0],
          pos: match.index,
          suggestion: '"而"字使用过于频繁，建议替换为其他转折词或直接删除'
        });
      }
      
      if (issues.length > 0) {
        results.push({
          paragraph: pIdx + 1,
          preview: para.substring(0, 30) + '...',
          issues: issues
        });
      }
    });
    
    return results;
  },

  // 从文本和作品设定中提取专有名词（人名、地名、势力名）
  _extractProperNouns(text, work) { var nouns = new Set();
    
    // 1. 从人设文本中提取人名（【姓名】或【角色】后面的词）
    if (work && work.chars) { var namePatterns = [
        /【姓名[：:]?\s*】\s*([^\n,，]{2,4})/g,
        /姓名[：:]\s*([^\n,，]{2,4})/g,
        /【角色[：:]?\s*】\s*([^\n,，]{2,4})/g,
        /(?:主角|反派|导师|配角|女主)[：:]\s*([^\n,，]{2,4})/g
      ];
      namePatterns.forEach(function(pat) { var m;
        while ((m = pat.exec(work.chars)) !== null) { var name = m[1].replace(/^[：:\s]+/, '').trim();
          if (name.length >= 2 && name.length <= 4) nouns.add(name);
        }
      });
    }
    
    // 2. 从世界观中提取势力名（通常2-6字，含宗/门/派/阁/教/军/营/城等）
    if (work && work.world) { var factionPattern = /[•\-\*]\s*([^\n：]{2,8}(?:宗|门|派|阁|教|军|营|城|州|郡|府|关|山|谷|海|岛|原|林|殿|台))/g; var m;
      while ((m = factionPattern.exec(work.world)) !== null) { var name = m[1].trim();
        if (name.length >= 2 && name.length <= 8) nouns.add(name);
      }
    }
    
    // 3. 从正文中提取高频人名（被引号包裹的称谓，或连续出现3次以上的2-3字词）
    // 提取对话中的称谓（XX说、XX道、XX喊）
    var speakerPattern = /([^\s""''「」]{2,4})(?:说|道|喊|叫|喝|问|答|笑|怒|叹|冷笑|大笑|沉声|低声|厉声|轻声|喝道|叫道|笑道|怒道|问道|答道|叹道)/g; var m;
    while ((m = speakerPattern.exec(text)) !== null) { var name = m[1].trim();
      if (name.length >= 2 && /^[\u4e00-\u9fa5]+$/.test(name)) nouns.add(name);
    }
    
    // 4. 从大纲中提取人名
    if (work && work.outline) { var outlineNamePattern = /(?:主角|反派|导师|配角|女主|男主)[：:\s]*([^\n,，]{2,4})/g;
      while ((m = outlineNamePattern.exec(work.outline)) !== null) { var name = m[1].replace(/^[：:\s]+/, '').trim();
        if (name.length >= 2 && name.length <= 4) nouns.add(name);
      }
    }
    
    return nouns;
  },

  generateReport(text, work) {
    // 自动从作品中提取专有名词（人名、地名、势力名等）作为排除词
    var excludeWords = this._extractProperNouns(text, work); var repeated = this.checkRepeatedWords(text, excludeWords); var stacking = this.checkDescriptionStacking(text); var report = '【文本质量检测报告】\n\n';
    if (excludeWords.size > 0) {
      report += '【已排除专有名词】' + Array.from(excludeWords).join('、') + '\n\n';
    }
    
    if (repeated.length === 0) {
      report += '✅ 未发现明显重复用词问题\n\n';
    } else {
      report += `⚠️ 发现 ${repeated.length} 处重复用词问题\n\n`;
      repeated.forEach(function(r) {
        report += `第${r.paragraph}段：${r.preview}\n`;
        r.repeated.forEach(function(w) {
          report += `  • "${w.word}" 重复 ${w.count} 次，最近间隔 ${w.gap} 字\n`;
        });
        report += '\n';
      });
    }
    
    if (stacking.length === 0) {
      report += '✅ 未发现描述堆叠问题\n\n';
    } else {
      report += `⚠️ 发现 ${stacking.length} 处描述堆叠问题\n\n`;
      stacking.forEach(function(s) {
        report += `第${s.paragraph}段：${s.preview}\n`;
        s.issues.forEach(function(issue) {
          report += `  • 【${issue.type}】"${issue.text}"\n`;
          report += `    建议：${issue.suggestion}\n`;
        });
        report += '\n';
      });
    }
    
    report += '【优化建议】\n';
    if (repeated.length === 0 && stacking.length === 0) {
      report += '文本质量良好，继续保持！\n';
    } else {
      report += '1. 重复用词：使用同义词替换，或调整句式结构\n';
      report += '2. 描述堆叠：拆分为多个短句，每个句子聚焦一个描写点\n';
      report += '3. 副词连用：保留最有力的一个，删除其余\n';
      report += '4. 成语堆砌：适当使用口语化表达，让文字更自然\n';
    }
    
    return {
      report,
      repeated,
      stacking,
      hasIssues: repeated.length > 0 || stacking.length > 0
    };
  }
};

// ========== 6b. 套路化表达检测（CLICHE_PATTERNS + countClichés）==========
var CLICHE_PATTERNS = {
  face: [
    {ptrn:'眼神一冷',label:'眼神一冷'},
    {ptrn:'瞳孔一缩',label:'瞳孔一缩'},
    {ptrn:'嘴角勾起',label:'嘴角勾起'},
    {ptrn:'嘴角微微上扬',label:'嘴角微微上扬'},
    {ptrn:'眼中闪过一丝',label:'眼中闪过一丝'},
    {ptrn:'眸光微动',label:'眸光微动'},
    {ptrn:'心中一震',label:'心中一震'},
    {ptrn:'心中一凛',label:'心中一凛'},
    {ptrn:'眉头紧锁',label:'眉头紧锁'},
    {ptrn:'面色一沉',label:'面色一沉'},
    {ptrn:'嘴角一撇',label:'嘴角一撇'},
    {ptrn:'目光如炬',label:'目光如炬'},
    {ptrn:'嘴角泛起一丝',label:'嘴角泛起一丝'},
    {ptrn:'眼中闪过一抹',label:'眼中闪过一抹'}
  ],
  speech: [
    {ptrn:'淡淡道',label:'淡淡道'},
    {ptrn:'冷冷道',label:'冷冷道'},
    {ptrn:'缓缓开口',label:'缓缓开口'},
    {ptrn:'沉声道',label:'沉声道'},
    {ptrn:'冷哼一声',label:'冷哼一声'},
    {ptrn:'淡淡地说',label:'淡淡地说'},
    {ptrn:'轻声说道',label:'轻声说道'},
    {ptrn:'幽幽道',label:'幽幽道'},
    {ptrn:'厉声道',label:'厉声道'},
    {ptrn:'怒喝道',label:'怒喝道'}
  ],
  transition: [
    {ptrn:'千钧一发',label:'千钧一发'},
    {ptrn:'就在此时',label:'就在此时'},
    {ptrn:'空气凝固',label:'空气凝固'},
    {ptrn:'说时迟那时快',label:'说时迟那时快'},
    {ptrn:'电光火石间',label:'电光火石间'},
    {ptrn:'刹那间',label:'刹那间'},
    {ptrn:'转瞬之间',label:'转瞬之间'},
    {ptrn:'话音刚落',label:'话音刚落'},
    {ptrn:'就在这时',label:'就在这时'},
    {ptrn:'须臾间',label:'须臾间'}
  ]
};

function countClichés(text) { var details = []; var allCategories = [CLICHE_PATTERNS.face, CLICHE_PATTERNS.speech, CLICHE_PATTERNS.transition];
  for ( var cat of allCategories) {
    for ( var p of cat) {
      if (text.includes(p.ptrn)) {
        details.push({pattern: p.ptrn, label: p.label});
      }
    }
  }
  return {count: details.length, details};
}

// ========== 6c. 流派定义与评分权重 ==========
var NOVEL_GENRES = {
  xianxia: {label:'仙侠修真',desc:'古典仙侠，剑修、丹修、宗门、天道',expertise:'你是仙侠修真题材的专业作家。擅长描写修炼体系、宗门斗争、天材地宝、剑道意境。注重境界划分的层次感和修炼突破的爽感。对话带古风但不酸腐，打斗场面要有招式名称和意境渲染。'},
  xuanhuan: {label:'玄幻奇幻',desc:'异世界、魔法、斗气、神兽、位面',expertise:'你是玄幻奇幻题材的专业作家。擅长构建宏大世界、设计独特力量体系、描写跨越位面的冒险。注重想象力和新奇感，打斗场面要大开大合、气势恢宏。世界设定要有独特性和自洽性。'},
  dushi: {label:'都市异能',desc:'现代都市、异能、豪门、商战',expertise:'你是都市题材的专业作家。擅长写现代背景下的异能/商战/豪门故事。人物对话要贴近现代生活，情节推进要快，矛盾冲突要贴近现实痛点。注重代入感和爽点节奏。'},
  kehuan: {label:'科幻未来',desc:'星际、机甲、AI、末世、赛博朋克',expertise:'你是科幻题材的专业作家。擅长写星际征战、机甲战斗、AI觉醒、末世求生等题材。科技设定要有一定的科学逻辑支撑，在科幻框架下讲好人物故事。注重科技感和画面感的结合。'},
  yanqing: {label:'都市言情',desc:'都市情感、甜宠、虐恋、豪门',expertise:'你是言情题材的专业作家。擅长刻画细腻的情感变化，写甜有甜度、写虐有深度。人物互动要有化学反应，对话要自然生动。注重情感铺垫的层次感和高潮的爆发力。'},
  zhongtian: {label:'种田建设',desc:'领地经营、资源管理、日常生活、基建养成',expertise:'你是种田流题材的专业作家。擅长写领地建设、资源积累、日常生活和角色成长。注重细节的堆叠感——从无到有的过程要写得扎实可信。人物对话要有生活气息，冲突以人际/资源矛盾为主而非单纯打斗。节奏偏慢但要有持续的正反馈。'},
  richangzhenba: {label:'日常争霸',desc:'历史争霸、领地扩张、军政外交、权谋策略',expertise:'你是争霸流题材的专业作家。擅长写势力扩张、军政外交、权谋博弈和战争场面。注重战略逻辑的严谨性和势力格局的层次感。军事行动要有清晰的战术描写，政治博弈要有埋线和收线的完整链条。大场面和小细节交替，兼顾谋略的智斗和战场的热血。'}
};

var GENRE_EVAL_WEIGHTS = {
  xianxia:{d1:0.12,d2:0.14,d3:0.10,d4:0.08,d5:0.06,d6:0.12,d7:0.07,d8:0.06,d9:0.07,d10:0.06,d11:0.08,d12:0.04,desc:'仙侠侧重开篇爽点钩子',tips:['战斗场景需有完整招式描写和意境渲染','境界突破应有层次感和铺垫','宗门斗争需铺垫势力格局','建议增加修炼体系的独特感']},
  xuanhuan:{d1:0.10,d2:0.13,d3:0.12,d4:0.08,d5:0.06,d6:0.12,d7:0.07,d8:0.07,d9:0.07,d10:0.06,d11:0.08,d12:0.04,desc:'玄幻侧重爽点节奏奇迹',tips:['注意世界设定的独特性和自洽性','力量体系要有逻辑支撑','打斗场面要气势恢宏','想象力是核心卖点']},
  dushi:{d1:0.10,d2:0.10,d3:0.12,d4:0.10,d5:0.10,d6:0.10,d7:0.07,d8:0.07,d9:0.07,d10:0.05,d11:0.08,d12:0.04,desc:'都市侧重节奏对话代入感',tips:['人物对话要贴近现代生活','矛盾冲突要贴近现实痛点','情节推进速度要快','异能设定需有逻辑闭环']},
  kehuan:{d1:0.12,d2:0.10,d3:0.10,d4:0.08,d5:0.07,d6:0.10,d7:0.07,d8:0.10,d9:0.07,d10:0.10,d11:0.06,d12:0.03,desc:'科幻侧重开篇逻辑结构',tips:['科技设定需有科学逻辑支撑','世界观背景要清晰自洽','在科幻框架下讲好人物故事','避免过多的技术解释拖慢节奏']},
  yanqing:{d1:0.08,d2:0.05,d3:0.08,d4:0.18,d5:0.15,d6:0.08,d7:0.06,d8:0.05,d9:0.12,d10:0.05,d11:0.06,d12:0.04,desc:'言情侧重情绪对话人物',tips:['情感变化要细腻有层次','角色之间要有化学反应','甜要有甜度/虐要有深度','对话要自然生动有潜台词']},
  zhongtian:{d1:0.08,d2:0.05,d3:0.10,d4:0.15,d5:0.12,d6:0.08,d7:0.07,d8:0.07,d9:0.10,d10:0.10,d11:0.05,d12:0.03,desc:'种田侧重日常情绪细节',tips:['从无到有的建设过程要扎实可信','日常细节的堆叠感是核心爽点','人物对话要有生活气息','冲突以人际/资源矛盾为主','打斗非核心卖点，减少过长战斗描写']},
  richangzhenba:{d1:0.10,d2:0.15,d3:0.10,d4:0.08,d5:0.12,d6:0.12,d7:0.07,d8:0.07,d9:0.07,d10:0.08,d11:0.07,d12:0.03,desc:'争霸侧重爽点对话战略',tips:['战略逻辑需严谨合理','势力格局要有层次感','权谋博弈要有埋线和收线','战争场面要有清晰的战术描写','政治智斗和战场热血要交替呈现']}
};

function getGenreEvalWeights(genreVal, platform) { var gw = GENRE_EVAL_WEIGHTS[genreVal];
  if (!gw) return null;
  if (platform === 'qidian') {
    var ng = {}; for (var gk in gw) { if (gw.hasOwnProperty(gk)) ng[gk] = gw[gk]; } ng.d1 = gw.d1 + 0.01; ng.d2 = gw.d2 + 0.02; ng.d6 = gw.d6 + 0.01; ng.d12 = 0.02; return ng;
  }
  return gw;
}

function getGenreEvalTips(genreVal, weakDims) { var gw = GENRE_EVAL_WEIGHTS[genreVal];
  if (!gw || !gw.tips) return null; var genericTips = gw.tips; var specificTips = [];
  weakDims.forEach(function(dim) {
    if (dim.name === '开篇质量') specificTips.push('开篇第1句需直接切入核心冲突，前200字交代主角身份');
    if (dim.name === '爽点系统') specificTips.push('爽点密度需提升，建议每300字设置一个小爽点');
    if (dim.name === '情绪外化') specificTips.push('减少心理描写，用动作和生理反应外化情绪');
    if (dim.name === '对话质量') specificTips.push('对话需有潜台词，用动作前缀替代"XX说"格式');
    if (dim.name === '钩子设计') specificTips.push('章尾加强悬念设置，每章末尾留追读钩子');
  });
  return {generic: genericTips, specific: specificTips};
}

function getGrade(s) {
  if (s >= 95) return 'S+';
  if (s >= 90) return 'S';
  if (s >= 85) return 'A+';
  if (s >= 80) return 'A';
  if (s >= 75) return 'B+';
  if (s >= 70) return 'B';
  if (s >= 65) return 'C+';
  if (s >= 60) return 'C';
  return 'D';
}

function getGC(s) {
  if (s >= 90) return 's';
  if (s >= 80) return 'a';
  if (s >= 70) return 'b';
  return 'c';
}

// ========== 6d. 完整12维度评价系统（checkEval）==========
function checkEval(ch, idx, work) { var text = ch.content || ''; var len = text.length; var lines = text.split('\n').filter(l => l.trim()); var paras = lines.length; var sentences = text.split(/[。！？]/).filter(s => s.trim()); var isFirst = idx === 0; var firstLine = lines[0] || ''; var first200 = text.slice(0, 200); var first500 = text.slice(0, 500); var last100 = text.slice(-100); var last50 = text.slice(-50); var mkDim = (name, items, id) => ({
    name, items, id,
    score: Math.round(items.reduce((s, it) => s + (it.reverse ? (it.a ? 0 : (it.w || 0)) : ((it.a ? 1 : 0) * (it.w || 0))), 0) / (items.reduce((s, it) => s + (it.w || 0), 0) || 1) * 100)
  }); var quoteMatches = text.match(/["\u201c\u201d\u300c\u300d]([^"\u201c\u201d\u300c\u300d]*?)["\u201c\u201d\u300c\u300d]/g) || []; var quoteCount = quoteMatches.length; var avgQuoteLen = quoteCount > 0 ? quoteMatches.reduce((s, q) => s + q.length, 0) / quoteCount : 0; var climaxWords = ['杀','战','爆','轰','赢','突破','反杀','打脸','震惊','碾压','捏碎','死','败','跪','后悔','恐惧','笑','不敢','怎么可能']; var climaxCount = climaxWords.reducefunction(c, w) { var m = text.match(new RegExp(w, 'g')); return c + (m ? m.length : 0)}, 0); var climaxDensity = len > 0 ? climaxCount / (len / 300) : 0; var hasGrievance = ['忍','退','压','困','逃','躲','怕','辱','欺','逼','没动','低头','咬牙','握拳','发抖','跪','求','哭'].some(w => text.includes(w)); var hasClimax = climaxWords.some(w => text.includes(w)); var d1 = mkDim('开篇质量', [
    {q:'第1句是否出现冲突/危机词汇？', a:['杀','死','血','逃','火','轰','爆','战','追','抓','绑','囚','刑','刺','砍','斩','灭'].some(w => firstLine.includes(w)), w:isFirst ? 2.5 : 1},
    {q:'前200字是否交代主角身份？', a:first200.includes('他') || first200.includes('她') || first200.includes('我') || first200.includes('陈五'), w:isFirst ? 2 : 0.5},
    {q:'前500字是否出现核心矛盾？', a:first500.includes('死') || first500.includes('逃') || first500.includes('战') || first500.includes('杀'), w:isFirst ? 1.5 : 0.5},
    {q:'章尾100字是否有悬念？', a:last100.includes('？') || last100.includes('！') || last100.includes('...') || last100.includes('——'), w:2.5},
    {q:'开篇是否避免大段环境描写（>100字无人物）？', a:!(first200.length > 100 && !first200.includes('他') && !first200.includes('她') && !first200.includes('我')), w:1},
    {q:'开篇是否避免大段背景介绍？', a:!first200.includes('年') || first200.includes('杀') || first200.includes('血'), w:1},
    {q:'第1段是否<=3句？', a:isFirst ? firstLine.split(/[。！？]/).filter(s => s.trim()).length <= 3 : true, w:isFirst ? 1 : 0.5},
    {q:'是否无"首先/众所周知/综上所述"等AI词？', a:!['首先','众所周知','综上所述','值得注意的是'].some(w => first200.includes(w)), w:1}
  ], 'd1'); var d2 = mkDim('爽点系统', [
    {q:'是否有冲突爆发点（杀/战/爆/轰）？', a:['杀','战','爆','轰'].some(w => text.includes(w)), w:2},
    {q:'是否有收获/升级/打脸情节？', a:text.includes('赢') || text.includes('突破') || text.includes('打脸') || text.includes('震惊'), w:1.5},
    {q:'是否有反转/意外？', a:text.includes('没想到') || text.includes('竟然') || text.includes('突然') || text.includes('不料'), w:1.5},
    {q:'是否有"委屈->爆发"完整链路？', a:hasGrievance && hasClimax, w:3},
    {q:'爽点密度是否>=1.0个/300字？', a:climaxDensity >= 1.0, w:2}
  ], 'd2'); var d3 = mkDim('节奏控制', [
    {q:'平均段落长度是否<50字？', a:paras > 0 && len / paras < 50, w:2},
    {q:'是否有>=25%的短段落(<20字)？', a:paras > 0 && lines.filter(l => l.length < 20).length / paras >= 0.25, w:1.5},
    {q:'紧张处是否使用短句独立成段？', a:lines.some(l => l.length < 10 && (l.includes('刀') || l.includes('血') || l.includes('杀'))), w:1.5},
    {q:'章尾是否留白/钩子（未解决冲突）？', a:last100.includes('？') || last100.includes('！') || last100.includes('...') || /[谁什么为什么究竟到底]/.test(last100), w:2.5}
  ], 'd3'); var d4 = mkDim('情绪外化', [
    {q:'是否无"他想/她觉得/心里"等心理描写？', a:!text.includes('他想') && !text.includes('她觉得') && !text.includes('心里') && !text.includes('觉得') && !text.includes('感觉'), w:2.5},
    {q:'是否有手部动作（握拳/发抖/捏碎/指节发白）？', a:text.includes('拳') || text.includes('手') || text.includes('捏') || text.includes('指') || text.includes('掌'), w:1.5},
    {q:'是否有生理反应（冷汗/心跳/血/抖）？', a:text.includes('冷') || text.includes('汗') || text.includes('血') || text.includes('抖') || text.includes('颤') || text.includes('心跳') || text.includes('呼吸'), w:1.5},
    {q:'情绪是否通过动作而非形容词表达？', a:!text.includes('愤怒') && !text.includes('悲伤') && !text.includes('高兴') && !text.includes('痛苦') && !text.includes('开心') && !text.includes('难过'), w:2}
  ], 'd4'); var d5 = mkDim('对话质量', [
    {q:'是否有>=3句对话？', a:quoteCount >= 3, w:1.5},
    {q:'是否使用动作前缀替代"XX说"？', a:!text.includes('说：') && !text.includes('说道：') && !text.includes('说道，'), w:2},
    {q:'对话是否有冲突/对抗？', a:text.includes('不') || text.includes('没') || text.includes('杀') || text.includes('滚') || text.includes('凭什么'), w:1.5},
    {q:'对话是否简短有力（平均<=30字/句）？', a:quoteCount > 0 && avgQuoteLen <= 34, w:1}
  ], 'd5'); var d6 = mkDim('钩子设计', [
    {q:'章尾50字是否有问号/感叹号/省略号？', a:last50.includes('？') || last50.includes('！') || last50.includes('...') || last50.includes('…'), w:2.5},
    {q:'章尾100字是否有悬念词（谁/什么/为什么/究竟）？', a:/[谁什么为什么究竟到底]/.test(last100), w:2},
    {q:'章尾是否未解决核心冲突？', a:!last100.includes('完') && !last100.includes('结束') && !last100.includes('解决') && !last100.includes('完结'), w:1.5},
    {q:'中段是否有>=2个转折词？', a:function() { var c = 0; ['突然','然而','没想到','竟然','不料','谁知','偏偏'].forEach(function(w) {if (text.includes(w)) c++}); return c >= 2})(), w:1.5}
  ], 'd6'); var clichéResult = countClichés(text); var clichéCount = clichéResult.count; var hasClichéFace = clichéResult.details.some(d => CLICHE_PATTERNS.face.some(p => p.ptrn === d.pattern)); var hasClichéSpeech = clichéResult.details.some(d => CLICHE_PATTERNS.speech.some(p => p.ptrn === d.pattern)); var hasClichéTrans = clichéResult.details.some(d => CLICHE_PATTERNS.transition.some(p => p.ptrn === d.pattern)); var d7 = mkDim('原创度', [
    {q:'是否无"首先/其次/综上所述"？', a:!text.includes('首先') && !text.includes('其次') && !text.includes('综上所述'), w:2},
    {q:'是否无"值得注意的是/不得不说"？', a:!text.includes('值得注意的是') && !text.includes('不得不说') && !text.includes('必须承认'), w:1.5},
    {q:'"的"字密度是否<8%？', a:len > 0 && (text.match(/的/g) || []).length / len < 0.08, w:1.5},
    {q:'是否无套路化表情描写？', a:!hasClichéFace, w:2},
    {q:'是否无套路化说话标签？', a:!hasClichéSpeech, w:1.5},
    {q:'是否无套路化过渡句式？', a:!hasClichéTrans, w:1.5},
    {q:'套路化表达总数是否控制在2个以内？', a:clichéCount <= 2, w:1.5}
  ], 'd7'); var d8 = mkDim('结构规范', [
    {q:'字数是否在1500-5000字？', a:len >= 1500 && len <= 5000, w:2.5},
    {q:'是否无连续逗号/句号/空格错误？', a:!text.includes('，，') && !text.includes('。。') && !text.includes('  '), w:1.5}
  ], 'd8'); var d9 = mkDimfunction('人物一致', [
    {q:'主角行为是否符合人设（无OOC）？', a:(() {
      if (!work.chars) return true; var ok = true; var chars = work.chars;
      if (chars.includes('冷静') && (text.includes('大吼') || text.includes('尖叫') || text.includes('暴怒'))) ok = false;
      if (chars.includes('隐忍') && (text.includes('暴怒') || text.includes('发疯') || text.includes('失控'))) ok = false;
      if (chars.includes('善良') && (text.includes('残忍') || text.includes('虐杀'))) ok = false;
      if (chars.includes('高傲') && (text.includes('下跪') || text.includes('求饶'))) ok = false;
      return ok;
    })(), w:2.5}
  ], 'd9'); var d10 = mkDimfunction('逻辑自治', [
    {q:'时间跳转是否<=3处？', a:(() { var c = 0; ['三天后','一周后','一月后','一年后','次日','翌日','三天过去','几天过去'].forEach(function(t) {if (text.includes(t)) c++}); return c <= 3})(), w:1.5},
    {q:'战力是否无崩坏？', a:!text.includes('秒杀') || text.includes('苦战') || text.includes('险胜') || text.includes('惨胜'), w:1.5}
  ], 'd10'); var d11 = mkDim('追读潜力', [
    {q:'章尾是否有"卡脖子"感？', a:last50.includes('？') || last50.includes('！') || last50.includes('...') || /[谁什么为什么究竟到底]/.test(last50), w:2.5},
    {q:'中段是否有追读钩子（每800字一个悬念）？', a:function() { var h = ['突然','然而','没想到','竟然','谁知','不料','偏偏','却']; var c = 0; h.forEach(function(w) {if (text.includes(w)) c++});
      return len > 0 && c >= Math.max(2, Math.floor(len / 800));
    })(), w:2}
  ], 'd11'); var d12 = mkDim('平台适配', [
    {q:'起点适配：字数2500-4000+开篇冲突+爽点？', a:len >= 2500 && len <= 4000 && d1.score >= 60 && d2.score >= 60, w:2},
    {q:'番茄适配：字数1500-3000+节奏快+爽点密集？', a:len >= 1500 && len <= 3000 && d3.score >= 60 && d2.score >= 60, w:2}
  ], 'd12'); var dimScores = {d1:d1.score,d2:d2.score,d3:d3.score,d4:d4.score,d5:d5.score,d6:d6.score,d7:d7.score,d8:d8.score,d9:d9.score,d10:d10.score,d11:d11.score,d12:d12.score}; var platform = work.settings && work.settings.platform ? work.settings.platform : 'general'; var genreVal = work.settings && work.settings.genre ? work.settings.genre : 'xianxia'; var genreWeights = getGenreEvalWeights(genreVal, platform); var dimWeights = genreWeights || (platform === 'qidian' ? {d1:0.12,d2:0.14,d3:0.10,d4:0.09,d5:0.06,d6:0.11,d7:0.07,d8:0.06,d9:0.07,d10:0.05,d11:0.09,d12:0.04} : {d1:0.10,d2:0.12,d3:0.10,d4:0.10,d5:0.07,d6:0.10,d7:0.08,d8:0.07,d9:0.07,d10:0.06,d11:0.08,d12:0.05});

  // 黄金三章：前3章自动提高开篇和爽点权重
  if (idx <= 2) {
    dimWeights = JSON.parse(JSON.stringify(dimWeights));
    dimWeights.d1 += 0.08; // 开篇质量权重+8%
    dimWeights.d2 += 0.05; // 爽点权重+5%
    dimWeights.d6 += 0.03; // 钩子权重+3%
    // 归一化
    var sum = Object.values(dimWeights).reduce((a,b)=>a+b,0);
    for ( var k in dimWeights) dimWeights[k] /= sum;
  }

  var totalScore = Math.round(
    d1.score*dimWeights.d1 + d2.score*dimWeights.d2 + d3.score*dimWeights.d3 +
    d4.score*dimWeights.d4 + d5.score*dimWeights.d5 + d6.score*dimWeights.d6 +
    d7.score*dimWeights.d7 + d8.score*dimWeights.d8 + d9.score*dimWeights.d9 +
    d10.score*dimWeights.d10 + d11.score*dimWeights.d11 + d12.score*dimWeights.d12
  );

  return {total:totalScore, dimScores, dims:[d1,d2,d3,d4,d5,d6,d7,d8,d9,d10,d11,d12], len, paras, climaxDensity, quoteCount, clichéCount, clichéDetails:clichéResult.details};
}

// ========== 7. 导出到全局 ==========
window.ContentGenerator = ContentGenerator;
window.PolishEngine = PolishEngine;
window.EvaluateEngine = EvaluateEngine;
window.WritingHelper = WritingHelper;
window.TextChecker = TextChecker;
window.GENRE_STYLES = GENRE_STYLES;
window.LOCAL_TEMPLATES = LOCAL_TEMPLATES;
window.WORLD_DATABASE = WORLD_DATABASE;
window.NAME_DATABASE = NAME_DATABASE;
window.CLICHE_PATTERNS = CLICHE_PATTERNS;
window.countClichés = countClichés;
window.NOVEL_GENRES = NOVEL_GENRES;
window.GENRE_EVAL_WEIGHTS = GENRE_EVAL_WEIGHTS;
window.getGenreEvalWeights = getGenreEvalWeights;
window.getGenreEvalTips = getGenreEvalTips;
window.getGrade = getGrade;
window.getGC = getGC;
window.checkEval = checkEval;
