# Rapport d'audit de sécurité — ToolMe (white-box)

**Type :** Audit white-box (analyse du code source)  
**Périmètre :** Backend (FastAPI), frontend (React/Vite), configuration, déploiement, scripts de test de sécurité  
**Date :** 11 février 2025  
**Contexte :** Application web « ToolMe » (projets, auth JWT, PostgreSQL).

---

## 1. Résumé exécutif

L'audit a identifié **plusieurs points à corriger** avant une mise en production, dont **deux à criticité élevée** (secret JWT par défaut, absence de SECRET_KEY dans Docker). Le reste du code montre de **bonnes bases** : requêtes paramétrées (ORM), contrôle d’accès sur les projets, hachage des mots de passe avec bcrypt, algorithme JWT fixé. Les recommandations ci-dessous permettent de durcir la configuration et de réduire les risques résiduels.

---

## 2. Périmètre et méthodologie

- **Périmètre technique :** code source du dépôt (backend `app/`, frontend `src/`, `docker-compose.yml`, `.env.example`, scripts dans `security/`).
- **Méthode :** lecture du code, recherche de patterns à risque (secrets, injection, auth, CORS, headers, stockage client, exposition d’APIs).
- **Non couvert :** infrastructure réelle (hébergeur, réseau, DNS), dépendances transitives (pas d’analyse SCA automatisée ici).

---

## 3. Synthèse des constats

| Gravité   | Nombre | Exemples |
|----------|--------|----------|
| Critique | 2      | SECRET_KEY par défaut en prod, SECRET_KEY non injecté dans Docker |
| Élevée   | 2      | Pas de rate limiting sur login/signup, JWT en localStorage (XSS) |
| Moyenne  | 4      | CORS figé, pas de CSP, mot de passe seed, schémas sans max_length |
| Faible   | 3      | Health check public, messages d’erreur auth, dépendances |

---

## 4. Détail des constats

### 4.1 Critique

#### C-1 — Secret JWT par défaut en production

**Fichier :** `backend/app/config.py`

```python
SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
```

Si la variable d’environnement `SECRET_KEY` n’est pas définie (oubli en prod), l’application utilise une clé connue. Un attaquant peut alors forger des JWTs valides et s’authentifier comme n’importe quel utilisateur.

**Recommandation :**  
- En production, refuser de démarrer si `SECRET_KEY` est absent ou égal à la valeur de dev.  
- Exemple : `if not os.getenv("SECRET_KEY") or os.getenv("SECRET_KEY") == "dev-secret-change-in-production": raise SystemExit("SECRET_KEY must be set in production")` au démarrage de l’app.

---

#### C-2 — SECRET_KEY non fourni au conteneur API

**Fichier :** `docker-compose.yml`

Le service `api` ne reçoit que `DATABASE_URL`. Aucune variable `SECRET_KEY` (ni `JWT_ALGORITHM`, etc.) n’est passée. En déploiement avec ce compose, l’API tournerait avec la clé par défaut (voir C-1).

**Recommandation :**  
- Documenter l’obligation de définir `SECRET_KEY` (et éventuellement `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`) pour le service `api`.  
- Dans `docker-compose.yml`, ajouter ces variables dans `environment` (en s’appuyant sur un fichier `.env` ou un secret manager), sans valeur par défaut sensible en prod.

---

### 4.2 Élevée

#### E-1 — Absence de rate limiting sur login et signup

**Fichiers :** `backend/app/routers/auth.py`, `backend/app/main.py`

Les endpoints `POST /auth/login` et `POST /auth/signup` ne sont pas limités en nombre de requêtes. Un attaquant peut tenter des attaques par force brute sur les mots de passe ou énumérer des comptes existants (par les messages d’erreur).

**Recommandation :**  
- Mettre en place un rate limiting (par IP et/ou par identifiant) sur `/auth/login` et `/auth/signup` (ex. slowapi, middleware FastAPI, ou reverse proxy).  
- Après un certain nombre d’échecs, temporiser ou bloquer temporairement (ex. 15 min après 5 échecs).

---

#### E-2 — JWT stocké dans localStorage

**Fichier :** `frontend/src/api/auth.ts`

Le token JWT est stocké dans `localStorage` (`getStoredToken`, `setStoredToken`). En cas de XSS, un script peut lire le token et l’exfiltrer, permettant une prise de session.

**Recommandation :**  
- Privilégier des cookies HTTP-only (Secure, SameSite) pour le token, gérés côté backend (cookie set après login).  
- Si le choix de localStorage est maintenu : renforcer la prévention XSS (CSP, pas de `dangerouslySetInnerHTML` sur des données utilisateur), et envisager des tokens à courte durée + refresh token en HTTP-only.

---

### 4.3 Moyenne

#### M-1 — CORS figé sur une seule origine

**Fichier :** `backend/app/main.py`

```python
allow_origins=["http://localhost:5173"],
```

En production, l’API doit accepter l’origine du frontend déployé. Une configuration figée sur localhost empêcherait le front en prod d’appeler l’API, ou inciterait à tout ouvrir (`["*"]`) avec `allow_credentials=True`, ce qui est dangereux.

**Recommandation :**  
- Lire la liste des origines autorisées depuis l’environnement (ex. `CORS_ORIGINS=https://app.toolme.example`) et refuser en prod une valeur trop permissive.

---

#### M-2 — Absence de Content-Security-Policy (CSP)

**Fichiers :** `frontend/index.html`, pas de headers CSP côté API pour les réponses du front.

Aucune CSP n’est définie. En cas d’injection de script (XSS), l’attaquant a plus de latitude pour exécuter du code et voler le token (cf. E-2).

**Recommandation :**  
- Ajouter un en-tête CSP stricte (ex. `default-src 'self'`, autorisation explicite des scripts/fonts si besoin).  
- Peut être fait côté serveur qui sert le front (reverse proxy) ou via meta tag (moins robuste que le header).

---

#### M-3 — Mot de passe par défaut du compte seed

**Fichiers :** `backend/app/seed.py`, `backend/app/main.py`

Un utilisateur seed est créé avec l’email `seed@toolme.local` et le mot de passe `seed-change-me`. Si ce compte reste actif en production avec ce mot de passe, il constitue une porte d’entrée.

**Recommandation :**  
- En production : ne pas créer ce compte seed, ou le créer avec un mot de passe fort généré/aléatoire et stocké de façon sécurisée (secret manager).  
- Ou désactiver / supprimer le seed en prod via une variable d’environnement (ex. `RUN_SEED=false`).

---

#### M-4 — Schémas Pydantic sans max_length sur les champs texte

**Fichier :** `backend/app/schemas/project.py`

Les champs `title`, `domain`, `short_description`, `full_description`, etc. n’ont pas de `max_length` dans les schémas Pydantic. La base limite (ex. `String(500)`) mais l’API acceptera des corps JSON très volumineux avant la couche DB, ce qui peut faciliter du DoS (mémoire, temps de traitement).

**Recommandation :**  
- Aligner les contraintes Pydantic sur le modèle (ex. `Field(..., max_length=500)` pour `title`) pour rejeter tôt les requêtes trop grandes.

---

### 4.4 Faible

#### F-1 — Health check et racine accessibles sans auth

**Fichiers :** `backend/app/main.py` — `GET /health`, `GET /`

Ces endpoints sont volontairement publics (santé, découverte). Aucun impact direct sur la sécurité, mais ils exposent la présence de l’API. En environnement sensible, on peut restreindre `/health` à une IP interne ou à un chemin moins évident (tout en gardant l’usage pour le load balancer).

**Recommandation :** Optionnel : limiter l’accès à `/health` au réseau interne ou au reverse proxy.

---

#### F-2 — Message d’erreur identique pour « email invalide » et « mot de passe invalide »

**Fichier :** `backend/app/routers/auth.py`

```python
detail="Invalid email or password",
```

C’est un bon choix pour ne pas révéler si l’email existe. On signale le point pour cohérence avec les bonnes pratiques (ne pas changer pour un message plus précis qui divulguerait l’existence du compte).

**Recommandation :** Aucune ; conserver ce message générique.

---

#### F-3 — Dépendances et vulnérabilités connues

**Fichiers :** `backend/pyproject.toml`, `frontend/package.json`

L’audit ne comporte pas d’analyse SCA (Software Composition Analysis). Des vulnérabilités connues peuvent exister dans les dépendances.

**Recommandation :**  
- Lancer régulièrement `uv audit` / `pip-audit` côté backend et `npm audit` côté frontend.  
- Intégrer ces commandes en CI et traiter les vulnérabilités critiques/hautes.

---

## 5. Points positifs relevés

- **Requêtes SQL :** utilisation systématique de l’ORM SQLAlchemy (requêtes paramétrées) ; pas de concaténation de chaînes pour les requêtes. Migrations avec `text()` sans entrée utilisateur.
- **Contrôle d’accès :** mise à jour et suppression de projets vérifiées par `user_id` ; pas d’IDOR sur les projets.
- **Mots de passe :** hachage bcrypt avec `gensalt()` ; pas de stockage en clair.
- **JWT :** algorithme fixé côté décode (`algorithms=[ALGORITHM]`) ; pas de risque « alg:none ».
- **Validation des entrées :** Pydantic pour les payloads (email, longueur min), format email cohérent backend/frontend.
- **CORS :** `allow_credentials=True` avec une origine explicite (localhost en dev), pas d’origine `*` avec credentials.
- **Frontend :** pas d’utilisation de `dangerouslySetInnerHTML` sur des données utilisateur ou API (hors éventuel point de test XSS en dev, à garder strictement limité au dev).

---

## 6. Scripts de test de sécurité (`security/`)

- Les scripts (gobuster SQLi, auth SQLi, XSS) sont conçus pour cibler des environnements locaux (localhost). Aucun secret n’est codé en dur.
- La documentation (`security/README.md`) précise un usage en dev/test uniquement.
- **Recommandation :** Si une réflexion volontaire pour tests XSS est réintroduite en dev (ex. `?q=` avec `dangerouslySetInnerHTML`), s’assurer qu’elle est bien conditionnée par `import.meta.env.DEV` (ou équivalent) pour ne jamais être présente en build de production.

---

## 7. Plan d’actions recommandé

| Priorité | Action |
|----------|--------|
| P0       | Imposer une `SECRET_KEY` en production (refus de démarrage si absente ou valeur de dev). |
| P0       | Documenter et configurer `SECRET_KEY` (et variables JWT) pour le service `api` dans Docker / déploiement. |
| P1       | Mettre en place un rate limiting sur `POST /auth/login` et `POST /auth/signup`. |
| P1       | Envisager le passage du JWT en cookie HTTP-only (ou durcir XSS + courte durée du token). |
| P2       | Rendre les origines CORS configurables et sécurisées pour la prod. |
| P2       | Ajouter une Content-Security-Policy sur le frontend. |
| P2       | Désactiver ou sécuriser le compte seed en production. |
| P2       | Ajouter `max_length` sur les champs texte des schémas Pydantic (projets). |
| P3       | Intégrer un audit des dépendances en CI (`uv audit`, `npm audit`). |

---

## 8. Conclusion

Le projet ToolMe présente une **base saine** (auth, ORM, contrôle d’accès, hachage des mots de passe). Les **risques principaux** concernent la **configuration** (SECRET_KEY, Docker, CORS) et la **gestion des abus** (rate limiting) et du **stockage du token** (localStorage vs cookie HTTP-only). La mise en œuvre des actions P0 et P1 est recommandée avant toute mise en production ; les actions P2 et P3 renforceront la posture globale.

---

*Rapport rédigé dans le cadre d’un audit white-box du dépôt ToolMe. Pour un audit de type black-box ou une revue d’infrastructure, une mission complémentaire est à prévoir.*
