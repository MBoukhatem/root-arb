# Agent #01 — Viz Architect (Wave 1) — `<ConcentricLetters />`

> Design figé, code interdit. Complète (n'écrase pas) `<RootTree>` et `<Constellation>`. Pattern hybride JSX-pur (cf. agent_05 §1).

## 1. Algo de co-occurrence

Source : `Root.lettersArray` multikey (`server/src/models/Root.js:48`). Endpoint `GET /api/letters/cooccurrence?letter=ك` (LRU 10 min, TanStack 1 h).

```js
async function computeCooccurrence(letter) {
  const L = normalizeArabic(letter); // NFC + strip tashkîl + loosenHamza
  if (!ARABIC_LETTERS.includes(L)) throw new ApiError(400);
  const roots = await Root.find({ lettersArray: L })
    .select('letters lettersArray transliteration coreMeaning semanticField')
    .lean();
  const tally = new Map();
  for (const r of roots) {
    for (const o of new Set(r.lettersArray.filter((x) => x !== L))) {
      const e = tally.get(o) ?? { count: 0, rootIds: new Set() };
      e.count++;
      e.rootIds.add(r._id.toString());
      tally.set(o, e);
    }
  }
  return {
    center: L,
    totalRoots: roots.length,
    neighbors: [...tally]
      .map(([letter, { count, rootIds }]) => ({ letter, count, rootIds: [...rootIds] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 28),
    rootsById: indexBy(roots, '_id'),
  };
}
```

Complexité O(R·3), R≤200. Fallback client-only (`useMemo` sur `/api/roots?limit=1000`), flag `VITE_LETTERS_CLIENT_ONLY`.

## 2. API React

```ts
type Neighbor = { letter: string; count: number; rootIds: string[] };
type ConcentricLettersProps = {
  data: {
    center: string;
    totalRoots: number;
    neighbors: Neighbor[];
    rootsById: Record<string, RootLite>;
  };
  selectedLetter: string; // controlled — parent owns
  onLetterSelect: (l: string) => void;
  onRootOpen?: (rootId: string) => void;
  rings?: 2 | 3; // default 3
  scale?: 'linear' | 'log'; // default 'log' (Zipf)
  theme?: 'auto'; // via useDesignTokens
  className?: string;
};
```

État : `hoveredLetter`, `focusedIdx`, `tooltipPin`. Data externalisée (pas de fetch interne, comme `RootTree`). Hooks : `useDirection`, `useReducedMotion`, `useResizeObserver`, `useDesignTokens`, `useTranslation`.

## 3. Layout D3 (radial)

Pas de `forceSimulation` ni `hierarchy` (positions déterministes), calcul main JSX-pur.

```ts
function buildLayout(neighbors, size, rings = 3, scale = 'log') {
  const cx = size.w / 2,
    cy = size.h / 2;
  const rMax = Math.min(cx, cy) - 64,
    rMin = 110; // padding labels + central footprint
  const counts = neighbors.map((n) => n.count);
  const q = d3.scaleQuantile().domain(counts).range([0, 1, 2]); // ring index
  const spacing = (rMax - rMin) / (rings - 1);
  const groups = d3.group(neighbors, (n) => q(n.count));
  const sizeScale = (scale === 'log' ? d3.scaleLog() : d3.scaleLinear())
    .domain([Math.max(1, d3.min(counts)), d3.max(counts)])
    .range([22, 36])
    .clamp(true);
  return [...groups].flatMap(([ring, ns]) => {
    const r = rMin + ring * spacing; // ring 0 = nearest centre
    const step = (2 * Math.PI) / ns.length;
    return ns.map((n, i) => {
      const angle = -Math.PI / 2 + i * step * (isRTL ? -1 : 1); // start 12h, RTL inversion
      return {
        ...n,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        ring,
        radius: sizeScale(n.count),
      };
    });
  });
}
```

3 anneaux défaut (fréquent/médian/rare), 2 si `neighbors<8`. Échelle log (Zipf). Centre 88 px (≥60 px plancher AR §5.4), Amiri 56 px.

## 4. Animations

Changement centre : Framer `layoutId` keyé par lettre, ex-centre rejoint anneau, cliquée glisse au centre. `duration 0.45s` out-expo, stagger 0.02 s. `prefers-reduced-motion` → 0.

Hover : scale 1.12 + stroke `var(--gold)` + ligne centre→lettre (`pathLength 0→1`, 300 ms). Tooltip Radix.

## 5. Couleurs

**Intensité par fréquence** (mono-hue) + accent or central. Tokens `styles/tokens.css` :

| Token                    | Light                  | Dark                   |
| ------------------------ | ---------------------- | ---------------------- |
| `--letter-ring1-fill`    | `oklch(0.92 0.08 250)` | `oklch(0.30 0.10 250)` |
| `--letter-ring2-fill`    | `oklch(0.95 0.04 250)` | `oklch(0.22 0.06 250)` |
| `--letter-ring3-fill`    | `oklch(0.97 0.02 250)` | `oklch(0.16 0.04 250)` |
| `--letter-ink`           | `oklch(0.30 0.08 250)` | `oklch(0.85 0.06 250)` |
| `--letter-center-stroke` | `var(--gold)`          | `var(--gold)`          |

Contraste ≥4.5:1. NICE P2 : teinte par `semanticField` dominant (réuse `Constellation/semanticFieldColors.ts:42`), off défaut.

## 6. Interactions

| Geste                     | Effet                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| Clic lettre périphérique  | `onLetterSelect` → re-layout animé                                                                      |
| Clic centre               | Reset                                                                                                   |
| Hover desktop             | Highlight + ligne + tooltip                                                                             |
| Long-press 400 ms tactile | Pin tooltip                                                                                             |
| Tooltip                   | Top-5 racines (letters/translit/meaning), clic → `onRootOpen(rootId)` → `/roots/:id`                    |
| Clavier                   | Tab dans l'ordre angulaire, Enter/Space = sélectionner, flèches via `logicalKey()` §7 PLAN, Esc = clear |

Mobile `<sm` : CTA sticky → `<SidePanel>`.

## 7. Edge cases

| Cas                           | Réponse                                                                    |
| ----------------------------- | -------------------------------------------------------------------------- |
| Aucune racine                 | `<EmptyState>` + message `letters.empty`, pas de D3                        |
| 1 co-occurrence               | 1 anneau, lettre à 12h, ligne dessinée                                     |
| >28 voisins                   | Cap dur 28 (serveur) + badge "+ N rares masquées"                          |
| Lettre non arabe              | API 400, ErrorBoundary niveau 3 §5.1                                       |
| Hamza variantes (ء أ إ ؤ ئ)   | `loosenHamza` (`shared/normalize-arabic.js`) avant tally — sinon 5 buckets |
| Dataset minuscule (8 racines) | Tester `ك`, `ع`, `ب` (omniprésents)                                        |

## 8. File structure

```
client/src/shared/viz/ConcentricLetters/
├── ConcentricLetters.tsx        # JSX pur, memo + comparateur (selectedLetter, data.center)
├── ConcentricLetters.types.ts
├── useConcentricLayout.ts       # pure fn
├── colors.ts                    # ring → token map
├── LetterTooltip.tsx            # Radix
├── EmptyState.tsx
└── index.ts

client/src/features/letters/
├── api/lettersApi.ts            # GET /letters/cooccurrence
├── hooks/useCooccurrence.ts     # TanStack useQuery, staleTime 1h
└── types.ts

server/src/services/letterGraphService.js
server/src/controllers/letterController.js
server/src/routes/letterRoutes.js   # mount in routes/index.js: /api/letters
```

Co-location identique aux dossiers viz existants.

## 9. Effort

| Tâche                                                        | h                   |
| ------------------------------------------------------------ | ------------------- |
| Endpoint + LRU + Joi                                         | 3                   |
| `useConcentricLayout` + tests (positions stables, quantiles) | 3                   |
| `ConcentricLetters.tsx` + Framer                             | 5                   |
| Tooltip Radix + i18n FR/EN                                   | 2                   |
| EmptyState + edge cases                                      | 1.5                 |
| Page `/letters` + routing + lazy + ErrorBoundary             | 2                   |
| a11y (clavier, sr-only, NVDA AR)                             | 2.5                 |
| Tokens + dark + Stylelint logical                            | 1                   |
| QA mobile 375 + RTL                                          | 1.5                 |
| **Total**                                                    | **~21.5 h ≈ 3 j-p** |

Buffer ×1.5 (Framer `layoutId` × React 19 StrictMode) = **4 j-p**.

## 10. Intégration

- **Page `/letters` (NICE P2, recommandé)** : route publique, alphabet picker + viz. Mode alternatif à `/explore`. Wow-moment §13.
- **Landing teaser (P3)** : variante demo dans `LandingPage.tsx` à côté de `RootTree`.
- `/roots/:id` : skippé.
- Dashboard : hors MVP.
