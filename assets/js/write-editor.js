/* 文心笔匠 - 写作编辑器模块 */
/* 从 write.html 中提取，包含章节编辑、AI写作、质量检测等全部写作功能 */

var currentChapterIdx = 0;
var ARCH_FIELDS = ['world','chars','outline','detail'];
var ARCH_NAMES = {world:'世界观',chars:'人物人设',outline:'大纲',detail:'细纲'};

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

    html += '<div class="work-card" onclick="selectWriteWork(\'' + w.id + '\')">';
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
  if (!isOpen) menu.classList.add('open');
}
function closeToolbarMenus() {
  document.querySelectorAll('.toolbar-dropdown').forEach(function(m) { m.classList.remove('open'); });
}
// 点击页面其他区域关闭菜单
document.addEventListener('click', function(e) {
  if (!e.target.closest('.toolbar-group')) closeToolbarMenus();
});

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

function getCurrentWork(){ var id=document.getElementById('work-select').value;
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


function initPage(){ var works=DB.works||[]; var selectEl=document.getElementById('work-select');
  if(works.length===0){selectEl.innerHTML='<option>暂无作品</option>';}
  else{
    selectEl.innerHTML=works.map(w=>'<option value="'+w.id+'">'+he(w.title||'未命名')+'</option>').join('');
  }
  // 恢复上次选择的作品
  var lastId=localStorage.getItem('last_edit_work');
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
  var id=document.getElementById('work-select').value;
  localStorage.setItem('last_edit_work',id);
  currentChapterIdx=0;
  clearWorkRuntimeCache();
  loadWork();
}

function loadWork(){ var work=getCurrentWork();
  if(!work)return;
  window._activeWorkId = work.id;
  window._activeWorkFingerprint = getCurrentWorkFingerprint(work);
  document.getElementById('work-title').textContent=work.title||'未命名';
  document.getElementById('ref-world').value=work.world||'';
  document.getElementById('ref-chars').value=work.chars||'';
  document.getElementById('ref-outline').value=work.outline||'';
  document.getElementById('ref-detail').value=work.detail||'';
  updateArchStatus(work);
  ARCH_FIELDS.forEach(function(f) { var stEl=document.getElementById('st-'+f);
    if(work[f]&&work[f].trim()){stEl.textContent='已设置';stEl.className='status done';}
    else{stEl.textContent='未设置';stEl.className='status empty';}
  });
  // 从细纲自动提取章节
  autoFillChapters(work);
  if(work.chapters&&work.chapters.length>0){loadChapter(currentChapterIdx);}
  else{work.chapters=[{title:'第一章',content:''}];DB.saveWork(work);loadChapter(0);}
  renderMemory(work);
}

function updateArchStatus(work){ var statusEl=document.getElementById('arch-status'); var archStatus=work.archStatus||{}; var html='';
  ARCH_FIELDS.forEach(function(f) { var status=archStatus[f]||'locked'; var dotClass=status==='done'?'done':(status==='pending'?'pending':'locked');
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

function loadChapter(idx){ var work=getCurrentWork();
  if(!work||!work.chapters)return;
  currentChapterIdx=idx; var ch=work.chapters[idx];
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
    });
  }
}

function saveChapter(){
  if (_autoSaveTimer) { clearTimeout(_autoSaveTimer); _autoSaveTimer = null; }
  var work=getCurrentWork();if(!validateCurrentWorkBeforeWrite(work))return; var title=document.getElementById('ch-title').value.trim(); var content=document.getElementById('editor').value;
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
  showToast('保存成功，记忆点已更新');
}

// 确认本章：保存 + 提取记忆 + 跳转下一章（需二次确认）
var _confirmPending = false;
function confirmChapter(){ var work0=getCurrentWork();if(!work0){showToast('请先新建或选择作品');return;}
  if (!_confirmPending) {
    _confirmPending = true; var btn = document.getElementById('confirm-btn');
    if (btn) { btn.textContent = '⚠️ 再点一次确认'; btn.style.background = '#f59e0b'; }
    showToast('再点一次确认本章并跳转下一章');
    setTimeout(function() {
      _confirmPending = false;
      if (btn) { btn.innerHTML = '&#9989; 确认本章'; btn.style.background = '#10b981'; }
    }, 3000);
    return;
  }
  _confirmPending = false; var btn = document.getElementById('confirm-btn');
  if (btn) { btn.innerHTML = '&#9989; 确认本章'; btn.style.background = '#10b981'; }
  
  var work=getCurrentWork();if(!validateCurrentWorkBeforeWrite(work))return; var content=document.getElementById('editor').value;
  
  if(!content || content.trim().length < 10){
    showToast('章节内容太少，请先写点内容');
    return;
  }
  
  // 保存
  var title=document.getElementById('ch-title').value.trim();
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
  var nextIdx = currentChapterIdx + 1;
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

function prevChapter(){ var work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
  if(currentChapterIdx>0){saveChapter();loadChapter(currentChapterIdx-1);renderChSidebar();}
  else showToast('已经是第一章');
}

function nextChapter(){ var work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
  saveChapter();
  if(currentChapterIdx<work.chapters.length-1){loadChapter(currentChapterIdx+1);renderChSidebar();}
  else{work.chapters.push({title:'第'+(currentChapterIdx+2)+'章',content:''});DB.saveWork(work);loadChapter(currentChapterIdx+1);renderChSidebar();}
}

// ========== 章节列表 ==========
function openChapterList(){ var work=getCurrentWork();if(!work||!work.chapters){showToast('请先新建或选择作品');return;}
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

function renderChapterList(){ var work=getCurrentWork(); var body=document.getElementById('ch-list-body');
  if(!work||!work.chapters||!body)return; var chs=work.chapters;
  body.innerHTML=chs.map(function(ch,idx){ var isActive=idx===currentChapterIdx; var wordCnt=(ch.content||'').length; var wordDisplay=wordCnt>=1000?(wordCnt/1000).toFixed(1)+'k':wordCnt; var isDone=ch.confirmed||false; var badge=isDone?'<span class="ch-badge done">✓</span>':(wordCnt>0?'<span class="ch-badge draft">草稿</span>':'');
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
function jumpToChapter(idx){ var work=getCurrentWork();if(!work||!work.chapters){showToast('请先新建或选择作品');return;}
  if(idx<0||idx>=work.chapters.length){showToast('章节不存在');return;}
  saveChapter();
  loadChapter(idx);
  renderChapterList();
  closeChapterList();
}
function addNewChapter(){ var work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
  if(!work.chapters)work.chapters=[]; var newIdx=work.chapters.length;
  work.chapters.push({title:'第'+(newIdx+1)+'章',content:''});
  DB.saveWork(work);
  currentChapterIdx=newIdx;
  loadChapter(newIdx);
  closeChapterList();
  renderChSidebar();
  showToast('已添加第'+(newIdx+1)+'章');
}
function deleteCurrentChapter(){ var work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
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

function buildWritePrompt(work,content,cmd){ var prompt = '';

  // ⚠️ 用户提示词放最前面 —— 最高优先级。AI 先看到用户要什么，其他都是辅助信息。
  if (cmd && cmd.trim()) {
    prompt += '【核心指令·最高优先级】\n';
    prompt += cmd.trim() + '\n\n';
    prompt += '---\n';
  }

  prompt += '你是一位网文写作助手。\n\n';
  prompt += getWriteConstraint(getWorkGenre(work), work) + '\n';
  var cb = buildWriteConsistencyBlock(work);
  if (cb) prompt += cb + '\n';
  if(work.world)prompt+='【世界观】'+work.world+'\n';
  if(work.chars)prompt+='【人物人设】'+work.chars+'\n';
  if(work.outline)prompt+='【全书大纲】'+work.outline+'\n';
  if(work.detail)prompt+='【章节细纲】'+work.detail+'\n';
  prompt+='\n【当前内容】\n'+content+'\n\n';
  prompt+='请严格按照上述全套架构设定生成内容，保持风格一致。';
  return prompt;
}

// 兼容函数：获取作品题材（处理旧数据）
function getWorkGenre(work){
  return work.genre || (work.category && work.category.cat1) || '玄幻';
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
  score = Math.max(0, Math.min(100, score));
  return { score: score, issues: issues.slice(0, 10), hits: hits.slice(0, 10), checkedAt: Date.now(), chapterIdx: chapterIdx };
}


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
  if (work.world) {
    lock += '1. 世界观锁：力量体系、地理、势力、时代规则、等级稀缺度、能力代价必须以【世界观设定】为准；不得新增与世界观冲突的体系；角色使用能力必须承受设定中的代价。\n';
    has = true;
  }
  if (work.chars) {
    var names = [];
    try { names = extractCharNameMap(work.chars).names || []; } catch(e) {}
    if (names.length) {
      lock += '2. 人设锁：优先使用已有人物：' + names.slice(0, 20).join('、') + '。新增人物必须是配角，并自然补入记忆。每个角色的说话风格、能力边界、视觉标签必须与人设一致。\n';
      has = true;
    }
  }
  if (work.outline) {
    lock += '3. 大纲锁：本章只能推进当前卷主线，不得提前写后续卷高潮，不得跳过大纲阶段目标。每章必须推进主线目标至少一步。\n';
    has = true;
  }
  if (detailLine) {
    lock += '4. 细纲锁：本章必须完成以下细纲：' + detailLine.slice(0, 900) + '\n';
    ['章目标','冲突','剧情节点','爽点爆点','伏笔','关系变化','记忆承接','章尾钩子'].forEach(function(k){
      var v = parseDetailField(detailLine, k);
      if (v) lock += '   - ' + k + '：' + v.slice(0, 120) + '\n';
    });
    has = true;
  }
  if (work._chapterCards && work._chapterCards['ch_' + chapterIdx] && typeof chapterCardToText === 'function') {
    var card = chapterCardToText(work._chapterCards['ch_' + chapterIdx]);
    if (card) {
      lock += '5. 章节卡锁：' + card.slice(0, 700) + '\n';
      has = true;
    }
  }
  if (work.longMemory) {
    lock += '6. 长记忆锁：人物伤势、道具归属、关系变化、伏笔债务、能力代价、情绪轨迹必须承接，不能重置或遗忘。\n';
    has = true;
  }
  lock += '7. 写作后自检：正文必须能回答"承接了什么、推进了什么、回收/埋下了什么、章尾钩子是什么"。\n';
  lock += '8. 跨模块一致性：\n';
  lock += '   - 正文中的势力名称/地理名称/境界名称必须与世界观设定完全一致\n';
  lock += '   - 正文中的角色行为/说话风格/能力表现必须与人设完全一致\n';
  lock += '   - 正文的剧情推进必须与大纲当前卷目标一致\n';
  lock += '   - 正文的章节内容必须与细纲的章目标/冲突/节点完全对应\n';
  lock += '   - 如果发现设定之间有矛盾，以世界观 > 人设 > 大纲 > 细纲的优先级解决\n\n';
  return has ? lock : '';
}

function checkFullChainConsistency(work, chapterIdx, content) {
  var issues = [], hits = [], score = 100;
  content = content || '';
  var detailLine = getDetailLineForChapter(work, chapterIdx);
  var fields = ['章目标','冲突','剧情节点','爽点爆点','伏笔','关系变化','记忆承接','章尾钩子'];
  if (detailLine) {
    fields.forEach(function(f){
      var v = parseDetailField(detailLine, f);
      if (!v) return;
      var tokens = _chainTokens(v, 6);
      var ok = tokens.length === 0 || tokens.some(function(t){ return content.indexOf(t) >= 0; });
      if (ok) hits.push(f); else { issues.push('细纲字段未明显落实：' + f); score -= 7; }
    });
  } else {
    issues.push('未找到本章细纲映射');
    score -= 10;
  }
  if (work && work.chars) {
    var names = [];
    try { names = extractCharNameMap(work.chars).names || []; } catch(e) {}
    var appeared = names.filter(function(n){ return n && content.indexOf(n) >= 0; });
    if (names.length && appeared.length === 0) { issues.push('本章未出现任何已登记人物'); score -= 18; }
    else if (appeared.length) hits.push('人物承接');
    var outNames = (content.match(/[\u4e00-\u9fa5]{2,4}(?:冷笑|怒吼|低声|转身|抬手|皱眉|说道|问道|喝道)/g) || [])
      .map(function(x){ return x.replace(/(冷笑|怒吼|低声|转身|抬手|皱眉|说道|问道|喝道)$/,''); })
      .filter(function(n){ return n.length >= 2 && names.indexOf(n) < 0 && !/(他们|众人|男人|女人|少年|少女|老人)/.test(n); });
    if (outNames.length > 4) { issues.push('疑似新增人物较多：' + outNames.slice(0,4).join('、')); score -= 8; }
  }
  // 跨模块一致性检查：世界观名称一致性
  if (work && work.world) {
    var worldText = work.world;
    // 检查境界/等级是否被违反（如果世界观设定了等级体系）
    var levelMatch = worldText.match(/(?:境界|等级)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (levelMatch) {
      var levels = levelMatch[1].match(/[\u4e00-\u9fa5]{2,6}(?:期|境|阶|层|级|段|重)/g);
      if (levels && levels.length > 0) {
        hits.push('世界观等级体系');
      }
    }
  }
  // 检查大纲主线推进
  if (work && work.outline) {
    var mainGoal = work.outline.match(/(?:主线|核心目标)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (mainGoal) {
      var goalTokens = _chainTokens(mainGoal[1], 4);
      if (goalTokens.length && goalTokens.some(function(t){ return content.indexOf(t) >= 0; })) {
        hits.push('主线推进');
      }
    }
  }
  var genre = getWorkGenre(work);
  if (genre.indexOf('历史') >= 0) {
    ['空间戒指','储物袋','系统面板','修仙者','炼丹','灵气'].forEach(function(w){
      if (content.indexOf(w) >= 0) { issues.push('历史题材违禁元素：' + w); score -= 25; }
    });
  }
  if (work && work._chapterCards && work._chapterCards['ch_' + chapterIdx]) {
    var c = work._chapterCards['ch_' + chapterIdx];
    ['purpose','node1','node2','node3','node4','node5'].forEach(function(k){
      if (!c[k]) return;
      var toks = _chainTokens(c[k], 4);
      if (toks.length && toks.some(function(t){return content.indexOf(t)>=0;})) hits.push('章节卡' + k);
    });
  }
  score = Math.max(0, Math.min(100, score));
  return { score: score, issues: issues.slice(0, 12), hits: hits.slice(0, 12), checkedAt: Date.now(), chapterIdx: chapterIdx };
}

function backfeedChainMemory(work, chapterIdx, content, report) {
  if (!work || !content) return;
  initLongMemory(work);
  var lm = work.longMemory;
  if (!Array.isArray(lm.chainConsistency)) lm.chainConsistency = [];
  lm.chainConsistency.push(report);
  lm.chainConsistency = lm.chainConsistency.slice(-80);
  if (!lm.memoryAnchors) lm.memoryAnchors = {core:[],characterTags:[],relationships:[],items:[],locations:[],promises:[],timeline:[],hooks:[]};
  var relLines = content.split(/[。！？\n]+/).filter(function(s){ return /(结盟|背叛|救了|亏欠|喜欢|怀疑|信任|决裂|保护|敌对|归顺)/.test(s); }).slice(0, 5);
  relLines.forEach(function(s){
    lm.memoryAnchors.relationships.push({text:s.slice(0,90), chapterIdx:chapterIdx, status:'有效', source:'正文反哺', updatedAt:Date.now()});
  });
  var itemLines = content.split(/[。！？\n]+/).filter(function(s){ return /(得到|拿到|夺走|交给|归还|丢失|藏起).{0,18}(剑|刀|信|令牌|玉佩|钥匙|账册|地图|兵符|密信|戒指|药|丹)/.test(s); }).slice(0, 5);
  itemLines.forEach(function(s){
    lm.memoryAnchors.items.push({text:s.slice(0,90), chapterIdx:chapterIdx, status:'有效', source:'正文反哺', updatedAt:Date.now()});
  });
  ['relationships','items'].forEach(function(k){
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

function buildWriteConsistencyBlock(work) {
  var block = '【📋 全链路一致性锁 — 严禁违反以下设定！】\n';
  var hasAny = false;

  // 提取势力、地区、关键名称
  if (work.world) {
    var worldText = work.world;
    var names = [];
    // 势力
    var fm = worldText.match(/势力[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (fm) names.push('势力：' + fm[1].trim().substring(0, 150));
    // 地区/地理
    var rm = worldText.match(/(?:地理|地区|地域|场景)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (rm) names.push('地区：' + rm[1].trim().substring(0, 150));
    // 境界/等级
    var lm = worldText.match(/(?:境界|等级|力量体系|修炼体系)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (lm) names.push('等级：' + lm[1].trim().substring(0, 150));
    // 核心矛盾
    var cm = worldText.match(/(?:核心矛盾|世界矛盾|主要冲突)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (cm) names.push('核心矛盾：' + cm[1].trim().substring(0, 120));
    // 世界运转规则
    var wr = worldText.match(/(?:运转|规则|禁忌|代价)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (wr) names.push('世界规则：' + wr[1].trim().substring(0, 120));

    if (names.length > 0) {
      block += '【世界观关键元素 — 正文必须遵守】\n';
      names.forEach(function(n) { block += '  · ' + n + '\n'; });
      hasAny = true;
    }
  }

  // 提取角色名列表 + 关键属性
  if (work.chars) {
    var charLines = work.chars.split('\n');
    var charNames = [];
    var charDetails = [];
    for (var ci = 0; ci < charLines.length; ci++) {
      var cl = charLines[ci].trim();
      var cm = cl.match(/^[>\s]*[【\[<]?(.+?)[】\]>]?\s*[：(（]\s*(.+?)\s*[)）]/);
      if (cm) {
        charNames.push(cm[1].trim() + '（' + cm[2].trim().substring(0, 20) + '）');
        // 提取角色的能力/境界/身份
        var next3 = charLines.slice(ci+1, ci+4).join(' ');
        var abilityMatch = next3.match(/(?:能力|境界|实力|修为|功法|身份)[：:]\s*(.{2,30})/);
        if (abilityMatch) {
          charDetails.push(cm[1].trim() + '：' + abilityMatch[1].trim().substring(0, 30));
        }
      }
    }
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
  }

  // 提取大纲中的卷标题 + 当前卷主线
  if (work.outline) {
    var volMatches = work.outline.match(/第[一二三四五六七八九十\d]+卷[：:]?[《「](.+?)[》」]/g);
    if (volMatches && volMatches.length > 0) {
      block += '【大纲卷名 — 正文必须在当前卷范围内】\n';
      volMatches.slice(0, 10).forEach(function(vm) { block += '  · ' + vm + '\n'; });
      hasAny = true;
    }
    // 提取主线目标
    var mainGoal = work.outline.match(/(?:主线|核心目标|最终目标)[：:]([\s\S]*?)(?=\n[^\s]|\n\n|$)/);
    if (mainGoal) {
      block += '【主线目标 — 每章必须推进】\n  · ' + mainGoal[1].trim().substring(0, 120) + '\n';
      hasAny = true;
    }
  }

  if (!hasAny) return '';
  block += '【强制规则】\n';
  block += '1. 上述名称已在设定中定稿，严禁编造新名字替代\n';
  block += '2. 角色的能力/境界/身份必须与设定一致，不能突然变强或变弱\n';
  block += '3. 世界观规则（力量体系、等级、禁忌、代价）必须遵守\n';
  block += '4. 每章必须推进主线目标，不能原地踏步\n';
  return block;
}

// 构建章节写作prompt
function buildChapterPrompt(work, chapterIdx, existingContent, userCommand) { var chTitle = work.chapters ? (work.chapters[chapterIdx] || {}).title || ('第' + (chapterIdx + 1) + '章') : ('第' + (chapterIdx + 1) + '章'); var genre = getWorkGenre(work);
  
  // 获取流派专属 expertise
  var genreVal = (work.settings && work.settings.genre) || ''; var genreInfo = (typeof NOVEL_GENRES !== 'undefined') ? NOVEL_GENRES[genreVal] : null; var expertisePrompt = genreInfo ? genreInfo.expertise : '';
  
  // 获取前两章内容作为上文衔接（智能截断至~3000字，对齐段落边界）
  var prevContent = '';
  if (work.chapters && chapterIdx > 0) {
    // 主窗口：上一章尾部（~2500字）
    prevContent = (work.chapters[chapterIdx - 1] || {}).content || '';
    if (prevContent.length > 2800) {
      var tailStart = prevContent.length - 2800;
      var best = tailStart;
      // 优先找段落边界（双换行）
      for (var scan = tailStart; scan < tailStart + 350 && scan < prevContent.length; scan++) {
        if (prevContent.substring(scan, scan + 2) === '\n\n') { best = scan + 2; break; }
      }
      if (best === tailStart) {
        // 退而求其次找单换行
        for (var scan2 = tailStart; scan2 < tailStart + 350 && scan2 < prevContent.length; scan2++) {
          if (prevContent[scan2] === '\n') { best = scan2 + 1; break; }
        }
      }
      prevContent = prevContent.substring(best);
    }
    // 附加：上两章简要（从长记忆中提取，帮助理解节奏）
    if (chapterIdx > 1 && work.chapters[chapterIdx - 2]) {
      var prev2 = work.chapters[chapterIdx - 2];
      var prev2Title = prev2.title || ('第' + chapterIdx + '章');
      var prev2Summary = prev2.summary || '';
      if (!prev2Summary && prev2.content && prev2.content.length > 30) {
        prev2Summary = (prev2.content || '').replace(/\n/g, ' ').substring(0, 120) + '...';
      }
      if (prev2Summary) {
        prevContent = '【上两章·' + prev2Title + '摘要】' + prev2Summary + '\n\n【上一章结尾】\n' + prevContent;
      }
    }
  }
  
  var prompt = '';

  // ⚠️ 用户提示词放最前面 —— 最高优先级。AI 先看到用户要什么，其他都是辅助信息。
  if (userCommand && userCommand.trim()) {
    prompt += '【核心指令·最高优先级】\n';
    prompt += userCommand.trim() + '\n\n';
    prompt += '---\n';
  }

  prompt += '你是一位顶级网文写手，拥有十年网文创作经验，深谙读者心理和商业写作技巧。你的文字让读者欲罢不能，每章结尾都让读者忍不住点"下一章"。\n\n';
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
  
  // === v29: 注入上一章质量短板，本章针对性补强 ===
  if (typeof QualityEngine !== 'undefined' && QualityEngine.lastHints) {
    var qHints = QualityEngine.lastHints(work, chapterIdx);
    if (qHints && qHints.length) {
      prompt += '【上一章质量短板·本章必须补强】\n';
      for (var qi = 0; qi < qHints.length; qi++) {
        prompt += (qi + 1) + '. ' + qHints[qi] + '\n';
      }
      prompt += '\n';
    }
  }

  // === 题材硬约束（防跑题） ===
  prompt += getWriteConstraint(genre, work) + '\n';
  prompt += buildGenreWritingEngineV45(genre, work) + '\n';
  
  // === v46 创新维度引导（反套路、叙事多样性） ===
  var ALL_DIMS = [
    {k:'A', t:'叙事视角翻新', d:'从一个非主角视角切入本章开头，如旁观者、对手、物品。给读者一个意想不到的观察角度，但不超过300字就切回主线。'},
    {k:'B', t:'反预期结果', d:'当前场景的观众预期是A结果，但实际发生的是B。B必须比A更合理、更有趣，而不是为了反转而反转。'},
    {k:'C', t:'信息不对等', d:'本章中至少一个场景里，读者比主角知道得多或知道得少。让读者紧张于主角即将踩到的陷阱，或困惑于主角为何做出看似错误的决定。'},
    {k:'D', t:'对话潜文本', d:'一场对话中，角色嘴上说A，实际意思是B。B不要通过内心独白解释，而是通过微妙动作或不自然的停顿来暗示。'},
    {k:'E', t:'环境即角色', d:'选取一个具体环境元素（天气、建筑、物品），让它在场景中产生实质影响——不是背景描写，而是改变角色行为或情节走向的变量。'},
    {k:'F', t:'节奏突变', d:'在连续几章的舒缓/紧张节奏后，本章做一次有准备的节奏转换。不是突兀反转，而是通过之前埋下的伏笔自然触发。'},
    {k:'G', t:'陌生化日常', d:'将原本熟悉的场景用陌生的方式呈现。比如一场日常对话通过非常规的方式展开（边跑边说、在黑暗中只闻其声、通过第三方转述）。'},
    {k:'H', t:'留白与信任', d:'本章至少有一处，不把角色的心理活动写出来。相信读者能通过角色的行为和之前的铺垫自行理解。'}
  ];
  // 随机选3个，基于章节号做伪随机（同一章每次选的一样）
  var seed = chapterIdx || 0;
  var picked = [];
  var shuffled = ALL_DIMS.slice();
  for (var si = shuffled.length - 1; si > 0; si--) {
    var sj = (seed * 7 + si * 13) % (si + 1);
    var tmp = shuffled[si]; shuffled[si] = shuffled[sj]; shuffled[sj] = tmp;
  }
  picked = shuffled.slice(0, 3);
  
  prompt += '【创新维度指引 — 避免套路化】\n';
  prompt += '本章从以下 3 个维度中选取适合的 1-2 个进行创新发挥：\n\n';
  for (var di = 0; di < picked.length; di++) {
    prompt += picked[di].k + '. **' + picked[di].t + '**：' + picked[di].d + '\n\n';
  }
  prompt += '【重要】以上是"可选菜单"而非"必须完成的任务"。挑适合本章剧情的用，其余忽略。不要为了用技巧而扭曲叙事。\n\n';
  
  // === 前置设定一致性（强制引用已有名称） ===
  var consBlock = buildWriteConsistencyBlock(work);
  if (consBlock) prompt += consBlock + '\n';
  var chainLock = buildFullChainLock(work, chapterIdx);
  if (chainLock) prompt += chainLock + '\n';
  
  if (work.world) { var worldText = work.world.length > 3000 ? work.world.substring(0, 3000) + '...(完整世界观请参考)' : work.world;
    prompt += '【世界观设定】\n' + worldText + '\n\n';
  }
  if (work.chars) { var charsText = work.chars.length > 2500 ? work.chars.substring(0, 2500) + '...(完整人设请参考)' : work.chars;
    prompt += '【人物人设】\n' + charsText + '\n\n';
  }
  
  // 传细纲，截断防止token爆炸 + 按章节标题精准匹配
  if (work.detail) {
    var detailText = work.detail;
    if (detailText.length > 5000) {
      // 尝试找到当前章节附近的细纲
      var idxInDetail = detailText.indexOf(chTitle);
      if (idxInDetail >= 0) {
        var start = Math.max(0, idxInDetail - 800);
        var end = Math.min(detailText.length, idxInDetail + 3500);
        detailText = '...(前略)\n' + detailText.substring(start, end) + '\n(后略)...';
      } else {
        detailText = detailText.substring(0, 4000) + '...(细纲过长已截断)';
      }
    }
    prompt += '【全书细纲】\n' + detailText + '\n\n';
    prompt += '【核心指令·最高优先级】\n';
    prompt += '你当前要写的章节是：「' + chTitle + '」（第' + (chapterIdx + 1) + '章）。\n';
    prompt += '1. 从全书细纲中找到「' + chTitle + '」对应的部分，严格按照该部分剧情来写\n';
    prompt += '2. 绝对不要写其他章节的剧情\n';
    prompt += '3. 如果细纲中没有「' + chTitle + '」的明确标注，就写第' + (chapterIdx + 1) + '段剧情\n';
    prompt += '4. 字数控制在2000-3000字\n\n';
  }
  
  // 注入longMemory上下文（替代旧的 getMemoryText）
  var memoryContext = buildMemoryContext(work, chapterIdx);
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
    prompt += '【上一章结尾】\n' + prevContent + '\n\n';
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
    prompt += '【指令】请基于细纲中「' + chTitle + '」的剧情要点，续写并完善本章内容，与已有内容自然衔接。字数2000-3000字。\n';
  } else {
    prompt += '【指令】请根据细纲中「' + chTitle + '」的剧情要点，撰写完整章节内容，字数2000-3000字。';
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
  prompt += '   - "只见/但见/却见"做叙事引导词\n\n';
  prompt += '3. **对话自然化**：用动作代替"XX说/道"（最多占对话50%），融入口癖、打断、沉默节奏。每个人说话节奏不同，不要所有人句子一样长。对话要有潜台词——角色嘴上说A，行为暗示B。对话中允许：省略回答、答非所问、用动作代替回应、被打断。\n\n';
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
  
  // === v46 智能压缩：整体token估计，超长时裁剪低优先级内容 ===
  var totalLen = prompt.length;
  // 中文1字≈1.5token，16K输出模型通常有64K+上下文
  // 输入prompt安全上限：约20000字（~30000 token），留足输出空间
  var PROMPT_CHAR_LIMIT = 20000;
  var PROMPT_SOFT_LIMIT = 14000; // 超过此值开始压缩低优先级内容

  if (totalLen > PROMPT_SOFT_LIMIT) {
    // 优先级从低到高：世界设定 → 人物人设 → 记忆 → 链锁 → 核心指令（永远保留）
    var ratio = PROMPT_SOFT_LIMIT / totalLen;

    if (work.world && work.world.length > 800 && ratio < 0.9) {
      var maxWorld = Math.max(400, Math.floor(800 * ratio));
      var worldText = work.world.length > maxWorld ? work.world.substring(0, maxWorld) + '...(完整世界观请参考)' : work.world;
      prompt = prompt.replace(/【世界观设定】\n.*?\n\n/, '【世界观设定】\n' + worldText + '\n\n');
    }
    if (work.chars && work.chars.length > 600 && ratio < 0.85) {
      var maxChars = Math.max(300, Math.floor(600 * ratio));
      var charsText = work.chars.length > maxChars ? work.chars.substring(0, maxChars) + '...(完整人设请参考)' : work.chars;
      prompt = prompt.replace(/【人物人设】\n.*?\n\n/, '【人物人设】\n' + charsText + '\n\n');
    }
    // 二次检查：如果仍然超限，进一步压缩记忆和上文
    if (prompt.length > PROMPT_CHAR_LIMIT) {
      // 压缩上一章结尾到更短
      prompt = prompt.replace(/【上一章结尾】\n([\s\S]*?)\n\n/, function(m, p1) {
        var shortPrev = p1.length > 600 ? p1.substring(p1.length - 600) : p1;
        return '【上一章结尾】\n' + shortPrev + '\n\n';
      });
    }
  }
  
  return prompt;
}

// ========== 记忆系统 ==========

// 记忆分类及优先级（数字越小越重要）
var MEMORY_TYPES = {
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
  if (!content || content.trim().length < 50) return; var chTitle = work.chapters[chapterIdx] ? work.chapters[chapterIdx].title : ('第' + (chapterIdx + 1) + '章'); var genre = getWorkGenre(work);
  
  // 传入已有记忆作为上下文
  var existingMemory = getMemoryText(work, chapterIdx);
  
  // 构建增强版提取prompt
  var prompt = '你是一位专业的小说编辑助理。请从以下章节中提取关键记忆点，这些记忆将用于后续章节写作时保持故事连贯性。\n\n';
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
  
  try { var config = DB.getApiConfig(); var keys = DB.getApiKeys(config.provider);
    
    if (keys && keys.length > 0) { var result = await callRealAPIWithFallback(prompt, null, 'memory');
      if (result) {
        // 解析记忆条目
        var lines = result.split('\n').filter(l => l.trim().length > 3 && /[：:]/.test(l)); var memories = lines.map(function(l) { var sepIdx = l.indexOf('：') !== -1 ? l.indexOf('：') : l.indexOf(':'); var rawType = l.substring(0, sepIdx).trim().replace(/^[\d.]+\s*/, ''); var content = l.substring(sepIdx + 1).trim();
          // 标准化类别名
          var type = normalizeMemoryType(rawType); var typeInfo = MEMORY_TYPES[type] || MEMORY_TYPES['关键事件'];
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
function normalizeMemoryType(raw) { var map = {
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
  for ( var [standard, aliases] of Object.entries(map)) {
    if (aliases.some(a => raw.includes(a))) return standard;
  }
  return '关键事件';
}

// 本地简单提取（无API时的备用）
function localExtractMemory(work, chapterIdx, content) { var chTitle = work.chapters[chapterIdx] ? work.chapters[chapterIdx].title : ('第' + (chapterIdx + 1) + '章'); var memories = [];
  
  // 提取对话中的角色名
  var speakerPattern = /([^\s""''「」]{2,4})(?:说|道|喊|叫|喝|问|答)/g; var speakers = new Set(); var m;
  while ((m = speakerPattern.exec(content)) !== null) {
    speakers.add(m[1]);
  }
  if (speakers.size > 0) {
    memories.push({ chapter: chTitle, chapterIdx, type: '新角色', content: Array.from(speakers).join('、'), priority: 2, icon: '🆕', time: new Date().toISOString() });
  }
  
  // 提取地点关键词
  var placePattern = /(?:来到|到达|离开|前往|回到|进入|走出)([^\n，。]{2,6})/g; var places = new Set();
  while ((m = placePattern.exec(content)) !== null) {
    places.add(m[1]);
  }
  if (places.size > 0) {
    memories.push({ chapter: chTitle, chapterIdx, type: '地点转移', content: '涉及地点：' + Array.from(places).join('、'), priority: 3, icon: '📍', time: new Date().toISOString() });
  }
  
  // 章节摘要
  var summary = content.substring(0, 80).replace(/\n/g, '') + '...';
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
function renderMemory(work) { var listEl = document.getElementById('memory-list');
  if (!listEl) return; var memories = work ? (work.memory || []) : []; var countEl = document.getElementById('st-memory');
  
  // 统计longMemory信息
  var lm = work ? work.longMemory : null; var anchorCount = (lm && lm.memoryAnchors) ? Object.values(lm.memoryAnchors).reduce(function(n, arr){ return n + (Array.isArray(arr) ? arr.length : 0); }, 0) : 0; var lmCount = lm ? (lm.charStates.length + lm.plotThreads.length + lm.foreshadows.length + lm.charArcs.length + anchorCount) : 0; var totalMemCount = memories.length + lmCount;
  if (countEl) countEl.textContent = totalMemCount + '条'; var html = '';
  
  // v45：显示商业正文评分
  if (lm && lm.commercialReports && lm.commercialReports.length) { var br = lm.commercialReports[lm.commercialReports.length - 1]; var bcolor = br.score >= 85 ? '#16a34a' : (br.score >= 70 ? '#f59e0b' : '#ef4444');
    html += '<div style="font-weight:700;color:#111827;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">🔥 商业正文强度</div>';
    html += '<div style="font-size:12px;color:' + bcolor + ';font-weight:700;">最近检查：' + br.score + '/100</div>';
    if (br.issues && br.issues.length) html += '<div style="font-size:12px;color:#6b7280;line-height:1.45;">' + br.issues.slice(0,3).map(function(x){return he(x);}).join('<br>') + '</div>';
  }

  // v39：显示全链路一致性
  if (lm && lm.chainConsistency && lm.chainConsistency.length) { var cr = lm.chainConsistency[lm.chainConsistency.length - 1]; var color = cr.score >= 85 ? '#16a34a' : (cr.score >= 70 ? '#f59e0b' : '#ef4444');
    html += '<div style="font-weight:700;color:#111827;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">🔗 全链路一致性</div>';
    html += '<div style="font-size:12px;color:' + color + ';font-weight:700;">最近检查：' + cr.score + '/100</div>';
    if (cr.issues && cr.issues.length) {
      html += '<div style="font-size:12px;color:#6b7280;line-height:1.45;">' + cr.issues.slice(0,3).map(function(x){return he(x);}).join('<br>') + '</div>';
    }
  }

  // v30：显示超长篇记忆账本
  if (lm && (lm.volumeMemories || lm.characterProfiles || lm.foreshadowLedger)) { var volCount = (lm.volumeMemories || []).length; var profileCount = lm.characterProfiles ? Object.keys(lm.characterProfiles).length : 0; var ledgerCount = (lm.foreshadowLedger || []).length; var itemCount = lm.itemLedger ? Object.keys(lm.itemLedger).length : 0; var factionCount = lm.factionGraph ? Object.keys(lm.factionGraph).length : 0; var timeCount = (lm.timelineEvents || []).length;
    html += '<div style="font-weight:700;color:#111827;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">🧠 超长篇记忆库</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;color:#374151;margin-top:4px;">';
    html += '<div>分卷记忆：' + volCount + '卷</div><div>人物档案：' + profileCount + '人</div>';
    html += '<div>伏笔总表：' + ledgerCount + '条</div><div>道具总表：' + itemCount + '件</div>';
    html += '<div>势力关系：' + factionCount + '个</div><div>时间轴：' + timeCount + '条</div>';
    html += '</div>'; var high = (lm.foreshadowLedger || []).filter(function(x){return x.priority === '高' && x.status !== '已解' && x.status !== '已兑现';}).slice(0, 4);
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
  if (lm && lm.characterHistory) { var names = Object.keys(lm.characterHistory).slice(0, 5);
    if (names.length) {
      html += '<div style="font-weight:700;color:#111827;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">👣 人物长期轨迹</div>';
      names.forEach(function(name){ var arr = (lm.characterHistory[name] || []).slice(-3);
        if (!arr.length) return;
        html += '<div style="font-size:12px;color:#374151;padding:2px 0;"><strong>' + he(name) + '</strong>：' + arr.map(function(x){ return '第' + ((x.chapterIdx||0)+1) + '章[' + he(x.status||'正常') + ']'; }).join(' → ') + '</div>';
      });
    }
  }

  // 先显示核心记忆点
  if (lm && lm.memoryAnchors) { var anchorNames = {
      core:'核心事实', characterTags:'角色标志', relationships:'关系变化', items:'道具归属',
      locations:'地点状态', promises:'承诺禁忌', timeline:'时间线', hooks:'爽点钩子'
    };
    html += '<div style="font-weight:700;color:#111827;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">⭐ 核心记忆点 <span style="font-weight:normal;font-size:11px;color:#999;">(' + anchorCount + '条)</span></div>';
    Object.keys(anchorNames).forEach(function(k){ var arr = (lm.memoryAnchors[k] || []).slice(0, 4);
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
      lm.charStates.forEach(function(cs) {
        html += '<div style="padding:2px 0;display:flex;align-items:flex-start;gap:4px;">';
        html += '<span style="color:#ef4444;flex-shrink:0;">👤</span>';
        html += '<span style="color:#333;flex:1;"><strong>' + he(cs.name) + '</strong>：' + he(cs.status);
        if (cs.location && cs.location !== '未知') html += ' @' + he(cs.location);
        if (cs.emotion) html += ' [' + he(cs.emotion) + ']';
        html += '</span></div>';
      });
    }
    if (lm.plotThreads && lm.plotThreads.length > 0) { var pending = lm.plotThreads.filter(t => t.status === '待解');
      if (pending.length > 0) {
        html += '<div style="font-weight:600;color:#333;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">待解线索 <span style="font-weight:normal;font-size:11px;color:#999;">(' + pending.length + '条)</span></div>';
        pending.slice(0, 5).forEach(function(t) {
          html += '<div style="padding:2px 0;display:flex;align-items:flex-start;gap:4px;">';
          html += '<span style="color:#8b5cf6;flex-shrink:0;">🔮</span>';
          html += '<span style="color:#333;flex:1;font-size:12px;">' + he(t.title.slice(0, 40)) + '</span></div>';
        });
      }
    }
    if (lm.foreshadows && lm.foreshadows.some(f => f.status === '未解')) { var unresolved = lm.foreshadows.filter(f => f.status === '未解').slice(-3);
      html += '<div style="font-weight:600;color:#333;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">未解伏笔 <span style="font-weight:normal;font-size:11px;color:#999;">(' + unresolved.length + '条)</span></div>';
      unresolved.forEach(function(f) {
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
  if (memories.length > 0) { var grouped = {};
    memories.slice().reverse().forEach(function(m) {
      if (!grouped[m.chapter]) grouped[m.chapter] = [];
      grouped[m.chapter].push(m);
    });
    
    for ( var [ch, items] of Object.entries(grouped)) {
      html += '<div style="font-weight:600;color:#333;margin-top:8px;border-top:1px solid #eee;padding-top:6px;">' + ch + ' <span style="font-weight:normal;font-size:11px;color:#999;">(' + items.length + '条)</span></div>';
      items.forEach(function(m, idx) { var typeInfo = MEMORY_TYPES[m.type] || { icon: '📌', color: '#666' }; var icon = m.icon || typeInfo.icon; var color = typeInfo.color;
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
  Object.keys(MEMORY_TYPES).forEach(function(t) {
    html += '<option value="' + t + '">' + (MEMORY_TYPES[t].icon || '') + ' ' + t + '</option>';
  });
  html += '</select>';
  html += '<button onclick="addManualMemory()" style="padding:6px 10px;background:#6366f1;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;">+</button>';
  html += '</div></div>';
  
  listEl.innerHTML = html;
}

// 手动添加记忆
function addManualMemory() { var work = getCurrentWork();
  if (!work) return; var input = document.getElementById('manual-memory-input'); var typeSelect = document.getElementById('manual-memory-type'); var content = input.value.trim();
  if (!content) { showToast('请输入记忆内容'); return; }
  
  var type = typeSelect.value; var chapterIdx = currentChapterIdx || 0; var chTitle = work.chapters[chapterIdx] ? work.chapters[chapterIdx].title : ('第' + (chapterIdx + 1) + '章'); var typeInfo = MEMORY_TYPES[type] || MEMORY_TYPES['关键事件'];
  
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
function deleteMemory(chapter, idxInGroup) { var work = getCurrentWork();
  if (!work || !work.memory) return;
  
  // 找到该章节的所有记忆
  var chapterMemories = work.memory.filter(m => m.chapter === chapter);
  if (idxInGroup < 0 || idxInGroup >= chapterMemories.length) return; var targetMemory = chapterMemories[idxInGroup];
  // 从全局memory中删除
  var globalIdx = work.memory.indexOf(targetMemory);
  if (globalIdx >= 0) {
    work.memory.splice(globalIdx, 1);
    DB.saveWork(work);
    renderMemory(work);
    showToast('记忆已删除');
  }
}

// 刷新记忆显示
function refreshMemory() { var work = getCurrentWork();
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
      locations:'地点状态', promises:'承诺禁忌', timeline:'时间线', hooks:'爽点钩子'
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
  
  // 控制总长度，超过12000字截断
  if (text.length > 12000) {
    text = text.substring(0, 12000) + '\n...(记忆过长，已截断)';
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
    (br.issues || []).join(' ').replace(/开篇|冲突/.test('') ? '' : '');
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
  var result = await callRealAPIWithFallback(prompt, null, 'fill');
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
  return new Promise(function(resolve){ setTimeout(resolve, ms || 500); });
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
  var input = prompt('输入流水线章节范围，例如：1-10\n最多一次建议 50 章。', (currentChapterIdx + 1) + '-' + Math.min(currentChapterIdx + 5, Math.max(totalExisting, currentChapterIdx + 5)));
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
      await pipelineSleep(350);
      pipelineStatus('🏭 流水线写作中：第 ' + n + ' / ' + end + ' 章');
      var before = (ch.content || '').length;
      try {
        await aiWriteChapter();
      } catch(e) {
        console.error('[pipeline aiWriteChapter]', e);
        pipelineStatus('⚠️ 第' + n + '章生成异常，流水线已暂停：' + (e && e.message ? e.message : e), false);
        break;
      }
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
      await pipelineSleep(900);
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

async function aiWriteChapter(){ var work=getCurrentWork();if(!work){showToast('请先新建或选择作品');return;}
  var content=document.getElementById('editor').value; var chapterIdx = currentChapterIdx || 0;
  
  // 显示API状态
  var statusBar = document.getElementById('api-status-bar'); var config = DB.getApiConfig();
  
  // 构建章节prompt（已含流派expertise和longMemory上下文）
  var prompt = buildChapterPrompt(work, chapterIdx, content);

  // 显示输入token估算
  var estTokens = Math.round(prompt.length * 1.5);
  var estTokensDisplay = estTokens >= 1000 ? (estTokens / 1000).toFixed(1) + 'k' : estTokens;
  statusBar.style.display = 'block';
  statusBar.style.background = '#dbeafe';
  statusBar.style.color = '#1e40af';
  statusBar.textContent = '🤖 正在生成「' + (work.chapters[chapterIdx]?.title || '第'+(chapterIdx+1)+'章') + '」... 输入约' + estTokensDisplay + ' tokens';
  
  // 备份旧内容
  var oldContent = content;
  
  // 先尝试API（自动遍历所有服务商），失败则使用本地AI
  // v46：多AI模式时使用 callMultiAI 并行请求
  var aiCaller = (window.callMultiAI && DB.settings && DB.settings.multiAI) ? window.callMultiAI : window.callRealAPIWithFallback; var result = await aiCaller(prompt, null, 'write_normal');
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
      statusBar.style.background = '#fef3c7';
      statusBar.style.color = '#92400e';
      statusBar.textContent = '⚠️ ' + validationError + ' — 已保留旧内容，可点撤销恢复';
      showToast('⚠️ ' + validationError, 5000);
      // 不覆盖编辑器，保留旧内容
      return;
    }
    
    // === v29: 质量打分 ===
    var _qReport = null;
    try {
      if (typeof QualityEngine !== 'undefined') {
        var _prev = chapterIdx > 0 && work.chapters[chapterIdx-1] ? (work.chapters[chapterIdx-1].content || '') : '';
        _qReport = QualityEngine.score(result, { work: work, prevContent: _prev, genre: genre });
        QualityEngine.attach(work, chapterIdx, _qReport);
      }
    } catch(e) { console.warn('[quality]', e); }

    statusBar.style.background = '#dcfce7';
    statusBar.style.color = '#166534';
    var _scoreTxt = _qReport ? '，质量分 ' + _qReport.score + '/100' : '';
    statusBar.textContent = 'AI生成成功（' + result.length + '字' + _scoreTxt + '）';
    if (_qReport && _qReport.weaknesses.length) {
      statusBar.textContent += ' · 短板：' + _qReport.weaknesses.slice(0,2).join('、');
    }
    setTimeout(function() { statusBar.style.display='none'; }, 3000);
    document.getElementById('editor').value = result;
    // 双级备份用于撤销（保留上上次内容）
    window._editorBackup2 = window._editorBackup;
    window._editorBackup = oldContent;
    // 显示撤销按钮
    var undoBtn = document.getElementById('undo-btn');
    if (undoBtn) undoBtn.style.display = 'inline-block';
    // 保存到章节
    var ch = work.chapters[chapterIdx];
    ch.content = result;
    ch.wordCount = result.length;
    // 同步章节标题到输入框
    if(ch.title) document.getElementById('ch-title').value = ch.title;
    updateWordCount();
    
    // 细纲覆盖率检测
    if (work.detail) { var detailLines = work.detail.split('\n').filter(l => l.trim().length > 5 && (l.includes('场景') || l.includes('■') || /\d+[.、]/.test(l))); var covered = detailLines.filter(l => result.includes(l.slice(0, 8))).length; var rate = detailLines.length ? Math.round(covered / detailLines.length * 100) : 100;
      if (rate < 70 && detailLines.length > 0) { var missed = detailLines.filter(l => !result.includes(l.slice(0, 8)));
        if (missed.length > 0) {
          showToast('细纲覆盖率' + rate + '%，正在自动补写' + missed.length + '个遗漏场景...', 3000); var contextBefore = result.slice(-500); var fillPrompt = '你是网络小说续写助手。当前为第' + (chapterIdx + 1) + '章，细纲要求包含以下场景点，但正文中遗漏了。\n\n遗漏场景点（共' + missed.length + '个）：\n' + missed.slice(0, 8).join('\n') + '\n\n【策略】\n1. 仔细阅读已有正文末尾\n2. 将遗漏场景自然地衔接到已有内容中\n3. 新写内容字数300-800字，与现有文风一致\n4. 不要重复已有叙述，直接补写缺失情节\n\n【已有正文末尾】\n' + contextBefore + '\n\n请直接输出补写段落：';
          
          try { var fillResult = await callRealAPIWithFallback(fillPrompt, null, 'fill');
            if (fillResult) {
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
      try { var evalResult = checkEval(ch, chapterIdx, work);
        ch.evalCache = evalResult; var grade = typeof getGrade === 'function' ? getGrade(evalResult.total) : evalResult.total;
        showToast('评分：' + evalResult.total + '分(' + grade + ')', 4000);
      } catch(e) {
        console.log('自动评分失败:', e);
      }
    }
    
    DB.saveWork(work);
    // 通知可撤销
    showToast('✅ 生成完成 — 不满意可点右上角 <撤销> 按钮恢复原文', 5000);
    
    // 触发润色推荐
    setTimeout(function() { showPolishRecommend(); }, 500);
    
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
var POLISH_DIM_MAP = {
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

async function aiPolish(polishType){ var content=document.getElementById('editor').value;
  if(!content){showToast('请先输入内容');return;}
  var work=getCurrentWork(); var chapterIdx=currentChapterIdx||0;
  
  // 如果没有指定润色类型，自动找薄弱点
  var targetDim = polishType;
  if (!targetDim || targetDim === 'auto') { var ch = work ? work.chapters[chapterIdx] : null; var ev = ch && ch.evalCache ? ch.evalCache : null;
    if (ev && ev.dims) {
      // 找最低分维度
      var weakest = ev.dims.slice().sort((a, b) => a.score - b.score)[0];
      if (weakest && weakest.score < 75) {
        targetDim = weakest.name;
        showToast('🔍 自动识别薄弱点：' + weakest.name + '（' + weakest.score + '分）');
      }
    }
    if (!targetDim) targetDim = '一键';
  }
  
  // 获取润色指令
  var extraReq = ''; var dimInfo = POLISH_DIM_MAP[targetDim];
  if (dimInfo) {
    extraReq = dimInfo.req;
  } else if (targetDim === '一键') {
    extraReq = '全面润色：优化文笔、强化节奏、丰富描写、提升对话质量、消除AI痕迹。';
  }
  
  // 构建带上下文的润色prompt
  var prompt='你是一位专业网文编辑，请润色以下章节内容。\n\n';
  if(work){
    prompt+='【作品】'+work.title+'\n';
    prompt+='【题材】'+getWorkGenre(work)+'\n';
    if(work.world)prompt+='【世界观】'+work.world.substring(0,800)+'\n\n';
    if(work.chars)prompt+='【人物】'+work.chars.substring(0,600)+'\n\n';
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
      var shortMem = memCtx.length > 800 ? memCtx.substring(0, 800) + '...(记忆已截断)' : memCtx;
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
  prompt+='【正文】\n'+content; var result = await callRealAPIWithFallback(prompt, null, 'quality_polish');
  if(!result && window.PolishEngine){
    showToast('使用本地润色...');
    result = window.PolishEngine.polish(content);
  }
  if(result){
    document.getElementById('editor').value=result;updateWordCount();
    showToast('✨ ' + (dimInfo ? dimInfo.label : '一键') + '润色完成');
    // 润色后重新评分
    if (typeof checkEval === 'function' && work) { var ch = work.chapters[chapterIdx];
      ch.content = result;
      ch.wordCount = result.length;
      delete ch.evalCache; var ev = checkEval(ch, chapterIdx, work);
      ch.evalCache = ev;
      DB.saveWork(work);
      setTimeout(function() { showPolishRecommend(); }, 300);
    }
  }
}

async function aiEvaluate(){ var content=document.getElementById('editor').value;
  if(!content){showToast('请先输入内容');return;}
  var work=getCurrentWork(); var chapterIdx=currentChapterIdx||0;
  
  // 先尝试API评价
  var prompt='你是一位资深网文编辑，请对以下章节进行专业评价。\n\n';
  if(work){
    prompt+='【作品】'+work.title+'\n';
    prompt+='【题材】'+getWorkGenre(work)+'\n';
    if(work.world)prompt+='【世界观】'+work.world.substring(0,500)+'\n\n';
    if(work.chars)prompt+='【人物】'+work.chars.substring(0,400)+'\n\n';
    if(work.detail){ var detailChapters=work.detail.split(/(?=(?:第[一二三四五六七八九十百千\d]+章|Chapter\s*\d+))/gi);
      // split+前瞻导致索引0为空或卷标题，索引1才是第1章，需+1偏移
      var detailIdx = chapterIdx + 1;
      if(detailChapters.length > detailIdx){
        prompt+='【本章细纲】'+detailChapters[detailIdx]+'\n\n';
      }
    }
  }
  prompt+='请从以下维度评分（每项1-10分），并给出具体改进建议：\n\n';
  prompt+='1. 【剧情契合度】是否按照细纲展开，有无偏离\n';
  prompt+='2. 【开篇吸引力】开头是否抓住读者\n';
  prompt+='3. 【爽点节奏】爽点/高潮的安排是否合理\n';
  prompt+='4. 【情绪张力】情绪描写是否到位\n';
  prompt+='5. 【对话质量】对话是否自然、有个性\n';
  prompt+='6. 【描写质量】场景/动作/心理描写是否生动\n';
  prompt+='7. 【节奏控制】叙事节奏是否合适，有无拖沓\n';
  prompt+='8. 【悬念钩子】结尾是否有吸引力\n';
  prompt+='9. 【文笔水平】用词、句式、修辞是否出色\n';
  prompt+='10. 【综合评分】加权平均分\n\n';
  prompt+='格式要求：\n';
  prompt+='- 每个维度一行：维度名：X分 具体评价\n';
  prompt+='- 最后给出【综合评分】：X分\n';
  prompt+='- 给出【核心问题】（最需要改进的1-2点）\n';
  prompt+='- 给出【具体修改建议】（可操作的改法）\n\n';
  prompt+='【正文】\n'+content; var result = await callRealAPIWithFallback(prompt, null, 'quality_logic');
  
  // 解析评估结果
  if(!result){
    // API不可用，使用本地评价
    var ch = work ? work.chapters[chapterIdx] : {content: content};
    if (typeof checkEval === 'function') {
      // 使用完整版12维度评价
      showToast('使用本地12维度评价...'); var ev = checkEval(ch, chapterIdx, work || {chars:'', settings:{genre:'', platform:'general'}});
      ch.evalCache = ev; var report = '【12维度评价报告】（本地规则引擎）\n\n';
      report += '综合评分：' + ev.total + '分 ' + (typeof getGrade === 'function' ? getGrade(ev.total) : '') + '\n';
      report += '字数：' + ev.len + '字 | 段落：' + ev.paras + '段\n\n';
      
      report += '各维度评分：\n';
      ev.dims.forEach(function(d) { var bar = d.score >= 80 ? '##' : (d.score >= 60 ? '#.' : '..');
        report += '  ' + d.name + '：' + d.score + '分 ' + bar + '\n';
        // 显示未通过的检查项
        var failed = d.items.filter(it => !it.a);
        if (failed.length > 0) {
          failed.slice(0, 2).forEach(function(it) {
            report += '    x ' + it.q + '\n';
          });
        }
      });
      
      // 流派专属建议
      var genreVal = work && work.settings ? work.settings.genre : '';
      if (genreVal && typeof getGenreEvalTips === 'function') { var weakDims = ev.dims.filter(d => d.score < 70); var tips = getGenreEvalTips(genreVal, weakDims);
        if (tips) {
          report += '\n【流派建议（' + (NOVEL_GENRES[genreVal] ? NOVEL_GENRES[genreVal].label : genreVal) + '）】\n';
          if (tips.generic) tips.generic.forEach(function(t) { report += '  - ' + t + '\n'; });
          if (tips.specific && tips.specific.length > 0) {
            report += '\n针对性建议：\n';
            tips.specific.forEach(function(t) { report += '  ! ' + t + '\n'; });
          }
        }
      }
      
      if (ev.clicheCount > 0) {
        report += '\n【套路化表达】共' + ev.clicheCount + '处\n';
        ev.clicheDetails.slice(0, 5).forEach(function(d) { report += '  - ' + d.pattern + '\n'; });
      }
      
      result = report;
      
      if (work) DB.saveWork(work);
    } else if (window.EvaluateEngine) {
      // 降级：使用简化版8维度评价
      showToast('使用本地简化评价...');
      result = window.EvaluateEngine.evaluate(content);
    }
  }
  
  if(result){
    if(typeof result === 'object'){
      result = JSON.stringify(result, null, 2);
    }
    showEvalModal(result);
    // 触发润色推荐
    setTimeout(function() { showPolishRecommend(); }, 300);
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

// 按评价建议自动修改正文
async function applyEvalFix(){ var work=getCurrentWork(); var content=document.getElementById('editor').value;
  if(!content){showToast('没有内容可修改');return;}
  
  var evalText = document.getElementById('eval-content').textContent;
  document.getElementById('eval-modal').style.display='none'; var statusBar = document.getElementById('api-status-bar');
  statusBar.style.display = 'block';
  statusBar.style.background = '#dbeafe';
  statusBar.style.color = '#1e40af';
  statusBar.textContent = '🛠️ 正在按评价建议修改...'; var chapterIdx=currentChapterIdx||0;
  
  // 构建精准修改prompt（传入完整上下文）
  var prompt='你是一位专业网文编辑。请根据评价建议，对正文进行精准修改。\n\n';
  prompt+='【作品】'+(work?work.title:'')+'\n';
  if(work&&work.world)prompt+='【世界观】'+work.world.substring(0,600)+'\n\n';
  if(work&&work.chars)prompt+='【人物】'+work.chars.substring(0,400)+'\n\n';
  
  prompt+='【评价建议】\n'+evalText+'\n\n';
  prompt+='【原文】\n'+content+'\n\n';
  prompt+='【修改原则】\n';
  prompt+='1. 只修改评价中指出的具体问题，不要改动其他部分\n';
  prompt+='2. 保持原有剧情走向、角色性格、对话风格不变\n';
  prompt+='3. 保留原文的优点和精彩段落\n';
  prompt+='4. 修改要精准，不要为了改而改\n';
  prompt+='5. 输出修改后的完整正文，不要加任何解释、标记或对比\n'; var result = await callRealAPIWithFallback(prompt, null, 'quality_polish');
  if(result){
    statusBar.style.background = '#dcfce7';
    statusBar.style.color = '#166534';
    statusBar.textContent = '✅ 已按评价修改完成（' + result.length + '字）';
    setTimeout(function() { statusBar.style.display='none'; }, 3000);
    document.getElementById('editor').value = result;
    updateWordCount();
    showToast('已按评价修改');
  } else {
    statusBar.style.background = '#fef3c7';
    statusBar.style.color = '#92400e';
    statusBar.textContent = '⚠️ API调用失败，无法自动修改';
    setTimeout(function() { statusBar.style.display='none'; }, 3000);
  }
}

async function sendAiCommand(){ var cmd=document.getElementById('ai-input').value.trim();
  if(!cmd)return; var work=getCurrentWork(); var content=document.getElementById('editor').value; var chapterIdx = currentChapterIdx || 0;
  
  // 基于章节prompt + 用户指令（指令注入prompt体内而非末尾，防止截断）
  var fullPrompt = buildChapterPrompt(work, chapterIdx, content, cmd);
  
  // 先尝试API（自动遍历所有服务商），失败则使用本地AI
  var result = await callRealAPIWithFallback(fullPrompt, null, 'write_normal');
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
function extractTpl(){ var content=document.getElementById('editor').value.trim();
  if(!content){showToast('编辑器为空，无法提取');return;}
  var title=document.getElementById('ch-title').value.trim()||'未命名模板';
  
  // 保存到本地存储
  var customTpls=JSON.parse(localStorage.getItem('custom_templates')||'[]');
  customTpls.push({title:title,content:content,created:new Date().toISOString()});
  localStorage.setItem('custom_templates',JSON.stringify(customTpls));
  showToast('已保存为自定义模板，可在模板库查看');
}

// 插入词句
function insertPhrase(){
  // 显示词句库弹窗
  var modal=document.getElementById('phrase-modal');
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
  }; var html='';
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

function insertTextToEditor(text){ var editor=document.getElementById('editor'); var start=editor.selectionStart; var end=editor.selectionEnd; var value=editor.value;
  editor.value=value.substring(0,start)+text+value.substring(end);
  editor.selectionStart=editor.selectionEnd=start+text.length;
  editor.focus();
  document.getElementById('phrase-modal').style.display='none';
  updateWordCount();
}

// 文本检测+一键修复功能（整本小说全部章节检测）
function checkText(){ var work=getCurrentWork();
  if(!work){showToast('请先选择作品');return;}

  // 先保存当前章节
  saveChapter();

  if(!window.TextChecker||!window.ContentGenerator){showToast('模块加载中...');return;}

  // 收集所有章节内容
  var chapters = work.chapters || [];
  if(chapters.length === 0){showToast('暂无章节内容');return;}

  var fullText = '';
  chapters.forEach(function(ch, idx) {
    fullText += '\n\n===== 第' + (idx + 1) + '章：' + (ch.title || '未命名') + ' =====\n\n' + (ch.content || '');
  });

  // 检测
  var result=window.TextChecker.generateReport(fullText, work);

  // 自动修复
  var fixed=fullText;
  fixed=window.ContentGenerator.autoFixRepeatedWords(fixed);
  fixed=window.ContentGenerator.autoFixStacking(fixed);

  // 显示检测报告弹窗
  var modal=document.getElementById('check-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='check-modal';
    modal.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999;display:none;align-items:center;justify-content:center;';
    modal.innerHTML='<div style="background:#fff;border-radius:16px;padding:20px;width:90%;max-width:480px;max-height:85vh;overflow-y:auto;"><div style="font-size:16px;font-weight:600;margin-bottom:12px;">&#9989; 全本检测报告</div><pre id="check-content" style="white-space:pre-wrap;font-size:13px;line-height:1.6;color:#333;font-family:inherit;"></pre><div style="display:flex;gap:10px;margin-top:16px;"><button onclick="applyFix()" style="flex:1;padding:10px;border:none;border-radius:8px;background:#6366f1;color:#fff;font-size:14px;cursor:pointer;">&#9989; 应用修复</button><button onclick="document.getElementById(\'check-modal\').style.display=\'none\'" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;color:#666;font-size:14px;cursor:pointer;">关闭</button></div></div>';
    document.body.appendChild(modal);
  }

  var reportText = '【检测范围】整本小说 ' + chapters.length + ' 章\n\n';
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
  if(!window._fixedText || !window._originalChapters) return; var work=getCurrentWork();
  if(!work) return;

  // 解析修复后的文本，按章节拆分（宽松匹配）
  var chapterBlocks = window._fixedText.split(/=====\s*第\d+章[：:].*?\s*=====/); var chapters = work.chapters || [];

  // chapterBlocks[0] 是空字符串或前言，从1开始是各章节内容
  for( var i = 0; i < chapters.length; i++){
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
      core: [],          // 全书级核心事实：身份、秘密、不可更改设定
      characterTags: [], // 角色记忆点：口癖、标志动作、伤疤、执念、弱点
      relationships: [], // 关系变化：结盟、敌对、暧昧、背叛、亏欠
      items: [],         // 道具归属：谁拿着什么、丢了什么、欠了什么
      locations: [],     // 地点状态：哪里被毁、被占、设伏、留下线索
      promises: [],      // 承诺/禁忌/约定：后文必须兑现或避免违背
      timeline: [],      // 时间线锚点：几天后、黎明前、三年前等
      hooks: []          // 爽点钩子/未兑现期待：读者等着看的点
    };
  }
  var a = w.longMemory.memoryAnchors;
  ['core','characterTags','relationships','items','locations','promises','timeline','hooks'].forEach(function(k){
    if (!Array.isArray(a[k])) a[k] = [];
  });
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
  ['core','characterTags','relationships','items','locations','promises','timeline','hooks'].forEach(function(k){
    if (!Array.isArray(w.longMemory._anchorDigest[k])) w.longMemory._anchorDigest[k] = [];
  });
}

function extractChapterSummary(content, title) {
  if (!content || content.length < 50) return title || '空章节'; var head = content.slice(0, 120).replace(/\n/g, ' '); var sentences = content.split(/[。！？\n]+/).filter(s => s.trim().length > 5); var eventWords = ['杀','击','破','碎','逃','怒','夺','败','胜','震惊','发现','遇到','觉醒','突破','暴露','封印','威胁','追杀']; var events = [];
  for ( var s of sentences) {
    if (events.length >= 3) break;
    if (eventWords.some(w => s.includes(w)) && !events.includes(s.trim())) {
      events.push(s.trim().slice(0, 40));
    }
  }
  if (content.length < 250) return content.slice(0, 200).replace(/\n/g, ' '); var tail = content.slice(-80).replace(/\n/g, ' '); var summary = head;
  if (events.length > 0) summary += ' -> ' + events.join(' | ');
  if (tail.length > 10 && !head.includes(tail.slice(0, 20))) {
    summary += ' ... ' + tail;
  }
  return summary.slice(0, 300);
}

function extractCharNameMap(chars) { var map = {names:[], aliasMap:{}};
  if (!chars) return map; var lines = chars.split('\n').filter(l => l.trim());
  lines.forEach(function(l) { var m = l.match(/^([^：:：\s]{1,6})[：:：\s]/);
    if (m) { var name = m[1].trim();
      map.names.push(name);
      if (name.length >= 2) { var sur = name[0];
        if (!map.aliasMap[sur]) map.aliasMap[sur] = {main:name, type:'surname'};
      }
      var titleMatch = name.match(/^(.{1,2})(兄|姐|妹|弟|师|叔|伯|爷|娘)$/);
      if (titleMatch) { var base = titleMatch[1];
        if (!map.aliasMap[base]) map.aliasMap[base] = {main:name, type:'title'};
      }
    }
  });
  if (map.names.length === 0) map.names.push('主角');
  map.aliasMap['他'] = {main:map.names[0], type:'pronoun'};
  map.aliasMap['她'] = {main:map.names.length > 1 ? map.names[1] : map.names[0], type:'pronoun'};
  map.aliasMap['我'] = {main:map.names[0], type:'pronoun'};
  return map;
}

function extractCharStateFromText(content, chars) {
  if (!content || content.length < 100) return []; var nameMap = extractCharNameMap(chars); var states = []; var conflictWords = ['受伤','突破','愤怒','震惊','昏迷','逃亡','战斗','危险','重伤','击败','觉醒','中毒','胜利','崩溃','流泪','紧张','恐惧','兴奋','坚定','犹豫','绝望','心死','释然','悔恨','愧疚','狂喜','暴怒','冷漠','痴迷','癫狂','压抑','不甘','决绝','屈服','背叛','被俘','失忆','封印','解封','顿悟','走火入魔'];
  for ( var name of nameMap.names) { var nameCount = 0; var nameRe = new RegExp(name, 'g'); var m;
    while ((m = nameRe.exec(content)) !== null) { nameCount++; }
    Object.keys(nameMap.aliasMap).forEach(function(alias) {
      if (alias === name) return;
      if (nameMap.aliasMap[alias].main !== name) return; var aliasRe = new RegExp(alias, 'g');
      while ((m = aliasRe.exec(content)) !== null) { nameCount++; }
    });
    if (nameCount < 1) continue; var sentences = content.split(/[。！？\n]+/); var status = '正常', location = '未知', action = '', emotion = '', hasDialogue = false;
    for ( var s of sentences) {
      if (!nameMap.names.some(n => s.includes(n)) && !Object.keys(nameMap.aliasMap).some(a => s.includes(a) && nameMap.aliasMap[a].main === name)) continue;
      if (s.length > action.length && s.length < 80) action = s.trim().slice(0, 60);
      for ( var cw of conflictWords) {
        if (s.includes(cw)) { status = cw; break; }
      }
      var emotionWords = {'喜':'喜悦','怒':'愤怒','哀':'悲伤','惧':'恐惧','惊':'震惊','羞':'羞愧','疑':'怀疑','绝望':'绝望','释然':'释然','悔':'悔恨','愧':'愧疚','狂':'狂喜','冷':'冷漠','痴':'痴迷','癫':'癫狂','压':'压抑','不甘':'不甘','决绝':'决绝','顿悟':'顿悟'};
      for ( var [k, v] of Object.entries(emotionWords)) {
        if (s.includes(k) || s.includes(v)) emotion = v;
      }
      var locMatch = s.match(/在[^，。]{1,30}(?:山|谷|洞|府|殿|塔|台|门|林|城|湖|海|崖|峰|宫|室|院|房|楼|阁|堂|殿)/);
      if (locMatch) location = locMatch[0].slice(0, 25);
      if (/[""\u300c\u300d\u300e\u300f]/.test(s) && (s.includes('说') || s.includes('道') || s.includes('问'))) hasDialogue = true;
    }
    states.push({name, status, location, action: action || '出场', emotion: emotion || '', hasDialogue});
  }
  return states;
}

function extractPlotThreadsFromText(content, existingThreads, chapterIdx) {
  if (!content || content.length < 100) return existingThreads || []; var threads = existingThreads || []; var sentences = content.split(/[。！？\n]+/); var chNum = (chapterIdx || 0) + 1; var contentKeywords = content.replace(/[，。！？、；：\u201c\u201d\u300c\u300d\s]/g, ' ').split(' ').filter(w => w.length >= 2 && /[\u4e00-\u9fff]/.test(w)); var freqMap = {};
  contentKeywords.forEach(function(w) { freqMap[w] = (freqMap[w] || 0) + 1; }); var doubtWords = ['谁','什么','为什么','究竟','难道','到底','秘密','真相','谜','神秘','未知','未解','阴谋','暗','隐','藏'];
  for ( var s of sentences) {
    if (doubtWords.some(w => s.includes(w)) && s.length > 10 && s.length < 80) { var title = s.trim().slice(0, 50);
      if (!threads.find(t => t.title === title)) { var sKeywords = s.replace(/[，。！？、；：\u201c\u201d\u300c\u300d\s]/g, ' ').split(' ').filter(w => w.length >= 2 && /[\u4e00-\u9fff]/.test(w));
        threads.push({title, status:'待解', chapters:[chNum], lastContent:title, keywords:sKeywords, relatedTo:null});
        break;
      }
    }
  }
  var resolveWords = ['原来','真相大白','揭晓','暴露','揭开','发现','原来是','没想到'];
  for ( var s of sentences) {
    if (resolveWords.some(w => s.includes(w))) { var sKeywords = content.replace(/[，。！？、；：\u201c\u201d\u300c\u300d\s]/g, ' ').split(' ').filter(w => w.length >= 2 && /[\u4e00-\u9fff]/.test(w)); var bestMatch = null, bestScore = 0;
      for ( var t of threads) {
        if (t.status === '待解' && !t.resolvedAt && t.keywords) { var overlap = sKeywords.filter(k => t.keywords.includes(k));
          if (overlap.length > bestScore) { bestScore = overlap.length; bestMatch = t; }
        }
      }
      if (bestMatch && bestScore >= 1) { bestMatch.status = '已解'; bestMatch.resolvedAt = chNum; }
      else {
        for ( var t of threads) {
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
  if (!value || !String(value).trim()) return; var anchors = w.longMemory.memoryAnchors;
  if (!anchors[bucket]) anchors[bucket] = [];
  meta = meta || {}; var text = String(value).trim().replace(/\s+/g, ' ').slice(0, 120);
  if (!text) return; var key = (meta.key || text).slice(0, 60); var exists = anchors[bucket].find(function(x) {
    return x.key === key || x.text === text || (x.text && text.includes(x.text.slice(0, 20)));
  });
  if (exists) {
    exists.text = text.length > exists.text.length ? text : exists.text;
    exists.chapterIdx = Math.max(exists.chapterIdx || 0, meta.chapterIdx || 0);
    exists.updatedAt = Date.now();
    exists.weight = Math.min(10, Math.max(exists.weight || 1, meta.weight || 1) + 1);
    if (meta.status) exists.status = meta.status;
    return;
  }
  anchors[bucket].push({
    key: key,
    text: text,
    chapterIdx: meta.chapterIdx || 0,
    chapterTitle: meta.chapterTitle || '',
    weight: meta.weight || 1,
    status: meta.status || '有效',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  // 每类保留高权重+近期的 30 条，防止记忆膨胀
  anchors[bucket] = anchors[bucket]
    .sort(function(a,b){ return (b.weight||1)-(a.weight||1) || (b.updatedAt||0)-(a.updatedAt||0); })
    .slice(0, 30);
}

function extractMemoryAnchorsFromText(w, idx, content) {
  if (!content || content.length < 40) return;
  initLongMemory(w); var ch = w.chapters && w.chapters[idx] ? w.chapters[idx] : {}; var chapterTitle = ch.title || ('第' + (idx + 1) + '章'); var meta = {chapterIdx: idx, chapterTitle: chapterTitle}; var sentences = content.split(/[。！？\n]+/).map(function(s){return s.trim();}).filter(function(s){return s.length >= 6 && s.length <= 90;}); var names = extractCharNameMap(w.chars || '').names || [];

  // 1. 角色标志：口癖、动作、伤疤、弱点、执念
  names.forEach(function(name) {
    if (!name || name === '主角') return;
    sentences.forEach(function(s) {
      if (!s.includes(name)) return;
      if (/(习惯|总是|从不|最怕|怕|弱点|执念|口头禅|伤疤|疤|旧伤|握紧|眯眼|冷笑|咬牙|沉默)/.test(s)) {
        upsertMemoryAnchor(w, 'characterTags', name + '：' + s.slice(0, 70), Object.assign({key:name + s.slice(0,18), weight:3}, meta));
      }
    });
  });

  // 2. 关系变化：背叛、结盟、救命、亏欠、敌意、暧昧
  sentences.forEach(function(s) {
    if (/(背叛|结盟|联手|救了|欠|仇|敌|恨|喜欢|心动|信任|怀疑|决裂|和解|投靠|保护|交易)/.test(s)) {
      upsertMemoryAnchor(w, 'relationships', s.slice(0, 90), Object.assign({weight:4}, meta));
    }
  });

  // 3. 道具归属：获得/失去/交给/藏起/抢走
  sentences.forEach(function(s) {
    if (/(得到|获得|拿到|夺走|抢走|交给|藏起|收起|丢失|遗失|留下).{0,20}(剑|刀|枪|信|令牌|玉佩|钥匙|药|丹|卷轴|账册|地图|匣|戒指|兵符|密信)/.test(s)) {
      upsertMemoryAnchor(w, 'items', s.slice(0, 90), Object.assign({weight:4}, meta));
    }
  });

  // 4. 地点状态：被毁、设伏、埋线索、被占
  sentences.forEach(function(s) {
    if (/(山|谷|城|府|殿|楼|阁|村|营|牢|院|门|堂|宫|街|巷)/.test(s) && /(被毁|烧|塌|埋伏|设伏|封锁|占据|藏着|线索|入口|出口|陷阱)/.test(s)) {
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
  var tail = content.slice(-500);
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

  // 9. 能力代价：使用能力后的反噬/消耗/限制
  sentences.forEach(function(s) {
    if (/(代价|反噬|消耗|寿元|精神崩溃|身体损伤|副作用|透支|虚弱|昏厥|咳血|经脉寸断|走火入魔|灵力枯竭|元气大伤).{0,15}(能力|功法|秘术|禁术|血脉|天赋|术法|招式|神通)/.test(s) ||
        /(能力|功法|秘术|禁术|血脉|天赋|术法|招式|神通).{0,15}(代价|反噬|消耗|寿元|精神崩溃|身体损伤|副作用|透支|虚弱|昏厥|咳血)/.test(s)) {
      upsertMemoryAnchor(w, 'core', s.slice(0, 90), Object.assign({weight:5}, meta));
    }
  });

  // 10. 势力变化：势力覆灭/崛起/分裂/吞并
  sentences.forEach(function(s) {
    if (/(灭|覆灭|灭亡|覆没|被吞并|分裂|投降|归降|崛起|复兴|重建|称霸|统一).{0,20}(宗|门|派|府|军|营|帮|盟|国|朝|族|阁|楼|殿|司|卫|寨|商会|集团)/.test(s) ||
        /(宗|门|派|府|军|营|帮|盟|国|朝|族|阁|楼|殿|司|卫|寨|商会|集团).{0,20}(灭|覆灭|灭亡|覆没|被吞并|分裂|投降|归降|崛起|复兴|重建|称霸|统一)/.test(s)) {
      upsertMemoryAnchor(w, 'core', s.slice(0, 90), Object.assign({weight:5}, meta));
    }
  });

  // 11. 情绪转折：角色心理的重大变化
  names.forEach(function(name) {
    if (!name || name === '主角') return;
    sentences.forEach(function(s) {
      if (!s.includes(name)) return;
      if (/(绝望|崩溃|心死|放弃|不再信任|彻底失望|幡然醒悟|终于明白|恍然大悟|决心|坚定|从绝望|重燃|释然|放下)/.test(s)) {
        upsertMemoryAnchor(w, 'characterTags', name + '：' + s.slice(0, 70), Object.assign({key:name + 'emotion' + s.slice(0,14), weight:4}, meta));
      }
    });
  });
}

function scoreMemoryAnchor(anchor, idx) { var distance = Math.max(0, (idx || 0) - (anchor.chapterIdx || 0)); var recent = distance <= 3 ? 4 : distance <= 8 ? 2 : 0;
  return (anchor.weight || 1) + recent;
}


// v28：提取章节级长期索引
function updateChapterIndex(w, idx, content) {
  initLongMemory(w); var ch = w.chapters && w.chapters[idx] ? w.chapters[idx] : {}; var title = ch.title || ('第' + (idx + 1) + '章'); var sentences = (content || '').split(/[。！？\n]+/).map(function(s){return s.trim();}).filter(function(s){return s.length >= 8;}); var names = extractCharNameMap(w.chars || '').names.filter(function(n){ return n && n !== '主角' && content.indexOf(n) >= 0; }).slice(0, 8); var eventWords = ['杀','战','逃','救','夺','破','败','胜','发现','揭开','背叛','结盟','突破','受伤','死亡','暴露','交易','承诺']; var keyEvents = [];
  sentences.forEach(function(s){
    if (keyEvents.length >= 4) return;
    if (eventWords.some(function(k){return s.indexOf(k) >= 0;})) keyEvents.push(s.slice(0, 60));
  }); var locMatch = content.match(/(?:来到|进入|离开|回到|赶往|抵达|藏在|困在)[^，。！？\n]{1,25}/g); var locations = locMatch ? locMatch.slice(-3).map(function(x){return x.slice(0, 30);}) : []; var tailParts = content.slice(-600).split(/[。！？\n]+/).filter(Boolean); var hook = tailParts.slice(-2).join('。').slice(0, 120); var keywords = [];
  ['秘密','真相','令牌','玉佩','密信','账册','血脉','身世','仇','承诺','三日','七日','背叛','结盟','埋伏','封锁','突破','死亡'].forEach(function(k){
    if (content.indexOf(k) >= 0) keywords.push(k);
  }); var record = {
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
  }; var list = w.longMemory.chapterIndex; var oldIdx = list.findIndex(function(x){ return x.chapterIdx === idx; });
  if (oldIdx >= 0) list[oldIdx] = record;
  else list.push(record);
  w.longMemory.chapterIndex = list.sort(function(a,b){return a.chapterIdx - b.chapterIdx;}).slice(-3000);
}

// v28：记录人物跨章节轨迹
function updateCharacterHistory(w, idx, states) {
  initLongMemory(w); var hist = w.longMemory.characterHistory;
  (states || []).forEach(function(s){
    if (!s || !s.name) return;
    if (!hist[s.name]) hist[s.name] = []; var row = {
      chapterIdx: idx,
      status: s.status || '正常',
      location: s.location || '',
      emotion: s.emotion || '',
      action: (s.action || '').slice(0, 60),
      updatedAt: Date.now()
    }; var same = hist[s.name].find(function(x){ return x.chapterIdx === idx; });
    if (same) {
      same.status = row.status; same.location = row.location; same.emotion = row.emotion; same.action = row.action; same.updatedAt = row.updatedAt;
    } else {
      hist[s.name].push(row);
    }
    hist[s.name] = hist[s.name].sort(function(a,b){return a.chapterIdx - b.chapterIdx;}).slice(-100);
  });
}

// v28：更新伏笔/承诺/钩子生命周期，生成记忆债务
function updateLongMemoryLifecycle(w, idx, content) {
  initLongMemory(w); var mem = w.longMemory; var anchors = mem.memoryAnchors || {}; var resolveWords = ['兑现','完成','履行','揭晓','真相','原来','还清','归还','杀死','击败','救出','找到','拿回','说清'];
  ['promises','hooks'].forEach(function(bucket){
    (anchors[bucket] || []).forEach(function(a){
      if (a.status === '失效' || a.status === '已兑现') return; var age = idx - (a.chapterIdx || 0); var probe = (a.text || '').slice(0, 14);
      if (age > 0 && probe && content.indexOf(probe) >= 0 && resolveWords.some(function(k){return content.indexOf(k) >= 0;})) {
        a.status = '已兑现';
        a.resolvedAt = idx;
        a.updatedAt = Date.now();
      } else if (age >= 8 && bucket === 'hooks') {
        a.status = '待回收';
      } else if (age >= 12 && bucket === 'promises') {
        a.status = '待兑现';
      }
    });
  });
  (mem.foreshadows || []).forEach(function(f){
    if (f.status !== '未解') return; var age = idx - (f.chapterIdx || 0);
    if (age > 0 && f.keyword && content.indexOf(f.keyword) >= 0 && resolveWords.some(function(k){return content.indexOf(k) >= 0;})) {
      f.status = '已解';
      f.resolvedAt = idx;
    } else if (age >= 10) {
      f.status = '待回收';
    }
  }); var debts = [];
  (anchors.promises || []).forEach(function(a){ var age = idx - (a.chapterIdx || 0);
    if (a.status === '待兑现' || (a.status === '有效' && age >= 12)) debts.push({type:'承诺待兑现', chapterIdx:a.chapterIdx||0, text:a.text, age:age, level:'high'});
  });
  (anchors.hooks || []).forEach(function(a){ var age = idx - (a.chapterIdx || 0);
    if (a.status === '待回收' || (a.status === '有效' && age >= 8)) debts.push({type:'钩子待回收', chapterIdx:a.chapterIdx||0, text:a.text, age:age, level:age>=15?'high':'mid'});
  });
  (mem.foreshadows || []).forEach(function(f){ var age = idx - (f.chapterIdx || 0);
    if (f.status === '待回收' || (f.status === '未解' && age >= 10)) debts.push({type:'伏笔待回收', chapterIdx:f.chapterIdx||0, text:f.line, age:age, level:age>=18?'high':'mid'});
  });
  mem.memoryDebt = debts.sort(function(a,b){return b.age - a.age;}).slice(0, 20);
}

// v46：五层渐进式压缩 —— 支撑3000章+超长篇
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
  if (!w || !w.longMemory || !w.longMemory.characterHistory) return ''; var hist = w.longMemory.characterHistory; var rows = [];
  Object.keys(hist).forEach(function(name){ var arr = (hist[name] || []).filter(function(x){return x.chapterIdx < idx;}).slice(-4);
    if (!arr.length) return; var line = name + '：' + arr.map(function(x){
      return '第' + (x.chapterIdx+1) + '章[' + (x.status||'正常') + (x.emotion?','+x.emotion:'') + (x.location?','+x.location:'') + ']';
    }).join(' -> ');
    rows.push(line);
  });
  if (!rows.length) return '';
  return '【人物长期轨迹】\n' + rows.slice(0, 8).join('\n') + '\n\n';
}

// v46：压缩过量的记忆锚点 —— 按桶分别蒸馏
function compressMemoryAnchors(w, idx) {
  initLongMemory(w);
  var anchors = w.longMemory.memoryAnchors;
  var digests = w.longMemory._anchorDigest;
  var names = ['core','characterTags','relationships','items','locations','promises','timeline','hooks'];
  var MAX_RAW = 120; // 每个桶最多保留原始条目（支撑3000章）
  var DISTILL_THRESHOLD = 80; // 超过这个阈值就开始蒸馏
  
  names.forEach(function(bucket){
    var list = (anchors[bucket] || []).filter(function(a){ return a.status !== '失效'; });
    if (list.length <= DISTILL_THRESHOLD) return;
    // 保持最近20条，蒸馏其余
    var recent = list.slice(-20);
    var old = list.slice(0, list.length - 20);
    // 按20章一组蒸馏为摘要行
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
    digests[bucket] = newDigests.slice(-6);
    // 只保留最近条目 + 标记老的为compressed
    old.forEach(function(a){ a.status = '已压缩'; });
    anchors[bucket] = anchors[bucket].filter(function(a){ return a.status !== '已压缩'; }).slice(-MAX_RAW);
  });
}

function buildChapterIndexContext(w, idx) {
  if (!w || !w.longMemory || !Array.isArray(w.longMemory.chapterIndex)) return ''; var list = w.longMemory.chapterIndex.filter(function(x){return x.chapterIdx < idx;});
  if (!list.length) return ''; var recent = list.slice(-6); var important = list.filter(function(x){
    return (x.keywords || []).some(function(k){return ['秘密','真相','承诺','背叛','血脉','身世','密信','令牌'].indexOf(k) >= 0;});
  }).slice(-4); var merged = [];
  recent.concat(important).forEach(function(x){
    if (!merged.find(function(y){return y.chapterIdx === x.chapterIdx;})) merged.push(x);
  });
  if (!merged.length) return ''; var ctx = '【章节长期索引】\n';
  merged.sort(function(a,b){return a.chapterIdx-b.chapterIdx;}).forEach(function(x){
    ctx += '  第' + (x.chapterIdx+1) + '章 ' + (x.title||'') + '：' + (x.summary||'').slice(0, 90);
    if (x.hook) ctx += '｜尾钩：' + x.hook.slice(0, 50);
    ctx += '\n';
  });
  return ctx + '\n';
}

function buildMemoryDebtContext(w, idx) {
  if (!w || !w.longMemory || !Array.isArray(w.longMemory.memoryDebt) || !w.longMemory.memoryDebt.length) return ''; var debts = w.longMemory.memoryDebt.slice(0, 6); var ctx = '【长记忆提醒：待回收/待兑现】\n';
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
    core: '核心事实（绝不能写错）',
    characterTags: '角色记忆点',
    relationships: '关系变化',
    items: '道具归属',
    locations: '地点状态',
    promises: '承诺/禁忌/时限',
    timeline: '时间线',
    hooks: '未兑现爽点钩子'
  };
  var ctx = '';
  Object.keys(names).forEach(function(bucket) {
    var list = (anchors[bucket] || [])
      .filter(function(a){ return (a.chapterIdx || 0) < idx && a.status !== '失效'; })
      .sort(function(a,b){ return scoreMemoryAnchor(b, idx) - scoreMemoryAnchor(a, idx); })
      .slice(0, bucket === 'core' ? 8 : 5);
    if (!list.length) return;
    ctx += '【' + names[bucket] + '】\n';
    list.forEach(function(a) {
      ctx += '  - 第' + ((a.chapterIdx || 0) + 1) + '章：' + a.text + '\n';
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
  initLongMemory(w); var mem = w.longMemory;
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
  keyFn = keyFn || function(x){ return x.key || x.text || JSON.stringify(x).slice(0,60); }; var key = keyFn(item); var idx = list.findIndex(function(x){ return keyFn(x) === key; });
  if (idx >= 0) {
    list[idx] = Object.assign({}, list[idx], item, {updatedAt:Date.now()});
  } else {
    list.push(Object.assign({}, item, {createdAt:Date.now(), updatedAt:Date.now()}));
  }
  if (maxLen && list.length > maxLen) list.splice(0, list.length - maxLen);
}

function updateCharacterProfiles(w, idx, content, states) {
  ensureUltraLongMemory(w); var profiles = w.longMemory.characterProfiles; var names = extractCharNameMap(w.chars || '').names || []; var sentences = (content || '').split(/[。！？\n]+/).map(function(s){return s.trim();}).filter(Boolean);
  names.forEach(function(name){
    if (!name || name === '主角' || content.indexOf(name) < 0) return;
    if (!profiles[name]) {
      profiles[name] = {name:name, firstChapter:idx, lastSeen:idx, status:'正常', location:'', emotion:'', relationships:[], items:[], milestones:[], aliases:[]};
    }
    var p = profiles[name];
    p.lastSeen = idx; var st = (states || []).find(function(x){return x.name === name;});
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
  ensureUltraLongMemory(w); var ledger = w.longMemory.itemLedger; var re = /(得到|获得|拿到|夺走|抢走|交给|藏起|收起|丢失|遗失|归还|留下).{0,20}(剑|刀|枪|信|令牌|玉佩|钥匙|药|丹|卷轴|账册|地图|匣|戒指|兵符|密信|玉玺|虎符|印章|遗书)/g; var m;
  while ((m = re.exec(content)) !== null) { var full = _shortText(m[0], 80); var itemName = m[2];
    if (!ledger[itemName]) ledger[itemName] = {name:itemName, owner:'未知', status:'流转中', history:[]}; var row = {chapterIdx:idx, action:m[1], text:full};
    ledger[itemName].status = /丢失|遗失/.test(m[1]) ? '遗失' : (/归还|交给/.test(m[1]) ? '已转交' : '持有中');
    ledger[itemName].lastChapter = idx;
    _pushUnique(ledger[itemName].history, row, function(x) {return x.chapterIdx + ':' + x.text;}, 20);
  }
}

function updateFactionGraph(w, idx, content) {
  ensureUltraLongMemory(w); var graph = w.longMemory.factionGraph; var factionRe = /([\u4e00-\u9fa5]{2,8}(?:宗|门|派|府|军|营|帮|盟|国|朝|族|阁|楼|殿|司|卫|寨|商会|集团))/g; var found = []; var m;
  while ((m = factionRe.exec(content)) !== null) {
    if (found.indexOf(m[1]) < 0) found.push(m[1]);
    if (found.length >= 12) break;
  }
  found.forEach(function(name){
    if (!graph[name]) graph[name] = {name:name, status:'活跃', allies:[], enemies:[], events:[]};
  }); var sentences = (content || '').split(/[。！？\n]+/).map(function(s){return s.trim();}).filter(Boolean);
  sentences.forEach(function(s){ var fs = found.filter(function(f){return s.indexOf(f) >= 0;});
    if (!fs.length) return;
    fs.forEach(function(f){ var node = graph[f];
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
  ensureUltraLongMemory(w); var list = w.longMemory.timelineEvents; var sentences = (content || '').split(/[。！？\n]+/).map(function(s){return s.trim();}).filter(Boolean); var timeRe = /(三年前|十年前|百年前|昨夜|今夜|明日|翌日|黎明|黄昏|午夜|半个时辰|一炷香|三日后|七日后|一个月后|一年后|第[一二三四五六七八九十百千万]+日)/;
  sentences.forEach(function(s){ var tm = s.match(timeRe);
    if (!tm) return;
    if (!/(死|战|逃|救|夺|破|败|胜|发现|揭开|背叛|结盟|突破|受伤|暴露|交易|承诺|发誓|封锁|埋伏)/.test(s)) return;
    _pushUnique(list, {chapterIdx:idx, time:tm[1], text:_shortText(s,100), type:'事件'}, function(x){return x.chapterIdx+':'+x.time+':'+x.text.slice(0,24);}, 500);
  });
}

function updateForeshadowLedger(w, idx) {
  ensureUltraLongMemory(w); var mem = w.longMemory; var ledger = mem.foreshadowLedger; var add = function(type, chapterIdx, text, status, priority) {
    if (!text) return; var age = Math.max(0, idx - (chapterIdx || 0));
    _pushUnique(ledger, {
      type:type, chapterIdx:chapterIdx||0, text:_shortText(text,100),
      status:status || '未解', age:age, priority:priority || (age > 20 ? '高' : '中')
    }, function(x){return x.type+':'+x.chapterIdx+':'+x.text.slice(0,24);}, 300);
  };
  (mem.foreshadows || []).forEach(function(f){ add('伏笔', f.chapterIdx, f.line, f.status || '未解', f.status === '待回收' ? '高' : '中'); }); var anchors = mem.memoryAnchors || {};
  (anchors.promises || []).forEach(function(a){ add('承诺', a.chapterIdx, a.text, a.status || '有效', a.status === '待兑现' ? '高' : '中'); });
  (anchors.hooks || []).forEach(function(a){ add('钩子', a.chapterIdx, a.text, a.status || '有效', a.status === '待回收' ? '高' : '中'); });
  ledger.forEach(function(x){ x.age = Math.max(0, idx - (x.chapterIdx || 0)); if (x.age >= 25 && x.status !== '已解' && x.status !== '已兑现') x.priority = '高'; });
  mem.foreshadowLedger = ledger.sort(function(a,b){ var pa = a.priority === '高' ? 2 : 1, pb = b.priority === '高' ? 2 : 1;
    return pb - pa || b.age - a.age;
  }).slice(0, 300);
}

function updateVolumeMemories(w, idx) {
  ensureUltraLongMemory(w); var mem = w.longMemory; var size = (mem.ultraMeta && mem.ultraMeta.volumeSize) || 50; var volumeNo = Math.floor(idx / size) + 1; var start = (volumeNo - 1) * size; var end = Math.min(idx, start + size - 1); var chapters = (mem.chapterIndex || []).filter(function(x){return x.chapterIdx >= start && x.chapterIdx <= end;});
  if (!chapters.length) return; var characters = {}; var keywords = {}; var events = [];
  chapters.forEach(function(ch){
    (ch.chars || []).forEach(function(c){characters[c] = (characters[c]||0)+1;});
    (ch.keywords || []).forEach(function(k){keywords[k] = (keywords[k]||0)+1;});
    (ch.events || []).slice(0,1).forEach(function(e){events.push('第'+(ch.chapterIdx+1)+'章：'+e);});
  }); var topChars = Object.keys(characters).sort(function(a,b){return characters[b]-characters[a];}).slice(0,12); var topKeys = Object.keys(keywords).sort(function(a,b){return keywords[b]-keywords[a];}).slice(0,12); var summary = chapters.slice(-18).map(function(ch){
    return '第' + (ch.chapterIdx+1) + '章：' + _shortText(ch.summary || (ch.events||[]).join('；'), 80);
  }).join('\n');
  if (summary.length > 1200) summary = summary.slice(-1200); var openLedger = (mem.foreshadowLedger || []).filter(function(x){return x.status !== '已解' && x.status !== '已兑现';}).slice(0, 20); var row = {volumeNo:volumeNo, start:start, end:end, summary:summary, characters:topChars, keywords:topKeys, events:events.slice(-20), openThreads:openLedger, updatedAt:Date.now()}; var i = mem.volumeMemories.findIndex(function(v){return v.volumeNo === volumeNo;});
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
  if (!w || !w.longMemory || !Array.isArray(w.longMemory.volumeMemories)) return ''; var size = (w.longMemory.ultraMeta && w.longMemory.ultraMeta.volumeSize) || 50; var currentVolume = Math.floor(idx / size) + 1; var vols = w.longMemory.volumeMemories.filter(function(v){return v.volumeNo < currentVolume;});
  if (!vols.length) return ''; var recent = vols.slice(-3); var first = vols.length > 3 ? [vols[0]] : []; var selected = [];
  first.concat(recent).forEach(function(v){ if (!selected.find(function(x){return x.volumeNo===v.volumeNo;})) selected.push(v); }); var ctx = '【超长篇分卷记忆】\n';
  selected.forEach(function(v){
    ctx += '第' + v.volumeNo + '卷（第' + (v.start+1) + '-' + (v.end+1) + '章）：\n';
    if (v.characters && v.characters.length) ctx += '  核心人物：' + v.characters.slice(0,8).join('/') + '\n';
    if (v.keywords && v.keywords.length) ctx += '  核心关键词：' + v.keywords.slice(0,8).join('/') + '\n';
    ctx += '  卷摘要：' + _shortText(v.summary, 380) + '\n';
  });
  return ctx + '\n';
}

function buildUltraLedgerContext(w, idx) {
  if (!w || !w.longMemory) return ''; var mem = w.longMemory; var ctx = ''; var profiles = mem.characterProfiles || {}; var chars = Object.keys(profiles).map(function(k){return profiles[k];})
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
  var debts = (mem.foreshadowLedger || []).filter(function(x){return x.status !== '已解' && x.status !== '已兑现';}).slice(0, 8);
  if (debts.length) {
    ctx += '【伏笔/承诺/钩子总表（优先处理）】\n';
    debts.forEach(function(d){
      ctx += '  - [' + (d.priority||'中') + '] ' + d.type + '：第' + ((d.chapterIdx||0)+1) + '章「' + _shortText(d.text,60) + '」悬挂' + d.age + '章\n';
    });
    ctx += '\n';
  }
  var itemNames = Object.keys(mem.itemLedger || {}).slice(0, 10);
  if (itemNames.length) {
    ctx += '【重要道具总表】\n';
    itemNames.forEach(function(name){ var it = mem.itemLedger[name]; var last = it.history && it.history.length ? it.history[it.history.length-1] : null;
      ctx += '  ' + name + '：' + (it.status||'未知') + (last ? '，最近第' + (last.chapterIdx+1) + '章：' + _shortText(last.text,45) : '') + '\n';
    });
    ctx += '\n';
  }
  var factions = Object.keys(mem.factionGraph || {}).slice(0, 8);
  if (factions.length) {
    ctx += '【势力关系网】\n';
    factions.forEach(function(name){ var f = mem.factionGraph[name];
      ctx += '  ' + name + '：' + (f.status||'活跃');
      if (f.allies && f.allies.length) ctx += '；盟友：' + f.allies.slice(0,3).join('/');
      if (f.enemies && f.enemies.length) ctx += '；敌对：' + f.enemies.slice(0,3).join('/');
      ctx += '\n';
    });
    ctx += '\n';
  }
  var times = (mem.timelineEvents || []).filter(function(x){return x.chapterIdx < idx;}).slice(-8);
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
  var BUDGET = 12000; // 记忆上下文总字数硬上限（支撑3000章超长篇）

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
  initLongMemory(w); var ch = w.chapters[idx]; var content = ch.content || '';
  if (content.length < 50) return;
  if (!ch.summary || ch.summary === ch.title) {
    ch.summary = extractChapterSummary(content, ch.title);
  }
  // 尝试AI摘要（异步，不阻塞）
  if (content.length >= 300 && !ch.aiSummary) { var config = DB.getApiConfig(); var keys = DB.getApiKeys(config.provider);
    if (keys && keys.length > 0) { var charNames = extractCharNameMap(w.chars || '').names; var msgs = [
        {role:'system', content:'你是一个小说分析助手。请分析以下章节正文，输出JSON格式摘要。格式：{"events":"<关键事件概述，30字内>","charStatus":"<每个角色的状态变化>","emotion":"<本章情绪基调>","setup":"<埋下的伏笔/未解悬念，若无则null>","keyLines":["<最能代表本章的一句话>"]}'},
        {role:'user', content: (charNames.length > 0 ? '角色：' + charNames.join('/') + '\n\n' : '') + '【章节】' + ch.title + '\n\n【正文】' + content.slice(0, 3000) + '\n\n请输出JSON：'}
      ];
      callRealAPIWithFallback(msgs, null, 'quality_consist').then(result => {
        if (result && result.includes('{')) { var jsonStart = result.indexOf('{'); var jsonEnd = result.lastIndexOf('}') + 1;
          if (jsonEnd > jsonStart) {
            try { var parsed = JSON.parse(result.slice(jsonStart, jsonEnd));
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
  var chars = w.chars || ''; var newStates = [];
  if (chars.trim()) {
    newStates = extractCharStateFromText(content, chars); var mem = w.longMemory;
    for ( var ns of newStates) { var existing = mem.charStates.findIndex(c => c.name === ns.name);
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
  var foreshadowKeywords = ['奇怪','异常','不对劲','什么意思','难道','怎么会','古怪','蹊跷','诡异','谜']; var foreshadowFound = foreshadowKeywords.filter(k => content.includes(k));
  if (foreshadowFound.length > 0) { var paraLines = content.split('\n');
    for ( var line of paraLines) { var hasForeshadow = foreshadowFound.some(k => line.includes(k));
      if (hasForeshadow && line.trim().length > 10) { var existed = w.longMemory.foreshadows.some(f => f.line === line.trim().slice(0, 40));
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
  var charNames = (w.chars || '').match(/(?:角色|人设|人物)[：:]\s*(\S{2,4})/g);
  if (charNames && charNames.length > 0) { var names = [...new Set(charNames.map(s => s.replace(/.*[：:]\s*/, '').trim()))];
    for ( var name of names) {
      if (name.length < 2 || name.length > 4) continue; var existing = w.longMemory.charArcs.find(c => c.name === name);
      if (!existing) {
        w.longMemory.charArcs.push({name, arc:'引入', updatedAt:idx});
      } else {
        if (content.includes(name)) { var hasChange = /(突破|晋升|受伤|死亡|背叛|觉醒|发现|遇见|杀|救|哭|笑|怒|逃|变)/.test(content);
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
  if (typeof checkEval === 'function') { var result = checkEval(ch, idx, work);
    ch.evalCache = result;
    return result;
  }
  // 降级：返回空结果
  return {total:0, dimScores:{d1:0,d2:0,d3:0,d4:0,d5:0,d6:0,d7:0,d8:0,d9:0,d10:0,d11:0,d12:0}, dims:[]};
}

// ========== 润色推荐 ==========

function showPolishRecommend() { var recDiv = document.getElementById('polish-recommend'); var recList = document.getElementById('polish-rec-list');
  if (!recDiv || !recList) return; var work = getCurrentWork();
  if (!work || !work.chapters[currentChapterIdx]) { recDiv.style.display = 'none'; return; }
  var ch = work.chapters[currentChapterIdx];
  if (!ch || !ch.content || ch.content.length < 100) { recDiv.style.display = 'none'; return; }
  var ev = getCachedEval(ch, currentChapterIdx, work); var dimMap = {
    'd2': {name:'爽点系统', icon:'🔥', type:'爽点系统', reason:'爽点密度不足，缺少情绪爆发链路'},
    'd3': {name:'节奏控制', icon:'🎵', type:'节奏控制', reason:'段落偏长，节奏拖沓'},
    'd4': {name:'情绪外化', icon:'🎭', type:'情绪外化', reason:'心理描写过多，需用动作替代'},
    'd5': {name:'对话质量', icon:'💬', type:'对话质量', reason:'对话质量待提升'},
    'd6': {name:'钩子设计', icon:'🪝', type:'钩子设计', reason:'章尾缺少悬念钩子'},
    'd7': {name:'原创度', icon:'✨', type:'原创度', reason:'疑似AI痕迹，需优化表达'}
  }; var recs = [];
  Object.entries(dimMap).forEach(function([k, v]) {
    if (ev.dimScores[k] < 70) { var r = {}; for (var rk in v) { if (v.hasOwnProperty(rk)) r[rk] = v[rk]; } r.score = ev.dimScores[k]; recs.push(r); }
  });
  recs.sort((a, b) => a.score - b.score);
  if (recs.length === 0) { recDiv.style.display = 'none'; return; }
  recDiv.style.display = 'block'; var html = '';
  recs.slice(0, 3).forEach(function(r, i) {
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
  });
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
  var _g={玄幻:{expertise:'你是玄幻小说写作专家。注重世界观深度、修炼体系合理性、境界突破的震撼感。'},仙侠:{expertise:'你是仙侠小说写作专家。注重道法自然、因果轮回、剑意和侠义精神的结合。'},都市:{expertise:'你是都市小说写作专家。注重现实逻辑、商战博弈、人际关系张力。'},科幻:{expertise:'你是科幻小说写作专家。注重科技自洽、未来世界构建、人类命运思考。'},历史:{expertise:'你是历史小说写作专家。注重历史细节真实、权谋博弈、时代氛围。'}};
  if(!window.NOVEL_GENRES) window.NOVEL_GENRES = {};
  Object.assign(window.NOVEL_GENRES,_g);
}

window.addEventListenerfunction('DOMContentLoaded',() {
  DB.init();
  initPage();
  // 检查API是否配置
  var config=DB.getApiConfig(); var keys=DB.getApiKeys(config.provider||'dashscope'); var statusBar=document.getElementById('api-status-bar');
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
    setTimeout(function() {statusBar.style.display='none';},2000);
  }
});

// ===== v29: 质量报告面板 =====
function showQualityReport(){
  var work = getCurrentWork(); if (!work) return;
  var ch = work.chapters && work.chapters[currentChapterIdx];
  if (!ch || !ch._quality) { showToast('当前章节暂无质量报告，先用 AI 写作或润色一次'); return; }
  var q = ch._quality;
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
}
async function aiPolishByQuality(){
  var work = getCurrentWork(); if (!work) return;
  var ch = work.chapters && work.chapters[currentChapterIdx];
  if (!ch || !ch._quality) return;
  closeQualityReport();
  var q = ch._quality;
  var content = document.getElementById('editor').value;
  if (!content.trim()) { showToast('当前章节为空'); return; }
  var hint = '请按以下短板对本章进行针对性润色，保持原情节、原人物、原长度，只优化文字：\n';
  for (var i=0;i<(q.suggestions||[]).length;i++) hint += (i+1) + '. ' + q.suggestions[i] + '\n';
  var prompt = '你是一位资深网文编辑。\n\n' + hint + '\n\n【原文】\n' + content + '\n\n【输出要求】直接给出润色后的完整章节正文，不要解释。';
  showLoading('按建议润色中…');
  try {
    var r = await callRealAPIWithFallback(prompt, null, 'quality_polish');
    if (r && r.length > 200) {
      window._editorBackup2 = window._editorBackup;
      window._editorBackup = content;
      document.getElementById('editor').value = r;
      ch.content = r;
      ch.wordCount = r.length;
      // 重新打分
      try {
        var prev = currentChapterIdx > 0 && work.chapters[currentChapterIdx-1] ? (work.chapters[currentChapterIdx-1].content||'') : '';
        var nq = QualityEngine.score(r, { work: work, prevContent: prev, genre: getWorkGenre(work) });
        QualityEngine.attach(work, currentChapterIdx, nq);
        showToast('润色完成，质量分 ' + nq.score + '/100');
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
