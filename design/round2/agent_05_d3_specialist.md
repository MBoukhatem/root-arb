# Agent #05 — D3.js / DataViz Specialist — Round 2

## 1. Réponses aux autres agents

**Frontend (#02) — "React owns DOM, D3 owns math"** : **confirmé** pour `<RootTree />` (≤15 nodes). JSX rend `<g><circle><text>`, D3 fournit `d3.hierarchy()` + `d3.tree().size([2π, r])` via `useMemo`. Keys stables, Framer compatible, RTL testable, `currentColor` propage le dark mode. **Exception assumée : `<Constellation />`** — au-delà de ~150 nodes, le diff React à 60 fps est prohibitif. Là D3 écrit en impératif via `ref` ; React ne rend que `<svg>` + `<g>` racines. Frontière nette : un composant = un mode.

**i18n (#08) — inversion RTL du RootTree** : le radial est **invariant par rotation**, donc pas d'inversion d'axe pour le radial. Trois ajustements quand même :
1. **Ordre angulaire** : sens horaire en LTR, antihoraire en RTL via `d3.hierarchy().sort((a,b) => isRTL ? d3.descending : d3.ascending)`.
2. **`<text>` SVG** : `direction: rtl` + bascule `text-anchor` (start↔end) selon angle ET langue. Helper `getTextAnchor(angle, isRTL)`.
3. **Layout vertical mobile** (`<sm`) : inversion X complète via `d3.tree().size([height, -width])` quand `isRTL`. Le `useDirection()` de #08 pilote la projection.

**UX (#04) — a11y SVG + vertical mobile** : **concorde**. `tabindex="0"` + `role="treeitem"` + `aria-expanded` sur chaque node, flèches clavier (inversées en RTL), `:focus-visible` ring 2px outline SVG. Vertical `<sm` : bascule `useMediaQuery('(min-width: 640px)')` → linéaire vs radial. Mode "lite" sur `prefers-reduced-motion` : pas de rotation continue, pas de stagger, transitions D3 à `duration(0)`.

**Tech Lead (#10) — POC D3 dès S1** : **validé et critique**. Sans 5h de R&D parallèle (Observable + prototype radial 10 nodes), S3 devient un piège. Engagement : POC committé S1 sur branche `spike/d3-roottree`, jetable. Fallback `d3.tree()` linéaire si radial foire — perte cosmétique seulement.

**Backend (#01) — contrat `/api/constellation`** : voici la spec figée que je demande :

```json
{
  "nodes": [
    { "id": "string (root._id)", "letters": "ك-ت-ب",
      "masteryLevel": 0..5, "semanticField": "string",
      "wordsCount": number, "x": null, "y": null }
  ],
  "links": [
    { "source": "string (id)", "target": "string (id)",
      "type": "semantic|phonetic", "strength": 0..1 }
  ],
  "meta": { "total": number, "generatedAt": "ISO" }
}
```

**Points durs** : `source`/`target` = **strings d'id**, jamais d'objets — D3 les mute après `forceSimulation`, ce qui casse `JSON.stringify` et le cache TanStack Query. Je clone côté client avant `forceLink`. `x`/`y` à `null` côté API. Pas de pagination avant 500 nodes ; cap API 1000, au-delà Canvas.

## 2. Désaccords

Aucun désaccord majeur. Nuance avec #04 sur le panneau latéral 420px au clic d'un node : sur tablette portrait, ça mange 50% du canvas D3 — je propose **drawer bottom-sheet** sous 768px, panneau latéral au-delà.

## 3. Convergences

- TS confirmé (j'utilise `@types/d3`, `HierarchyNode<RootData>`, `Selection<SVGGElement, ...>`).
- Lazy-load `<Constellation />` (#02, #07) + cherry-pick `d3-hierarchy/force/zoom/selection/transition/scale` (~70 KB).
- `design-tokens.json` (#04) consommé via `getComputedStyle().getPropertyValue('--cat-verb')` dans D3.
- Axe-core CI bloquant (#04, #08) — j'ajoute snapshot SVG par viz.

## 4. Ajustements à ma fiche R1

- **Hook `useD3`** : abandonné pour `<RootTree />` (pattern JSX pur suffit), conservé uniquement pour `<Constellation />` et `<CalligraphyAnimated />` (impératif).
- **Sort angulaire RTL** ajouté dans `d3Helpers.ts`.
- **POC S1** : reclassé MUST (vs "préparer S5" R1).
- **Cap Canvas** : seuil descendu de 800 → 500 nodes pour marge mobile mid-range.

## 5. Questions résiduelles

- **#01** : `strength` des links calculé serveur (Jaccard sur racines partagées) ou client ? Impact perf seed.
- **#03** : index sur `Root.semanticField` confirmé pour groupage couleur Constellation ?
- **#09 (Data)** : SVG paths calligraphie — payload moyen par mot et stockage (GridFS, S3, inline DB) ?
- **#07 (DevOps)** : budget Lighthouse mobile sur `<Constellation />` 300 nodes — quel seuil TBT toléré ?
