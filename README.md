# ArabicWordRoot

> Plateforme web fullstack d'apprentissage de l'arabe par la visualisation interactive du système des racines trilitères.

## Stack

- **Backend** : Node.js 20 + Express 4 + Mongoose 8 + JWT + Joi
- **Frontend** : React 19 + Vite + TypeScript + Tailwind v4 + TanStack Query + D3 v7 + Framer Motion + react-i18next
- **Monorepo** : npm workspaces (`server/`, `client/`, `shared/`)
- **Dev DB** : `mongodb-memory-server` (zéro config, démarrage automatique)
- **Prod DB** : MongoDB Atlas

---

## Lancement rapide (zéro config)

```bash
npm install                      # installe les 3 workspaces
npm run dev                      # lance backend (:5000) + frontend en parallèle
```

C'est tout. La première exécution télécharge un binaire MongoDB 7 (~80 Mo, ~1-2 min, mis en cache). Au boot, la base in-memory est auto-seedée avec 8 racines + 47 mots vocalisés FR/EN/AR + 1 compte admin.

- **Backend** : http://localhost:5000
- **Frontend** : http://localhost:5173 (Vite fallback automatique sur 5174/5175 si le port est occupé — CORS dev est élargi pour accepter 5170-5199)

### Comptes pré-créés

| Email                    | Mot de passe  | Rôle  |
| ------------------------ | ------------- | ----- |
| admin@arabicwordroot.com | AdminDev2026! | admin |

Tu peux aussi t'inscrire via `/register`.

### Ce que tu peux tester immédiatement

1. **Landing page** `/` — démo statique de l'arbre radial D3 de la racine ك-ت-ب déployée en 7 branches colorées par catégorie grammaticale.
2. **Explore** `/explore` (public) — catalogue des 8 racines avec filtres champ sémantique + difficulté + recherche.
3. **Détail racine** `/roots/:id` (public) — arbre D3 interactif + liste des mots dérivés groupés par catégorie.
4. **Inscription / Connexion** `/register`, `/login`.
5. **Dashboard** `/dashboard` (protégé) — stats animées (compteurs, streak).
6. **Apprentissage** `/learn` (protégé) — flashcards SM-2 simplifié (interval 1/3/7/14/30/90 j).
7. **Constellation** `/constellation` (protégé) — force-directed graph D3 des racines apprises.
8. **Notes** `/notes` & **Collections** `/collections` (protégés) — CRUD complet.
9. **Switch FR/EN/AR** + dark mode via la navbar.

---

## Variables d'environnement

### `server/.env`

```bash
NODE_ENV=development
PORT=5000

# Mode dev zero-config : MongoDB éphémère en mémoire.
# En prod : USE_MEMORY_DB=false et renseigner DB_URI Atlas.
USE_MEMORY_DB=true
# DB_URI=mongodb+srv://user:pass@cluster.mongodb.net/arabicwordroot

JWT_SECRET=dev_secret_minimum_32_chars_replace_in_prod_with_64_random_hex
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10

FRONTEND_URL=http://localhost:5173

SEED_ADMIN_EMAIL=admin@arabicwordroot.com
SEED_ADMIN_PASSWORD=AdminDev2026!

LOG_LEVEL=info
```

### `client/.env`

```bash
VITE_API_URL=http://localhost:5000/api
VITE_DEFAULT_LANGUAGE=fr
```

---

## Scripts npm racine

| Commande             | Effet                                               |
| -------------------- | --------------------------------------------------- |
| `npm run dev`        | Backend (nodemon) + frontend (Vite) en parallèle    |
| `npm run dev:server` | Backend seul                                        |
| `npm run dev:client` | Frontend seul                                       |
| `npm run build`      | Build frontend (`client/dist/`)                     |
| `npm run start`      | Démarre le backend en mode production               |
| `npm run seed`       | (Re)peuple manuellement la DB (utile en mode Atlas) |
| `npm run typecheck`  | TypeScript strict sur tous les workspaces           |
| `npm run lint`       | ESLint sur tous les workspaces                      |
| `npm run test`       | (NICE — tests non implémentés MVP)                  |

---

## Structure du monorepo

```
arabic-word-root/
├── server/                  Backend Express + Mongoose
│   └── src/
│       ├── config/          env (Joi fail-fast), db (memory-server + retry), logger (pino)
│       ├── models/          User, Root, Word, Progress, Note, Collection
│       ├── controllers/     auth, root, word, progress, note, collection, stats
│       ├── services/        Logique pure (SM-2 dans progressService)
│       ├── routes/          authRoutes, rootRoutes, wordRoutes, …, healthRoutes
│       ├── middlewares/     auth (Bearer + tokenVersion), admin, validate, errorHandler, rateLimiters
│       ├── validations/     Joi schemas par ressource
│       ├── utils/           asyncHandler, ApiError, formatResponse, pagination, jwt, arabic, enums
│       └── seeds/           seed.js (CLI), seedOnBoot.js (auto), data/{roots,words}.json
├── client/                  Frontend React + Vite + TS
│   └── src/
│       ├── app/             providers, router, RootErrorBoundary
│       ├── api/             axiosInstance + 7 clients (auth, roots, words, progress, notes, collections, stats)
│       ├── features/        auth, roots, learn, dashboard, constellation, notes, collections
│       ├── shared/
│       │   ├── ui/          Button, Modal, Pagination, RootCard, WordCard, SearchBar, …
│       │   ├── layout/      Navbar, Sidebar, AppLayout, PublicLayout, ThemeToggle, LanguageSelector
│       │   ├── viz/         RootTree (radial D3), Constellation (force-directed D3)
│       │   ├── theme/       ThemeContext, useTheme, useDesignTokens
│       │   ├── i18n/        i18n.ts, LanguageContext, useDirection, locales/{fr,en,ar}.json
│       │   ├── hooks/       useDebounce
│       │   └── lib/         env validation
│       ├── pages/           LandingPage, NotFound, ServerError
│       ├── types/           models.ts (Root, Word, Progress, …)
│       └── styles/          tokens.css (design tokens light+dark), globals.css
├── shared/                  Code partagé (npm workspace `@arb/shared`)
│   └── src/
│       ├── enums.js         SEMANTIC_FIELDS, GRAMMATICAL_CATEGORIES, …
│       └── normalize-arabic.js  NFC, stripTashkil, loosenHamza, searchKey
├── design/                  30 fiches de conception (3 rounds × 10 agents)
├── .github/workflows/ci.yml CI : lint + build + gitleaks
├── .husky/pre-commit        lint-staged + gitleaks (soft)
├── PLAN_FINAL.md            Source de vérité : architecture, planning, décisions
└── Project_Resume.md        Brief original
```

---

## API — endpoints principaux

### Publics

```
GET  /api/health                          { status, uptime, commit }
GET  /api/health/ready                    + ping Mongoose
GET  /api/roots?page=1&limit=20&search=…&semanticField=knowledge…
GET  /api/roots/essential
GET  /api/roots/:id                       { root, words[] }
GET  /api/words/:id
GET  /api/words/by-root/:rootId
POST /api/auth/register                   { email, password, username, … } → { user, accessToken }
POST /api/auth/login                      { email, password } → { user, accessToken }
```

### Protégés (`Authorization: Bearer <token>`)

```
GET    /api/auth/me
PUT    /api/auth/me
PUT    /api/auth/password
POST   /api/auth/logout                   ($inc tokenVersion → invalide tous les tokens existants)

GET    /api/progress
GET    /api/progress/today                Racines à réviser aujourd'hui (SM-2)
GET    /api/progress/stats
POST   /api/progress                      { rootId, success } → SM-2 recalc nextReviewDate
PUT    /api/progress/:id
DELETE /api/progress/:id

GET    /api/constellation                 { nodes[], links[], meta } (D3-ready)
GET    /api/stats                         Dashboard agrégé

GET    /api/notes        POST /api/notes        PUT /api/notes/:id       DELETE /api/notes/:id
POST   /api/notes/:id/like

GET    /api/collections  POST /api/collections  PUT /api/collections/:id DELETE /api/collections/:id
```

Format de réponse standardisé : `{ success, data, message?, pagination?, errors? }`.

---

## Modèle de données (6 collections)

| Collection     | Champs clés                                                                                                                              | Indexes critiques                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **User**       | email (unique collation), password (`select:false`), tokenVersion, role, streak, timezone                                                | `email` unique CI, `username` unique CI                                              |
| **Root**       | letters (NFC, unique), lettersArray multikey, transliteration, coreMeaning.{fr,en,ar}, semanticField, isQuranic, isEssential, wordsCount | `letters` unique, `lettersArray` multikey, text on `transliteration + coreMeaning.*` |
| **Word**       | arabicWord, arabicWordUnvocalized (auto-strip-tashkil), translations.{fr,en,ar}, root (ref), pattern, grammaticalCategory, examples[]    | `root`, `grammaticalCategory`, text                                                  |
| **Progress**   | user, root, masteryLevel 0-5, reviewCount, lastReviewed, nextReviewDate, easinessFactor 1.3-2.5                                          | `{user, root}` unique, `{user, nextReviewDate}`                                      |
| **Note**       | user, targetType (Root/Word), target (refPath), content, type, isPublic, likes[]                                                         | `{user, createdAt}`, `{isPublic}`                                                    |
| **Collection** | user, name, slug auto, roots[], isPublic, coverColor, icon                                                                               | `{user, slug}` unique                                                                |

Voir [`design/round3/agent_03_database_designer.md`](./design/round3/agent_03_database_designer.md) pour les schémas Mongoose complets avec hooks et virtuals.

---

## Sécurité (résumé)

- **JWT Bearer 24h** + `tokenVersion` (révocation centralisée à logout/changePassword)
- **bcrypt 10-12 rounds** (paramétré via `BCRYPT_ROUNDS`)
- **helmet** + **CORS** whitelist + **express-mongo-sanitize** + **hpp** + **sanitize-html** sur contenu utilisateur
- **Rate limiters** : `/auth/login` 5/15min, `/auth/register` 3/h, global 100/min
- `password: { select: false }` + `tokenVersion: { select: false }`
- Refresh tokens (NICE P1) : non implémentés MVP

---

## Méthodologie

Le projet a été conçu en 3 rounds de 10 agents experts (Backend, Frontend, DB, UX, D3, Security, DevOps, i18n/A11y, Data, Tech Lead) qui se sont critiqués mutuellement avant de produire 30 fiches de conception consolidées dans [`PLAN_FINAL.md`](./PLAN_FINAL.md).

---

## Roadmap

Voir [`PLAN_FINAL.md`](./PLAN_FINAL.md) §10-13 pour le planning 8 semaines, le scope MUST/NICE, les risques et la checklist soutenance.
