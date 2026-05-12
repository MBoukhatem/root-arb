# Agent 07 — Visual Polish Wave 3

## Résumé (≤ 150 mots)

Wave 3 de polish visuel : cohérence dark mode, animations sobres, micro-interactions et tokens partagés. Les fills catégoriels ont été déclinés en versions dark dans `.dark {}` (luminosité +1 cran pour rester distinguables sur fond `#0a0a0f`). Les skeletons abandonnent `animate-pulse` au profit d'un shimmer directionnel avec tokens `--skeleton-base/shine` thémés. L'EmptyState est recentré avec `py-12` et un conteneur icône normalisé. Les palettes Constellation et RootTree convergent via des tokens `--sf-*` partagés — `colorForSemanticField()` résout désormais des CSS vars au lieu de hex hardcodés. Les durées d'animation sont toutes ramenées sous 300ms (RootTree 500→300ms liens, 400→250ms nœuds ; ConcentricLetters 450→300ms). Les rings ConcentricLetters dark ont leur plancher lumineux relevé (`ring2 0.22→0.32`, `ring3 0.16→0.24`) pour la lisibilité sur écran sombre.

---

## 1. Tokens ajoutés/ajustés

### Nouveaux tokens `:root`

| Token                 | Valeur                          | Rôle                      |
| --------------------- | ------------------------------- | ------------------------- |
| `--skeleton-base`     | `#e2e8f0`                       | Shimmer fond clair        |
| `--skeleton-shine`    | `#f1f5f9`                       | Shimmer reflet clair      |
| `--skeleton-duration` | `1.6s`                          | Vitesse shimmer           |
| `--sf-writing`        | `var(--cat-verb-fill)`          | Champ sémantique écriture |
| `--sf-reading`        | `var(--cat-noun-fill)`          | Lecture                   |
| `--sf-speech`         | `var(--cat-adjective-fill)`     | Parole                    |
| `--sf-motion`         | `var(--cat-participle-fill)`    | Mouvement                 |
| `--sf-thought`        | `var(--cat-masdar-fill)`        | Pensée                    |
| `--sf-emotion`        | `var(--cat-pluriel-brise-fill)` | Émotion                   |
| `--sf-action`         | `var(--cat-adverb-fill)`        | Action                    |
| `--sf-derive`         | `var(--cat-derive-fill)`        | Dérivé                    |

### Tokens dark `.dark {}` modifiés

| Token                      | Avant                  | Après                  | Raison                         |
| -------------------------- | ---------------------- | ---------------------- | ------------------------------ |
| `--cat-verb-fill`          | _(absent)_             | `#60a5fa`              | Fill dark distinguable WCAG AA |
| `--cat-noun-fill`          | _(absent)_             | `#34d399`              | idem                           |
| `--cat-adjective-fill`     | _(absent)_             | `#fbbf24`              | idem                           |
| `--cat-adverb-fill`        | _(absent)_             | `#fb923c`              | idem                           |
| `--cat-participle-fill`    | _(absent)_             | `#a78bfa`              | idem                           |
| `--cat-masdar-fill`        | _(absent)_             | `#f472b6`              | idem                           |
| `--cat-pluriel-brise-fill` | _(absent)_             | `#22d3ee`              | idem                           |
| `--cat-derive-fill`        | _(absent)_             | `#818cf8`              | idem                           |
| `--skeleton-base`          | _(absent)_             | `#1e293b`              | Shimmer fond dark              |
| `--skeleton-shine`         | _(absent)_             | `#2d3f55`              | Shimmer reflet dark            |
| `--letter-ring1-fill`      | `oklch(0.30 0.10 250)` | `oklch(0.42 0.10 250)` | Lisibilité ring 1 dark         |
| `--letter-ring2-fill`      | `oklch(0.22 0.06 250)` | `oklch(0.32 0.07 250)` | Lisibilité ring 2 dark         |
| `--letter-ring3-fill`      | `oklch(0.16 0.04 250)` | `oklch(0.24 0.04 250)` | Lisibilité ring 3 dark         |
| `--letter-ink`             | `oklch(0.85 0.06 250)` | `oklch(0.88 0.06 250)` | Contraste texte ring dark      |

---

## 2. Palettes harmonisées

**Principe :** une seule source de vérité catégorielle (`--cat-*-fill`) sert les trois visualisations.

```
tokens.css --cat-*-fill
    ├── RootTree/colors.ts          → categoryFill() via var(--cat-*-fill)   [inchangé]
    ├── tokens.css --sf-*           → alias sémantiques → Constellation
    │       └── semanticFieldColors.ts  → resolveCSSVar(--sf-*)              [refactoré]
    └── ConcentricLetters/colors.ts → interpolateFill() + ringFillVar()      [floor relevé]
```

`invalidateSemanticFieldCache()` est exposée pour invalider le cache de résolution CSS vars lors d'un toggle de thème.

---

## 3. Animations réduites

| Fichier                 | Élément               | Avant              | Après               |
| ----------------------- | --------------------- | ------------------ | ------------------- |
| `RootTree.tsx`          | Links `pathLength`    | `0.5s`             | `0.3s`              |
| `RootTree.tsx`          | Links delay per depth | `0.1 + depth*0.05` | `0.08 + depth*0.04` |
| `RootTree.tsx`          | Nodes `opacity/scale` | `0.4s`             | `0.25s`             |
| `RootTree.tsx`          | Nodes stagger         | `0.15 + i*0.05`    | `0.1 + i*0.03`      |
| `ConcentricLetters.tsx` | `dur` (tous éléments) | `0.45s`            | `0.3s`              |

Toutes les durées restent sous le seuil de 300ms recommandé pour le chrome UI. La protection `prefers-reduced-motion` existante dans `globals.css` s'applique globalement (`transition-duration: 0.01ms !important`).

---

## 4. Skeleton shimmer

**Avant :** `animate-pulse rounded-md bg-(--bg-card)` — simple fade-out monochrome.

**Après :** classe CSS `.skeleton-shimmer` dans `globals.css` avec keyframe `skeleton-shimmer` (gradient linéaire 90°, `background-size: 200%`, vitesse `1.6s`). Tokens `--skeleton-base/shine` thémés light + dark. `aria-hidden="true"` déjà présent.

---

## 5. EmptyState

Centrage renforcé : `p-10` → `py-12 px-8`. Icône enveloppée dans un conteneur circulaire normalisé `h-12 w-12 rounded-full bg-(--bg-base)` pour un espacement cohérent quel que soit la taille de l'icône Lucide passée.

---

## Philosophie (≤ 5 lignes)

Le polish visuel n'ajoute pas de couches — il révèle la cohérence déjà présente dans les tokens. Dark mode et animations ne sont pas des afterthoughts : ils partagent la même source de vérité que le light mode. Les durées courtes (≤300ms) respectent la hiérarchie perceptuelle : les données ont droit à plus de temps que le chrome. Les palettes viz convergent vers les tokens catégoriels pour que changer une couleur de catégorie grammaticale se répercute partout sans chasse au `grep`.
