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

    // D1: 开篇吸引力（10分）— v56 增强：首句检测 + 身份锚定 + 信息倾倒
    var head = content.slice(0, 350);
    var firstSentence = content.replace(/^\s+/, '').slice(0, 60);
    var headConflict = /(冲突|质问|怒|杀|逼|拦|跪|退婚|危机|尸体|线索|警报|敌|赌|证据|命令|圣旨|追杀|血|撞|碎|裂|断|惊|怕|危险|爆炸|抓|推|刀|剑|拳|掌|冷|喝|斥)/.test(head);
    var d1 = { name: '开篇吸引力', score: 6, max: 10, weight: 0.12, issues: [], strengths: [] };
    // v56: 首句检测 — 以环境描写/时间/背景介绍开头扣分
    var badStartRE = /^(清晨|傍晚|夜幕|阳光|月光|天空|大地|世界|大陆|传说|从前|在很久|这是一个|苍澜|九州|混沌|洪荒|宇宙|天地|万物|上古|远古|太古|亘古|千年|百年|万年|多少年|很久|多年|那年|那一年|某一日|这一天|这天|今日|今天|早晨|中午|下午|黄昏|夜幕|夜深|深夜|入夜|清晨|傍晚|黎明|拂晓|黄昏|夜|暮|朝|曦|曙|晨|晚|午|旦|夕)/;
    if (badStartRE.test(firstSentence)) {
      d1.score -= 2;
      d1.issues.push('首句以环境/时间/背景开头，建议改为动作或冲突开场');
    }
    if (headConflict) { d1.score = Math.min(10, d1.score + 3); d1.strengths.push('开篇有冲突/悬念'); }
    else if (/(问道|问道|说道|说|道|介绍|说明|从前|在很久)/.test(head.slice(0, 80))) { d1.score = Math.max(1, d1.score - 3); d1.issues.push('开篇偏平，以对话或说明开头'); }
    else { d1.score = Math.max(1, d1.score - 1); d1.issues.push('开篇冲突不够明确，建议前300字内出现冲突'); }
    // v56: 信息倾倒检测 — 连续50字以上的世界观介绍段落
    if (/(?:世界|大陆|体系|境界|修炼|等级|分为|一共|共有|传说|上古|远古|混沌|洪荒|宇宙|天地|万物|秩序|法则|规则|天道|大道|本源|根源|起源|诞生|创造|毁灭|诞生之初|混沌初开|天地初分|万物初生|太古时代|远古时代|神话时代|黄金时代|白银时代|青铜时代|黑铁时代|末法时代|灵气复苏|灵气枯竭|元素|魔力|灵力|斗气|真气|内力|法力|魂力|精神力|念力|异能|超能力|血脉|天赋|武魂|命魂|星魂|灵根|道基|根骨|资质|悟性|根器|仙根|魔根|妖根|神根|圣根|帝根|皇根|王根|灵体|圣体|神体|仙体|魔体|妖体|帝体|皇体|王体|霸体|道体|佛体|龙体|凤体|麒麟体|玄武体|白虎体|朱雀体|青龙体|混沌体|鸿蒙体|太初体|无极体|混元体|先天体|后天体|凡体|体质)/.test(head) && head.length > 80) {
      d1.score -= 2;
      d1.issues.push('疑似开篇倾倒世界观设定，建议通过行动展示而非直接介绍');
    }
    d1.score = Math.max(1, Math.min(10, d1.score));
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

    // === v55: 正面文笔检查（朱雀级）===
    // D13: 修辞手法（10分）— 比喻/排比/通感/拟人
    var d13 = { name: '修辞手法', score: 5, max: 10, weight: 0.06, issues: [], strengths: [] };
    if (len >= 1000) {
      var metaphorCount = countMatches(content, /(像|如|似|仿佛|犹如|宛如|好比|如同|若|恰似|恍若|宛若|类|一般|似的|般)(?!.*(?:说道|说|道|问|答|喊|叫|骂))/g);
      var parallelCount = countMatches(content, /([^。！？\n]{8,30})(，[^。！？\n]{8,30}){2,}[。！？]/g);
      var synesthesiaCount = countMatches(content, /(声音.*(?:冰冷|温暖|尖锐|柔软|粗糙|沉重|轻飘)|颜色.*(?:冷|暖|甜|苦|吵|静)|气味.*(?:厚重|轻薄|明亮|黑暗|尖锐|圆润)|触觉.*(?:甜|苦|酸|明亮|嘈杂|安静))/g);
      var personificationCount = countMatches(content, /(?:风|雨|雪|月|花|树|山|河|海|剑|刀|火|光|影|夜|暗|城|门|窗|烛|灯|路|桥|石|碑|塔|钟|鼓|琴|书|笔|纸|墨|茶|酒|药|毒|血|泪|魂|梦|命|运|天|地|日|星|云|雾|霜|露|尘|沙|泥|土|岩|崖|壁|峰|岭|森|林|草|叶|枝|根|藤|蔓|棘|刺|花|瓣|蕊|果|实|种|核|仁|壳|甲|鳞|羽|翅|爪|牙|角|骨|皮|毛|血|肉|筋|脉|魂|魄|灵|气|神|魔|妖|鬼|怪|仙|佛|道|法|术|咒|符|印|阵|丹|药|器|宝|物|兵|刃|甲|铠|盾|弓|弩|箭|矢|弹|丸|镖|针|刺|鞭|索|链|钩|爪|网|罩|笼|匣|盒|瓶|罐|壶|杯|盏|碗|盘|碟|筷|勺|匙|筷|枕|席|被|褥|帐|帘|幕|帷|幔|毯|垫|蒲|团|椅|凳|桌|案|几|柜|架|箱|笼|篮|筐|篓|袋|囊|包|袱|巾|帕|带|绳|线|丝|缕|条|片|块|枚|颗|粒|滴|点|抹|丝|片|瓣|朵|枝|条|根|株|棵|丛|簇|束|把|捆|堆|叠|摞|排|行|列|队|阵|群|批|组|套|副|双|对|只|个|件|枚|颗|粒|滴|点|片|块|条|根|枝|束|把|串|挂|副|双|对|套|组|批|群|阵|队|列|排|行|摞|叠|堆|捆|束|把|串|挂)(?:仿佛|像|如|似|若|恍|宛|恰|类|一般|般|似的|一样)/g);
      var rhetoricScore = 0;
      if (metaphorCount >= 2) { rhetoricScore += 2; d13.strengths.push('比喻' + metaphorCount + '处'); }
      if (parallelCount >= 1) { rhetoricScore += 2; d13.strengths.push('排比句式'); }
      if (synesthesiaCount >= 1) { rhetoricScore += 2; d13.strengths.push('通感手法'); }
      if (personificationCount >= 1) { rhetoricScore += 2; d13.strengths.push('拟人手法'); }
      if (rhetoricScore >= 4) { d13.score = 9; }
      else if (rhetoricScore >= 2) { d13.score = 7; }
      else if (rhetoricScore === 0) { d13.score = 3; d13.issues.push('修辞手法单一，建议增加比喻/排比/通感'); }
      else { d13.score = 5; }
    }
    dims.push(d13);

    // D14: 句式多样性（10分）— 长短句交替、问句感叹句穿插
    var d14 = { name: '句式多样性', score: 5, max: 10, weight: 0.06, issues: [], strengths: [] };
    if (len >= 1000) {
      // 拆分句子
      var sentences = content.split(/[。！？\n]+/).filter(function(s) { return s.trim().length > 0; });
      var shortSentences = sentences.filter(function(s) { return s.length <= 10; }).length;
      var longSentences = sentences.filter(function(s) { return s.length >= 30; }).length;
      var questionCount = countMatches(content, /[？?]/g);
      var exclaimCount = countMatches(content, /[！!]/g);
      var sentenceLenVariance = 0;
      if (sentences.length > 0) {
        var avgLen = sentences.reduce(function(s, x) { return s + x.length; }, 0) / sentences.length;
        sentenceLenVariance = sentences.reduce(function(s, x) { return s + Math.pow(x.length - avgLen, 2); }, 0) / sentences.length;
      }
      var score = 5;
      if (shortSentences >= 3 && longSentences >= 3) { score += 2; d14.strengths.push('长短句交替'); }
      if (questionCount >= 1 && exclaimCount >= 1) { score += 1; d14.strengths.push('问句/感叹句穿插'); }
      if (sentenceLenVariance > 200) { score += 1; d14.strengths.push('句式变化丰富'); }
      if (shortSentences === 0 && longSentences > 5) { score = 3; d14.issues.push('全是长句，缺乏节奏变化'); }
      if (longSentences === 0 && shortSentences > 5) { score = 3; d14.issues.push('全是短句，缺乏叙事深度'); }
      d14.score = Math.min(10, score);
    }
    dims.push(d14);

    // D15: 用词精准度（10分）— 强力动词密度、形容词克制、成语使用
    var d15 = { name: '用词精准度', score: 5, max: 10, weight: 0.06, issues: [], strengths: [] };
    if (len >= 1000) {
      // 强力动词（非通用词）
      var strongVerbCount = countMatches(content, /(攥|捏|掐|拧|揪|拽|扯|撕|劈|剁|剜|削|凿|砌|铸|锻|淬|炼|熔|焚|灼|炙|烙|烫|冻|凝|僵|麻|痹|酥|颤|抖|搐|痉|挛|蜷|缩|弓|绷|挺|昂|侧|歪|扭|转|翻|滚|旋|绕|缠|盘|环|绕|萦|缭|袅|冉|徐|缓|骤|疾|倏|忽|蓦|陡|兀|猛|猝|遽|亟|速|迅|捷|敏|锐|利|锋|刃|芒|刺|戳|捅|扎|插|贯|穿|透|渗|浸|渍|泡|沤|淹|没|沉|浮|漂|游|荡|漾|泛|涌|喷|溅|洒|泼|浇|灌|注|倾|倒|泻|流|淌|滴|漏|渗|洇|晕|染|浸|润|湿|潮|濡|沾|渍|涂|抹|擦|拭|揩|拂|掸|扫|刷|洗|涤|濯|沐|浴|冲|涮|淘|汰|滤|沥|澄|淀|沉|浮|漂|游|泳|潜|涉|渡|趟|蹚|踩|踏|践|蹈|跃|跳|蹦|蹿|窜|逃|遁|溜|闪|躲|避|让|退|撤|缩|藏|匿|隐|蔽|掩|盖|遮|挡|拦|阻|截|堵|塞|填|补|塞|嵌|镶|套|箍|束|绑|捆|扎|系|拴|扣|锁|封|闭|合|关|开|启|解|放|松|脱|卸|摘|取|拿|拾|捡|抓|握|持|执|捧|托|端|举|提|拎|扛|背|抱|搂|夹|掖|揣|塞|藏|收|放|存|搁|摆|置|安|挂|悬|吊|垂|坠|系|绑|拴|扣|别|夹|卡|嵌|镶|套|箍|环|圈|绕|缠|盘|卷|裹|包|封|盖|罩|蒙|遮|掩|挡|拦|阻|隔|断|绝|止|停|驻|留|待|等|候|守|望|看|观|察|视|见|睹|瞥|瞟|扫|览|阅|读|念|诵|吟|咏|唱|歌|呼|喊|叫|唤|喝|吼|啸|嚎|啼|鸣|响|声|音|语|言|话|辞|词|句|字|文|章|篇|段|落|行|排|列|队|阵|群|批|组|套|副|双|对|只|个|件|枚|颗|粒|滴|点|片|块|条|根|枝|束|把|串|挂)/g);
      // 弱动词（过于通用）
      var weakVerbCount = countMatches(content, /(说|道|问|答|看|见|听|想|走|跑|来|去|做|弄|搞|拿|放|给|让|使|叫|让|被|把|将|以|因|为|所|可|能|会|要|得|的|地|了|着|过|和|与|或|而|但|却|则|且|虽|然|若|如|果|因|所|以|故|于|乎|者|也|矣|焉|哉|耳|尔|之|其|彼|此|是|非|不|无|未|莫|勿|毋|弗|否|岂|宁|安|焉|恶|乌|盍|奚|曷|胡|何|孰|谁|孰|几|多|少|寡|鲜|罕|稀|奇|异|殊|特|独|别|另|他|它|她|这|那|哪|什|怎|咋|吗|呢|吧|啊|呀|哦|嗯|呵|哈|嘿|哎|唉|哟|喂|哼|啧|呸|嘘|吁|唔|噢|嗐|嗬|嘻|呵|嘿|咳|哎|哟|喂|哼|啧|呸|嘘|吁|唔|噢|嗐|嗬)/g);
      var idiomCount = countMatches(content, /(?:千钧一发|一触即发|万籁俱寂|鸦雀无声|风平浪静|波澜壮阔|惊涛骇浪|排山倒海|翻江倒海|天翻地覆|地动山摇|山崩地裂|石破天惊|惊天动地|震耳欲聋|如雷贯耳|响彻云霄|穿云裂石|绕梁三日|余音绕梁|曲高和寡|阳春白雪|下里巴人|高山流水|知音难觅|对牛弹琴|画蛇添足|画龙点睛|锦上添花|雪中送炭|火上浇油|落井下石|趁火打劫|浑水摸鱼|顺手牵羊|偷梁换柱|移花接木|李代桃僵|借刀杀人|隔岸观火|笑里藏刀|口蜜腹剑|两面三刀|阳奉阴违|表里不一|口是心非|言行不一|貌合神离|同床异梦|离心离德|众叛亲离|孤家寡人|形单影只|孑然一身|形影相吊|茕茕孑立|踽踽独行|孤苦伶仃|无依无靠|举目无亲|六亲不认|铁面无私|大义灭亲|公而忘私|舍己为人|奋不顾身|赴汤蹈火|肝脑涂地|粉身碎骨|万死不辞|视死如归|马革裹尸|鞠躬尽瘁|死而后已|呕心沥血|殚精竭虑|苦心孤诣|煞费苦心|挖空心思|绞尽脑汁|搜肠刮肚|冥思苦想|苦思冥想|左思右想|前思后想|思前想后|瞻前顾后|畏首畏尾|缩手缩脚|束手束脚|投鼠忌器|举棋不定|犹豫不决|优柔寡断|当断不断|反受其乱|快刀斩乱麻|斩钉截铁|雷厉风行|大刀阔斧|快马加鞭|马不停蹄|日夜兼程|风雨无阻|披星戴月|栉风沐雨|餐风饮露|风餐露宿|幕天席地|以天为盖|以地为庐|四海为家|浪迹天涯|萍踪浪迹|居无定所|颠沛流离|流离失所|背井离乡|离乡背井|远走高飞|不辞而别|不告而别|不翼而飞|不胫而走|不约而同|不谋而合|异口同声|众口一词|人云亦云|亦步亦趋|邯郸学步|东施效颦|鹦鹉学舌|拾人牙慧|步人后尘|照猫画虎|依样画葫芦)/g);
      var adjDensity = countMatches(content, /(的(?:(?:很|非常|十分|极其|特别|格外|分外|尤其|相当|颇为|颇为|甚是|极|至|绝|太|过|忒|好|真|蛮|挺|怪|老|死|贼|暴|狂|超|巨|特|顶|最|更|还|比较|稍微|略微|略|稍|微|有点儿|有些|有点|多少|不大|不太|不太|不怎么|不很|不十分|不特别|不格外|不极为|不极其|不非常|不十分|不特别|不格外|不极为|不极其)\s)?(?:大|小|高|低|长|短|宽|窄|厚|薄|深|浅|粗|细|轻|重|快|慢|新|旧|好|坏|美|丑|难|易|强|弱|硬|软|冷|暖|热|凉|干|湿|暗|亮|明|黑|白|红|绿|蓝|黄|紫|青|灰|粉|金|银|铜|铁|钢|玉|石|木|竹|纸|布|皮|毛|丝|绸|缎|锦|绣|纱|罗|绫|绢|帛|绵|棉|麻|葛|褐|毡|毯|绒|呢|绒|羽|绒|毛|皮|革|甲|壳|鳞|角|骨|牙|爪|蹄|翅|翼|鳍|鳃|鳞|甲|介|壳|贝|螺|蛤|蚌|蚶|蛏|蚬|蛎|蛤|蜊|蛏|蚶|蛎|蛤|蜊|蛏|蚶|蛎|蛤|蜊)\s*(?:的|地|得|之|者|也|矣|焉|哉|耳|尔|乎|耶|欤|邪|与|欤|耶|乎|哉|焉|耳|尔|者|也|矣|之))/g);
      var score = 5;
      if (strongVerbCount >= 6) { score += 3; d15.strengths.push('动词精准有力(' + strongVerbCount + '处)'); }
      else if (strongVerbCount >= 3) { score += 1; }
      else { score -= 1; d15.issues.push('动词偏弱，多用通用词'); }
      if (adjDensity <= len / 250) { score += 1; d15.strengths.push('形容词克制'); }
      else if (adjDensity > len / 100) { score -= 1; d15.issues.push('形容词堆砌过多'); }
      if (idiomCount >= 2 && idiomCount <= 6) { score += 1; d15.strengths.push('成语/典故恰当(' + idiomCount + '处)'); }
      else if (idiomCount > 10) { score -= 1; d15.issues.push('成语过多(' + idiomCount + '处)，有堆砌之嫌'); }
      d15.score = Math.max(1, Math.min(10, score));
    }
    dims.push(d15);

    // D16: 描写细腻度（10分）— 白描与细描平衡、环境人物互衬
    var d16 = { name: '描写细腻度', score: 5, max: 10, weight: 0.06, issues: [], strengths: [] };
    if (len >= 1000) {
      // 环境描写
      var envCount = countMatches(content, /(天色|阳光|月光|灯光|烛光|火把|灯笼|星|云|雾|霜|露|雪|雨|风|雷|电|虹|霞|暮|晨|曦|曙|昏|夜|昼|春|夏|秋|冬|冷|热|暖|凉|燥|潮|湿|干|闷|阴|晴|明|暗|寂|静|闹|吵|喧|哗|响|声|音|鸣|啼|叫|喊|嘶|吼|啸|嚎|哭|笑|叹|息|喘|咳|呛|咽|吞|吐|呕|喷|溅|洒|扬|飘|浮|落|坠|沉|降|升|起|飞|舞|摇|晃|摆|荡|颤|抖|震|动|晃|摇|摆|荡|漾|泛|涌|流|淌|滴|漏|渗|浸|润|湿|潮|濡|沾|渍|涂|抹|擦|拭|揩|拂|掸|扫|刷|洗|涤|濯|沐|浴|冲|涮|淘|汰|滤|沥|澄|淀|沉|浮|漂|游|泳|潜|涉|渡|趟|蹚|踩|踏|践|蹈|跃|跳|蹦|蹿|窜|逃|遁|溜|闪|躲|避|让|退|撤|缩|藏|匿|隐|蔽|掩|盖|遮|挡|拦|阻|截|堵|塞|填|补|塞|嵌|镶|套|箍|束|绑|捆|扎|系|拴|扣|锁|封|闭|合|关|开|启|解|放|松|脱|卸|摘|取|拿|拾|捡|抓|握|持|执|捧|托|端|举|提|拎|扛|背|抱|搂|夹|掖|揣|塞|藏|收|放|存|搁|摆|置|安|挂|悬|吊|垂|坠|系|绑|拴|扣|别|夹|卡|嵌|镶|套|箍|环|圈|绕|缠|盘|卷|裹|包|封|盖|罩|蒙|遮|掩|挡|拦|阻|隔|断|绝|止|停|驻|留|待|等|候|守|望|看|观|察|视|见|睹|瞥|瞟|扫|览|阅|读|念|诵|吟|咏|唱|歌|呼|喊|叫|唤|喝|吼|啸|嚎|啼|鸣|响|声|音|语|言|话|辞|词|句|字|文|章|篇|段|落|行|排|列|队|阵|群|批|组|套|副|双|对|只|个|件|枚|颗|粒|滴|点|片|块|条|根|枝|束|把|串|挂)/g);
      // 外貌/神态描写
      var faceCount = countMatches(content, /(眼|眉|睫|瞳|眸|目|鼻|耳|唇|嘴|口|齿|舌|喉|颈|脖|肩|臂|肘|腕|手|掌|指|甲|胸|背|腰|腹|肚|脐|臀|腿|膝|踝|脚|足|趾|发|鬓|髯|须|胡|眉|睫|睫毛|眼帘|眼睑|眼角|眼梢|眼尾|眼眶|眼窝|眼珠|眼白|瞳孔|瞳仁|眸|眸子|眼眸|眼神|目光|视线|眼波|眼色|眼风|眼锋|眼刀|眼角|眉梢|眉峰|眉心|眉间|眉头|眉宇|眉目|眉毛|柳眉|剑眉|浓眉|淡眉|蛾眉|娥眉|黛眉|眉峰|眉梢|眉尾|眉尖|眉尖|眉端|眉梢|眉尾|眉尖|眉端|眉梢|眉尾|眉心|眉头|眉宇|眉目|眉毛|鼻梁|鼻翼|鼻尖|鼻孔|鼻腔|鼻头|鼻端|鼻准|鼻峰|鼻根|鼻山|鼻尖|鼻翼|鼻翅|鼻唇|鼻沟|鼻梁|鼻峰|鼻准|鼻头|鼻端|鼻尖|鼻翼|鼻翅|鼻唇|鼻沟|鼻梁|鼻峰|鼻准|鼻头|鼻端|鼻尖|鼻翼|鼻翅|鼻唇|鼻沟|颧骨|脸颊|面颊|腮|腮帮|下颚|下颌|下巴|酒窝|梨涡|笑涡|唇|嘴唇|嘴角|唇线|唇形|唇色|唇纹|唇瓣|唇峰|唇珠|唇尖|唇边|唇沿|唇际|唇间|唇缝|唇隙|齿|牙齿|牙关|牙床|牙根|牙龈|牙尖|牙锋|牙刃|牙口|牙缝|牙隙|齿缝|齿隙|齿间|齿关|齿床|齿根|齿龈|齿尖|齿锋|齿刃|齿口|舌|舌头|舌尖|舌根|舌面|舌底|舌苔|舌锋|舌刃|舌剑|舌枪|舌战|舌辩|舌争|舌斗|喉|喉咙|喉头|喉结|喉管|喉间|喉底|喉中|喉内|喉外|喉部|喉位|喉间|喉底|喉中|喉内|喉外|喉部|喉位|颈|脖颈|颈部|颈间|颈侧|颈后|颈前|颈背|颈项|项|项背|项间|项侧|项后|项前|肩|肩膀|肩头|肩胛|肩窝|肩峰|肩端|肩际|肩间|肩侧|肩后|肩前|臂|手臂|胳膊|臂膀|上臂|下臂|前臂|后臂|臂弯|臂肘|臂腕|臂肌|臂力|肘|肘部|肘尖|肘关节|肘弯|肘窝|肘间|腕|手腕|腕部|腕关节|腕骨|腕间|腕侧|腕后|腕前|手|手掌|手心|手背|手指|指尖|指腹|指节|指甲|指缝|指间|指端|指头|指肚|指根|指背|指侧|指面|拳|拳头|拳心|拳背|拳面|拳锋|拳骨|拳眼|拳面|拳侧|拳背|拳心|拳头|胸|胸膛|胸口|胸前|胸后|胸侧|胸肌|胸骨|胸肋|胸腹|胸腰|胸背|胸前|胸后|胸侧|胸肌|胸骨|胸肋|胸腹|胸腰|胸背|背|后背|背部|背脊|背心|背肌|背骨|背肋|背腰|背腹|背后|背前|背侧|腰|腰部|腰间|腰侧|腰后|腰前|腰肢|腰身|腰肌|腰骨|腰肋|腰腹|腰背|腹|腹部|肚子|肚腹|肚皮|肚脐|肚腹|肚肠|肚量|肚量|肚量|肚量|腿|大腿|小腿|腿部|腿间|腿侧|腿后|腿前|腿肌|腿骨|腿筋|腿力|膝|膝盖|膝部|膝关节|膝骨|膝间|膝侧|膝后|膝前|踝|脚踝|踝部|踝关节|踝骨|踝间|踝侧|踝后|踝前|脚|脚掌|脚心|脚背|脚趾|脚尖|脚跟|脚底|脚面|脚侧|脚后|脚前|脚间|足|足部|足尖|足跟|足底|足面|足侧|足后|足前|足间|肤|皮肤|肌肤|肤色|肤质|肤感|肤触|肤温|肤冷|肤热|肤凉|肤暖|肤润|肤燥|肤滑|肤糙|肤细|肤嫩|肤老|肤皱|肤纹|肤理|肤痕|肤疤|肤痣|肤斑|肤印|肤记)/g);
      // 细节点缀
      var detailCount = countMatches(content, /(一缕|一丝|一抹|一痕|一道|一阵|一股|一团|一片|一层|一点|一滴|一颗|一粒|一枚|一根|一条|一只|一个|一件|一副|一双|一对|一套|一组|一批|一群|一队|一列|一排|一行|一摞|一叠|一堆|一捆|一束|一把|一串|一挂|微|细|薄|淡|浅|轻|柔|软|硬|粗|糙|滑|腻|粘|稠|稀|浓|淡|清|浊|明|暗|深|浅|远|近|高|低|长|短|宽|窄|厚|薄|大|小|多|少|快|慢|急|缓|徐|疾|骤|倏|忽|蓦|陡|兀|猛|猝|遽|亟|速|迅|捷|敏|锐|利|锋|刃|芒|刺|戳|捅|扎|插|贯|穿|透|渗|浸|渍|泡|沤|淹|没|沉|浮|漂|游|荡|漾|泛|涌|喷|溅|洒|泼|浇|灌|注|倾|倒|泻|流|淌|滴|漏|渗|洇|晕|染|浸|润|湿|潮|濡|沾|渍|涂|抹|擦|拭|揩|拂|掸|扫|刷|洗|涤|濯|沐|浴|冲|涮|淘|汰|滤|沥|澄|淀|沉|浮|漂|游|泳|潜|涉|渡|趟|蹚|踩|踏|践|蹈|跃|跳|蹦|蹿|窜|逃|遁|溜|闪|躲|避|让|退|撤|缩|藏|匿|隐|蔽|掩|盖|遮|挡|拦|阻|截|堵|塞|填|补|塞|嵌|镶|套|箍|束|绑|捆|扎|系|拴|扣|锁|封|闭|合|关|开|启|解|放|松|脱|卸|摘|取|拿|拾|捡|抓|握|持|执|捧|托|端|举|提|拎|扛|背|抱|搂|夹|掖|揣|塞|藏|收|放|存|搁|摆|置|安|挂|悬|吊|垂|坠|系|绑|拴|扣|别|夹|卡|嵌|镶|套|箍|环|圈|绕|缠|盘|卷|裹|包|封|盖|罩|蒙|遮|掩|挡|拦|阻|隔|断|绝|止|停|驻|留|待|等|候|守|望|看|观|察|视|见|睹|瞥|瞟|扫|览|阅|读|念|诵|吟|咏|唱|歌|呼|喊|叫|唤|喝|吼|啸|嚎|啼|鸣|响|声|音|语|言|话|辞|词|句|字|文|章|篇|段|落|行|排|列|队|阵|群|批|组|套|副|双|对|只|个|件|枚|颗|粒|滴|点|片|块|条|根|枝|束|把|串|挂)/g);
      var score = 5;
      if (envCount >= 3) { score += 2; d16.strengths.push('环境描写丰富(' + envCount + '处)'); }
      if (faceCount >= 3) { score += 2; d16.strengths.push('外貌/神态细节(' + faceCount + '处)'); }
      else if (faceCount === 0 && len > 1500) { score -= 1; d16.issues.push('缺少外貌神态描写'); }
      if (detailCount >= 5) { score += 1; d16.strengths.push('细节点缀得当'); }
      if (envCount >= 2 && faceCount >= 2) { score += 1; d16.strengths.push('环境与人物互衬'); }
      d16.score = Math.max(1, Math.min(10, score));
    }
    dims.push(d16);

    // D0: 用户指令遵循度（10分）— 检查生成内容是否遵循了用户的提示词指令
    // 提取用户指令（通过 opts 传入）
    var userCmd = (typeof work !== 'undefined' && work && work._lastUserCmd) ? work._lastUserCmd : '';
    var d0 = { name: '指令遵循', score: 10, max: 10, weight: 0.15, issues: [], strengths: [] };
    if (userCmd && userCmd.trim()) {
      var cmdKeywords = userCmd.trim().replace(/[，。！？、；：""''（）【】《》]/g, ' ').split(/\s+/).filter(function(k) { return k.length >= 2; });
      if (cmdKeywords.length > 0) {
        var matchCount = 0;
        var missCount = 0;
        var missKeywords = [];
        cmdKeywords.forEach(function(kw) {
          if (content.indexOf(kw) >= 0) {
            matchCount++;
          } else {
            missCount++;
            missKeywords.push(kw);
          }
        });
        var matchRatio = cmdKeywords.length > 0 ? matchCount / cmdKeywords.length : 1;
        if (matchRatio >= 0.7) {
          d0.score = 9;
          d0.strengths.push('较好遵循用户指令(' + matchCount + '/' + cmdKeywords.length + '关键词匹配)');
        } else if (matchRatio >= 0.4) {
          d0.score = 6;
          d0.issues.push('部分遵循用户指令，缺少关键词：' + missKeywords.slice(0, 3).join('、'));
        } else {
          d0.score = 3;
          d0.issues.push('严重偏离用户指令！以下关键要求未体现：' + missKeywords.slice(0, 5).join('、'));
        }
      }
    } else {
      // 无用户指令时，该维度不扣分但也不算加分
      d0.strengths.push('无特定指令，按通用标准评判');
    }
    dims.push(d0);

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

    // D0: 指令遵循（10分）
    var userCmd = _getUserCmd();
    var d0 = { name: '指令遵循', score: 10, max: 10, weight: 0.15, issues: [], strengths: [] };
    if (userCmd && userCmd.trim()) {
      var cmdKeywords = userCmd.trim().replace(/[，。！？、；：""''（）【】《》]/g, ' ').split(/\s+/).filter(function(k) { return k.length >= 2; });
      if (cmdKeywords.length > 0) {
        var matchCount = 0, missCount = 0, missKeywords = [];
        cmdKeywords.forEach(function(kw) {
          if (content.indexOf(kw) >= 0) matchCount++; else { missCount++; missKeywords.push(kw); }
        });
        var matchRatio = matchCount / cmdKeywords.length;
        if (matchRatio >= 0.7) { d0.score = 9; d0.strengths.push('较好遵循用户指令'); }
        else if (matchRatio >= 0.4) { d0.score = 6; d0.issues.push('部分遵循，缺少：' + missKeywords.slice(0, 3).join('、')); }
        else { d0.score = 3; d0.issues.push('严重偏离用户指令：' + missKeywords.slice(0, 5).join('、')); }
      }
    } else { d0.strengths.push('无特定指令'); }
    dims.push(d0);

    var d1 = { name: '设定完整度', score: 6, max: 10, weight: 0.18, issues: [], strengths: [] };
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

    // D0: 指令遵循（10分）
    var userCmd = _getUserCmd();
    var d0 = { name: '指令遵循', score: 10, max: 10, weight: 0.15, issues: [], strengths: [] };
    if (userCmd && userCmd.trim()) {
      var cmdKeywords = userCmd.trim().replace(/[，。！？、；：""''（）【】《》]/g, ' ').split(/\s+/).filter(function(k) { return k.length >= 2; });
      if (cmdKeywords.length > 0) {
        var matchCount = 0, missCount = 0, missKeywords = [];
        cmdKeywords.forEach(function(kw) {
          if (content.indexOf(kw) >= 0) matchCount++; else { missCount++; missKeywords.push(kw); }
        });
        var matchRatio = matchCount / cmdKeywords.length;
        if (matchRatio >= 0.7) { d0.score = 9; d0.strengths.push('较好遵循用户指令'); }
        else if (matchRatio >= 0.4) { d0.score = 6; d0.issues.push('部分遵循，缺少：' + missKeywords.slice(0, 3).join('、')); }
        else { d0.score = 3; d0.issues.push('严重偏离用户指令：' + missKeywords.slice(0, 5).join('、')); }
      }
    } else { d0.strengths.push('无特定指令'); }
    dims.push(d0);

    var d1 = { name: '人物立体度', score: 6, max: 10, weight: 0.18, issues: [], strengths: [] };
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

    // D0: 指令遵循（10分）
    var userCmd = _getUserCmd();
    var d0 = { name: '指令遵循', score: 10, max: 10, weight: 0.15, issues: [], strengths: [] };
    if (userCmd && userCmd.trim()) {
      var cmdKeywords = userCmd.trim().replace(/[，。！？、；：""''（）【】《》]/g, ' ').split(/\s+/).filter(function(k) { return k.length >= 2; });
      if (cmdKeywords.length > 0) {
        var matchCount = 0, missCount = 0, missKeywords = [];
        cmdKeywords.forEach(function(kw) {
          if (content.indexOf(kw) >= 0) matchCount++; else { missCount++; missKeywords.push(kw); }
        });
        var matchRatio = matchCount / cmdKeywords.length;
        if (matchRatio >= 0.7) { d0.score = 9; d0.strengths.push('较好遵循用户指令'); }
        else if (matchRatio >= 0.4) { d0.score = 6; d0.issues.push('部分遵循，缺少：' + missKeywords.slice(0, 3).join('、')); }
        else { d0.score = 3; d0.issues.push('严重偏离用户指令：' + missKeywords.slice(0, 5).join('、')); }
      }
    } else { d0.strengths.push('无特定指令'); }
    dims.push(d0);

    var d1 = { name: '结构清晰', score: 6, max: 10, weight: 0.18, issues: [], strengths: [] };
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

    // D0: 指令遵循（10分）
    var userCmd = _getUserCmd();
    var d0 = { name: '指令遵循', score: 10, max: 10, weight: 0.15, issues: [], strengths: [] };
    if (userCmd && userCmd.trim()) {
      var cmdKeywords = userCmd.trim().replace(/[，。！？、；：""''（）【】《》]/g, ' ').split(/\s+/).filter(function(k) { return k.length >= 2; });
      if (cmdKeywords.length > 0) {
        var matchCount = 0, missCount = 0, missKeywords = [];
        cmdKeywords.forEach(function(kw) {
          if (content.indexOf(kw) >= 0) matchCount++; else { missCount++; missKeywords.push(kw); }
        });
        var matchRatio = matchCount / cmdKeywords.length;
        if (matchRatio >= 0.7) { d0.score = 9; d0.strengths.push('较好遵循用户指令'); }
        else if (matchRatio >= 0.4) { d0.score = 6; d0.issues.push('部分遵循，缺少：' + missKeywords.slice(0, 3).join('、')); }
        else { d0.score = 3; d0.issues.push('严重偏离用户指令：' + missKeywords.slice(0, 5).join('、')); }
      }
    } else { d0.strengths.push('无特定指令'); }
    dims.push(d0);

    var d1 = { name: '章节连贯', score: 6, max: 10, weight: 0.18, issues: [], strengths: [] };
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
    var lowDims = dims.filter(function(d) { return d.score <= 5; });
    lowDims.forEach(function(d) {
      if (dimNames[d.name]) suggestions.push(dimNames[d.name]);
      else suggestions.push('提升"' + d.name + '"维度');
    });
    if (suggestions.length === 0) suggestions.push('当前质量良好，继续保持');
    return suggestions.slice(0, 5);
  }

  // ============ 好坏标准学习指南（供加强prompt使用）============
  function getFixGuide(dimensions) {
    var lowDims = dimensions.filter(function(d) { return d.score <= 5; });
    if (lowDims.length === 0) return '';
    
    var guides = {
      '开篇吸引力': {
        bad: '以"清晨的阳光"、"苍澜大陆"、"在很久以前"、"这是一个世界"开头，或以环境描写/背景介绍开场，前300字像说明书而非故事',
        good: '第1句直接切入动作/冲突/危机。如："血顺着剑刃滴在青石板上，第三滴落下时，他才发现自己还活着。" 前200字交代主角身份和核心矛盾，用行动而非旁白介绍',
        how: '砍掉第一段的环境描写和背景介绍，直接从主角的某个动作或危机开始。不说"他是废柴"，写"他一拳打在测力石上，数字让全场哄堂大笑"。删掉连续超过50字的世界观设定段落'
      },
      '章尾钩子': {
        bad: '章尾自然结束，用"XX说完就走了"、"夜幕降临"这类平淡收尾，读者没有点下一章的动力',
        good: '章尾停在关键节点：门突然被敲响/手机收到奇怪短信/身后传来声音/发现重要线索/角色做出重大决定/战斗正酣时突然中断',
        how: '在最后300字制造一个"必须看下一章才知道结果"的悬念。经典手法：意外打断、信息揭露、危机降临、反转暗示'
      },
      '对话质量': {
        bad: '角色对话像在念说明书，每个人说话风格一样，大段独白没有互动，或者全是对话没有叙述',
        good: '对话有来有回，每个角色有独特的说话方式（语速/用词/口气），对话中穿插动作和微表情，有潜台词（话里有话）',
        how: '给每个角色设定说话风格（如：A说话短促干脆，B喜欢绕弯子，C爱用反问）。每3句对话穿插一个动作描写'
      },
      '动作描写': {
        bad: '角色做了什么全靠"XX说"、"XX想"来交代，场景缺乏身体语言，所有动作都是"抬手/转身/走"这类通用词',
        good: '用具体、独特的动作来展现角色状态：攥紧的拳头、指节发白、喉结滚动、指尖摩挲杯沿、背对着人说话',
        how: '每段加入至少1处具体身体动作，用动作代替"他很紧张"这类直白情绪词'
      },
      '感官描写': {
        bad: '只有视觉描写，场景像在看无声电影，读者感受不到温度、气味、声音',
        good: '五感全开：刺鼻的血腥味、滚烫的金属、粗糙的墙面、嗡鸣的警报、苦涩的药味',
        how: '每500字至少加入1处非视觉感官描写（听觉/嗅觉/触觉/味觉）'
      },
      '情绪张力': {
        bad: '直接写"他很愤怒"、"她很伤心"、"他非常紧张"，读者无法代入',
        good: '用微动作外化情绪：指尖发白=紧张，咬紧后槽牙=愤怒，声音压低=克制，喉结滚动=不安，别过头=逃避',
        how: '删除所有"XX很XX"的直白情绪词，用身体微动作+环境暗示来传递情绪'
      },
      '节奏控制': {
        bad: '整段500字以上不分段，读者一口气读不完，或者全是短句像碎片',
        good: '紧张处用短句（5-10字），舒缓处用长句（20-30字），段落长短交替，最长段不超过300字',
        how: '拆分所有超过300字的段落。紧张场景用短句+短段落制造急促感，叙述场景适当放宽'
      },
      '文笔水平': {
        bad: '大量使用"众人震惊"、"空气凝固"、"心头一颤"、"瞳孔一缩"、"嘴角勾起"、"目光如炬"等AI模板化表达',
        good: '用具体动作替代模板化表达：不说"众人震惊"而写"在场的人不约而同后退了一步"；不说"空气凝固"而写"没有人敢出声，只有烛火在跳"',
        how: '全篇搜索替换所有AI腔表达，每个都用具体、独特的动作/场景描写替代'
      },
      '信息密度': {
        bad: '500字过去了，剧情没有推进，角色在闲聊或重复已知信息，读者感觉在"水字数"',
        good: '每500字至少推进一个新信息点：发现线索、揭示秘密、关系变化、新角色出现、突发危机、获得能力、做出决定',
        how: '检查每500字是否有新信息推进。没有的话，删掉无关对话，加入剧情推进'
      },
      '原创性': {
        bad: '到处都是"嘴角勾起"、"眼神一冷"、"倒吸一口凉气"、"不怒自威"、"霸气侧漏"这类的网文套路化表达',
        good: '用独特、具体的细节替代套路化表达。每个角色有自己的"标志性动作"，而不是千篇一律的"嘴角勾起"',
        how: '把套路化表达全部替换为角色独有的细节描写。比如不说"冷笑"而写"嘴角扯了一下，像在笑，眼睛却没有温度"'
      },
      // v55: 正面文笔修复指南
      '修辞手法': {
        bad: '全文平铺直叙，没有比喻、排比、通感或拟人，读起来像流水账或说明书',
        good: '比喻："她的声音像冬天里碎裂的冰层，又薄又利"；通感："那笑声是甜的，甜到发腻"；排比：用三句结构相似的句子制造节奏感',
        how: '每500字至少加入1处修辞。关键场景用比喻强化画面感，情绪高潮用排比制造冲击力，环境描写用通感让读者"身临其境"'
      },
      '句式多样性': {
        bad: '全文句子长度差不多，都是15-25字的中等长度，没有节奏变化，读者读着读着就困了',
        good: '紧张处：短句连击。"他冲了进去。空的。什么都没有。血还是温的。"；舒缓处：长句铺陈，加入细节和感官；对话中穿插反问和感叹',
        how: '检查句长分布：紧张场景至少50%短句(≤10字)；叙事场景允许长句(≥30字)但不超过30%；对话中自然穿插反问和感叹句'
      },
      '用词精准度': {
        bad: '动词全是"说/看/走/拿/放"这类通用词，形容词堆砌如"非常美丽的花朵"、"极其强大的力量"',
        good: '用精准动词替代通用词：不说"他生气地走了"而写"他摔门而出"；不说"她很漂亮"而写"她站在那儿，不说话，就让人移不开眼"；形容词要克制，一个精准的比三个堆砌的有力',
        how: '搜索全篇"说/看/走/拿/放"等通用词，替换为更精准的动作描写。删除"很/非常/极其"等程度副词，用具体描写替代'
      },
      '描写细腻度': {
        bad: '场景只有对话和动作，没有环境烘托；角色只有名字和对话，没有外貌神态；所有描写都是粗线条，缺乏细节',
        good: '环境与人物互衬："雨停了，屋檐还在滴水，一滴一滴，像谁在数着时间"；外貌神态细节："他笑的时候，眼角的细纹先动，然后才是嘴角"；用细节传递情绪而非直接说',
        how: '每章至少3处环境描写（天气/光线/声音/气味），至少3处外貌神态细节（眼/手/姿态），用"一缕/一丝/一抹"等量词点缀细节'
      }
    };
    
    var result = '';
    lowDims.forEach(function(d) {
      var g = guides[d.name];
      if (g) {
        result += '\n【' + d.name + ' — ' + d.score + '分 — 需要修复】\n';
        result += '❌ 反面教材（不要这样写）：' + g.bad + '\n';
        result += '✅ 正面范例（应该这样写）：' + g.good + '\n';
        result += '🔧 具体改法：' + g.how + '\n';
      }
    });
    return result;
  }
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

  // 全局用户指令状态（供各模块评价函数使用）
  var _lastUserCmd = '';
  function _getUserCmd() { return _lastUserCmd; }
  function _setUserCmd(cmd) { _lastUserCmd = (cmd || '').trim(); }

  window.QualityEngine = {
    // 新 API：5种类型独立评价
    evaluate: evaluate,
    evaluateText: evaluateText,
    evaluateWorld: evaluateWorld,
    evaluateChars: evaluateChars,
    evaluateOutline: evaluateOutline,
    evaluateDetail: evaluateDetail,
    // 注册当前用户指令（供 D0 指令遵循维度使用）
    setUserCmd: _setUserCmd,
    getUserCmd: _getUserCmd,
    // 好坏标准学习指南
    getFixGuide: getFixGuide,
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