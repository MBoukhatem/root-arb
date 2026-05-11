# ArabicWordRoot

Plateforme d'apprentissage de l'arabe par les racines trilitères.

## Stack

- Node.js 20 + Express + MongoDB (server)
- React 19 + Vite + TypeScript (client)
- Monorepo npm workspaces (`server`, `client`, `shared`)

## Quick start

```bash
git clone <repo-url> root-arb
cd root-arb

# Configuration des variables d'environnement
cp .env.example server/.env
cp .env.example client/.env
# Éditer server/.env (JWT_SECRET, DB_URI...) et client/.env (VITE_API_URL)

# Installation
npm install

# Démarrage (server + client en parallèle)
npm run dev
```

Le serveur écoute par défaut sur `http://localhost:5000`, le client sur `http://localhost:5173`.

## Scripts utiles

- `npm run dev` — server + client en parallèle
- `npm run build` — build du client
- `npm run lint` / `npm run typecheck` / `npm run test`
- `npm run seed` / `npm run seed:demo` — peuplement de la base
- `npm run validate:dataset` — validation du dataset racines

## Documentation

Voir [`PLAN_FINAL.md`](./PLAN_FINAL.md) pour l'architecture détaillée, les choix techniques et la feuille de route.
