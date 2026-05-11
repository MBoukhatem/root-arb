'use strict';

const express = require('express');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/authMiddleware');
const progressValidation = require('../validations/progressValidation');
const progressController = require('../controllers/progressController');

const router = express.Router();

router.use(requireAuth);

router.get('/today', progressController.today);
router.get('/stats', progressController.stats);
router.get('/', validate(progressValidation.listQuery, 'query'), progressController.list);
router.post(
  '/',
  validate(progressValidation.recordReview, 'body'),
  progressController.recordReview,
);
router.put(
  '/:id',
  validate(progressValidation.idParam, 'params'),
  validate(progressValidation.update, 'body'),
  progressController.update,
);
router.delete('/:id', validate(progressValidation.idParam, 'params'), progressController.remove);

module.exports = router;
