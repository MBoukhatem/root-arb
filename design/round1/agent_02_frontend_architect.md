# Agent #02 — Frontend Architect — Fiche Round 1

## 0. Note préalable : TS vs JS

Le brief (`Project_Resume.md`) liste **React 18 + JS** (`.jsx`), mais le scaffold présent (`frontend-arb/`) est en **Vite + React 19 + TypeScript** strict (`tsconfig.app.json` avec `verbatimModuleSyntax`, `noUnusedLocals`, `erasableSyntaxOnly`). **Divergence assumée à trancher.**

**Décision : on garde TypeScript.** Justifications : (1) le scaffold est déjà initialisé en TS, repartir en JS = perte de temps ; (2) les structures du domaine (Root, Word, Progress, schémas wazn) sont riches et fortement typées côté Mongoose — TS sécurise le contrat avec l'API ; (3) D3 expose des types officiels (`@types/d3`) précieux pour les `Selection`, `HierarchyNode`, etc. ; (4) le cahier des charges n'interdit pas TS, il l'autorise implicitement (React 18+ déclaré, sans imposer JS). Communiquer la divergence dans la PR de bootstrap.

---

## 1. Décisions clés

1. **Structure feature-folder hybride.** `src/features/{auth,roots,words,progress,constellation,notes,collections,stats}/` chacun contenant `components/`, `hooks/`, `api/`, `types.ts`. Plus `src/shared/` (UI commune, layout, utils) et `src/pages/` (orchestrateurs route uniquement). Le brief propose type-folder pur — trop plat à l'échelle de 14 pages et 8 domaines.
2. **State management à 3 couches.** (a) **TanStack Query v5** pour tout server state (racines, mots, progress, stats) → cache, dedup, revalidation, optimistic updates sur le rating SM-2. (b) **Context API** uniquement pour Auth/Theme/Language (état global mais peu volatil). (c) **`useState`/`useReducer`** locaux pour UI éphémère. **Pas de Redux ni Zustand** : superflu vu le périmètre.
3. **Data fetching = Axios + TanStack Query.** Axios pour l'instance + intercepteurs (JWT, refresh, 401 → logout). TanStack Query par-dessus pour cache + loading/error normalisés. Bannir les `useEffect(fetch)` manuels.
4. **Contextes split, pas merged.** `AuthContext`, `ThemeContext`, `LanguageContext` séparés → re-renders isolés (un changement de langue ne re-render pas les enfants d'Auth). `LanguageContext` expose `isRTL` qui pilote `<html dir>` via effet.
5. **Routing : React Router v6 + lazy loading.** Routes publiques vs `<ProtectedRoute>`. `React.lazy` + `Suspense` sur toutes les pages lourdes (Constellation, Learn, Dashboard) → premier chargement landing rapide. Pas de file-based routing (overkill).
6. **D3 dans React = pattern "React owns DOM, D3 owns math".** D3 calcule les layouts (`d3.tree`, `d3.forceSimulation`) ; React rend les `<g><circle><path>` via JSX, avec `useMemo` sur la hiérarchie. On garde la voie impérative (`d3.select(ref)`) **uniquement** pour les transitions/zoom/drag où React est inadapté. Composant `<RootTree>` isolé derrière une `<ErrorBoundary>` dédiée.
7. **Error boundaries en cascade.** Une racine globale (page d'erreur), une par route (fallback layout préservé), une autour de chaque visualisation D3 (la dataviz peut crasher sans tuer la page).
8. **Loading global vs local.** Spinner global uniquement pendant bootstrap Auth (vérif token). Sinon : skeletons locaux par composant + `react-hot-toast` pour les erreurs réseau. Pas de loader plein-écran intrusif.
9. **i18n.** `react-i18next` avec namespaces par feature (`auth.json`, `roots.json`, `common.json`) plutôt qu'un gros fichier par langue. Lazy-load des namespaces. Détection langue : localStorage → navigator → fallback FR. `dir="rtl"` injecté dynamiquement, classes Tailwind `rtl:` activées via plugin.
10. **Conventions.** PascalCase composants, camelCase hooks (`useXxx`), kebab-case fichiers non-composants, alias `@/` via `vite.config.ts` + `tsconfig.paths`.

## 2. Risques

1. **D3 v7 + React 19 + StrictMode** : double-mount en dev provoque des SVG dupliqués si nettoyage `useEffect` mal fait. Mitigation : pattern strict cleanup + tests visuels précoces.
2. **Bundle Constellation lourde** (D3 + Framer Motion + force-simulation). Risque sur Lighthouse. Mitigation : lazy-loading agressif, import sélectif `d3-force` plutôt que `d3` entier.
3. **RTL casse silencieusement** les layouts Tailwind (marges directionnelles). Mitigation : audit visuel langue par langue dès semaine 1, utiliser `ms-*`/`me-*` (logical properties) plutôt que `ml-*`/`mr-*`.
4. **Désynchronisation cache TanStack Query ↔ Auth** au logout (données privées persistent). Mitigation : `queryClient.clear()` dans le `logout()` de l'AuthContext.
5. **React 19 vs libs** : certaines libs du brief (recharts, react-circular-progressbar) peuvent ne pas être totalement compatibles. Vérification semaine 1.

## 3. Questions aux autres agents

- **Backend (#03)** : format de réponse standardisé ? (`{ data, error, meta }` cohérent → typing `ApiResponse<T>` générique). Pagination cursor ou offset ? Endpoint `/roots/:id/tree` renvoie-t-il déjà la hiérarchie prête pour D3, ou faut-il transformer côté client ?
- **D3 Specialist (#05)** : tu veux quel pattern d'intégration React/D3 (full-JSX, full-imperatif, hybride) ? Besoin d'un format de données précis pour `RootTree` et `Constellation` (à aligner avec le contrat API) ?
- **i18n/UX (#07-08)** : la translittération (`kataba`) est-elle stockée côté serveur ou générée côté client ? Les clés i18n incluent-elles le contenu pédagogique ou uniquement la chrome de l'UI ?
- **DevOps (#10)** : variables `VITE_*` requises (API_URL, SENTRY_DSN ?). Stratégie de preview deploy par PR ?

## 4. Recommandations actionnables — Semaine 1

- [ ] PR "bootstrap" : ajouter `react-router-dom`, `axios`, `@tanstack/react-query`, `react-i18next`, `i18next`, `tailwindcss`, `@types/d3` (avec `d3` lui-même), `clsx`, `react-hot-toast`. Vérifier compat React 19.
- [ ] Configurer alias `@/` et `vitest` (tests dès le départ).
- [ ] Scaffolder l'arborescence `src/features/*`, `src/shared/*`, `src/pages/*`, `src/app/{providers,router}.tsx`.
- [ ] Écrire `axiosInstance.ts` + intercepteur JWT + `QueryClientProvider` dans `app/providers.tsx`.
- [ ] Implémenter les 3 contextes (Auth, Theme, Language) avec types `Context<T | null>` et hook guard `useAuth()` qui throw si hors provider.
- [ ] Configurer `react-i18next` avec 3 namespaces minimum + détecteur de langue + bascule `dir`.
- [ ] Mettre en place un `<RootErrorBoundary>` + page 404/500.
- [ ] Documenter dans `frontend-arb/README.md` la décision **TS** et la structure feature-folder.
