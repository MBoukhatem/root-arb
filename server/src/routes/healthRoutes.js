'use strict';

const express = require('express');
const mongoose = require('mongoose');
const env = require('../config/env');

const router = express.Router();

// Liveness : process up.
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      commit: env.GIT_SHA,
      timestamp: new Date().toISOString(),
    },
  });
});

// Readiness : DB pingable.
router.get('/ready', async (_req, res) => {
  const state = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (state !== 1) {
    return res.status(503).json({
      status: 'unavailable',
      db: { state, ready: false },
    });
  }
  try {
    await mongoose.connection.db.admin().ping();
    return res.status(200).json({
      status: 'ready',
      db: { state, ready: true },
    });
  } catch (err) {
    return res.status(503).json({
      status: 'unavailable',
      db: { state, ready: false, error: err.message },
    });
  }
});

module.exports = router;
