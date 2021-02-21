const express = require('express');
const cron = require('node-cron');
const passport = require('passport');
require('./scr/services/passp-strateg.js')(passport);
const config = require('./config.js');
const cronFunc = require('./scr/cron/cron-func');
const logger = require('./scr/services/logger-config');
const newpassContrl = require('./scr/controllers/newpass-contrl');
const signupContrl = require('./scr/controllers/signup-contrl');
const loginContrl = require('./scr/controllers/login-contrl');
const loadContrl = require('./scr/controllers/load-contrl');
const homeContrl = require('./scr/controllers/home-contrl');

const TIMEZONE = config.TIMEZONE;
const SERVER_PORT = config.SERVER_PORT;
const TIME_STOP_CRON_TASKS = config.TIME_STOP_CRON_TASKS;
const TIME_START_CRON_TASKS = config.TIME_START_CRON_TASKS;

const app = express();

app.use(express.static(`${__dirname}/public`));
app.use(express.json());

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

// Главная страница сервиса
app.post('/home', passport.authenticate('jwt', { session: false }), (request, response) => { homeContrl.home(request, response); });

// Сбросить пароль
app.post('/newpassword', (request, response) => {
  newpassContrl.newpassword(request, response);
});

app.get('/*', (request, response) => {
  response.redirect('/');
});

app.listen(SERVER_PORT, (err) => {
  if (err) {
    return logger.info(`App - Запуск сервера - Ошибка: ${err}`);
  }
  logger.info(`App - Сервер запущен. Порт: ${SERVER_PORT}`);
  logger.info('Tasks - Запуск на ожидание всех cron задач после рестарта сервера');
  cronFunc.createParamsCheckAndStartCronTasksForAll();

  // Останавливаем все cron tasks, для перезапуска с учетом изменений (задача выполняется во время TIME_STOP_CRON_TASKS)
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
});

module.exports = app;
