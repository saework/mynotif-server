const logger = require('../services/logger-config');
const PersBD = require('../db/db-seq');
const cronFunc = require('../cron/cron-func');

const home = (request, response) => {
  const date = request.body.data;
  if (date) {
    // Действия при сохранении данных в БД
    const bdRows = JSON.stringify(date.rootReducer);
    const bdRowsArr = date.rootReducer.bdRows;
    let currentUser = JSON.stringify(date.currentUser);
    if (currentUser) {
      currentUser = currentUser.replace(/"/g, '');
      logger.info(`Reqest-home - currentUser: ${currentUser}`);
      PersBD.findAll({
        where: {
          email: currentUser,
        },
      })
        .then((res) => {
          if (res.length > 0) {
            logger.info(`Reqest-home - Изменение записи в базе (изменены задачи пользователя: ${currentUser}`);
            PersBD.update(
              { bdData: bdRows },
              {
                where: {
                  email: currentUser,
                },
              }
            )
              .then((resUpd) => {
                if (resUpd[0] === 1) {
                  const mes = 'Данные таблицы обновлены';
                  response.json({ result: 'OK', mes });
                  logger.info('Reqest-home - Запуск функции updateAndStartCronTasks');
                  cronFunc.updateAndStartCronTasksByForUser(bdRowsArr, currentUser);
                } else {
                  response.json({ result: 'OK', mes: 'Обновление таблицы не требуется' });
                  logger.info('Reqest-home - Обновление таблицы не требуется');
                }
              })
              .catch((err) => {
                logger.error(`Reqest-home - Ошибка: ${err}`);
                response.json({ result: 'Ошибка сервера' });
              });
          }
        })
        .catch((err) => {
          logger.error(`Reqest-home - Ошибка: ${err}`);
          response.json({ result: 'Ошибка сервера' });
        });
    } else {
      const mes = 'Не определен Email!';
      logger.warn(`Reqest-home - ${mes}`);
      response.status(401).send({ result: mes });
    }
  } else {
    logger.warn('Reqest-home - переменная date не оределена');
    response.json({ result: 'Ошибка сервера' });
  }
};

module.exports = {
  home,
};
