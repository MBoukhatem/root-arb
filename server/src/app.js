'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const env = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const { globalLimiter } = require('./middlewares/rateLimiters');

const app = express();

// Derrière un proxy (Render, Nginx) — nécessaire pour rate-limit IP.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// --- Security headers ---------------------------------------------------
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // D3 SVG inline OK (agent_06 R3 §3)
    contentSecurityPolicy: env.isProd
      ? {
          useDefaults: true,
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
            fontSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            objectSrc: ["'none'"],
          },
        }
      : false, // CSP off en dev pour confort
  }),
);

// --- CORS ---------------------------------------------------------------
// Whitelist depuis env (FRONTEND_URL) + previews Vercel (regex).
// En dev, Vite peut fallback sur 5174/5175/... si 5173 occupé → on accepte
// toute origin http://localhost:51XX (5170-5199) en NODE_ENV=development.
const allowedOrigins = [env.FRONTEND_URL];
const vercelPreviewRe = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
const devLocalhostRe = /^http:\/\/localhost:51[7-9]\d$/;

app.use(
  cors({
    origin: (origin, cb) => {
      // Requêtes server-to-server / curl : origin = undefined → autoriser.
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin) || vercelPreviewRe.test(origin)) {
        return cb(null, true);
      }
      if (env.isDev && devLocalhostRe.test(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: origin not allowed (${origin})`));
    },
    credentials: false, // refresh tokens = NICE P1, pas de cookie auth pour l'instant
  }),
);

// --- Body parsing & sanitization ----------------------------------------
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(hpp());

// --- Logging ------------------------------------------------------------
if (env.isDev) {
  app.use(morgan('dev'));
} else if (!env.isTest) {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    }),
  );
}

// --- Rate limit global --------------------------------------------------
app.use(globalLimiter);

// --- Routes -------------------------------------------------------------
app.use('/api', routes);

// --- 404 + Error handler ------------------------------------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
