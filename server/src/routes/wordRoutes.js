'use strict';

const express = require('express');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');
const wordValidation = require('../validations/wordValidation');
const wordController = require('../controllers/wordController');

const router = express.Router();

router.get(
  '/by-root/:rootId',
  validate(wordValidation.byRootParams, 'params'),
  validate(wordValidation.listQuery, 'query'),
  wordController.listByRoot,
);
router.get('/:id', validate(wordValidation.idParam, 'params'), wordController.getById);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(wordValidation.create, 'body'),
  wordController.create,
);
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(wordValidation.idParam, 'params'),
  validate(wordValidation.update, 'body'),
  wordController.update,
);
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(wordValidation.idParam, 'params'),
  wordController.remove,
);

module.exports = router;
