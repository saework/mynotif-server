"use strict";

var logger = require('../services/logger-config');

var PersBD = require('../db/db-seq');

var cronFunc = require('../cron/cron-func');

var home = function home(request, response) {
  var date = request.body.data;
  logger.info('Reqest-home - date:');
  logger.info(date);

  if (date) {
    // Действия при сохранении данных в БД
    var bdRows = JSON.stringify(date.bdRows);
    var bdRowsArr = date.bdRows.bdRows;
    var currentUser = JSON.stringify(date.currentUser);

    if (currentUser) {
      currentUser = currentUser.replace(/"/g, '');
      logger.info("Reqest-home - currentUser: ".concat(currentUser));
      PersBD.findAll({
        where: {
          email: currentUser
        }
      }).then(function (res) {
        // logger.info(res)
        if (res.length > 0) {
          logger.info("Reqest-home - \u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0437\u0430\u043F\u0438\u0441\u0438 \u0432 \u0431\u0430\u0437\u0435 (\u0438\u0437\u043C\u0435\u043D\u0435\u043D\u044B \u0437\u0430\u0434\u0430\u0447\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F: ".concat(currentUser));
          PersBD.update({
            bdData: bdRows
          }, {
            where: {
              email: currentUser
            }
          }).then(function (resUpd) {
            if (resUpd[0] === 1) {
              var mes = 'Данные таблицы обновлены';
              response.json({
                result: 'OK',
                mes: mes
              });
              logger.info('Reqest-home - Запуск функции updateAndStartCronTasks'); // logger.info(`Reqest-home - res.body: ${response.body}`);

              cronFunc.updateAndStartCronTasksByForUser(bdRowsArr, currentUser);
            } else {
              response.json({
                result: 'OK',
                mes: 'Обновление таблицы не требуется'
              });
              logger.info('Reqest-home - Обновление таблицы не требуется');
            }
          })["catch"](function (err) {
            logger.error("Reqest-home - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(err));
            response.json({
              result: 'Ошибка сервера'
            });
          });
        }
      })["catch"](function (err) {
        logger.error("Reqest-home - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(err));
        response.json({
          result: 'Ошибка сервера'
        });
      });
    } else {
      var mes = 'Не определен Email!';
      logger.warn("Reqest-home - ".concat(mes));
      response.status(401).send({
        result: mes
      });
    }
  } else {
    logger.warn('Reqest-home - переменная date не оределена');
    response.json({
      result: 'Ошибка сервера'
    });
  }
};

module.exports = {
  home: home
};