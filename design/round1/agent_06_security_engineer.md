# Agent #06 — Security Engineer — Round 1

## 1. Failles & risques identifiés (avec mitigation)

1. **JWT en `localStorage` (brief §1896)** — exposé à toute XSS (vol de token, session hijacking pleine durée). *Mitigation* : passer à un **cookie httpOnly + Secure + SameSite=Strict (ou Lax)** + protection CSRF (token double-submit ou header custom + CORS strict). Si on garde localStorage, alors CSP très stricte est non négociable.
2. **Durée JWT 7 jours, pas de refresh token (§1432)** — fenêtre d'attaque énorme, pas de révocation possible (JWT stateless). *Mitigation* : access token court (**15 min**) + refresh token httpOnly (7-30j) stocké côté DB (rotation + révocation), ou liste de tokens révoqués (jti + Redis).
3. **bcrypt 10 rounds (§1431)** — sous-dimensionné en 2026. *Mitigation* : **12 rounds minimum** (paramétrable via `BCRYPT_ROUNDS`), ou migration vers **argon2id** (recommandation OWASP 2024+).
4. **Rate limit uniquement sur `/login` (5/15min) (§1435)** — register, forgot-password, reset-password, refresh, et endpoints publics lourds (recherche racines) non protégés → énumération de comptes, spam d'inscriptions, DoS. *Mitigation* : rate limit global + buckets spécifiques (register 3/h/IP, forgot 3/h/email, recherche 60/min, admin write 30/min). Ajouter **slow-down** progressif et lockout par email après N échecs.
5. **Notes & collections publiques (contenu communautaire)** — vecteur **XSS stocké** si le frontend rend du markdown/HTML, et vecteur de phishing/spam. *Mitigation* : **DOMPurify côté backend ET frontend**, whitelist de balises markdown, jamais `dangerouslySetInnerHTML` sans sanitization, modération (flag, file admin, soft-delete), limites de longueur Joi strictes.
6. **Joi ne protège PAS du XSS** — Joi valide la *forme*, pas la dangerosité du contenu (un `Joi.string()` accepte `<script>`). *Mitigation* : chaîne Joi → sanitize-html / DOMPurify → store. Encoder à la sortie.
7. **CSP avec D3 (visualisations §brief frontend)** — D3 nécessite souvent SVG inline et parfois `style` inline → tentation de `unsafe-inline`. *Mitigation* : configurer **helmet CSP avec nonces** pour les styles dynamiques D3, pas de `unsafe-eval`, `unsafe-inline` proscrit. Pré-générer les styles statiques.
8. **Upload avatars via multer (§1948)** — MIME spoofing, polyglottes (JPG+JS), path traversal, bombes ZIP/SVG (SVG = XSS !). *Mitigation* : type whitelist (jpg/png/webp), **vérif magic bytes** (file-type), taille max 2 Mo, renommage UUID, stockage hors webroot (idéalement **Cloudinary** déjà mentionné §1455), bannir SVG, ImageMagick/sharp pour re-encoder.
9. **Routes admin basées sur rôle dans JWT** — si on rétrograde un admin, son token reste admin 7 jours. *Mitigation* : vérifier `role` **depuis la DB** dans `adminMiddleware` (le middleware actuel §1408 charge déjà `User.findById` — bien, le confirmer pour admin) ; invalider tokens lors du changement de rôle (incrémenter `tokenVersion` user).
10. **Secrets** — `.env` en prod, pas de rotation JWT_SECRET, pas de doc sur la gestion. *Mitigation* : secret manager (Render/Railway env vars), rotation planifiée + `tokenVersion`, `JWT_SECRET` min. 64 bytes random, ne jamais logger.

## 2. Risques critiques (P0)

- **P0-1** : JWT localStorage + 7j sans refresh = compromission totale sur XSS. Doit être tranché **avant tout dev auth**.
- **P0-2** : XSS stocké via notes/collections publiques (feature core, non optionnelle).
- **P0-3** : `adminMiddleware` doit relire le `role` depuis MongoDB (pas depuis le JWT payload), sinon escalade post-rétrogradation.
- **P0-4** : Upload avatar non encadré = RCE/XSS si SVG ou MIME spoofing accepté.
- **P0-5** : `User.password` doit avoir `select: false` au schéma Mongoose (brief ne le précise pas §447) — sinon fuite via populate/`findOne`.

## 3. Questions aux autres agents

- **Backend (#02)** : confirmes-tu `select: false` sur `password` ? Tu prévois quoi pour révocation JWT (tokenVersion ? blacklist Redis ?) ? Refresh tokens en scope MVP ou bonus ?
- **Frontend (#03)** : si on passe en cookie httpOnly, ton intercepteur axios doit envoyer `withCredentials: true` — OK ? Comment tu rends les notes communautaires (markdown lib ? `dangerouslySetInnerHTML` ?) ? D3 avec styles inline → besoin de nonces CSP ?
- **DevOps (#08)** : HTTPS obligatoire en prod confirmé ? Comment on gère les secrets (Render env, Vault) ? Rotation `JWT_SECRET` prévue ? WAF/Cloudflare devant le backend ?
- **DBA (#04)** : indexes uniques sur `email` + `username` confirmés (anti-énumération via timing) ?

## 4. Recommandations actionnables

1. **Switch auth → httpOnly cookie + CSRF token** (ou minimum : CSP stricte si on garde localStorage).
2. **Access 15min + refresh 7j avec rotation et `tokenVersion`** persisté sur User.
3. **bcrypt rounds = 12** (ou argon2id), `BCRYPT_ROUNDS=12` dans `.env.example`.
4. **Rate-limit étendu** : register, forgot, reset, refresh, search ; slowDown sur login.
5. **Sanitization stricte** sur tout champ user-generated : `sanitize-html` allowlist + longueur Joi raisonnable (note 5000 chars max).
6. **`adminMiddleware`** : `req.user.role === 'admin'` vérifié sur le `User` rechargé en DB (pas sur le JWT).
7. **Schema User** : `password: { type: String, required: true, select: false }`.
8. **Multer** : `limits.fileSize=2MB`, `fileFilter` MIME + magic bytes, bannir SVG, stockage Cloudinary.
9. **Helmet CSP** : `default-src 'self'`, `img-src 'self' https://res.cloudinary.com`, `script-src 'self'`, nonces pour styles D3, pas de `unsafe-eval`.
10. **Logs sécurité** : audit log admin (qui a modifié quelle racine, banni quel user) + tentatives login échouées.
11. **Headers complémentaires** : `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
12. **CI** : `npm audit` + `snyk` + secret scanning (gitleaks) en pre-commit.
