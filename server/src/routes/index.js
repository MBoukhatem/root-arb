'use strict';

const express = require('express');
const authRoutes = require('./authRoutes');
const healthRoutes = require('./healthRoutes');
const rootRoutes = require('./rootRoutes');
const wordRoutes = require('./wordRoutes');
const progressRoutes = require('./progressRoutes');
const noteRoutes = require('./noteRoutes');
const collectionRoutes = require('./collectionRoutes');
const statsRoutes = require('./statsRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/roots', rootRoutes);
router.use('/words', wordRoutes);
router.use('/progress', progressRoutes);
router.use('/notes', noteRoutes);
router.use('/collections', collectionRoutes);
// statsRoutes monte /constellation et /stats à la racine /api.
router.use('/', statsRoutes);

module.exports = router;
