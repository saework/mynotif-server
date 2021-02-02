const PersBD = require('../db/db-seq');
const userFunc = require('../services/user-func');
const logger = require('../services/logger-config');

const signup = (request, response) => {
  let currUserEmail = request.body.username;
  const { password } = request.body;
  if (currUserEmail && password) {
    currUserEmail = currUserEmail.replace(/"/g, '');
    if (currUserEmail) {
      logger.info(`Reqest-signup - currUserEmail: ${currUserEmail}`);
      PersBD.findOne({
        attributes: ['hash'],
        where: {
          email: currUserEmail,
        },
      })
        .then((resHush) => {
          logger.info(`Reqest-signup - Получен hash пользователя ${currUserEmail}`);
          if (resHush === null) {
            logger.info('Reqest-signup - запуск функции createUserAccount');
            userFunc.createUserAccount(currUserEmail, password, response);
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
