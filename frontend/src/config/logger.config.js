import { LogLevel } from '@/helpers/logger.js'

const isDevelopment = process.env.NODE_ENV === 'development'

export const loggerConfig = {
  minLevel: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
  console: true,
  file: true,
  remote: !isDevelopment,
  remoteUrl: isDevelopment ? undefined : 'https://api.example.com/logs'
}

