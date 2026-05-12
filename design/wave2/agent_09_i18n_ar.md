# Agent 09 — i18n AR : couverture 100 % + pre-paint RTL sync

**Branche** : `rush` — **Scope** : i18n AR/FR/EN, index.html, LoadingSpinner, Pagination, Navbar, i18n.ts

---

## Couverture AR : avant / après

|                                             | Avant | Après  |
| ------------------------------------------- | ----- | ------ |
| Clés AR total                               | 44    | 188    |
| Couverture vs FR (176 clés base + nouveaux) | 25 %  | ~100 % |

La divergence 188 vs 176 est normale : AR possède les formes plurielles supplémentaires (`_zero`, `_two`, `_few`, `_many`) absentes de FR/EN.

---

## Namespaces ajoutés (entièrement absents avant)

| Namespace       | Clés ajoutées                                                                         |
| --------------- | ------------------------------------------------------------------------------------- |
| `roots`         | 48 (incluant 4 formes plurielles `wordsCount_*`, 10 champs sémantiques, 8 catégories) |
| `dashboard`     | 12                                                                                    |
| `learn`         | 16 (incluant sous-objet `rating`)                                                     |
| `constellation` | 7                                                                                     |
| `notes`         | 18 (incluant sous-objet `type`)                                                       |
| `collections`   | 19 (incluant 4 formes plurielles `rootsCount_*`)                                      |
| `landing`       | 14                                                                                    |

**Namespaces complétés (partiels avant) :**

- `auth` : +4 clés (`roleLabel`, `interfaceLanguage`, `preferredTheme`, `timezone`)
- `errors` : +2 clés (`networkError`, `validation`)
- `common` : +2 clés (`pagination`, `toggleNav`-equivalent via `toggle`+`close`)
- `nav` : +3 clés (`toggleNav`, `toggle`, `close`)

---

## Pluriels arabes (F6)

Ajout des 6 formes ICU pour chaque clé plurielle :

- `roots.wordsCount_zero/one/two/few/many/other`
- `collections.rootsCount_zero/one/two/few/many/other`

L'arabe exige `zero` (0), `one` (1), `two` (2), `few` (3–10), `many` (11–99), `other` (≥100). `compatibilityJSON: 'v4'` déjà posé dans `i18n.ts` active le résolveur Intl.PluralRules.

---

## Mécanisme pre-paint sync `<html dir>` (F2)

**Problème** : `<html lang="fr">` codé en dur ; React monte _après_ le parsing HTML → FOUC LTR visible au reload AR.

**Solution** : script bloquant inline dans `<head>` (avant tout `<script type="module">`) :

```html
<script>
  (function () {
    var lang = localStorage.getItem('art_lang') || 'fr';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  })();
</script>
```

- Lit `art_lang` (clé utilisée par `i18n.ts` `lookupLocalStorage`).
- Pose `lang` + `dir` avant que le parser CSS charge les règles `html[dir='rtl']`.
- Fallback `fr`/`ltr` si aucune préférence stockée.
- Aucune dépendance externe, ~5 lignes, exécution synchrone.

`LanguageContext.tsx` conserve son `useEffect` pour les changements dynamiques en session.

---

## Aria-labels hardcodés → `t()` (F4)

| Composant               | Avant                            | Après                                                                                 |
| ----------------------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| `LoadingSpinner.tsx:16` | `aria-label="loading"`           | `aria-label={t('loading')}` + import `useTranslation`                                 |
| `Pagination.tsx:44`     | `aria-label="pagination"`        | `aria-label={t('common:pagination')}`                                                 |
| `Navbar.tsx:77`         | `aria-label="Toggle navigation"` | `aria-label={t('nav:toggleNav', 'Toggle navigation')}` (déjà corrigé par autre agent) |

Clés ajoutées dans FR/EN/AR : `common.pagination`, `nav.toggleNav`, `nav.toggle`, `nav.close`.

---

## i18n.ts (F7 + F8)

```ts
debug: !import.meta.env.PROD,          // F7 — logs muets en prod
detection: {
  order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],  // F8
  ...
}
```

---

## Note bidi mixed (F9)

`LandingPage.tsx:51-54` enchaîne `<ArabicText>` + `<span>{t('landing:demoSubtitle')}</span>` sans isolation. **Agent-06** doit wrapper le span latin dans `<bdi dir="ltr">` ou `dir="auto"` lorsque `isRTL` est actif, pour éviter la réordination UAX#9 des espaces et ponctuation.

---

## Fichiers modifiés

- `client/src/shared/i18n/locales/ar.json` — 44 → 188 clés
- `client/src/shared/i18n/locales/fr.json` — +5 clés (`pagination`, `toggleNav`, `toggle`, `close`, `nav.*`)
- `client/src/shared/i18n/locales/en.json` — +5 clés (idem)
- `client/src/shared/i18n/i18n.ts` — `debug` + `querystring` detection
- `client/index.html` — script pre-paint inline
- `client/src/shared/ui/LoadingSpinner.tsx` — `useTranslation` + `t('loading')`
- `client/src/shared/ui/Pagination.tsx` — `t('common:pagination')`

---

## Vérification

- **Typecheck** : 0 erreur introduite (4 erreurs pré-existantes dans `ConcentricLetters.tsx`/`useConcentricLayout.ts`, hors périmètre)
- **Smoke** : `curl http://localhost:4180/` → `200`
- **Clés AR** : `TOTAL: 188` (188/176 base FR, surplus = formes plurielles arabes)

---

## Résumé final (≤150 mots)

L'AR passe de **44 à 188 clés** (100 % de couverture UI-chrome), comblant 7 namespaces entièrement absents (`roots`, `dashboard`, `learn`, `constellation`, `notes`, `collections`, `landing`) ainsi que les 4 clés `auth` manquantes et 2 clés `errors`. Les formes plurielles arabes complètes (`_zero/_one/_two/_few/_many/_other`) sont ajoutées pour `wordsCount` et `rootsCount`. Le FOUC LTR au reload AR est éliminé par un script inline bloquant dans `<head>` qui pose `lang`/`dir` depuis `localStorage.art_lang` avant le montage React. Les aria-labels hardcodés de `LoadingSpinner` et `Pagination` passent par `t()`. `i18n.ts` reçoit `debug: !PROD` et `querystring` en tête de détection. Aucune erreur TypeScript introduite.
