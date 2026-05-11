# Agent #08 — i18n & Accessibilité — Round 3 (FINAL)

## 1. Décisions finales verrouillées

1. **RTL technique = MUST non négociable.** `<html lang dir>`, logical properties, layouts miroirs, `<ArabicText>`, polices arabes self-hosted. L'UI affiche du texte arabe natif dès S2 — sans RTL, ponctuation et chevrons cassent. Budget S1 = 1j.
2. **i18n FR + EN chrome = MUST 100%.** Labels, boutons, enums, codes erreur traduits.
3. **AR-contenu = NICE droppable.** `coreMeaning.ar`, `translations.ar`, `examples[].translation.ar` optionnels, fallback API `ar → en → fr`. Curation Data Engineer #09, drop S6 si retard ≥3j.
4. **Scaffolding S1** (acté Tech Lead R2 A5) : i18next + namespaces + primitives + tokens arabes livrés J3-J5 S1.
5. **Axe-core CI droppé** (Tech Lead). Remplacé par Lighthouse S7 + NVDA manuel AR + `eslint-plugin-jsx-a11y` + Stylelint `csstools/use-logical` bloquants.
6. **6 formes plurielles arabes** via `Intl.PluralRules('ar')` + `compatibilityJSON: 'v4'`.

## 2. Structure des locales

```
client/src/locales/
  fr/  common.json  auth.json  roots.json  tree.json
       dashboard.json  enums.json  a11y.json  errors.json
  en/  (idem)
  ar/  (idem)
```

- **Lazy-load par route** via `i18next-http-backend` ; `common`+`a11y` au boot.
- **Clés kebab-case** : `roots.detail.add-to-collection`. **Plurals AR** : `count_zero/one/two/few/many/other`.
- **Fallback chrome** : `ar → en → fr` (i18next). **Fallback API** : `Accept-Language` → backend sert `ar`, sinon `en`, sinon `fr`, header `Content-Language`.
- **Priorité langue** : `user.preferredInterfaceLanguage` (DB) > localStorage > `navigator.language` > `fr`.
- **Enums** : libellés UX #04, schéma DB Data Engineer.

## 3. Composants primitifs (`shared/ui`)

- **`<ArabicText vocalized unvocalized as="title|body|inline" />`** : impose `lang="ar"`, `dir="rtl"`, Amiri (titres ≥24px) ou Noto Naskh (body ≥18px), `aria-label={unvocalized}` pour NVDA/JAWS, line-height 1.8. Seul vecteur autorisé — règle ESLint interdit littéraux arabes hors composant.
- **`<DirectionalIcon name>`** : wrap Lucide, swap `Chevron/Arrow Right↔Left` selon `dir`. Icônes neutres passthrough.
- **`useDirection()`** : `{ lang, dir, isRTL, logicalKey(e), toggleLang }`. Applique `<html lang dir>` via effet. `logicalKey` mappe `ArrowLeft/Right` → `prev/next` logique (consommé par D3 #05).
- **`<Trans>`** i18next + `<bdi>` automatique sur variables bidi-mixtes.

## 4. Stratégie polices arabes

- **Amiri** (titres ≥24px) + **Noto Naskh Arabic** (body, meilleur diacritique petit corps), self-hostées.
- **Subset woff2** U+0600–06FF + U+FE70–FEFF + diacritiques (~80ko Amiri, ~95ko Noto Naskh).
- **`font-display: optional`** (pas `swap`) pour éliminer CLS au switch FR↔AR ; fallback `"Segoe UI Arabic", "Geeza Pro", serif`.
- **Preload conditionnel** : `<link rel="preload">` Noto Naskh uniquement si `lang === 'ar'` à l'init (script pré-hydratation).
- **CSS vars** dans `design-tokens.json` : `--font-arabic-title`, `--font-arabic-body`, `--lh-arabic: 1.8`. Pas de Google Fonts CDN (RGPD).

## 5. Checklist a11y WCAG AA

- [ ] Contraste ≥4.5:1 (normal), ≥3:1 (≥18px bold). Doré `#d4a574` réservé titres ≥24px ; variantes texte `#92400e` clair / `#fcd34d` dark.
- [ ] `:focus-visible` partout, ring 2px offset 2px, jamais `outline: none` nu.
- [ ] `prefers-reduced-motion` : transitions ≤150ms, pas de rotation continue, force-sim pré-figée.
- [ ] `<html lang dir>` synchronisé à chaque switch.
- [ ] ARIA : `aria-label` icônes, `aria-live="polite"` toasts, `aria-current="page"` nav, `aria-expanded` accordions.
- [ ] Clavier 100% (Tab, Esc, Enter, flèches logiques). Skip-link `#main`.
- [ ] Lint bloquant : `eslint-plugin-jsx-a11y` + Stylelint `csstools/use-logical` interdit `margin/left/right`, `text-align: left/right`.
- [ ] Lighthouse S7 ≥95 a11y × 3 langues × 2 thèmes. Pass NVDA AR.
- [ ] DOMPurify autorise `lang`, `dir`, `bdi` (à confirmer Security #06).

## 6. D3 a11y (coordination #05)

Validé avec #05 R2 :
- **`<svg role="img" aria-labelledby="tree-title tree-desc">`** + fallback `<ul sr-only>` listant racine + 15 dérivés.
- **Nodes** : `<g tabindex="0" role="treeitem" aria-expanded aria-level>`, focus ring SVG 2px offset 4px.
- **Flèches RTL-aware** via `logicalKey(e)` : `←/→` = prev/next sibling logique, `↑/↓` = parent/child. En RTL, `←` physique = `next` logique.
- **`<text>` SVG arabe** : `direction: rtl`, `text-anchor` switché via `getTextAnchor(angle, isRTL)`.
- **Constellation** : focus impératif (D3 owns), `aria-label` par node injecté.

## 7. Plan d'exécution

| S | Livrables i18n/a11y |
|---|---|
| **S1 (1j)** | i18next + 8 namespaces FR/EN/AR vides, `useDirection`, `<ArabicText>`, `<DirectionalIcon>`, polices self-hosted, tokens arabes, Stylelint logical, ESLint jsx-a11y, `useReducedMotion`. |
| **S2-S5** | Remplissage namespaces au fil des features (chrome FR/EN obligatoire chaque merge), audit logical-properties à chaque PR. |
| **S6 (1j)** | Audit RTL toutes routes, curation AR best-effort, contrastes finaux, route `/dev/i18n-preview` matrice 3×2. |
| **S7** | Lighthouse ≥95 × 3 langues × 2 thèmes, NVDA AR, fixes. |

**Verdict** : RTL technique = 2j cumulés (S1+S6), contenu AR droppable sans casser la chrome. Conforme arbitrage Tech Lead A5.
