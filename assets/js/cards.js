"use strict";

/* 文心笔匠 - 五张创作卡片系统（自动使用） */
window.CARDS = {
  world: '世界观卡',
  chars: '人物卡',
  outline: '大纲卡',
  detail: '细纲卡',
  chapter: '章节卡'
};

// ===================== 渲染入口 =====================
function renderCardForm(module, container, work) {
  if (!container) return;
  var data = work._cardData || {};
  if (module === 'world') renderWorldCard(container, data.world || {}, work);else if (module === 'chars') renderCharCards(container, data.chars || [], work);else if (module === 'outline') renderOutlineCard(container, data.outline || {}, work);else if (module === 'detail') renderDetailCard(container, data.detail || {}, work);else if (module === 'chapter') renderChapterCard(container, data.chapter || {}, work);
}
function collectCardData(module, container) {
  if (module === 'world') return getWorldCardData(container);
  if (module === 'chars') return getCharCardsData(container);
  if (module === 'outline') return getOutlineCardData(container);
  if (module === 'detail') return getDetailCardData(container);
  if (module === 'chapter') return getChapterCardData(container);
  return {};
}
function cardToFreeText(module, data) {
  if (!data) return '';
  if (module === 'world') return worldCardToText(data);
  if (module === 'chars') return charCardsToText(data);
  if (module === 'outline') return outlineCardToText(data);
  if (module === 'detail') return detailCardToText(data);
  if (module === 'chapter') return chapterCardToText(data);
  return '';
}

// ===================== 世界观卡 =====================
function renderWorldCard(ct, d, w) {
  var s = '<div class="card-form" id="card-world-form">';
  s += '<h3>🌍 世界观卡</h3>';
  // 基础设定
  s += '<div class="cf-section"><div class="cf-label">🔒 世界基础设定</div>';
  s += '<div class="cf-row"><label>时代背景</label>';
  var eras = ['古代', '现代', '未来', '架空', '穿越'];
  s += '<div class="cf-chips">';
  eras.forEach(function (e) {
    s += '<span class="cf-chip' + (d.era === e ? ' active' : '') + '" onclick="this.parentNode.querySelectorAll(\'.cf-chip\').forEach(function(c){c.classList.remove(\'active\');});this.classList.add(\'active\');">' + e + '</span>';
  });
  s += '</div></div>';
  s += '<div class="cf-row"><label>具体年代/纪元</label><input class="cf-input" id="w-era-detail" value="' + esc(d.eraDetail) + '" placeholder="如：大周天启三年"></div>';
  var wTypes = ['低武', '中武', '高武', '修仙', '科幻', '末世', '其他'];
  s += '<div class="cf-row"><label>世界类型</label><div class="cf-chips">';
  wTypes.forEach(function (t) {
    s += '<span class="cf-chip' + (d.worldType === t ? ' active' : '') + '" onclick="selectChip(this)">' + t + '</span>';
  });
  s += '</div></div>';
  s += '<div class="cf-row"><label>核心规则（不可违背）</label><textarea class="cf-textarea" id="w-core-rules" placeholder="如：灵气复苏法则、境界突破条件...">' + esc(d.coreRules) + '</textarea></div>';
  s += '</div>';
  // 地理
  s += '<div class="cf-section"><div class="cf-label">🔒 地理锁死</div>';
  s += '<div class="cf-row"><label>当前主要场景区域</label><input class="cf-input" id="w-geo-current" value="' + esc(d.geoCurrent) + '" placeholder="如：苍澜山脉"></div>';
  s += '<div class="cf-row"><label>区域特征</label><input class="cf-input" id="w-geo-features" value="' + esc(d.geoFeatures) + '" placeholder="地形/气候/植被"></div>';
  s += '<div class="cf-row"><label>重要地标</label><input class="cf-input" id="w-landmarks" value="' + esc(d.landmarks) + '" placeholder="位置永久固定"></div>';
  s += '<div class="cf-row"><label>距离关系</label><input class="cf-input" id="w-distances" value="' + esc(d.distances) + '" placeholder="A到B约X里，脚程Y天"></div>';
  s += '</div>';
  // 势力格局
  s += '<div class="cf-section"><div class="cf-label">🔒 势力格局</div>';
  s += '<div id="w-factions">';
  var factions = d.factions || [{
    name: '',
    leader: '',
    territory: '',
    relation: '',
    notes: ''
  }];
  factions.forEach(function (f, i) {
    s += '<div class="cf-faction-row"><input class="cf-input-sm" placeholder="势力名" value="' + esc(f.name) + '"><input class="cf-input-sm" placeholder="首领" value="' + esc(f.leader) + '"><input class="cf-input-sm" placeholder="地盘" value="' + esc(f.territory) + '"><input class="cf-input-sm" placeholder="与主角关系" value="' + esc(f.relation) + '"><input class="cf-input-sm" placeholder="备注" value="' + esc(f.notes) + '"></div>';
  });
  s += '</div>';
  s += '<button class="cf-add-btn" onclick="addFactionRow()">+ 添加势力</button>';
  s += '</div>';
  // 力量体系
  s += '<div class="cf-section"><div class="cf-label">🔒 力量体系</div>';
  s += '<div class="cf-row"><label>境界划分（从低到高）</label><input class="cf-input" id="w-powers" value="' + esc(d.powers) + '" placeholder="如：筑基→金丹→元婴→化神→渡劫"></div>';
  s += '<div class="cf-row"><label>当前主角境界</label><input class="cf-input" id="w-current-level" value="' + esc(d.currentLevel) + '"></div>';
  s += '<div class="cf-row"><label>突破条件</label><input class="cf-input" id="w-breakthrough" value="' + esc(d.breakthrough) + '"></div>';
  s += '<div class="cf-row"><label>力量代价/副作用</label><input class="cf-input" id="w-power-cost" value="' + esc(d.powerCost) + '"></div>';
  s += '</div>';
  // 经济
  s += '<div class="cf-section"><div class="cf-label">🔒 经济/物价</div>';
  s += '<div class="cf-row-inline"><label>货币</label><input class="cf-input-sm" id="w-currency" value="' + esc(d.currency) + '"><label>日薪</label><input class="cf-input-sm" id="w-daily-wage" value="' + esc(d.dailyWage) + '"><label>一顿饭</label><input class="cf-input-sm" id="w-meal-price" value="' + esc(d.mealPrice) + '"><label>普通武器</label><input class="cf-input-sm" id="w-weapon-price" value="' + esc(d.weaponPrice) + '"></div>';
  s += '</div>';
  // 禁忌
  s += '<div class="cf-section"><div class="cf-label">🔒 禁忌设定（AI绝对不允许写）</div>';
  var taboos = ['现代科技穿越到古代', '主角秒杀高于自己两个大境界的敌人', '金手指无代价'];
  s += '<div class="cf-chips">';
  taboos.forEach(function (t) {
    var checked = d.taboos && d.taboos.indexOf(t) >= 0;
    s += '<span class="cf-chip' + (checked ? ' active danger' : '') + '" onclick="this.classList.toggle(\'active\');this.classList.toggle(\'danger\');">' + t + '</span>';
  });
  s += '</div>';
  s += '<div class="cf-row"><label>其他禁忌</label><input class="cf-input" id="w-custom-taboos" value="' + esc(d.customTaboos) + '"></div>';
  s += '</div>';
  // 当前状态
  s += '<div class="cf-section"><div class="cf-label">🔒 当前世界状态</div>';
  s += '<div class="cf-row-inline"><label>日期</label><input class="cf-input-sm" id="w-date" value="' + esc(d.date) + '" placeholder="公元X年X月X日"><label>季节</label><select class="cf-select" id="w-season"><option value="">-</option><option value="春"' + (d.season === '春' ? ' selected' : '') + '>春</option><option value="夏"' + (d.season === '夏' ? ' selected' : '') + '>夏</option><option value="秋"' + (d.season === '秋' ? ' selected' : '') + '>秋</option><option value="冬"' + (d.season === '冬' ? ' selected' : '') + '>冬</option></select></div>';
  s += '<div class="cf-row"><label>近期大事</label><input class="cf-input" id="w-recent-events" value="' + esc(d.recentEvents) + '"></div>';
  s += '</div>';
  s += '</div>';
  ct.innerHTML = s;
}
function getWorldCardData(ct) {
  var d = {};
  var eraChip = ct.querySelector('.cf-chip.active');
  d.era = eraChip ? eraChip.textContent : '';
  d.eraDetail = val('w-era-detail');
  d.worldType = valChip(ct, '.cf-section:nth-child(1) .cf-row:nth-child(3) .cf-chip.active');
  d.coreRules = val('w-core-rules');
  d.geoCurrent = val('w-geo-current');
  d.geoFeatures = val('w-geo-features');
  d.landmarks = val('w-landmarks');
  d.distances = val('w-distances');
  // 势力
  var factionRows = ct.querySelectorAll('#w-factions .cf-faction-row');
  d.factions = [];
  factionRows.forEach(function (row) {
    var inputs = row.querySelectorAll('input');
    if (inputs[0].value || inputs[1].value) {
      d.factions.push({
        name: inputs[0].value,
        leader: inputs[1].value,
        territory: inputs[2].value,
        relation: inputs[3].value,
        notes: inputs[4].value
      });
    }
  });
  d.powers = val('w-powers');
  d.currentLevel = val('w-current-level');
  d.breakthrough = val('w-breakthrough');
  d.powerCost = val('w-power-cost');
  d.currency = val('w-currency');
  d.dailyWage = val('w-daily-wage');
  d.mealPrice = val('w-meal-price');
  d.weaponPrice = val('w-weapon-price');
  // 禁忌
  d.taboos = [];
  ct.querySelectorAll('.cf-chip.active.danger').forEach(function (c) {
    d.taboos.push(c.textContent);
  });
  d.customTaboos = val('w-custom-taboos');
  d.date = val('w-date');
  d.season = document.getElementById('w-season') ? document.getElementById('w-season').value : '';
  d.recentEvents = val('w-recent-events');
  return d;
}
function worldCardToText(d) {
  if (!d) return '';
  var t = '【世界观卡】\n\n';
  t += '🔒 世界基础设定\n';
  t += '- 时代背景：' + (d.era || '') + ' | ' + (d.eraDetail || '') + '\n';
  t += '- 世界类型：' + (d.worldType || '') + '\n';
  t += '- 核心规则：' + (d.coreRules || '') + '\n\n';
  t += '🔒 地理锁死\n';
  t += '- 当前场景区域：' + (d.geoCurrent || '') + '\n';
  t += '- 区域特征：' + (d.geoFeatures || '') + '\n';
  t += '- 重要地标：' + (d.landmarks || '') + '\n';
  t += '- 距离关系：' + (d.distances || '') + '\n\n';
  t += '🔒 势力格局\n';
  if (d.factions) d.factions.forEach(function (f) {
    if (f.name) t += '- ' + f.name + '（首领：' + f.leader + '，地盘：' + f.territory + '，关系：' + f.relation + '）\n';
  });
  t += '\n🔒 力量体系\n';
  t += '- 境界：' + (d.powers || '') + '\n';
  t += '- 当前境界：' + (d.currentLevel || '') + '\n';
  t += '- 突破条件：' + (d.breakthrough || '') + '\n';
  t += '- 代价：' + (d.powerCost || '') + '\n\n';
  t += '🔒 经济\n';
  t += '- 货币：' + (d.currency || '') + ' | 日薪：' + (d.dailyWage || '') + ' | 一顿饭：' + (d.mealPrice || '') + ' | 武器：' + (d.weaponPrice || '') + '\n';
  return t;
}
function addFactionRow() {
  var div = document.getElementById('w-factions');
  var row = document.createElement('div');
  row.className = 'cf-faction-row';
  row.innerHTML = '<input class="cf-input-sm" placeholder="势力名"><input class="cf-input-sm" placeholder="首领"><input class="cf-input-sm" placeholder="地盘"><input class="cf-input-sm" placeholder="与主角关系"><input class="cf-input-sm" placeholder="备注">';
  div.appendChild(row);
}

// ===================== 人物卡 =====================
var charEditIndex = 0;
function renderCharCards(ct, chars, work) {
  chars = chars || [{
    name: '',
    age: '',
    gender: '',
    identity: ''
  }];
  charEditIndex = 0;
  var s = '<div class="card-form" id="card-char-form">';
  s += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><h3 style="flex:1">👤 人物卡</h3>';
  s += '<button class="cf-add-btn" onclick="addCharCard()">+</button>';
  s += '<button class="cf-add-btn" onclick="removeCharCard()" style="background:#fee2e2;color:#ef4444;">-</button>';
  s += '</div>';
  s += '<div id="char-tabs" style="display:flex;gap:4px;overflow-x:auto;margin-bottom:10px;">';
  chars.forEach(function (c, i) {
    s += '<span class="cf-chip' + (i === 0 ? ' active' : '') + '" onclick="switchCharCard(' + i + ')">' + (c.name || '角色' + (i + 1)) + '</span>';
  });
  s += '</div>';
  s += '<div id="char-card-body">' + renderSingleCharCard(chars[0] || {}, 0) + '</div>';
  s += '</div>';
  ct.innerHTML = s;
  window._charCardsData = chars;
}
function renderSingleCharCard(d, idx) {
  var s = '<div class="cf-section"><div class="cf-label">🔒 基础信息</div>';
  s += '<div class="cf-row-inline"><label>姓名</label><input class="cf-input-sm ch-name" value="' + esc(d.name) + '" placeholder="姓名"><label>年龄</label><input class="cf-input-sm ch-age" value="' + esc(d.age) + '" placeholder="岁"><label>性别</label><select class="cf-select ch-gender"><option value="男"' + (d.gender === '男' ? ' selected' : '') + '>男</option><option value="女"' + (d.gender === '女' ? ' selected' : '') + '>女</option></select></div>';
  s += '<div class="cf-row"><label>身份/职业</label><input class="cf-input ch-identity" value="' + esc(d.identity) + '" placeholder="如：剑修、散修"></div>';
  s += '<div class="cf-row"><label>外貌（一字不改）</label><textarea class="cf-textarea ch-appearance" placeholder="详细描述外貌...">' + esc(d.appearance) + '</textarea></div>';
  s += '<div class="cf-row"><label>标志性服饰/配饰</label><input class="cf-input ch-attire" value="' + esc(d.attire) + '"></div>';
  s += '<div class="cf-row"><label>身体特征/伤疤</label><input class="cf-input ch-scars" value="' + esc(d.scars) + '" placeholder="位置永久保留"></div>';
  s += '</div>';
  // 性格
  s += '<div class="cf-section"><div class="cf-label">🔒 性格锁死</div>';
  s += '<div class="cf-row-inline"><label>核心性格</label><input class="cf-input-sm ch-core1" value="' + esc(d.core1) + '" placeholder="词1"><input class="cf-input-sm ch-core2" value="' + esc(d.core2) + '" placeholder="词2"><input class="cf-input-sm ch-core3" value="' + esc(d.core3) + '" placeholder="词3"></div>';
  s += '<div class="cf-row"><label>优点</label><input class="cf-input ch-strengths" value="' + esc(d.strengths) + '"></div>';
  s += '<div class="cf-row"><label>缺点</label><input class="cf-input ch-weaknesses" value="' + esc(d.weaknesses) + '"></div>';
  s += '<div class="cf-row"><label>底线/禁忌</label><input class="cf-input ch-bottomline" value="' + esc(d.bottomline) + '"></div>';
  s += '<div class="cf-row"><label>恐惧的事物</label><input class="cf-input ch-fears" value="' + esc(d.fears) + '"></div>';
  s += '</div>';
  // 说话风格
  s += '<div class="cf-section"><div class="cf-label">🔒 说话风格</div>';
  s += '<div class="cf-row-inline"><label>语速</label><select class="cf-select ch-speed"><option value="快"' + (d.speed === '快' ? ' selected' : '') + '>快</option><option value="中"' + (d.speed === '中' || !d.speed ? ' selected' : '') + '>中</option><option value="慢"' + (d.speed === '慢' ? ' selected' : '') + '>慢</option></select>';
  var tones = ['粗鲁', '文雅', '阴冷', '幽默', '寡言'];
  tones.forEach(function (t) {
    var checked = d.tone && d.tone.indexOf(t) >= 0;
    s += '<span class="cf-chip ch-tone' + (checked ? ' active' : '') + '" style="flex-shrink:0" onclick="this.classList.toggle(\'active\');">' + t + '</span>';
  });
  s += '</div>';
  s += '<div class="cf-row"><label>常用口头禅</label><input class="cf-input ch-catchphrase" value="' + esc(d.catchphrase) + '"></div>';
  s += '<div class="cf-row"><label>禁忌话题</label><input class="cf-input ch-taboo-topic" value="' + esc(d.tabooTopic) + '"></div>';
  s += '</div>';
  // 小动作
  s += '<div class="cf-section"><div class="cf-label">🔒 专属小动作</div>';
  var situations = ['思考时', '紧张/焦虑时', '愤怒时', '高兴时', '撒谎/隐瞒时', '战斗前'];
  situations.forEach(function (sit) {
    var key = sit.replace(/[/]/g, '').replace(/焦/g, '').substring(0, 2);
    s += '<div class="cf-row"><label>' + sit + '</label><input class="cf-input ch-gesture-' + idx + '" value="' + esc(d.gestures && d.gestures[sit] ? d.gestures[sit] : '') + '" placeholder="固定小动作"></div>';
  });
  s += '</div>';
  // 能力
  s += '<div class="cf-section"><div class="cf-label">🔒 能力/武力</div>';
  s += '<div class="cf-row"><label>当前战力等级</label><input class="cf-input ch-power-level" value="' + esc(d.powerLevel) + '"></div>';
  s += '<div class="cf-row"><label>主武器/工具</label><input class="cf-input ch-weapon" value="' + esc(d.weapon) + '"></div>';
  s += '<div class="cf-row"><label>特殊技能</label><input class="cf-input ch-skills" value="' + esc(d.skills) + '"></div>';
  s += '<div class="cf-row"><label>弱点/短板</label><input class="cf-input ch-shortcoming" value="' + esc(d.shortcoming) + '"></div>';
  s += '</div>';
  return s;
}
function switchCharCard(idx) {
  // 先保存当前编辑的角色数据
  saveCurrentCharCard();
  charEditIndex = idx;
  var chars = window._charCardsData || [];
  document.getElementById('char-card-body').innerHTML = renderSingleCharCard(chars[idx] || {}, idx);
  var tabs = document.querySelectorAll('#char-tabs .cf-chip');
  tabs.forEach(function (t, i) {
    t.classList.toggle('active', i === idx);
  });
}
function addCharCard() {
  var chars = window._charCardsData || [];
  chars.push({
    name: '',
    age: '',
    gender: '男',
    identity: ''
  });
  window._charCardsData = chars;
  var ct = document.getElementById('arch-card-area') || document.getElementById('arch-edit-area') || document.getElementById('cp-card-body');
  renderCharCards(ct, chars);
}
function removeCharCard() {
  var chars = window._charCardsData || [];
  if (chars.length <= 1) {
    showToast && showToast('至少保留一个角色');
    return;
  }
  chars.splice(charEditIndex, 1);
  window._charCardsData = chars;
  charEditIndex = Math.min(charEditIndex, chars.length - 1);
  var ct = document.getElementById('arch-card-area') || document.getElementById('arch-edit-area') || document.getElementById('cp-card-body');
  renderCharCards(ct, chars);
  showToast && showToast('已删除角色');
}
function getCharCardsData(ct) {
  var chars = window._charCardsData || [];
  // 先保存当前编辑的角色
  saveCurrentCharCard();
  return chars;
}
function saveCurrentCharCard() {
  var chars = window._charCardsData || [];
  if (chars.length === 0) return;
  var idx = charEditIndex;
  var d = chars[idx] || {};
  d.name = qv('.ch-name');
  d.age = qv('.ch-age');
  d.gender = qv('.ch-gender');
  d.identity = qv('.ch-identity');
  d.appearance = qv('.ch-appearance');
  d.attire = qv('.ch-attire');
  d.scars = qv('.ch-scars');
  d.core1 = qv('.ch-core1');
  d.core2 = qv('.ch-core2');
  d.core3 = qv('.ch-core3');
  d.strengths = qv('.ch-strengths');
  d.weaknesses = qv('.ch-weaknesses');
  d.bottomline = qv('.ch-bottomline');
  d.fears = qv('.ch-fears');
  d.speed = qv('.ch-speed');
  var tones = [];
  document.querySelectorAll('.ch-tone.active').forEach(function (t) {
    tones.push(t.textContent);
  });
  d.tone = tones;
  d.catchphrase = qv('.ch-catchphrase');
  d.tabooTopic = qv('.ch-taboo-topic');
  d.powerLevel = qv('.ch-power-level');
  d.weapon = qv('.ch-weapon');
  d.skills = qv('.ch-skills');
  d.shortcoming = qv('.ch-shortcoming');
  // 保存小动作
  if (!d.gestures) d.gestures = {};
  ['思考时', '紧张/焦虑时', '愤怒时', '高兴时', '撒谎/隐瞒时', '战斗前'].forEach(function (sit, si) {
    var els = document.querySelectorAll('.ch-gesture-' + idx);
    if (els[si]) d.gestures[sit] = els[si].value;
  });
  chars[idx] = d;
}
function charCardsToText(chars) {
  if (!chars || !chars.length) return '';
  var t = '';
  chars.forEach(function (c, i) {
    t += '【人物卡】姓名：' + (c.name || '角色' + (i + 1)) + '\n';
    t += '- 年龄：' + (c.age || '') + '岁 | 性别：' + (c.gender || '') + ' | 身份：' + (c.identity || '') + '\n';
    t += '- 外貌：' + (c.appearance || '') + '\n';
    t += '- 性格：' + (c.core1 || '') + ' / ' + (c.core2 || '') + ' / ' + (c.core3 || '') + '\n';
    t += '- 优点：' + (c.strengths || '') + ' | 缺点：' + (c.weaknesses || '') + '\n';
    t += '- 武器：' + (c.weapon || '') + ' | 战力：' + (c.powerLevel || '') + '\n';
    t += '- 口头禅：' + (c.catchphrase || '') + ' | 语速：' + (c.speed || '') + '\n\n';
  });
  return t;
}

// ===================== 大纲卡 =====================
function renderOutlineCard(ct, d) {
  var s = '<div class="card-form" id="card-outline-form">';
  s += '<h3>📋 大纲卡</h3>';
  s += '<div class="cf-section"><div class="cf-label">🔒 故事核心</div>';
  s += '<div class="cf-row"><label>一句话梗概</label><textarea class="cf-textarea" id="o-summary" placeholder="用一句话概括整个故事...">' + esc(d.summary) + '</textarea></div>';
  s += '<div class="cf-row"><label>核心冲突</label><input class="cf-input" id="o-conflict" value="' + esc(d.conflict) + '" placeholder="主角 vs 什么"></div>';
  s += '<div class="cf-row"><label>主角终极目标</label><input class="cf-input" id="o-goal" value="' + esc(d.goal) + '"></div>';
  var tones = ['热血', '黑暗', '轻松', '权谋'];
  s += '<div class="cf-row"><label>故事基调</label><div class="cf-chips">';
  tones.forEach(function (t) {
    s += '<span class="cf-chip' + (d.tone === t ? ' active' : '') + '" onclick="selectChip(this)">' + t + '</span>';
  });
  s += '</div></div>';
  s += '</div>';
  s += '<div class="cf-section"><div class="cf-label">🔒 主线结构</div>';
  s += '<div class="cf-row-inline"><label>总卷数</label><input class="cf-input-sm" id="o-volumes" value="' + esc(d.volumes || '4') + '" type="number" min="1" max="10"><label>预计总章节</label><input class="cf-input-sm" id="o-total-chapters" value="' + esc(d.totalChapters) + '" placeholder="章"></div>';
  var stages = ['开局', '发展', '高潮', '结局'];
  stages.forEach(function (st, i) {
    s += '<div class="cf-row"><label>第' + (i + 1) + '卷（' + st + '）</label><textarea class="cf-textarea" id="o-vol' + i + '" placeholder="核心内容描述...">' + esc(d['vol' + i] || '') + '</textarea></div>';
  });
  s += '</div>';
  s += '<div class="cf-section"><div class="cf-label">🔒 关键转折点</div>';
  for (var i = 1; i <= 3; i++) {
    s += '<div class="cf-row"><label>第' + i + '个转折</label><input class="cf-input" id="o-turn' + i + '-ch" value="' + esc(d['turn' + i + 'Ch']) + '" placeholder="第几章"><input class="cf-input" id="o-turn' + i + '-desc" value="' + esc(d['turn' + i + 'Desc']) + '" placeholder="事件描述" style="margin-top:4px;"></div>';
  }
  s += '</div>';
  s += '<div class="cf-section"><div class="cf-label">🔒 结局锁死</div>';
  var ends = ['大团圆', '悲壮', '开放', '反转'];
  s += '<div class="cf-row"><label>结局类型</label><div class="cf-chips">';
  ends.forEach(function (e) {
    s += '<span class="cf-chip' + (d.ending === e ? ' active' : '') + '" onclick="selectChip(this)">' + e + '</span>';
  });
  s += '</div></div>';
  s += '<div class="cf-row"><label>最终结局</label><textarea class="cf-textarea" id="o-ending-desc" placeholder="结局描述...">' + esc(d.endingDesc) + '</textarea></div>';
  s += '</div>';
  s += '</div>';
  ct.innerHTML = s;
}
function getOutlineCardData() {
  var d = {};
  d.summary = val('o-summary');
  d.conflict = val('o-conflict');
  d.goal = val('o-goal');
  var toneChip = document.querySelector('#card-outline-form .cf-section:nth-child(1) .cf-chip.active');
  d.tone = toneChip ? toneChip.textContent : '';
  d.volumes = val('o-volumes');
  d.totalChapters = val('o-total-chapters');
  for (var i = 0; i < 4; i++) {
    d['vol' + i] = val('o-vol' + i);
  }
  for (var i = 1; i <= 3; i++) {
    d['turn' + i + 'Ch'] = val('o-turn' + i + '-ch');
    d['turn' + i + 'Desc'] = val('o-turn' + i + '-desc');
  }
  d.ending = valChipText('#card-outline-form .cf-section:nth-child(4) .cf-chip.active');
  d.endingDesc = val('o-ending-desc');
  return d;
}
function outlineCardToText(d) {
  if (!d) return '';
  var t = '【大纲卡】\n\n';
  t += '🔒 故事核心\n';
  t += '- 梗概：' + (d.summary || '') + '\n';
  t += '- 冲突：' + (d.conflict || '') + ' | 基调：' + (d.tone || '') + '\n';
  t += '- 终极目标：' + (d.goal || '') + '\n\n';
  t += '🔒 主线结构\n';
  t += '- 总卷数：' + (d.volumes || '4') + '卷\n';
  ['开局', '发展', '高潮', '结局'].forEach(function (st, i) {
    if (d['vol' + i]) t += '- 第' + (i + 1) + '卷（' + st + '）：' + d['vol' + i] + '\n';
  });
  return t;
}

// ===================== 细纲卡 =====================
function renderDetailCard(ct, d) {
  var s = '<div class="card-form" id="card-detail-form">';
  s += '<h3>📑 细纲卡</h3>';
  s += '<div class="cf-row"><label>卷号 / 标题</label><input class="cf-input" id="d-vol-title" value="' + esc(d.volTitle) + '" placeholder="第X卷《标题》"></div>';
  s += '<div class="cf-section"><div class="cf-label">🔒 场景节点</div>';
  for (var i = 1; i <= 5; i++) {
    s += '<div class="cf-row"><label>场景' + i + '</label><input class="cf-input-sm" placeholder="地点" id="d-s' + i + '-loc" value="' + esc(d['s' + i + 'Loc']) + '"><input class="cf-input-sm" placeholder="参与人物" id="d-s' + i + '-chars" value="' + esc(d['s' + i + 'Chars']) + '"><input class="cf-input" placeholder="核心事件（一句话）" id="d-s' + i + '-event" value="' + esc(d['s' + i + 'Event']) + '" style="margin-top:4px;"></div>';
  }
  s += '</div>';
  s += '<div class="cf-section"><div class="cf-label">🔒 场景详细</div>';
  for (var i = 1; i <= 5; i++) {
    s += '<div class="cf-scene-detail"><div class="cf-label">场景' + i + '：</div>';
    s += '<textarea class="cf-textarea" id="d-sd' + i + '" placeholder="开场画面/对话/动作/情绪/钩子...">' + esc(d['sd' + i] || '') + '</textarea></div>';
  }
  s += '</div>';
  s += '</div>';
  ct.innerHTML = s;
}
function getDetailCardData() {
  var d = {};
  d.volTitle = val('d-vol-title');
  for (var i = 1; i <= 5; i++) {
    d['s' + i + 'Loc'] = val('d-s' + i + '-loc');
    d['s' + i + 'Chars'] = val('d-s' + i + '-chars');
    d['s' + i + 'Event'] = val('d-s' + i + '-event');
    d['sd' + i] = val('d-sd' + i);
  }
  return d;
}
function detailCardToText(d) {
  if (!d) return '';
  var t = '【细纲卡】' + (d.volTitle || '') + '\n\n';
  for (var i = 1; i <= 5; i++) {
    t += '场景' + i + '：' + (d['s' + i + 'Loc'] || '') + ' | ' + (d['s' + i + 'Chars'] || '') + ' | ' + (d['s' + i + 'Event'] || '') + '\n';
    if (d['sd' + i]) t += d['sd' + i] + '\n';
  }
  return t;
}

// ===================== 章节卡 =====================
function renderChapterCard(ct, d, w) {
  var s = '<div class="card-form" id="card-chapter-form">';
  s += '<h3>📖 章节卡</h3>';
  s += '<div class="cf-section"><div class="cf-label">🔒 本章唯一目的</div>';
  s += '<textarea class="cf-textarea" id="cp-purpose" placeholder="一句话，禁止衍生">' + esc(d.purpose) + '</textarea>';
  s += '</div>';
  s += '<div class="cf-section"><div class="cf-label">🔒 时间地点锁死</div>';
  s += '<div class="cf-row-inline"><label>时间</label><input class="cf-input-sm" id="cp-time" value="' + esc(d.time) + '" placeholder="X年X月X日 X时"><label>地点</label><input class="cf-input-sm" id="cp-location" value="' + esc(d.location) + '"></div>';
  s += '<div class="cf-row-inline"><label>天气</label><input class="cf-input-sm" id="cp-weather" value="' + esc(d.weather) + '"><label>光线</label><input class="cf-input-sm" id="cp-light" value="' + esc(d.light) + '"><label>气味</label><input class="cf-input-sm" id="cp-smell" value="' + esc(d.smell) + '"><label>声音</label><input class="cf-input-sm" id="cp-sound" value="' + esc(d.sound) + '"></div>';
  s += '</div>';
  // 强制剧情节点
  s += '<div class="cf-section"><div class="cf-label">🔒 强制剧情节点</div>';
  for (var i = 1; i <= 5; i++) {
    s += '<div class="cf-row"><label>节点' + i + '</label><input class="cf-input" id="cp-node' + i + '" value="' + esc(d['node' + i]) + '" placeholder="按顺序100%执行"></div>';
  }
  s += '</div>';
  // 专项剧情卡
  s += '<div class="cf-section"><div class="cf-label">🔒 专项剧情卡</div>';
  var subTypes = [{
    id: 'battle',
    name: '战斗卡'
  }, {
    id: 'travel',
    name: '赶路卡'
  }, {
    id: 'dialog',
    name: '对话卡'
  }, {
    id: 'foreshadow',
    name: '伏笔回收卡'
  }, {
    id: 'daily',
    name: '日常卡'
  }];
  s += '<div class="cf-chips" style="margin-bottom:8px;">';
  subTypes.forEach(function (st) {
    s += '<span class="cf-chip cp-subtab' + (d.subType === st.id ? ' active' : '') + '" onclick="switchChapterSubCard(\'' + st.id + '\')">' + st.name + '</span>';
  });
  s += '</div>';
  s += '<div id="cp-sub-card">' + renderChapterSubCard(d.subType || 'battle', d) + '</div>';
  s += '</div>';
  s += '</div>';
  ct.innerHTML = s;
}
function switchChapterSubCard(type) {
  // 保存当前子卡片数据
  var oldData = {};
  var curSub = document.querySelector('.cp-subtab.active');
  if (curSub) {
    oldData = _collectSubCardData(curSub.textContent);
  }
  window._chapterSubData = window._chapterSubData || {};
  var subKeys = ['battle', 'travel', 'dialog', 'foreshadow', 'daily'];
  var subNames = ['战斗卡', '赶路卡', '对话卡', '伏笔回收卡', '日常卡'];
  var curIdx = curSub ? Array.from(curSub.parentNode.children).indexOf(curSub) : -1;
  if (curIdx >= 0 && curIdx < subKeys.length) window._chapterSubData[subKeys[curIdx]] = oldData;
  var chips = document.querySelectorAll('.cp-subtab');
  chips.forEach(function (c) {
    c.classList.toggle('active', false);
  });
  var target = document.querySelector('.cp-subtab:nth-child(' + (subKeys.indexOf(type) + 1) + ')');
  if (target) target.classList.add('active');
  document.getElementById('cp-sub-card').innerHTML = renderChapterSubCard(type, window._chapterSubData[type] || {});
}
function _collectSubCardData(typeText) {
  var d = {};
  if (typeText.indexOf('战斗') >= 0) {
    d.sideA = val('cp-b-sideA');
    d.sideB = val('cp-b-sideB');
    d.act1 = val('cp-b-act1');
    d.act2 = val('cp-b-act2');
    d.act3 = val('cp-b-act3');
    d.result = val('cp-b-result');
  } else if (typeText.indexOf('赶路') >= 0) {
    d.from = val('cp-t-from');
    d.to = val('cp-t-to');
    d.dist = val('cp-t-dist');
    d.dur = val('cp-t-dur');
    d.terrain = val('cp-t-terrain');
  } else if (typeText.indexOf('对话') >= 0) {
    d.dlA = val('cp-dl-a');
    d.dlB = val('cp-dl-b');
    d.dlTopic = val('cp-dl-topic');
    d.dlLine = val('cp-dl-line');
    d.dlResult = val('cp-dl-result');
  } else if (typeText.indexOf('伏笔') >= 0) {
    d.fSource = val('cp-f-source');
    d.fDetail = val('cp-f-detail');
    d.fMethod = val('cp-f-method');
  } else if (typeText.indexOf('日常') >= 0) {
    d.dyRatio = val('cp-dy-ratio');
  }
  return d;
}
function renderChapterSubCard(type, d) {
  d = d || {};
  if (type === 'battle') {
    return '<div><div class="cf-row-inline"><label>甲方</label><input class="cf-input-sm" id="cp-b-sideA" value="' + esc(d.sideA) + '"><label>乙方</label><input class="cf-input-sm" id="cp-b-sideB" value="' + esc(d.sideB) + '"></div>' + '<div class="cf-row"><label>关键动作序列</label><input class="cf-input-sm" id="cp-b-act1" value="' + esc(d.act1) + '" placeholder="1."><input class="cf-input-sm" id="cp-b-act2" value="' + esc(d.act2) + '" placeholder="2."><input class="cf-input-sm" id="cp-b-act3" value="' + esc(d.act3) + '" placeholder="3."></div>' + '<div class="cf-row"><label>胜负结果</label><input class="cf-input" id="cp-b-result" value="' + esc(d.result) + '"></div></div>';
  }
  if (type === 'travel') {
    return '<div><div class="cf-row-inline"><label>出发地</label><input class="cf-input-sm" id="cp-t-from" value="' + esc(d.from) + '"><label>→ 目的地</label><input class="cf-input-sm" id="cp-t-to" value="' + esc(d.to) + '"></div>' + '<div class="cf-row-inline"><label>路程</label><input class="cf-input-sm" id="cp-t-dist" value="' + esc(d.dist) + '" placeholder="里"><label>耗时</label><input class="cf-input-sm" id="cp-t-dur" value="' + esc(d.dur) + '" placeholder="天/小时"></div>' + '<div class="cf-row"><label>沿途地貌</label><input class="cf-input" id="cp-t-terrain" value="' + esc(d.terrain) + '" placeholder="A → B → C"></div></div>';
  }
  if (type === 'dialog') {
    return '<div><div class="cf-row-inline"><label>对话双方</label><input class="cf-input-sm" id="cp-dl-a" value="' + esc(d.dlA) + '"><label>vs</label><input class="cf-input-sm" id="cp-dl-b" value="' + esc(d.dlB) + '"></div>' + '<div class="cf-row"><label>核心议题</label><input class="cf-input" id="cp-dl-topic" value="' + esc(d.dlTopic) + '"></div>' + '<div class="cf-row"><label>必须出现的台词</label><input class="cf-input" id="cp-dl-line" value="' + esc(d.dlLine) + '" placeholder="原文一字不差"></div>' + '<div class="cf-row"><label>谈判结果</label><input class="cf-input" id="cp-dl-result" value="' + esc(d.dlResult) + '"></div></div>';
  }
  if (type === 'foreshadow') {
    return '<div><div class="cf-row"><label>出处</label><input class="cf-input" id="cp-f-source" value="' + esc(d.fSource) + '" placeholder="第X卷第X章"></div>' + '<div class="cf-row"><label>原始伏笔</label><textarea class="cf-textarea" id="cp-f-detail" placeholder="一字不差">' + esc(d.fDetail) + '</textarea></div>' + '<div class="cf-row"><label>回收方式</label><input class="cf-input" id="cp-f-method" value="' + esc(d.fMethod) + '"></div></div>';
  }
  if (type === 'daily') {
    return '<div><div class="cf-row"><label>日常戏份占比</label><input class="cf-input-sm" id="cp-dy-ratio" value="' + esc(d.dyRatio) + '" placeholder="≤X%"></div>' + '<div class="cf-row"><label>禁止描写</label><div class="cf-chips">' + ['吃饭', '穿衣', '洗漱', '上厕所'].map(function (x) {
      return '<span class="cf-chip">' + x + '</span>';
    }).join('') + '</div></div></div>';
  }
  return '';
}
function getChapterCardData() {
  var d = {};
  d.purpose = val('cp-purpose');
  d.time = val('cp-time');
  d.location = val('cp-location');
  d.weather = val('cp-weather');
  d.light = val('cp-light');
  d.smell = val('cp-smell');
  d.sound = val('cp-sound');
  for (var i = 1; i <= 5; i++) {
    d['node' + i] = val('cp-node' + i);
  }
  // 子类型
  var sub = document.querySelector('.cp-subtab.active');
  d.subType = 'battle';
  if (sub) {
    var idx = Array.from(sub.parentNode.children).indexOf(sub);
    d.subType = ['battle', 'travel', 'dialog', 'foreshadow', 'daily'][idx] || 'battle';
  }
  // 战斗（当前渲染的子类型从DOM读）
  d.sideA = val('cp-b-sideA');
  d.sideB = val('cp-b-sideB');
  d.act1 = val('cp-b-act1');
  d.act2 = val('cp-b-act2');
  d.act3 = val('cp-b-act3');
  d.result = val('cp-b-result');
  // 赶路
  d.from = val('cp-t-from');
  d.to = val('cp-t-to');
  d.dist = val('cp-t-dist');
  d.dur = val('cp-t-dur');
  d.terrain = val('cp-t-terrain');
  // 对话
  d.dlA = val('cp-dl-a');
  d.dlB = val('cp-dl-b');
  d.dlTopic = val('cp-dl-topic');
  d.dlLine = val('cp-dl-line');
  d.dlResult = val('cp-dl-result');
  // 伏笔
  d.fSource = val('cp-f-source');
  d.fDetail = val('cp-f-detail');
  d.fMethod = val('cp-f-method');
  // 日常
  d.dyRatio = val('cp-dy-ratio');
  // 合并其他子类型的缓存数据（非当前子类型不在DOM中，需从缓存恢复）
  var cached = window._chapterSubData || {};
  var subKeys = ['battle', 'travel', 'dialog', 'foreshadow', 'daily'];
  for (var si = 0; si < subKeys.length; si++) {
    var sk = subKeys[si];
    if (sk === d.subType) continue; // 当前类型已从DOM读取
    if (cached[sk]) {
      if (sk === 'battle') {
        d.sideA = cached[sk].sideA || d.sideA;
        d.sideB = cached[sk].sideB || d.sideB;
        d.act1 = cached[sk].act1 || d.act1;
        d.act2 = cached[sk].act2 || d.act2;
        d.act3 = cached[sk].act3 || d.act3;
        d.result = cached[sk].result || d.result;
      } else if (sk === 'travel') {
        d.from = cached[sk].from || d.from;
        d.to = cached[sk].to || d.to;
        d.dist = cached[sk].dist || d.dist;
        d.dur = cached[sk].dur || d.dur;
        d.terrain = cached[sk].terrain || d.terrain;
      } else if (sk === 'dialog') {
        d.dlA = cached[sk].dlA || d.dlA;
        d.dlB = cached[sk].dlB || d.dlB;
        d.dlTopic = cached[sk].dlTopic || d.dlTopic;
        d.dlLine = cached[sk].dlLine || d.dlLine;
        d.dlResult = cached[sk].dlResult || d.dlResult;
      } else if (sk === 'foreshadow') {
        d.fSource = cached[sk].fSource || d.fSource;
        d.fDetail = cached[sk].fDetail || d.fDetail;
        d.fMethod = cached[sk].fMethod || d.fMethod;
      } else if (sk === 'daily') {
        d.dyRatio = cached[sk].dyRatio || d.dyRatio;
      }
    }
  }
  return d;
}
function chapterCardToText(d) {
  if (!d) return '';
  var t = '【章节卡】\n';
  t += '🔒 本章目的：' + (d.purpose || '') + '\n';
  t += '🔒 时间地点：' + (d.time || '') + ' | ' + (d.location || '') + ' | 天气：' + (d.weather || '') + '\n';
  return t;
}

// ===================== 工具函数 =====================
function esc(s) {
  return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';
}
function val(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}
function qv(sel) {
  var el = document.querySelector(sel);
  return el ? el.value : '';
}
function selectChip(el) {
  var parent = el.parentNode;
  parent.querySelectorAll('.cf-chip').forEach(function (c) {
    c.classList.remove('active');
  });
  el.classList.add('active');
}
function valChipText(sel) {
  var el = document.querySelector(sel);
  return el ? el.textContent : '';
}

// 导出
window.renderCardForm = renderCardForm;
window.collectCardData = collectCardData;
window.cardToFreeText = cardToFreeText;
window.renderWorldCard = renderWorldCard;
window.renderCharCards = renderCharCards;
window.renderOutlineCard = renderOutlineCard;
window.renderDetailCard = renderDetailCard;
window.renderChapterCard = renderChapterCard;
window.getWorldCardData = getWorldCardData;
window.getCharCardsData = getCharCardsData;
window.getOutlineCardData = getOutlineCardData;
window.getDetailCardData = getDetailCardData;
window.getChapterCardData = getChapterCardData;
window.addFactionRow = addFactionRow;
window.switchCharCard = switchCharCard;
window.addCharCard = addCharCard;
window.removeCharCard = removeCharCard;
window.switchChapterSubCard = switchChapterSubCard;
window.saveCurrentCharCard = saveCurrentCharCard;
window._collectSubCardData = _collectSubCardData;