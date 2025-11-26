export enum LogLevel {
  Debug = 'DEBUG',
  Info = 'INFO',
  Warn = 'WARN',
  Error = 'ERROR'
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private minLevel: LogLevel = LogLevel.Info;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.Debug, LogLevel.Info, LogLevel.Warn, LogLevel.Error];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private log(level: LogLevel, category: string, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data
    };

    this.logs.push(entry);

    const formattedMessage = `[${level}] [${category}] ${message}`;
    const logParams = data ? [data] : [];
    
    switch (level) {
      case LogLevel.Debug:
        console.debug(formattedMessage, ...logParams);
        break;
      case LogLevel.Info:
        console.info(formattedMessage, ...logParams);
        break;
      case LogLevel.Warn:
        console.warn(formattedMessage, ...logParams);
        break;
      case LogLevel.Error:
        console.error(formattedMessage, ...logParams);
        break;
    }
  }

  debug(category: string, message: string, data?: unknown): void {
    this.log(LogLevel.Debug, category, message, data);
  }

  info(category: string, message: string, data?: unknown): void {
    this.log(LogLevel.Info, category, message, data);
  }

  warn(category: string, message: string, data?: unknown): void {
    this.log(LogLevel.Warn, category, message, data);
  }

  error(category: string, message: string, data?: unknown): void {
    this.log(LogLevel.Error, category, message, data);
  }

  getLogs(): ReadonlyArray<LogEntry> {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();
