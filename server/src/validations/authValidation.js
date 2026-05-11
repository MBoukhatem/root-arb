'use strict';

const Joi = require('joi');

// Doit rester aligné avec les enums utilisateurs (models/User.js / @arb/shared).
const NATIVE_LANGUAGES = ['fr', 'en'];
const UI_LANGUAGES = ['fr', 'en', 'ar'];
const LEARNING_LEVELS = ['beginner', 'intermediate', 'advanced'];
const LEARNING_GOALS = ['quran', 'msa', 'conversation', 'general'];
const THEMES = ['light', 'dark'];

const passwordPolicy = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^\S+$/, 'no-whitespace')
  .messages({
    'string.pattern.name': 'password must not contain whitespace',
  });

const register = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).max(254).required(),
  password: passwordPolicy.required(),
  username: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .required(),
  nativeLanguage: Joi.string().valid(...NATIVE_LANGUAGES).optional(),
  learningLevel: Joi.string().valid(...LEARNING_LEVELS).optional(),
  learningGoal: Joi.string().valid(...LEARNING_GOALS).optional(),
  preferredTheme: Joi.string().valid(...THEMES).optional(),
  preferredInterfaceLanguage: Joi.string().valid(...UI_LANGUAGES).optional(),
  timezone: Joi.string().max(64).optional(),
});

const login = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).max(254).required(),
  password: Joi.string().min(1).max(128).required(),
});

const changePassword = Joi.object({
  currentPassword: Joi.string().min(1).max(128).required(),
  newPassword: passwordPolicy.required(),
})
  .custom((value, helpers) => {
    if (value.currentPassword === value.newPassword) {
      return helpers.error('any.invalid', { message: 'new password must differ from current' });
    }
    return value;
  }, 'distinct passwords');

module.exports = { register, login, changePassword };
