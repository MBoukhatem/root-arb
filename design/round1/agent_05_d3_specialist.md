# Agent #05 — D3.js / DataViz Specialist — Round 1

Composants concernés : `<RootTree />` (radial, ~15 mots), `<Constellation />` (force-directed, jusqu'à 500+ nodes), `<CalligraphyAnimated />`, `<PatternVisualizer />`.

## 1. Décisions techniques D3

1. **Pattern hybride "React owns DOM, D3 owns math"** — je **reviens sur la reco actuelle du brief**. Pour `<RootTree />` (≤15 nodes), JSX rend `<g><circle><text>`, D3 fournit uniquement `d3.tree().radial()` + `d3.hierarchy()`. Avantages : `key` stables, Framer sans conflit, tests RTL, dark mode Tailwind. **Exception `<Constellation />`** : `forceSimulation` mute à 60 fps → D3 écrit dans le DOM via refs.
2. **Hook `useD3(renderFn, deps)`** : encapsule `useRef + useEffect + d3.select` et standardise le cleanup (`selectAll('*').remove()`).
3. **Layouts** : `d3.tree().size([2π, r])` + projection polaire (RootTree) ; `forceSimulation` + `forceManyBody(-30)`, `forceLink`, `forceCenter`, `forceCollide` (Constellation).
4. **Zoom/pan** : `d3.zoom()` sur `<svg>`, transform sur `<g>` enfant, `scaleExtent([0.3, 4])`. Mobile : `touch-action: none` + pinch natif.
5. **Framer × D3 séparés** : Framer = entrées React-driven, `whileHover`. D3 transitions = tick simulation. Jamais les deux sur le même attribut SVG.
6. **Responsive radial→vertical** : un seul composant, `useMediaQuery` qui bascule `d3.tree()` vertical ↔ radial.
7. **Dark mode** : `currentColor` sur stroke/fill, classes Tailwind sur `<svg>` parent. Zéro listener de thème dans D3.
8. **Accessibilité** : `role="img"`, `aria-labelledby`, `<title>`/`<desc>`, fallback `<ul>` `sr-only`, `tabindex` + `onKeyDown` sur nodes.

## 2. Risques performance / UX

- **Constellation 500+ nodes** : `forceSimulation` sature un mobile mid-range au-delà de ~300 nodes. Mitigations : LOD (masquer labels si zoom < 0.7), `alphaDecay(0.05)`, `simulation.stop()` après convergence, **Canvas fallback >800 nodes**.
- **Re-render React qui détruit l'état D3** : un parent re-render à cause d'un filtre relance la simulation. Parade : `React.memo` strict avec comparaison par `_id` / hash, pas l'objet entier.
- **Tactile mobile** : conflit drag-node vs pan-canvas. Décision : drag desktop uniquement ; sur mobile, tap = détails, pan/pinch = navigation.
- **Calligraphie SVG paths** : payload potentiellement lourd par mot — stratégie de stockage/CDN non couverte par le brief.

## 3. Questions aux autres agents

- **Frontend (#02)** : zoom/transform state local ou Zustand (deep-link `?zoom=2`) ? `useD3` global ou colocaté ?
- **Backend (#03)** : confirmer `GET /api/constellation` → `{ nodes:[{id, root, masteryLevel, semanticField}], links:[{source, target, strength?}] }`. `source`/`target` = strings (id) ou objets ? D3 les mute après init, ça casse `JSON.stringify`. Pagination si 500+ racines ?
- **UX (#04)** : mobile vertical en `100vh` ou scroll naturel ? Équivalent hover tactile (long-press 500 ms) ?
- **Performance (#07)** : OK pour cherry-pick `d3-hierarchy/force/zoom/selection/transition/scale` (~70 KB vs 270 KB) ? Composants D3 en `dynamic import` `ssr:false` ?

## 4. Recommandations actionnables — Semaine 3

- **J1-J2** : `src/hooks/useD3.js` + `src/utils/d3Helpers.js` (radialPoint, colorByCategory, hierarchyBuilder).
- **J2-J3** : `<RootTree />` v1 statique, data hardcodée, radial desktop ; valider à 5 / 10 / 20 mots.
- **J3-J4** : `d3.zoom()` + Framer (stagger 0.08 s) ; tester conflits.
- **J4-J5** : responsive `useMediaQuery`, a11y (title/desc/sr-only), dark mode `currentColor`.
- **J5** : Lighthouse mobile **sur device réel**.
- **Préparer S5** : POC `<Constellation />` à 100 / 300 / 500 fake nodes pour mesurer seuil Canvas vs SVG.
- **Backend** : verrouiller le contrat JSON `nodes/links` cette semaine pour éviter retravail S5.
