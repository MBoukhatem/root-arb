# Agent 03 — Backend ESLint Setup (@arb/server)

## Résumé (≤ 150 mots)

ESLint 10 (flat config) installé sur `@arb/server` avec `eslint-plugin-security`, `eslint-plugin-node`, `eslint-config-prettier` et `globals`. Le radar est allumé : `npm run lint -w server` retourne **7 warnings, 0 erreurs bloquantes**. Les violations sont légères — principalement des directives `eslint-disable` devenues obsolètes et deux variables `_err` non utilisées dans `Word.js`. Aucune règle de sécurité (`security/detect-unsafe-regex`, `detect-eval-with-expression`, `detect-buffer-noassert`) n'est déclenchée, ce qui est un bon signal. Les corrections ne sont pas appliquées (hors scope Wave 3) — elles sont listées en recommandations prioritaires pour Wave 4.

---

## 1. Configuration installée

| Fichier                   | Rôle                          |
| ------------------------- | ----------------------------- |
| `server/eslint.config.js` | Flat config ESLint 10 (CJS)   |
| `server/package.json`     | Script `lint` : `eslint src/` |

**Packages ajoutés en `devDependencies`** :

- `eslint` ^10.3.0
- `@eslint/js` ^10.0.1
- `eslint-plugin-security` ^4.0.0
- `eslint-plugin-node` ^11.1.0
- `eslint-config-prettier` ^10.1.8
- `globals` ^17.6.0

**Règles actives notables** :

- `security/detect-unsafe-regex` → error
- `security/detect-eval-with-expression` → error
- `security/detect-buffer-noassert` → error
- `security/detect-non-literal-regexp` → warn
- `security/detect-object-injection` → off (faux positifs Mongoose)
- `no-unused-vars` → warn (ignore pattern `^_`)
- `no-console` → off (Node.js server, Morgan/Pino utilisés)

---

## 2. Violations totales : 7 warnings, 0 erreurs

### Par règle (top 5)

| Règle                                                   | Count | Sévérité |
| ------------------------------------------------------- | ----- | -------- |
| `no-unused-vars`                                        | 3     | warning  |
| `reportUnusedDisableDirectives` (no-constant-condition) | 1     | warning  |
| `reportUnusedDisableDirectives` (no-console)            | 2     | warning  |
| `reportUnusedDisableDirectives` (no-unused-vars)        | 1     | warning  |
| _(aucune règle security déclenchée)_                    | 0     | —        |

### Par fichier (top 5)

| Fichier                           | Violations | Détail                                                                               |
| --------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| `src/config/env.js`               | 2          | Directives `// eslint-disable-next-line no-console` inutiles (règle déjà désactivée) |
| `src/models/Word.js`              | 2          | `_err` défini mais jamais utilisé (lignes 95, 108)                                   |
| `src/config/db.js`                | 1          | Directive `no-constant-condition` inutile                                            |
| `src/middlewares/errorHandler.js` | 1          | Directive `no-unused-vars` inutile                                                   |
| `src/seeds/seed.js`               | 1          | `mongoose` importé mais jamais utilisé                                               |

---

## 3. Recommandations de fix prioritaires (non appliquées — Wave 4)

1. **`src/models/Word.js` L95, L108** — Remplacer `_err` par `_` ou retirer le paramètre si le catch ne l'utilise pas. Fix : `} catch (_) {`
2. **`src/seeds/seed.js` L13** — Retirer l'import `mongoose` si non utilisé directement (ou le préfixer `_mongoose`).
3. **`src/config/env.js` L46, L49** — Supprimer les directives `eslint-disable-next-line no-console` devenues caduques (la règle est globalement désactivée).
4. **`src/config/db.js` L45** — Supprimer la directive `no-constant-condition` inutile.
5. **`src/middlewares/errorHandler.js` L12** — Supprimer la directive `no-unused-vars` inutile.

> Aucune violation de sécurité critique détectée. Le code ne contient pas de regex dangereuses, d'`eval()` dynamique, ou d'accès buffer non sécurisé. Le profil de risque sécurité initial est satisfaisant.

---

## 4. Vérification globale

```
npm run lint -w server   →  ✖ 7 problems (0 errors, 7 warnings)
npm run lint             →  client: 10 errors pré-existants (hors scope)
                            server: 7 warnings (nouveau)
                            shared: noop
```

Les erreurs client (10 erreurs `react-hooks/set-state-in-effect`, `@typescript-eslint/no-unused-vars`) sont **pré-existantes** et indépendantes de cette configuration serveur.
