"use strict";

var PersBD = require('../db/db-seq');

var userFunc = require('../services/user-func');

var logger = require('../services/logger-config');

var signup = function signup(request, response) {
  var currentUser = request.body.username;
  var password = request.body.password;

  if (currentUser && password) {
    currentUser = currentUser.replace(/"/g, '');

    if (currentUser) {
      logger.info("Reqest-signup - currentUser: ".concat(currentUser));
      PersBD.findOne({
        attributes: ['hash'],
        where: {
          email: currentUser
        }
      }).then(function (resHush) {
        logger.info("Reqest-signup - \u041F\u043E\u043B\u0443\u0447\u0435\u043D hash \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ".concat(currentUser));

        if (resHush === null) {
          logger.info('Reqest-signup - запуск функции createUserAccount');
          userFunc.createUserAccount(currentUser, password, response);
        } else {
          var mes = 'Уже существует пользователь с таким email!';
          logger.info("Reqest-signup - ".concat(mes));
          response.json({
            result: mes
          });
        }
      })["catch"](function (err) {
        logger.error("Reqest-signup - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(err));
        response.json({
          result: 'Ошибка сервера'
        });
      });
    }
  } else {
    var mes = 'Учетная запись не создана. Не определены email или пароль.';
    logger.warn("Reqest-signup - ".concat(mes));
    response.json({
      result: mes
    });
  }
};

module.exports = {
  signup: signup
};