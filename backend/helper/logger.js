const fs = require('fs').promises;
const path = require('path');
const { createGzip } = require('zlib');
const { promisify } = require('util');
const { pipeline } = require('stream');

const pipelineAsync = promisify(pipeline);

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class Logger {
  constructor(options = {}) {
    if (Logger.instance) {
      return Logger.instance;
    }

    this.options = {
      logDirectory: options.logDirectory || 'logs',
      fileNamePattern: options.fileNamePattern || 'app-%DATE%.log',
      dateFormat: options.dateFormat || 'YYYY-MM-DD',
      maxSize: options.maxSize || 10 * 1024 * 1024, // 10 MB
      maxFiles: options.maxFiles || 5,
      level: options.level || LogLevel.INFO,
      ...options
    };

    this.currentSize = 0;
    this.currentFileName = this.getFileName();

    Logger.instance = this;
  }

  async initialize() {
    await fs.mkdir(this.options.logDirectory, { recursive: true });
    await this.rotateLogsIfNecessary();
  }

  getFileName() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.options.logDirectory, this.options.fileNamePattern.replace('%DATE%', dateStr));
  }

  async rotateLogsIfNecessary() {
    try {
      const stats = await fs.stat(this.currentFileName);
      this.currentSize = stats.size;

      if (this.currentSize >= this.options.maxSize) {
        const oldPath = this.currentFileName;
        this.currentFileName = this.getFileName();
        const newPath = `${oldPath}.${Date.now()}.gz`;

        const gzip = createGzip();
        const source = fs.createReadStream(oldPath);
        const destination = fs.createWriteStream(newPath);

        await pipelineAsync(source, gzip, destination);
        await fs.unlink(oldPath);

        this.currentSize = 0;

        // Delete old log files if we exceed maxFiles
        const files = await fs.readdir(this.options.logDirectory);
        const logFiles = files.filter(file => file.endsWith('.gz')).sort();
        
        while (logFiles.length >= this.options.maxFiles) {
          const oldestFile = logFiles.shift();
          await fs.unlink(path.join(this.options.logDirectory, oldestFile));
        }
      }
    } catch (error) {
      console.error('Error rotating logs:', error);
    }
  }

  async log(level, message, context = {}) {
    if (level < this.options.level) return;

    const timestamp = new Date().toISOString();
    const logEntry = JSON.stringify({
      timestamp,
      level: Object.keys(LogLevel)[level],
      message,
      ...context
    }) + '\n';

    try {
      await this.rotateLogsIfNecessary();
      await fs.appendFile(this.currentFileName, logEntry, 'utf8');
      this.currentSize += Buffer.byteLength(logEntry, 'utf8');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  debug(message, context) {
    return this.log(LogLevel.DEBUG, message, context);
  }

  info(message, context) {
    return this.log(LogLevel.INFO, message, context);
  }

  warn(message, context) {
    return this.log(LogLevel.WARN, message, context);
  }

  error(message, context) {
    return this.log(LogLevel.ERROR, message, context);
  }

  static getInstance(options) {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    }
    return Logger.instance;
  }
}

Logger.LogLevel = LogLevel;

const loggerInstance = Logger.getInstance({
  logDirectory: 'app_logs',
  level: Logger.LogLevel.DEBUG, // Adjust as needed
});

module.exports = {
  Logger,
  logger: loggerInstance
};

