// const _ = require('lodash');
const express = require('express');
// require('./scr/pass');
const cron = require('node-cron');

// const bodyParser = require("body-parser");
// const app = express();
const passport = require('passport');
const config = require('./config.js');

// const cronTasks = require('./scr/cron/cron-tasks');
const cronFunc = require('./scr/cron/cron-func');
// const cronActions = require('./scr/cron/cron-actions');
// const cronFunc = require(`./scr/cron/cron-func`);
// const PersBD = require(`./scr/db/db-seq`);
// const jwt = require('jsonwebtoken');
// const React = require('react');
// const Router = require('react-router');
require('./scr/services/passp-strateg.js')(passport);

// const bcrypt = require( 'bcrypt' );  // хеширование паролей
// const emailFunc = require('./scr/services/email-func');
const logger = require('./scr/services/logger-config');

const newpassContrl = require('./scr/controllers/newpass-contrl');
const signupContrl = require('./scr/controllers/signup-contrl');
const loginContrl = require('./scr/controllers/login-contrl');
const loadContrl = require('./scr/controllers/load-contrl');
const homeContrl = require('./scr/controllers/home-contrl');

// const userFunc = require('./scr/services/user-func');

//! !! добавить защиту от sql-инъекций для форм !!! ////
//! !! удалить react, react-router !!!
//! !! проверка на дубликат пользователя !!!
//! !! добавить async !!

const TIMEZONE = config.TIMEZONE;
const SERVER_PORT = config.SERVER_PORT;
// const timeStopCronTasks = config.timeStopCronTasks;
// const timeStartCronTasks = config.timeStartCronTasks;
const TIME_STOP_CRON_TASKS = config.TIME_STOP_CRON_TASKS;
const TIME_START_CRON_TASKS = config.TIME_START_CRON_TASKS;

// const jwtTokenKey = config.jwtTokenKey;

const app = express();
// app.use(express.bodyParser());
//   app.use(passport.initialize());
//   app.use(passport.session());

app.use((req, res, next) => {
  /// !!! убрать !!!
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  /// !!! убрать!!!
  next();
});

app.use(express.static(`${__dirname}/public`));

app.use(express.json());

//! !! перезагружает страницу при роутинге - не подходит!!!
// app.get('/*', (request, response) => {
// // response.sendFile(path.join(__dirname, './public/index.html'));
// response.sendFile(__dirname + "/public/index.html");
// });

// app.get('/', (request, response) => {
// //response.sendFile(path.join(__dirname, './public/index.html'));
// response.sendFile(__dirname + "/public/index.html");
// });

// Зарегистрироваться
app.post('/signup', (request, response) => {
  signupContrl.signup(request, response);
});

// Вход в аккаунт
app.post('/login', (request, response) => {
  loginContrl.login(request, response);
});

// Загрузить список задач пользователя
app.post('/load', passport.authenticate('jwt', { session: false }), (request, response) => {
  loadContrl.loadData(request, response);
});
// app.post("/load",   (request, response)=> {loadContrl.loadData(request, response)})

// Главная страница сервиса
app.post('/home', passport.authenticate('jwt', { session: false }), (request, response) => { homeContrl.home(request, response); });
// app.post('/home', (request, response) => {
//   homeContrl.home(request, response);
// });

// Сбросить пароль
app.post('/newpassword', (request, response) => {
  newpassContrl.newpassword(request, response);
});

app.get('/*', (request, response) => {
  response.redirect('/');
});

// logger.info('Tasks - Запуск на ожидание всех cron задач после рестарта сервера');
// cronFunc.createParamsCheckAndStartCronTasksForAll();

// // останавливаем все cron tasks, для перезапуска с учетом изменений (задача выполняется во время TIME_STOP_CRON_TASKS)
// // cron.schedule(timeStopCronTasks, () =>
// cron.schedule(
//   TIME_STOP_CRON_TASKS,
//   () => {
//     logger.info('Tasks - Уничтожение всех cron задач');
//     cronFunc.stopCronTasks();
//   },
//   {
//     scheduled: true,
//     timezone: TIMEZONE,
//   }
// );

// // запускаем на ожидание все cron tasks на сегодня, с учетом изменений (задача выполняется во время TIME_START_CRON_TASKS)
// // cron.schedule(timeStartCronTasks, () =>
// cron.schedule(
//   TIME_START_CRON_TASKS,
//   () => {
//     logger.info('Tasks - Запуск на ожидание всех cron задач на сегодня');
//     cronFunc.createParamsCheckAndStartCronTasksForAll();
//   },
//   {
//     scheduled: true,
//     timezone: TIMEZONE,
//   }
// );

// app.listen(SERVER_PORT);
app.listen(SERVER_PORT, (err) => {
  if (err) {
    return logger.info(`App - Запуск сервера - Ошибка: ${err}`);
  }
  logger.info(`App - Сервер запущен. Порт: ${SERVER_PORT}`);
  logger.info('Tasks - Запуск на ожидание всех cron задач после рестарта сервера');
  cronFunc.createParamsCheckAndStartCronTasksForAll();

  // Останавливаем все cron tasks, для перезапуска с учетом изменений (задача выполняется во время TIME_STOP_CRON_TASKS)
  // cron.schedule(timeStopCronTasks, () =>
  cron.schedule(
    TIME_STOP_CRON_TASKS,
    () => {
      logger.info('Tasks - Уничтожение всех cron задач');
      cronFunc.stopCronTasks();
    },
    {
      scheduled: true,
      timezone: TIMEZONE,
    }
  );

  // Запускаем на ожидание все cron tasks на сегодня, с учетом изменений (задача выполняется во время TIME_START_CRON_TASKS)
  // cron.schedule(timeStartCronTasks, () =>
  cron.schedule(
    TIME_START_CRON_TASKS,
    () => {
      logger.info('Tasks - Запуск на ожидание всех cron задач на сегодня');
      cronFunc.createParamsCheckAndStartCronTasksForAll();
    },
    {
      scheduled: true,
      timezone: TIMEZONE,
    }
  );

  return true;
  // return logger.info(`App - Сервер запущен. Порт: ${SERVER_PORT}`);
});

module.exports = app;
