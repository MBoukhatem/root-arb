# Agent #07 — DevOps / Monorepo — Round 3 (Playbook finale)

## 1. Décisions finales verrouillées

- **Rename S1 J1** : `git mv backend-arb server && git mv frontend-arb client`, commit `chore: rename packages to match brief`. Arbitré TL.
- **Orchestration** : **npm workspaces + `concurrently`** (pas de Turborepo). Root `package.json` avec `"workspaces": ["server", "client", "shared"]`.
- **`shared/`** : workspace ESM, **enums/strings uniquement**, pas de code exécutable. Front : alias Vite `@shared`. Back : import relatif.
- **Env** : un `.env` par package (jamais racine), `.env.example` versionné, validation Joi au boot serveur. Aucun secret `VITE_*` (bloqué gitleaks).
- **Branches** : `main` jusqu'à S7, `develop` ouvert S7. Vercel preview deploys = revue UX continue.

## 2. Scripts npm racine

```json
{
  "scripts": {
    "dev": "concurrently -n server,client -c blue,green \"npm:dev:server\" \"npm:dev:client\"",
    "dev:server": "npm run dev --workspace=server",
    "dev:client": "npm run dev --workspace=client",
    "build": "npm run build --workspace=client",
    "start": "npm start --workspace=server",
    "seed": "npm run seed --workspace=server",
    "seed:demo": "npm run seed:demo --workspace=server",
    "validate:dataset": "npm run validate:dataset --workspace=server",
    "lint": "concurrently \"npm:lint:server\" \"npm:lint:client\"",
    "lint:server": "npm run lint --workspace=server",
    "lint:client": "npm run lint --workspace=client",
    "typecheck": "npm run typecheck --workspace=client",
    "test": "npm test --workspace=server",
    "audit:security": "npm audit --omit=dev --audit-level=high",
    "gitleaks": "gitleaks detect --no-banner",
    "prepare": "husky"
  }
}
```

Husky pre-commit : `lint-staged` + `gitleaks protect --staged` + bloc `.env*` (allowlist `.env.example`).

## 3. GitHub Actions — `.github/workflows/ci.yml`

**Déclencheurs** : `pull_request` (toutes), `push` sur `main` et `develop`.
**Matrix** : Node 20.x, Ubuntu latest, cache `~/.npm` via `actions/setup-node@v4`.

**Jobs parallèles** :
1. `lint` — `npm ci && npm run lint`
2. `typecheck` — `npm run typecheck` (client TS)
3. `build` — `npm run build` + check bundle ≤ 200 kB gz (job échoue sinon, garde-fou #05)
4. `validate-dataset` — `npm run validate:dataset` (Joi pur, < 30s, sans Mongo)
5. `seed-smoke` — `mongodb-memory-server` + `npm run seed:demo` (prouve idempotence)
6. `gitleaks` — `gitleaks/gitleaks-action@v2` (gate dur)
7. `axe-core` — Playwright + `@axe-core/playwright` sur 4 pages clés (Home, Explore, RootTree, Dashboard) — gate dur sur violations `critical`/`serious`
8. `npm-audit` — `npm run audit:security` (warn-only sauf CVE critique)

## 4. Déploiement S8

**Atlas (lundi J1)** — Cluster M0 `arabicwordroot-prod`, region eu-west, DB user `app_user` (32 chars random, rôle `readWrite` sur DB `arabicwordroot` uniquement), Network Access `0.0.0.0/0` (Render free sans IP statique, trade-off documenté `docs/security.md`). Seed prod : `MONGO_URI=... npm run seed` depuis local, vérif 12 racines + admin créé.

**Render back (mardi J2)** — Web Service depuis repo. Root `server/`, build `npm ci`, start `npm start`. Healthcheck `/api/health` (ping Mongo, retourne `{status, uptime, mongo, commit}`). Vars : `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET` (64 bytes), `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN=15m`, `JWT_REFRESH_EXPIRES_IN=7d`, `BCRYPT_ROUNDS=12`, `CORS_ORIGIN=https://arabicwordroot.vercel.app`, `RATE_LIMIT_*`, `LOG_LEVEL=info`. Auto-deploy `main`.

**Vercel front (mercredi J3)** — Import repo, root `client/`, framework Vite. `installCommand: "npm install"` à la racine (workspaces). `outputDirectory: client/dist`. Vars : `VITE_API_URL=https://arabicwordroot-api.onrender.com`. Preview deploys activés sur toutes branches. CORS Express : exact match prod + regex `/\.vercel\.app$/`, `credentials:true` scopé `/api/auth/refresh` uniquement.

**Smoke tests (jeudi J4)** — Register/login, fetch racines, RootTree, dark mode, switch FR/EN, refresh token, admin route. README badges CI/Vercel/Render.

## 5. Anti cold-start

**cron-job.org** — GET `/api/health` toutes les **10 min** (Render endort à 15 min), actif J-1 soutenance. Gratuit, plus fiable qu'UptimeRobot.

## 6. Backup / DR démo

- **J4 S8** : `mongodump --uri=$MONGO_URI --out=server/backups/prod-YYYYMMDD/`, archive zip committée sur tag `demo-v1.0`.
- **Compte démo** `demo@arabicwordroot.com` / mdp connu jury, prérempli 30j de progression SRS (script `seed:demo-user`).
- **Plan B** : screencast 6 min de la démo complète (OBS, J5 matin) hébergé Drive + lien QR sur slide finale. Si Render KO ou Atlas down : on bascule sur la vidéo sans rupture.
- **Plan C** : démo locale miroir prête (`npm run dev` + Mongo local seedé) sur clé USB.

## 7. Plan d'exécution

**S1 J1 (matin, 3h)** : rename, root `package.json` workspaces, `shared/` init, Husky + lint-staged + gitleaks, `.prettierrc`, `.gitignore` augmenté, comptes Render/Vercel/Atlas créés (latence approbation), `ci.yml` minimal (lint+build).
**S1 J2** : `ci.yml` complet (tous jobs), `.env.example` figés par #01.
**S3 (0.5j)** : enrichir CI avec `validate:dataset` quand #09 livre le schéma, tag `dataset-v1.0`.
**S7 (0.5j)** : axe-core CI, ouverture `develop`, dry-run déploiement staging Render.
**S8** : J1 Atlas+seed, J2 Render, J3 Vercel, J4 smoke+backup, J5 vidéo backup + warm-up + répétition.
**Budget total : 3,5 j** (cohérent TL).
