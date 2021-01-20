const LocalStrategy = require('passport-local').Strategy
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const config = require('../config.js');
const jwtTokenKey = config.jwtTokenKey;

module.exports = (passport) => {
 
    passport.use(new LocalStrategy((username, password, done) => {
        console.log('localStrategi');
        // here should be a look up to the database for username and password and comparison with an accepted username and password
        user = "test@test"
        return done(null, user, { message: 'Logged In Successfully' })
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
  opts.secretOrKey = 'jwt_secret_key'; //config.secret;
  console.log(opts.jwtFromRequest);
  passport.use(new JWTStrategy(opts, (jwt_payload, done) => {
    console.log("JWTStrategy")

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