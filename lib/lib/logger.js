const winston = require('winston');
const chalk = require('chalk');
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs-extra');

const LOG_DIR = path.join(__dirname, '..', 'data', 'logs');
fs.ensureDirSync(LOG_DIR);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: path.join(LOG_DIR, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(LOG_DIR, 'combined.log') })
  ]
});

const colors = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.green,
  debug: chalk.blue,
  success: chalk.greenBright
};

function log(level, message, ...args) {
  const timestamp = moment().tz('America/New_York').format('HH:mm:ss');
  const color = colors[level] || chalk.white;
  console.log(color(`[${timestamp}] [${level.toUpperCase()}] ${message}`), ...args);
  logger.log(level, message);
}

module.exports = {
  info: (msg, ...args) => log('info', msg, ...args),
  error: (msg, ...args) => log('error', msg, ...args),
  warn: (msg, ...args) => log('warn', msg, ...args),
  debug: (msg, ...args) => log('debug', msg, ...args),
  success: (msg, ...args) => log('success', msg, ...args)
};
