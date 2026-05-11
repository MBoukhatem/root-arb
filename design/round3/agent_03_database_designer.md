# Agent #03 — Database Designer — Round 3 FINAL

Schémas Mongoose définitifs prêts à coder. Cible : Node 20 + Mongoose 8.x + Atlas M0 (replica set, transactions OK).

---

## 1. Décisions finales verrouillées

1. **NFC + strip tashkîl** appliqués au **seed** (script Node, source de vérité) et **revalidés en pre-save** (filet — double-écriture acceptée, helper unique).
2. **Index `text` MongoDB** multi-champs avec `default_language: 'none'` ; Atlas Search = backlog.
3. **bcrypt rounds 12** via `BCRYPT_ROUNDS` env, `password: { select: false, minlength: 8 }`.
4. **`tokenVersion`** sur User (révocation JWT 24h sans Redis).
5. **`timezone` IANA** sur User (streaks corrects), default `'Europe/Paris'`.
6. **`successRate` virtual** (jamais stocké) ; **`easinessFactor.min: 1.3`** (SM-2).
7. **`wordsCount` dénormalisé** sur Root (`$inc` au CRUD Word + cron `reconcileCounters`).
8. **Champs `.ar` optionnels** partout (`coreMeaning.ar`, `translations.ar`, `patternDescription.ar`, `examples[].translation.ar`) — fallback API `ar → en → fr`, droppables sans migration.
9. **`transliterationSimplified`** (ASCII) sur Word, généré au seed (recherche tolérante).
10. **Indexes uniques `email`/`username` avec collation `{ locale: 'en', strength: 2 }`** (case-insensitive, anti-énumération).
11. **Pagination** : offset par défaut (TL A7), cursor opt-in `/notes`, `/community`.
12. **`ensureIndexes` au boot** en dev + script `npm run db:indexes` en prod (DevOps appelle au `postdeploy`).
13. **Transactions** activées (replica set Atlas) pour `Note.likes` ↔ `likesCount` et register ↔ Progress init.

---

## 2. Schémas finalisés

### `models/User.js`

```js
const userSchema = new Schema({
  email:    { type: String, required: true, lowercase: true, trim: true,
              match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, required: true, select: false, minlength: 8 },
  username: { type: String, required: true, trim: true, minlength: 3, maxlength: 30,
              match: /^[a-zA-Z0-9_-]+$/ },
  avatar:   { type: String, default: null },
  nativeLanguage:             { type: String, enum: ['fr', 'en'], default: 'fr' },
  learningLevel:              { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  learningGoal:               { type: String, enum: ['quran','msa','conversation','general'], default: 'general' },
  preferredTheme:             { type: String, enum: ['light','dark'], default: 'light' },
  preferredInterfaceLanguage: { type: String, enum: ['fr','en','ar'], default: 'fr' },
  role:         { type: String, enum: ['user','admin'], default: 'user' },
  tokenVersion: { type: Number, default: 0, select: false },  // révocation JWT
  timezone:     { type: String, default: 'Europe/Paris' },    // IANA
  streak: {
    current:           { type: Number, default: 0, min: 0 },
    longest:           { type: Number, default: 0, min: 0 },
    lastActivityDate:  { type: Date, default: null }
  },
  totalRootsLearned: { type: Number, default: 0, min: 0 },
  totalWordsLearned: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (this.isModified('email')) this.email = this.email.toLowerCase().trim();
  if (this.isModified('password')) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    this.password = await bcrypt.hash(this.password, rounds);
  }
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { delete ret.password; delete ret.tokenVersion; delete ret.__v; return ret; }
});
```

### `models/Root.js`

```js
const rootSchema = new Schema({
  letters:           { type: String, required: true, unique: true, trim: true },  // "ك-ت-ب"
  lettersArray:      { type: [String], validate: v => v.length === 3 },           // ["ك","ت","ب"]
  transliteration:   { type: String, required: true, trim: true },                // "k-t-b"
  coreMeaning: {
    fr: { type: String, required: true, trim: true, maxlength: 200 },
    en: { type: String, required: true, trim: true, maxlength: 200 },
    ar: { type: String, trim: true, maxlength: 200 }
  },
  semanticField: { type: String, required: true,
    enum: ['knowledge','action','place','emotion','movement','time','social','nature','body','spiritual'] },
  frequency:    { type: Number, default: 0, min: 0 },
  difficulty:   { type: Number, default: 3, min: 1, max: 5 },
  isEssential:  { type: Boolean, default: false },
  isQuranic:    { type: Boolean, default: false },
  wordsCount:   { type: Number, default: 0, min: 0 },  // dénormalisé
  metadata: {
    quranOccurrences: { type: Number, default: 0, min: 0 },
    msaFrequencyRank: { type: Number, default: null }
  },
  createdBy: { type: ObjectId, ref: 'User', default: null }
}, { timestamps: true });

rootSchema.pre('save', function () {
  if (this.isModified('letters')) {
    this.letters = normalizeArabic(this.letters);
    this.lettersArray = this.letters.split('-').map(normalizeArabic);
  }
});

rootSchema.virtual('words', { ref: 'Word', localField: '_id', foreignField: 'root' });
```

### `models/Word.js`

```js
const wordSchema = new Schema({
  arabicWord:               { type: String, required: true, trim: true },           // "كِتَاب"
  arabicWordUnvocalized:    { type: String, required: true, trim: true, index: true }, // "كتاب"
  transliteration:          { type: String, required: true, trim: true },           // "kitāb"
  transliterationSimplified:{ type: String, required: true, trim: true, index: true }, // "kitab"
  translations: {
    fr: { type: String, required: true, trim: true, maxlength: 300 },
    en: { type: String, required: true, trim: true, maxlength: 300 },
    ar: { type: String, trim: true, maxlength: 300 }
  },
  root:    { type: ObjectId, ref: 'Root', required: true, index: true },
  pattern: { type: String, required: true, trim: true },                            // wazn
  patternDescription: {
    fr: { type: String, maxlength: 300 },
    en: { type: String, maxlength: 300 },
    ar: { type: String, maxlength: 300 }
  },
  grammaticalCategory: { type: String, required: true,
    enum: ['verb','noun','adjective','place','agent','instrument','verbal_noun','participle'] },
  examples: [{
    sentence:            { type: String, required: true, maxlength: 500 },
    sentenceUnvocalized: { type: String, required: true, maxlength: 500 },
    translation: {
      fr: { type: String, required: true, maxlength: 500 },
      en: { type: String, required: true, maxlength: 500 },
      ar: { type: String, maxlength: 500 }
    }
  }],
  difficulty: { type: Number, default: 3, min: 1, max: 5 },
  isCommon:   { type: Boolean, default: false }
}, { timestamps: true });

wordSchema.pre('save', function () {
  if (this.isModified('arabicWord')) this.arabicWord = nfc(this.arabicWord);
  if (this.isModified('arabicWordUnvocalized')) this.arabicWordUnvocalized = normalizeArabic(this.arabicWordUnvocalized);
  this.examples.forEach(ex => {
    if (ex.sentence)            ex.sentence            = nfc(ex.sentence);
    if (ex.sentenceUnvocalized) ex.sentenceUnvocalized = normalizeArabic(ex.sentenceUnvocalized);
  });
});

// Hooks pour wordsCount dénormalisé
wordSchema.post('save',   async function () { await mongoose.model('Root').updateOne({ _id: this.root }, { $inc: { wordsCount:  1 } }); });
wordSchema.post('deleteOne', { document: true, query: false }, async function () {
  await mongoose.model('Root').updateOne({ _id: this.root }, { $inc: { wordsCount: -1 } });
});
```

### `models/Progress.js`

```js
const progressSchema = new Schema({
  user:          { type: ObjectId, ref: 'User', required: true },
  root:          { type: ObjectId, ref: 'Root', required: true },
  masteryLevel:  { type: Number, default: 0, min: 0, max: 5 },
  wordsLearned:  [{ type: ObjectId, ref: 'Word' }],
  reviewCount:   { type: Number, default: 0, min: 0 },
  successCount:  { type: Number, default: 0, min: 0 },
  failureCount:  { type: Number, default: 0, min: 0 },
  lastReviewed:  { type: Date, default: null },
  nextReviewDate:{ type: Date, default: () => new Date() },
  intervalDays:  { type: Number, default: 0, min: 0 },
  easinessFactor:{ type: Number, default: 2.5, min: 1.3 },
  notes:         { type: String, maxlength: 500, default: '' }
}, { timestamps: true });

progressSchema.virtual('successRate').get(function () {
  return this.reviewCount === 0 ? 0 : Math.round((this.successCount / this.reviewCount) * 100);
});

progressSchema.set('toJSON', { virtuals: true });
```

### `models/Note.js`

```js
const noteSchema = new Schema({
  user:       { type: ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['Root','Word'], required: true },
  target:     { type: ObjectId, refPath: 'targetType', required: true },
  content:    { type: String, required: true, trim: true, maxlength: 1000 },
  type:       { type: String, enum: ['mnemonic','context','cultural','grammar','general'], default: 'general' },
  isPublic:   { type: Boolean, default: false },
  likes:      [{ type: ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

// Validation async cible existante (anti-orphelines)
noteSchema.pre('validate', async function () {
  const Model = mongoose.model(this.targetType);
  const exists = await Model.exists({ _id: this.target });
  if (!exists) this.invalidate('target', `Target ${this.targetType} introuvable`);
});
```

### `models/Collection.js`

```js
const collectionSchema = new Schema({
  user:        { type: ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true, maxlength: 100 },
  slug:        { type: String, required: true, trim: true, lowercase: true },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  roots:       [{ type: ObjectId, ref: 'Root' }],
  isPublic:    { type: Boolean, default: false },
  coverColor:  { type: String, match: /^#[0-9a-fA-F]{6}$/, default: '#4F46E5' },
  icon:        { type: String, default: '📚' },
  followers:   [{ type: ObjectId, ref: 'User' }]
}, { timestamps: true });

collectionSchema.pre('validate', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = `${slugify(this.name)}-${nanoid(6)}`;
  }
});
```

---

## 3. Liste exhaustive des indexes

| Modèle | Index | Type | Justification |
|---|---|---|---|
| User | `{ email: 1 }` unique, collation `{locale:'en',strength:2}` | MUST | login, anti-doublon casse + anti-énumération |
| User | `{ username: 1 }` unique, collation `{locale:'en',strength:2}` | MUST | profil public, anti-doublon |
| Root | `{ letters: 1 }` unique | MUST | lookup `/roots/:letters`, anti-doublon NFC |
| Root | `{ lettersArray: 1 }` multikey | NICE | filtre `{ $all: ["ك","ت"] }` (racines contenant lettres) |
| Root | `{ isEssential: 1, frequency: -1 }` | NICE | `/roots?isEssential=true` trié fréquence |
| Root | `{ semanticField: 1, difficulty: 1 }` | NICE | filtres Explore par champ sémantique |
| Word | `{ root: 1 }` | MUST | FK lookup massif (RootTree, Progress.wordsLearned) |
| Word | `{ arabicWordUnvocalized: 1 }` | MUST | recherche préfixe `/^كت/` |
| Word | `{ transliterationSimplified: 1 }` | MUST | recherche ASCII tolérante |
| Word | text composé `arabicWordUnvocalized + transliteration + transliterationSimplified + translations.fr/en/ar`, `default_language:'none'` | MUST | `/search?q=...` |
| Word | `{ isCommon: 1, difficulty: 1 }` | NICE | listing mots fréquents par difficulté |
| Progress | `{ user: 1, root: 1 }` unique | MUST | upsert SM-2, anti-doublon |
| Progress | `{ user: 1, nextReviewDate: 1 }` | MUST | `/progress/today` (requête SRS quotidienne — la + chaude) |
| Progress | `{ user: 1, masteryLevel: 1 }` | NICE | Dashboard stats par niveau |
| Note | `{ user: 1, createdAt: -1 }` | MUST | "mes notes" paginées |
| Note | `{ targetType: 1, target: 1 }` | MUST | notes attachées à une Root/Word |
| Note | `{ isPublic: 1, likesCount: -1, createdAt: -1 }` | NICE | feed community |
| Collection | `{ user: 1, createdAt: -1 }` | MUST | "mes collections" |
| Collection | `{ slug: 1 }` unique | MUST | URL publique `/c/:slug` |
| Collection | `{ isPublic: 1, createdAt: -1 }` | NICE | feed community |

Tous centralisés dans `server/src/models/indexes.js` (review obligatoire).

---

## 4. Pre-save hooks / virtuals

- **User.pre('save')** : NFC + lowercase email ; bcrypt password (rounds env) si modifié.
- **User.toJSON** : strip `password`, `tokenVersion`, `__v`.
- **User.methods.comparePassword(plain)** : `bcrypt.compare`.
- **Root.pre('save')** : `normalizeArabic(letters)` + régénération `lettersArray`.
- **Root.virtual('words')** : populate inverse via `localField: '_id'`.
- **Word.pre('save')** : NFC `arabicWord`, normalize `arabicWordUnvocalized`, idem sur chaque `examples[]`.
- **Word.post('save'/'deleteOne')** : `$inc Root.wordsCount`.
- **Progress.virtual('successRate')** : `successCount / reviewCount` arrondi pour cent.
- **Note.pre('validate')** : check existence cible (`Root` ou `Word`) — bloque orphelines.
- **Collection.pre('validate')** : génère `slug` kebab-case + nanoid(6) si absent.

---

## 5. Helpers partagés (`shared/normalizeArabic.js`)

```js
// Workspace npm `shared/`, consommé par script seed + models pre-save + services/search
const TASHKIL = /[ً-ٰٟـ]/g; // fatha, kasra, damma, sukun, tashdid, tatweel
const nfc = (s) => s.normalize('NFC');

function normalizeArabic(str = '') {
  return nfc(String(str)).replace(TASHKIL, '').trim();
}

// Variantes optionnelles (recherche tolérante) — non appliquées au stockage
function loosenHamza(str) {
  return str.replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
}

module.exports = { nfc, normalizeArabic, loosenHamza };
```

`transliterationSimplified` : généré au seed via table DIN→ASCII (`ā→a, ī→i, ū→u, ḥ→h, …`), idempotent et testé en CI. Pas de pre-save (évite re-calcul à chaque update).

---

## 6. Stratégie de migration / ensureIndexes

- **Dev/local** : `mongoose.set('autoIndex', true)` → indexes créés au boot, immédiat.
- **Production (Render)** : `mongoose.set('autoIndex', false)`. Script dédié `npm run db:indexes` qui boucle sur les modèles et appelle `Model.syncIndexes()` (drop + recreate au besoin). Appelé en **postdeploy hook** par DevOps (#07).
- **Migrations** : scripts numérotés `scripts/migrations/NNN_xxx.js` + collection `_migrations { name, appliedAt }`. Idempotents. CLI `npm run migrate`.
- **Seed** : `npm run seed` (idempotent `findOneAndUpdate(upsert)`) ; flag `--reset` refusé en prod (`NODE_ENV` check).
- **Reconcile** : `scripts/reconcileCounters.js` cron nocturne — recalcule `Root.wordsCount`, `Note.likesCount`, `User.totalRootsLearned/totalWordsLearned`. Filet contre dérive sous écritures concurrentes.
- **Backup** : `mongodump` mensuel manuel S8 (`dataset-v1.0` tag).

---

## Réponses aux questions résiduelles R2

- **Transactions MongoDB** : OUI (replica set Atlas), utilisées sur `Note.like` (transaction `$addToSet likes` + `$inc likesCount`) et `register` (création User + Progress vides initiaux).
- **`transliterationSimplified`** : généré côté **script seed** (Data Engineer #09), pas pre-save — diffs JSON stables.
- **`ensureIndexes`** : boot en dev, script `npm run db:indexes` en prod (DevOps #07).
- **Champs `.ar` si drop S6** : gardés au schéma vides — zéro migration future.
- **`lettersArray` double-écriture (seed + pre-save)** : acceptée — source unique de logique = helper `normalizeArabic`, hook reste filet de sécurité.
