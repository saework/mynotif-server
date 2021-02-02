const log4js = require('log4js');
const config = require('../../config.js');

const prod = config.prod;
if (prod) {
  const date = `${new Date().getDay()}._${new Date().getMonth()}_${new Date().getFullYear()}`;
  log4js.configure({
    appenders: {
      console: { type: 'console' },
      file: { type: 'file', filename: `logs/mynotif_${date}.log` },
    },
    categories: { default: { appenders: ['console', 'file'], level: 'info' } },
  });
} else {
  log4js.configure({
    appenders: {
      out: {
        type: 'stdout',
        layout: {
          // type: 'pattern', pattern: '%d %p %c %f:%l %m%n'
          type: 'pattern',
          pattern: '%d %p  %f:%l - %m%n',
        },
      },
    },
    categories: {
      default: { appenders: ['out'], level: 'info', enableCallStack: true },
    },
  });
}

const logger = log4js.getLogger('mynotif');
module.exports = logger;
