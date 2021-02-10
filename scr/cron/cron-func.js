const moment = require('moment');
const _ = require('lodash');
const cron = require('node-cron');
const PersBD = require('../db/db-seq');
const emailFunc = require('../services/email-func');
const cronTasks = require('./cron-tasks');
const config = require('../../config.js');
const logger = require('../services/logger-config');

const { repeatMap } = config;

// Поиск тех. названия периодичности задачи для наименования cron задачи
const getKeyByValue = (object, value) => Object.keys(object).find((key) => object[key] === value);
// Для наименования cron задачи
const getCronEmailName = (email) => {
  const nemail = email.replace(/[@._-]*/g, '');
  return nemail;
};

// Сгенерировать название cron задачи
const generateCronTaskName = (email, ndate, repeat) => {
  const nemail = getCronEmailName(email);
  const nrepeat = getKeyByValue(repeatMap, repeat);
  return `${nemail}_${ndate}_${nrepeat}`;
};

// Формирование параметров для запуска cron задач
const createCronTaskParamObjs = async (cronTaskParamsArr, bdRows, email) => {
  logger.info(`Cron-func - запуск функции createCronTaskParamObjs (Формирование параметров для запуска cron задач) для пользователя: ${email}`);
  try {
    if (bdRows.length > 0 && email) {
      bdRows.forEach((bdRow) => {
        // const { bdDate } = bdRow;
        // const { bdPeriod } = bdRow;
        // const { persName } = bdRow;
        // const { bdComm } = bdRow;
        // const { bdTmz } = bdRow;
        const {
          bdDate, bdPeriod, persName, bdComm, bdTmz
        } = bdRow;

        if (bdDate && bdPeriod) {
          const date = bdDate.split(', ')[0];
          const time = bdDate.split(', ')[1];
          if (date && time) {
            const dayStr = date.split('.')[0];
            const monthStr = date.split('.')[1];
            const yearStr = date.split('.')[2];
            const hourStr = time.split(':')[0];
            const minuteStr = time.split(':')[1];
            if (dayStr && monthStr && yearStr && hourStr && minuteStr) {
              const day = Number(dayStr);
              const month = Number(monthStr);
              const year = Number(yearStr);
              const hour = Number(hourStr);
              const minute = Number(minuteStr);
              // if (day && month && year && hour && minute) {
              const weekDay = Number(moment(date, 'DD.MM.YYYY').day());
              // const ndate = `${day}${month}${year}${hour}${minute}`;
              const ndate = `${dayStr}_${monthStr}_${yearStr}_${hourStr}_${minuteStr}`;
              const cronTime = `${minute} ${hour} * * *`;
              const emailCapt = `Уведомление mynotif.ru - ${persName}`;
              const emailText = `<b>${persName}</b><b>${bdComm}</b>`;

              const cronTaskParamsObj = {
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
                emailCapt,
                emailText,
              };
              cronTaskParamsArr.push(cronTaskParamsObj);
              // logger.info(`Cron-func - cron параметры добавлены в массив cronTaskParamsArr для пользователя: ${email}`);
            } else {
              logger.warn(`Cron-func - не верный формат данных: ${bdRow}`);
            }
          } else {
            logger.warn(`Cron-func - не верный формат данных: ${bdRow}`);
          }
        } else {
          logger.warn(`Cron-func - не верный формат данных: ${bdRow}`);
        }
      });
    }
  } catch (err) {
    logger.error(`Cron-func - Ошибка в функции createCronTaskParamObjs: ${err}`);
  }
};

// Запуск cron задачи на ожидание
const startCronTask = async (cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText) => {
  logger.info(`Cron-func - запуск функции startCronTask (Запуск cron задачи на ожидание) - cronTaskName: ${cronTaskName}, cronTaskTime: ${cronTaskTime}`);
  cronTasks[cronTaskName] = cron.schedule(
    cronTaskTime,
    () => {
      logger.info(`Task - запуск cron задачи - cronTaskName: ${cronTaskName}, cronTaskTime: ${cronTaskTime}`);
      emailFunc.sendEmail(emailAddress, emailCapt, emailText).catch((err) => {
        logger.error(`Email - функция sendEmail - Ошибка: ${err}`);
      });
    },
    {
      scheduled: true,
      timezone: cronTimeZone,
    }
  );
  cronTasks[cronTaskName].start();
};
// Проверка задач на необходимость старта
const checkAndStartCronTasks = async (cronTaskParamsArr) => {
  logger.info('Cron-func - запуск функции checkAndStartCronTasks (Проверка задач на необходимость старта)');
  // logger.info(`Cron-func - cronTaskParamsArr - ${JSON.stringify(cronTaskParamsArr)}`);
  // let email;
  cronTaskParamsArr.forEach((cronTaskParamsObj) => {
    const {
      cronTaskName, cronTaskTime, cronTaskPeriod, cronStartDay, cronStartMonth, cronStartYear, cronStartWeekDay, cronTimeZone, emailAddress, emailCapt, emailText
    } = cronTaskParamsObj;
    const currDate = new Date();
    const currDay = Number(currDate.getDate());
    const currWeekDay = Number(currDate.getDay());
    const currMonth = Number(currDate.getMonth()) + 1;
    const currYear = Number(currDate.getFullYear());
    const workWeekDays = [1, 2, 3, 4, 5];
    // email = emailAddress;

    switch (cronTaskPeriod) {
      case repeatMap.norep: {
        // Без повторов
        if (currDay === cronStartDay && currMonth === cronStartMonth && currYear === cronStartYear) {
          startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
        }
        break;
      }
      case repeatMap.evday: {
        // Ежедневно
        if (currDay >= cronStartDay && currMonth >= cronStartMonth && currYear >= cronStartYear) {
          startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
        }
        break;
      }
      case repeatMap.evweek: {
        // Еженедельно
        if (currWeekDay === cronStartWeekDay && currDay >= cronStartDay && currMonth >= cronStartMonth && currYear >= cronStartYear) {
          startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
        }
        break;
      }
      case repeatMap.evwkweek: {
        // ПН-ПТ
        if (workWeekDays.includes(currWeekDay) && currDay >= cronStartDay && currMonth >= cronStartMonth && currYear >= cronStartYear) {
          startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
        }
        break;
      }
      case repeatMap.evmonth: {
        // Ежемесячно
        if (currDay === cronStartDay && currMonth >= cronStartMonth && currYear >= cronStartYear) {
          startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
        }
        break;
      }
      case repeatMap.evyear: {
        // Ежегодно
        if (currDay === cronStartDay && currMonth === cronStartMonth && currYear >= cronStartYear) {
          startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
        }
        break;
      }
      default: {
        logger.info('Cron-func - функции checkAndStartCronTasks - отсутствуют задачи для старта');
      }
    }
  });
  const cronTasksKeys = Object.keys(cronTasks).join(', ');
  // logger.info(`Cron задачи в ожидании для пользователя: ${email} - CronTasksKeys: ${cronTasksKeys}`);
  logger.info(`Cron задачи в ожидании на сегодня - CronTasksKeys: ${cronTasksKeys}`);
};

// Уничтожить все cron задачи или задачи пользователя по email
const stopCronTasks = async (email = 'all') => {
  logger.info('Cron-func - запуск функции stopCronTasks (Уничтожить все cron задачи или задачи пользователя по email)');
  if (!_.isEmpty(cronTasks)) {
    let nemail;
    if (email !== 'all') {
      nemail = await getCronEmailName(email);
      logger.info(`Cron-func - функция stopCronTasks - уничтожение задач пользователя: ${email}`);
    } else {
      logger.info('Cron-func - функция stopCronTasks - уничтожение задач всех пользователей');
    }
    // cronTasks.forEach((key) => {
    Object.keys(cronTasks).forEach((key) => {
      let cronNemail;
      if (email !== 'all') {
        cronNemail = key.split('_')[0];
      }
      if (cronNemail === nemail) {
        logger.info(`Task - destroy - ${key}`);
        cronTasks[key].destroy();
        delete cronTasks[key];
      }
    });
  } else {
    logger.info('Cron-func - функция stopCronTasks - массив cronTasks пуст');
  }
  return true;
};

// Запуск/перезапуск cron задач пользователя на ожидание после изменения им списка/параметров собственных задач
const updateAndStartCronTasksByForUser = (bdRowsArr, currUserEmail) => {
  logger.info('Cron-func - запуск функции updateAndStartCronTasksByForUser (Запуск/перезапуск cron задач пользователя на ожидание после изменения им списка/параметров собственных задач)');
  const cronTaskParamsArr = [];
  new Promise((res) => {
    const stopCronTasksResult = stopCronTasks(currUserEmail);
    res(stopCronTasksResult);
  })
    .then(
      () => new Promise((res) => {
        // return new Promise((res) => {
        // if (bdRowsArr.length > 0) {
        if (!_.isEmpty(bdRowsArr)) {
          createCronTaskParamObjs(cronTaskParamsArr, bdRowsArr, currUserEmail);
        }
        res(cronTaskParamsArr);
      })
    )
    .then(() => {
      if (cronTaskParamsArr.length > 0) {
        checkAndStartCronTasks(cronTaskParamsArr);
      } else {
        logger.info('Cron-func - функция updateAndStartCronTasksByForUser - массив cronTaskParamsArr пуст');
      }
    })
    .catch((err) => {
      logger.error(`Cron-func - функция updateAndStartCronTasksByForUser - Ошибка: ${err}`);
    });
};

// Формирование параметров для полного списка cron задач
const createParamsCheckAndStartCronTasksForAll = () => {
  logger.info('Cron-func - запуск функции createParamsCheckAndStartCronTasksForAll (Формирование параметров для полного списка cron задач)');
  const cronTaskParamsArr = [];
  PersBD.findAll({
    attributes: ['bdData', 'email'],
  })
    .then((res) => {
      logger.info('Cron-func - функция createParamsCheckAndStartCronTasksForAll - получены данные bdData из БД');
      // logger.info(res);
      return res;
    })
    .then((res) => {
      if (res) {
        res.forEach((row) => {
          const bdDataString = row.dataValues.bdData;
          if (bdDataString) {
            const bdData = JSON.parse(bdDataString);
            // logger.info(bdData);
            const { bdRows } = bdData;
            // logger.info(bdRows);
            const { email } = row.dataValues;
            createCronTaskParamObjs(cronTaskParamsArr, bdRows, email);
          }
        });
      }
      logger.info('Cron-func - функция createParamsCheckAndStartCronTasksForAll - cronTaskParamsArr сформирован');
      // logger.info(cronTaskParamsArr);
      return cronTaskParamsArr;
    })
    // .then((cronTaskParamsArr) => {
    .then(() => {
      checkAndStartCronTasks(cronTaskParamsArr);
    })
    .catch((err) => {
      logger.error(`Cron-func - функция createParamsCheckAndStartCronTasksForAll - Ошибка: ${err}`);
    });
};

module.exports = {
  createCronTaskParamObjs,
  updateAndStartCronTasksByForUser,
  checkAndStartCronTasks,
  createParamsCheckAndStartCronTasksForAll,
  stopCronTasks,
};
