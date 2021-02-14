"use strict";

var moment = require('moment');

var _ = require('lodash');

var cron = require('node-cron');

var PersBD = require('../db/db-seq');

var emailFunc = require('../services/email-func');

var cronTasks = require('./cron-tasks');

var config = require('../../config.js');

var logger = require('../services/logger-config');

var repeatMap = config.repeatMap; // Поиск тех. названия периодичности задачи для наименования cron задачи

var getKeyByValue = function getKeyByValue(object, value) {
  return Object.keys(object).find(function (key) {
    return object[key] === value;
  });
}; // Для наименования cron задачи


var getCronEmailName = function getCronEmailName(email) {
  var nemail = email.replace(/[@._-]*/g, '');
  return nemail;
}; // Сгенерировать название cron задачи


var generateCronTaskName = function generateCronTaskName(email, ndate, repeat) {
  var nemail = getCronEmailName(email);
  var nrepeat = getKeyByValue(repeatMap, repeat);
  return "".concat(nemail, "_").concat(ndate, "_").concat(nrepeat);
}; // Формирование параметров для запуска cron задач


var createCronTaskParamObjs = function createCronTaskParamObjs(cronTaskParamsArr, bdRows, email) {
  return regeneratorRuntime.async(function createCronTaskParamObjs$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          logger.info("Cron-func - \u0437\u0430\u043F\u0443\u0441\u043A \u0444\u0443\u043D\u043A\u0446\u0438\u0438 createCronTaskParamObjs (\u0424\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u0432 \u0434\u043B\u044F \u0437\u0430\u043F\u0443\u0441\u043A\u0430 cron \u0437\u0430\u0434\u0430\u0447) \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F: ".concat(email));

          try {
            if (bdRows.length > 0 && email) {
              bdRows.forEach(function (bdRow) {
                // const { bdDate } = bdRow;
                // const { bdPeriod } = bdRow;
                // const { persName } = bdRow;
                // const { bdComm } = bdRow;
                // const { bdTmz } = bdRow;
                var bdDate = bdRow.bdDate,
                    bdPeriod = bdRow.bdPeriod,
                    persName = bdRow.persName,
                    bdComm = bdRow.bdComm,
                    bdTmz = bdRow.bdTmz;

                if (bdDate && bdPeriod) {
                  var date = bdDate.split(', ')[0];
                  var time = bdDate.split(', ')[1];

                  if (date && time) {
                    var dayStr = date.split('.')[0];
                    var monthStr = date.split('.')[1];
                    var yearStr = date.split('.')[2];
                    var hourStr = time.split(':')[0];
                    var minuteStr = time.split(':')[1];

                    if (dayStr && monthStr && yearStr && hourStr && minuteStr) {
                      var day = Number(dayStr);
                      var month = Number(monthStr);
                      var year = Number(yearStr);
                      var hour = Number(hourStr);
                      var minute = Number(minuteStr); // if (day && month && year && hour && minute) {

                      var weekDay = Number(moment(date, 'DD.MM.YYYY').day()); // const ndate = `${day}${month}${year}${hour}${minute}`;

                      var ndate = "".concat(dayStr, "_").concat(monthStr, "_").concat(yearStr, "_").concat(hourStr, "_").concat(minuteStr);
                      var cronTime = "".concat(minute, " ").concat(hour, " * * *");
                      var emailCapt = "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 mynotif.ru - ".concat(persName);
                      var emailText = "<b>".concat(persName, "</b><b>").concat(bdComm, "</b>");
                      var cronTaskParamsObj = {
                        cronTaskName: generateCronTaskName(email, ndate, bdPeriod),
                        cronTaskTime: cronTime,
                        cronTaskPeriod: bdPeriod,
                        cronStartDay: day,
                        cronStartMonth: month,
                        cronStartYear: year,
                        cronStartHour: hour,
                        cronStartMinute: minute,
                        cronStartWeekDay: weekDay,
                        cronTimeZone: bdTmz,
                        emailAddress: email,
                        emailCapt: emailCapt,
                        emailText: emailText
                      };
                      cronTaskParamsArr.push(cronTaskParamsObj); // logger.info(`Cron-func - cron параметры добавлены в массив cronTaskParamsArr для пользователя: ${email}`);
                    } else {
                      logger.warn("Cron-func - \u043D\u0435 \u0432\u0435\u0440\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u0434\u0430\u043D\u043D\u044B\u0445: ".concat(bdRow));
                    }
                  } else {
                    logger.warn("Cron-func - \u043D\u0435 \u0432\u0435\u0440\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u0434\u0430\u043D\u043D\u044B\u0445: ".concat(bdRow));
                  }
                } else {
                  logger.warn("Cron-func - \u043D\u0435 \u0432\u0435\u0440\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u0434\u0430\u043D\u043D\u044B\u0445: ".concat(bdRow));
                }
              });
            }
          } catch (err) {
            logger.error("Cron-func - \u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 createCronTaskParamObjs: ".concat(err));
          }

        case 2:
        case "end":
          return _context.stop();
      }
    }
  });
}; // Запуск cron задачи на ожидание


var startCronTask = function startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText) {
  return regeneratorRuntime.async(function startCronTask$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          logger.info("Cron-func - \u0437\u0430\u043F\u0443\u0441\u043A \u0444\u0443\u043D\u043A\u0446\u0438\u0438 startCronTask (\u0417\u0430\u043F\u0443\u0441\u043A cron \u0437\u0430\u0434\u0430\u0447\u0438 \u043D\u0430 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0435) - cronTaskName: ".concat(cronTaskName, ", cronTaskTime: ").concat(cronTaskTime));
          cronTasks[cronTaskName] = cron.schedule(cronTaskTime, function () {
            logger.info("Task - \u0437\u0430\u043F\u0443\u0441\u043A cron \u0437\u0430\u0434\u0430\u0447\u0438 - cronTaskName: ".concat(cronTaskName, ", cronTaskTime: ").concat(cronTaskTime));
            emailFunc.sendEmail(emailAddress, emailCapt, emailText)["catch"](function (err) {
              logger.error("Email - \u0444\u0443\u043D\u043A\u0446\u0438\u044F sendEmail - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(err));
            });
          }, {
            scheduled: true,
            timezone: cronTimeZone
          });
          cronTasks[cronTaskName].start();

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
}; // Проверка задач на необходимость старта


var checkAndStartCronTasks = function checkAndStartCronTasks(cronTaskParamsArr) {
  var cronTasksKeys;
  return regeneratorRuntime.async(function checkAndStartCronTasks$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          logger.info('Cron-func - запуск функции checkAndStartCronTasks (Проверка задач на необходимость старта)'); // logger.info(`Cron-func - cronTaskParamsArr - ${JSON.stringify(cronTaskParamsArr)}`);
          // let email;

          cronTaskParamsArr.forEach(function (cronTaskParamsObj) {
            var cronTaskName = cronTaskParamsObj.cronTaskName,
                cronTaskTime = cronTaskParamsObj.cronTaskTime,
                cronTaskPeriod = cronTaskParamsObj.cronTaskPeriod,
                cronStartDay = cronTaskParamsObj.cronStartDay,
                cronStartMonth = cronTaskParamsObj.cronStartMonth,
                cronStartYear = cronTaskParamsObj.cronStartYear,
                cronStartWeekDay = cronTaskParamsObj.cronStartWeekDay,
                cronTimeZone = cronTaskParamsObj.cronTimeZone,
                emailAddress = cronTaskParamsObj.emailAddress,
                emailCapt = cronTaskParamsObj.emailCapt,
                emailText = cronTaskParamsObj.emailText;
            var currDate = new Date();
            var currDay = Number(currDate.getDate());
            var currWeekDay = Number(currDate.getDay());
            var currMonth = Number(currDate.getMonth()) + 1;
            var currYear = Number(currDate.getFullYear());
            var workWeekDays = [1, 2, 3, 4, 5]; // email = emailAddress;

            switch (cronTaskPeriod) {
              case repeatMap.norep:
                {
                  // Без повторов
                  if (currDay === cronStartDay && currMonth === cronStartMonth && currYear === cronStartYear) {
                    startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
                  }

                  break;
                }

              case repeatMap.evday:
                {
                  // Ежедневно
                  if (currDay >= cronStartDay && currMonth >= cronStartMonth && currYear >= cronStartYear) {
                    startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
                  }

                  break;
                }

              case repeatMap.evweek:
                {
                  // Еженедельно
                  if (currWeekDay === cronStartWeekDay && currDay >= cronStartDay && currMonth >= cronStartMonth && currYear >= cronStartYear) {
                    startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
                  }

                  break;
                }

              case repeatMap.evwkweek:
                {
                  // ПН-ПТ
                  if (workWeekDays.includes(currWeekDay) && currDay >= cronStartDay && currMonth >= cronStartMonth && currYear >= cronStartYear) {
                    startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
                  }

                  break;
                }

              case repeatMap.evmonth:
                {
                  // Ежемесячно
                  if (currDay === cronStartDay && currMonth >= cronStartMonth && currYear >= cronStartYear) {
                    startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
                  }

                  break;
                }

              case repeatMap.evyear:
                {
                  // Ежегодно
                  if (currDay === cronStartDay && currMonth === cronStartMonth && currYear >= cronStartYear) {
                    startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
                  }

                  break;
                }

              default:
                {
                  logger.info('Cron-func - функции checkAndStartCronTasks - отсутствуют задачи для старта');
                }
            }
          });
          cronTasksKeys = Object.keys(cronTasks).join(', '); // logger.info(`Cron задачи в ожидании для пользователя: ${email} - CronTasksKeys: ${cronTasksKeys}`);

          logger.info("Cron \u0437\u0430\u0434\u0430\u0447\u0438 \u0432 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0438 \u043D\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F - CronTasksKeys: ".concat(cronTasksKeys));

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
}; // Уничтожить все cron задачи или задачи пользователя по email


var stopCronTasks = function stopCronTasks() {
  var email,
      nemail,
      _args4 = arguments;
  return regeneratorRuntime.async(function stopCronTasks$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          email = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : 'all';
          logger.info('Cron-func - запуск функции stopCronTasks (Уничтожить все cron задачи или задачи пользователя по email)');

          if (_.isEmpty(cronTasks)) {
            _context4.next = 14;
            break;
          }

          if (!(email !== 'all')) {
            _context4.next = 10;
            break;
          }

          _context4.next = 6;
          return regeneratorRuntime.awrap(getCronEmailName(email));

        case 6:
          nemail = _context4.sent;
          logger.info("Cron-func - \u0444\u0443\u043D\u043A\u0446\u0438\u044F stopCronTasks - \u0443\u043D\u0438\u0447\u0442\u043E\u0436\u0435\u043D\u0438\u0435 \u0437\u0430\u0434\u0430\u0447 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F: ".concat(email));
          _context4.next = 11;
          break;

        case 10:
          logger.info('Cron-func - функция stopCronTasks - уничтожение задач всех пользователей');

        case 11:
          // cronTasks.forEach((key) => {
          Object.keys(cronTasks).forEach(function (key) {
            var cronNemail;

            if (email !== 'all') {
              cronNemail = key.split('_')[0];
            }

            if (cronNemail === nemail) {
              logger.info("Task - destroy - ".concat(key));
              cronTasks[key].destroy();
              delete cronTasks[key];
            }
          });
          _context4.next = 15;
          break;

        case 14:
          logger.info('Cron-func - функция stopCronTasks - массив cronTasks пуст');

        case 15:
          return _context4.abrupt("return", true);

        case 16:
        case "end":
          return _context4.stop();
      }
    }
  });
}; // Запуск/перезапуск cron задач пользователя на ожидание после изменения им списка/параметров собственных задач


var updateAndStartCronTasksByForUser = function updateAndStartCronTasksByForUser(bdRowsArr, currentUser) {
  logger.info('Cron-func - запуск функции updateAndStartCronTasksByForUser (Запуск/перезапуск cron задач пользователя на ожидание после изменения им списка/параметров собственных задач)');
  var cronTaskParamsArr = [];
  new Promise(function (res) {
    var stopCronTasksResult = stopCronTasks(currentUser);
    res(stopCronTasksResult);
  }).then(function () {
    return new Promise(function (res) {
      // return new Promise((res) => {
      // if (bdRowsArr.length > 0) {
      if (!_.isEmpty(bdRowsArr)) {
        createCronTaskParamObjs(cronTaskParamsArr, bdRowsArr, currentUser);
      }

      res(cronTaskParamsArr);
    });
  }).then(function () {
    if (cronTaskParamsArr.length > 0) {
      checkAndStartCronTasks(cronTaskParamsArr);
    } else {
      logger.info('Cron-func - функция updateAndStartCronTasksByForUser - массив cronTaskParamsArr пуст');
    }
  })["catch"](function (err) {
    logger.error("Cron-func - \u0444\u0443\u043D\u043A\u0446\u0438\u044F updateAndStartCronTasksByForUser - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(err));
  });
}; // Формирование параметров для полного списка cron задач


var createParamsCheckAndStartCronTasksForAll = function createParamsCheckAndStartCronTasksForAll() {
  logger.info('Cron-func - запуск функции createParamsCheckAndStartCronTasksForAll (Формирование параметров для полного списка cron задач)');
  var cronTaskParamsArr = [];
  PersBD.findAll({
    attributes: ['bdData', 'email']
  }).then(function (res) {
    logger.info('Cron-func - функция createParamsCheckAndStartCronTasksForAll - получены данные bdData из БД'); // logger.info(res);

    return res;
  }).then(function (res) {
    if (res) {
      res.forEach(function (row) {
        var bdDataString = row.dataValues.bdData;

        if (bdDataString) {
          var bdData = JSON.parse(bdDataString); // logger.info(bdData);

          var bdRows = bdData.bdRows; // logger.info(bdRows);

          var email = row.dataValues.email;
          createCronTaskParamObjs(cronTaskParamsArr, bdRows, email);
        }
      });
    }

    logger.info('Cron-func - функция createParamsCheckAndStartCronTasksForAll - cronTaskParamsArr сформирован'); // logger.info(cronTaskParamsArr);

    return cronTaskParamsArr;
  }) // .then((cronTaskParamsArr) => {
  .then(function () {
    checkAndStartCronTasks(cronTaskParamsArr);
  })["catch"](function (err) {
    logger.error("Cron-func - \u0444\u0443\u043D\u043A\u0446\u0438\u044F createParamsCheckAndStartCronTasksForAll - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(err));
  });
};

module.exports = {
  createCronTaskParamObjs: createCronTaskParamObjs,
  updateAndStartCronTasksByForUser: updateAndStartCronTasksByForUser,
  checkAndStartCronTasks: checkAndStartCronTasks,
  createParamsCheckAndStartCronTasksForAll: createParamsCheckAndStartCronTasksForAll,
  stopCronTasks: stopCronTasks
};