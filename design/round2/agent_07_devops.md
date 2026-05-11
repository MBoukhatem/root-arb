# Agent #07 — DevOps / Monorepo — Round 2

## 1. Réponses aux questions directes

**Backend (#01) — vars env et `/health`.**
OK pour figer S1 J1, Joi-validé au boot : `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET` (64+ chars), `JWT_EXPIRES_IN` (`15m`), `JWT_REFRESH_SECRET/EXPIRES_IN`, `BCRYPT_ROUNDS` (`12`, cf. #06), `CORS_ORIGIN`, `RATE_LIMIT_*`, `LOG_LEVEL`, `CLOUDINARY_*`, `SEED_ADMIN_*`. Toute nouvelle clé doit modifier `.env.example` ET `config/env.js` dans la même PR.
`/api/health` → `{ status, uptime, mongo: readyState===1, commit: RENDER_GIT_COMMIT }`. Mongo pingé sinon healthcheck Render mensonger. `shared/` : enums/strings only, pas de code exécutable.

**Tech Lead (#10) — rename + budget.**
Rename `backend-arb→server`, `frontend-arb→client` confirmé S1 J1 (`git mv` préserve l'historique). Désamorce #01 qui voulait garder : brief, pitch et grille jury parlent de `server/client/`. Budget : 0,5j S1 + 0,5j S3 + 0,5j S7 + 2j S8 ≈ 3,5j total. Mono-branche `main` jusqu'à S7, `develop` ouvert en S7. Vercel preview deploys par PR couvre la revue UX intermédiaire.

**Data Engineer (#09) — seed via route admin vs script.**
**Standalone uniquement.** Une route `POST /api/admin/seed` upsertant ~5000 docs = DoS + surface d'attaque inutile. Seed via `npm run seed --workspace=server`. S8 J1, lancement manuel contre Atlas prod. CI exécute `validate:dataset` (gate dur) + `seed:demo` contre `mongodb-memory-server` pour prouver idempotence.

## 2. Désaccords

**Security (#06) — `0.0.0.0/0` Atlas.** Je maintiens. Render free n'a pas d'IP statique (Static Outbound = 7$/mois). La défense réelle : `app_user` rôle `readWrite` sur une seule DB, password 32 chars, `JWT_SECRET` 64 bytes + `tokenVersion`, rate-limit étendu, audit log admin. Risque résiduel = brute-force credentials, couvert par tes P0. Trade-off documenté dans `docs/security.md`.

**Security (#06) — JWT cookie vs Bearer.** Full httpOnly cookie casse CORS Vercel preview (regex `.vercel.app` incompatible avec `credentials:true`). **Compromis** : access token Bearer/localStorage (15 min, fenêtre XSS courte) + refresh token httpOnly cookie scopé `path=/api/auth/refresh`. `credentials:true` activé pour ce seul path. CSP + sanitize-html (tes P0-2) couvrent le reste.

## 3. Convergences

- **#01** : `/api/health` ping Mongo + `app.js` séparé + env Joi-validé.
- **#02** : `VITE_*` dans `client/.env.example`, aucun secret préfixé `VITE_` (gitleaks bloque).
- **#03** : `User.timezone` IANA — aucun impact infra.
- **#05** : import sélectif `d3-hierarchy/force/zoom/...`, budget bundle ~180 kB gz vérifié CI.
- **#09** : `data/` versionné, tag `dataset-v1.0` fin S2, `validate:dataset` bloquant, `/credits` statique.
- **#06** : `npm audit` + `gitleaks` pre-commit et CI.
- **#04 + #08** : `axe-core` CI frontend (gate dur sur violations critiques).

## 4. Ajustements à R1

1. **JWT** : Bearer access 15min + refresh cookie httpOnly path-scoped `/api/auth/refresh`. CORS allowlist hybride : exact match prod + regex preview, `credentials:true` uniquement pour `/refresh`.
2. **`shared/`** : confirmé enums + clés API en exports nommés, pas de fonctions (cf. #08 qui pousse enums-EN en base — alimente `shared/enums.js`).
3. **CI enrichie** : jobs `lint`, `build`, `validate:dataset` (#09), `gitleaks` (#06), `axe-core` (#04/#08), bundle-size (#05), `seed:demo` sur memory-server. Node 20.x.
4. **Husky pre-commit** : lint-staged + `gitleaks protect --staged` + bloc fichiers `.env*` (sauf `.env.example`).
5. **Render healthcheck** : `/api/health` (toutes routes préfixées `/api`).
6. **Anti cold start** : passage UptimeRobot → **cron-job.org** (reco #10), ping `/api/health` toutes les 10 min, actif jour J de la soutenance.

## 5. Questions résiduelles

- **#01** : `pino` en JSON one-line (parsable Render logs) ? Les stack multi-ligne cassent le filtrage Render.
- **#06** : tu valides le compromis Bearer + refresh-cookie path-scoped ? Réponse nécessaire S1 J2 sinon Auth retravaille en S2.
- **#10** : si on drop AR/RTL en S6, on garde quand même le preload Amiri pour les racines affichées en arabe en UI FR/EN ? (Confirmation #08.)
- **#09** : `validate:dataset` tourne sans Mongo (lecture JSON + Joi pur) en < 30s, confirmé ? Sinon il faut service Mongo dans GH Actions.
- **#02** : Sentry en S8 ou bypass total ? Décide la présence/absence de `VITE_SENTRY_DSN` dans `.env.example`.
