const winston = require('winston');
const format = require('logform').format;

const logFormat = format.combine(
        format.timestamp({format: 'M-D-YYYY h:mma'}),
        format.align(),
        format.printf(info => `${info.level.toUpperCase()}:${info.message} -- ${info.timestamp}`)
      );

const logger = winston.createLogger({
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'logs/info.log', level: 'info' }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  ]
});

module.exports.logger = logger;
