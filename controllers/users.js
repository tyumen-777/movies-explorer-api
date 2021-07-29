const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request');
const UnauthorizedError = require('../errors/unauthorized');
const ConflictError = require('../errors/conflict-error');
const { JWT_SECRET } = require('../config');

const getMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.status(200).send({ data: user });
    })
    .catch(next);
};

const updateMe = (req, res, next) => {
  const { name, email } = req.body;
  const owner = req.user._id;
  return User.findByIdAndUpdate(owner, { name, email }, { new: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.send(user);
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.send({ token });
    })
    .catch(() => {
      throw new UnauthorizedError('Неправильная почта или пароль');
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, password, email,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, password: hash, email,
    }))
    .then((user) => res.status(200).send({ email: user.email }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequestError('Данные не прошли валидацию');
      }
      if (err.name === 'MongoError' || err.code === '11000') {
        throw new ConflictError('Такой емейл уже зарегистрирован');
      }
    })
    .catch(next);
};

module.exports = {
  createUser, login, getMe, updateMe,
};