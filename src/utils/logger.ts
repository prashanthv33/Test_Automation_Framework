type Level = 'debug' | 'info' | 'warn' | 'error';
const order: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = order[(process.env.LOG_LEVEL as Level) ?? 'info'] ?? order.info;

function log(level: Level, message: string): void {
  if (order[level] < threshold) return;
  const line = `[${new Date().toISOString()}] ${level.toUpperCase().padEnd(5)} ${message}`;
  (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(line);
}

/** Minimal levelled logger. `LOG_LEVEL=debug npm test` shows every API call. */
export const logger = {
  debug: (m: string) => log('debug', m),
  info: (m: string) => log('info', m),
  warn: (m: string) => log('warn', m),
  error: (m: string) => log('error', m),
};
