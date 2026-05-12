# Agent_02 — Data & API Planner pour `ConcentricLetters`

Spécification backend + suffisance seed pour la viz "1 lettre au centre, anneaux = co-occurrences". Lecture seule.

## 1. Endpoint retenu

`GET /api/letters/:letter/cooccurrences` — public, namespace libre.

Alternatives rejetées : `/api/roots/by-letter/:letter` (sémantique racines, pas matrice) ; `/api/letters/cooccurrence-matrix` 28×28 (payload inutile, la viz ne consomme qu'une coupe).

### Query params

| Param          | Type | Défaut  | Plage   | Rôle                                           |
| -------------- | ---- | ------- | ------- | ---------------------------------------------- |
| `limit`        | int  | `27`    | `1..27` | nb max d'anneaux                               |
| `minCount`     | int  | `1`     | `1..50` | filtre cooccurrences rares                     |
| `includeRoots` | bool | `false` | —       | inclut `sharedRootIds` (allègement par défaut) |

### Réponse JSON

```ts
{
  success: true,
  data: {
    letter: "ك",                 // NFC, sans tashkîl
    totalRootsWithLetter: 5,
    totalCooccurrences: 9,
    cooccurrences: [
      { letter: "ل", count: 3, sharedRootIds: ["652f..."] },
      { letter: "م", count: 2, sharedRootIds: ["..."] }
    ],
    generatedAt: "2026-05-12T10:14:00.000Z"
  }
}
```

`sharedRootIds: []` si `includeRoots=false`. Tri : `count desc, letter asc`. 404 `LETTER_NOT_FOUND` si `totalRootsWithLetter === 0`.

## 2. Pipeline Mongo (`services/lettersService.js`)

```js
const pipeline = [
  { $match: { lettersArray: letterNFC } },
  { $project: { _id: 1, lettersArray: 1 } },
  { $unwind: '$lettersArray' },
  { $match: { lettersArray: { $ne: letterNFC } } },
  {
    $group: {
      _id: '$lettersArray',
      count: { $sum: 1 },
      sharedRootIds: { $addToSet: '$_id' },
    },
  },
  { $match: { count: { $gte: minCount } } },
  { $sort: { count: -1, _id: 1 } },
  { $limit: limit },
];
const totalRootsWithLetter = await Root.countDocuments({ lettersArray: letterNFC });
```

**Index utilisé** : `rootSchema.index({ lettersArray: 1 })` déjà présent (`Root.js` ligne 48). Multikey, couvre le `$match` initial (IXSCAN). Le post-unwind reste en mémoire mais cardinalité triviale (≤120 racines). Aucun nouvel index requis.

**Edge case `ح-ب-ب`** : `lettersArray = ["ح","ب","ب"]`. Pour recherche `ب`, `countDocuments` = 1 racine ; après `$unwind` + `$match $ne ب`, il ne reste que `ح` → group `ح` count:1. Le doublon n'inflate rien. OK.

## 3. Validation Joi (`validations/lettersValidation.js`)

```js
const ARABIC_LETTER_RE = /^[ء-ي]$/u; // hamza..ya

const cooccurrencesParams = Joi.object({
  letter: Joi.string()
    .custom((v) => v.normalize('NFC'))
    .length(1)
    .pattern(ARABIC_LETTER_RE)
    .required(),
});

const cooccurrencesQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(27).default(27),
  minCount: Joi.number().integer().min(1).max(50).default(1),
  includeRoots: Joi.boolean().default(false),
});
```

NFC en custom **avant** `.length(1)` (sinon hamza composée casse la longueur). Le contrôleur appliquera aussi `normalizeArabic()` (`utils/arabic.js`) par sécurité — chaîne `nfc → stripTashkil`.

## 4. Suffisance du seed

8 racines : `ك-ت-ب`, `ع-ل-م`, `ق-ر-أ`, `د-ر-س`, `ك-ل-م`, `م-ش-ي`, `أ-ك-ل`, `ح-ب-ب`. Compte par lettre :

- **n=3** : ك, ل, م
- **n=2** : أ, ب, ر
- **n=1** : ت, ح, د, س, ش, ع, ق, ي
- **n=0** (15) : ا, ث, ج, خ, ذ, ز, ص, ض, ط, ظ, غ, ف, ن, ه, و

**Verdict** : 6 lettres seulement ont ≥2 racines. Viz inutilisable pour 22/29 lettres.

### Racines à ajouter (8 — gain max ; minimum viable = 5)

Critères : chaque racine débloque ≥2 lettres rares ; attestées (Quranic Corpus / Lane DP). Toutes : `isEssential: true`, `isQuranic: true` sauf indiqué. `transliterationSimplified` = ASCII compactée. `coreMeaning` doit fournir FR + EN (AR optionnel).

| letters | translit (DIN) | simplified | semanticField | fr / en / ar                | Quranic |
| ------- | -------------- | ---------- | ------------- | --------------------------- | ------- |
| ج-ل-س   | j-l-s          | jls        | social        | s'asseoir / to sit / الجلوس | oui     |
| ن-ظ-ر   | n-ẓ-r          | nzr        | knowledge     | regarder / to look / النظر  | oui     |
| ف-ت-ح   | f-t-ḥ          | fth        | action        | ouvrir / to open / الفتح    | oui     |
| خ-ر-ج   | kh-r-j         | khrj       | movement      | sortir / to exit / الخروج   | oui     |
| ذ-ه-ب   | dh-h-b         | dhhb       | movement      | aller / to go / الذهاب      | oui     |
| ص-ب-ر   | ṣ-b-r          | sbr        | emotion       | patience / patience / الصبر | oui     |
| ط-ل-ب   | ṭ-l-b          | tlb        | action        | demander / to seek / الطلب  | non     |
| و-ز-ن   | w-z-n          | wzn        | action        | peser / to weigh / الوزن    | oui     |

`semanticField` reste dans l'enum existant `utils/enums.js` (knowledge, action, place, emotion, movement, time, social, nature, body, spiritual, communication). Pas de "state" requis (PLAN_FINAL §3 le cite mais l'enum runtime ne l'a pas — `ج-ل-س` mappé `social`).

**Gain** : 16 racines totales → ~19 lettres avec ≥2 racines. Résiduel à 0 : ث, غ, ظ, ض (acceptable, lettres rares pédagogiquement).

**Min viable (5)** : `ج-ل-س`, `ن-ظ-ر`, `ف-ت-ح`, `خ-ر-ج`, `ص-ب-ر` → ~14 lettres exploitables.

## 5. Cache

**Pas de cache en MVP**. ≤120 racines, IXSCAN <5ms sur mongodb-memory-server, simplicité prioritaire. Si p95 >50ms observée sur Atlas M0 plus tard : `lru-cache` (déjà dans deps PLAN §2.5), TTL 5 min, clé `${letter}:${limit}:${minCount}:${includeRoots}`, invalidation via `Root.post('save'|'remove', () => cache.clear())`.

## 6. Structure de code à créer

```
server/src/
├── controllers/lettersController.js
├── routes/lettersRoutes.js
├── services/lettersService.js
├── validations/lettersValidation.js
```

Plus 1 ligne dans `routes/index.js` :

```js
router.use('/letters', require('./lettersRoutes'));
```

Rate-limit global (100/min) hérité, suffisant.

## 7. Tests smoke (curl)

```bash
# 1) lettre dense — ≥3 cooccurrences attendues
curl -s 'http://localhost:5000/api/letters/%D9%83/cooccurrences' | jq

# 2) includeRoots + minCount
curl -s 'http://localhost:5000/api/letters/%D9%84/cooccurrences?includeRoots=true&minCount=2' | jq

# 3) lettre absente — 404 LETTER_NOT_FOUND
curl -i 'http://localhost:5000/api/letters/%D8%B6/cooccurrences'
```

(`%D9%83`=ك, `%D9%84`=ل, `%D8%B6`=ض.)

## 8. Impact sur l'existant

Aucun endpoint cassé, aucun modèle modifié, aucun nouvel index, aucune extension d'enum. Seed idempotent via `letters` unique.

---

## Résumé final (FR, ≤200 mots)

(a) Livrable : `/home/mboukhatem/root-arb/design/wave1/agent_02_data_planner.md`.
(b) Endpoint retenu : `GET /api/letters/:letter/cooccurrences?limit&minCount&includeRoots` (public). Réponse `{ letter, totalRootsWithLetter, cooccurrences[{letter,count,sharedRootIds}] }`. Pipeline Mongo `$match → $unwind → $match $ne → $group $addToSet → $sort → $limit`, propulsé par l'index multikey existant `lettersArray` (zéro nouvel index). Validation Joi `length(1) + pattern [ء-ي] + NFC custom`. Pas de cache en MVP.
(c) Seed actuel insuffisant : seules 6/29 lettres ont ≥2 racines (ب, ر, ك, ل, م, أ). **Recommandation : ajouter 8 racines** (ج-ل-س, ن-ظ-ر, ف-ت-ح, خ-ر-ج, ذ-ه-ب, ص-ب-ر, ط-ل-ب, و-ز-ن) pour porter à ~19 lettres exploitables. **Minimum viable : 5 racines** (les 5 premières). Aucun impact sur les endpoints ou modèles existants.
