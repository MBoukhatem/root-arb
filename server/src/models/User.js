'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const env = require('../config/env');

// TODO: importer depuis @arb/shared quand interop ESM/CJS résolue.
// Copie locale pour S1 J1 (sync avec shared/src/enums.js).
const NATIVE_LANGUAGES = ['fr', 'en'];
const UI_LANGUAGES = ['fr', 'en', 'ar'];
const LEARNING_LEVELS = ['beginner', 'intermediate', 'advanced'];
const LEARNING_GOALS = ['quran', 'msa', 'conversation', 'general'];
const THEMES = ['light', 'dark'];
const USER_ROLES = ['user', 'admin'];

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_-]+$/,
    },
    avatar: { type: String, default: null },
    nativeLanguage: { type: String, enum: NATIVE_LANGUAGES, default: 'fr' },
    learningLevel: { type: String, enum: LEARNING_LEVELS, default: 'beginner' },
    learningGoal: { type: String, enum: LEARNING_GOALS, default: 'general' },
    preferredTheme: { type: String, enum: THEMES, default: 'light' },
    preferredInterfaceLanguage: { type: String, enum: UI_LANGUAGES, default: 'fr' },
    role: { type: String, enum: USER_ROLES, default: 'user' },
    // Révocation JWT sans Redis — incrémenté à logout / changePassword / role change.
    tokenVersion: { type: Number, default: 0, select: false },
    timezone: { type: String, default: 'UTC' }, // IANA
    streak: {
      current: { type: Number, default: 0, min: 0 },
      longest: { type: Number, default: 0, min: 0 },
      lastActivityDate: { type: Date, default: null },
    },
    totalRootsLearned: { type: Number, default: 0, min: 0 },
    totalWordsLearned: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Indexes — case-insensitive collation (agent_03 §3).
userSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);
userSchema.index(
  { username: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

// Hash password si modifié.
userSchema.pre('save', async function preSave() {
  if (this.isModified('email') && typeof this.email === 'string') {
    this.email = this.email.toLowerCase().trim();
  }
  if (this.isModified('password')) {
    const rounds = env.BCRYPT_ROUNDS;
    this.password = await bcrypt.hash(this.password, rounds);
  }
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

// toJSON : strip champs sensibles.
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.tokenVersion;
    delete ret.id;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.NATIVE_LANGUAGES = NATIVE_LANGUAGES;
module.exports.UI_LANGUAGES = UI_LANGUAGES;
module.exports.LEARNING_LEVELS = LEARNING_LEVELS;
module.exports.LEARNING_GOALS = LEARNING_GOALS;
module.exports.THEMES = THEMES;
module.exports.USER_ROLES = USER_ROLES;
