const TASHKIL_RE = /[ً-ْٰـ]/g;
const HAMZA_VARIANTS_RE = /[آأإٱ]/g;
const ALIF_MAKSURA_RE = /ى/g;
const TA_MARBUTA_RE = /ة/g;

export function nfc(str) {
  if (typeof str !== 'string') return str;
  return str.normalize('NFC');
}

export function stripTashkil(str) {
  if (typeof str !== 'string') return str;
  return str.replace(TASHKIL_RE, '');
}

export function normalizeArabic(str) {
  if (typeof str !== 'string') return str;
  return nfc(str).replace(TASHKIL_RE, '');
}

export function loosenHamza(str) {
  if (typeof str !== 'string') return str;
  return nfc(str)
    .replace(HAMZA_VARIANTS_RE, 'ا')
    .replace(ALIF_MAKSURA_RE, 'ي')
    .replace(TA_MARBUTA_RE, 'ه');
}

export function searchKey(str) {
  return loosenHamza(stripTashkil(nfc(str ?? '')));
}
