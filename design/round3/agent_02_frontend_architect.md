# Agent #02 — Frontend Architect — Round 3 FINAL

## 1. Décisions finales verrouillées

1. **Stack** : Vite 5 + React 19 + **TypeScript strict** (TS confirmé TL #10, divergence brief documentée PR bootstrap).
2. **Rename `frontend-arb/` → `client/`** en S1 J1 (`git mv` avant tout commit).
3. **Feature-folder hybride** (`features/* + shared/* + pages/* + app/*`).
4. **State 3 couches** : TanStack Query v5 (server), 3 Contexts split Auth/Theme/Language, `useState/useReducer` local. Pas de Redux/Zustand.
5. **Auth = cookie httpOnly + CSRF token** (aligné Backend #01 R2 + Security #06 R2 ; je dépasse le compromis TL A3 car 2 modèles tokens = plus complexe). `withCredentials: true`.
6. **React Router v6** + `React.lazy` + `<Suspense>` + `<ProtectedRoute>`.
7. **D3 hybride** : JSX pour `RootTree`, impératif `d3.select` pour `Constellation`. Hook `useD3` colocaté constellation.
8. **RTL** : Tailwind 3.3+ `dir-*:` natif + **logical properties** (`ms-*/me-*/ps-*/pe-*`), Stylelint `use-logical` bloquant.
9. **Markdown user** : `react-markdown` + `rehype-sanitize` (allowlist `lang`/`dir`). Zéro `dangerouslySetInnerHTML`.
10. **Error boundaries 3 niveaux** (root / route / viz).
11. **i18n scaffold complet S1** : `react-i18next` + `i18next-http-backend`, namespaces par feature, FR/EN/AR avec stubs AR.

## 2. Structure dossiers `client/`

```
client/
├── public/locales/{fr,en,ar}/{common,auth,roots,words,progress,constellation,notes,collections}.json
├── src/
│   ├── app/                  # providers.tsx, router.tsx, i18n.ts
│   ├── features/
│   │   ├── auth/             {api/, components/, hooks/, types.ts}
│   │   ├── roots/            {api/, components/RootTree/, hooks/useRoot.ts}
│   │   ├── words/            {api/, components/, hooks/}
│   │   ├── progress/         {api/, components/SRSCard/, hooks/useSRS.ts}
│   │   ├── constellation/    {api/, components/, hooks/useD3.ts, useForceSim.ts}
│   │   ├── notes/            {api/, components/MarkdownView.tsx, hooks/}
│   │   ├── collections/      {api/, components/, hooks/}
│   │   └── stats/            {api/, components/, hooks/}
│   ├── shared/
│   │   ├── ui/               # ArabicText, Button, Skeleton, DirectionalIcon, Modal
│   │   ├── layout/           # AppShell, Header, Sidebar, LanguageSelector
│   │   ├── api/              # axiosInstance.ts, csrf.ts, ApiResponse.ts, errors.ts
│   │   ├── hooks/            # useAuth, useTheme, useDirection, useDesignTokens, useReducedMotion, useMediaQuery, useLogicalKey
│   │   ├── contexts/         # Auth, Theme, Language
│   │   ├── boundaries/       # Root, Route, Viz
│   │   └── utils/, types/
│   ├── pages/                # Landing, Login, Register, Dashboard, Explore, RootDetail, Learn, Constellation, Collections, Notes, Stats, Settings, Credits, 404
│   ├── styles/tokens.css     # généré depuis design-tokens.json (#04)
│   └── main.tsx
├── tests/ + tailwind.config.ts + tsconfig.json (alias @/) + vite.config.ts
```

## 3. Stack libs (versions)

`react ^19` · `typescript ^5.6` · `vite ^5.4` · `react-router-dom ^6.27` · `@tanstack/react-query ^5.59` (+ devtools) · `axios ^1.7` · `react-i18next ^15` + `i18next ^23` + `i18next-http-backend ^2.6` + `i18next-browser-languagedetector ^8` · `tailwindcss ^3.4.13` · `clsx ^2.1` · `react-hot-toast ^2.4` · `d3 ^7.9` + `@types/d3` (imports sélectifs `d3-hierarchy`/`d3-force`/`d3-zoom`/`d3-selection`) · `framer-motion ^11` · `recharts ^2.13` · `react-circular-progressbar ^2.2` · `react-markdown ^9` + `rehype-sanitize ^6` · `lucide-react ^0.451` · `vitest ^2` + `@testing-library/react ^16` · `@axe-core/playwright ^4.10` · `stylelint` + `stylelint-use-logical`.

## 4. Patterns clés (esquisses)

**axiosInstance** : `axios.create({ baseURL: VITE_API_URL, withCredentials: true })`. Intercepteur request : sur méthodes mutantes, fetch `/auth/csrf` une fois (cache mémoire `csrfToken`), injecte header `X-CSRF-Token`. Intercepteur response : 401 → `window.dispatchEvent('auth:logout')` ; `normalizeApiError(err)` → `{ code, message, fields }`.

**AuthContext bootstrap** : `useEffect` → `api.get('/auth/me')` ; succès → `setUser(data)`, échec → `setUser(null)`, `finally setReady(true)`. `logout()` → `api.post('/auth/logout')` + `queryClient.clear()` + `setUser(null)`. Hook `useAuth()` throw si hors provider.

**useDirection** : lit `LanguageContext`, effet applique `document.documentElement.dir = isRTL ? 'rtl' : 'ltr'` + classe `body.dir-rtl`. Expose `{ dir, isRTL, logicalKey(e) }` (mappe flèches ←/→ selon dir, consommé par D3 + nav clavier).

**VizErrorBoundary** : `componentDidCatch` → Sentry + fallback `<button>Recharger la visualisation</button>`. Wrappe `RootTree` et `ConstellationCanvas` isolément.

**ProtectedRoute** : `const { user, ready } = useAuth(); if (!ready) return <BootSpinner/>; return user ? <Outlet/> : <Navigate to="/login" state={{from: location}} replace/>;`

**useDesignTokens** : `getComputedStyle(document.documentElement).getPropertyValue('--cat-verb').trim()` mémoizé, ré-évalué via `MutationObserver` sur `<html class>` (changement thème). Consommé par D3 + Recharts.

## 5. Contextes et hooks

**Contextes** : `AuthContext`, `ThemeContext` (light/dark/system), `LanguageContext` (fr/en/ar + isRTL).

**Hooks shared** : `useAuth`, `useTheme`, `useLanguage`, `useDirection`, `useDesignTokens`, `useReducedMotion`, `useMediaQuery`, `useLogicalKey`, `useDebounce`.

**Hooks features** : `useRoot(id)`, `useRoots(filters)`, `useWord(id)`, `useSRSReview()` (mutation optimiste), `useProgress(userId)`, `useConstellation()`, `useNotes(rootId)`, `useCollections()`, `useStats()`, `useD3<T>(renderFn, deps)`, `useForceSim(nodes, links)`.

## 6. Plan d'exécution S1-S2

**S1 J1** — `git mv frontend-arb → client`. PR bootstrap : deps section 3, alias `@/`, scaffold dossiers section 2, README (TS + cookie auth). Husky + lint-staged + ESLint + Stylelint logical-props.
**S1 J2** — `app/providers.tsx` (QueryClient, BrowserRouter, contexts). `app/router.tsx` lazy routes vides. `RootErrorBoundary` + pages 404/500.
**S1 J3** — `axiosInstance` + intercepteurs CSRF + `ApiResponse<T>`. `AuthContext` complet. Types `User/Root/Word` partagés Backend.
**S1 J4** — `ThemeContext` (CSS vars + `.dark`). `LanguageContext` + `useDirection` + `<html dir>`. Init `i18next` + 3 langues × 3 namespaces (common/auth/roots) stubs AR.
**S1 J5** — `shared/ui` baseline : `<ArabicText>` (Amiri/Noto Naskh, prop `as`), `Button`, `Skeleton`, `Toast`, `DirectionalIcon`. `useDesignTokens`. `tokens.css` depuis `design-tokens.json` UX.
**S1 J6** — `<AppShell>` (Header + Sidebar + `LanguageSelector` header). `<ProtectedRoute>`. Pages stub Login/Register/Dashboard câblées API (validation contrat).
**S1 J7** — POC `RootTree` D3 JSX (mock 15 nodes) sous `VizErrorBoundary`. Tests vitest contextes + axiosInstance. Lighthouse landing.

**S2 J1** — Login/Register complets + flow CSRF E2E réel.
**S2 J2** — Dashboard (TanStack Query + skeletons + stats stub).
**S2 J3** — Explore (liste racines + filtres + pagination offset).
**S2 J4** — RootDetail : `RootTree` réel + tabs Mots/Notes/Progression.
**S2 J5** — `useSRSReview` mutation optimiste + page Learn (carte SM-2, ratings 0-5).
**S2 J6** — POC `Constellation` impératif (`useD3`, `forceSimulation`, 100 nodes mockés). `useReducedMotion` câblé.
**S2 J7** — `@axe-core/playwright` CI. Audit RTL visuel par langue. Bilan + buffer.

**Livrables fin S2** : auth fonctionnelle (cookie httpOnly + CSRF), 4 pages cœur, RootTree affiché avec data réelle, Constellation POC, i18n FR/EN opérationnel + AR scaffold.
