'use strict';

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

mongoose.set('strictQuery', true);
// Dev : autoIndex ON pour confort. Prod : OFF (cf. agent_03 R3 §6).
mongoose.set('autoIndex', !env.isProd);

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

let memoryServer = null;

async function startMemoryServer() {
  // Chargé en lazy require pour ne pas embarquer le binaire en prod.
  const { MongoMemoryServer } = require('mongodb-memory-server');
  logger.info('[db] starting mongodb-memory-server (dev mode)...');
  memoryServer = await MongoMemoryServer.create({
    instance: { dbName: 'arabicwordroot_dev' },
  });
  const uri = memoryServer.getUri();
  logger.info({ uri }, '[db] in-memory MongoDB ready');
  return uri;
}

async function resolveUri() {
  if (env.USE_MEMORY_DB || (!env.DB_URI && env.isDev)) {
    return startMemoryServer();
  }
  if (!env.DB_URI) {
    throw new Error('DB_URI is required when USE_MEMORY_DB is not set');
  }
  return env.DB_URI;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry() {
  const uri = await resolveUri();
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      logger.info({ attempt }, '[db] connected to MongoDB');
      return mongoose.connection;
    } catch (err) {
      logger.error({ attempt, err: err.message }, '[db] connection failed');
      if (attempt >= MAX_RETRIES) {
        throw err;
      }
      const backoff = BASE_BACKOFF_MS * 2 ** (attempt - 1);
      logger.warn({ backoff }, '[db] retrying...');
      await sleep(backoff);
    }
  }
}

function bindConnectionEvents() {
  const conn = mongoose.connection;
  conn.on('disconnected', () => logger.warn('[db] disconnected'));
  conn.on('reconnected', () => logger.info('[db] reconnected'));
  conn.on('error', (err) => logger.error({ err: err.message }, '[db] error'));
}

async function disconnect() {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    logger.info('[db] disconnected cleanly');
  } catch (err) {
    logger.error({ err: err.message }, '[db] disconnect error');
  }
}

module.exports = { connectWithRetry, bindConnectionEvents, disconnect, mongoose };
