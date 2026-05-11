# Agent #09 — Data Engineer (linguistique) — Round 2

## 1. Réponses aux autres agents

**À DB Designer (#03)** — Convergence totale sur NFC + `default_language: 'none'` + helper `normalizeArabic()`. Je m'engage à appliquer NFC, génération `lettersArray` et `arabicWordUnvocalized` (strip tashkîl `[ً-ْٰ]`) **dans le script d'import en amont**, avant les pre-save hooks Mongoose, pour que les diffs Git du JSON soient stables ; le hook reste un filet de sécurité. Je fournirai fixtures de test avec cas piégeux (variantes hamza `أ/إ/آ/ا`, alif maksura vs ya, ligatures). `wordsCount` dénormalisé OK : calculé au seed + script `reconcileCounters.js` réutilisable.

**À Backend (#01)** — Seeder **script Node standalone** (`node scripts/seed.js`), pas de route admin. Raisons : (1) Security — pas d'endpoint qui touche massivement la DB ; (2) exécutable en CI et au `postdeploy` Render ; (3) flag `--reset` rejeté si `NODE_ENV=production`. FK orpheline → **abort complet** (fail fast). Migrations futures via scripts `migrations/NNN_xxx.js` séparés.

**À i18n (#08)** — **Validé.** J'ajoute `.ar` sur `coreMeaning`, `translations`, `patternDescription`, `examples[].translation`. Coût marginal faible car le curateur arabophone rédige l'AR simultanément au FR/EN. Template Sheets élargi. Fallback API `ar → en → fr` documenté.

**À Tech Lead (#10)** — **OK sur 12 racines impeccables**, je propose **15** (12 core garanties + 3 buffer `j-l-s, n-ẓ-r, +1`) pour donner du grain à la Constellation sans risque. 30 superficielles : refusé, suicidaire pour la crédibilité. Dataset dans repo principal confirmé. Correcteur freelance : réseau d'abord (~0 €), budget 150-300 € en fallback.

**À Security (#06)** — Seed admin **via variables d'env** (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, ou `SEED_ADMIN_PASSWORD_HASH` accepté en CI). Jamais interactif (non-scriptable). Vérif force du password (min 12 chars + complexité) avant insert. `bcryptjs` rounds=12. Upsert sur email pour idempotence.

## 2. Désaccords

- **Tech Lead, "GPT-4 pour brouillon traductions"** : risque d'erreurs subtiles invisibles à un non-arabophone. J'accepte GPT comme accélérateur **FR/EN uniquement**, jamais pour l'arabe (vocalisation, racines), et toujours avec validation humaine native.
- **DB Designer, Atlas Search post-MVP** : pour 450 mots, index text Mongo + normalisation requête suffit largement. Atlas Search/Meilisearch en backlog explicite, à ne pas évoquer en démo (over-engineering perçu).

## 3. Convergences fortes

1. **NFC obligatoire partout** — helper `normalizeArabic()` partagé dans `shared/` (cf. DevOps #07).
2. **`arabicWordUnvocalized` calculé au seed**, jamais à la volée.
3. **Index text `default_language: 'none'`** (stemmer Mongo ne connaît pas l'arabe).
4. **Dataset versionné Git**, JSON lisible, diffs reviewables.
5. **Validation dataset en CI bloquante** (gate dur sur merge).
6. **Seed admin via env vars** (Security, DevOps, moi).
7. **Qualité > quantité** : 12-15 racines parfaites.

## 4. Ajustements de ma fiche R1

- **Volume revu à la hausse** : triple FR/EN/AR sur 4 champs (cf. i18n). Estimation curation : **+30%**, **7-9 j-p** au lieu de 5-7.
- **Dataset cible révisé** : 15 racines (12 core + 3 buffer) au lieu de 30.
- **Helper `normalizeArabic()` dans `shared/`** (workspace npm), source unique partagée backend/script.
- **Pipeline Python supprimé** : surdimensionné pour 15 racines, remplacé par **script Node unique** (`scripts/data/extractQuranicCorpus.js`) parsant le morphology XML — cohérent monorepo.
- **Colonnes `validated_by` + `validated_at`** ajoutées dans Sheets pour traçabilité fact-checking.
- **`seed:demo` devient `seed`** : 15 racines = dataset officiel, plus de variante.

## 5. Questions résiduelles

- **À i18n (#08)** : la référence coranique (`"Coran 2:31"`) reste brute, libellé "Coran/Quran/القرآن" via clé i18n côté front ?
- **À DB Designer (#03)** : `lettersArray` généré au seed **et** revalidé par pre-save Root — double-écriture acceptable ou source unique à trancher ?
- **À Tech Lead (#10)** : budget correcteur freelance validé si réseau insuffisant ? Décision avant fin S1, sinon glissement S3.
- **À Backend (#01)** : logs du seed en JSON structuré (pino) ou console lisible ? Flag `--json-logs` pour CI ?
