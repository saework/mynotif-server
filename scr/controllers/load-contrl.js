const logger = require('../services/logger-config');
const PersBD = require('../db/db-seq');

const loadData = (request, response) => {
  let { currentUser } = request.body;
  if (currentUser) {
    currentUser = currentUser.replace(/"/g, '');
    logger.info(`Reqest-load - currentUser: ${currentUser}`);
    PersBD.findAll({
      attributes: ['bdData'],
      where: {
        email: currentUser,
      },
    })
      .then((res) => {
        logger.info(`Reqest-load - Получены данные из БД и отправлены пользователю: ${currentUser}`);
        response.json(res);
      })
      .catch((err) => {
        logger.error(`Reqest-load - Ошибка: ${err}`);
        response.json({ result: 'Ошибка сервера' });
      });
  } else {
    const mes = 'Не определен Email!';
    logger.warn(`Reqest-load - ${mes}`);
    response.status(401).send({ result: mes });
  }
};

module.exports = {
  loadData,
};
