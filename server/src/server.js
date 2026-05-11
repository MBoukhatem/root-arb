'use strict';

// Ordre critique : env → logger → db → app.
const env = require('./config/env');
const logger = require('./config/logger');
const { connectWithRetry, bindConnectionEvents, disconnect } = require('./config/db');
const app = require('./app');

let httpServer = null;

async function start() {
  try {
    bindConnectionEvents();
    await connectWithRetry();

    httpServer = app.listen(env.PORT, () => {
      logger.info(
        { port: env.PORT, env: env.NODE_ENV, commit: env.GIT_SHA },
        `[server] listening on :${env.PORT}`
      );
    });
  } catch (err) {
    logger.fatal({ err: err.message }, '[server] failed to start');
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.warn({ signal }, '[server] shutdown initiated');
  try {
    if (httpServer) {
      await new Promise((resolve) => httpServer.close(resolve));
      logger.info('[server] http closed');
    }
    await disconnect();
    process.exit(0);
  } catch (err) {
    logger.error({ err: err.message }, '[server] shutdown error');
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, '[server] unhandledRejection');
  shutdown('unhandledRejection');
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err: err.message, stack: err.stack }, '[server] uncaughtException');
  shutdown('uncaughtException');
});

start();
