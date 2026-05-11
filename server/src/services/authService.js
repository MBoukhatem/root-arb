'use strict';

const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { signAccessToken } = require('../utils/jwt');

/**
 * Services purs : pas de req/res. Retournent des plain objects.
 * Utilisés par authController.
 */

function publicUser(userDoc) {
  // Convertit en objet plain via toJSON (qui strip password/tokenVersion).
  return userDoc.toJSON ? userDoc.toJSON() : userDoc;
}

async function register(payload) {
  // Vérification anti-doublon explicite — collation case-insensitive sur les indexes.
  const COLLATION = { locale: 'en', strength: 2 };

  const [emailTaken, usernameTaken] = await Promise.all([
    User.findOne({ email: payload.email }).collation(COLLATION).select('_id').lean(),
    User.findOne({ username: payload.username }).collation(COLLATION).select('_id').lean(),
  ]);

  if (emailTaken) {
    throw new ApiError(409, 'Email already registered', undefined, 'EMAIL_TAKEN');
  }
  if (usernameTaken) {
    throw new ApiError(409, 'Username already taken', undefined, 'USERNAME_TAKEN');
  }

  const user = await User.create(payload);

  const accessToken = signAccessToken({
    userId: user._id,
    tokenVersion: user.tokenVersion || 0,
    role: user.role,
  });

  return { user: publicUser(user), accessToken };
}

async function login({ email, password }) {
  const COLLATION = { locale: 'en', strength: 2 };
  const user = await User.findOne({ email })
    .collation(COLLATION)
    .select('+password +tokenVersion');

  // Message générique anti-énumération.
  if (!user) {
    throw new ApiError(401, 'Invalid credentials', undefined, 'INVALID_CREDENTIALS');
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    throw new ApiError(401, 'Invalid credentials', undefined, 'INVALID_CREDENTIALS');
  }

  const accessToken = signAccessToken({
    userId: user._id,
    tokenVersion: user.tokenVersion,
    role: user.role,
  });

  return { user: publicUser(user), accessToken };
}

async function me(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found', undefined, 'USER_NOT_FOUND');
  }
  return publicUser(user);
}

/**
 * Logout : incrémente tokenVersion → tous tokens existants invalidés.
 * Idempotent côté client (le front clear son storage).
 */
async function logout(userId) {
  const res = await User.findByIdAndUpdate(
    userId,
    { $inc: { tokenVersion: 1 } },
    { new: true, select: '_id tokenVersion' }
  );
  if (!res) {
    throw new ApiError(404, 'User not found', undefined, 'USER_NOT_FOUND');
  }
  return { ok: true };
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+password +tokenVersion');
  if (!user) {
    throw new ApiError(404, 'User not found', undefined, 'USER_NOT_FOUND');
  }
  const ok = await user.comparePassword(currentPassword);
  if (!ok) {
    throw new ApiError(401, 'Current password incorrect', undefined, 'INVALID_CREDENTIALS');
  }
  user.password = newPassword; // pre-save hash
  user.tokenVersion = (user.tokenVersion || 0) + 1; // force re-login partout
  await user.save();

  // Pas de nouveau access ici : l'utilisateur doit relogin (politique agent_06).
  return { ok: true };
}

module.exports = { register, login, me, logout, changePassword };
