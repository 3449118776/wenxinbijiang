/**
 * 文心笔匠 后端 — 主服务入口
 */
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const { sequelize } = require('./models');
const routes = require('./routes');

const PORT = process.env.PORT || 3456;

const app = express();

// 安全头 + 压缩
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());

// 跨域（允许前端任意域名访问）
app.use(cors({ origin: true, credentials: true }));

// 请求体解析（10MB 上限，大作品够用）
app.use(express.json({ limit: '10mb' }));

// 静态文件：仅暴露前端 www 目录
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'www')));

// API 路由
app.use('/api', routes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// 数据库初始化 + 启动
(async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] SQLite 连接成功');
    await sequelize.sync({ alter: false });
    console.log('[DB] 表结构同步完成');

    app.listen(PORT, () => {
      console.log(`[Server] 文心笔匠云端后端启动于 http://localhost:${PORT}`);
      console.log(`[Server] API 地址: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('[Server] 启动失败:', err.message);
    process.exit(1);
  }
})();