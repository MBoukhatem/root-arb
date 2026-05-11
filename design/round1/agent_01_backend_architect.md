# Agent #01 — Backend Architect — Fiche Round 1

## Note préalable : divergence repo vs brief

Le brief référence `server/` et `client/`, mais le repo a déjà `backend-arb/` et `frontend-arb/`. De plus **Express 5.2.1** est installé (le brief mentionne Express 4.x).

**Recommandation** : garder `backend-arb/` / `frontend-arb/` (cohérence avec le nom du repo `root-arb`) et patcher le `package.json` racine (scripts `dev:server` → `cd backend-arb`). Renommer maintenant casserait l'historique git pour zéro valeur. Documenter ce mapping dans le README racine.

**Express 5** change deux choses critiques : (1) les erreurs async sont automatiquement transmises à `next()` — on peut potentiellement supprimer `asyncHandler`, mais je recommande de **le garder** pour homogénéité et compat. (2) `req.query` est désormais en lecture seule (impact sur middlewares de pagination).

---

## 1. Décisions clés

1. **Architecture en couches `route → middleware → controller → service → model`.** Le brief liste seulement controllers, mais une couche `services/` est indispensable dès que la logique sort du CRUD (algo SM-2, calcul de streak, agrégation constellation, stats). Les controllers restent fins : parsing req, appel service, formatage réponse. Crée `src/services/` non listé dans le brief.

2. **Wrapper `asyncHandler`** systématique (`utils/asyncHandler.js`) plutôt que `try/catch` répété. Toutes les exceptions remontent à `errorHandler.js`. Plus lisible, moins de bruit.

3. **Classe `ApiError`** custom (`utils/ApiError.js`) avec `statusCode`, `message`, `details`. Les services throw `ApiError`, le handler centralisé formate. Erreurs Mongoose (`CastError`, `ValidationError`, code 11000 duplicate) interceptées et normalisées.

4. **Format de réponse standardisé** via helper `sendSuccess(res, data, meta)` / `sendError`. Schéma figé : `{ success, data, message?, pagination?, errors? }`. Un seul endroit à modifier si le contrat évolue.

5. **Validation Joi via middleware factory** `validate(schema, source='body')` — `source` ∈ `body|query|params`. Les schémas vivent dans `validations/` par domaine. La validation **remplace** `req.body` par la valeur typée/coercée Joi (`stripUnknown: true`, `convert: true`).

6. **Pagination standardisée** : helper `parsePagination(req.query)` → `{ page, limit, skip }` avec `limit` capé à 100, défauts `page=1, limit=20`. Helper `buildPaginationMeta(total, page, limit)`. Réutilisé partout.

7. **Chain de middlewares globale** dans `app.js` (séparé de `server.js` pour testabilité) : `helmet → cors(origin allowlist) → express.json({limit:'1mb'}) → morgan(dev/combined) → rateLimit (uniquement /api/auth/*) → routes → notFoundHandler → errorHandler`.

8. **Logging** : `morgan` HTTP + `pino` (ou `winston`) pour logs applicatifs (niveaux info/warn/error). `errorHandler` log stack en dev, message court en prod. Pas de `console.log` en code métier.

9. **Conventions de nommage** : fichiers en `camelCase.js` (`rootController.js`), classes en `PascalCase`, models au singulier (`Root.js`). Routes RESTful (kebab-case URLs : `/api/progress/today`, jamais `/api/getTodayProgress`).

---

## 2. Risques identifiés

1. **Le `populate` en cascade explose vite** — ex. `Progress` → `wordsLearned[]` + `root` → `words[]` pour la constellation. Risque de N+1 et payload géant. Anticiper l'usage de `.lean()` + `select` projeté + pagination stricte. Coordonner avec Database Designer sur les index.

2. **Express 5 breaking changes** : `req.query` immuable casse les patterns "muter la query avant le controller". Path-to-regexp v8 change la syntaxe wildcard. À auditer avant tout middleware copié de tuto Express 4.

3. **Algo SM-2 dans le service Progress** — si exécuté en boucle (ex. recalcul batch), risque de blocage event-loop. Garder le calcul O(1) par item, jamais de boucle sur tous les users dans une requête HTTP.

4. **Endpoint `/api/constellation`** potentiellement lourd (graphe complet user). Forcer une projection minimale (id, masteryLevel, links) et envisager un cache (in-memory LRU sur 5 min) — à valider avec Frontend Architect sur la fraîcheur acceptable.

5. **CORS + JWT en header `Authorization`** : ne pas activer `credentials:true` inutilement (on n'utilise pas de cookies de session). Allowlist d'origines stricte par env.

---

## 3. Questions pour les autres agents

- **Database Designer (agent #02)** : confirmer les **index composés** prévus, notamment `Progress { user:1, nextReviewDate:1 }` pour `/progress/today` et `Root { isEssential:1, frequency:-1 }`. Est-ce que `arabicWordUnvocalized` aura un index text ou regex ? Cela conditionne l'implémentation de la recherche dans le service.

- **Frontend Architect (agent #03)** : format exact attendu pour `/api/constellation` — `{nodes, links}` D3 force-directed pur, ou structure hiérarchique ? Et pour `RootTree`, est-ce que `/api/roots/:id` doit déjà renvoyer les `words[]` populés (1 round-trip) ou prévoir `/api/words/by-root/:id` séparé (2 round-trips, mais cacheable indépendamment) ?

- **Security Engineer (agent #06)** : politique de **rate limiting** — uniquement `/auth/*` (login/register/forgot) ou aussi sur les POST utilisateur (notes, collections) pour éviter le spam ? Stratégie pour la rotation/refresh du JWT 7 jours — refresh token ou re-login forcé ?

---

## 4. Recommandations actionnables — Semaine 1

1. **Scaffold backend** dans `backend-arb/src/` selon arborescence brief, **plus** ajouter `services/` et `app.js` séparé de `server.js`.
2. Installer deps manquantes : `mongoose joi bcrypt jsonwebtoken cors helmet express-rate-limit dotenv morgan pino`.
3. Écrire d'abord les **fondations transverses** avant tout endpoint métier :
   - `config/env.js` (validation Joi des `process.env`, fail-fast au boot)
   - `config/db.js` (connexion Mongoose + retry)
   - `utils/ApiError.js`, `utils/asyncHandler.js`, `utils/formatResponse.js`, `utils/pagination.js`
   - `middlewares/errorHandler.js`, `notFoundHandler.js`, `validateMiddleware.js`
4. Implémenter **`/api/auth/register` + `/api/auth/login` + `/api/auth/me`** comme tranche verticale de référence (route → validate → controller → service → model → response). Tous les autres modules copient ce pattern.
5. Mettre en place **Postman collection** + variables d'env (`{{baseUrl}}`, `{{token}}`) committée dans `backend-arb/postman/`.
6. Décider et figer le **contrat de réponse** dès le jour 1 (avant que 7 contrôleurs divergent).
