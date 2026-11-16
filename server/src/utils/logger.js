export const logger = {
  info: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      process.stdout.write(`[INFO] ${args.join(' ')}\n`);
    }
  },
  warn: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      process.stderr.write(`[WARN] ${args.join(' ')}\n`);
    }
  },
  error: (...args) => {
    process.stderr.write(`[ERROR] ${args.join(' ')}\n`);
  },
};
