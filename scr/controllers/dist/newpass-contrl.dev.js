"use strict";

var bcrypt = require('bcrypt'); // хеширование паролей


var PersBD = require('../db/db-seq');

var userFunc = require('../services/user-func');

var emailFunc = require('../services/email-func');

var logger = require('../services/logger-config');

var newpassword = function newpassword(request, response) {
  var currentUser = request.body.data.currentUser;

  if (currentUser) {
    var newPassword = userFunc.generatePassword();
    var passwordHash = bcrypt.hashSync(newPassword, 10);

    if (passwordHash) {
      logger.info("Reqest-newpassword - \u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0437\u0430\u043F\u0438\u0441\u0438 \u0432 \u0411\u0414 (\u0438\u0437\u043C\u0435\u043D\u0435\u043D hash \u043F\u0430\u0440\u043E\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F: ".concat(currentUser, ")"));
      PersBD.update({
        hash: passwordHash
      }, {
        where: {
          email: currentUser
        }
      }).then(function (res) {
        if (res[0] === 1) {
          var emailCapt = 'Сервис mynotif.ru - пароль сброшен';
          var emailText = "<b>\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C:</b><b>".concat(newPassword, "</b>");
          emailFunc.sendEmail(currentUser, emailCapt, emailText);
          var mes = 'Новый пароль отправлен на Ваш Email';
          logger.info("Reqest-newpassword - ".concat(mes));
          response.json({
            result: 'OK',
            mes: mes
          });
        }
      })["catch"](function (err) {
        logger.error("Reqest-newpassword - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(err));
        response.json({
          result: 'Ошибка сервера'
        });
      });
    } else {
      var mes = 'Пароль не обновлен. Не определен hash нового пароля.';
      logger.warn("Reqest-newpassword - ".concat(mes));
      response.json({
        result: mes
      });
    }
  } else {
    var _mes = 'Пароль не обновлен. Не определен email.';
    logger.warn("Reqest-newpassword - ".concat(_mes));
    response.json({
      result: _mes
    });
  }
};

module.exports = {
  newpassword: newpassword
};