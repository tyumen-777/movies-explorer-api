const routerUsers = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  createUser, login, getMe, updateMe,
} = require('../controllers/users');
const auth = require('../middlewares/auth');

routerUsers.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);
routerUsers.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

routerUsers.use(auth);
routerUsers.get('/users/me', getMe);
routerUsers.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().required().email().required(),
  }),
}), updateMe);

module.exports = routerUsers;
