#!/usr/bin/env node
/**
 * 小说创作流水线 Skill
 * 包含：世界观、人设、大纲、细纲、正文生成
 * 用户全程掌控方向，AI作为执行工具
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ========== 配置 ==========
const CONFIG = {
  apiProvider: process.env.API_PROVIDER || 'deepseek',
  apiKey: process.env.API_KEY || '',
  apiBase: process.env.API_BASE || 'https://api.deepseek.com',
  model: process.env.MODEL || 'deepseek-chat',
  outputDir: process.env.OUTPUT_DIR || './output',
  memoryDb: 'memory.json'
};

// ========== 工具函数 ==========
function log(msg, type = 'info') {
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warn: '⚠️'
  }[type] || '📋';
  console.log(`${prefix} ${msg}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch(e) {
    return null;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function readFile(file) {
  if (!fs.existsSync(file)) return '';
  return fs.readFileSync(file, 'utf8');
}

function writeFile(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, 'utf8');
}

// ========== API 调用 ==========
async function callAPI(prompt, opts = {}) {
  opts = {
    maxTokens: 80000,
    temperature: 0.7,
    ...opts
  };

  // 兼容字符串和数组消息
  let messages;
  if (typeof prompt === 'string') {
    messages = [{ role: 'user', content: prompt }];
  } else if (Array.isArray(prompt)) {
    messages = prompt;
  } else {
    messages = [{ role: 'user', content: String(prompt) }];
  }

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: CONFIG.model,
      messages: messages,
      max_tokens: opts.maxTokens,
      temperature: opts.temperature
    });

    const url = new URL('/v1/chat/completions', CONFIG.apiBase);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.error) {
            reject(new Error(json.error.message || 'API Error'));
          } else if (json.choices && json.choices[0]) {
            resolve(json.choices[0].message.content);
          } else {
            reject(new Error('Invalid response'));
          }
        } catch(e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function cleanOutput(text) {
  if (!text) return '';
  // 移除markdown代码块
  text = text.replace(/^```(?:markdown)?\s*/i, '');
  text = text.replace(/\s*```$/i, '');
  return text.trim();
}

// ========== 记忆库 ==========
class MemoryStore {
  constructor(workDir) {
    this.workDir = workDir;
    this.memoryFile = path.join(workDir, CONFIG.memoryDb);
    this.data = this._load();
  }

  _load() {
    const d = readJson(this.memoryFile);
    if (d) return d;
    return {
      moduleSummaries: {},
      charStates: [],
      memoryAnchors: {
        characterTags: {},
        relationships: [],
        items: [],
        coreFacts: [],
        promises: []
      },
      plotThreads: [],
      foreshadows: [],
      rollingSummary: '',
      chapterIndex: []
    };
  }

  save() {
    writeJson(this.memoryFile, this.data);
  }

  setSummary(type, content) {
    this.data.moduleSummaries[type] = content;
    this.save();
  }

  getSummary(type) {
    return this.data.moduleSummaries[type] || '';
  }

  addCharState(state) {
    this.data.charStates.push({
      ...state,
      timestamp: Date.now()
    });
    this.save();
  }

  addAnchor(type, content) {
    if (!this.data.memoryAnchors[type]) {
      this.data.memoryAnchors[type] = [];
    }
    this.data.memoryAnchors[type].push(content);
    this.save();
  }

  getAll() {
    return this.data;
  }
}

// ========== 作品管理器 ==========
class WorkManager {
  constructor(title) {
    this.title = title;
    this.workDir = path.join(CONFIG.outputDir, this._sanitize(title));
    this.memory = new MemoryStore(this.workDir);
    this.data = {
      title: title,
      world: readFile(path.join(this.workDir, 'world.md')),
      chars: readFile(path.join(this.workDir, 'chars.md')),
      outline: readFile(path.join(this.workDir, 'outline.md')),
      detail: {},
      chapters: [],
      createdAt: Date.now()
    };
    // 加载已有章节
    this._loadChapters();
    // 加载细纲
    this._loadDetails();
  }

  _sanitize(name) {
    return name.replace(/[<>:"/\\|?*]/g, '_');
  }

  _loadChapters() {
    const chDir = path.join(this.workDir, 'chapters');
    if (!fs.existsSync(chDir)) return;
    const files = fs.readdirSync(chDir).filter(f => f.endsWith('.md')).sort();
    for (const file of files) {
      const num = parseInt(file.match(/^chapter_(\d+)/)?.[1] || '0');
      const content = fs.readFileSync(path.join(chDir, file), 'utf8');
      this.data.chapters[num - 1] = {
        number: num,
        title: content.split('\n')[0].replace(/^#+\s*/, ''),
        content: content
      };
    }
  }

  _loadDetails() {
    const detailDir = path.join(this.workDir, 'detail');
    if (!fs.existsSync(detailDir)) return;
    const files = fs.readdirSync(detailDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const num = parseInt(file.match(/^volume_(\d+)/)?.[1] || '1');
      this.data.detail[num] = fs.readFileSync(path.join(detailDir, file), 'utf8');
    }
  }

  save() {
    ensureDir(this.workDir);
    if (this.data.world) writeFile(path.join(this.workDir, 'world.md'), this.data.world);
    if (this.data.chars) writeFile(path.join(this.workDir, 'chars.md'), this.data.chars);
    if (this.data.outline) writeFile(path.join(this.workDir, 'outline.md'), this.data.outline);
    // 保存细纲
    for (const [vol, content] of Object.entries(this.data.detail)) {
      ensureDir(path.join(this.workDir, 'detail'));
      writeFile(path.join(this.workDir, 'detail', `volume_${vol}.md`), content);
    }
    // 保存章节
    ensureDir(path.join(this.workDir, 'chapters'));
    for (const ch of this.data.chapters) {
      if (ch && ch.content) {
        writeFile(path.join(this.workDir, 'chapters', `chapter_${ch.number}.md`), ch.content);
      }
    }
    this.memory.save();
  }

  setWorld(content) {
    this.data.world = content;
    this.memory.setSummary('world', content);
    this.save();
    log(`世界观已保存 (${content.length} 字)`, 'success');
  }

  setChars(content) {
    this.data.chars = content;
    this.memory.setSummary('chars', content);
    this.save();
    log(`人设已保存 (${content.length} 字)`, 'success');
  }

  setOutline(content) {
    this.data.outline = content;
    this.memory.setSummary('outline', content);
    this.save();
    log(`大纲已保存 (${content.length} 字)`, 'success');
  }

  setDetail(volume, content) {
    this.data.detail[volume] = content;
    this.memory.setSummary(`detail_${volume}`, content);
    this.save();
    log(`第${volume}卷细纲已保存 (${content.length} 字)`, 'success');
  }

  addChapter(number, title, content) {
    this.data.chapters[number - 1] = { number, title, content };
    this.save();
    log(`第${number}章已保存 (${content.length} 字)`, 'success');
  }

  getContext() {
    return {
      world: this.data.world || this.memory.getSummary('world') || '',
      chars: this.data.chars || this.memory.getSummary('chars') || '',
      outline: this.data.outline || this.memory.getSummary('outline') || '',
      detail: Object.values(this.data.detail).join('\n\n') || '',
      memory: this.memory.getAll()
    };
  }
}

// ========== 生成器 ==========
class NovelGenerator {
  constructor(work) {
    this.work = work;
  }

  // 构建世界观生成Prompt
  buildWorldPrompt(genre, command) {
    const ctx = this.work.getContext();
    let prompt = [];

    if (ctx.world) {
      prompt.push({ role: 'user', content: `【已有世界观设定】\n${ctx.world}\n\n【用户指令】\n${command || '完善和扩展这个世界观'}\n\n请基于已有世界观和用户指令，补充和完善世界观设定。` });
    } else {
      prompt.push({ role: 'user', content: `请为一部${genre}题材小说生成完整的世界观设定。\n\n【用户要求】\n${command || '构建一个宏大、自洽、富有想象力的世界观'}\n\n要求：\n1. 力量体系：等级划分、能力来源、修炼规则\n2. 势力分布：主要势力、它们的关系和冲突\n3. 地理环境：主要地点、它们的特点\n4. 社会结构：种族、制度、文化\n5. 历史背景：重大事件、起源传说\n6. 核心规则：世界观的基础逻辑\n\n请生成至少30000字的世界观内容，结构清晰，内容详实。` });
    }

    return prompt;
  }

  // 构建人设生成Prompt
  buildCharsPrompt(command) {
    const ctx = this.work.getContext();
    let prompt = [];

    if (ctx.world && ctx.chars) {
      prompt.push({ role: 'user', content: `【世界观】\n${ctx.world}\n\n【已有角色设定】\n${ctx.chars}\n\n【用户指令】\n${command || '完善和补充角色设定'}\n\n请基于已有世界观和人设，补充和完善角色体系。` });
    } else if (ctx.world) {
      prompt.push({ role: 'user', content: `【世界观设定】\n${ctx.world}\n\n请为这部${ctx.world.includes('修仙') || ctx.world.includes('修真') ? '仙侠' : '玄幻'}小说生成完整的人物体系。\n\n【用户要求】\n${command || '生成有特色、有记忆点的角色'}\n\n要求：\n1. 主角：姓名、性格、背景、金手指、成长路线\n2. 女主角/重要女性角色\n3. 主要反派（2-3位，有深度）\n4. 重要配角（5-8位）\n5. 人物关系网\n\n请生成至少20000字的人设内容。` });
    } else {
      prompt.push({ role: 'user', content: '请先生成世界观，再生成人设。' });
    }

    return prompt;
  }

  // 构建大纲生成Prompt
  buildOutlinePrompt(command, opts = {}) {
    const ctx = this.work.getContext();
    const volumes = opts.volumes || 10;
    const chapters = opts.chapters || 1500;

    if (!ctx.world || !ctx.chars) {
      return [{ role: 'user', content: '请先生成世界观和人设，再生成大纲。' }];
    }

    return [{
      role: 'user',
      content: `【世界观】\n${ctx.world.slice(0, 5000)}\n\n【人设】\n${ctx.chars.slice(0, 3000)}\n\n请为这部小说生成完整的${volumes}卷大纲。\n\n【用户要求】\n${command || '构建节奏紧凑、冲突迭起的长篇大纲'}\n\n要求：\n1. 总规模：${volumes}卷、${chapters}章\n2. 每卷有核心任务、关键事件、高潮\n3. 明确每卷之间的衔接和升级\n4. 规划爽点、打脸、升级时刻\n5. 布局长线伏笔和短线伏笔\n\n请生成至少50000字的大纲内容。`
    }];
  }

  // 构建细纲生成Prompt
  buildDetailPrompt(volume, command) {
    const ctx = this.work.getContext();
    const outline = ctx.outline || '';
    // 提取本卷大纲
    const volPattern = new RegExp(`第[一二三四五六七八九十\\d]+卷[^=]*[\\s\\S]*?(?=(?:第[一二三四五六七八九十\\d]+卷)|$)`);
    const volMatch = outline.match(volPattern);

    if (!ctx.outline) {
      return [{ role: 'user', content: '请先生成大纲，再生成细纲。' }];
    }

    return [{
      role: 'user',
      content: `【世界观】\n${ctx.world.slice(0, 3000)}\n\n【人设】\n${ctx.chars.slice(0, 2000)}\n\n【本卷大纲】\n${volMatch ? volMatch[0].slice(0, 3000) : outline.slice(0, 3000)}\n\n请为第${volume}卷生成详细的章节细纲。\n\n【用户要求】\n${command || '每章要有冲突、有爽点、有钩子'}\n\n要求：\n1. 每卷72章左右\n2. 每章包含：标题、核心事件、冲突设计、情绪节奏\n3. 章尾要有钩子\n4. 符合题材风格\n\n请生成详细的细纲内容。`
    }];
  }

  // 构建正文生成Prompt
  buildChapterPrompt(chapterNum, command) {
    const ctx = this.work.getContext();
    const prevChapter = this.work.data.chapters[chapterNum - 2];

    let prompt = [{
      role: 'user',
      content: `【世界观设定】\n${ctx.world.slice(0, 3000)}\n\n【人物设定】\n${ctx.chars.slice(0, 2000)}\n\n【大纲概要】\n${ctx.outline.slice(0, 2000)}\n\n【本章细纲】\n${Object.values(ctx.memory.moduleSummaries).join('\n').slice(0, 1000)}\n\n${prevChapter ? `【上一章结尾】\n${prevChapter.content.slice(-500)}\n\n` : ''}请生成第${chapterNum}章正文。\n\n【用户指令】\n${command || '保持节奏紧凑，章尾留钩子'}\n\n要求：\n1. 字数：3000-4000字\n2. 开篇要抓人，前200字内切入冲突\n3. 保持与世界观、人设、大纲的一致性\n4. 章尾要有强烈的追读钩子\n5. 文笔流畅，代入感强\n\n请直接输出正文内容。`
    }];

    return prompt;
  }

  // 执行生成
  async generate(type, opts = {}) {
    let prompt, result, maxRetries = 2;

    switch(type) {
      case 'world':
        log('正在生成世界观...');
        prompt = this.buildWorldPrompt(opts.genre, opts.command);
        break;
      case 'chars':
        log('正在生成人设...');
        prompt = this.buildCharsPrompt(opts.command);
        break;
      case 'outline':
        log(`正在生成大纲 (${opts.volumes || 10}卷)...`);
        prompt = this.buildOutlinePrompt(opts.command, opts);
        break;
      case 'detail':
        log(`正在生成第${opts.volume}卷细纲...`);
        prompt = this.buildDetailPrompt(opts.volume, opts.command);
        break;
      case 'chapter':
        log(`正在生成第${opts.chapter}章正文...`);
        prompt = this.buildChapterPrompt(opts.chapter, opts.command);
        break;
      default:
        throw new Error(`未知生成类型: ${type}`);
    }

    // 调用API，带重试
    for (let i = 0; i <= maxRetries; i++) {
      try {
        result = await callAPI(prompt, {
          maxTokens: opts.maxTokens || 80000,
          temperature: opts.temperature || 0.7
        });
        result = cleanOutput(result);
        break;
      } catch(e) {
        log(`API调用失败 (${i + 1}/${maxRetries + 1}): ${e.message}`, 'error');
        if (i === maxRetries) throw e;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    // 保存结果
    switch(type) {
      case 'world':
        this.work.setWorld(result);
        break;
      case 'chars':
        this.work.setChars(result);
        break;
      case 'outline':
        this.work.setOutline(result);
        break;
      case 'detail':
        this.work.setDetail(opts.volume, result);
        break;
      case 'chapter':
        const titleMatch = result.match(/^#?\s*(.{2,20})/);
        const title = titleMatch ? titleMatch[1] : `第${opts.chapter}章`;
        this.work.addChapter(opts.chapter, title, result);
        break;
    }

    return result;
  }
}

// ========== 命令行界面 ==========
async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  // 解析参数
  const params = {};
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      params[key] = args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      if (params[key] !== true) i++;
    }
  }

  // 加载配置
  const configFile = path.join(__dirname, 'config.json');
  if (fs.existsSync(configFile)) {
    const config = readJson(configFile);
    Object.assign(CONFIG, config);
  }

  // 处理命令
  switch(cmd) {
    case '--action':
    case 'generate': {
      const action = params.action || params.type;
      const title = params.title || '未命名作品';
      const work = new WorkManager(title);
      const gen = new NovelGenerator(work);

      if (action === 'generate_world' || action === 'world') {
        const result = await gen.generate('world', {
          genre: params.genre || '玄幻',
          command: params.command || params.userCommand
        });
        console.log('\n========== 世界观生成结果 ==========\n');
        console.log(result);
      }
      else if (action === 'generate_chars' || action === 'chars') {
        const result = await gen.generate('chars', {
          command: params.command || params.userCommand
        });
        console.log('\n========== 人设生成结果 ==========\n');
        console.log(result);
      }
      else if (action === 'generate_outline' || action === 'outline') {
        const result = await gen.generate('outline', {
          volumes: parseInt(params.volumes) || 10,
          chapters: parseInt(params.chapters) || 1500,
          command: params.command || params.userCommand
        });
        console.log('\n========== 大纲生成结果 ==========\n');
        console.log(result);
      }
      else if (action === 'generate_detail' || action === 'detail') {
        const result = await gen.generate('detail', {
          volume: parseInt(params.volume) || 1,
          command: params.command || params.userCommand
        });
        console.log('\n========== 细纲生成结果 ==========\n');
        console.log(result);
      }
      else if (action === 'write_chapter' || action === 'chapter') {
        const result = await gen.generate('chapter', {
          chapter: parseInt(params.chapter) || 1,
          command: params.command || params.userCommand
        });
        console.log('\n========== 正文生成结果 ==========\n');
        console.log(result);
      }
      else {
        log(`未知动作: ${action}`, 'error');
        log('支持的动作: generate_world, generate_chars, generate_outline, generate_detail, write_chapter', 'warn');
      }
      break;
    }

    case '--interactive':
    case 'interactive': {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const question = (q) => new Promise(r => rl.question(q, r));

      console.log('\n========== 小说创作流水线 ==========\n');
      const title = await question('作品标题: ') || '未命名作品';
      const genre = await question('题材 (默认玄幻): ') || '玄幻';
      const command = await question('创作要求 (可选): ') || '';

      const work = new WorkManager(title);
      const gen = new NovelGenerator(work);

      // 流水线
      console.log('\n--- 1. 生成世界观 ---');
      let result = await gen.generate('world', { genre, command });
      console.log(result.slice(0, 500) + '...\n');

      let confirm = await question('世界观生成完成，继续生成人设? (y/n): ');
      if (confirm.toLowerCase() !== 'y') break;

      console.log('\n--- 2. 生成人设 ---');
      result = await gen.generate('chars', { command });
      console.log(result.slice(0, 500) + '...\n');

      confirm = await question('人设生成完成，继续生成大纲? (y/n): ');
      if (confirm.toLowerCase() !== 'y') break;

      console.log('\n--- 3. 生成大纲 ---');
      result = await gen.generate('outline', { volumes: 10, chapters: 1500, command });
      console.log(result.slice(0, 500) + '...\n');

      confirm = await question('大纲生成完成，继续生成细纲? (y/n): ');
      if (confirm.toLowerCase() !== 'y') break;

      console.log('\n--- 4. 生成细纲 ---');
      result = await gen.generate('detail', { volume: 1, command });
      console.log(result.slice(0, 500) + '...\n');

      confirm = await question('细纲生成完成，继续生成正文? (y/n): ');
      if (confirm.toLowerCase() !== 'y') break;

      console.log('\n--- 5. 生成正文 ---');
      for (let ch = 1; ch <= 5; ch++) {
        result = await gen.generate('chapter', { chapter: ch, command });
        console.log(`第${ch}章完成 (${result.length}字)\n`);
        confirm = await question('继续写下一章? (y/n): ');
        if (confirm.toLowerCase() !== 'y') break;
      }

      console.log('\n========== 创作完成 ==========');
      console.log(`作品保存在: ${work.workDir}`);
      rl.close();
      break;
    }

    case '--status': {
      const title = params.title || '未命名作品';
      const work = new WorkManager(title);
      const ctx = work.getContext();
      console.log('\n========== 作品状态 ==========');
      console.log(`标题: ${title}`);
      console.log(`世界观: ${ctx.world ? '已生成 (' + ctx.world.length + '字)' : '未生成'}`);
      console.log(`人设: ${ctx.chars ? '已生成 (' + ctx.chars.length + '字)' : '未生成'}`);
      console.log(`大纲: ${ctx.outline ? '已生成 (' + ctx.outline.length + '字)' : '未生成'}`);
      console.log(`细纲: ${Object.keys(work.data.detail).length} 卷已生成`);
      console.log(`章节: ${work.data.chapters.filter(c => c).length} 章已生成`);
      console.log(`保存位置: ${work.workDir}`);
      break;
    }

    case '--help':
    default:
      console.log(`
========== 小说创作流水线 Skill ==========

用法:
  node pipeline.js --action <动作> [参数]

动作:
  --action generate_world   生成世界观
    --genre <题材>         小说题材 (默认: 玄幻)
    --title <标题>         作品标题
    --command <指令>       用户创作指令

  --action generate_chars  生成人设
    --title <标题>         作品标题
    --command <指令>       用户创作指令

  --action generate_outline 生成大纲
    --title <标题>         作品标题
    --volumes <卷数>       卷数 (默认: 10)
    --chapters <章数>      总章数 (默认: 1500)
    --command <指令>       用户创作指令

  --action generate_detail 生成细纲
    --title <标题>         作品标题
    --volume <卷号>        卷号 (默认: 1)
    --command <指令>       用户创作指令

  --action write_chapter   生成正文
    --title <标题>         作品标题
    --chapter <章号>        章号 (默认: 1)
    --command <指令>       用户创作指令

  --action status          查看作品状态
    --title <标题>         作品标题

  --interactive            交互式创作（每步确认）

  --help                   显示帮助

示例:
  node pipeline.js --action generate_world --genre 玄幻 --title 我的修仙小说 --command 写一个逆天改命的修仙故事
  node pipeline.js --action generate_chars --title 我的修仙小说
  node pipeline.js --action generate_outline --title 我的修仙小说 --volumes 12 --chapters 2000
  node pipeline.js --action generate_detail --title 我的修仙小说 --volume 1
  node pipeline.js --action write_chapter --title 我的修仙小说 --chapter 1
  node pipeline.js --interactive

配置:
  在 config.json 中设置 API 密钥和默认参数
`);
  }
}

// 导出模块供外部调用
module.exports = { WorkManager, NovelGenerator, MemoryStore, callAPI };

// 主入口
if (require.main === module) {
  main().catch(e => {
    log(`错误: ${e.message}`, 'error');
    process.exit(1);
  });
}
