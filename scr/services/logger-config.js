const log4js = require("log4js");
const config = require('../../config.js');
const prod = config.prod;
if (prod){
    log4js.configure({
      //appenders: { console: { type: 'console' }, file: { type: 'file', filename: 'logs/bot_'+process.argv[2]+'.log' } },
      appenders: { 
          console: { type: 'console'}, 
          file: { type: 'file', filename: 'logs/mynotif.log' } },
      categories: { default: { appenders: ['console', 'file'], level: 'info' } }
      });
  }else{
    log4js.configure({
      appenders: {
        out: {
          type: 'stdout',
          layout: {
            //type: 'pattern', pattern: '%d %p %c %f:%l %m%n'
            type: 'pattern', pattern: '%d %p  %f:%l - %m%n'
          }
        }
      },
      categories: {
        default: { appenders: ['out'], level: 'info', enableCallStack: true }
      }
    });
  }
  
  const logger = log4js.getLogger("mynotif");
  module.exports = logger;


// logger.trace("Entering cheese testing");
// logger.debug("Got cheese.");
// logger.info("Cheese is Comté.");
// logger.warn("Cheese is quite smelly.");
// logger.error("Cheese is too ripe!");
// logger.fatal("Cheese was breeding ground for listeria.");