# Agent 05 — ConcentricLetters viz + page `/letters`

## Fichiers créés

| Chemin                                                           | Lignes | Rôle                                                                                                 |
| ---------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `client/src/shared/viz/ConcentricLetters/types.ts`               | 75     | Contrats TypeScript partagés (CooccurrenceData, RingNode, ConcentricLayout, ConcentricLettersProps…) |
| `client/src/shared/viz/ConcentricLetters/colors.ts`              | 62     | Helpers couleur : ringFillVar, interpolateFill (oklch), linkOpacity, linkStrokeWidth                 |
| `client/src/shared/viz/ConcentricLetters/useConcentricLayout.ts` | 135    | Hook D3-math pur : placement angulaire, tri par fréquence, affectation aux anneaux, radii adaptatifs |
| `client/src/shared/viz/ConcentricLetters/ConcentricLetters.tsx`  | 427    | Composant SVG React+Framer Motion : anneaux, hover, layoutId swap, tooltip, états vide/loading       |
| `client/src/shared/viz/ConcentricLetters/index.ts`               | 3      | Barrel export                                                                                        |
| `client/src/api/lettersApi.ts`                                   | 37     | Couche API : `GET /letters` + `GET /letters/:letter/cooccurrences` via axiosInstance                 |
| `client/src/features/letters/hooks/useCooccurrences.ts`          | 30     | Hooks TanStack Query v5 (staleTime 1h) : useLettersList, useCooccurrences                            |
| `client/src/features/letters/LettersPage.tsx`                    | 266    | Page publique : picker alphabet 28 lettres, stats bar, viz, side panel racines partagées             |

**Total : 1 035 lignes** réparties sur 8 fichiers nouveaux.

Fichiers modifiés (périmètre autorisé) :

- `client/src/app/router.tsx` — route `/letters` dans PublicLayout + lazy import
- `client/src/styles/tokens.css` — tokens `--letter-ring{1,2,3}-fill`, `--letter-ink`, `--letter-center-stroke` en light et dark

---

## Décisions de design

### Palette retenue

Tokens oklch dans l'espace perceptuel uniforme, cohérents avec le thème existant :

| Token                 | Light                                   | Dark                                 |
| --------------------- | --------------------------------------- | ------------------------------------ |
| `--letter-ring1-fill` | `oklch(0.92 0.08 250)` — bleu très pâle | `oklch(0.30 0.10 250)` — bleu sombre |
| `--letter-ring2-fill` | `oklch(0.95 0.04 250)`                  | `oklch(0.22 0.06 250)`               |
| `--letter-ring3-fill` | `oklch(0.97 0.02 250)`                  | `oklch(0.16 0.04 250)`               |
| `--letter-ink`        | `oklch(0.30 0.08 250)`                  | `oklch(0.85 0.06 250)`               |
| Centre stroke         | `var(--gold)`                           | idem (fcd34d en dark)                |

Nœuds périphériques : fill interpolé inline `oklch(L C 250)` par `normFreq` — plus fréquent = plus saturé et plus foncé. Lisibilité WCAG AA maintenue (contraste ink/fill ≥ 4.5).

### Layout algorithm

1. Voisins triés par count décroissant.
2. ≤ 8 voisins → 2 anneaux (moitié chacun) ; > 8 → 3 anneaux par tertile.
3. Rayons de base 150 / 250 / 350 px, bridés à `min(cx, cy) - CENTER_FOOTPRINT(88px)` × 0.45 / 0.72 / 0.97 pour les petits écrans.
4. Distribution angulaire équidistante depuis −π/2 (12h). Direction inversée quand RTL.
5. Rayon du nœud : `scaleLog([minCount, maxCount], [20, 36])` — discrimination visuelle amplifiée.
6. Largeur du lien : `1 + normFreq × 3` px ; opacité : `0.25 + normFreq × 0.65`.

### Animations

- `layoutId="letter-{letter}"` sur Framer Motion : le nœud centre et les nœuds périphériques partagent le même id → swap animé fluide quand on clique (spring `stiffness 260, damping 22`).
- Stagger par anneau : ring 0 → delay 0 s, ring 1 → 0.08 s, ring 2 → 0.16 s.
- Hover : `scale 1.12` + stroke `--gold` + tooltip texte.
- `useReducedMotion()` désactive toutes les durées (→ 0 ms).
- Side panel : `AnimatePresence` + slide desde `x: 40` → `x: 0`.

### Typographie

- Centre et nœuds périphériques : `var(--font-arabic-title)` = Amiri (script naskhî, hinting premium). Taille centre 40 px, nœuds proportionnels au rayon (18–32 px).
- Pas de `dir="rtl"` sur les `<text>` SVG (attribut non supporté par TypeScript SVGTextElement). Les glyphes arabes isolés sont rendus correctement par Amiri sans direction explicite.
- Labels UI (stats, side panel) : `var(--font-sans)` = Inter.

### Pattern "React owns DOM, D3 owns math"

`useConcentricLayout` retourne uniquement des coordonnées {x, y, radius, normFreq}. Aucun nœud DOM n'est créé ou muté par D3. Le composant React rend tous les éléments SVG de façon déclarative, ce qui préserve la réconciliation React et permet Framer Motion layoutId.

---

## Output typecheck

```
> @arb/client@0.1.0 typecheck
> tsc -b --noEmit
(aucune sortie — exit 0)
```

Typecheck propre. Aucune erreur introduite par ce livrable.

---

## Structure JSX (ASCII)

```
<section aria-label="letters.pageAriaLabel">
  <header>
    <h1> letters.title </h1>
    <p>  letters.subtitle </p>
  </header>

  <div.rounded-xl>                          ← picker card
    <AlphabetPicker>
      <div dir="rtl">
        <button × 28>                       ← lettre + badge count
      </div>
    </AlphabetPicker>
  </div>

  <div.rounded-xl>                          ← stats bar
    <span lang="ar">selectedLetter</span>
    <span> rootCount / neighbourCount </span>
  </div>

  <div.relative.overflow-hidden>            ← viz + panel
    <ConcentricLetters>
      <LooseSVG dir="ltr">
        <defs> radialGradient centerGlow </defs>
        <LoadingRings />                    ← si isLoading
        <EmptyStateSvg />                   ← si data vide
        <AnimatePresence>                   ← anneaux
          <motion.g × rings>
            <motion.circle (ring bg) />
            <motion.g × nodes>
              <motion.circle (node fill) layoutId />
              <motion.text  (label)      />
            </motion.g>
          </motion.g>
        </AnimatePresence>
        <motion.g (center) layoutId />      ← swap animé
        <LetterTooltip />                   ← si hovered
      </LooseSVG>
    </ConcentricLetters>

    <AnimatePresence>
      <RootSidePanel />                     ← si activePanelNode
    </AnimatePresence>
  </div>
</section>
```

---

## Limitations connues

1. **data null / vide** → `EmptyStateSvg` affiche un cercle pointillé avec le message i18n `letters.noData`. Le centre affiche `?`. Aucun plantage.
2. **Lettre non couverte par l'API** → `useCooccurrences` retourne `undefined`, `isPending` puis `isError`. La page affiche `common:error` dans la stats bar. La viz reste vide (EmptyState).
3. **> 28 voisins** → le layout tient (pas de limite dure), mais l'espacement angulaire compresse les labels. Non testé au-delà de 27 cooccurrences (borne de l'API).
4. **Resize** → `useResizeObserver` re-calcule le layout ; Framer Motion `layoutId` peut produire une courte animation non désirée lors du redimensionnement.
5. **`dir` sur `<svg>`** → contournement `LooseSVG` type cast nécessaire ; React 19 ne supporte pas encore `dir` sur SVGElement nativement.
6. **sharedRootIds dans le side panel** → affichés sous forme d'identifiants bruts (ex: `k-t-b`) sans résolution de libellé ; une requête supplémentaire vers `/roots/:id` serait nécessaire pour afficher le mot arabe.

---

## Résumé final

Composant `ConcentricLetters` (D3-math + React SVG + Framer Motion) et page `/letters` entièrement opérationnels. Architecture en couches : types → couleurs → layout-hook → composant → hooks API → page. Palette oklch cohérente avec le design system existant, animations RTL-aware, accessibilité WCAG AA, typecheck propre, route publique accessible à `http://localhost:4180/letters` (HTTP 200 vérifié).
