const LocalStrategy = require('passport-local').Strategy
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const config = require('../../config.js');
const jwtTokenKey = config.jwtTokenKey;
const PersBD = require(`../db/db-seq`);
const bcrypt = require( 'bcrypt' );  // хеширование паролей

module.exports = (passport) => {
 
    passport.use(new LocalStrategy((username, password, done) => {
      console.log('<<Проверка пользователя по LocalStrategy>>');
      let user = null;
      if(username && password){
        PersBD.findOne({
          attributes:['hash'],
          where:{
            email:username
          }
        }).then(resHush=>{
          if (resHush){
            console.log("<< Получен hash пользователя >>");  
            const dbHash = resHush.hash;
            if (dbHash !== null) {
              const resPass = bcrypt.compareSync(password, dbHash);
              if (resPass){
                console.log('<< Пользователь аутентифицирован >>');
                user = username;
                return done(null, user);
              }else{
                console.log('<< Не верный пароль пользователя >>');
                return done(null, false);
              }
            } else {
              console.log("<< Не определен hash пользователя >>");
              return done(null, false); 
            }
          }else{
            console.log("<< Пользователь отсутствует в системе >>");
            return done(null, false); 
          }
        }).catch(err=>console.log(err));

      }else{
        console.log('<<Не определен логин или пароль>>');
        return done(null, false)
      }
    }))

//     passport.use(new JWTStrategy({
//         jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//         secretOrKey   : 'jwt_secret_key'
//     },
//     function (jwtPayload, cb) {
//         console.log('jwtPayload', jwtPayload)
//         user = "test@test"
//         return done(null, user, { message: 'Logged In Successfully' })
//     }
// ));

    // passport.use(new JWTStrategy({
    //     jwtFromRequest: 
    //     ExtractJWT.fromAuthHeaderAsBearerToken(),
    //     //ExtractJWT.fromAuthHeaderWithScheme('Bearer'),
    //     secretOrKey: jwtTokenKey
    //     }, (jwtPayload, done) => {
    //     // find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    //     console.log('jwtPayload = ', jwtPayload)
    //     const user = "test@test"
    //     return done(null, user)
    //     }))   


  let opts = {};
  opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = jwtTokenKey; 
  console.log(opts.jwtFromRequest);
  passport.use(new JWTStrategy(opts, (jwt_payload, done) => {
    console.log("<< Проверка пользователя по JWTStrategy >>")
    console.log(jwt_payload)
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
            console.log("<< Получен jwtHash пользователя >>");  
            const dbJwtHash = resJwtHush.jwtHash;
            if (dbJwtHash !== null) {
              user = username;
              return done(null, user);
            } else {
              console.log("<< Не определен jwtHash пользователя >>");
              return done(null, false); 
            }
          }else{
            console.log("<< JWt пользователя отсутствует в системе >>");
            return done(null, false); 
          }
        //}).catch(err=>console.log(err));
        }).catch((err)=>{
          console.log(err)
          return done(err);
        });
      }else{
        console.log('<< username не определен >>');
        return done(null, false)
      }
    }else{
      console.log('<< jwt_payload не определен>>');
      return done(null, false)
    }

    // const user = null;
    // if(username && password){
    //   PersBD.findOne({
    //     attributes:['hash'],
    //     where:{
    //       email:username
    //     }
    //   }).then(resHush=>{
    //     console.log("<<Получен hash пользователя>>");
    //     if (resHush !== null) {
    //       const passwordHash = bcrypt.hashSync(password, 10 );
    //       if (passwordHash===resHush){
    //         console.log('<<Пользователь аутентифицирован>>');
    //         user = username;
    //         return done(null, user);
    //       }else{
    //         console.log('<<Не верный пароль пользователя>>');
    //         return done(null, false);
    //       }

    //     } else {
    //       console.log("<<Не определен hash пользователя>>");
    //       return done(null, false); 
    //     }
    //   }).catch(err=>console.log(err));

    // }else{
    //   console.log('<<Не определен логин или пароль>>');
    //   return done(null, false)
    // }


    // User.findById(jwt_payload.data._id, (err, User) => {
    //   if(err){
    //     return done(err, false);
    //   }

    //   if(User){
    //     return done(null, User);
    //   } else {
    //     return done(null, false);
    //   }
    // });

    // console.log(user)
    // User = "test@test"
    // return done(null, User);
  }));
}