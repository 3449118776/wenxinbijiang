const MemorySystem = require('./index.js');

console.log('=== 记忆系统 Skill 测试 ===\n');

const memorySys = new MemorySystem({
  enableRAG: true,
  maxAnchorsPerBucket: 50
});

const work = {
  title: '测试小说',
  chars: '【主角】\n林宇：男主，性格坚韧，身负血海深仇\n【女主】\n苏婉儿：医术高明的医者\n【反派】\n血煞教主：神秘组织首领',
  chapters: []
};

memorySys.init(work);

console.log('1. 初始化完成');
const stats0 = memorySys.getMemoryStats();
console.log('   初始统计:', JSON.stringify(stats0, null, 2));

const chapter1Content = `
第一章 血色残阳

林宇站在悬崖边，望着脚下翻滚的云海。三年了，他终于回来了。

"林宇，你终于敢回来了！"身后传来一个冰冷的声音。

林宇转过身，看到血煞教主站在不远处，眼中满是杀意。他紧紧攥住手中的玉佩，那是母亲留给他的唯一信物。

"血煞，当年的血债，今天我要你加倍偿还！"林宇的声音带着颤抖，但眼神异常坚定。

血煞教主冷笑一声："就凭你？一个丧家之犬而已。"

话音未落，林宇已经冲了上去。他的体内，一股神秘的力量正在觉醒。
三天后，他遇见了苏婉儿。

林家家族被血煞教派灭门，林宇身负血海深仇，踏上复仇之路。
`;

const result1 = memorySys.addChapter(0, chapter1Content, '第一章 血色残阳');
console.log('\n2. 添加第一章');
console.log('   提取记忆数:', result1.extracted);
console.log('   类别:', JSON.stringify(result1.categories));
console.log('   角色数:', result1.characters.length);
console.log('   伏笔数:', result1.foreshadows.length);

const chapter2Content = `
第二章 医者仁心

林宇重伤昏迷，倒在了一片竹林中。

当他醒来时，发现自己躺在一间简陋的茅屋中。一个身穿白衣的女子正坐在床边，静静地看着他。

"你醒了。"女子的声音温柔如水，"我叫苏婉儿，是个大夫。你在竹林里躺了三天，再晚一点就没救了。"

林宇挣扎着想要坐起来，却被苏婉儿按住："别动，你的伤很重，至少要休养一个月。"

"我...我身上的玉佩呢？"林宇焦急地问。

苏婉儿拿起旁边桌上的玉佩："你是说这个吗？我帮你收起来了。这玉佩的材质很特别，似乎有某种神秘的力量。"

林宇接过玉佩，紧紧握在手中。他知道，这玉佩里藏着他身世的秘密。
三个月后，林宇的伤终于好了大半。

苏婉儿告诉林宇，她的师父曾经提到过一块神秘的玉佩，据说与上古时期的某个秘密有关。
`;

const result2 = memorySys.addChapter(1, chapter2Content, '第二章 医者仁心');
console.log('\n3. 添加第二章');
console.log('   提取记忆数:', result2.extracted);
console.log('   伏笔数:', result2.foreshadows.length);

const stats = memorySys.getMemoryStats();
console.log('\n4. 记忆统计');
console.log('   总章节:', stats.totalChapters);
console.log('   总字数:', stats.totalWords);
console.log('   角色数:', stats.characterCount);
console.log('   伏笔数:', stats.foreshadowCount);
console.log('   物品数:', stats.itemCount);
console.log('   角色状态数:', stats.charStates);
console.log('   情节线索数:', stats.plotThreads);
console.log('   角色弧线条数:', stats.charArcs);
console.log('   记忆债务数:', stats.memoryDebt);
console.log('   势力数:', stats.factions);
console.log('   锚点统计:', JSON.stringify(stats.anchors));

const context = memorySys.getContext(2, {
  includeCore: true,
  includeCharacters: true,
  includeForeshadows: true,
  maxItems: 5
});
console.log('\n5. 生成写作上下文（第三章）');
console.log('   上下文长度:', context.text.length, '字');
console.log('   包含的部分:', Object.keys(context.sections));

const searchResults = memorySys.search('玉佩', 5, { currentChapter: 2 });
console.log('\n6. 搜索"玉佩"相关记忆');
console.log('   RAG结果数:', searchResults.ragResults.length);
console.log('   锚点结果数:', searchResults.anchorResults.length);
console.log('   角色结果数:', searchResults.characterResults.length);
console.log('   伏笔结果数:', searchResults.foreshadowResults.length);

if (searchResults.anchorResults.length > 0) {
  console.log('   最相关锚点:', searchResults.anchorResults[0].anchor.text.slice(0, 50));
}

const characters = memorySys.listCharacters({ sortBy: 'role', limit: 5 });
console.log('\n7. 角色列表');
characters.forEach(c => {
  console.log(`   [${c.role}] ${c.name} - 首次登场:第${c.firstChapter + 1}章, 末登场:第${c.lastSeen + 1}章`);
});

const foreshadows = memorySys.listForeshadows('未解');
console.log('\n8. 未回收伏笔');
foreshadows.slice(0, 5).forEach(f => {
  console.log(`   [${f.label}] 第${f.chapterIdx + 1}章: ${f.text.slice(0, 40)}...`);
});

const consistency = memorySys.checkConsistency(2);
console.log('\n9. 一致性检查');
console.log('   评分:', consistency.score + '/100');
console.log('   问题数:', consistency.issues.length);
if (consistency.issues.length > 0) {
  consistency.issues.slice(0, 3).forEach(issue => {
    console.log('   -', issue);
  });
}
console.log('   优点数:', consistency.strengths.length);
if (consistency.strengths.length > 0) {
  consistency.strengths.slice(0, 3).forEach(s => {
    console.log('   +', s);
  });
}

const charStates = memorySys.getCharStates({ limit: 5 });
console.log('\n10. 角色状态');
if (charStates.length > 0) {
  charStates.forEach(cs => {
    console.log(`   ${cs.name} - ${cs.state}（第${cs.chapterIdx + 1}章）`);
  });
} else {
  console.log('   暂无');
}

const plotThreads = memorySys.getPlotThreads({ limit: 5 });
console.log('\n11. 情节线索');
if (plotThreads.length > 0) {
  plotThreads.forEach(pt => {
    console.log(`   [${pt.type}] ${pt.text.slice(0, 40)}...`);
  });
} else {
  console.log('   暂无');
}

const charArcs = memorySys.getCharArcs();
console.log('\n12. 角色弧线');
if (charArcs.length > 0) {
  charArcs.slice(0, 5).forEach(ca => {
    console.log(`   ${ca.name}: ${ca.arc}`);
  });
} else {
  console.log('   暂无');
}

const factions = memorySys.getFactions({ sortBy: 'lastSeen', limit: 5 });
console.log('\n13. 势力图谱');
if (factions.length > 0) {
  factions.forEach(f => {
    console.log(`   ${f.name}（${f.type}）- 成员: ${f.members?.length || 0}人`);
  });
} else {
  console.log('   暂无');
}

const plotContext = memorySys.getPlotContext(2);
console.log('\n14. 情节上下文');
console.log('   文本长度:', plotContext.text.length, '字');
console.log('   包含部分:', Object.keys(plotContext.sections));

const memoryDebt = memorySys.getMemoryDebt();
console.log('\n15. 记忆债务');
console.log('   总数:', memoryDebt.length);
if (memoryDebt.length > 0) {
  memoryDebt.slice(0, 3).forEach(d => {
    console.log(`   [${d.level}] ${d.type}: ${d.text.slice(0, 30)}...（已悬${d.age}章）`);
  });
}

const exportData = memorySys.exportMemory();
console.log('\n16. 导出记忆数据');
console.log('    数据大小:', JSON.stringify(exportData).length, '字节');
console.log('    包含字段:', Object.keys(exportData));

console.log('\n=== 测试完成 ===');
console.log('\n记忆系统 Skill 核心功能:');
console.log('  ✓ 向量RAG检索引擎');
console.log('  ✓ 长期记忆系统（13种记忆类型）');
console.log('  ✓ L0/L1/L2三级记忆分级');
console.log('  ✓ 角色分级权重管理');
console.log('  ✓ 自动记忆提取');
console.log('  ✓ 伏笔追踪与回收');
console.log('  ✓ 记忆压缩与蒸馏');
console.log('  ✓ 一致性检查');
console.log('  ✓ 上下文生成');
console.log('  ✓ 导入/导出');
console.log('  ✓ 角色状态追踪');
console.log('  ✓ 情节线索管理');
console.log('  ✓ 角色弧线进度');
console.log('  ✓ 记忆债务提醒');
console.log('  ✓ 势力关系图谱');
