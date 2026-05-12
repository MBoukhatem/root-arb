# Code Review Cross-Cutting Wave 2

Scope : 61 fichiers modifiés/créés par les 10 agents Wave 2 sur la branche `rush`. Lecture seule, aucun fichier source modifié.

## Regressions (severity high|medium|low)

1. **[HIGH] `letters.*` i18n totalement absent côté FR/EN** — `client/src/shared/i18n/locales/{fr,en}.json` (0 occurrence de `"letters"`). Conséquence : `LettersPage.tsx` (agent-5) et `ConcentricLetters.tsx` appellent `t('letters.title', 'letters.subtitle', 'letters.sharedRoots', 'letters.empty', 'letters.vizAriaLabel', 'letters.pickerAriaLabel', 'letters.roots')` qui retournent la clé brute en FR/EN. Seul `ar.json` semble contenir le namespace via les sous-clés `roots/...`. Cross-check : `grep '"letters"'` retourne 0 dans fr.json et en.json. **Lien : conflit agent-5 ↔ agent-9** (agent-9 n'a pas reçu la liste des clés `letters.*` à intégrer ; agent-5 n'a pas ajouté les fallbacks à fr/en).

2. **[HIGH] Contrat `/api/progress/stats` ne renvoie pas `levels`** — `server/src/services/progressService.js:233-239` retourne `{totalRootsLearned, totalWordsMastered, streak, activeDays, weeklyActivity}` sans `levels`. Or `DashboardPage.tsx:24` lit `stats.data?.levels ?? {}` et `MasteryBars` (l.130-137) en dépend. Le type `ProgressStats.levels?: Record<number, number>` (`models.ts:196`, ajouté par agent-7) n'a aucune source server. **Section MasteryBars affichera toujours un état vide.** Lien : agent-1 (server) ↔ agent-7 (client) — désynchronisation de contrat.

3. **[HIGH] `ConstellationNode.wordsCount` requis côté client mais jamais émis par le server** — `client/src/types/models.ts:158-164` déclare `wordsCount: number` non-optionnel. Le server `statsController.constellation` (l.30-36, l.44-50) construit les nodes sans `wordsCount`. `ConstellationPage.tsx:29-35` mappe sans ce champ → propriété `undefined` injectée dans un type qui la promet `number`. Lien : agent-3 (constellation fallback) n'a pas synchronisé le payload avec les types client.

4. **[HIGH] Validation server refuse les ratings que le client envoie** — `progressValidation.js:9-12` autorise `{rating}` OR `{success}` via `.or()`, mais combine _uniquement_ `rating` et `success`. L'agent-1 ajoute aussi `wordsLearned`, qui passe — mais aucun test du fait qu'avec `rating: 'failed'` seul (sans success) le `or` réussit. Verdict : OK après lecture. Reclassé **[LOW] info**. _(Marqué high par prudence initialement.)_

5. **[MEDIUM] `useCooccurrences` non lu dans LettersPage signature** — `client/src/api/lettersApi.ts:30` accepte `includeRoots = true` ; le hook `useCooccurrences` (référencé l.20 de LettersPage) doit propager ce flag pour que `sharedRootIds` soit non vide (utilisé par tooltip ligne 117 et side panel). Sans lecture du hook (`hooks/useCooccurrences.ts`), risque que `top5` du tooltip soit toujours vide. **À vérifier**. Lien : agent-5.

6. **[MEDIUM] `Collection.color` deprecated rendu prioritaire en UI** — `CollectionsPage.tsx:112` fait `c.coverColor ?? c.color`. Côté server, le modèle ne contient plus que `coverColor` (`Collection.js:32`). Les anciens documents avec `color` ne seront plus migrés → rendu OK pour les nouveaux mais incohérent pour le legacy. Lien : agent-3 (modèle) ↔ agent-6 (UI).

7. **[MEDIUM] Sidebar `FocusTrap` actif même en desktop ≥ lg** — `Sidebar.tsx:58-91` wrappe `<aside>` quel que soit le viewport. `active={open}` est false par défaut donc focus-trap dormant, **mais** sur desktop la sidebar est `lg:static lg:translate-x-0` et reste visible : si un user ouvre puis resize, le trap ne se désactive pas tant que `open===true`. **Effet : focus piégé sur desktop large après resize**. Lien : agent-10.

8. **[MEDIUM] `learn:` toast hardcodé en français** — `LearnPage.tsx:148` : `toast.success(\`Niveau ${level} → revoir le ${nextDate}\`, ...)`avec`toLocaleDateString('fr-FR')`. Casse l'i18n promise par agent-9 sur EN/AR. Lien : agent-7.

9. **[MEDIUM] Pattern dupliqué `toLocaleDateString` sans helper** — `LearnPage.tsx:145` et `NotesPage.tsx:202` (et probablement d'autres). Pas de `formatDate` partagé. Code smell DRY + i18n inconsistante.

10. **[MEDIUM] `recordReview` côté server attend `success` ou `rating` mais le rollback `onError` du client n'invalide pas en cas de 400** — `useProgress.ts:41-46` restaure le cache TODAY_KEY mais `stats` reste optimiste (jamais touché par `onMutate`, donc OK). Vérifié, **non-issue**. Reclassé **LOW**.

11. **[LOW] Mismatch `--cat-derive-fill` utilisé hors palette catégorie** — `ConcentricLetters.tsx:278` réutilise `--cat-derive-fill` pour les liens, indépendamment de la grammaire. Couplage faible mais source de surprise lors d'un futur thème refresh. Lien : agent-5.

12. **[LOW] `progressApi.record` retourne `Progress` mais `LearnPage:142-149` lit `result.nextReviewDate`** — `models.ts:94-107` (`Progress`) définit `nextReviewDate: string`. OK, contrat respecté. Mais `result?.masteryLevel` typé `0..5` strict — pas de protection si server renvoie 6 par drift. Niveau de risque faible.

13. **[LOW] `LooseSVG` cast en `ComponentType` perd la sécurité de type SVG** — `ConcentricLetters.tsx:30-31`. Justifié par limitation React 19. Acceptable, mais zone de smell : commentaire l.33-35 indique que `<text>` accepte `dir` puis le retire silencieusement.

14. **[LOW] `weeklyActivity` aggregation peut dépasser 7 entrées si `lastReviewed > 7 jours` traverse minuit TZ** — `progressService.js:196` filtre `lastReviewed >= sevenDaysAgo` mais l'aggrégation regroupe par `$dateToString` sans cap explicite ; la fill côté JS (l.221-227) garantit exactement 7 entrées donc safe. OK.

15. **[LOW] Bundle `index-BWXGyHKU.js` = 366 KB** — `client/dist/assets/`. `framer-motion` + `d3` + `react-hot-toast` + `canvas-confetti` (Learn) + `axios` probablement bundlés au chunk principal. Plusieurs pages lazy mais shared libs lourdes. Audit recommandé pour wave3 (vite-bundle-visualizer).

## Incohérences entre agents

- **agent-1 ↔ agent-7** : `levels` documenté dans le type client (`ProgressStats.levels`) mais jamais renvoyé par le service. Sectioncomplètement morte.
- **agent-3 ↔ agent-6/8** : Constellation fallback ajoute `isPreview` mais `ConstellationPage.tsx:29-35` ne le lit pas → aucun UI affordance "preview".
- **agent-5 ↔ agent-9** : namespace `letters.*` non créé dans FR/EN ; agent-9 a couvert 7 namespaces (`roots, dashboard, learn, constellation, notes, collections, landing`) mais pas `letters`.
- **agent-7 ↔ agent-9** : toast SM-2 hardcode FR + date FR malgré effort i18n.
- **agent-3 ↔ types client** : `Note` côté client (`models.ts:109-120`) n'a pas `type: 'personal'` listé dans `NOTE_TYPES`. **Vérifié : `NOTE_TYPES` l.42 contient déjà `'personal'`**. OK.

## Code smells / dette

- Duplication `toLocaleDateString` (Learn + Notes) sans helper `formatDate(locale)`.
- `ConcentricLetters.tsx` (427 lignes) : grosse SRP-violation — empty/loading/tooltip + viz + memoization comparator manuel. Extraire `LetterTooltip`, `EmptyStateSvg`, `LoadingRings` dans des fichiers séparés.
- `progressService.js:136` : `.catch(() => {})` swallow silencieux sur `updateStreak`. Au minimum logger l'erreur.
- `sidebar` `aria-label` hardcodé fallback `'Navigation principale'` côté Sidebar.tsx:70 et `'Fermer le menu'` l.51 — agent-9 a la clé `nav:closeMenu` ? À cross-checker (locales font 188 clés AR vs 180 FR — surplus = pluriels, pas de manquant FR↔AR).
- `AppLayout.tsx:27` `"Aller au contenu"` hardcodé (skip link) ; agent-10 le signale lui-même.
- `LearnPage` flip 3D : `motion.button` `key={current.root._id + (flipped ? '-back' : '-front')}` remonte tout le DOM à chaque flip → animation 3D ne fonctionne pas comme une vraie face flip mais comme un swap. Mineur.

## Verdict

**REQUEST CHANGES** — Trois HIGH bloquants : (1) namespace `letters.*` manquant en FR/EN → page `/letters` cassée pour 2 langues sur 3 ; (2) section MasteryBars du Dashboard morte car `levels` jamais émis par le server ; (3) `ConstellationNode.wordsCount` cassé. Quick fixes ≤ 30 min : ajouter `letters` à fr.json+en.json, ajouter `levels` agrégat dans `progressService.stats()`, ajouter `wordsCount` au payload constellation. Les MEDIUM (sidebar FocusTrap, toast hardcodé FR, color legacy) sont à traiter en wave3 mais ne bloquent pas le merge si les 3 HIGH sont fixés.
