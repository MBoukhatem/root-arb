'use strict';

const express = require('express');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/authMiddleware');
const noteValidation = require('../validations/noteValidation');
const noteController = require('../controllers/noteController');

const router = express.Router();

router.use(requireAuth);

router.get('/', validate(noteValidation.listQuery, 'query'), noteController.list);
router.get('/:id', validate(noteValidation.idParam, 'params'), noteController.getById);
router.post('/', validate(noteValidation.create, 'body'), noteController.create);
router.put(
  '/:id',
  validate(noteValidation.idParam, 'params'),
  validate(noteValidation.update, 'body'),
  noteController.update,
);
router.delete('/:id', validate(noteValidation.idParam, 'params'), noteController.remove);
router.post('/:id/like', validate(noteValidation.idParam, 'params'), noteController.toggleLike);

module.exports = router;
