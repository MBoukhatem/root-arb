# Agent #04 — UX/UI Designer — Round 3 FINAL

## 1. Décisions finales verrouillées

- **Source unique** `design-tokens.json` -> Tailwind config + `tokens.css` (CSS vars consommees par D3 via `useDesignTokens()`).
- **Theming** : CSS variables, classe `.dark` sur `<html>`. `prefers-color-scheme` lu avant `localStorage` (anti-flash).
- **RTL** : logical properties natives (`ms/me/start/end`). Plugin `tailwindcss-rtl` rejete. `<html dir>` pilote par `useDirection()`.
- **Polices** : Inter (UI), Amiri (titres AR >=24px), Noto Naskh (body AR), self-hosted, `font-display: optional`.
- **Palettes** : ink (textes, AA) vs fill (graphiques) separees.
- **`#e23923`** reserve aux erreurs destructives. LearningSession "rate" = ambre.
- Route `/dev/styleguide` admin remplace Storybook (droppe par TL).

## 2. Design tokens définitifs

### Neutres
| Token | Light | Dark |
|---|---|---|
| `--bg-base` | `#fafaf9` | `#0a0a0f` |
| `--bg-card` | `#f5f5f4` | `#1a1a2e` |
| `--text-primary` | `#0f172a` (15.8:1) | `#f1f5f9` (15.1:1) |
| `--text-secondary` | `#334155` (9.6:1) | `#cbd5e1` (10.4:1) |
| `--text-muted` | `#64748b` (5.7:1) | `#94a3b8` (5.4:1) |
| `--border` | `#e2e8f0` | `#2d2d44` |
| `--focus-ring` | `#2563eb` | `#60a5fa` |

### Categorielles (ink light / ink dark / fill graph)
verb `#1d4ed8 / #93c5fd / #3b82f6` ; noun `#047857 / #6ee7b7 / #10b981` ; adjective `#b45309 / #fcd34d / #f59e0b` ; adverb `#7c2d12 / #fdba74 / #ea580c` ; participle `#6d28d9 / #c4b5fd / #8b5cf6` ; masdar `#be185d / #f9a8d4 / #ec4899` ; pluriel-brise `#0e7490 / #67e8f9 / #06b6d4` ; derive `#4338ca / #a5b4fc / #6366f1`.

### Etats & or decoratif
`--success #16a34a/#4ade80`, `--warning #d97706/#fbbf24`, `--danger #e23923` (constante), `--info #0284c7/#38bdf8`. Or `#92400e/#fcd34d` titres >=24px uniquement.

### Typo & spacing
Scale 1.250. Plancher arabe : 18px body, 20px inline, 24px RootTree, 60-72px racine centrale. `--lh-arabic 1.8`, `--lh-latin 1.5`. Spacing base 4 : `sp-1..16`. Radius `sm 4 / md 8 / lg 12 / xl 16`. Sidebar 280/64px, SidePanel 420px.

## 3. Composants primitifs partagés (`shared/ui/`)

- **`<Button variant size icon loading>`** : `primary | secondary | ghost | destructive`, focus-visible ring.
- **`<Modal>`** : focus-trap, `role="dialog"`, Esc + backdrop, 200ms (off reduced-motion).
- **`<SidePanel side="end" width=420>`** : logique `end`, RTL-aware.
- **`<ConfirmDialog tone="destructive">`** : seul lieu autorise pour `#e23923`.
- **`<ArabicText vocalized unvocalized as="title|body|inline">`** : impose `lang="ar"`, `dir="rtl"`, font-floor, `aria-label`. Bannit AR brut (ESLint custom).
- **`<DirectionalIcon>`** : wrapper Lucide, chevrons resolus selon `dir`.
- **`<Tooltip>`** Radix axe block, **`<EmptyState>`**, **`<Skeleton card|line|tree>`**, **`<Badge categoryKey>`** (ink + `bg-fill/10`), **`<LanguageSelector>`** header + drawer mobile.

## 4. Parcours utilisateur clés

1. **Onboarding invité -> inscription** : Landing avec demo live ك-ت-ب interactive. CTA "essaie ta premiere racine" -> `/roots/ك-ت-ب` public. Limite **3 racines/jour invite** (LS). Apres 2 racines, banner non-bloquant "Sauvegarde ta progression (20s)" -> Register 3 champs.
2. **Session learning** : Dashboard -> Reviser -> Carte recto (mot vocalise + audio) -> reveal verso (traduction + exemple) -> 3 boutons `Difficile (ambre) / Bien / Facile`. Pas de rouge. Progress bar, raccourcis 1/2/3. Fin = ecran positif + suggestion racine voisine.
3. **Exploration** : `/explore` grille filtrable. Clic carte -> page racine = RootTree centre + SidePanel droit details au clic node. Constellation via tab. Recherche translitteree tolerante (`kitab` -> `kitāb`).

## 5. Patterns d'interaction

- **Modale** : actions destructives, formulaires <5 champs, confirmations bloquantes.
- **SidePanel end 420px** : details contextuels, formulaires longs, conserve canvas D3 visible.
- **Drawer mobile** : nav <1024, bottom sheet pour details mot.
- **Breakpoints** : `sm 640 / md 768 / lg 1024 / xl 1280`. Sidebar : drawer <1024, icon-only 1024-1280, full >=1280. RootTree : vertical <sm, radial compact sm-md, radial complet lg+.
- **Animations** : 150-200ms, easing `cubic-bezier(.4,0,.2,1)`. Neutralisees sous `prefers-reduced-motion` via `useReducedMotion()`.

## 6. A11y checklist

- `:focus-visible` 2px `--focus-ring` offset 2px sur tous interactifs (nodes SVG `tabindex="0"` inclus).
- Contraste AA texte (4.5:1), AAA visé body. Audit axe-core manuel S6 + Lighthouse S7 (TL : pas CI bloquant).
- `prefers-reduced-motion` : rotation off, stagger off, force-sim pre-figee.
- `lang` et `dir` : `<html>` pilote par contexte ; `<ArabicText>` local ; DOMPurify allowlist preserve `lang`/`dir` (confirmer #06).
- Clavier D3 : fleches via `logicalKey()` (RTL-aware), Home/End extremes, Enter ouvre detail. Fallback `<ul sr-only>`.
- Cible tactile >=44x44px. Information jamais portee par couleur seule (couleur + icone + label).

## 7. Plan d'exécution sur 8 semaines

- **S1** : `design-tokens.json` + `tokens.css` (light+dark+RTL) J2. Primitives Button, Modal, ArabicText, DirectionalIcon, LanguageSelector fin S1. `/dev/styleguide` (0,5j). Figma RootTree 3 breakpoints.
- **S2** : SidePanel, ConfirmDialog, EmptyState, Badge, Skeleton. Specs Explore + page racine + Notes editor.
- **S3** : Specs visuelles RootTree (LOD, focus ring SVG, hover/selected) livrees AVANT code D3. Support #05.
- **S4** : Specs LearningSession (cartes, ambre) + Dashboard stats (Recharts tokens-aware).
- **S5** : Specs Constellation (LOD seuils, legendes, filtres, tooltips).
- **S6** : Audit polish — dark complet, RTL chrome, responsive mobile. Axe-core manuel 3 langues x 2 themes.
- **S7** : Bug bash visuel, micro-copy FR/EN, Lighthouse a11y >=95, contrastes residuels.
- **S8** : Smoke visuel prod, screenshots slides, video backup parcours invite -> inscription.
