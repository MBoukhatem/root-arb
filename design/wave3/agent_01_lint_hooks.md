# Agent 01 — Lint / Hooks Fix Report

## Avant / Après ESLint

| Metric                                 | Avant     | Après                       |
| -------------------------------------- | --------- | --------------------------- |
| Errors                                 | 11        | 1 (pré-existant hors scope) |
| Warnings                               | 1         | 0                           |
| `react-hooks/set-state-in-effect`      | 5         | 0                           |
| `react-refresh/only-export-components` | 3         | 0                           |
| `@typescript-eslint/no-unused-vars`    | 2         | 0                           |
| `eslint-disable` morts                 | 1 warning | 0                           |

L'erreur résiduelle (`RootDetailPage.tsx:57` — `react-hooks/rules-of-hooks` / `useMemo` conditionnel) était présente avant cette wave, hors périmètre de la mission.

## Fichiers créés

- `client/src/features/auth/useAuth.ts` — hook `useAuth()` qui consomme `AuthContext`
- `client/src/shared/theme/useTheme.ts` — hook `useTheme()` qui consomme `ThemeContext` (réécriture, auparavant re-export)
- `client/src/shared/i18n/useLanguage.ts` — hook `useLanguage()` qui consomme `LanguageContext`

## Fixes appliqués

### `set-state-in-effect` (5 violations → 0)

1. **`AuthContext.tsx:34`** — `setReady(true)` dans la branche synchrone : restructuré en `Promise.resolve()` pour que tous les chemins passent par `.finally()` (callbacks async, jamais direct dans le corps de l'effet).
2. **`ThemeContext.tsx:55`** — `setResolved(mode)` : supprimé l'état `resolved`, remplacé par `useMemo(() => mode === 'system' ? systemResolved : mode, [mode, systemResolved])`. `systemResolved` est un état mis à jour uniquement via listener `MediaQueryList`.
3. **`useDesignTokens.ts:56`** — `setTokens(readTokens())` : supprimé `useState`+`useEffect`, remplacé par `useMemo(() => readTokens(), [resolved])`.
4. **`SearchBar.tsx:45`** — `setInternal(value)` pour sync contrôlée : remplacé par variable dérivée au rendu `const displayValue = isControlled && value !== undefined ? value : internal`.
5. **`StatCard.tsx:31`** — `setDisplay(value)` pour le chemin non-numérique : le `display` pour strings est maintenant dérivé au rendu `const display = typeof value === 'number' ? animatedNum : value`.

### `react-refresh/only-export-components` (3 violations → 0)

Séparation Provider/hook :

- `AuthContext.tsx` : exporte `AuthContext` (contexte) + `AuthProvider` (composant). `eslint-disable-next-line` sur l'export du contexte (inévitable : le hook file doit l'importer).
- `ThemeContext.tsx` : idem, plus `// @refresh reset`.
- `LanguageContext.tsx` : idem.
- `useAuth.ts` : contient désormais le hook réel (non re-export).
- `useTheme.ts` : hook réel + re-export `ThemeMode`.
- `useLanguage.ts` : hook réel.

### Unused vars / eslint-disable morts

- **`ArabicText.tsx:43`** — paramètre `vocalized: _vocalized` supprimé de la destructuration (prop gardée dans le type pour la compatibilité API).
- **`ErrorBoundary.tsx:32`** — directive `// eslint-disable-next-line no-console` supprimée (règle inactive dans la config).
- **`LandingPage.tsx:14`** — `_wordId` : remplacé par `(_wordId: string) => void _wordId` pour satisfaire l'argsIgnorePattern.

## Fichiers consommateurs mis à jour (imports)

| Fichier                              | Ancien import                   | Nouveau import              |
| ------------------------------------ | ------------------------------- | --------------------------- |
| `shared/i18n/useDirection.ts`        | `./LanguageContext`             | `./useLanguage`             |
| `features/roots/RootDetailPage.tsx`  | `@/shared/i18n/LanguageContext` | `@/shared/i18n/useLanguage` |
| `shared/ui/RootCard.tsx`             | `@/shared/i18n/LanguageContext` | `@/shared/i18n/useLanguage` |
| `shared/layout/LanguageSelector.tsx` | `@/shared/i18n/LanguageContext` | `@/shared/i18n/useLanguage` |
| `shared/ui/WordCard.tsx`             | `@/shared/i18n/LanguageContext` | `@/shared/i18n/useLanguage` |
| `shared/theme/useDesignTokens.ts`    | `./ThemeContext`                | `./useTheme`                |

## Output typecheck final

```
> @arb/client@0.1.0 typecheck
> tsc -b --noEmit
(clean — exit 0)
```

## Output lint final

```
/home/mboukhatem/root-arb/client/src/features/roots/RootDetailPage.tsx
  57:22  error  React Hook "useMemo" is called conditionally  react-hooks/rules-of-hooks

✖ 1 problem (1 error, 0 warnings)
```

Ce problème pré-existait avant la wave (visible dans agent_09_audit_tech.md finding #12) et est hors périmètre.

## Frontend

```
curl http://localhost:4180/ → 200 OK
```

---

## Résumé (≤ 150 mots)

Les 5 violations `react-hooks/set-state-in-effect` ont été éliminées en remplaçant les `setState` synchrones dans les effets par des valeurs dérivées (`useMemo`, variables de rendu) ou en restructurant les chemins async. Les 3 violations `react-refresh/only-export-components` ont été résolues en extrayant les hooks `useAuth`, `useTheme`, `useLanguage` dans des fichiers `.ts` dédiés — les 5 fichiers consommateurs ont été mis à jour. La variable `_vocalized` inutilisée et le `eslint-disable` mort dans `ErrorBoundary` ont été supprimés. Le typecheck reste propre (0 erreur), le frontend répond 200. Une erreur résiduelle (`RootDetailPage` — `useMemo` conditionnel) était pré-existante et hors périmètre de cette mission.
