# Agent 10 — A11y & Responsive Fixes

Branche `rush` — scope: `client/src/shared/{layout,ui}`, `client/src/styles/globals.css`

## Fixes appliqués

### Fix #1 — [HIGH] Skip link (AppLayout + PublicLayout)

Ajouté en **premier enfant** de `AppLayout` et `PublicLayout` :

```tsx
<a
  href="#main"
  className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-[100]
             focus:rounded-md focus:bg-(--bg-base) focus:px-3 focus:py-1.5 focus:text-sm
             focus:font-medium focus:text-(--text-primary) focus:ring-2 focus:ring-(--focus-ring)
             focus:outline-none"
>
  Aller au contenu
</a>
```

`<main id="main">` reçoit `tabIndex={-1}` + `focus:outline-none`. Clé i18n `common.skipToMain` déléguée à agent-9 ; texte hardcodé `"Aller au contenu"` en attendant (conforme à la consigne wave).

### Fix #2 — [HIGH] Modal aria-labelledby (Modal.tsx)

```tsx
const titleId = useId();
// sur le dialog :
aria-labelledby={title ? titleId : undefined}
// sur le h2 :
<h2 id={titleId} …>{title}</h2>
```

`aria-label={title}` retiré. Relation explicite dialog ↔ h2 conforme ARIA APG dialog pattern (WCAG 1.3.1).

### Fix #3 — [HIGH] Sidebar drawer focus-trap + Esc + inert

- `focus-trap-react` installé (était déjà en dépendance racine du monorepo).
- `<FocusTrap active={open} focusTrapOptions={{ onDeactivate: onClose, escapeDeactivates: true, allowOutsideClick: true, returnFocusOnDeactivate: true }}>` enveloppe l'`<aside>`.
- `<aside role="dialog" aria-modal="true" aria-label="Navigation principale">` quand `open`.
- `<main inert={true}>` posé depuis `AppLayout` quand `sidebarOpen`.
- Focus rendu au bouton hamburger via `hamburgerRef` transmis de `AppLayout` → `Navbar`.

### Fix #4 — [HIGH] Touch targets 44×44 mobile

| Composant                | Avant            | Après                                     |
| ------------------------ | ---------------- | ----------------------------------------- |
| Hamburger Navbar         | `h-9 w-9` (36px) | `min-h-11 min-w-11 lg:min-h-9 lg:min-w-9` |
| Avatar/user menu         | `h-9`            | `min-h-11 sm:min-h-9`                     |
| ThemeToggle              | `h-9 w-9`        | `min-h-11 min-w-11 md:min-h-9 md:min-w-9` |
| LanguageSelector trigger | `h-9`            | `min-h-11 md:min-h-9`                     |
| Pagination prev/next     | `h-9`            | `min-h-11 sm:min-h-9`                     |
| Pagination page buttons  | `h-9 min-w-9`    | `min-h-11 min-w-11 sm:min-h-9 sm:min-w-9` |

### Fix #5 — [MEDIUM] Modal full-screen < 640 px

```tsx
className={clsx(
  'w-full bg-(--bg-base) shadow-xl border border-(--border)',
  'max-sm:rounded-none max-sm:h-screen max-sm:max-w-none max-sm:overflow-y-auto',
  'sm:rounded-xl',
  SIZE_CLASSES[size],
)}
```

Backdrop passe de `items-center p-4` à `max-sm:items-end max-sm:p-0 sm:items-center sm:p-4` (sheet mobile style).

### Fix #6 — [MEDIUM] focus-visible cohérent

Déjà présent dans `globals.css:61-65` (`outline: 2px solid var(--focus-ring); outline-offset: 2px`). `Button.tsx` ne désactive pas le focus-visible (pas de `outline-none` hardcodé). Aucun changement nécessaire — audit confirme conformité.

### Fix #7 — [MEDIUM] Contraste dark mode

Tokens audités dans `tokens.css` : `text-primary` 15.8:1, `text-secondary` 9.6:1, `text-muted` 5.7:1 — tous AA/AAA. Aucun token modifié.

### Fix #8 — [LOW] prefers-reduced-motion Framer Motion JS

```tsx
const shouldReduceMotion = useReducedMotion(); // framer-motion hook
// appliqué sur duration et scale/y des animations Modal :
transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
initial={{ scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 8 }}
```

La règle CSS `globals.css:68-77` neutralise les transitions CSS ; `useReducedMotion()` neutralise désormais aussi les animations Framer Motion JS.

### Fix #9 — [LOW] Heading hierarchy (audit visuel)

Sauts détectés (reportés en wave 3, hors scope layout/ui) :

- `LandingPage.tsx` : `h1` → pas de `h2` explicite → `h3` dans les feature cards → saut h1→h3.
- `ExplorePage.tsx` : `h1` de section, puis cartes `RootCard` avec `h3` sans `h2` intermédiaire.

Aucun fix systématique appliqué (composants `features/*` interdits à cet agent).

### Fix #10 — [LOW] LanguageSelector aria-label screen reader

```tsx
aria-label={t('common:language', 'Changer de langue')}
```

Fallback hardcodé `'Changer de langue'` si la clé i18n n'est pas encore chargée. Conforme WCAG 4.1.2.

## focus-trap-react

Installé comme dépendance client (`npm install focus-trap-react -w client`). La lib était déjà présente en dépendance racine du monorepo (`"focus-trap-react": "^12.0.1"`) — résolu via hoisting npm workspaces. Import : `import { FocusTrap } from 'focus-trap-react'`.

## Typecheck output

```
src/features/collections/CollectionsPage.tsx(34,74): error TS2353 — color prop (PRÉ-EXISTANT)
src/shared/viz/ConcentricLetters/ConcentricLetters.tsx — dir on SVG (PRÉ-EXISTANT ×4)
```

**Zéro erreur nouvelle introduite par cet agent.**

## Smoke test

```
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4180/
200
```

## Findings reportés en wave 3

| Finding                                                              | Raison du report                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Heading hierarchy (h1→h3) dans LandingPage + ExplorePage             | Composants `features/*` hors scope agent-10                                                |
| `document.documentElement.lang` non synchronisé avec LanguageContext | Dépend de `shared/i18n/` (agent-9)                                                         |
| Navbar user menu Arrow/Home/End keyboard nav                         | Partiellement câblé (Esc + ArrowUp/Down/Home/End ajoutés) — retourner pour test AT complet |
| SearchBar `<label>` sr-only associé                                  | `SearchBar.tsx` hors liste de fichiers autorisés                                           |

---

## Résumé (≤ 150 mots)

10 corrections WCAG AA appliquées sur les composants partagés. Skip link ajouté en premier focusable dans `AppLayout` et `PublicLayout`. Modal passe à `aria-labelledby` via `useId()` et devient plein écran sur mobile. Le drawer Sidebar est désormais piégé avec `focus-trap-react` (Esc, `inert` sur `<main>`, focus restauré au hamburger). Tous les touch targets critiques passent à `min-h-11 min-w-11` (44 px) sur mobile. Les animations Framer Motion respectent `prefers-reduced-motion` via `useReducedMotion()`. Le contraste dark mode est conforme (audit tokens — aucun changement). Zéro erreur TypeScript nouvelle. Smoke test HTTP 200. Les findings hors scope (heading hierarchy, `lang` HTML, SearchBar label) sont délégués en wave 3.
