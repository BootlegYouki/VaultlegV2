import { translateLogMessage } from './log-translator';

type LogListener = (logs: string[]) => void;

class TuiLogger {
  private logs: string[] = [];
  private listeners: Set<LogListener> = new Set();
  private maxLogs = 30;

  constructor() {
    this.log('System', 'App started successfully.');
  }

  log(category: string, message: string) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const cleanMessage = translateLogMessage(message);
    const logEntry = `[${time}] ${category}: ${cleanMessage}`;
    this.logs = [logEntry, ...this.logs].slice(0, this.maxLogs);
    this.notify();
  }

  getLogs() {
    return this.logs;
  }

  subscribe(listener: LogListener) {
    this.listeners.add(listener);
    listener(this.logs);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.logs));
  }

  clear() {
    this.logs = [];
    this.log('System', 'Logs cleared.');
  }
}

export const logger = new TuiLogger();
export default logger;
