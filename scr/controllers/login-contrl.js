const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // хеширование паролей
const passport = require('passport');
const PersBD = require('../db/db-seq');
require('../services/passp-strateg.js')(passport);
const config = require('../../config.js');
const logger = require('../services/logger-config');

const { jwtTokenKey } = config;

const login = (request, response) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err) {
      const mes = 'Ошибка аутентификации!';
      logger.error(`Reqest-login - Ошибка: ${mes}: ${err}`);
      response.status(401).json({ result: mes, err });
    }
    if (!user) {
      const mes = 'Не верный логин или пароль!';
      logger.warn(`Reqest-login - ${mes}`);
      response.status(401).json({ result: mes, err: null });
    }
    request.login(user, { session: false }, (errLogin) => {
      if (errLogin) {
        const mes = 'Ошибка аутентификации!';
        logger.error(`Reqest-login - Ошибка: ${mes}: ${errLogin}`);
        response.status(401).json({ result: mes, errLogin });
      }
      logger.info('Reqest-login - Аутентификация пользователя по LocalStrategy пройдена');
      const jwtToken = jwt.sign({ user }, jwtTokenKey); // Генерируем jwt токен
      logger.info(`Reqest-login - jwtToken: ${jwtToken}`);
      const jwtHash = bcrypt.hashSync(jwtToken, 10); // Преобразуем jwt в hash для записи в БД
      if (jwtHash) {
        PersBD.update(
          { jwtHash },
          {
            where: {
              email: user,
            },
          }
        )
          .then((res) => {
            if (res[0] === 1) {
              logger.info(`Reqest-login - jwtHash записан в БД для пользователя: ${user}`);
              response.json({ jwtToken });
            }
          })
          .catch((errUpd) => {
            logger.error(`Reqest-login - Ошибка: ${errUpd}`);
            response.json({ result: 'Ошибка сервера' });
          });
      } else {
        const mes = 'Не определен jwtHash. Вход в систему отклонен.';
        logger.warn(`Reqest-login - ${mes}`);
        response.json({ result: 'Ошибка сервера' });
      }
    });
  })(request, response);
};

module.exports = {
  login,
};
