# Agent #10 — Tech Lead / PM — Round 3 (Fiche maîtresse de pilotage)

Document de référence unique pour piloter ArabicWordRoot jusqu'à la soutenance. Toute décision contraire devra explicitement amender cette fiche.

---

## 1. Scope MVP verrouillé (MUST non négociables)

Critères testables — chaque item doit être démontrable en démo. Aucun n'est droppable sans amendement formel.

1. **Auth** : `POST /api/auth/register|login|logout`, JWT Bearer access 24h + `tokenVersion` (Int) sur `User` pour révocation. bcrypt 12, `password: { select: false, minlength: 8 }`, email/username uniques en collation `{ locale:'en', strength:2 }`. Refresh httpOnly path-scopé `/api/auth/refresh` (NICE-1 si retard S1).
2. **CRUD complet × 4 ressources** : `Roots`, `Words`, `Collections`, `Notes`. Validation Joi route + Mongoose dernière défense. Sanitization `sanitize-html` backend sur tout user-content.
3. **RootTree D3 radial** : `<RootTree>` JSX-pur sur `d3.hierarchy()` + `d3.tree().size([2π, r])`, ≤15 nodes/racine, zoom/pan, responsive (vertical `<sm`), tooltip vocalisé/translittéré/traduit, a11y `role="treeitem"` + flèches clavier.
4. **Constellation D3 force-directed** : ≥100 nodes fluides à 60fps, filtre `semanticField`, panneau de détail (drawer mobile / latéral desktop), `source`/`target` en strings d'id.
5. **Progression SRS** : service pur `services/srsService.js` (SM-2 simplifié), `Progress { user, root, nextReviewDate, easinessFactor, interval, repetitions, successCount, reviewCount }`, virtual `successRate`. Endpoint `/api/progress/today`. Dashboard stats (streaks corrects via `User.timezone` IANA).
6. **Dataset démo** : **15 racines impeccables** (12 core + 3 buffer) × 8-12 mots, vocalisation complète, translittération DIN 31635 + `transliterationSimplified` ASCII, traductions FR/EN obligatoires, AR best-effort, fact-check arabophone livré avant S5.
7. **i18n FR + EN 100%** + **chrome AR + RTL technique 100%** (logical properties Tailwind, `<ArabicText>`, `useDirection()`, `<DirectionalIcon>`, `LanguageSelector` permanent en header). Contenus AR `coreMeaning.ar`/`translations.ar` = best-effort.
8. **Dark mode** via CSS vars (`design-tokens.json` source unique), figé S1.
9. **Sécurité MUST** : Helmet + CSP stricte (`script-src 'self'`, sans `unsafe-eval`), rate-limit étendu (login 5/15min, register 3/h/IP, forgot 3/h/email, global 100/min, write 20-30/min), `adminMiddleware` relit role en DB, gitleaks pre-commit, no upload SVG.
10. **Déploiement** : Atlas M0 + Render free (server) + Vercel (client) + page `/credits` (licences dataset Quranic Corpus, polices Amiri/Noto, libs). UptimeRobot/cron-job.org sur `/api/health` (ping 10min jour J).

---

## 2. NICE features (priorités de drop)

**Priorité 1 — droppable sans regret, à drop préventivement si retard ≥ 2j cumulés à S4** :
- Page Community (feed public, likes, profils publics)
- Upload avatar Cloudinary (drop = aussi tout le scope sécurité multer)
- Storybook + Sentry
- Tests unitaires Jest (Postman collection suffit pour le barème CRUD)

**Priorité 2 — droppable si retard ≥ 3j à S6** :
- Contenus AR complets (`coreMeaning.ar`, `translations.ar`, `examples[].translation.ar`) — fallback `ar → en → fr` documenté
- Refresh tokens httpOnly avec rotation (garder `tokenVersion` + access 24h suffit MVP)
- CSP nonces D3 (CSP stricte sans nonces acceptable)
- Route `/dev/i18n-preview` admin
- PatternVisualizer D3 dédié

**Priorité 3 — à garder si possible (wow factor / qualité perçue)** :
- CalligraphyAnimated SVG paths sur 5-10 mots
- Mode "lite" `prefers-reduced-motion` exhaustif
- Lighthouse mobile > 85 sur Constellation 300 nodes
- Audit a11y axe-core CI bloquant (manuel + 1 passe Lighthouse S7 si CI infaisable)

---

## 3. Risques Top 5 (mitigation actée + déclencheurs)

| # | Risque | P × I | Mitigation actée | Déclencheur d'alerte |
|---|--------|-------|------------------|----------------------|
| R1 | **Cold start Render** ~30-50s en démo soutenance | H × Critique | cron-job.org ping `/api/health` 10min, actif J-1 ; vidéo screencast 3min S8 J3 ; laptop local en miroir avec Atlas backup | Latence p95 `/api/health` > 5s en répétition S8 J5 → activation backup vidéo |
| R2 | **Dataset arabe sous-estimé** (7-9 j-p vs 3-4j brief) | H × Élevé | Démarrage S1, pipeline Node `scripts/data/extractQuranicCorpus.js` + Sheets, 15 racines (12 core + 3 buffer), fact-check natif obligatoire avant S5, budget 150-300€ correcteur si réseau insuffisant | < 8 racines validées fin S2 → drop préventif contenus AR + recentrage 12 racines core |
| R3 | **Courbe D3 radial + force-directed** + React 19 StrictMode | H × Élevé | POC `spike/d3-roottree` S1 soir (1h/j × 5j), buffer S3 +2j contracté, fallback `d3.tree()` vertical, hook `useD3` mutualisé sur Constellation/Calligraphy | POC S1 non concluant fin S1 → fallback vertical activé, pas de tentative radial S3 |
| R4 | **XSS stocké via notes/collections publiques** (Security P0-2) | M × Critique | `sanitize-html` backend allowlist stricte, `react-markdown` + `rehype-sanitize` frontend, CSP stricte, JWT 24h max (réduit fenêtre exfiltration), `queryClient.clear()` au logout | Toute review PR Notes/Collections sans test XSS → blocage merge |
| R5 | **Overload S6** (dark + i18n complet + RTL + responsive mobile + Community) | H × Moyen | i18n scaffold S1 (RTL technique livré), dark CSS vars S1, mobile = focus Explore/RootTree/Learn (Dashboard/Collections desktop-only acceptable), drop Community préventif à S4 si P1 déclenchée | Retard cumulé ≥ 3j à fin S5 → drop Community + contenus AR confirmé |

Sorti du top 5 (vs R1) : Atlas 512MB saturé (faux risque, 15 racines × ~3KB ≈ 50KB).

---

## 4. Planning 8 semaines définitif

| S | Livrables | Critère de fin de semaine |
|---|-----------|----------------------------|
| **S1** | DevOps J1 : rename `server/`/`client/`, env Joi, CI lint+build+gitleaks, Husky. Backend : auth tranche verticale (register/login/me/logout, `tokenVersion`, rate-limit). Frontend : bootstrap TS, `AuthContext`/`ThemeContext`/`LanguageContext`, i18next FR/EN/AR (stubs), design tokens, dark CSS vars, `<ArabicText>`, `useDirection()`. Data : pipeline + 3 racines. D3 : POC `spike/d3-roottree`. | `POST /api/auth/login` retourne JWT ; `/login` UI fonctionnelle FR/EN/AR (chrome) ; CI verte ; POC D3 commit. |
| **S2** | CRUD `Roots`, `Words`, `Notes` (remontés ici). Index Mongo MUST posés (`text`, `Word.root`, `User.email/username` collation). Dataset → 8 racines. Page Explore liste + filtres. | 3 ressources CRUD testées Postman ; Explore liste 8 racines ; index `text` opérationnel. |
| **S3** | RootTree D3 radial JSX-pur + buffer +2j contracté (fallback vertical prêt). CRUD `Collections`. Dataset → 12 racines core. | RootTree affiche `ك-ت-ب` avec ≥10 dérivés, zoom/pan/tooltip OK, responsive `<sm` vertical. |
| **S4** | SRS service + `LearningSession` + Dashboard stats + `User.timezone`. Fact-check arabophone livré. **Go/No-Go drop préventif P1 (Community/avatar/Storybook)**. | `/api/progress/today` retourne les racines dues ; session de 10 cartes complète ; streaks justes par fuseau. |
| **S5** | Constellation D3 force-directed + filtres `semanticField` + Search (`text` + `transliterationSimplified` regex préfixe). Dataset → 15 racines (12 + 3 buffer). | Constellation 100+ nodes fluide ; recherche `kitab` → `كِتاب` ; panneau détail. |
| **S6** | Polish : dark complet, RTL audit, responsive mobile (Explore/RootTree/Learn). **Go/No-Go drop préventif P2 (contenus AR, refresh tokens, CSP nonces)**. | Audit RTL manuel passé ; mobile 375px utilisable ; dark sans contraste WCAG fail. |
| **S7** | Buffer principal : sécurité hardening (DOMPurify, CSP, audit log admin, SECURITY.md), bug bash, Postman collection finale, Lighthouse, page `/credits`. Branche `develop` ouverte. | 0 violation axe critique manuel ; Postman collection 100% verte ; `/credits` complet. |
| **S8** | **Lundi J1 déploiement** : Atlas → Render (`postdeploy: npm run seed`) → Vercel J1-J3. Smoke tests J4. Vidéo screencast backup + slides + répétition J5. cron-job.org armé. | URLs publiques up ; vidéo backup encodée ; 2 comptes test prêts ; soutenance répétée chrono. |

**Verdict** : 8 semaines tenable **uniquement si Community droppé préventivement à S4 et contenus AR best-effort à S6**. Sans ces drops → 9 semaines requises.

---

## 5. Chemin critique (non parallelisable)

```
S1 rename + auth + i18n scaffold + POC D3
        ↓
S2 seed 8 racines + CRUD Roots/Words/Notes + indexes
        ↓
S3 CRUD Collections + RootTree D3 (BUFFER +2j) ← point de bascule fallback
        ↓
S4 SRS service + Progress + fact-check arabophone
        ↓
S5 Constellation D3 + 15 racines complètes
        ↓
S6 Polish dark + RTL + mobile
        ↓
S7 Hardening sécurité + bug bash + buffer
        ↓
S8 Déploiement lundi + vidéo backup + répétition
```

Toute slip de S1-S2 propage 1-pour-1 sur S8. La seule absorption possible est le buffer S7. RootTree S3 est le point unique où le fallback `d3.tree()` linéaire sauve la séquence aval.

---

## 6. Budgets temps par chantier majeur (heures, 1 dev solo)

| Chantier | Estimation | Notes |
|----------|-----------|-------|
| Bootstrap + rename + CI + Husky + gitleaks | 16h | DevOps S1 J1-J2 |
| Auth complète (register, login, logout, refresh path-scopé, `tokenVersion`, rate-limit, sanitize) | 28h | S1 J3-J5 |
| i18n scaffold (3 contextes, i18next, namespaces FR/EN/AR stubs, `<ArabicText>`, RTL technique) | 12h | S1, marginal car coscaffold |
| Dataset 15 racines (curation, traduction, vocalisation, fact-check, normalisation) | 56h | 7 j-p étalé S1-S5, fact-check S4 |
| CRUD 4 ressources (Joi, controllers, services, indexes, sanitization) | 32h | S2 |
| RootTree D3 (POC + impl JSX + a11y + responsive + RTL) | 32h | POC S1 5h + S3 27h |
| Constellation D3 (force-sim, panneau, filtres, perf 60fps, cap Canvas 500) | 28h | S5 |
| SRS service + Progress + Dashboard | 20h | S4 |
| Polish UX (dark complet, RTL audit, mobile, a11y manuelle, design tokens) | 24h | S6 |
| Hardening sécurité + bug bash + Postman + Lighthouse | 28h | S7 buffer |
| Déploiement + smoke + vidéo + slides + répétition | 20h | S8 |
| **Total chantiers majeurs** | **≈ 296h** | ≈ 37j-p à 8h/jour |

Capacité 8 semaines × 5j × 8h = 320h. Marge ≈ 24h, absorbée par les buffers S3/S7 et les drops préventifs. **Tendu mais réaliste**.

---

## 7. Gouvernance

**Rituels solo** :
- **Vendredi 17h (15min)** : revue checklist hebdo, mise à jour `TODO.md`, dette technique notée, décision Go/No-Go drop préventif S4 et S6.
- **Lundi 9h (10min)** : kick-off semaine, top 3 livrables.
- **Quotidien (5min, vocal)** : énoncer l'objectif du jour à voix haute (rituel d'engagement solo).

**Re-priorisation déclenchée si** :
- Retard cumulé ≥ 2j à fin S2 → drop préventif P1 dès S3 (Community + avatar + Storybook).
- Retard cumulé ≥ 3j à fin S5 → drop P2 confirmé (contenus AR, refresh tokens, CSP nonces).
- POC D3 S1 non concluant → fallback `d3.tree()` vertical activé S3 sans tentative radial.

**Branches & PR** : mono `main` jusqu'à S7, `develop` ouverte S7. Commits conventionnels, self-review PR avant merge, jamais de push direct `main` sur S8.

**Documents vivants** : `TODO.md` (dette + risques actifs), `docs/security.md` (dette `0.0.0.0/0`, JWT localStorage), `docs/architecture.md` (décisions tranchées), `dataset-v1.0` tag fin S5.

---

## 8. Critères de succès soutenance (checklist démo)

**5 wow moments scriptés (ordre démo)** :
1. **Switch FR→EN→AR en live** dans le header → RTL bascule visible, polices arabes chargées, chrome miroir parfait.
2. **RootTree radial** sur `ع-ل-م` : zoom sur node "عالِم" → tooltip vocalisé + translittération + traduction FR/EN, navigation clavier flèches.
3. **Constellation force-directed** : 100+ racines colorées par champ sémantique, drag d'une racine, filtre `Verbe` → repli animé.
4. **Session SRS Learn** : 5 cartes consécutives, animation flip, succès/échec, recalcul `nextReviewDate` visible Dashboard.
5. **Dark mode toggle** : transition instantanée tous les composants, calligraphie dorée préservée (variants WCAG AA).

**Dataset démo prêt** : 12 racines core impeccablement fact-checkées, 3 buffer en filet. Aucune racine sans vocalisation ni traduction FR/EN.

**Vidéo backup** : screencast 3min enregistré S8 J3 (Loom ou OBS), couvrant les 5 wow moments, hébergé Drive + copie locale clé USB.

**Comptes test prêts** :
- `demo@arabicwordroot.app` / mot de passe communiqué slide : 15 racines marquées comme apprises, streaks 7 jours, Progress avec plusieurs niveaux de mastery.
- `jury@arabicwordroot.app` : compte vierge pour tester register → first session live.
- `admin@arabicwordroot.app` : démontrer `adminMiddleware` (relit role DB).

**Plan B démo cassée** :
- URL Render ne répond pas → laptop local lancé en miroir (Atlas reste source de vérité).
- Atlas down → seed JSON local + Mongo Compass.
- Réseau jury HS → vidéo backup déclenchée, narration en direct.

**Slides clés (10 max)** : problème → architecture → wow RootTree → wow Constellation → SRS pédagogique → stack → sécurité (dettes assumées) → i18n/a11y → roadmap post-MVP → questions.

**Répétition chronométrée S8 J5** : 1 passage complet dans le temps imparti (typiquement 15-20min démo + 10min Q&A), 1 passage avec vidéo backup, 1 passage "tout casse" pour entraîner les réflexes.

**Critère ultime** : si le jury arabophone (probable) ne voit aucune faute de vocalisation et que les 5 wow moments passent sans bug → succès. Le reste est négociable.
