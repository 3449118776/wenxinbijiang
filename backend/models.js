/**
 * 文心笔匠 后端 —— 数据模型
 * 使用 Sequelize + SQLite
 */

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/wxbj.db',
  logging: false,
  define: { timestamps: true }
});

// ===== 用户表 =====
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(200), allowNull: false },
  nickname: { type: DataTypes.STRING(60), defaultValue: '' },
  avatar: { type: DataTypes.STRING(300), defaultValue: '' },
  visitCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastVisitAt: { type: DataTypes.DATE }
}, {
  tableName: 'users',
  indexes: [{ fields: ['email'] }]
});

// ===== 作品 =====
const Work = sequelize.define('Work', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  workId: { type: DataTypes.STRING(60), allowNull: false, comment: '客户端 uuid' },
  title: { type: DataTypes.STRING(200), defaultValue: '' },
  category: { type: DataTypes.STRING(80), defaultValue: '' },
  synopsis: { type: DataTypes.STRING(1000), defaultValue: '' },
  payload: { type: DataTypes.TEXT('long'), defaultValue: '{}', comment: '作品完整内容 JSON' },
  version: { type: DataTypes.INTEGER, defaultValue: 1 },
  chapterCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalWords: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'works',
  indexes: [
    { fields: ['userId'] },
    { unique: true, fields: ['userId', 'workId'] }
  ]
});

// ===== 作品版本历史（每个作品的每次保存都能回溯） =====
const WorkSnapshot = sequelize.define('WorkSnapshot', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  workId: { type: DataTypes.INTEGER, allowNull: false },
  payloadHash: { type: DataTypes.STRING(64), defaultValue: '' },
  payload: { type: DataTypes.TEXT('long'), defaultValue: '{}' },
  version: { type: DataTypes.INTEGER, defaultValue: 1 },
  size: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'work_snapshots',
  indexes: [{ fields: ['workId'] }]
});

// ===== API 密钥 =====
const CloudApiKey = sequelize.define('CloudApiKey', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  provider: { type: DataTypes.STRING(30), allowNull: false },
  keyHash: { type: DataTypes.STRING(120), allowNull: false },
  last4: { type: DataTypes.STRING(8), defaultValue: '' }
}, {
  tableName: 'cloud_api_keys',
  indexes: [{ fields: ['userId'] }]
});

// ===== 同步日志 =====
const SyncLog = sequelize.define('SyncLog', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  workId: { type: DataTypes.STRING(60), allowNull: false },
  action: { type: DataTypes.STRING(30), defaultValue: 'sync' },
  device: { type: DataTypes.STRING(100), defaultValue: '' },
  ip: { type: DataTypes.STRING(45), defaultValue: '' }
}, {
  tableName: 'sync_logs',
  indexes: [{ fields: ['userId'] }, { fields: ['workId'] }]
});

// ===== 关系 =====
Work.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Work, { foreignKey: 'userId' });
Work.hasMany(WorkSnapshot, { foreignKey: 'workId' });
WorkSnapshot.belongsTo(Work, { foreignKey: 'workId' });

module.exports = { sequelize, User, Work, WorkSnapshot, CloudApiKey, SyncLog };