import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const server = app.listen(config.port, () => {
  logger.info(`LifeHub server running on port ${config.port} (${config.env})`);
});

export default server;
