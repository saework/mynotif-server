"use strict";

var express = require("express"); //require('./scr/pass');


var cron = require('node-cron');

var _ = require('lodash');

var bodyParser = require("body-parser"); //const app = express();


var config = require('./config.js');

var cronFunc = require("./scr/cron-func");

var cronTasks = require("./scr/cron-tasks");

var PersBD = require("./scr/db-seq");

var jwt = require('jsonwebtoken');

var React = require('react');

var Router = require('react-router');

var passport = require('passport');

require('./scr/passp-strateg.js')(passport);

var bcrypt = require('bcrypt'); // хеширование паролей
//const LocalStrategy = require('passport-local').Strategy;
//!!! добавить защиту от sql-инъекций для форм !!! ////
//!!! удалить react, react-router !!!
//!!! проверка на дубликат пользователя !!!


var TIMEZONE = config.TIMEZONE;
var timeStopCronTasks = config.timeStopCronTasks;
var timeStartCronTasks = config.timeStartCronTasks;
var jwtTokenKey = config.jwtTokenKey;
var app = express(); //app.use(express.bodyParser());
//   app.use(passport.initialize());
//   app.use(passport.session());

app.use(function (req, res, next) {
  ///!!! убрать !!!
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); ///!!! убрать!!!

  next();
});
app.use(express["static"](__dirname + "/public"));
app.use(express.json()); //!!! перезагружает страницу при роутинге - не подходит!!!
// app.get('/*', (request, response) => {
// 	//response.sendFile(path.join(__dirname, './public/index.html'));
// 	response.sendFile(__dirname + "/public/index.html");
// });
// app.get('/', (request, response) => {
// 	//response.sendFile(path.join(__dirname, './public/index.html'));
// 	response.sendFile(__dirname + "/public/index.html");
// });

var createUserAccount = function createUserAccount(currUserEmail, password) {
  var passwordHash = bcrypt.hashSync(password, 10); // генерируем jwt токен

  var token = jwt.sign({
    currUserEmail: currUserEmail
  }, jwtTokenKey);
  var jwtHash = bcrypt.hashSync(token, 10);

  if (token && jwtHash) {} else {
    var errMes = "<<Учетная запись не создана. Ошибка генерации hash>>";
    console.log(errMes);
    return errMes;
  }
}; // Зарегистрироваться


app.post("/signup", function (request, response) {
  var currUserEmail = request.body.params.currUserEmail;
  var password = request.body.params.password;

  if (currUserEmail && password) {
    //console.log(currUserEmail);
    currUserEmail = currUserEmail.replace(/"/g, '');
    console.log(currUserEmail);

    if (currUserEmail) {
      PersBD.findOne({
        attributes: ['hash'],
        where: {
          email: currUserEmail
        }
      }).then(function (resHush) {
        console.log("<<получен hash пользователя>>");

        if (resHush === null) {
          var createUserResult = createUserAccount(currUserEmail, password);
          response.json({
            result: createUserResult
          });
        } else {
          var errMes = "<<Учетная запись не создана. Уже существует пользователь с таким email!>>";
          console.log(errMes);
          response.json({
            result: errMes
          });
        }
      })["catch"](function (err) {
        return console.log(err);
      });
    }
  } else {
    var errMes = "<<Учетная запись не создана. Не определены email и/или пароль>>";
    console.log(errMes);
    response.json({
      result: errMes
    });
  }
}); // Вход в аккаунт

app.post('/login', function (req, res, next) {
  passport.authenticate('local', {
    session: false
  }, function (err, user, info) {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user: user
      });
    }

    req.login(user, {
      session: false
    }, function (err) {
      if (err) {
        res.send(err);
      } // генерируем jwt токен


      var token = jwt.sign({
        user: user
      }, jwtTokenKey); //!!
      //const token = jwt.sign({user}, jwtTokenKey,{ expiresIn: 604800})  // 1 week

      console.log(token); //return  res.json({ user, token })

      return res.json({
        token: token
      });
    });
  })(req, res);
});
app.post("/load", passport.authenticate('jwt', {
  session: false
}), function (request, response) {
  //console.log(request);
  var currUserEmail = "test@test"; ///!!! убрать!!
  //let currUserEmail = request.body.params.currUserEmail;
  //let currUserEmail = request.query.currUserEmail;

  console.log(currUserEmail);

  if (currUserEmail) {
    //console.log(currUserEmail);
    currUserEmail = currUserEmail.replace(/"/g, '');
    console.log(currUserEmail);

    if (currUserEmail) {
      PersBD.findAll({
        attributes: ['bdData'],
        where: {
          email: currUserEmail
        }
      }).then(function (res) {
        console.log("<<получены данные get запроса с параметром>>");
        console.log(res);
        response.json(res);
      })["catch"](function (err) {
        return console.log(err);
      });
    }
  }
});
app.post("/home", //passport.authenticate('jwt', {session: false}),
function (request, response) {
  if (request.body.data) {
    var date = request.body.data;

    if (date === "startCronTasks") {
      cronFunc.createParamsCheckAndStartCronTasksForAll(); //response.redirect('/SignIn');
      //response.redirect('http://localhost:3001/login');//
    }

    if (date === "stopCronTasks") {
      cronFunc.stopCronTasks(cronTasks);
    }

    if (date != "startCronTasks" && date != "stopCronTasks") {
      //console.log(request.body.data);
      var bdRows = JSON.stringify(request.body.data.bdRows);
      var bdRowsArr = request.body.data.bdRows.bdRows;
      var currUserEmail = JSON.stringify(request.body.data.currUserEmail); //console.log(currUserEmail);

      if (currUserEmail) {
        currUserEmail = currUserEmail.replace(/"/g, '');
        var jwtHash = "fhasljvasdgsdafdsfgdfgs"; ///!!!

        PersBD.findAll({
          where: {
            email: currUserEmail
          }
        }).then(function (res) {
          console.log(res);

          if (res.length > 0) {
            console.log("<< \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0437\u0430\u043F\u0438\u0441\u0438 \u0432 \u0431\u0430\u0437\u0435 (\u0438\u0437\u043C\u0435\u043D\u0435\u043D\u044B \u0437\u0430\u0434\u0430\u0447\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F: ".concat(currUserEmail, " >>"));
            PersBD.update({
              bdData: bdRows,
              hash: jwtHash
            }, {
              where: {
                email: currUserEmail
              }
            }).then(function (res) {
              if (res[0] === 1) {
                console.log("<< запуск функции updateAndStartCronTasks >>");
                cronFunc.updateAndStartCronTasksByForUser(bdRowsArr, currUserEmail);
              }
            })["catch"](function (err) {
              return console.log(err);
            });
          } else {
            console.log("<< \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043F\u0438\u0441\u0438 \u0432 \u0431\u0430\u0437\u0443 (\u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u043D\u043E\u0432\u044B\u0439 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0438 \u0435\u0433\u043E \u0437\u0430\u0434\u0430\u0447\u0438: ".concat(currUserEmail, " >>"));
            PersBD.create({
              email: currUserEmail,
              bdData: bdRows,
              hash: jwtHash
            }).then(function (res) {
              //console.log(res);
              if (!_.isEmpty(res)) {
                console.log("запуск функции updateAndStartCronTasks");
                cronFunc.updateAndStartCronTasksByForUser(bdRowsArr, currUserEmail);
              }
            })["catch"](function (err) {
              return console.log(err);
            });
          }

          response.send("<<данные таблицы обновлены>>");
        })["catch"](function (err) {
          return console.log(err);
        });
      }
    }
  } //response.send("!!!");

});
console.log('<< tasks: start waiting all - after restart server >>');
cronFunc.createParamsCheckAndStartCronTasksForAll(); // останавливаем все cron tasks, для перезапуска с учетом изменений

cron.schedule(timeStopCronTasks, function () {
  console.log('<< tasks: destroy all >>');
  cronFunc.stopCronTasks(cronTasks);
}, {
  scheduled: true,
  timezone: TIMEZONE
}); // запускаем на ожидание все cron tasks на сегодня, с учетом изменений

cron.schedule(timeStartCronTasks, function () {
  console.log('<< tasks: start waiting all - for today>>');
  cronFunc.createParamsCheckAndStartCronTasksForAll();
}, {
  scheduled: true,
  timezone: TIMEZONE
}); // adding passport's strategies local and jwt
//require('./scr/passport.js')(passport);

app.listen(3000);