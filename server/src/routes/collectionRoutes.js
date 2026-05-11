'use strict';

const express = require('express');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/authMiddleware');
const collectionValidation = require('../validations/collectionValidation');
const collectionController = require('../controllers/collectionController');

const router = express.Router();

router.use(requireAuth);

router.get('/', validate(collectionValidation.listQuery, 'query'), collectionController.list);
router.get('/:id', validate(collectionValidation.idParam, 'params'), collectionController.getById);
router.post('/', validate(collectionValidation.create, 'body'), collectionController.create);
router.put(
  '/:id',
  validate(collectionValidation.idParam, 'params'),
  validate(collectionValidation.update, 'body'),
  collectionController.update,
);
router.delete(
  '/:id',
  validate(collectionValidation.idParam, 'params'),
  collectionController.remove,
);

module.exports = router;
