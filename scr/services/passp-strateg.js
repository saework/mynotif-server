const logger = require('./logger-config');
const PersBD = require(`../db/db-seq`);
const LocalStrategy = require('passport-local').Strategy
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const bcrypt = require( 'bcrypt' );  // хеширование паролей
const config = require('../../config.js');
const jwtTokenKey = config.jwtTokenKey;

module.exports = (passport) => {
  // Проверка пользователя по LocalStrategy стратегии  
  passport.use(new LocalStrategy((username, password, done) => {
    logger.info(`Passport - Проверка пользователя по LocalStrategy пользователя: ${username})`);
    let user = null;
    if(username && password){
      PersBD.findOne({
        attributes:['hash'],
        where:{
          email:username
        }
      }).then(resHush=>{
        if (resHush){
          logger.info(`Passport - Получен hash пользователя`);
          const dbHash = resHush.hash;
          if (dbHash !== null) {
            const resPass = bcrypt.compareSync(password, dbHash);
            if (resPass){
              logger.info(`Passport - Пользователь аутентифицирован по LocalStrategy`);
              user = username;
              return done(null, user);
            }else{
              logger.info(`Passport - Не верный пароль пользователя`);
              return done(null, false);
            }
          } else {
            logger.info(`Passport - Не определен hash пользователя`);
            return done(null, false); 
          }
        }else{
          logger.info(`Passport - Пользователь отсутствует в системе`);
          return done(null, false); 
        }
      }).catch((err)=>{
        logger.error(`Passport - Ошибка: ${err}`);
        return done(err, null);
      });
    }else{
      logger.info(`Passport - Не определен логин или пароль`);
      return done(null, false)
    }
  }))

  // Проверка пользователя по JWTStrategy стратегии  
  let opts = {};
  opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = jwtTokenKey; 
  console.log(opts.jwtFromRequest);
  passport.use(new JWTStrategy(opts, (jwt_payload, done) => {
  logger.info(`Passport - Проверка пользователя по JWTStrategy`);
  let user = null;
  if (jwt_payload){
    const username = jwt_payload.user;
    if (username){
      PersBD.findOne({
        attributes:['jwtHash'],
        where:{
          email:username
        }
      }).then(resJwtHush=>{
        if (resJwtHush){
          logger.info(`Passport - Получен jwtHash пользователя ${username}`); 
          const dbJwtHash = resJwtHush.jwtHash;
          if (dbJwtHash !== null) {
            user = username;
            logger.info(`Passport - Пользователь аутентифицирован по JWTStrategy`);
            return done(null, user);
          } else {
            logger.info(`Passport - Не определен jwtHash пользователяy`);
            return done(null, false); 
          }
        }else{
          logger.info(`Passport - JwtHush пользователя отсутствует в системе`);
          return done(null, false); 
        }
      //}).catch(err=>console.log(err));
      }).catch((err)=>{
        logger.error(`Passport - Ошибка: ${err}`);
        return done(err, null);
      });
    }else{
      logger.info(`Passport - username не определен`);
      return done(null, false)
    }
  }else{
    logger.info(`Passport - jwt_payload не определен`);
    return done(null, false)
  }
  }));
}