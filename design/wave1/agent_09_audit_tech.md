# Audit Technique — ArabicWordRoot

## TypeScript

- **Total erreurs : 0** (`npm run typecheck` clean sur `@arb/client`, pas de typecheck sur `@arb/server` JS CommonJS).
- `tsc -b --noEmit` passe.

## ESLint

- **9 errors, 2 warnings**, lint échoue (`@arb/server` n'a qu'un `echo "(todo) eslint"` — angle mort backend).
- Règles violées :
  1. `react-hooks/set-state-in-effect` — **5x** (AuthContext.tsx:34, ThemeContext.tsx:55, useDesignTokens.ts:56, SearchBar.tsx:39, StatCard.tsx:31).
  2. `react-refresh/only-export-components` — **2x** (AuthContext.tsx:100, LanguageContext.tsx:75, ThemeContext.tsx:82).
  3. `@typescript-eslint/no-unused-vars` — **1x** (ArabicText.tsx:43 `_vocalized`).
  4. `unused eslint-disable` — **2x warnings** (LandingPage.tsx:16, ErrorBoundary.tsx:32).

## Console errors

- **Frontend (`/tmp/client.log`)** : aucune erreur/warning. Vite démarre clean en 261 ms sur :4180.
- **Backend (`/tmp/server.log`)** : aucune erreur/warning/exception. Seed auto OK.

## Bundle

- Build OK en **369 ms**, 2374 modules, exit 0.
- **Chunks > 100 KB (avant gzip)** :
  - `index-BBCWmSPx.js` — **328 kB** (gzip 104 kB) : entry principal.
  - `proxy-CELFpJLq.js` — **124 kB** (gzip 41 kB) : très probablement framer-motion.
- Chunks notables : `viz-BgKpLMwa.js` 81 kB (d3, isolé), `axiosInstance` 42 kB.
- Code-splitting par route présent (toutes les pages en chunks <16 kB). CSS bundle 33.5 kB.

## npm audit

- **3 high, 0 critical** (prod only) :
  - `tar <=7.5.10` (path traversal, symlink poisoning, race condition).
  - `@mapbox/node-pre-gyp` → dépend de `tar` vulnérable.
  - `bcrypt@5.1.1` → dépend de `@mapbox/node-pre-gyp`. Fix dispo via `bcrypt@6.0.0` (breaking).

## Outdated

- **Majeurs** : `express` 4→5, `mongoose` 8→9, `i18next` 24→26, `react-i18next` 15→17, `lucide-react` 0.469→1.14, `pino` 9→10, `joi` 17→18, `dotenv` 16→17, `express-rate-limit` 7→8, `lint-staged` 15→17, `mongodb-memory-server` 10→11, `bcrypt` 5→6.

## Code mort / TODO

- 3 TODO côté serveur (`server/src/models/User.js:7`, `server/src/utils/enums.js:4`, `server/src/utils/arabic.js:5`) — interop ESM/CJS entre `@arb/shared` (ESM) et `@arb/server` (CJS).
- Aucun TODO/FIXME côté client.
- Variable inutilisée : `_vocalized` (ArabicText.tsx:43).

## Patterns à risque

- **`: any`** explicite : **0** côté client, **0** côté server. Code TS strictement typé.

## Findings classés (severity)

1. **[HIGH]** 3 vulnérabilités CVE high sur `bcrypt → @mapbox/node-pre-gyp → tar`. Fix : `npm i bcrypt@6` (breaking).
2. **[HIGH]** 5 violations `react-hooks/set-state-in-effect`. Cascading renders, perf et risque de boucle. Fix : `useSyncExternalStore`, `useMemo`, ou état dérivé en rendu.
3. **[HIGH]** `@arb/server` n'a aucun lint réel. Tout le backend Express/JS est non-vérifié statiquement. Fix : ajouter ESLint flat config + `eslint-plugin-security`.
4. **[MEDIUM]** 3 violations `react-refresh/only-export-components`. Casse Fast Refresh en dev. Fix : déplacer hooks/Providers dans des fichiers séparés.
5. **[MEDIUM]** Dette ESM/CJS : duplication d'enums et helpers arabe. Fix : unifier build (tsup/tsc pour shared → dual CJS+ESM).
6. **[MEDIUM]** Entry bundle `index-*.js` à 328 kB (104 kB gzip). Fix : lazy-load `framer-motion` (chunk 124 kB) hors landing.
7. **[MEDIUM]** Retards majeurs : Express 4→5, Mongoose 8→9, i18next 24→26.
8. **[LOW]** Variable `_vocalized` inutilisée (`ArabicText.tsx:43`). Fix : config `argsIgnorePattern: '^_'`.
9. **[LOW]** 2 `eslint-disable` morts (LandingPage.tsx:16, ErrorBoundary.tsx:32). Fix : `--fix` automatique.
10. **[LOW]** TypeScript `~6.0.2` très en avance — vérifier compat plugins.

## Open Questions

- `proxy-CELFpJLq.js` 124 kB : nom suggère framer-motion mais pas confirmé sans source-map inspection.
- Pas vérifié si `bcrypt@6` casse réellement les hashs existants.

## Positive Observations

- 0 erreurs TypeScript, code client strictement typé.
- Aucune erreur/warning runtime ni dev.
- Code-splitting par route bien fait.
- Aucun secret hardcodé.
- Husky + lint-staged + prettier + gitleaks.toml.
- Build < 400 ms, 2374 modules.
- Healthchecks `/api/health` et `/api/health/ready` actifs.

## Recommendation

**REQUEST CHANGES** — 3 CVE high prod + 5 violations `set-state-in-effect` bloquent un go-live. Backend sans lint = angle mort à corriger.

## Synthèse

Top fix prioritaires Wave 2 :

1. `npm i bcrypt@6` — élimine 3 CVE high.
2. Corriger les 5 `react-hooks/set-state-in-effect`.
3. Vrai ESLint sur `@arb/server`.
4. Séparer hooks/providers des 3 contexts (Fast Refresh).
5. Lazy-load `framer-motion` hors landing.
