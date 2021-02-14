"use strict";

var bcrypt = require('bcrypt'); // хеширование паролей


var LocalStrategy = require('passport-local').Strategy;

var passportJWT = require('passport-jwt');

var JWTStrategy = passportJWT.Strategy;
var ExtractJWT = passportJWT.ExtractJwt;

var config = require('../../config.js');

var PersBD = require('../db/db-seq');

var logger = require('./logger-config');

var jwtTokenKey = config.jwtTokenKey;

module.exports = function (passport) {
  // Проверка пользователя по LocalStrategy стратегии
  passport.use(new LocalStrategy(function (username, password, done) {
    logger.info("Passport - \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u043F\u043E LocalStrategy \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F: ".concat(username, ")"));
    var user = null;

    if (username && password) {
      PersBD.findOne({
        attributes: ['hash'],
        where: {
          email: username
        }
      }).then(function (resHush) {
        if (resHush) {
          logger.info('Passport - Получен hash пользователя');
          var dbHash = resHush.hash;

          if (dbHash !== null) {
            var resPass = bcrypt.compareSync(password, dbHash);

            if (resPass) {
              logger.info('Passport - Пользователь аутентифицирован по LocalStrategy');
              user = username;
              return done(null, user);
            }

            logger.info('Passport - Не верный пароль пользователя');
            return done(null, false);
          }

          logger.info('Passport - Не определен hash пользователя');
          return done(null, false);
        }

        logger.info('Passport - Пользователь отсутствует в системе');
        return done(null, false);
      })["catch"](function (err) {
        logger.error("Passport - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(err));
        return done(err, null);
      });
    } else {
      logger.info('Passport - Не определен логин или пароль');
      return done(null, false);
    } //  return done(null, false);

  })); // Проверка пользователя по JWTStrategy стратегии

  var opts = {};
  opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = jwtTokenKey;
  passport.use(new JWTStrategy(opts, function (jwtPayload, done) {
    logger.info('Passport - Проверка пользователя по JWTStrategy');
    var user = null;

    if (jwtPayload) {
      var username = jwtPayload.user;

      if (username) {
        PersBD.findOne({
          attributes: ['jwtHash'],
          where: {
            email: username
          }
        }).then(function (resJwtHush) {
          if (resJwtHush) {
            logger.info("Passport - \u041F\u043E\u043B\u0443\u0447\u0435\u043D jwtHash \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ".concat(username));
            var dbJwtHash = resJwtHush.jwtHash;

            if (dbJwtHash !== null) {
              user = username;
              logger.info('Passport - Пользователь аутентифицирован по JWTStrategy');
              return done(null, user);
            }

            logger.info('Passport - Не определен jwtHash пользователяy');
            return done(null, false);
          }

          logger.info('Passport - JwtHush пользователя отсутствует в системе');
          return done(null, false); // }).catch(err=>console.log(err));
        })["catch"](function (err) {
          logger.error("Passport - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(err));
          return done(err, null);
        });
      } else {
        logger.info('Passport - username не определен');
        return done(null, false);
      }
    } else {
      logger.info('Passport - jwtPayload не определен');
      return done(null, false);
    } //  return done(null, false);

  }));
};