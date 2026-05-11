# Agent #10 — Tech Lead / PM — Round 2 (synthèse)

Rôle : arbitrer les désaccords inter-agents, verrouiller le scope MUST, réajuster le planning 8 semaines à la lumière des risques remontés. Décisions tranchées, pas de consensus mou.

---

## 1. Arbitrages des désaccords inter-agents

**A1 — Naming `server/client` vs `backend-arb/frontend-arb`** (Backend #1 dit "garder", DevOps #7 dit "renommer").
**Tranche TL : RENOMMER en S1 J1**, comme #7 le propose. Coût `git mv` = 30 min, gain = cohérence totale avec brief, scripts npm racine, doc, soutenance. L'argument "casse l'historique" de #1 est faible (`git mv` préserve le blame). À faire avant tout autre travail S1.

**A2 — TypeScript vs JavaScript côté frontend** (Frontend #2 : "garder TS", brief : JS).
**Tranche TL : on garde TypeScript.** Le scaffold est déjà en TS, repartir en JS = 1 jour perdu pour zéro gain pédagogique. Justification documentée dans la PR de bootstrap et le README. Le cahier des charges n'interdit pas TS.

**A3 — JWT localStorage vs httpOnly cookie** (Security #6 P0-1 : cookie obligatoire ; Backend #1 implicite localStorage ; DevOps #7 demande arbitrage).
**Tranche TL : COMPROMIS — localStorage + CSP stricte + JWT court (1h) + refresh token httpOnly.** Le full-cookie httpOnly impose `credentials: true`, complexifie CORS Vercel preview, et fait perdre 2-3 jours. Pour un projet école, localStorage + CSP nonce + access 1h + refresh 7j en cookie httpOnly est un équilibre acceptable. **bcrypt 12 rounds confirmé** (vs 10 du brief). Argon2id = NICE-drop.

**A4 — Atlas IP `0.0.0.0/0` vs IP statique payante** (DevOps #7 assume open, Security #6 silencieux mais P0 implicite).
**Tranche TL : `0.0.0.0/0` assumé**, défense au niveau credentials (32 chars random) + user Mongo restreint à `readWrite` sur 1 DB + `JWT_SECRET` 64 bytes. Documenter la dette dans README sécurité. Pas 5$/mois pour un projet école.

**A5 — Drop AR/RTL si retard vs i18n dès S1** (Tech Lead R1 #10 : "drop AR si retard S6" ; i18n #8 : "scaffolder dès S1, erreur stratégique sinon").
**Tranche TL : i18n RAISON — scaffold dès S1**, mais **3 langues = MUST, RTL = MUST minimal (dir + logical properties), AR contenu = NICE**. L'infrastructure i18next + `<ArabicText>` + logical properties Tailwind est cheap dès le départ. Ce qui peut sauter en S6 : la curation des contenus AR (`coreMeaning.ar`, `translations.ar`) — fallback `ar → en` accepté. Le RTL chrome (header, sidebar) doit fonctionner.

**A6 — Pattern React/D3 : full-JSX vs hybride** (D3 #5 propose hybride avec exception Constellation ; Frontend #2 propose "React owns DOM, D3 owns math").
**Tranche TL : accord total** — JSX pour RootTree (≤15 nodes), impératif `d3.select` pour Constellation (force-sim 60fps). Hook `useD3` mutualisé. Pas de débat.

**A7 — Pagination cursor vs offset** (Database #3 : cursor par défaut ; Backend #1 : helper offset standard).
**Tranche TL : offset/skip pour MVP**, cursor uniquement sur `/notes` et `/words/search` si volume devient un problème (>5k docs). Pour 12-20 racines × 15 mots × N users, offset suffit largement. La complexité cursor n'est pas justifiée à cette échelle. Dette documentée.

**A8 — Curation dataset 3-4j (brief) vs 5-7j (Data Engineer #9)**.
**Tranche TL : 7 jours étalés S1-S3 en background**, **12 racines démo qualitatives** (alignement avec R1 TL) + **20 racines totales si temps**. Budget correcteur arabophone : 200€ si aucun membre natif accessible (à valider avec le user en R3). Pipeline Python + Sheets validé.

**A9 — `Progress.successRate` stocké vs virtual** (DB #3 : virtual ; brief : stocké).
**Tranche TL : virtual**, source de désynchro garantie sinon. Idem `User.timezone` à ajouter dès v1 (sinon streaks faux).

---

## 2. Risques projet ré-évalués (top 5)

| # | Risque | Probabilité | Impact | Mitigation consolidée |
|---|--------|-------------|--------|----------------------|
| R1 | **Cold start Render free** (~30-50s) en démo soutenance | Haute | Critique | UptimeRobot 5min + warm-up 30min avant + vidéo screencast backup + démo locale miroir |
| R2 | **Curation dataset arabe sous-estimée** (5-7j réels vs 3-4j brief) | Haute | Élevé | Démarrer S1, pipeline Python+Sheets, 12 racines impeccables prioritaires, fact-check natif obligatoire |
| R3 | **Courbe D3 radial + force-directed** + intégration React 19 StrictMode | Haute | Élevé | POC D3 dès S1 soir (1h/j), buffer S3 +2j, fallback `d3.tree()` vertical, hook `useD3` mutualisé |
| R4 | **XSS stocké via notes/collections publiques** (Security P0-2) | Moyenne | Critique | DOMPurify backend ET frontend, allowlist markdown, Joi longueur stricte, jamais `dangerouslySetInnerHTML` brut |
| R5 | **Overload S6** (dark + i18n complet + RTL + responsive mobile + Community) | Haute | Moyen | i18n scaffold S1, dark CSS vars S1, drop Community si retard, mobile = focus Explore + RootTree + Learn uniquement |

Sorti du top 5 (vs R1) : Atlas 512MB saturé (faux risque, 20 racines = 50KB) ; déplacé hors top.

---

## 3. Scope MUST consolidé (verrouillé)

**Non-négociable (conformité cahier des charges + soutenance) :**
1. Auth JWT (access 1h + refresh 7j httpOnly), bcrypt 12, `password: select: false`
2. CRUD Roots + CRUD Words + CRUD Collections (3 ressources pour le barème) + CRUD Notes
3. RootTree D3 radial (15 nodes) avec zoom/pan + responsive
4. Constellation D3 force-directed (POC 100 nodes minimum)
5. Progression SRS (SM-2 simplifié, service `Progress`, virtual `successRate`)
6. Dataset **12 racines impeccables** × 8-12 mots vocalisés/translittérés/traduits FR/EN
7. i18n FR + EN (infrastructure + chrome 100%), **AR partiel = chrome RTL OK, contenus AR = NICE**
8. Dark mode (CSS vars dès S1)
9. Déploiement Render + Vercel + Atlas + page `/credits` (conformité licences)
10. Sécurité minimale : CSP stricte, sanitization XSS, rate-limit étendu (login/register/forgot), `User.timezone`

**NICE — droppable sans regret :**
- Community feed / likes / profils publics
- Contenus AR complets (`coreMeaning.ar`, `translations.ar`)
- Upload avatar Cloudinary
- CalligraphyAnimated SVG paths (sauf si S3 dans les temps : garder 5 mots)
- Tests unitaires Jest (Postman collection suffit)
- Storybook + axe-core CI bloquant (manuel suffit)
- PatternVisualizer D3 dédié

---

## 4. Ajustements au planning

| S | Plan révisé R2 |
|---|---|
| **S1** | DevOps J1 : rename `server/`/`client/`. Backend : scaffold + auth tranche verticale. Frontend : bootstrap TS + 3 contextes + i18next + design tokens + dark CSS vars. Data Engineer : pipeline Python + Sheets, 3 racines. POC D3 soir. |
| **S2** | CRUD Roots/Words/Notes (Notes remontés ici, pas S5). Index Mongo critiques posés. Dataset → 8 racines fin S2. |
| **S3** | RootTree D3 + buffer +2j. Si retard : fallback vertical. CRUD Collections. Dataset → 12 racines. |
| **S4** | SRS service + LearningSession + Dashboard stats. Fact-check arabophone livré. |
| **S5** | Constellation D3 + filtres + Search. POC à 100/300 nodes mesuré. |
| **S6** | Polish : dark complet, RTL audit, responsive mobile (focus Explore/RootTree/Learn). **Drop Community si retard ≥ 3j cumulés.** |
| **S7** | Buffer principal : sécurité hardening (CSP nonce D3, DOMPurify, audit log), bug bash, Postman collection finale. |
| **S8** | **Déploiement lundi J1** (pas vendredi) : Atlas → Render → Vercel J1-J3. Smoke tests J4. Vidéo backup + slides + répétition J5. UptimeRobot armé. |

**Verdict 8 semaines** : tenable **uniquement si AR-contenu droppé** et Community droppable. Buffer S7 = filet réel. Sans ces deux drops, 9 semaines nécessaires.

---

## 5. Questions résiduelles pour Round 3

1. **Budget correcteur arabophone (~200€)** disponible ? Sinon, l'utilisateur (ou un proche) peut-il fact-checker les 12 racines démo ?
2. **Refresh token** : implémentation S1 (tranche auth) ou différée S7 ? Impact 1 jour.
3. **Community page** : on confirme la drop préventive dès maintenant, ou on tente et on drop en S6 si retard ?
4. **Branche `develop` staging** : utile ou on reste mono-branche `main` jusqu'à S7 ?
5. **CSP nonce pour D3** : DevOps confirme la faisabilité Helmet + Vercel/Render sans casser les styles dynamiques ?
6. **`shared/` workspace** : contiendra-t-il du code exécutable (validation helpers Joi partagés) ou juste des enums/strings ?
7. **Tag dataset `dataset-v1.0`** + backup `mongodump` : qui le porte, Data Engineer ou DevOps ? (Je tranche pour Data Engineer en S3, DevOps en S8 pour le dump prod.)
8. **Audit a11y** : axe-core CI bloquant (i18n #8) ou audit manuel suffit (TL pragmatique) ? Je penche manuel + 1 passe Lighthouse S7.
