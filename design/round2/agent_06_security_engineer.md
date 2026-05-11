# Agent #06 — Security Engineer — Round 2

## 1. Réponses aux questions

**Backend (#01) — refresh tokens et scope rate-limit.**
Refresh token = **NICE, pas MUST** pour ce MVP solo. Compromis : **access JWT 24h** (au lieu de 7j) + `tokenVersion` (Int) sur `User`, incrémenté à `logout`/`changePassword`/`role change`, vérifié dans `authMiddleware`. Révocation sans Redis. Si bonus S7 : ajouter refresh httpOnly 7j avec rotation. Rate-limit MUST étendu : `/auth/login` 5/15min, `/auth/register` 3/h/IP, `/auth/forgot` 3/h/email, `/auth/reset` 5/h/IP, global API 100/min/IP, `notes POST` 20/min, recherche 60/min. SlowDown progressif sur `/auth/*`.

**Frontend (#02) — localStorage JWT.**
**Objection maintenue *techniquement*, acceptée *pragmatiquement*.** Cookie httpOnly + CSRF coûte 1-2j (CORS credentials, regex Vercel preview, axios `withCredentials`). Conditions non négociables pour garder localStorage : (1) **CSP stricte** helmet (`script-src 'self'`, pas `unsafe-eval`) ; (2) **sanitize-html** sur notes/collections (principal vecteur XSS qui volerait le token) ; (3) **bannir SVG upload** ; (4) **JWT 24h max** ; (5) `queryClient.clear()` au logout. Si #02 valide ces 5 garde-fous → localStorage OK MVP.

**DevOps (#07) — `0.0.0.0/0` Atlas + Render free.**
**Accepté avec compensations documentées.** Obligatoire : (a) DB user dédié `app_user` rôle `readWrite` sur 1 DB, **jamais `atlasAdmin`** ; (b) password ≥32 chars random ; (c) `MONGO_URI` uniquement en env Render ; (d) SCRAM-SHA-256 (défaut) + audit log Atlas. Trade-off noté dans README + slide soutenance ("projet école — prod réelle = IP statique Render payante"). Rotation secrets : procédure dans `SECURITY.md`, non critique MVP.

**DB Designer (#03) — bcrypt 12 + `select: false`.**
**Convergence totale.** `password: { type: String, required: true, select: false, minlength: 8 }`, `BCRYPT_ROUNDS=12` paramétrable. Bonus : index unique `email`/`username` collation case-insensitive (proposé par #03) réduit aussi l'énumération par timing — j'adopte. Pre-save : bcrypt + `email.toLowerCase().trim()`.

**Tech Lead (#10) — niveau sécurité MUST si scope serré.**

| MUST | NICE (droppable) |
|---|---|
| bcrypt 12 + `select:false` | argon2id |
| `tokenVersion` + JWT 24h | refresh tokens rotation |
| Rate-limit `/auth/*` + global | slowDown, lockout email |
| Helmet + CSP minimale | CSP nonces D3 |
| sanitize-html sur notes | DOMPurify front en plus |
| `adminMiddleware` relit `role` en DB | audit log admin complet |
| HTTPS (auto Render/Vercel) | HSTS preload, Permissions-Policy |
| `.env` exclus + gitleaks pre-commit | Snyk CI |
| Multer whitelist MIME + magic bytes + no-SVG (si avatar gardé) | re-encode sharp |
| CORS allowlist stricte | WAF Cloudflare |

**Si #10 drop upload avatar (qu'il classe NICE) → tout le bloc multer/Cloudinary tombe, gain ~1j réinjectable en audit/tests.**

## 2. Désaccords résiduels

- **#02 localStorage** : désaccord technique maintenu (cookie httpOnly = bonne pratique 2026), accepté pragmatiquement sous les 5 conditions. À revérifier en S7 bug bash.
- **#07 `0.0.0.0/0`** : pas un désaccord — dette technique **explicitement assumée et documentée**.

## 3. Convergences

- bcrypt 12 + `select: false` (#03)
- Helmet + CSP + sanitize-html user-generated (#01, #02, #03)
- Rate-limit étendu au-delà de login (#01 demandait arbitrage → tranché oui)
- HTTPS auto Render/Vercel (#07)
- `tokenVersion` sur User (validé via pre-save hooks #03)
- Indexes unique collation case-insensitive (#03) → anti-énumération bonus
- Bannir SVG upload + magic-bytes (#07 si avatars gardés)
- Seed admin password via env, jamais en dur (#09)

## 4. Ajustements à ma R1

- **Refresh tokens** : passés en NICE (R1 les présentait quasi-MUST). `tokenVersion` + JWT 24h suffit MVP.
- **httpOnly cookie** : objection downgradée en *recommandation forte* plutôt que blocker.
- **argon2id** : retiré, bcrypt 12 acceptable (convergence #03).
- **CSP** : version "minimale stricte" sans nonces si scope serré (nonces D3 → NICE).
- **Upload avatar** : tout le bloc sécurité multer devient conditionnel à la décision #10.

## 5. Questions résiduelles

- **#02** : tu valides les 5 conditions (CSP, sanitize, no-SVG, JWT 24h, queryClient.clear) ?
- **#01** : tu implémentes `tokenVersion` dans `authMiddleware` (1 lookup DB / req auth — acceptable surcoût ?) ?
- **#07** : endpoint `/api/health` non rate-limited et n'exposant ni version ni stack (`{ status: 'ok' }`) ?
- **#10** : confirmation drop upload avatar = drop tout le scope sécurité multer ?
- **#09** : `SEED_ADMIN_PASSWORD` doit être un random ≥16 chars généré au boot, loggé une fois, jamais `admin123` — confirmé ?
