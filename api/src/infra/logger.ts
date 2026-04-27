interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  timestamp: string
  data?: Record<string, unknown>
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry)
}

export const logger = {
  info(message: string, data?: Record<string, unknown>) {
    console.log(formatLog({ level: 'info', message, timestamp: new Date().toISOString(), data }))
  },
  warn(message: string, data?: Record<string, unknown>) {
    console.warn(formatLog({ level: 'warn', message, timestamp: new Date().toISOString(), data }))
  },
  error(message: string, data?: Record<string, unknown>) {
    console.error(formatLog({ level: 'error', message, timestamp: new Date().toISOString(), data }))
  },
  debug(message: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog({ level: 'debug', message, timestamp: new Date().toISOString(), data }))
    }
  },
}
