/* 文心笔匠 - 写作编辑器模块 */
/* 从 write.html 中提取，包含章节编辑、AI写作、质量检测等全部写作功能 */

let currentChapterIdx = 0;
const ARCH_FIELDS = ['world','chars','outline','detail'];
const ARCH_NAMES = {world:'世界观',chars:'人物人设',outline:'大纲',detail:'细纲'};

// ========== 记忆分级元数据（v50: 精细化Tier控制，在所有记忆函数之前定义）==========
// L0 全书级核心事实：身份/秘密/血脉/主线关键设定——永久保留，永不压缩
// L1 高优先级：角色Tags/关系/道具/承诺——age>=25才可蒸馏，age>=40才可归档
// L2 中优先级：地点/时间线/钩子——age>=15可蒸馏，age>=25可归档
var MEMORY_TIER_META = {
  core:         { tier: 0, maxRaw: 200, compressAfter: -1,   archiveAfter: -1,   weight: 12, label: 'L0核心' },
  characterTags:{ tier: 1, maxRaw: 120, compressAfter: 25, archiveAfter: 40,  weight: 8,  label: 'L1角色' },
  relationships:{ tier: 1, maxRaw: 120, compressAfter: 25, archiveAfter: 40,  weight: 8,  label: 'L1关系' },
  items:        { tier: 1, maxRaw: 100, compressAfter: 25, archiveAfter: 40,  weight: 8,  label: 'L1道具' },
  promises:     { tier: 1, maxRaw: 80,  compressAfter: 20, archiveAfter: 35,  weight: 7,  label: 'L1承诺' },
  // v51 新增：记更多东西
  dialogues:    { tier: 1, maxRaw: 80,  compressAfter: 20, archiveAfter: 35,  weight: 7,  label: 'L1金句' },     // 角色标志性台词/金句
  abilityCosts: { tier: 1, maxRaw: 60,  compressAfter: 15, archiveAfter: 25,  weight: 7,  label: 'L1能力代价' },  // 能力使用代价/反噬/限制
  emotionTrack: { tier: 1, maxRaw: 100, compressAfter: 20, archiveAfter: 35,  weight: 6,  label: 'L1情感轨迹' },  // 角色情感变化轨迹
  scenes:       { tier: 2, maxRaw: 80,  compressAfter: 15, archiveAfter: 25,  weight: 5,  label: 'L2场景细节' },  // 重要场景的感官细节
  locations:    { tier: 2, maxRaw: 80,  compressAfter: 15, archiveAfter: 25,  weight: 6,  label: 'L2地点' },
  timeline:     { tier: 2, maxRaw: 60,  compressAfter: 15, archiveAfter: 25,  weight: 6,  label: 'L2时间' },
  hooks:        { tier: 2, maxRaw: 80,  compressAfter: 15, archiveAfter: 25,  weight: 5,  label: 'L2钩子' },
  // v54: 章节上下文 — 替代原文注入，用结构化精要衔接上下章
  chapterContext:{ tier: 1, maxRaw: 60,  compressAfter: 8,  archiveAfter: 20,  weight: 9,  label: 'L1章节上下文' }
};

// v51：角色分级权重（主角记忆最重，龙套最轻，超长篇自动遗忘龙套）
var CHAR_ROLE_WEIGHT = {
  '主角':  { weight: 5, maxAnchors: 30, label: '主角', neverForget: true },
  '女主':  { weight: 4, maxAnchors: 25, label: '女主', neverForget: true },
  '男主':  { weight: 4, maxAnchors: 25, label: '男主', neverForget: true },
  '反派':  { weight: 4, maxAnchors: 20, label: '反派', neverForget: false },
  '配角':  { weight: 3, maxAnchors: 15, label: '配角', neverForget: false },
  '导师':  { weight: 3, maxAnchors: 12, label: '导师', neverForget: false },
  '伙伴':  { weight: 3, maxAnchors: 12, label: '伙伴', neverForget: false },
  '龙套':  { weight: 1, maxAnchors: 5,  label: '龙套', neverForget: false }
};

// ========== PLATINUM_RULES v50：白金作家创作法则（注入正文生成） ==========
var PLATINUM_RULES = {
  // ===== 句式结构与段落节奏 =====
  'sentence_rhythm': '【句式节奏】长句铺陈信息/描写细节/营造氛围；短句制造紧张/强调重点/推进动作。禁忌：不要连续用三个以上相同长度的句子。',
  'sentence_limit': '【句式硬规则】单句字数不超25字，长句立刻拆分。永远遵循"动作先行，情感落点"原则。',
  'punctuation_rhythm': '【标点节奏】句号是停顿/重置/喘息；逗号是"别停，后面还有"；省略号是悬置/未尽之言；爆文最常用：用句号代替逗号，三个短句三下心跳。',
  'breath_break': '【气口断句】按"气口"断句，不按"语法"断句。读者呼吸的地方就是句号该放的地方。',
  'paragraph_visual': '【段落视觉】段落要有视觉分布感，长短句交替制造"铺垫—爆发—余震"的完整节奏弧线。',
  // ===== 比喻修辞与文风 =====
  'metaphor_skill': '【比喻修辞】用比喻、拟人、通感增强表现力。排比增强气势，对偶增强节奏感。',
  'show_not_tell': '【描写法则】别说"他害怕"，写"冷汗直流，心脏砰砰狂跳"。能用动作表现就少用空泛说明。',
  'dialogue_style': '【对话风格】每个角色要有不同的说话风格。盖住角色名，仅凭对话能分辨是谁说话。',
  'concise_style': '【精炼文风】网文语言必须极度精炼，多用短句。删除无用的副词（"慢慢地""小心翼翼地"）。',
  // ===== 情绪起伏与延迟释放 =====
  'emotion_delay': '【延迟释放】情绪产生后先压住，压到读者替人物难受了再释放。情绪没有经过"发酵"读者看完就忘。',
  'emotion_wave': '【情绪波浪】关键词重复中产生递进：他不信命→从小就不信→他不信→他不信。现在他开始有点信了。',
  'emotion_control': '【情绪调动】读者追更追的不是情节，是情绪。爽点制造升级、虐点铺垫爆发、甜点细腻真实。',
  // ===== 冰山对话法则（2026核心）=====
  'iceberg_dialogue': '【冰山对话】文字只写水面1/8的表层内容，剩下7/8的情绪/矛盾/隐忍全部藏在细节里。拒绝"他很生气""她很委屈"这类直白描写。成年人的情绪不外露。',
  // ===== 视角控制（2026核心：禁读心 + 视角锁）=====
  'no_mind_reading': '【禁读心法则】角色之间绝对不能"知道对方在想什么"。除非有明确的超能力设定（读心术、他心通、精神链接）并在人设中标注，否则严禁写"A知道B在想……"、"B心里想的正好是……"、"他一眼看穿了她的心思"。只能通过"动作/表情/语气"推测，不能直接"读"到。',
  'perspective_locked': '【视角锁定】全程只能用一种主要叙述视角。默认：第三人称有限视角（只能写主角能看到/听到/感受到的），不能跳到配角的内心活动。第一人称"我"必须是主角本人，不能中途换"我"指其他人。',
  'perspective_switch': '【视角切换规则】如需切换视角，必须满足以下全部条件：①前一章已有明确铺垫（该角色至少出场过一次）；②有不可替代的剧情需求（如主角不在场的关键场景）；③切换有明确的场景间隔（新起一段、换章节），不可在同一段落内跳来跳去；④切换后在300字内切回主视角，或该角色的这一段有独立叙事价值（如反派独白、关键线索揭示）。不满足条件则严禁切换。',
  'iceberg_micro_action': '【微动作冰山】愤怒→指尖发白/咬紧后槽牙/声音压低；紧张→喉结滚动/手指摩挲；暧昧→耳尖泛红/指腹蹭过手腕。禁忌：动作和情绪词同时出现。',
  'iceberg_answer_nonanswer': '【答非所问】被质问时绝对不要正面解释。转移话题/纠结细微细节/顾左右而言他。答非所问是顶级潜台词。',
  'iceberg_daily_cover': '【日常事物掩护】把尖锐矛盾藏在日常物件里（香水/晚风/茶水/衣物/烟火气）。看似聊琐事，实则暗藏纠葛。',
  // ===== 关键时刻打断 =====
  'key_moment_interrupt': '【关键时刻打断】在情绪/暧昧/冲突最高潮突然中断，打断事件：紧急军情/敲门声/雷声/孩子哭声。禁忌：打断后不要立刻接新事件，让读者屏住呼吸等下一页。',
  // ===== 节奏控制（AI最弱项）=====
  'rhythm_grid': '【爽点密度公式】每章必须有1个小爽点；每3-5章有1个中爽点（完整打脸/关系突破/实力跃升）；每卷有1个大爽点（boss战逆转/身份曝光/伏笔串联）。禁忌：连续3章无任何爽点。',
  'rhythm_instruct': '【节奏指令标注】AI最弱是"太均匀"——每段等长、每事件描写密度相同。必须在蓝图里写清楚：哪里快（短句为主）、哪里慢（长句铺氛围）、哪里急停（章末钩子前）。告诉AI"本章加快节奏"而不是让它自己猜。',
  'emotion_peak': '【情绪峰值设计】AI情绪值在-3到+3间平滑波动，像心电图挂了。真实情绪应从-8急拉到+7。手法：在情绪高涨时突然塞一句反情绪的话——"他咬着牙说恨她。但他把她照片塞进了钱包最深处。"这种撕裂感才是读者追读的原因。',
  // ===== 逻辑意外与角色不完美（AI不懂真实人性）=====
  'logic_surprise': '【逻辑意外】AI角色永远"合理"——不犹豫、不犯错、不做莫名其妙但符合性格的事。真实的人会：关键时刻手抖、明明知道但故意不听、说谎说到最后自己都信了。让角色做一次"蠢事"（但符合人设），比完美人设更让读者记住。',
  'character_flaws': '【角色缺陷表】AI塑造完美人设，真实人设要有缺陷。给每个主角配一个"不可爱但真实"的缺点：路怒症/恐针/分不清左右/撒谎时眼神飘。用缺陷代替完美，用真实代替"应该"。',
  'anti_emotion_insert': '【反情绪插入】情绪连续上升时，强行塞一句完全反情绪的话。上一段"他恨透了她"，下一段"但他把她多加了辣酱的那碗面倒得干干净净"。AI不会主动这样写，这是人类作者的"撕裂感"专利。',
  // ===== 地文与对话分工 =====
  'ground_dialogue_cycle': '【地文对话循环】地文负责走路（事实：背景/动作/描写），对话负责奔跑（意志：角色想要什么）。',
  // ===== 冲突与开篇 =====
  'target_sense': '【目标感法则】角色必须有明确目标驱动情节。目标缺失则中后期必散架。',
  'conflict': '【冲突公式】目标 + 障碍 + 代价 = 冲突。代价必须真实可见。',
  'first3': '【黄金三章】第一章300字内"扔炸弹"，1000字内"亮金手指"。立刻让主角陷入困境。',
  'chapter_formula': '【正文公式】抛矛盾→拉仇恨→主角出手→全场震惊→留钩子。无钩子，不爆款。',
  'hook': '【章末钩子】三种经典：中断动作瞬间、揭露信息制造更大疑问、情绪悬而未决。',
  // ===== 体系与反派 =====
  'power_system': '【力量体系】等级清晰，升级必须有代价和门槛。宁可换地图，不要随意拔高战力。',
  'underdog': '【废柴流精髓】开局惨，为逆袭提供巨大情绪空间。可以弱但不能怂。',
  // ===== 综合 =====
  'four_skills': '【四大技能】①开篇能力②节奏控制③人物塑造④情绪调动。',
  'one_line_pitch': '【一句话卖点】谁 + 陷入什么死局 + 靠什么翻盘 + 爽到什么程度。'
};

function getPlatinumRulesHint(work){
  var keys = Object.keys(PLATINUM_RULES);
  var selected = [];
  // 必选核心：冰山对话3条 + 禁读心 + 视角锁 + 情绪峰值 + 节奏密度 + 逻辑意外 + 地文对话 + 正文公式 + 黄金三章
  var mustSelect = ['iceberg_dialogue', 'iceberg_micro_action', 'iceberg_answer_nonanswer', 'no_mind_reading', 'perspective_locked', 'emotion_peak', 'rhythm_grid', 'logic_surprise', 'ground_dialogue_cycle', 'chapter_formula', 'first3'];
  for(var i = 0; i < mustSelect.length; i++){
    if(PLATINUM_RULES[mustSelect[i]]) selected.push(PLATINUM_RULES[mustSelect[i]]);
  }
  // 视角特殊化：如果作品设置了第一人称，替换视角锁描述
  if (work && work.perspective === 'first') {
    var idx = selected.indexOf(PLATINUM_RULES['perspective_locked']);
    if (idx >= 0) {
      selected[idx] = '【视角锁定】本作品为第一人称（"我"）叙事。所有叙述必须从"我"的感官出发，"我"不在场的场景绝对不能写（只能通过后续对话/信/报告间接获知）。严禁跳转到其他角色的内心活动。';
    }
  }
  // 随机选2条补充（少而精，不挤掉核心）
  var remaining = keys.filter(function(k){ return mustSelect.indexOf(k) === -1; });
  var addCount = 2;
  for(var j = 0; j < addCount && remaining.length > 0; j++){
    var idx2 = Math.floor(Math.random() * remaining.length);
    selected.push(PLATINUM_RULES[remaining[idx2]]);
    remaining.splice(idx2, 1);
  }
  return selected.join('\n');
}

// ===== 三级导航 =====
var _writeLevel = 1;
var _selectedWriteWorkId = null;

function goToWriteLevel(level, opts) {
  opts = opts || {};
  _writeLevel = level;

  // 切换视图
  for (var i = 1; i <= 3; i++) {
    var el = document.getElementById('write-level' + i);
    if (el) el.classList.toggle('active', i === level);
  }

  // 更新面包屑
  var bc = document.getElementById('write-breadcrumb');
  var html = '<span class="bc-item" onclick="goToWriteLevel(1)">AI写作</span>';
  if (level >= 2) {
    html += '<span class="bc-sep"> › </span>';
    if (level === 2) html += '<span class="bc-current">选择作品</span>';
    else html += '<span class="bc-item" onclick="goToWriteLevel(2)">选择作品</span>';
  }
  if (level >= 3) {
    var work = _selectedWriteWorkId ? DB.works.find(function(w){ return w.id === _selectedWriteWorkId; }) : null;
    html += '<span class="bc-sep"> › </span>';
    html += '<span class="bc-current">' + he(work ? (work.title || '未命名') : '写作') + '</span>';
  }
  bc.innerHTML = html;

  // 更新标题和按钮
  var titleEl = document.getElementById('work-title');
  var refBtn = document.getElementById('ref-btn-header');
  if (level === 1) { titleEl.textContent = 'AI写作'; if (refBtn) refBtn.style.display = 'none'; }
  else if (level === 2) { titleEl.textContent = '选择作品'; if (refBtn) refBtn.style.display = 'none'; }
  else { var w = _selectedWriteWorkId ? DB.works.find(function(w2){ return w2.id === _selectedWriteWorkId; }) : null; titleEl.textContent = w ? w.title : '写作'; if (refBtn) refBtn.style.display = ''; }

  // 渲染各级内容
  if (level === 1) renderWriteLevel1();
  if (level === 2) renderWriteLevel2();
  if (level === 3) renderWriteLevel3(opts);
}

function handleWriteBack() {
  if (_writeLevel > 1) goToWriteLevel(_writeLevel - 1);
  else location.href = 'index.html';
}

function renderWriteLevel1() {
}

function renderWriteLevel2() {
  var works = DB.works || [];
  var body = document.getElementById('write-l2-body');
  if (!body) return;

  if (works.length === 0) {
    body.innerHTML = '<div class="l2-empty"><div class="empty-icon">📝</div><div class="empty-text">还没有作品<br>先去架构设计创建一部作品吧</div><a class="empty-btn" href="architecture.html">去创建</a></div>';
    return;
  }

  var html = '';
  works.forEach(function(w) {
    var chCount = (w.chapters || []).length;
    var wordCount = 0;
    if (w.chapters) w.chapters.forEach(function(ch) { wordCount += (ch.content || '').length; });
    var wc = wordCount > 1000 ? Math.round(wordCount / 1000) + 'k' : wordCount;
    var archStatus = w.archStatus || {};

    html += '<div class="work-card" data-work-id="' + he(w.id || '') + '">';
    html += '<div class="wc-icon">📖</div>';
    html += '<div class="wc-info">';
    html += '<div class="wc-title">' + he(w.title || '未命名') + '</div>';
    html += '<div class="wc-meta">' + chCount + '章 · 约' + wc + '字</div>';
    html += '<div class="wc-progress">';
    ARCH_FIELDS.forEach(function(f) {
      var s = archStatus[f] || 'locked';
      var dotClass = s === 'done' ? ' done' : (s === 'pending' ? ' current' : '');
      html += '<div class="prog-dot' + dotClass + '"></div>';
    });
    html += '</div>';
    html += '</div>';
    html += '<div class="wc-arrow">›</div>';
    html += '</div>';
  });
  body.innerHTML = html;
  // 用事件委托替代内联 onclick，避免 XSS 风险
  body.querySelectorAll('.work-card').forEach(function(card){
    card.addEventListener('click', function(){
      selectWriteWork(this.getAttribute('data-work-id'));
    });
  });
}

function selectWriteWork(workId) {
  _selectedWriteWorkId = workId;
  // 同步到隐藏的 work-select
  var sel = document.getElementById('work-select');
  if (sel) sel.value = workId;
  localStorage.setItem('last_edit_work', workId);
  currentChapterIdx = 0;
  clearWorkRuntimeCache();
  goToWriteLevel(3);
}

function renderWriteLevel3(opts) {
  // 设置 work-select 值
  var sel = document.getElementById('work-select');
  if (sel && _selectedWriteWorkId) sel.value = _selectedWriteWorkId;
  loadWork();
  renderChSidebar();
  // 默认打开章节侧栏
  if (window.innerWidth > 768) {
    var sidebar = document.getElementById('ch-sidebar');
    if (sidebar) sidebar.classList.add('open');
  }
}

// ===== 章节侧栏 =====
function toggleChSidebar() {
  var sidebar = document.getElementById('ch-sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

function renderChSidebar() {
  var work = getCurrentWork();
  var body = document.getElementById('ch-sidebar-body');
  if (!body || !work || !work.chapters) return;

  var html = '';
  work.chapters.forEach(function(ch, idx) {
    var isActive = idx === currentChapterIdx;
    var wordCount = (ch.content || '').length;
    var badgeClass = wordCount > 0 ? 'done' : 'draft';
    var badgeText = wordCount > 0 ? (wordCount >= 1000 ? (wordCount/1000).toFixed(1)+'k' : wordCount) + '字' : '空';
    html += '<div class="ch-sidebar-item' + (isActive ? ' active' : '') + '" onclick="loadChapter(' + idx + ');renderChSidebar();">'
      + '<div class="csi-num">' + (idx + 1) + '</div>'
      + '<div class="csi-name">' + he(ch.title || '第' + (idx + 1) + '章') + '</div>'
      + '<span class="csi-badge ' + badgeClass + '">' + badgeText + '</span>'
      + '</div>';
  });
  body.innerHTML = html;
}

// ===== 工具栏下拉菜单 =====
function toggleToolbarMenu(menuId) {
  var menu = document.getElementById(menuId);
  if (!menu) return;
  var isOpen = menu.classList.contains('open');
  closeToolbarMenus();
  if (!isOpen) {
    // 用 fixed 定位，避免被父容器 overflow 裁剪
    menu.classList.add('open');
    try {
      var group = menu.closest('.toolbar-group');
      if (group) {
        var rect = group.getBoundingClientRect();
        var menuHeight = menu.offsetHeight || 200;
        var menuWidth = Math.min(menu.offsetWidth || 220, 260);
        var spaceAbove = rect.top - 10; // 上方可用空间（留出 padding）
        var spaceBelow = window.innerHeight - rect.bottom - 10; // 下方可用空间
        var top;
        // 优先选空间更大的方向（避免被 tab-bar 遮挡）
        if (spaceAbove >= menuHeight || spaceAbove >= spaceBelow) {
          top = Math.max(10, rect.top - menuHeight - 6);
        } else if (spaceBelow >= menuHeight) {
          top = rect.bottom + 6;
        } else {
          // 两个方向都不够，选上方（因为 tab-bar 在底部）
          top = Math.max(10, rect.top - menuHeight - 6);
          menuHeight = Math.min(menuHeight, spaceAbove);
        }
        // 水平位置：尽量与按钮对齐，但不超出屏幕
        var left = rect.left;
        if (left + menuWidth > window.innerWidth - 10) {
          left = window.innerWidth - menuWidth - 10;
        }
        if (left < 10) left = 10;
        menu.style.top = top + 'px';
        menu.style.left = left + 'px';
        menu.style.right = 'auto';
        menu.style.bottom = 'auto';
        menu.style.maxWidth = menuWidth + 'px';
        menu.style.width = 'auto';
        menu.style.maxHeight = (menuHeight - 4) + 'px';
        menu.style.overflowY = 'auto';
      }
    } catch(e) {}
  }
}
function closeToolbarMenus() {
  document.querySelectorAll('.toolbar-dropdown').forEach(function(m) { m.classList.remove('open'); });
}
// 点击页面其他区域关闭菜单
document.addEventListener('click', function(e) {
  if (!e.target.closest('.toolbar-group')) closeToolbarMenus();
});
// 滚动/调整大小时关闭菜单
(function() {
  function _closeOnEvent() { closeToolbarMenus(); }
  document.addEventListener('DOMContentLoaded', function() {
    var editorContent = document.querySelector('.editor-content');
    if (editorContent) editorContent.addEventListener('scroll', _closeOnEvent);
  });
  document.addEventListener('scroll', _closeOnEvent, true);
  window.addEventListener('resize', _closeOnEvent);
  window.addEventListener('orientationchange', _closeOnEvent);
})();

// ===== 自动保存草稿 =====
var _autoSaveTimer = null;
function _scheduleAutoSave() {
  if (_autoSaveTimer) clearTimeout(_autoSaveTimer);
  _autoSaveTimer = setTimeout(function() {
    var work = getCurrentWork();
    if (!work || !work.chapters) return;
    var content = document.getElementById('editor').value;
    var title = document.getElementById('ch-title').value.trim();
    var ch = work.chapters[currentChapterIdx];
    if (!ch) { work.chapters[currentChapterIdx] = {title:title, content:content}; }
    else { ch.title = title; ch.content = content; }
    DB.saveWork(work);
  }, 2000);
}

// 检测编辑器内容是否脏（与已保存章节不一致）
function _isEditorDirty() {
  var work = getCurrentWork();
  if (!work || !work.chapters) return false;
  var ch = work.chapters[currentChapterIdx];
  var curContent = document.getElementById('editor').value;
  var curTitle = document.getElementById('ch-title').value.trim();
  if (!ch) return curContent.length > 0;
  return (ch.content || '') !== curContent || (ch.title || '') !== curTitle;
}



function openPanel(){
  document.getElementById('panel-overlay').classList.add('open');
  document.getElementById('ref-panel').classList.add('open');
}
function closePanel(){
  document.getElementById('panel-overlay').classList.remove('open');
  document.getElementById('ref-panel').classList.remove('open');
}

function getCurrentWork(){
  const id=document.getElementById('work-select').value;
  return DB.works.find(w=>w.id===id)||null;
}

function getCurrentWorkFingerprint(work){
  if (!work) return '';
  try { return DB.ensureWorkFingerprint ? DB.ensureWorkFingerprint(work) : (work._fingerprint || ''); } catch(e) { return work._fingerprint || ''; }
}
function clearWorkRuntimeCache(){
  window._chapterSubData = {};
  window._charCardsData = null;
  window._editorBackup = null;
  window._editorBackup2 = null;
  window._lastChainReport = null;
}
function validateCurrentWorkBeforeWrite(work){
  if (!work) { showToast('请先新建或选择作品'); return false; }
  var selectedId = (document.getElementById('work-select') || {}).value || '';
  if (selectedId && selectedId !== work.id) {
    showToast('⚠️ 检测到作品选择不一致，已阻止保存，正在重新加载当前作品', 4500);
    loadWork();
    return false;
  }
  if (DB.validateWorkIsolation && !DB.validateWorkIsolation(work)) return false;
  return true;
}


function initPage(){
  const works=DB.works||[];
  const selectEl=document.getElementById('work-select');
  if(works.length===0){selectEl.innerHTML='<option>暂无作品</option>';}
  else{
    selectEl.innerHTML=works.map(w=>'<option value="'+w.id+'">'+he(w.title||'未命名')+'</option>').join('');
  }
  // 恢复上次选择的作品
  const lastId=localStorage.getItem('last_edit_work');
  if(lastId && works.some(function(w){return w.id===lastId;})){
    selectEl.value=lastId;
    _selectedWriteWorkId=lastId;
  }

  // 渲染入口页统计
  renderWriteLevel1();

  // 如果有上次的作品，直接进入 Level 3
  if(_selectedWriteWorkId && works.some(function(w){return w.id===_selectedWriteWorkId;})){
    goToWriteLevel(3);
  }
}

function onWorkChange(){
  // 检测脏数据，弹出确认
  if (_isEditorDirty()) {
    if (!confirm('当前章节有未保存的修改，切换作品将丢失这些修改。\n\n确定要切换吗？')) return;
  }
  const id=document.getElementById('work-select').value;
  localStorage.setItem('last_edit_work',id);
  currentChapterIdx=0;
  clearWorkRuntimeCache();
  // ===== 切换作品：强制清空所有架构参考区，避免显示旧作品内容 =====
  try {
    document.getElementById('ref-world').value='';
    document.getElementById('ref-chars').value='';
    document.getElementById('ref-outline').value='';
    document.getElementById('ref-detail').value='';
    document.getElementById('editor').value='';
  } catch(_){}
  loadWork();
}

function loadWork(){
  const work=getCurrentWork();
  if(!work)return;
  window._activeWorkId = work.id;
  window._activeWorkFingerprint = getCurrentWorkFingerprint(work);
  document.getElementById('work-title').textContent=work.title||'未命名';
  document.getElementById('ref-world').value=work.world||'';
  document.getElementById('ref-chars').value=work.chars||'';
  document.getElementById('ref-outline').value=work.outline||'';
  document.getElementById('ref-detail').value=work.detail||'';
  updateArchStatus(work);
  ARCH_FIELDS.forEach(f=>{
    const stEl=document.getElementById('st-'+f);
    if(work[f]&&work[f].trim()){stEl.textContent='已设置';stEl.className='status done';}
    else{stEl.textContent='未设置';stEl.className='status empty';}
  });
  // 从细纲自动提取章节
  autoFillChapters(work);
  if(work.chapters&&work.chapters.length>0){loadChapter(currentChapterIdx);}
  else{work.chapters=[{title:'第一章',content:''}];DB.saveWork(work);loadChapter(0);}
  renderMemory(work);
}

function updateArchStatus(work){
  const statusEl=document.getElementById('arch-status');
  const archStatus=work.archStatus||{};
  let html='';
  ARCH_FIELDS.forEach(f=>{
    const status=archStatus[f]||'locked';
    const dotClass=status==='done'?'done':(status==='pending'?'pending':'locked');
    html+='<div class="dot '+dotClass+'"></div><span>'+ARCH_NAMES[f]+'</span>';
  });
  statusEl.innerHTML=html;
}

// 从细纲自动提取章节列表
function autoFillChapters(work){
  if(work.chapters&&work.chapters.length>0)return; // 已有章节不覆盖
  var detail = work.detail || '';
  if(!detail.trim()) return; // 无细纲跳过

  var chapters = [];
  // 按"=== 第X卷 ==="切卷
  var volParts = detail.split(/=== 第[一二三四五六七八九十\d]+卷[^=]*===/);
  var volHeaders = detail.match(/=== 第[一二三四五六七八九十\d]+卷[^=]*===/g) || [];
  
  // 合并所有内容解析章节行
  for(var vp = 0; vp < Math.max(volParts.length, 1); vp++) {
    var part = volParts[vp] || '';
    var lines = part.split('\n');
    for(var li = 0; li < lines.length; li++) {
      var line = lines[li].trim();
      if(!line) continue;
      // 匹配: 第X章 《标题》 | ...
      var m = line.match(/^(第[一二三四五六七八九十\d百千]+章)\s*[《「]([^》」]+)[》」]/);
      if(m) {
        chapters.push({title: m[1] + ' ' + m[2], content: ''});
        continue;
      }
      // 匹配宽松格式: 第X章 标题
      var m2 = line.match(/^(第[一二三四五六七八九十\d百千]+章)[\s]+(.{2,30})\s*[|｜]/);
      if(m2) {
        chapters.push({title: m2[1] + ' ' + m2[2], content: ''});
        continue;
      }
    }
  }

  if(chapters.length > 0) {
    work.chapters = chapters;
    DB.saveWork(work);
    showToast('📋 从细纲自动提取了 ' + chapters.length + ' 个章节');
  }
}

function loadChapter(idx){
  const work=getCurrentWork();
  if(!work||!work.chapters)return;
  currentChapterIdx=idx;
  const ch=work.chapters[idx];
  document.getElementById('ch-title').value=ch.title||'';
  document.getElementById('editor').value=ch.content||'';
  updateWordCount();
  if ((!ch.content || ch.content.length === 0) && ch._slim && DB.loadChapterShard) {
    document.getElementById('editor').placeholder = '正在从章节分片加载正文...';
    DB.loadChapterShard(work.id, idx).then(function(row){
      if (row && currentChapterIdx === idx) {
        document.getElementById('editor').value = row.content || '';
        document.getElementById('editor').placeholder = '开始写作...';
        updateWordCount();
      }
    }).catch(function(e){ console.warn('[loadChapterShard]', e); });
  }
}

function saveChapter(){
  if (_autoSaveTimer) { clearTimeout(_autoSaveTimer); _autoSaveTimer = null; }
  const work=getCurrentWork();if(!validateCurrentWorkBeforeWrite(work))return;
  const title=document.getElementById('ch-title').value.trim();
  const content=document.getElementById('editor').value;
  var ch = work.chapters[currentChapterIdx];
  if (!ch) { work.chapters[currentChapterIdx] = {title:title, content:content}; }
  else { ch.title = title; ch.content = content; }
  if(!work.memory)work.memory=[];
  updateLongMemory(work, currentChapterIdx);
  try {
    var chainReport = runFullChainAfterWrite(work, currentChapterIdx, content);
    if (chainReport && chainReport.score < 75) showToast('全链路一致性 ' + chainReport.score + '分：' + chainReport.issues.slice(0,2).join('、'), 4500);
  } catch(chainErr) { console.warn('[chain]', chainErr); }
  DB.saveWork(work);
  renderMemory(work);
  // 云同步：章节保存后推送到云端
  try {
    if (window.cloud && window.cloud.isLoggedIn && window.cloud.isLoggedIn()) {
      if (window.cloud._syncTimer) clearTimeout(window.cloud._syncTimer);
      window.cloud._syncTimer = setTimeout(function() {
        try { window.cloud.quickSync(work.id); } catch(e) {}
      }, 2000);
    }
  } catch(syncErr) {}
  showToast('保存成功，记忆点已更新');
}

// 确认本章：保存 + 提取记忆 + 跳转下一章（需二次确认）
let _confirmPending = false;
function confirmChapter(){
  const work0=getCurrentWork();if(!work0){showToast('请先新建或选择作品');return;}
  if (!_confirmPending) {
    _confirmPending = true;
    const btn = document.getElementById('confirm-btn');
    if (btn) { btn.textContent = '⚠️ 再点一次确认'; btn.style.background = '#f59e0b'; }
    showToast('再点一次确认本章并跳转下一章');
    setTimeout(function(){
      _confirmPending = false;
      if (btn) { btn.innerHTML = '&#9989; 确认本章'; btn.style.background = '#10b981'; }
    }, 3000);
    return;
  }
  _confirmPending = false;
  const btn = document.getElementById('confirm-btn');
  if (btn) { btn.innerHTML = '&#9989; 确认本章'; btn.style.background = '#10b981'; }
  
  const work=getCurrentWork();if(!validateCurrentWorkBeforeWrite(work))return;
  const content=document.getElementById('editor').value;
  
  if(!content || content.trim().length < 10){
    showToast('章节内容太少，请先写点内容');
    return;
  }
  
  // 保存
  const title=document.getElementById('ch-title').value.trim();
  work.chapters[currentChapterIdx]={title,content,confirmed:true};
  if(!work.memory)work.memory=[];
  DB.saveWork(work);
  showToast('已保存');
  updateWordCount();
  // 刷新章节列表（如果打开）
  if(document.getElementById('ch-list-panel').classList.contains('open')){
    renderChapterList();
  }
  // 更新longMemory（包含章节摘要、人物状态、情节线索、伏笔、角色弧线）
  updateLongMemory(work, currentChapterIdx);
  
  // 同时保留旧版记忆提取（异步，不阻塞跳转）
  extractMemory(work, currentChapterIdx, content);
  
  // 跳转到下一章
  const nextIdx = currentChapterIdx + 1;
  if(nextIdx < work.chapters.length){
    currentChapterIdx = nextIdx;
    loadChapter(nextIdx);
    showToast('第' + (currentChapterIdx + 1) + '章已确认，已跳转到第' + (nextIdx + 1) + '章');
  } else {
    work.chapters.push({title: '第' + (nextIdx + 1) + '章', content: ''});
    currentChapterIdx = nextIdx;
    DB.saveWork(work);
    loadChapter(nextIdx);
    showToast('第' + (currentChapterIdx + 1) + '章已确认，已创建第' + (nextIdx + 1) + '章');
  }
  
  document.getElementById('ch-title').value = work.chapters[currentChapterIdx].title;
}

function updateWordCount(){
  var content=document.getElementById('editor').value;
  var len=content.length;
  var paragraphs=content.split(/\n+/).filter(function(p){return p.trim().length>0;}).length;
  // 中文阅读速度约500字/分钟
  var readMin=Math.max(1,Math.ceil(len/500));
  var el=document.getElementById('word-count');
  if(!el)return;
  if(len===0){
    el.innerHTML='<span class="wc-num">0</span><span class="wc-sub">字</span>';
  } else if(len<1000){
    el.innerHTML='<span class="wc-num">'+len+'</span><span class="wc-sub">字 · '+paragraphs+'段 · '+readMin+'分钟</span>';
  } else {
    var display=len>=10000?(len/10000).toFixed(1)+'万':(len/1000).toFixed(1)+'k';
    el.innerHTML='<span class="wc-num">'+display+'</span><span class="wc-sub">字 · '+paragraphs+'段 · '+readMin+'分钟</span>';
  }
}

function prevChapter(){
  const work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
  if(currentChapterIdx>0){saveChapter();loadChapter(currentChapterIdx-1);renderChSidebar();}
  else showToast('已经是第一章');
}

function nextChapter(){
  const work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
  saveChapter();
  if(currentChapterIdx<work.chapters.length-1){loadChapter(currentChapterIdx+1);renderChSidebar();}
  else{work.chapters.push({title:'第'+(currentChapterIdx+2)+'章',content:''});DB.saveWork(work);loadChapter(currentChapterIdx+1);renderChSidebar();}
}

// ========== 章节列表 ==========
function openChapterList(){
  const work=getCurrentWork();if(!work||!work.chapters){showToast('请先新建或选择作品');return;}
  renderChapterList();
  var ov=document.getElementById('ch-list-overlay'), panel=document.getElementById('ch-list-panel');
  if(ov)ov.className='panel-overlay open';
  if(panel)panel.className='ch-list-panel open';
}
function closeChapterList(){
  var ov=document.getElementById('ch-list-overlay'), panel=document.getElementById('ch-list-panel');
  if(ov)ov.className='panel-overlay';
  if(panel)panel.className='ch-list-panel';
}
// esc 转义函数
function he(s){return s?s.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'):'';}

function renderChapterList(){
  const work=getCurrentWork();
  const body=document.getElementById('ch-list-body');
  if(!work||!work.chapters||!body)return;
  const chs=work.chapters;
  body.innerHTML=chs.map(function(ch,idx){
    const isActive=idx===currentChapterIdx;
    const wordCnt=(ch.content||'').length;
    const wordDisplay=wordCnt>=1000?(wordCnt/1000).toFixed(1)+'k':wordCnt;
    const isDone=ch.confirmed||false;
    const badge=isDone?'<span class="ch-badge done">✓</span>':(wordCnt>0?'<span class="ch-badge draft">草稿</span>':'');
    return '<div class="ch-item '+(isActive?'active':'')+'" onclick="jumpToChapter('+idx+')">'+
      '<div class="ch-num">'+(idx+1)+'</div>'+
      '<div class="ch-info">'+
        '<div class="ch-name">'+he(ch.title||'第'+(idx+1)+'章')+'</div>'+
        '<div class="ch-meta">'+wordDisplay+'字</div>'+
      '</div>'+
      badge+
    '</div>';
  }).join('');
}
function jumpToChapter(idx){
  const work=getCurrentWork();if(!work||!work.chapters){showToast('请先新建或选择作品');return;}
  if(idx<0||idx>=work.chapters.length){showToast('章节不存在');return;}
  saveChapter();
  loadChapter(idx);
  renderChapterList();
  closeChapterList();
}
function addNewChapter(){
  const work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
  if(!work.chapters)work.chapters=[];
  const newIdx=work.chapters.length;
  work.chapters.push({title:'第'+(newIdx+1)+'章',content:''});
  DB.saveWork(work);
  currentChapterIdx=newIdx;
  loadChapter(newIdx);
  closeChapterList();
  renderChSidebar();
  showToast('已添加第'+(newIdx+1)+'章');
}
function deleteCurrentChapter(){
  const work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
  if(!work.chapters||work.chapters.length<=1){showToast('至少保留一章');return;}
  if(!confirm('确定删除第'+(currentChapterIdx+1)+'章「'+(work.chapters[currentChapterIdx].title||'')+'」？此操作不可恢复。'))return;
  // 删除章节
  work.chapters.splice(currentChapterIdx,1);
  // 重编号所有章节标题
  work.chapters.forEach(function(ch,idx){
    // 如果标题是"第N章..."则重新编号
    if(/^第[\d一二三四五六七八九十]+章\b/.test(ch.title.trim())){
      // 替换开头数字
      ch.title = ch.title.replace(/^第[\d一二三四五六七八九十]+章\b/,'第'+(idx+1)+'章');
    }
  });
  // 重映射 _chapterCards 键（ch_N → ch_{newIdx}）
  if(work._chapterCards){
    var newCards = {};
    var keys = Object.keys(work._chapterCards).sort();
    keys.forEach(function(key){
      var m = key.match(/^ch_(\d+)$/);
      if(m){
        var oldIdx = parseInt(m[1], 10);
        if(oldIdx < currentChapterIdx){ newCards['ch_'+oldIdx] = work._chapterCards[key]; }
        else if(oldIdx > currentChapterIdx){ newCards['ch_'+(oldIdx-1)] = work._chapterCards[key]; }
      } else {
        newCards[key] = work._chapterCards[key];
      }
    });
    work._chapterCards = newCards;
  }
  if(currentChapterIdx>=work.chapters.length)currentChapterIdx=work.chapters.length-1;
  DB.saveWork(work);
  loadChapter(currentChapterIdx);
  closeChapterList();
  renderChSidebar();
  showToast('已删除');
}

// v55: 重生成当前章节（保留历史版本，重新生成）
async function regenerateChapter(){
  const work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
  const chapterIdx = currentChapterIdx || 0;
  const ch = work.chapters[chapterIdx];
  if(!ch){showToast('章节不存在');return;}
  if(!confirm('确定重写第'+(chapterIdx+1)+'章「'+ch.title+'」？\n\n当前内容会保存到历史版本，可随时恢复。'))return;
  
  // 保存当前内容到历史版本
  if(!ch._history) ch._history = [];
  ch._history.push({ content: ch.content || '', wordCount: (ch.content || '').length, createdAt: Date.now(), id: 'hist_' + Date.now() });
  if(ch._history.length > 20) ch._history = ch._history.slice(-20);
  
  // 清空当前内容，让AI全新生成
  document.getElementById('editor').value = '';
  showToast('🔄 正在重写第'+(chapterIdx+1)+'章…', {duration:2000});
  await aiWriteChapter();
  showToast('✅ 第'+(chapterIdx+1)+'章已重写，可在历史版本中恢复旧版', {duration:3000});
}

// v55: 在当前章节后插入新章
function insertChapterAfter(){
  const work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
  if(!work.chapters) work.chapters=[];
  const chapterIdx = currentChapterIdx || 0;
  const insertPos = chapterIdx + 1;
  
  var newTitle = '第' + (insertPos + 1) + '章';
  if(!confirm('在第'+(chapterIdx+1)+'章「'+ ((work.chapters[chapterIdx]||{}).title||'') +'」后插入新章「'+newTitle+'」？'))return;
  
  // 插入空章节
  var newChapter = { title: newTitle, content: '', wordCount: 0, createdAt: Date.now() };
  work.chapters.splice(insertPos, 0, newChapter);
  
  // 重新编号后续章节
  for(var i = insertPos + 1; i < work.chapters.length; i++){
    var ch = work.chapters[i];
    if(/^第[\d一二三四五六七八九十]+章\b/.test(ch.title.trim())){
      ch.title = ch.title.replace(/^第[\d一二三四五六七八九十]+章\b/, '第' + (i + 1) + '章');
    }
  }
  
  // 重映射 _chapterCards
  if(work._chapterCards){
    var newCards = {};
    var keys = Object.keys(work._chapterCards).sort();
    keys.forEach(function(key){
      var m = key.match(/^ch_(\d+)$/);
      if(m){
        var oldIdx = parseInt(m[1], 10);
        if(oldIdx < insertPos){ newCards['ch_'+oldIdx] = work._chapterCards[key]; }
        else { newCards['ch_'+(oldIdx+1)] = work._chapterCards[key]; }
      } else {
        newCards[key] = work._chapterCards[key];
      }
    });
    work._chapterCards = newCards;
  }
  
  DB.saveWork(work);
  currentChapterIdx = insertPos;
  loadChapter(insertPos);
  renderChSidebar();
  showToast('✅ 已插入新章，可在编辑区手动编写或点"AI写本章"生成');
}

// v55: 导出格式化HTML（带目录，可转EPUB）
function exportFormattedHTML(){
  const work = getCurrentWork();
  if(!work){ showToast('请先选择作品'); return; }
  if(!work.chapters || work.chapters.length === 0){ showToast('暂无章节'); return; }
  
  var title = work.title || '未命名作品';
  var author = work.author || 'AI Writer';
  var genre = work.genre || '';
  
  var html = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n';
  html += '<meta charset="UTF-8">\n';
  html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
  html += '<title>' + he(title) + '</title>\n';
  html += '<style>\n';
  html += 'body{font-family:"Noto Serif SC","Source Han Serif SC","SimSun",serif;max-width:800px;margin:0 auto;padding:40px 20px;line-height:2;color:#333;background:#faf9f6;}\n';
  html += 'h1{text-align:center;font-size:28px;margin-bottom:8px;color:#1a1a2e;}\n';
  html += '.meta{text-align:center;color:#999;font-size:14px;margin-bottom:40px;}\n';
  html += '.toc{margin:30px 0;padding:20px;background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);}\n';
  html += '.toc h2{font-size:18px;margin-bottom:12px;color:#6366f1;}\n';
  html += '.toc a{display:block;padding:4px 0;color:#333;text-decoration:none;font-size:15px;}\n';
  html += '.toc a:hover{color:#6366f1;}\n';
  html += '.chapter{margin-top:40px;page-break-before:always;}\n';
  html += '.chapter:first-of-type{page-break-before:auto;}\n';
  html += '.chapter h2{font-size:22px;color:#1a1a2e;border-bottom:2px solid #6366f1;padding-bottom:8px;margin-bottom:20px;}\n';
  html += '.chapter p{text-indent:2em;margin:8px 0;}\n';
  html += '.footer{text-align:center;color:#ccc;margin-top:60px;padding-top:20px;border-top:1px solid #eee;font-size:13px;}\n';
  html += '@media print{body{background:#fff;}}\n';
  html += '</style>\n</head>\n<body>\n';
  
  // 封面
  html += '<h1>' + he(title) + '</h1>\n';
  html += '<div class="meta">作者：' + he(author) + (genre ? ' | 题材：' + he(genre) : '') + '<br>导出时间：' + new Date().toLocaleString() + '</div>\n';
  
  // 目录
  html += '<div class="toc">\n<h2>目录</h2>\n';
  for(var i = 0; i < work.chapters.length; i++){
    var ch = work.chapters[i];
    var chTitle = ch.title || ('第' + (i + 1) + '章');
    html += '<a href="#ch' + (i + 1) + '">' + he(chTitle) + '</a>\n';
  }
  html += '</div>\n';
  
  // 章节正文
  for(var i = 0; i < work.chapters.length; i++){
    var ch = work.chapters[i];
    var chTitle = ch.title || ('第' + (i + 1) + '章');
    var content = ch.content || '';
    // 按段落拆分，每段加<p>标签
    var paragraphs = content.split(/\n\s*\n/).filter(function(p){ return p.trim(); });
    html += '<div class="chapter" id="ch' + (i + 1) + '">\n';
    html += '<h2>' + he(chTitle) + '</h2>\n';
    for(var p = 0; p < paragraphs.length; p++){
      var para = paragraphs[p].trim();
      // 单行也按句号拆
      var lines = para.split(/\n/).filter(function(l){ return l.trim(); });
      for(var l = 0; l < lines.length; l++){
        html += '<p>' + he(lines[l].trim()) + '</p>\n';
      }
    }
    html += '</div>\n';
  }
  
  html += '<div class="footer">由 AI 写作工具生成 | ' + he(title) + ' | 共 ' + work.chapters.length + ' 章</div>\n';
  html += '</body>\n</html>';
  
  // 下载
  var blob = new Blob([html], { type: 'text/html;charset=UTF-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = (title || '小说') + '（格式化）.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('✅ 已导出格式化HTML（' + work.chapters.length + '章，可转EPUB）');
}

function buildWritePrompt(work,content,cmd){
  let prompt='你是一位网文写作助手。\n\n';
  prompt += getWriteConstraint(getWorkGenre(work), work) + '\n';
  var cb = buildWriteConsistencyBlock(work, typeof currentChapterIdx !== "undefined" ? currentChapterIdx : 0);
  if (cb) prompt += cb + '\n';
  if(work.world)prompt+='【世界观】'+work.world+'\n';
  if(work.chars)prompt+='【人物人设】'+work.chars+'\n';
  if(work.outline)prompt+='【全书大纲】'+work.outline+'\n';
  if(work.detail)prompt+='【章节细纲】'+work.detail+'\n';
  prompt+='\n【当前内容】\n'+content+'\n\n';
  prompt+='【用户指令】'+cmd+'\n\n';
  prompt+='请严格按照上述全套架构设定生成内容，保持风格一致。';
  return prompt;
}

// 兼容函数：获取作品题材（处理旧数据）
function getWorkGenre(work){
  return work.genre || (work.category && work.category.cat1) || '玄幻';
}

// ========== v48: 章节卡格式化 —— 将结构化章节卡数据转成 AI 可读文本 ==========
// 章节卡用于让写作时保持结构一致：时间地点、本章目标、关键剧情节点
function chapterCardToText(card){
  if(!card) return '';
  if(typeof card === 'string') return card; // 已是文本

  var lines = [];
  if(card.time || card.place || card.location){
    lines.push('时间地点：' + (card.time || card.location ? (card.time || '') + ' ' + (card.place || card.location || '') : (card.place || card.location || '').trim() || '未设定'));
  }
  if(card.purpose){ lines.push('本章目标：' + card.purpose); }
  if(card.main_char){ lines.push('主要人物：' + card.main_char); }
  // 剧情节点（1-5个）
  var nodes = [];
  ['node1','node2','node3','node4','node5'].forEach(function(k){
    if(card[k]) nodes.push(card[k]);
  });
  if(nodes.length) lines.push('剧情节点：' + nodes.join(' → '));
  if(card.hook || card.climax){
    lines.push('爆点/悬念钩子：' + (card.hook || card.climax));
  }
  if(card.mood || card.style){
    lines.push('基调氛围：' + (card.mood || card.style));
  }
  if(card.notes){
    lines.push('备注：' + card.notes);
  }

  if(lines.length === 0){
    // 兜底：尝试直接输出 card 的所有非空字段
    for(var k in card){
      if(card[k] && k.charAt(0) !== '_'){
        lines.push(k + '：' + card[k]);
      }
    }
  }
  return lines.join(' | ');
}

// 题材硬约束块 — 防止AI写跑题
function getWriteConstraint(genre, work) {
  var genreVal = (work.settings && work.settings.genre) || genre || '';
  var rules = {
    '历史': '你正在写的是【历史小说】。所有人物的语言、行为、思维必须符合该历史时期。严禁出现：修仙、炼丹、法宝、空间戒指、系统面板、现代网络用语、不符合时代的作物和器物。',
    '玄幻': '你正在写的是【玄幻小说】。必须遵循已设定的世界观规则和力量体系。严禁出现：现代科技、现代政治制度、与其他修炼体系矛盾的元素。',
    '仙侠': '你正在写的是【仙侠小说】。注重道家文化和修仙哲学。严禁出现：西方魔法体系、异世界转生、机甲高达、现代科学解释修仙。',
    '都市': '你正在写的是【都市小说】。故事发生在现代城市社会。严禁出现：无视法律的行为无后果、未成年恋爱擦边、敏感政治话题。',
    '科幻': '你正在写的是【科幻小说】。科技设定必须有内部一致性。严禁出现：修仙/魔法混入科幻、科技水平严重不一致、违背基础科学的无解释超能力。'
  };
  var key = Object.keys(rules).find(function(k) { return genreVal.indexOf(k) >= 0; }) || '';
  if (rules[key]) return '\n【\u26a0\ufe0f 题材硬约束 \u2014\u2014 严禁跑题】\n' + rules[key] + '\n';
  return '\n【\u26a0\ufe0f 题材约束】\n请严格基于' + (genreVal || genre || '当前题材') + '写作，不要引入不相关的题材元素。\n';
}


// ========== v45：题材专属写作引擎 + 商业正文强化 ==========
function getPlatformLabelV45(work) {
  var p = (work && (work._platform || (work.settings && work.settings.platform))) || localStorage.getItem('predict_platform') || 'qidian';
  if (p === 'fanqie') return '番茄';
  if (p === 'jinjiang') return '晋江';
  if (p === 'qidian') return '起点';
  return p || '通用平台';
}

function buildGenreWritingEngineV45(genre, work) {
  if (!genre) return '';
  var hints = {
    '玄幻': '本作品为玄幻题材。写作核心：力量体系如何影响社会结构、人性在极端力量差距下的表现。角色的选择受限于世界观的内在逻辑——"强者为尊"的世界里弱者的生存智慧是什么？修炼不只是升级，更是对世界认知的不断刷新。战斗场景要有策略感——不是招式名堆砌，而是智谋与力量的博弈。每次突破都要有代价和感悟，不是"灵气够了就突破"。资源争夺要有现实感——谁控制资源、资源如何分配、底层人如何获取。',
    '仙侠': '本作品为仙侠题材。写作核心：道心与欲望的博弈、因果报应在日常细节中的体现、长生的代价与孤独。"道"不是答案而是追问。修仙者的时间观与凡人不同——百年对他们来说可能只是闭关一瞬，但对凡人来说已是几代人的更替。利用这种时间差制造戏剧张力。飞剑、法宝不只是武器，更是修仙者性格的延伸。',
    '都市': '本作品为都市题材。写作核心：现代性给异能/超自然带来的独特矛盾——权力在现代制度下的表现形式、信息时代对秘密的威胁、阶级与超能力的关联。让角色的行为受现代社会的实际约束（法律、舆论、经济），而非仅靠武力解决一切。都市异能的关键张力是"隐藏"——为什么不能暴露？暴露了会怎样？',
    '历史': '本作品为历史题材。写作核心：尊重时代语境——人物的思维模式、道德观、知识边界受限于其所处时代。利用时代特有的约束（通信延迟、交通困难、等级制度、礼法束缚）制造冲突，而非绕过它们。器物和制度服务于叙事，不堆砌考据。历史人物的选择要在时代框架内合理——他们不知道后世的走向。',
    '悬疑': '本作品为悬疑题材。写作核心：信息节奏比信息本身更重要——什么时候告诉读者什么，什么时候让他们自己发现。线索不要一次性给完，每个答案应该引出新的问题。允许读者比角色知道得多或知道得少，利用信息差制造张力。推理过程要公平——读者如果足够聪明，应该能在揭晓前猜到答案。',
    '言情': '本作品为言情题材。写作核心：感情的质感来自具体的行为和沉默中的张力，而非"他很爱她"的陈述。两个独立人格如何在亲密关系中保持自我、如何在冲突中不是"赢"而是"更理解对方"。配角不应只服务于主角的感情线。身体接触的描写要有层次——从无意碰到有意触碰，每一步都要有心理铺垫。',
    '竞技': '本作品为竞技题材。写作核心：竞技的本质不是胜负而是"人在逼近极限时暴露的真实"。数据和技术细节服务于角色的选择和压力下的反应。对手不是工具人，每一场对决应该是两个有完整动机的人在对话。训练的枯燥和坚持比比赛本身更能打动人。',
    '规则怪谈': '本作品为规则怪谈题材。写作核心：恐怖来自规则中的精确性和不可知的惩罚之间的张力。规则本身可以是被利用的工具——找到规则的漏洞、矛盾或意外组合。不要急于解释超自然现象，让未知保持它的重量。日常场景中的违和感比直接描写怪物更恐怖。',
    '科幻': '本作品为科幻题材。写作核心：科技不只是背景，它必须改变人的生活方式和思维模式。每一个科技设定都要追问"这对普通人意味着什么"。不要堆砌术语，让科技通过角色的日常行为自然展现。核心冲突来自科技与人性的碰撞——什么能力让人不再是人？',
    '末世': '本作品为末世题材。写作核心：末世的本质不是丧尸/怪物，而是秩序崩塌后人性的试炼场。资源稀缺是所有冲突的根源——食物、水、药品、安全屋。道德在生存面前如何变形？信任在背叛面前如何重建？不要让主角太容易获得安全感，末世的恐惧来自"永远不安全"。',
    '武侠': '本作品为武侠题材。写作核心：江湖不只是打打杀杀，更是人情世故和义气承诺。武功高低不是一切——人心、情报、人脉、时机同样重要。每场打斗要有因果（为什么打、打了有什么后果），不是为打而打。侠义精神在现实面前的挣扎比单纯的行侠仗义更有深度。',
    '系统流': '本作品为系统流题材。写作核心：系统不只是外挂，它应该有自己的规则、限制和隐藏目的。系统任务要推动剧情，不能变成"完成任务→获得奖励"的流水线。系统的存在对主角心理的影响——依赖、怀疑、反抗——是深层的戏剧张力。其他角色不知道系统的存在，这种信息差要利用。'
  };
  var matched = '';
  for (var k in hints) {
    if (genre.indexOf(k) >= 0) { matched = hints[k]; break; }
  }
  return matched || '请根据本作品的设定和题材特性自由发挥写作风格，不需要被固定公式约束。';
}

function analyzeCommercialWritingV45(work, chapterIdx, content) {
  content = content || '';
  var genre = getWorkGenre(work), issues = [], hits = [], score = 100;
  var head = content.slice(0, 350), tail = content.slice(-260);
  var len = content.length;
  function has(re, label, penalty, hit) {
    if (re.test(content)) { if (hit) hits.push(hit); return true; }
    issues.push(label); score -= penalty || 6; return false;
  }
  if (!/(冲突|质问|怒|杀|逼|拦|跪|退婚|危机|尸体|线索|警报|敌|赌|证据|命令|圣旨|追杀)/.test(head)) {
    issues.push('开篇350字冲突/悬念不够明确'); score -= 10;
  } else hits.push('开篇抓人');
  var dialogCount = (content.match(/[“"][^”"]{2,}[”"]/g) || []).length;
  if (dialogCount < 3 && len > 1500) { issues.push('有效对话偏少'); score -= 6; } else hits.push('对话密度');
  var actionCount = (content.match(/抬手|转身|逼近|后退|拔|挥|砸|按住|盯|踏|冲|挡|推开|抓住/g) || []).length;
  if (actionCount < 5 && len > 1500) { issues.push('动作调度偏弱'); score -= 6; } else hits.push('动作调度');
  var hookStrong = /(然而|可|却|就在这时|下一秒|忽然|突然|谁也没想到|门外|身后|真正|不是|只听|传来|出现|抬头|脸色一变|问题是|秘密)/.test(tail);
  if (!hookStrong) { issues.push('章尾追读钩子偏弱'); score -= 12; } else hits.push('章尾钩子');
  var poison = [];
  [
    ['无效震惊', /众人震惊|全场震惊|所有人都惊呆了|众人哗然|一片哗然/g],
    ['重复水句', /他知道.{0,8}他知道|没想到.{0,20}没想到|他不知道.{0,8}他不知道/g],
    ['空泛推进', /事情变得复杂起来|一切才刚刚开始|命运的齿轮开始转动|真正的挑战才刚刚开始/g],
    ['AI腔', /空气仿佛凝固|时间仿佛静止|他的内心五味杂陈|心中百感交集/g],
    ['万能形容词', /极其强大|无比恐怖|深不可测|不可名状|难以言喻/g],
    ['重复动作', /嘴角勾起.{0,30}嘴角勾起|眼神一冷.{0,30}眼神一冷|眉头一皱.{0,30}眉头一皱/g],
    ['空洞心理', /他心中暗想|他暗自下定决心|他心中涌起一股|他不禁感叹/g],
    ['过度副词', /缓缓地.{0,10}缓缓地|慢慢地.{0,10}慢慢地|轻轻地.{0,10}轻轻地/g]
  ].forEach(function(p){ var m = content.match(p[1]); if (m && m.length >= 2) poison.push(p[0] + m.length + '处'); });
  if (poison.length) { issues.push('毒点风险：' + poison.join('、')); score -= Math.min(18, poison.length * 6); } else hits.push('毒点较少');
  if (genre.indexOf('玄幻') >= 0 || genre.indexOf('仙侠') >= 0) {
    has(/境界|灵|剑|法|气|丹|宗|门|阵|符|血脉|传承|资源|突破|瓶颈/, '玄幻/仙侠题材感不足', 10, '题材元素');
  } else if (genre.indexOf('都市') >= 0) {
    has(/公司|医院|学校|合同|证据|电话|微信|转账|警察|身份|人脉|项目|客户/, '都市现实锚点不足', 10, '都市锚点');
  } else if (genre.indexOf('历史') >= 0) {
    has(/县令|将军|军|粮|户|礼|官|衙|圣旨|朝廷|营|关|城|盐|税|兵/, '历史制度/时代锚点不足', 10, '历史锚点');
  } else if (genre.indexOf('悬疑') >= 0) {
    has(/线索|证据|尸|血|指纹|脚印|谎言|监控|目击|失踪|嫌疑|凶手/, '悬疑线索密度不足', 10, '悬疑线索');
  } else if (genre.indexOf('科幻') >= 0) {
    has(/星|舰|AI|量子|基因|纳米|虫洞|跃迁|芯片|数据|系统|能量/, '科幻元素密度不足', 10, '科幻元素');
  } else if (genre.indexOf('末世') >= 0) {
    has(/食物|水|药品|安全|丧尸|变异|避难|搜刮|辐射|幸存/, '末世生存感不足', 10, '末世元素');
  } else if (genre.indexOf('武侠') >= 0) {
    has(/剑|刀|掌|拳|内力|轻功|暗器|门派|江湖|义气|恩怨/, '武侠元素密度不足', 10, '武侠元素');
  } else if (genre.indexOf('系统流') >= 0) {
    has(/系统|任务|奖励|升级|面板|属性|技能|积分|商城|提示音/, '系统流元素不足', 10, '系统元素');
  }
  // 正面质量检查：感官描写密度
  var sensoryCount = (content.match(/闻到|听到|看到|摸到|尝到|刺鼻|震耳|滚烫|冰凉|粗糙|光滑|腥味|焦味|嗡鸣|回响/g) || []).length;
  if (sensoryCount >= 3) hits.push('感官描写'); else if (len > 1500) { issues.push('感官描写偏少'); score -= 4; }
  // 正面质量检查：对话潜台词
  var subtextCount = (content.match(/沉默|没有回答|移开目光|攥紧|咬唇|别过头|欲言又止|话到嘴边/g) || []).length;
  if (subtextCount >= 2) hits.push('对话潜文本');
  // 正面质量检查：冰山技法·微动作藏情绪
  var microActionCount = (content.match(/指尖发白|咬紧后槽牙|声音压低|嘴角抽动|喉结滚动|手指摩挲|攥紧杯沿|耳尖泛红|指腹蹭过|视线躲闪|空玻璃杯擦|背对着人/g) || []).length;
  if (microActionCount >= 2) hits.push('冰山微动作(' + microActionCount + '处)'); else if (len > 1500) { issues.push('冰山技法缺失：微动作藏情绪'); score -= 5; }
  // 正面质量检查：冰山技法·答非所问
  var nonAnswerCount = (content.match(/她摸了摸耳垂|他端起茶杯|低头.{0,6}(没|不)|.{0,10}没有回答|.{0,6}清了清嗓子|.{0,6}端起茶|.{0,6}放下茶|.{0,6}攥紧.{0,6}(没|不)/g) || []).length;
  if (nonAnswerCount >= 1) hits.push('冰山答非所问');
  // 负面检查：直白情绪词
  var directEmotionCount = (content.match(/他很紧张|他很愤怒|他很伤心|他很害怕|她很紧张|她很愤怒|她很伤心|他非常紧张|她非常愤怒/g) || []).length;
  if (directEmotionCount > 0) { issues.push('直白情绪词(' + directEmotionCount + '处)：应改为微动作外化'); score -= Math.min(10, directEmotionCount * 4); }
  score = Math.max(0, Math.min(100, score));
  return { score: score, issues: issues.slice(0, 10), hits: hits.slice(0, 10), checkedAt: Date.now(), chapterIdx: chapterIdx };
}

// ========== v48: 写作后深度自检 — 一致性扫描 + AI腔检测 + 角色行为校验 ==========
// 功能：对已生成章节做离线深度检查，返回结构化问题报告
function deepSelfCheckV48(work, chapterIdx, content) {
  content = content || '';
  var result = {
    score: 80,
    issues: [],
    strengths: [],
    aiCavity: [],
    inconsistency: [],
    details: {}
  };

  if (!content || content.trim().length < 100) {
    result.issues.push('内容过短，无法进行有效自检');
    return result;
  }

  var len = content.length;
  var head = content.slice(0, 400);
  var tail = content.slice(-400);

  // ====== 1. AI腔深度检测（扩展词库 + 位置分布分析）======
  var cavityPatterns = [
    { label: '无效震惊', re: /众人震惊|全场震惊|所有人都惊呆了|众人哗然|一片哗然/g },
    { label: '空洞推进', re: /事情变得复杂起来|一切才刚刚开始|命运的齿轮开始转动|真正的挑战才刚刚开始|好戏才刚刚开始/g },
    { label: '空泛情绪', re: /空气仿佛凝固|时间仿佛静止|他的内心五味杂陈|心中百感交集|心里咯噔一下/g },
    { label: '万能形容词', re: /极其强大|无比恐怖|深不可测|不可名状|难以言喻|难以形容|无法用语言形容/g },
    { label: '高频动作套路', re: /嘴角勾起|眼神一冷|瞳孔一缩|眉头一皱|眉头微蹙|目光如炬/g },
    { label: '空洞心理', re: /他心中暗想|他暗自下定决心|他心中涌起一股|他不禁感叹|他心想道/g },
    { label: '重复副词', re: /缓缓地.{0,12}缓缓地|慢慢地.{0,12}慢慢地|轻轻地.{0,12}轻轻地|微微.{0,12}微微/g },
    { label: '重复认识', re: /他知道.{0,12}他知道|没想到.{0,20}没想到|他不知道.{0,12}他不知道|他明白.{0,12}他明白/g },
    { label: '虚假紧迫感', re: /不好！|糟了！|该死！|妈的！|该死的！/g },
    { label: '过强感叹', re: /！.{0,10}！.{0,10}！/g }
  ];
  cavityPatterns.forEach(function (p) {
    var m = content.match(p.re);
    if (m && m.length > 0) {
      result.aiCavity.push(p.label + '（' + m.length + '处）');
      result.issues.push(p.label + '：' + m.length + '处');
      result.score -= m.length * 3;
    }
  });

  // ====== 2. 开篇300字冲突/悬念检查 ======
  var conflictRE = /(冲突|质问|怒|杀|逼|拦|跪|退婚|危机|尸体|线索|警报|敌|赌|证据|命令|圣旨|追杀|撞击|抓住|推|逼|刀|剑|拳|掌|血|冷|怒|惊|怕|危险|爆炸|破碎|裂|断)/;
  if (!conflictRE.test(head)) {
    result.issues.push('开篇400字冲突/悬念不够明确——读者可能直接划走');
    result.score -= 8;
  } else {
    result.strengths.push('开篇有冲突');
  }

  // ====== 3. 结尾钩子检查 ======
  var hookRE = /(然而|可|却|就在这时|下一秒|忽然|突然|谁也没想到|门外|身后|真正|不是|只听|传来|出现|抬头|脸色一变|问题是|秘密|原来|其实|只是|竟然|居然)/;
  if (!hookRE.test(tail)) {
    result.issues.push('章尾缺少让读者想点开下一章的钩子——章末300字应停在关键节点');
    result.score -= 12;
  } else {
    result.strengths.push('章尾有钩子');
  }

  // ====== 4. 对话/动作/描写比例 ======
  var dialogRE = /[“"][^”"]{2,}[”"]/g;
  var dialogMatches = content.match(dialogRE);
  var dialogCount = dialogMatches ? dialogMatches.length : 0;
  var actionRE = /(抬手|转身|逼近|后退|拔|挥|砸|按住|盯|踏|冲|挡|推开|抓住|扣|砸|扑|跃|闪|退|停|喝|甩|扔|推|击|刺|砍|劈|挡|躲)/g;
  var actionMatches = content.match(actionRE);
  var actionCount = actionMatches ? actionMatches.length : 0;

  if (len > 1500) {
    if (dialogCount < 3) {
      result.issues.push('有效对话偏少（' + dialogCount + '处）——考虑让人物多互动而非独白');
      result.score -= 5;
    }
    if (actionCount < 5) {
      result.issues.push('动作调度偏弱（' + actionCount + '处）——考虑增加身体语言和场景互动');
      result.score -= 4;
    }
    if (dialogCount >= 4 && actionCount >= 8) {
      result.strengths.push('对话与动作配合良好');
    }
  }

  // ====== 5. 信息密度检查 ======
  var sentences = content.split(/[。！？!?.]/).filter(function (s) { return s.trim().length > 6; });
  if (sentences.length > 10) {
    var sensoryRE = /(闻到|听到|看到|摸到|尝到|刺鼻|震耳|滚烫|冰凉|粗糙|光滑|腥味|焦味|嗡鸣|回响|金属味|血腥味|青草味|灰尘味)/g;
    var sensoryCount = (content.match(sensoryRE) || []).length;
    if (sensoryCount < 2) {
      result.issues.push('感官描写偏少——加一点触觉/嗅觉/听觉细节能让场景更立体');
      result.score -= 3;
    } else result.strengths.push('有感官细节');
  }

  // ====== 冰山技法检查（90分核心技法）======
  var microActions = (content.match(/指尖发白|咬紧后槽牙|声音压低|嘴角抽动|喉结滚动|手指摩挲|攥紧杯沿|耳尖泛红|指腹蹭过|视线躲闪|空玻璃杯擦|背对着人|摸耳垂|清嗓子|端起茶|放下茶/g) || []).length;
  if (microActions >= 2) {
    result.strengths.push('冰山微动作(' + microActions + '处)');
  } else if (len > 1500) {
    result.issues.push('冰山技法缺失：微动作藏情绪（需≥2处）');
    result.score -= 5;
  }
  var nonAnswer = (content.match(/她摸了摸耳垂|他端起茶杯|低头.{0,6}(没|不)|.{0,10}没有正面|.{0,6}清了清嗓子|.{0,6}端起茶|.{0,6}放下茶|.{0,6}攥紧拳|.{0,8}别过头|.{0,6}移开目光/g) || []).length;
  if (nonAnswer >= 1) result.strengths.push('冰山答非所问');
  // 直白情绪词扣分
  var directEmo = (content.match(/他很紧张|他很愤怒|他很伤心|他很害怕|她很紧张|她很愤怒|她很伤心|他非常紧张|她非常愤怒|他真是紧张|心里很紧张/g) || []).length;
  if (directEmo > 0) {
    result.issues.push('直白情绪词(' + directEmo + '处)：应用微动作外化');
    result.score -= directEmo * 3;
  }
  // 章末打断检测（打断后在400字内没有立刻接新事件）
  var interruptionRE = /(突然门|突然响起|突然传来|突然电话|三下敲|停了停|又两下|紧急暗号|就在这时)/;
  if (interruptionRE.test(tail)) {
    result.strengths.push('关键时刻打断(章末)');
  }

  // ====== 视角控制检查（L1 级：读心/全知/视角跳）======
  // 1) 读心检测：角色A"知道"B在想什么、角色B"心里"的活动被叙述者写出
  var mindReadingPhrases = [
    '知道.{0,6}在想', '知道.{0,6}心里', '知道.{0,6}在想什么', '知道.{0,6}想的',
    '看穿.{0,6}心思', '看穿.{0,6}想法', '读懂.{0,6}心思', '猜出.{0,6}心思',
    '心里很.{0,4}他', '心里明白.{0,6}要', '心里清楚.{0,6}要',
    '他心想', '她心想', '他暗自道', '她暗自道', '他心里暗道', '她心里暗道',
    '他知道她', '她知道他', '他知道他们', '她知道他们', 'A知道B',
    '一眼就知道', '一眼就明白', '一眼就看穿'
  ];
  var mindReadCount = 0;
  mindReadingPhrases.forEach(function(ph){
    var re = new RegExp(ph.replace(/\./g,'\\.').replace(/\?/g,'\\?'), 'g');
    var ms = content.match(re);
    if (ms) mindReadCount += ms.length;
  });
  // 豁免：主角自己"知道"自己的想法不算读心（这是正常的内心独白）
  // 简单排除：如果匹配短语里含主角名，可能是主角的正常感知 → 不豁免，保持严格标准（因为AI容易滥用）
  if (mindReadCount > 0) {
    result.issues.push('[L1] 读心描写(' + mindReadCount + '处)：角色不能"知道"其他角色的想法，应改为动作/表情推测');
    result.score -= Math.min(25, mindReadCount * 5);
  }

  // 2) 视角切换检测：检测到段落内从一个角色的心理活动直接跳到另一个角色的
  var perspectiveSwitches = 0;
  var paras = content.split(/\n{1,}/);
  var namesList = [];
  if (work && work.chars) {
    var nmatch = work.chars.match(/[【\[<]?([\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5A-Za-z0-9]{1,7})[】\]>]?\s*[：(]/g);
    if (nmatch) {
      namesList = nmatch.map(function(s){
        var m2 = s.match(/[【\[<]?([\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5A-Za-z0-9]{1,7})/);
        return m2 ? m2[1] : '';
      }).filter(function(s){ return s.length >= 2 && s.length <= 4; }).slice(0, 8);
    }
  }
  paras.forEach(function(para){
    if (para.length < 40) return;
    // 检测同一段内出现多个"XX知道" / "XX想" / "XX心里"（表明视角在多角色间跳）
    var thinkMatch = para.match(/([\u4e00-\u9fa5A-Za-z]{2,4})(心里想|心中暗想|心想|暗自想|暗自道|心里知道|心里明白)/g);
    if (thinkMatch && thinkMatch.length >= 2) {
      var uniq = {};
      thinkMatch.forEach(function(t){ uniq[t] = true; });
      if (Object.keys(uniq).length >= 2) perspectiveSwitches++;
    }
    // 同一段内两个不同角色都有内心活动（多角色名字 + "想/知道"）
    if (namesList.length >= 2) {
      var foundNames = namesList.filter(function(n){
        return para.indexOf(n) >= 0 && (para.indexOf(n + '想') >= 0 || para.indexOf(n + '知道') >= 0 || para.indexOf(n + '心里') >= 0);
      });
      if (foundNames.length >= 2) perspectiveSwitches++;
    }
  });
  if (perspectiveSwitches > 0) {
    result.issues.push('[L1] 同段多视角切换(' + perspectiveSwitches + '处)：视角不统一，容易让读者出戏');
    result.score -= Math.min(15, perspectiveSwitches * 3);
  }

  // 3) 全知视角检测：第一人称模式下写"我"没看到的东西
  if (work && work.perspective === 'first') {
    var omniPatterns = [
      '他在我身后.{0,6}(冷笑|笑|笑了|咬牙|皱眉|眯眼)',
      '在我身后.{0,4}的他',
      '他此时.{0,8}(在想|在考虑|在打算|在算计|在谋划)',
      '房间里只有.{0,8}他和他'
    ];
    var omniCount = 0;
    omniPatterns.forEach(function(p){
      var re = new RegExp(p, 'g');
      var om = content.match(re);
      if (om) omniCount += om.length;
    });
    if (omniCount > 0) {
      result.issues.push('[L1] 第一人称全知(' + omniCount + '处)："我"看不到的东西不能直接写');
      result.score -= Math.min(20, omniCount * 4);
    }
  }

  // ====== 6. 角色行为一致性（简单启发式：检查是否违反角色基本人设）======
  if (work && work.chars) {
    // 从人设中提取角色名
    var nameRE = /[一二三四五主角反派重要主要核心][：:\s]*([^\s：:，,。]{2,6})/g;
    var nm;
    var foundNames = [];
    while ((nm = nameRE.exec(work.chars)) !== null) {
      if (nm[1] && foundNames.indexOf(nm[1]) === -1 && nm[1].length <= 4) foundNames.push(nm[1]);
      if (foundNames.length >= 8) break;
    }
    if (foundNames.length > 0) {
      // 检查内容是否只出现了少数角色名
      var usedCount = 0;
      for (var ni = 0; ni < foundNames.length; ni++) {
        if (content.indexOf(foundNames[ni]) >= 0) usedCount++;
      }
      result.details.roleCoverage = usedCount + '/' + foundNames.length;
      if (usedCount === 0 && len > 1000) {
        result.issues.push('本章未明确使用任何人设中的角色名——可能出现了编造的新角色或角色指代不清');
        result.score -= 6;
      }
    }
  }

  // ====== 7. 时间/场景一致性 ======
  // 检查是否在同一章中出现了"白天"和"深夜"这种时间跳跃（不应该）
  var timeWords = content.match(/(早晨|清晨|上午|中午|下午|傍晚|黄昏|深夜|夜里|晚上|半夜|黎明|天刚亮)/g);
  if (timeWords && timeWords.length > 1) {
    var uniqTimes = [];
    timeWords.forEach(function (t) { if (uniqTimes.indexOf(t) === -1) uniqTimes.push(t); });
    if (uniqTimes.length >= 2) {
      // 检查是否同时出现了明显矛盾的时间词
      if ((content.indexOf('清晨') >= 0 || content.indexOf('上午') >= 0) &&
          (content.indexOf('深夜') >= 0 || content.indexOf('夜里') >= 0 || content.indexOf('晚上') >= 0)) {
        result.issues.push('本章同时出现了"白天/上午"和"深夜/晚上"——请检查时间线是否合理');
        result.score -= 5;
      }
      result.details.timeCoverage = uniqTimes.join('/');
    }
  }

  // ====== 8. 与前一章的连续性检查 ======
  if (work && work.chapters && chapterIdx > 0 && work.chapters[chapterIdx - 1]) {
    var prevChapter = work.chapters[chapterIdx - 1];
    if (prevChapter.content) {
      // 提取前一章的角色名和核心事件关键词
      var prevKeywords = [];
      var prevKwRE = /[^\s，,。！？!?；;:：]{3,8}(受伤|中毒|被抓|死亡|重伤|离开|失踪|发现|获得|找到|逃走|逃脱|突破|成功|失败|愤怒|震惊|恐惧|绝望|希望|威胁|约定|承诺|秘密|真相)/g;
      var pk;
      while ((pk = prevKwRE.exec(prevChapter.content)) !== null) {
        if (prevKeywords.indexOf(pk[0]) === -1 && prevKeywords.length < 10) prevKeywords.push(pk[0]);
      }
      if (prevKeywords.length > 0) {
        var continuityCount = 0;
        for (var c = 0; c < prevKeywords.length; c++) {
          if (content.indexOf(prevKeywords[c]) >= 0) continuityCount++;
        }
        result.details.continuity = continuityCount + '/' + prevKeywords.length;
        if (continuityCount === 0 && prevChapter.content.length > 500) {
          result.issues.push('与上一章的状态/关键词零重合——检查是否忽略了上一章的重要状态（受伤/逃亡/获得/威胁等）');
          result.score -= 6;
        } else if (continuityCount >= 2) {
          result.strengths.push('与上一章连续性良好');
        }
      }
    }
  }

  // ====== 9. 重复句检查 ======
  var sentList = content.split(/[。！？!?.\n]/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 20; });
  var dupSet = {};
  for (var si = 0; si < sentList.length; si++) {
    var key = sentList[si].substring(0, 10);
    if (dupSet[key]) {
      result.issues.push('发现重复句苗头："' + sentList[si].substring(0, 30) + '"...');
      result.score -= 2;
      break;
    }
    dupSet[key] = 1;
  }

  // ====== 10. 段落结构检查 ======
  var paragraphs = content.split(/\n\s*\n/).filter(function (p) { return p.trim().length > 20; });
  if (paragraphs.length > 0) {
    var tooLong = paragraphs.filter(function (p) { return p.length > 800; }).length;
    if (tooLong > 0) {
      result.issues.push('有' + tooLong + '段超长段落（>800字）——建议拆分以提升可读性');
      result.score -= 3;
    } else {
      result.strengths.push('段落结构合理');
    }
  }

  // ====== 汇总评分 ======
  result.score = Math.max(0, Math.min(100, result.score));
  return result;
}

// 挂载到全局
window.deepSelfCheckV48 = deepSelfCheckV48;


// 从已有架构中提取关键元素清单，强制AI引用（防编造）

// ========== v39：全链路一致性引擎 ==========
function getDetailLineForChapter(work, chapterIdx) {
  if (!work || !work.detail) return '';
  var lines = work.detail.split('\n').map(function(x){ return x.trim(); }).filter(Boolean);
  var n1 = chapterIdx + 1;
  var ch = work.chapters && work.chapters[chapterIdx] ? work.chapters[chapterIdx] : {};
  var title = ch.title || '';
  var patterns = [
    new RegExp('^第\\s*' + n1 + '\\s*章'),
    new RegExp('^第' + n1 + '章')
  ];
  for (var i = 0; i < lines.length; i++) {
    if (patterns.some(function(re){ return re.test(lines[i]); })) return lines[i];
    if (title && title.length > 2 && lines[i].indexOf(title.replace(/^第[^章]{1,8}章\s*/, '').slice(0, 12)) >= 0) return lines[i];
  }
  return lines[chapterIdx] || '';
}

function parseDetailField(line, name) {
  if (!line) return '';
  var re = new RegExp(name + '[：:]\\s*\\[?([^|\\]]+)\\]?', 'i');
  var m = line.match(re);
  return m ? m[1].trim() : '';
}

function _chainTokens(s, limit) {
  s = String(s || '').replace(/[【】\[\]（）()，。！？、；;：:|]/g, ' ');
  var arr = s.split(/\s+/).filter(Boolean);
  var out = [];
  arr.forEach(function(x){
    if (x.length >= 2 && x.length <= 12 && !/^(本章|主角|剧情|具体|推进|发生|进行|一个|没有|必须|承接)$/.test(x) && out.indexOf(x) < 0) out.push(x);
  });
  return out.slice(0, limit || 8);
}

function buildFullChainLock(work, chapterIdx) {
  if (!work) return '';
  var lock = '【v50 全链路一致性锁（最高优先级）】\n';
  var has = false;
  var detailLine = getDetailLineForChapter(work, chapterIdx);
  
  // L0：世界观锁（最高优先级，绝不能违反）
  if (work.world) {
    lock += '【L0 世界观锁】力量体系、地理、势力、时代规则、等级稀缺度、能力代价必须以【世界观设定】为准；不得新增与世界观冲突的体系；角色使用能力必须承受设定中的代价。\n';
    // 提取世界观中的关键规则短句，强化约束
    var worldRules = [];
    var wrRE = /[^。\n]{0,30}(代价|规则|限制|不能|不可|必须|才能|除非|禁忌|体系|等级|势力|禁地|失传|诅咒|契约)[^。\n]{0,80}[。\n]/g;
    var wrm;
    while ((wrm = wrRE.exec(work.world)) !== null) {
      var wr = wrm[0].trim();
      if (wr.length > 15 && worldRules.indexOf(wr) === -1 && worldRules.length < 4) worldRules.push(wr);
    }
    if (worldRules.length > 0) {
      lock += '  关键规则：' + worldRules.join(' | ') + '\n';
    }
    has = true;
  }
  
  // L1：人设锁
  if (work.chars) {
    var names = [];
    try { names = extractCharNameMap(work.chars).names || []; } catch(e) {}
    if (names.length) {
      lock += '【L1 人设锁】优先使用已有人物：' + names.slice(0, 20).join('、') + '。新增人物必须是配角，并自然补入记忆。每个角色的说话风格、能力边界、视觉标签必须与人设一致。\n';
      has = true;
    }
  }
  
  // L1：大纲锁
  if (work.outline) {
    lock += '【L1 大纲锁】本章只能推进当前卷主线，不得提前写后续卷高潮，不得跳过大纲阶段目标。每章必须推进主线目标至少一步。\n';
    has = true;
  }
  
  // L2：细纲锁
  if (detailLine) {
    lock += '【L2 细纲锁】本章必须完成以下细纲：' + detailLine.slice(0, 900) + '\n';
    ['章目标','冲突','剧情节点','爽点爆点','伏笔','关系变化','记忆承接','章尾钩子'].forEach(function(k){
      var v = parseDetailField(detailLine, k);
      if (v) lock += '   - ' + k + '：' + v.slice(0, 120) + '\n';
    });
    has = true;
  }
  
  // L2：章节卡锁
  if (work._chapterCards && work._chapterCards['ch_' + chapterIdx] && typeof chapterCardToText === 'function') {
    var card = chapterCardToText(work._chapterCards['ch_' + chapterIdx]);
    if (card) {
      lock += '【L2 章节卡锁】' + card.slice(0, 700) + '\n';
      has = true;
    }
  }
  
  // L1：长记忆锁（关键一致性）
  if (work.longMemory) {
    lock += '【L1 长记忆锁】\n';
    lock += '   - 人物状态锁：伤势、实力境界、情绪状态必须承接前文，不能突然痊愈或重置\n';
    lock += '   - 道具归属锁：谁拿着什么、谁丢了什么、谁欠了什么必须准确，不能凭空出现或消失\n';
    lock += '   - 关系变化锁：已结盟的不能无故敌对，已决裂的不能突然亲密，必须写出转变过程\n';
    lock += '   - 伏笔债务锁：未回收的伏笔必须定期推进，高优先级债务必须在5章内处理\n';
    lock += '   - 能力代价锁：使用能力后必须承受设定中的代价，不能无限开挂\n';
    has = true;
  }

  // L1：视角锁（比叙事规则更高一层的结构性一致性）
  var mainChar = '';
  if (work.chars) {
    var m = work.chars.match(/[【\[<]?([\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5A-Za-z0-9]{1,7})[】\]>]?\s*[：(]/);
    if (m) mainChar = m[1];
  }
  var p = work.perspective || 'third';
  if (p === 'first') {
    lock += '【L1 视角锁·第一人称】\n';
    lock += '   - 全文以"我"为唯一叙述主体（"我" = ' + (mainChar || '主角') + '）\n';
    lock += '   - "我"不在场的场景绝对不能写（只能通过后续对话/信/报告间接获知）\n';
    lock += '   - 禁读心：绝不能知道其他角色"在想什么"，只能通过动作/表情/语气推测\n';
    lock += '   - 禁全知："我"看不到的东西不能出现在正文里（如"他在我身后冷笑"应改为"我身后传来一声冷笑"）\n';
    has = true;
  } else {
    lock += '【L1 视角锁·第三人称有限视角】\n';
    lock += '   - 全文只能从' + (mainChar ? '【' + mainChar + '】' : '主角') + '的视角叙述（他/她看到、听到、想到的）\n';
    lock += '   - 禁读心：其他角色的想法必须通过动作/表情/语气/沉默/行为让读者体会\n';
    lock += '   - 禁全知：主角不知道的事情，叙述者无权直接告诉读者\n';
    lock += '   - 禁同段多视角切换：同一段落内严禁从A视角跳到B视角再跳回\n';
    lock += '   - 如需切换视角（仅为揭露关键线索），必须：①该角色前文已出现过 ②新起一段/一章并空行隔开 ③300字内切回或有独立叙事价值\n';
    has = true;
  }

  // L3：写作后自检要求
  lock += '【L3 写作自检要求】正文必须能回答以下问题：\n';
  lock += '   1. 本章承接了前文的哪些记忆点/伏笔？\n';
  lock += '   2. 本章推进了哪些主线/支线剧情？\n';
  lock += '   3. 本章回收了哪些伏笔/兑现了哪些承诺？\n';
  lock += '   4. 本章埋下了哪些新伏笔/新钩子？\n';
  lock += '   5. 章尾钩子是什么，是否能让读者想看下一章？\n';
  
  // 跨模块一致性优先级
  lock += '\n【一致性优先级规则】\n';
  lock += '   L0 世界观 > L1 人设/大纲/长记忆 > L2 细纲/章节卡 > L3 写作风格\n';
  lock += '   如果发现设定冲突，按此优先级解决：世界观设定 > 人物设定 > 大纲 > 细纲\n';
  lock += '   长记忆中的 L0 核心事实（身份、秘密、不可更改设定）优先级等同于世界观\n';
  
  return has ? lock : '';
}

function checkFullChainConsistency(work, chapterIdx, content) {
  var issues = [], hits = [], score = 100;
  content = content || '';
  var detailLine = getDetailLineForChapter(work, chapterIdx);
  var fields = ['章目标','冲突','剧情节点','爽点爆点','伏笔','关系变化','记忆承接','章尾钩子'];
  
  // L0：细纲字段落实检查
  if (detailLine) {
    fields.forEach(function(f){
      var v = parseDetailField(detailLine, f);
      if (!v) return;
      var tokens = _chainTokens(v, 6);
      var ok = tokens.length === 0 || tokens.some(function(t){ return content.indexOf(t) >= 0; });
      if (ok) hits.push('细纲_' + f); else { issues.push('[L2] 细纲字段未落实：' + f); score -= 7; }
    });
  } else {
    issues.push('[L2] 未找到本章细纲映射');
    score -= 10;
  }
  
  // L1：人物承接检查
  if (work && work.chars) {
    var names = [];
    try { names = extractCharNameMap(work.chars).names || []; } catch(e) {}
    var appeared = names.filter(function(n){ return n && content.indexOf(n) >= 0; });
    if (names.length && appeared.length === 0) { issues.push('[L1] 本章未出现任何已登记人物'); score -= 18; }
    else if (appeared.length) hits.push('人物承接(' + appeared.length + '人)');
    var outNames = (content.match(/[\u4e00-\u9fa5]{2,4}(?:冷笑|怒吼|低声|转身|抬手|皱眉|说道|问道|喝道)/g) || [])
      .map(function(x){ return x.replace(/(冷笑|怒吼|低声|转身|抬手|皱眉|说道|问道|喝道)$/,''); })
      .filter(function(n){ return n.length >= 2 && names.indexOf(n) < 0 && !/(他们|众人|男人|女人|少年|少女|老人)/.test(n); });
    if (outNames.length > 4) { issues.push('[L1] 疑似新增人物较多：' + outNames.slice(0,4).join('、')); score -= 8; }
  }
  
  // L0：跨模块一致性检查 - 世界观名称一致性
  if (work && work.world) {
    var worldText = work.world;
    // 检查境界/等级是否被违反
    var levelMatch = worldText.match(/(?:境界|等级)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (levelMatch) {
      var levels = levelMatch[1].match(/[\u4e00-\u9fa5]{2,6}(?:期|境|阶|层|级|段|重)/g);
      if (levels && levels.length > 0) {
        hits.push('世界观等级体系');
      }
    }
    // 检查势力名称一致性
    var factionMatch = worldText.match(/(?:势力|宗门|家族)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (factionMatch) {
      var factions = factionMatch[1].match(/[\u4e00-\u9fa5]{2,8}(?:宗|门|派|家|族|盟)/g);
      if (factions && factions.length > 0) {
        hits.push('世界观势力体系');
      }
    }
  }
  
  // L1：大纲主线推进检查
  if (work && work.outline) {
    var mainGoal = work.outline.match(/(?:主线|核心目标)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (mainGoal) {
      var goalTokens = _chainTokens(mainGoal[1], 4);
      if (goalTokens.length && goalTokens.some(function(t){ return content.indexOf(t) >= 0; })) {
        hits.push('主线推进');
      } else {
        issues.push('[L1] 本章未明显推进主线目标');
        score -= 10;
      }
    }
  }
  
  // L0：题材违禁元素检查
  var genre = getWorkGenre(work);
  if (genre.indexOf('历史') >= 0) {
    ['空间戒指','储物袋','系统面板','修仙者','炼丹','灵气','穿越'].forEach(function(w){
      if (content.indexOf(w) >= 0) { issues.push('[L0] 历史题材违禁元素：' + w); score -= 25; }
    });
  }
  
  // L2：章节卡落实检查
  if (work && work._chapterCards && work._chapterCards['ch_' + chapterIdx]) {
    var c = work._chapterCards['ch_' + chapterIdx];
    var cardOk = 0, cardTotal = 0;
    ['purpose','node1','node2','node3','node4','node5'].forEach(function(k){
      if (!c[k]) return;
      cardTotal++;
      var toks = _chainTokens(c[k], 4);
      if (toks.length && toks.some(function(t){return content.indexOf(t)>=0;})) {
        hits.push('章节卡_' + k);
        cardOk++;
      }
    });
    if (cardTotal > 0 && cardOk === 0) {
      issues.push('[L2] 章节卡内容未落实');
      score -= 8;
    }
  }
  
  // L1：长记忆一致性检查
  if (work && work.longMemory) {
    var lm = work.longMemory;
    
    // 检查核心事实是否被违反
    if (lm.memoryAnchors && lm.memoryAnchors.core) {
      var coreAnchors = lm.memoryAnchors.core.filter(function(a){ return a.chapterIdx < chapterIdx && a.status !== '失效'; });
      coreAnchors.forEach(function(anchor){
        // 简单检查：核心事实中的关键名词是否出现在正文中（或没有被矛盾描述）
        if (anchor.text && anchor.text.length > 10) {
          var keyTokens = anchor.text.match(/[\u4e00-\u9fa5]{2,6}/g) || [];
          if (keyTokens.length > 0 && keyTokens.some(function(t){ return content.indexOf(t) >= 0; })) {
            hits.push('核心事实承接');
          }
        }
      });
    }
    
    // 检查人物状态一致性
    if (lm.charStates && lm.charStates.length > 0) {
      var hasStateRef = false;
      lm.charStates.forEach(function(state){
        if (content.indexOf(state.name) >= 0) hasStateRef = true;
      });
      if (hasStateRef) hits.push('人物状态承接');
    }

    // L1：世界观规则一致性检查（能力代价/等级体系是否被违反）
    if (work && work.world) {
      var worldText = work.world;
      // 检查境界/等级是否被违反（如果设定了等级体系）
      var levelMatch = worldText.match(/(?:境界|等级|力量体系|修炼体系)[：:]([\s\S]{5,300}?)(?=\n[^\s]|\n\n|$)/);
      if (levelMatch && levelMatch[1]) {
        var levelWords = levelMatch[1].match(/[\u4e00-\u9fa5]{2,6}(?:期|境|阶|层|级|段|重|品)/g) || [];
        var forbiddenViolations = [];
        levelWords.forEach(function(lv){
          // 检查是否写了"超越"或"跳过"某个境界
          if (lv && content.indexOf('超越' + lv) >= 0 || content.indexOf('跳过' + lv) >= 0 || content.indexOf('连升' + lv) >= 0) {
            forbiddenViolations.push(lv);
          }
        });
        if (forbiddenViolations.length > 0) {
          issues.push('[L1] 违反世界观等级体系：' + forbiddenViolations.join('/'));
          score -= 18;
        } else if (levelWords.length > 0) {
          hits.push('世界观等级一致性');
        }
      }
      // 检查禁忌/代价是否被违反
      var costMatch = worldText.match(/(?:代价|禁忌|代价|限制)[：:]([\s\S]{5,200}?)(?=\n[^\s]|\n\n|$)/);
      if (costMatch && costMatch[1]) {
        var costWords = (costMatch[1].match(/[\u4e00-\u9fa5]{2,10}/g) || []).slice(0, 5);
        var costViolations = costWords.filter(function(w){ return w.length >= 3 && content.indexOf(w) >= 0; });
        if (costViolations.length > 0) {
          // 检查这些词是否出现在"代价被忽视"的语境中
          var negations = content.match(/(?:没有|无需|不必|不受|违背|违反)[^。]{0,15}" + costViolations[0] + "/g) || [];
          if (negations.length > 0) {
            issues.push('[L1] 违反世界观禁忌/代价设定');
            score -= 15;
          }
        }
      }
    }

    // L1：角色能力边界一致性检查
    if (work && work.chars) {
      var charLines = work.chars.split('\n');
      charLines.forEach(function(cl){
        var cm = cl.trim().match(/^[>\s]*[【\[<]?(.+?)[】\]>]?\s*[：(]\s*(.+?)\s*[)）]/);
        if (!cm) return;
        var cname = cm[1].trim();
        var cdesc = cm[2].trim();
        // 提取角色在前文中登记的能力/境界
        var next3 = charLines[charLines.indexOf(cl) + 1] || '';
        var abilityMatch = next3.match(/(?:能力|境界|实力|功法)[：:]\s*([^。\n]{2,30})/);
        if (!abilityMatch) return;
        var ability = abilityMatch[1].trim();
        if (!ability || ability.length < 2) return;
        // 检查正文是否在"无代价突破"或"凭空变强"
        if (content.indexOf(cname) >= 0) {
          var hasViolation = false;
          var violationPatterns = ['凭空' + ability, '瞬间' + ability, '直接突破', '无代价突破', ability + '暴涨'];
          violationPatterns.forEach(function(p){
            if (content.indexOf(p) >= 0) hasViolation = true;
          });
          if (hasViolation) {
            issues.push('[L1] 角色' + cname + '能力边界被违反：' + ability);
            score -= 10;
          }
        }
      });
    }

    // 检查伏笔债务
    if (lm.memoryDebt && lm.memoryDebt.length > 0) {
      var highDebt = lm.memoryDebt.filter(function(d){ return d.level === 'high' && d.age > 10; });
      if (highDebt.length > 0) {
        issues.push('[L1] 高优先级伏笔债务未及时处理（悬挂' + highDebt[0].age + '章）');
        score -= 12;
      }
    }
  }
  
  // L3：结尾钩子检查
  var tail = content.slice(-500);
  if (!/(？|！|\?|!)$/.test(tail.trim()) || !/(？|！|\?|!)\s*$/.test(content.trim())) {
    if (!/(未完待续|下章精彩|敬请期待)/.test(tail)) {
      issues.push('[L3] 章尾缺少钩子或悬念');
      score -= 6;
    }
  } else {
    hits.push('章尾钩子');
  }

  // ===== v53: 剧情推进度检查 =====
  var prevChapterContent = '';
  if (work && work.chapters && chapterIdx > 0 && work.chapters[chapterIdx - 1]) {
    prevChapterContent = work.chapters[chapterIdx - 1].content || '';
  }

  // 1. 检查主角状态是否有变化（不可逆变化检测）
  if (prevChapterContent && prevChapterContent.length > 200) {
    var progressionSignals = 0;
    var totalSignals = 5;

    // 信号1：主角位置/场景是否变化（从上一章场景关键词中提取）
    var prevLocations = prevChapterContent.match(/(?:来到|离开|回到|进入|走出|前往|到达|回到|到了|穿过|登上|踏入|步入|返回|离去|出发|赶往|躲进|逃往|逃到)/g) || [];
    var curLocations = content.match(/(?:来到|离开|回到|进入|走出|前往|到达|回到|到了|穿过|登上|踏入|步入|返回|离去|出发|赶往|躲进|逃往|逃到)/g) || [];
    if (curLocations.length > 0 && (prevLocations.length === 0 || Math.abs(curLocations.length - prevLocations.length) > 0)) {
      progressionSignals++;
    }

    // 信号2：冲突级别是否变化（从冲突关键词密度判断）
    var conflictWords = ['受伤','流血','重伤','断臂','吐血','倒下','杀掉','击杀','击败','打败','压制','碾压','击退','逼退','对抗','对峙','战斗','交手','碰撞','轰','炸','裂','碎','破','溃','败','逃','死','亡','毙','葬','灭','吞噬','撕碎','碾压','统领','消灭','覆灭','灭门','屠','封','锁','禁','废','散','丧失','失去','剥夺','代价','反噬','诅咒','惩罚','制裁'];
    var prevConflict = 0, curConflict = 0;
    for (var cwi = 0; cwi < conflictWords.length; cwi++) {
      if (prevChapterContent.indexOf(conflictWords[cwi]) >= 0) prevConflict++;
      if (content.indexOf(conflictWords[cwi]) >= 0) curConflict++;
    }
    if (curConflict > prevConflict + 2) {
      progressionSignals++;
    }

    // 信号3：主角认知/信息是否有变化（获得新信息）
    var infoWords = ['发现','原来','居然','竟然','没想到','才知道','真相','秘密','隐瞒','欺骗','误会','误解','谜','疑','揭露','揭开','曝光','暴露','现身','出现','身份','隐藏','潜伏','暗藏','背后','幕后','另有','其实','真正','原来如此','怪不得','难怪','那一声','那一眼','那封信','那张纸条','那块令牌','那枚戒指','那把剑','那张地图','那个名字','那个孩子','那句话','那个眼神','那个背影','那个笑容','那个纹身','那个印记','那个标记','那个符号','那个暗号','那本日记','那本账册'];
    var prevInfo = 0, curInfo = 0;
    for (var iwi = 0; iwi < infoWords.length; iwi++) {
      if (prevChapterContent.indexOf(infoWords[iwi]) >= 0) prevInfo++;
      if (content.indexOf(infoWords[iwi]) >= 0) curInfo++;
    }
    if (curInfo > prevInfo) {
      progressionSignals++;
    }

    // 信号4：关系变化
    var relationWords = ['结盟','背叛','亏欠','喜欢','恨','信任','怀疑','决裂','保护','敌对','归顺','分开','离别','重逢','和解','道歉','原谅','拒绝','答应','默许','承诺','发誓','约定','毁约','失约','守约','靠近','疏远','拥抱','牵手','推开','挽留','留下','离开','等着','追','跑','回头','转身','背对','面对','直视','回避','躲闪','低头','沉默','开口','闭口','不说','不敢说','不想说','说不出口','说了','问','质问','反问','逼问','追问','不再问','不再说','不再等','不再看','不再想','不再念'];
    var prevRel = 0, curRel = 0;
    for (var rwi = 0; rwi < relationWords.length; rwi++) {
      if (prevChapterContent.indexOf(relationWords[rwi]) >= 0) prevRel++;
      if (content.indexOf(relationWords[rwi]) >= 0) curRel++;
    }
    if (curRel > prevRel + 1) {
      progressionSignals++;
    }

    // 信号5：能力/实力变化
    var powerWords = ['突破','升级','进阶','觉醒','领悟','掌握','练成','修成','学会','提升','增长','增强','变强','变快','变准','变狠','变稳','变冷','变热','变轻','变重','变快','变慢','变亮','变暗','变强','变弱','暴涨','飙升','翻倍','倍增','蜕变','涅槃','重生','重构','重塑','新建','重建','新创','新悟','新成','新就','新得','新获','新取','新收','新入','新掌','新握','新拿','新持','新有','新获','新得','新升','新上','新进','新开','新启','新始','新出','新成','新立','新设','新定','新制','新规','新则','新法','新术','新技','新招','新式','新'];
    var prevPower = 0, curPower = 0;
    for (var pwi = 0; pwi < powerWords.length; pwi++) {
      if (prevChapterContent.indexOf(powerWords[pwi]) >= 0) prevPower++;
      if (content.indexOf(powerWords[pwi]) >= 0) curPower++;
    }
    if (curPower > prevPower + 1) {
      progressionSignals++;
    }

    // 推进度评分
    if (progressionSignals >= 4) {
      hits.push('剧情推进度: 强推进(' + progressionSignals + '/' + totalSignals + ')');
    } else if (progressionSignals >= 2) {
      hits.push('剧情推进度: 正常推进(' + progressionSignals + '/' + totalSignals + ')');
    } else if (progressionSignals >= 1) {
      hits.push('剧情推进度: 弱推进(' + progressionSignals + '/' + totalSignals + ')');
      issues.push('[v53] 剧情推进度偏低(' + progressionSignals + '/' + totalSignals + ')，本章可能原地踏步');
      score -= 5;
    } else {
      issues.push('[v53] 剧情推进度严重不足(' + progressionSignals + '/' + totalSignals + ')，本章可能为水章');
      score -= 15;
    }
  }

  score = Math.max(0, Math.min(100, score));
  return { score: score, issues: issues.slice(0, 15), hits: hits.slice(0, 15), checkedAt: Date.now(), chapterIdx: chapterIdx };
}

// v54: 从章节正文中提取结构化上下文，存入记忆锚点，替代原文注入
function extractChapterContext(work, content, chapterIdx) {
  if (!content || content.length < 100) return null;
  var ctx = { chapterIdx: chapterIdx };

  // 1. 结尾场景位置（最后 800 字中提取）
  var tail = content.slice(-800);
  var locM = tail.match(/(?:在|于|来到|站在|坐在|躺在|靠在|躲在|藏在|回到|走进|踏入|步入|身处|位于|立在|停在|留在|停在|立在|跪在|趴在|蹲在|靠在|倚在|倚着|扶着|撑着|握着|抓着|揪着|拉着|拽着|提着|举着|抱着|搂着|背着|扛着|顶着|踩着|踏着|站在|坐于|立于|系于|挂在|悬在|浮在|飘在|落在|掉在|摔在|倒在|跌在|滚在|沉在|没在|浸在|泡在|漂在|游在|飞在|行在|走在|跑在|奔在|逃在|躲于|藏于|隐于|睡在|醒在|醉在|醒在|躺在|卧在|靠在)(.{0,30})/);
  ctx.endLocation = locM ? locM[1] + locM[2] : '';

  // 2. 结尾时间
  var timeM = tail.match(/(?:黎明|清晨|早晨|上午|中午|午后|下午|傍晚|黄昏|入夜|深夜|午夜|凌晨|天亮|天黑|日出|日落|月升|月落|三更|五更|子时|丑时|寅时|卯时|辰时|巳时|午时|未时|申时|酉时|戌时|亥时|一炷香|半个时辰|一个时辰|片刻|须臾|转瞬|弹指|刹那|一瞬|一盏茶|一袋烟|一炷香后|不久|良久|许久|一会儿|一阵|半日|一日|一夜|一天|一晚|半晌|半天|半天后|半日后|一天后|一夜后|三日后|七日后|一个月后|一年后|数年后|多年后|若干年后|数日|数夜|数月|数年|数载|春|夏|秋|冬|正月|二月|三月|四月|五月|六月|七月|八月|九月|十月|冬月|腊月|初春|仲春|暮春|初夏|盛夏|夏末|初秋|中秋|深秋|初冬|隆冬|残冬|开春|入夏|入秋|入冬|立春|雨水|惊蛰|春分|清明|谷雨|立夏|小满|芒种|夏至|小暑|大暑|立秋|处暑|白露|秋分|寒露|霜降|立冬|小雪|大雪|冬至|小寒|大寒)/);
  ctx.endTime = timeM ? timeM[0] : '';

  // 3. 最后发生的关键动作（最后 1000 字）
  var tail1k = content.slice(-1000);
  var actionSentences = tail1k.split(/[。！？\n]+/);
  var lastActions = [];
  for (var i = actionSentences.length - 1; i >= 0 && lastActions.length < 3; i--) {
    var s = actionSentences[i].trim();
    if (s.length > 8 && s.length < 120 && !/^(他|她|它|这|那|但是|然而|可是|不过|于是|接着|然后|之后|忽然|突然|就这|只见|只听|只觉|感觉|觉得|想到|想起|想到|看着|听着|闻着|嗅着|尝到|触到|感到|感觉到|意识到|注意到|察觉到|发现到|看到|望见|瞥见|听到|听见|闻到|嗅到|感到|感觉到|意识到|注意到|察觉到|发现)/.test(s)) {
      lastActions.push(s.slice(0, 100));
    }
  }
  ctx.lastActions = lastActions.reverse();

  // 4. 结尾钩子（最后 300 字中检测）
  var tail300 = content.slice(-300);
  var hookM = tail300.match(/([^。！？\n]{10,80}(?:？|！|\.\.\.|……|——|…)(?:\s|$))/);
  ctx.endHook = hookM ? hookM[1].trim() : '';

  // 5. 情绪状态（最后 500 字）
  var tail500 = content.slice(-500);
  if (/(怒|恨|杀|仇|血|碎|崩|裂|疯|狂|暴|戾|吼|咆哮|嘶吼|咬牙|攥紧|握紧|捏碎|青筋|暴起|暴怒|狂怒|震怒|盛怒|怒极|失控|暴虐|残暴|凶残|狠戾|阴鸷|阴狠|狠辣|毒辣|歹毒|恶毒|残忍|冷酷|无情|绝情|屠杀|屠戮|血洗|血染|灭门|赶尽杀绝)/.test(tail500)) {
    ctx.emotion = "高烈度负面（愤怒/仇恨/狂暴/杀气）";
  } else if (/(哭|泪|泣|悲|伤|痛|绝望|失落|离别|死|亡|失去|离开|告别|永别|诀别|逝去|牺牲|惨笑|苦笑|强笑|木然|茫然|黯|凄|惨|萎靡|颓丧|心灰|心碎|心死|心寒|断肠|肝肠寸断|万念俱灰|心如死灰)/.test(tail500)) {
    ctx.emotion = "低烈度负面（悲伤/失落/迷茫/孤独）";
  } else if (/(笑|喜|乐|欢|悦|欣|畅|快|幸福|甜蜜|温暖|温馨|拥抱|和解|重逢|成功|突破|觉醒|感动|感激|释然|轻松|明媚|灿烂|欢呼|雀跃)/.test(tail500)) {
    ctx.emotion = "正面情绪（喜悦/兴奋/感动/温暖）";
  } else if (/(疑|谜|暗|藏|隐|秘密|真相|揭露|发现|惊讶|意外|反转|突然|不对劲|奇怪|诡异|紧张|对峙|冲突|危险|危机|逼近|紧迫|千钧一发)/.test(tail500)) {
    ctx.emotion = "悬疑/紧张（疑惑/期待/危机感）";
  } else {
    ctx.emotion = "中性/平静/过渡";
  }


  // 6. 在场角色（从 work.chars 动态提取角色名，匹配全文出现过的角色）
  var allChars = [];
  try {
    var charNames = [];
    var charsText = (work && work.chars) ? work.chars : '';
    if (charsText) {
      var lines = charsText.split(/\n/);
      for (var cl = 0; cl < lines.length; cl++) {
        var line = lines[cl].trim();
        if (!line) continue;
        var nameMatch = line.match(/^[【\[]?(\S{1,6})[】\]\s：:，,]/);
        if (nameMatch && nameMatch[1] && /[\u4e00-\u9fa5]{2,4}/.test(nameMatch[1])) {
          charNames.push(nameMatch[1]);
        }
      }
    }
    if (charNames.length > 0) {
      var escaped = charNames.map(function(n) { return n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
      var charRE = new RegExp('(' + escaped.join('|') + ')', 'g');
      var charMatch;
      while ((charMatch = charRE.exec(content)) !== null) {
        var cn = charMatch[0];
        if (allChars.indexOf(cn) === -1) allChars.push(cn);
      }
    }
  } catch(e) {}
  ctx.presentChars = allChars.slice(0, 8);

  return ctx;
}

// v54: 从记忆锚点中构建章节上下文块，替代原文注入
function buildChapterContextBlock(work, chapterIdx) {
  if (!work) return '';
  initLongMemory(work);
  var lm = work.longMemory;
  if (!lm || !lm.memoryAnchors) return '';
  var ma = lm.memoryAnchors;

  var block = '';

  // 1. 章节上下文（最新一条）
  if (Array.isArray(ma.chapterContext) && ma.chapterContext.length > 0) {
    var latest = ma.chapterContext[ma.chapterContext.length - 1];
    if (latest.chapterIdx === chapterIdx - 1) {
      block += '【上章结尾上下文】\n';
      if (latest.endLocation) block += '场景位置：' + latest.endLocation + '\n';
      if (latest.endTime) block += '时间：' + latest.endTime + '\n';
      if (latest.emotion) block += '情绪基调：' + latest.emotion + '\n';
      if (latest.presentChars && latest.presentChars.length > 0) block += '在场角色：' + latest.presentChars.join('、') + '\n';
      if (latest.lastActions && latest.lastActions.length > 0) {
        block += '最后关键动作：\n';
        for (var a = 0; a < latest.lastActions.length; a++) {
          block += '  ' + (a + 1) + '. ' + latest.lastActions[a] + '\n';
        }
      }
      if (latest.endHook) block += '章末钩子：' + latest.endHook + '\n';
      block += '\n';
    }
  }

  // 2. 最新道具状态（最近3条）
  if (Array.isArray(ma.items) && ma.items.length > 0) {
    var recentItems = ma.items.slice(-3);
    block += '【最近道具状态】\n';
    for (var i = 0; i < recentItems.length; i++) {
      block += '- ' + recentItems[i].text + '\n';
    }
    block += '\n';
  }

  // 3. 最新地点状态（最近2条）
  if (Array.isArray(ma.locations) && ma.locations.length > 0) {
    var recentLocs = ma.locations.slice(-2);
    block += '【最近场景状态】\n';
    for (var j = 0; j < recentLocs.length; j++) {
      block += '- ' + recentLocs[j].text + '\n';
    }
    block += '\n';
  }

  // 4. 最新钩子（最近2条）
  if (Array.isArray(ma.hooks) && ma.hooks.length > 0) {
    var recentHooks = ma.hooks.slice(-2);
    block += '【最近伏笔/钩子】\n';
    for (var k = 0; k < recentHooks.length; k++) {
      block += '- ' + recentHooks[k].text + '\n';
    }
    block += '\n';
  }

  return block;
}

function backfeedChainMemory(work, chapterIdx, content, report) {
  if (!work || !content) return;
  initLongMemory(work);
  var lm = work.longMemory;
  if (!Array.isArray(lm.chainConsistency)) lm.chainConsistency = [];
  lm.chainConsistency.push(report);
  lm.chainConsistency = lm.chainConsistency.slice(-80);
  if (!lm.memoryAnchors) lm.memoryAnchors = {core:[],characterTags:[],relationships:[],items:[],locations:[],promises:[],timeline:[],hooks:[],chapterContext:[]};
  // v54: 提取章节上下文，存入记忆
  try {
    var chCtx = extractChapterContext(work, content, chapterIdx);
    if (chCtx) {
      chCtx.source = '正文反哺';
      chCtx.updatedAt = Date.now();
      chCtx._bucket = 'chapterContext';
      chCtx.weight = 9;
      lm.memoryAnchors.chapterContext.push(chCtx);
      // 限制数量
      if (lm.memoryAnchors.chapterContext.length > 60) lm.memoryAnchors.chapterContext = lm.memoryAnchors.chapterContext.slice(-60);
    }
  } catch(e) {}
  var relLines = content.split(/[。！？\n]+/).filter(function(s){ return /(结盟|背叛|救了|亏欠|喜欢|怀疑|信任|决裂|保护|敌对|归顺)/.test(s); }).slice(0, 5);
  relLines.forEach(function(s){
    lm.memoryAnchors.relationships.push({text:s.slice(0,90), chapterIdx:chapterIdx, status:'有效', source:'正文反哺', updatedAt:Date.now(), _bucket:'relationships', weight:8});
  });
  // v53: 物品追踪 — 扩展物品词库和动作词，覆盖不下100种修真/都市/历史物品
  var itemActionRE = /(?:得到|拿到|夺走|抢走|偷走|捡到|拾起|翻出|摸出|掏出|递给|交给|塞给|扔给|推向|递过|接过|收下|收起|放入|揣进|塞进|藏起|埋下|埋入|带走|拿回|归还|归还|交还|丢失|遗失|掉落|落下|摔碎|捏碎|折断|撕碎|烧毁|烧了|焚毁|毁掉|毁去|销毁|用掉|服下|吞下|喝下|捏碎|震碎|击碎|劈开|砍断|斩断|融化|腐蚀|开封|拆开|展开|翻开|合上|系上|解开|脱下|穿上|戴上|取下|抛出|掷出|扔出|弹入|射出|打入|钉入|插入|拔出|抽出|拔出|交换|换给|换到|赠予|送给|留下|留给|放回|搁在|摆在|压在|夹在|别在|系在|挂在|悬在|浮在|飘落|沉入|没入|吸入|吸走|卷走|冲走|吹走|带走|偷走|掠走|抢走|夺取|收起|纳入|注入|灌入|倒入|滴入|渗入|浸入|刻入|写入|画入|印入|烙入|缝入|嵌入|痕迹|标记|印记|符号|暗号|指纹|血迹|粉末|残留|残渣|碎屑|碎片|裂缝|缺口|破损|断裂|扭曲|变形|褪色|变色|变暗|变亮|变冷|变热|变轻|变重|发光|闪烁|熄灭|黯淡|消失|出现|浮现|显形|隐去|沉下|升起|飘起|散开|弥漫|消散|褪去|化开|融解|凝固|冻结|沸腾|蒸发|升华|凝华|结晶|沉淀|分离|融合|合一|合为一体|汇聚|聚集|聚拢|散开|扩散|蔓延|吞噬|包围|笼罩|覆盖|包裹|缠绕|束紧|勒紧|松开|解开|脱离|滑落|坠落|消失|回归|召唤|唤醒|激活|催动|激发|引动|牵动|震动|共鸣|共鸣|共振|同频|融合|觉醒|苏醒|复苏|重生|涅槃|蜕变|进化|退化|变异|异变|扭曲|反转|颠倒|置换|替换|替代|取代|变成|化为了|化作|化为|转为|变为|变成)/;
  var itemNameRE = /(?:剑|刀|枪|戟|斧|钺|钩|叉|鞭|锏|锤|戈|矛|盾|弓|弩|箭|刃|匕|飞剑|飞刀|法器|法宝|灵器|灵宝|仙器|神器|魔器|魔兵|妖器|佛器|道器|符|符箓|符咒|符纸|符印|符纹|符文|阵法|阵盘|阵旗|阵眼|阵基|卷轴|玉简|竹简|书简|秘籍|秘典|功法|心法|口诀|手札|笔记|日记|信|信件|密信|密函|血书|诏书|圣旨|旨意|令牌|令箭|令旗|令符|腰牌|铁券|兵符|虎符|将印|帅印|官印|大印|玉玺|国玺|印信|信物|凭证|契约|契书|婚书|休书|和离书|投名状|卖身契|地契|房契|账册|账簿|账本|名册|花名册|图谱|地图|舆图|海图|星图|阵图|秘图|藏宝图|钥匙|锁|锁链|镣铐|枷锁|手铐|脚镣|铁链|锁链|绳索|绳子|绑带|绷带|药|丹药|灵丹|仙丹|毒药|解药|迷药|蒙汗药|汤药|药粉|药丸|药膏|药液|药汤|药引|药渣|药草|草药|灵草|仙草|人参|灵芝|雪莲|首乌|丹砂|朱砂|雄黄|砒霜|鹤顶红|断肠草|见血封喉|鸩|蛊|蛊虫|蛊毒|蛊术|蛊种|蛊母|子蛊|母蛊|本命蛊|魂蛊|血蛊|情蛊|同心蛊|忘忧蛊|傀儡蛊|控心蛊|玉佩|玉环|玉镯|玉簪|玉钗|玉冠|玉带|玉玦|玉珮|金钗|银簪|铜镜|木梳|梳子|发簪|簪子|簪花|绢花|珠花|步摇|耳坠|耳环|项链|项圈|手镯|手链|脚链|戒指|扳指|指环|香囊|荷包|钱袋|储物袋|储物戒|空间戒指|纳戒|乾坤袋|百宝囊|锦囊|布袋|包裹|包袱|披风|斗篷|大氅|棉袍|道袍|袈裟|僧衣|法袍|战甲|铠甲|软甲|内甲|护心镜|护腕|护膝|护腿|护肩|护臂|护手|拳套|手套|丝线|金线|银线|丝线|蚕丝|蛛丝|天蚕丝|冰蚕丝|灵丝|琴|瑟|笙|箫|笛|埙|筝|琵琶|二胡|鼓|钟|磬|铃|铃铛|风铃|银铃|金铃|铜铃|签筒|签|卦|龟甲|铜钱|算盘|棋子|棋盘|画卷|画轴|画|字画|书法|墨宝|砚台|墨锭|墨条|毛笔|狼毫|羊毫|宣纸|绢帛|丝绸|锦缎|布匹|茶叶|酒|酒壶|酒坛|酒杯|茶壶|茶盏|茶杯|碗|筷|勺子|匕首|暗器|飞镖|毒针|毒刺|毒烟|毒雾|毒气|毒粉|迷烟|迷香|火药|炸药|雷管|引信|炮仗|烟花|爆竹|灯笼|灯盏|烛台|蜡烛|烛火|油灯|灯芯|火折子|火镰|火石|火绒|火把|火堆|篝火|骨灰|骨灰盒|骨灰坛|骨灰罐|骨灰瓮|灵位|牌位|遗像|遗物|遗书|遗言|遗嘱|遗产|棺木|棺椁|棺材|灵柩|墓碑|墓志铭|石刻|石碑|石像|雕像|塑像|泥塑|陶俑|俑|木偶|傀儡|人偶|布偶|偶人|面人|糖人|泥人|铜人|铁人|石人|金人|玉人|水晶球|水晶|琉璃|琥珀|玛瑙|翡翠|珊瑚|珍珠|夜明珠|宝石|钻石|金刚石|灵石|晶石|魔晶|仙晶|神晶|元石|魂石|魄石|血石|骨石|晶核|魔核|妖核|兽核|内核|核心|种子|果实|花朵|花瓣|花粉|蜜|露|霜|雪|冰|水|火|土|木|金|铁|铜|银|金|玉|石|沙|尘|泥|灰|炭|煤|油|漆|胶|蜡|树脂|松脂|琥珀|蜜蜡|蜂蜡|虫胶|虫蜡|犀角|象牙|兽骨|兽皮|兽毛|兽角|兽爪|兽牙|鳞片|羽毛|绒羽|翎羽|翎毛|翅|翼|壳|甲壳|龟壳|贝壳|螺壳|蛋壳|蛋|卵|核|种子|籽|果实|果核|果仁|核仁|仁|杏仁|核桃|松子|瓜子|花生|豆|米|麦|粟|谷|粮|食|饭|粥|面|饼|馒头|包子|饺子|馄饨|糕点|点心|糖果|蜜饯|干果|坚果|炒货|蜜|糖|盐|醋|酱油|酒|茶|水|汤|羹|汁|浆|露|液|油|脂|膏|霜|粉|末|碎片|碎屑|粉末|颗粒|晶体|结晶|凝块|块状|条状|片状|丝状|线状|网状|布状|膜状|壳状|球状|珠状|粒状|粉状|末状|液状|膏状|胶状|蜡状|油状|气状|雾状|烟状|云状|光状|影状|声状|波状|纹状|痕状|印状|迹状|斑状|点状|线状|网状|格状|格|纹|痕|印|迹|斑|点|线|丝|缕|片|块|条|根|枝|叶|花|果|实|种|子|核|仁|粉|末|屑|渣|残|余|剩|留|存|藏|隐|埋|没|沉|浮|飘|飞|游|走|跑|跳|跃|蹦|窜|蹿|冲|撞|碰|磕|绊|跌|摔|倒|塌|崩|裂|碎|破|灭|毁|坏|损|伤|残|缺|断|折|弯|曲|扭|转|翻|滚|旋|绕|缠|盘|环|圈|套|箍|束|绑|捆|扎|系|拴|扣|锁|封|闭|合|关|开|启|解|放|松|脱|卸|摘|取|拿|拾|捡|抓|握|捏|攥|握|持|执|握|捧|托|端|举|提|拎|扛|背|抱|搂|夹|掖|揣|塞|藏|收|放|存|搁|摆|置|安|放|搁|置|挂|悬|吊|垂|坠|系|绑|拴|扣|别|夹|卡|嵌|镶|套|箍|环|圈|绕|缠|盘|卷|裹|包|封|盖|罩|蒙|遮|掩|挡|拦|阻|隔|断|绝|止|停|驻|留|待|等|候|守|望|看|观|察|视|见|睹|瞥|瞟|扫|览|阅|读|念|诵|吟|咏|唱|歌|呼|喊|叫|唤|喝|吼|啸|嚎|啼|鸣|响|声|音|响|动|静|寂|默|沉|闷|哑|失|聋|盲|瞎|瘸|瘫|废|残|疾|病|伤|痛|疼|痒|麻|酸|胀|晕|眩|昏|迷|醉|醒|觉|悟|懂|会|通|明|白|清|楚|澈|透|亮|光|明|暗|黑|阴|阳|日|月|星|辰|天|地|山|川|河|流|江|湖|海|洋|岛|屿|礁|滩|岸|沙|泥|土|石|岩|崖|壁|峰|岭|峦|岗|丘|坡|谷|壑|沟|溪|涧|潭|池|沼|泽|泉|井|源|头|尾|端|顶|底|边|缘|角|尖|刃|锋|口|洞|穴|窟|孔|缝|隙|裂|纹|迹|痕|印|记|号|符|码|字|数|算|量|度|衡|尺|寸|斤|两|钱|分|厘|毫|丝|忽|微|纤|尘|埃|沙|粒|滴|点|抹|缕|丝|片|瓣|朵|枝|条|根|株|棵|丛|簇|束|把|捆|堆|叠|摞|排|行|列|队|阵|群|批|组|套|副|双|对|只|个|件|枚|颗|粒|滴|点|片|块|条|根|枝|束|把|串|挂|副|双|对|套|组|批|群|阵|队|列|排|行|摞|叠|堆|捆|束|把|串|挂)/;
  var itemLines = [];
  var itemSentences = content.split(/[。！？\n]+/);
  for (var isi = 0; isi < itemSentences.length; isi++) {
    var s = itemSentences[isi];
    if (itemActionRE.test(s) && itemNameRE.test(s) && itemLines.length < 10) {
      itemLines.push(s);
    }
  }
  itemLines.forEach(function(s){
    lm.memoryAnchors.items.push({text:s.slice(0,90), chapterIdx:chapterIdx, status:'有效', source:'正文反哺', updatedAt:Date.now(), _bucket:'items', weight:8});
  });

  // v53: 场景追踪 — 扩展为「移动 + 场景内物品状态变化 + 子区域切换」
  var locationLines = [];
  var locSentences = content.split(/[。！？\n]+/);
  for (var lsi = 0; lsi < locSentences.length; lsi++) {
    var ls = locSentences[lsi];
    // 移动类：进入/离开/返回/转移
    if (/(来到|进入|离开|回到|赶往|抵达|藏在|困在|设伏|埋伏|撤退|退入|转入|移步|踏入|步入|跨入|走进|跑进|冲进|闯进|逃进|躲进|闪进|溜进|潜入|摸进|摸到|绕到|转到|折返|返回|回到|归|归宿|落脚|暂住|歇脚|歇息|安顿|驻扎|扎营|安营|宿营|露宿|借宿|投宿|住宿|住下|歇下|躺下|坐下|蹲下|站定|停下|止步|驻足|停留|驻足|止步|徘徊|踱步|来回|往返|穿梭|游走|移动|转移|搬迁|迁徙|迁移|上行|下行|攀爬|攀登|登顶|登高|拾级|下坡|下山|上山|过桥|渡河|涉水|翻山|越岭|穿林|入林|出林|穿行|贯穿|横穿|斜穿|笔直|拐弯|右转|左转|掉头|折返|原路|返回|退回|后退|后撤|后退|退避|避开|绕开|绕过|绕行|绕路|抄近道|抄小路|走捷径|另辟蹊径|另寻他路|改道|换道|换路|换线|换乘|转乘|中转|经停|途经|路过|经过|穿过|通过|越过|翻过|跨过|渡过|涉过|淌过|游过|漂过|飞过|掠过|闪过|划过|滑过|飘过|浮过|沉过|潜过|钻过|穿过|透过|渗过|渗入|渗进|透入|透进|融入|融进|化入|化进|渗入|渗进|浸润|浸透|浸入|浸没|淹没|吞没|覆盖|笼罩|包围|环绕|围住|围拢|聚拢|聚到|集到|汇到|合到|并到|归到|拢到|收拢|归拢|聚合|汇集|汇聚|会合|会聚|汇合|碰头|碰面|见面|相会|相遇|相逢|邂逅|偶遇|撞见|碰到|遇到|遇见|见到|看到|望见|瞥见|扫见|瞧见|瞅见|瞄见|看见|望见|远眺|眺望|鸟瞰|俯瞰|俯视|平视|仰视|仰望|抬头|举头|昂首|翘首|引颈|探头|伸头|探身|欠身|俯身|弯腰|躬身|猫腰|弓腰|蜷缩|缩起|收起|卷起|缩回|缩进|收进|退回|退后|倒退|倒行|逆行|迂回|绕行|绕道|绕路|绕圈|兜圈|转圈|打转|转悠|游荡|闲逛|漫步|散步|溜达|踱|踱步|散步|散步|溜达|闲逛|晃悠|晃荡|游走|游荡|徘徊|盘桓|逗留|流连|驻留|驻足|停留|静止|站立|端坐|正坐|斜坐|歪坐|瘫坐|靠坐|倚坐|靠墙|依墙|倚门|靠门|倚柱|靠柱|靠树|倚树|靠石|倚石|靠栏杆|倚栏杆|扶栏|握栏|撑栏|搭栏|趴在|伏在|靠在|倚在|坐在|躺在|卧在|睡在|倒在|跌在|摔在|滚在|落).{0,20}/.test(ls)) {
      locationLines.push(ls);
    }
    // 场景内物品状态变化（不涉及移动，但物品位置/状态变了）
    else if (ls.length > 20 && ls.length < 200 && locationLines.length < 8) {
      if (/(?:放下|搁下|摆在|放在|搁在|置于|置于|安放|放置|搁置|收好|收起|藏好|藏起|埋好|投入|扔进|丢进|抛进|投进|掷入|弹入|射入|塞入|插入|嵌入|镶入|嵌入|刻入|写入|画入|印入|烙入|缝入|绣入|织入|编入|编进|织进|绣进|缝进|刺入|扎入|钉入|楔入|敲入|打入|砸入|撞击|碾碎|压碎|挤碎|捏碎|捻碎|揉碎|搓碎|撕碎|扯碎|拉碎|拽碎|撕开|扯开|拉开|拽开|撕破|扯破|撕烂|扯烂|撕裂|扯裂|捅破|戳破|扎破|刺破|挑破|划破|割破|切开|割开|划开|挑开|劈开|斩开|砍开|剁开|剪开|剪断|剪碎|剪破|铰断|铰碎|铰开|铰破|切断|割断|划断|挑断|劈断|斩断|砍断|剁断|烧断|熔断|熔解|溶解|融化|熔化|融解|融掉|烧掉|焚毁|焚烧|烧毁|烧化|烧熔|烧穿|烧透|烧红|烧黑|烧焦|烧糊|烧枯|烧干|烧尽|烧光|烧完|烧净|烧绝|烧灭|烧没|烧完|烧掉|烧去|烧毁|烧坏|烧损|烧伤|烧残|烧缺|烧裂|烧碎|烧破|烧烂|烧化|烧熔|烧软|烧硬|烧脆|烧酥|烧粉|烧末|烧屑|烧渣|烧灰|烧炭|烧煤|烧烟|烧雾|烧气|烧光|烧尽|烧完|烧净|烧绝|烧灭|烧没|烧去|烧毁|烧坏|烧损|烧伤|烧残|烧缺|烧裂|烧碎|烧破|烧烂|烧化|烧熔|烧软|烧硬|烧脆|烧酥|烧粉|烧末|烧屑|烧渣|烧灰|烧炭|烧烟|烧雾|烧气|融掉|化掉|化开|化去|化尽|化光|化完|化净|化绝|化灭|化没|化无|化空|化为|化作|变成|变为|变作|转成|转作|转为|换成|换作|换为|替成|替作|替为|代成|代作|代为|改成|改作|改为|变成|变作|变为|化作|化为|消融|消解|消散|消失|消逝|消去|消尽|消光|消完|消净|消绝|消灭|消亡|消没|消无|消空|隐去|隐没|隐匿|隐藏|隐蔽|隐伏|隐现|浮现|显出|显出|显现|显露|暴露|露出|展示|展现|呈现|显出|现出|露出|透出|渗出|溢出|流出|淌出|滴出|冒出|涌出|喷出|射出|飞出|飘出|散出|发出|放出|射出|发送|送达|传到|递到|交到|给到|送到|发到|传信|传讯|传音|传话|传令|传召|传唤|传见|传报|传告|通知|告知|通报|通告|呈报|呈上|呈递|呈送|呈交|上呈|上报|上奏|奏报|奏请|奏明|奏知|启奏|启禀|禀报|禀告|禀明|禀知|回禀|回奏|回话|回信|回音|回复|答复|回答|答话|应声|应话|接话|搭话|搭腔|插话|插嘴|插言|打岔|打断|截断|截住|拦住|拦住话头|抢话|抢白|抢说|抢着说|争着说|抢着答|争着答|喊出|叫出|喝出|吼出|骂出|嚷出|嘶吼|嘶喊|嘶叫|嘶鸣|嘶嚎|嘶啼|惨叫|惊叫|尖叫|锐叫|凄叫|厉叫|锐啸|凄啸|厉啸|锐嚎|凄嚎|厉嚎|惨嚎|惊嚎|干嚎|嚎啕|号啕|号哭|嚎哭|大哭|痛哭|哀哭|悲哭|泣|啜泣|抽泣|饮泣|暗泣|偷泣|偷哭|暗哭|默哭|无声的哭|不出声的哭|憋着哭|忍住哭|强忍着不哭|不让自己哭出来|咬住嘴唇不让自己哭出来|把眼泪憋回去|咽回去)/.test(ls)) {
        locationLines.push(ls);
      }
    }
    if (locationLines.length >= 10) break;
  }
  locationLines.slice(0, 8).forEach(function(s){
    lm.memoryAnchors.locations.push({text:s.slice(0,90), chapterIdx:chapterIdx, status:'有效', source:'正文反哺', updatedAt:Date.now(), _bucket:'locations', weight:6});
  });
  var promiseLines = content.split(/[。！？\n]+/).filter(function(s){ return /(答应|承诺|发誓|约定|保证|一定|绝不|绝对不会)/.test(s); }).slice(0, 3);
  promiseLines.forEach(function(s){
    lm.memoryAnchors.promises.push({text:s.slice(0,90), chapterIdx:chapterIdx, status:'有效', source:'正文反哺', updatedAt:Date.now(), _bucket:'promises', weight:7});
  });
  ['relationships','items','locations','promises'].forEach(function(k){
    var seen = {};
    lm.memoryAnchors[k] = (lm.memoryAnchors[k] || []).filter(function(x){
      var key = (x.text||'').slice(0,36);
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    }).slice(-60);
  });
}

function runFullChainAfterWrite(work, chapterIdx, content) {
  var report = checkFullChainConsistency(work, chapterIdx, content || '');
  var commercial = analyzeCommercialWritingV45(work, chapterIdx, content || '');
  if (work && work.chapters && work.chapters[chapterIdx]) {
    work.chapters[chapterIdx]._chainConsistency = report;
    work.chapters[chapterIdx]._commercialQuality = commercial;
  }
  initLongMemory(work);
  if (!Array.isArray(work.longMemory.commercialReports)) work.longMemory.commercialReports = [];
  work.longMemory.commercialReports.push(commercial);
  work.longMemory.commercialReports = work.longMemory.commercialReports.slice(-80);
  backfeedChainMemory(work, chapterIdx, content || '', report);
  return report;
}

// 提取当前章节所在卷的大纲上下文（支持outline和detail格式）
function getCurrentVolumeContext(work, chapterIdx) {
  if (!work || !work.outline) return { volumeLabel: '', currentBody: '', prevVolumes: '', nextVolumeHook: '' };
  var outlineText = work.outline;
  var volSize = 50;
  if (work.longMemory && work.longMemory.ultraMeta && work.longMemory.ultraMeta.volumeSize) {
    volSize = work.longMemory.ultraMeta.volumeSize;
  }
  var currentVol = Math.floor(chapterIdx / volSize);
  var volLabel = '第' + (currentVol + 1) + '卷';
  // 支持多种格式：第1卷、第 1 卷、第 1 卷（起势）、第 1 卷·起势
  var volRE = /(第\s*[一二三四五六七八九十\d]+\s*[卷部章节])\s*[（(]?([^）)\n]{0,8})[）)]?\s*[：:]?\s*([\s\S]*?)(?=\n\s*第\s*[一二三四五六七八九十\d]+\s*[卷部章节]|$)/gi;
  var volMatches = [];
  var m;
  while ((m = volRE.exec(outlineText)) !== null) {
    volMatches.push({ label: m[1], phase: (m[2] || '').trim(), body: m[3] });
  }
  var currentVolData = volMatches.find(function(v) { return v.label === volLabel || v.label.replace(/\s/g, '') === volLabel.replace(/\s/g, ''); });
  var prevVolData = volMatches.filter(function(v) { return volMatches.indexOf(v) < volMatches.indexOf(currentVolData); }).slice(-3);
  var nextVolData = volMatches.filter(function(v) { return volMatches.indexOf(v) > volMatches.indexOf(currentVolData); }).slice(0, 1);
  var result = {
    volumeLabel: currentVolData ? (currentVolData.label + (currentVolData.phase ? '（' + currentVolData.phase + '）' : '')) : volLabel,
    currentBody: currentVolData ? currentVolData.body.trim() : '',
    prevVolumes: prevVolData.map(function(v) { return v.label + (v.phase ? '（' + v.phase + '）' : ''); }).join(' → '),
    nextVolumeHook: nextVolData.map(function(v) { return v.label + (v.phase ? '（' + v.phase + '）' : ''); }).join('')
  };
  return result;
}

// 提取角色关系张力线（从chars文本中）
function extractCharTensionLines(charsText) {
  if (!charsText) return [];
  var tensionLines = [];
  var relRE = /(?:张力|矛盾|冲突|敌对|暧昧|结盟|仇恨|情仇|恩怨)[：:][^。\n]{5,150}/g;
  var m;
  while ((m = relRE.exec(charsText)) !== null) {
    var line = m[0].trim();
    if (line.length > 10 && tensionLines.indexOf(line) === -1) tensionLines.push(line);
  }
  return tensionLines.slice(0, 10);
}

function buildWriteConsistencyBlock(work, chapterIdx) {
  var block = '【📋 全链路一致性锁 — 严禁违反以下设定！】\n';
  var hasAny = false;

  // 获取当前卷上下文（chapterIdx-aware）
  var volCtx = getCurrentVolumeContext(work, chapterIdx);

  // 提取势力、地区、关键名称
  if (work.world) {
    var worldText = work.world;
    var names = [];
    var fm = worldText.match(/势力[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (fm) names.push('势力：' + fm[1].trim().substring(0, 150));
    var rm = worldText.match(/(?:地理|地区|地域|场景)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (rm) names.push('地区：' + rm[1].trim().substring(0, 150));
    var lm = worldText.match(/(?:境界|等级|力量体系|修炼体系)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (lm) names.push('等级：' + lm[1].trim().substring(0, 150));
    var cm = worldText.match(/(?:核心矛盾|世界矛盾|主要冲突)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (cm) names.push('核心矛盾：' + cm[1].trim().substring(0, 120));
    var wr = worldText.match(/(?:运转|规则|禁忌|代价)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (wr) names.push('世界规则：' + wr[1].trim().substring(0, 120));
    if (names.length > 0) {
      block += '【世界观关键元素 — 正文必须遵守】\n';
      names.forEach(function(n) { block += '  · ' + n + '\n'; });
      hasAny = true;
    }
  }

  // 提取角色名列表 + 关键属性 + 关系张力线
  if (work.chars) {
    var charLines = work.chars.split('\n');
    var charNames = [];
    var charDetails = [];
    for (var ci = 0; ci < charLines.length; ci++) {
      var cl = charLines[ci].trim();
      var cm = cl.match(/^[>\s]*[【\[<]?(.+?)[】\]>]?\s*[：(]\s*(.+?)\s*[)）]/);
      if (cm) {
        charNames.push(cm[1].trim() + '（' + cm[2].trim().substring(0, 20) + '）');
        var next3 = charLines.slice(ci+1, ci+4).join(' ');
        var abilityMatch = next3.match(/(?:能力|境界|实力|修为|功法|身份)[：:]\s*(.{2,30})/);
        if (abilityMatch) {
          charDetails.push(cm[1].trim() + '：' + abilityMatch[1].trim().substring(0, 30));
        }
      }
    }
    var tensionLines = extractCharTensionLines(work.chars);
    if (charNames.length > 0) {
      block += '【人物关键元素 — 只能出现以下角色！】\n';
      var maxNames = charNames.slice(0, 20);
      maxNames.forEach(function(n) { block += '  · ' + n + '\n'; });
      if (charNames.length > 20) block += '  ...（共' + charNames.length + '人）\n';
      hasAny = true;
    }
    if (charDetails.length > 0) {
      block += '【人物能力/身份 — 正文必须一致】\n';
      charDetails.slice(0, 15).forEach(function(d) { block += '  · ' + d + '\n'; });
      hasAny = true;
    }
    if (tensionLines.length > 0) {
      block += '【人物关系张力线 — 这些矛盾必须在对手戏中体现】\n';
      tensionLines.slice(0, 6).forEach(function(t) { block += '  · ' + t + '\n'; });
      hasAny = true;
    }
  }

  // 提取大纲卷信息 + 当前卷上下文（基于chapterIdx）
  if (work.outline) {
    var volMatches = work.outline.match(/第[一二三四五六七八九十\d]+卷[：:]?[《「](.+?)[》」]/g);
    if (volMatches && volMatches.length > 0) {
      block += '【大纲卷结构 — 正文必须在当前卷范围内】\n';
      volMatches.slice(0, 10).forEach(function(vm) { block += '  · ' + vm + '\n'; });
      hasAny = true;
    }
    var mainGoal = work.outline.match(/(?:主线|核心目标|最终目标)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (mainGoal) {
      block += '【主线目标 — 每章必须推进】\n  · ' + mainGoal[1].trim().substring(0, 120) + '\n';
      hasAny = true;
    }
    if (volCtx.volumeLabel) {
      block += '【当前卷重点（' + volCtx.volumeLabel + '）】请严格遵循当前卷大纲中的核心冲突、阶段目标、核心事件和伏笔设计。\n';
      if (volCtx.prevVolumes) block += '  · 前置卷：' + volCtx.prevVolumes + '\n';
      hasAny = true;
    }
  }

  if (!hasAny) return '';
  block += '\n【强制规则 — 违反将导致读者体验崩塌】\n';
  block += '1. 上述名称已在设定中定稿，严禁编造新名字替代\n';
  block += '2. 角色的能力/境界/身份必须与设定一致，不能突然变强或变弱\n';
  block += '3. 世界观规则（力量体系、等级、禁忌、代价）必须遵守\n';
  block += '4. 每章必须推进主线目标，不能原地踏步\n';
  block += '5. 人物关系张力线（敌对/暧昧/恩怨）必须在对手戏中体现，不能视而不见\n';
  return block;
}


// ========== v57: 细纲按卷切分 + 当前卷精准提取 ==========
// 把细纲文本按【第X卷】标记切成卷块，返回数组 [{volLabel, volPhase, body}]
function parseDetailByVolume(work) {
  if (!work || !work.detail || !work.detail.trim()) return [];
  var text = work.detail;
  var volRE = /(第\s*[一二三四五六七八九十百零〇\d]+\s*[卷部])\s*[（(]?([^）)\n]{0,10})[）)]?\s*[：:]?\s*([\s\S]*?)(?=\n[^\n]{0,20}第\s*[一二三四五六七八九十百零〇\d]+\s*[卷部]|$)/gi;
  var result = [];
  var m;
  while ((m = volRE.exec(text)) !== null) {
    var label = m[1].replace(/\s+/g, '');  // e.g. 第1卷
    var phase = (m[2] || '').trim();
    var body = (m[3] || '').trim();
    if (body) result.push({ volLabel: label, volPhase: phase, body: body });
  }
  // 如果没切到卷，但内容存在，返回整个作为"单卷"
  if (result.length === 0 && text.trim()) {
    result.push({ volLabel: '第1卷', volPhase: '', body: text.trim() });
  }
  return result;
}

// 根据章节索引，返回当前卷的细纲内容（核心：AI 写第 N 章时，只看到本卷细纲）
// 同时返回：本卷所属卷号、相邻几章的细纲片段（作为上下文）
function getCurrentVolumeDetail(work, chapterIdx) {
  var vols = parseDetailByVolume(work);
  if (!vols.length) return { volLabel: '', volBody: '', neighbor: '', allVols: vols, currentIdx: 0 };

  // 估算每卷章节数
  var totalChapters = (work.chapters && work.chapters.length) ?
    Math.max(work.chapters.length, (chapterIdx || 0) + 1) :
    Math.max(30, (chapterIdx || 0) + 1);
  var volSize = Math.max(5, Math.ceil(totalChapters / vols.length));
  var currentVolIdx = Math.min(vols.length - 1, Math.floor((chapterIdx || 0) / volSize));
  var current = vols[currentVolIdx];

  // 前后几章的细纲片段（章节级）：从 body 中按 "第N章" 切分
  var neighborText = '';
  try {
    var chStart = currentVolIdx * volSize;
    var localIdx = (chapterIdx || 0) - chStart;  // 本卷中的第 localIdx 章
    var chRE = /(第\s*[\d一二三四五六七八九十百]+\s*[章章节回])/g;
    var chMatches = [];
    var cm;
    while ((cm = chRE.exec(current.body)) !== null) {
      chMatches.push({ title: cm[1], start: cm.index });
    }
    if (chMatches.length > 0) {
      var localChapterIdx = Math.min(chMatches.length - 1, localIdx);
      var startIdx = Math.max(0, localChapterIdx - 1);
      var endIdx = Math.min(chMatches.length - 1, localChapterIdx + 1);
      var segStart = chMatches[startIdx].start;
      var segEnd = endIdx + 1 < chMatches.length ? chMatches[endIdx + 1].start : current.body.length;
      neighborText = current.body.substring(segStart, segEnd).trim();
    } else {
      // 没切到章节标题，按字符窗口拿本卷中间部分
      var bodyLen = current.body.length;
      var segCenter = Math.floor(bodyLen * (Math.max(0, (chapterIdx % volSize) / volSize - 0.5) + 0.5));
      var segHalf = Math.min(2500, Math.floor(bodyLen / 2));
      neighborText = current.body.substring(Math.max(0, segCenter - segHalf), Math.min(bodyLen, segCenter + segHalf)).trim();
    }
  } catch(_e) {}

  return {
    volLabel: current.volLabel + (current.volPhase ? '（' + current.volPhase + '）' : ''),
    volBody: current.body,
    neighbor: neighborText,
    allVols: vols,
    currentIdx: currentVolIdx,
    volSize: volSize,
    volStartChapter: currentVolIdx * volSize + 1,
    volEndChapter: Math.min((currentVolIdx + 1) * volSize, totalChapters)
  };
}

// 大纲按卷切分：返回当前卷所属的大纲段落
function getCurrentOutlineVolume(work, chapterIdx) {
  if (!work || !work.outline || !work.outline.trim()) return { volLabel: '', body: '', phase: '' };
  var ctx = getCurrentVolumeContext(work, chapterIdx);
  return {
    volLabel: ctx.volumeLabel,
    body: (ctx.currentBody || '').trim(),
    prevVolumes: ctx.prevVolumes,
    nextVolumeHook: ctx.nextVolumeHook
  };
}

// ========== end v57 新增 ==========

// 根据模型上下文窗口动态计算架构内容截断上限
// 128K+ 模型：不截断，完整传架构；小模型：按比例
function getArchTruncationLimits() {
  var ctx = 131072;
  try { if (typeof getModelContextWindow === 'function') ctx = getModelContextWindow(); } catch(e) {}
  if (ctx >= 100000) {
    // 128K+ 模型：上下文足够大，不限制架构内容
    return null;
  }
  if (ctx >= 30000) {
    return { world: 50000, chars: 30000, outline: 40000, detail: 35000 };
  }
  // 8K-32K 模型
  return { world: 20000, chars: 15000, outline: 18000, detail: 15000 };
}

// 构建章节写作prompt
function buildChapterPrompt(work, chapterIdx, existingContent, userCommand) {
  const chTitle = work.chapters ? (work.chapters[chapterIdx] || {}).title || ('第' + (chapterIdx + 1) + '章') : ('第' + (chapterIdx + 1) + '章');
  const genre = getWorkGenre(work);
  
  // 获取流派专属 expertise
  const genreVal = (work.settings && work.settings.genre) || '';
  const genreInfo = (typeof NOVEL_GENRES !== 'undefined') ? NOVEL_GENRES[genreVal] : null;
  const expertisePrompt = genreInfo ? genreInfo.expertise : '';
  
  // 根据模型上下文窗口动态获取架构内容截断上限
  var archLimits = getArchTruncationLimits();
  
  // v54: 从记忆锚点中构建章节上下文块，替代原文注入
  let prevContent = '';
  if (chapterIdx > 0) {
    prevContent = buildChapterContextBlock(work, chapterIdx);
    if (!prevContent) {
      // 降级：如果记忆中没有上下文，用上一章原文尾部
      var raw = (work.chapters && work.chapters[chapterIdx - 1]) ? (work.chapters[chapterIdx - 1].content || '') : '';
      if (raw.length > 800) {
        // 800字足够衔接，对齐段落边界
        var tailStart = raw.length - 800;
        for (var scan = tailStart; scan < tailStart + 200 && scan < raw.length; scan++) {
          if (raw.substring(scan, scan + 2) === '\n\n') { tailStart = scan + 2; break; }
        }
        raw = raw.substring(tailStart);
      }
      if (raw) prevContent = '【上一章结尾（原文备选）】\n' + raw + '\n\n';
    }
  }
  
  let prompt = '你是一位顶级网文写手，拥有十年网文创作经验，深谙读者心理和商业写作技巧。你的文字让读者欲罢不能，每章结尾都让读者忍不住点"下一章"。\n\n';
  
  // ⚠️ 用户指令放在最前面，AI 第一眼看到，优先级最高
  if (userCommand && userCommand.trim()) {
    prompt += '══════════════════════════════════════\n';
    prompt += '【⚠️ 最高优先级 · 用户指令 · 必须首先执行】\n';
    prompt += userCommand.trim() + '\n';
    prompt += '══════════════════════════════════════\n\n';
  }
  
  if (expertisePrompt) {
    prompt += expertisePrompt + '\n\n';
  }
  prompt += '【作品】' + work.title + '\n';
  prompt += '【作品ID】' + (work.id || '') + '\n';
  prompt += '【作品指纹】' + getCurrentWorkFingerprint(work) + '\n';
  prompt += '【防串规则】本次写作只能服务于上述作品，禁止引用其他作品的人物、世界观、设定和剧情。\n';
  prompt += '【题材】' + genre + '\n';
  prompt += '【当前章节】' + chTitle + '（第' + (chapterIdx + 1) + '章）\n';
  prompt += '【写作身份】你不是在"生成文本"，你是在"经历故事"。写每个场景时，你就是那个角色，你在那个世界里，你看到、听到、感受到的是角色所感知的一切。你的笔触要让读者忘记自己在看小说。\n\n';

  // ===== v52: 角色代入 · 让AI成为角色，而非旁观者 =====
  if (work.chars) {
    // 提取主角核心信息
    var protagonistName = '';
    var protagonistProfile = '';
    var charLines = work.chars.split('\n');
    var inProt = false;
    for (var cli = 0; cli < charLines.length; cli++) {
      var line = charLines[cli];
      if (line.indexOf('主角') >= 0 && (line.indexOf('【') >= 0 || line.indexOf('[') >= 0)) {
        var nameMatch = line.match(/[【\[]([^】\]\n]{1,12})[】\]]/);
        if (nameMatch) protagonistName = nameMatch[1].trim();
        inProt = true;
        continue;
      }
      if (inProt) {
        if (line.indexOf('反派') >= 0 || line.indexOf('配角') >= 0 || line.indexOf('关系网') >= 0) break;
        protagonistProfile += line + '\n';
      }
    }
    if (!protagonistName && work.chars) {
      // 降级：取第一个角色名
      var firstMatch = work.chars.match(/[【\[]([^】\]\n]{1,12})[】\]]/);
      if (firstMatch) protagonistName = firstMatch[1].trim();
    }
    
    if (protagonistName) {
      prompt += '【⚠️ 角色代入 · 最高优先级 · 你即' + protagonistName + '】\n';
      prompt += '从现在开始，你不是在"写' + protagonistName + '的故事"，你就是' + protagonistName + '本人。\n\n';
      prompt += '【代入法则】\n';
      prompt += '1. 每一段叙述，都是' + protagonistName + '的眼睛在看、耳朵在听、皮肤在感受。你不是旁白，你是他的感官。\n';
      prompt += '2. 每一句对话，都是' + protagonistName + '的嘴巴在说。想清楚：他此刻是什么心情？他这样说话的目的是什么？\n';
      prompt += '3. 每一个动作，都是' + protagonistName + '的身体在做。想清楚：这个动作是他的习惯还是本能反应？\n';
      prompt += '4. 禁止跳到其他角色的内心。你能写的只有' + protagonistName + '能看到、听到、猜到的东西。\n';
      prompt += '5. ' + protagonistName + '不知道的事情，读者也不能从你的叙述中直接知道。只能通过线索暗示。\n\n';
      if (protagonistProfile.length > 20) {
        prompt += '【' + protagonistName + '的人设（请完全代入这些特质）】\n';
        prompt += protagonistProfile.substring(0, 600) + '\n\n';
      }
      prompt += '【代入自检 · 每写一段前自问】\n';
      prompt += '- ' + protagonistName + '现在是什么感觉？（不是"应该"什么感觉，是"真的"什么感觉）\n';
      prompt += '- ' + protagonistName + '现在最想要什么？他怕什么？\n';
      prompt += '- 如果我是' + protagonistName + '，我会怎么做？不是"主角应该怎么做"，是"我会怎么做"\n\n';
    }
  }
  
  // === v52: 注入上一章质量短板 + 用户编辑学习 + 自适应技法权重 ===
  if (typeof QualityEngine !== 'undefined') {
    // 1. 质量短板提示
    if (QualityEngine.lastHints) {
      var qResult = QualityEngine.lastHints(work, chapterIdx - 1);
      if (qResult && qResult.hints && qResult.hints.length) {
        prompt += '【⚠️ 上一章质量短板 · 本章必须补强 · 来自经验学习】\n';
        for (var qi = 0; qi < qResult.hints.length; qi++) {
          prompt += (qi + 1) + '. ' + qResult.hints[qi] + '\n';
        }
        prompt += '\n';
      }
    }
    
    // 2. 用户编辑学习（如果用户修改了上一章，学习用户偏好）
    if (QualityEngine.learnFromEdit && chapterIdx > 0 && work.chapters && work.chapters[chapterIdx - 1]) {
      var prevCh = work.chapters[chapterIdx - 1];
      if (prevCh._aiOriginal && prevCh.content && prevCh._aiOriginal !== prevCh.content) {
        var editLearnings = QualityEngine.learnFromEdit(prevCh._aiOriginal, prevCh.content);
        if (editLearnings && editLearnings.hasLearnings) {
          prompt += '【📝 用户编辑学习 · 根据你的修改习惯，AI 已调整写作策略】\n';
          if (editLearnings.userDeleted.length > 0) {
            prompt += '用户删除了以下内容，请避免：\n';
            for (var edi = 0; edi < editLearnings.userDeleted.length; edi++) {
              prompt += '  - ' + editLearnings.userDeleted[edi] + '\n';
            }
          }
          if (editLearnings.userAdded.length > 0) {
            prompt += '用户偏好以下风格，请强化：\n';
            for (var eai = 0; eai < editLearnings.userAdded.length; eai++) {
              prompt += '  + ' + editLearnings.userAdded[eai] + '\n';
            }
          }
          if (editLearnings.stylePrefs.moreDialog) prompt += '【偏好】用户喜欢更多对话，本章请增加人物互动和对话\n';
          if (editLearnings.stylePrefs.shorterParagraphs) prompt += '【偏好】用户喜欢更短的段落，本章请控制段落长度\n';
          if (editLearnings.stylePrefs.lessAdverbs) prompt += '【偏好】用户喜欢简洁描写，本章请减少副词使用\n';
          prompt += '\n';
        }
      }
    }
  }

  // === v52: 自适应技法权重 · 根据章节位置动态调整技法强调 ===
  var totalEst = Math.max(chapterIdx + 20, (work.chapters && work.chapters.length) || 30);
  var progressRatio = (chapterIdx + 1) / totalEst;
  prompt += '【自适应技法权重 · 本章所处阶段决定了核心任务】\n';
  if (progressRatio < 0.15) {
    // 早期章节：建立基础
    prompt += '【阶段：开篇铺设】本章核心任务：\n';
    prompt += '  权重5★：世界观自然展示（通过行动而非旁白）、主角人设立住（让读者记住主角是谁）\n';
    prompt += '  权重4★：悬念钩子设置（埋下让读者追读的钩子）、核心冲突引入（暗示主要矛盾方向）\n';
    prompt += '  权重3★：配角引入（至少让1-2个重要配角出场并留下印象）、场景氛围营造\n';
    prompt += '  警告：不要第一章就把所有设定倒出来，不要急于展示所有角色\n';
  } else if (progressRatio < 0.7) {
    // 中期章节：推进发展
    prompt += '【阶段：冲突推进】本章核心任务：\n';
    prompt += '  权重5★：冲突升级（至少推进一级冲突阶梯）、伏笔推进（至少推进1条已埋伏笔）\n';
    prompt += '  权重4★：角色成长（主角或关键配角的能力/认知/关系有可见变化）、反转设计（如果适合本章）\n';
    prompt += '  权重3★：信息密度（每500字至少1个信息点）、情感波动（情绪不能平铺直叙）\n';
    prompt += '  警告：避免连续3章无实质推进，避免配角突然消失\n';
  } else {
    // 后期章节：收束高潮
    prompt += '【阶段：高潮收束】本章核心任务：\n';
    prompt += '  权重5★：伏笔回收（回收至少1条重要伏笔，让读者有"原来如此"的震撼）\n';
    prompt += '  权重5★：冲突决战（至少有1条冲突线走向决战或收束）\n';
    prompt += '  权重4★：角色弧光收束（主角的核心弱点/执念被直面或被解决）\n';
    prompt += '  权重4★：情感收束（重要关系线走向结局或重大转变）\n';
    prompt += '  警告：不能草草收尾，每条重要线索都需要交代结局或开放式留白\n';
  }
  prompt += '\n';

  // === v56: 黄金开头专用模板 · 仅第一章 ===
  if (chapterIdx === 0) {
    prompt += '【🔥 黄金开头法则 · 第一章专用】\n';
    prompt += '你正在写的是第一章——这是决定读者是否继续读下去的唯一机会。\n\n';
    prompt += '【第一句法则】\n';
    prompt += '  第一句必须是动作或冲突，不能是环境描写，不能是"从前/在很久以前/这是一个世界"。\n';
    prompt += '  正确示范："血顺着剑刃滴在青石板上，第三滴落下时，他才发现自己还活着。"\n';
    prompt += '  错误示范："苍澜大陆，一个以武为尊的世界，强者如云，弱者如蝼蚁。"\n';
    prompt += '  错误示范："清晨的阳光透过窗棂，洒在少年清秀的脸上。"\n\n';
    prompt += '【身份锚定 · 200字内完成】\n';
    prompt += '  前200字必须让读者知道三件事：①主角是谁 ②什么处境（困境/危机）③想要什么。\n';
    prompt += '  不要用旁白介绍，要用行动展示。比如不说"他是废柴"，而写"他一拳打在测力石上，石头上浮现的数字让全场哄堂大笑"。\n\n';
    prompt += '【金手指亮相 · 1000字内完成】\n';
    prompt += '  金手指必须在1000字内亮相。亮相时要有三个要素：\n';
    prompt += '  ①触发条件（濒死/愤怒/意外/觉醒/穿越）→ ②能力展示（具体做了什么，不是"变强了"）→ ③读者爽点（全场震惊/打脸/逆袭/碾压）。\n';
    prompt += '  不要让主角"慢慢发现"金手指——读者没耐心等。\n\n';
    prompt += '【代入感建立 · 500字内完成】\n';
    prompt += '  前500字要让读者产生"这就是我"的代入感。方法：\n';
    prompt += '  ①从主角的感官出发（他看到什么、听到什么、闻到什么、感受到什么）\n';
    prompt += '  ②给主角一个读者能共情的起点：被看不起/被冤枉/被背叛/处于绝境/失去一切\n';
    prompt += '  ③不要写主角的"内心独白"——用动作和反应来传递情绪\n\n';
    prompt += '【信息控制 · 禁止倾倒】\n';
    prompt += '  第一章禁止：禁止大段世界观介绍（>50字即算大段）、禁止介绍超过3个角色、禁止解释力量体系、禁止"背景故事"闪回。\n';
    prompt += '  世界观要让读者通过主角的遭遇"感受到"，而不是"被告知"。\n\n';
    prompt += '【黄金开头检查清单 · 写完后自检】\n';
    prompt += '  ☐ 第一句是动作/冲突，不是描写/介绍\n';
    prompt += '  ☐ 200字内读者知道主角是谁、什么处境、想要什么\n';
    prompt += '  ☐ 500字内读者对主角产生共情/代入感\n';
    prompt += '  ☐ 1000字内金手指亮相（触发→展示→爽点）\n';
    prompt += '  ☐ 没有超过50字的世界观介绍段落\n';
    prompt += '  ☐ 第一章结尾有钩子，读者想知道"然后呢"？\n\n';
  }

  // ===== v52: AI 情感走向预测 · 基于大纲/细纲/前文，预测本章情感轨迹 =====
  prompt += '【⚠️ AI 情感走向预测 · 本章情感轨迹规划】\n';
  
  // 1. 从细纲/大纲中提取本章的情感关键词
  var emotionKeywords = [];
  var emoRE = /(紧张|刺激|热血|爽|燃|悲|虐|甜|暖|治愈|压抑|悬疑|恐惧|愤怒|感动|温馨|浪漫|搞笑|轻松|绝望|希望|仇恨|复仇|和解|离别|重逢|背叛|忠诚|牺牲|守护|成长|蜕变|觉醒|突破|压抑|释放|爆发|沉静|爆发|高潮|低谷|反转|震撼|震惊|意外|惊喜|温暖|冷酷|温柔|残忍|甜蜜|苦涩|心酸|感动|泪目|热血沸腾|毛骨悚然|不寒而栗|心惊肉跳|提心吊胆|如释重负|豁然开朗|柳暗花明)/g;
  var sourcesForEmo = [];
  if (work.detail) sourcesForEmo.push(work.detail);
  if (work.outline) sourcesForEmo.push(work.outline);
  for (var esi = 0; esi < sourcesForEmo.length; esi++) {
    var em;
    while ((em = emoRE.exec(sourcesForEmo[esi])) !== null) {
      if (emotionKeywords.indexOf(em[1]) === -1) emotionKeywords.push(em[1]);
    }
  }
  
  // 2. 从上一章结尾检测情绪状态（v54: 优先使用记忆中的情绪数据）
  var prevEmotion = '';
  try {
    initLongMemory(work);
    var ma2 = work.longMemory.memoryAnchors;
    if (Array.isArray(ma2.chapterContext) && ma2.chapterContext.length > 0) {
      var latestCtx = ma2.chapterContext[ma2.chapterContext.length - 1];
      if (latestCtx.chapterIdx === chapterIdx - 1 && latestCtx.emotion) {
        prevEmotion = latestCtx.emotion;
      }
    }
  } catch(e) {}
  // 降级：从 prevContent 文本中检测
  if (!prevEmotion && prevContent) {
    var prevTail = prevContent.slice(-400);
    if (/(怒|恨|杀|仇|血|碎|崩|裂|疯|狂|暴|戾|吼|咆哮|嘶吼)/.test(prevTail)) {
      prevEmotion = '高烈度负面情绪（愤怒/仇恨/狂暴）';
    } else if (/(哭|泪|泣|悲|伤|痛|绝望|失落|离别|死|亡|失去|离开|告别)/.test(prevTail)) {
      prevEmotion = '中烈度负面情绪（悲伤/失落/绝望）';
    } else if (/(笑|喜|乐|甜|暖|温馨|幸福|拥抱|和解|重逢|成功|突破|觉醒)/.test(prevTail)) {
      prevEmotion = '正面情绪（喜悦/温暖/成就）';
    } else if (/(疑|谜|暗|藏|隐|秘密|真相|揭露|发现|惊讶|意外|反转|突然|不对劲|奇怪|诡异)/.test(prevTail)) {
      prevEmotion = '悬疑/好奇（疑惑/期待揭示）';
    } else if (/(紧张|对峙|冲突|危险|危机|逼近|逼近|逼近|紧迫|千钧一发|一触即发)/.test(prevTail)) {
      prevEmotion = '紧张对峙（压力/危机感）';
    } else {
      prevEmotion = '中性/过渡（平和/铺垫）';
    }
  }
  
  // 3. 构建预测
  prompt += '上一章结尾情绪状态：' + (prevEmotion || '未知（首章或前文缺失）') + '\n';
  if (emotionKeywords.length > 0) {
    prompt += '大纲/细纲中检测到的情感关键词：' + emotionKeywords.slice(0, 8).join('、') + '\n';
  }
  prompt += '\n【情感轨迹预测 · 本章应走的情绪路径】\n';
  prompt += '请根据以上信息，规划本章的情感轨迹。推荐结构：\n';
  prompt += '  开篇（0-15%）：从前章情绪' + (prevEmotion ? '自然过渡' : '建立基调') + '，给读者一个"抓手"——明确本章即将面对什么情绪\n';
  prompt += '  发展（15-70%）：情绪逐步升温或转向。如果本章是"压抑→爆发"型，则发展段是压抑的积累；如果本章是"紧张→释然"型，则发展段是紧张的升级\n';
  prompt += '  高潮（70-85%）：本章情绪顶点。读者需要在此处感受到最强烈的情绪冲击\n';
  prompt += '  收束（85-100%）：情绪回落但不归零，为下一章留下情绪钩子。读者合上本章时最强烈的感觉是什么？\n\n';
  prompt += '【情感预测约束】\n';
  prompt += '1. 情绪不能断崖式跳变：如果上一章是悲伤，本章不能突然变成搞笑，除非有明确的情节过渡\n';
  prompt += '2. 每章至少有一个"情绪标志性瞬间"——读者读完本章后，会记住的那一个瞬间\n';
  prompt += '3. 情绪来源要具体：不是"主角很愤怒"，而是"因为XX事件，主角愤怒"\n';
  prompt += '4. 如果本章是"情感转折章"（如背叛/和解/觉醒），请把转折点放在70-85%的高潮位置\n';
  prompt += '5. 结尾情绪必须与下一章的开头有承接关系，不能是"情绪孤岛"\n\n';

  // === 题材硬约束（防跑题） ===
  prompt += getWriteConstraint(genre, work) + '\n';
  prompt += buildGenreWritingEngineV45(genre, work) + '\n';
  
  // === v47 创新维度引导（由 AI 根据章节内容智能选取） ===
  // 不再预随机选3个，而是让 AI 根据本章剧情内容自主判断哪些维度适用
  var ALL_DIMS = [
    {k:'A', t:'叙事视角翻新', d:'从一个非主角视角切入本章开头，如旁观者、对手、物品。给读者一个意想不到的观察角度，但不超过300字就切回主线。'},
    {k:'B', t:'反预期结果', d:'当前场景的观众预期是A结果，但实际发生的是B。B必须比A更合理、更有趣，而不是为了反转而反转。'},
    {k:'C', t:'信息不对等', d:'本章中至少一个场景里，读者比主角知道得多或知道得少，让读者紧张于主角即将踩到的陷阱，或困惑于主角为何做出看似错误的决定。'},
    {k:'D', t:'对话潜文本', d:'一场对话中，角色嘴上说A，实际意思是B。B不要通过内心独白解释，而是通过微妙动作或不自然的停顿来暗示。'},
    {k:'E', t:'环境即角色', d:'选取一个具体环境元素（天气、建筑、物品），让它在场景中产生实质影响——不是背景描写，而是改变角色行为或情节走向的变量。'},
    {k:'F', t:'节奏突变', d:'在连续几章的舒缓/紧张节奏后，本章做一次有准备的节奏转换。不是突兀反转，而是通过之前埋下的伏笔自然触发。'},
    {k:'G', t:'陌生化日常', d:'将原本熟悉的场景用陌生的方式呈现。比如一场日常对话通过非常规的方式展开（边跑边说、在黑暗中只闻其声、通过第三方转述）。'},
    {k:'H', t:'留白与信任', d:'本章至少有一处，不把角色的心理活动写出来，相信读者能通过角色的行为和之前的铺垫自行理解。'}
  ];

  prompt += '【创新维度指引 — 避免套路化】\n';
  prompt += '本章写作时，AI 应根据本章情节内容，自主判断以下哪些维度值得应用。无需全部使用，挑最合适的 1-2 个即可。\n\n';
  for (var di = 0; di < ALL_DIMS.length; di++) {
    prompt += ALL_DIMS[di].k + '. **' + ALL_DIMS[di].t + '**：' + ALL_DIMS[di].d + '\n\n';
  }
  prompt += '【重要】以上是参考菜单，AI 根据本章剧情自行判断哪些技巧能提升本章质量就用，哪些不适合本章就跳过。不要为了用技巧而扭曲叙事节奏。\n\n';

  // ===== v48: 人物弧光检查点 · 从人设中提取主角动机/弱点/弧光阶段，与本章位置对齐 =====
  if (work.chars) {
    // 提取主角核心信息（简单启发式：找"主角"标签附近的内容）
    var protagonistText = '';
    var charLines = work.chars.split('\n');
    var protFound = false;
    for (var pl = 0; pl < charLines.length; pl++) {
      if (charLines[pl].indexOf('主角') >= 0 || charLines[pl].indexOf('主角一') >= 0) protFound = true;
      if (protFound) {
        protagonistText += charLines[pl] + '\n';
        if (protFound && (charLines[pl].indexOf('反派') >= 0 || charLines[pl].indexOf('配角') >= 0 || charLines[pl].indexOf('关系网') >= 0)) break;
      }
    }
    if (protagonistText.length > 30) {
      // 计算本章在全书的大致位置（用于判断弧光阶段）
      var totalEst = Math.max(chapterIdx + 10, (work.chapters && work.chapters.length) || 20);
      var progressRatio = (chapterIdx + 1) / totalEst;
      var arcStage = progressRatio < 0.33 ? '早期：角色仍在起点状态，其弱点和执念尚未被强烈挑战' :
                     (progressRatio < 0.66 ? '中期：角色被推向极限，弱点被利用，执念开始动摇其判断' :
                      '后期：角色面临终极抉择，必须直面其最大恐惧/执念，弧光走向收束');

      prompt += '【⚠️ 人物弧光检查点 · 最高级搬运强度】\n';
      prompt += '本章主角（第' + (chapterIdx + 1) + '章）所处弧光阶段：' + arcStage + '\n';
      prompt += '从人设中提取的主角核心信息，请在写作中严格对齐：\n';
      prompt += (protagonistText.substring(0, 400) || '从人设中读取主角动机/弱点/执念') + '\n';
      prompt += '【写作时必须自问】\n';
      prompt += '1. 本章主角的动机是什么？它是被推进了，还是被暂时挫败了？\n';
      prompt += '2. 本章主角的弱点是否有体现（不是每次都要，但要知道他/她怕什么）？\n';
      prompt += '3. 本章是否触发了主角的执念？如何触发的？\n';
      prompt += '4. 本章的事件如何推动主角向弧光下一个阶段前进？\n';
      prompt += '5. 主角说话的语气、做决定的方式符合其人设吗？如果不符合，是情节需要吗？\n\n';
    }
  }

  // ===== v51: 角色声纹卡 · 从人设中提取所有角色说话风格，确保对话有区分度 =====
  if (work.chars) {
    // 提取所有角色信息：姓名、口头禅、性格关键词、说话风格
    var voiceCards = [];
    var charBlockRE = /[【\[]([^】\]\n]+)[】\]]\s*[：:]/g;
    var cbMatch;
    var charBlocks = [];
    var lastIdx = 0;
    while ((cbMatch = charBlockRE.exec(work.chars)) !== null) {
      if (lastIdx > 0) charBlocks.push({ name: '', text: work.chars.substring(lastIdx, cbMatch.index) });
      lastIdx = cbMatch.index;
    }
    if (lastIdx > 0) charBlocks.push({ name: '', text: work.chars.substring(lastIdx) });
    
    // 更稳健的提取：按【角色名】切分
    var charSegRE = /[【\[]([^】\]\n]{1,12})[】\]]\s*[：:]?\s*/g;
    var segMatch;
    var segments = [];
    var prevEnd = 0;
    while ((segMatch = charSegRE.exec(work.chars)) !== null) {
      if (segments.length > 0) {
        segments[segments.length - 1].text = work.chars.substring(segments[segments.length - 1].start, segMatch.index);
      }
      segments.push({ name: segMatch[1].trim(), start: segMatch.index + segMatch[0].length });
      prevEnd = segMatch.index + segMatch[0].length;
    }
    if (segments.length > 0) {
      segments[segments.length - 1].text = work.chars.substring(segments[segments.length - 1].start);
    }
    
    // 从每个角色片段中提取说话风格关键词
    for (var si = 0; si < segments.length && voiceCards.length < 8; si++) {
      var seg = segments[si];
      if (!seg.name || seg.name === '关系网' || seg.name === '年龄' || seg.name === '外貌') continue;
      var segText = seg.text || '';
      if (segText.length < 10) continue;
      
      // 提取口头禅
      var catchphrases = [];
      var cpRE = /口头禅[：:]\s*([^。\n]{2,30})/g;
      var cpMatch;
      while ((cpMatch = cpRE.exec(segText)) !== null) {
        var cp = cpMatch[1].trim();
        if (cp && catchphrases.indexOf(cp) === -1) catchphrases.push(cp);
      }
      
      // 提取性格关键词
      var personalityKW = [];
      var persRE = /性格[：:]\s*([^。\n]{2,60})/g;
      var persMatch;
      while ((persMatch = persRE.exec(segText)) !== null) {
        personalityKW.push(persMatch[1].trim());
      }
      // 也提取"特征"标签
      var traitRE = /(特征|标签|定位)[：:]\s*([^。\n]{2,60})/g;
      var traitMatch;
      while ((traitMatch = traitRE.exec(segText)) !== null) {
        personalityKW.push(traitMatch[2].trim());
      }
      
      // 提取说话风格
      var speechStyle = '';
      var styleRE = /(说话风格|语气|腔调|语言风格)[：:]\s*([^。\n]{2,60})/g;
      var styleMatch = styleRE.exec(segText);
      if (styleMatch) speechStyle = styleMatch[2].trim();
      
      // 构建角色声纹卡（精简版，每个角色 2-3 行）
      var card = seg.name;
      if (catchphrases.length) card += ' | 口头禅：' + catchphrases.slice(0, 2).join('、');
      if (personalityKW.length) card += ' | ' + personalityKW.slice(0, 2).join('、');
      if (speechStyle) card += ' | 说话风格：' + speechStyle;
      
      voiceCards.push(card);
    }
    
    if (voiceCards.length > 0) {
      prompt += '【⚠️ 角色声纹卡 · 对话差异化 · 每个角色必须用不同腔调说话】\n';
      prompt += '以下是人设中提取的各角色说话风格。写作时，每个角色的对话必须符合其声纹：\n\n';
      for (var vi = 0; vi < voiceCards.length; vi++) {
        prompt += '  • ' + voiceCards[vi] + '\n';
      }
      prompt += '\n【声纹约束】\n';
      prompt += '1. 每段对话写完后，自问：这句话换一个角色来说，会不会听起来一模一样？如果是，重写。\n';
      prompt += '2. 将军说话短促有力，书生说话引经据典，武者说话粗犷直接，谋士说话迂回保留。\n';
      prompt += '3. 主角的说话方式必须与其他人形成鲜明对比，让读者不看"XX说"也能分辨谁在说话。\n';
      prompt += '4. 不同身份的角色用词档次不同：市井角色用俚语俗语，贵族角色用正式措辞，修行者用特定术语。\n\n';
    }
  }

  // ===== v51: 伏笔闭环管理 · 三阶段追踪（埋→推进→回收）+ 自动提取前文章节中的伏笔 =====
  if (work.detail || work.outline) {
    var foreshadowingHints = [];
    var foreshadowRE = /【[^】]*伏笔[^】]*】/g;
    if (work.detail) {
      var fmatches = work.detail.match(foreshadowRE);
      if (fmatches) fmatches.forEach(function (m) { if (foreshadowingHints.indexOf(m) === -1) foreshadowingHints.push(m); });
    }
    if (work.outline) {
      var omatches = work.outline.match(foreshadowRE);
      if (omatches) omatches.forEach(function (m) { if (foreshadowingHints.indexOf(m) === -1) foreshadowingHints.push(m); });
    }
    // 提取"伏笔"二字前后的关键句子
    var hintSentences = [];
    var sources = [work.detail, work.outline];
    for (var si = 0; si < sources.length; si++) {
      if (!sources[si]) continue;
      var sentRE = /[^。\n]{0,50}伏笔[^。\n]{0,80}[。\n]/g;
      var sm;
      while ((sm = sentRE.exec(sources[si])) !== null) {
        var s = sm[0].trim();
        if (s.length > 15 && hintSentences.indexOf(s) === -1 && hintSentences.length < 6) hintSentences.push(s);
      }
    }
    // 提取"悬念/坑/暗示/揭秘"等伏笔相关线索
    var broaderHints = [];
    var broadRE = /[^。\n]{0,40}(悬念|揭秘|暗线|铺垫|暗示|隐藏|秘密|真相|不为人知|疑点|谜团|未解|坑)[^。\n]{0,80}[。\n]/g;
    for (var bsi = 0; bsi < sources.length; bsi++) {
      if (!sources[bsi]) continue;
      var bm;
      while ((bm = broadRE.exec(sources[bsi])) !== null) {
        var bs = bm[0].trim();
        if (bs.length > 15 && broaderHints.indexOf(bs) === -1 && broaderHints.length < 8) broaderHints.push(bs);
      }
    }
    
    // 从已写章节中提取未解决的伏笔（悬而未决的线索）
    var unresolvedForeshadow = [];
    if (work.chapters && chapterIdx > 0) {
      for (var ci = 0; ci < chapterIdx && unresolvedForeshadow.length < 5; ci++) {
        var chContent = (work.chapters[ci] || {}).content || '';
        if (!chContent) continue;
        var chTitlePrev = (work.chapters[ci] || {}).title || ('第' + (ci + 1) + '章');
        var unfResRE = /[^。\n]{0,40}(伏笔|悬念|暗线|未解|隐藏|秘密|疑点|谜团|暗示|铺垫|留白|待续|未完|后文|揭露|真相|揭开|谜底|反转|惊人|秘密武器|隐藏实力|真正身份|背后|幕后|另有隐情|深藏|不为人知|暗中|潜伏|暗藏|潜在|隐患|未完成|未完待续|尚有|仍有|还未|尚未|有待|等待|将来|日后|早晚|迟早|终将|必定|当然|后话|暂且|暂且不提|暂且不表|话分两头|埋在|暗线|这条线|这条伏|这条暗|这条线|线头|尾巴|钩子|扣子|疑问|问题|谜|坑)[^。\n]{0,100}[。\n]/g;
        var ufMatch;
        while ((ufMatch = unfResRE.exec(chContent)) !== null) {
          var uf = ufMatch[0].trim();
          if (uf.length > 15 && unresolvedForeshadow.indexOf(uf) === -1 && unresolvedForeshadow.length < 5) {
            unresolvedForeshadow.push({ text: uf, chapter: chTitlePrev });
          }
        }
      }
    }
    
    if (foreshadowingHints.length > 0 || hintSentences.length > 0 || broaderHints.length > 0 || unresolvedForeshadow.length > 0) {
      prompt += '【⚠️ 伏笔闭环管理 · 三阶段追踪（埋→推进→回收）】\n\n';
      
      // 阶段一：已埋伏笔（从大纲/细纲中提取）
      var planted = foreshadowingHints.length > 0 ? foreshadowingHints.slice(0, 5) : 
                    (hintSentences.length > 0 ? hintSentences.slice(0, 3) : broaderHints.slice(0, 3));
      if (planted.length > 0) {
        prompt += '【阶段一 · 已埋伏笔】（需要在后续章节中推进）\n';
        for (var pi = 0; pi < planted.length; pi++) {
          prompt += '  埋-' + (pi + 1) + '. ' + (typeof planted[pi] === 'string' ? planted[pi] : planted[pi].text || planted[pi]) + '\n';
        }
        prompt += '\n';
      }
      
      // 阶段二：未解决伏笔（从前文章节中自动提取的悬而未决线索）
      if (unresolvedForeshadow.length > 0) {
        prompt += '【阶段二 · 推进中/待推进】（前文章节中悬而未决的线索，本章应推进或暗示）\n';
        for (var ufi = 0; ufi < unresolvedForeshadow.length; ufi++) {
          prompt += '  → 第' + unresolvedForeshadow[ufi].chapter + '遗留：' + unresolvedForeshadow[ufi].text + '\n';
        }
        prompt += '\n';
      }
      
      // 阶段三：待回收伏笔（本章需要推进或回收的伏笔）
      var toResolve = broaderHints.length > 0 ? broaderHints.slice(0, 4) : hintSentences.slice(0, 4);
      if (toResolve.length > 0) {
        prompt += '【阶段三 · 待回收/可推进】（本章可推进或回收的伏笔线索）\n';
        for (var ri = 0; ri < toResolve.length; ri++) {
          prompt += '  收-' + (ri + 1) + '. ' + (typeof toResolve[ri] === 'string' ? toResolve[ri] : toResolve[ri].text || toResolve[ri]) + '\n';
        }
        prompt += '\n';
      }
      
      prompt += '【伏笔写作指令】\n';
      prompt += '1. 本章必须至少推进 1 条"已埋伏笔"，让读者看到线索在慢慢展开（推进 = 给出新信息但不揭底）\n';
      prompt += '2. 如果本章位置适合回收某条伏笔（如本卷结尾），则回收它并让读者产生"原来如此"的震撼感\n';
      prompt += '3. 本章结束后必须埋下至少 1 条新伏笔（可以是新悬念、新谜团、新矛盾），为后续章节制造期待\n';
      prompt += '4. 伏笔回收要有"延迟满足"：埋下后至少隔 3-5 章再回收，回收时必须有"原来如此"的爽感\n';
      prompt += '5. 禁止在本章同时埋下并回收同一条伏笔——那是"假伏笔"，读者会感觉被耍\n\n';
    }
  }

  // === 前置设定一致性（强制引用已有名称） ===
  var consBlock = buildWriteConsistencyBlock(work, chapterIdx);
  if (consBlock) prompt += consBlock + '\n';
  var chainLock = buildFullChainLock(work, chapterIdx);
  if (chainLock) prompt += chainLock + '\n';
  // === 架构模块记忆锚点（与架构生成页使用同一套记忆精要，强一致性约束） ===
  try {
    if (work.longMemory && work.longMemory.moduleSummaries) {
      var sums = work.longMemory.moduleSummaries;
      var keys = Object.keys(sums).filter(function(k){ return sums[k] && sums[k].trim(); });
      if (keys.length > 0) {
        var sumLabels2 = {world:'世界观',chars:'人设',outline:'大纲',detail:'细纲'};
        var sumLimits2 = {world:1500,chars:1200,outline:1200,detail:1000};
        var sumCtx = '【📐 已确立的核心设定 — AI提炼的记忆精要，必须严格遵守，不得矛盾、不得编造新的核心人物/势力/地名】\n';
        for (var ki2 = 0; ki2 < keys.length; ki2++) {
          var km2 = keys[ki2];
          var label2 = sumLabels2[km2] || km2;
          var limit2 = sumLimits2[km2] || 1000;
          sumCtx += '【' + label2 + '】\n' + smartTruncate(sums[km2].trim(), limit2) + '\n\n';
        }
        prompt += sumCtx.trim() + '\n';
      }
    }
  } catch(e){}

  // ===== v50: 白金作家法则注入（随机10条，核心6条必选） =====
  var platinumRules = getPlatinumRulesHint(work);
  if (platinumRules) {
    prompt += '【白金作家创作法则（核心10条必选 + 2条随机）】\n' + platinumRules + '\n\n';
  }

  // ===== v48: 世界观规则自证（让写作前主动验证是否违反世界观规则）=====
  // 优先级：longMemory.moduleSummaries > work.world 原文；文本上限大幅降低，避免 token 浪费
  var worldContent = '';
  try {
    if (work.longMemory && work.longMemory.moduleSummaries && work.longMemory.moduleSummaries.world) {
      worldContent = work.longMemory.moduleSummaries.world.trim();
    }
  } catch(_e) {}
  if (!worldContent && work.world) worldContent = work.world;
  if (worldContent && worldContent.length > 200) {
    // 只保留精华，不做全量注入
    var worldInjected = worldContent.length > 3000 ? worldContent.substring(0, 3000) + '...' : worldContent;
    prompt += '【世界观设定】\n' + worldInjected + '\n\n';
    // 从世界观中提取"规则/代价/限制"关键词附近的句子
    var ruleRE = /[^。\n]{0,40}(代价|规则|限制|不能|不可|必须|才能|除非|体系|等级)[^。\n]{0,120}[。\n]/g;
    var rules = [];
    var rm;
    while ((rm = ruleRE.exec(worldContent)) !== null) {
      var r = rm[0].trim();
      if (r.length > 20 && rules.indexOf(r) === -1 && rules.length < 4) rules.push(r);
    }
    if (rules.length > 0) {
      prompt += '【⚠️ 世界观规则自证 · 写作前请先确认以下规则】\n';
      for (var ri = 0; ri < rules.length; ri++) {
        prompt += '- ' + (ri + 1) + '. ' + rules[ri] + '\n';
      }
      prompt += '【写作时必须遵守】本章的人物行为/能力/社会反应是否符合上述规则？若不符合，是否有合理的解释或情节需要？\n\n';
    }
  }
  // 人物设定：优先 moduleSummaries 摘要，次选原文截断
  var charsContent = '';
  try {
    if (work.longMemory && work.longMemory.moduleSummaries && work.longMemory.moduleSummaries.chars) {
      charsContent = work.longMemory.moduleSummaries.chars.trim();
    }
  } catch(_e2) {}
  if (!charsContent && work.chars) charsContent = work.chars;
  if (charsContent && charsContent.length > 100) {
    var charsInjected = charsContent.length > 2500 ? charsContent.substring(0, 2500) + '...' : charsContent;
    prompt += '【人物人设】\n' + charsInjected + '\n\n';
  }
  
  // ===== v52: 素材库 · 从 work.materialLib 读取（AI 提取的 12 类结构化素材） =====
  if (work.materialLib && work.materialLib.categories) {
    var cats = work.materialLib.categories;
    var catNames = ['地名/地点', '势力/组织', '功法/技能', '道具/物品', '货币/资源', '修炼等级', '特殊称谓', '时间单位', '文化习俗', '种族/物种', '法则/规则', '其他'];
    var catKeys = ['places', 'factions', 'skills', 'items', 'currency', 'levels', 'titles', 'timeUnits', 'customs', 'races', 'rules', 'other'];
    var hasContent = false;
    for (var cki = 0; cki < catKeys.length; cki++) {
      if (cats[catKeys[cki]] && cats[catKeys[cki]].length > 0) { hasContent = true; break; }
    }
    if (hasContent) {
      prompt += '【📦 素材库 · 从设定中 AI 提取的可复用元素 · 本章必须使用具体名称，禁止泛称】\n';
      for (var cki = 0; cki < catKeys.length; cki++) {
        var items = cats[catKeys[cki]];
        if (!items || !items.length) continue;
        var names = [];
        for (var ii = 0; ii < items.length; ii++) {
          if (typeof items[ii] === 'string') {
            names.push(items[ii]);
          } else if (items[ii] && items[ii].name) {
            names.push(items[ii].name + (items[ii].desc ? '（' + items[ii].desc + '）' : ''));
          }
        }
        if (names.length > 0) {
          prompt += '  ' + catNames[cki] + '：' + names.join('、') + '\n';
        }
      }
      prompt += '【素材库使用规则】\n';
      prompt += '1. 写作时角色名、地名、势力名、功法名必须从素材库中选取，禁止凭空编造新名称\n';
      prompt += '2. 如果确实需要新元素（如新地点、新势力），必须在细纲中事先定义，不可以临时编造\n';
      prompt += '3. 同一地名/势力名在前文出现过的，后文必须保持一致（包括全称/简称/别称）\n';
      prompt += '4. 功法/技能的使用必须符合世界观设定的等级体系和代价规则\n\n';
    }
  } else {
    // 降级：用正则从设定中提取（旧版兼容，素材库未提取时使用）
    var materialLib = {};
    var allArchText = (work.world || '') + '\n' + (work.chars || '') + '\n' + (work.outline || '');
    var placeRE = /[【\[]?([^】\]\n]{2,8}(?:城|镇|村|谷|山|海|河|域|界|殿|宫|府|阁|楼|堂|院|塔|林|原|漠|岛|州|国|郡|都|堡|寨|关|崖|渊|洞|窟|峰|岭|湖|江|泽|墟))[】\]]?/g;
    var places = [];
    var pm;
    while ((pm = placeRE.exec(allArchText)) !== null) {
      var p = pm[1];
      if (p.length >= 2 && places.indexOf(p) === -1 && places.length < 15) places.push(p);
    }
    if (places.length) materialLib.places = places;
    var factionRE = /[【\[]?([^】\]\n]{2,8}(?:宗|门|派|教|会|盟|帮|族|家|国|朝|军|团|队|组|殿|阁|楼|府|堂|院|塔|谷|山|岛|堡|城|坊|司|局|卫|营|旗|舵|坛|社|联|党|部|处|所|馆|斋|居|轩|苑|园|庄|店|铺|行|号|坊))[】\]]?/g;
    var factions = [];
    var fm;
    while ((fm = factionRE.exec(allArchText)) !== null) {
      var f = fm[1];
      if (f.length >= 2 && factions.indexOf(f) === -1 && factions.length < 12) factions.push(f);
    }
    if (factions.length) materialLib.factions = factions;
    var skillRE = /[【\[]?([^】\]\n]{2,10}(?:功|法|诀|术|技|式|剑|刀|拳|掌|指|腿|步|身法|心法|功法|秘籍|神通|秘术|禁术|奥义|绝学|传承|血脉|天赋|能力|异能|灵力|斗气|魔法|仙术|道法|佛法|巫术|诅咒|契约|炼金|符文|阵法|炼丹|炼器|御兽|召唤|附魔|铭文|图腾|灵根|武魂|魂环|魂骨|领域|法则|大道|天道|仙道|魔道|妖道|鬼道|神道|武道|剑道|刀道|拳道|掌道|指道|丹道|器道|阵道|符道|咒道|蛊道|毒道|医道|幻道|梦道|时道|空道|生道|死道|因果|轮回|命运|气运|功德|业力|灵力|真气|元气|仙气|魔气|妖气|鬼气|神气|龙气|凤气|灵气|斗气|霸气|杀气|剑气|刀气|拳意|掌意|指意|意境|奥义|领域|法则))[】\]]?/g;
    var skills = [];
    var skm;
    while ((skm = skillRE.exec(allArchText)) !== null) {
      var sk = skm[1];
      if (sk.length >= 2 && skills.indexOf(sk) === -1 && skills.length < 15) skills.push(sk);
    }
    if (skills.length) materialLib.skills = skills;
    var matKeys = Object.keys(materialLib);
    if (matKeys.length > 0) {
      prompt += '【📦 素材库（正则提取，建议在架构页使用 AI 提取获得更准确的素材库）】\n';
      if (materialLib.places) prompt += '  地名：' + materialLib.places.join('、') + '\n';
      if (materialLib.factions) prompt += '  势力/组织：' + materialLib.factions.join('、') + '\n';
      if (materialLib.skills) prompt += '  功法/技能：' + materialLib.skills.join('、') + '\n';
      prompt += '【素材库使用规则】\n';
      prompt += '1. 写作时角色名、地名、势力名、功法名必须从素材库中选取，禁止凭空编造新名称\n';
      prompt += '2. 如果确实需要新元素，必须在细纲中事先定义\n\n';
    }
  }
  // ===== v57: 大纲按卷注入 — 不再塞入全书大纲，只注入当前卷目标 + moduleSummaries 摘要 =====
  var outlineInjected = false;
  // 1. 先尝试从 moduleSummaries 取大纲摘要（覆盖全书主线）
  var outlineSum = '';
  try {
    if (work.longMemory && work.longMemory.moduleSummaries && work.longMemory.moduleSummaries.outline) {
      outlineSum = work.longMemory.moduleSummaries.outline.trim();
    }
  } catch(_e3) {}
  // 2. 再取当前卷大纲（覆盖本卷具体事件）
  var outlineVol = getCurrentOutlineVolume(work, chapterIdx);
  if (outlineSum || outlineVol.body) {
    if (outlineSum && outlineSum.length > 200) {
      var outlineSumInjected = outlineSum.length > 2500 ? outlineSum.substring(0, 2500) + '...' : outlineSum;
      prompt += '【全书大纲摘要（主线/伏笔/卷结构）】\n' + outlineSumInjected + '\n\n';
      outlineInjected = true;
    }
    if (outlineVol.body && outlineVol.body.length > 100) {
      var curVolOut = outlineVol.body.length > 3500 ? outlineVol.body.substring(0, 3500) + '...' : outlineVol.body;
      prompt += '【当前卷大纲：' + (outlineVol.volLabel || ('第' + (Math.floor((chapterIdx || 0) / 50) + 1) + '卷')) + '】\n' + curVolOut + '\n';
      if (outlineVol.prevVolumes) prompt += '【已完结卷】' + outlineVol.prevVolumes + '\n';
      if (outlineVol.nextVolumeHook) prompt += '【下一卷钩子】' + outlineVol.nextVolumeHook + '\n';
      prompt += '\n';
      outlineInjected = true;
    }
    // 3. 兜底：如果没切到卷，则用完整大纲但截断上限
    if (!outlineInjected && work.outline) {
      var fallback = work.outline.length > 2000 ? work.outline.substring(0, 2000) + '...' : work.outline;
      prompt += '【全书大纲】\n' + fallback + '\n\n';
    }
  } else if (work.outline) {
    var fallback2 = work.outline.length > 2000 ? work.outline.substring(0, 2000) + '...' : work.outline;
    prompt += '【全书大纲】\n' + fallback2 + '\n\n';
  }

  // ===== v57: 细纲按卷注入 — 只让 AI 看到本卷细纲 + 本章相邻几章 =====
  // 好处：(a) token 用量大幅降低 (b) 聚焦本卷剧情，不易串到其他卷 (c) 仍能看到本章的具体设计
  if (work.detail) {
    var detailVol = getCurrentVolumeDetail(work, chapterIdx);
    var hasDetail = detailVol && detailVol.volBody;

    if (hasDetail) {
      // 注入：本卷细纲全文（上限 5000 字，一卷足够）
      var volDetailText = detailVol.volBody.length > 5000
        ? detailVol.volBody.substring(0, 5000) + '...(本卷细纲过长，已截断)'
        : detailVol.volBody;

      prompt += '【📑 当前卷细纲：' + (detailVol.volLabel || '本卷') + '（第' + (detailVol.volStartChapter || 1) + '-' + (detailVol.volEndChapter || detailVol.volSize || '?') + '章）】\n';
      prompt += volDetailText + '\n\n';

      // 如果切到了相邻几章的片段，再强调这几章
      if (detailVol.neighbor && detailVol.neighbor.trim()) {
        var neighborLimit = detailVol.neighbor.length > 2500
          ? detailVol.neighbor.substring(0, 2500) + '...'
          : detailVol.neighbor;
        prompt += '【⚠️ 本章前后几章细纲（剧情锚点）】\n' + neighborLimit + '\n\n';
      }

      prompt += '【核心指令 · 细纲最高优先级】\n';
      prompt += '你当前要写的章节是：「' + chTitle + '」（第' + (chapterIdx + 1) + '章）。\n';
      prompt += '1. 从上面的【当前卷细纲】中找到「第' + (chapterIdx + 1) + '章」或「' + chTitle + '」对应的剧情节点，【严格按那部分来写】——场景、人物、剧情节点、爆点/悬念钩子不能改动\n';
      prompt += '2. 绝对不要写细纲中其他卷的剧情；不要提前透露后续卷的内容\n';
      prompt += '3. 如果细纲中找不到「第' + (chapterIdx + 1) + '章」的明确标注，就顺着细纲的节奏写本卷中合适位置的一段剧情\n';
      prompt += '4. 细纲中的"爆点/悬念钩子"字段是本章结尾钩子，请务必写出来\n';
      prompt += '5. 细纲中的"场景"字段是本章时间地点锚点，【必须严格遵守】\n';
      prompt += '6. 细纲中的"人物"字段是本章登场角色名单，【不能编造新角色】\n';
      prompt += '7. 字数灵活控制，以剧情完整性为先，不少于4000字，可根据需要写至8000-15000字\n\n';
    } else {
      // 兜底：细纲没分卷，直接按章节标题精准匹配 + 大幅截断
      var detailText = work.detail;
      if (archLimits && detailText.length > archLimits.detail) {
        var idxInDetail = detailText.indexOf(chTitle);
        if (idxInDetail >= 0) {
          var dStart = Math.max(0, idxInDetail - 3000);
          var dEnd = Math.min(detailText.length, idxInDetail + Math.floor(archLimits.detail * 0.6));
          detailText = '...(前略)\n' + detailText.substring(dStart, dEnd) + '\n(后略)...';
        } else {
          detailText = detailText.substring(0, 8000) + '...(细纲过长已截断)';
        }
      } else if (detailText.length > 10000) {
        detailText = detailText.substring(0, 10000) + '...(细纲过长已截断)';
      }
      prompt += '【📑 细纲摘要】\n' + detailText + '\n\n';
      prompt += '【核心指令 · 细纲最高优先级】\n';
      prompt += '你当前要写的章节是：「' + chTitle + '」（第' + (chapterIdx + 1) + '章）。\n';
      prompt += '1. 从细纲中找到「' + chTitle + '」对应的剧情节点，【严格按那部分来写】\n';
      prompt += '2. 细纲中的"爆点/悬念钩子"字段是本章结尾钩子，请务必写出来\n';
      prompt += '3. 细纲中的"场景""人物"字段是锁定信息，【不得编造】\n';
      prompt += '4. 字数灵活控制，以剧情完整性为先，不少于4000字，可根据需要写至8000-15000字\n\n';
    }
  }
  
  // 注入longMemory上下文（替代旧的 getMemoryText）
  const memoryContext = buildMemoryContext(work, chapterIdx);
  if (memoryContext) {
    prompt += memoryContext + '\n';
    prompt += '【重要·记忆一致性指令】\n';
    prompt += '1. 人物状态必须与上述记忆一致：受伤的角色不能突然完好，已死亡的角色不能复活，已离开的角色不能凭空出现\n';
    prompt += '2. 关系变化必须承接：已结盟的角色不能无故敌对，已决裂的角色不能突然亲密，必须写出转变过程\n';
    prompt += '3. 道具归属必须正确：谁拿着什么、谁丢了什么、谁欠了什么，后文必须一致\n';
    prompt += '4. 伏笔和承诺必须推进：未解的伏笔要逐步揭示，未兑现的承诺要安排兑现或制造障碍\n';
    prompt += '5. 能力代价必须体现：角色使用能力后必须承受相应代价，不能无限开挂\n';
    prompt += '6. 情绪轨迹必须连贯：角色的情绪不能无故跳变，必须与前章的情绪状态有承接\n\n';
  }
  
  if (prevContent) {
    prompt += prevContent;
  }
  
  // 注入章节卡数据
  if (work._chapterCards && work._chapterCards['ch_' + chapterIdx]) {
    var chCard = work._chapterCards['ch_' + chapterIdx];
    if (typeof chapterCardToText === 'function') {
      var chCardText = chapterCardToText(chCard);
      if (chCardText) {
        prompt += '【章节卡（结构锁定）】\n' + chCardText + '\n';
        prompt += '⚠️ 上一行【章节卡】中的内容为结构锁定信息，本章必须严格遵循：时间地点不可更改，本章目的不可偏离，强制剧情节点不可跳过。\n\n';
      }
    }
  }
  
  if (existingContent && existingContent.trim()) {
    prompt += '【本章已写内容】\n' + existingContent + '\n\n';
    prompt += '【指令】请基于细纲中「' + chTitle + '」的剧情要点，续写并完善本章内容，与已有内容自然衔接。字数灵活控制，以剧情完整性为先，不少于4000字，可根据需要写至8000-15000字。\n';
  } else {
    prompt += '【指令】请根据细纲中「' + chTitle + '」的剧情要点，撰写完整章节内容。字数灵活控制，以剧情完整性为先，不少于4000字，可根据需要写至8000-15000字。';
    if (prevContent) prompt += '开头要承接上一章结尾。';
  }
  
  prompt += '\n\n要求：\n';
  prompt += '1. 只写「' + chTitle + '」这一章的内容，绝对不要写到下一章的剧情\n';
  prompt += '2. 严格按照细纲中「' + chTitle + '」的剧情要点展开，不要偏离\n';
  prompt += '3. 使用具体的角色名、地名、势力名，不要用泛称\n';
  prompt += '4. 写作时找到本章独有的叙事节奏——紧张处紧凑有力，沉思处可以适当舒展，避免全程匀速\n';
  prompt += '5. 章节结尾留悬念或钩子，但不要开始下一章的剧情\n';
  prompt += '6. 直接输出正文，不要加章节标题、不要解释\n';
  prompt += '7. 【人物声音差异化】不同角色说话必须有区分度——用词习惯、句子长短、语气助词、口头禅各不相同。禁止所有角色用同一种腔调说话\n';
  prompt += '8. 【场景五感】每个新场景至少激活2种感官（视觉+听觉/嗅觉/触觉/味觉），不要只写"看到了什么"\n';
  prompt += '9. 【信息密度】每500字至少推进1个信息点（新事实/新线索/新关系/新能力），禁止连续500字纯描写或纯对话无信息推进\n';
  prompt += '10. 【因果链】本章的每个事件必须有前因后果——要么承接前文，要么为本章后续事件铺垫，禁止无因果的事件发生\n';

  // === 90分达成技法：冰山对话（强制执行，不是可选项）===
  prompt += '\n\n【⚠️ 核心技法·冰山对话（90分门槛）】\n';
  prompt += '以下4条技法必须在本章中执行，每条至少体现一次。没有借口的硬性要求：\n\n';
  prompt += '1. 【答非所问】被质问/被试探/被拆穿时，角色绝对不能正面回答。正确处理方式：转移话题/纠结无关细节/顾左右而言他/用动作代替语言回应。禁止"解释清楚"型的回答\n';
  prompt += '   错误："你是不是在骗我？" "我没有，我真的不知道。" → 索然无味\n';
  prompt += '   正确："你是不是在骗我？" 她愣了一下，低头摸了摸耳垂，"……今天风真大。" → 话里有话，读者后背发凉\n\n';
  prompt += '2. 【微动作藏情绪】禁止用"他很紧张/他很愤怒/他很伤心"这类直白情绪词。情绪必须通过以下微动作外化：\n';
  prompt += '   愤怒→指尖发白/咬紧后槽牙/声音压低/嘴角抽动\n';
  prompt += '   紧张→喉结滚动/手指无意识摩挲/脚尖在地上磨蹭/杯沿攥紧\n';
  prompt += '   暧昧→耳尖泛红/指腹蹭过手腕/视线躲闪后又不自觉看回去\n';
  prompt += '   悲伤→空玻璃杯擦了一遍又一遍/声音变得很轻很远/背对着人才敢呼吸\n\n';
  prompt += '3. 【日常事物掩护】把尖锐矛盾藏在日常物件里。矛盾双方看似在聊：A香水味/B茶水温热/C衣领褶皱/D窗外风景，实则是在进行关于"你到底有没有背叛我"的暗战\n';
  prompt += '   错误："你到底有没有做？" "我真的没有，你要相信我。" → AI感满满\n';
  prompt += '   正确：他端起茶杯，抿了一口。茶温热，烫得舌尖发麻。"你衬衫领口那味儿，"她的指尖轻轻划过杯沿，"比我用那瓶贵。" → 什么都没说，什么都说了\n\n';
  prompt += '4. 【关键时刻打断】在情绪/暧昧/冲突即将到达顶点的瞬间突然中断，制造"欲罢不能"的追读冲动。打断事件用：紧急敲门/电话铃声/脚步声/突然的雷雨/孩子的哭声\n';
  prompt += '   禁忌：打断后不要立刻接新事件。让读者屏住呼吸等下一页\n';
  prompt += '   错误：他们吵得不可开交，突然门开了。管家说："老爷，不好了！"然后开始讲新问题\n';
  prompt += '   正确：他们吵得不可开交，突然门开了。三下敲门声，停了停，又两下。是红袖招的紧急暗号。他松开她的手腕，脸色骤变。她看着他的背影，忽然觉得刚才的质问好像没那么重要了。\n\n';

  // === 爽点密度网格（AI最弱项：无节奏=爽点稀疏=读者流失）===
  prompt += '\n【⚠️ 爽点密度网格（AI最弱项·强制执行）】\n';
  prompt += 'AI最容易写"平铺直叙"，读者100字内看不到情绪刺激就会跳页。必须按以下密度设计：\n\n';
  prompt += '• 【小爽点】每章至少1个：配角震惊表情 / 主角一句让人拍手的回击 / 一个预期之外的小反转。让读者嘴角微微上扬即可。\n';
  prompt += '• 【中爽点】每3-5章1个：完整打脸链路 / 关系突破 / 实力跃升。必须让读者"拍大腿"。\n';
  prompt += '• 【大爽点】每卷1个：boss战逆转 / 身份曝光导致连锁反应 / 多条伏笔同时回收。必须让读者"合上书还在回味"。\n';
  prompt += '• 【禁忌】连续3章无任何情绪刺激（没有小爽点 + 没有中爽点 + 没有推进主线）→ 视为不合格章节。\n';
  prompt += '• 【设计建议】爽点设计要有"委屈→爆发"的完整链路。先压300字让读者替主角难受，再用100字让读者拍大腿。没有委屈的爆发只是炫技，读者不会有代入感。\n\n';

  // === 视角控制（比冰山对话更高优先级：视角错了读心就会发生）===
  var currentPerspective = work.perspective || 'third';  // 'first' | 'third' | 'third_omniscient'
  var mainCharName = '';
  if (work.chars) {
    var firstCharMatch = work.chars.match(/[【\[<]?([\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5A-Za-z0-9]{1,7})[】\]>]?\s*[：(]/);
    if (firstCharMatch) mainCharName = firstCharMatch[1];
  }
  if (currentPerspective === 'first') {
    prompt += '\n【⚠️ 视角锁定·第一人称（最高优先级，违反直接判为不合格）】\n';
    prompt += '1. 全文只能用"我"作为叙述主体。"我"必须是主角（' + (mainCharName || '主角') + '）本人。\n';
    prompt += '2. 绝对禁止写"我"不在场的场景。"我"没有看到/听到/感受到的东西，绝对不能出现在正文中（只能通过后续对话/信/报告间接获知）。\n';
    prompt += '3. 绝对禁止跳转到其他角色的内心活动。只能写"他嘴角动了一下"这种"我"能看到的动作，绝不能写"他心里想……"。\n';
    prompt += '4. 不能"读心"：A对B的想法只能通过B的"动作/表情/语气/沉默"推测，不能直接知道对方心里想什么。\n';
    prompt += '5. 严禁"我"能感知到自己看不到的东西（如："他在我身后冷笑"——如果我没回头，我怎么知道他在冷笑？应该写"我身后传来一声冷笑"）。\n';
    prompt += '6. 本章如需视角切换（仅限特殊需求，如"我"昏迷后醒来期间发生的事），必须满足：①有明确的时间线标记（"三天后"）；②切换后在同一段落内说明视角归属；③切换段不超过300字且不可连续出现。\n\n';
  } else {
    // 默认：第三人称有限视角（只能写主角色能感知的）
    prompt += '\n【⚠️ 视角锁定·第三人称有限视角（最高优先级，违反直接判为不合格）】\n';
    prompt += '1. 全文只能从' + (mainCharName ? '【' + mainCharName + '】' : '主角') + '的视角叙述。只能写他/她能看到/听到/闻到/摸到的东西，以及他/她自己的内心活动。\n';
    prompt += '2. 绝对禁读心：其他角色的想法必须通过"动作/表情/语气/沉默/行为"让读者自己体会。严禁出现：\n';
    prompt += '   - "A知道B在想……" / "B心里想的正好是……"\n';
    prompt += '   - "他一眼看穿了她的心思" / "她心里清楚他要做什么"\n';
    prompt += '   - "XX心想/暗自道/心中暗道"但这个XX不是主角\n';
    prompt += '   - "从他的眼神里，她读出了……"（这是在"读"眼神，OK；但"从他的眼神里，她知道他在想A且在考虑B"——这是读心，禁）\n';
    prompt += '3. 不能全知全能：主角不知道的事情，叙述者也无权直接告诉读者。如果需要让读者知道某件事（如反派阴谋），只能通过主角能观察到的线索间接呈现。\n';
    prompt += '4. 视角切换规则：如需切换视角（如主角不在场的关键场景），必须同时满足：\n';
    prompt += '   ①该角色在前文至少出场过一次且有名字\n';
    prompt += '   ②有不可替代的剧情需求（如：揭露主角不知道但读者必须知道的关键线索）\n';
    prompt += '   ③切换有明确的章节分隔（新起一章或在章节内新起一大段，且用空行隔开）\n';
    prompt += '   ④切换视角的段落不超过300字，或该段落有独立叙事价值（如反派独白、关键线索揭示）\n';
    prompt += '   不满足条件则严禁切换视角。禁止在同一段落内从A视角跳到B视角。\n\n';
  }

  // ===== v51: 场景类型模板 · 战斗/情感/对话/信息四大场景写作结构 =====
  prompt += '\n\n【⚠️ 场景类型模板 · 按场景类型选择写作结构】\n';
  prompt += '根据本章剧情判断本章主要场景类型，选择对应模板（不是照抄，是理解结构后灵活运用）：\n\n';
  
  prompt += '【战斗场景 4 步结构】\n';
  prompt += '  Step 1 对峙（30%）：写出双方立场/实力差距/心理博弈。读者要知道"为什么打"和"输了会怎样"\n';
  prompt += '  Step 2 交锋（30%）：不是招式名堆砌，而是要害攻防+环境利用+策略博弈。每个回合有"攻击→应对→反击"的因果链\n';
  prompt += '  Step 3 转折（15%）：战斗中突然出现新变量（第三方介入/环境变化/隐藏实力暴露/规则被打破），让读者产生"没想到"的兴奋\n';
  prompt += '  Step 4 收束（25%）：分出胜负或暂时中断，但必须留下"战斗的代价"（伤势/消耗/暴露/心理创伤）。战斗不能白打，要么推动剧情，要么揭示角色\n\n';
  
  prompt += '【情感场景 4 步结构】\n';
  prompt += '  Step 1 触发（20%）：一句台词/一个动作/一个物件/一个场景，触发了角色的情感按钮\n';
  prompt += '  Step 2 挣扎（40%）：角色在"承认情感"和"压抑情感"之间反复摇摆。外化挣扎：想说的话说不出口，想做的事做不到，想走的路走不动\n';
  prompt += '  Step 3 突破或退缩（20%）：角色最终选择表达还是继续压抑？这个选择必须符合人设，不能凭空变勇敢或变懦弱\n';
  prompt += '  Step 4 余波（20%）：情感事件之后，角色和关系发生了什么变化？这个变化必须影响后续行为\n\n';
  
  prompt += '【对话场景 4 步结构】\n';
  prompt += '  Step 1 建立（10%）：交代对话场景（地点/时间/在场人物/各自目的），简洁高效\n';
  prompt += '  Step 2 交锋（50%）：不是问答，是博弈。每句话都在争取什么或隐藏什么。关键技巧：答非所问/转移话题/用沉默代替回答/用日常事物做掩护\n';
  prompt += '  Step 3 升级（25%）：对话中信息差逐渐暴露，一方开始占据上风或局势逆转。至少出现一次"原来如此"的揭示\n';
  prompt += '  Step 4 种子（15%）：对话结束时埋下新矛盾的种子。读者知道"这场对话改变了什么"但又"不知道会引发什么"\n\n';
  
  prompt += '【信息场景 4 步结构】（揭示世界观/交代背景/传递情报）\n';
  prompt += '  Step 1 钩子（20%）：用一个问题或矛盾吸引读者——"为什么这个世界的规则是这样的？""这条信息意味着什么？"\n';
  prompt += '  Step 2 分层揭示（40%）：信息不是一次性倒出来，而是像剥洋葱一样层层揭示。每层揭示都让读者产生"原来如此"的感觉\n';
  prompt += '  Step 3 角色反应（25%）：重点不是信息本身，而是角色对信息的反应。不同角色对同一信息的不同反应是最有戏剧性的部分\n';
  prompt += '  Step 4 后果暗示（15%）：暗示这条信息将如何改变角色的行动或选择。读者需要知道"知道了这个之后，角色会怎么做"\n\n';
  
  prompt += '【场景类型指令】\n';
  prompt += '1. 本章开始前先判断：这一章主要是什么类型的场景？选择最接近的模板\n';
  prompt += '2. 如果一章包含多个场景类型（如"对话→战斗→情感"），按顺序使用对应模板，场景切换时用空行分隔\n';
  prompt += '3. 比例不是死板的，但"牺牲哪个Step"必须是有意为之，不能是因为忘了\n';
  prompt += '4. 模板的核心是"步骤之间的因果链"——每一步必须导致下一步，不能跳跃\n\n';

  // ===== v51: 情感波动曲线 · 章节情绪强度设计 =====
  prompt += '【⚠️ 情感波动曲线 · 本章情绪强度设计】\n';
  prompt += '网文不是平铺直叙，情绪必须有起伏。本章请按以下情绪曲线设计：\n\n';
  prompt += '【情绪强度标尺】（1=平淡, 5=日常冲突, 7=重大转折, 9=高潮爆发, 10=终极对决）\n';
  prompt += '  本章推荐情绪曲线：\n';
  prompt += '  开篇（0-15%）→ 情绪强度 3-4：承接上章余韵，用简洁的过渡锚定读者\n';
  prompt += '  发展（15-50%）→ 情绪强度 5-6：冲突升级，矛盾展开，读者开始紧张\n';
  prompt += '  转折（50-70%）→ 情绪强度 7-8：本章核心事件发生，读者被"震"到\n';
  prompt += '  收束（70-100%）→ 情绪强度 6→8：情绪不降反升，制造"欲罢不能"的结尾钩子\n\n';
  prompt += '【情绪曲线设计原则】\n';
  prompt += '1. 每章至少有一个"情绪高峰"（强度≥7），让读者有"这章没白看"的满足感\n';
  prompt += '2. 高峰前后的情绪不能断崖式跳变，要有 2-3 步的爬升和回落过程\n';
  prompt += '3. 连续两章不能都是"高强度"——如果上一章是高潮（8-9），本章可以适当降低到 5-7，给读者喘息空间\n';
  prompt += '4. 连续三章不能都是"低强度"——超过 3 章无情绪刺激，读者开始流失\n';
  prompt += '5. 情绪来源必须多样化：不能只靠"战斗"制造高潮，也要靠"揭秘/反转/关系突破/身份暴露"等\n';
  prompt += '6. 不同情绪类型交替：紧张→释然→紧张→感动→紧张→愤怒→紧张→爽，避免单一情绪疲劳\n\n';
  prompt += '【本章情绪检查清单】\n';
  prompt += '- 本章的"情绪高峰"是什么事件？读者看完后最强烈的感受是什么？\n';
  prompt += '- 高峰之前有没有足够的"委屈/压抑/期待"来铺垫？没有铺垫的高潮只是炫技\n';
  prompt += '- 结尾的情绪向量是"向上"（期待/兴奋/好奇）还是"向下"（担忧/压抑/悬念）？向上让读者想追读，向下让读者想翻页\n\n';

  // ===== v51: 断章位置优化 · 5种断章类型，教AI如何在最佳位置断章 =====
  prompt += '【⚠️ 断章位置优化 · 网文核心技巧：结尾钩子是追读的关键】\n';
  prompt += '本章结尾必须用断章技巧制造期待感。根据本章剧情选择最合适的断章类型：\n\n';
  prompt += '【断章类型说明】\n';
  prompt += '1. **悬念断章**（最常用）：在问题提出之后、答案揭晓之前突然结束。例如："他伸出手，缓缓推开那扇门，门外站着——\n';
  prompt += '2. **反转断章**：读者刚相信"真相是A"，一句话揭示"其实真相是B"，然后断章。例如："他以为自己赢了，直到口袋里摸到那封写给对手的信。\n';
  prompt += '3. **金句断章**：本章核心情感或主题用一句戳心的金句收尾，让读者记住后再点下一章。例如："原来有些告别，真的就是一生一世。\n';
  prompt += '4. **情绪断章**：情绪刚刚到达顶点（无论是狂喜还是绝望），断在这里，让读者和角色一起喘口气。例如："她跪在雨里，终于笑出了声，眼泪混着雨水往下淌。\n';
  prompt += '5. **信息差断章**：读者知道了一个关键信息，但主角不知道，就在主角快要发现的时候断章。例如："他终于翻开相册，背面写着那行字——\n\n';
  prompt += '【断章禁忌】\n';
  prompt += '1. 禁止在场景开头断章——场景刚展开就结束，读者会骂\n';
  prompt += '2. 禁止在对话中间断章——一句话没说完就断，那是AI卡了，不是断章\n';
  prompt += '3. 禁止"且听下回分解"这种老套句式——直接断在最痒的地方就行\n';
  prompt += '4. 本章结尾必须是能让读者心跳加速的瞬间，不能是平淡的收尾\n\n';

  // ===== v51: 多角色戏份平衡 · 防止配角消失 =====
  if (work.chars && chapterIdx > 2) {
    // 统计已写章节中各角色出场次数
    var roleCount = {};
    var allChars = [];
    // 从人设中提取角色名
    var charNameRE = /[【\[]([^】\]\n]{1,12})[】\]]\s*[：:]?/g;
    var nmMatch;
    while ((nmMatch = charNameRE.exec(work.chars)) !== null) {
      var nm = nmMatch[1].trim();
      if (nm && nm !== '关系网' && nm !== '年龄' && nm !== '外貌') allChars.push(nm);
    }
    // 统计出场次数
    if (work.chapters && chapterIdx > 0) {
      for (var cxi = 0; cxi < chapterIdx; cxi++) {
        var chCont = (work.chapters[cxi] || {}).content || '';
        if (!chCont) continue;
        for (var ni = 0; ni < allChars.length; ni++) {
          var rn = allChars[ni];
          if (chCont.indexOf(rn) >= 0) {
            roleCount[rn] = (roleCount[rn] || 0) + 1;
          }
        }
      }
    }
    // 找久未出场的角色（最近5章没出现）
    var missingRoles = [];
    for (var ni = 0; ni < allChars.length; ni++) {
      var rn = allChars[ni];
      var cnt = roleCount[rn] || 0;
      if (cnt === 0 && chapterIdx >= 3 && missingRoles.length < 3) {
        missingRoles.push(rn);
      }
    }
    if (missingRoles.length > 0) {
      prompt += '【📊 角色出场提醒 · 防止配角消失】\n';
      prompt += '以下角色已有多章未出场，本章如有机会，请安排他们至少露个脸或被提及：\n';
      for (var mi = 0; mi < missingRoles.length; mi++) {
        prompt += '  • ' + missingRoles[mi] + '（从未出场）\n';
      }
      prompt += '\n';
    }
  }

  // ===== v51: 反转设计 · 4种反转类型+设计公式 =====
  prompt += '【反转设计 · 如果你需要本章设计反转，请按以下公式】\n';
  prompt += '【类型1：预期反转】→ 读者预期A → 实际非A → 解释为什么会这样\n';
  prompt += '【类型2：身份反转】→ 读者以为X是Y → 实际X是Z → Z身份解释为什么之前要伪装\n';
  prompt += '【类型3：信息反转】→ 读者知道A但主角不知道 → 主角突然获得新信息B → B推翻了A → 主角必须重新做决定\n';
  prompt += '【类型4：关系反转】→ 读者以为A和B是盟友 → 实际A一直给B下套 → 反转后双方立场必须立刻变化\n';
  prompt += '【反转禁忌】\n';
  prompt += '1. 反转不能太突兀 → 前面至少要有 1-2 条伏笔暗示\n';
  prompt += '2. 反转不能"为反转而反转" → 反转必须改变当前局势，推动剧情\n';
  prompt += '3. 反转不能推翻所有前面设定 → 最多推翻一个核心认知，其他设定要保留\n\n';

  // ===== v51: 冲突升级模型 · 5级冲突阶梯，矛盾要有层次感 =====
  prompt += '【冲突升级模型 · 从摩擦到决战，要有层次感】\n';
  prompt += '第1级：摩擦 → 双方只是言语交锋或小范围肢体接触，没人重伤，不致命\n';
  prompt += '第2级：对立 → 一方明确表态站在另一方对立面，公开撕破脸\n';
  prompt += '第3级：对抗 → 动手了，有一方受伤，局势已经无法用谈判解决\n';
  prompt += '第4级：危机 → 一方被逼到绝路，要么同归于尽，要么认输投降\n';
  prompt += '第5级：决战 → 分出胜负，一方倒下，冲突结束（进入新的平衡）\n\n';
  prompt += '【升级规则】\n';
  prompt += '1. 不能一步到位从"摩擦"跳到"决战"，至少要经过 2-3 级升级\n';
  prompt += '2. 每一级升级后，局势都必须比之前更糟糕，主角筹码越来越少\n';
  prompt += '3. 最终决战必须是主角赌上所有筹码的一战，不能轻易赢\n';
  prompt += '4. 赢了也要付出代价，主角不可能零伤亡赢得决战\n\n';

  // ===== v51: 世界观展示技巧 · 避免信息dump =====
  prompt += '【世界观展示技巧 · 不要用旁白解说世界观】\n';
  prompt += '错误方式："在这个世界里，有五种职业，分别是……等级划分是……"（这是百科，不是小说）\n';
  prompt += '正确方式：通过以下方式自然展示：\n';
  prompt += '1. **角色行动**：主角要修炼需要什么资质？不满足资质会发生什么？读者从主角的行动中看懂规则\n';
  prompt += '2. **角色对话**：两个老人聊天聊当年的大战，读者听到了历史\n';
  prompt += '3. **冲突暴露**：主角违反了规则，世界给了他惩罚，读者知道了规则是什么\n';
  prompt += '4. **物品使用**：主角使用一件道具，道具的特性和限制在使用中自然展现\n';
  prompt += '5. **权力博弈**：不同势力争夺利益，读者从争夺中看懂势力分布和利益格局\n\n';
  prompt += '【核心原则】：读者什么时候需要知道什么，什么时候才告诉他。不要第一章就把全书设定倒出来。\n\n';

  // ===== v51: 时间线一致性检查 · 避免前后矛盾 =====
  prompt += '【⚠️ 时间线一致性检查 · 写完前必须自问】\n';
  prompt += '1. 本章的时间标记（"三天后""半个月过去""翌晨"等）和前文时间线对上吗？\n';
  prompt += '2. "三天后"就不能在三天内发生另一件大事，时间不能同时走两条线\n';
  prompt += '3. 季节/天气/昼夜：前面说"深秋"，本章不能突然"荷花盛开"，除非是穿越\n';
  prompt += '4. 如果有时间倒流/时间跳跃/平行世界，必须明确标注，不能偷偷改变\n';
  prompt += '5. 如果发现矛盾但确实是剧情需要，必须在文中给出解释（如记忆偏差/他人误导）\n\n';

  // 用户指令已移至 prompt 最前面，确保 AI 第一眼看到

  // 自然文风指引（替代机械反检测规则）
  prompt += '\n\n【文风与自然度指引】\n优先追求"读起来像人写的"而非"严格按照规则写作"。以下为方向性指引，非强制模板：\n\n';
  prompt += '1. **节奏自然波动**：叙述段（80-120字）与动作段（20-50字）交替出现，紧张时段落变短，舒缓时适当拉长。不要刻意追求句长数字，以阅读流畅度为准。\n\n';
  prompt += '2. **去AI腔（最高优先级禁令）**：禁止使用以下AI高频句式：\n';
  prompt += '   - "眼神一冷/瞳孔一缩/嘴角勾起/心头一颤/眉头微蹙/目光如炬"\n';
  prompt += '   - "像...一样""仿佛...一般""如同...似的""宛如...般"\n';
  prompt += '   - "...，是...的..."（"A是B的C"三层嵌套）\n';
  prompt += '   - "众人震惊/空气凝固/命运齿轮/时间仿佛静止"\n';
  prompt += '   - "XX道/XX说"堆砌在同一段对话中\n';
  prompt += '   - "不禁""竟然""居然""赫然""陡然"连续出现\n';
  prompt += '   - "一道/一抹/一丝/一缕"等量词+抽象名词模式\n';
  prompt += '   - "心中暗道/暗自思忖/心中一动/灵光一闪"\n';
  prompt += '   - "不由得/忍不住/情不自禁"做情绪过渡词\n';
  prompt += '   - "缓缓/慢慢/轻轻/淡淡"四个副词连续出现在同一段\n';
  prompt += '   - "只见/但见/却见"做叙事引导词\n';
  prompt += '   - 禁止"极其强大/无比恐怖/深不可测/不可名状/难以言喻"等万能形容——用具体数据或对比替代\n';
  prompt += '   - 禁止"事情变得复杂起来/一切才刚刚开始/真正的挑战才刚刚开始/命运的齿轮开始转动"等空泛推进——用具体事件替代\n\n';
  prompt += '3. **对话自然化（冰山法则）**：这是最重要的单条技法。成年人的情绪不外露——愤怒不大喊大叫，心虚不主动辩解，暧昧不明说。对话中：\n';
  prompt += '   - 被质问时不正面回答：转移话题、纠结无关细节、顾左右而言他、用动作代替回答\n';
  prompt += '   - 禁止"XX说/道/问道/答道"堆砌：每段对话最多一个"他说"，其余全用动作和沉默承载\n';
  prompt += '   - 潜台词公式：表面在说A，实际在说B。比如"这香水味不错"实际上在说"你出轨了"\n';
  prompt += '   - 允许"答非所问"：对方问A，角色答B，或者干脆沉默用动作回应，这才是真实的人\n\n';
  prompt += '4. **描写具体化**：避免"很冷""很美""很可怕"等抽象形容词。用感官细节替代：温度用身体反应，外貌用动作体现，氛围用环境暗示。写"冷"不如写"他呼出的气在眼前凝成白雾"，写"美"不如写"她侧头时耳后的碎发被风撩起"。\n\n';
  prompt += '5. **比喻原创化**：禁止"像狼的眼睛""像嚼湿柴""像从肺里刮出来"等常见比喻。从当前世界观中取材造比喻，宁可不用比喻也不要用套路比喻。好的比喻来自角色身份——铁匠的比喻和书生的比喻绝不会一样。\n\n';
  prompt += '6. **口语化微瑕**：允许极轻微的口语省略（如"他槊杆"代替"他的槊杆"），但每1500字不超过1处，必须自然不刻意。绝对禁止错别字和语法错误。\n\n';
  prompt += '7. **情绪外化**：不要写"他很愤怒/他很害怕"，通过动作、生理反应、环境来外化情绪。写"愤怒"不如写"他攥紧的拳头指甲陷进掌心"，写"害怕"不如写"他后退半步，脊背撞上了冰冷的墙壁"。\n\n';
  prompt += '8. **段落作为节奏单元**：每个段落表达一个完整意图，长段落（叙事/心理）和短段落（动作/对话/强调）交错分布，形成视觉节奏。关键时刻用单句成段制造冲击力。\n\n';
  prompt += '9. **展示而非告知**：不要写"他是一个谨慎的人"，而是写他做事时如何体现谨慎。不要写"气氛紧张"，而是写紧张的具体表现。不要写"她很伤心"，而是写她做了什么让人知道她伤心。\n\n';
  prompt += '10. **场景转换用动作**：不要用"三天后""与此同时"等时间词硬切场景，而是通过角色的行动（走出房门、翻过山岭、收到消息）自然过渡。\n\n';
  prompt += '11. **信息密度控制**：每500字至少推进1个信息点（新事实/新线索/新关系/新能力），禁止连续500字纯描写或纯对话无信息推进。但也不要信息过载——每章2-4个核心信息点，其余用感官细节填充。\n\n';
  prompt += '12. **冲突螺旋升级**：冲突不要一步到位，要有2-3步升级过程。每一步升级都让读者觉得"更糟了"或"更紧张了"。冲突的解决不能太容易，必须付出代价。\n\n';
  prompt += '13. **角色声音差异化**：不同角色的对话必须有区分度——用词习惯、句子长短、语气助词、口头禅各不相同。将军说话短促有力，书生说话引经据典，市井小民说话粗俗直接。禁止所有角色用同一种腔调说话。\n';
  
  // === v46 写作正面指引（通用原则，非固定模板） ===
  prompt += '\n\n【写作正面指引（参考方向，非照抄模板）】\n';
  prompt += '写作时请追求：\n';
  prompt += '- 用具体的动作和物品代替抽象形容\n';
  prompt += '- 对话中每个人说话的节奏和用词不一样\n';
  prompt += '- 场景转换用"发生了什么"而非"时间过了多久"来体现\n';
  prompt += '- 不要让角色做他们不会做的事\n';
  prompt += '- 好的段落是：读完后你不是知道了什么信息，而是感受到了什么\n';
  prompt += '- 每个场景都要回答"为什么读者要继续看下去"这个问题\n';
  prompt += '- 战斗/冲突场景要有策略感，不是单纯的招式名堆砌\n';
  prompt += '- 角色的每个决定都要有动机，读者能理解"他为什么这么做"\n';
  prompt += '- 开篇300字内必须有冲突或悬念的种子，不要用大段描写开场\n';
  prompt += '- 每个场景至少有一个"意外"——不是反转，而是读者没预料到的小细节\n';
  prompt += '- 结尾钩子不是"突然出现新敌人"，而是"已有信息的新解读"或"即将揭晓的秘密"\n';
  prompt += '- 写完一章后自问：读者看完这章，最想知道什么？下一章要回答这个问题\n';
  prompt += '- 对话不是信息传递工具，而是角色博弈的战场——每句话都在争取什么或隐藏什么\n';
  prompt += '- 环境不是背景板，它是情绪放大器——雨天写悲伤比晴天更有效，烈日写愤怒比阴天更有力\n';
  prompt += '- 配角不是NPC，他们有自己的日程——主角找他们帮忙时，他们可能正在忙自己的事\n';
  
  // 智能压缩架构文本：保留首部（概览框架）+ 关键规则 + 尾部（最新细节），中间部分压缩
// 避免 naive substring 把末尾的重要规则/设定一刀切掉
function smartCompressArch(text, maxLen) {
  if (!text || text.length <= maxLen) return text;
  var headRatio = 0.35;  // 首部保留比例
  var tailRatio = 0.35;  // 尾部保留比例
  var headLen = Math.floor(maxLen * headRatio);
  var tailLen = Math.floor(maxLen * tailRatio);
  var midBudget = maxLen - headLen - tailLen - 30; // 30 给分隔符
  
  // 提取关键规则句（代价/限制/必须/禁忌/体系/等级/势力/规则）
  var keyRules = [];
  var ruleRE = /[^。\n]{0,50}(代价|规则|限制|不能|不可|必须|才能|除非|禁忌|体系|等级|势力|禁地|失传|诅咒|契约|核心|运转|世界观|力量体系|种族|阶层|文明|经济|地理|时代|背景)[^。\n]{0,100}[。\n]/g;
  var rm;
  while ((rm = ruleRE.exec(text)) !== null) {
    var r = rm[0].trim();
    if (r.length > 15 && keyRules.indexOf(r) === -1) keyRules.push(r);
  }
  
  // 构建压缩结果：首部 + 关键规则 + 尾部
  var result = text.substring(0, headLen);
  var rulesText = '';
  if (keyRules.length > 0 && midBudget > 50) {
    rulesText = '\n\n【关键规则提取】\n';
    var rulesAdded = 0;
    for (var i = 0; i < keyRules.length; i++) {
      var candidate = '- ' + keyRules[i] + '\n';
      if (rulesAdded + candidate.length > midBudget) break;
      rulesText += candidate;
      rulesAdded += candidate.length;
    }
  }
  result += rulesText;
  result += '\n\n...(中间部分已压缩)...\n\n';
  result += text.substring(text.length - tailLen);
  
  return result;
}

// === v46 智能压缩：根据模型上下文窗口动态设置阈值 ===
  // 128K+ 模型：上下文足够大，跳过压缩，直接传完整架构
  if (!archLimits) {
    // archLimits 为 null 表示大上下文模型，无需压缩
    return prompt;
  }
  var totalLen = prompt.length;
  // 根据模型上下文窗口计算安全上限（留 30% 给输出 + 指令开销）
  var ctxWindow = 131072;
  try { if (typeof getModelContextWindow === 'function') ctxWindow = getModelContextWindow(); } catch(e) {}
  var outTokens = 16384;
  try { if (typeof getModelMaxOutputTokens === 'function') outTokens = getModelMaxOutputTokens(); } catch(e) {}
  var safeInputTokens = Math.max(5000, Math.floor((ctxWindow - outTokens) * 0.7));
  // 中文 1 字 ≈ 1.5 token（保守估计）
  var PROMPT_CHAR_LIMIT = Math.floor(safeInputTokens / 1.5);
  var PROMPT_SOFT_LIMIT = Math.floor(PROMPT_CHAR_LIMIT * 0.75); // 超过 75% 开始压缩

  if (totalLen > PROMPT_SOFT_LIMIT) {
    // 优先级从低到高：世界设定 → 人物人设 → 记忆 → 链锁 → 核心指令（永远保留）
    var ratio = PROMPT_SOFT_LIMIT / totalLen;

    if (work.world && work.world.length > 200 && ratio < 0.95) {
      var maxWorld = Math.max(200, Math.floor(archLimits.world * ratio));
      var worldText2 = smartCompressArch(work.world, maxWorld);
      prompt = prompt.replace(/【世界观设定】\n.*?\n\n/, '【世界观设定】\n' + worldText2 + '\n\n');
    }
    if (work.chars && work.chars.length > 200 && ratio < 0.9) {
      var maxChars = Math.max(200, Math.floor(archLimits.chars * ratio));
      var charsText2 = smartCompressArch(work.chars, maxChars);
      prompt = prompt.replace(/【人物人设】\n.*?\n\n/, '【人物人设】\n' + charsText2 + '\n\n');
    }
    // 二次检查：如果仍然超限，进一步压缩上下文
    if (prompt.length > PROMPT_CHAR_LIMIT) {
      // v54: 压缩章节上下文块（记忆存储格式，不是原文）
      prompt = prompt.replace(/【上章结尾上下文】\n([\s\S]*?)(?:\n\n|\n(?=【))/, function(m, p1) {
        // 只保留最后3行
        var lines = p1.split('\n');
        var short = lines.slice(-3).join('\n');
        return '【上章结尾上下文】\n' + short + '\n';
      });
    }
  }

  // === v48 最终强化提醒（放在 prompt 末尾，让模型最后记住的是这些硬约束）===
  prompt += '\n\n【⚠️ 最终检查清单 · 写完前对照 · 搬运强度最高】\n';
  prompt += '1. 我写的是「' + chTitle + '」（第' + (chapterIdx + 1) + '章）吗？是否越界写到了下一章？\n';
  prompt += '2. 本章有明确的结尾钩子或悬念让读者想点开下一章吗？\n';
  prompt += '3. 角色名字/地名/力量体系名称与之前的设定一致吗？\n';
  prompt += '4. 本章字数灵活控制，以剧情完整性为先（不少于3000字），开头直接进入冲突/场景，不做大段景物描写/人物介绍\n';
  prompt += '5. 没有 AI 腔（眼神一冷/瞳孔一缩/嘴角勾起/心头一颤/眉头微蹙/目光如炬/仿佛/众人震惊/心中暗道 等套路句式）\n';
  prompt += '6. 对话中 50% 以上用动作/神态/环境描写代替"XX说/XX道"\n';
  prompt += '7. 结尾是"信息差/期待感制造点"，不是"且听下回分解"这种老套句式\n';
  prompt += '8. 【搬运检查】本章中我明确写到了主角的动机/弱点/执念吗？\n';
  prompt += '9. 【搬运检查】本章中我是否推进或埋下了至少一条伏笔？\n';
  prompt += '10. 【搬运检查】本章的行为/能力/对话符合世界观规则吗？\n';
  prompt += '11. 【搬运检查】角色的情绪与上一章结尾是连贯的吗？\n';
  prompt += '12. 信息密度：每 500 字至少推进了 1 个新信息点（新事实/新线索/新关系/新能力）\n';
  prompt += '\n【最后一句提醒】\n';
  prompt += '写完本章后，不要加"下章预告"或作者旁白。章末的最后一句应该是让读者心跳加速的瞬间。\n';

  // ===== 引擎 1: 向量 RAG（把前文相关章节内容作为记忆注入，避免 AI 写 50 章后忘记前情）
  try {
    if (typeof VectorRAG !== 'undefined' && work && work.chapters && work.chapters.length > 2) {
      var ragIdx = VectorRAG.buildIndex(work);
      if (ragIdx.size > 0) {
        var query = (chTitle || '') + ' ' + (work.detail || '').substring(0, 600) + ' ' + (work.outline || '').substring(0, 300);
        var ragRes = VectorRAG.retrieve(ragIdx, query, 4, { currentChapter: chapterIdx });
        if (ragRes.length) {
          prompt += '\n\n【⚠️ RAG 记忆片段 · 自动检索到的 ' + ragRes.length + ' 个前文相关片段（仅供一致性参考，不要原文引用）：\n';
          for (var rx = 0; rx < ragRes.length; rx++) {
            var rc = ragRes[rx].chunk;
            prompt += (rx + 1) + '. ' + rc.title + '（相关度 ' + ragRes[rx].score.toFixed(3) + '）：' + rc.rawText + '\n';
          }
          prompt += '——请严格依据以上已发生的事实写作，不要编造尚未出现的情节/角色/关系。\n';
        }
      }
    }
  } catch (e) {}

  // ===== v52: 风格加强 · 风格签名 + 用户编辑风格学习 =====
  try {
    var styleSig = null;
    if (typeof StyleEngine !== 'undefined' && work && work.styleSample && work.styleSample.length >= 500) {
      styleSig = StyleEngine.extractSignature(work.styleSample, work.title || '作者风格');
    } else if (typeof StyleEngine !== 'undefined' && work && work.chapters && work.chapters.length >= 3) {
      var merged = '';
      for (var cx = Math.max(0, work.chapters.length - 5); cx < work.chapters.length; cx++) {
        if (work.chapters[cx] && work.chapters[cx].content) merged += work.chapters[cx].content;
      }
      if (merged.length >= 2000) {
        styleSig = StyleEngine.extractSignature(merged, '最近5章风格');
      }
    }
    if (styleSig && styleSig.signatureText) {
      prompt += '\n\n【⚠️ 风格签名 · 本章必须严格匹配以下风格指纹 · 这是你的文笔DNA】\n';
      prompt += styleSig.signatureText + '\n';
      prompt += '【风格硬约束】\n';
      prompt += '1. 本章平均句长必须对齐风格签名中的数值（允许±5字浮动）\n';
      prompt += '2. 对话占比必须对齐（允许±10%浮动）\n';
      prompt += '3. 情感基调必须对齐（正/负/中性比例保持一致）\n';
      prompt += '4. 感官描写分布必须对齐（视觉/听觉/触觉比例保持一致）\n';
      prompt += '5. 如果风格偏向"短促有力"，禁止突然写长句铺陈；如果风格偏向"细腻铺陈"，禁止突然写短句快节奏\n';
      prompt += '6. 风格一致性 > 技巧炫技。宁可少用一个技巧，也不能破坏风格一致性\n\n';
    }
    
    // 从用户编辑中学习风格偏好
    var editStyleNotes = [];
    if (work && work.chapters && chapterIdx > 0) {
      for (var ei = 0; ei < Math.min(chapterIdx, 5); ei++) {
        var ech = work.chapters[ei];
        if (ech && ech._aiOriginal && ech.content && ech._aiOriginal !== ech.content) {
          // 用户编辑过这一章，分析风格差异
          var orig = ech._aiOriginal;
          var edited = ech.content;
          // 检测用户是否删除了长句
          var origAvgLen = Math.round(orig.length / Math.max(1, (orig.match(/[。！？!?]/g) || []).length));
          var editedAvgLen = Math.round(edited.length / Math.max(1, (edited.match(/[。！？!?]/g) || []).length));
          if (editedAvgLen < origAvgLen * 0.7) editStyleNotes.push('用户偏好更短的句子（用户编辑后句长缩短了约' + Math.round((1 - editedAvgLen/origAvgLen) * 100) + '%）');
          // 检测用户是否增加了对话
          var origDialog = (orig.match(/["""]/g) || []).length;
          var editedDialog = (edited.match(/["""]/g) || []).length;
          if (editedDialog > origDialog * 1.3) editStyleNotes.push('用户偏好更多对话');
          // 检测用户是否删除了AI腔
          var aiTells = ['心中暗道', '心头一颤', '瞳孔一缩', '嘴角勾起', '目光如炬', '众人震惊', '空气凝固'];
          var deletedTells = [];
          for (var ati = 0; ati < aiTells.length; ati++) {
            if (orig.indexOf(aiTells[ati]) >= 0 && edited.indexOf(aiTells[ati]) === -1) deletedTells.push(aiTells[ati]);
          }
          if (deletedTells.length > 0) editStyleNotes.push('用户删除了AI腔：' + deletedTells.join('、') + ' —— 请避免这些表达');
          break; // 只分析最近一次编辑
        }
      }
    }
    if (editStyleNotes.length > 0) {
      prompt += '【📝 用户编辑风格偏好 · 基于你的修改习惯】\n';
      for (var esi = 0; esi < editStyleNotes.length; esi++) {
        prompt += '  · ' + editStyleNotes[esi] + '\n';
      }
      prompt += '\n';
    }
  } catch (e) {}

  // ===== v52: 原创设计 · 套路翻转 + 创意约束 + 题材差异化 =====
  prompt += '【⚠️ 原创设计 · 打破套路 · 让读者猜不到下一页】\n';
  prompt += '网文最大的敌人不是文笔差，是读者看了开头就知道结尾。以下方法强制你的写作跳出套路：\n\n';
  
  prompt += '【套路翻转 · 每章至少翻转一个常见套路】\n';
  prompt += '套路1：\"英雄救美\" → 翻转：美女救英雄，或者英雄赶到时发现美女已经自己解决了\n';
  prompt += '套路2：\"废柴逆袭\" → 翻转：废柴其实是装的，他一直在隐藏实力，逆袭不是突然变强而是揭开伪装\n';
  prompt += '套路3：\"退婚打脸\" → 翻转：被退婚的一方其实求之不得，退婚是他/她暗中推动的结果\n';
  prompt += '套路4：\"反派死于话多\" → 翻转：反派话多是因为在拖延时间等援军，主角差点中计\n';
  prompt += '套路5：\"临阵突破\" → 翻转：突破不是靠运气，是靠之前埋下的伏笔（某个道具/某句话/某次失败的经验）\n';
  prompt += '套路6：\"误会\" → 翻转：不是误会，是真的有人故意制造假象，揭开后不是\"原来如此\"而是\"竟然如此\"\n';
  prompt += '套路7：\"天命之子\" → 翻转：不是天命选择了主角，是主角主动选择了天命，代价是放弃了原本想要的生活\n\n';
  
  prompt += '【创意约束 · 3条铁律强制原创】\n';
  prompt += '1. 禁止本章出现任何\"读者在第3页就能猜到第30页结局\"的情节。如果连你自己都能猜到，读者早就猜到了。\n';
  prompt += '2. 每个重要情节至少给出1个\"读者没想到的可能性\"——不是为反转而反转，而是让读者在事情发生后说\"原来如此，但我之前没想到\"\n';
  prompt += '3. 禁止使用\"所有人都知道但没人说破\"这种推动剧情的方式——如果所有人都知道，就安排一个人说破，然后剧情从\"说破之后\"开始\n\n';
  
  // 题材差异化建议
  prompt += '【题材差异化 · 打破' + genre + '的常见套路】\n';
  if (genre.indexOf('玄幻') >= 0 || genre.indexOf('仙侠') >= 0) {
    prompt += '- 玄幻/仙侠常见套路：修炼→突破→打脸→奇遇→再突破\n';
    prompt += '- 差异化建议：本章至少让一个\"本该是奇遇\"的场景变成\"代价\"——得到力量的同时失去某个重要的东西\n';
    prompt += '- 差异化建议：让一个\"反派\"展现出完全合理的动机，让读者产生\"他其实也没错\"的感觉\n';
    prompt += '- 差异化建议：修炼体系不是\"谁等级高谁赢\"，而是\"相生相克\"，本章让一个低等级角色用克制关系赢一次\n';
  } else if (genre.indexOf('都市') >= 0) {
    prompt += '- 都市常见套路：隐藏身份→被挑衅→亮出身份→打脸\n';
    prompt += '- 差异化建议：被挑衅后不亮身份，而是用\"不暴露身份\"的方式解决问题，反而更让人敬畏\n';
    prompt += '- 差异化建议：让\"钱和权\"不是万能的——某个问题钱解决不了，需要主角展现真正的智慧\n';
  } else if (genre.indexOf('科幻') >= 0) {
    prompt += '- 科幻常见套路：高科技→碾压→科技伦理→反思\n';
    prompt += '- 差异化建议：让科技有\"意想不到的副作用\"——不是常见的\"失控\"，而是\"太成功了，成功到改变了人本身\"\n';
  } else {
    prompt += '- 差异化建议：找出本章最\"理所当然\"的情节，问自己\"如果相反会怎样\"，然后考虑是否更精彩\n';
    prompt += '- 差异化建议：让一个\"配角\"的观点在本章中比主角的观点更有说服力\n';
  }
  prompt += '\n';

  // === v53: 剧情推进度自检 · 核心推动为最高目标 =====
  prompt += '\n\n【⚠️⚠️⚠️ 剧情推进度自检 · 核心推动为最高目标 · 写前必读】\n';
  prompt += '本章不是"写得好看"就行，必须"推进剧情"。写完本章后，主角的世界必须发生变化。\n\n';
  prompt += '【水章判定标准 · 满足以下任一条件即视为水章】\n';
  prompt += '1. 跳过本章，后续剧情不需要任何改写 → 本章没有推进任何东西\n';
  prompt += '2. 本章结束后，主角的状态/位置/认知/关系/实力全部和上一章一样 → 原地踏步\n';
  prompt += '3. 本章唯一的功能是"描写环境"或"展示日常" → 描写必须服务于推进\n';
  prompt += '4. 本章只有对话没有行动，或只有行动没有后果 → 动作必须有后果\n\n';
  prompt += '【推进度检查清单 · 写完后逐条打勾】\n';
  prompt += '□ 主角的状态发生了不可逆变化（受伤/升级/获得新信息/失去重要物品/关系变化）\n';
  prompt += '□ 至少一条主线被推进了（不是支线、不是日常、不是展示世界观）\n';
  prompt += '□ 至少一条伏笔被推进或回收（给读者"原来如此"或"越来越近了"的感受）\n';
  prompt += '□ 冲突升级了至少一级（摩擦→对立→对抗→危机→决战）\n';
  prompt += '□ 章末钩子让读者产生了一个必须被回答的新问题\n';
  prompt += '□ 如果这是连续第3章，必须有一个中爽点（完整打脸/关系突破/实力跃升）\n\n';
  prompt += '【核心指令】如果以上6条中有任何一条无法打勾，请在写作前重新规划本章剧情。不要为了凑字数而写。\n';

  // === 一致性自检指令 ===
  prompt += '\n\n【⚠️ 输出前自检 — 必须逐条确认】\n';
  prompt += '1. 本章出现的人物名字是否全部来自【人物人设】？新增人物是否为临时配角？\n';
  prompt += '2. 本章使用的力量/能力/技能是否在【世界观设定】中有定义？代价是否体现？\n';
  prompt += '3. 本章剧情是否推进了【当前卷大纲】中的核心冲突或阶段目标？\n';
  prompt += '4. 本章是否严格遵守了【细纲】中的场景、人物、剧情节点？\n';
  prompt += '5. 本章是否使用了【世界观设定】中的地名/势力名/规则，而非自创？\n';
  prompt += '6. 本章的事件是否与【L0世界观锁】和【L1人设锁】中的规则冲突？\n';
  prompt += '7. 若有偏离，必须在偏离处标注【偏离说明：原因】，且偏离必须服务于更好的故事体验。\n';

  return prompt;
}

// ========== 记忆系统 ==========

// 记忆分类及优先级（数字越小越重要）
const MEMORY_TYPES = {
  '人物状态': { priority: 1, icon: '👤', color: '#ef4444' },
  '关键事件': { priority: 1, icon: '⚡', color: '#f59e0b' },
  '新角色':   { priority: 2, icon: '🆕', color: '#6366f1' },
  '关系变化': { priority: 2, icon: '💔', color: '#ec4899' },
  '重要物品': { priority: 3, icon: '🗡️', color: '#10b981' },
  '地点转移': { priority: 3, icon: '📍', color: '#3b82f6' },
  '伏笔悬念': { priority: 1, icon: '🔮', color: '#8b5cf6' },
  '角色动机': { priority: 2, icon: '💭', color: '#f97316' },
  '情感线':   { priority: 2, icon: '❤️', color: '#e11d48' },
  '能力变化': { priority: 2, icon: '💪', color: '#14b8a6' },
  '能力代价': { priority: 2, icon: '⚠️', color: '#dc2626' },
  '时间线':   { priority: 3, icon: '⏰', color: '#64748b' },
  '势力动态': { priority: 2, icon: '⚔️', color: '#dc2626' },
  '势力消亡': { priority: 1, icon: '💀', color: '#991b1b' },
  '情绪转折': { priority: 2, icon: '🎭', color: '#7c3aed' },
  '章节摘要': { priority: 4, icon: '📝', color: '#6b7280' },
  '核心记忆点': { priority: 1, icon: '⭐', color: '#f59e0b' },
  '场景细节': { priority: 3, icon: '🏠', color: '#0ea5e9' },
  '对话线索': { priority: 2, icon: '💬', color: '#a855f7' },
  '承诺兑现': { priority: 1, icon: '📜', color: '#b45309' }
};

// 保存章节后自动提取记忆点（增强版）
async function extractMemory(work, chapterIdx, content) {
  if (!content || content.trim().length < 50) return;
  
  const chTitle = work.chapters[chapterIdx] ? work.chapters[chapterIdx].title : ('第' + (chapterIdx + 1) + '章');
  const genre = getWorkGenre(work);
  
  // 传入已有记忆作为上下文
  const existingMemory = getMemoryText(work, chapterIdx);
  
  // 构建增强版提取prompt
  let prompt = '你是一位专业的小说编辑助理。请从以下章节中提取关键记忆点，这些记忆将用于后续章节写作时保持故事连贯性。\n\n';
  prompt += '【作品】' + (work.title || '') + '\n';
  prompt += '【题材】' + genre + '\n';
  prompt += '【章节】' + chTitle + '\n';
  prompt += '【章节内容】\n' + content + '\n\n';
  
  if (existingMemory) {
    prompt += '【已有记忆（避免重复提取）】\n' + existingMemory + '\n\n';
  }
  
  prompt += '请严格按以下格式提取，每项一行："类别：具体内容"\n\n';
  prompt += '必须提取的类别（有就提取，没有就跳过）：\n';
  prompt += '1. 人物状态：角色的身体状况、情绪、心理变化、当前位置（如受伤、突破、崩溃、觉醒，必须包含角色名和具体变化）\n';
  prompt += '2. 关键事件：推动剧情的重要事件、转折点、冲突爆发（必须写清因果——因为什么导致了什么）\n';
  prompt += '3. 新角色：新出场角色的名字、身份、与主角的关系、外貌特征标签\n';
  prompt += '4. 关系变化：角色间关系的转变（结盟、背叛、表白、决裂、和解），必须写清从什么关系变成什么关系\n';
  prompt += '5. 重要物品：获得/失去/使用的关键道具、信物、武器、信件，必须写清当前归属\n';
  prompt += '6. 地点转移：场景变化，从哪里到了哪里，新地点的关键特征\n';
  prompt += '7. 伏笔悬念：埋下的伏笔、未解的谜团、悬而未决的问题，标注伏笔类型（人物身世/势力阴谋/道具来历/预言）\n';
  prompt += '8. 角色动机：角色当前的核心目标、计划、顾虑，必须写清为什么有这个动机\n';
  prompt += '9. 情感线：角色间的感情发展（暧昧、冲突、升温），必须写清双方的态度变化\n';
  prompt += '10. 能力变化：实力提升、学会新技能、失去某种能力，必须写清变化前后对比\n';
  prompt += '11. 能力代价：使用能力后的代价、反噬、限制（如消耗寿元、精神崩溃、身体损伤），必须写清什么能力导致什么代价\n';
  prompt += '12. 势力动态：势力间的攻防、结盟、背叛、消亡，必须写清势力名称和具体行动\n';
  prompt += '13. 势力消亡：势力覆灭、分裂、投降、被吞并，必须写清哪个势力被谁所灭/吞并\n';
  prompt += '14. 情绪转折：角色情绪的重大转变点（如从绝望到希望、从信任到怀疑），必须写清转折原因\n';
  prompt += '15. 时间线：明确的时间节点（几天后、翌日、三年前等），必须写清距离上一事件多久\n';
  prompt += '16. 核心记忆点：后文绝不能写错的事实、读者会记住的角色标志、承诺、道具归属、关系变化、未兑现爽点\n';
  prompt += '17. 场景细节：关键场景的感官特征（声音/气味/光线/温度），后文回到同一地点时必须一致\n';
  prompt += '18. 对话线索：角色说出的关键信息/承诺/威胁/暗示，后文需要兑现或呼应\n';
  prompt += '19. 承诺兑现：角色做出的承诺或约定，必须写清谁对谁承诺了什么、兑现期限\n\n';
  prompt += '最后，用一行总结本章核心剧情：章节摘要：一句话概括（包含主角名+核心事件+结果）\n\n';
  prompt += '注意：\n';
  prompt += '- 内容要具体，包含角色名、地名等\n';
  prompt += '- 不要提取已有记忆中重复的内容\n';
  prompt += '- 只输出提取结果，不要任何解释';
  
  try {
    const config = DB.getApiConfig();
    const keys = DB.getApiKeys(config.provider);
    
    if (keys && keys.length > 0) {
      let result = await callRealAPIWithFallback(prompt, null, 'memory', 500); // v48: 记忆提取简短，快速响应
      if (result) {
        // 解析记忆条目
        const lines = result.split('\n').filter(l => l.trim().length > 3 && /[：:]/.test(l));
        const memories = lines.map(l => {
          const sepIdx = l.indexOf('：') !== -1 ? l.indexOf('：') : l.indexOf(':');
          const rawType = l.substring(0, sepIdx).trim().replace(/^[\d.]+\s*/, '');
          const content = l.substring(sepIdx + 1).trim();
          // 标准化类别名
          const type = normalizeMemoryType(rawType);
          const typeInfo = MEMORY_TYPES[type] || MEMORY_TYPES['关键事件'];
          return {
            chapter: chTitle,
            chapterIdx: chapterIdx,
            type: type,
            content: content,
            priority: typeInfo.priority,
            icon: typeInfo.icon,
            time: new Date().toISOString()
          };
        }).filter(m => m.content.length > 1);
        
        if (memories.length > 0) {
          if (!work.memory) work.memory = [];
          // 移除同一章节的旧记忆
          work.memory = work.memory.filter(m => m.chapterIdx !== chapterIdx);
          work.memory.push(...memories);
          // 只保留最近800条记忆
          if (work.memory.length > 800) {
            work.memory = work.memory.slice(work.memory.length - 800);
          }
          DB.saveWork(work);
          renderMemory(work);
          showToast('🧠 已提取 ' + memories.length + ' 条记忆');
        }
      }
    } else {
      // 无API时用本地简单提取
      localExtractMemory(work, chapterIdx, content);
    }
  } catch (e) {
    console.log('记忆提取失败:', e);
  }
}

// 标准化记忆类别名
function normalizeMemoryType(raw) {
  const map = {
    '人物状态': ['人物状态', '状态变化', '角色状态', '身体状况', '状态'],
    '关键事件': ['关键事件', '重要事件', '事件', '情节', '剧情转折', '冲突'],
    '新角色': ['新角色', '新出场角色', '新人物', '出场角色'],
    '关系变化': ['关系变化', '人物关系', '关系', '关系转变'],
    '重要物品': ['重要物品', '物品', '道具', '线索', '信物', '武器'],
    '地点转移': ['地点转移', '地点', '场景', '位置'],
    '伏笔悬念': ['伏笔悬念', '伏笔', '悬念', '未解之谜', '伏笔'],
    '角色动机': ['角色动机', '动机', '目标', '计划'],
    '情感线': ['情感线', '感情', '情感', '爱情'],
    '能力变化': ['能力变化', '实力', '突破', '修炼'],
    '能力代价': ['能力代价', '代价', '反噬', '消耗', '副作用', '代价限制'],
    '势力动态': ['势力动态', '势力', '阵营', '势力变化'],
    '势力消亡': ['势力消亡', '势力覆灭', '势力灭亡', '灭门', '覆灭', '被灭'],
    '情绪转折': ['情绪转折', '情绪变化', '心理转折', '心态转变', '情绪突变'],
    '时间线': ['时间线', '时间', '时间节点'],
    '章节摘要': ['章节摘要', '摘要', '总结', '本章概括'],
    '核心记忆点': ['核心记忆点', '核心记忆', '记忆点', '后文必须', '不可更改'],
    '场景细节': ['场景细节', '场景', '环境细节', '感官', '氛围细节'],
    '对话线索': ['对话线索', '对话', '台词线索', '承诺线索', '暗示'],
    '承诺兑现': ['承诺兑现', '承诺', '约定', '发誓', '许诺', '诺言']
  };
  for (const [standard, aliases] of Object.entries(map)) {
    if (aliases.some(a => raw.includes(a))) return standard;
  }
  return '关键事件';
}

// 本地简单提取（无API时的备用）
function localExtractMemory(work, chapterIdx, content) {
  const chTitle = work.chapters[chapterIdx] ? work.chapters[chapterIdx].title : ('第' + (chapterIdx + 1) + '章');
  const memories = [];
  
  // 提取对话中的角色名
  const speakerPattern = /([^\s""''「」]{2,4})(?:说|道|喊|叫|喝|问|答)/g;
  const speakers = new Set();
  let m;
  while ((m = speakerPattern.exec(content)) !== null) {
    speakers.add(m[1]);
  }
  if (speakers.size > 0) {
    memories.push({ chapter: chTitle, chapterIdx, type: '新角色', content: Array.from(speakers).join('、'), priority: 2, icon: '🆕', time: new Date().toISOString() });
  }
  
  // 提取地点关键词
  const placePattern = /(?:来到|到达|离开|前往|回到|进入|走出)([^\n，。]{2,6})/g;
  const places = new Set();
  while ((m = placePattern.exec(content)) !== null) {
    places.add(m[1]);
  }
  if (places.size > 0) {
    memories.push({ chapter: chTitle, chapterIdx, type: '地点转移', content: '涉及地点：' + Array.from(places).join('、'), priority: 3, icon: '📍', time: new Date().toISOString() });
  }
  
  // 章节摘要
  const summary = content.substring(0, 80).replace(/\n/g, '') + '...';
  memories.push({ chapter: chTitle, chapterIdx, type: '章节摘要', content: summary, priority: 4, icon: '📝', time: new Date().toISOString() });
  
  if (memories.length > 0) {
    if (!work.memory) work.memory = [];
    work.memory = work.memory.filter(m => m.chapterIdx !== chapterIdx);
    work.memory.push(...memories);
    DB.saveWork(work);
    renderMemory(work);
  }
}

// 渲染记忆列表（增强版：按类型着色、可折叠、可手动添加，数据来源含longMemory）
function renderMemory(work) {
  const listEl = document.getElementById('memory-list');
  if (!listEl) return;
  
  const memories = work ? (work.memory || []) : [];
  const countEl = document.getElementById('st-memory');
  
  // 统计longMemory信息
  const lm = work ? work.longMemory : null;
  const anchorCount = (lm && lm.memoryAnchors) ? Object.values(lm.memoryAnchors).reduce(function(n, arr){ return n + (Array.isArray(arr) ? arr.length : 0); }, 0) : 0;
  const lmCount = lm ? (lm.charStates.length + lm.plotThreads.length + lm.foreshadows.length + lm.charArcs.length + anchorCount) : 0;
  const totalMemCount = memories.length + lmCount;
  if (countEl) countEl.textContent = totalMemCount + '条';
  
  let html = '';
  
  // v45：显示商业正文评分
  if (lm && lm.commercialReports && lm.commercialReports.length) {
    const br = lm.commercialReports[lm.commercialReports.length - 1];
    const bcolor = br.score >= 85 ? '#16a34a' : (br.score >= 70 ? '#f59e0b' : '#ef4444');
    html += '<div style="font-weight:700;color:#111827;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">🔥 商业正文强度</div>';
    html += '<div style="font-size:12px;color:' + bcolor + ';font-weight:700;">最近检查：' + br.score + '/100</div>';
    if (br.issues && br.issues.length) html += '<div style="font-size:12px;color:#6b7280;line-height:1.45;">' + br.issues.slice(0,3).map(function(x){return he(x);}).join('<br>') + '</div>';
  }

  // v39：显示全链路一致性
  if (lm && lm.chainConsistency && lm.chainConsistency.length) {
    const cr = lm.chainConsistency[lm.chainConsistency.length - 1];
    const color = cr.score >= 85 ? '#16a34a' : (cr.score >= 70 ? '#f59e0b' : '#ef4444');
    html += '<div style="font-weight:700;color:#111827;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">🔗 全链路一致性</div>';
    html += '<div style="font-size:12px;color:' + color + ';font-weight:700;">最近检查：' + cr.score + '/100</div>';
    if (cr.issues && cr.issues.length) {
      html += '<div style="font-size:12px;color:#6b7280;line-height:1.45;">' + cr.issues.slice(0,3).map(function(x){return he(x);}).join('<br>') + '</div>';
    }
  }

  // v30：显示超长篇记忆账本
  if (lm && (lm.volumeMemories || lm.characterProfiles || lm.foreshadowLedger)) {
    const volCount = (lm.volumeMemories || []).length;
    const profileCount = lm.characterProfiles ? Object.keys(lm.characterProfiles).length : 0;
    const ledgerCount = (lm.foreshadowLedger || []).length;
    const itemCount = lm.itemLedger ? Object.keys(lm.itemLedger).length : 0;
    const factionCount = lm.factionGraph ? Object.keys(lm.factionGraph).length : 0;
    const timeCount = (lm.timelineEvents || []).length;
    html += '<div style="font-weight:700;color:#111827;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">🧠 超长篇记忆库</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;color:#374151;margin-top:4px;">';
    html += '<div>分卷记忆：' + volCount + '卷</div><div>人物档案：' + profileCount + '人</div>';
    html += '<div>伏笔总表：' + ledgerCount + '条</div><div>道具总表：' + itemCount + '件</div>';
    html += '<div>势力关系：' + factionCount + '个</div><div>时间轴：' + timeCount + '条</div>';
    html += '</div>';
    const high = (lm.foreshadowLedger || []).filter(function(x){return x.priority === '高' && x.status !== '已解' && x.status !== '已兑现';}).slice(0, 4);
    if (high.length) {
      html += '<div style="font-size:12px;color:#b45309;margin-top:6px;font-weight:600;">高优先级待回收：</div>';
      high.forEach(function(x){ html += '<div style="font-size:12px;color:#92400e;padding:1px 0;">第' + ((x.chapterIdx||0)+1) + '章｜' + he(x.type) + '：' + he((x.text||'').slice(0,42)) + '</div>'; });
    }
  }

  // v28/v46：显示长篇压缩摘要与记忆债务
  if (lm && lm.rollingSummary) {
    html += '<div style="font-weight:700;color:#111827;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">📚 长篇压缩摘要</div>';
    var displayText = '';
    if (typeof lm.rollingSummary === 'string') {
      displayText = lm.rollingSummary;
    } else {
      displayText = (lm.rollingSummary.eras || '') + '\n' + (lm.rollingSummary.milestones || '') + '\n' + (lm.rollingSummary.recent || '');
    }
    html += '<div style="font-size:12px;color:#4b5563;line-height:1.5;background:#f9fafb;border-radius:8px;padding:6px;margin-top:4px;max-height:90px;overflow:auto;">' + he(displayText.slice(-500)) + '</div>';
  }
  if (lm && lm.memoryDebt && lm.memoryDebt.length) {
    html += '<div style="font-weight:700;color:#b45309;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">⚠️ 待兑现长记忆 <span style="font-weight:normal;font-size:11px;color:#999;">(' + lm.memoryDebt.length + '条)</span></div>';
    lm.memoryDebt.slice(0, 5).forEach(function(d){
      html += '<div style="font-size:12px;color:#92400e;padding:2px 0;">第' + ((d.chapterIdx||0)+1) + '章｜' + he(d.type) + '：' + he((d.text||'').slice(0, 45)) + '（' + d.age + '章）</div>';
    });
  }
  if (lm && lm.characterHistory) {
    const names = Object.keys(lm.characterHistory).slice(0, 5);
    if (names.length) {
      html += '<div style="font-weight:700;color:#111827;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">👣 人物长期轨迹</div>';
      names.forEach(function(name){
        const arr = (lm.characterHistory[name] || []).slice(-3);
        if (!arr.length) return;
        html += '<div style="font-size:12px;color:#374151;padding:2px 0;"><strong>' + he(name) + '</strong>：' + arr.map(function(x){ return '第' + ((x.chapterIdx||0)+1) + '章[' + he(x.status||'正常') + ']'; }).join(' → ') + '</div>';
      });
    }
  }

  // 先显示核心记忆点
  if (lm && lm.memoryAnchors) {
    const anchorNames = {
      core:'核心事实', characterTags:'角色标志', relationships:'关系变化', items:'道具归属',
      locations:'地点状态', promises:'承诺禁忌', timeline:'时间线', hooks:'爽点钩子', chapterContext:'章节上下文'
    };
    html += '<div style="font-weight:700;color:#111827;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">⭐ 核心记忆点 <span style="font-weight:normal;font-size:11px;color:#999;">(' + anchorCount + '条)</span></div>';
    Object.keys(anchorNames).forEach(function(k){
      const arr = (lm.memoryAnchors[k] || []).slice(0, 4);
      if (!arr.length) return;
      html += '<div style="font-size:12px;color:#374151;margin-top:4px;font-weight:600;">' + anchorNames[k] + '</div>';
      arr.forEach(function(a){
        html += '<div style="padding:2px 0;display:flex;gap:4px;align-items:flex-start;">';
        html += '<span style="color:#f59e0b;flex-shrink:0;">•</span>';
        html += '<span style="flex:1;color:#333;">第' + ((a.chapterIdx||0)+1) + '章：' + he(a.text || '') + '</span>';
        html += '</div>';
      });
    });
  }

  // 再显示longMemory摘要
  if (lm) {
    if (lm.charStates && lm.charStates.length > 0) {
      html += '<div style="font-weight:600;color:#333;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">人物状态 <span style="font-weight:normal;font-size:11px;color:#999;">(longMemory)</span></div>';
      lm.charStates.forEach(cs => {
        html += '<div style="padding:2px 0;display:flex;align-items:flex-start;gap:4px;">';
        html += '<span style="color:#ef4444;flex-shrink:0;">👤</span>';
        html += '<span style="color:#333;flex:1;"><strong>' + he(cs.name) + '</strong>：' + he(cs.status);
        if (cs.location && cs.location !== '未知') html += ' @' + he(cs.location);
        if (cs.emotion) html += ' [' + he(cs.emotion) + ']';
        html += '</span></div>';
      });
    }
    if (lm.plotThreads && lm.plotThreads.length > 0) {
      const pending = lm.plotThreads.filter(t => t.status === '待解');
      if (pending.length > 0) {
        html += '<div style="font-weight:600;color:#333;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">待解线索 <span style="font-weight:normal;font-size:11px;color:#999;">(' + pending.length + '条)</span></div>';
        pending.slice(0, 5).forEach(t => {
          html += '<div style="padding:2px 0;display:flex;align-items:flex-start;gap:4px;">';
          html += '<span style="color:#8b5cf6;flex-shrink:0;">🔮</span>';
          html += '<span style="color:#333;flex:1;font-size:12px;">' + he(t.title.slice(0, 40)) + '</span></div>';
        });
      }
    }
    if (lm.foreshadows && lm.foreshadows.some(f => f.status === '未解')) {
      const unresolved = lm.foreshadows.filter(f => f.status === '未解').slice(-3);
      html += '<div style="font-weight:600;color:#333;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">未解伏笔 <span style="font-weight:normal;font-size:11px;color:#999;">(' + unresolved.length + '条)</span></div>';
      unresolved.forEach(f => {
        html += '<div style="padding:2px 0;display:flex;align-items:flex-start;gap:4px;">';
        html += '<span style="color:#f59e0b;flex-shrink:0;">⚡</span>';
        html += '<span style="color:#333;flex:1;font-size:12px;">第' + (f.chapterIdx+1) + '章：' + he(f.line.slice(0, 30)) + '</span></div>';
      });
    }
  }
  
  if (memories.length === 0 && lmCount === 0) {
    listEl.innerHTML = '<div style="color:#999;padding:8px 0;">暂无记忆，保存章节后自动提取</div>';
    return;
  }
  
  // 按章节分组显示旧版记忆（最新的在前）
  if (memories.length > 0) {
    const grouped = {};
    memories.slice().reverse().forEach(m => {
      if (!grouped[m.chapter]) grouped[m.chapter] = [];
      grouped[m.chapter].push(m);
    });
    
    for (const [ch, items] of Object.entries(grouped)) {
      html += '<div style="font-weight:600;color:#333;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">' + ch + ' <span style="font-weight:normal;font-size:11px;color:#999;">(' + items.length + '条)</span></div>';
      items.forEach((m, idx) => {
        const typeInfo = MEMORY_TYPES[m.type] || { icon: '📌', color: '#666' };
        const icon = m.icon || typeInfo.icon;
        const color = typeInfo.color;
        html += '<div style="padding:2px 0;display:flex;align-items:flex-start;gap:4px;">';
        html += '<span style="color:' + color + ';flex-shrink:0;">' + icon + '</span>';
        html += '<span style="color:#333;flex:1;"><span style="color:' + color + ';font-weight:500;font-size:11px;">[' + he(m.type) + ']</span> ' + he(m.content) + '</span>';
        html += '<span style="color:#ccc;cursor:pointer;flex-shrink:0;font-size:14px;" data-del-ch="' + he(m.chapter) + '" data-del-idx="' + idx + '" onclick="deleteMemoryByData(this)" title="删除">x</span>';
        html += '</div>';
      });
    }
  }
  
  // 手动添加按钮
  html += '<div style="margin-top:8px;padding-top:6px;border-top:1px dashed #ddd;">';
  html += '<div style="display:flex;gap:4px;align-items:center;">';
  html += '<input id="manual-memory-input" placeholder="手动添加记忆..." style="flex:1;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;outline:none;">';
  html += '<select id="manual-memory-type" style="padding:6px;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;">';
  Object.keys(MEMORY_TYPES).forEach(t => {
    html += '<option value="' + t + '">' + (MEMORY_TYPES[t].icon || '') + ' ' + t + '</option>';
  });
  html += '</select>';
  html += '<button onclick="addManualMemory()" style="padding:6px 10px;background:#6366f1;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;">+</button>';
  html += '</div></div>';
  
  listEl.innerHTML = html;
}

// 手动添加记忆
function addManualMemory() {
  const work = getCurrentWork();
  if (!work) return;
  const input = document.getElementById('manual-memory-input');
  const typeSelect = document.getElementById('manual-memory-type');
  const content = input.value.trim();
  if (!content) { showToast('请输入记忆内容'); return; }
  
  const type = typeSelect.value;
  const chapterIdx = currentChapterIdx || 0;
  const chTitle = work.chapters[chapterIdx] ? work.chapters[chapterIdx].title : ('第' + (chapterIdx + 1) + '章');
  const typeInfo = MEMORY_TYPES[type] || MEMORY_TYPES['关键事件'];
  
  if (!work.memory) work.memory = [];
  work.memory.push({
    chapter: chTitle,
    chapterIdx: chapterIdx,
    type: type,
    content: content,
    priority: typeInfo.priority,
    icon: typeInfo.icon,
    time: new Date().toISOString()
  });
  if (type === '核心记忆点') {
    upsertMemoryAnchor(work, 'core', content, {chapterIdx: chapterIdx, chapterTitle: chTitle, weight: 8, key: content.slice(0, 40)});
  }
  DB.saveWork(work);
  renderMemory(work);
  input.value = '';
  showToast(type === '核心记忆点' ? '⭐ 核心记忆点已锁定' : '记忆已添加');
}

// 删除单条记忆
function deleteMemoryByData(el){
  var ch = el.getAttribute('data-del-ch');
  var idx = parseInt(el.getAttribute('data-del-idx'));
  if (!isNaN(idx) && ch) deleteMemory(ch, idx);
}
function deleteMemory(chapter, idxInGroup) {
  const work = getCurrentWork();
  if (!work || !work.memory) return;
  
  // 找到该章节的所有记忆
  const chapterMemories = work.memory.filter(m => m.chapter === chapter);
  if (idxInGroup < 0 || idxInGroup >= chapterMemories.length) return;
  
  const targetMemory = chapterMemories[idxInGroup];
  // 从全局memory中删除
  const globalIdx = work.memory.indexOf(targetMemory);
  if (globalIdx >= 0) {
    work.memory.splice(globalIdx, 1);
    DB.saveWork(work);
    renderMemory(work);
    showToast('记忆已删除');
  }
}

// 刷新记忆显示
function refreshMemory() {
  const work = getCurrentWork();
  renderMemory(work);
}

// 获取记忆文本（用于注入prompt，分层策略 + longMemory增强）
function getMemoryText(work, upToChapterIdx) {
  if (!work) return '';
  initLongMemory(work);
  var mem = work.longMemory;
  var text = '';
  
  // === 第一层：核心记忆锚点（最高优先级） ===
  if (mem.memoryAnchors) {
    var anchors = mem.memoryAnchors;
    var anchorNames = {
      core:'核心事实', characterTags:'角色标志', relationships:'关系变化', items:'道具归属',
      locations:'地点状态', promises:'承诺禁忌', timeline:'时间线', hooks:'爽点钩子', chapterContext:'章节上下文'
    };
    var anchorText = '';
    Object.keys(anchorNames).forEach(function(k){
      var arr = (anchors[k] || []).filter(function(a){ return (a.chapterIdx || 0) < upToChapterIdx; });
      if (!arr.length) return;
      // 只保留未兑现/有效的锚点
      var active = arr.filter(function(a){ return a.status !== '已兑现' && a.status !== '失效'; });
      if (!active.length) active = arr.slice(-3);
      anchorText += '  ' + anchorNames[k] + '：' + active.map(function(a){ return a.text; }).join('；') + '\n';
    });
    if (anchorText) {
      text += '【核心记忆点（后文必须承接）】\n' + anchorText + '\n';
    }
  }
  
  // === 第二层：人物当前状态 ===
  if (mem.charStates && mem.charStates.length > 0) {
    text += '【人物当前状态】\n';
    mem.charStates.forEach(function(cs) {
      text += '  ' + cs.name + '：' + cs.status;
      if (cs.location && cs.location !== '未知') text += '，位于' + cs.location;
      if (cs.emotion) text += '，情绪[' + cs.emotion + ']';
      text += '\n';
    });
    text += '\n';
  }
  
  // === 第三层：待解情节线索 ===
  if (mem.plotThreads && mem.plotThreads.length > 0) {
    var pending = mem.plotThreads.filter(function(t){ return t.status === '待解' && (t.chapterIdx || 0) < upToChapterIdx; });
    if (pending.length) {
      text += '【待解情节线索】\n';
      pending.slice(0, 8).forEach(function(t){
        text += '  > ' + t.title;
        if (t.relatedTo) text += ' [关联：' + t.relatedTo + ']';
        text += '\n';
      });
      text += '\n';
    }
  }
  
  // === 第四层：五层渐进式滚动摘要 ===
  if (mem.rollingSummary) {
    var rs = mem.rollingSummary;
    var sumText = '';
    if (typeof rs === 'string') {
      sumText = rs.slice(-2500);
    } else {
      if (rs.megaEras && rs.megaEras.length > 10) sumText += rs.megaEras + '\n';
      if (rs.ultraEras && rs.ultraEras.length > 10) sumText += rs.ultraEras + '\n';
      if (rs.eras && rs.eras.length > 10) sumText += rs.eras + '\n';
      if (rs.milestones && rs.milestones.length > 10) sumText += rs.milestones + '\n';
      if (rs.recent && rs.recent.length > 10) sumText += rs.recent + '\n';
    }
    if (sumText) text += '【全书长期压缩摘要】\n' + sumText + '\n\n';
  }
  
  // === 第五层：work.memory 短期记忆 ===
  if (work.memory && work.memory.length > 0) {
    var relevant = work.memory.filter(function(m){ return m.chapterIdx < upToChapterIdx; });
    if (relevant.length > 0) {
      var currentChapter = upToChapterIdx;
      var shortTerm = relevant.filter(function(m){ return m.chapterIdx >= currentChapter - 5; });
      var longTermMem = relevant.filter(function(m){ return m.chapterIdx < currentChapter - 5; })
        .filter(function(m){ return m.priority <= 2; });
      
      if (longTermMem.length > 0) {
        text += '【长期记忆（重要事件回顾）】\n';
        var byType = {};
        longTermMem.forEach(function(m){
          if (!byType[m.type]) byType[m.type] = [];
          byType[m.type].push(m);
        });
        for (var type in byType) {
          text += '  ' + type + '：' + byType[type].map(function(i){ return i.content; }).join('；') + '\n';
        }
        text += '\n';
      }
      
      if (shortTerm.length > 0) {
        text += '【近期记忆（最近5章）】\n';
        var grouped = {};
        shortTerm.forEach(function(m){
          if (!grouped[m.chapter]) grouped[m.chapter] = [];
          grouped[m.chapter].push(m);
        });
        for (var ch in grouped) {
          text += '  ' + ch + '：\n';
          grouped[ch].forEach(function(m){
            text += '    • ' + m.type + '：' + m.content + '\n';
          });
        }
      }
    }
  }
  
  // === 第六层：伏笔标记 ===
  if (mem.foreshadows && mem.foreshadows.length > 0) {
    var unresolved = mem.foreshadows.filter(function(f){ return f.status === '未解' && (f.chapterIdx || 0) < upToChapterIdx; });
    if (unresolved.length) {
      text += '\n【伏笔标记（未解）】\n';
      unresolved.slice(-6).forEach(function(f){
        text += '  > 第' + (f.chapterIdx+1) + '章：' + f.line.slice(0, 50) + '\n';
      });
    }
  }
  
  // 控制总长度，超过50000字截断
  if (text.length > 50000) {
    text = text.substring(0, 50000) + '\n...(记忆过长，已截断)';
  }
  
  return text;
}


// ========== v46：低分章节局部修复器 ==========
function buildRepairPlanV46(work, chapterIdx, content) {
  var plan = {parts: [], reasons: [], chainScore: 100, commercialScore: 100};
  try {
    var cr = checkFullChainConsistency(work, chapterIdx, content || '');
    plan.chainScore = cr.score || 0;
    if (cr.issues && cr.issues.length) plan.reasons = plan.reasons.concat(cr.issues.slice(0, 3));
  } catch(e) {}
  try {
    var br = analyzeCommercialWritingV45(work, chapterIdx, content || '');
    plan.commercialScore = br.score || 0;
    if (br.issues && br.issues.length) plan.reasons = plan.reasons.concat(br.issues.slice(0, 4));
    if ((br.issues || []).join(' ').indexOf('开篇') >= 0) plan.parts.push('开头300字');
    if ((br.issues || []).join(' ').indexOf('章尾') >= 0 || (br.issues || []).join(' ').indexOf('钩子') >= 0) plan.parts.push('结尾300字');
    if ((br.issues || []).join(' ').indexOf('爽点') >= 0 || (br.issues || []).join(' ').indexOf('对话') >= 0) plan.parts.push('中段冲突/爽点/对话');
    if ((br.issues || []).join(' ').indexOf('题材') >= 0 || (br.issues || []).join(' ').indexOf('锚点') >= 0) plan.parts.push('题材锚点');
  } catch(e) {}
  if (!plan.parts.length) plan.parts = ['开头300字','结尾300字'];
  plan.parts = Array.from(new Set(plan.parts)).slice(0, 4);
  plan.reasons = Array.from(new Set(plan.reasons)).slice(0, 8);
  return plan;
}

// === v46 修复变体池（按章节序号轮换，避免千篇一律） ===
var _REPAIR_OPENERS = [
  '就在这一刻，局势突然变了。',
  '谁也没想到，变故来得这么快。',
  '风里忽然多了一丝不对劲的气味。',
  '就在这一瞬间，一切都不同了。',
  '他没有料到这一步。',
  '空气忽然变得沉重，像有什么在逼近。',
  '变故发生的时候，没有任何征兆。',
  '那一秒钟里，他心里闪过的不是一个念头，而是一种本能。'
];
var _REPAIR_CLOSERS = [
  '然而，他还没来得及松一口气，门外忽然传来一个完全不该出现的声音。',
  '可就在这时候，一只手搭上了他肩膀。',
  '但他不知道，更大的麻烦已经站在巷口了。',
  '只是他还没来得及细想，远处就响起了脚步声。',
  '而他身后那双眼，从头到尾都没移开过。',
  '就在他以为一切尘埃落定的时候，袖口里那封信轻轻硌了一下。',
  '但这一晚还远没有结束。',
  '风停了，安静得不正常。'
];

function fallbackLocalRepairV46(content, plan, chapterIdx) {
  content = content || '';
  chapterIdx = chapterIdx || 0;
  var out = content;
  if (plan.parts.indexOf('开头300字') >= 0 && out.length > 80 && !/(突然|就在这时|质问|怒|危机|线索|敌|命令|证据|变故|没料到)/.test(out.slice(0, 320))) {
    var opener = _REPAIR_OPENERS[chapterIdx % _REPAIR_OPENERS.length];
    out = opener + '\n\n' + out;
  }
  if (plan.parts.indexOf('结尾300字') >= 0 && out.length > 200 && !/(然而|可|却|就在这时|下一秒|忽然|突然|谁也没想到|还没结束|远没有|安静得不)/.test(out.slice(-260))) {
    var closer = _REPAIR_CLOSERS[(chapterIdx * 3 + 1) % _REPAIR_CLOSERS.length];
    out = out.replace(/\s*$/, '') + '\n\n' + closer;
  }
  return out;
}

async function repairLowScoreChapterV46(options) {
  options = options || {};
  var work = getCurrentWork();
  if (!validateCurrentWorkBeforeWrite(work)) return null;
  var idx = options.chapterIdx != null ? options.chapterIdx : currentChapterIdx;
  if (!work.chapters || !work.chapters[idx]) { showToast('请先选择章节'); return null; }
  var ch = work.chapters[idx];
  var content = (idx === currentChapterIdx ? document.getElementById('editor').value : ch.content) || '';
  if (!content || content.length < 80) { showToast('正文太短，无法局部修复'); return null; }
  var plan = buildRepairPlanV46(work, idx, content);
  var detailLine = getDetailLineForChapter(work, idx);
  var prompt = '你是资深网文改稿编辑。请对以下章节做【局部精准修复】，不是整章重写。\n\n';
  prompt += '【作品】' + (work.title || '') + '\n【题材】' + getWorkGenre(work) + '\n【平台】' + getPlatformLabelV45(work) + '\n';
  prompt += '【本章细纲】\n' + (detailLine || '无明确细纲') + '\n\n';
  prompt += '【需要修复的部位】' + plan.parts.join('、') + '\n';
  prompt += '【问题清单】\n' + (plan.reasons.length ? plan.reasons.map(function(x,i){return (i+1)+'. '+x;}).join('\n') : '开篇冲突、商业爽点、章尾钩子需要增强') + '\n\n';
  prompt += '【修复原则】\n';
  prompt += '1. 保留原剧情、人物、设定和大部分原文，不得改主线。\n';
  prompt += '2. 只增强问题部位：开头抓人、对话冲突、爽点兑现、题材锚点、章尾钩子。\n';
  prompt += '3. 删除或替换“众人震惊/空气凝固/命运齿轮”等AI腔。\n';
  prompt += '4. 输出修复后的完整正文，不要解释，不要加标题。\n\n';
  prompt += '【原文】\n' + content;
  if (!options.silent) showToast('正在局部修复：' + plan.parts.join('、'), 2500);
  var result = await callRealAPIWithFallback(prompt, null, 'fill', Math.max(500, Math.floor(content.length * 1.1)));
  if (!result || result.length < Math.min(200, content.length * 0.5)) {
    result = fallbackLocalRepairV46(content, plan, idx);
  }
  if (result) {
    window._editorBackup2 = window._editorBackup;
    window._editorBackup = content;
    if (idx === currentChapterIdx) document.getElementById('editor').value = result;
    ch.content = result;
    ch.wordCount = result.length;
    delete ch.evalCache;
    try { runFullChainAfterWrite(work, idx, result); } catch(e) {}
    DB.saveWork(work);
    if (idx === currentChapterIdx) updateWordCount();
    if (!options.silent) showToast('✅ 局部修复完成，可用撤销恢复', 3500);
    return result;
  }
  return null;
}

async function autoRepairIfLowV46(work, idx, pauseScore) {
  var ch = work && work.chapters ? work.chapters[idx] : null;
  if (!ch || !ch.content) return false;
  var score = getPipelineChapterScore(work, idx);
  var commercial = ch._commercialQuality ? ch._commercialQuality.score : 100;
  var need = (score.chain && score.chain < pauseScore) || (score.quality && score.quality < 55) || (commercial && commercial < 70);
  if (!need) return false;
  pipelineStatus('🛠️ 第' + (idx + 1) + '章低分，先尝试局部修复…', false);
  await repairLowScoreChapterV46({chapterIdx:idx, silent:true});
  var again = getPipelineChapterScore(work, idx);
  var br = ch._commercialQuality ? ch._commercialQuality.score : 100;
  return !((again.chain && again.chain < pauseScore) || (again.quality && again.quality < 55) || (br && br < 65));
}


// ========== v43：连续章节流水线控制器 ==========
var _chapterPipelineRunning = false;
var _chapterPipelineCancel = false;

function pipelineSleep(ms) {
  return new Promise(function(resolve){ setTimeout(resolve, ms || 100); }); // v48: 默认 100ms，快速切换
}

function pipelineStatus(text, ok) {
  var bar = document.getElementById('api-status-bar');
  if (!bar) return;
  bar.style.display = 'block';
  bar.style.background = ok === false ? '#fef3c7' : '#e0e7ff';
  bar.style.color = ok === false ? '#92400e' : '#3730a3';
  bar.textContent = text;
}

function ensurePipelineChapters(work, endIdx) {
  if (!work.chapters) work.chapters = [];
  while (work.chapters.length <= endIdx) {
    var n = work.chapters.length + 1;
    work.chapters.push({title:'第' + n + '章', content:''});
  }
}

function getPipelineChapterScore(work, idx) {
  var ch = work && work.chapters ? work.chapters[idx] : null;
  var q = ch && ch.evalCache ? (ch.evalCache.total || ch.evalCache.score || 0) : 0;
  var c = ch && ch._chainConsistency ? (ch._chainConsistency.score || 0) : 0;
  return {quality:q, chain:c};
}

function stopChapterPipeline() {
  _chapterPipelineCancel = true;
  pipelineStatus('⏹ 正在停止流水线，当前章节完成后暂停…', false);
  showToast('已请求停止流水线');
}

async function startChapterPipeline() {
  if (_chapterPipelineRunning) { showToast('流水线正在运行'); return; }
  var work = getCurrentWork();
  if (!validateCurrentWorkBeforeWrite(work)) return;
  var totalExisting = work.chapters && work.chapters.length ? work.chapters.length : 1;
  var input = prompt('输入流水线章节范围，例如：1-10\n默认 10 章一批，最多一次建议 50 章。', (currentChapterIdx + 1) + '-' + Math.min(currentChapterIdx + 10, Math.max(totalExisting, currentChapterIdx + 10)));
  if (!input) return;
  var m = input.match(/(\d+)\s*[-~到至,，]\s*(\d+)/) || input.match(/^(\d+)$/);
  if (!m) { showToast('范围格式不正确，例如 1-10'); return; }
  var start = parseInt(m[1], 10);
  var end = parseInt(m[2] || m[1], 10);
  if (!start || !end || start < 1 || end < start) { showToast('章节范围无效'); return; }
  if (end - start + 1 > 50) {
    showToast('为防止跑偏，一次最多 50 章');
    end = start + 49;
  }
  var overwrite = confirm('是否覆盖已有正文？\n确定=覆盖已有正文；取消=跳过已有正文超过100字的章节。');
  var pauseScore = 70;
  var ps = prompt('一致性低于多少分自动暂停？建议 70。', '70');
  if (ps && !isNaN(parseInt(ps,10))) pauseScore = parseInt(ps,10);

  _chapterPipelineRunning = true;
  _chapterPipelineCancel = false;
  var stopBtn = document.getElementById('pipeline-stop-btn');
  if (stopBtn) stopBtn.style.display = 'inline-block';
  var done = 0, skipped = 0;
  try {
    ensurePipelineChapters(work, end - 1);
    DB.saveWork(work);
    for (var n = start; n <= end; n++) {
      if (_chapterPipelineCancel) break;
      work = getCurrentWork();
      if (!validateCurrentWorkBeforeWrite(work)) break;
      ensurePipelineChapters(work, n - 1);
      var idx = n - 1;
      var ch = work.chapters[idx];
      if (!overwrite && ch.content && ch.content.trim().length > 100) {
        skipped++;
        pipelineStatus('🏭 流水线 ' + n + '/' + end + '：已有正文，已跳过');
        continue;
      }
      loadChapter(idx);
      await pipelineSleep(100); // v48: 缩短章节间等待，快速切换
      pipelineStatus('🏭 流水线写作中：第 ' + n + ' / ' + end + ' 章');
      var before = (ch.content || '').length;
      var retryCount = 0;
      var maxRetries = 3;
      var genSuccess = false;
      while (retryCount < maxRetries && !genSuccess) {
        try {
          await aiWriteChapter();
          genSuccess = true;
        } catch(e) {
          retryCount++;
          console.error('[pipeline aiWriteChapter] 第' + n + '章失败，重试 ' + retryCount + '/' + maxRetries + ':', e);
          if (retryCount < maxRetries) {
            pipelineStatus('⚠️ 第' + n + '章生成失败，重试 ' + retryCount + '/' + maxRetries + '…');
            await pipelineSleep(2000);
          } else {
            pipelineStatus('⚠️ 第' + n + '章生成失败（已重试' + maxRetries + '次），流水线已暂停', false);
            showToast('第' + n + '章连续失败' + maxRetries + '次，流水线暂停', 5000);
          }
        }
      }
      if (!genSuccess) break;
      work = getCurrentWork();
      ch = work.chapters[idx];
      var after = ch && ch.content ? ch.content.length : 0;
      if (after < 200 || after <= before) {
        pipelineStatus('⚠️ 第' + n + '章生成内容不足，流水线已暂停', false);
        showToast('第' + n + '章内容不足，已暂停流水线', 4500);
        break;
      }
      try {
        saveChapter();
        if (DB.flush) DB.flush();
        if (DB.performAutoBackup && (done + 1) % 5 === 0) DB.performAutoBackup(true);
      } catch(saveErr) { console.warn('[pipeline save]', saveErr); }
      var score = getPipelineChapterScore(work, idx);
      done++;
      var repairedOk = await autoRepairIfLowV46(work, idx, pauseScore);
      if (repairedOk) {
        work = getCurrentWork();
        score = getPipelineChapterScore(work, idx);
        pipelineStatus('✅ 第' + n + '章低分已自动局部修复，继续流水线…');
      }
      if (score.chain && score.chain < pauseScore) {
        pipelineStatus('⚠️ 第' + n + '章全链路一致性 ' + score.chain + ' 分，自动修复后仍低于阈值 ' + pauseScore + '，已暂停', false);
        showToast('流水线暂停：第' + n + '章一致性偏低', 5000);
        break;
      }
      if (score.quality && score.quality < 55) {
        pipelineStatus('⚠️ 第' + n + '章质量分 ' + score.quality + '，自动修复后仍偏低，已暂停等待人工检查', false);
        showToast('流水线暂停：第' + n + '章质量偏低', 5000);
        break;
      }
      pipelineStatus('✅ 第' + n + '章完成，准备下一章…');
      // v48: 章节间短等待 100ms 即可，无需长等待
      if (n < end) await pipelineSleep(100);
    }
  } finally {
    _chapterPipelineRunning = false;
    if (stopBtn) stopBtn.style.display = 'none';
    try { if (DB.flush) DB.flush(); if (DB.performAutoBackup) DB.performAutoBackup(true); } catch(e) {}
    if (_chapterPipelineCancel) {
      pipelineStatus('⏹ 流水线已停止：完成 ' + done + ' 章，跳过 ' + skipped + ' 章', false);
    } else {
      pipelineStatus('🏁 流水线结束：完成 ' + done + ' 章，跳过 ' + skipped + ' 章', true);
    }
    showToast('流水线结束：完成' + done + '章，跳过' + skipped + '章', 5000);
  }
}

async function aiWriteChapter(opts){
  opts = opts || {};
  var _writeIteration = opts._iteration || 0;
  var _writeExtraHint = opts.extraHint || '';
  var _writeBest = opts._prevBest || null;  // 之前的最佳结果 {text, score}
  var _prevSkeleton = opts._prevSkeleton || '';  // 上一轮骨架，迭代时复用避免重新生成
  var _prevResult = opts._prevResult || '';  // 上一轮生成结果，迭代时用于增量改进

  const work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
  // 第一次生成：resetLoading 从 0 起步；迭代时只更新文字，保持进度连续推进
  if (_writeIteration === 0 && typeof resetLoading === 'function') {
    resetLoading('正在生成章节…');
  } else if (typeof showLoading === 'function') {
    showLoading('第' + (_writeIteration + 1) + '轮生成中…');
  }
  // ===== 作品锁定：记录当前作品ID，生成完成前不允许切换作品写入 =====
  var _editLockWorkId = work.id;
  var _editLockFp = getCurrentWorkFingerprint(work);
  function _checkStillSameWork(msg){
    var cur = getCurrentWork();
    if(!cur || cur.id !== _editLockWorkId){
      if(msg) showToast('⚠️ ' + msg + '：作品已切换，已中止', 5000);
      return false;
    }
    if(_editLockFp && cur._fingerprint && cur._fingerprint !== _editLockFp){
      showToast('⚠️ 作品数据已更新，已中止当前操作', 5000);
      return false;
    }
    return true;
  }
  const content=document.getElementById('editor').value;
  const chapterIdx = currentChapterIdx || 0;
  
  // 显示API状态 + 本卷信息（v57: 更细致的阶段进度）
  const statusBar = document.getElementById('api-status-bar');
  const config = DB.getApiConfig();
  // 记录本卷信息，显示在状态条中
  var _curVolInfo = null;
  try {
    var _v = getCurrentVolumeDetail(work, chapterIdx);
    if (_v && _v.volLabel) {
      var _chInVol = (chapterIdx || 0) - (_v.currentIdx * _v.volSize) + 1;
      if (_chInVol < 1) _chInVol = 1;
      var _totalChInVol = (_v.volEndChapter && _v.volStartChapter)
        ? (_v.volEndChapter - _v.volStartChapter + 1)
        : (_v.volSize || '?');
      _curVolInfo = _v.volLabel + '（本卷第' + _chInVol + '/' + _totalChInVol + '章）';
    }
  } catch(_) {}
  var _stageInfo = _curVolInfo ? '[' + _curVolInfo + ']' : '';

  // 构建章节prompt（已含流派expertise和longMemory上下文）
  // 读取用户指令框内容，确保用户的提示词在生成时生效
  var userCmd = (document.getElementById('ai-input')?.value || '').trim();
  // 迭代时优先从已保存的 work._lastUserCmd 取（防止用户中途清空输入框导致指令丢失）
  if (_writeIteration > 0 && work._lastUserCmd && work._lastUserCmd.trim()) {
    userCmd = work._lastUserCmd;
  }
  // 保存用户指令到作品元数据，供质量评价引擎检查指令遵循度
  // 只有原始调用（非迭代）时才更新，迭代时应保留原始用户指令
  if (userCmd && !_writeIteration) {
    work._lastUserCmd = userCmd;
  }
  if (statusBar) {
    statusBar.style.display = 'block';
    statusBar.style.background = '#e0e7ff';
    statusBar.style.color = '#3730a3';
    statusBar.textContent = '🧠 ' + _stageInfo + ' 1/3 · 正在构建章节上下文…';
  }
  // ====== 核心优化：骨架和完整prompt只生成一次，后续迭代直接复用 ======
  if (_writeIteration === 0) {
    // ✅ 第1轮：构建完整骨架prompt + 生成骨架（最多3次自检）
    if (statusBar) {
      statusBar.style.display = 'block';
      statusBar.style.background = '#e0e7ff';
      statusBar.style.color = '#3730a3';
      statusBar.textContent = '🧠 ' + _stageInfo + ' 1/3 · 正在构建章节上下文…';
    }
    prompt = buildChapterPrompt(work, chapterIdx, content, userCmd);

    // ===== 骨架生成 + AI自检：最多3次，不通过自动重写 =====
    var skeletonPassed = true;
    var skFinalText = '';
    if(userCmd){
      var skBasePrompt = '你是一位网文写手。请为以下章节先生成一个简要骨架（100-200字），然后自检是否符合用户指令。\n\n';
      skBasePrompt += '【用户指令 · 最高优先级】\n' + userCmd + '\n\n';
      skBasePrompt += '【本章标题】' + (work.chapters[chapterIdx]?.title || '第'+(chapterIdx+1)+'章') + '\n';
      skBasePrompt += '【作品题材】' + getWorkGenre(work) + '\n';
      if(work.detail){
        var _sd2 = getCurrentVolumeDetail(work, chapterIdx);
        if (_sd2 && _sd2.neighbor) {
          skBasePrompt += '【本卷细纲】' + smartTruncate(_sd2.neighbor, 400) + '\n';
        } else {
          var detailChapters2 = work.detail.split(/(?=(?:第[一二三四五六七八九十百千\d]+章|Chapter\s*\d+))/gi);
          var dIdx2 = chapterIdx + 1;
          if(detailChapters2.length > dIdx2) skBasePrompt += '【本章细纲】' + smartTruncate(detailChapters2[dIdx2], 400) + '\n';
        }
      }
      skBasePrompt += '\n请按以下格式输出：\n';
      skBasePrompt += '【章纲骨架】\n（100-200字，列出本章核心事件、冲突、结尾钩子）\n\n';
      skBasePrompt += '【自检】\n逐条检查用户指令是否在骨架中体现。\n\n';
      skBasePrompt += '【结论】\n写"通过"或"不通过"。\n';
      skBasePrompt += '\n直接输出，不要加对话语前缀。';

      var skAttemptResult = null;
      for(var skAt = 1; skAt <= 3; skAt++){
        if(statusBar){
          statusBar.style.display = 'block';
          statusBar.style.background = '#fef3c7';
          statusBar.style.color = '#92400e';
          statusBar.textContent = '🧠 ' + _stageInfo + ' 2/3 · 章纲骨架（第' + skAt + '/3次）…';
        }
        if(typeof updateLoadingProgress === 'function') updateLoadingProgress(5, '🧠 骨架自检 ' + skAt + '/3…');

        var skPromptNow = skBasePrompt;
        if(skAttemptResult && skAttemptResult.trim()){
          skPromptNow += '\n\n【⚠️ 上一次骨架自检不通过，请根据用户指令和以下问题重写骨架】\n' + skAttemptResult.slice(0, 400);
        }

        try {
          var skResult = await callRealAPIWithFallback(skPromptNow, null, 'default', 300, true);
          if(!_checkStillSameWork('章纲骨架生成中')) return;

          if(skResult && skResult.trim()){
            var skText2 = skResult.trim();
            var conMatch = skText2.match(/【结论】\s*\n?\s*(.+?)(?:\n|$)/);
            var con = conMatch ? conMatch[1].trim() : '';

            if(con && (con.indexOf('不通过') >= 0 || con.indexOf('不符合') >= 0)){
              skAttemptResult = skText2;
              if(skAt < 3){
                showToast('⚠️ 骨架第' + skAt + '次自检不通过，正在自动重写…', {duration: 2000});
                continue;
              } else {
                skeletonPassed = false;
                skFinalText = skText2;
                if(statusBar){
                  statusBar.style.background = '#fef3c7';
                  statusBar.style.color = '#92400e';
                  statusBar.textContent = '⚠️ ' + _stageInfo + ' 2/3 · 骨架3次自检仍不通过，已注入修正提示继续生成';
                }
                break;
              }
            } else {
              skeletonPassed = true;
              skFinalText = skText2;
              if(statusBar){
                statusBar.style.background = '#dcfce7';
                statusBar.style.color = '#166534';
                statusBar.textContent = '✅ ' + _stageInfo + ' 2/3 · 骨架通过自检（第' + skAt + '次），开始生成正文…';
              }
              break;
            }
          } else {
            if(skAt === 3) break;
          }
        } catch(skErr2) { console.warn('[章纲骨架] 失败:', skErr2); }
      }
    }

    // 注入骨架到 prompt 开头
    if(skFinalText){
      prompt = '【章纲骨架' + (skeletonPassed ? '（已通过自检）' : '（需修正）') + '】\n' + skFinalText + '\n\n' + prompt;
    }

    // ✅ 缓存完整prompt（骨架+所有上下文），供后续迭代直接复用，不再重建
    work._cachedChapterPrompt = prompt;
  } else {
    // ⚡ 第2/3轮：增量改进模式，基于上一轮结果进行优化
    if (!work._cachedChapterPrompt) {
      prompt = buildChapterPrompt(work, chapterIdx, content, userCmd);
    } else {
      prompt = work._cachedChapterPrompt;
    }
    // ⚡ 注入上一轮结果和改进提示，实现增量优化
    if (_prevResult && _writeExtraHint) {
      prompt = '【上一轮生成结果】\n' + _prevResult + '\n\n' + 
        '【改进要求】\n' + _writeExtraHint + '\n\n' + 
        '【优化策略】\n' + 
        '1. 保留上一轮中做得好的部分（已在上面列出）\n' + 
        '2. 针对问题部分进行修改和补充\n' + 
        '3. 不要完全重写，只做必要的改进\n' + 
        '4. 保持整体结构和叙事节奏\n' + 
        '5. 输出完整的优化后章节内容：\n\n' + 
        prompt;
    }
  }

  // ===== 质量迭代块已移到 API 调用和质量评估之后（见下方）======

  // 显示输入token估算 + 进入正文生成阶段
  var estTokens = Math.round(prompt.length * 1.5);
  var estTokensDisplay = estTokens >= 1000 ? (estTokens / 1000).toFixed(1) + 'k' : estTokens;
  if(statusBar){
    statusBar.style.display = 'block';
    statusBar.style.background = '#dbeafe';
    statusBar.style.color = '#1e40af';
    statusBar.textContent = '🤖 ' + _stageInfo + ' 3/3 · 正在生成「' + (work.chapters[chapterIdx]?.title || '第'+(chapterIdx+1)+'章') + '」 · 输入约' + estTokensDisplay + ' tokens';
  }
  
  // 备份旧内容
  var oldContent = content;
  
  // 先尝试API（自动遍历所有服务商），失败则使用本地AI
  // v46：多AI模式时使用 callMultiAI 并行请求
  // 进度按迭代轮次分段推进：第1轮 5→45%，第2轮 45→75%，第3轮 75→95%，最后100%
  if (typeof updateLoadingProgress === 'function') {
    var _startPct = 5 + _writeIteration * 35;
    updateLoadingProgress(_startPct, '第' + (_writeIteration + 1) + '轮 · AI正在生成正文（输入约' + Math.round(prompt.length * 1.5 / 1000) + 'k tokens）…');
  }
  var aiCaller = (window.callMultiAI && DB.settings && DB.settings.multiAI) ? window.callMultiAI : window.callRealAPIWithFallback;
  // v66: 转为 messages 数组，让服务商缓存固定前缀
  // v66: 提高到 131072 (128K)，确保长文本不被截断
  var _msgPrompt = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];
  let result = await aiCaller(_msgPrompt, null, 'write_normal', 131072); // v66: 目标 8万字+，确保长文本不被截断

  if(!_checkStillSameWork('正文生成中')) return;

  if(result){
    // ===== AI结果校验 =====
    var validationError = null;
    if (result.length < 50) {
      validationError = '生成内容过短（仅' + result.length + '字），可能是API异常';
    } else if (result.includes('你是') && result.includes('网文写作') && result.includes('助手')) {
      validationError = '检测到prompt泄露，AI未正常生成内容';
    }
    // 题材违禁词检测
    var genre = work.genre || (work.category && work.category.cat1) || '';
    if (genre.indexOf('历史') >= 0) {
      var banWords = ['空间戒指','储物袋','系统面板','炼丹','灵气','功法秘籍','修仙者','穿越者用现代'];
      for (var bw = 0; bw < banWords.length; bw++) {
        if (result.indexOf(banWords[bw]) >= 0) {
          validationError = '历史题材检测到违禁元素"' + banWords[bw] + '"，请检查内容是否跑题';
          break;
        }
      }
    }
    if (validationError) {
      if(statusBar){
        statusBar.style.background = '#fef3c7';
        statusBar.style.color = '#92400e';
        statusBar.textContent = '⚠️ ' + _stageInfo + ' ' + validationError + ' — 已保留旧内容';
      }
      showToast('⚠️ ' + validationError, 5000);
      return;
    }

    // 字数校验：过短时自动补写，确保章节完整性（不再限制上限）
    if (result.length < 8000) {
      if(statusBar) statusBar.textContent = '⚠️ ' + _stageInfo + ' 3/3 · 字数偏短(' + result.length + '字)，自动补写至完整章节…';
      showToast('正在自动补写，确保章节完整…', 2000);
      var extendPrompt = '你是网文续写助手。以下是一章未完成的内容，请续写补齐至12000字以上，确保剧情完整、节奏紧凑。\n\n';
      extendPrompt += '【已有内容】\n' + result + '\n\n';
      extendPrompt += '【要求】\n1. 从已有内容结尾处自然衔接\n2. 补充剧情细节、对话、场景描写、冲突递进\n3. 新写内容4000-12000字，使总字数达到12000+\n4. 保持文风和叙事节奏一致\n5. 不要重复已有内容\n6. 结尾要有明确的悬念/钩子\n\n请直接输出补写段落：';
      try {
        var extendResult = await callRealAPIWithFallback(extendPrompt, null, 'fill', 20000, true);
        if (extendResult && extendResult.length > 100) {
          result = result + '\n\n' + extendResult;
          if(statusBar) statusBar.textContent = '✅ ' + _stageInfo + ' 3/3 · 补写完成（' + result.length + '字）';
        }
      } catch(e) { console.warn('[字数补写] 失败:', e); }
      if(!_checkStillSameWork('字数补写中')) return;
    }
    // 不再设置字数上限，允许大模型自由输出完整内容

    // === v29: 质量打分 ===
    var _qReport = null;
    try {
      if (typeof QualityEngine !== 'undefined') {
        var _prev = chapterIdx > 0 && work.chapters[chapterIdx-1] ? (work.chapters[chapterIdx-1].content || '') : '';
        _qReport = QualityEngine.score(result, { work: work, prevContent: _prev, genre: genre });
        QualityEngine.attach(work, chapterIdx, _qReport);
      }
    } catch(e) { console.warn('[quality]', e); }

    // === v56: 黄金开头自检 · 仅第一章 ===
    var goldenCheck = null;
    if (chapterIdx === 0) {
      try {
        goldenCheck = checkGoldenOpening(result, work);
        if (goldenCheck.issues.length > 0) {
          if(statusBar){
            statusBar.style.background = '#fef3c7';
            statusBar.style.color = '#92400e';
            statusBar.textContent = '⚠️ ' + _stageInfo + ' 黄金开头检查：' + goldenCheck.issues.slice(0,1).join('') + ' | 建议重写';
          }
          showToast('⚠️ 黄金开头未达标：' + goldenCheck.issues.slice(0, 2).join('、') + '…', {duration:6000});
        }
        if (_qReport) _qReport._goldenCheck = goldenCheck;
      } catch(e) { console.warn('[黄金开头检查]', e); }
    }

    if (!(goldenCheck && goldenCheck.issues.length > 0)) {
      if(statusBar){
        statusBar.style.background = '#dcfce7';
        statusBar.style.color = '#166534';
        var _scoreTxt = _qReport ? '，质量分 ' + _qReport.score + '/100' : '';
        // 显示用户指令遵循度
        var _cmdFollowTip = '';
        if (_qReport && _qReport.dimensions) {
          for (var _dsi = 0; _dsi < _qReport.dimensions.length; _dsi++) {
            if (_qReport.dimensions[_dsi].name === '指令遵循') {
              _cmdFollowTip = '，指令遵循 ' + _qReport.dimensions[_dsi].score + '/10';
              if (_qReport.dimensions[_dsi].score < 7) {
                _cmdFollowTip += ' ⚠️';
                statusBar.style.background = '#fef3c7';
                statusBar.style.color = '#92400e';
              }
              break;
            }
          }
        }
        statusBar.textContent = '✅ ' + _stageInfo + ' 3/3 · 已生成 ' + result.length + ' 字' + _scoreTxt + _cmdFollowTip;
        if (_qReport && _qReport.weaknesses.length) {
          statusBar.textContent += ' · 短板：' + _qReport.weaknesses.slice(0,2).join('、');
        }
      }
    }

    // ====== 质量迭代（接续上方评价之后）：追加上一轮草稿 + 改进提示 ======
    // 核心优化：骨架和完整prompt只生成一次；评价和迭代在API调用之后判断
    var _currentScore = _qReport && typeof _qReport.score === 'number' ? _qReport.score : 0;
    if (!_writeBest || _currentScore > _writeBest.score) {
      _writeBest = { text: result, score: _currentScore };
    }

    var _cmdFollowScore = 10;
    if (_qReport && _qReport.dimensions) {
      for (var _df = 0; _df < _qReport.dimensions.length; _df++) {
        if (_qReport.dimensions[_df].name === '指令遵循') {
          _cmdFollowScore = _qReport.dimensions[_df].score;
          break;
        }
      }
    }

    // 安全机制：如果本轮分数比上一轮最佳低5分以上，说明越改越差，回退
    var _scoreDropped = _writeBest && _currentScore < _writeBest.score - 5;
    if (_scoreDropped) {
      result = _writeBest.text;
    }

    // 进度更新：每轮完成后推进到阶段性点
    var _midPct = 45 + _writeIteration * 30;
    if (typeof updateLoadingProgress === 'function') {
      updateLoadingProgress(_midPct, '第' + (_writeIteration + 1) + '轮完成 · ' + _currentScore + '分');
    }

    // 检查是否需要继续迭代
    var _shouldIterate = _qReport && typeof _qReport.score === 'number'
      && _writeIteration < 3
      && (_currentScore < 90 || _cmdFollowScore < 6)
      && !_scoreDropped;

    if (_shouldIterate) {
      if (statusBar) {
        statusBar.style.background = '#fef3c7';
        statusBar.style.color = '#92400e';
        statusBar.textContent = '🔄 自动迭代中 · 当前' + _currentScore + '分 · 第' + (_writeIteration + 1) + '/3轮 · 目标90+';
      }
      var _nextHint = '';
      var _hintLines = [];
      _hintLines.push('当前评分 ' + _currentScore + '/100' + (_cmdFollowScore < 6 ? '（用户指令遵循度' + _cmdFollowScore + '/10）' : '') + '，请针对以下问题进行优化：');
      if (_qReport.dimensions && _qReport.dimensions.length) {
        var _dimCount = 0;
        for (var _di3 = 0; _di3 < _qReport.dimensions.length; _di3++) {
          var _dim3 = _qReport.dimensions[_di3];
          if (_dim3 && (_dim3.score / _dim3.max) < 0.85 && _dimCount < 3) {
            if (_dim3.issues && _dim3.issues.length) {
              _hintLines.push('- ' + _dim3.name + '：' + _dim3.issues.slice(0, 1).join('；'));
              _dimCount++;
            }
          }
        }
      }
      if (_cmdFollowScore < 6 && work._lastUserCmd) {
        _hintLines.push('- 必须严格体现用户指令：' + work._lastUserCmd);
      }
      if (_qReport.strengths && _qReport.strengths.length) {
        _hintLines.push('\n【本轮已做得好的地方请继续保持：' + _qReport.strengths.slice(0, 2).join('；'));
      }
      _nextHint = _hintLines.join('\n');
      // ⚡ 递归调用：增量改进模式，传递上一轮结果供AI优化
      return aiWriteChapter({
        _iteration: _writeIteration + 1,
        extraHint: _nextHint,
        _prevBest: _writeBest,
        _prevSkeleton: skFinalText,
        _prevResult: result
      });
    }

    // ===== 迭代结束：写入作品 =====
    var _finalScore = _writeBest ? _writeBest.score : _currentScore;
    var _finalResult = _writeBest ? _writeBest.text : result;
    result = _finalResult;
    if (typeof updateLoadingProgress === 'function') {
      updateLoadingProgress(100, '✅ 生成完成 · 最终' + _finalScore + '分 · 共' + (_writeIteration + 1) + '轮');
    }
    var _qBannerId = 'quality-banner';
    var _oldBanner = document.getElementById(_qBannerId);
    if (_oldBanner) _oldBanner.remove();
    var _banner = document.createElement('div');
    _banner.id = _qBannerId;
    var _scoreColor = _finalScore >= 90 ? '#10b981' : _finalScore >= 75 ? '#f59e0b' : '#ef4444';
    var _scoreBg = _finalScore >= 90 ? '#d1fae5' : _finalScore >= 75 ? '#fef3c7' : '#fee2e2';
    var _dimsStr = '';
    if (_qReport && _qReport.dimensions && _qReport.dimensions.length) {
      _qReport.dimensions.forEach(function(d) {
        var ds = Math.round((d.score / d.max) * 10);
        var dc = ds >= 8 ? '#10b981' : ds >= 6 ? '#f59e0b' : '#ef4444';
        _dimsStr += '<span style="display:inline-block;background:#f3f4f6;color:' + dc + ';padding:2px 10px;border-radius:10px;font-size:12px;margin:2px;font-weight:600;">' + d.name + ' ' + ds + '</span>';
      });
    }
    _banner.style.cssText = 'background:' + _scoreBg + ';border-left:4px solid ' + _scoreColor + ';padding:10px 14px;margin:8px 12px;border-radius:8px;font-size:13px;line-height:1.8;';
    _banner.innerHTML = '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">'
      + '<span style="font-size:20px;font-weight:800;color:' + _scoreColor + ';">' + _finalScore + '</span>'
      + '<span style="color:#374151;font-weight:600;">分 · 共' + (_writeIteration + 1) + '轮生成 · ' + result.length + '字</span>'
      + '</div>'
      + '<div style="margin-top:4px;">' + _dimsStr + '</div>';
    var _editorEl = document.getElementById('editor');
    if (_editorEl && _editorEl.parentNode) {
      _editorEl.parentNode.insertBefore(_banner, _editorEl);
    }
    if (typeof hideLoading === 'function') {
      setTimeout(function() { hideLoading(); }, 100);
    }
    if(!_checkStillSameWork('保存章节')) return;
    DB.saveWork(work);
    showToast('✅ 生成完成 · 最终' + _finalScore + '分 · 共' + (_writeIteration + 1) + '轮', 6000);
    setTimeout(function(){ showPolishRecommend(); }, 500);

    // ===== 正文不自动续写，保持用户可控性 =====
    document.getElementById('editor').value = result;
    // 双级备份用于撤销（保留上上次内容）
    window._editorBackup2 = window._editorBackup;
    window._editorBackup = oldContent;
    // 显示撤销按钮
    var undoBtn = document.getElementById('undo-btn');
    if (undoBtn) undoBtn.style.display = 'inline-block';
    // 保存到章节
    const ch = work.chapters[chapterIdx];
    // v52: 保存AI原始输出，用于用户编辑学习
    ch._aiOriginal = result;
    ch.content = result;
    ch.wordCount = result.length;
    // 同步章节标题到输入框
    if(ch.title) document.getElementById('ch-title').value = ch.title;
    updateWordCount();
    
    // 细纲覆盖率检测
    if (work.detail) {
      const detailLines = work.detail.split('\n').filter(l => l.trim().length > 5 && (l.includes('场景') || l.includes('■') || /\d+[.、]/.test(l)));
      const covered = detailLines.filter(l => result.includes(l.slice(0, 8))).length;
      const rate = detailLines.length ? Math.round(covered / detailLines.length * 100) : 100;
      if (rate < 70 && detailLines.length > 0) {
        const missed = detailLines.filter(l => !result.includes(l.slice(0, 8)));
        if (missed.length > 0) {
          showToast('细纲覆盖率' + rate + '%，正在自动补写' + missed.length + '个遗漏场景...', 3000);
          const contextBefore = result.slice(-500);
          const fillPrompt = '你是网络小说续写助手。当前为第' + (chapterIdx + 1) + '章，细纲要求包含以下场景点，但正文中遗漏了。\n\n遗漏场景点（共' + missed.length + '个）：\n' + missed.slice(0, 8).join('\n') + '\n\n【策略】\n1. 仔细阅读已有正文末尾\n2. 将遗漏场景自然地衔接到已有内容中\n3. 新写内容字数不少于1500字，可根据情节需要扩展至3000字\n4. 不要重复已有叙述，直接补写缺失情节\n5. 每个场景点必须包含明确的冲突推进和悬念\n\n【已有正文末尾】\n' + contextBefore + '\n\n请直接输出补写段落：';
          
          try {
            const fillResult = await callRealAPIWithFallback(fillPrompt, null, 'fill', 3000);
            if(!_checkStillSameWork('细纲补写中')) return;
            if (fillResult) {
              // v52: 保存AI原始（含补写），用于用户编辑学习
              ch._aiOriginal = result + '\n\n' + fillResult;
              ch.content = result + '\n\n' + fillResult;
              document.getElementById('editor').value = ch.content;
              updateWordCount();
              showToast('自动补写完成 -- 补充了' + missed.length + '个遗漏场景点');
            }
          } catch(e) {
            console.log('补写失败:', e);
          }
        }
      }
    }
    
    // v39：全链路一致性检查与反哺
    var _chainReport = null;
    try {
      _chainReport = runFullChainAfterWrite(work, chapterIdx, ch.content || result);
      if (_chainReport && _chainReport.score < 80) {
        showToast('全链路一致性 ' + _chainReport.score + '分：' + _chainReport.issues.slice(0,2).join('、'), 5000);
      }
    } catch(chainErr) { console.warn('[chain]', chainErr); }

    // 自动运行 checkEval 评分
    if (typeof checkEval === 'function') {
      try {
        const evalResult = checkEval(ch, chapterIdx, work);
        ch.evalCache = evalResult;
        const grade = typeof getGrade === 'function' ? getGrade(evalResult.total) : evalResult.total;
        showToast('评分：' + evalResult.total + '分(' + grade + ')', 4000);
      } catch(e) {
        console.log('自动评分失败:', e);
      }
    }
    
    // ===== 最终保存 =====
    var _qBannerId = 'quality-banner';
    var _oldBanner = document.getElementById(_qBannerId);
    if (_oldBanner) _oldBanner.remove();
    var _banner = document.createElement('div');
    _banner.id = _qBannerId;
    var _scoreColor = _finalScore >= 90 ? '#10b981' : _finalScore >= 75 ? '#f59e0b' : '#ef4444';
    var _scoreBg = _finalScore >= 90 ? '#d1fae5' : _finalScore >= 75 ? '#fef3c7' : '#fee2e2';
    var _dimsStr = '';
    if (_qReport && _qReport.dimensions && _qReport.dimensions.length) {
      _qReport.dimensions.forEach(function(d) {
        var ds = Math.round((d.score / d.max) * 10);
        var dc = ds >= 8 ? '#10b981' : ds >= 6 ? '#f59e0b' : '#ef4444';
        _dimsStr += '<span style="display:inline-block;background:#f3f4f6;color:' + dc + ';padding:2px 10px;border-radius:10px;font-size:12px;margin:2px;font-weight:600;">' + d.name + ' ' + ds + '</span>';
      });
    }
    _banner.style.cssText = 'background:' + _scoreBg + ';border-left:4px solid ' + _scoreColor + ';padding:10px 14px;margin:8px 12px;border-radius:8px;font-size:13px;line-height:1.8;';
    _banner.innerHTML = '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">'
      + '<span style="font-size:20px;font-weight:800;color:' + _scoreColor + ';">' + _finalScore + '</span>'
      + '<span style="color:#374151;font-weight:600;">分 · 共' + (_writeIteration + 1) + '轮生成 · ' + result.length + '字</span>'
      + '</div>'
      + '<div style="margin-top:4px;">' + _dimsStr + '</div>';
    var _editorEl = document.getElementById('editor');
    if (_editorEl && _editorEl.parentNode) {
      _editorEl.parentNode.insertBefore(_banner, _editorEl);
    }
    if (typeof hideLoading === 'function') {
      setTimeout(function() { hideLoading(); }, 100); // 100%已在updateLoadingProgress中设置，hideLoading会在2秒后淡出
    }
    if(!_checkStillSameWork('保存章节')) return;
    DB.saveWork(work);
    showToast('✅ 生成完成 · 最终' + _finalScore + '分 · 共' + (_writeIteration + 1) + '轮', 6000);
    setTimeout(function(){ showPolishRecommend(); }, 500);
    
  } else {
    statusBar.style.background = '#fef3c7';
    statusBar.style.color = '#92400e';
    statusBar.textContent = 'API调用失败，使用本地模板生成。请检查设置中的API密钥。';
    if(window.ContentGenerator){
      result = window.ContentGenerator.continueStory(content, work, '续写1000字');
    }
    if(result){
      document.getElementById('editor').value = content + '\n\n' + result;
      updateWordCount();
    }
  }
}

// 润色类型映射（从checkEval维度名到润色指令）
const POLISH_DIM_MAP = {
  '开篇质量': { label: '开篇', icon: '🔥', req: '重点强化开篇吸引力：第1句直接切入冲突/危机/动作，前200字交代主角身份和核心矛盾，避免大段环境描写和背景介绍。' },
  '爽点系统': { label: '爽点', icon: '⚡', req: '重点强化爽点设计：增加"委屈→爆发"完整链路，确保有冲突爆发、收获升级、打脸反击等爽点情节，爽点密度≥1个/300字。' },
  '节奏控制': { label: '节奏', icon: '🎵', req: '重点优化节奏控制：拆分过长段落（>50字），增加短句（<20字）和短段落制造紧张感，确保长短交替，紧张处独立成段。' },
  '情绪外化': { label: '情绪', icon: '🎭', req: '重点强化情绪外化：删除"他想/她觉得/心里"等心理描写，改用手部动作（握拳/发抖/指节发白）、生理反应（冷汗/心跳/血）来外化情绪。' },
  '对话质量': { label: '对话', icon: '💬', req: '重点优化对话质量：用动作前缀替代"XX说/道"，增加对话冲突和对抗，让对话简短有力（≤30字/句），加入潜台词和言外之意。' },
  '钩子设计': { label: '钩子', icon: '🪝', req: '重点强化钩子设计：章尾增加悬念词（谁/什么/为什么/究竟/到底），确保未解决核心冲突，制造"卡脖子"追读感，避免平淡收尾。' },
  '原创度': { label: '原创', icon: '✨', req: '重点消除套路化表达：替换"眼神一冷/瞳孔一缩/嘴角勾起/淡淡道/冷冷道/缓缓开口/千钧一发/空气凝固"等，降低"的"字密度。' },
  '结构规范': { label: '结构', icon: '📐', req: '重点优化结构：确保字数1500-5000字，段落分布合理，无连续标点错误，章节有清晰起承转合。' },
  '人物一致': { label: '人物', icon: '👤', req: '重点强化人物一致性：确保角色行为符合人设，增加外貌/性格标签，让每个角色有独特记忆点和辨识度。' },
  '逻辑自治': { label: '逻辑', icon: '🧩', req: '重点检查逻辑：时间跳转合理（≤3处），战力无崩坏（无不合理越级秒杀），因果链清晰自洽。' },
  '追读潜力': { label: '追读', icon: '📖', req: '重点提升追读感：中段每800字设置一个悬念钩子，章尾强烈留白，让读者忍不住点下一章。' },
  '平台适配': { label: '平台', icon: '📱', req: '重点优化平台适配：起点需2500-4000字+开篇冲突+爽点；番茄需1500-3000字+快节奏+爽点密集。' }
};

async function aiPolish(polishType){
  const content=document.getElementById('editor').value;
  if(!content){showToast('请先输入内容');return;}
  const work=getCurrentWork();
  const chapterIdx=currentChapterIdx||0;
  
  // 如果没有指定润色类型，自动找薄弱点
  let targetDim = polishType;
  if (!targetDim || targetDim === 'auto') {
    const ch = work ? work.chapters[chapterIdx] : null;
    const ev = ch && ch.evalCache ? ch.evalCache : null;
    if (ev && ev.dims) {
      // 找最低分维度
      const weakest = ev.dims.slice().sort((a, b) => a.score - b.score)[0];
      if (weakest && weakest.score < 75) {
        targetDim = weakest.name;
        showToast('🔍 自动识别薄弱点：' + weakest.name + '（' + weakest.score + '分）');
      }
    }
    if (!targetDim) targetDim = '一键';
  }
  
  // 获取润色指令
  let extraReq = '';
  const dimInfo = POLISH_DIM_MAP[targetDim];
  if (dimInfo) {
    extraReq = dimInfo.req;
  } else if (targetDim === '一键') {
    extraReq = '全面润色：优化文笔、强化节奏、丰富描写、提升对话质量、消除AI痕迹。';
  }
  
  // 构建带上下文的润色prompt
  let prompt='你是一位专业网文编辑，请润色以下章节内容。\n\n';
  if(work){
    prompt+='【作品】'+work.title+'\n';
    prompt+='【题材】'+getWorkGenre(work)+'\n';
    var archLimits = getArchTruncationLimits();
    var worldLimit = archLimits ? Math.min(archLimits.world, 3000) : 0;
    var charsLimit = archLimits ? Math.min(archLimits.chars, 2000) : 0;
    if(work.world && worldLimit > 0) prompt+='【世界观】'+smartCompressArch(work.world, worldLimit)+'\n\n';
    else if(work.world) prompt+='【世界观】'+work.world+'\n\n';
    if(work.chars && charsLimit > 0) prompt+='【人物】'+smartCompressArch(work.chars, charsLimit)+'\n\n';
    else if(work.chars) prompt+='【人物】'+work.chars+'\n\n';
    // 注入本章细纲
    var dl = getDetailLineForChapter(work, chapterIdx);
    if (dl) prompt += '【本章细纲（润色后必须符合）】\n' + dl.slice(0, 600) + '\n\n';
    // 注入前文衔接
    if (chapterIdx > 0 && work.chapters[chapterIdx - 1]) {
      var prevCh = work.chapters[chapterIdx - 1];
      var prevSummary = prevCh.summary || ((prevCh.content || '').replace(/\n/g, ' ').substring(0, 200));
      if (prevSummary) prompt += '【上一章摘要（保持衔接）】' + prevSummary + '\n\n';
    }
    // 注入本章质量短板
    var ch = work.chapters[chapterIdx];
    if (ch && ch.evalCache && ch.evalCache.dims) {
      var weakDims = ch.evalCache.dims.filter(function(d){ return d.score < 70; });
      if (weakDims.length) {
        prompt += '【本章质量短板（润色必须补强）】\n';
        weakDims.forEach(function(d, i){ prompt += (i+1) + '. ' + d.name + '（' + d.score + '分）\n'; });
        prompt += '\n';
      }
    }
    // 注入记忆要点
    var memCtx = buildMemoryContext(work, chapterIdx);
    if (memCtx) {
      var memLimit = archLimits ? 800 : 3000;
      var shortMem = memCtx.length > memLimit ? memCtx.substring(0, memLimit) + '...(记忆已截断)' : memCtx;
      prompt += '【关键记忆（人物状态/伏笔/关系不能冲突）】\n' + shortMem + '\n\n';
    }
  }
  prompt+='【润色要求】\n';
  prompt+='1. 保持原有剧情、角色、对话不变\n';
  prompt+='2. 提升文笔：优化描写、增强画面感、丰富感官细节\n';
  prompt+='3. 改善节奏：删除冗余，加快紧凑感\n';
  prompt+='4. 强化对话：让角色说话更有个性\n';
  prompt+='5. 保持原文风格和语气\n';
  if (extraReq) prompt+='6. ' + extraReq + '\n';
  prompt+='7. 直接输出润色后的完整正文，不要加解释\n\n';
  prompt+='【正文】\n'+content;
  
  let result = await callRealAPIWithFallback(prompt, null, 'quality_polish', Math.max(600, Math.floor(content.length * 1.1))); // v48: 控制润色输出长度
  if(!result && window.PolishEngine){
    showToast('使用本地润色...');
    result = window.PolishEngine.polish(content);
  }
  if(result){
    document.getElementById('editor').value=result;updateWordCount();
    showToast('✨ ' + (dimInfo ? dimInfo.label : '一键') + '润色完成');
    // 润色后重新评分
    if (typeof checkEval === 'function' && work) {
      const ch = work.chapters[chapterIdx];
      ch.content = result;
      ch.wordCount = result.length;
      delete ch.evalCache;
      const ev = checkEval(ch, chapterIdx, work);
      ch.evalCache = ev;
      DB.saveWork(work);
      setTimeout(function(){ showPolishRecommend(); }, 300);
    }
  }
}

// ========== v53: 正文评价（新引擎 + 卡片UI）==========
async function aiEvaluate(){
  const content=document.getElementById('editor').value;
  if(!content){showToast('请先输入内容');return;}
  const work=getCurrentWork();
  const chapterIdx=currentChapterIdx||0;

  // 1. 本地结构化评价（新引擎，12维度）
  var result = null;
  if(typeof QualityEngine !== 'undefined' && QualityEngine.evaluateText){
    result = QualityEngine.evaluateText(content, work);
  }

  // 2. AI 补充评价（可选）
  if(result && typeof callRealAPIWithFallback === 'function' && content.length > 100){
    if(typeof resetLoading === 'function') resetLoading('AI评价分析中…');
    else if(typeof showLoading === 'function') showLoading('AI评价分析中…');
    if(typeof updateLoadingProgress === 'function') updateLoadingProgress(35, 'AI评价分析中…');
    var evalPrompt = '你是一位资深网文编辑。请对以下章节内容进行专业评价。\n\n';
    if(work){
      evalPrompt += '【作品】'+work.title+'\n';
      evalPrompt += '【题材】'+getWorkGenre(work)+'\n\n';
    }
    evalPrompt += '请列出：\n1. 2-3条最具体的改进建议（针对文本内容，不要泛泛而谈）\n';
    evalPrompt += '2. 不要超过200字，用简短犀利的编辑口吻\n';
    evalPrompt += '【正文】\n' + content.slice(0, 2000);
    try{
      var aiReport = await callRealAPIWithFallback(evalPrompt, null, 'quality_logic', 400);
      if(aiReport && aiReport.trim() && aiReport.indexOf('暂不可用') === -1){
        result.aiReport = typeof cleanAIOutput === 'function' ? cleanAIOutput(aiReport) : aiReport;
        var aiLines = aiReport.split(/[\n。]/).filter(function(l){ return l.length > 10 && l.length < 60; });
        if(!result.suggestions) result.suggestions = [];
        result.suggestions = result.suggestions.concat(aiLines.slice(0, 3));
      }
    }catch(e){}
    if(typeof hideLoading === 'function') hideLoading();
  }

  // 3. 保存到作品
  if(work && result){
    try{
      if(!work.chapters) work.chapters = [];
      while(work.chapters.length <= chapterIdx) work.chapters.push({});
      work.chapters[chapterIdx]._quality = result;
      if(typeof DB !== 'undefined' && typeof DB.saveWork === 'function') DB.saveWork(work);
    }catch(e){}
  }

  // 4. 用卡片UI展示
  if(result && typeof EvalUI !== 'undefined' && EvalUI.show){
    EvalUI.show(result, function(r) { applyEvalFix(); });
  } else if(result){
    var msg = '【' + (result.moduleName || '正文') + '评价】\n' + (result.grade || '') + ' ' + (result.totalScore || '') + '/100\n';
    showEvalModal(msg);
    setTimeout(function(){ showPolishRecommend(); }, 300);
  }
}

function showEvalModal(text){
  var modal=document.getElementById('eval-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='eval-modal';
    modal.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999;display:none;align-items:center;justify-content:center;';
    modal.innerHTML='<div style="background:#fff;border-radius:16px;padding:20px;width:90%;max-width:400px;max-height:80vh;overflow-y:auto;"><div style="font-size:16px;font-weight:600;margin-bottom:12px;">&#128202; 写作评价</div><pre id="eval-content" style="white-space:pre-wrap;font-size:13px;line-height:1.6;color:#333;font-family:inherit;"></pre><div style="display:flex;gap:10px;margin-top:16px;"><button onclick="applyEvalFix()" id="eval-fix-btn" style="flex:1;padding:10px;border:none;border-radius:8px;background:#f59e0b;color:#fff;font-size:14px;cursor:pointer;">&#128295; 按评价修改</button><button onclick="document.getElementById(\'eval-modal\').style.display=\'none\'" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;color:#666;font-size:14px;cursor:pointer;">关闭</button></div></div>';
    document.body.appendChild(modal);
  }
  document.getElementById('eval-content').textContent=text;
  modal.style.display='flex';
}

// ========== v53: 按评价精准修改 —— 只修复低分维度，保留优点 ==========
async function applyEvalFix(){
  const work=getCurrentWork();
  const content=document.getElementById('editor').value;
  if(!content){showToast('没有内容可修改');return;}

  // 关闭旧弹窗
  try{ document.getElementById('eval-modal').style.display='none'; }catch(e){}
  if(typeof EvalUI !== 'undefined' && EvalUI.close) EvalUI.close();

  const chapterIdx=currentChapterIdx||0;
  var evalData = null;
  if(work && work.chapters && work.chapters[chapterIdx] && work.chapters[chapterIdx]._quality){
    evalData = work.chapters[chapterIdx]._quality;
  }

  const statusBar = document.getElementById('api-status-bar');
  statusBar.style.display = 'block';
  statusBar.style.background = '#dbeafe';
  statusBar.style.color = '#1e40af';
  statusBar.textContent = '🛠️ 正在按评价精准修复...';

  // 构建精准修复提示：只修复低分维度（≤5分），加入好坏标准
  var fixTargets = '';
  if(evalData && evalData.dimensions){
    var lowDims = evalData.dimensions.filter(function(d){ return d.score <= 5; });
    if(lowDims.length > 0){
      fixTargets += '【只修复以下低分维度，保持其他部分完全不变】\n';
      fixTargets += '【以下是每个维度的好坏标准，请认真学习后再改】\n';
      // 使用好坏标准学习指南
      if(typeof QualityEngine !== 'undefined' && QualityEngine.getFixGuide){
        fixTargets += QualityEngine.getFixGuide(evalData.dimensions);
      } else {
        lowDims.forEach(function(d){
          fixTargets += '- ' + d.name + '（' + d.score + '分）：' + (d.issues && d.issues.length ? d.issues[0] : '需提升') + '\n';
        });
      }
    }
    if(evalData.suggestions && evalData.suggestions.length){
      fixTargets += '\n【具体改进建议】\n';
      evalData.suggestions.slice(0, 3).forEach(function(s){ fixTargets += '- ' + s + '\n'; });
    }
  }
  if(!fixTargets && evalData && evalData.issues && evalData.issues.length){
    fixTargets = '【修复以下问题，其他部分保持不变】\n';
    evalData.issues.slice(0, 5).forEach(function(iss){ fixTargets += '- ' + iss + '\n'; });
  }
  if(!fixTargets){ fixTargets = '请全面优化本章的文字质量，提升写作水平\n'; }

  let prompt='你是一位专业网文编辑。请根据评价建议，对正文进行精准修改。\n\n';
  prompt+='【作品】'+(work?work.title:'')+'\n';
  var archLimits2 = getArchTruncationLimits();
  if(work&&work.world){
    var wl = archLimits2 ? Math.min(archLimits2.world, 2000) : 0;
    prompt += wl > 0 ? '【世界观】'+smartCompressArch(work.world, wl)+'\n\n' : '【世界观】'+work.world+'\n\n';
  }
  if(work&&work.chars){
    var cl = archLimits2 ? Math.min(archLimits2.chars, 1500) : 0;
    prompt += cl > 0 ? '【人物】'+smartCompressArch(work.chars, cl)+'\n\n' : '【人物】'+work.chars+'\n\n';
  }

  prompt += fixTargets + '\n\n';
  prompt += '【原文】\n'+content+'\n\n';
  prompt += '【修改原则】\n';
  prompt += '1. 只修改上面列出的低分维度，不要改动其他写得好好的部分\n';
  prompt += '2. 保持原有剧情走向、角色性格、对话风格不变\n';
  prompt += '3. 保留原文的优点和精彩段落\n';
  prompt += '4. 修改要精准，不要为了改而改\n';
  prompt += '5. 输出修改后的完整正文，不要加任何解释、标记或对比\n';

  let result = await callRealAPIWithFallback(prompt, null, 'quality_polish', Math.max(500, content.length));
  if(result){
    // 修改前后评分对比
    var beforeScore = evalData ? evalData.totalScore : null;
    var afterResult = null;
    if(typeof QualityEngine !== 'undefined' && QualityEngine.evaluateText){
      afterResult = QualityEngine.evaluateText(result, work);
    }

    statusBar.style.background = '#dcfce7';
    statusBar.style.color = '#166534';
    var scoreMsg = '';
    if(beforeScore && afterResult && afterResult.totalScore){
      var diff = afterResult.totalScore - beforeScore;
      scoreMsg = ' | ' + (diff >= 0 ? '↑' : '↓') + Math.abs(diff) + '分 (' + beforeScore + '→' + afterResult.totalScore + ')';
    }
    statusBar.textContent = '✅ 已按评价修改完成（' + result.length + '字）' + scoreMsg;
    setTimeout(function(){ statusBar.style.display='none'; }, 4000);
    document.getElementById('editor').value = result;
    updateWordCount();

    // 显示修改后评分
    if(afterResult && typeof EvalUI !== 'undefined' && EvalUI.show){
      showToast('已按评价修改，评分：' + afterResult.grade + ' ' + afterResult.totalScore + '/100');
    } else {
      showToast('已按评价修改');
    }
  } else {
    statusBar.style.background = '#fef3c7';
    statusBar.style.color = '#92400e';
    statusBar.textContent = '⚠️ API调用失败，无法自动修改';
    setTimeout(function(){ statusBar.style.display='none'; }, 3000);
  }
}

async function sendAiCommand(){
  const cmd=document.getElementById('ai-input').value.trim();
  if(!cmd)return;
  const work=getCurrentWork();
  const content=document.getElementById('editor').value;
  const chapterIdx = currentChapterIdx || 0;
  
  // 基于章节prompt + 用户指令（指令注入prompt体内而非末尾，防止截断）
  const fullPrompt = buildChapterPrompt(work, chapterIdx, content, cmd);
  
  // 先尝试API（自动遍历所有服务商），失败则使用本地AI
  // v59: 转为 messages 数组
  var _msgFullPrompt = Array.isArray(fullPrompt) ? fullPrompt : [{ role: 'user', content: fullPrompt }];
  let result = await callRealAPIWithFallback(_msgFullPrompt, null, 'write_normal', 12000); // 目标 5000-8000 字，优先保证质量与完整性
  if(!result && window.ContentGenerator){
    showToast('使用本地AI生成...');
    result = window.ContentGenerator.continueStory(content, work, cmd);
  }
  if(result){
    document.getElementById('editor').value=content+'\n\n'+result;
    updateWordCount();
    document.getElementById('ai-input').value='';
  }
}

// 提取当前内容为模板
function extractTpl(){
  const content=document.getElementById('editor').value.trim();
  if(!content){showToast('编辑器为空，无法提取');return;}
  const title=document.getElementById('ch-title').value.trim()||'未命名模板';
  
  // 保存到本地存储
  let customTpls=JSON.parse(localStorage.getItem('custom_templates')||'[]');
  customTpls.push({title:title,content:content,created:new Date().toISOString()});
  localStorage.setItem('custom_templates',JSON.stringify(customTpls));
  showToast('已保存为自定义模板，可在模板库查看');
}

// 插入词句
function insertPhrase(){
  // 显示词句库弹窗
  let modal=document.getElementById('phrase-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='phrase-modal';
    modal.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999;display:none;align-items:center;justify-content:center;';
    modal.innerHTML='<div style="background:#fff;border-radius:16px;padding:20px;width:90%;max-width:400px;max-height:80vh;overflow-y:auto;"><div style="font-size:16px;font-weight:600;margin-bottom:12px;">&#128172; 词句库</div><div id="phrase-list"></div><button onclick="document.getElementById(\'phrase-modal\').style.display=\'none\'" style="width:100%;margin-top:16px;padding:10px;border:none;border-radius:8px;background:#6366f1;color:#fff;font-size:14px;cursor:pointer;">关闭</button></div>';
    document.body.appendChild(modal);
  }
  
  // 加载词句数据（2026去套路版）
  var phrases = {
    '环境·场景':['阳光把窗台的灰尘照得一清二楚。','巷子里有股潮湿的砖石味。','天空泛着褪了色一样的灰。','楼道里的灯一明一灭，响声像在咳嗽。','夜风里带着工厂冷却水的味道。','冰面裂开一道细纹，延伸到脚下。','远处传来火车过道口的声音。','灯亮得让人睁不开眼，所有影子都被吞掉了。'],
    '人物·状态':['他低头看着自己的手，上面全是细小的伤口。','嘴角动了动，像是在算什么，又像什么都没想。','靠着墙站了三分钟，一句话没说。','眼睛发干，但就是闭不上。','指甲缝里塞的全是土，怎么蹭都蹭不干净。','把烟掐在手里，没点。','笑起来的时候牙齿上有血迹。','头发遮住半张脸，看不清表情。'],
    '动作·微距':['他把那张纸折了又折，直到折不动为止。','推门的时候动作很轻，像怕吵醒什么人。','伸手在空中停了一下，还是收了回来。','笔在纸上顿了一会儿，没写下去。','一脚踩进积水里，没低头看。','把刀横在膝上，开始磨。','数着手心里的东西，数了三遍，结果都不一样。','把什么东西往口袋里一揣，转身就走。'],
    '情绪·外化':['手抖得厉害，端不住杯子。','脖子后的汗毛竖了起来。','胸口像被什么东西顶着，吐不出来，也咽不下去。','嘴唇干裂得发疼，舌头碰到的时候有铁锈味。','指关节捏得发白，自己没发现。','眼睛开始发酸，他用力眨了眨，把东西按回去了。','呼吸声太大，把别的声音都盖没了。','后背的衣服粘在了皮肤上。'],
    '冲突·对峙':['两个人之间隔着一张桌子，谁也没先开口。','刀尖在桌面上划出声响，很慢，像在记数。','对方笑了，笑得很突然，然后就不笑了。','话到嘴边，被他硬生生换了另一句。','几步走过去，每一步都踩在相同的地方。','眼神没碰在一起，但是彼此都知道对方在看。','手一直搁在腰间，像摸钥匙，又像摸刀。','肩膀擦过去的时候，对方没动，他也没停。'],
    '对话·语气':['头也没抬，手没停。','顿了一会儿，像在挑字。','声音忽然小了下去，像有人会听见。','鼻子里哼了一声，没说什么。','说了一半，不说了，看着窗外。','嘴里答应着，眼睛却看着别处。','笑了两声，不是觉得好笑的那种笑。','把笔一放。"你再说一遍。"']
  };
  
  let html='';
  for(var cat in phrases){
    html+='<div style="margin-bottom:12px;"><div style="font-size:14px;font-weight:600;color:#6366f1;margin-bottom:6px;">'+cat+'</div><div style="display:flex;flex-wrap:wrap;gap:6px;">';
    phrases[cat].forEach(function(phrase){
      html+='<span style="padding:4px 10px;background:#f0f2ff;color:#6366f1;border-radius:12px;font-size:12px;cursor:pointer;" onclick="insertTextToEditor(\''+phrase.replace(/'/g,"\\'")+'\')">'+phrase+'</span>';
    });
    html+='</div></div>';
  }
  document.getElementById('phrase-list').innerHTML=html;
  modal.style.display='flex';
}

function insertTextToEditor(text){
  const editor=document.getElementById('editor');
  const start=editor.selectionStart;
  const end=editor.selectionEnd;
  const value=editor.value;
  editor.value=value.substring(0,start)+text+value.substring(end);
  editor.selectionStart=editor.selectionEnd=start+text.length;
  editor.focus();
  document.getElementById('phrase-modal').style.display='none';
  updateWordCount();
}

// v56: 黄金开头检查 — 第一章专用后生成自检
function checkGoldenOpening(content, work) {
  var issues = [];
  var strengths = [];
  var score = 100;
  
  if (!content || content.length < 500) {
    return { issues: ['内容过短，无法进行黄金开头检查'], strengths: [], score: 0 };
  }
  
  var firstSentence = content.replace(/^\s+/, '').slice(0, 80);
  var first200 = content.slice(0, 200);
  var first500 = content.slice(0, 500);
  var first1000 = content.slice(0, 1000);
  
  // 1. 第一句法则：不能是环境/时间/背景开头
  var badStartRE = /^(清晨|傍晚|夜幕|阳光|月光|天空|大地|世界|大陆|传说|从前|在很久|这是一个|苍澜|九州|混沌|洪荒|宇宙|天地|万物|上古|远古|太古|亘古|千年|百年|万年|多少年|很久|多年|那年|那一年|某一日|这一天|这天|今日|今天|早晨|中午|下午|黄昏|夜深|深夜|入夜|黎明|拂晓|夜|暮|朝|曦|曙|晨|晚|午|旦|夕)/;
  if (badStartRE.test(firstSentence)) {
    issues.push('首句以环境/时间/背景开头，应改为动作或冲突开场');
    score -= 15;
  } else {
    var actionStartRE = /(血|杀|剑|刀|拳|掌|枪|箭|火|雷|爆|碎|裂|断|跪|冲|跑|跳|飞|倒|摔|撞|抓|推|拉|踢|踏|踩|喊|叫|喝|怒|惊|怕|痛|冷|热|颤抖|咬牙|握紧)/;
    if (actionStartRE.test(firstSentence.slice(0, 30))) {
      strengths.push('首句有动作/冲突感');
    }
  }
  
  // 2. 身份锚定：200字内是否交代了主角身份
  var identityRE = /(我|他|她|林|萧|叶|苏|陈|李|王|张|刘|赵|周|吴|郑|杨|朱|秦|许|何|吕|施|沈|韩|冯|褚|卫|蒋|沈|蔡|高|马|唐|郑|曹|魏|薛|丁|雷|顾|贺|戴|武|段|姚|石|卢|夏|田|袁|龙|楚|白|姜|云|陆|莫|方|任|慕容|欧阳|上官|令狐|独孤|东方|西门|南宫|北冥|司徒|宇文|长孙|尉迟|司马|诸葛|公孙)/;
  var hasIdentity = identityRE.test(first200);
  if (!hasIdentity) {
    issues.push('前200字未交代主角身份，读者不知道"谁在经历什么"');
    score -= 12;
  }
  
  // 3. 金手指亮相：1000字内
  var goldenFingerRE = /(系统|面板|属性|觉醒|传承|奇遇|异宝|秘籍|功法|天赋|血脉|异能|能力|力量|发现|获得|融合|穿越|重生|回到|记忆|前世|上辈子|系统提示|叮|数据|等级|经验|技能|空间|戒指|玉佩|石头|珠|鼎|炉|剑|塔|图|书|卷|经|典|典藏|秘藏|禁术|秘术|神术|仙术|魔功|奇功|异术|鬼术|妖术|灵术|魂术|血术|体术|瞳术|印记|符文|咒印|契约|绑定|认主|激活|开启|苏醒|复苏|复活|重塑|蜕变|进化|异变|突变|变异|觉醒|开启|解锁|获取|抽取|赋予|赐予|感悟|顿悟|明悟|领悟|突破|晋升|升级|进阶|进化|强化|淬炼|炼化|祭炼|锻造|铸造|凝聚|融汇|贯通|融合|合一|蜕变|涅槃|重生|投胎|转生|夺舍|附身|继承|承袭|传承|获得|得到|收获|捡到|拾到|发现|发掘|挖掘|探索|探寻|搜寻|寻找|追踪|追查|调查|探查|侦查|窥探|刺探|暗访|明察|暗查|秘密|隐秘|机密|绝密|隐秘|暗藏|潜藏|隐藏|暗藏|秘藏|窖藏|珍藏|宝藏|宝库|秘境|密境|禁地|险地|绝地|死地|凶地|煞地|福地|洞天|仙府|洞府|仙宫|神殿|魔窟|妖巢|鬼域|冥界|灵界|仙界|神界|圣界|帝界|天界|凡界|人界|魔界|妖界|鬼界|冥界|地狱|深渊|虚空|混沌|鸿蒙|太初|无极|混元|先天|后天|天道|大道|法则|规则|秩序|本源|根源|起源)/;
  var hasGoldenFinger = goldenFingerRE.test(first1000);
  if (!hasGoldenFinger) {
    issues.push('1000字内未亮相金手指/系统/奇遇，读者缺乏期待感');
    score -= 10;
  } else {
    strengths.push('金手指/核心设定已在1000字内亮相');
  }
  
  // 4. 信息倾倒检测：是否有超过50字的世界观设定段落
  var infoDumpRE = /(?:世界|大陆|体系|境界|修炼|等级|分为|一共|共有|传说|上古|远古|混沌|洪荒|宇宙|天地|万物|秩序|法则|规则|天道|大道|本源|根源|起源|诞生|创造|毁灭|诞生之初|混沌初开|天地初分|万物初生|太古时代|远古时代|神话时代|黄金时代|白银时代|青铜时代|黑铁时代|末法时代|灵气复苏|灵气枯竭|元素|魔力|灵力|斗气|真气|内力|法力|魂力|精神力|念力|异能|超能力|血脉|天赋|武魂|命魂|星魂|灵根|道基|根骨|资质|悟性|根器|仙根|魔根|妖根|神根|圣根|帝根|皇根|王根|灵体|圣体|神体|仙体|魔体|妖体|帝体|皇体|王体|霸体|道体|佛体|龙体|凤体|麒麟体|玄武体|白虎体|朱雀体|青龙体|混沌体|鸿蒙体|太初体|无极体|混元体|先天体|后天体|凡体|体质)/;
  if (infoDumpRE.test(first500) && first500.length > 100) {
    issues.push('疑似开篇倾倒世界观设定，建议通过行动展示而非直接介绍');
    score -= 10;
  }
  
  // 5. 代入感：是否有共情要素
  var empathyRE = /(废|弱|穷|惨|被|嘲|笑|讽|刺|辱|骂|打|揍|踢|踩|踹|扇|掌掴|耳光|拳|脚|棍|棒|鞭|刑|罚|囚|禁|关|锁|铐|枷|镣|铐|枷锁|镣铐|囚笼|牢笼|监狱|牢房|地牢|水牢|天牢|死牢|暗牢|黑牢|监牢|囚禁|关押|拘禁|软禁|禁闭|禁足|禁锢|封锁|镇|压|封|印|封印|镇压|压迫|欺压|欺凌|霸凌|虐待|折磨|摧残|残害|迫害|陷害|诬陷|冤枉|屈辱|耻辱|羞辱|耻笑|嘲笑|讥笑|讥讽|讽刺|挖苦|奚落|冷嘲|热讽|冷眼|白眼|鄙视|蔑视|轻视|歧视|排斥|排挤|孤立|冷落|疏远|抛弃|遗弃|丢弃|放棄|放弃|丢掉|丧失|失去|失去|丢失|遗失|丧失|丧命|丧生|遇难|罹难|横死|惨死|暴毙|死亡|死了|被杀|被杀|被害|遇害|葬身|丧命|丧生|殒命|殒落|陨落|消逝|逝去|离去|离开|去世|过世|逝世|辞世|长眠|安息|永别|诀别|告别|送别|离别|分别|分离|告别|拜别|辞别|告别|送行|送别|送终|送葬|送灵|送殡|出殡|下葬|安葬|埋葬|埋|葬|入土|入殓|入棺|入棺|入殓|封棺|盖棺|合棺|殓|棺|柩|灵|魂|鬼|魄|亡灵|亡魂|冤魂|厉鬼|恶鬼|怨灵|凶灵|煞|煞气|煞星|灾星|晦气|霉运|倒霉|倒霉|走运|好运|幸运|幸|运|命|命运|命数|宿命|劫数|厄运|劫难|灾难|灾祸|祸|殃|劫|难|灾|祸|患|害|难|困|苦|痛|悲|伤|哀|愁|忧|虑|烦|恼|怒|恨|怨|仇|敌|仇人|仇家|对头|死敌|宿敌|世仇|血仇|深仇|大仇|冤仇|仇恨|敌意|恶意|杀意|杀机|杀心|杀气|煞气|凶气|恶气|恨意|怨气|愤怒|怒火|暴怒|狂怒|盛怒|震怒|大怒|发怒|动怒|恼怒|恼火|气恼|气愤|气急|气急败坏|恼羞成怒|勃然大怒|怒不可遏|怒发冲冠|怒气冲天|怒气冲冲|怒气填胸|怒目|怒视|怒斥|怒喝|怒吼|怒骂|怒斥|怒责|怒问|怒说|怒道|怒声|怒道|大喊|大叫|大喝|大呼|大嚷|大叫|大吼|大哮|大嚎|大啼|大鸣|大声|高喊|高叫|高呼|高嚷|尖叫|惊呼|惊叫|惨叫|哀嚎|哀鸣|哀啼|哭泣|痛哭|大哭|泣不成声|泪如雨下|泪流满面|泪眼|泪目|泪珠|泪滴|泪痕|泪迹|泪斑|泪渍|泪点|眼泪|泪|泣|哭|啼|嚎|啕|号|嗷|鸣|啼|泣|哭|泣|啼|嚎|啕|哀|悲|伤|痛|苦|酸|涩|辛|辣|苦|咸|甜|酸|涩|麻|酥|疼|痛|痒|痒|酸|胀|肿|痛|疼|伤|损|残|废|断|裂|碎|破|毁|坏|损|毁|伤|残|废|缺|失|无|空|虚|寂|寞|孤|独|单|寡|凄|惨|悲|凉|冷|寒|荒|凉|凄|冷|萧|瑟|索|条|荡|然|无|存|全|完|尽|绝|断|止|停|住|歇|息|罢|休|了|结|结束|终止|完结|完|了|结|了|完结|结束|终止|告终|完毕|完成|达成|实现|完成|达到|达成|实现|达到了|达成了|获|得|到|收|取|拿|捡|拾|抓|握|持|执|捧|托|端|举|提|拎|扛|背|抱|搂|夹|掖|揣|塞|藏|收|放|存|搁|摆|置|安|挂|悬|吊|垂|坠|系|绑|拴|扣|别|夹|卡|嵌|镶|套|箍|环|圈|绕|缠|盘|卷|裹|包|封|盖|罩|蒙|遮|掩|挡|拦|阻|隔|断|绝|止|停|驻|留|待|等|候|守|望|看|观|察|视|见|睹|瞥|瞟|扫|览|阅|读|念|诵|吟|咏|唱|歌|呼|喊|叫|唤|喝|吼|啸|嚎|啼|鸣|响|声|音|语|言|话|辞|词|句|字|文|章|篇|段|落|行|排|列|队|阵|群|批|组|套|副|双|对|只|个|件|枚|颗|粒|滴|点|片|块|条|根|枝|束|把|串|挂)/;
  if (empathyRE.test(first500)) {
    strengths.push('有共情要素（冲突/困境/痛苦/被欺压）');
  } else {
    issues.push('前500字缺少共情要素，读者难以代入主角');
    score -= 8;
  }
  
  // 6. 角色数量：第一章不应超过3个有名有姓的角色
  var nameMatches = first1000.match(/(林|萧|叶|苏|陈|李|王|张|刘|赵|周|吴|郑|杨|朱|秦|许|何|吕|施|沈|韩|冯|褚|卫|蒋|蔡|高|马|唐|曹|魏|薛|丁|雷|顾|贺|戴|武|段|姚|石|卢|夏|田|袁|龙|楚|白|姜|云|陆|莫|方|任|慕容|欧阳|上官|令狐|独孤|东方|西门|南宫|北冥|司徒|宇文|长孙|尉迟|司马|诸葛|公孙)(?:\p{L}{1,3})/gu);
  var nameCount = nameMatches ? nameMatches.length : 0;
  if (nameCount > 5) {
    issues.push('第一章涉及太多角色(' + nameCount + '个)，应控制在3个以内');
    score -= 5;
  }
  
  return { issues: issues, strengths: strengths, score: Math.max(0, score) };
}

// 文本检测+一键修复功能（整本小说全部章节检测）
function checkText(){
  const work=getCurrentWork();
  if(!work){showToast('请先选择作品');return;}

  // 先保存当前章节
  saveChapter();

  if(!window.TextChecker||!window.ContentGenerator){showToast('模块加载中...');return;}

  // 收集所有章节内容
  const chapters = work.chapters || [];
  if(chapters.length === 0){showToast('暂无章节内容');return;}

  let fullText = '';
  chapters.forEach((ch, idx) => {
    fullText += '\n\n===== 第' + (idx + 1) + '章：' + (ch.title || '未命名') + ' =====\n\n' + (ch.content || '');
  });

  // 检测
  const result=window.TextChecker.generateReport(fullText, work);

  // 自动修复
  let fixed=fullText;
  fixed=window.ContentGenerator.autoFixRepeatedWords(fixed);
  fixed=window.ContentGenerator.autoFixStacking(fixed);

  // 显示检测报告弹窗
  let modal=document.getElementById('check-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='check-modal';
    modal.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999;display:none;align-items:center;justify-content:center;';
    modal.innerHTML='<div style="background:#fff;border-radius:16px;padding:20px;width:90%;max-width:480px;max-height:85vh;overflow-y:auto;"><div style="font-size:16px;font-weight:600;margin-bottom:12px;">&#9989; 全本检测报告</div><pre id="check-content" style="white-space:pre-wrap;font-size:13px;line-height:1.6;color:#333;font-family:inherit;"></pre><div style="display:flex;gap:10px;margin-top:16px;"><button onclick="applyFix()" style="flex:1;padding:10px;border:none;border-radius:8px;background:#6366f1;color:#fff;font-size:14px;cursor:pointer;">&#9989; 应用修复</button><button onclick="document.getElementById(\'check-modal\').style.display=\'none\'" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;color:#666;font-size:14px;cursor:pointer;">关闭</button></div></div>';
    document.body.appendChild(modal);
  }

  let reportText = '【检测范围】整本小说 ' + chapters.length + ' 章\n\n';
  reportText += result.report;
  if(!result.hasIssues){
    reportText += '\n\n✅ 全本质量良好！';
  }else{
    reportText += '\n\n── 已自动生成修复版本，点击「应用修复」替换所有章节 ──';
  }

  document.getElementById('check-content').textContent=reportText;
  modal.style.display='flex';

  // 暂存修复后的文本
  window._fixedText=fixed;
  window._originalChapters=JSON.parse(JSON.stringify(chapters));
}

function applyFix(){
  if(!window._fixedText || !window._originalChapters) return;

  const work=getCurrentWork();
  if(!work) return;

  // 解析修复后的文本，按章节拆分（宽松匹配）
  const chapterBlocks = window._fixedText.split(/=====\s*第\d+章[：:].*?\s*=====/);
  const chapters = work.chapters || [];

  // chapterBlocks[0] 是空字符串或前言，从1开始是各章节内容
  for(let i = 0; i < chapters.length; i++){
    if(chapterBlocks[i + 1] !== undefined){
      chapters[i].content = chapterBlocks[i + 1].trim();
    }
  }

  DB.saveWork(work);

  // 刷新当前编辑器
  loadChapter(currentChapterIdx);

  document.getElementById('check-modal').style.display='none';
  showToast('✅ 已应用修复到全本');

  window._fixedText=null;
  window._originalChapters=null;
}

// ========== longMemory 系统 ==========

function initLongMemory(w) {
  if (!w.longMemory) w.longMemory = {charStates:[], plotThreads:[], foreshadows:[], charArcs:[]};
  if (!w.longMemory.foreshadows) w.longMemory.foreshadows = [];
  if (!w.longMemory.charArcs) w.longMemory.charArcs = [];
  // v27：核心记忆点，专门服务长篇连续写作
  if (!w.longMemory.memoryAnchors) {
    w.longMemory.memoryAnchors = {
      core: [],          // 全书级核心事实：身份、秘密、不可更改设定（L0最高优先级）
      characterTags: [], // 角色记忆点：口癖、标志动作、伤疤、执念、弱点（L1）
      relationships: [], // 关系变化：结盟、敌对、暧昧、背叛、亏欠（L1）
      items: [],         // 道具归属：谁拿着什么、丢了什么、欠了什么（L1）
      locations: [],     // 地点状态：哪里被毁、被占、设伏、留下线索（L2）
      promises: [],      // 承诺/禁忌/约定：后文必须兑现或避免违背（L2）
      timeline: [],      // 时间线锚点：几天后、黎明前、三年前等（L2）
      hooks: []          // 爽点钩子/未兑现期待：读者等着看的点（L3）
      , chapterContext: [] // v54: 章节上下文 — 结构化衔接信息（L1）
    };
  }
  const a = w.longMemory.memoryAnchors;
  ['core','characterTags','relationships','items','locations','promises','timeline','hooks'].forEach(function(k){
    if (!Array.isArray(a[k])) a[k] = [];
  });
  // v51 新增：记更多东西 — 对话金句/能力代价/情感轨迹/场景细节
  ['dialogues','abilityCosts','emotionTrack','scenes','chapterContext'].forEach(function(k){
    if (!Array.isArray(a[k])) a[k] = [];
  });
  // v51 新增：角色分级表（主角/配角/反派/龙套），用于记忆权重和遗忘策略
  if (!w.longMemory.charRoles) w.longMemory.charRoles = {};
  // v28：长篇级记忆结构
  if (!Array.isArray(w.longMemory.chapterIndex)) w.longMemory.chapterIndex = [];
  if (!w.longMemory.characterHistory) w.longMemory.characterHistory = {};
  // v46：三层渐进式滚动摘要，兼容旧版字符串类型
  if (!w.longMemory.rollingSummary || typeof w.longMemory.rollingSummary === 'string') {
    var oldSummary = (typeof w.longMemory.rollingSummary === 'string') ? w.longMemory.rollingSummary : '';
    w.longMemory.rollingSummary = {recent:'', milestones:'', eras:'', ultraEras:'', megaEras:'', _old:oldSummary};
  }
  if (!Array.isArray(w.longMemory.memoryDebt)) w.longMemory.memoryDebt = [];
  if (!w.longMemory.lifecycle) w.longMemory.lifecycle = {lastCompressedAt:-1, lastRebuildAt:0};
  // v30：超长篇记忆结构（500章+）
  if (!Array.isArray(w.longMemory.volumeMemories)) w.longMemory.volumeMemories = [];
  if (!w.longMemory.characterProfiles) w.longMemory.characterProfiles = {};
  if (!Array.isArray(w.longMemory.foreshadowLedger)) w.longMemory.foreshadowLedger = [];
  if (!w.longMemory.itemLedger) w.longMemory.itemLedger = {};
  if (!w.longMemory.factionGraph) w.longMemory.factionGraph = {};
  if (!Array.isArray(w.longMemory.timelineEvents)) w.longMemory.timelineEvents = [];
  if (!w.longMemory.ultraMeta) w.longMemory.ultraMeta = {volumeSize:50, lastUltraUpdateAt:-1};
  // v46：锚点摘要层（用于压缩累积过量的anchors）
  if (!w.longMemory._anchorDigest) w.longMemory._anchorDigest = {};
  ['core','characterTags','relationships','items','locations','promises','timeline','hooks','dialogues','abilityCosts','emotionTrack','scenes'].forEach(function(k){
    if (!Array.isArray(w.longMemory._anchorDigest[k])) w.longMemory._anchorDigest[k] = [];
  });
  // v50：记忆分级元数据
  if (!w.longMemory._memoryMeta) w.longMemory._memoryMeta = {
    lastPriorityRecalc: 0,
    lastConsistencyCheck: 0,
    totalAnchors: 0,
    activeDebt: 0
  };
}

function extractChapterSummary(content, title) {
  if (!content || content.length < 50) return title || '空章节';
  const head = content.slice(0, 120).replace(/\n/g, ' ');
  const sentences = content.split(/[。！？\n]+/).filter(s => s.trim().length > 5);
  const eventWords = ['杀','击','破','碎','逃','怒','夺','败','胜','震惊','发现','遇到','觉醒','突破','暴露','封印','威胁','追杀'];
  let events = [];
  for (const s of sentences) {
    if (events.length >= 3) break;
    if (eventWords.some(w => s.includes(w)) && !events.includes(s.trim())) {
      events.push(s.trim().slice(0, 40));
    }
  }
  if (content.length < 250) return content.slice(0, 200).replace(/\n/g, ' ');
  const tail = content.slice(-80).replace(/\n/g, ' ');
  let summary = head;
  if (events.length > 0) summary += ' -> ' + events.join(' | ');
  if (tail.length > 10 && !head.includes(tail.slice(0, 20))) {
    summary += ' ... ' + tail;
  }
  return summary.slice(0, 300);
}

function extractCharNameMap(chars) {
  const map = {names:[], aliasMap:{}, roles:{}};
  if (!chars) return map;
  const lines = chars.split('\n').filter(l => l.trim());
  // v51：角色分级检测 — 识别主角/女主/男主/反派/配角/导师/伙伴/龙套
  const roleKeywords = {
    '主角':  ['主角','男主','女主','主人公','第一主角'],
    '女主':  ['女主','女主角','女一'],
    '男主':  ['男主','男主角','男一'],
    '反派':  ['反派','大反派','最终boss','敌人','敌对','对手','幕后黑手'],
    '配角':  ['配角','次要角色','重要配角'],
    '导师':  ['导师','师傅','师父','老师','引路人'],
    '伙伴':  ['伙伴','队友','同伴','挚友','兄弟','姐妹'],
    '龙套':  ['龙套','路人','次要','背景','小角色']
  };
  let currentRole = '配角'; // 默认配角
  lines.forEach(l => {
    // 检测角色分级标记行（如"【主角】"、"主角：xxx"、"反派："）
    let detectedRole = null;
    for (const [role, kws] of Object.entries(roleKeywords)) {
      for (const kw of kws) {
        const roleRe = new RegExp('(?:^|[【\\[（(])\\s*' + kw + '\\s*(?:[】\\]）)：:]|$)', 'i');
        if (roleRe.test(l)) { detectedRole = role; break; }
      }
      if (detectedRole) break;
    }
    if (detectedRole) currentRole = detectedRole;

    const m = l.match(/^([^：:：\s]{1,6})[：:：\s]/);
    if (m) {
      const name = m[1].trim();
      // 跳过纯角色标记词（如"主角""反派"本身作为名字）
      const allRoleWords = Object.values(roleKeywords).flat();
      if (allRoleWords.includes(name)) return;

      map.names.push(name);
      // v51：记录角色分级（优先级：已检测的当前角色 > 默认配角）
      if (!map.roles[name]) {
        map.roles[name] = currentRole;
      } else {
        // 已有角色，升级但不降级（主角>配角）
        const roleOrder = ['主角','女主','男主','反派','导师','伙伴','配角','龙套'];
        if (roleOrder.indexOf(currentRole) < roleOrder.indexOf(map.roles[name])) {
          map.roles[name] = currentRole;
        }
      }
      if (name.length >= 2) {
        const sur = name[0];
        if (!map.aliasMap[sur]) map.aliasMap[sur] = {main:name, type:'surname'};
      }
      const titleMatch = name.match(/^(.{1,2})(兄|姐|妹|弟|师|叔|伯|爷|娘)$/);
      if (titleMatch) {
        const base = titleMatch[1];
        if (!map.aliasMap[base]) map.aliasMap[base] = {main:name, type:'title'};
      }
    }
  });
  if (map.names.length === 0) map.names.push('主角');
  // 第一个名字默认为主角
  if (!map.roles[map.names[0]]) map.roles[map.names[0]] = '主角';
  map.aliasMap['他'] = {main:map.names[0], type:'pronoun'};
  map.aliasMap['她'] = {main:map.names.length > 1 ? map.names[1] : map.names[0], type:'pronoun'};
  map.aliasMap['我'] = {main:map.names[0], type:'pronoun'};
  return map;
}

// v51：获取角色分级权重（主角5分，龙套1分）
function getCharRoleWeight(name, charRoles){
  if (!name) return 1;
  var role = '龙套';
  if (charRoles && charRoles[name]) role = charRoles[name];
  if (CHAR_ROLE_WEIGHT[role]) return CHAR_ROLE_WEIGHT[role].weight;
  return 1;
}

// v51：更新作品的charRoles表（从人设文本中识别并持久化角色分级）
function updateCharRoles(w){
  if (!w || !w.chars) return;
  initLongMemory(w);
  try {
    var map = extractCharNameMap(w.chars);
    if (map.roles && Object.keys(map.roles).length > 0) {
      w.longMemory.charRoles = Object.assign(w.longMemory.charRoles || {}, map.roles);
    }
  } catch(e) { console.warn('[charRoles] 更新失败:', e); }
}

function extractCharStateFromText(content, chars) {
  if (!content || content.length < 100) return [];
  const nameMap = extractCharNameMap(chars);
  const states = [];
  const conflictWords = ['受伤','突破','愤怒','震惊','昏迷','逃亡','战斗','危险','重伤','击败','觉醒','中毒','胜利','崩溃','流泪','紧张','恐惧','兴奋','坚定','犹豫','绝望','心死','释然','悔恨','愧疚','狂喜','暴怒','冷漠','痴迷','癫狂','压抑','不甘','决绝','屈服','背叛','被俘','失忆','封印','解封','顿悟','走火入魔'];
  for (const name of nameMap.names) {
    let nameCount = 0;
    const nameRe = new RegExp(name, 'g');
    let m;
    while ((m = nameRe.exec(content)) !== null) { nameCount++; }
    Object.keys(nameMap.aliasMap).forEach(alias => {
      if (alias === name) return;
      if (nameMap.aliasMap[alias].main !== name) return;
      const aliasRe = new RegExp(alias, 'g');
      while ((m = aliasRe.exec(content)) !== null) { nameCount++; }
    });
    if (nameCount < 1) continue;
    const sentences = content.split(/[。！？\n]+/);
    let status = '正常', location = '未知', action = '', emotion = '', hasDialogue = false;
    for (const s of sentences) {
      if (!nameMap.names.some(n => s.includes(n)) && !Object.keys(nameMap.aliasMap).some(a => s.includes(a) && nameMap.aliasMap[a].main === name)) continue;
      if (s.length > action.length && s.length < 80) action = s.trim().slice(0, 60);
      for (const cw of conflictWords) {
        if (s.includes(cw)) { status = cw; break; }
      }
      const emotionWords = {'喜':'喜悦','怒':'愤怒','哀':'悲伤','惧':'恐惧','惊':'震惊','羞':'羞愧','疑':'怀疑','绝望':'绝望','释然':'释然','悔':'悔恨','愧':'愧疚','狂':'狂喜','冷':'冷漠','痴':'痴迷','癫':'癫狂','压':'压抑','不甘':'不甘','决绝':'决绝','顿悟':'顿悟'};
      for (const [k, v] of Object.entries(emotionWords)) {
        if (s.includes(k) || s.includes(v)) emotion = v;
      }
      const locMatch = s.match(/在[^，。]{1,30}(?:山|谷|洞|府|殿|塔|台|门|林|城|湖|海|崖|峰|宫|室|院|房|楼|阁|堂|殿)/);
      if (locMatch) location = locMatch[0].slice(0, 25);
      if (/[""\u300c\u300d\u300e\u300f]/.test(s) && (s.includes('说') || s.includes('道') || s.includes('问'))) hasDialogue = true;
    }
    states.push({name, status, location, action: action || '出场', emotion: emotion || '', hasDialogue});
  }
  return states;
}

function extractPlotThreadsFromText(content, existingThreads, chapterIdx) {
  if (!content || content.length < 100) return existingThreads || [];
  const threads = existingThreads || [];
  const sentences = content.split(/[。！？\n]+/);
  const chNum = (chapterIdx || 0) + 1;
  const contentKeywords = content.replace(/[，。！？、；：\u201c\u201d\u300c\u300d\s]/g, ' ').split(' ').filter(w => w.length >= 2 && /[\u4e00-\u9fff]/.test(w));
  const freqMap = {};
  contentKeywords.forEach(w => { freqMap[w] = (freqMap[w] || 0) + 1; });
  const doubtWords = ['谁','什么','为什么','究竟','难道','到底','秘密','真相','谜','神秘','未知','未解','阴谋','暗','隐','藏'];
  for (const s of sentences) {
    if (doubtWords.some(w => s.includes(w)) && s.length > 10 && s.length < 80) {
      const title = s.trim().slice(0, 50);
      if (!threads.find(t => t.title === title)) {
        const sKeywords = s.replace(/[，。！？、；：\u201c\u201d\u300c\u300d\s]/g, ' ').split(' ').filter(w => w.length >= 2 && /[\u4e00-\u9fff]/.test(w));
        threads.push({title, status:'待解', chapters:[chNum], lastContent:title, keywords:sKeywords, relatedTo:null});
        break;
      }
    }
  }
  const resolveWords = ['原来','真相大白','揭晓','暴露','揭开','发现','原来是','没想到'];
  for (const s of sentences) {
    if (resolveWords.some(w => s.includes(w))) {
      const sKeywords = content.replace(/[，。！？、；：\u201c\u201d\u300c\u300d\s]/g, ' ').split(' ').filter(w => w.length >= 2 && /[\u4e00-\u9fff]/.test(w));
      let bestMatch = null, bestScore = 0;
      for (const t of threads) {
        if (t.status === '待解' && !t.resolvedAt && t.keywords) {
          const overlap = sKeywords.filter(k => t.keywords.includes(k));
          if (overlap.length > bestScore) { bestScore = overlap.length; bestMatch = t; }
        }
      }
      if (bestMatch && bestScore >= 1) { bestMatch.status = '已解'; bestMatch.resolvedAt = chNum; }
      else {
        for (const t of threads) {
          if (t.status === '待解' && !t.resolvedAt) { t.status = '已解'; t.resolvedAt = chNum; break; }
        }
      }
    }
  }
  return threads.slice(-80);
}


// v27：统一推入核心记忆点，自动去重、提权、限量
function upsertMemoryAnchor(w, bucket, value, meta) {
  initLongMemory(w);
  if (!value || !String(value).trim()) return;
  const anchors = w.longMemory.memoryAnchors;
  if (!anchors[bucket]) anchors[bucket] = [];
  meta = meta || {};
  const text = String(value).trim().replace(/\s+/g, ' ').slice(0, 120);
  if (!text) return;
  const key = (meta.key || text).slice(0, 60);
  const exists = anchors[bucket].find(function(x) {
    return x.key === key || x.text === text || (x.text && text.includes(x.text.slice(0, 20)));
  });
  if (exists) {
    exists.text = text.length > exists.text.length ? text : exists.text;
    exists.chapterIdx = Math.max(exists.chapterIdx || 0, meta.chapterIdx || 0);
    exists.updatedAt = Date.now();
    exists.weight = Math.min(10, Math.max(exists.weight || 1, meta.weight || 1) + 1);
    if (meta.status) exists.status = meta.status;
    if (meta.charName && !exists.charName) exists.charName = meta.charName;
    if (meta.charRole && !exists.charRole) exists.charRole = meta.charRole;
    return;
  }
  anchors[bucket].push({
    key: key,
    text: text,
    chapterIdx: meta.chapterIdx || 0,
    chapterTitle: meta.chapterTitle || '',
    weight: meta.weight || 1,
    status: meta.status || '有效',
    charName: meta.charName || '',
    charRole: meta.charRole || '',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  // v51：角色分级限量 — 主角30条、配角15条、龙套5条，超长篇自动遗忘龙套
  var charRoles = w.longMemory.charRoles || {};
  if (bucket === 'characterTags' || bucket === 'emotionTrack' || bucket === 'dialogues') {
    // 按角色分组限量
    var byRole = {};
    anchors[bucket].forEach(function(a){
      var role = a.charRole || charRoles[a.charName] || '龙套';
      if (!byRole[role]) byRole[role] = [];
      byRole[role].push(a);
    });
    var kept = [];
    Object.keys(byRole).forEach(function(role){
      var maxN = (CHAR_ROLE_WEIGHT[role] && CHAR_ROLE_WEIGHT[role].maxAnchors) || 10;
      var sorted = byRole[role].sort(function(a,b){
        return (b.weight||1)-(a.weight||1) || (b.updatedAt||0)-(a.updatedAt||0);
      });
      kept = kept.concat(sorted.slice(0, maxN));
    });
    anchors[bucket] = kept.sort(function(a,b){ return (b.weight||1)-(a.weight||1) || (b.updatedAt||0)-(a.updatedAt||0); });
  } else {
    // 其他桶：每类保留高权重+近期的 30 条，防止记忆膨胀
    anchors[bucket] = anchors[bucket]
      .sort(function(a,b){ return (b.weight||1)-(a.weight||1) || (b.updatedAt||0)-(a.updatedAt||0); })
      .slice(0, 30);
  }
}

function extractMemoryAnchorsFromText(w, idx, content) {
  if (!content || content.length < 40) return;
  initLongMemory(w);
  // v51：先更新角色分级表
  updateCharRoles(w);
  const ch = w.chapters && w.chapters[idx] ? w.chapters[idx] : {};
  const chapterTitle = ch.title || ('第' + (idx + 1) + '章');
  const meta = {chapterIdx: idx, chapterTitle: chapterTitle};
  const sentences = content.split(/[。！？\n]+/).map(function(s){return s.trim();}).filter(function(s){return s.length >= 6 && s.length <= 90;});
  const nameMap = extractCharNameMap(w.chars || '');
  const names = nameMap.names || [];
  const charRoles = w.longMemory.charRoles || {};

  // 辅助：构建带角色信息的meta
  function metaWithChar(name){
    var role = charRoles[name] || nameMap.roles[name] || '龙套';
    return Object.assign({charName: name, charRole: role}, meta);
  }

  // 1. 角色标志：口癖、动作、伤疤、弱点、执念
  names.forEach(function(name) {
    if (!name || name === '主角') return;
    sentences.forEach(function(s) {
      if (!s.includes(name)) return;
      if (/(习惯|总是|从不|最怕|怕|弱点|执念|口头禅|伤疤|疤|旧伤|握紧|眯眼|冷笑|咬牙|沉默)/.test(s)) {
        upsertMemoryAnchor(w, 'characterTags', name + '：' + s.slice(0, 70), Object.assign({key:name + s.slice(0,18), weight:3}, metaWithChar(name)));
      }
    });
  });

  // 2. 关系变化：背叛、结盟、救命、亏欠、敌意、暧昧
  sentences.forEach(function(s) {
    if (/(背叛|结盟|联手|救了|欠|仇|敌|恨|喜欢|心动|信任|怀疑|决裂|和解|投靠|保护|交易)/.test(s)) {
      upsertMemoryAnchor(w, 'relationships', s.slice(0, 90), Object.assign({weight:4}, meta));
    }
  });

  // 3. 道具归属：v53 扩展词库，覆盖不下100种物品 + 不下200种状态变化动作
  sentences.forEach(function(s) {
    var itemActionRE = /(?:得到|拿到|夺走|抢走|偷走|捡到|拾起|翻出|摸出|掏出|递给|交给|塞给|扔给|推向|递过|接过|收下|收起|放入|揣进|塞进|藏起|埋下|埋入|带走|拿回|归还|交还|丢失|遗失|掉落|落下|摔碎|捏碎|折断|撕碎|烧毁|烧了|焚毁|毁掉|销毁|用掉|服下|吞下|喝下|震碎|击碎|劈开|砍断|斩断|融化|腐蚀|拆开|展开|翻开|合上|解开|脱下|穿上|戴上|取下|抛出|掷出|扔出|弹入|射出|打入|钉入|插入|拔出|抽出|交换|换给|赠予|送给|留下|留给|放回|搁在|摆在|压在|夹在|别在|系在|挂在|悬在|浮在|飘落|沉入|没入|吸入|卷走|冲走|吹走|掠走|夺取|纳入|注入|灌入|倒入|滴入|渗入|浸入|刻入|写入|画入|印入|烙入|缝入|嵌入|痕迹|标记|印记|符号|暗号|指纹|血迹|粉末|残留|残渣|碎屑|碎片|裂缝|缺口|破损|断裂|扭曲|变形|褪色|变色|发光|闪烁|熄灭|黯淡|消失|出现|浮现|显形|隐去|散开|弥漫|消散|褪去|化开|融解|凝固|冻结|沸腾|蒸发|升华|结晶|沉淀|融合|合一|合为一体|汇聚|聚集|聚拢|扩散|蔓延|吞噬|包围|笼罩|覆盖|包裹|缠绕|束紧|勒紧|松开|解开|脱离|滑落|坠落|回归|召唤|唤醒|激活|催动|激发|引动|牵动|震动|共鸣|共振|同频|觉醒|苏醒|复苏|重生|涅槃|蜕变|进化|退化|变异|异变|扭曲|反转|颠倒|置换|替换|替代|取代|变成|化为了|化作|化为|转为|变为|变成)/;
    var itemNameRE = /(?:剑|刀|枪|戟|斧|钺|钩|叉|鞭|锏|锤|戈|矛|盾|弓|弩|箭|刃|匕|飞剑|飞刀|法器|法宝|灵器|灵宝|仙器|神器|魔器|魔兵|妖器|佛器|道器|符|符箓|符咒|符纸|符印|符纹|符文|阵法|阵盘|阵旗|阵眼|阵基|卷轴|玉简|竹简|书简|秘籍|秘典|功法|心法|口诀|手札|笔记|日记|信|信件|密信|密函|血书|诏书|圣旨|旨意|令牌|令箭|令旗|令符|腰牌|铁券|兵符|虎符|将印|帅印|官印|大印|玉玺|国玺|印信|信物|凭证|契约|契书|婚书|休书|和离书|投名状|卖身契|地契|房契|账册|账簿|账本|名册|花名册|图谱|地图|舆图|海图|星图|阵图|秘图|藏宝图|钥匙|锁|锁链|镣铐|手铐|脚镣|铁链|绳索|绳子|绑带|绷带|药|丹药|灵丹|仙丹|毒药|解药|迷药|蒙汗药|汤药|药粉|药丸|药膏|药液|药汤|药引|药渣|药草|草药|灵草|仙草|人参|灵芝|雪莲|首乌|丹砂|朱砂|雄黄|砒霜|鹤顶红|断肠草|见血封喉|鸩|蛊|蛊虫|蛊毒|蛊术|蛊种|蛊母|子蛊|母蛊|本命蛊|魂蛊|血蛊|情蛊|同心蛊|忘忧蛊|傀儡蛊|控心蛊|玉佩|玉环|玉镯|玉簪|玉钗|玉冠|玉带|玉玦|玉珮|金钗|银簪|铜镜|木梳|梳子|发簪|簪子|簪花|绢花|珠花|步摇|耳坠|耳环|项链|项圈|手镯|手链|脚链|戒指|扳指|指环|香囊|荷包|钱袋|储物袋|储物戒|空间戒指|纳戒|乾坤袋|百宝囊|锦囊|布袋|包裹|包袱|披风|斗篷|大氅|棉袍|道袍|袈裟|僧衣|法袍|战甲|铠甲|软甲|内甲|护心镜|护腕|护膝|护腿|护肩|护臂|护手|拳套|手套|丝线|金线|银线|蚕丝|蛛丝|天蚕丝|冰蚕丝|灵丝|琴|瑟|笙|箫|笛|埙|筝|琵琶|二胡|鼓|钟|磬|铃|铃铛|风铃|银铃|金铃|铜铃|签筒|签|卦|龟甲|铜钱|算盘|棋子|棋盘|画卷|画轴|画|字画|书法|墨宝|砚台|墨锭|墨条|毛笔|狼毫|羊毫|宣纸|绢帛|丝绸|锦缎|布匹|茶叶|酒|酒壶|酒坛|酒杯|茶壶|茶盏|茶杯|碗|筷|勺子|匕首|暗器|飞镖|毒针|毒刺|毒烟|毒雾|毒气|毒粉|迷烟|迷香|火药|炸药|雷管|引信|炮仗|烟花|爆竹|灯笼|灯盏|烛台|蜡烛|烛火|油灯|灯芯|火折子|火镰|火石|火绒|火把|火堆|篝火|骨灰|骨灰盒|骨灰坛|骨灰罐|骨灰瓮|灵位|牌位|遗像|遗物|遗书|遗言|遗嘱|遗产|棺木|棺椁|棺材|灵柩|墓碑|墓志铭|石刻|石碑|石像|雕像|塑像|泥塑|陶俑|俑|木偶|傀儡|人偶|布偶|偶人|水晶球|水晶|琉璃|琥珀|玛瑙|翡翠|珊瑚|珍珠|夜明珠|宝石|钻石|金刚石|灵石|晶石|魔晶|仙晶|神晶|元石|魂石|魄石|血石|骨石|晶核|魔核|妖核|兽核|内核|核心|种子|果实|花朵|花瓣|花粉|蜜|露|霜|雪|冰|水|火|土|木|金|铁|铜|银|金|玉|石|沙|尘|泥|灰|炭|煤|油|漆|胶|蜡|树脂|松脂|琥珀|蜜蜡|蜂蜡|虫胶|虫蜡|犀角|象牙|兽骨|兽皮|兽毛|兽角|兽爪|兽牙|鳞片|羽毛|绒羽|翎羽|翎毛|翅|翼|壳|甲壳|龟壳|贝壳|螺壳|蛋壳|蛋|卵|核|种子|籽|果实|果核|果仁|核仁|仁|杏仁|核桃|松子|瓜子|花生|豆|米|麦|粟|谷|粮|食|饭|粥|面|饼|馒头|包子|饺子|馄饨|糕点|点心|糖果|蜜饯|干果|坚果|炒货|蜜|糖|盐|醋|酱油|酒|茶|水|汤|羹|汁|浆|露|液|油|脂|膏|霜|粉|末|碎片|碎屑|粉末|颗粒|晶体|结晶|凝块|块状|条状|片状|丝状|线状|网状|布状|膜状|壳状|球状|珠状|粒状|粉状|末状|液状|膏状|胶状|蜡状|油状|气状|雾状|烟状|云状|光状|影状|声状|波状|纹状|痕状|印状|迹状|斑状|点状|线状|网状|格状|格|纹|痕|印|迹|斑|点|线|丝|缕|片|块|条|根|枝|叶|花|果|实|种|子|核|仁|粉|末|屑|渣|残|余|剩|留|存|藏|隐|埋|没|沉|浮|飘|飞|游|走|跑|跳|跃|蹦|窜|蹿|冲|撞|碰|磕|绊|跌|摔|倒|塌|崩|裂|碎|破|灭|毁|坏|损|伤|残|缺|断|折|弯|曲|扭|转|翻|滚|旋|绕|缠|盘|环|圈|套|箍|束|绑|捆|扎|系|拴|扣|锁|封|闭|合|关|开|启|解|放|松|脱|卸|摘|取|拿|拾|捡|抓|握|捏|攥|握|持|执|握|捧|托|端|举|提|拎|扛|背|抱|搂|夹|掖|揣|塞|藏|收|放|存|搁|摆|置|安|放|搁|置|挂|悬|吊|垂|坠|系|绑|拴|扣|别|夹|卡|嵌|镶|套|箍|环|圈|绕|缠|盘|卷|裹|包|封|盖|罩|蒙|遮|掩|挡|拦|阻|隔|断|绝|止|停|驻|留|待|等|候|守|望|看|观|察|视|见|睹|瞥|瞟|扫|览|阅|读|念|诵|吟|咏|唱|歌|呼|喊|叫|唤|喝|吼|啸|嚎|啼|鸣|响|声|音|响|动|静|寂|默|沉|闷|哑|失|聋|盲|瞎|瘸|瘫|废|残|疾|病|伤|痛|疼|痒|麻|酸|胀|晕|眩|昏|迷|醉|醒|觉|悟|懂|会|通|明|白|清|楚|澈|透|亮|光|明|暗|黑|阴|阳|日|月|星|辰|天|地|山|川|河|流|江|湖|海|洋|岛|屿|礁|滩|岸|沙|泥|土|石|岩|崖|壁|峰|岭|峦|岗|丘|坡|谷|壑|沟|溪|涧|潭|池|沼|泽|泉|井|源|头|尾|端|顶|底|边|缘|角|尖|刃|锋|口|洞|穴|窟|孔|缝|隙|裂|纹|迹|痕|印|记|号|符|码|字|数|算|量|度|衡|尺|寸|斤|两|钱|分|厘|毫|丝|忽|微|纤|尘|埃|沙|粒|滴|点|抹|缕|丝|片|瓣|朵|枝|条|根|株|棵|丛|簇|束|把|捆|堆|叠|摞|排|行|列|队|阵|群|批|组|套|副|双|对|只|个|件|枚|颗|粒|滴|点|片|块|条|根|枝|束|把|串|挂|副|双|对|套|组|批|群|阵|队|列|排|行|摞|叠|堆|捆|束|把|串|挂)/;
    if (itemActionRE.test(s) && itemNameRE.test(s)) {
      upsertMemoryAnchor(w, 'items', s.slice(0, 90), Object.assign({weight:4}, meta));
    }
  });

  // 4. 地点状态：v53 扩展 — 移动 + 场景内物品状态变化 + 子区域切换
  sentences.forEach(function(s) {
    if (s.length > 20 && (
      // 移动类
      /(来到|进入|离开|回到|赶往|抵达|藏在|困在|设伏|埋伏|撤退|退入|转入|移步|踏入|步入|跨入|走进|跑进|冲进|闯进|逃进|躲进|闪进|溜进|潜入|摸进|绕到|转到|折返|返回|落脚|暂住|歇脚|驻扎|扎营|宿营|借宿|投宿|躺下|坐下|蹲下|站定|停下|止步|驻足|徘徊|踱步|穿梭|游走|搬迁|攀爬|攀登|登顶|下山|上山|过桥|渡河|涉水|穿林|穿行|拐弯|掉头|折返|退回|后退|避开|绕开|绕过|抄近道|另辟蹊径|途经|路过|经过|穿过|越过|跨过|渡|涉|漂|飞|掠过|闪过|划过|滑过|飘过|浮过|沉过|潜过|钻过|渗入|浸入|浸没|淹没|吞没|包围|环绕|围住|聚拢|汇聚|碰头|碰面|见面|相会|相遇|偶遇|撞见|碰到|遇见|见到|看到|望见|鸟瞰|俯瞰|仰视|仰望|探身|俯身|弯腰|躬身|蜷缩|缩起|退回|蜇).{0,20}/.test(s) ||
      // 场景内物品状态变化（不需要移动）
      /(放下|搁下|摆在|放在|搁在|安放|收好|收起|藏好|藏起|埋好|投入|扔进|丢进|抛进|投进|掷入|弹入|射入|塞入|插入|嵌入|镶入|刻入|写入|画入|印入|烙入|缝入|绣入|织入|编入|刺入|扎入|钉入|楔入|敲入|砸入|碾碎|压碎|挤碎|捏碎|捻碎|揉碎|搓碎|撕碎|扯碎|撕开|扯开|撕裂|捅破|戳破|扎破|刺破|挑破|划破|割破|切开|劈开|斩开|砍开|剁开|剪开|剪断|切断|烧断|熔断|溶解|融化|熔化|烧掉|焚毁|焚烧|烧毁|烧化|烧熔|烧穿|烧红|烧黑|烧焦|烧糊|烧尽|烧光|烧完|融掉|化掉|化开|化为|化作|变成|变为|消融|消散|消失|隐去|隐没|隐藏|浮现|显出|显露|暴露|露出|展示|展现|呈现|透出|渗出|溢出|流出|淌出|滴出|冒出|涌出|喷出|飞出|飘出|散出|发出|放出|传递|传到|递到|交到|送到|传信|传讯|传音|传话|传令|通知|告知|通报|呈报|呈上|呈递|上呈|上报|回禀|回话|回信|回复|答复|回答|应声|接话|搭话|插话|打断|喊出|叫出|喝出|吼出|骂出|嘶吼|惨叫|惊叫|尖叫|大哭|痛哭|啜泣|抽泣|饮泣|暗泣|偷哭|嚎啕|号哭)/.test(s)
    )) {
      upsertMemoryAnchor(w, 'locations', s.slice(0, 90), Object.assign({weight:3}, meta));
    }
  });

  // 5. 承诺/禁忌：发誓、约定、不能、必须、三日等
  sentences.forEach(function(s) {
    if (/(发誓|答应|约定|承诺|必须|不能|绝不|一定|三日|七日|明日|黎明|天亮|午夜)/.test(s)) {
      upsertMemoryAnchor(w, 'promises', s.slice(0, 90), Object.assign({weight:5}, meta));
    }
  });

  // 6. 时间线锚点
  sentences.forEach(function(s) {
    if (/(三年前|十年前|昨夜|今夜|明日|翌日|黎明|黄昏|半个时辰|一炷香|三日后|七日后|一个月后)/.test(s)) {
      upsertMemoryAnchor(w, 'timeline', s.slice(0, 90), Object.assign({weight:3}, meta));
    }
  });

  // 7. 爽点钩子：章尾悬念、未兑现期待
  const tail = content.slice(-500);
  tail.split(/[。！？\n]+/).forEach(function(s) {
    s = s.trim();
    if (s.length >= 8 && /(没想到|就在这时|忽然|终于|真正|真相|等着|下一刻|声音响起|门外|黑影|来人|谁也不知道|秘密)/.test(s)) {
      upsertMemoryAnchor(w, 'hooks', s.slice(0, 90), Object.assign({weight:5}, meta));
    }
  });

  // 8. 全书核心设定：身份/血脉/秘密/系统/使命
  sentences.forEach(function(s) {
    if (/(真实身份|血脉|身世|秘密|使命|系统|天命|诅咒|封印|预言|唯一|不能暴露)/.test(s)) {
      upsertMemoryAnchor(w, 'core', s.slice(0, 90), Object.assign({weight:6}, meta));
    }
  });

  // 9. 能力代价：使用能力后的反噬/消耗/限制 → v51独立到 abilityCosts 桶
  sentences.forEach(function(s) {
    if (/(代价|反噬|消耗|寿元|精神崩溃|身体损伤|副作用|透支|虚弱|昏厥|咳血|经脉寸断|走火入魔|灵力枯竭|元气大伤).{0,15}(能力|功法|秘术|禁术|血脉|天赋|术法|招式|神通)/.test(s) ||
        /(能力|功法|秘术|禁术|血脉|天赋|术法|招式|神通).{0,15}(代价|反噬|消耗|寿元|精神崩溃|身体损伤|副作用|透支|虚弱|昏厥|咳血)/.test(s)) {
      // v51：同时写入 core（永久）和 abilityCosts（可压缩）
      upsertMemoryAnchor(w, 'core', s.slice(0, 90), Object.assign({weight:5}, meta));
      upsertMemoryAnchor(w, 'abilityCosts', s.slice(0, 90), Object.assign({weight:5}, meta));
    }
  });

  // 10. 势力变化：势力覆灭/崛起/分裂/吞并
  sentences.forEach(function(s) {
    if (/(灭|覆灭|灭亡|覆没|被吞并|分裂|投降|归降|崛起|复兴|重建|称霸|统一).{0,20}(宗|门|派|府|军|营|帮|盟|国|朝|族|阁|楼|殿|司|卫|寨|商会|集团)/.test(s) ||
        /(宗|门|派|府|军|营|帮|盟|国|朝|族|阁|楼|殿|司|卫|寨|商会|集团).{0,20}(灭|覆灭|灭亡|覆没|被吞并|分裂|投降|归降|崛起|复兴|重建|称霸|统一)/.test(s)) {
      upsertMemoryAnchor(w, 'core', s.slice(0, 90), Object.assign({weight:5}, meta));
    }
  });

  // 11. 情绪转折：角色心理的重大变化 → v51独立到 emotionTrack 桶
  names.forEach(function(name) {
    if (!name || name === '主角') return;
    sentences.forEach(function(s) {
      if (!s.includes(name)) return;
      if (/(绝望|崩溃|心死|放弃|不再信任|彻底失望|幡然醒悟|终于明白|恍然大悟|决心|坚定|从绝望|重燃|释然|放下)/.test(s)) {
        // 同时写入 characterTags（角色标签）和 emotionTrack（情感轨迹，可压缩）
        upsertMemoryAnchor(w, 'characterTags', name + '：' + s.slice(0, 70), Object.assign({key:name + 'emotion' + s.slice(0,14), weight:4}, metaWithChar(name)));
        upsertMemoryAnchor(w, 'emotionTrack', name + '：' + s.slice(0, 70), Object.assign({key:name + 'emo' + idx, weight:4}, metaWithChar(name)));
      }
    });
  });

  // 12. v51 新增：对话金句 — 角色标志性台词（带引号的句子，且包含角色名或角色关键词）
  sentences.forEach(function(s) {
    // 匹配带引号的对话
    var dialogueMatch = s.match(/[“"\u300c\u300e]([^”"\u300d\u300f]{6,60})[”"\u300d\u300f]/);
    if (dialogueMatch) {
      var quote = dialogueMatch[1].trim();
      // 金句特征：包含决心/誓言/哲理/反讽/标志性表达
      if (/(发誓|绝不|一定|宁可|就算|哪怕|永远|从此|再也不|凭什么|为什么|我不信|我不甘|我命由我|天命|命运|选择|代价|活着|死去|守护|毁灭)/.test(quote)) {
        // 找出说话者
        var speaker = '';
        for (var ni = 0; ni < names.length; ni++) {
          if (names[ni] && names[ni] !== '主角' && s.includes(names[ni])) { speaker = names[ni]; break; }
        }
        // 如果句子前面有"XX道/说/冷声道"
        if (!speaker) {
          var speakerMatch = s.match(/^([\u4e00-\u9fa5]{2,4})(?:道|说|冷声|沉声|低声|怒道|笑道|喊道)/);
          if (speakerMatch && names.includes(speakerMatch[1])) speaker = speakerMatch[1];
        }
        if (speaker) {
          upsertMemoryAnchor(w, 'dialogues', speaker + '：「' + quote + '」', Object.assign({key:speaker + 'quote' + quote.slice(0,15), weight:4}, metaWithChar(speaker)));
        }
      }
    }
  });

  // 13. v51 新增：场景细节 — 重要场景的感官锚点（天气/光影/气味/声音/温度）
  sentences.forEach(function(s) {
    if (/(雷声|闪电|暴雨|大雪|寒风|烈日|月光|夕阳|晨光|暮色|黑暗|浓雾|血腥味|药味|檀香|烟火气|冷意|灼热|刺骨|阴冷)/.test(s) &&
        /(山|谷|城|府|殿|楼|阁|村|营|牢|院|门|堂|宫|街|巷|战场|悬崖|深渊|密室|荒野)/.test(s)) {
      upsertMemoryAnchor(w, 'scenes', s.slice(0, 90), Object.assign({weight:3}, meta));
    }
  });

  // 14. v51 新增：能力突破/觉醒 — 角色实力跃迁（写入core永久保留）
  names.forEach(function(name) {
    if (!name || name === '主角') return;
    sentences.forEach(function(s) {
      if (!s.includes(name)) return;
      if (/(突破|晋升|觉醒|开窍|结丹|元婴|化神|渡劫|飞升|入圣|封王|封侯|称帝|登基|血脉觉醒|天赋觉醒|功法大成)/.test(s)) {
        upsertMemoryAnchor(w, 'core', name + '：' + s.slice(0, 80), Object.assign({key:name + 'break' + idx, weight:6}, metaWithChar(name)));
      }
    });
  });
}

function scoreMemoryAnchor(anchor, idx) {
  const distance = Math.max(0, (idx || 0) - (anchor.chapterIdx || 0));
  // 距离衰减：越近权重越高
  const distanceScore = distance <= 2 ? 6 : distance <= 5 ? 4 : distance <= 10 ? 2 : distance <= 20 ? 1 : 0;
  // tier基础权重
  var bucket = anchor._bucket || anchor.type || 'hooks';
  var tierMeta = MEMORY_TIER_META[bucket] || { tier: 2, weight: 5 };
  const typeScore = tierMeta.weight || 5;
  // 手动标记权重
  const manualWeight = anchor.weight || 0;
  // 紧急度加分：待兑现/待回收状态
  const urgencyScore = (anchor.urgent || anchor.level === 'high' || anchor.status === '待回收' || anchor.status === '待兑现') ? 3 : 0;
  // L0核心事实额外加权（永不被遗忘）
  const l0Bonus = tierMeta.tier === 0 ? 5 : 0;
  // v51：角色分级加权 — 主角+5，女主/男主/反派+4，配角/导师/伙伴+3，龙套+1
  var roleScore = 0;
  if (anchor.charRole && CHAR_ROLE_WEIGHT[anchor.charRole]) {
    roleScore = CHAR_ROLE_WEIGHT[anchor.charRole].weight;
  }
  return typeScore + distanceScore + manualWeight + urgencyScore + l0Bonus + roleScore;
}


// v28：提取章节级长期索引
function updateChapterIndex(w, idx, content) {
  initLongMemory(w);
  const ch = w.chapters && w.chapters[idx] ? w.chapters[idx] : {};
  const title = ch.title || ('第' + (idx + 1) + '章');
  const sentences = (content || '').split(/[。！？\n]+/).map(function(s){return s.trim();}).filter(function(s){return s.length >= 8;});
  const names = extractCharNameMap(w.chars || '').names.filter(function(n){ return n && n !== '主角' && content.indexOf(n) >= 0; }).slice(0, 8);
  const eventWords = ['杀','战','逃','救','夺','破','败','胜','发现','揭开','背叛','结盟','突破','受伤','死亡','暴露','交易','承诺'];
  const keyEvents = [];
  sentences.forEach(function(s){
    if (keyEvents.length >= 4) return;
    if (eventWords.some(function(k){return s.indexOf(k) >= 0;})) keyEvents.push(s.slice(0, 60));
  });
  const locMatch = content.match(/(?:来到|进入|离开|回到|赶往|抵达|藏在|困在)[^，。！？\n]{1,25}/g);
  const locations = locMatch ? locMatch.slice(-3).map(function(x){return x.slice(0, 30);}) : [];
  const tailParts = content.slice(-600).split(/[。！？\n]+/).filter(Boolean);
  const hook = tailParts.slice(-2).join('。').slice(0, 120);
  const keywords = [];
  ['秘密','真相','令牌','玉佩','密信','账册','血脉','身世','仇','承诺','三日','七日','背叛','结盟','埋伏','封锁','突破','死亡'].forEach(function(k){
    if (content.indexOf(k) >= 0) keywords.push(k);
  });
  const record = {
    chapterIdx: idx,
    title: title,
    summary: ch.summary || extractChapterSummary(content, title),
    chars: names,
    events: keyEvents,
    locations: locations,
    keywords: keywords.slice(0, 12),
    hook: hook,
    wordCount: content.length,
    updatedAt: Date.now()
  };
  const list = w.longMemory.chapterIndex;
  const oldIdx = list.findIndex(function(x){ return x.chapterIdx === idx; });
  if (oldIdx >= 0) list[oldIdx] = record;
  else list.push(record);
  w.longMemory.chapterIndex = list.sort(function(a,b){return a.chapterIdx - b.chapterIdx;}).slice(-3000);
}

// v28：记录人物跨章节轨迹
function updateCharacterHistory(w, idx, states) {
  initLongMemory(w);
  const hist = w.longMemory.characterHistory;
  (states || []).forEach(function(s){
    if (!s || !s.name) return;
    if (!hist[s.name]) hist[s.name] = [];
    const row = {
      chapterIdx: idx,
      status: s.status || '正常',
      location: s.location || '',
      emotion: s.emotion || '',
      action: (s.action || '').slice(0, 60),
      updatedAt: Date.now()
    };
    const same = hist[s.name].find(function(x){ return x.chapterIdx === idx; });
    if (same) {
      same.status = row.status; same.location = row.location; same.emotion = row.emotion; same.action = row.action; same.updatedAt = row.updatedAt;
    } else {
      hist[s.name].push(row);
    }
    hist[s.name] = hist[s.name].sort(function(a,b){return a.chapterIdx - b.chapterIdx;}).slice(-100);
  });
}

// ========== 记忆分级元数据已移至文件顶部（MEMORY_TIER_META）==========
// 此处保留供查阅：旧版压缩函数引用了以下注释
// L0: core - 永不压缩
// L1: characterTags/relationships/items/promises - maxRaw 80-120, compressAfter 20-25
// L2: locations/timeline/hooks - maxRaw 60-80, compressAfter 15

// 更新生命周期函数，加入tier感知
function updateLongMemoryLifecycle(w, idx, content) {
  initLongMemory(w);
  const mem = w.longMemory;
  const anchors = mem.memoryAnchors || {};
  const resolveWords = ['兑现','完成','履行','揭晓','真相','原来','还清','归还','杀死','击败','救出','找到','拿回','说清'];
  ['promises','hooks'].forEach(function(bucket){
    (anchors[bucket] || []).forEach(function(a){
      if (a.status === '失效' || a.status === '已兑现') return;
      const age = idx - (a.chapterIdx || 0);
      const probe = (a.text || '').slice(0, 14);
      // tier-aware: 高tier更耐等待，低tier更快标记待处理
      const tier = MEMORY_TIER_META[bucket] ? MEMORY_TIER_META[bucket].tier : 1;
      const threshold = tier === 0 ? Infinity : tier === 1 ? 12 : 8;
      const urgentThreshold = tier === 1 ? 20 : 15;
      if (age > 0 && probe && content.indexOf(probe) >= 0 && resolveWords.some(function(k){return content.indexOf(k) >= 0;})) {
        a.status = '已兑现';
        a.resolvedAt = idx;
        a.updatedAt = Date.now();
      } else if (age >= urgentThreshold && bucket === 'hooks') {
        a.status = '待回收';
        a.urgent = true;
      } else if (age >= threshold && bucket === 'promises') {
        a.status = '待兑现';
        a.urgent = age >= urgentThreshold;
      }
    });
  });
  (mem.foreshadows || []).forEach(function(f){
    if (f.status !== '未解') return;
    const age = idx - (f.chapterIdx || 0);
    if (age > 0 && f.keyword && content.indexOf(f.keyword) >= 0 && resolveWords.some(function(k){return content.indexOf(k) >= 0;})) {
      f.status = '已解';
      f.resolvedAt = idx;
    } else if (age >= 10) {
      f.status = '待回收';
    }
  });
  const debts = [];
  (anchors.promises || []).forEach(function(a){
    const age = idx - (a.chapterIdx || 0);
    if (a.status === '待兑现' || (a.status === '有效' && age >= 12)) debts.push({type:'承诺', chapterIdx:a.chapterIdx||0, text:a.text, age:age, level:age>=25?'high':'mid', bucket:'promises'});
  });
  (anchors.hooks || []).forEach(function(a){
    const age = idx - (a.chapterIdx || 0);
    if (a.status === '待回收' || (a.status === '有效' && age >= 8)) debts.push({type:'钩子', chapterIdx:a.chapterIdx||0, text:a.text, age:age, level:age>=15?'high':'mid', bucket:'hooks'});
  });
  (mem.foreshadows || []).forEach(function(f){
    const age = idx - (f.chapterIdx || 0);
    if (f.status === '待回收' || (f.status === '未解' && age >= 10)) debts.push({type:'伏笔', chapterIdx:f.chapterIdx||0, text:f.line, age:age, level:age>=18?'high':'mid'});
  });
  mem.memoryDebt = debts.sort(function(a,b){
    // high优先，然后按age降序
    if (a.level === 'high' && b.level !== 'high') return -1;
    if (b.level === 'high' && a.level !== 'high') return 1;
    return b.age - a.age;
  }).slice(0, 20);
}

// v46：五层渐进式压缩 —— 支撑3000章+超长篇（tier-aware压缩）
function compressLongMemory(w, idx) {
  initLongMemory(w);
  var mem = w.longMemory;
  var list = mem.chapterIndex || [];
  if (list.length < 10) return;
  var lastCompressedAt = mem.lifecycle.lastCompressedAt || -1;
  if (idx - lastCompressedAt < 5) return;
  var rs = mem.rollingSummary;
  // 兼容旧版：确保所有层级字段存在
  if (!rs.ultraEras) rs.ultraEras = '';
  if (!rs.megaEras) rs.megaEras = '';

  // Tier 1: 最近120章 → rollingSummary.recent（详细行级，~2000字）
  var cutoff1 = Math.max(0, idx - 120);
  var recentCh = list.filter(function(x){ return x.chapterIdx >= cutoff1 && x.chapterIdx < idx; });
  var parts1 = recentCh.map(function(x){
    var ev = (x.events || []).slice(0, 2).join('；');
    var kw = (x.keywords || []).slice(0, 3).join('/');
    return '第' + (x.chapterIdx+1) + '章：' + (x.summary || '') + (ev ? '｜' + ev : '') + (kw ? '｜' + kw : '');
  });
  rs.recent = parts1.join('\n');
  if (rs.recent.length > 2000) rs.recent = rs.recent.slice(-2000);

  // Tier 2: 120-500章 → rollingSummary.milestones（蒸馏关键事件，~1200字）
  var cutoff2 = Math.max(0, idx - 500);
  var midCh = list.filter(function(x){ return x.chapterIdx >= cutoff2 && x.chapterIdx < cutoff1; });
  if (midCh.length > 0) {
    var milestoneLines = [];
    var lastDistilled = -1;
    midCh.forEach(function(x){
      var important = (x.keywords || []).some(function(k){
        return ['秘密','真相','承诺','背叛','血脉','身世','密信','突破','死亡','结盟','复仇','覆灭','崛起','代价','觉醒','封印','灭门','吞并'].indexOf(k) >= 0;
      });
      if (!important && (x.chapterIdx - lastDistilled) < 10) return;
      var ev = (x.events || []).slice(0, 1).join('；');
      milestoneLines.push('第' + (x.chapterIdx+1) + '章：' + ((x.summary||'').slice(0, 60)) + (ev ? '｜' + ev.slice(0, 40) : ''));
      lastDistilled = x.chapterIdx;
    });
    rs.milestones = '【中期里程碑（第' + (cutoff2+1) + '-' + Math.max(cutoff1, cutoff2+1) + '章）】\n' + milestoneLines.join('\n');
    if (rs.milestones.length > 1200) rs.milestones = rs.milestones.slice(0, 1200);
  }

  // Tier 3: 500-1200章 → rollingSummary.eras（时代标记+核心人物，~600字）
  var cutoff3 = Math.max(0, idx - 1200);
  var oldCh = list.filter(function(x){ return x.chapterIdx >= cutoff3 && x.chapterIdx < cutoff2; });
  if (oldCh.length > 0) {
    var eras = {};
    oldCh.forEach(function(x){
      var eraIdx = Math.floor(x.chapterIdx / 50);
      if (!eras[eraIdx]) eras[eraIdx] = {chapters:[], keywords:{}, chars:{}};
      eras[eraIdx].chapters.push(x);
      (x.keywords || []).forEach(function(k){ eras[eraIdx].keywords[k] = (eras[eraIdx].keywords[k]||0)+1; });
      (x.chars || []).forEach(function(c){ eras[eraIdx].chars[c] = (eras[eraIdx].chars[c]||0)+1; });
    });
    var eraKeys = Object.keys(eras).sort(function(a,b){ return parseInt(a)-parseInt(b); });
    var eraLines = eraKeys.map(function(ek){
      var era = eras[ek];
      var firstCh = Math.min.apply(null, era.chapters.map(function(x){ return x.chapterIdx; }));
      var lastCh = Math.max.apply(null, era.chapters.map(function(x){ return x.chapterIdx; }));
      var topKW = Object.keys(era.keywords).sort(function(a,b){ return era.keywords[b]-era.keywords[a]; }).slice(0, 4).join('/');
      var topChars = Object.keys(era.chars).sort(function(a,b){ return era.chars[b]-era.chars[a]; }).slice(0, 3).join('/');
      return '第' + (firstCh+1) + '-' + (lastCh+1) + '章：' + topKW + (topChars ? '｜核心人物：' + topChars : '');
    });
    rs.eras = '【远期时代标记（第' + (cutoff3+1) + '-' + Math.max(cutoff2, cutoff3+1) + '章）】\n' + eraLines.slice(-12).join('\n');
    if (rs.eras.length > 600) rs.eras = rs.eras.slice(0, 600);
  }

  // Tier 4: 1200-2500章 → rollingSummary.ultraEras（极简卷级标记，~400字）
  var cutoff4 = Math.max(0, idx - 2500);
  var ultraOldCh = list.filter(function(x){ return x.chapterIdx >= cutoff4 && x.chapterIdx < cutoff3; });
  if (ultraOldCh.length > 0) {
    var ultraEras = {};
    ultraOldCh.forEach(function(x){
      var ueIdx = Math.floor(x.chapterIdx / 100);
      if (!ultraEras[ueIdx]) ultraEras[ueIdx] = {chapters:[], keywords:{}, chars:{}};
      ultraEras[ueIdx].chapters.push(x);
      (x.keywords || []).forEach(function(k){ ultraEras[ueIdx].keywords[k] = (ultraEras[ueIdx].keywords[k]||0)+1; });
      (x.chars || []).forEach(function(c){ ultraEras[ueIdx].chars[c] = (ultraEras[ueIdx].chars[c]||0)+1; });
    });
    var ueKeys = Object.keys(ultraEras).sort(function(a,b){ return parseInt(a)-parseInt(b); });
    var ueLines = ueKeys.map(function(ek){
      var ue = ultraEras[ek];
      var firstCh = Math.min.apply(null, ue.chapters.map(function(x){ return x.chapterIdx; }));
      var lastCh = Math.max.apply(null, ue.chapters.map(function(x){ return x.chapterIdx; }));
      var topKW = Object.keys(ue.keywords).sort(function(a,b){ return ue.keywords[b]-ue.keywords[a]; }).slice(0, 3).join('/');
      var topChars = Object.keys(ue.chars).sort(function(a,b){ return ue.chars[b]-ue.chars[a]; }).slice(0, 2).join('/');
      return '第' + (firstCh+1) + '-' + (lastCh+1) + '章：' + topKW + (topChars ? '｜' + topChars : '');
    });
    rs.ultraEras = '【超远期卷级标记（第' + (cutoff4+1) + '-' + Math.max(cutoff3, cutoff4+1) + '章）】\n' + ueLines.join('\n');
    if (rs.ultraEras.length > 400) rs.ultraEras = rs.ultraEras.slice(0, 400);
  }

  // Tier 5: 2500章以后 → rollingSummary.megaEras（极简大时代标记，~250字）
  var megaOldCh = list.filter(function(x){ return x.chapterIdx < cutoff4; });
  if (megaOldCh.length > 0) {
    var megaEras = {};
    megaOldCh.forEach(function(x){
      var meIdx = Math.floor(x.chapterIdx / 300);
      if (!megaEras[meIdx]) megaEras[meIdx] = {chapters:[], keywords:{}, chars:{}};
      megaEras[meIdx].chapters.push(x);
      (x.keywords || []).forEach(function(k){ megaEras[meIdx].keywords[k] = (megaEras[meIdx].keywords[k]||0)+1; });
      (x.chars || []).forEach(function(c){ megaEras[meIdx].chars[c] = (megaEras[meIdx].chars[c]||0)+1; });
    });
    var meKeys = Object.keys(megaEras).sort(function(a,b){ return parseInt(a)-parseInt(b); });
    var meLines = meKeys.map(function(ek){
      var me = megaEras[ek];
      var firstCh = Math.min.apply(null, me.chapters.map(function(x){ return x.chapterIdx; }));
      var lastCh = Math.max.apply(null, me.chapters.map(function(x){ return x.chapterIdx; }));
      var topKW = Object.keys(me.keywords).sort(function(a,b){ return me.keywords[b]-me.keywords[a]; }).slice(0, 2).join('/');
      var topChars = Object.keys(me.chars).sort(function(a,b){ return me.chars[b]-me.chars[a]; }).slice(0, 2).join('/');
      return '第' + (firstCh+1) + '-' + (lastCh+1) + '章：' + topKW + (topChars ? '｜' + topChars : '');
    });
    rs.megaEras = '【极远期大时代标记（第1-' + cutoff4 + '章）】\n' + meLines.join('\n');
    if (rs.megaEras.length > 250) rs.megaEras = rs.megaEras.slice(0, 250);
  }
  
  // v46：同时压缩过量的锚点
  compressMemoryAnchors(w, idx);
  
  mem.lifecycle.lastCompressedAt = idx;
}

function buildCharacterHistoryContext(w, idx) {
  if (!w || !w.longMemory || !w.longMemory.characterHistory) return '';
  const hist = w.longMemory.characterHistory;
  let rows = [];
  Object.keys(hist).forEach(function(name){
    const arr = (hist[name] || []).filter(function(x){return x.chapterIdx < idx;}).slice(-4);
    if (!arr.length) return;
    const line = name + '：' + arr.map(function(x){
      return '第' + (x.chapterIdx+1) + '章[' + (x.status||'正常') + (x.emotion?','+x.emotion:'') + (x.location?','+x.location:'') + ']';
    }).join(' -> ');
    rows.push(line);
  });
  if (!rows.length) return '';
  return '【人物长期轨迹】\n' + rows.slice(0, 8).join('\n') + '\n\n';
}

// v46：压缩过量的记忆锚点 —— 按桶的Tier分别蒸馏（L0永不压缩，L1/L2按需压缩）
function compressMemoryAnchors(w, idx) {
  initLongMemory(w);
  var anchors = w.longMemory.memoryAnchors;
  var digests = w.longMemory._anchorDigest;
  // v51：包含新增桶
  var names = ['core','characterTags','relationships','items','locations','promises','timeline','hooks','dialogues','abilityCosts','emotionTrack','scenes'];
  // tier-aware: 根据MEMORY_TIER_META决定每个桶的压缩时机
  names.forEach(function(bucket){
    var tierMeta = MEMORY_TIER_META[bucket] || { tier: 2, maxRaw: 60, compressAfter: 15, archiveAfter: 25 };
    // L0核心永不压缩
    if (tierMeta.tier === 0) return;
    var list = (anchors[bucket] || []).filter(function(a){ return a.status !== '失效'; });
    if (list.length <= tierMeta.maxRaw) return;
    // 按age分组，每20章压一组
    var recent = list.slice(-Math.floor(tierMeta.maxRaw * 0.5));
    var old = list.slice(0, list.length - Math.floor(tierMeta.maxRaw * 0.5));
    var groups = {};
    old.forEach(function(a){
      var gIdx = Math.floor((a.chapterIdx || 0) / 20);
      if (!groups[gIdx]) groups[gIdx] = [];
      groups[gIdx].push(a);
    });
    var newDigests = [];
    Object.keys(groups).sort(function(a,b){ return parseInt(a)-parseInt(b); }).forEach(function(gk){
      var g = groups[gk];
      var summary = g.map(function(x){ return x.text.slice(0, 50); }).join('；');
      newDigests.push('第' + (Math.min.apply(null, g.map(function(x){return x.chapterIdx||0;}))+1) + '-' + (Math.max.apply(null, g.map(function(x){return x.chapterIdx||0;}))+1) + '章：' + summary.slice(0, 180));
    });
    digests[bucket] = (digests[bucket] || []).concat(newDigests).slice(-8);
    old.forEach(function(a){ a.status = '已压缩'; });
    anchors[bucket] = anchors[bucket].filter(function(a){ return a.status !== '已压缩'; }).slice(-tierMeta.maxRaw);
  });
}

function buildChapterIndexContext(w, idx) {
  if (!w || !w.longMemory || !Array.isArray(w.longMemory.chapterIndex)) return '';
  const list = w.longMemory.chapterIndex.filter(function(x){return x.chapterIdx < idx;});
  if (!list.length) return '';
  const recent = list.slice(-6);
  const important = list.filter(function(x){
    return (x.keywords || []).some(function(k){return ['秘密','真相','承诺','背叛','血脉','身世','密信','令牌'].indexOf(k) >= 0;});
  }).slice(-4);
  const merged = [];
  recent.concat(important).forEach(function(x){
    if (!merged.find(function(y){return y.chapterIdx === x.chapterIdx;})) merged.push(x);
  });
  if (!merged.length) return '';
  let ctx = '【章节长期索引】\n';
  merged.sort(function(a,b){return a.chapterIdx-b.chapterIdx;}).forEach(function(x){
    ctx += '  第' + (x.chapterIdx+1) + '章 ' + (x.title||'') + '：' + (x.summary||'').slice(0, 90);
    if (x.hook) ctx += '｜尾钩：' + x.hook.slice(0, 50);
    ctx += '\n';
  });
  return ctx + '\n';
}

function buildMemoryDebtContext(w, idx) {
  if (!w || !w.longMemory || !Array.isArray(w.longMemory.memoryDebt) || !w.longMemory.memoryDebt.length) return '';
  const debts = w.longMemory.memoryDebt.slice(0, 6);
  let ctx = '【长记忆提醒：待回收/待兑现】\n';
  debts.forEach(function(d){
    ctx += '  - ' + d.type + '：第' + ((d.chapterIdx||0)+1) + '章「' + (d.text||'').slice(0, 60) + '」已悬挂' + d.age + '章';
    if (d.level === 'high') ctx += '，建议尽快处理';
    ctx += '\n';
  });
  return ctx + '\n';
}

function buildAnchorContext(w, idx) {
  if (!w || !w.longMemory || !w.longMemory.memoryAnchors) return '';
  var anchors = w.longMemory.memoryAnchors;
  var names = {
    core: 'L0 核心事实（全书级，绝不能写错）',
    characterTags: 'L1 角色记忆点',
    relationships: 'L1 关系变化',
    items: 'L1 道具归属',
    promises: 'L2 承诺/禁忌/时限',
    dialogues: 'L1 角色金句（必须保持角色声音一致）',
    abilityCosts: 'L1 能力代价/反噬（防止无限开挂）',
    emotionTrack: 'L1 情感轨迹（情绪必须连贯）',
    scenes: 'L2 场景细节（感官回响）',
    locations: 'L2 地点状态',
    timeline: 'L2 时间线锚点',
    hooks: 'L3 未兑现爽点钩子'
  };
  // v51：分级输出顺序 — 高优先级在前，新增桶按tier插入
  var priorityOrder = ['core', 'characterTags', 'dialogues', 'emotionTrack', 'relationships', 'items', 'abilityCosts', 'promises', 'locations', 'scenes', 'timeline', 'hooks'];
  var ctx = '';
  priorityOrder.forEach(function(bucket) {
    var list = (anchors[bucket] || [])
      .filter(function(a){ return (a.chapterIdx || 0) < idx && a.status !== '失效'; })
      .sort(function(a,b){ return scoreMemoryAnchor(b, idx) - scoreMemoryAnchor(a, idx); })
      .slice(0, bucket === 'core' ? 12 : bucket === 'characterTags' ? 10 : bucket === 'dialogues' ? 6 : bucket === 'emotionTrack' ? 6 : 6);
    if (!list.length) return;
    ctx += '【' + names[bucket] + '】\n';
    list.forEach(function(a) {
      var urgency = a.urgent || a.level === 'high' ? ' ⚠️' : '';
      // v51：角色分级标签（主角/配角/反派等）
      var roleTag = '';
      if (a.charRole && a.charRole !== '龙套') roleTag = '[' + a.charRole + '] ';
      else if (a.charRole === '龙套') roleTag = '[龙套] ';
      ctx += '  - 第' + ((a.chapterIdx || 0) + 1) + '章：' + roleTag + a.text + urgency + '\n';
    });
    // v46：追加蒸馏摘要（早期锚点压缩版）
    var digests = (w.longMemory._anchorDigest && w.longMemory._anchorDigest[bucket] ? w.longMemory._anchorDigest[bucket] : []);
    if (digests.length > 0) {
      ctx += '  [早期摘要]' + digests.slice(-3).join('；') + '\n';
    }
    ctx += '\n';
  });
  return ctx;
}


// ========== v30：超长篇记忆引擎 ==========
function ensureUltraLongMemory(w) {
  initLongMemory(w);
  const mem = w.longMemory;
  if (!Array.isArray(mem.volumeMemories)) mem.volumeMemories = [];
  if (!mem.characterProfiles) mem.characterProfiles = {};
  if (!Array.isArray(mem.foreshadowLedger)) mem.foreshadowLedger = [];
  if (!mem.itemLedger) mem.itemLedger = {};
  if (!mem.factionGraph) mem.factionGraph = {};
  if (!Array.isArray(mem.timelineEvents)) mem.timelineEvents = [];
  if (!mem.ultraMeta) mem.ultraMeta = {volumeSize:50, lastUltraUpdateAt:-1};
}

function _shortText(s, n) {
  return String(s || '').replace(/\s+/g, ' ').trim().slice(0, n || 80);
}

function _pushUnique(list, item, keyFn, maxLen) {
  keyFn = keyFn || function(x){ return x.key || x.text || JSON.stringify(x).slice(0,60); };
  const key = keyFn(item);
  const idx = list.findIndex(function(x){ return keyFn(x) === key; });
  if (idx >= 0) {
    list[idx] = Object.assign({}, list[idx], item, {updatedAt:Date.now()});
  } else {
    list.push(Object.assign({}, item, {createdAt:Date.now(), updatedAt:Date.now()}));
  }
  if (maxLen && list.length > maxLen) list.splice(0, list.length - maxLen);
}

function updateCharacterProfiles(w, idx, content, states) {
  ensureUltraLongMemory(w);
  const profiles = w.longMemory.characterProfiles;
  const names = extractCharNameMap(w.chars || '').names || [];
  const sentences = (content || '').split(/[。！？\n]+/).map(function(s){return s.trim();}).filter(Boolean);
  names.forEach(function(name){
    if (!name || name === '主角' || content.indexOf(name) < 0) return;
    if (!profiles[name]) {
      profiles[name] = {name:name, firstChapter:idx, lastSeen:idx, status:'正常', location:'', emotion:'', relationships:[], items:[], milestones:[], aliases:[]};
    }
    const p = profiles[name];
    p.lastSeen = idx;
    const st = (states || []).find(function(x){return x.name === name;});
    if (st) {
      p.status = st.status || p.status || '正常';
      p.location = st.location || p.location || '';
      p.emotion = st.emotion || p.emotion || '';
    }
    sentences.forEach(function(s){
      if (s.indexOf(name) < 0) return;
      if (/(突破|晋升|觉醒|重伤|死亡|复活|背叛|归顺|成婚|拜师|夺权|登基|封侯|被捕|逃亡)/.test(s)) {
        _pushUnique(p.milestones, {chapterIdx:idx, text:_shortText(s,90)}, function(x){return x.chapterIdx + ':' + x.text.slice(0,20);}, 30);
      }
      if (/(救了|欠|结盟|联手|背叛|敌对|仇|喜欢|保护|怀疑|信任|决裂|和解)/.test(s)) {
        _pushUnique(p.relationships, {chapterIdx:idx, text:_shortText(s,90)}, function(x){return x.chapterIdx + ':' + x.text.slice(0,24);}, 20);
      }
      if (/(得到|拿到|交给|夺走|抢走|藏起|丢失|归还).{0,18}(剑|刀|枪|信|令牌|玉佩|钥匙|账册|地图|兵符|密信|戒指|匣|药|丹)/.test(s)) {
        _pushUnique(p.items, {chapterIdx:idx, text:_shortText(s,90)}, function(x){return x.chapterIdx + ':' + x.text.slice(0,24);}, 15);
      }
    });
  });
}

function updateItemLedger(w, idx, content) {
  ensureUltraLongMemory(w);
  const ledger = w.longMemory.itemLedger;
  const re = /(得到|获得|拿到|夺走|抢走|交给|藏起|收起|丢失|遗失|归还|留下).{0,20}(剑|刀|枪|信|令牌|玉佩|钥匙|药|丹|卷轴|账册|地图|匣|戒指|兵符|密信|玉玺|虎符|印章|遗书)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const full = _shortText(m[0], 80);
    const itemName = m[2];
    if (!ledger[itemName]) ledger[itemName] = {name:itemName, owner:'未知', status:'流转中', history:[]};
    const row = {chapterIdx:idx, action:m[1], text:full};
    ledger[itemName].status = /丢失|遗失/.test(m[1]) ? '遗失' : (/归还|交给/.test(m[1]) ? '已转交' : '持有中');
    ledger[itemName].lastChapter = idx;
    _pushUnique(ledger[itemName].history, row, function(x){return x.chapterIdx + ':' + x.text;}, 20);
  }
}

function updateFactionGraph(w, idx, content) {
  ensureUltraLongMemory(w);
  const graph = w.longMemory.factionGraph;
  const factionRe = /([\u4e00-\u9fa5]{2,8}(?:宗|门|派|府|军|营|帮|盟|国|朝|族|阁|楼|殿|司|卫|寨|商会|集团))/g;
  const found = [];
  let m;
  while ((m = factionRe.exec(content)) !== null) {
    if (found.indexOf(m[1]) < 0) found.push(m[1]);
    if (found.length >= 12) break;
  }
  found.forEach(function(name){
    if (!graph[name]) graph[name] = {name:name, status:'活跃', allies:[], enemies:[], events:[]};
  });
  const sentences = (content || '').split(/[。！？\n]+/).map(function(s){return s.trim();}).filter(Boolean);
  sentences.forEach(function(s){
    const fs = found.filter(function(f){return s.indexOf(f) >= 0;});
    if (!fs.length) return;
    fs.forEach(function(f){
      const node = graph[f];
      if (/(结盟|联手|归顺|投靠|合作|援军)/.test(s)) {
        fs.forEach(function(o){ if (o !== f && node.allies.indexOf(o) < 0) node.allies.push(o); });
        _pushUnique(node.events, {chapterIdx:idx, type:'结盟', text:_shortText(s,90)}, function(x){return x.chapterIdx+':'+x.type+':'+x.text.slice(0,20);}, 20);
      }
      if (/(开战|敌|攻打|围剿|背叛|灭|屠|追杀|伏击)/.test(s)) {
        fs.forEach(function(o){ if (o !== f && node.enemies.indexOf(o) < 0) node.enemies.push(o); });
        _pushUnique(node.events, {chapterIdx:idx, type:'敌对', text:_shortText(s,90)}, function(x){return x.chapterIdx+':'+x.type+':'+x.text.slice(0,20);}, 20);
      }
      if (/(被灭|覆灭|解散|投降|归降)/.test(s)) node.status = '衰败/变更';
    });
  });
}

function updateTimelineEvents(w, idx, content) {
  ensureUltraLongMemory(w);
  const list = w.longMemory.timelineEvents;
  const sentences = (content || '').split(/[。！？\n]+/).map(function(s){return s.trim();}).filter(Boolean);
  const timeRe = /(三年前|十年前|百年前|昨夜|今夜|明日|翌日|黎明|黄昏|午夜|半个时辰|一炷香|三日后|七日后|一个月后|一年后|第[一二三四五六七八九十百千万]+日)/;
  sentences.forEach(function(s){
    const tm = s.match(timeRe);
    if (!tm) return;
    if (!/(死|战|逃|救|夺|破|败|胜|发现|揭开|背叛|结盟|突破|受伤|暴露|交易|承诺|发誓|封锁|埋伏)/.test(s)) return;
    _pushUnique(list, {chapterIdx:idx, time:tm[1], text:_shortText(s,100), type:'事件'}, function(x){return x.chapterIdx+':'+x.time+':'+x.text.slice(0,24);}, 500);
  });
}

function updateForeshadowLedger(w, idx) {
  ensureUltraLongMemory(w);
  const mem = w.longMemory;
  const ledger = mem.foreshadowLedger;
  const add = function(type, chapterIdx, text, status, priority) {
    if (!text) return;
    const age = Math.max(0, idx - (chapterIdx || 0));
    _pushUnique(ledger, {
      type:type, chapterIdx:chapterIdx||0, text:_shortText(text,100),
      status:status || '未解', age:age, priority:priority || (age > 20 ? '高' : '中')
    }, function(x){return x.type+':'+x.chapterIdx+':'+x.text.slice(0,24);}, 300);
  };
  (mem.foreshadows || []).forEach(function(f){ add('伏笔', f.chapterIdx, f.line, f.status || '未解', f.status === '待回收' ? '高' : '中'); });
  const anchors = mem.memoryAnchors || {};
  (anchors.promises || []).forEach(function(a){ add('承诺', a.chapterIdx, a.text, a.status || '有效', a.status === '待兑现' ? '高' : '中'); });
  (anchors.hooks || []).forEach(function(a){ add('钩子', a.chapterIdx, a.text, a.status || '有效', a.status === '待回收' ? '高' : '中'); });
  ledger.forEach(function(x){ x.age = Math.max(0, idx - (x.chapterIdx || 0)); if (x.age >= 25 && x.status !== '已解' && x.status !== '已兑现') x.priority = '高'; });
  mem.foreshadowLedger = ledger.sort(function(a,b){
    const pa = a.priority === '高' ? 2 : 1, pb = b.priority === '高' ? 2 : 1;
    return pb - pa || b.age - a.age;
  }).slice(0, 300);
}

function updateVolumeMemories(w, idx) {
  ensureUltraLongMemory(w);
  const mem = w.longMemory;
  const size = (mem.ultraMeta && mem.ultraMeta.volumeSize) || 50;
  const volumeNo = Math.floor(idx / size) + 1;
  const start = (volumeNo - 1) * size;
  const end = Math.min(idx, start + size - 1);
  const chapters = (mem.chapterIndex || []).filter(function(x){return x.chapterIdx >= start && x.chapterIdx <= end;});
  if (!chapters.length) return;
  const characters = {};
  const keywords = {};
  const events = [];
  chapters.forEach(function(ch){
    (ch.chars || []).forEach(function(c){characters[c] = (characters[c]||0)+1;});
    (ch.keywords || []).forEach(function(k){keywords[k] = (keywords[k]||0)+1;});
    (ch.events || []).slice(0,1).forEach(function(e){events.push('第'+(ch.chapterIdx+1)+'章：'+e);});
  });
  const topChars = Object.keys(characters).sort(function(a,b){return characters[b]-characters[a];}).slice(0,12);
  const topKeys = Object.keys(keywords).sort(function(a,b){return keywords[b]-keywords[a];}).slice(0,12);
  let summary = chapters.slice(-18).map(function(ch){
    return '第' + (ch.chapterIdx+1) + '章：' + _shortText(ch.summary || (ch.events||[]).join('；'), 80);
  }).join('\n');
  if (summary.length > 1200) summary = summary.slice(-1200);
  const openLedger = (mem.foreshadowLedger || []).filter(function(x){return x.status !== '已解' && x.status !== '已兑现';}).slice(0, 20);
  const row = {volumeNo:volumeNo, start:start, end:end, summary:summary, characters:topChars, keywords:topKeys, events:events.slice(-20), openThreads:openLedger, updatedAt:Date.now()};
  const i = mem.volumeMemories.findIndex(function(v){return v.volumeNo === volumeNo;});
  if (i >= 0) mem.volumeMemories[i] = row; else mem.volumeMemories.push(row);
  mem.volumeMemories = mem.volumeMemories.sort(function(a,b){return a.volumeNo-b.volumeNo;}).slice(-100);
}

function updateUltraLongMemory(w, idx, content, states) {
  ensureUltraLongMemory(w);
  updateCharacterProfiles(w, idx, content, states);
  updateItemLedger(w, idx, content);
  updateFactionGraph(w, idx, content);
  updateTimelineEvents(w, idx, content);
  updateForeshadowLedger(w, idx);
  updateVolumeMemories(w, idx);
  w.longMemory.ultraMeta.lastUltraUpdateAt = idx;
}

function buildVolumeMemoryContext(w, idx) {
  if (!w || !w.longMemory || !Array.isArray(w.longMemory.volumeMemories)) return '';
  const size = (w.longMemory.ultraMeta && w.longMemory.ultraMeta.volumeSize) || 50;
  const currentVolume = Math.floor(idx / size) + 1;
  const vols = w.longMemory.volumeMemories.filter(function(v){return v.volumeNo < currentVolume;});
  if (!vols.length) return '';
  const recent = vols.slice(-3);
  const first = vols.length > 3 ? [vols[0]] : [];
  const selected = [];
  first.concat(recent).forEach(function(v){ if (!selected.find(function(x){return x.volumeNo===v.volumeNo;})) selected.push(v); });
  let ctx = '【超长篇分卷记忆】\n';
  selected.forEach(function(v){
    ctx += '第' + v.volumeNo + '卷（第' + (v.start+1) + '-' + (v.end+1) + '章）：\n';
    if (v.characters && v.characters.length) ctx += '  核心人物：' + v.characters.slice(0,8).join('/') + '\n';
    if (v.keywords && v.keywords.length) ctx += '  核心关键词：' + v.keywords.slice(0,8).join('/') + '\n';
    ctx += '  卷摘要：' + _shortText(v.summary, 380) + '\n';
  });
  return ctx + '\n';
}

function buildUltraLedgerContext(w, idx) {
  if (!w || !w.longMemory) return '';
  const mem = w.longMemory;
  let ctx = '';
  const profiles = mem.characterProfiles || {};
  const chars = Object.keys(profiles).map(function(k){return profiles[k];})
    .sort(function(a,b){return (b.lastSeen||0)-(a.lastSeen||0);}).slice(0, 10);
  if (chars.length) {
    ctx += '【人物档案库（超长篇）】\n';
    chars.forEach(function(p){
      ctx += '  ' + p.name + '：第' + ((p.firstChapter||0)+1) + '章登场，最后第' + ((p.lastSeen||0)+1) + '章；当前' + (p.status||'正常');
      if (p.location) ctx += '，位置：' + p.location;
      if (p.milestones && p.milestones.length) ctx += '；最近里程碑：' + _shortText(p.milestones.slice(-1)[0].text, 50);
      ctx += '\n';
    });
    ctx += '\n';
  }
  const debts = (mem.foreshadowLedger || []).filter(function(x){return x.status !== '已解' && x.status !== '已兑现';}).slice(0, 8);
  if (debts.length) {
    ctx += '【伏笔/承诺/钩子总表（优先处理）】\n';
    debts.forEach(function(d){
      ctx += '  - [' + (d.priority||'中') + '] ' + d.type + '：第' + ((d.chapterIdx||0)+1) + '章「' + _shortText(d.text,60) + '」悬挂' + d.age + '章\n';
    });
    ctx += '\n';
  }
  const itemNames = Object.keys(mem.itemLedger || {}).slice(0, 10);
  if (itemNames.length) {
    ctx += '【重要道具总表】\n';
    itemNames.forEach(function(name){
      const it = mem.itemLedger[name];
      const last = it.history && it.history.length ? it.history[it.history.length-1] : null;
      ctx += '  ' + name + '：' + (it.status||'未知') + (last ? '，最近第' + (last.chapterIdx+1) + '章：' + _shortText(last.text,45) : '') + '\n';
    });
    ctx += '\n';
  }
  const factions = Object.keys(mem.factionGraph || {}).slice(0, 8);
  if (factions.length) {
    ctx += '【势力关系网】\n';
    factions.forEach(function(name){
      const f = mem.factionGraph[name];
      ctx += '  ' + name + '：' + (f.status||'活跃');
      if (f.allies && f.allies.length) ctx += '；盟友：' + f.allies.slice(0,3).join('/');
      if (f.enemies && f.enemies.length) ctx += '；敌对：' + f.enemies.slice(0,3).join('/');
      ctx += '\n';
    });
    ctx += '\n';
  }
  const times = (mem.timelineEvents || []).filter(function(x){return x.chapterIdx < idx;}).slice(-8);
  if (times.length) {
    ctx += '【世界线时间轴】\n';
    times.forEach(function(t){ ctx += '  第' + (t.chapterIdx+1) + '章｜' + t.time + '：' + _shortText(t.text,70) + '\n'; });
    ctx += '\n';
  }
  return ctx;
}

// v46：三层渐进式记忆注入 + 智能预算控制
function buildMemoryContext(w, idx) {
  initLongMemory(w);
  var mem = w.longMemory;
  var ctx = '';
  var archLimits = getArchTruncationLimits();
  var BUDGET = archLimits ? 12000 : 30000; // 大模型给更多记忆空间

  // 前情提要（近25章摘要，增加覆盖范围）
  var summaries = [];
  var startIdx = Math.max(0, idx - 25);
  for (var i = startIdx; i < idx; i++) {
    var ch = w.chapters[i];
    if (ch && ch.summary) {
      var tag = ch.aiSummary ? '[AI]' : '';
      summaries.push('第' + (i+1) + '章 ' + (ch.title || '') + '：' + tag + ch.summary);
    } else if (ch && ch.content && ch.content.length > 30) {
      var s = extractChapterSummary(ch.content, ch.title);
      if (!ch.summary) ch.summary = s;
      summaries.push('第' + (i+1) + '章 ' + (ch.title || '') + '：' + s);
    }
  }
  
  // === 按优先级逐层注入，超预算自动裁剪 ===
  var added = 0;
  function tryAdd(block) {
    if (!block || added >= BUDGET) return;
    if (added + block.length > BUDGET) {
      // 裁剪到剩余预算
      var remaining = BUDGET - added;
      if (remaining > 80) {
        ctx += block.substring(0, remaining - 3) + '...';
        added = BUDGET;
      }
      return;
    }
    ctx += block;
    added += block.length;
  }
  
  // L1: 核心记忆锚点（最高优先级，决不裁剪）
  var anchorCtx = buildAnchorContext(w, idx);
  if (anchorCtx) {
    ctx += '【核心记忆点（最高优先级，后文必须承接）】\n' + anchorCtx;
    added += anchorCtx.length + 30;
  }
  
  // L2: 待解线索 & 人物当前状态
  if (mem.charStates && mem.charStates.length > 0 && added < BUDGET) {
    var csBlock = '【人物当前状态】\n';
    for (var cs = 0; cs < mem.charStates.length; cs++) {
      var csItem = mem.charStates[cs];
      csBlock += '  ' + csItem.name + '：' + csItem.status;
      if (csItem.location && csItem.location !== '未知') csBlock += '，位于' + csItem.location;
      if (csItem.emotion) csBlock += '，情绪[' + csItem.emotion + ']';
      if (csItem.action) csBlock += '，' + csItem.action.slice(0, 30);
      csBlock += '\n';
    }
    tryAdd(csBlock + '\n');
  }
  if (mem.plotThreads && mem.plotThreads.length > 0 && added < BUDGET) {
    var pending = mem.plotThreads.filter(function(t){ return t.status === '待解'; });
    if (pending.length) {
      var ptBlock = '【待解情节线索（必须延续）】\n';
      for (var pt = 0; pt < pending.length; pt++) {
        var t = pending[pt];
        ptBlock += '  > ' + t.title;
        if (t.chapters && t.chapters.length > 0) ptBlock += '（第' + t.chapters.join('、') + '章）';
        if (t.relatedTo) ptBlock += ' [关联：' + t.relatedTo + ']';
        ptBlock += '\n';
      }
      tryAdd(ptBlock + '\n');
    }
  }
  
  // L3: 五层渐进式滚动摘要
  if (mem.rollingSummary && added < BUDGET) {
    var rs = mem.rollingSummary;
    var sumText = '';
    if (typeof rs === 'string') {
      sumText = rs.slice(-2500);
    } else {
      // Tier 5: 极远期大时代标记（2500章以前）
      if (rs.megaEras && rs.megaEras.length > 10) sumText += rs.megaEras + '\n\n';
      // Tier 4: 超远期卷级标记（1200-2500章）
      if (rs.ultraEras && rs.ultraEras.length > 10) sumText += rs.ultraEras + '\n\n';
      // Tier 3: 远期时代标记（500-1200章）
      if (rs.eras && rs.eras.length > 10) sumText += rs.eras + '\n\n';
      // Tier 2: 中期里程碑（120-500章）
      if (rs.milestones && rs.milestones.length > 10) sumText += rs.milestones + '\n\n';
      // Tier 1: 近期详细（最近120章）
      if (rs.recent && rs.recent.length > 10) sumText += '【近期章节摘要】\n' + rs.recent + '\n\n';
      if (!sumText && rs._old) sumText = rs._old.slice(-2500);
    }
    if (sumText) tryAdd('【全书长期压缩摘要】\n' + sumText + '\n');
  }
  
  // L4: 前情提要
  if (summaries.length > 0 && added < BUDGET) {
    tryAdd('【前情提要（已写章节）】\n' + summaries.join('\n') + '\n\n');
  }
  
  // L5: 超长篇卷记忆（低优先级）
  if (added < BUDGET) {
    var volumeCtx = buildVolumeMemoryContext(w, idx);
    if (volumeCtx) {
      tryAdd(volumeCtx);
    }
  }
  
  // L6: 超长篇账本（最低优先级，大块数据按需裁剪）
  if (added < BUDGET && added < BUDGET * 0.85) {
    var ultraCtx = buildUltraLedgerContext(w, idx);
    if (ultraCtx) tryAdd(ultraCtx);
  }
  if (added < BUDGET) tryAdd(buildChapterIndexContext(w, idx));
  if (added < BUDGET) tryAdd(buildCharacterHistoryContext(w, idx));
  if (added < BUDGET) tryAdd(buildMemoryDebtContext(w, idx));

  // L7.5: 角色能力与代价变化（从characterProfiles提取）
  if (added < BUDGET && mem.characterProfiles) {
    var profiles = mem.characterProfiles;
    var abilityBlock = '【角色能力与代价追踪】\n';
    var hasAbility = false;
    Object.keys(profiles).forEach(function(name) {
      var p = profiles[name];
      var ms = (p.milestones || []).filter(function(m){ return m.chapterIdx < idx; }).slice(-3);
      if (ms.length > 0) {
        var abilityMs = ms.filter(function(m){ return /(突破|晋升|觉醒|学会|领悟|获得|失去|封印|代价|反噬|消耗|走火入魔)/.test(m.text); });
        if (abilityMs.length > 0) {
          hasAbility = true;
          abilityBlock += '  ' + name + '：' + abilityMs.map(function(m){ return '第' + (m.chapterIdx+1) + '章' + m.text.slice(0,50); }).join(' → ') + '\n';
        }
      }
    });
    if (hasAbility) tryAdd(abilityBlock + '\n');
  }

  // L7.6: 情绪轨迹（从characterHistory提取近期情绪变化）
  if (added < BUDGET && mem.characterHistory) {
    var emotionBlock = '【核心角色情绪轨迹】\n';
    var hasEmotion = false;
    var coreNames = Object.keys(mem.characterHistory).slice(0, 8);
    coreNames.forEach(function(name) {
      var hist = mem.characterHistory[name].filter(function(x){ return x.chapterIdx < idx; }).slice(-5);
      var emotionChanges = hist.filter(function(x){ return x.emotion && x.emotion !== '正常'; });
      if (emotionChanges.length >= 2) {
        hasEmotion = true;
        emotionBlock += '  ' + name + '：' + emotionChanges.map(function(x){ return '第' + (x.chapterIdx+1) + '章[' + x.emotion + ']'; }).join(' → ') + '\n';
      }
    });
    if (hasEmotion) tryAdd(emotionBlock + '\n');
  }

  // L7: 伏笔/已解线索
  if (mem.foreshadows && mem.foreshadows.some(function(f){ return f.status === '未解'; }) && added < BUDGET) {
    var unresolved = mem.foreshadows.filter(function(f){ return f.status === '未解'; }).slice(-5);
    var foBlock = '【伏笔标记（未解）】\n';
    for (var fi = 0; fi < unresolved.length; fi++) {
      var f = unresolved[fi];
      foBlock += '  > 第' + (f.chapterIdx+1) + '章：' + f.line.slice(0, 50) + '（' + f.keyword + '）\n';
    }
    tryAdd(foBlock + '\n');
  }
  
  return ctx;
}

function updateLongMemory(w, idx) {
  if (!w || !w.chapters || !w.chapters[idx]) return;
  initLongMemory(w);
  const ch = w.chapters[idx];
  const content = ch.content || '';
  if (content.length < 50) return;
  if (!ch.summary || ch.summary === ch.title) {
    ch.summary = extractChapterSummary(content, ch.title);
  }
  // 尝试AI摘要（异步，不阻塞）
  if (content.length >= 300 && !ch.aiSummary) {
    const config = DB.getApiConfig();
    const keys = DB.getApiKeys(config.provider);
    if (keys && keys.length > 0) {
      const charNames = extractCharNameMap(w.chars || '').names;
      const msgs = [
        {role:'system', content:'你是一个小说分析助手。请分析以下章节正文，输出JSON格式摘要。格式：{"events":"<关键事件概述，30字内>","charStatus":"<每个角色的状态变化>","emotion":"<本章情绪基调>","setup":"<埋下的伏笔/未解悬念，若无则null>","keyLines":["<最能代表本章的一句话>"]}'},
        {role:'user', content: (charNames.length > 0 ? '角色：' + charNames.join('/') + '\n\n' : '') + '【章节】' + ch.title + '\n\n【正文】' + content.slice(0, 3000) + '\n\n请输出JSON：'}
      ];
      callRealAPIWithFallback(msgs, null, 'quality_consist').then(result => {
        if (result && result.includes('{')) {
          const jsonStart = result.indexOf('{');
          const jsonEnd = result.lastIndexOf('}') + 1;
          if (jsonEnd > jsonStart) {
            try {
              const parsed = JSON.parse(result.slice(jsonStart, jsonEnd));
              if (parsed.events) {
                ch.aiSummary = true;
                ch.summary = parsed.events;
                if (parsed.charStatus) ch.summary += '|' + parsed.charStatus.slice(0, 30);
                if (parsed.emotion) ch.summary += '|基调：' + parsed.emotion;
                DB.saveWork(w);
              }
            } catch(e) {}
          }
        }
      }).catch(function(e) {
        console.warn('AI摘要提取失败:', e && e.message);
      });
    }
  }
  // 本地提取人物状态
  const chars = w.chars || '';
  let newStates = [];
  if (chars.trim()) {
    newStates = extractCharStateFromText(content, chars);
    const mem = w.longMemory;
    for (const ns of newStates) {
      const existing = mem.charStates.findIndex(c => c.name === ns.name);
      if (existing >= 0) mem.charStates[existing] = ns;
      else mem.charStates.push(ns);
    }
    if (mem.charStates.length > 80) mem.charStates = mem.charStates.slice(-80);
  }
  // v28：更新章节索引与人物长期轨迹
  updateChapterIndex(w, idx, content);
  updateCharacterHistory(w, idx, newStates);
  // v27：提取核心记忆点（角色标志、关系、道具、地点、承诺、时间线、钩子）
  extractMemoryAnchorsFromText(w, idx, content);
  // v28：更新记忆生命周期与长期压缩摘要
  updateLongMemoryLifecycle(w, idx, content);
  compressLongMemory(w, idx);
  // v30：更新超长篇账本（分卷/人物档案/道具/势力/时间轴/伏笔总表）
  updateUltraLongMemory(w, idx, content, newStates);
  // 提取情节线索
  w.longMemory.plotThreads = extractPlotThreadsFromText(content, w.longMemory.plotThreads, idx);
  // 提取伏笔
  const foreshadowKeywords = ['奇怪','异常','不对劲','什么意思','难道','怎么会','古怪','蹊跷','诡异','谜'];
  const foreshadowFound = foreshadowKeywords.filter(k => content.includes(k));
  if (foreshadowFound.length > 0) {
    const paraLines = content.split('\n');
    for (let line of paraLines) {
      const hasForeshadow = foreshadowFound.some(k => line.includes(k));
      if (hasForeshadow && line.trim().length > 10) {
        const existed = w.longMemory.foreshadows.some(f => f.line === line.trim().slice(0, 40));
        if (!existed) {
          w.longMemory.foreshadows.push({
            line: line.trim().slice(0, 60),
            chapterIdx: idx,
            chapterTitle: ch.title,
            keyword: foreshadowFound.find(k => line.includes(k)),
            status: '未解',
            createdAt: Date.now()
          });
        }
      }
    }
  }
  if (w.longMemory.foreshadows.length > 100) w.longMemory.foreshadows = w.longMemory.foreshadows.slice(-100);
  // 提取角色弧线
  const charNames = (w.chars || '').match(/(?:角色|人设|人物)[：:]\s*(\S{2,4})/g);
  if (charNames && charNames.length > 0) {
    const names = [...new Set(charNames.map(s => s.replace(/.*[：:]\s*/, '').trim()))];
    for (const name of names) {
      if (name.length < 2 || name.length > 4) continue;
      const existing = w.longMemory.charArcs.find(c => c.name === name);
      if (!existing) {
        w.longMemory.charArcs.push({name, arc:'引入', updatedAt:idx});
      } else {
        if (content.includes(name)) {
          const hasChange = /(突破|晋升|受伤|死亡|背叛|觉醒|发现|遇见|杀|救|哭|笑|怒|逃|变)/.test(content);
          if (hasChange && existing.updatedAt !== idx) {
            existing.updatedAt = idx;
            existing.arc = '发展中';
          }
        }
      }
    }
    if (w.longMemory.charArcs.length > 50) w.longMemory.charArcs = w.longMemory.charArcs.slice(-50);
  }
  DB.saveWork(w);
}

// ========== 评价缓存与辅助 ==========

function getCachedEval(ch, idx, work) {
  // 优先使用缓存的 checkEval 结果
  if (ch.evalCache) return ch.evalCache;
  // 实时运行 checkEval
  if (typeof checkEval === 'function') {
    const result = checkEval(ch, idx, work);
    ch.evalCache = result;
    return result;
  }
  // 降级：返回空结果
  return {total:0, dimScores:{d1:0,d2:0,d3:0,d4:0,d5:0,d6:0,d7:0,d8:0,d9:0,d10:0,d11:0,d12:0}, dims:[]};
}

// ========== 润色推荐 ==========

function showPolishRecommend() {
  const recDiv = document.getElementById('polish-recommend');
  const recList = document.getElementById('polish-rec-list');
  if (!recDiv || !recList) return;
  const work = getCurrentWork();
  if (!work || !work.chapters[currentChapterIdx]) { recDiv.style.display = 'none'; return; }
  const ch = work.chapters[currentChapterIdx];
  if (!ch || !ch.content || ch.content.length < 100) { recDiv.style.display = 'none'; return; }
  const ev = getCachedEval(ch, currentChapterIdx, work);
  const dimMap = {
    'd2': {name:'爽点系统', icon:'🔥', type:'爽点系统', reason:'爽点密度不足，缺少情绪爆发链路'},
    'd3': {name:'节奏控制', icon:'🎵', type:'节奏控制', reason:'段落偏长，节奏拖沓'},
    'd4': {name:'情绪外化', icon:'🎭', type:'情绪外化', reason:'心理描写过多，需用动作替代'},
    'd5': {name:'对话质量', icon:'💬', type:'对话质量', reason:'对话质量待提升'},
    'd6': {name:'钩子设计', icon:'🪝', type:'钩子设计', reason:'章尾缺少悬念钩子'},
    'd7': {name:'原创度', icon:'✨', type:'原创度', reason:'疑似AI痕迹，需优化表达'}
  };
  const recs = [];
  Object.entries(dimMap).forEach(([k, v]) => {
    if (ev.dimScores[k] < 70) { var r = {}; for (var rk in v) { if (v.hasOwnProperty(rk)) r[rk] = v[rk]; } r.score = ev.dimScores[k]; recs.push(r); }
  });
  recs.sort((a, b) => a.score - b.score);
  if (recs.length === 0) { recDiv.style.display = 'none'; return; }
  recDiv.style.display = 'block';
  let html = '';
  recs.slice(0, 3).forEach((r, i) => {
    html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f9f9fb;border-radius:10px;border:1px solid #e5e7eb;cursor:pointer;margin-bottom:6px;" onclick="aiPolish(\'' + r.type + '\')">';
    html += '<div style="width:36px;height:36px;border-radius:50%;background:#eef2ff;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">' + r.icon + '</div>';
    html += '<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600;color:#333;">' + r.name + ' · ' + r.score + '分</div><div style="font-size:12px;color:#666;margin-top:2px;">' + r.reason + '</div></div>';
    html += '<div style="font-size:12px;color:#6366f1;font-weight:600;white-space:nowrap;">去润色 ></div></div>';
  });
  recList.innerHTML = html;
}

// ========== 自动修复 ==========

function autoFixChapter() {
  repairLowScoreChapterV46({chapterIdx: currentChapterIdx}).catch(function(err){
    showToast('修复失败：' + (err && err.message ? err.message : err), {error:true});
  });
}

document.getElementById('editor')?.addEventListener('input', function() {
  updateWordCount();
  _scheduleAutoSave();
});
document.getElementById('ch-title')?.addEventListener('input', function() {
  _scheduleAutoSave();
});

// AI生成撤销：恢复上一份备份内容
window.undoAiGeneration = function() {
  if (!window._editorBackup && !window._editorBackup2) {
    showToast('没有可撤销的内容');
    return;
  }
  var restore = window._editorBackup2 || window._editorBackup;
  var work = getCurrentWork();
  if (!work) return;
  document.getElementById('editor').value = restore;
  var ch = work.chapters[currentChapterIdx];
  if (ch) { ch.content = restore; ch.wordCount = restore.length; }
  updateWordCount();
  DB.saveWork(work);
  window._editorBackup2 = null;
  window._editorBackup = null;
  var undoBtn3 = document.getElementById('undo-btn');
  if (undoBtn3) undoBtn3.style.display = 'none';
  showToast('✅ 已撤销，恢复原文');
};

// 关闭/切后台时落盘：visibilitychange 立即落盘 + beforeunload 兜底提示
function _flushEditorToWork() {
  try {
    var work = getCurrentWork();
    if (!work || !work.chapters) return;
    var content = document.getElementById('editor').value;
    var title = document.getElementById('ch-title').value.trim();
    var ch = work.chapters[currentChapterIdx];
    if (!ch) { work.chapters[currentChapterIdx] = {title:title, content:content}; }
    else { ch.title = title; ch.content = content; }
    DB.saveWork(work);
    if (typeof DB.flush === 'function') DB.flush();
    // 云同步：后台切出时确保推送到云端
    try {
      if (window.cloud && window.cloud.isLoggedIn && window.cloud.isLoggedIn()) {
        try { window.cloud.quickSync(work.id); } catch(e) {}
      }
    } catch(e) {}
  } catch(e) {}
}

// 切后台（移动端按 Home / 切应用）立即落盘，避免 iOS 杀进程后丢稿
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden' && _isEditorDirty()) {
    if (_autoSaveTimer) { clearTimeout(_autoSaveTimer); _autoSaveTimer = null; }
    _flushEditorToWork();
  }
});

// 页面关闭前：先落盘，再兜底提示
window.addEventListener('beforeunload', function(e) {
  if (_autoSaveTimer) { clearTimeout(_autoSaveTimer); _autoSaveTimer = null; }
  var dirty = _isEditorDirty();
  if (dirty) {
    _flushEditorToWork();
    // 多数桌面浏览器会拦下并提示「确认离开吗？」
    var msg = '当前章节有未保存的修改，确认离开？';
    e.preventDefault();
    e.returnValue = msg;
    return msg;
  }
});

function showChapterHistory(){
  var work=getCurrentWork();
  if(!work){showToast('请先选择作品');return;}
  if(!DB.listChapterHistory){showToast('当前版本不支持章节历史');return;}
  DB.listChapterHistory(work.id,currentChapterIdx).then(function(rows){
    if(!rows.length){showToast('本章暂无历史版本');return;}
    var html='<div style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;padding:20px;overflow:auto;" id="hist-modal"><div style="background:#fff;border-radius:14px;max-width:720px;margin:20px auto;padding:16px;"><div style="font-weight:800;font-size:18px;margin-bottom:10px;">🕘 章节历史版本</div>';
    rows.slice(0,20).forEach(function(r,i){
      html+='<div style="border:1px solid #e5e7eb;border-radius:10px;padding:10px;margin:8px 0;"><div style="font-weight:700;">版本 '+(i+1)+'｜'+new Date(r.createdAt||0).toLocaleString()+'｜'+(r.wordCount||0)+'字</div><div style="font-size:12px;color:#666;max-height:60px;overflow:hidden;">'+he((r.content||'').slice(0,160))+'</div><button class="hist-restore-btn" data-hid="'+he(r.id)+'" style="margin-top:6px;padding:6px 10px;border:none;border-radius:6px;background:#6366f1;color:#fff;">恢复此版本</button></div>';
    });
    html+='<button onclick="closeHistoryModal()" style="width:100%;padding:10px;border:none;border-radius:8px;background:#f3f4f6;">关闭</button></div></div>';
    document.body.insertAdjacentHTML('beforeend',html);
    document.querySelectorAll('.hist-restore-btn').forEach(function(btn){
      btn.onclick=function(){ restoreHistoryVersion(btn.getAttribute('data-hid')); };
    });
  }).catch(function(e){ console.warn('[listChapterHistory]', e); showToast('加载历史失败',{error:true}); });
}
function closeHistoryModal(){
  var m=document.getElementById('hist-modal'); if(m)m.remove();
}
function restoreHistoryVersion(id){
  if(!confirm('确定恢复这个历史版本？当前正文会被覆盖。'))return;
  DB.restoreChapterHistory(id).then(function(){
    var m=document.getElementById('hist-modal'); if(m)m.remove();
    loadChapter(currentChapterIdx);
    showToast('✅ 已恢复历史版本');
  }).catch(function(e){showToast('恢复失败：'+(e.message||e),{error:true});});
}

// ========== 章节卡（自动使用） ==========
function openChapterCard(){
  var work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
  renderCurrentChapterCard();
  var ov=document.getElementById('cp-overlay'), panel=document.getElementById('cp-panel');
  if(ov)ov.className='panel-overlay open';
  if(panel)panel.className='ch-list-panel open';
}
function closeChapterCard(){
  var ov=document.getElementById('cp-overlay'), panel=document.getElementById('cp-panel');
  if(ov)ov.className='panel-overlay';
  if(panel)panel.className='ch-list-panel';
}
function renderCurrentChapterCard(){
  var work=getCurrentWork();
  var body=document.getElementById('cp-card-body');
  if(!work||!body)return;
  if(!work._chapterCards)work._chapterCards={};
  var chKey='ch_'+currentChapterIdx;
  if(!work._chapterCards[chKey])work._chapterCards[chKey]={};
  var cardData=work._chapterCards[chKey];
  // 用章节卡渲染
  if(typeof renderChapterCard==='function'){
    renderChapterCard(body,cardData,work);
  }else{
    body.innerHTML='<div style="color:#999;padding:20px;text-align:center;">卡片系统加载中...</div>';
  }
}
function saveChapterCard(){
  var work=getCurrentWork();
  if(!work){showToast('请先新建或选择作品');return;}
  if(!work._chapterCards)work._chapterCards={};
  var chKey='ch_'+currentChapterIdx;
  // 收集卡片数据
  var cardData={};
  if(typeof getChapterCardData==='function'){
    cardData=getChapterCardData();
  }
  work._chapterCards[chKey]=cardData;
  // 如果章节卡里有本章目的，同步到章节标题
  if(cardData.purpose && cardData.purpose.trim()){
    var ch=work.chapters[currentChapterIdx];
    if(!ch.title||ch.title.indexOf('第')===0||ch.title===('第'+(currentChapterIdx+1)+'章')){
      ch.title='第'+(currentChapterIdx+1)+'章 '+(cardData.purpose.length>15?cardData.purpose.slice(0,15):cardData.purpose);
      document.getElementById('ch-title').value=ch.title;
    }
  }
  DB.saveWork(work);
  showToast('章节卡已保存');
  closeChapterCard();
}
// 切换章节时自动加载章节卡数据到面板（防止重复猴子补丁）
if (!window._loadChapterPatched) {
  window._loadChapterPatched = true;
  var _origLoadChapter = loadChapter;
  loadChapter = function(idx) {
    _origLoadChapter(idx);
    if (document.getElementById('cp-panel').classList.contains('open')) {
      renderCurrentChapterCard();
    }
  };
}

// ========== 流派数据 ==========
if(!window.NOVEL_GENRES || !window.NOVEL_GENRES.玄幻){
  var _g={
    '玄幻': {expertise:'你是玄幻小说写作专家。\n【核心技法】\n1.答非所问：被质问时不正面回答，转移话题或用动作代替语言。\n2.微动作藏情绪：愤怒→指尖发白/咬紧后槽牙；紧张→喉结滚动/手指摩挲。禁止"他很愤怒"直白情绪词。\n3.关键时刻打断：在冲突最高点突然中断，紧急事件打断，但不立刻接新事件。\n4.日常事物掩护：把矛盾藏在法宝/丹药/功法名称的讨论里。\n注重：力量体系影响社会结构、修炼代价与感悟、战斗的策略感。'},
    '仙侠': {expertise:'你是仙侠小说写作专家。\n【核心技法】\n1.答非所问：被质问时不正面回答，道家式的顾左右而言他。\n2.微动作藏情绪：愤怒→袖袍微拂；心虚→拂尘动作变慢。禁止直白情绪词。\n3.关键时刻打断：渡劫被打断、剑意正盛时被铃声中断。\n4.道法留白：不把话说满，让读者自己品味弦外之音。\n注重：道心与欲望的博弈、因果报应在日常中的体现、飞剑法宝是性格延伸。'},
    '都市': {expertise:'你是都市小说写作专家。\n【核心技法】\n1.答非所问：被质问/被撕扯时，用工作/电话/日常琐事转移话题。\n2.微动作藏情绪：紧张→攥手机/清嗓子；心虚→视线躲闪/喝水拖延。\n3.关键时刻打断：在暧昧/争吵最高点被门铃/电话/微信打断。\n4.日常事物掩护：把矛盾藏在香水味/衣领褶皱/聊天记录里。\n注重：现代权力表现形式（法律/舆论/经济）、信息时代秘密的脆弱性、"隐藏"与"暴露"的张力。'},
    '科幻': {expertise:'你是科幻小说写作专家。\n【核心技法】\n1.答非所问：被质问科技/伦理问题时，用数据或沉默代替正面回答。\n2.微动作藏情绪：数据面板闪烁/机械臂的细微抖动/语音助手的停顿。\n3.关键时刻打断：在真相即将揭开时被系统警告/信号中断打断。\n4.科技留白：不过度解释科技原理，让未知保持重量。\n注重：科技改变人的生活方式和思维模式、科技与人性的碰撞。'},
    '历史': {expertise:'你是历史小说写作专家。\n【核心技法】\n1.答非所问：被质问时不正面回答，用礼法/祖宗规矩/身份等级顾左右而言他。\n2.微动作藏情绪：官袖整冠/茶盏放下时的分寸感/眼神的微妙变化。\n3.关键时刻打断：在密谋/对决最高点被圣旨/禀报/意外来客打断。\n4.礼法掩护：把尖锐矛盾藏在拜帖/寿宴/祭祀等礼节性行为里。\n注重：时代语境约束（通信/交通/等级/礼法）、器物和制度服务于叙事而非堆砌。'},
    '悬疑': {expertise:'你是悬疑小说写作专家。\n【核心技法】\n1.答非所问：被质问/被试探时，用无关细节转移，或沉默让对方自己补完。\n2.微动作藏情绪：笔尖停顿/烟圈升起/目光落在某处不动。\n3.关键时刻打断：在推理即将突破时被意外线索/突发命案/电话中断打断。\n4.线索埋伏：答案里藏新的问题，让读者自己抽丝剥茧。\n注重：信息节奏比信息本身更重要、线索不要一次性给完、允许读者比角色知道得多或少。'},
    '言情': {expertise:'你是言情小说写作专家。\n【核心技法】\n1.答非所问：被质问感情时绝不承认，转移话题或用动作代替语言回应。\n2.微动作藏暧昧：耳尖泛红/指尖蹭过手腕/视线躲闪后又不自觉看回去。\n3.关键时刻打断：在暧昧最高点被撞见/电话/突发事件打断，禁忌：打断后立刻接新事件。\n4.日常事物掩护：用香水味/衣领/聊天记录暗藏怀疑和嫉妒。\n注重：两个独立人格如何在亲密关系中保持自我、亲密接触要有心理铺垫。'},
    '末世': {expertise:'你是末世小说写作专家。\n【核心技法】\n1.答非所问：被质问生存策略时不正面回答，用物资/路线/人数顾左右而言他。\n2.微动作藏情绪：检查装备时的手指发抖/枪口的微微下移/舔嘴唇的次数。\n3.关键时刻打断：在谈判/交易即将达成时被丧尸嚎叫/枪声/意外来客打断。\n4.物资掩护：把矛盾藏在罐头数量/药品分配/安全屋规则里。\n注重：秩序崩塌后人性的试炼场、道德在生存面前的变形、"永远不安全"的末世恐惧。'},
    '武侠': {expertise:'你是武侠小说写作专家。\n【核心技法】\n1.答非所问：被质问侠义/门派规矩时不正面回答，用江湖规矩/义气顾左右而言他。\n2.微动作藏情绪：剑柄上的手指位置变化/茶盏端起又放下/抱拳的力道。\n3.关键时刻打断：在比武/对峙/密谋最高点被号角/来客/信号打断。\n4.江湖事掩护：把生死矛盾藏在酒碗/镖车/掌门更替的讨论里。\n注重：江湖人情世故和义气承诺、打斗要有因果（为什么打、打完有什么后果）。'}
  };
  if(!window.NOVEL_GENRES) window.NOVEL_GENRES = {};
  Object.assign(window.NOVEL_GENRES,_g);
}

window.addEventListener('DOMContentLoaded',()=>{
  DB.init();
  initPage();
  // 检查API是否配置
  const config=DB.getApiConfig();
  const keys=DB.getApiKeys(config.provider||'dashscope');
  const statusBar=document.getElementById('api-status-bar');
  if(!keys||keys.length===0){
    statusBar.style.display='block';
    statusBar.style.background='#fef3c7';
    statusBar.style.color='#92400e';
    statusBar.innerHTML='&#9888;&#65039; 未配置API密钥，AI功能使用本地模板。<a href="settings.html" style="color:#6366f1;font-weight:600;">去配置</a>';
  }else{
    statusBar.style.display='block';
    statusBar.style.background='#dcfce7';
    statusBar.style.color='#166534';
    statusBar.textContent='✅ 已配置 '+(API_PROVIDERS[config.provider]?.name||config.provider)+' API';
    setTimeout(function(){statusBar.style.display='none';},2000);
  }
});

// ===== v29: 质量报告面板 =====
// ========== v53: 质量报告（使用新EvalUI）==========
function showQualityReport(){
  var work = getCurrentWork(); if (!work) return;
  var ch = work.chapters && work.chapters[currentChapterIdx];
  if (!ch || !ch._quality) { showToast('当前章节暂无质量报告，先用 AI 写作或润色一次'); return; }
  var q = ch._quality;
  // 如果用新格式（有dimensions数组），直接用EvalUI
  if(q.dimensions && typeof EvalUI !== 'undefined' && EvalUI.show){
    EvalUI.show(q, function() { aiPolishByQuality(); });
    return;
  }
  // 兼容旧格式
  var html = '<div style="position:fixed;left:0;right:0;top:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9998;" onclick="closeQualityReport(event)">' +
    '<div onclick="event.stopPropagation()" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:90%;max-width:480px;max-height:80vh;overflow:auto;background:#fff;border-radius:12px;padding:18px 18px 14px;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
      '<div style="font-weight:700;font-size:16px;">📊 章节质量报告</div>' +
      '<div style="font-size:24px;font-weight:700;color:' + (q.score>=80?'#16a34a':q.score>=60?'#f59e0b':'#ef4444') + ';">' + q.score + '</div>' +
    '</div>';
  var dimNames = { wordCount:'字数', paragraphs:'段落', rhythm:'节奏', dialog:'对话', beats:'爽点', hook:'章尾钩子', repeat:'重复词', consistency:'设定一致性', balance:'动作/心理', connect:'章首衔接' };
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:13px;margin-bottom:12px;">';
  for (var k in q.dims) {
    var v = q.dims[k];
    var color = v>=80?'#16a34a':v>=60?'#f59e0b':'#ef4444';
    html += '<div style="display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:4px 0;"><span style="color:#6b7280;">' + (dimNames[k]||k) + '</span><span style="color:' + color + ';font-weight:600;">' + v + '</span></div>';
  }
  html += '</div>';
  if (q.weaknesses && q.weaknesses.length) {
    html += '<div style="font-weight:600;margin-bottom:6px;color:#374151;">⚠️ 检出短板</div><ul style="font-size:13px;color:#6b7280;padding-left:18px;margin:0 0 10px;">';
    for (var i=0;i<q.weaknesses.length;i++) html += '<li>' + q.weaknesses[i] + '</li>';
    html += '</ul>';
  }
  if (q.suggestions && q.suggestions.length) {
    html += '<div style="font-weight:600;margin-bottom:6px;color:#374151;">💡 改进建议</div><ul style="font-size:13px;color:#6b7280;padding-left:18px;margin:0 0 14px;">';
    for (var j=0;j<q.suggestions.length;j++) html += '<li>' + q.suggestions[j] + '</li>';
    html += '</ul>';
  }
  html += '<div style="display:flex;gap:8px;"><button onclick="closeQualityReport()" style="flex:1;padding:10px;border:1px solid #e5e7eb;background:#fff;border-radius:8px;">关闭</button>' +
          '<button onclick="aiPolishByQuality()" style="flex:1;padding:10px;background:#3b82f6;color:#fff;border:none;border-radius:8px;">一键按建议润色</button></div>';
  html += '</div></div>';
  var box = document.createElement('div');
  box.id = 'quality-report-overlay';
  box.innerHTML = html;
  document.body.appendChild(box);
}
function closeQualityReport(e){
  if (e && e.target && !e.target.id) return;
  var el = document.getElementById('quality-report-overlay');
  if (el) el.parentNode.removeChild(el);
  if(typeof EvalUI !== 'undefined' && EvalUI.close) EvalUI.close();
}
async function aiPolishByQuality(){
  var work = getCurrentWork(); if (!work) return;
  var ch = work.chapters && work.chapters[currentChapterIdx];
  if (!ch || !ch._quality) return;
  closeQualityReport();
  var q = ch._quality;
  var content = document.getElementById('editor').value;
  if (!content.trim()) { showToast('当前章节为空'); return; }
  // 优先使用新格式的低分维度 + 好坏标准
  var hint = '';
  if(q.dimensions){
    var lowDims = q.dimensions.filter(function(d){ return d.score <= 5; });
    if(lowDims.length > 0){
      hint += '请只修复以下低分维度，保持其他部分不变：\n';
      if(typeof QualityEngine !== 'undefined' && QualityEngine.getFixGuide){
        hint += QualityEngine.getFixGuide(q.dimensions);
      } else {
        lowDims.forEach(function(d){ hint += '- ' + d.name + '（' + d.score + '分）：' + (d.issues && d.issues.length ? d.issues[0] : '') + '\n'; });
      }
    }
  }
  if(!hint && q.suggestions && q.suggestions.length){
    hint += '请按以下短板对本章进行针对性润色：\n';
    for (var i=0;i<q.suggestions.length;i++) hint += (i+1) + '. ' + q.suggestions[i] + '\n';
  }
  if(!hint){ hint = '请优化本章的文字质量，提升写作水平'; }
  var prompt = '你是一位资深网文编辑。\n\n' + hint + '\n\n【原文】\n' + content + '\n\n【输出要求】直接给出润色后的完整章节正文，不要解释。';
  if(typeof resetLoading === 'function') resetLoading('按建议润色中…');
  else showLoading('按建议润色中…');
  if(typeof updateLoadingProgress === 'function') updateLoadingProgress(30, '正在润色…');
  try {
    var r = await callRealAPIWithFallback(prompt, null, 'quality_polish', Math.max(600, Math.floor(content.length * 1.1)));
    if (r && r.length > 200) {
      window._editorBackup2 = window._editorBackup;
      window._editorBackup = content;
      document.getElementById('editor').value = r;
      ch.content = r;
      ch.wordCount = r.length;
      // 重新打分（新引擎）
      try {
        if(typeof QualityEngine !== 'undefined' && QualityEngine.evaluateText){
          var nq = QualityEngine.evaluateText(r, work);
          ch._quality = nq;
          showToast('润色完成 ' + nq.grade + ' ' + nq.totalScore + '/100');
        }
      } catch(e){}
      DB.saveWork(work);
      updateWordCount();
    } else {
      showToast('润色失败');
    }
  } finally {
    hideLoading();
  }
}
window.showQualityReport = showQualityReport;
window.closeQualityReport = closeQualityReport;
window.aiPolishByQuality = aiPolishByQuality;

// ========== v58: 架构生成专用函数（世界观/大纲/人设/细纲）==========
// 解决问题：原系统使用正文生成的通用函数，输出长度受限，迭代机制不合理

function buildWorldPrompt(work, userCommand, prevResult) {
  var title = work.title || '未命名作品';
  var genre = getWorkGenre(work);
  
  // ===== 系统消息（固定前缀，重复调用时服务商缓存）=====
  var sysMsg = '你是一位顶级网文世界观架构师，擅长构建宏大、自洽、富有创新的小说世界。\n\n';
  sysMsg += '【作品】' + title + '\n';
  sysMsg += '【题材】' + genre + '\n';
  
  // ===== 用户消息1：上下文 =====
  var ctxMsg = '';
  if (userCommand && userCommand.trim()) {
    ctxMsg += '【⚠️ 用户指令 · 最高优先级】\n' + userCommand.trim() + '\n\n';
  }
  if (prevResult && prevResult.length > 50) {
    ctxMsg += '【上一轮世界观】\n' + prevResult + '\n\n' +
      '【改进要求】\n' +
      '1. 基于已有世界观进行深化和完善\n' +
      '2. 补充缺失的细节，增强设定的丰富度\n' +
      '3. 保持原有结构和核心设定不变\n' +
      '4. 输出完整的优化后世界观内容：\n\n';
  }
  
  // ===== 用户消息2：任务 =====
  var taskMsg = '请为这部作品构建完整的世界观，包含以下8个核心模块：\n\n';
  taskMsg += '一、时代背景与历史脉络\n';
  taskMsg += '—— 当前时代的特征、最近的重大事件、历史发展阶段（至少3个阶段）\n\n';
  taskMsg += '二、地理设定\n';
  taskMsg += '—— 核心区域（3-5个）的地理特征、气候、资源分布、势力格局\n\n';
  taskMsg += '三、力量体系\n';
  taskMsg += '—— 力量来源、修炼路径、等级划分（5-8级）、每个等级的特征与门槛\n\n';
  taskMsg += '四、社会结构\n';
  taskMsg += '—— 统治阶层、权力结构、社会阶层、经济体系、文化习俗\n\n';
  taskMsg += '五、核心势力\n';
  taskMsg += '—— 主要势力（3-5个）的立场、目标、实力对比、相互关系\n\n';
  taskMsg += '六、核心矛盾\n';
  taskMsg += '—— 表面冲突、深层矛盾、即将爆发的危机、主角需要面对的挑战\n\n';
  taskMsg += '七、独特设定\n';
  taskMsg += '—— 这个世界最与众不同的地方、创新点、读者会记住的特色\n\n';
  taskMsg += '八、信息增量规划\n';
  taskMsg += '—— 各卷应揭示的设定内容，避免前期信息倾倒\n\n';
  taskMsg += '【输出要求】\n';
  taskMsg += '1. 每个模块至少3000字，总字数不少于30000字\n';
  taskMsg += '2. 结构清晰，使用标题分隔\n';
  taskMsg += '3. 设定要具体、可验证，避免模糊表述\n';
  taskMsg += '4. 考虑后续剧情发展的可能性，预留伏笔空间\n';
  taskMsg += '5. 适合百万字长篇（1500-3000章）的世界观架构\n';
  taskMsg += '6. 直接输出完整内容，不要加对话语前缀';
  
  return [
    { role: 'system', content: sysMsg },
    { role: 'user', content: ctxMsg },
    { role: 'user', content: taskMsg }
  ];
}

function buildOutlinePrompt(work, userCommand, prevResult) {
  var title = work.title || '未命名作品';
  var genre = getWorkGenre(work);
  var world = work.world || '';
  
  // ===== 系统消息（固定前缀，重复调用时服务商缓存）=====
  var sysMsg = '你是一位顶级网文大纲架构师，擅长设计百万字级长篇小说的宏大架构。\n\n';
  sysMsg += '【作品】' + title + '\n';
  sysMsg += '【题材】' + genre + '\n';
  
  // ===== 用户消息1：上下文 =====
  var ctxMsg = '';
  if (userCommand && userCommand.trim()) {
    ctxMsg += '【⚠️ 用户指令 · 最高优先级】\n' + userCommand.trim() + '\n\n';
  }
  if (prevResult && prevResult.length > 50) {
    ctxMsg += '【上一轮大纲】\n' + prevResult + '\n\n' +
      '【改进要求】\n' +
      '1. 基于已有大纲进行深化和完善\n' +
      '2. 补充缺失的细节，增加每卷的详细程度\n' +
      '3. 确保卷数达到10-15卷，总章节1500+章\n' +
      '4. 保持原有结构和核心剧情不变\n' +
      '5. 输出完整的优化后大纲内容：\n\n';
  }
  if (world && world.length > 50) {
    ctxMsg += '【世界观】\n' + world.substring(0, 2000) + '\n\n';
  }
  
  // ===== 用户消息2：任务 =====
  var taskMsg = '请为这部作品设计完整的多卷大纲，目标规模：10-15卷、1500-2000章、5000万字以上。\n\n';
  taskMsg += '包含以下内容：\n\n';
  taskMsg += '一、核心设定回顾\n';
  taskMsg += '—— 主角身份、金手指、核心目标、最大弱点\n\n';
  taskMsg += '二、全书结构规划\n';
  taskMsg += '—— 卷数（10-15卷）、每卷约150章、每章约3500字、总字数估算\n\n';
  taskMsg += '三、分卷大纲（每卷详细，每卷至少500字）\n';
  taskMsg += '—— 每卷标题、核心任务、关键事件（15-20个阶段）、卷末钩子\n';
  taskMsg += '—— 明确每卷的剧情阶段划分（如：第1-30章、第31-60章等）\n\n';
  taskMsg += '四、核心矛盾链\n';
  taskMsg += '—— 贯穿全书的主要矛盾线、次要矛盾线、它们如何交织\n';
  taskMsg += '—— 每卷矛盾的推进和升级\n\n';
  taskMsg += '五、爽点规划\n';
  taskMsg += '—— 每卷的主要爽点、打脸场景、升级时刻、爆发时刻\n\n';
  taskMsg += '六、伏笔布局\n';
  taskMsg += '—— 关键伏笔的埋设位置、回收时机、对剧情的影响\n';
  taskMsg += '—— 长线伏笔（贯穿多卷）和短线伏笔（单卷内回收）\n\n';
  taskMsg += '七、人物成长弧线\n';
  taskMsg += '—— 主角和主要配角的成长路径、转折点、关键变化\n\n';
  taskMsg += '八、节奏规划\n';
  taskMsg += '—— 每5章一个小高潮、每10章一个中高潮、每30章一个大高潮\n\n';
  taskMsg += '【输出要求】\n';
  taskMsg += '1. 总字数不少于50000字，每卷大纲至少5000字\n';
  taskMsg += '2. 结构清晰，使用标题分隔\n';
  taskMsg += '3. 每个关键事件要具体，有明确的冲突和结果\n';
  taskMsg += '4. 确保节奏紧凑，每卷有明确的推进和高潮\n';
  taskMsg += '5. 考虑百万字长篇（1500-3000章）的延展性，预留足够的剧情空间\n';
  taskMsg += '6. 直接输出完整内容，不要加对话语前缀';
  
  return [
    { role: 'system', content: sysMsg },
    { role: 'user', content: ctxMsg },
    { role: 'user', content: taskMsg }
  ];
}

function buildCharsPrompt(work, userCommand, prevResult) {
  var title = work.title || '未命名作品';
  var genre = getWorkGenre(work);
  var world = work.world || '';
  
  // ===== 系统消息（固定前缀，重复调用时服务商缓存）=====
  var sysMsg = '你是一位顶级网文人物设计师，擅长塑造立体、有记忆点、能引起读者共鸣的角色。\n\n';
  sysMsg += '【作品】' + title + '\n';
  sysMsg += '【题材】' + genre + '\n';
  
  // ===== 用户消息1：上下文 =====
  var ctxMsg = '';
  if (userCommand && userCommand.trim()) {
    ctxMsg += '【⚠️ 用户指令 · 最高优先级】\n' + userCommand.trim() + '\n\n';
  }
  if (prevResult && prevResult.length > 50) {
    ctxMsg += '【上一轮人设】\n' + prevResult + '\n\n' +
      '【改进要求】\n' +
      '1. 基于已有人设进行深化和完善\n' +
      '2. 补充缺失的角色，增强人物体系的丰富度\n' +
      '3. 增加每个角色的详细程度和记忆点\n' +
      '4. 保持原有角色设定和关系不变\n' +
      '5. 输出完整的优化后人设内容：\n\n';
  }
  if (world && world.length > 50) {
    ctxMsg += '【世界观】\n' + world.substring(0, 1500) + '\n\n';
  }
  
  // ===== 用户消息2：任务 =====
  var taskMsg = '请为这部作品设计完整的人物体系，包含以下内容：\n\n';
  taskMsg += '一、主角（详细）\n';
  taskMsg += '—— 姓名、年龄、外貌特征、性格、核心动机、深层执念、最大弱点\n';
  taskMsg += '—— 人物弧光起点和终点、成长路径\n';
  taskMsg += '—— 金手指/能力、使用限制、代价\n';
  taskMsg += '—— 标志性动作、口头禅、独特习惯\n\n';
  taskMsg += '二、女主角/重要女性角色\n';
  taskMsg += '—— 姓名、年龄、身份、性格、与主角关系、角色定位\n';
  taskMsg += '—— 人物成长弧线、关键时刻\n\n';
  taskMsg += '三、主要反派（2-3位）\n';
  taskMsg += '—— 姓名、身份、核心目标、与主角的关系、动机合理性\n';
  taskMsg += '—— 能力、弱点、人物层次（不是纯粹的坏人）\n\n';
  taskMsg += '四、重要配角（5-8位）\n';
  taskMsg += '—— 每个人的姓名、身份、性格、作用、与主角关系\n\n';
  taskMsg += '五、人物关系网\n';
  taskMsg += '—— 角色之间的关系矩阵、冲突点、潜在的背叛/结盟\n\n';
  taskMsg += '六、角色记忆点设计\n';
  taskMsg += '—— 每个主要角色的独特识别特征，让读者记住他们\n\n';
  taskMsg += '【输出要求】\n';
  taskMsg += '1. 主角部分至少5000字，每个重要角色至少2000字，总字数不少于20000字\n';
  taskMsg += '2. 结构清晰，使用标题分隔\n';
  taskMsg += '3. 角色要有鲜明个性，避免模板化\n';
  taskMsg += '4. 考虑角色在剧情中的作用和发展（1500-3000章长篇）\n';
  taskMsg += '5. 直接输出完整内容，不要加对话语前缀';
  
  return [
    { role: 'system', content: sysMsg },
    { role: 'user', content: ctxMsg },
    { role: 'user', content: taskMsg }
  ];
}

function getGenreDetailTemplate(genre) {
  var templates = {
    '玄幻': {
      digitalPanel: '境界：X | 灵力：X | 法器：X | 丹药：X | 功法：X | 宗门声望：X',
      beatTypes: ['境界突破', '法器觉醒', '炼丹成功', '功法领悟', '宗门打脸', '秘境探险', '神兽契约', '反派伏诛', '顿悟', '血脉觉醒'],
      emotionTones: ['绝望→突破→狂喜', '隐忍→爆发→震撼', '迷茫→顿悟→坚定', '危机→逆转→霸气', '弱小→成长→强大'],
      hookTypes: ['神秘气息降临', '禁忌功法浮现', '上古遗迹开启', '反派追杀升级', '宗门阴谋暴露', '未知强敌出现'],
      hardNodeCategories: ['修炼突破', '资源争夺', '宗门内斗', '秘境探险', '敌人交锋', '伙伴相遇', '身世揭秘', '功法升级', '法器进阶', '危机降临']
    },
    '仙侠': {
      digitalPanel: '修为：X | 道心：X | 法宝：X | 丹药：X | 道法：X | 仙缘：X',
      beatTypes: ['悟道突破', '飞剑觉醒', '炼丹成功', '法术领悟', '仙门打脸', '秘境探险', '灵兽契约', '魔头伏诛', '渡劫', '仙缘降临'],
      emotionTones: ['凡心→道心→超脱', '执念→顿悟→释然', '红尘→出世→入世', '逆天→顺天→改天', '求道→问道→得道'],
      hookTypes: ['天劫降临', '仙门阴谋', '上古秘境', '魔头再现', '道心考验', '飞升契机'],
      hardNodeCategories: ['悟道修炼', '天劫渡劫', '仙门内斗', '秘境探险', '魔头交锋', '仙缘奇遇', '身世揭秘', '道法升级', '法宝进阶', '天道考验']
    },
    '都市': {
      digitalPanel: '资产：X | 人脉：X | 能力：X | 声望：X | 系统等级：X | 任务进度：X',
      beatTypes: ['打脸逆袭', '商业奇迹', '能力觉醒', '身份曝光', '系统升级', '女神倒追', '反派破产', '权力洗牌', '黑科技曝光', '巅峰对决'],
      emotionTones: ['平凡→崛起→巅峰', '隐忍→爆发→霸气', '落魄→逆袭→辉煌', '低调→高调→无敌', '咸鱼→大佬→传说'],
      hookTypes: ['神秘势力出现', '系统任务更新', '隐藏身份曝光', '敌人卷土重来', '新能力解锁', '更大危机降临'],
      hardNodeCategories: ['商业布局', '权力博弈', '能力升级', '人脉拓展', '敌人交锋', '感情发展', '身份揭秘', '系统任务', '危机应对', '势力扩张']
    },
    '历史': {
      digitalPanel: '人数：X | 存粮：X | 兵力：X | 领地：X | 声望：X | 资金：X',
      beatTypes: ['以少胜多', '计谋破敌', '招贤纳士', '城池攻防', '粮草逆袭', '政治博弈', '斩首行动', '援军赶到', '绝地翻盘', '大势逆转'],
      emotionTones: ['绝境→谋划→破局', '弱小→发展→称霸', '蛰伏→爆发→崛起', '危机→转机→辉煌', '隐忍→反击→胜利'],
      hookTypes: ['敌军来袭', '粮草告急', '内奸暴露', '援军动向', '战略转折', '历史拐点'],
      hardNodeCategories: ['军事行动', '政治博弈', '经济建设', '人才招募', '城池攻防', '粮草管理', '情报收集', '战略布局', '危机应对', '势力扩张']
    },
    '悬疑': {
      digitalPanel: '线索：X | 嫌疑人：X | 证据：X | 危险度：X | 真相进度：X | 信任度：X',
      beatTypes: ['线索发现', '推理突破', '反转揭露', '嫌疑人锁定', '真相逼近', '危机解除', '伏笔回收', '身份揭穿', '密室破解', '连环杀人'],
      emotionTones: ['平静→疑云→惊悚', '迷惑→推理→豁然', '恐惧→镇定→破局', '怀疑→验证→真相', '危险→转机→安全'],
      hookTypes: ['新证据出现', '嫌疑人反转', '危险逼近', '真相浮现', '阴谋升级', '新案件发生'],
      hardNodeCategories: ['线索发现', '推理分析', '证据收集', '嫌疑人审问', '危险应对', '团队协作', '真相揭露', '伏笔回收', '阴谋破解', '危机解除']
    },
    '言情': {
      digitalPanel: '好感度：X | 误会：X | 情敌：X | 暧昧：X | 亲密：X | 信任：X',
      beatTypes: ['甜蜜互动', '误会解开', '情敌打脸', '告白时刻', '亲密接触', '感情升温', '吃醋名场面', '深情告白', '危机共度', '终成眷属'],
      emotionTones: ['初见→心动→热恋', '误会→和解→深爱', '暗恋→表白→相守', '虐心→甜蜜→圆满', '敌对→暧昧→情深'],
      hookTypes: ['误会加深', '情敌出现', '感情危机', '秘密曝光', '虐心时刻', '甜蜜升级'],
      hardNodeCategories: ['感情发展', '误会产生', '误会解开', '情敌交锋', '甜蜜互动', '危机共度', '秘密揭露', '身份差异', '家庭阻力', '终成眷属']
    },
    '科幻': {
      digitalPanel: '科技：X | 机甲：X | 基因：X | 能源：X | 声望：X | 势力：X',
      beatTypes: ['机甲升级', '基因进化', '科技突破', '外星接触', '虫族入侵', '星际战争', '遗迹探险', 'AI觉醒', '文明碰撞', '宇宙真相'],
      emotionTones: ['渺小→探索→强大', '危机→科技→突破', '未知→接触→融合', '战争→和平→进化', '地球→星际→宇宙'],
      hookTypes: ['外星信号', '虫族来袭', '遗迹开启', 'AI反叛', '新文明接触', '宇宙危机'],
      hardNodeCategories: ['科技研发', '机甲战斗', '星际探索', '势力博弈', '虫族交锋', '遗迹探险', 'AI觉醒', '基因进化', '文明碰撞', '宇宙危机']
    },
    '末世': {
      digitalPanel: '生存天数：X | 物资：X | 人数：X | 基地：X | 变异：X | 威胁：X',
      beatTypes: ['尸潮突围', '物资抢夺', '基地建设', '变异进化', '团队合作', '强敌覆灭', '安全区建立', '幸存者救助', '丧尸进化', '人性考验'],
      emotionTones: ['绝望→求生→希望', '恐惧→勇气→坚韧', '弱小→强大→领袖', '混乱→秩序→重建', '背叛→信任→团结'],
      hookTypes: ['尸潮来袭', '物资告急', '内奸暴露', '强敌出现', '变异升级', '新威胁降临'],
      hardNodeCategories: ['物资搜寻', '丧尸战斗', '基地建设', '团队管理', '强敌交锋', '幸存者救助', '变异进化', '危机应对', '势力扩张', '重建文明']
    },
    '武侠': {
      digitalPanel: '内力：X | 招式：X | 兵器：X | 声望：X | 门派：X | 侠义值：X',
      beatTypes: ['招式突破', '内力增长', '神兵出世', '门派打脸', '江湖风云', '侠义之举', '仇怨了结', '武学传承', '盟主之争', '归隐江湖'],
      emotionTones: ['懵懂→历练→成名', '恩怨→情仇→释然', '正道→邪道→正道', '弱小→强大→侠义', '入世→出世→归真'],
      hookTypes: ['神兵现世', '仇怨来袭', '门派阴谋', '江湖追杀', '武学秘典', '盟主之位'],
      hardNodeCategories: ['武学修炼', '江湖争斗', '门派内斗', '仇怨了结', '侠义之举', '神兵争夺', '武学传承', '势力博弈', '危机应对', '归隐江湖']
    },
    '系统流': {
      digitalPanel: '等级：X | 积分：X | 技能：X | 任务：X | 声望：X | 成就：X',
      beatTypes: ['系统升级', '任务完成', '技能觉醒', '积分暴涨', '成就解锁', '商城兑换', '抽奖欧皇', '反派打脸', '世界任务', '隐藏奖励'],
      emotionTones: ['平凡→系统→无敌', '新手→高手→巅峰', '弱小→成长→逆天', '任务→奖励→升级', '咸鱼→大佬→传说'],
      hookTypes: ['新任务发布', '隐藏任务触发', '系统升级', '强敌出现', '世界事件', '终极任务'],
      hardNodeCategories: ['任务完成', '技能升级', '商城兑换', '抽奖系统', '敌人交锋', '伙伴招募', '势力扩张', '系统升级', '世界事件', '终极挑战']
    },
    '规则怪谈': {
      digitalPanel: '规则：X | 遵守：X | 违反：X | 危险：X | 理智：X | 生存：X',
      beatTypes: ['规则发现', '规则利用', '规则违反', '恐怖降临', '危机解除', '真相逼近', '队友背叛', '隐藏规则', '逃脱成功', '循环打破'],
      emotionTones: ['平静→诡异→恐惧', '好奇→惊悚→绝望', '理智→疯狂→清醒', '安全→危险→逃脱', '迷茫→发现→突破'],
      hookTypes: ['新规则出现', '规则违反', '恐怖降临', '队友异常', '真相浮现', '循环继续'],
      hardNodeCategories: ['规则探索', '规则遵守', '规则利用', '危机应对', '队友互动', '真相揭露', '理智管理', '逃脱尝试', '循环打破', '新规则发现']
    },
    '竞技': {
      digitalPanel: '排名：X | 积分：X | 技能：X | 团队：X | 状态：X | 粉丝：X',
      beatTypes: ['反杀逆袭', '极限操作', '团队配合', '战术碾压', '新人崛起', '王者归来', '冠军时刻', '伤病复出', '强敌对决', '封神之战'],
      emotionTones: ['低谷→努力→巅峰', '平凡→崛起→传奇', '失败→反思→胜利', '紧张→冷静→爆发', '新人→强者→王者'],
      hookTypes: ['强敌出现', '伤病危机', '战术泄露', '关键比赛', '逆袭机会', '新挑战'],
      hardNodeCategories: ['日常训练', '比赛对决', '战术制定', '团队协作', '伤病恢复', '新人成长', '强敌交锋', '冠军争夺', '商业博弈', '退役抉择']
    }
  };
  
  for (var k in templates) {
    if (genre.indexOf(k) >= 0) {
      return templates[k];
    }
  }
  
  return templates['玄幻'];
}

function buildDetailPrompt(work, volumeIndex, userCommand, prevResult) {
  var title = work.title || '未命名作品';
  var genre = getWorkGenre(work);
  var world = work.world || '';
  var chars = work.chars || '';
  var outline = work.outline || '';
  var genreTemplate = getGenreDetailTemplate(genre);
  
  // ===== 系统消息（固定前缀，重复调用时服务商缓存）=====
  var sysMsg = '你是一位顶级网文细纲设计师，擅长将大纲拆解为具体、可执行的章节细纲。\n\n';
  sysMsg += '【作品】' + title + '\n';
  sysMsg += '【题材】' + genre + '\n';
  sysMsg += '【目标卷】第' + (volumeIndex + 1) + '卷\n\n';
  sysMsg += '【题材专属模板】\n';
  sysMsg += '本作品为' + genre + '题材，请严格按照以下模板生成细纲：\n\n';
  sysMsg += '【数字面板格式】\n' + genreTemplate.digitalPanel + '\n\n';
  sysMsg += '【爽点类型参考】\n' + genreTemplate.beatTypes.join('、') + '\n\n';
  sysMsg += '【情绪基调参考】\n' + genreTemplate.emotionTones.join('、') + '\n\n';
  sysMsg += '【钩子类型参考】\n' + genreTemplate.hookTypes.join('、') + '\n\n';
  sysMsg += '【硬节点分类参考】\n' + genreTemplate.hardNodeCategories.join('、') + '\n';
  
  // ===== 用户消息1：上下文 =====
  var ctxMsg = '';
  if (userCommand && userCommand.trim()) {
    ctxMsg += '【⚠️ 用户指令 · 最高优先级】\n' + userCommand.trim() + '\n\n';
  }
  if (prevResult && prevResult.length > 50) {
    ctxMsg += '【上一轮细纲】\n' + prevResult + '\n\n' +
      '【改进要求】\n' +
      '1. 基于已有细纲进行深化和完善\n' +
      '2. 补充缺失的章节，确保本卷达到72章\n' +
      '3. 增加每章的详细程度，确保每章至少200字\n' +
      '4. 保持原有章节结构和剧情不变\n' +
      '5. 输出完整的优化后细纲内容：\n\n';
  }
  if (world && world.length > 50) {
    ctxMsg += '【世界观关键设定】\n' + world.substring(0, 1000) + '\n\n';
  }
  if (chars && chars.length > 50) {
    ctxMsg += '【主要人物】\n' + chars.substring(0, 1000) + '\n\n';
  }
  if (outline && outline.length > 50) {
    var outlineLines = outline.split('\n');
    var volumeOutline = '';
    var inVolume = false;
    for (var i = 0; i < outlineLines.length; i++) {
      var line = outlineLines[i];
      if (line.includes('第' + (volumeIndex + 1) + '卷') || line.includes('第' + ['一','二','三','四','五','六','七','八'][volumeIndex] + '卷')) {
        inVolume = true;
      }
      if (inVolume) {
        volumeOutline += line + '\n';
        if (line.includes('第' + (volumeIndex + 2) + '卷') || line.match(/^[一-九]、/) || i === outlineLines.length - 1) {
          break;
        }
      }
    }
    if (volumeOutline.length > 50) {
      ctxMsg += '【本卷大纲】\n' + volumeOutline + '\n\n';
    }
  }
  
  // ===== 用户消息2：任务 =====
  var taskMsg = '请为本卷设计详细的章节细纲，目标规模：72章，每章约3500-4000字。\n\n';
  taskMsg += '每章必须包含以下内容（严格按照此格式）：\n\n';
  taskMsg += '### 【第N章】章节标题\n';
  taskMsg += '**情绪基调**：本章的整体情绪走向（从以上参考中选择或自定义）\n';
  taskMsg += '**爽点类型**：本章的核心爽点（从以上参考中选择或自定义）\n';
  taskMsg += '**时间**：具体时间点\n';
  taskMsg += '**地点**：本章主要发生的地点\n';
  taskMsg += '**人物**：本章出场的主要角色\n';
  taskMsg += '**硬节点**：\n';
  taskMsg += '1. 第一个具体剧情节点\n';
  taskMsg += '2. 第二个具体剧情节点\n';
  taskMsg += '...\n';
  taskMsg += '20. 第二十个具体剧情节点\n';
  taskMsg += '**【数字面板】** ' + genreTemplate.digitalPanel.replace(/X/g, '具体数值') + '\n';
  taskMsg += '**【番茄钩子】** 章末强烈的悬念或爽点，让读者必须看下一章\n';
  taskMsg += '**【兑现链】**\n';
  taskMsg += '- 钩子1 → 第X章回收（兑现）\n';
  taskMsg += '- 钩子2 → 第Y章回收（兑现）\n';
  taskMsg += '**字数建议**：4000-5000字\n\n';
  
  taskMsg += '【输出要求】\n';
  taskMsg += '1. 本卷设计72章细纲，每章详细写出，每章至少300字\n';
  taskMsg += '2. 总字数不少于35000字\n';
  taskMsg += '3. 结构清晰，使用标题分隔，分幕输出（如：第一幕、第二幕等）\n';
  taskMsg += '4. 每个章节要有15-20个硬节点，每个节点必须具体、可执行\n';
  taskMsg += '5. 数字面板必须使用题材专属格式，包含实时资源统计\n';
  taskMsg += '6. 每个番茄钩子必须有明确的兑现链，标注回收章节\n';
  taskMsg += '7. 每5章一个小高潮、每10章一个中高潮、每24章一个大高潮\n';
  taskMsg += '8. 穿插上帝视角段落，增加故事深度\n';
  taskMsg += '9. 适合百万字长篇（1500-3000章）的细纲架构\n';
  taskMsg += '10. 直接输出完整内容，不要加对话语前缀';
  
  return [
    { role: 'system', content: sysMsg },
    { role: 'user', content: ctxMsg },
    { role: 'user', content: taskMsg }
  ];
}

async function aiGenerateArchitecture(type, userCommand) {
  const work = getCurrentWork();
  if (!work) { showToast('请先新建或选择作品'); return; }
  
  work._archCache = work._archCache || {};
  
  var cacheKey = type + '_' + (userCommand || 'default');
  if (work._archCache[cacheKey] && work._archCache[cacheKey].timestamp > Date.now() - 3600000) {
    var cached = work._archCache[cacheKey];
    showToast('🔄 使用缓存 · ' + cached.content.length + '字', 3000);
    applyArchResult(type, work, cached.content);
    return;
  }
  
  var taskType, targetChars, minChars;
  var statusMsg = '';
  
  switch(type) {
    case 'world':
      taskType = 'world_creative';
      targetChars = 80000;
      minChars = 30000;
      statusMsg = '正在生成世界观…';
      break;
    case 'outline':
      taskType = 'outline_logic';
      targetChars = 150000;
      minChars = 50000;
      statusMsg = '正在生成大纲…';
      break;
    case 'chars':
      taskType = 'chars_core';
      targetChars = 60000;
      minChars = 20000;
      statusMsg = '正在生成人设…';
      break;
    case 'detail':
      taskType = 'detail_base';
      targetChars = 100000;
      minChars = 35000;
      statusMsg = '正在生成细纲…';
      break;
    default:
      showToast('未知类型');
      return;
  }
  
  return _archIterateGenerate(type, taskType, targetChars, minChars, statusMsg, userCommand, work, cacheKey, 0, null, '');
}

async function _archIterateGenerate(type, taskType, targetChars, minChars, statusMsg, userCommand, work, cacheKey, iteration, bestResult, prevResult) {
  var prompt;
  var volumeIdx = 0;
  
  if (type === 'detail') {
    try {
      var volInfo = getCurrentVolumeDetail(work, currentChapterIdx || 0);
      if (volInfo && volInfo.currentIdx !== undefined) volumeIdx = volInfo.currentIdx;
    } catch(e) {}
  }
  
  if (iteration === 0) {
    switch(type) {
      case 'world':
        prompt = buildWorldPrompt(work, userCommand);
        break;
      case 'outline':
        prompt = buildOutlinePrompt(work, userCommand);
        break;
      case 'chars':
        prompt = buildCharsPrompt(work, userCommand);
        break;
      case 'detail':
        prompt = buildDetailPrompt(work, volumeIdx, userCommand);
        break;
    }
  } else {
    switch(type) {
      case 'world':
        prompt = buildWorldPrompt(work, userCommand, prevResult);
        break;
      case 'outline':
        prompt = buildOutlinePrompt(work, userCommand, prevResult);
        break;
      case 'chars':
        prompt = buildCharsPrompt(work, userCommand, prevResult);
        break;
      case 'detail':
        prompt = buildDetailPrompt(work, volumeIdx, userCommand, prevResult);
        break;
    }
  }
  
  if (iteration === 0) {
    if (typeof resetLoading === 'function') resetLoading(statusMsg);
    else showLoading(statusMsg);
    if(typeof updateLoadingProgress === 'function') updateLoadingProgress(10, '正在生成 ' + statusMsg);
  } else {
    if (typeof resetLoading === 'function') resetLoading('第' + (iteration + 1) + '轮 · ' + statusMsg);
    else showLoading('第' + (iteration + 1) + '轮 · ' + statusMsg);
    if(typeof updateLoadingProgress === 'function') updateLoadingProgress(30 + iteration * 20, '第' + (iteration + 1) + '轮 · ' + statusMsg);
  }
  
  try {
    var result = await callRealAPIWithFallback(prompt, null, taskType, targetChars);
    
    if (result && result.length > 200) {
      result = typeof cleanAIOutput === 'function' ? cleanAIOutput(result) : result;
      
      if (result.length < minChars) {
        if (statusBar) statusBar.textContent = '⚠️ ' + statusMsg.replace('正在生成', '生成中') + ' · 内容偏短(' + result.length + '字)，正在补写…';
        var extendPrompt = '你是网文架构补全助手。以下内容不够完整，请补充完善至' + minChars + '字以上，保持结构完整、内容详实。\n\n';
        extendPrompt += '【已有内容】\n' + result + '\n\n';
        extendPrompt += '【要求】\n1. 保持原有结构和格式\n2. 补充缺失的细节和内容\n3. 不要重复已有内容\n4. 直接输出补写内容：';
        try {
          var extendResult = await callRealAPIWithFallback(extendPrompt, null, taskType, targetChars - result.length, true);
          if (extendResult && extendResult.length > 100) {
            result = result + '\n\n' + extendResult;
            if(statusBar) statusBar.textContent = '✅ ' + statusMsg.replace('正在生成', '补写完成') + ' · ' + result.length + '字';
          }
        } catch(e) { console.warn('[架构补写] 失败:', e); }
      }
      
      var currentScore = 0;
      var qReport = null;
      if(typeof updateLoadingProgress === 'function') updateLoadingProgress(70, '🔍 质量评价中…');
      if (typeof evaluateText === 'function') {
        try {
          qReport = evaluateText(result, type, work);
          currentScore = qReport && typeof qReport.score === 'number' ? qReport.score : 0;
        } catch(e) { console.warn('[架构评分] 失败:', e); }
      }
      
      if (!bestResult || result.length > bestResult.length || (currentScore > 0 && currentScore > bestResult.score)) {
        bestResult = { text: result, score: currentScore };
      }
      
      if (iteration < 2 && currentScore > 0 && currentScore < 85) {
        if (statusBar) {
          statusBar.style.background = '#fef3c7';
          statusBar.style.color = '#92400e';
          statusBar.textContent = '🔄 自动迭代中 · 当前' + currentScore + '分 · 第' + (iteration + 1) + '/3轮';
        }
        return _archIterateGenerate(type, taskType, targetChars, minChars, statusMsg, userCommand, work, cacheKey, iteration + 1, bestResult, result);
      }
      
      var finalResult = bestResult ? bestResult.text : result;
      
      work._archCache[cacheKey] = { content: finalResult, timestamp: Date.now() };
      
      applyArchResult(type, work, finalResult);
      
      if(typeof updateLoadingProgress === 'function') updateLoadingProgress(100, '✅ 保存完成');
      showToast('✅ ' + statusMsg.replace('正在生成', '生成完成') + ' · ' + finalResult.length + '字 · 共' + (iteration + 1) + '轮', 5000);
    } else {
      showToast('⚠️ 生成内容过短，可能是API异常', 5000);
    }
  } catch(e) {
    console.warn('[架构生成] 失败:', e);
    showToast('⚠️ 生成失败：' + (e.message || '未知错误'), 5000);
  } finally {
    hideLoading();
  }
}

function applyArchResult(type, work, result) {
  switch(type) {
    case 'world':
      work.world = result;
      break;
    case 'outline':
      work.outline = result;
      break;
    case 'chars':
      work.chars = result;
      break;
    case 'detail':
      work.detail = (work.detail || '') + '\n\n' + result;
      break;
  }
  DB.saveWork(work);
  updateArchStatus(work);
}

window.aiGenerateArchitecture = aiGenerateArchitecture;

// ========== v58: 正文生成迭代机制优化 ==========
// 问题：原机制输出长度受限，迭代时内容容易变短，命中率低
// 优化：增加输出长度限制，改进迭代时的内容保持策略，保持目标分数90分

function optimizeChapterGeneration() {
  window._originalAiWriteChapter = window._originalAiWriteChapter || aiWriteChapter;
  
  window.aiWriteChapter = async function(opts) {
    opts = opts || {};
    var _writeIteration = opts._iteration || 0;
    
    var result = await window._originalAiWriteChapter(opts);
    
    if (_writeIteration > 0 && opts._prevBest && result) {
      var currentContent = document.getElementById('editor').value || '';
      if (currentContent.length < opts._prevBest.text.length * 0.8) {
        result = opts._prevBest.text;
        document.getElementById('editor').value = result;
      }
    }
    
    return result;
  };
}

optimizeChapterGeneration();
