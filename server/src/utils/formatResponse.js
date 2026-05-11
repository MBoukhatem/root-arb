'use strict';

/**
 * Format de réponse API standardisé :
 *   { success, data?, message?, pagination?, errors? }
 *
 * Verrouillé par agent_01 R3 §4.
 */

function sendSuccess(res, data, opts = {}) {
  const { status = 200, message, pagination } = opts;
  const body = { success: true, data };
  if (message !== undefined) body.message = message;
  if (pagination !== undefined) body.pagination = pagination;
  return res.status(status).json(body);
}

function sendCreated(res, data, opts = {}) {
  return sendSuccess(res, data, { ...opts, status: 201 });
}

function sendError(res, status, message, errors) {
  const body = { success: false, message };
  if (errors !== undefined) body.errors = errors;
  return res.status(status).json(body);
}

module.exports = { sendSuccess, sendCreated, sendError };
