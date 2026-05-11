# Agent #09 — Data Engineer (linguistique arabe) — Round 3 FINAL

## 1. Décisions finales verrouillées

- **15 racines impeccables** (12 core + 3 buffer) × **10 mots** vocalisés = **150 mots**, triplés FR/EN/AR sur 4 champs.
- **Sources autorisées** : Quranic Arabic Corpus (CC), Wiktionary AR (CC BY-SA 3.0), Lane's Lexicon (domaine public). **Hans Wehr exclu de l'import** (copyright Otto Harrassowitz) — usage uniquement comme référence de vérification humaine.
- **Translittération DIN 31635** + `transliterationSimplified` ASCII généré au seed.
- **NFC** systématique via `shared/normalizeArabic.js`, appliqué au seed en amont (diffs Git stables) ; pre-save Mongoose = filet.
- **Seeder Node standalone** (`scripts/seed.js`), idempotent (upsert), `--reset` refusé en `NODE_ENV=production`, FK orpheline = abort.
- **Pipeline Node unique** (Python supprimé), monorepo cohérent.
- **Dataset versionné Git** sous `data/`, tag `dataset-v1.0` au seed initial. Page `/credits` obligatoire.

## 2. Les 15 racines retenues

| # | Racine | DIN | Champ sémantique | Statut |
|---|--------|-----|-------------------|--------|
| 1 | ك-ت-ب | k-t-b | écrire / livre / scribe | core |
| 2 | ع-ل-م | ʿ-l-m | savoir / science / monde | core |
| 3 | ق-ر-أ | q-r-ʾ | lire / Coran / récitation | core |
| 4 | د-ر-س | d-r-s | étudier / leçon / école | core |
| 5 | ف-ه-م | f-h-m | comprendre / compréhension | core |
| 6 | ق-و-ل | q-w-l | dire / parole | core |
| 7 | س-م-ع | s-m-ʿ | entendre / ouïe | core |
| 8 | ك-ل-م | k-l-m | parler / mot / discours | core |
| 9 | م-ش-ي | m-š-y | marcher / démarche | core |
| 10 | ح-ب-ب | ḥ-b-b | aimer / amour | core |
| 11 | ك-س-ب | k-s-b | gagner / acquérir | core |
| 12 | ر-ج-ع | r-j-ʿ | revenir / retour | core |
| 13 | ج-ل-س | j-l-s | s'asseoir / séance | buffer |
| 14 | ن-ظ-ر | n-ẓ-r | regarder / vue | buffer |
| 15 | ف-ت-ح | f-t-ḥ | ouvrir / conquête | buffer |

## 3. Schéma JSON exact

**`data/roots.json`** :
```json
[{
  "letters": "ك-ت-ب",
  "lettersArray": ["ك","ت","ب"],
  "transliteration": "k-t-b",
  "coreMeaning": { "fr": "écrire", "en": "to write", "ar": "الكتابة" },
  "semanticField": { "fr": "écriture, savoir", "en": "writing, knowledge", "ar": "الكتابة والتدوين" },
  "isEssential": true,
  "frequency": 319,
  "quranOccurrences": 319,
  "source": "quranic-corpus"
}]
```

**`data/words.json`** :
```json
[{
  "rootLetters": "ك-ت-ب",
  "arabicWord": "كِتَاب",
  "arabicWordUnvocalized": "كتاب",
  "transliteration": "kitāb",
  "transliterationSimplified": "kitab",
  "translations": { "fr": "livre", "en": "book", "ar": "كتاب" },
  "pattern": "فِعَال",
  "patternDescription": { "fr": "nom concret", "en": "concrete noun", "ar": "اسم" },
  "category": "noun",
  "examples": [{
    "arabic": "قَرَأْتُ الكِتَابَ",
    "translation": { "fr": "j'ai lu le livre", "en": "I read the book", "ar": "قرأت الكتاب" },
    "reference": "Coran 2:31"
  }],
  "difficulty": "beginner",
  "isCommon": true,
  "source": "quranic-corpus",
  "validatedBy": "curator_a",
  "validatedAt": "2026-05-20"
}]
```

## 4. Pipeline d'import

1. **Extraction** — `node scripts/data/extractQuranicCorpus.js` parse le morphology XML → CSV brut `data/raw/`.
2. **Curation Sheets** — template partagé, curateur arabophone vocalise, traduit FR/EN/AR, exemples, `validatedBy/At`.
3. **Export JSON** — `sheetToJson.js` via API Sheets → `roots.json` + `words.json` normalisés NFC.
4. **Validation Joi** — `validateDataset.js` (cf. §6), exit non-zéro bloquant.
5. **Seed DB** — `seed.js` upsert Roots, résout `rootLetters → ObjectId` (Map mémoire), upsert Words, recompute `wordsCount`.
6. **Tag Git** — `dataset-v1.0` + commit `data: seed v1.0`.

## 5. Helper `normalizeArabic` (spec)

`shared/normalizeArabic.js` — workspace npm, source unique (seed + pre-save + `/search`).
- `normalizeArabic(s)` : `s.normalize('NFC')`, supprime tatweel `ـ`, trim.
- `stripTashkil(s)` : retire `[ً-ْٰ]` → `arabicWordUnvocalized`.
- `toLettersArray(letters)` : split `-` + NFC.
- `simplifyTransliteration(din)` : mapping `ʿ→`, `ā→a`, `š→sh`, `ḥ→h`, `ṣ→s`, `ẓ→z`…
- Tests Jest : variantes hamza `أ/إ/آ/ا`, `ى` vs `ي`, ligatures.

## 6. CI `validate:dataset` (règles bloquantes)

GitHub Actions sur PR touchant `data/**` :
- **Joi strict** : champs requis, types, énums (catégorie, difficulté).
- **FK** : chaque `words[].rootLetters` existe dans `roots.json`.
- **Vocalisation** : 100 % `arabicWord` matchent `/[ً-ْ]/`.
- **NFC** : `s === s.normalize('NFC')` partout.
- **DIN regex** : alphabet `[a-zāīūʿʾḥṣḍṭẓšǧṯḏġ-]+` non vide.
- **Triples FR/EN/AR** : 4 champs non vides.
- **Couverture** : 15 roots, ≥10 words/root.
- **Unicité** : `(rootLetters, arabicWord)`.
Rapport JSON + gate dur sur merge `main`.

## 7. Plan d'exécution S1-S3

**S1 J1-J2** — init pipeline, template Sheets, extraction Quranic Corpus, helper `normalizeArabic` + tests Jest.
**S1 J3-J4** — curation racines 1-3 (k-t-b, ʿ-l-m, q-r-ʾ) × 10 mots.
**S1 J5** — `validateDataset.js` armé en CI, premier seed local OK.
**S2 J1-J3** — racines 4-8 (d-r-s, f-h-m, q-w-l, s-m-ʿ, k-l-m). Fin S2 : 8×10.
**S2 J4-J5** — racines 9-12 (m-š-y, ḥ-b-b, k-s-b, r-j-ʿ). 12 core complètes.
**S3 J1-J2** — racines buffer 13-15 (j-l-s, n-ẓ-r, f-t-ḥ). 150 mots.
**S3 J3-J4** — fact-checking arabophone, corrections itérées.
**S3 J5** — `git tag dataset-v1.0`, page `/credits`, dump backup, livraison Tech Lead.

## 8. Budget & ressources

- **Curateur arabophone interne (réseau)** : 0 €, ~5 j-p étalés S1-S3 — priorité.
- **Fallback freelance Malt/Upwork** : ~200 € pour 1,5 j fact-checking (validé Tech Lead A8/R2). Décision fin S1.
- **Outils** : Sheets, Quranic Corpus, GitHub Actions — gratuits.
- **Charge Data Engineer** : 7-9 j-p sur 3 semaines (extraction + curation + scripts + validation + tag + credits).
