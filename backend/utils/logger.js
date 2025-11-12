// Simple leveled logger with optional colors and DEBUG toggle.
// Use DEBUG=true env to enable debug-level logs.

const ENABLE_DEBUG = process.env.DEBUG === 'true' || false;

const colors = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
};

function timestamp() {
  return new Date().toISOString();
}

function format(level, color, args) {
  const prefix = `${colors.gray}[${timestamp()}]${colors.reset}`;
  const lvl = `${color}[${level}]${colors.reset}`;
  return [prefix, lvl, ...args];
}

function debug(...args) {
  if (!ENABLE_DEBUG) return;
  console.debug(...format('DEBUG', colors.cyan, args));
}

function info(...args) {
  console.info(...format('INFO', colors.green, args));
}

function warn(...args) {
  console.warn(...format('WARN', colors.yellow, args));
}

function error(...args) {
  console.error(...format('ERROR', colors.red, args));
}

module.exports = { debug, info, warn, error };
