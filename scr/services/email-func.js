const nodemailer = require('nodemailer');
const logger = require('./logger-config');
const config = require('../../config.js');

const sendEmailConfig = config.sendEmailConfig;

const sendEmail = async (emailAddress, emailCapt, emailText) => {
  logger.info('Email - Запуск функции sendEmail');
  const transporter = nodemailer.createTransport({
    host: sendEmailConfig.host,
    port: sendEmailConfig.port,
    secure: sendEmailConfig.secure,
    auth: {
      user: sendEmailConfig.auth.user,
      pass: sendEmailConfig.auth.pass,
    },
  });
  // Отправка почты
  const emailInfo = await transporter.sendMail({
    from: sendEmailConfig.auth.user,
    to: emailAddress,
    subject: emailCapt,
    html: emailText,
  });
  logger.info(`Email - Отправка: ${emailInfo.messageId} - ${emailAddress} - ${emailCapt} - ${emailText}`);
};

module.exports = {
  sendEmail,
};
