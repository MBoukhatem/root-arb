# Agent #03 — Database Designer (MongoDB / Mongoose)

Revue critique des 6 schémas du brief ArabicWordRoot.

## 1. Améliorations sur les schémas

1. **Indexes manquants — critiques** :
   - `Root` : unique sur `letters`, multikey sur `lettersArray` (filtre "racines contenant ك"), composé `{ isEssential: 1, frequency: -1 }` et `{ semanticField: 1, difficulty: 1 }`.
   - `Word` : `{ root: 1 }` (FK lookup massif pour l'arbre), index sur `arabicWordUnvocalized`, et **index texte** `{ arabicWordUnvocalized: 'text', transliteration: 'text', 'translations.fr': 'text', 'translations.en': 'text' }` avec `default_language: 'none'` (le stemmer MongoDB ne gère pas l'arabe).
   - `Progress` : unique `{ user: 1, root: 1 }` (déjà prévu) + `{ user: 1, nextReviewDate: 1 }` — requête SRS quotidienne la plus chaude.
   - `Note` : `{ user: 1, createdAt: -1 }`, `{ targetType: 1, target: 1 }`, `{ isPublic: 1, likesCount: -1 }` pour le feed.
   - `User` : unique sur `email`/`username` avec **collation** `{ locale: 'en', strength: 2 }` (insensible casse).

2. **Types/contraintes à corriger** :
   - `Root.letters` : pre-save de **normalisation Unicode NFC** (sinon `unique` faillible — plusieurs encodages arabes équivalents).
   - `Progress.successRate` : **ne pas stocker**, le mettre en `virtual` (`successCount / reviewCount`) — source de désynchro garantie.
   - `Progress.easinessFactor` : `min: 1.3` (contrainte SM-2 standard).
   - Ajouter `User.timezone` (IANA, ex. `'Europe/Paris'`) : sans ça, les `streak.lastActivityDate` cassent à minuit UTC pour un user à Riyad.
   - `Word.examples[]` : ajouter `sentenceUnvocalized` pour cohérence de recherche.

3. **Embed vs ref** : `Word.examples` embed OK. `Progress.wordsLearned[]` ref OK (cardinalité variable). **Risque : `Note.likes[]` et `Collection.followers[]` en array non borné** — limite 16 Mo, contention écriture. Acceptable MVP, mais extraire en collections `Like`/`Follow` dès traction.

4. **Dénormalisations — règles de recalcul** :
   - `User.totalRootsLearned/totalWordsLearned` : `$inc` atomique uniquement au passage `masteryLevel >= 4`, + job cron nocturne `reconcileCounters` filet de sécurité.
   - `Note.likesCount` : `$inc` dans la **même** opération que `$addToSet`/`$pull` sur `likes`, idéalement dans une transaction (replica set requis).

5. **`Note.target` refPath** : OK, ajouter validation async vérifiant que la cible existe (sinon notes orphelines silencieuses).

6. **Pre-save hooks** : `User` (bcrypt cost 12, email lowercase/trim, `password: { select: false }`), `Root` (NFC + génération `lettersArray`), `Collection` (slug unique kebab-case + nanoid pour URLs publiques), `Note` (sanitize si markdown autorisé).

7. **Validation Joi (route) + Mongoose (schéma)** : les deux. Joi pour messages i18n et 400 propres, Mongoose comme dernière ligne de défense (enum, required, regex).

8. **Pagination cursor (keyset)** sur tous les listings triés `createdAt`/`likesCount` — l'offset/skip dégrade au-delà de ~10k docs et duplique les résultats sous écritures concurrentes.

## 2. Risques

- **Recherche vocalisée vs non-vocalisée** : sans `*Unvocalized` partout, les users ne trouvent rien — risque produit majeur.
- **Désynchronisation compteurs** (`likesCount`, `totalRootsLearned`) sous écritures concurrentes sans `$inc`/transactions.
- **Streaks faux par TZ** sans `User.timezone`.
- **Index texte MongoDB pauvre en arabe** : prévoir Atlas Search (analyzer custom) ou Meilisearch post-MVP.
- **Arrays non bornés** (`likes`, `followers`) → docs qui gonflent, locks d'écriture.

## 3. Questions aux autres agents

- **Backend (#04)** : transactions activées (replica set Atlas) ? Où vit l'algo SM-2 — service dédié ou méthode d'instance `Progress` ?
- **Data Engineer (#06)** : le seed garantit-il NFC + génération `arabicWordUnvocalized` ? Format source (Wiktionary, CSV, JSON) ?
- **Security (#08)** : confirmation bcrypt cost 12 + `password: select: false` au schéma ? Rate-limit login indépendant de la BDD ?
- **Frontend/UX (#05, #07)** : recherche partial-prefix (`كت*`) ou full-word ? Détermine index texte vs Atlas Search vs regex.

## 4. Recommandations actionnables

1. Ajouter `User.timezone` (IANA) dès le schéma v1 — coûteux à rétro-ajouter.
2. Supprimer `Progress.successRate` stocké → `virtual`.
3. Centraliser les indexes dans `packages/server/src/models/indexes.js` — review PR obligatoire.
4. `password: { select: false }`, `email: { lowercase: true, trim: true }`.
5. Helper `normalizeArabic(str)` (NFC + strip tashkîl) appelé en pre-save Root/Word/Note ET côté requête de recherche.
6. Pagination cursor par défaut sur `/roots`, `/notes`, `/collections`, `/words`.
7. Cron nocturne `reconcileCounters` pour resynchroniser les dénormalisations.
8. Documenter la dette : migration future `Like`/`Follow` en collections séparées.
