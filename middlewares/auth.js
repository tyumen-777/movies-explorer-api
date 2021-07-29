const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized');
const { JWT_SECRET } = require('../config');

module.exports = (req, res, next) => {
  // const token = req.headers.authorization;
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Требуется авторизация');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new UnauthorizedError('Требуется авторизация');
  }
  req.user = payload;

  return next();
};