"use strict";

var log4js = require('log4js');

var moment = require('moment');

var config = require('../../config.js');

var DEV = config.DEV;

if (!DEV) {
  var date = moment(new Date()).format('DD_MM_YYYY');
  log4js.configure({
    appenders: {
      console: {
        type: 'console'
      },
      file: {
        type: 'file',
        filename: "logs/mynotif_".concat(date, ".log")
      }
    },
    categories: {
      "default": {
        appenders: ['console', 'file'],
        level: 'info'
      }
    }
  });
} else {
  log4js.configure({
    appenders: {
      out: {
        type: 'stdout',
        layout: {
          // type: 'pattern', pattern: '%d %p %c %f:%l %m%n'
          type: 'pattern',
          pattern: '%d %p  %f:%l - %m%n'
        }
      }
    },
    categories: {
      "default": {
        appenders: ['out'],
        level: 'info',
        enableCallStack: true
      }
    }
  });
}

var logger = log4js.getLogger('mynotif');
module.exports = logger;