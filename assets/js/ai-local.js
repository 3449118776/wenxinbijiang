// ai-local.js - 本地兜底内容生成
// 当云端 AI 全部不可用时，本文件提供基于规则的本地生成方案
(function () {
  var _TEMPLATE = {
    world: function (work) {
      var title = (work && work.title) || '未命名作品';
      return '【世界观：' + title + '】\n\n'
        + '一、时代背景\n'
        + '作品所处的世界正在经历一场深刻的秩序重构——旧有的权力结构被百年一遇的灾变撕裂，新的规则尚未成形，各股势力在混乱中寻找机会。\n\n'
        + '二、地理设定\n'
        + '以主角活动的核心区域为中心，分为三大地理板块：北方荒原（资源匮乏但盛产强者）、中央王城（权力中枢与商贸枢纽）、南方商港（信息与异端之地）。\n\n'
        + '三、力量体系\n'
        + '力量来自对"规则"的理解深度。理解越深，能调动的因果链条越长。但每一次动用高阶力量都会在世界上留下"残响"，被同类感知，并可能付出代价。\n\n'
        + '四、社会结构\n'
        + '表面上是王权/宗门统治，底层却被非正式的"契约网络"连接——信息、人情、恩情、亏欠共同构成一张隐形的权力网。主角将在这张网中从"棋子"变成"操盘者"。\n\n'
        + '五、核心矛盾与钩子\n'
        + '——谁制造了灾变？为什么主角能感知到别人感知不到的"残响"？\n'
        + '——看似正派的一方真的在做正义的事吗？\n'
        + '——世界即将迎来第二次更大的震荡，主角必须在震荡前找到自己真正站在哪一边。\n\n'
        + '（以上为本地生成的骨架版本，建议配合 AI 调用精细化扩展。）';
    },
    chars: function (work) {
      var title = (work && work.title) || '未命名作品';
      return '【人物人设：' + title + '】\n\n'
        + '■ 主角\n'
        + '姓名：（请补全）\n'
        + '核心动机：表面上是"活下去/证明自己"，深层是"不想再一次失去重要的人"。\n'
        + '最大执念：被否定过的那个自己。\n'
        + '最大弱点：在情感压力下会做出非理性决策。\n'
        + '人物弧光起点：习惯以强硬/冷漠面具掩盖真实渴望。\n'
        + '核心能力/资源：感知残响 + 一条被误认为弱小但潜力巨大的力量线。\n'
        + '外在面具 vs 真实自我：对外冷静，内心有强烈的保护欲。\n\n'
        + '■ 主要反派\n'
        + '身份：与主角有旧关系的高位者。\n'
        + '核心目标：他认为自己在做"对世界正确的事"，与主角目标本质冲突。\n'
        + '反派出场的意义：让主角重新审视自己真正要守护的是什么。\n\n'
        + '■ 关键配角（3 位）\n'
        + '1）理智派：提供信息、规划、兜底——但有自己的秘密。\n'
        + '2）情感锚：让主角在最硬的战斗中保持人性。\n'
        + '3）灰色立场：多次切换阵营，拷问"什么才是真正的忠诚"。\n\n'
        + '■ 人物关系网\n'
        + '建议以主角为中心画出三条张力线：情感线、师徒/恩情线、敌对线。三条线在中期高潮处交汇。\n';
    },
    outline: function (work) {
      var title = (work && work.title) || '未命名作品';
      return '【全书大纲：' + title + '】\n\n'
        + '第一卷·破局\n'
        + '—— 主角在日常/困境中被迫进入冲突中心，第一次被迫做出高风险选择。\n'
        + '—— 揭示世界观的一角（力量体系第一印象）。\n'
        + '—— 主角获得第一个阶段性目标："必须在 X 日之前解决 Y 事件"。\n\n'
        + '第二卷·升维\n'
        + '—— 世界格局被打开，主角进入更高一层的权力博弈。\n'
        + '—— 重要反派首次正面出场。\n'
        + '—— 情感线出现第一次重大转折（背叛/失去/误解）。\n\n'
        + '第三卷·真相\n'
        + '—— 揭示第一卷的事件并非偶然，而是某张更大的网的一部分。\n'
        + '—— 主角面临信念冲击：自己曾经信以为真的东西被推翻。\n\n'
        + '第四卷·反制\n'
        + '—— 主角主动布局，与反派在信息层面交手。\n'
        + '—— 配角多次在关键节点做出反直觉的选择，推进剧情。\n\n'
        + '第五卷·终局\n'
        + '—— 最终风暴来临。\n'
        + '—— 主角在"赢得战斗"和"守住人性"之间做出最终抉择。\n'
        + '—— 结局给出清晰的结果，同时保留一个长线钩子供外传/续集使用。\n\n'
        + '（建议：每卷 8-15 章，细纲请在"章节细纲"模块生成分章节内容。）';
    },
    detail: function (work) {
      var title = (work && work.title) || '未命名作品';
      var out = '【章节细纲：' + title + '】\n\n';
      for (var i = 1; i <= 12; i++) {
        out += '■ 第' + i + '章《（请补全标题）》\n';
        out += '  场景：（请填写该章发生地点）\n';
        out += '  人物：（请填写主要角色）\n';
        out += '  剧情节点：（请描述本章推动主线的事件）\n';
        out += '  爆点/悬念钩子：（请描述章末悬念）\n\n';
      }
      return out;
    }
  };

  function _writeContinue(prompt, work) {
    var title = (work && work.title) || '正文';
    var content = String(prompt || '');
    var tail = content.slice(Math.max(0, content.length - 220));
    var hint = '\n\n（本地生成占位：当前章节续写至此处。'
      + '建议在"AI 写作"模块切换到可用密钥后重新生成完整章节。）';
    return '【章节：' + title + '】\n\n' + tail + hint;
  }

  // 对外暴露一个主入口（与 api.js 中的 generateLocal 语义一致）
  function generateLocal(prompt) {
    var p = String(prompt || '');
    if (!p.trim()) return '（本地生成占位：未收到提示词）';
    // 粗略根据内容推断模块
    if (/世界观|世界规则|world/i.test(p)) return _TEMPLATE.world({ title: '正文' });
    if (/人物|人设|chars|角色/i.test(p)) return _TEMPLATE.chars({ title: '正文' });
    if (/大纲|outline|卷|主线/i.test(p)) return _TEMPLATE.outline({ title: '正文' });
    if (/细纲|detail|章节|章|章回/i.test(p)) return _TEMPLATE.detail({ title: '正文' });
    // 默认：写作正文续写风格
    return _writeContinue(p, null);
  }

  // 挂到 window 供外部 script 块/HTML 调用
  window.generateLocal = window.generateLocal || generateLocal;
  window.aiLocal = {
    generate: generateLocal,
    TEMPLATE: _TEMPLATE,
    writeContinue: _writeContinue
  };
})();
