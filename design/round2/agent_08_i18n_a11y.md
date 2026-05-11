# Agent #08 — i18n & Accessibilité — Round 2

## 1. Réponses aux autres agents

- **UX (#04)** : `LanguageSelector` permanent en **header** (top-right desktop, drawer mobile), pas dans Settings — la langue est un acte d'apprentissage, pas une préférence enfouie. Icônes Lucide directionnelles **non miroitées auto** : wrapper `<DirectionalIcon name="chevron-right" />` qui résout selon `dir`. Sidebar 280px bascule à droite en `dir="rtl"` via logical properties (`inset-inline-start`).
- **D3 (#05)** : OK pour `useMediaQuery` radial↔vertical. En **radial**, pas d'inversion d'orientation (cercle neutre), j'inverse uniquement `text-anchor` + `direction: rtl` sur `<text lang="ar">`. En **vertical** mobile, axe X miroité (`scaleX(-1)` sur `<g>` racine, **pas** sur `<text>` pour éviter miroir typographique). Clavier : `tabindex="0"` + `role="treeitem"`, flèches **logiques** via helper `logicalKey(e)` qui mappe ←/→ selon `dir`. Focus ring : `outline: 2px solid var(--focus-ring); outline-offset: 4px`.
- **Frontend (#02)** : `tailwindcss-rtl` **+** logical properties natives (ceinture+bretelles). Lazy-load namespaces via `i18next-http-backend`. `LanguageContext` expose `isRTL`, `dir`, `lang`, applique `dir` sur `<html>` en effet.
- **Data Engineer (#09)** : **les traductions AR du contenu pédagogique sont à ta charge** (curateur arabophone Sheets). Je gère la **chrome UI** (labels, boutons, enums) en FR/EN/AR. Toi : `coreMeaning.ar`, `translations.ar`, `examples[].translation.ar`. Budget réaliste : ~1h/racine sur les 12 du dataset démo.

## 2. Désaccords

- **Tech Lead (#10) — drop AR/RTL si retard** : je **défends partiellement**. Drop le **contenu AR** est acceptable (fallback API `ar → en`). **Drop le RTL est inacceptable** : l'UI affiche déjà du texte arabe natif (mots, racines, exemples) dès la S2. Sans `dir="rtl"` + logical properties, ponctuation latine et chevrons cassent → un jury arabophone le voit en 3 secondes. **Coût RTL si scaffoldé S1** : ~0,5j en S6 (toggle + audit), pas 3j. **Compromis** : RTL technique livré (toggle, layouts miroirs, polices), locale AR contenu = best-effort.
- **DB Designer (#03)** : il n'a **pas répondu explicitement** sur l'ajout de `.ar` aux 4 champs (`coreMeaning`, `translations`, `patternDescription`, `examples[].translation`). **J'arbitre** : on ajoute `.ar` au schéma en optionnel, fallback API `ar → en → fr` dans le service. Coût schéma = nul, coût remplissage = Data Engineer. À acter en R3.

## 3. Convergences

- **Contraste doré** : UX (#04) acte palette **ink** (textes, `#b45309` AA) vs **fill** (graphiques, `#f59e0b`). Aligné avec ma reco R1.
- **Focus states clavier sur nodes D3** : UX + D3 + moi — `:focus-visible` partout, ring SVG inclus.
- **Axe-core CI bloquant** : UX + DevOps + moi.
- **Plancher typo arabe 18-20px, line-height 1.8** : aligné avec UX.
- **`prefers-reduced-motion`** : UX + D3 + moi — animations désactivables.
- **`design-tokens.json` source unique** (UX) : j'y ajoute `--font-arabic`, `--lh-arabic`, `--ls-arabic`.

## 4. Ajustements de mes décisions R1

1. **Polices** : ajouter **Noto Naskh Arabic** en fallback (meilleure gestion diacritiques que Amiri en petit corps). Amiri pour titres ≥24px, Noto Naskh pour body.
2. **`<ArabicText>`** : prop `as="title|body|inline"` qui switche police et applique le `font-size` floor.
3. **`useDirection()`** : étendre pour exposer `logicalKey(e)` consommé par D3 et toute nav clavier.
4. **Polices `font-display`** : `optional` plutôt que `swap` si Lighthouse CLS dégrade au switch FR↔AR.
5. **Storybook RTL** : descopé (Tech Lead drop Storybook). Remplacement : route `/dev/i18n-preview` admin-only avec matrice 3 langues × 2 thèmes.

## 5. Questions résiduelles

- **DB Designer (#03)** : valides-tu `.ar` optionnel sur les 4 champs avec fallback `ar → en → fr` ?
- **Tech Lead (#10)** : valides-tu le compromis "RTL technique non négociable, contenu AR best-effort" + budget i18n scaffolding S1 = 1j ?
- **Data Engineer (#09)** : les translittérations DIN 31635 (`ʿ`, `ā`, `š`) rendent-elles correctement en Inter / system-ui ? Sinon prévoir `font-feature-settings` ou fallback Noto Sans.
- **Security (#06)** : DOMPurify (notes user-generated) autorise-t-il les attributs `lang` et `dir` dans l'allowlist ? Sinon les notes arabes perdent leur direction.
