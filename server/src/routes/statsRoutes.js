'use strict';

const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const statsController = require('../controllers/statsController');

const router = express.Router();

router.use(requireAuth);

router.get('/constellation', statsController.constellation);
router.get('/stats', statsController.dashboard);

module.exports = router;
