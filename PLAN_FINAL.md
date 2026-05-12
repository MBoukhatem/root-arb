# PLAN FINAL — ArabicWordRoot

> Source de vérité unique. Arbitrage final en cas de conflit : agent_10 Tech Lead R3.

---

## 0. Vue d'ensemble

**Pitch.** Application web fullstack pour apprendre le vocabulaire arabe via la visualisation interactive des racines trilitères : chaque racine devient un **arbre radial D3**, et l'utilisateur construit une **constellation personnelle** de progression alimentée par un SRS (SM-2).

**Méthode.** Brief → 3 rounds × 10 agents experts (Backend, Frontend, DB, UX, D3, Security, DevOps, i18n/a11y, Data, Tech Lead) → 30 fiches dans `/design/round{1,2,3}/`. Ce plan synthétise les R3.

**État repo.** Présent : `backend-arb/` et `frontend-arb/` (non conformes au brief). **Action S1 J1 obligatoire** : `git mv backend-arb server && git mv frontend-arb client`.

---

## 1. Décisions structurantes (verrouillées)

1. **Monorepo** npm workspaces + concurrently, pas de Turborepo — #07.
2. **Rename `server/` + `client/`** dès S1 J1 — #07/#01.
3. **Workspace `shared/`** ESM, enums/strings + `normalizeArabic.js` (alias `@shared`) — #07.
4. **Frontend TypeScript strict** (divergence brief documentée PR bootstrap) — #02.
5. **Node 20 + Express 5.2.1 ESM**, couches `route → middleware → controller → service → model`, `app.js` séparé de `server.js` — #01.
6. **Auth MUST = JWT access 24h Bearer (localStorage) + `User.tokenVersion`** pour révocation — #10. **Refresh httpOnly path-scopé `/api/auth/refresh` = NICE P1** : si livré S1, access tombe à 1h ; sinon Bearer-only 24h assumé `SECURITY.md`.
7. **bcrypt 12, `password { select:false, minlength:8 }`**, email/username uniques collation `{locale:'en', strength:2}` — #03.
8. **Validation hybride** Joi route + Mongoose dernière défense — #01.
9. **`sanitize-html` allowlist stricte backend** sur Note.content, Collection.name/description, User.bio, avant persistance — #06.
10. **CSP stricte** : `script-src 'self'` sans `unsafe-eval` ; `unsafe-inline` toléré uniquement sur `style-src` (D3) — #06.
11. **SRS = service pur** `services/srsService.js` (SM-2), `Progress` upsert, `/api/progress/today` — #01/#03.
12. **D3 hybride** : `<RootTree>` JSX-pur (React DOM + D3 math) ; `<Constellation>` impératif via `useD3` — #05.
13. **Seuil SVG → Canvas à 300 nodes** Constellation, cap API 1000 — #05.
14. **RTL technique = MUST** : `<html dir>`, logical properties Tailwind (`ms/me/ps/pe`), `<ArabicText>`, Stylelint `csstools/use-logical` bloquant. Plugin `tailwindcss-rtl` rejeté — #04/#08.
15. **Polices arabes** Amiri (titres ≥24px) + Noto Naskh (body ≥18px), self-hostées woff2 subset, `font-display: optional` — #08.
16. **i18n FR+EN chrome 100% MUST**, **AR chrome + RTL technique 100% MUST**, **contenus AR best-effort = NICE P2** (fallback API `ar → en → fr`) — #08.
17. **Design tokens source unique `design-tokens.json` → Tailwind config + `tokens.css`** (CSS vars consommées par D3 via `useDesignTokens()`). Dark via classe `.dark` sur `<html>` — #04.
18. **Dataset MUST = 15 racines (12 core + 3 buffer) × 10 mots** vocalisés (DIN 31635 + ASCII), FR/EN obligatoires, AR best-effort, fact-check arabophone avant S5 — #09/#10.
19. **NFC + strip tashkîl** appliqués au seed (source de vérité) ET en pre-save (filet) via helper unique — #03/#09.
20. **Déploiement** Atlas M0 + Render free + Vercel + cron-job.org `/api/health` 10min — #07.

---

## 2. Architecture & stack

### 2.1 Monorepo

```
arabic-word-root/
├── package.json          # workspaces: server, client, shared
├── server/  client/  shared/
├── .github/workflows/ci.yml
├── design/{round1,round2,round3}/agent_*.md
├── data/                 # roots.json, words.json (tag dataset-v1.0)
└── docs/                 # security.md, architecture.md
```

### 2.2 Backend `server/src/`

`app.js + server.js` | `config/` env.js (Joi fail-fast) + db.js (retry) | `models/` User Root Word Progress Note Collection + indexes.js | `routes/` (10 fichiers) | `controllers/` fins | `services/` auth/root/srs/stats/search/constellation | `middlewares/` auth/admin/validate/errorHandler/notFoundHandler/rateLimiters/arabicNormalizer | `validations/` Joi par domaine | `utils/` ApiError asyncHandler formatResponse pagination jwt sanitize | `shared/` enums errorCodes normalizeArabic.
`server/scripts/` : seed.js, validateDataset.js, migrations/NNN\_\*.js.

### 2.3 Frontend `client/src/`

`app/` providers + router + i18n | `features/` auth/roots/words/progress/constellation/notes/collections/stats (chaque feature : api/components/hooks/types.ts) | `shared/` ui/layout/api/hooks/contexts/boundaries | `pages/` Landing Login Register Dashboard Explore RootDetail Learn Constellation Collections Notes Stats Settings Credits 404 | `styles/tokens.css` | `main.tsx`.
`client/public/locales/{fr,en,ar}/*.json` + `client/public/fonts/` (Amiri, Noto Naskh woff2).

### 2.4 Shared

ESM workspace, pas d'exécutable : enums, errorCodes, types partagés, `normalizeArabic.js` (NFC, strip tashkîl, loosenHamza), table DIN→ASCII.

### 2.5 Versions majeures

Server : `express 5.2.1 · mongoose ^8 · joi ^17 · bcrypt ^5 · jsonwebtoken ^9 · helmet ^8 · sanitize-html ^2 · express-rate-limit ^7 · pino ^9 · lru-cache ^11`.
Client : `react ^19 · typescript ^5.6 · vite ^5.4 · react-router-dom ^6.27 · @tanstack/react-query ^5.59 · axios ^1.7 · react-i18next ^15 · tailwindcss ^3.4.13 · d3 ^7.9 (cherry-pick) · framer-motion ^11 · recharts ^2.13 · react-markdown ^9 + rehype-sanitize ^6`.
Dev : nodemon, mongodb-memory-server, supertest, vitest, husky, lint-staged, gitleaks, stylelint-use-logical.

---

## 3. Modèle de données (6 collections)

> Schémas Mongoose complets : agent_03 R3 §2.

| Modèle         | Champs clés                                                                                                                                                                                        | Indexes MUST                                                                                                           | Particularités                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **User**       | email, password(select:false), username, role, **tokenVersion**, timezone IANA, preferred{Theme,InterfaceLanguage}, streak{current,longest,lastActivityDate}                                       | `email` unique collation strength:2 ; `username` idem                                                                  | bcrypt pre-save ; toJSON strip password/tokenVersion ; `comparePassword()`              |
| **Root**       | letters `ك-ت-ب`, lettersArray[3], transliteration, coreMeaning{fr,en,ar?}, semanticField(enum 10), frequency, isEssential, isQuranic, **wordsCount** (dénormalisé)                                 | `letters` unique ; `isEssential,frequency:-1` ; `semanticField,difficulty`                                             | NFC pre-save ; virtual `words` populate inverse                                         |
| **Word**       | arabicWord vocalisé, arabicWordUnvocalized, transliteration DIN, **transliterationSimplified ASCII**, translations{fr,en,ar?}, root(ref), pattern (wazn), grammaticalCategory (8 enum), examples[] | `root` ; `arabicWordUnvocalized` ; `transliterationSimplified` ; **`text` composé 5 champs** `default_language:'none'` | post-save `$inc Root.wordsCount`                                                        |
| **Progress**   | user, root, masteryLevel(0-5), wordsLearned[], reviewCount, successCount, **nextReviewDate**, intervalDays, easinessFactor(min:1.3)                                                                | `{user, root}` unique ; **`{user, nextReviewDate}`** ; `{user, masteryLevel}`                                          | virtual `successRate` (non stocké)                                                      |
| **Note**       | user, targetType('Root'\|'Word'), target (**refPath**), content (≤1000 sanitized), type(5 enum), isPublic, likes[], likesCount                                                                     | `{user, createdAt:-1}` ; `{targetType, target}`                                                                        | pre-validate check cible (anti-orphelines) ; Joi allowlist refPath (anti-SSRF populate) |
| **Collection** | user, name, **slug** (kebab+nanoid6), description, roots[], isPublic, coverColor, icon, followers[]                                                                                                | `{user, createdAt:-1}` ; `slug` unique                                                                                 | slug auto pre-validate                                                                  |

**Indexes** : centralisés `models/indexes.js`. Dev `autoIndex:true`. Prod `npm run db:indexes` (`syncIndexes()`) en `postdeploy` Render.
**Transactions** Mongo (replica set Atlas) sur `Note.like` et `register`.

---

## 4. API Backend (endpoints MUST)

> Réponse `{ success, data, message?, pagination?, errors? }`. Auth : **P** public, **J** JWT, **A** admin (relit role+tokenVersion DB). Détail : agent_01 R3 §5.

| Méth            | Path                                                     | Auth           | Brief                                                             |
| --------------- | -------------------------------------------------------- | -------------- | ----------------------------------------------------------------- |
| POST            | `/auth/register`                                         | P              | crée User + Progress init                                         |
| POST            | `/auth/login`                                            | P+limit        | JWT 24h                                                           |
| POST            | `/auth/refresh`                                          | P (cookie)     | **NICE P1** rotation                                              |
| POST            | `/auth/logout`                                           | J              | `tokenVersion++`                                                  |
| GET/PUT         | `/auth/me` `/auth/password`                              | J              | profil ; rehash + tokenVersion++                                  |
| GET             | `/roots` `/roots/essential` `/roots/search` `/roots/:id` | P              | liste filtrable / shortlist / normalizeArabic+text+regex / détail |
| GET             | `/roots/:id/tree`                                        | P              | **hiérarchie D3 (LRU 5min)**                                      |
| GET             | `/words/:id` `/words/by-root/:rootId`                    | P              | mot ; mots paginés                                                |
| GET             | `/progress` `/progress/today` `/progress/stats`          | J              | liste / due ≤ now / streak+heatmap                                |
| POST/PUT/DELETE | `/progress[/:id]`                                        | J              | upsert SM-2                                                       |
| CRUD            | `/notes[/:id]`                                           | J+writeLimiter | sanitize-html, owner only                                         |
| CRUD            | `/collections[/:id]` + `/:id/roots`                      | J              | add/remove roots                                                  |
| GET             | `/constellation`                                         | J              | `{nodes,links,meta}` LRU                                          |
| GET             | `/stats`                                                 | J              | dashboard                                                         |
| Admin CRUD      | `/admin/{roots,words,users}`                             | A              | adminMiddleware relit DB                                          |
| GET             | `/health` `/health/ready`                                | P              | liveness / Mongo ping                                             |

**Rate-limits** : global 100/min, login 5/15min, register 3/h, search 60/min, write 20-30/min, admin 30/min.

---

## 5. Frontend

### 5.1 Routes

- **Publiques** : `/`, `/login`, `/register`, `/explore`, `/roots/:id`, `/credits`, `/404`.
- **Protégées** (`<ProtectedRoute>`) : `/dashboard`, `/learn`, `/constellation`, `/collections`, `/notes`, `/stats`, `/settings`.
- **Admin** : `/admin/*`. **Dev** : `/dev/styleguide` (remplace Storybook).

Lazy `React.lazy`+`<Suspense>`, **3 niveaux ErrorBoundary** (root/route/viz).

### 5.2 Composants D3 phares

**`<RootTree>`** (JSX-pur, agent_05 §2) — `d3.hierarchy().sort(isRTL?desc:asc)` → `d3.tree().size([2π,r])` mémoïsé `useMemo`. ≤15 nodes, zoom `scaleExtent([0.3,4])`. Mobile `<sm` bascule vertical (`useMediaQuery`). RTL via `getTextAnchor(angle,isRTL)`. A11y : `role=img+title+desc`, nodes `role=treeitem tabindex=0 aria-expanded aria-level`, flèches `logicalKey()`, fallback `<ul sr-only>`. **POC obligatoire S1 J7** branche `spike/d3-roottree` ; fallback `d3.tree()` vertical prêt.

**`<Constellation>`** (impératif, agent_05 §3) — `forceSimulation` + charge/link/center/collide, `alphaDecay 0.05`, snapshot après `alpha<0.01`. **Clone défensif** `nodes.map(n=>({...n}))` avant simulation (D3 mute → casse cache TanStack). LOD 3 paliers selon `transform.k`. **SVG→Canvas à 300 nodes**, hit `quadtree.find()`. >1000 refusé. Drag desktop seul (`matchMedia('(pointer:fine)')`)

**`<ConcentricLetters>`** (Wave 2, agent_05) — lettres arabes en centre avec anneaux concentriques de co-occurrences. Layout d3-math pur (angulaire, tri fréquence, rayon adaptatif). SVG React + Framer Motion `layoutId` swap animé. Palette oklch light/dark. RTL-aware, WCAG AA, page `/letters` publique avec picker 28 lettres + stats + side panel racines partagées.

### 5.3 Contextes + hooks

**3 Contexts split** : Auth, Theme (`prefers-color-scheme` avant LS, anti-flash), Language (fr/en/ar + `isRTL`).
**State 3 couches** : TanStack Query v5 (serveur), Contexts (auth/theme/lang), `useState/useReducer` local. Pas de Redux/Zustand.
**Hooks shared** : useAuth, useTheme, useLanguage, useDirection, useDesignTokens (MutationObserver sur `<html class>`), useReducedMotion, useMediaQuery, useLogicalKey, useDebounce.
**Hooks features** : useRoot(id), useRoots(filters), useSRSReview() (mutation optimiste), useConstellation(), useNotes(rootId), useD3<T>(renderFn, deps), useForceSim(nodes,links).

### 5.4 Design system (agent_04)

- Neutres light/dark : `--bg-base #fafaf9/#0a0a0f`, `--text-primary` 15.8:1/15.1:1, `--focus-ring #2563eb/#60a5fa`.
- Catégorielles (ink light / ink dark / fill) : verb `#1d4ed8/#93c5fd/#3b82f6`, noun `#047857/#6ee7b7/#10b981`, adjective `#b45309/#fcd34d/#f59e0b`, place/agent/instrument/masdar/participle/derive. Or `#92400e/#fcd34d` titres ≥24px.
- `#e23923` **réservé** destructif ; SRS "raté" = ambre.
- Typo scale 1.250, plancher AR : 18px body / 24px tree / 60-72px racine centrale. `--lh-arabic 1.8`, `--lh-latin 1.5`.
- **Primitives** : `<Button>` (4 variants), `<Modal>` (focus-trap Esc), `<SidePanel side="end" w=420>` RTL-aware, `<ConfirmDialog tone="destructive">` (seul lieu autorisé pour #e23923), `<ArabicText vocalized unvocalized as>` (impose lang/dir/font-floor/aria-label, ESLint custom interdit AR brut), `<DirectionalIcon>`, `<Tooltip>` Radix, `<Skeleton>`, `<Badge categoryKey>`, `<LanguageSelector>`.

---

## 6. Sécurité (politique consolidée)

> Détails : agent_06 R3.

**Modèle auth retenu** (TL authority) : access JWT 24h Bearer dans `localStorage` (key `art_at`) + `User.tokenVersion`. Logout/changePassword/role change → `tokenVersion++` invalide tous tokens. Refresh path-scopé = NICE P1.

**Ordre middlewares app.js** :

```
helmet → cors → rateLimitGlobal → express.json({limit:'100kb'})
→ mongoSanitize → hpp → compression → routes
```

**Politique** : `BCRYPT_ROUNDS=12`, `JWT_SECRET` ≥64 bytes random distinct `JWT_REFRESH_SECRET`, reset password = token sha256 hashé DB + TTL 1h, gitleaks pre-commit + CI bloquant, pino redact `password|token|authorization|cookie|MONGO_URI`.

**Validation contenu**

- `sanitize-html` allowlist `['b','i','em','strong','p','br','ul','ol','li','code','blockquote']`, **aucun attribut, aucun href**, avant persistance.
- Front `react-markdown` + `rehype-sanitize` (`lang/dir/bdi` autorisés). **Zéro `dangerouslySetInnerHTML`** (grep CI bloquant).
- `refPath` Note.target : Joi allowlist `['Root','Word']` (anti-SSRF Mongo populate).
- Recherche : query ≤100 chars, regex échappée.
- **Upload SVG strictement banni** ; avatar = NICE P1 droppé par défaut.

**CSP** :

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data: https://res.cloudinary.com; font-src 'self' data:;
connect-src 'self' https://api.<domaine>; frame-ancestors 'none';
base-uri 'self'; form-action 'self'; object-src 'none';
```

**adminMiddleware** : relit `User.findById().select('role tokenVersion')` — jamais le payload JWT.

---

## 7. i18n & Accessibilité

> Détails : agent_08 R3.

**3 langues** FR + EN + AR. **Chrome FR+EN = MUST 100%** ; **Chrome AR + RTL technique = MUST 100%** (logical props, `<ArabicText>`, `useDirection`, `LanguageSelector` permanent header) ; **contenus AR = NICE P2 best-effort**, fallback API `ar → en → fr`.

**Composants pivots**

- `<ArabicText>` : impose `lang="ar"+dir="rtl"`, Amiri ≥24px / Noto Naskh body, `aria-label={unvocalized}` (NVDA). Seul vecteur AR autorisé (ESLint custom).
- `useDirection()` : `{ lang, dir, isRTL, logicalKey(e), toggleLang }` ; applique `<html lang dir>` via effet ; `logicalKey` mappe ArrowLeft/Right → prev/next logique (consommé D3).
- Plurals AR via `Intl.PluralRules('ar')` + `compatibilityJSON:'v4'` (6 formes).

**Locales** : namespaces par feature (`common a11y auth roots words progress constellation notes collections dashboard tree enums errors`), lazy-load par route, `common+a11y` au boot, clés kebab-case.

**Checklist WCAG AA**

- [ ] Contraste ≥4.5:1 normal, ≥3:1 ≥18px bold.
- [ ] `:focus-visible` 2px offset 2px partout (nodes SVG `tabindex=0` inclus). Jamais `outline:none` nu.
- [ ] `prefers-reduced-motion` : ≤150ms, rotation off, force-sim pré-figée.
- [ ] `<html lang dir>` synchronisé à chaque switch.
- [ ] ARIA : `aria-label` icônes, `aria-live="polite"` toasts, `aria-current`, `aria-expanded`.
- [ ] Clavier 100% (Tab/Esc/Enter/flèches logiques), skip-link `#main`.
- [ ] Cible tactile ≥44×44px.
- [ ] Lint bloquant : `eslint-plugin-jsx-a11y` + Stylelint `csstools/use-logical` (interdit `margin/left/right`, `text-align: left/right`).
- [ ] Lighthouse S7 ≥95 × 3 langues × 2 thèmes + NVDA AR manuel. Axe-core CI = NICE P3.

---

## 8. Data & seed (agent_09)

**15 racines retenues**

| Core     | DIN   | Champ      |     | Buffer   | DIN   | Champ     |
| -------- | ----- | ---------- | --- | -------- | ----- | --------- |
| 1 ك-ت-ب  | k-t-b | écrire     |     | 13 ج-ل-س | j-l-s | s'asseoir |
| 2 ع-ل-م  | ʿ-l-m | savoir     |     | 14 ن-ظ-ر | n-ẓ-r | regarder  |
| 3 ق-ر-أ  | q-r-ʾ | lire       |     | 15 ف-ت-ح | f-t-ḥ | ouvrir    |
| 4 د-ر-س  | d-r-s | étudier    |     |          |       |           |
| 5 ف-ه-م  | f-h-m | comprendre |     |          |       |           |
| 6 ق-و-ل  | q-w-l | dire       |     |          |       |           |
| 7 س-م-ع  | s-m-ʿ | entendre   |     |          |       |           |
| 8 ك-ل-م  | k-l-m | parler     |     |          |       |           |
| 9 م-ش-ي  | m-š-y | marcher    |     |          |       |           |
| 10 ح-ب-ب | ḥ-b-b | aimer      |     |          |       |           |
| 11 ك-س-ب | k-s-b | acquérir   |     |          |       |           |
| 12 ر-ج-ع | r-j-ʿ | revenir    |     |          |       |           |

12 core × 10 mots = **120 mots core + 30 buffer = 150 mots** vocalisés. **Hans Wehr exclu** import (copyright) ; sources : Quranic Corpus (CC), Wiktionary AR (CC BY-SA), Lane's Lexicon (DP). `/credits` obligatoire.

**Pipeline Node (Python supprimé)** : `extractQuranicCorpus.js` → CSV → curation Sheets (vocalisation + FR/EN/AR + exemples + `validatedBy/At`) → `sheetToJson.js` → `data/{roots,words}.json` NFC → `validateDataset.js` (Joi <30s, gate CI dur) → `seed.js` idempotent upsert (`--reset` refusé en prod, FK orpheline = abort) → tag `dataset-v1.0`.

**Validation CI bloquante** : champs Joi, FK `rootLetters` existe, 100% `arabicWord` matchent `/[ً-ْ]/`, NFC `s===s.normalize('NFC')`, DIN regex, triples FR/EN non vides, ≥10 words/root × 15 roots, unicité `(rootLetters, arabicWord)`.

**Fact-check arabophone** livré avant S5 (5 j-p réseau, fallback Malt/Upwork ~200€).

---

## 9. DevOps & déploiement (agent_07)

**Scripts npm racine** : `dev` (concurrently server+client), `dev:server`, `dev:client`, `build` (client), `start` (server), `seed`, `seed:demo`, `validate:dataset`, `lint`, `typecheck`, `test`, `audit:security`, `gitleaks`, `prepare` (husky).

**Husky pre-commit** : lint-staged + `gitleaks protect --staged` + bloc `.env*` (allowlist `.env.example`).

**CI `.github/workflows/ci.yml`** (Node 20, jobs parallèles) : lint, typecheck, build (+ bundle ≤200ko gz), validate-dataset, seed-smoke (`mongodb-memory-server`), gitleaks (gate dur), `npm-audit` warn-only. Axe-core CI = NICE droppé, remplacé par Lighthouse manuel S7.

**Déploiement S8**

- **J1 Lundi — Atlas M0** eu-west, user `app_user` readWrite DB unique, Network `0.0.0.0/0` (trade-off documenté). Seed prod depuis local.
- **J2 Mardi — Render** root `server/`, healthcheck `/api/health`, vars `NODE_ENV, MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN=24h, BCRYPT_ROUNDS=12, CORS_ORIGIN, RATE_LIMIT_*, LOG_LEVEL=info`. Auto-deploy `main`. `postdeploy: npm run db:indexes && npm run seed`.
- **J3 Mercredi — Vercel** root `client/`, `installCommand: npm install` racine, `outputDirectory: client/dist`. `VITE_API_URL=https://...onrender.com`. Preview activés. CORS exact match prod + regex `.vercel.app$`, `credentials:true` scopé `/api/auth/refresh`.
- **J4 Jeudi — Smoke** register/login/RootTree/dark/switch FR/EN/AR/admin. `mongodump` backup tag `demo-v1.0`. Vidéo screencast OBS.
- **J5 Vendredi — Répétition** cron-job.org armé, plan B clé USB.

**Anti cold-start** : cron-job.org `GET /api/health` toutes les **10 min** (Render endort à 15), actif J-1.

---

## 10. Planning 8 semaines (chemin critique)

| S              | Objectif                                                     | Critère fin                                                           | Déclencheur alerte                                     |
| -------------- | ------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------ |
| **S1**         | Rename + bootstrap + auth + i18n scaffold + POC D3           | `POST /auth/login`→JWT ; `/login` FR/EN/AR ; CI verte ; POC D3 commit | POC D3 J7 KO → fallback `d3.tree()` vertical activé S3 |
| **S2**         | CRUD Roots/Words/Notes + indexes + Explore                   | 3 CRUDs Postman ✓ ; Explore liste 8 racines ; text index OK           | Retard ≥2j fin S2 → drop préventif P1 dès S3           |
| **S3**         | RootTree radial D3 + CRUD Collections (buffer +2j)           | `ك-ت-ب` ≥10 dérivés, zoom/tooltip ✓, `<sm` vertical                   | RootTree J5 KO → fallback linéaire confirmé            |
| **S4**         | SRS service + Dashboard + fact-check arabophone livré        | `/progress/today` ✓ ; session 10 cartes ; streaks IANA justes         | **Go/No-Go drop P1** vendredi 17h                      |
| **S5**         | Constellation force-directed + Search + 15 racines           | 100+ nodes fluide ; `kitab`→`كِتاب` ; panneau détail                  | Retard ≥3j fin S5 → drop P2 confirmé                   |
| ✅ **S5 Data** | **Wave 2 : 16 racines + 87 mots (de 8 + 47)**                | Objectif 15 racines ATTEINT                                           | —                                                      |
| **S6**         | Polish dark + RTL audit + mobile 375px                       | RTL passé ; mobile utilisable ; dark WCAG OK                          | **Go/No-Go drop P2** vendredi 17h                      |
| **S7**         | Hardening sécurité + bug bash + Lighthouse + `/credits`      | 0 violation axe critique manuel ; Postman 100% ; NVDA AR pass         | —                                                      |
| **S8**         | Déploiement Atlas→Render→Vercel + smoke + vidéo + répétition | URLs up ; vidéo encodée ; 3 comptes test prêts ; chrono OK            | Latence p95 `/health` >5s J5 → backup vidéo            |

**Chemin critique** : S1→S2→S3 (point de bascule fallback)→S4→S5→S6→S7 (buffer)→S8. Slip S1-S2 propage 1-pour-1 sur S8. **Verdict TL** : 8 semaines tenable **uniquement si Community droppé S4 et contenus AR best-effort S6**.

---

## 11. Scope MUST / NICE

### 11.1 MUST verrouillé (10 items)

1. **Auth** register/login/logout/me JWT 24h + tokenVersion + bcrypt 12 + rate-limit auth.
2. **CRUD complet × 4 ressources** Roots/Words/Collections/Notes (Joi+Mongoose+sanitize).
3. **RootTree D3 radial** JSX-pur, ≤15 nodes, zoom/pan, responsive vertical `<sm`, a11y treeitem+flèches.
4. **Constellation force-directed** ≥100 nodes 60fps, filtre semanticField, panneau détail.
5. **Progression SRS** service pur SM-2, `/progress/today`, streaks corrects timezone IANA.
6. **Dataset** 15 racines × 10 mots vocalisés DIN+ASCII, FR/EN obligatoires, fact-check avant S5.
7. **i18n FR+EN 100% + AR chrome + RTL technique 100%**.
8. **Dark mode** CSS vars, tokens figés S1.
9. **Sécurité** Helmet+CSP, rate-limits étendus, adminMiddleware relit DB, gitleaks, no SVG upload.
10. **Déploiement** Atlas+Render+Vercel + `/credits` + cron-job.org.

### 11.2 NICE droppables

**P1 (drop S4 si retard ≥2j à S2)** : page Community ; upload avatar Cloudinary ; Storybook + Sentry ; tests Jest exhaustifs ; refresh tokens path-scopé.

**P2 (drop S6 si retard ≥3j à S5)** : contenus AR complets ; CSP nonces D3 ; `/dev/i18n-preview` ; `<PatternVisualizer>` D3 dédié.

**P3 (garder si possible, wow factor)** : `<CalligraphyAnimated>` SVG paths 5-10 mots ; mode lite reduced-motion exhaustif ; Lighthouse mobile >85 Constellation 300 nodes ; axe-core CI bloquant.

---

## 12. Risques top 5

| #   | Risque                                              | P × I        | Mitigation                                                                                                              | Déclencheur                                               |
| --- | --------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| R1  | **Cold start Render** 30-50s démo                   | H × Critique | cron-job.org `/health` 10min J-1 ; vidéo S8 J3 ; laptop local miroir                                                    | p95 `/health` >5s répétition S8 J5 → backup vidéo         |
| R2  | **Dataset arabe sous-estimé** 7-9 j-p vs brief 3-4j | H × Élevé    | Démarrage S1, pipeline Node+Sheets, 12+3 racines, fact-check natif avant S5, fallback Malt 200€                         | <8 racines validées fin S2 → drop AR + recentrage 12 core |
| R3  | **Courbe D3 radial+force** + React 19 StrictMode    | H × Élevé    | POC S1 J7, buffer S3 +2j, fallback `d3.tree()` vertical, hook `useD3` mutualisé                                         | POC S1 KO → fallback vertical activé S3                   |
| R4  | **XSS stocké** via notes/collections publiques      | M × Critique | sanitize-html backend allowlist, react-markdown+rehype-sanitize, CSP stricte, JWT 24h max, `queryClient.clear()` logout | PR Notes/Collections sans test XSS → blocage merge        |
| R5  | **Overload S6** dark+i18n+RTL+mobile+Community      | H × Moyen    | i18n scaffold S1, dark CSS vars S1, mobile focus Explore/RootTree/Learn, drop Community préventif S4                    | Retard ≥3j fin S5 → drop Community + AR confirmé          |

---

## 13. Critères de succès soutenance

**5 wow moments scriptés**

1. ✅ **Switch FR→EN→AR en live** header → RTL bascule, polices arabes, chrome miroir. (i18n AR 100% Wave 2)
2. ✅ **RootTree radial** `ع-ل-م` : zoom sur `عالِم` → tooltip vocalisé/translit/traduction, nav clavier flèches.
3. ✅ **Constellation** 100+ racines colorées, drag, filtre `Verbe` → repli animé. (Wave 2 : +8 racines → 16)
4. ✅ **Session SRS Learn** : 5 cartes flip, succès/échec, recalcul `nextReviewDate` visible Dashboard. (SM-2 réparé Wave 2)
5. ✅ **Dark mode toggle** : transition instantanée, calligraphie dorée préservée (WCAG AA). + **Page `/letters`** : ConcentricLetters viz avec co-occurrences (Wave 2).

**Comptes test**

- `demo@arabicwordroot.app` : 15 racines apprises, streak 7j, multi-niveaux.
- `jury@arabicwordroot.app` : vierge pour register live.
- `admin@arabicwordroot.app` : démontrer adminMiddleware DB.

**Dataset démo** : 12 core fact-checkées impeccables + 3 buffer. Zéro racine sans vocalisation ni FR/EN.

**Vidéo backup** screencast 3-6min S8 J3 (Loom/OBS) couvrant les 5 wow moments — Drive + clé USB.

**Plan B**

- Render KO → laptop local miroir (Atlas reste source).
- Atlas down → seed JSON local + Mongo Compass.
- Réseau jury HS → vidéo backup, narration directe.

**Slides (10 max)** : problème → architecture → wow RootTree → wow Constellation → SRS → stack → sécurité (dettes assumées) → i18n/a11y → roadmap → Q&A.

**Répétition S8 J5** : 1 chrono complet, 1 avec vidéo, 1 "tout casse".

**Critère ultime** : si le jury arabophone ne voit aucune faute de vocalisation et les 5 wow moments passent sans bug → succès.

---

## 14. Quick start (premier jour — S1 J1)

À exécuter dans l'ordre **aujourd'hui** :

1. **Rename + workspaces** : `git mv backend-arb server && git mv frontend-arb client` ; créer `shared/` ; `package.json` racine avec `"workspaces": ["server","client","shared"]` + scripts §9 ; commit `chore: rename packages to match brief`.
2. **Comptes plateformes** : Atlas (M0 eu-west, user `app_user` readWrite), Render, Vercel, cron-job.org — amorcer les latences d'approbation.
3. **Husky + lint-staged + gitleaks** : install, `npm run prepare`, pre-commit `lint-staged + gitleaks protect --staged + bloc .env*`. `.prettierrc` + `.gitignore`.
4. **`.env.example`** committés sous `server/` et `client/`. Aucun secret `VITE_*` (gitleaks bloque).
5. **`server/` boot** : deps §2.5, `src/config/env.js` Joi fail-fast, `db.js` retry, `app.js`+`server.js`, helmet+cors+rate-limit global, `/api/health[/ready]`, pino+morgan.
6. **`client/` boot** : `npm create vite@latest . -- --template react-ts`, deps §2.5, alias `@/`, scaffold §2.3, `providers.tsx` (QueryClient + Router + 3 Contexts), `router.tsx` lazy, `RootErrorBoundary`, pages stub 404/500.
7. **CI minimale** `.github/workflows/ci.yml` : jobs `lint + build + gitleaks` sur PR ; autres jobs ajoutés S1 J2.
8. **Modèle User + authService register/login + routes `/auth/register|login|me|logout`** + Joi + `requireAuth` + rate-limit auth + tokenVersion. Postman `auth.json` commit.
9. **Design tokens** : `design-tokens.json` UX → script génère `client/src/styles/tokens.css` + `tailwind.config.ts` (catégorielles + neutres + plugin logical-props). Stylelint `csstools/use-logical` armé.
10. **POC D3 RootTree (S1 J7)** : branche `spike/d3-roottree`, 10 nodes hardcodés, `d3.hierarchy + tree().radial()` JSX. Succès si 60fps Chrome desktop + bundle d3 cherry-pick ≤80ko. Échec → fallback `d3.tree()` linéaire en parallèle.

Tag fin de semaine attendu : `s1-auth-done`. S2 démarre sur CRUDs Roots/Words/Notes.

---

## 15. Index des fiches détaillées

| #   | Agent                           | Référence R3                                   |
| --- | ------------------------------- | ---------------------------------------------- |
| 01  | Backend Architect               | `design/round3/agent_01_backend_architect.md`  |
| 02  | Frontend Architect              | `design/round3/agent_02_frontend_architect.md` |
| 03  | Database Designer               | `design/round3/agent_03_database_designer.md`  |
| 04  | UX/UI Designer                  | `design/round3/agent_04_ux_ui_designer.md`     |
| 05  | D3.js / DataViz Specialist      | `design/round3/agent_05_d3_specialist.md`      |
| 06  | Security Engineer               | `design/round3/agent_06_security_engineer.md`  |
| 07  | DevOps / Monorepo               | `design/round3/agent_07_devops.md`             |
| 08  | i18n & Accessibilité            | `design/round3/agent_08_i18n_a11y.md`          |
| 09  | Data Engineer (linguistique AR) | `design/round3/agent_09_data_engineer.md`      |
| 10  | Tech Lead / PM (pilotage)       | `design/round3/agent_10_tech_lead.md`          |

Rounds 1 et 2 dans `design/round1/` et `design/round2/` (mêmes nommages).

---

**Arbitrage final en cas de conflit entre fiches** : agent_10 Tech Lead R3. Tout amendement à ce PLAN_FINAL doit être daté/signé dans `docs/architecture.md`.
