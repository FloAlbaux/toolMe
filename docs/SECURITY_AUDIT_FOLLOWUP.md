# Audit de retour — ToolMe (après correctifs)

**Type :** Audit de retour (vérification des correctifs)  
**Référence :** Rapport d’audit initial `SECURITY_AUDIT_REPORT.md` (11 février 2025)  
**Date du retour :** 11 février 2025  
**Objectif :** Vérifier que les recommandations ont été correctement traitées.

---

## 1. Résumé

Les **correctifs critiques (P0) et la majorité des correctifs élevés (P1) et moyens (P2)** ont été mis en place. La posture de sécurité est nettement améliorée : secret JWT et CORS sécurisés en production, rate limiting sur l’auth, passage au cookie HTTP-only pour le JWT, seed et schémas durcis, CSP ajoutée. Il reste **une action P3** (audit des dépendances en CI) non implémentée et **quelques recommandations mineures** pour la prod.

---

## 2. Statut par constat de l’audit initial

### 2.1 Critique — TRAITÉ

| ID  | Constat | Statut | Vérification |
|-----|--------|--------|----------------|
| C-1 | SECRET_KEY par défaut en production | **Corrigé** | `config.py` : en `ENVIRONMENT=production`, refus de démarrage si `SECRET_KEY` absent ou égal à `DEV_SECRET` (`SystemExit`). |
| C-2 | SECRET_KEY non fourni au conteneur API | **Corrigé** | `docker-compose.yml` : le service `api` reçoit `SECRET_KEY`, `ENVIRONMENT`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`. Commentaire rappelle l’obligation en prod. |

---

### 2.2 Élevé — TRAITÉ

| ID  | Constat | Statut | Vérification |
|-----|--------|--------|----------------|
| E-1 | Pas de rate limiting sur login/signup | **Corrigé** | `limiter.py` (slowapi, clé par IP), `main.py` (SlowAPIMiddleware, handler `RateLimitExceeded`). `auth.py` : `@limiter.limit(AUTH_RATE_LIMIT)` sur `signup` et `login`. Limite configurable via `RATE_LIMIT_AUTH` (défaut `10/minute`). |
| E-2 | JWT en localStorage (risque XSS) | **Corrigé** | Backend : login renvoie un cookie HTTP-only (`AUTH_COOKIE_*` dans `config.py`), logout supprime le cookie ; `dependencies.py` lit le token depuis le cookie ou le header Bearer. Frontend : plus de `localStorage` pour le token ; `credentials: 'include'` sur les appels auth et projects ; état d’auth basé sur `me()` (cookie envoyé automatiquement). |

---

### 2.3 Moyen — TRAITÉ

| ID  | Constat | Statut | Vérification |
|-----|--------|--------|----------------|
| M-1 | CORS figé sur localhost | **Corrigé** | `config.py` : `CORS_ORIGINS` lu depuis `CORS_ORIGINS` (env), liste par virgules. En prod : refus si `*` ou liste vide ; refus si valeur encore égale au défaut localhost sans que `CORS_ORIGINS` soit défini. `main.py` utilise `CORS_ORIGINS` pour `allow_origins`. |
| M-2 | Absence de CSP | **Corrigé** | `frontend/index.html` : en-tête CSP via meta `Content-Security-Policy` (`default-src 'self'`, `script-src 'self'`, autorisation explicite des styles/fonts et de l’API locale pour `connect-src`). |
| M-3 | Mot de passe seed par défaut | **Corrigé** | `config.py` : `RUN_SEED` (env, défaut `true`) ; `SEED_PASSWORD` (env, défaut `seed-change-me`). En prod, si `RUN_SEED` est actif et `SEED_PASSWORD` reste la valeur par défaut → `SystemExit`. `seed.py` et `main.py` utilisent `SEED_PASSWORD` et n’exécutent le seed que si `RUN_SEED` est vrai. |
| M-4 | Schémas Pydantic sans max_length | **Corrigé** | `schemas/project.py` : `ProjectBase` et `ProjectUpdate` avec `max_length` alignés sur le modèle (ex. `TITLE_MAX=500`, `DOMAIN_MAX=200`, `TEXT_MAX=50_000`, `DEADLINE_MAX=50`). |

---

### 2.4 Faible — PARTIELLEMENT TRAITÉ

| ID  | Constat | Statut | Vérification |
|-----|--------|--------|----------------|
| F-1 | Health check public | Non modifié (optionnel) | Comportement inchangé ; acceptable si l’accès à `/health` est contrôlé au niveau reverse proxy / réseau. |
| F-2 | Message auth générique | Conservé (souhaité) | « Invalid email or password » inchangé ; conforme aux bonnes pratiques. |
| F-3 | Audit des dépendances en CI | **Non fait** | Pas de step `uv audit` (backend) ni `npm audit` (frontend) dans `.github/workflows/ci.yml`. À ajouter en P3. |

---

## 3. Documentation et configuration

- **`.env.example`** : mis à jour avec `SECRET_KEY`, `ENVIRONMENT`, `CORS_ORIGINS`, `RUN_SEED`, `SEED_PASSWORD`, et rappel pour la prod. Aligné avec les correctifs.
- **Docker** : variables nécessaires pour l’API documentées et passées dans `docker-compose.yml` ; en prod il convient de définir `ENVIRONMENT=production`, `SECRET_KEY` fort et, si besoin, `CORS_ORIGINS`, `RUN_SEED`/`SEED_PASSWORD`.

---

## 4. Recommandations résiduelles

1. **P3 — CI (F-3)**  
   Ajouter en CI :
   - Backend : `uv audit` (ou équivalent) après `uv sync`, et échouer sur vulnérabilités critiques/hautes si la politique le demande.
   - Frontend : `npm audit --audit-level=high` (ou niveau défini par la politique).

2. **CSP en production**  
   La CSP actuelle autorise `connect-src` vers `http://localhost:8030` et `http://127.0.0.1:8030`. En production, si l’API est sur un autre domaine, il faudra l’ajouter à `connect-src` (via meta tag ou, mieux, header CSP côté serveur / reverse proxy).

3. **Variables Docker en prod**  
   Pour un déploiement type `docker-compose` en prod, s’assurer que le fichier `.env` (ou le secret manager) définit au minimum : `ENVIRONMENT=production`, `SECRET_KEY` (fort), `CORS_ORIGINS` (origine(s) du frontend), et éventuellement `RUN_SEED=false` ou `SEED_PASSWORD` fort si le seed est utilisé.

---

## 5. Conclusion

Les correctifs issus du premier audit ont été **correctement implémentés** pour les points critiques, élevés et moyens. L’application est en bien meilleure posture pour un déploiement en production. Il reste à intégrer l’audit des dépendances en CI (P3) et à adapter la CSP et les variables d’environnement au contexte de production (domaine API, origines CORS, seed).

---

*Audit de retour effectué par relecture du code et comparaison avec les recommandations du rapport `SECURITY_AUDIT_REPORT.md`.*
