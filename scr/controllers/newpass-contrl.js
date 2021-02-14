const bcrypt = require('bcrypt'); // хеширование паролей
const PersBD = require('../db/db-seq');
const userFunc = require('../services/user-func');
const emailFunc = require('../services/email-func');
const logger = require('../services/logger-config');

const newpassword = (request, response) => {
  const { currentUser } = request.body.data;
  if (currentUser) {
    const newPassword = userFunc.generatePassword();
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    if (passwordHash) {
      logger.info(`Reqest-newpassword - Изменение записи в БД (изменен hash пароля пользователя: ${currentUser})`);
      PersBD.update(
        { hash: passwordHash },
        {
          where: {
            email: currentUser,
          },
        }
      )
        .then((res) => {
          if (res[0] === 1) {
            const emailCapt = 'Сервис mynotif.ru - пароль сброшен';
            const emailText = `<b>Новый пароль:</b><b>${newPassword}</b>`;
            emailFunc.sendEmail(currentUser, emailCapt, emailText);
            const mes = 'Новый пароль отправлен на Ваш Email';
            logger.info(`Reqest-newpassword - ${mes}`);
            response.json({ result: 'OK', mes });
          }
        })
        .catch((err) => {
          logger.error(`Reqest-newpassword - Ошибка: ${err}`);
          response.json({ result: 'Ошибка сервера' });
        });
    } else {
      const mes = 'Пароль не обновлен. Не определен hash нового пароля.';
      logger.warn(`Reqest-newpassword - ${mes}`);
      response.json({ result: mes });
    }
  } else {
    const mes = 'Пароль не обновлен. Не определен email.';
    logger.warn(`Reqest-newpassword - ${mes}`);
    response.json({ result: mes });
  }
};
module.exports = {
  newpassword,
};
