"use strict";

var _ = require('lodash');

var bcrypt = require('bcrypt'); // хеширование паролей


var jwt = require('jsonwebtoken');

var PersBD = require('../db/db-seq');

var logger = require('./logger-config');

var config = require('../../config.js');

var jwtTokenKey = config.jwtTokenKey;

var generatePassword = function generatePassword() {
  var length = 8;
  var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var retVal = ''; // for (let i = 0, n = charset.length; i < length; ++i) {

  for (var i = 0, n = charset.length; i < length; i += 1) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }

  return retVal;
};

var createUserAccount = function createUserAccount(currentUser, password, response) {
  logger.info("CreateUserAccount - \u0437\u0430\u043F\u0443\u0441\u043A \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F: ".concat(currentUser));
  var passwordHash = bcrypt.hashSync(password, 10); // генерируем jwt токен

  var user = currentUser;
  var jwtToken = jwt.sign({
    user: user
  }, jwtTokenKey);
  var jwtHash = bcrypt.hashSync(jwtToken, 10);

  if (jwtToken && jwtHash) {
    PersBD.create({
      email: currentUser,
      bdData: '',
      hash: passwordHash,
      jwtHash: jwtHash
    }).then(function (resCreateUser) {
      if (!_.isEmpty(resCreateUser)) {
        logger.info('CreateUserAccount - Учетная запись создана');
        var resCr = {
          result: 'jwt',
          jwt: jwtToken
        };
        logger.info("CreateUserAccount - jwtToken:  ".concat(jwtToken));
        response.json(resCr);
        return resCr;
      }

      var mes = 'Учетная запись не создана. Ошибка БД';
      logger.warn("CreateUserAccount - ".concat(mes));
      response.json({
        result: 'Ошибка сервера'
      });
      return {
        result: mes
      }; // }).catch(err=>logger.info(err));
    })["catch"](function (err) {
      logger.error("CreateUserAccount - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(err));
      response.json({
        result: 'Ошибка сервера'
      });
      return {
        result: err
      };
    });
  } else {
    var mes = 'Учетная запись не создана. Ошибка генерации hash';
    logger.warn("CreateUserAccount - ".concat(mes));
    response.json({
      result: 'Ошибка сервера'
    });
    return {
      result: mes
    };
  } //  return null;

};

var deleteUserAccount = function deleteUserAccount(currentUser) {
  logger.info("DeleteUserAccount - \u0437\u0430\u043F\u0443\u0441\u043A \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F: ".concat(currentUser));

  if (currentUser) {
    PersBD.destroy({
      where: {
        email: currentUser
      }
    }).then(function (resDeleteUser) {
      if (resDeleteUser === 1) {
        var _mes = 'Учетная запись удалена';
        logger.info("DeleteUserAccount - ".concat(_mes));
        return _mes;
      }

      var mes = 'Учетная запись не удалена. Ошибка БД';
      logger.warn("DeleteUserAccount - ".concat(mes));
      return mes;
    })["catch"](function (err) {
      logger.error("DeleteUserAccount - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(err));
      return err;
    });
  } else {
    var mes = 'Не определен Email пользователя';
    logger.warn("DeleteUserAccount - ".concat(mes));
    return mes;
  } // return null;

};

module.exports = {
  generatePassword: generatePassword,
  createUserAccount: createUserAccount,
  deleteUserAccount: deleteUserAccount
};