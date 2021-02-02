const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const bcrypt = require('bcrypt'); // хеширование паролей
const config = require('../../config.js');
const PersBD = require('../db/db-seq');
const logger = require('./logger-config');

const jwtTokenKey = config.jwtTokenKey;

module.exports = (passport) => {
  // Проверка пользователя по LocalStrategy стратегии
  passport.use(
    new LocalStrategy((username, password, done) => {
      logger.info(`Passport - Проверка пользователя по LocalStrategy пользователя: ${username})`);
      let resLS = done(null, null);
      let user = null;
      if (username && password) {
        PersBD.findOne({
          attributes: ['hash'],
          where: {
            email: username,
          },
        })
          .then((resHush) => {
            if (resHush) {
              logger.info('Passport - Получен hash пользователя');
              const dbHash = resHush.hash;
              if (dbHash !== null) {
                const resPass = bcrypt.compareSync(password, dbHash);
                if (resPass) {
                  logger.info('Passport - Пользователь аутентифицирован по LocalStrategy');
                  user = username;
                  // return done(null, user);
                  resLS = done(null, user);
                }
                logger.info('Passport - Не верный пароль пользователя');
                // return done(null, false);
                resLS = done(null, false);
              }
              logger.info('Passport - Не определен hash пользователя');
              // return done(null, false);
              resLS = done(null, false);
            }
            logger.info('Passport - Пользователь отсутствует в системе');
            // return done(null, false);
            resLS = done(null, false);
          })
          .catch((err) => {
            logger.error(`Passport - Ошибка: ${err}`);
            // return done(err, null);
            resLS = done(err, null);
          });
      } else {
        logger.info('Passport - Не определен логин или пароль');
        // return done(null, false);
        resLS = done(null, false);
      }
      return resLS;
    })
  );

  // Проверка пользователя по JWTStrategy стратегии
  const opts = {};
  opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = jwtTokenKey;
  passport.use(
    new JWTStrategy(opts, (jwtPayload, done) => {
      logger.info('Passport - Проверка пользователя по JWTStrategy');
      let resJWT = done(null, null);
      let user = null;
      if (jwtPayload) {
        const username = jwtPayload.user;
        if (username) {
          PersBD.findOne({
            attributes: ['jwtHash'],
            where: {
              email: username,
            },
          })
            .then((resJwtHush) => {
              if (resJwtHush) {
                logger.info(`Passport - Получен jwtHash пользователя ${username}`);
                const dbJwtHash = resJwtHush.jwtHash;
                if (dbJwtHash !== null) {
                  user = username;
                  logger.info('Passport - Пользователь аутентифицирован по JWTStrategy');
                  // return done(null, user);
                  resJWT = done(null, user);
                }
                logger.info('Passport - Не определен jwtHash пользователяy');
                // return done(null, false);
                resJWT = done(null, false);
              }
              logger.info('Passport - JwtHush пользователя отсутствует в системе');
              // return done(null, false);
              resJWT = done(null, false);

              // }).catch(err=>console.log(err));
            })
            .catch((err) => {
              logger.error(`Passport - Ошибка: ${err}`);
              // return done(err, null);
              resJWT = done(err, null);
            });
        } else {
          logger.info('Passport - username не определен');
          // return done(null, false);
          resJWT = done(null, false);
        }
      } else {
        logger.info('Passport - jwtPayload не определен');
        // return done(null, false);
        resJWT = done(null, false);
      }
      return resJWT;
    })
  );
};
