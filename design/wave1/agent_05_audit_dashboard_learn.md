# Audit Dashboard & Learn — agent_05

## Findings (15)

**1. [HIGH] Contrat API rating ↔ success rompu**
`client/src/api/progressApi.ts:4-7` envoie `{ rootId, rating: 'failed'|'hard'|'good'|'perfect' }`. `server/src/services/progressService.js:33` destructure `{ rootId, success, wordsLearned }` (boolean). Conséquence : `success` est `undefined` → toujours branche `else` (échec, masteryLevel-- min 0, intervalDays=1). **Toute review optimale est comptée comme échec.**
_Fix_ : côté server, mapper `rating` (failed→success=false ; hard/good/perfect→true).

**2. [HIGH] Contrat stats Dashboard ↔ API divergent**
`DashboardPage.tsx:44-65` lit `stats.data.totalRootsLearned`, `totalWordsMastered`, `streak`, `activeDays`, `weeklyActivity`. `progressService.stats()` ne retourne **que** `totalRootsStudied`, `levels`, `reviews`. → Tous les `StatCard` afficheront `undefined`/0 et `WeeklyBars` crashera.
_Fix_ : étendre `stats()` server (computeStreak, agréger weeklyActivity sur 7 derniers jours).

**3. [HIGH] WeeklyBars crash si data manquante**
`DashboardPage.tsx:74,136-137` : aucune garde — `data.reduce` lève si `weeklyActivity` est undefined.
_Fix_ : `data = data ?? []` + early-return empty state.

**4. [HIGH] SM-2 ne respecte pas le timezone utilisateur**
`progressService.js:28-29` calcule `nextReviewDate` en UTC pur. `User.timezone` jamais utilisé. Un user à UTC+1 voit ses cards "dues" 1h trop tard.
_Fix_ : aligner sur minuit dans la TZ user (date-fns-tz).

**5. [HIGH] Streak counter — feature missing côté server**
`User.js:51` déclare `streak`, mais `recordReview` ne l'incrémente **jamais**. Pas de calcul activeDays non plus.
_Fix_ : implémenter `updateStreak(user, now)` après `recordReview`.

**6. [MEDIUM] Stats levels 0-5 affichés nulle part**
`progressService.js:120-123` produit `levels` mais `DashboardPage` ignore ce champ.
_Fix_ : ajouter section "Mastery distribution" avec barres/anneaux teintés.

**7. [MEDIUM] Animations compteurs absentes**
`StatCard` affiche valeurs statiques. Pas de count-up.
_Fix_ : `useMotionValue` + `animate(0 → value, 600ms)`.

**8. [MEDIUM] Empty state Dashboard manquant**
Si `totalRootsLearned===0` ET `rootsToReview===[]` : header + 4 StatCards à zéro, sans CTA.
_Fix_ : early `EmptyState` global si nouvel utilisateur.

**9. [MEDIUM] Refresh : pas de bouton, staleTime court**
`useProgress.ts:10,18` : 30s/60s.
_Fix_ : IconButton `RefreshCw` invoquant `refetch()`.

**10. [MEDIUM] Pas d'optimistic update sur recordReview**
`useProgress.ts:22-31` : seulement `invalidateQueries`. UX figée jusqu'au refetch.
_Fix_ : `onMutate` retire l'item courant de `['progress','today']`.

**11. [MEDIUM] Arabe sans tashkil sur flashcard**
`LearnPage.tsx:173-179` passe `current.root.letters` (consonnes nues) à `ArabicText`.
_Fix_ : afficher tashkil sur recto (e.g. `كَتَبَ`) si dispo dans le modèle Root.

**12. [MEDIUM] Feedback SM-2 invisible**
Après `handleRate` : aucun toast ni indicateur du nouveau masteryLevel/nextReviewDate.
_Fix_ : afficher mini-toast "Niveau 3 → revoir dans 7j" + gérer `onError`.

**13. [LOW] Flip 3D incomplet (pas de perspective)**
`LearnPage.tsx:160-190` anime `rotateY` mais pas de `perspective`.
_Fix_ : wrapper `style={{ perspective: 1000 }}`.

**14. [LOW] Progress bar incrémentation flottante**
`LearnPage.tsx:154` : saute de 0.5 sur flip. Préférer incrément à la validation.

**15. [LOW] Erreur réseau Learn — message générique**
`LearnPage.tsx:76-86` : pas d'info sur 401 vs 500.

## Positive

- Hooks TanStack Query propres, invalidation correcte (modulo #10).
- Confetti à la fin de session (`LearnPage.tsx:60-67`).
- 4 niveaux de rating SM-2 ; couleurs amber/warning/success/gold cohérentes.
- Empty states "all caught up" présents.
- AnimatePresence mode="wait" évite chevauchement de cartes.

## Recommendation

**REQUEST CHANGES** — Trois HIGH bloquants : (1) contrat rating/success casse SM-2, (2) contrat stats divergent, (3) WeeklyBars crashera. Streak/timezone missing.

## Synthèse

Désalignement de contrat client/server casse SM-2 en production : toute review = échec. WeeklyBars crash si stats.weeklyActivity undefined. Streak déclaré mais jamais incrémenté côté server. À traiter en priorité Wave 2.
