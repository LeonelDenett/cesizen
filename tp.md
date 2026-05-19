TP – Chapitre 6 : Automatiser la Todo List avec un pipeline CI
et un suivi des évolutions
Tuo N. Ismaël Maurice
22 avril 2026
Table des matières
1 Objectif 2
2 Travail demandé 2
3 Travail attendu sur l’application 2
4 Contraintes 3
5 Livrables attendus 3
6 Critère de validation 3
1
1 Objectif
L’objectif de ce TP est de reprendre la Todo List conteneurisée, de mettre en place un
pipeline CI simple pour automatiser les vérifications essentielles du projet, puis de structurer un
suivi minimal des incidents, corrections et évolutions.
2 Travail demandé
— Reprendre la version todo-list-tp-5.
— Créer une nouvelle version de travail du projet pour le TP6.
— Ajouter un pipeline GitHub Actions.
— Ajouter un pipeline GitLab CI.
— Définir un pipeline minimal permettant au moins :
— l’installation des dépendances ;
— une vérification du backend ;
— le build du frontend ;
— le build des images Docker.
— Documenter le rôle des étapes du pipeline.
— Mettre en place un suivi simple des évolutions du projet.
— Créer quelques tickets représentatifs :
— bug ;
— évolution ;
— dette technique ;
— incident ou risque identifié.
— Relier au moins une correction ou amélioration à un ticket.
— Documenter le flux allant du ticket à la correction validée.
— Réaliser une petite amélioration concrète du projet qui s’intègre dans ce fonctionnement.
3 Travail attendu sur l’application
Le TP6 ne demande pas encore :
— d’orchestrer avec Kubernetes ;
— de déployer automatiquement en production.
Il demande en revanche de rendre le projet :
— automatiquement vérifiable ;
— plus traçable ;
— mieux préparé à une livraison répétable.
Les améliorations attendues peuvent par exemple porter sur :
— un pipeline clair et lisible ;
— des étapes nommées proprement ;
— un build Docker automatisé ;
— un contrôle simple de cohérence avant intégration ;
— une documentation du flux ticket → correction → validation.
2
4 Contraintes
— Ne pas ajouter Kubernetes dans ce TP.
— Ne pas transformer le pipeline en chaîne trop complexe.
— Garder une solution simple, pédagogique et exécutable.
— Le pipeline doit rester lisible par un autre binôme.
— Les secrets éventuels doivent rester hors des fichiers versionnés.
— Les tickets créés doivent rester cohérents avec la réalité du projet.
— Toute nouvelle étape du pipeline doit être documentée.
— Les deux fichiers CI peuvent coexister dans le corrigé, mais un seul pipeline est utilisé
selon la plateforme du dépôt.
5 Livrables attendus
— Une nouvelle version du projet pour le TP6.
— Un fichier de configuration GitHub Actions versionné.
— Un fichier de configuration GitLab CI versionné.
— Un pipeline minimal fonctionnel.
— Une documentation expliquant les étapes du pipeline.
— Des traces d’exécution ou une description claire des vérifications réalisées.
— Un ensemble de tickets représentatifs du projet.
— Une note décrivant le flux :
— ticket ;
— branche ;
— commit ;
— validation ;
— fusion.
— Une petite amélioration concrète du projet intégrée à cette logique.
6 Critère de validation
Un autre binôme doit pouvoir, à partir du dépôt et de la documentation fournie :
— comprendre le rôle du pipeline ;
— relancer ou lire les vérifications automatiques ;
— identifier les étapes du build et du contrôle ;
— comprendre comment une évolution ou une correction est tracée ;
— constater que le projet est plus prêt à être maintenu collectivement qu’au TP5.
3