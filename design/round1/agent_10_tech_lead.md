# Agent #10 — Tech Lead / Project Manager

## 1. MUST vs NICE — Décisions de scope

Le planning original est **ambitieux mais faisable** si on coupe agressivement le NICE. Verdict cru : pour 1 dev solo + soutenance, viser 70% du brief en qualité premium plutôt que 100% bâclé.

| # | Décision | Catégorie |
|---|----------|-----------|
| 1 | Auth JWT + CRUD Roots/Words + RootTree D3 + Progress (SRS) + Constellation + Notes CRUD + i18n FR/EN + Dark mode + Déploiement | **MUST (non négociable, conformité cahier des charges)** |
| 2 | Collections CRUD (compte comme 3e ressource CRUD pour le barème) | **MUST** |
| 3 | 15-20 racines très qualitatives au seed (vs 30-50 superficielles) | **MUST** — qualité > quantité pour la démo |
| 4 | Page Community (notes/collections publiques + likes) | **NICE — drop si retard S6** |
| 5 | Locale AR + RTL complet | **NICE — drop si retard S6**, garder FR+EN seulement |
| 6 | Upload avatar (multer) | **NICE — drop sans regret** |
| 7 | CalligraphyAnimated (SVG paths) sur 10 mots | **NICE — drop si retard S3**, mais c'est un wow important |
| 8 | Tests unitaires backend Jest | **NICE — drop**, manuel via Postman suffit pour la soutenance |

## 2. Risques projet majeurs

| # | Risque | Probabilité | Impact | Mitigation |
|---|--------|-------------|--------|------------|
| R1 | **Cold start Render free tier (~30s)** → démo cassée en direct devant le jury | Haute | Critique | Réveiller l'instance 5 min avant la soutenance via cron-job.org (ping toutes les 10min le jour J) + avoir une vidéo de backup enregistrée + screenshots clés |
| R2 | **Courbe D3.js radial + force-directed** : 1 semaine peut ne pas suffire | Haute | Élevé | Démarrer un POC D3 en S1 le soir (1h/j de R&D parallèle), s'appuyer sur exemples Observable, fallback layout `d3.tree()` simple si `cluster radial` foire |
| R3 | **Préparation dataset (10-20 racines × ~10 mots × traductions × wazn)** : 3-4j sous-estimés | Haute | Élevé | Démarrer en S1 en background, GPT-4 pour brouillon des traductions + vérification manuelle, accepter dataset partiel (wazn pas tous remplis) |
| R4 | **Combo S6 dark + i18n + RTL + responsive mobile** = overload | Moyenne | Moyen | Anticiper dark mode dès S1 (CSS vars d'entrée), RTL = drop AR si retard, mobile = focus uniquement sur Explore + RootTree + Learn |
| R5 | **MongoDB Atlas free tier (512MB)** saturé ou throttlé | Faible | Moyen | 20 racines = ~50KB, aucun risque réel. Backup : seed JSON local + Mongo Compass pour démo offline si Atlas down |

**Plan B démo cassée** : vidéo screencast 3min enregistrée en S8 + version locale lancée sur le laptop en miroir.

## 3. Questions aux autres agents

- **Agent #1 (Backend)** : Tu confirmes que le SRS (algo répétition espacée) tient en 1 fichier `utils/spacedRepetition.js` < 100 lignes ? Pas besoin d'un cron job ?
- **Agent #2 (Frontend)** : RTL avec Tailwind = `dir="rtl"` + plugin officiel ou config custom ? Combien d'heures estimées ?
- **Agent #3 (Database)** : Index Mongo nécessaires dès S2 ou OK de différer en S5 quand le volume monte ?
- **Agent #4 (UX/UI)** : Dark mode = palette dupliquée ou via CSS vars uniquement ? Préférable de figer le design system en S1.
- **Agent #5 (D3)** : Faisable de livrer RootTree fonctionnel en 5 jours sans expérience D3 préalable ? Quel layout fallback si radial foire ?
- **Agent #6 (Animation/Framer)** : Quelles 3 animations "wow" sont prioritaires si on doit couper ?
- **Agent #7 (Data/Linguiste)** : Combien d'heures réelles pour préparer 1 racine complète (mots + wazn + traductions + SVG path) ?
- **Agent #8 (SRS/Pédagogie)** : Algo SM-2 simplifié suffit pour la démo ou besoin du vrai SM-2 ?
- **Agent #9 (DevOps)** : Render free vs Railway/Fly.io ? Ping cron pour éviter cold start = légal et fiable ?

## 4. Plan révisé semaine par semaine

| Semaine | Plan initial | Ajustement |
|---------|--------------|------------|
| **S1** | Setup + Auth | **+ POC D3 le soir + démarrage seed (3 racines)** |
| **S2** | CRUD + Data (10 racines) | OK, mais **15 racines en fin S2** pour avoir matière en S3 |
| **S3** | RootTree D3 | **Buffer +2j** : décaler S3 à 9j si nécessaire, c'est LE wow factor |
| **S4** | Progression + SRS | OK. Si retard S3, **drop CalligraphyAnimated** ici |
| **S5** | Constellation + Filtres + Notes/Collections | Lourd. **Notes CRUD à déplacer en S2-S3** (moins de pression S5) |
| **S6** | Polish UX (dark + i18n + RTL) | **Drop AR/RTL si retard cumulé** ≥ 3j. Dark mode déjà préparé S1. |
| **S7** | Sociales + Tests | **Buffer principal** : si retard, drop Community/Likes/Profile public. Sinon, bug bash intensif. |
| **S8** | Déploiement + Démo | **Déploiement dès lundi S8** (pas vendredi), ping cron actif, vidéo backup mercredi, slides jeudi, répétition vendredi. |

**Rituels solo** : revue perso vendredi 17h (15min, état checklist + dette technique notée dans `TODO.md`), commit conventionnel, branches feature, PR self-review avant merge `main`. Dette technique acceptée : pas de tests auto, pas de Storybook, pas de Swagger (Postman collection suffit).

**Qualité minimale dataset démo** : **12 racines impeccables** (ك-ت-ب, ع-ل-م, د-ر-س, ف-ع-ل, ق-ر-أ, س-م-ع, ر-أ-ي, ذ-ه-ب, أ-ك-ل, ش-ر-ب, ج-ل-س, ن-ظ-ر) avec 8-12 mots chacune > 30 racines incomplètes. Le jury voit la profondeur d'1 arbre, pas le compteur global.
