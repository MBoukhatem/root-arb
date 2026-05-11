# Agent #02 — Frontend Architect — Fiche Round 2

> Note de numérotation : plusieurs agents me désignent #03 (Backend #01) ou #04 (i18n #08). Je suis bien **#02 Frontend**. Je réponds aux questions adressées à "Frontend Architect" peu importe le numéro.

## 1. Réponses aux questions reçues

- **Backend (#01)** — `/api/roots/:id` doit renvoyer les `words[]` populés (1 round-trip) pour `RootTree` : ≤15 mots, payload ~5 ko, mieux que 2 round-trips. Pour `/api/constellation` : format **`{ nodes, links }`** D3-ready, `source`/`target` en **strings (id)** — je clonerai côté client avant `forceSimulation` pour éviter la mutation. Format de réponse : ton `sendSuccess`/`sendError` me va, je type un `ApiResponse<T>` générique en TS.
- **UX (#04)** — Oui, je peux exposer un hook **`useDesignTokens()`** qui lit les CSS variables (`getPropertyValue('--cat-verb')`) ; les tokens vivent dans `src/styles/tokens.css` consommés par Tailwind (`theme.extend.colors`) ET par D3. Je l'aligne sur ton `design-tokens.json` source unique.
- **D3 (#05)** — Pattern hybride **validé** (RootTree = JSX, Constellation = impératif). Le hook `useD3` reste **colocaté dans `features/constellation/hooks/`**, pas global — il sert uniquement aux composants D3 muteurs. Le `zoom/transform` est un **state local** (`useState`) ; le deep-link `?zoom=2` est NICE, on diffère.
- **i18n (#08)** — `tailwindcss-rtl` **non** : on part sur **logical properties natives** (`ms-*`, `me-*`, `start-*`, `end-*`) imposées par Stylelint, plus pérenne. Lazy-load des namespaces par route via `i18next-http-backend` côté React.lazy. Ton composant `<ArabicText>` est adopté.
- **Sécurité (#06)** — Sur **cookie httpOnly + CSRF** : OK en principe, j'ajoute `withCredentials: true` sur l'instance Axios + intercepteur qui injecte le header CSRF `X-CSRF-Token` lu depuis un endpoint `/api/auth/csrf`. Notes communautaires : **markdown rendu via `react-markdown` + `rehype-sanitize`** (allowlist), zéro `dangerouslySetInnerHTML`. D3 : pas de styles inline, classes Tailwind + `currentColor` → **pas besoin de nonce**.
- **Data (#09)** — Oui, j'ai besoin de `transliterationSimplified` (ASCII) en plus du DIN 31635 pour la recherche tolérante (`kitab` → `kitāb`). Ajoute-le au schéma Word.
- **Tech Lead (#10)** — RTL Tailwind = **plugin natif `dir-*:` (v3.3+) + logical properties**, pas de plugin tiers. Budget estimé : ~2 j en S6 si scaffold `<ArabicText>` + `useDirection()` fait en S1 (sinon 5+ j).

## 2. Désaccords / arbitrages

- **JWT en cookie httpOnly (Security #06) vs localStorage (mon R1)** : je **m'aligne sur Security**. Cookie httpOnly + CSRF token. Impacts sur mon code : Axios `withCredentials: true`, plus de header `Authorization` à gérer, `AuthContext.logout()` appelle `/api/auth/logout` (le serveur clear le cookie) puis `queryClient.clear()`.
- **Rename `backend-arb/frontend-arb` → `server/client` (DevOps #07) vs garder les noms (Backend #01)** : je suis **DevOps** — `client/` simplifie tous les paths Vercel, scripts npm, doc. Faire le `git mv` en S1 J1 avant que les imports se figent.
- **Scope i18n AR : NICE droppable (Tech Lead #10) vs MUST scaffold dès S1 (i18n #08)** : compromis — **scaffold du RTL/`<ArabicText>`/logical properties dès S1** (coût marginal), mais **traductions AR effectives** restent droppables en S6 si retard. La structure ne coûte rien, le contenu coûte.
- **TS vs JS** : aucun agent ne s'oppose à mon choix TS — je le confirme et documente dans la PR bootstrap.

## 3. Convergences validées

- Architecture **feature-folder** (cohérent avec Backend qui ajoute `services/`).
- **TanStack Query v5 + Axios** : aucun pushback.
- **D3 pattern hybride** : verrouillé avec D3 Specialist.
- **Error boundaries en cascade** + skeletons locaux.
- **`react-i18next` + namespaces par feature** (i18n #08 valide).
- **Lazy-loading routes** + import sélectif `d3-hierarchy/force/zoom`.
- **Page `/credits`** (Data #09) : j'ajoute la route.

## 4. Ajustements à ma conception Round 1

1. **Auth** : passage de localStorage → **cookie httpOnly + CSRF**. `axiosInstance` reconfigurée (`withCredentials`, intercepteur CSRF). `AuthContext.bootstrap()` appelle `/api/auth/me` (200 si cookie valide, 401 sinon) — plus de lecture token au boot.
2. **Renommer `frontend-arb/` → `client/`** en S1 J1.
3. **`<ArabicText>`** comme composant unique imposé dans `shared/ui/` — bannir tout texte arabe brut en JSX.
4. **Hook `useDesignTokens()`** dans `shared/hooks/` exposé à D3 et Recharts.
5. **`useDirection()`** dérivé de `LanguageContext`, applique `<html dir>` + classe body.
6. **Scaffold i18n complet en S1** (3 namespaces minimum × 3 langues, AR avec stubs) — pas en S6.
7. **`React.memo` strict** sur les composants D3 avec comparateur par `_id` (recommandation #05).
8. **CI axe-core bloquante** (UX #04 + i18n #08) — j'intègre `@axe-core/playwright` dans la CI front.
9. **Validation pluralisation arabe** (`Intl.PluralRules` + `compatibilityJSON: 'v4'` dans i18next).
10. **Renderer markdown sécurisé** (`react-markdown` + `rehype-sanitize`) imposé partout où on rend du contenu user (Notes, Collections description).

## 5. Questions résiduelles

- **Backend #01** : peux-tu m'exposer un endpoint `GET /api/auth/csrf` qui set le cookie CSRF + renvoie le token dans le body, pour que mon intercepteur Axios l'injecte ?
- **Backend #01** : `/api/constellation` filtré par user (auth requis) OU vue publique d'un autre user via `?userId=` ? Impact direct sur le cache TanStack Query key.
- **D3 #05** : sur Constellation Canvas fallback >800 nodes, qui décide du seuil — runtime (mesure) ou config statique ? Je préfère un flag `RENDER_MODE: 'svg' | 'canvas'` dans le state pour pouvoir A/B.
- **DevOps #07** : preview deploys Vercel sur PRs — comment je détecte côté front l'env preview pour afficher un banner "PREVIEW BUILD" ? Une `VITE_ENV=preview` injectée suffit.
- **Tech Lead #10** : si on drop AR contenu mais qu'on garde le scaffold RTL, je propose de **livrer la 3e langue en stub** (clés affichées telles quelles) — accepté pour la démo ?
