/* 文心笔匠 - 模板专属评价引擎 v1 */
/* 每个分类有独立评价维度，综合分>=90自动入库 */
/* 暴露 window.TemplateEval */
(function(){
'use strict';

var CATEGORIES={
  world:{name:'世界观',icon:'🌍',dims:[
    {n:'内部一致性',w:0.30},{n:'创意新颖度',w:0.25},{n:'细节深度',w:0.25},{n:'可扩展性',w:0.20}
  ]},
  chars:{name:'人物人设',icon:'👤',dims:[
    {n:'性格深度',w:0.30},{n:'关系设计',w:0.25},{n:'冲突潜力',w:0.25},{n:'成长弧线',w:0.20}
  ]},
  outline:{name:'大纲',icon:'📋',dims:[
    {n:'节奏控制',w:0.30},{n:'钩子密度',w:0.25},{n:'弧线结构',w:0.25},{n:'爽点分布',w:0.20}
  ]},
  detail:{name:'细纲',icon:'📝',dims:[
    {n:'章章有钩子',w:0.30},{n:'兑现链完整',w:0.30},{n:'数字面板',w:0.20},{n:'情绪起伏',w:0.20}
  ]},
  opening:{name:'开篇',icon:'📖',dims:[
    {n:'冲突密度',w:0.35},{n:'信息差设计',w:0.25},{n:'金手指展示',w:0.20},{n:'代入感',w:0.20}
  ]},
  scene:{name:'场景',icon:'🎬',dims:[
    {n:'感官描写',w:0.30},{n:'情绪张力',w:0.30},{n:'对话潜台词',w:0.25},{n:'节奏把控',w:0.15}
  ]},
  dialogue:{name:'对话',icon:'💬',dims:[
    {n:'角色辨识度',w:0.35},{n:'潜台词深度',w:0.30},{n:'节奏推进',w:0.20},{n:'口头禅风格',w:0.15}
  ]},
  fight:{name:'战斗',icon:'⚔️',dims:[
    {n:'招式创意',w:0.30},{n:'节奏控制',w:0.30},{n:'结果意义',w:0.25},{n:'感官冲击',w:0.15}
  ]},
  hook:{name:'悬念钩子',icon:'🪝',dims:[
    {n:'意外性',w:0.35},{n:'紧迫感',w:0.30},{n:'可回收性',w:0.20},{n:'信息差',w:0.15}
  ]}
};

var STORAGE_KEY='wxbj_template_lib_v1';

function loadLib(){
  try{var r=localStorage.getItem(STORAGE_KEY);if(r)return JSON.parse(r);}catch(e){}
  return {customCats:{},collected:[],pending:[]};
}
function saveLib(lib){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(lib));}catch(e){console.warn('[TemplateEval]存储失败:',e);}
}

// 维度评分：基于内容长度、结构丰富度、关键词命中
function _scoreDim(text,dimName){
  var s=5, len=(text||'').length;
  if(len>3000)s+=2;else if(len>1500)s+=1;else if(len<500)s-=2;
  var kw=_kwFor(dimName);
  var hits=0;for(var i=0;i<kw.pos.length;i++){if(text.indexOf(kw.pos[i])>=0)hits++;}
  s+=Math.min(hits,5);
  return Math.max(1,Math.min(10,s));
}

function _kwFor(dimName){
  var m={
    '内部一致性':{pos:['规则','体系','自洽','一致','完整','严谨','约束','铁律','必须','不能','所有']},
    '创意新颖度':{pos:['独特','新颖','反转','颠覆','前所未有','反套路','创新','巧妙','隐藏','秘密','不为人知']},
    '细节深度':{pos:['历史','文化','种族','势力','经济','政治','宗教','起源','背景','演变','传承']},
    '可扩展性':{pos:['未知','谜团','伏笔','隐藏','潜力','空间','之外','更深','未探索','未解','谜']},
    '性格深度':{pos:['性格','缺点','弱点','缺陷','恐惧','执念','欲望','动机','复杂','多面','矛盾','伪装']},
    '关系设计':{pos:['关系','羁绊','恩怨','对立','盟友','敌人','恋人','师徒','对手','背叛','信任','利用']},
    '冲突潜力':{pos:['冲突','矛盾','仇恨','复仇','争夺','代价','牺牲','两难','困境','绝境','死局']},
    '成长弧线':{pos:['成长','蜕变','进化','突破','觉醒','领悟','修炼','磨砺','历练','转变','浴火重生']},
    '节奏控制':{pos:['节奏','高潮','低谷','铺垫','爆发','转折','过渡','起伏','张弛','跌宕','层层递进']},
    '钩子密度':{pos:['钩子','悬念','期待','好奇','接下来','没想到','竟然','突然','谁知','不料','原来']},
    '弧线结构':{pos:['主线','支线','伏笔','回收','呼应','对照','收尾','结局','起承转合','首尾呼应','层层递进']},
    '爽点分布':{pos:['爽点','打脸','逆袭','碾压','震撼','反转','翻盘','逆风翻盘','扮猪吃虎','一鸣惊人','咸鱼翻身']},
    '章章有钩子':{pos:['钩子','悬念','接下来','然后','到底','究竟','为何','怎么回事','未完','待续','下章']},
    '兑现链完整':{pos:['兑现','回收','呼应','对应','伏笔','预兆','暗示','铺垫','揭晓','真相','解密']},
    '数字面板':{pos:['数字','人数','灵石','境界','等级','积分','装备','数量','余额','消耗','获得']},
    '情绪起伏':{pos:['情绪','基调','绝望','希望','愤怒','喜悦','悲伤','恐惧','紧张','爆发','释放']},
    '冲突密度':{pos:['冲突','质问','危机','危险','杀','追杀','逃','战斗','袭击','阴谋','陷阱']},
    '信息差设计':{pos:['不知道','没发现','以为','原来','秘密','真相','隐藏','隐瞒','蒙在鼓里','被欺骗']},
    '金手指展示':{pos:['金手指','系统','面板','能力','异能','天赋','觉醒','激活','获得','开启','解锁']},
    '代入感':{pos:['主角','读者','视角','感受','体验','身临其境','代入','共鸣','感同身受','真实']},
    '感官描写':{pos:['看','听','闻','触','感觉','温度','颜色','声','光','影','气味','味道']},
    '情绪张力':{pos:['情绪','张力','紧张','爆发','压抑','愤怒','悲伤','恐惧','激动','焦虑','挣扎']},
    '对话潜台词':{pos:['潜台词','言外之意','话里有话','暗示','暗指','讽刺','嘲','调侃','弦外之音']},
    '角色辨识度':{pos:['说话风格','语气','口吻','腔调','措辞','口头禅','语言风格','习惯','标志','辨识度']},
    '潜台词深度':{pos:['没说','藏着的','忍着的','咽下去','改口','岔开','闪烁其词','欲言又止','话里有话']},
    '招式创意':{pos:['招式','绝招','必杀','奥义','秘技','独创','自创','组合','连招','变招','破招']},
    '结果意义':{pos:['结果','影响','后果','推动','改变','转折','关键','决定性','生死','胜负','输赢']},
    '感官冲击':{pos:['冲击','震撼','画面','爆','裂','碎','破','毁','灭','杀','轰']},
    '意外性':{pos:['意外','没想到','反转','颠覆','突然','出乎意料','竟','居然','谁知','不料','岂料']},
    '紧迫感':{pos:['紧迫','危机','倒计时','最后','极限','生死','千钧一发','迫在眉睫','争分夺秒','刻不容缓']},
    '可回收性':{pos:['回收','呼应','对应','连接','关联','有关','涉及','前因','后果','线索','指向']},
    '信息差':{pos:['信息差','不知道','隐瞒','欺骗','误导','蒙蔽','真相','秘密','未公开','只有','唯独']},
    '口头禅风格':{pos:['口头禅','标志','习惯','风格','独特','个性','辨识度','专属','特有','标签']},
    '节奏推进':{pos:['推进','推动','进展','发展','节奏','加快','推进剧情','展开','引出','导向']},
    '节奏把控':{pos:['节奏','把控','控制','紧凑','拖沓','松紧','快慢','张弛','舒缓','流畅']}
  };
  return m[dimName]||{pos:[]};
}

function evaluate(content,category){
  var cats=_getAllCats(),cat=cats[category];
  if(!cat)return {totalScore:0,dims:[],match:false};
  var dims=[],tw=0,ts=0;
  for(var i=0;i<cat.dims.length;i++){
    var d=cat.dims[i],sc=_scoreDim(content,d.n);
    dims.push({name:d.n,score:sc,max:10,weight:d.w});
    ts+=sc*d.w;tw+=d.w;
  }
  var total=tw>0?Math.round(ts/tw*10):0;
  return {totalScore:total,dims:dims,category:category,catName:cat.name,icon:cat.icon,match:total>=90};
}

function _getAllCats(){
  var lib=loadLib(),all={};
  for(var k in CATEGORIES)all[k]=CATEGORIES[k];
  for(var ck in lib.customCats)all[ck]=lib.customCats[ck];
  return all;
}

// 自动入库：评分>=90且匹配分类
function autoCollect(content,category,source){
  var ev=evaluate(content,category);
  if(!ev.match)return {collected:false,reason:'评分不足90',score:ev.totalScore};
  var lib=loadLib();
  var item={id:Date.now()+'_'+Math.random().toString(36).slice(2,8),content:content,category:category,catName:ev.catName,icon:ev.icon,score:ev.totalScore,dims:ev.dims,source:source||'auto',time:new Date().toISOString()};
  lib.collected.unshift(item);
  if(lib.collected.length>500)lib.collected.length=500;
  saveLib(lib);
  return {collected:true,item:item,score:ev.totalScore};
}

// 自动匹配最佳分类并入库
function autoCollectBest(content,source){
  var cats=_getAllCats(),best=null,bestScore=0;
  for(var k in cats){
    var ev=evaluate(content,k);
    if(ev.totalScore>bestScore){bestScore=ev.totalScore;best=ev;best.category=k;}
  }
  if(best&&best.match){
    return autoCollect(content,best.category,source);
  }
  return {collected:false,reason:'无匹配分类',bestScore:bestScore};
}

// 手动收藏
function manualCollect(content,category,source){
  return autoCollect(content,category,source||'manual');
}

// 新增自定义分类
function addCustomCategory(key,name,icon,dims){
  var lib=loadLib();
  lib.customCats[key]={
    name:name,icon:icon||'📦',
    dims:dims||[{n:'内容质量',w:0.40},{n:'创意度',w:0.30},{n:'实用性',w:0.30}]
  };
  saveLib(lib);
  return lib.customCats[key];
}

// 获取已收藏模板列表
function getCollected(category){
  var lib=loadLib();
  if(category)return lib.collected.filter(function(c){return c.category===category;});
  return lib.collected;
}

// 获取待审核列表
function getPending(){
  return loadLib().pending;
}

// 获取所有分类
function getAllCategories(){
  return _getAllCats();
}

// 删除收藏
function removeCollected(id){
  var lib=loadLib();
  lib.collected=lib.collected.filter(function(c){return c.id!==id;});
  saveLib(lib);
}

window.TemplateEval={
  evaluate:evaluate,
  autoCollect:autoCollect,
  autoCollectBest:autoCollectBest,
  manualCollect:manualCollect,
  addCustomCategory:addCustomCategory,
  getCollected:getCollected,
  getPending:getPending,
  getAllCategories:getAllCategories,
  removeCollected:removeCollected,
  CATEGORIES:CATEGORIES
};

})();