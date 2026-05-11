# Agent #09 — Data Engineer (linguistique arabe)

> Rôle : concevoir le pipeline de préparation du dataset seed (30+ racines × 10-15 mots), garantir qualité linguistique, licences, idempotence et démo-readiness.

---

## 1. Stratégie data

1. **Sources prioritaires, hiérarchisées par licence** :
   - **Quranic Arabic Corpus** (corpus.quran.com) — licence GNU GPL / Creative Commons : source primaire pour les racines, fréquences coraniques (`quranOccurrences`), exemples vocalisés. **Citation obligatoire** dans le footer + page `/credits`.
   - **Wiktionary arabe** (CC BY-SA 3.0) — source secondaire pour mots dérivés, schémas (wazn), translittérations. Attribution + share-alike respectée.
   - **Lane's Lexicon** (domaine public, ~1863) — fallback académique fiable, libre de droits.
   - **Hans Wehr** : **à NE PAS scraper directement** (copyright Otto Harrassowitz Verlag, encore actif). Utilisable uniquement comme référence de vérification humaine (« fair use » d'érudition), pas comme source d'import.

2. **Pipeline d'extraction hybride (semi-automatique)** :
   - Phase 1 : script Python (`scripts/data/build_seed.py`) qui parse le morphology XML du Quranic Corpus → produit un CSV brut `roots_raw.csv` + `words_raw.csv`.
   - Phase 2 : import dans **Google Sheets partagé** (template prêt) → curation manuelle par un arabophone (vérif vocalisation, traductions FR/EN, exemples).
   - Phase 3 : export Sheets → `roots.json` / `words.json` via script `sheet_to_json.py` (avec validation Joi-compatible).

3. **Normalisation Unicode stricte (NFC)** appliquée à chaque chaîne arabe :
   - Hamza : unifier `أ إ آ ا` selon position (préserver la forme orthographique dans `arabicWord`, mais normaliser `arabicWordUnvocalized` en supprimant hamza non-initial).
   - Alif maksura `ى` vs ya `ي` : conserver la forme correcte, ne pas confondre.
   - Tatweel `ـ` : supprimer.
   - Diacritiques (harakat) : présents dans `arabicWord`, retirés dans `arabicWordUnvocalized` (regex `[ً-ْٰ]`).

4. **Translittération standardisée DIN 31635** (norme académique allemande, utilisée par Hans Wehr et la majorité des publications arabisantes) — plus rigoureuse qu'une translittération ASCII naïve. Ex: `ʿ-l-m`, `kitāb`, `ḥubb`. Stockée telle quelle ; fallback ASCII simplifié possible en frontend pour recherche.

5. **Clé étrangère textuelle puis résolution à l'import** : `words.json` référence `rootLetters: "ك-ت-ب"` (lisible humainement, éditable en Sheets). Le seeder résout `rootLetters → ObjectId` au moment de l'insertion (Map en mémoire après seed des Roots). Évite de coder en dur des ObjectIds dans le JSON versionné.

6. **Idempotence du seed** : utiliser `Root.findOneAndUpdate({ letters }, doc, { upsert: true })` plutôt qu'`insertMany`. Pour les Words, clé composite `{ root, arabicWord }` unique. Re-run sans duplication garanti. Flag CLI `--reset` pour wipe explicite en dev uniquement (refusé si `NODE_ENV=production`).

7. **Seed admin user** séparé (`seedAdmin.js`) : variables d'env (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`) — jamais en dur dans le repo. Création conditionnelle (upsert sur email).

8. **Validation pré-import** (`scripts/validate_dataset.js`) :
   - Chaque Word a un `rootLetters` qui existe dans `roots.json` (FK orpheline = erreur bloquante).
   - Chaque Root a au moins 5 mots (sinon warning).
   - Vocalisation présente sur 100 % des `arabicWord` (regex doit matcher au moins un harakat).
   - Translittération non vide, traductions FR + EN non vides.
   - Rapport JSON + exit code non-zéro si erreur → bloquant en CI.

9. **Dataset démo de soutenance** : `seed:demo` produit un sous-ensemble curé de 10 racines parfaites (k-t-b, ʿ-l-m, q-r-ʾ, d-r-s, f-h-m, q-w-l, s-m-ʿ, k-l-m, m-š-y, ḥ-b-b) avec 12-15 mots chacune et exemples vérifiés. Évite le risque qu'un mot bancal ne soit montré au jury.

10. **Versioning & backup** : `data/` versionné dans Git (JSON lisible, diffs reviewables). Export quotidien de Mongo en prod via `mongodump` + upload S3/Drive. Tag Git `dataset-v1.0` au moment du seed initial pour pouvoir restaurer.

---

## 2. Risques

1. **Copyright Hans Wehr** : risque juridique réel si on extrait massivement la 4e édition. **Mitigation** : utiliser uniquement Quranic Corpus + Wiktionary + Lane's Lexicon comme sources d'import. Hans Wehr reste une référence de vérification humaine, non une source de données copiées.

2. **Qualité linguistique** : une vocalisation incorrecte ou une mauvaise translittération sera repérée immédiatement par n'importe quel arabophone du jury, ce qui détruit la crédibilité. **Mitigation** : fact-checking obligatoire par un locuteur natif (idéalement un agent de l'équipe ou un proche arabophone), au minimum sur le dataset démo de 10 racines.

3. **Temps sous-estimé** : le brief dit « 3-4 jours », c'est optimiste pour 450 mots vocalisés + traduits FR/EN + exemples. Estimation réaliste : **5-7 jours-personne**. **Mitigation** : démarrer la curation Sheets en parallèle du dev backend dès semaine 1, ne pas attendre.

4. **Hétérogénéité translittération** : si différents contributeurs Sheets utilisent des conventions différentes (ʿ vs `, ā vs aa, š vs sh), le rendu sera incohérent. **Mitigation** : guide de style 1 page + validation regex.

5. **Risque d'exemples non-libres de droits** : phrases d'exemple copiées d'une source copyrightée. **Mitigation** : exemples soit du Coran (domaine public), soit rédigés originalement par le curateur arabophone.

---

## 3. Questions aux autres agents

**À DB Designer (#03)** :
- Faut-il un index `text` MongoDB sur `arabicWordUnvocalized` + `transliteration` pour la recherche, ou regex suffit pour un volume de 450 mots ?
- `lettersArray: ["ك","ت","ب"]` est-il utile en plus de `letters: "ك-ت-ب"` ou redondant ? Je penche pour le garder (recherche par lettre individuelle).
- Faut-il dénormaliser `wordsCount` sur Root pour éviter un `countDocuments` à chaque listing ?

**À Backend Architect (#01)** :
- Le seeder doit-il être un script Node standalone (`node scripts/seed.js`) ou une route admin protégée (POST `/api/admin/seed`) ? Je recommande standalone (sécurité + CI).
- Quel comportement attendu si un Word référence un `rootLetters` introuvable au moment du seed : skip + warning, ou abort complet ? Je préconise abort (fail fast).
- Gestion des migrations futures : si on ajoute un champ à Root après seed, un script de migration séparé ou ré-exécution idempotente du seed ?

**À Tech Lead (#10)** :
- Le dataset JSON doit-il être versionné dans le repo principal (lisibilité, diffs Git) ou dans un repo data séparé / submodule ? Je penche pour le repo principal (simplicité monorepo).
- Budget pour un correcteur arabophone freelance (1-2 jours, ~150-300 €) si aucun membre de l'équipe n'est natif ?
- Faut-il bloquer le merge si `validate_dataset.js` échoue en CI ? Recommandé : oui, gate dur.

**À Frontend Architect (#02)** :
- Besoin de `transliterationSimplified` (ASCII, sans diacritiques) en plus de la version DIN 31635, pour la recherche utilisateur tolérante ? Ex: `kitab` matche `kitāb`.

---

## 4. Recommandations actionnables

1. **Semaine 1 J1-J2** : initialiser le pipeline — script Python d'extraction Quranic Corpus + template Google Sheets partagé (colonnes : `rootLetters | arabicWord | unvocalized | transliteration_DIN | fr | en | pattern | category | example_ar | example_fr | example_en | difficulty | isCommon | source | validated_by`).

2. **Semaine 1 J3-J5** : curation Sheets en parallèle du dev backend. Priorité aux 10 racines du dataset démo (qualité maximale).

3. **Semaine 2** : intégration `seedRoots.js` + `seedWords.js` idempotents, script de validation, intégration en CI (GitHub Actions : `npm run validate:dataset`).

4. **Semaine 3** : fact-checking arabophone sur les 10 racines démo + 20 racines restantes.

5. **Page `/credits` obligatoire** dans le frontend listant sources (Quranic Corpus, Wiktionary, Lane's Lexicon) avec liens et licences. Couvre la conformité légale et donne du sérieux au projet devant le jury.

6. **Convention de commit dataset** : `data: add root k-t-b with 12 words` pour tracer les évolutions du dataset distinctement du code.

7. **Backup avant démo** : 24 h avant la soutenance, dump Mongo + snapshot Git tagué `demo-final`. Restauration testée.
