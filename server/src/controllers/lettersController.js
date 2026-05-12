'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/formatResponse');
const lettersService = require('../services/lettersService');

const getCooccurrences = asyncHandler(async (req, res) => {
  const { letter } = req.params;
  const { limit, minCount, includeRoots } = req.query;

  const data = await lettersService.getCooccurrences(letter, {
    limit,
    minCount,
    includeRoots,
  });

  return sendSuccess(res, data);
});

const listLetters = asyncHandler(async (_req, res) => {
  const data = await lettersService.listLetters();
  return sendSuccess(res, data);
});

module.exports = { getCooccurrences, listLetters };
