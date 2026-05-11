'use strict';

const express = require('express');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');
const rootValidation = require('../validations/rootValidation');
const rootController = require('../controllers/rootController');

const router = express.Router();

router.get('/essential', rootController.essential);
router.get('/', validate(rootValidation.list, 'query'), rootController.list);
router.get('/:id', validate(rootValidation.idParam, 'params'), rootController.getById);

// Admin uniquement
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(rootValidation.create, 'body'),
  rootController.create,
);
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(rootValidation.idParam, 'params'),
  validate(rootValidation.update, 'body'),
  rootController.update,
);
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(rootValidation.idParam, 'params'),
  rootController.remove,
);

module.exports = router;
