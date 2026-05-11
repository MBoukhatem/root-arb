# Agent #06 — Security Engineer — Round 3 FINAL

## 1. Décisions finales verrouillées

**Modèle d'authentification retenu : HYBRIDE (compromis #07).**

- **Access token Bearer** : JWT 15 min, stocké `localStorage` côté client, envoyé en `Authorization: Bearer …`.
- **Refresh token** : JWT 7j en cookie `httpOnly + Secure + SameSite=Strict + Path=/api/auth/refresh`, **scopé exclusivement à l'endpoint de refresh**. CORS `credentials:true` activé pour ce seul path ; reste de l'API en CORS sans credentials.
- **`tokenVersion: Int`** sur `User`, incrémenté à logout / changePassword / role change / refresh rotation. Vérifié dans `authMiddleware` (1 lookup DB / requête authentifiée, surcoût accepté).

Rationale : access 15 min ferme la fenêtre XSS (vs 24h R2 / 7j brief). Refresh httpOnly path-scoped reste compatible CORS preview Vercel (le wildcard regex `.vercel.app` ne s'applique qu'au seul `/refresh`). Compromis assumé : `localStorage` survit pour l'access — mitigé par CSP stricte + sanitize-html (P0-2).

## 2. Politique auth complète

| Item | Valeur |
|---|---|
| Access TTL | 15 min |
| Refresh TTL | 7j, rotation à chaque usage (refresh consommé = nouveau délivré) |
| Stockage access | `localStorage` (key `art_at`) |
| Stockage refresh | Cookie `httpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh` |
| Algo signature | HS256, `JWT_SECRET` ≥64 bytes random distinct `JWT_REFRESH_SECRET` |
| Hash password | bcrypt 12 rounds (`BCRYPT_ROUNDS=12` env) |
| Schéma password | `{ type: String, required: true, select: false, minlength: 8 }` |
| Révocation | `tokenVersion` incrémenté → tous tokens existants invalidés |
| Logout | `tokenVersion++` + clear cookie refresh + front `queryClient.clear()` + remove `art_at` |
| Change password | `tokenVersion++` + force re-login |
| Role change (admin) | `tokenVersion++` côté cible |
| Reset password flow | token random 32 bytes en DB (champ `passwordResetToken` hashé sha256 + TTL 1h), invalidé après usage, rate-limit 3/h/email + 5/h/IP |
| Refresh endpoint | `POST /api/auth/refresh` lit le cookie, valide signature + `tokenVersion`, rote refresh, retourne nouvel access |

## 3. Middlewares sécurité (liste exhaustive)

Ordre dans `app.js` : `helmet → cors → rateLimitGlobal → express.json({limit:'100kb'}) → mongoSanitize → hpp → compression → routes`.

- **helmet** : preset par défaut + CSP custom (cf. §5) + `crossOriginEmbedderPolicy:false` (D3 SVG inline OK). HSTS auto Render.
- **CORS** : `origin: (origin, cb) => allowlist.includes(origin) || /^https:\/\/[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$/.test(origin) ? cb(null,true) : cb(err)`. `credentials:true` **uniquement** sur sous-router `/api/auth/refresh`.
- **express-rate-limit (par scope)** :
  - global `100/min/IP`
  - `/api/auth/login` `5/15min/IP` + slowDown progressif
  - `/api/auth/register` `3/h/IP`
  - `/api/auth/forgot` `3/h/email`
  - `/api/auth/reset` `5/h/IP`
  - `/api/auth/refresh` `30/15min/IP`
  - `POST /api/notes` `20/min/user`
  - `GET /api/search/*` `60/min/IP`
  - `admin write` `30/min/user`
- **express-mongo-sanitize** : strip `$` et `.` des keys (anti NoSQL injection).
- **hpp** : anti HTTP parameter pollution.
- **sanitize-html** (middleware applicatif sur body champs user-generated) : allowlist `['b','i','em','strong','p','br','ul','ol','li','code','blockquote']`, aucun attribut, aucun href.
- **multer** (SI upload avatar conservé par #10) : `limits.fileSize=2MB`, `fileFilter` MIME whitelist `image/jpeg|png|webp`, vérif **magic bytes via `file-type`**, **SVG strictement banni**, renommage UUID, upload direct Cloudinary (jamais disque local). Si #10 drop avatar → tout ce bloc tombe.
- **authMiddleware** : vérifie signature + `exp` + `tokenVersion` DB.
- **adminMiddleware** : recharge `User.findById(req.user.id)` et vérifie `user.role === 'admin'` **depuis la DB** (jamais depuis le JWT payload).

## 4. Checklist validation contenu utilisateur

- [ ] Joi: longueurs max strictes (note `content` ≤ 5000 chars, collection `name` ≤ 100, `description` ≤ 500).
- [ ] `sanitize-html` appliqué **avant persistance** sur `Note.content`, `Collection.name/description`, `User.bio`.
- [ ] Front : `react-markdown` avec `rehype-sanitize` (pas de `dangerouslySetInnerHTML` brut).
- [ ] `refPath` sur `Note.target` (`Root` | `Word`) : validation Joi en allowlist explicite — refuser toute autre valeur (sinon SSRF Mongo via populate arbitraire).
- [ ] Recherche : query string limitée à 100 chars, regex échappée (`escape-string-regexp`), pas de regex utilisateur direct.
- [ ] Upload : magic bytes + MIME + extension cohérents (triple check), no-SVG, re-encode `sharp` côté Cloudinary transformation.
- [ ] Échappement à la sortie : React échappe par défaut — vigilance sur `dangerouslySetInnerHTML`, grep CI bloquant.

## 5. CSP & D3

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';   // D3 applique styles inline dynamiques
img-src 'self' data: https://res.cloudinary.com;
font-src 'self' data:;
connect-src 'self' https://api.<domaine>;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
```

`'unsafe-inline'` accepté **uniquement sur `style-src`** (D3 + Framer Motion attribuent du `style` inline en JS). `script-src` reste strict `'self'` — pas de `unsafe-eval`, pas de `unsafe-inline` script. Nonces sur styles = NICE droppé (complexité Vite/D3, gain marginal vu que `script-src` est déjà locked). Documenter le trade-off dans `SECURITY.md`.

## 6. Secrets management

- `.env` jamais committé, `.env.example` versionné (toutes clés, valeurs vides ou placeholders).
- Secrets prod : Render env vars (backend) + Vercel env vars (front, préfixe `VITE_` interdit pour secrets — gitleaks bloque).
- `JWT_SECRET` et `JWT_REFRESH_SECRET` : 64 bytes random distincts (`openssl rand -base64 64`).
- Rotation `JWT_SECRET` : procédure documentée `SECURITY.md` (changer env → tous `tokenVersion` invalidés de facto → users re-login). Non programmée MVP, exécutable en < 5 min si compromission.
- **gitleaks** en pre-commit (Husky) + job CI bloquant.
- Husky bloque tout commit touchant `.env*` (sauf `.env.example`).
- Aucun secret en log (pino redact list : `password`, `token`, `authorization`, `cookie`, `MONGO_URI`).
- `SEED_ADMIN_PASSWORD` : random ≥16 chars généré au boot du seed si non fourni, loggé une fois en clair stdout, jamais persisté en repo.

## 7. Audit final pré-soutenance (checklist)

- [ ] `npm audit --production` = 0 high/critical (backend + frontend).
- [ ] `gitleaks detect --no-git` clean sur l'arbo complet.
- [ ] Test manuel : login → vol token simulé → logout depuis autre device → ancien token rejeté (`tokenVersion`).
- [ ] Test manuel : XSS payload `<img src=x onerror=alert(1)>` dans une note → stocké en texte brut, rendu inerte.
- [ ] Test manuel : POST `/api/auth/login` x10 → 429 après 5.
- [ ] Test manuel : Bearer expiré → 401 → refresh cookie → nouveau access OK.
- [ ] Test manuel : user rétrogradé → tente route admin → 403.
- [ ] Inspecter headers réponse : `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, CSP présents.
- [ ] CORS : preview Vercel random → OK ; origin malveillant → bloqué.
- [ ] DB Atlas : user `app_user` confirmé `readWrite` 1 DB, jamais `atlasAdmin`.
- [ ] Lighthouse Best Practices ≥ 95.
- [ ] `SECURITY.md` à jour (modèle menace, trade-offs `0.0.0.0/0` et `localStorage`, procédure rotation).
- [ ] Slide soutenance "Sécurité" : 3 décisions assumées + 3 mitigations + roadmap post-MVP (httpOnly cookie full, argon2id, WAF).
