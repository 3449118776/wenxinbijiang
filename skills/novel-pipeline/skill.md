# 小说创作流水线 Skill

## 描述

专业的网文小说创作流水线skill，包含完整的世界观构建、人物设计、大纲规划、细纲生成、正文写作能力。支持用户全程掌控创作方向，AI作为执行工具。

## 能力

### 1. 世界观构建 (generate_world)
- 根据题材和用户指令生成完整世界观
- 包含力量体系、势力分布、地理环境、社会结构、历史背景
- 自动提取结构化记忆存入记忆库

### 2. 人物设计 (generate_chars)
- 基于世界观生成人物体系
- 包含主角、女主、反派、配角
- 自动生成人物关系图谱
- 自动提取角色记忆

### 3. 大纲规划 (generate_outline)
- 基于世界观和人物生成全书大纲
- 多卷结构，每卷有核心任务和关键事件
- 自动布局伏笔和爽点
- 自动提取大纲记忆

### 4. 细纲生成 (generate_detail)
- 基于大纲生成本卷详细章节规划
- 每章包含场景、冲突、情绪、钩子
- 自动提取细纲记忆

### 5. 正文写作 (write_chapter)
- 基于细纲和上下文生成正文
- 保持世界观、人设、大纲一致性
- 支持续写、润色、扩写

### 6. 记忆管理 (memory)
- 统一记忆库存储所有生成内容
- 支持多AI共享记忆
- 记忆自动提取和更新

## 使用方式

### 命令行模式
```bash
node pipeline.js --action generate_world --genre 玄幻 --title 我的修仙小说 --command 用户指令
node pipeline.js --action generate_chars
node pipeline.js --action generate_outline --volumes 10 --chapters 1500
node pipeline.js --action generate_detail --volume 1
node pipeline.js --action write_chapter --chapter 1
node pipeline.js --action status
node pipeline.js --action export --format json
```

### 交互模式
```bash
node pipeline.js --interactive
```

## 记忆库

所有生成的内容自动存入记忆库（work.longMemory），包含：
- moduleSummaries: 各模块摘要
- charStates: 角色状态
- memoryAnchors: 记忆锚点
- plotThreads: 剧情线索
- foreshadows: 伏笔记录

## 配置

在 `config.json` 中配置：
- API密钥
- 模型选择
- 默认参数

## 输出

生成内容保存在：
- `./output/{title}/` - 作品文件夹
  - world.md - 世界观
  - chars.md - 人设
  - outline.md - 大纲
  - detail_{volume}.md - 细纲
  - chapter_{n}.md - 正文
- `./output/{title}/memory.json` - 记忆库
