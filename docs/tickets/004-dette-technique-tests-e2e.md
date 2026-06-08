# Ticket #004 — Dette technique : couverture des tests E2E insuffisante

## Informations

| Champ | Valeur |
|-------|--------|
| **Titre** | Augmenter la couverture des tests end-to-end (Playwright) |
| **Type** | Dette technique |
| **Priorité** | Moyenne |
| **Statut** | À planifier |
| **Créé le** | 2026-05-22 |

## Description

Les tests E2E actuels couvrent principalement l'authentification et le CMS admin. Les parcours utilisateurs critiques (respiration, tracker d'émotions, favoris, articles) ne sont pas encore testés de bout en bout, ce qui augmente le risque de régression à chaque mise à jour du frontend.

## Impact

- **Risque de régression** : une modification sur le composant `BreathingExercise` ou sur le formulaire de login peut casser un parcours utilisateur sans être détectée en CI.
- **Confiance du pipeline** : le job `e2e` de la CI est moins pertinent s'il ne couvre pas les modules au choix du projet (respiration, tracker).
- **Soutenance / démonstration** : montrer une CI verte avec des tests E2E complets renforce la crédibilité du plan de qualité.

## Scénarios à implémenter

### Module Respiration (au choix)
- [ ] Lancer un exercice de cohérence cardiaque et vérifier l'animation.
- [ ] Changer d'exercice via le sélecteur et vérifier que les timers se réinitialisent.

### Module Tracker d'émotions (au choix)
- [ ] Se connecter, ajouter une émotion au journal, vérifier qu'elle apparaît dans le tableau.
- [ ] Modifier une émotion existante et vérifier la mise à jour.
- [ ] Visualiser le rapport sur une période (semaine / mois).

### Module Informations / Articles (obligatoire)
- [ ] Naviguer vers `/articles`, filtrer par catégorie "Alimentation".
- [ ] Ajouter / retirer un article des favoris (utilisateur connecté).
- [ ] Ouvrir un article et vérifier l'affichage du contenu Markdown.

### Sécurité / RGPD
- [ ] Vérifier la présence de la modal RGPD sur la page d'accueil.
- [ ] Tester la suppression de compte et vérifier l'impossibilité de se reconnecter.

## Branche proposée

`debt/004-tests-e2e-coverage`

## Estimation

**Story points** : 5 (≈ 2–3 jours de travail)

## Critères d'acceptation

- [ ] Au moins 3 nouveaux fichiers de specs Playwright ajoutés dans `__tests__/e2e/`.
- [ ] Le job `e2e` de la CI passe sans régression.
- [ ] Couverture E2E documentée dans `docs/workflow.md` (tableau des parcours testés).

## Notes

- Lié au ticket #002 (évolution UI) : si la page de connexion change, les selectors Playwright devront être mis à jour.
- Utiliser `data-testid` ou des rôles ARIA (`getByRole`, `getByLabel`) pour des sélecteurs robustes.

---
*Ticket de dette technique — CESIZen — Juin 2026*
