"use strict";

module.exports = {
  TIMEZONE: "Asia/Yekaterinburg",
  //TIMEZONE: "Europe/Moscow",
  repeatMap: {
    "norep": "Без повторов",
    "evday": "Ежедневно",
    "evweek": "Еженедельно",
    "evwkweek": "ПН-ПТ",
    "evmonth": "Ежемесячно",
    "evyear": "Ежегодно"
  },
  timeStopCronTasks: "57 23 * * *",
  //23.57 ежедневно
  timeStartCronTasks: "01 0 * * *",
  //00.01 ежедневно
  sendEmailConfig: {
    host: "smtp.yandex.ru",
    port: 465,
    secure: true,
    auth: {
      user: "my-notif@yandex.ru",
      pass: "MM24686421x"
    }
  },
  sequelizeConfig: {
    DBName: "mynotif",
    DBLogin: "root",
    DBPass: "root",
    modelName: "persbd"
  },
  jwtTokenKey: '9b2b-6c5h-0r3p-7y9a'
};