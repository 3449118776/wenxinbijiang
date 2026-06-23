/**
 * JWT 认证中间件
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[Auth] JWT_SECRET 环境变量未设置，服务无法启动');
  process.exit(1);
}

function generateToken(userId, email) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '30d' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: '请先登录' });
  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return res.status(401).json({ error: '令牌无效' });
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

module.exports = { generateToken, verifyToken, authMiddleware, JWT_SECRET };