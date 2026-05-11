# Agent #04 — UX/UI Designer — Round 2

## 1. Réponses aux questions reçues

- **Frontend (#02) — logical properties `ms-*/me-*`.** Validé sans réserve. Tailwind v3.3+ natif, zéro double-classe `ltr:/rtl:`, compatible Stylelint `csstools/use-logical` (#08). Bannir `ml-/mr-/left-/right-` via règle ESLint custom + audit Storybook RTL toggle.
- **Frontend (#02) — CSS vars exploitables D3.** Confirmé : tokens exposés dans `:root` + `.dark` via `index.css`, `ThemeContext` ne fait que toggler `.dark` sur `<html>`. D3 lit `getComputedStyle(document.documentElement).getPropertyValue('--cat-verb')`. Pas de hook supplémentaire.
- **D3 (#05) — mobile vertical : 100vh ou scroll naturel.** Scroll naturel. `100vh` enferme l'arbre et casse le pinch-zoom natif. Hauteur `min-h-[60vh]`. Long-press 500 ms = hover tactile validé, avec `navigator.vibrate(10)` léger.
- **D3 (#05) — mode "lite" sur `prefers-reduced-motion`.** Obligatoire : pas de rotation continue, transitions ≤150 ms, stagger off, force-simulation pré-figée puis snapshot. Hook `useReducedMotion()` partagé `shared/hooks`.
- **i18n (#08) — placement `LanguageSelector`.** Header permanent (icône globe + `FR/EN/AR`), pas Settings. Critère démo et CDC. Settings garde la persistance DB (priorité de langue #08).
- **Tech Lead (#10) — dark mode palette dupliquée vs CSS vars.** CSS vars uniquement, généré depuis `design-tokens.json`. Figé en S1.

## 2. Désaccords / arbitrages

- **Tech Lead (#10) propose de drop AR/RTL si retard — DÉSACCORD MESURÉ.** Drop la **locale AR de contenu** (champs `.ar` proposés par #08), garder **RTL + i18n FR/EN**. Justification : l'app affiche déjà du texte arabe (mots, racines) ; sans `dir="rtl"` correct, tooltips bilingues, ponctuation mixte (#08 §bidi) et RootTree cassent visuellement même en UI FR. Le RTL coûte ~1,5j si scaffoldé S1 (logical properties + `dir` switch), pas 4j si reporté S6. **Arbitrage : RTL préparé S1, AR-contenu optionnel S6.**
- **#08 Amiri self-hosted vs Google Fonts.** Validé self-hosted (RGPD + perf). Je renforce : `font-display: swap` + fallback system `"Segoe UI Arabic", "Geeza Pro"` pour neutraliser le CLS au switch FR→AR.

## 3. Convergences validées

- **Contraste calligraphie dorée WCAG fail (#08 + ma R1 §3).** `#d4a574` sur clair = 2.1:1, échec AA. Décision conjointe : doré réservé aux **titres ≥24px décoratifs**, jamais porteur d'information seule. Variantes texte : `#92400e` (AA clair) / `#fcd34d` (AA dark).
- **A11y SVG / navigation clavier (#05 + #08).** `role="img"` + `aria-labelledby` sur `<svg>`, `tabindex="0"` + `role="treeitem"` sur nodes, focus ring SVG 2px `--primary` offset 2px, fallback `<ul sr-only>` listant racine + dérivés, flèches clavier inversées en RTL. Je fournis les specs visuelles du ring.
- **`design-tokens.json` source unique** (ma R1 + esprit #02) : Tailwind + CSS vars + Storybook.
- **Axe-core CI bloquant** (#08 + ma R1) : 0 violation critique × 3 langues × 2 thèmes.

## 4. Ajustements à ma conception

- **Sidebar RTL** : bascule à droite via logical properties (résout ma question R1 §3).
- **Icônes directionnelles Lucide** : non miroitées auto. Composant `<DirectionalIcon>` qui switch `ChevronRight ↔ ChevronLeft` selon `useDirection()` (#08).
- **`<ArabicText vocalized unvocalized />`** (#08) adopté comme primitive du design system. Toute mention arabe passe par lui (impose `lang="ar"`, `dir="rtl"`, `aria-label` non vocalisé).
- **Onboarding invité** : limite **3 racines/jour invité** (convergence ma R1 §risque).
- **LOD Constellation (#05)** : labels masqués <0.7 zoom, transition opacité 150 ms. Je fournis les seuils.
- **Couleur erreur destructive `#e23923`** : confirmé hors LearningSession "raté" (ambre `--warning`).

## 5. Questions résiduelles

- **#08** : qui maintient `enums.json` traduit (semanticField, grammaticalCategory) — UX (libellés) ou Data Engineer (#09) ?
- **#10** : budget 0,5j en S1 pour route `/styleguide` interne (audit visuel design system) — OK ?
- **#06** : CSP avec nonces D3 impacte-t-elle les styles inline Framer Motion ? Si oui, pré-générer un set de keyframes Tailwind nommées.
- **#02** : `<ArabicText>` doit-il vivre dans `shared/ui` ou `features/i18n` ? Je penche `shared/ui` (primitive transversale).
