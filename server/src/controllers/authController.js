'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/formatResponse');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendCreated(res, result, { message: 'Account created' });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, result, { message: 'Logged in' });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);
  return sendSuccess(res, { user });
});

const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.user.id);
  return sendSuccess(res, result, { message: 'Logged out' });
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);
  return sendSuccess(res, result, { message: 'Password changed — please log in again' });
});

module.exports = { register, login, me, logout, changePassword };
