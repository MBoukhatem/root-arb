'use strict';

const path = require('path');
const dotenv = require('dotenv');
const Joi = require('joi');

// Charge .env (depuis server/.env) avant validation.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(5000),

  DB_URI: Joi.string().uri({ scheme: ['mongodb', 'mongodb+srv'] }).required(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),

  BCRYPT_ROUNDS: Joi.number().integer().min(4).max(15).default(12),

  FRONTEND_URL: Joi.string().uri().required(),

  SEED_ADMIN_EMAIL: Joi.string().email().optional(),
  SEED_ADMIN_PASSWORD: Joi.string().min(8).optional(),

  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
    .default('info'),

  GIT_SHA: Joi.string().optional(),
})
  .unknown(true)
  .required();

const { value, error } = schema.validate(process.env, {
  abortEarly: false,
  stripUnknown: false,
  convert: true,
});

if (error) {
  // Fail-fast : on log proprement puis on quitte. Pas de logger encore disponible.
  // eslint-disable-next-line no-console
  console.error('[env] Validation failed:');
  for (const d of error.details) {
    // eslint-disable-next-line no-console
    console.error('  -', d.message);
  }
  process.exit(1);
}

const env = Object.freeze({
  NODE_ENV: value.NODE_ENV,
  PORT: value.PORT,
  DB_URI: value.DB_URI,
  JWT_SECRET: value.JWT_SECRET,
  JWT_EXPIRES_IN: value.JWT_EXPIRES_IN,
  BCRYPT_ROUNDS: value.BCRYPT_ROUNDS,
  FRONTEND_URL: value.FRONTEND_URL,
  SEED_ADMIN_EMAIL: value.SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD: value.SEED_ADMIN_PASSWORD,
  LOG_LEVEL: value.LOG_LEVEL,
  GIT_SHA: value.GIT_SHA || 'dev',
  isProd: value.NODE_ENV === 'production',
  isDev: value.NODE_ENV === 'development',
  isTest: value.NODE_ENV === 'test',
});

module.exports = env;
