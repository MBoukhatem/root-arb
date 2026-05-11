'use strict';

/**
 * Helpers Unicode arabe (CJS, duplique shared/src/normalize-arabic.js
 * qui est en ESM — TODO : interop quand build chain unifiée).
 */

const TASHKIL_RE = /[ً-ْٰـ]/g;
const HAMZA_VARIANTS_RE = /[آأإٱ]/g;
const ALIF_MAKSURA_RE = /ى/g;
const TA_MARBUTA_RE = /ة/g;

function nfc(str) {
  if (typeof str !== 'string') return str;
  return str.normalize('NFC');
}

function stripTashkil(str) {
  if (typeof str !== 'string') return str;
  return str.replace(TASHKIL_RE, '');
}

function normalizeArabic(str) {
  if (typeof str !== 'string') return str;
  return nfc(str).replace(TASHKIL_RE, '').trim();
}

function loosenHamza(str) {
  if (typeof str !== 'string') return str;
  return nfc(str)
    .replace(HAMZA_VARIANTS_RE, 'ا')
    .replace(ALIF_MAKSURA_RE, 'ي')
    .replace(TA_MARBUTA_RE, 'ه');
}

function searchKey(str) {
  return loosenHamza(stripTashkil(nfc(str ?? '')));
}

// Table DIN→ASCII simplifiée pour translitération.
const TRANSLIT_MAP = {
  ā: 'a',
  Ā: 'A',
  ī: 'i',
  Ī: 'I',
  ū: 'u',
  Ū: 'U',
  ḥ: 'h',
  Ḥ: 'H',
  ḍ: 'd',
  Ḍ: 'D',
  ṭ: 't',
  Ṭ: 'T',
  ẓ: 'z',
  Ẓ: 'Z',
  ṣ: 's',
  Ṣ: 'S',
  ʿ: '',
  ʾ: '',
  ġ: 'g',
  Ġ: 'G',
  ṯ: 'th',
  Ṯ: 'Th',
  ḏ: 'dh',
  Ḏ: 'Dh',
  š: 'sh',
  Š: 'Sh',
  ǧ: 'j',
  Ǧ: 'J',
};

function simplifyTranslit(str) {
  if (typeof str !== 'string') return str;
  return str
    .split('')
    .map((ch) => (Object.prototype.hasOwnProperty.call(TRANSLIT_MAP, ch) ? TRANSLIT_MAP[ch] : ch))
    .join('')
    .toLowerCase();
}

module.exports = {
  nfc,
  stripTashkil,
  normalizeArabic,
  loosenHamza,
  searchKey,
  simplifyTranslit,
};
