'use strict';

const { toZonedTime, fromZonedTime } = require('date-fns-tz');

/**
 * Returns a Date representing the start of `date`'s day in `tz`.
 * e.g. startOfDayInTz(new Date(), 'Europe/Paris') → 2024-01-15T00:00:00 Paris time as UTC Date
 * @param {Date} date
 * @param {string} tz  IANA timezone string
 * @returns {Date}
 */
function startOfDayInTz(date, tz) {
  const zoned = toZonedTime(date, tz);
  zoned.setHours(0, 0, 0, 0);
  return fromZonedTime(zoned, tz);
}

/**
 * Returns a Date `days` days after `date`, aligned to midnight in `tz`.
 * @param {Date} date
 * @param {number} days
 * @param {string} tz  IANA timezone string
 * @returns {Date}
 */
function addDaysInTz(date, days, tz) {
  const zoned = toZonedTime(date, tz);
  zoned.setDate(zoned.getDate() + days);
  zoned.setHours(0, 0, 0, 0);
  return fromZonedTime(zoned, tz);
}

/**
 * Returns a yyyy-mm-dd string for `date` in `tz`.
 * @param {Date} date
 * @param {string} tz
 * @returns {string}
 */
function toDateStringInTz(date, tz) {
  const zoned = toZonedTime(date, tz);
  const y = zoned.getFullYear();
  const m = String(zoned.getMonth() + 1).padStart(2, '0');
  const d = String(zoned.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

module.exports = { startOfDayInTz, addDaysInTz, toDateStringInTz };
