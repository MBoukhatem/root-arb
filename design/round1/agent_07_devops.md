# Agent #07 — DevOps / Monorepo Engineer — Round 1

> Projet ArabicWordRoot — Monorepo MERN, déploiement Render + Vercel/Netlify, MongoDB Atlas.
> État actuel : `backend-arb/` + `frontend-arb/` (le brief mentionne `server/`/`client/`).

---

## 1. Décisions monorepo / CI / CD

1. **Outil d'orchestration : `concurrently` (pas Turborepo/Nx).**
   Projet 1-dev, 8 semaines, 2 packages seulement, pas de cache distribué nécessaire. Turborepo serait surdimensionné et alourdirait la soutenance. On garde `npm-workspaces` + `concurrently` : simple, lisible, dans le brief.

2. **Naming : RENOMMER `backend-arb/` → `server/` et `frontend-arb/` → `client/`.**
   Le brief, les scripts npm racine (`dev:server`, `dev:client`), la doc et le pitch s'appuient sur ces noms. Diverger crée une dette de documentation pour zéro gain. À faire **en semaine 1** avant que les imports/CI ne se figent. `git mv` préserve l'historique.

3. **`shared/constants.js` — stratégie "copie simple" via npm workspaces.**
   Pour rester compatible Vite (front ESM) ET Node (back CJS) sans bundler partagé : déclarer `shared/` comme workspace avec `"type": "module"` + champ `exports`. Côté `client`, alias Vite `@shared`. Côté `server`, import relatif `../../shared`. Pas de build step, pas de TS partagé en round 1.

4. **`.env` : un fichier par package, jamais à la racine.**
   `server/.env` (PORT, MONGO_URI, JWT_SECRET, CORS_ORIGIN) et `client/.env` (VITE_API_URL). Un `.env.example` dans chaque package + un `.env.example` racine documentaire. `.gitignore` global déjà couvre `.env`.

5. **Git hooks : Husky + lint-staged dès semaine 1.**
   Pre-commit : ESLint + Prettier sur fichiers stagés. Commit-msg : conventional-commits (optionnel mais joli pour soutenance). Installé à la racine via `husky install` dans `prepare`.

6. **CI GitHub Actions — workflow unique `ci.yml` sur PR + push `main`/`develop`.**
   Jobs parallèles : `lint-server`, `lint-client`, `build-client`, `test` (placeholder semaines 1-6, réel S7). Matrix Node 20. Cache `~/.npm` via `actions/setup-node`. Pas de déploiement depuis Actions — on laisse Render/Vercel gérer leurs webhooks (plus simple, moins de secrets à gérer).

7. **Stratégie de branches : `main` (prod) + `develop` (staging) + feature branches.**
   Render auto-deploy sur `main` uniquement. Vercel : preview deploys sur **toutes les PRs** (puissant pour démo + revue UX). `develop` → environnement staging Render gratuit (web service séparé) si quota le permet, sinon on s'en passe.

8. **MongoDB Atlas — cluster M0 free, IP whitelist `0.0.0.0/0` assumée.**
   Render free tier n'a pas d'IP statique (Static Outbound IP = payant). Le trade-off est documenté : sécurité = SRV connection string + **mot de passe DB fort 32 chars** + user dédié `app_user` avec rôle `readWrite` sur une seule DB (pas atlasAdmin). En production réelle on prendrait un add-on IP statique.

---

## 2. Risques

- **Cold start Render free tier (~50s)** : le back s'endort après 15min d'inactivité. Risque démo soutenance. Mitigation : UptimeRobot ping `/api/health` toutes les 5 min + écran de loading explicite côté front + warm-up 10min avant la démo.
- **Limite build minutes Render** (~500/mois free) : un push qui boucle peut épuiser le quota. Mitigation : `[skip ci]` dans messages de commit doc-only, branch filter sur Render.
- **`shared/` casse le build Vercel** si le package n'est pas correctement déclaré workspace ou si Vercel ne fait `npm install` qu'au niveau `client/`. Mitigation : config `vercel.json` avec `installCommand: "npm install"` à la racine + `outputDirectory: "client/dist"`.
- **Secrets exposés** : `.env` committé par erreur, ou `VITE_*` contenant des secrets (toutes vars `VITE_` sont publiques car bundlées). Mitigation : pre-commit hook qui bloque `*.env`, doc explicite dans README sur le préfixe `VITE_`.
- **CORS mal configuré entre Vercel preview deploys et Render** : les URLs de preview sont dynamiques (`*-git-feature-xxx.vercel.app`). Mitigation : whitelist regex côté Express (`/\.vercel\.app$/`) + variable `CORS_ORIGIN` paramétrable.

---

## 3. Questions aux autres agents

**Backend (#01) :**
- Endpoint `/api/health` prévu ? J'en ai besoin pour UptimeRobot et le healthcheck Render.
- Tu vois un cas où `shared/constants.js` doit contenir du code exécutable (fonctions) ou seulement des enums/strings ? Ça change la stratégie (workspace simple vs build step).
- OK pour figer la signature `MONGO_URI` / `JWT_SECRET` / `JWT_EXPIRES_IN` / `CORS_ORIGIN` / `PORT` dès semaine 1 ?

**Security (#06) :**
- On part sur `0.0.0.0/0` Atlas en assumant que la défense est uniquement au niveau credentials + JWT. Tu valides ce trade-off ou tu veux un add-on IP statique Render (5 $/mois) ?
- JWT en `httpOnly cookie` (impose CORS `credentials: true` + `SameSite=None; Secure`) ou en `Authorization: Bearer` localStorage ? Impact direct sur la config CORS/Vercel.
- Secret rotation : on fait quoi en semaine 8 si un secret leak ? Procédure documentée ou on assume "projet école" ?

**Tech Lead (#10) :**
- Confirmation pour le rename `backend-arb`/`frontend-arb` → `server`/`client` ? Je le fais en début S1 sinon ça coûte cher plus tard.
- Tu veux un `develop` staging ou on reste mono-branche `main` jusqu'à S7 ?
- Budget temps DevOps : je vise 0,5j S1 (setup) + 0,5j S7 (CI tests) + 2j S8 (déploiement). Cohérent avec ton planning global ?

---

## 4. Recommandations actionnables

### Semaine 1 — Setup (jour 1-2)

1. `git mv backend-arb server && git mv frontend-arb client`, commit "chore: rename packages to match brief".
2. Créer `package.json` racine avec `"workspaces": ["server", "client", "shared"]` + scripts `dev`/`build`/`lint`/`install:all` du brief.
3. Initialiser `shared/` (package.json minimal, `constants.js` vide avec exports nommés).
4. Husky + lint-staged + Prettier config racine partagée (`.prettierrc`).
5. ESLint : un `eslint.config.js` par package (le front en a déjà un), pas de config root partagée (gain marginal).
6. `.gitignore` racine déjà bon, ajouter `*.local`, `coverage/`, `.vercel/`, `.render/`.
7. Créer `.github/workflows/ci.yml` minimal : checkout → setup-node 20 → `npm ci` → `npm run lint` → `npm run build`.
8. Créer comptes Render + Vercel + MongoDB Atlas M0 dès maintenant (latence d'approbation parfois 24h).

### Plan déploiement Semaine 8

**J1 (lundi)** — MongoDB Atlas prod : cluster `arabicwordroot-prod`, DB user `app_user`, whitelist `0.0.0.0/0`, connection string copiée. Seed exécuté localement contre prod (`MONGO_URI=... npm run seed`).

**J2 (mardi)** — Backend Render : Web Service depuis repo GitHub, root directory `server/`, build `npm install`, start `npm start`, vars env (MONGO_URI, JWT_SECRET, NODE_ENV=production, CORS_ORIGIN=https://arabicwordroot.vercel.app). Healthcheck path `/api/health`. Auto-deploy `main`.

**J3 (mercredi)** — Frontend Vercel : import repo, root `client/`, framework Vite auto-détecté, var env `VITE_API_URL=https://arabicwordroot-api.onrender.com`. Activer preview deploys sur toutes les branches.

**J4 (jeudi)** — Smoke tests post-déploiement : register/login, fetch racines, RootTree D3, dark mode, i18n. UptimeRobot configuré (ping `/api/health` 5min). README racine mis à jour avec badges (CI, Vercel, Render).

**J5 (vendredi)** — Backup démo : dump Mongo (`mongodump`) committé dans `server/src/seeds/data/backup.json`, compte démo `demo@arabicwordroot.com` prérempli avec 30j de progression. Warm-up Render 30min avant soutenance.
