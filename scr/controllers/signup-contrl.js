const PersBD = require('../db/db-seq');
const userFunc = require('../services/user-func');
const logger = require('../services/logger-config');

const signup = (request, response) => {
  let currentUser = request.body.username;
  const { password } = request.body;
  if (currentUser && password) {
    currentUser = currentUser.replace(/"/g, '');
    if (currentUser) {
      logger.info(`Reqest-signup - currentUser: ${currentUser}`);
      PersBD.findOne({
        attributes: ['hash'],
        where: {
          email: currentUser,
        },
      })
        .then((resHush) => {
          logger.info(`Reqest-signup - Получен hash пользователя ${currentUser}`);
          if (resHush === null) {
            logger.info('Reqest-signup - запуск функции createUserAccount');
            userFunc.createUserAccount(currentUser, password, response);
          } else {
            const mes = 'Уже существует пользователь с таким email!';
            logger.info(`Reqest-signup - ${mes}`);
            response.json({ result: mes });
          }
        })
        .catch((err) => {
          logger.error(`Reqest-signup - Ошибка: ${err}`);
          response.json({ result: 'Ошибка сервера' });
        });
    }
  } else {
    const mes = 'Учетная запись не создана. Не определены email или пароль.';
    logger.warn(`Reqest-signup - ${mes}`);
    response.json({ result: mes });
  }
};

module.exports = {
  signup,
};
