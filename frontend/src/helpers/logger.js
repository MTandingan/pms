import { ref, provide, inject } from 'vue'
import axios from 'axios'

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

export const createLogger = (config) => {
  const logLevel = ref(config.minLevel)

  const createLogEntry = (level, message, context) => ({
    timestamp: new Date().toISOString(),
    level,
    message,
    context
  })

  const createErrorContext = (flagName, context) => ({
    flagName: flagName,
    errorMessage: context
  });

  const createUserInteractionContext = (buttonId, pageLocation, userAgent, screenSize) => ({
    buttonId: buttonId,
    pageLocation: pageLocation,
    userAgent: userAgent,
    screenSize: screenSize
  });

  const logToConsole = (entry) => {
    const { timestamp, level, message, context } = entry
    const logMethod = console[Object.keys(LogLevel)[level].toLowerCase()] || console.log
    logMethod(`[${timestamp}] [${Object.keys(LogLevel)[level]}] ${message}`, context)
  }

  const MAX_LOG_ENTRIES = 1000; // Adjust as needed
  const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5 MB, adjust as needed

  const logToStorage = async (entry) => {    
    const logKey = 'app_logs';
    
    let logs = JSON.parse(localStorage.getItem(logKey) || '[]');
    logs.push(entry);
    
    // Remove oldest entries if we exceed MAX_LOG_ENTRIES
    if (logs.length > MAX_LOG_ENTRIES) {
      logs = logs.slice(-MAX_LOG_ENTRIES);
    }
    
    // Remove oldest entries if we exceed MAX_LOG_SIZE
    while (JSON.stringify(logs).length > MAX_LOG_SIZE && logs.length > 0) {
      logs.shift(); // Remove the oldest entry
    }
    
    localStorage.setItem(logKey, JSON.stringify(logs));
  }

  const logToRemote = async (entry) => {
    try {
      await axios.post(config.remoteUrl, entry)
    } catch (error) {
      console.error('Failed to send log to remote server', error)
    }
  }

  const log = async (entry) => {
    if (entry.level >= logLevel.value) {
      if (config.console) {
        logToConsole(entry)
      }
      if (config.file) {
        await logToStorage(entry)
      }
      if (config.remote && config.remoteUrl) {
        await logToRemote(entry)
      }
    }
  }

  const clearLogs = () => {
    localStorage.removeItem('app_logs');
  }

  const debug = (message, context) => log(createLogEntry(LogLevel.DEBUG, message, context))
  const info = (message, context) => log(createLogEntry(LogLevel.INFO, message, context))
  const warn = (message, context) => log(createLogEntry(LogLevel.WARN, message, context))
  const error = (message, context) => log(createLogEntry(LogLevel.ERROR, message, context))

  return {
    debug,
    info,
    warn,
    error,
    createErrorContext,
    createUserInteractionContext,
    clearLogs,
    setLogLevel: (level) => { logLevel.value = level }
  }
}

export const LoggerSymbol = Symbol()

export const provideLogger = (config) => {
  const logger = createLogger(config)
  provide(LoggerSymbol, logger)
  return logger
}

export const useLogger = () => {
  const logger = inject(LoggerSymbol)
  if (!logger) {
    throw new Error('No logger provided!')
  }
  return logger
}

