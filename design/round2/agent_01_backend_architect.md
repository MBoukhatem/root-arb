# Agent #01 — Backend Architect — Round 2 (critiques croisées)

## 1. Réponses aux questions reçues

**À DevOps (#07)** :
- `/api/health` : oui, deux niveaux. `/api/health` (liveness, 200 sans DB) pour UptimeRobot/Render, `/api/health/ready` (readiness, ping Mongo) pour debug. Pas d'auth.
- `shared/constants.js` : **enums/strings uniquement** (semanticField, grammaticalCategory, masteryLevels, error codes). Pas de code exécutable — évite le casse-tête CJS/ESM.
- Env figées S1 : `PORT, NODE_ENV, MONGO_URI, JWT_SECRET, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, BCRYPT_ROUNDS, CORS_ORIGIN, LOG_LEVEL`. Validation Joi fail-fast au boot.

**À Database Designer (#03)** :
- Transactions activées (Atlas est replica set par défaut). Utilisées sur opérations couplées (like+counter, register+Progress initial).
- SM-2 : **service dédié `services/srsService.js`** (fonction pure `computeNextReview(grade, easiness, interval, repetitions)`), pas en méthode d'instance — testable, réutilisable côté worker.

**À Frontend (#02) / D3 (#05)** :
- Format réponse : `{ success, data: T, message?, pagination?, errors? }`. Type générique `ApiResponse<T>` partageable.
- `/api/constellation` : `{ nodes: [{id, rootLetters, masteryLevel, semanticField}], links: [{source, target, strength}] }`. **IDs strings** (D3 mute après init).
- `/api/roots/:id` renvoie la racine seule ; `/api/roots/:id/tree` renvoie la hiérarchie D3-ready (1 round-trip cacheable).

**À Data Engineer (#09)** :
- Seeder = **script Node standalone**, jamais de route admin (vecteur d'attaque). Idempotent `findOneAndUpdate(upsert)`.
- FK orpheline → **abort fail-fast**, exit code non-zéro.
- Migrations : scripts séparés `scripts/migrations/NNN_*.js` + collection `_migrations`.

## 2. Désaccords / arbitrages

1. **JWT en localStorage vs httpOnly cookie (Security #06 P0-1)** — **je me range à #06**. Cookie httpOnly + CSRF token + access 15 min / refresh 7j avec rotation. Le brief mentionne notes publiques (XSS stocké) : localStorage est intenable. Impact : `cors({ credentials: true })`, intercepteur axios `withCredentials: true`, endpoint `/api/auth/refresh`, `tokenVersion` sur User.

2. **Rate limit (ma question à #06)** — **#06 a raison d'étendre** au-delà de `/auth/*`. J'ajoute buckets : `register 3/h/IP`, `forgot 3/h/email`, `search 60/min`, `notes POST 30/h/user`. SlowDown sur login après 3 échecs.

3. **Rename `backend-arb` → `server` (#07)** — **je cède**. Cohérence brief/scripts/doc/soutenance. 10 min de `git mv` en S1J1, avant que les imports se figent.

4. **Pagination uniforme (#03 pousse cursor partout)** — position finale **hybride** : offset par défaut (UI page numbers simple), cursor opt-in sur feeds longs (`/notes/public`, `/community/feed`). Documenté dans le contrat API.

5. **Express 5 `asyncHandler`** — **maintien** malgré la propagation auto Express 5. Lisibilité + compat coût zéro.

## 3. Convergences validées

1. **`User.password: { select: false }`** + `.select('+password')` explicite sur login (acté avec #03, #06).
2. **bcrypt rounds = 12** via `BCRYPT_ROUNDS` env (#06 + #03).
3. **Architecture en couches** avec service layer (`services/`) non listée dans le brief (acté avec #03, #09).
4. **Double validation** Joi (route, i18n) + Mongoose (dernière défense).
5. **Sanitization user-content** via `sanitize-html` allowlist serveur avant `save()` (#06).

## 4. Ajustements à ma conception Round 1

1. **Auth refondue** : access JWT 15 min + refresh httpOnly cookie avec rotation + `tokenVersion`. Nouveaux endpoints `/api/auth/refresh`, `/api/auth/logout`. Middlewares `requireAuth` (lit access header) et `requireFreshAuth` (relit User DB) pour routes admin.
2. **`adminMiddleware`** : ne fait **plus** confiance au `role` JWT, recharge `User.findById(...).select('role tokenVersion')` et compare `tokenVersion`. Empêche escalade post-rétrogradation.
3. **Rate limiting étendu** : module `middlewares/rateLimiters.js` (`authLimiter`, `registerLimiter`, `forgotLimiter`, `searchLimiter`, `writeLimiter`).
4. **Helper `normalizeArabic(str)`** (NFC + strip tashkîl, fourni par #03/#09) câblé dans les services de recherche et en middleware optionnel `arabicSearchNormalizer` sur query params.
5. **Endpoints D3-aware** : ajout explicite de `/api/roots/:id/tree` (D3-ready) et projection `?fields=minimal` sur `/api/constellation`. Cache in-memory LRU 5 min sur constellation.

## 5. Nouvelles questions résiduelles

1. **#06** : pour le refresh token httpOnly, on stocke `{ userId, jti, expiresAt }` en DB (collection `RefreshTokens`, révocation fine par device) ou on se contente de `tokenVersion` incrémenté (plus simple) ? Quel niveau MVP ?
2. **#10** : la bascule auth cookie httpOnly + refresh coûte ~1j en S1. Tu valides l'impact ou on garde localStorage avec CSP stricte + sanitize en assumant le risque ?
3. **#07** : sur Render free, pas de Redis dispo. OK pour `express-rate-limit` en memory store (un seul dyno S1-S7) puis upgrade au besoin ?
