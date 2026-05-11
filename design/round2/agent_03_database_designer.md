# Agent #03 — Database Designer — Round 2 (critiques croisées)

## 1. Réponses aux questions reçues

**Backend (#01) — indexes + recherche.**
Composés confirmés : `Progress { user:1, nextReviewDate:1 }` (`/progress/today`) et `Root { isEssential:1, frequency:-1 }`. Recherche : **index `text` MongoDB en MVP**, `default_language:'none'` (stemmer arabe absent), couvrant `arabicWordUnvocalized + transliteration + translations.fr/en/ar`. Préfixes (`كت*`) : regex ancrée `/^كت/` sur champ indexé. Fuzzy → Atlas Search post-MVP.

**Data Engineer (#09).**
- Index `text` requis dès MVP (regex multi-champs insuffisante).
- `lettersArray` **gardé** : permet `{ $all: ["ك","ت"] }`, impossible élégant sur la string `letters`.
- `Root.wordsCount` **dénormalisé** : `$inc` à chaque insert/delete Word + cron `reconcileCounters`.
- Seed : NFC + `arabicWordUnvocalized` générés côté script (pre-save = filet).
- `transliterationSimplified` (ASCII) : **OUI**, champ séparé indexé, généré au seed (DIN→ASCII).

**Security (#06) — bcrypt 12 + select:false.**
Accord total. `password: { required, select: false, minlength: 8 }`, `BCRYPT_ROUNDS=12` env. J'ajoute `User.tokenVersion: Number` pour révocation JWT (P0-3). Indexes uniques `email`/`username` avec **collation `{ locale:'en', strength:2 }`** : insensibilité casse + anti-énumération.

**Tech Lead (#10) — MUST vs NICE.**

| Index | Catégorie | Semaine |
|---|---|---|
| `User.email/username` unique (collation s2) | **MUST** | S1 |
| `Root.letters` unique, `Word { root:1 }` | **MUST** | S2 |
| `Progress { user:1, nextReviewDate:1 }`, `{ user:1, root:1 }` unique | **MUST** | S4 |
| Index `text` multi-champs | **MUST** | S3 |
| `Root.lettersArray` multikey | NICE | S5 |
| `Root { isEssential:1, frequency:-1 }` | NICE | S2 (différable) |
| `Note { isPublic:1, likesCount:-1 }`, `Collection.slug` | NICE (drop si Community coupé) | S5 |

Centralisés `models/indexes.js`, `ensureIndexes` au boot en MVP.

## 2. Désaccords / arbitrages

- **i18n (#08) — `.ar` manquant** : **je tranche OUI, ajouter `.ar` partout** comme champ **optionnel**, fallback API `ar → en → fr`. Coût schéma nul. Si AR dropped en S6 (Tech Lead), on garde les champs vides — évite migration future.
- **Frontend (#02) / Backend (#01) — pagination** : **cursor par défaut** sur `/notes`, `/collections`, `/words` (croissance). Offset accepté sur `/roots` (volume fixe ~30). Helper backend supporte les deux.
- **Security (#06) — minlength password** : non précisé côté Security, j'ajoute `minlength: 8` côté Mongoose comme dernier filet (validation forte côté Joi).

## 3. Convergences validées

- bcrypt 12 + `select:false` + `email.lowercase/trim` (Security).
- NFC + `arabicWordUnvocalized` partout, généré au seed (Data Engineer).
- Index `text` MongoDB MVP, Atlas Search post-MVP.
- `wordsCount` dénormalisé + cron reconcile.
- `User.timezone` IANA (aucune opposition).

## 4. Ajustements concrets aux schémas

**Ajouter :**
- `User.tokenVersion: Number, default: 0` (révocation JWT).
- `User.timezone: String, default: 'Europe/Paris'` (IANA, streaks justes).
- `User.password.minlength: 8, select: false`.
- `Word.transliterationSimplified: String` indexé (recherche tolérante ASCII).
- `Root.coreMeaning.ar`, `Word.translations.ar`, `Word.patternDescription.ar`, `Word.examples[].translation.ar` (optionnels, fallback API).
- `Root.wordsCount: Number, default: 0` (dénormalisé).

**Retirer / modifier :**
- Supprimer stockage `Progress.successRate` → virtual (`successCount/reviewCount`).
- `Progress.easinessFactor.min: 1.3` (SM-2 standard).

**Helper partagé** `shared/normalizeArabic.js` (NFC + strip tashkîl + tatweel) consommé par seed, pre-save, et `/search`.

## 5. Questions résiduelles

- **Backend (#01)** : transactions MongoDB activées (Atlas M0 = replica set OK) ? Nécessaire pour atomicité `Note.likes` + `likesCount`.
- **Data Engineer (#09)** : `transliterationSimplified` généré côté script Python (idempotent, testable) ou pre-save Mongoose ? Préférence script.
- **DevOps (#07)** : `ensureIndexes` au boot acceptable ou script séparé `npm run db:indexes` pour la prod ?
- **Tech Lead (#10)** : si AR dropped S6, on garde les champs `.ar` vides au schéma (évite migration) — confirmation ?
