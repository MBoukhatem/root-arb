# Security Audit Post-Wave 2 — `root-arb` (branche `rush`)

## OWASP coverage

| Risk                          | Statut  | Notes                                                                                                        |
| ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| A01 Broken Access Control     | OK      | `requireAuth` + `requireAdmin` (relit `role` DB, anti-stale-JWT). Notes/Collections filtrent par `user`.     |
| A02 Cryptographic Failures    | PARTIEL | bcrypt rounds=12, JWT HS256 OK. `.env` dev contient secret faible ; pas de HSTS explicite (Helmet default).  |
| A03 Injection                 | OK      | `express-mongo-sanitize`, Joi strict, pas de string concat dans queries. `sanitize-html` sur Note.content.   |
| A04 Insecure Design           | PARTIEL | Pas de refresh token / rotation ; logout = bump `tokenVersion`. Pas de lockout user-based (IP-only).         |
| A05 Security Misconfiguration | PARTIEL | CSP prod activé strict ; CSP désactivé en dev (acceptable). HSTS non explicite. `x-powered-by` désactivé OK. |
| A06 Vulnerable Components     | OK      | `npm audit` server prod=0, client=0 (Wave 3 agent_02). bcrypt v6, jsonwebtoken 9, mongoose 8.                |
| A07 Auth Failures             | PARTIEL | Rate-limit login 5/15min OK, register 3/h OK. Pas de MFA, pas de password-strength score (juste length≥8).   |
| A08 Integrity Failures        | N/A     | Pas d'upload, pas d'auto-update. Seed JSON contrôlé.                                                         |
| A09 Logging Failures          | PARTIEL | pino logger en place. Pas d'audit log dédié auth events (login fail, role change).                           |
| A10 SSRF                      | N/A     | Aucun outbound HTTP server-side ; pas de `fetch(userInput)`.                                                 |

## Findings

1. **[HIGH] JWT_SECRET dev faible commité en clair** — `server/.env:7` contient `dev_secret_minimum_32_chars_replace_in_prod_with_64_random_hex`. `.env` est gitignoré, mais si un dev copie ce pattern en prod : RCE token forging. **Fix** : `JWT_SECRET=$(openssl rand -hex 48)` + check démarrage prod qui refuse les secrets contenant "dev\_", "change-me", "replace".

2. **[HIGH] Logout révoque TOUTES les sessions actives** — `authService.js:80-90` incrémente `tokenVersion` au logout. Vecteur : user connecté mobile+desktop → logout mobile invalide desktop. **Fix** : implémenter jti-list (Redis) ou refresh-token rotation, garder `tokenVersion++` uniquement pour `changePassword` / révocation explicite.

3. **[MEDIUM] CORS dev ouvert à toutes origines** — `app.js:62` : `if (env.isDev) return cb(null, true)`. Si un dev set `NODE_ENV=development` accidentellement en staging public : CSRF cross-origin possible (mais `credentials:false`). **Fix** : whitelist explicite même en dev OU garde-fou `if (env.isDev && process.env.HOST === 'localhost')`.

4. **[MEDIUM] HSTS non explicitement configuré** — Helmet `useDefaults: true` couvre HSTS (1 an, includeSubDomains, preload) par défaut, mais aucune assertion. **Fix** : test e2e qui vérifie `Strict-Transport-Security` header en prod.

5. **[MEDIUM] Mass-assignment partial sur User profile** — `User.js` n'a pas de blocklist explicite côté update ; aucun controller n'expose `PUT /users/:id` (audité). Risque latent si un agent ajoute route profile sans validation Joi `stripUnknown`. **Fix** : documenter convention `validate({...}, 'body')` obligatoire.

6. **[MEDIUM] sanitize-html autorise `<a href>` sans filtre `javascript:`** — `noteService.js:9-12` : `allowedAttributes: { a: ['href'] }` sans `allowedSchemes`. Défaut sanitize-html autorise `http,https,ftp,mailto` (safe), mais si un futur dev override `allowedAttributes` sans `allowedSchemes`, XSS via `javascript:alert(1)` re-introduite. **Fix** : expliciter `allowedSchemes: ['http','https','mailto']` et `allowedSchemesAppliedToAttributes: ['href']`.

7. **[LOW] Anti-énumération login OK mais register fuite** — `authService.js:26-31` retourne 409 `EMAIL_TAKEN` vs `USERNAME_TAKEN` : énumération de comptes via `/register`. Rate-limit 3/h atténue. **Fix** : message générique `"Email or username unavailable"`.

8. **[LOW] `User.findById` redondant dans `requireAuth`** — chaque requête authentifiée = 1 read Mongo. DoS-amplification. **Fix** : cache short-TTL `tokenVersion` (LRU 60s).

9. **[LOW] Pas d'audit log événements auth** — login success/fail, role change, password change non loggés séparément. **Fix** : `logger.info({ event: 'auth.login.success', userId })` dans `authService`.

10. **[LOW] CSP `styleSrc 'unsafe-inline'`** — Nécessaire pour Tailwind/D3 mais affaiblit anti-XSS. Acceptable, à documenter.

## Positive

- `npm audit` server **prod=0 high/critical**, client=0.
- Helmet + mongo-sanitize + hpp + express.json `limit:'100kb'` (anti-DoS).
- Tous IDs validés Joi `.hex().length(24)` (anti-NoSQL injection cast).
- Mongo `select: false` sur `password` et `tokenVersion`, `toJSON` strip.
- bcrypt v6 rounds=12, password policy `no-whitespace` + min 8.
- `requireAdmin` re-lit role DB (anti élévation via stale JWT).
- Routes admin (POST/PUT/DELETE roots/words) bien gardées.
- Generic `Invalid credentials` au login (anti-énumération).
- Pas de `eval`, `Function()`, `child_process`, `readFileSync(userInput)`.
- `.env` correctement gitignoré.

## Verdict

**REQUEST CHANGES** pour prod — Bloquants : finding #1 (JWT_SECRET pattern faible) et #2 (logout TOUTES sessions). Findings #3-#6 à fixer avant prod. Le reste est defense-in-depth.

Pour le MVP académique courant : APPROVE — risques documentés, environnement dev contrôlé.
