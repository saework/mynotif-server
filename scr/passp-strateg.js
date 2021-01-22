const LocalStrategy = require('passport-local').Strategy
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const config = require('../config.js');
const jwtTokenKey = config.jwtTokenKey;
const PersBD = require(`./db-seq`);
const bcrypt = require( 'bcrypt' );  // хеширование паролей

module.exports = (passport) => {
 
    passport.use(new LocalStrategy((username, password, done) => {
      console.log('<<Проверка пользователя по localStrategi>>');
      const user = null;
      if(username && password){
        PersBD.findOne({
          attributes:['hash'],
          where:{
            email:username
          }
        }).then(resHush=>{
          console.log("<<Получен hash пользователя>>");
          const dbHash = resHush.hash;
          if (dbHash !== null) {
            const passwordHash = bcrypt.hashSync(password, 10 );
            if (passwordHash===dbHash){
              console.log('<<Пользователь аутентифицирован>>');
              user = username;
              return done(null, user);
            }else{
              console.log('<<Не верный пароль пользователя>>');
              return done(null, false);
            }

          } else {
            console.log("<<Не определен hash пользователя>>");
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
    console.log("<<Проверка пользователя по localStrategi>>")
    console.log(jwt_payload)
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

    console.log(user)
    User = "test@test"
    return done(null, User);
  }));
}