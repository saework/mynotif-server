"use strict";

var nodemailer = require('nodemailer');

var logger = require('./logger-config');

var config = require('../../config.js');

var sendEmailConfig = config.sendEmailConfig;

var sendEmail = function sendEmail(emailAddress, emailCapt, emailText) {
  var transporter, emailInfo;
  return regeneratorRuntime.async(function sendEmail$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          logger.info('Email - Запуск функции sendEmail');
          transporter = nodemailer.createTransport({
            host: sendEmailConfig.host,
            port: sendEmailConfig.port,
            secure: sendEmailConfig.secure,
            auth: {
              user: sendEmailConfig.auth.user,
              pass: sendEmailConfig.auth.pass
            }
          }); // Отправка почты

          _context.next = 4;
          return regeneratorRuntime.awrap(transporter.sendMail({
            from: sendEmailConfig.auth.user,
            to: emailAddress,
            subject: emailCapt,
            html: emailText
          }));

        case 4:
          emailInfo = _context.sent;
          logger.info("Email - \u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430: ".concat(emailInfo.messageId, " - ").concat(emailAddress, " - ").concat(emailCapt, " - ").concat(emailText));

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
};

module.exports = {
  sendEmail: sendEmail
};