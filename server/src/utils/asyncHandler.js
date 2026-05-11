'use strict';

/**
 * Wrapper pour controllers async — propage les rejets vers Express errorHandler.
 * Nécessaire avec Express 4 (Express 5 gère nativement les promesses).
 *
 * @param {(req,res,next)=>Promise|any} fn
 * @returns {(req,res,next)=>void}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
