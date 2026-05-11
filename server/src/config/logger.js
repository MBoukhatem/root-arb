'use strict';

const pino = require('pino');
const env = require('./env');

// Redact list — agent_06 §6 : aucun secret en log.
const REDACT = [
  'req.headers.authorization',
  'req.headers.cookie',
  '*.password',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  'password',
  'token',
];

const transport = env.isDev
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    }
  : undefined;

const logger = pino({
  level: env.LOG_LEVEL,
  redact: { paths: REDACT, censor: '[REDACTED]' },
  base: { service: 'arb-server', env: env.NODE_ENV },
  transport,
});

module.exports = logger;
