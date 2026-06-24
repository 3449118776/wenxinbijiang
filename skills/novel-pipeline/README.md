# 小说创作流水线 Skill

专业的网文小说创作工具，包含完整的世界观构建、人物设计、大纲规划、细纲生成、正文写作能力。

## 安装

```bash
cd skills/novel-pipeline
npm init -y
# 配置你的 API 密钥
# 编辑 config.json 设置 apiKey
```

## 使用方式

### 方式一：命令行

```bash
# 生成世界观
node pipeline.js --action generate_world --genre 玄幻 --title 我的修仙小说 --command 写一个逆天改命的修仙故事

# 生成人设
node pipeline.js --action generate_chars --title 我的修仙小说

# 生成大纲
node pipeline.js --action generate_outline --title 我的修仙小说 --volumes 12 --chapters 2000

# 生成细纲
node pipeline.js --action generate_detail --title 我的修仙小说 --volume 1

# 生成正文
node pipeline.js --action write_chapter --title 我的修仙小说 --chapter 1

# 查看状态
node pipeline.js --action status --title 我的修仙小说

# 交互式创作
node pipeline.js --interactive
```

### 方式二：在 AI 助手中使用

```
我需要你使用小说创作流水线skill，帮我写一本修仙小说，200万字。
```

AI 会自动调用 skill 执行流水线，用户全程掌控方向。

## 流水线

```
1. 生成世界观
   ↓ 用户确认
2. 生成人设
   ↓ 用户确认
3. 生成大纲
   ↓ 用户确认
4. 生成细纲
   ↓ 用户确认
5. 生成正文
   ↓ 用户确认
6. 继续写下一章...
```

## 输出结构

```
output/我的修仙小说/
├── world.md           # 世界观
├── chars.md           # 人设
├── outline.md         # 大纲
├── detail/
│   ├── volume_1.md   # 第1卷细纲
│   └── volume_2.md   # 第2卷细纲
├── chapters/
│   ├── chapter_1.md   # 第1章正文
│   ├── chapter_2.md   # 第2章正文
│   └── ...
└── memory.json       # 记忆库
```

## 记忆库

所有生成的内容自动存入记忆库（memory.json），AI 可以：
- 读取已有设定保持一致性
- 更新记忆库中的内容
- 基于记忆库继续创作

## 配置

编辑 `config.json`:

```json
{
  "apiKey": "你的API密钥",
  "apiBase": "https://api.deepseek.com",
  "model": "deepseek-chat",
  "defaultGenre": "玄幻",
  "defaultVolumes": 10,
  "defaultChapters": 1500
}
```

## 环境变量

```bash
export API_KEY=你的API密钥
export API_BASE=https://api.deepseek.com
export MODEL=deepseek-chat
```

## 支持的题材

- 玄幻
- 修真/修仙
- 都市
- 科幻
- 历史
- 游戏
- 其他

## 能力特点

- ✅ 用户全程掌控创作方向
- ✅ AI 作为执行工具
- ✅ 记忆库保持一致性
- ✅ 每步可干预调整
- ✅ 支持续写、润色、扩写
- ✅ 多AI共享记忆

## 注意事项

1. 首次使用需要配置 API 密钥
2. 生成内容较长，建议使用支持长上下文的模型
3. 重要内容请及时备份 output 目录
4. 可以导出到文心笔匠等其他工具
