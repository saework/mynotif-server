"use strict";

var passport = require('passport');

require('../services/passp-strateg.js')(passport);

var bcrypt = require('bcrypt'); // хеширование паролей


var jwt = require('jsonwebtoken');

var config = require('../../config.js');

var PersBD = require('../db/db-seq');

var logger = require('../services/logger-config');

var jwtTokenKey = config.jwtTokenKey;

var login = function login(request, response) {
  passport.authenticate('local', {
    session: false
  }, function (err, user) {
    if (err) {
      var mes = 'Ошибка аутентификации!';
      logger.error("Reqest-login - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(mes, ": ").concat(err));
      return response.status(401).json({
        result: mes,
        err: err
      });
    }

    if (!user) {
      var _mes = 'Не верный логин или пароль!';
      logger.warn("Reqest-login - ".concat(_mes));
      return response.status(401).json({
        result: _mes,
        err: null
      });
    }

    request.login(user, {
      session: false
    }, function (errLogin) {
      if (errLogin) {
        var _mes2 = 'Ошибка аутентификации!';
        logger.error("Reqest-login - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(_mes2, ": ").concat(errLogin));
        response.status(401).json({
          result: _mes2,
          errLogin: errLogin
        });
      }

      logger.info('Reqest-login - Аутентификация пользователя по LocalStrategy пройдена');
      var jwtToken = jwt.sign({
        user: user
      }, jwtTokenKey); // Генерируем jwt токен

      logger.info("Reqest-login - jwtToken: ".concat(jwtToken));
      var jwtHash = bcrypt.hashSync(jwtToken, 10); // Преобразуем jwt в hash для записи в БД

      if (jwtHash) {
        PersBD.update({
          jwtHash: jwtHash
        }, {
          where: {
            email: user
          }
        }).then(function (res) {
          if (res[0] === 1) {
            logger.info("Reqest-login - jwtHash \u0437\u0430\u043F\u0438\u0441\u0430\u043D \u0432 \u0411\u0414 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F: ".concat(user));
            response.json({
              jwtToken: jwtToken
            });
            return jwtToken;
          } // }).catch(err=>logger.info(err));
          //  return null;

        })["catch"](function (errUpd) {
          logger.error("Reqest-login - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(errUpd));
          response.json({
            result: 'Ошибка сервера'
          });
        });
      } else {
        var _mes3 = 'Не определен jwtHash. Вход в систему отклонен.';
        logger.warn("Reqest-login - ".concat(_mes3));
        return response.json({
          result: 'Ошибка сервера'
        });
      } // return null;

    }); // return null;
  })(request, response);
};

module.exports = {
  login: login
};