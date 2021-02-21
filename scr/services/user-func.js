const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PersBD = require('../db/db-seq');
const logger = require('./logger-config');
const config = require('../../config.js');

const jwtTokenKey = config.jwtTokenKey;

const generatePassword = () => {
  const length = 8;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; i += 1) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

const createUserAccount = (currentUser, password, response) => {
  logger.info(`CreateUserAccount - запуск функции для пользователя: ${currentUser}`);
  const passwordHash = bcrypt.hashSync(password, 10);
  // Генерация jwt
  const user = currentUser;
  const jwtToken = jwt.sign({ user }, jwtTokenKey);
  const jwtHash = bcrypt.hashSync(jwtToken, 10);
  if (jwtToken && jwtHash) {
    PersBD.create({
      email: currentUser,
      bdData: '',
      hash: passwordHash,
      jwtHash,
    })
      .then((resCreateUser) => {
        if (!_.isEmpty(resCreateUser)) {
          logger.info('CreateUserAccount - Учетная запись создана');
          const resCr = { result: 'jwt', jwt: jwtToken };
          logger.info(`CreateUserAccount - jwtToken:  ${jwtToken}`);
          response.json(resCr);
          return resCr;
        }
        const mes = 'Учетная запись не создана. Ошибка БД';
        logger.warn(`CreateUserAccount - ${mes}`);
        response.json({ result: 'Ошибка сервера' });
        return { result: mes };
      })
      .catch((err) => {
        logger.error(`CreateUserAccount - Ошибка: ${err}`);
        response.json({ result: 'Ошибка сервера' });
        return { result: err };
      });
  } else {
    const mes = 'Учетная запись не создана. Ошибка генерации hash';
    logger.warn(`CreateUserAccount - ${mes}`);
    response.json({ result: 'Ошибка сервера' });
    return { result: mes };
  }
};

const deleteUserAccount = (currentUser) => {
  logger.info(`DeleteUserAccount - запуск функции для пользователя: ${currentUser}`);
  if (currentUser) {
    PersBD.destroy({
      where: { email: currentUser },
    })
      .then((resDeleteUser) => {
        if (resDeleteUser === 1) {
          const mes = 'Учетная запись удалена';
          logger.info(`DeleteUserAccount - ${mes}`);
          return mes;
        }
        const mes = 'Учетная запись не удалена. Ошибка БД';
        logger.warn(`DeleteUserAccount - ${mes}`);
        return mes;
      })
      .catch((err) => {
        logger.error(`DeleteUserAccount - Ошибка: ${err}`);
        return err;
      });
  } else {
    const mes = 'Не определен Email пользователя';
    logger.warn(`DeleteUserAccount - ${mes}`);
    return mes;
  }
};

module.exports = {
  generatePassword,
  createUserAccount,
  deleteUserAccount,
};
