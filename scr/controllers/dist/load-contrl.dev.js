"use strict";

var logger = require('../services/logger-config');

var PersBD = require('../db/db-seq');

var loadData = function loadData(request, response) {
  // logger.info(request.headers)
  var currentUser = request.body.currentUser;

  if (currentUser) {
    currentUser = currentUser.replace(/"/g, '');
    logger.info("Reqest-load - currentUser: ".concat(currentUser));
    PersBD.findAll({
      attributes: ['bdData'],
      where: {
        email: currentUser
      }
    }).then(function (res) {
      logger.info("Reqest-load - \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u044B \u0434\u0430\u043D\u043D\u044B\u0435 \u0438\u0437 \u0411\u0414 \u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u044B \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E: ".concat(currentUser));
      response.json(res); // logger.info(res);
    })["catch"](function (err) {
      logger.error("Reqest-load - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(err));
      response.json({
        result: 'Ошибка сервера'
      });
    });
  } else {
    var mes = 'Не определен Email!';
    logger.warn("Reqest-load - ".concat(mes));
    response.status(401).send({
      result: mes
    });
  }
};

module.exports = {
  loadData: loadData
};