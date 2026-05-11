# Agent #01 — Backend Architect — Round 3 (FINAL)

Fiche opérationnelle. Décisions verrouillées par arbitrages TL R2 (A1–A9).

## 1. Décisions finales verrouillées

1. **Nommage** : `server/` + `client/` (`git mv` S1 J1).
2. **Runtime** : Node 20.x, Express 5.2.1, ESM.
3. **Couches** : `route → middleware → controller → service → model`. `app.js` séparé de `server.js`.
4. **Auth** : access JWT Bearer **1h** (localStorage) + refresh httpOnly cookie 7j path-scoped `/api/auth/refresh` avec rotation. `User.tokenVersion` pour révocation. `cors credentials:true` uniquement sur ce path.
5. **Hash** : bcrypt 12. `User.password { select:false, minlength:8 }`.
6. **Validation** : Joi factory `validate(schema, source)` + Mongoose en dernière défense.
7. **Réponse** : `{ success, data, message?, pagination?, errors? }` figé via `formatResponse`.
8. **Pagination** : offset/skip, limit cap 100 (TL A7).
9. **Rate-limit** memory store : auth 5/15min, register 3/h, forgot 3/h, search 60/min, write 20/min, global 100/min.
10. **Security** : helmet + CSP stricte + `sanitize-html` allowlist sur notes/collections avant save.
11. **Logging** : `pino` JSON one-line + `morgan`.
12. **Health** : `/api/health` (liveness) + `/api/health/ready` (Mongo ping).
13. **Admin** : `adminMiddleware` relit `role` + `tokenVersion` DB.
14. **SRS** : service pur `services/srsService.js`.
15. **Constellation** : cache LRU in-memory 5 min/user.
16. **Seed** : script Node standalone, jamais de route.
17. **Drops** : refresh-tokens-en-DB, upload avatar, Community.

## 2. Structure de dossiers serveur

```
server/
├── src/
│   ├── app.js  server.js
│   ├── config/        env.js  db.js
│   ├── models/        User Root Word Progress Note Collection  indexes.js
│   ├── routes/        auth root word progress note collection constellation stats admin health  index.js
│   ├── controllers/   (1/domaine, fins)
│   ├── services/      authService rootService srsService statsService searchService constellationService
│   ├── middlewares/   authMiddleware adminMiddleware validateMiddleware errorHandler notFoundHandler rateLimiters arabicNormalizer
│   ├── validations/   (schémas Joi par domaine)
│   ├── utils/         ApiError asyncHandler formatResponse pagination jwt sanitize
│   └── shared/        enums.js errorCodes.js normalizeArabic.js
├── scripts/           seed.js  validateDataset.js  migrations/NNN_*.js
├── postman/  tests/  data/  .env.example  package.json
```

## 3. Stack libs retenue

express 5.2.1 · mongoose ^8 · joi ^17 · bcrypt ^5 · jsonwebtoken ^9 · cookie-parser ^1.4 · helmet ^8 · cors ^2.8 · express-rate-limit ^7 · express-slow-down ^2 · sanitize-html ^2 · pino + pino-http ^9 · morgan ^1.10 · dotenv ^16 · lru-cache ^11. Dev : nodemon, mongodb-memory-server, supertest, gitleaks.

## 4. Patterns clés

```js
// asyncHandler
export const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

// errorHandler — normalise CastError/11000/ValidationError → ApiError
res.status(e.statusCode||500).json({ success:false, message:e.message, errors:e.details });

// formatResponse
export const sendSuccess = (res,data,{status=200,message,pagination}={}) =>
  res.status(status).json({ success:true, data, message, pagination });

// requireAuth — verify JWT + relit tokenVersion DB
const { sub, tv } = jwt.verify(token, env.JWT_SECRET);
const user = await User.findById(sub).select('role tokenVersion');
if (!user || user.tokenVersion !== tv) throw new ApiError(401,'INVALID_TOKEN');

// rateLimiters
export const authLimiter = rateLimit({ windowMs:15*60_000, max:5 });
export const writeLimiter = rateLimit({ windowMs:60_000, max:20, keyGenerator:r=>r.user?.id||r.ip });

// validate factory
const { value, error } = schema.validate(req[src], { stripUnknown:true, convert:true, abortEarly:false });
if (error) return next(new ApiError(400,'VALIDATION',error.details));
req[src] = value; next();
```

## 5. Endpoints MVP (Must) — 36 routes

Auth : P=public, J=JWT, A=admin.

| Méth | Path | Auth | Validation | Brief |
|---|---|---|---|---|
| POST | /api/auth/register | P | registerSchema | crée User + access + cookie refresh |
| POST | /api/auth/login | P+authLimiter | loginSchema | renvoie access, set cookie |
| POST | /api/auth/refresh | P (cookie) | — | rotation, nouvel access |
| POST | /api/auth/logout | J | — | tokenVersion++, clear cookie |
| GET | /api/auth/me | J | — | profil |
| PUT | /api/auth/me | J | updateProfile | username/theme/timezone |
| PUT | /api/auth/password | J | passwordSchema | rehash + tokenVersion++ |
| GET | /api/roots | P | paginationQuery | liste filtrable |
| GET | /api/roots/essential | P | — | shortlist |
| GET | /api/roots/search | P+searchLimiter | searchQuery | normalizeArabic + text index |
| GET | /api/roots/:id | P | objectId | racine |
| GET | /api/roots/:id/tree | P | objectId | hiérarchie D3 (cache LRU) |
| GET | /api/words/:id | P | objectId | mot |
| GET | /api/words/by-root/:rootId | P | objectId+pag | mots paginés |
| GET | /api/progress | J | pag | liste |
| GET | /api/progress/today | J | — | due ≤ now |
| GET | /api/progress/stats | J | — | streak/heatmap |
| POST | /api/progress | J | progressSchema | upsert + SM-2 |
| PUT | /api/progress/:id | J | progressUpdate | recalcule nextReviewDate |
| DELETE | /api/progress/:id | J | objectId | — |
| GET | /api/notes | J | pag | notes user |
| GET | /api/notes/:id | J | objectId | owner ou public |
| POST | /api/notes | J+writeLimiter | noteSchema | sanitize-html |
| PUT | /api/notes/:id | J | noteUpdate | owner only |
| DELETE | /api/notes/:id | J | objectId | owner |
| GET | /api/collections | J | pag | — |
| GET | /api/collections/:id | J/P | objectId | owner ou isPublic |
| POST | /api/collections | J | collectionSchema | — |
| PUT | /api/collections/:id | J | collectionUpdate | — |
| DELETE | /api/collections/:id | J | objectId | — |
| POST | /api/collections/:id/roots | J | rootIdsSchema | add |
| DELETE | /api/collections/:id/roots/:rootId | J | objectId | remove |
| GET | /api/constellation | J | — | nodes/links, LRU |
| GET | /api/stats | J | — | dashboard |
| POST/PUT/DELETE | /api/admin/roots[/:id] | A | rootSchema | CRUD |
| POST/PUT/DELETE | /api/admin/words[/:id] | A | wordSchema | CRUD |
| GET | /api/admin/users | A | pag | — |
| PUT | /api/admin/users/:id/role | A | roleSchema | — |
| GET | /api/health • /api/health/ready | P | — | liveness/readiness |

## 6. Plan d'exécution S1-S2

**S1 J1** Rename `git mv` backend-arb→server. Patch scripts npm racine. Init arbo §2. Install deps §3. `.env.example` complet.
**S1 J2** `config/env.js` (Joi fail-fast) + `config/db.js` (retry) + `app.js`/`server.js`. Helmet+cors+global rate-limit câblés. `/api/health[/ready]` OK. Pino + morgan branchés.
**S1 J3** Fondations transverses : `ApiError`, `asyncHandler`, `formatResponse`, `pagination`, `validate`, `errorHandler`, `notFoundHandler`. Test stub Postman.
**S1 J4** Modèle `User` (select:false, tokenVersion, timezone). `authService` register/login. Routes `/auth/register|login|me`. Schémas Joi. `requireAuth`.
**S1 J5** `/auth/refresh` + `/auth/logout` + `/auth/password`. Cookie httpOnly path-scoped. Postman `auth.json` commit. Tag `s1-auth-done`.

**S2 J1** Modèles `Root`, `Word`. `models/indexes.js` + ensureIndexes (uniques collation, text index). `shared/normalizeArabic.js`.
**S2 J2** `/api/roots` liste filtrable + pagination, `/essential`, `/:id`. `rootService` lean + projections.
**S2 J3** `/roots/search` (text + regex préfixe). `/words/:id`, `/words/by-root/:rootId`. `/roots/:id/tree` + LRU 5 min.
**S2 J4** Modèle `Note` + CRUD `/api/notes/*`. sanitize-html + writeLimiter + ownership.
**S2 J5** Admin CRUD `/admin/roots|words` (`adminMiddleware` relit DB). Postman complet. Smoke test Atlas dev. Tag `s2-cruds-done`.

Sortie S2 : auth complète + CRUD Roots/Words/Notes + admin prêts pour intégration Frontend S3.
