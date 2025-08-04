const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const getCurrentLogLevel = () => {
  const level = process.env.LOG_LEVEL || 'INFO';
  return LOG_LEVELS[level] || LOG_LEVELS.INFO;
};

const formatLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  return JSON.stringify(logEntry);
};

const writeToFile = (level, message, meta) => {
  const logFile = path.join(logsDir, `${level.toLowerCase()}.log`);
  const logEntry = formatLog(level, message, meta) + '\n';
  
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
};

const writeToConsole = (level, message, meta) => {
  const logEntry = formatLog(level, message, meta);
  
  switch (level) {
    case 'ERROR':
      console.error(logEntry);
      break;
    case 'WARN':
      console.warn(logEntry);
      break;
    case 'DEBUG':
      console.debug(logEntry);
      break;
    default:
      console.log(logEntry);
  }
};

const log = (level, message, meta = {}) => {
  const currentLevel = getCurrentLogLevel();
  const messageLevel = LOG_LEVELS[level];
  
  if (messageLevel <= currentLevel) {
    writeToConsole(level, message, meta);
    
    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      writeToFile(level, message, meta);
    }
  }
};

const logger = {
  error: (message, meta) => log('ERROR', message, meta),
  warn: (message, meta) => log('WARN', message, meta),
  info: (message, meta) => log('INFO', message, meta),
  debug: (message, meta) => log('DEBUG', message, meta)
};

module.exports = logger;