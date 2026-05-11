# Agent #05 — D3.js / DataViz Specialist — Round 3 FINAL

## 1. Décisions finales verrouillées

- **Pattern hybride** : `<RootTree />` = JSX pur (React owns DOM, D3 owns math via `d3.hierarchy` + `d3.tree().radial()` mémoïsé). `<Constellation />` = impératif (`useD3` + `ref`).
- **Seuils** : SVG ≤ 300 nodes ; **Canvas dès 300** (descendu de 500, marge mobile) ; cap API 1000. LOD : labels masqués si `transform.k < 0.7`.
- **RTL** : radial invariant ; bascule `text-anchor` + `direction:rtl` via helper, ordre angulaire via `sort()`. Vertical mobile : `scaleX(-1)` sur `<g>` racine seul (jamais `<text>`).
- **Mode lite** (`prefers-reduced-motion`) : `duration(0)`, simulation pré-figée, pas de stagger.
- **Dark mode** : `currentColor`, tokens via `useDesignTokens()` (#02).
- **Flag rendu** `RENDER_MODE:'svg'|'canvas'|'auto'` dans Zustand pour A/B (#02).

## 2. Spec `<RootTree />`

**Props** : `{ data; size?: [w,h]; isRTL?; onNodeClick?; onNodeFocus?; reducedMotion? }`.

**Layout** : `d3.hierarchy(data).sort(isRTL ? descending : ascending)` → `d3.tree().size([2π, radius]).separation((a,b)=>(a.parent==b.parent?1:2)/a.depth)`. Projection `radialPoint(angle,r)` mémoïsée `useMemo([data,size,isRTL])`. Sortie JSX `<g><circle><text>`, jamais `d3.select` ici.

**Mobile `<sm`** : `useMediaQuery('(min-width:640px)')` bascule `d3.tree().size([h,w])` linéaire vertical, scroll naturel `min-h-[60vh]` (jamais `100vh` — #04).

**Interactions** : Framer entrée (`stagger 0.08s`), `d3.zoom()` sur `<svg>` (`scaleExtent([0.3,4])`, transform sur `<g>`), `touch-action:none`, long-press 500 ms = hover tactile (`vibrate(10)`).

**A11y** : `<svg role="img" aria-labelledby>`, `<title>`/`<desc>`, nodes `role="treeitem" tabindex="0" aria-expanded aria-level`. Flèches via `logicalKey(e)` (#08). Ring `outline:2px solid var(--focus-ring); offset:4px`. Fallback `<ul sr-only>`.

**RTL** : helper `getTextAnchor(angle, isRTL)` (start↔end par quadrant), `lang="ar" direction:rtl` sur nodes arabes.

**Perfs** : `React.memo` strict, comparateur `_id` ; pas d'objet entier en deps.

## 3. Spec `<Constellation />`

**Props** : `{ nodes; links; renderMode?: 'svg'|'canvas'|'auto'; onSelect? }`. **Clone défensif** `nodes.map(n=>({...n}))`, idem links, avant `forceSimulation` (D3 mute `source`/`target`, casse cache TanStack).

**Simulation** : `forceSimulation(nodes).force('charge', manyBody().strength(-30)).force('link', forceLink(links).id(d=>d.id).strength(d=>d.strength)).force('center', center(w/2,h/2)).force('collide', collide(r+2)).alphaDecay(0.05)`. `stop()` après `alpha<0.01`, puis snapshot.

**LOD** (3 paliers selon `transform.k`) : `<0.4` nodes seuls ; `0.4–0.7` + links ; `>0.7` + labels. Couleur par `semanticField` via tokens CSS.

**Seuil SVG→Canvas** : `nodes.length>=300 || renderMode==='canvas'` → Canvas 2D, `d3.zoom` sur `<canvas>`, hit-detection `quadtree.find()`. >1000 : refus UI + message paginate.

**Drag/zoom/pan** : `d3.drag()` desktop seul (`matchMedia('(pointer:fine)')`) ; mobile : tap = sélection, pinch/pan natif. `scaleExtent([0.2,6])`.

**A11y** : `role="application"`, alternative liste sortable (sr-only) groupée par `semanticField`.

## 4. `<CalligraphyAnimated />` + `<PatternVisualizer />`

**`<CalligraphyAnimated />`** : SVG path animé stroke-dasharray. Props `{ pathD; duration?; trigger?:'hover'|'auto' }`. `useD3`, `path.getTotalLength()` → `dasharray=L; dashoffset:L→0` via `d3.transition().duration(1200).ease(easeCubicInOut)`. Reduced-motion : path final direct. Paths stockés **inline DB** (`calligraphyPath:String`, 4-12 ko/mot) — pas de GridFS MVP.

**`<PatternVisualizer />`** : grille morpho 3×3 (formes I-X) ou template `فَعَلَ`. JSX pur, pas de D3 layout. Hover = highlight + tooltip. Fond `--cat-verb`.

## 5. Contrats API D3 (verrouillés avec #01)

**`GET /api/roots/:id/tree`** (cacheable 5 min) :
```json
{
  "id": "string",
  "letters": "ك-ت-ب",
  "semanticField": "écriture",
  "children": [
    { "id": "w1", "name": "كَتَبَ", "type": "verb",
      "transliteration": "kataba", "translation": "écrire",
      "masteryLevel": 0, "children": [] }
  ]
}
```

**`GET /api/constellation`** :
```json
{
  "nodes": [{ "id": "string", "letters": "ك-ت-ب", "masteryLevel": 0,
              "semanticField": "écriture", "wordsCount": 12,
              "x": null, "y": null }],
  "links": [{ "source": "id1", "target": "id2",
              "type": "semantic|phonetic", "strength": 0.0 }],
  "meta": { "total": 0, "generatedAt": "ISO", "renderHint": "svg|canvas" }
}
```
Contrats : `source`/`target` = **strings** (jamais objets) ; `x`/`y` = `null` ; `strength` calculé serveur (Jaccard).

## 6. POC S1

- **Branche** : `spike/d3-roottree` (jetable).
- **Scope** : `<RootTree />` radial 10 nodes hardcodés, no zoom, no a11y, no RTL. Buts : valider `d3.hierarchy + tree().radial()` en JSX + Framer compat + dark mode `currentColor`.
- **Critère de succès** : rendu correct 60 fps Chrome desktop + bundle d3 cherry-pick ≤ 80 ko. Échec → fallback `d3.tree()` linéaire validé en parallèle.

## 7. Plan d'exécution S3

| Jour | Tâche |
|------|-------|
| **J1** | `useD3.ts`, `d3Helpers.ts` (`radialPoint`, `getTextAnchor`, `colorByField`, `logicalKey`). Types `HierarchyNode<RootData>`. |
| **J2** | `<RootTree />` v1 radial desktop, data API réelle 1 racine, no interactions. |
| **J3** | `d3.zoom`/pan + Framer stagger ; tests conflits ; React.memo + comparateur `_id`. |
| **J4** | RTL (sort + text-anchor), responsive `useMediaQuery` vertical, a11y (title/desc/treeitem/flèches/ring/sr-only). |
| **J5** | Mode lite reduced-motion, Lighthouse mobile device réel, axe-core snapshot SVG, doc Storybook. Buffer +2j si radial foire → fallback linéaire (#10). |
