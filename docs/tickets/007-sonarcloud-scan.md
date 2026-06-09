# Ticket #007 — SonarCloud SAST Scan

## Informations

| Champ | Valeur |
|-------|--------|
| **Titre** | Intégrer SonarCloud (SAST) dans la CI/CD |
| **Type** | Sécurité / SAST |
| **Priorité** | 🔴 **Critique** |
| **Statut** | 🟢 **En cours** |
| **Créé le** | 2026-06-09 |
| **Branche** | `feature/sonarcloud-scan` |

## Description

Intégrer SonarCloud (SonarQube Cloud) pour effectuer une analyse statique de sécurité (SAST) à chaque push et PR. SonarCloud détecte automatiquement les bugs, vulnérabilités, code smells et mesure la couverture de tests.

## Livrables

1. ✅ `sonar-project.properties` — Configuration du projet
2. ✅ Modification de `.github/workflows/ci.yml` — Ajout du job `sonarqube`
3. ✅ Création du secret `SONAR_TOKEN` dans GitHub Settings
4. 🔄 Validation du scan dans la CI

## Configuration

### SonarCloud
- **Project Key**: `LeonelDenett_cesizen`
- **Organization**: `leoneldenett`
- **URL**: https://sonarcloud.io/dashboard?id=LeonelDenett_cesizen

### GitHub Secret
- **Name**: `SONAR_TOKEN`
- **Value**: Token généré depuis SonarCloud (Administration > Analysis Method > GitHub Actions)

### CI/CD
- **Job**: `sonarqube` (entre `build` et `security-scan`)
- **Action**: `SonarSource/sonarqube-scan-action@v8.1.0`
- **Nécessite**: `fetch-depth: 0` pour l'analyse complète

## Étapes de validation

1. Push sur `develop` ou PR
2. Le job `sonarqube` s'exécute après `build`
3. SonarCloud analyse le code et publie le rapport
4. Vérifier sur https://sonarcloud.io/dashboard?id=LeonelDenett_cesizen

## Critères d'acceptation

- [ ] Le scan SonarCloud s'exécute dans chaque push sur `main` et `develop`
- [ ] Le rapport est visible sur SonarCloud UI
- [ ] Pas de vulnérabilités critiques non résolues
- [ ] La couverture de tests s'affiche dans SonarCloud

## Commits
- `feat(ci): add SonarCloud scan with sonar-project.properties`

## Notes
- **SAST** (Static Application Security Testing) : analyse du code source sans exécution
- **SonarCloud** est gratuit pour les projets open-source
- **Trivy** (déjà présent) = scan SCA/Docker, **SonarCloud** = scan SAST — complémentaires

---

*Ticket créé le 2026-06-09 — Intégré dans la CI/CD*
