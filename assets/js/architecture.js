// ====== 跨模块/跨页面 AI 消息链缓存 ======
// 用于架构设计页(architecture.html)和写作页(write.html)共享的模块间上下文记忆。
// 不注入原文/摘要，靠 AI API 的 messages 数组延续对话上下文。

// 模块名 → 对应 prompt 前缀
var _MODULE_CHAT_PROMPTS = {
  world: '请为我的小说构建完整的世界观设定，包括时代背景、地理环境、势力分布、力量体系、核心规则等所有必要维度。',
  chars: '请基于已有的世界观设定，为小说构建完整的人物人设体系，包括所有主要角色的身份、性格、经历、能力和关系网络。',
  outline: '请基于已有的世界观和人物人设，为小说设计完整的全书大纲，包括主线脉络、卷章结构、关键转折点和高潮布局。',
  detail: '请基于已有的世界观、人设和全书大纲，生成详细的章节细纲，包括每章的场景、人物、剧情节点和爆点/悬念。',
  chapter: '请基于已有的世界观、人设、大纲和细纲，生成当前的章节正文。'
};

// ===== 同人模式/已知设定模式：内置已知 IP 列表 =====
// 用户在世界观指令中输入"我要写XXX同人"时自动匹配
// 涵盖网文、动漫、游戏、历史、洪荒、影视等各类可依赖 AI 已知知识的设定
var _FANFIC_IPS = {
  // —— 网文·玄幻仙侠 ——
  '斗罗大陆': true, '斗破苍穹': true, '凡人修仙传': true,
  '完美世界': true, '遮天': true, '圣墟': true, '神墓': true, '长生界': true, '深空彼岸': true,
  '仙逆': true, '求魔': true, '我欲封天': true, '一念永恒': true, '三寸人间': true,
  '沧元图': true, '星辰变': true, '盘龙': true,
  '莽荒纪': true, '雪鹰领主': true, '吞噬星空': true, '飞剑问道': true,
  '牧神记': true, '临渊行': true, '择日飞升': true,
  '诡秘之主': true, '长夜余火': true,
  '大奉打更人': true, '灵境行者': true,
  '道诡异仙': true, '绍宋': true, '唐砖': true,
  '赘婿': true, '庆余年': true, '将夜': true,
  '雪中悍刀行': true, '剑来': true, '三体': true,
  '武动乾坤': true, '大主宰': true, '元尊': true, '万相之王': true,
  '神印王座': true, '天火大道': true, '酒神': true, '生肖守护神': true,
  '斗罗大陆II绝世唐门': true, '斗罗大陆III龙王传说': true,
  '斗罗大陆IV终极斗罗': true, '斗罗大陆V重生唐三': true,
  '修罗武神': true, '万古神帝': true, '飞天鱼': true,
  '夜的命名术': true, '第一序列': true, '大王饶命': true,
  '全球高武': true, '星门': true, '万族之劫': true,
  '轮回乐园': true, '我师兄实在太稳健了': true,
  '这个明星很想退休': true, '全职高手': true,
  '超神机械师': true, '学霸的黑科技系统': true,

  // —— 番茄·免费爆款 ——
  '我在精神病院学斩神': true, '斩神': true,
  '上门龙婿': true, '最佳女婿': true, '超级神豪': true,
  '神秘复苏': true, '我有一座恐怖屋': true,
  '开局地摊卖大力': true, '我在斩妖司除魔三十年': true,
  '重生之都市修仙': true, '蛊真人': true,
  ' Players请就位': true, '我的玩家': true,
  '我在精神病院': true, '直播': true, '规则怪谈': true, '怪谈': true,

  // —— 洪荒·神话·经典 ——
  '洪荒': true, '封神演义': true, '西游记': true,
  '山海经': true, '白蛇传': true, '宝莲灯': true,
  '哪吒': true, '姜子牙': true, '杨戬': true, '后羿': true, '嫦娥': true,

  // —— 历史·架空 ——
  '三国': true, '三国演义': true, '战国': true, '春秋': true,
  '大唐': true, '唐朝': true, '大宋': true, '宋朝': true,
  '大明': true, '明朝': true, '大清': true, '清朝': true,
  '秦朝': true, '汉朝': true, '隋唐': true, '五代十国': true,
  '秦时明月': true, '长安十二时辰': true,
  '回到明朝当王爷': true, '步步惊心': true, '甄嬛传': true,
  '琅琊榜': true, '鹤唳华亭': true, '大秦帝国': true,

  // —— 游戏题材 ——
  '原神': true, '崩坏': true, '崩坏星穹铁道': true, '崩坏3': true,
  '明日方舟': true, '碧蓝航线': true, '王者荣耀': true,
  '英雄联盟': true, 'LOL': true, '魔兽世界': true, 'WOW': true,
  '剑网3': true, '天涯明月刀': true, '逆水寒': true,
  '仙剑奇侠传': true, '轩辕剑': true, '古剑奇谭': true,
  '最终幻想': true, '塞尔达': true, '巫师': true, '猎魔人': true,
  '赛博朋克2077': true, '黑暗之魂': true, '艾尔登法环': true, '老头环': true,
  '装甲核心': true, '只狼': true, '血源诅咒': true,
  '鸣潮': true, '绝区零': true, '永劫无间': true,
  '第五人格': true, '阴阳师': true, 'FGO': true, '命运冠位指定': true,
  '梦幻西游': true, '大话西游': true, '问道': true,
  '植物大战僵尸': true, 'Minecraft': true, '我的世界': true,

  // —— 日漫· Anime ——
  '火影忍者': true, '海贼王': true, '死神': true, '龙珠': true,
  '鬼灭之刃': true, '咒术回战': true, '一拳超人': true,
  '进击的巨人': true, '全职猎人': true, '妖精的尾巴': true,
  '银魂': true, 'JOJO': true, 'JOJO的奇妙冒险': true,
  'EVA': true, '新世纪福音战士': true,
  '刀剑神域': true, 'SAO': true,
  'Re0': true, '从零开始的异世界生活': true,
  'OVERLORD': true, '骨王': true, '关于我转生变成史莱姆这档事': true,
  '无职转生': true, '葬送的芙莉莲': true,
  '间谍过家家': true, '我推的孩子': true,
  '死亡笔记': true, '钢之炼金术师': true, '命运石之门': true,
  '东京喰种': true, '喰种': true, '寄生兽': true,
  '恶魔幸存者': true, '女神异闻录': true, 'P5': true,

  // —— 特摄·国漫 ——
  '铠甲勇士': true, '奥特曼': true, '假面骑士': true,
  '一人之下': true, '狐妖小红娘': true,
  '镇魂街': true, '灵笼': true, '时光代理人': true,
  '伍六七': true, '刺客伍六七': true,
  '全职高手动画': true, '斗破苍穹动画': true, '完美世界动画': true,
  '吞噬星空动画': true, '凡人修仙传动画': true, '仙逆动画': true,
  '大理寺日志': true, '非人哉': true, '罗小黑战记': true,

  // —— 欧美·影视 ——
  '哈利波特': true, '指环王': true, '魔戒': true,
  '冰与火之歌': true, '权力的游戏': true,
  '漫威': true, 'DC': true, '星球大战': true,
  '黑客帝国': true, '盗梦空间': true,
  '楚门的世界': true, '西部世界': true,
  '绝命毒师': true, '风骚律师': true,
  '怪奇物语': true, '黑镜': true,
  '鱿鱼游戏': true, '黑暗荣耀': true,
  '三体影视': true, '流浪地球': true
};

// 构建前序模块的对话链 messages 数组
// currentModule 为 'chapter' 时包含所有架构模块 + 之前章节
// currentModule 为 'world' 时返回空数组
function buildArchChatChain(work, currentModule) {
  if (!work || !work._archChatChain || !Array.isArray(work._archChatChain)) return [];
  
  var chain = work._archChatChain;
  var result = [];
  for (var i = 0; i < chain.length; i++) {
    // 只返回当前模块之前模块的对话
    if (chain[i]._module === currentModule) break;
    result.push({
      role: chain[i].role,
      content: chain[i].content
    });
  }
  return result;
}

// 追加当前模块的对话到消息链
function appendArchChatMessage(work, module, role, content) {
  if (!work) return;
  if (!work._archChatChain || !Array.isArray(work._archChatChain)) {
    work._archChatChain = [];
  }
  work._archChatChain.push({
    role: role,
    content: content,
    _module: module,
    ts: Date.now()
  });
  // 每次追加后检查是否需要压缩
  compressArchChatChain(work);
}

// ========== 三级记忆压缩策略 ==========
// T1：架构模块 (world/chars/outline/detail) — 永远保留完整原文
// T2：最近 3 章 — 保留完整原文
// T3：更早章节 — 压缩为开头+结尾段落
// 触发条件：链中内容总长度超过 80K 字符

// 阈值（字符数）
var _CHAIN_COMPRESS_THRESHOLD = 80000;
// 保留最近章节数（完整保留）
var _CHAIN_KEEP_LAST_CHAPTERS = 3;

// 压缩单章内容：保留开头和结尾，中间压缩
function _compressChapterContent(content) {
  if (!content || content.length <= 3000) return content;
  var head = content.substring(0, 1500);
  // 找到第一个段落边界
  var headEnd = head.lastIndexOf('\n\n');
  if (headEnd > 800) head = head.substring(0, headEnd);
  
  var tail = content.substring(content.length - 1500);
  var tailStart = tail.indexOf('\n\n');
  if (tailStart > 0 && tailStart < 700) tail = tail.substring(tailStart + 2);
  
  return head + '\n\n...（中间内容已压缩，保留章节首尾关键段落）...\n\n' + tail;
}

// 压缩对话链：按三级策略压缩
function compressArchChatChain(work) {
  if (!work || !work._archChatChain || !Array.isArray(work._archChatChain)) return;
  
  // 1. 统计总长度
  var totalLen = 0;
  for (var i = 0; i < work._archChatChain.length; i++) {
    totalLen += (work._archChatChain[i].content || '').length;
  }
  if (totalLen <= _CHAIN_COMPRESS_THRESHOLD) return;
  
  // 2. 找出所有章节消息的最后 N 条（这些保留完整）
  var chapterEntries = [];
  for (var i = 0; i < work._archChatChain.length; i++) {
    if (work._archChatChain[i]._module === 'chapter') {
      chapterEntries.push(i);
    }
  }
  
  // 3. 需要压缩的章节索引（从旧到新，跳过最后 N 条）
  var compressCount = Math.max(0, chapterEntries.length - _CHAIN_KEEP_LAST_CHAPTERS * 2);
  // 每章节有 user + assistant 两条，所以 *2
  // 但每章只有 assistant 的内容才需要压缩，user 的 prompt 一般较短
  var compressedAny = false;
  for (var ci = 0; ci < compressCount; ci++) {
    var idx = chapterEntries[ci];
    var entry = work._archChatChain[idx];
    if (entry.role === 'assistant' && entry.content && entry.content.length > 3000 && !entry._compressed) {
      entry.content = _compressChapterContent(entry.content);
      entry._compressed = true;
      entry._compressedAt = Date.now();
      compressedAny = true;
    }
  }
  
  // 4. 如果压缩后仍然超阈值，继续压缩更早章节的 user message（更短的 prompt）
  if (compressedAny) {
    // 重新统计
    totalLen = 0;
    for (var i = 0; i < work._archChatChain.length; i++) {
      totalLen += (work._archChatChain[i].content || '').length;
    }
  }
  
  // 5. 极端情况：压缩后仍然超阈值（章节太多），进一步裁剪更早章节的 assistant 到更短
  if (totalLen > _CHAIN_COMPRESS_THRESHOLD) {
    for (var ci = 0; ci < Math.min(compressCount, chapterEntries.length); ci++) {
      var idx = chapterEntries[ci];
      var entry = work._archChatChain[idx];
      if (entry.role === 'assistant' && entry.content && entry.content.length > 800) {
        // 进一步压缩到仅仅 400+400
        if (entry.content.length > 1000) {
          var h = entry.content.substring(0, 400);
          var t = entry.content.substring(entry.content.length - 400);
          entry.content = h + '\n\n...（略）...\n\n' + t;
          entry._compressed = true;
        }
        break; // 一次只压缩一条，避免 O(n)
      }
    }
  }
}