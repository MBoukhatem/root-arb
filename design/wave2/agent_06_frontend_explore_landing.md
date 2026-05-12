# agent_06 — Frontend Explore + Landing fixes

**Branche** : `rush` | **Date** : 2026-05-12

---

## Fixes appliqués

| #   | Finding                                                                                    | Fichier:ligne                      | +/- lignes                  |
| --- | ------------------------------------------------------------------------------------------ | ---------------------------------- | --------------------------- |
| 1   | `<main id="main">` dupliqué — remplacé par `<div>`                                         | `LandingPage.tsx:21`               | +0 / -0 (tag renommé)       |
| 2   | `console.info` démo supprimé + callback nettoyé                                            | `LandingPage.tsx:14-18`            | -2 / +1                     |
| 3   | Sous-titre dupliqué (`demoSubtitle` ×2) — `<p>` retiré section demo tree                   | `LandingPage.tsx:91`               | -1                          |
| 4   | Eyebrow héro : `demoSubtitle` → `heroEyebrow` pour différencier                            | `LandingPage.tsx:54`               | +0 / -0 (clé changée)       |
| 5   | `unvocalized` corrigé : `"ك ت ب"` → `"كتب"` (consonnes sans espaces)                       | `LandingPage.tsx:51`               | +0 / -0                     |
| 6   | `font-display: optional` → `swap` pour Amiri + Noto Naskh                                  | `globals.css:12-13`                | +0 / -0 (valeur changée ×2) |
| 7   | Tooltip RootTree : positionnement `%` viewBox → coords pixel via `getScreenCTM()`          | `RootTree.tsx:125-138 + 300-303`   | +12 / -4                    |
| 8   | Translitération `fontSize={12}` → `fontSize={14}`                                          | `RootTree.tsx:283`                 | +0 / -0                     |
| 9   | `resetFilters()` ajoute `setSearch('')`                                                    | `ExplorePage.tsx:37`               | +1                          |
| 10  | Bouton reset `<button>` → `<Button variant="ghost" size="sm">` + condition inclut `search` | `ExplorePage.tsx:116-124`          | +3 / -3                     |
| 11  | Pagination scroll-top : `onPageChange={(p) => { setPage(p); window.scrollTo(…) }}`         | `ExplorePage.tsx:158`              | +1 / -1                     |
| 12  | SearchBar skip 1er run via `useRef(true)` (isMounted)                                      | `SearchBar.tsx:30-42`              | +6 / -2                     |
| 13  | SearchBar `enterKeyHint="search"` + `inputMode="search"`                                   | `SearchBar.tsx:67-68`              | +2                          |
| 14  | RootCard Star : `aria-label` → `aria-hidden` + `<span class="sr-only">`                    | `RootCard.tsx:44-47`               | +3 / -1                     |
| 15  | Skeleton `variant="tree"` : `h-96` → `aspect-square`                                       | `Skeleton.tsx:16`                  | +0 / -0                     |
| 16  | RootDetailPage `useRoot(id)` undefined guard (après hooks) + 404 contextuel                | `RootDetailPage.tsx:46-48 + 74-94` | +12 / -4                    |

**Total approx** : +40 lignes ajoutées, -16 lignes retirées.

---

## Output typecheck

```
npm run typecheck -w client 2>&1 | grep -E "(LandingPage|ExplorePage|RootDetailPage|useRoots|SearchBar|RootCard|Skeleton|RootTree)"
(no output — zéro erreur dans les fichiers modifiés)
```

Les 4 erreurs résiduelles (`DashboardPage`, `AppLayout`, `Modal`, `ConcentricLetters`) sont **hors scope** (agents 7, 10, 8).

---

## Vérifications

- `curl http://localhost:4180/` → **200**
- Vite HMR : mises à jour propres, aucune erreur console dans `/tmp/client.log`
- Typecheck : 0 erreur sur les 9 fichiers modifiés

---

## Findings non-traités

| Finding                                                          | Raison                                                                                   |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| agent_03 #3 — `<html lang>` figé, non synchronisé avec i18n      | Hors scope : nécessite modification globale du provider i18n (agent-9 owns)              |
| agent_03 #6/#7 — Couleurs catégorielles `--cat-*-fill` dark mode | Hors scope : tokens.css / colors.ts — risque de casser d'autres composants viz (agent-8) |
| agent_03 #8 — Stagger animation plafonné                         | Non inclus dans les 14 fixes prioritaires                                                |
| agent_03 #9 — `aria-label` RootTree mélange FR/vars              | Non inclus dans les 14 fixes prioritaires                                                |
| agent_03 #10 — Replay button focus ring                          | Non inclus dans les 14 fixes prioritaires                                                |
| agent_03 #12 — Lien GitHub placeholder                           | Non inclus dans les 14 fixes prioritaires                                                |
| agent_03 #14 — viewBox.height figée mobile                       | Non inclus dans les 14 fixes prioritaires                                                |
| agent_04 #3 — Recherche translitération non normalisée           | Nécessite modification `rootsApi.ts` + serveur — non inclus dans fixes prioritaires      |
| agent_04 #5 — i18n queryKey sans `lang`                          | Hors scope agent-9                                                                       |
| agent_04 #7 — RootTree lazy-load skeleton                        | Non inclus dans les 14 fixes prioritaires                                                |
| agent_04 #8 — VIZ_CATEGORY_MAP catégories fusionnées             | Dépend de l'extension du type `VizCategory` dans shared/viz — risque cassure             |
| agent_04 #9 — Filtre boolean tri-state                           | Non inclus dans les 14 fixes prioritaires                                                |

---

## Résumé (≤ 150 mots)

Les 14 fixes prioritaires des audits agent_03 et agent_04 sont appliqués : suppression du `<main>` dupliqué, `font-display: swap` pour les polices arabes, tooltip RootTree repositionné en pixels via `getScreenCTM()` (fin du drift RTL), translitération passée à 14px, `resetFilters()` nettoie désormais le champ search, pagination scrolle en haut, SearchBar évite le déclenchement parasite au premier rendu, bouton reset stylé en `Button ghost`, `aria-hidden` + SR-only sur l'icône Star, Skeleton tree en `aspect-square`, et RootDetailPage différencie 404 (lien /explore) des autres erreurs (Retry). Typecheck : zéro erreur dans les fichiers modifiés. Serveur : 200. HMR : propre.
