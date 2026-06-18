// quality.js v53 — 5种类型独立评价引擎
// 正文 / 世界观 / 人设 / 大纲 / 细纲 — 各自独立维度，互不混淆
// 暴露 window.QualityEngine：evaluate / evaluateText / evaluateWorld / evaluateChars / evaluateOutline / evaluateDetail
// 兼容旧 API：score / attach / lastHints / analyzeChapter / learnFromEdit
(function () {
  'use strict';

  // ============ 工具函数 ============
  function countMatches(text, re) {
    try { var m = text.match(re); return m ? m.length : 0; } catch (e) { return 0; }
  }

  function clampScore(v) { return Math.max(0, Math.min(10, Math.round(v))); }

  // ============ 1. 正文评价（12维度）============
  function evaluateText(content, work) {
    if (!content || !content.trim()) return _emptyResult('text');
    var len = content.length;
    var dims = [];
    var allIssues = [], allStrengths = [];

    // D1: 开篇吸引力（10分）
    var head = content.slice(0, 350);
    var headConflict = /(冲突|质问|怒|杀|逼|拦|跪|退婚|危机|尸体|线索|警报|敌|赌|证据|命令|圣旨|追杀|血|撞|碎|裂|断|惊|怕|危险|爆炸|抓|推|刀|剑|拳|掌|冷|喝|斥)/.test(head);
    var d1 = { name: '开篇吸引力', score: 6, max: 10, weight: 0.12, issues: [], strengths: [] };
    if (headConflict) { d1.score = 9; d1.strengths.push('开篇有冲突/悬念'); }
    else if (/(问道|问道|说道|说|道|介绍|说明|从前|在很久)/.test(head.slice(0, 80))) { d1.score = 3; d1.issues.push('开篇偏平，以对话或说明开头'); }
    else { d1.score = 5; d1.issues.push('开篇冲突不够明确，建议前300字内出现冲突'); }
    dims.push(d1);

    // D2: 章尾钩子（10分）
    var tail = content.slice(-350);
    var hookStrong = /(然而|可|却|就在这时|下一秒|忽然|突然|谁也没想到|门外|身后|真正|不是|只听|传来|出现|脸色一变|问题是|秘密|原来|只是|竟然|居然|不好|糟了|该死|三下敲|又两下|停了停)/.test(tail);
    var d2 = { name: '章尾钩子', score: 6, max: 10, weight: 0.12, issues: [], strengths: [] };
    if (hookStrong) { d2.score = 9; d2.strengths.push('章尾有悬念钩子'); }
    else { d2.score = 3; d2.issues.push('章尾缺钩子，读者不会点"下一章"'); }
    dims.push(d2);

    // D3: 对话质量（10分）
    var dialogCount = (content.match(/[“"][^”"]{2,}[”"]/g) || []).length;
    var d3 = { name: '对话质量', score: 6, max: 10, weight: 0.10, issues: [], strengths: [] };
    if (len >= 1000) {
      if (dialogCount >= 4 && dialogCount <= 20) { d3.score = 8; d3.strengths.push('对话密度适中(' + dialogCount + '处)'); }
      else if (dialogCount === 0) { d3.score = 2; d3.issues.push('缺少对话，人物没有互动'); }
      else if (dialogCount > 25) { d3.score = 4; d3.issues.push('对话过多(' + dialogCount + '处)，叙述不足'); }
    }
    // 对话潜台词
    var subtextCount = countMatches(content, /(沉默|没有回答|移开目光|攥紧|咬唇|别过头|欲言又止|话到嘴边|摸耳垂|清嗓子|端起茶|放下茶)/g);
    if (subtextCount >= 2) { d3.score = Math.min(10, d3.score + 1); d3.strengths.push('对话有潜台词'); }
    dims.push(d3);

    // D4: 动作描写（10分）
    var actionCount = countMatches(content, /(抬手|转身|逼近|后退|拔|挥|砸|按住|盯|踏|冲|挡|推开|抓住|扣|扑|跃|闪|退|停|喝|甩|扔|推|击|刺|砍|劈|躲|攥|握|捏|拍|踢|踹|掐|拖|拽|扯|撕|抄|掏|抹|擦|捂|抚|触|戳|捅|拨|弹|敲|叩)/g);
    var d4 = { name: '动作描写', score: 6, max: 10, weight: 0.08, issues: [], strengths: [] };
    if (len >= 1000) {
      if (actionCount >= 8) { d4.score = 8; d4.strengths.push('动作调度丰富(' + actionCount + '处)'); }
      else if (actionCount < 4) { d4.score = 3; d4.issues.push('动作描写偏少，场景缺乏动感'); }
    }
    dims.push(d4);

    // D5: 感官描写（10分）
    var sensoryCount = countMatches(content, /(闻到|听到|看到|摸到|尝到|刺鼻|震耳|滚烫|冰凉|粗糙|光滑|腥味|焦味|嗡鸣|回响|金属味|血腥味|青草味|灰尘味|腐臭|酸味|甜味|苦涩|潮湿|燥热|阴冷|闷热|刺骨|灼热)/g);
    var d5 = { name: '感官描写', score: 5, max: 10, weight: 0.06, issues: [], strengths: [] };
    if (len >= 1000) {
      if (sensoryCount >= 3) { d5.score = 8; d5.strengths.push('感官细节丰富(' + sensoryCount + '处)'); }
      else { d5.score = 3; d5.issues.push('感官描写偏少，场景不够立体'); }
    }
    dims.push(d5);

    // D6: 情绪张力（10分）
    var microActionCount = countMatches(content, /(指尖发白|咬紧后槽牙|声音压低|嘴角抽动|喉结滚动|手指摩挲|攥紧杯沿|耳尖泛红|指腹蹭过|视线躲闪|背对着人|空玻璃杯擦|攥紧拳|别过头|移开目光)/g);
    var directEmoCount = countMatches(content, /(他很紧张|他很愤怒|他很伤心|他很害怕|她很紧张|她很愤怒|她很伤心|他非常紧张|她非常愤怒|心里很紧张|他真是紧张)/g);
    var d6 = { name: '情绪张力', score: 6, max: 10, weight: 0.10, issues: [], strengths: [] };
    if (microActionCount >= 2) { d6.score = 8; d6.strengths.push('冰山微动作藏情绪(' + microActionCount + '处)'); }
    if (directEmoCount > 0) { d6.score -= 2; d6.issues.push('直白情绪词(' + directEmoCount + '处)，应改为微动作外化'); }
    if (d6.score < 4) d6.issues.push('情绪描写薄弱，缺乏张力');
    dims.push(d6);

    // D7: 节奏控制（10分）
    var paragraphs = content.split(/\n\s*\n/).filter(function(p) { return p.trim().length > 20; });
    var avgParaLen = paragraphs.length > 0 ? Math.round(len / paragraphs.length) : 0;
    var longParas = paragraphs.filter(function(p) { return p.length > 500; }).length;
    var d7 = { name: '节奏控制', score: 6, max: 10, weight: 0.08, issues: [], strengths: [] };
    if (avgParaLen > 0 && avgParaLen <= 200) { d7.score = 8; d7.strengths.push('段落节奏紧凑'); }
    else if (avgParaLen > 400) { d7.score = 3; d7.issues.push('段落过长，节奏拖沓'); }
    if (longParas > 0) { d7.score -= 1; d7.issues.push(longParas + '段超长(>500字)'); }
    dims.push(d7);

    // D8: 文笔水平（10分）
    var poisonHits = [];
    var poisonPatterns = [
      { name: '空洞震惊', re: /(众人震惊|全场震惊|所有人都惊呆了|一片哗然|全场哗然)/g },
      { name: 'AI腔心理', re: /(他的内心五味杂陈|心中百感交集|空气仿佛凝固|时间仿佛静止|他心中暗想|不禁感叹|心中暗道|暗自思忖)/g },
      { name: '万能形容', re: /(极其强大|无比恐怖|深不可测|不可名状|难以言喻)/g },
      { name: '空泛推进', re: /(事情变得复杂起来|一切才刚刚开始|命运的齿轮开始转动|真正的挑战才刚刚开始)/g },
      { name: '高频动作套', re: /(嘴角勾起|眼神一冷|瞳孔一缩|眉头一皱|目光如炬)/g }
    ];
    poisonPatterns.forEach(function(p) {
      var cnt = countMatches(content, p.re);
      if (cnt >= 2) poisonHits.push(p.name + 'x' + cnt);
    });
    var d8 = { name: '文笔水平', score: 7, max: 10, weight: 0.08, issues: [], strengths: [] };
    if (poisonHits.length === 0) { d8.strengths.push('无模板化表达'); }
    else { d8.score = Math.max(2, 7 - poisonHits.length * 2); d8.issues.push('模板化：' + poisonHits.join('、')); }
    dims.push(d8);

    // D9: 信息密度（10分）
    var infoSignals = countMatches(content, /(发现|揭示|原来|真相|秘密|证据|线索|突破|变化|改变|新|首|初|意外|突然|竟然|终于|不过|可惜)/g);
    var infoPer500 = len >= 500 ? Math.round(infoSignals / (len / 500)) : 0;
    var d9 = { name: '信息密度', score: 6, max: 10, weight: 0.06, issues: [], strengths: [] };
    if (infoPer500 >= 3) { d9.score = 8; d9.strengths.push('信息密度高(' + infoPer500 + '/500字)'); }
    else if (infoPer500 < 1) { d9.score = 3; d9.issues.push('信息密度低，可能水字数'); }
    dims.push(d9);

    // D10: 剧情契合度（10分）— 需要 work 上下文
    var d10 = { name: '剧情契合度', score: 7, max: 10, weight: 0.08, issues: [], strengths: [] };
    if (work && work.detail) {
      var detailLines = work.detail.split('\n').filter(Boolean);
      if (detailLines.length > 0) {
        d10.strengths.push('有细纲对照');
      } else {
        d10.issues.push('无细纲无法评估契合度');
      }
    } else {
      d10.issues.push('无细纲无法评估契合度');
    }
    dims.push(d10);

    // D11: 角色表现（10分）
    var d11 = { name: '角色表现', score: 6, max: 10, weight: 0.06, issues: [], strengths: [] };
    if (work && work.chars) {
      var nameRE = /[【\[<]?([\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5A-Za-z0-9]{1,7})[】\]>]?\s*[：(]/g;
      var nm, usedNames = [];
      while ((nm = nameRE.exec(work.chars)) !== null) {
        if (nm[1] && nm[1].length >= 2 && nm[1].length <= 4 && usedNames.indexOf(nm[1]) === -1) usedNames.push(nm[1]);
      }
      if (usedNames.length > 0) {
        var appeared = usedNames.filter(function(n) { return content.indexOf(n) >= 0; });
        if (appeared.length >= 2) { d11.score = 8; d11.strengths.push('角色出场(' + appeared.length + '/' + usedNames.length + ')'); }
        else if (appeared.length === 0 && len > 1000) { d11.score = 3; d11.issues.push('未检测到人设角色出场'); }
      }
    }
    dims.push(d11);

    // D12: 原创性（10分）
    var clicheCount = countMatches(content, /(嘴角勾起|眼神一冷|瞳孔一缩|心中暗道|心头一颤|脸色一变|倒吸一口凉气|目光如炬|不怒自威|霸气侧漏)/g);
    var d12 = { name: '原创性', score: 7, max: 10, weight: 0.06, issues: [], strengths: [] };
    if (clicheCount <= 1) { d12.strengths.push('套路化表达少'); }
    else if (clicheCount >= 3) { d12.score = 4; d12.issues.push('套路化表达偏多(' + clicheCount + '处)'); }
    dims.push(d12);

    // 汇总
    var totalScore = 0;
    dims.forEach(function(d) { totalScore += d.score * d.weight; });
    totalScore = Math.round(totalScore / dims.reduce(function(s, d) { return s + d.weight; }, 0) * 10); // 转为百分制
    dims.forEach(function(d) { allIssues = allIssues.concat(d.issues); allStrengths = allStrengths.concat(d.strengths); });

    return {
      type: 'text', moduleName: '正文', totalScore: clampScore(totalScore / 10) * 10, grade: _grade(totalScore),
      dimensions: dims, issues: allIssues.slice(0, 12), strengths: allStrengths.slice(0, 10),
      suggestions: _genSuggestions(dims),
      details: { length: len, dialogCount: dialogCount, actionCount: actionCount, sensoryCount: sensoryCount, microActionCount: microActionCount, avgParaLen: avgParaLen },
      updatedAt: Date.now()
    };
  }

  // ============ 2. 世界观评价（6维度）============
  function evaluateWorld(content) {
    if (!content || !content.trim()) return _emptyResult('world');
    var len = content.length;
    var dims = [];

    var d1 = { name: '设定完整度', score: 6, max: 10, weight: 0.20, issues: [], strengths: [] };
    if (/(力量体系|修炼体系|魔法体系|科技体系|灵气|内力|法力|魔力|基因|纳米|量子)/.test(content)) d1.strengths.push('有力量体系');
    if (/(势力|门派|家族|国家|组织|联盟|帝国|王国|公会|帮派|宗门|世家)/.test(content)) d1.strengths.push('有势力结构');
    if (!/(代价|限制|规则|约束|瓶颈|天花板|副作用|反噬|代价|缺陷|弱点|短板|克星|天敌)/.test(content)) { d1.score -= 2; d1.issues.push('缺少"代价/限制"——力量体系必须有规则和代价'); }
    if (d1.strengths.length >= 2) d1.score = 8;
    dims.push(d1);

    var d2 = { name: '独特创新', score: 5, max: 10, weight: 0.18, issues: [], strengths: [] };
    if (/(四大神兽|五行|元素|斗气|魔法|魔力|灵气|内功|金木水火土|风火水土)/.test(content)) { d2.score -= 2; d2.issues.push('使用了传统元素，建议增加独特变体'); }
    if (/(独特|特殊|变异|扭曲|污染|异化|融合|嫁接|改造|变异|诡异|怪诞|奇异|扭曲|禁术|邪术|秘术|传承|血脉|天赋|觉醒|进化|蜕变)/.test(content)) d2.strengths.push('有独特设定元素');
    if (len >= 1000) d2.score = Math.min(10, d2.score + 1);
    dims.push(d2);

    var d3 = { name: '冲突张力', score: 5, max: 10, weight: 0.18, issues: [], strengths: [] };
    if (/(矛盾|冲突|对立|战争|争斗|竞争|掠夺|资源|争夺|霸权|统治|反抗|压迫|不公|阶级|仇恨|世仇|恩怨|宿敌|对手|死敌|敌对|威胁|危机|末日|灾难|浩劫)/.test(content)) d3.strengths.push('有冲突源');
    if (/(平衡|共存|制衡|牵制|博弈|僵局|均势|妥协|协议|盟约|停战|和平|共存)/.test(content)) d3.strengths.push('有势力平衡');
    if (d3.strengths.length === 0) { d3.score = 3; d3.issues.push('缺少冲突源和势力矛盾，世界缺乏戏剧张力'); }
    else d3.score = 7;
    dims.push(d3);

    var d4 = { name: '社会结构', score: 5, max: 10, weight: 0.16, issues: [], strengths: [] };
    if (/(阶层|等级|阶级|贵族|平民|奴隶|自由民|身份|地位|出身|血统|天赋|资质|品级|阶级固化|上升通道)/.test(content)) d4.strengths.push('有阶层设计');
    if (/(经济|货币|贸易|市场|资源|矿产|粮食|特产|商路|交易|流通|财富|贫富|税收|赋税)/.test(content)) d4.strengths.push('有经济体系');
    if (d4.strengths.length === 0) { d4.score = 3; d4.issues.push('缺少社会结构和经济体系'); }
    else d4.score = 7;
    dims.push(d4);

    var d5 = { name: '叙事潜力', score: 5, max: 10, weight: 0.16, issues: [], strengths: [] };
    if (/(秘密|谜团|传说|预言|遗迹|宝藏|秘境|禁地|封印|诅咒|上古|远古|失落|毁灭|重启|轮回|转世|宿命|命运|使命|天选|预言者|救世主|终焉|末法|末路|新生|重铸|重建)/.test(content)) d5.strengths.push('有叙事驱动元素');
    if (len >= 800) d5.score = 7;
    if (d5.strengths.length === 0) { d5.score = 3; d5.issues.push('缺少故事驱动元素（秘密/预言/遗迹等）'); }
    dims.push(d5);

    var d6 = { name: '篇幅合理', score: 7, max: 10, weight: 0.12, issues: [], strengths: [] };
    if (len >= 600 && len <= 3000) d6.strengths.push('篇幅合理');
    else if (len < 600) { d6.score = 4; d6.issues.push('篇幅偏短'); }
    else { d6.score = 5; d6.issues.push('篇幅偏长'); }
    dims.push(d6);

    return _buildResult('world', '世界观', dims, content, len);
  }

  // ============ 3. 人设评价（6维度）============
  function evaluateChars(content) {
    if (!content || !content.trim()) return _emptyResult('chars');
    var len = content.length;
    var dims = [];

    var d1 = { name: '人物立体度', score: 6, max: 10, weight: 0.20, issues: [], strengths: [] };
    if (/(动机|欲望|想要|追求|目标|梦想|野心|执念|信念|信仰|原则|底线|软肋|弱点|缺陷|短板|恐惧|害怕|逃避|隐藏|隐瞒|秘密|过去|往事|创伤|阴影|童年|来历)/.test(content)) d1.strengths.push('有动机/弱点/背景');
    if (/(成长|变化|改变|蜕变|觉醒|领悟|转折|醒悟|看透|放下|拿起|坚持|放弃|选择|代价|牺牲|换取|交换|交易|背叛|忠诚|信任|怀疑|试探|考验|抉择)/.test(content)) d1.strengths.push('有角色弧光空间');
    if (d1.strengths.length >= 2) d1.score = 8;
    else if (d1.strengths.length === 0) { d1.score = 3; d1.issues.push('人物缺少动机/弱点/弧光，趋于扁平'); }
    dims.push(d1);

    var d2 = { name: '关系网络', score: 5, max: 10, weight: 0.18, issues: [], strengths: [] };
    var nameCount = (content.match(/[\u4e00-\u9fa5]{2,4}(?=\s*[（(]|：|:|\n|$)/g) || []).length;
    if (nameCount >= 4) d2.strengths.push('人物识别正常(' + nameCount + '个)');
    if (/(朋友|敌人|对手|盟友|导师|徒弟|家人|爱人|恋人|仇人|情敌|竞争者|同事|上下级|主仆|搭档|同伴|伙伴|知音|知己|恩人|仇家)/.test(content)) d2.strengths.push('有明确关系描述');
    if (d2.strengths.length >= 2) d2.score = 8;
    else { d2.score = 3; d2.issues.push('人物关系网络不明显'); }
    dims.push(d2);

    var d3 = { name: '反派/对抗力', score: 5, max: 10, weight: 0.16, issues: [], strengths: [] };
    if (!/(反派|对手|敌人|敌对|仇敌|死敌|威胁|幕后|黑手|操控|阴谋|boss|BOSS|魔头|魔王|枭雄|霸主|强者|高手|劲敌|怪物|异形|邪神|恶魔|妖|魔|鬼|怪|邪|恶|暗|黑)/.test(content)) {
      d3.score = 3; d3.issues.push('缺少明确的反派/对抗力量');
    } else { d3.score = 7; d3.strengths.push('有反派/对抗力'); }
    dims.push(d3);

    var d4 = { name: '角色差异化', score: 5, max: 10, weight: 0.16, issues: [], strengths: [] };
    // 检测是否有不同性格/外貌/背景关键词
    var diffKeywords = /(性格|外向|内向|暴躁|温和|冷静|冲动|谨慎|大胆|狡猾|正直|阴险|聪明|愚笨|勇敢|懦弱|善良|残忍|乐观|悲观|沉默|话多|活泼|沉闷)/g;
    var diffCount = countMatches(content, diffKeywords);
    if (diffCount >= 3) { d4.score = 8; d4.strengths.push('有性格差异化描述'); }
    else if (diffCount >= 1) { d4.score = 6; }
    else { d4.score = 3; d4.issues.push('角色之间缺乏差异化描述'); }
    dims.push(d4);

    var d5 = { name: '情感共鸣', score: 5, max: 10, weight: 0.16, issues: [], strengths: [] };
    if (/(共鸣|代入|共情|心疼|感动|愤怒|同情|厌恶|喜欢|憎恨|敬佩|鄙视|羡慕|嫉妒|恨|爱|怜|惜|叹|哀|悲|喜|怒|惊|恐|忧|愁|痛|苦|煎|熬|挣扎|无助|孤独|温暖|希望|力量|勇气|选择|放弃|坚持)/.test(content)) d5.strengths.push('有情感共鸣元素');
    if (d5.strengths.length > 0) d5.score = 7; else { d5.score = 4; d5.issues.push('缺少情感共鸣设计'); }
    dims.push(d5);

    var d6 = { name: '篇幅合理', score: 7, max: 10, weight: 0.14, issues: [], strengths: [] };
    if (len >= 400 && len <= 2000) d6.strengths.push('篇幅合理');
    else if (len < 400) { d6.score = 4; d6.issues.push('篇幅偏短，每个人物至少200字'); }
    dims.push(d6);

    return _buildResult('chars', '人设', dims, content, len);
  }

  // ============ 4. 大纲评价（6维度）============
  function evaluateOutline(content) {
    if (!content || !content.trim()) return _emptyResult('outline');
    var len = content.length;
    var dims = [];

    var d1 = { name: '结构清晰', score: 6, max: 10, weight: 0.20, issues: [], strengths: [] };
    var juanCount = (content.match(/第[一二三四五六七八九十\d]+卷|卷[一二三四五六七八九十\d]+|第[一二三四五六七八九十\d]+幕/g) || []).length;
    if (juanCount >= 3) { d1.score = 9; d1.strengths.push('分卷结构清晰(' + juanCount + '卷)'); }
    else if (juanCount >= 1) { d1.score = 7; d1.strengths.push('有分卷结构'); }
    else { d1.score = 3; d1.issues.push('缺少分卷/分幕结构'); }
    dims.push(d1);

    var d2 = { name: '节奏把控', score: 5, max: 10, weight: 0.18, issues: [], strengths: [] };
    if (/(高潮|转折|爆点|揭秘|逆转|反转|冲突升级|决斗|大战|对决|最终|决战|结局|终局|收尾|铺垫|伏笔|暗线|明线|支线|主线|高潮|低谷|起承转合|蓄力|爆发|冷却|缓冲|过渡)/.test(content)) d2.strengths.push('有节奏节点');
    if (/(高潮|爆点|逆转|揭秘)/.test(content) && (content.match(/(高潮|爆点|逆转|揭秘)/g) || []).length >= 2) d2.score = 8;
    else if (d2.strengths.length > 0) d2.score = 6;
    else { d2.score = 3; d2.issues.push('缺少高潮/转折节奏安排'); }
    dims.push(d2);

    var d3 = { name: '伏笔设计', score: 5, max: 10, weight: 0.16, issues: [], strengths: [] };
    if (/(伏笔|暗示|铺垫|隐藏|暗线|伏线|回收|呼应|照应|对应|首尾呼应|前后照应|埋线|揭线|线索|谜底|答案|揭示|真相|才发现|原来|竟然|居然|其实|就是|就是他就是|凶手是|幕后|操控|真面目|身份|身世|来历|渊源|因果|报应|宿命|天意|人为|巧合|必然|偶然)/.test(content)) d3.score = 8;
    else { d3.score = 3; d3.issues.push('缺少伏笔/暗线设计'); }
    dims.push(d3);

    var d4 = { name: '主线清晰', score: 5, max: 10, weight: 0.16, issues: [], strengths: [] };
    if (/(主线|核心|目标|任务|使命|冒险|旅程|征途|探索|追查|复仇|寻找|守护|拯救|建立|推翻|恢复|改变|逃离|归来|回家|登顶|称霸|统一|分裂|独立|自由|解放|救赎|赎罪|证明|超越|突破|成为|战胜|击败|消灭|收服|收编|联合|结盟|对抗|抵抗|反攻|反击|逆袭|翻盘|崛起|陨落|升迁|贬谪|流放|回归)/.test(content)) d4.score = 8;
    else { d4.score = 3; d4.issues.push('主线不够明确'); }
    dims.push(d4);

    var d5 = { name: '冲突递进', score: 5, max: 10, weight: 0.16, issues: [], strengths: [] };
    if (/(升级|加剧|恶化|扩大|蔓延|扩散|失控|爆发|决裂|底线|摊牌|最后通牒|背水一战|殊死|你死我活|鱼死网破|不是你死就是我亡|势不两立|不共戴天|血海深仇|深仇大恨|新仇旧恨|恩恩怨怨|因果循环|冤冤相报|冤家路窄|狭路相逢|势均力敌|难分胜负|不分伯仲|旗鼓相当|针锋相对|寸步不让|步步紧逼|得寸进尺|赶尽杀绝|斩草除根|不留后患|斩尽杀绝|一网打尽|一网成擒|一劳永逸|永绝后患)/.test(content)) d5.score = 8;
    else { d5.score = 3; d5.issues.push('冲突缺少递进升级设计'); }
    dims.push(d5);

    var d6 = { name: '商业价值', score: 6, max: 10, weight: 0.14, issues: [], strengths: [] };
    if (/(爽点|打脸|装逼|逆袭|翻盘|扮猪吃虎|越级|越阶|越级挑战|越阶战斗|碾压|秒杀|横扫|无敌|开挂|外挂|作弊|系统|金手指|奇遇|传承|机缘|机遇|运气|福缘|造化|机缘巧合|天降正义|天降宝物|天上掉馅饼|白捡|捡漏|捡宝|探险|夺宝|比赛|传承|考核|试炼|选拔|大比|竞赛|拍卖|商战|谋略|计谋|布局|算计|智商|碾压|降维|碾压智商|智商碾压|信息差|降维打击|知识碾压|技术碾压|认知碾压|眼帘|视角|格局|眼界|格局打开|大开眼界|长见识|刷新认知|颠覆认知|重塑三观|打破常识|不可思议|难以置信|不敢置信|难以置信|无法想象|超乎想象|超越想象|突破想象|刷新想象|颠覆想象|打开新世界|开启新纪元|开启新时代|开创|开拓|创新|革新|革命|颠覆|突破|首创|领先|独创|独家|唯一|第一|首次|始|元|祖|宗|源|本|根|底|基石|根基|根本|基础|底层|顶层|架构|生态|体系|系统|世界观|宇宙|位面|维度|次元|时空|平行|交叠|重叠|交错|穿插|嵌套|套娃|递归|循环|轮回|无限|无尽|永恒|永恒轮回|无尽循环|周而复始|生生不息|永无止境|无边无际|无穷无尽)/.test(content)) d6.score = 8;
    else { d6.score = 4; d6.issues.push('缺少爽点/名场面/商业价值设计'); }
    dims.push(d6);

    return _buildResult('outline', '大纲', dims, content, len);
  }

  // ============ 5. 细纲评价（6维度）============
  function evaluateDetail(content) {
    if (!content || !content.trim()) return _emptyResult('detail');
    var len = content.length;
    var dims = [];
    var chapterCount = (content.match(/第[\d一二三四五六七八九十百零两]+章/g) || []).length;

    var d1 = { name: '章节连贯', score: 6, max: 10, weight: 0.20, issues: [], strengths: [] };
    if (chapterCount >= 8) { d1.strengths.push('章节数量充足(' + chapterCount + '章)'); d1.score = 8; }
    else if (chapterCount >= 3) { d1.score = 6; d1.strengths.push('有基本章节结构'); }
    else { d1.score = 3; d1.issues.push('章节数偏少'); }
    // 检查格式一致性
    var pipeCount = (content.match(/\|/g) || []).length;
    if (chapterCount > 0 && pipeCount >= chapterCount) { d1.score = Math.min(10, d1.score + 1); d1.strengths.push('格式规范'); }
    dims.push(d1);

    var d2 = { name: '钩子密度', score: 5, max: 10, weight: 0.18, issues: [], strengths: [] };
    var hookCount = countMatches(content, /(原来|其实|秘密|真正|不仅|更|可|却|谁也没想到|就在这时|突然|意外|竟然|居然|反转|逆转|揭秘|真相|才发现|这才知道|才明白|终于|最终|结局|谜底|揭开|揭晓|暴露|出现|现身|降临|到来|到来之际|危险|危机|威胁|逼近|临近|将至|迫在眉睫|千钧一发|惊险|危急|紧急|紧迫|刻不容缓|争分夺秒|分秒必争|时不我待|机不可失|时不再来|错过|抓住|把握|利用|趁机|借机|乘机|趁势|顺势|趁虚而入|乘虚而入|可乘之机|有机可乘)/g);
    if (chapterCount > 0 && hookCount >= chapterCount) { d2.score = 8; d2.strengths.push('钩子密度充足'); }
    else if (hookCount >= 3) { d2.score = 6; }
    else { d2.score = 3; d2.issues.push('钩子密度不足，每章结尾应有悬念'); }
    dims.push(d2);

    var d3 = { name: '信息释放', score: 5, max: 10, weight: 0.16, issues: [], strengths: [] };
    if (/(揭示|揭露|透露|暴露|展现|展示|呈现|浮现|浮出|浮出水面|水落石出|真相大白|层层推进|逐步|渐进|渐次|依次|轮流|交替|轮番|先后|先|后|先是|接着|然后|而后|再|才|又|还|也|还|更|最|更加|最为|尤为|尤其|特别|格外|异常|异乎寻常|出奇|与众不同|独具一格|别具一格|独一无二|史无前例|前所未有|前所未闻|闻所未闻|见所未见|想象不到|意想之外|意料之外|出乎意料|始料未及|始料不及|猝不及防|措手不及|防不胜防)./.test(content)) d3.score = 7;
    if (/(堆砌|集中|大量|一次性|突然|猛然|骤然|陡然|遽然|蓦然|倏忽|刹那|瞬间|片刻|霎时|转瞬|转眼|须臾|弹指|一瞬|一刹那|一瞬间|一眨眼|一刻|片刻间|转眼间|一瞬间|瞬间|刹那|片刻|霎时|转瞬|须臾|弹指|弹指间|眨眼间|转瞬间|转瞬之间|一瞬之间|一瞬间|弹指之间|挥手之间|举手之间|投足之间|俯仰之间|俯仰之间|呼吸之间|一呼一吸|一呼一吸之间)/.test(content)) { d3.score -= 1; d3.issues.push('信息释放可能有堆砌风险'); }
    if (d3.score < 5) d3.issues.push('信息释放节奏不够有序');
    dims.push(d3);

    var d4 = { name: '节奏控制', score: 5, max: 10, weight: 0.16, issues: [], strengths: [] };
    if (/(高潮|低潮|低谷|缓冲|过渡|铺垫|爆发|蓄力|高潮迭起|一波三折|跌宕起伏|张弛有度|松紧有度|紧松交替|一张一弛|一紧一松|一松一紧|时紧时松|忽紧忽松|急缓相间|快慢结合|虚实相生|阴阳|动静|快慢|快慢|急缓|轻重|缓急|轻重缓急|详略|详略得当|疏密|疏密有致|有详有略|有疏有密)/.test(content)) d4.score = 7; d4.strengths.push('有节奏变化');
    if (chapterCount > 0) {
      var avgChapLen = Math.round(len / chapterCount);
      if (avgChapLen > 300) { d4.issues.push('每章平均' + avgChapLen + '字，可能过长'); d4.score -= 1; }
      if (avgChapLen < 50) { d4.issues.push('每章平均' + avgChapLen + '字，可能过短'); d4.score -= 1; }
    }
    dims.push(d4);

    var d5 = { name: '爽点分布', score: 5, max: 10, weight: 0.16, issues: [], strengths: [] };
    if (/(爽点|打脸|逆袭|翻盘|碾压|秒杀|装逼|扮猪吃虎|越级|越阶|突破|觉醒|传承|机缘|奇遇|宝藏|夺宝|比赛|试炼|选拔|大比|考核|拍卖|赌约|打赌|赌局|对决|决战|复仇|报仇|雪恨|洗刷|平反|昭雪|翻身|打脸|啪啪打脸|啪啪啪|打脸啪啪|啪啪啪啪|打脸打得啪啪响|啪啪作响|啪啪直响|啪啪声|啪啪声不绝|啪啪声不断|啪啪声不停|啪啪声不绝于耳|啪啪声此起彼伏|啪啪声连绵不绝|啪啪声不绝于耳|啪啪声接连不断|啪啪声接二连三|啪啪声接踵而至|啪啪声此起彼伏|啪啪声不绝如缕|啪啪声不绝于缕|啪啪声不绝如丝|啪啪声不绝如线|啪啪声不绝如弦|啪啪声不绝如带|啪啪声不绝如缕|啪啪声连绵不断|啪啪声连绵不绝|啪啪声连绵不断|啪啪声不绝于耳)/.test(content)) d5.score = 8; d5.strengths.push('有爽点分布');
    if (chapterCount > 0) {
      var coolCount = countMatches(content, /(爽点|打脸|逆袭|翻盘|碾压|突破|觉醒|机缘|奇遇)/g);
      if (coolCount >= chapterCount * 0.5) d5.score = 8;
      else if (coolCount < 2) { d5.score = 3; d5.issues.push('爽点分布不足'); }
    }
    dims.push(d5);

    var d6 = { name: '可执行性', score: 6, max: 10, weight: 0.14, issues: [], strengths: [] };
    if (len >= 600) d6.strengths.push('篇幅充足');
    if (chapterCount >= 5) d6.strengths.push('可支撑多章写作');
    if (d6.strengths.length >= 2) d6.score = 8;
    if (len < 300) { d6.score = 3; d6.issues.push('内容太短，难以指导正文写作'); }
    dims.push(d6);

    return _buildResult('detail', '细纲', dims, content, len);
  }

  // ============ 内部工具 ============
  function _emptyResult(type) {
    return { type: type, totalScore: 0, grade: 'N/A', dimensions: [], issues: ['内容为空，无法评价'], strengths: [], suggestions: [], details: {}, updatedAt: Date.now() };
  }

  function _grade(score) {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  }

  function _buildResult(type, moduleName, dims, content, len) {
    var totalWeight = dims.reduce(function(s, d) { return s + d.weight; }, 0);
    var weightedSum = dims.reduce(function(s, d) { return s + d.score * d.weight; }, 0);
    var totalScore = Math.round((weightedSum / totalWeight) * 10);
    var allIssues = [], allStrengths = [];
    dims.forEach(function(d) { allIssues = allIssues.concat(d.issues); allStrengths = allStrengths.concat(d.strengths); });
    return {
      type: type, moduleName: moduleName, totalScore: totalScore, grade: _grade(totalScore),
      dimensions: dims, issues: allIssues.slice(0, 12), strengths: allStrengths.slice(0, 10),
      suggestions: _genSuggestions(dims),
      details: { length: len },
      updatedAt: Date.now()
    };
  }

  function _genSuggestions(dims) {
    var suggestions = [];
    var dimNames = { '开篇吸引力': '在开头300字加入具体冲突场景', '章尾钩子': '在关键节点突然断章，制造悬念', '对话质量': '增加人物对话互动，让角色"说"而非光"写"', '动作描写': '增加身体语言和场景互动动作', '感官描写': '加入触觉/嗅觉/听觉细节', '情绪张力': '用微动作代替直白情绪词', '节奏控制': '拆分长段落，紧张处用短句', '文笔水平': '替换AI模板化表达，用具体动作/对话替代', '信息密度': '每500字确保至少推进一个新信息点', '原创性': '减少套路化表达，加入独特细节' };
    var lowDims = dims.filter(function(d) { return d.score <= 4; });
    lowDims.forEach(function(d) {
      if (dimNames[d.name]) suggestions.push(dimNames[d.name]);
      else suggestions.push('提升"' + d.name + '"维度');
    });
    if (suggestions.length === 0) suggestions.push('当前质量良好，继续保持');
    return suggestions.slice(0, 5);
  }

  // ============ 统一入口 ============
  function evaluate(content, type, work) {
    switch (type) {
      case 'text': return evaluateText(content, work);
      case 'world': case 'worldbuilding': return evaluateWorld(content);
      case 'chars': case 'character': return evaluateChars(content);
      case 'outline': return evaluateOutline(content);
      case 'detail': return evaluateDetail(content);
      default: return evaluateText(content, work);
    }
  }

  // ============ 兼容旧 API ============
  function makeReport(result, opts) {
    var type = (opts && opts.type) || 'text';
    var work = (opts && opts.work) || null;
    return evaluate(result, type, work);
  }

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
      var hints = [];
      if (r.issues && r.issues.length) {
        r.issues.slice(0, 5).forEach(function(w) { hints.push(w); });
      }
      if (r.suggestions && r.suggestions.length) {
        r.suggestions.slice(0, 3).forEach(function(s) { hints.push('建议：' + s); });
      }
      // 趋势
      if (chapterIdx >= 3) {
        var scores = [];
        for (var ti = Math.max(0, chapterIdx - 3); ti <= chapterIdx; ti++) {
          if (work.chapters[ti] && work.chapters[ti]._quality) scores.push(work.chapters[ti]._quality.totalScore);
        }
        if (scores.length >= 3) {
          var recent = scores.slice(-3);
          if (recent[2] < recent[1] && recent[1] < recent[0]) hints.push('⚠️ 质量连续下降（' + recent.join('→') + '）');
          else if (recent[2] > recent[1] && recent[1] > recent[0]) hints.push('✅ 质量持续上升（' + recent.join('→') + '）');
          else hints.push('质量波动（' + recent.join('→') + '）');
        }
      }
      return { summary: r.grade + ' ' + r.totalScore + '/100', report: r, hints: hints };
    } catch (e) { return null; }
  }

  function analyzeChapter(text, work) {
    return evaluateText(text, work);
  }

  function learnFromEdit(aiOriginal, userEdited) {
    if (!aiOriginal || !userEdited) return null;
    var learnings = { userDeleted: [], userAdded: [], stylePrefs: {}, hasLearnings: false, learnedAt: Date.now() };
    if (userEdited.length < aiOriginal.length * 0.8) learnings.userDeleted.push('用户删减大量内容，AI输出可能过于冗长');
    if (userEdited.length > aiOriginal.length * 1.2) learnings.userAdded.push('用户补充大量内容，AI输出可能不够详细');
    var aiClichés = ['众人震惊', '空气凝固', '心中暗道', '心头一颤', '瞳孔一缩', '嘴角勾起', '目光如炬'];
    var deleted = aiClichés.filter(function(c) { return aiOriginal.indexOf(c) >= 0 && userEdited.indexOf(c) === -1; });
    if (deleted.length > 0) learnings.userDeleted.push('用户删除了AI模板化表达：' + deleted.join('、'));
    var origQuotes = countMatches(aiOriginal, /["""]/g);
    var editedQuotes = countMatches(userEdited, /["""]/g);
    if (editedQuotes > origQuotes * 1.5) { learnings.stylePrefs.moreDialog = true; learnings.userAdded.push('用户增加了大量对话'); }
    learnings.hasLearnings = learnings.userDeleted.length > 0 || learnings.userAdded.length > 0;
    return learnings;
  }

  window.QualityEngine = {
    // 新 API：5种类型独立评价
    evaluate: evaluate,
    evaluateText: evaluateText,
    evaluateWorld: evaluateWorld,
    evaluateChars: evaluateChars,
    evaluateOutline: evaluateOutline,
    evaluateDetail: evaluateDetail,
    // 兼容旧 API
    score: makeReport,
    attach: attach,
    lastHints: lastHints,
    analyzeChapter: analyzeChapter,
    learnFromEdit: learnFromEdit,
    // 内部引用
    _scoreChinese: evaluateText,
    _POISON: []
  };
})();