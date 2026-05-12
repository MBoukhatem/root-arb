'use strict';

const express = require('express');
const validate = require('../middlewares/validate');
const lettersValidation = require('../validations/lettersValidation');
const lettersController = require('../controllers/lettersController');

const router = express.Router();

// GET /api/letters — list all 28 Arabic letters with root counts (bonus)
router.get('/', lettersController.listLetters);

// GET /api/letters/:letter/cooccurrences — co-occurrences for a given letter
router.get(
  '/:letter/cooccurrences',
  validate(lettersValidation.cooccurrencesParams, 'params'),
  validate(lettersValidation.cooccurrencesQuery, 'query'),
  lettersController.getCooccurrences,
);

module.exports = router;
