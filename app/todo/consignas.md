Développer et tester les applications informatiques
Durée du bloc: 3 mois environ
Projet de développement d’application simulé en individuel
Production écrite (dossier de 15 à 20 pages) et orale (soutenance de 20 minutes hors questions/réponses)
Conseils : Dès que le sujet vous est remis, assurez-vous qu’il soit complet.
Afin de gérer au mieux votre temps, lisez l’intégralité des questions avant de commencer à organiser votre travailConsignes sujet d’évaluation
Consignes – INFCDAAL2 – Développer et tester les applications informatiques – V1 – 07/06/2024
Compétences évaluées
Concernant le développement des applications logicielles, les compétences suivantes seront évaluées :
 Concevoir et créer les tables et relations d’une base de données dans un des principaux SGBD en intégrant les
notions de performances et bonnes pratiques
 Identifier, comparer et sélectionner des architectures logicielles pertinentes, cohérentes et performantes
 Programmer et implémenter les fonctionnalités d’une application en respectant des standards
 Rédiger une documentation technique du logiciel équilibrée pour en assurer la qualité et la maintenance
Concernant les tests et la qualité logicielle, les compétences suivantes seront évaluées :
 Définir et formaliser un cahier de tests via des scenarii de tests unitaires, fonctionnels et de non régression
 Définir une procédure de validation pour garantir l’adéquation avec les documents de conception
 Configurer des outils d’automatisation de tests pour optimiser la qualité logiciels (testing)
Enoncé
Application CESIZen : l’application de votre santé mentale
Le sujet d’évaluation projet CESIZen a pour objectif d’aborder les thématiques relatives à la conception et au
développement d’applications, ainsi qu’aux aspects liés au testing, à la sécurisation et la livraison.
Le principal enjeu du projet CESIZen est de proposer des outils de gestion du stress et d’informations autour de la santé
mentale.
L’objectif principal de CESIZen est donc de proposer une plateforme grand public pour accompagner le quotidien de
chacun et l’aider à mieux comprendre les enjeux de sa santé mentale (et de celle des autres) et agir efficacement sur
son stress.
Besoins généraux identifiés
Parmi les attentes fonctionnelles générales, nous pouvons retrouver les éléments suivants :





Accès à des informations autour de la santé mentale et sa prévention
Accès à des outils de diagnostics et d’auto-diagnostics dynamiques
Accès à des exercices de respiration configurables
Enregistrement et mise à disposition d’activité de détente
Gérer et consulter un tracker d’émotions
Consignes – INFCDAAL2 – Développer et tester les applications informatiques – V1 – 07/06/2024
Page 2/6Consignes sujet d’évaluation
Consignes – INFCDAAL2 – Développer et tester les applications informatiques – V1 – 07/06/2024
Les acteurs
Nous avons ainsi identifié les acteurs suivants :



Visiteur anonyme
Utilisateur connecté
Administrateur de la solution
Liste des modules et obligation de rendu
Le projet étant mené en individuel, tous les modules ne devront pas être couverts concernant les spécifications
fonctionnelles détaillées, le développement du prototype et le cahier de tests.
ModuleObligatoire / Au choix
Comptes utilisateursObligatoire
InformationsObligatoire
Diagnostics1 module au choix
Exercices de respiration1 module au choix
Activités de détente1 module au choix
Tracker d’émotions1 module au choix
Liste des fonctionnalités attendues
Modules
fonctionnelsFonctions
Comptes
utilisateursCréation d’un compte utilisateur
Gestion du compte utilisateur
Création et gestion de comptes utilisateurs et
administrateurs
Désactivation / Suppression d’un compte
utilisateur
Réinitialisation de son mot de passe
Acteurs
Affichage des menus et pages de contenus
Informations
Diagnostics
Modification des contenus des menus et pages
d’information
Afficher et dérouler le questionnaire diagnostic de
stress
Configurer le questionnaire diagnostic de stress :
évènement / points associés
Visiteur anonyme
Utilisateur connecté
Administrateur
Administrateur
Utilisateur connecté
Visiteur anonyme
Utilisateur connecté
Administrateur
Visiteur anonyme
Utilisateur connecté
Administrateur
Consignes – INFCDAAL2 – Développer et tester les applications informatiques – V1 – 07/06/2024
Page 3/6Consignes sujet d’évaluation
Consignes – INFCDAAL2 – Développer et tester les applications informatiques – V1 – 07/06/2024
Exercices
respiration
Configurer la page de résultat du diagnostic de
stress
de Configure l’exercice de cohérence cardiaque
Lancer l’exercice de cohérence cardiaque
Consulter et filtrer le catalogue d’activités détente
Activités
détente
de Consulter une activité détente
Tracker d’émotions
Marquer une activité comme favorite
Ajouter / Modifier une activité détente
Désactiver une activité détente
Afficher le journal de bord de son tracker
d’émotions
Ajouter / Modifier un tracker (item) du journal de
bord
Supprimer un tracker (item) du journal de bord
Visualiser un rapport d’émotion sur une période
donnée (semaine, mois, trimestre, année)
Configurer la liste d’émotions disponibles :
émotion de base (niveau 1) – émotion niveau 2
Administrateur
Visiteur anonyme
Visiteur anonyme
Visiteur anonyme
Utilisateur connecté
Visiteur anonyme
Utilisateur connecté
Utilisateur connecté
Administrateur
Administrateur
Utilisateur connecté
Utilisateur connecté
Utilisateur connecté
Utilisateur connecté
Administrateur
Conception et architectures
La base de données support de l’application devra être modélisée à travers 2 schémas Merise/UML :
 MCD : Modèle Conceptuel de Données
 MLD : Modèle Logique de Données
L’apprenant devra justifier ses choix techniques à travers un comparatif des solutions envisagées (minimum 3
architectures logicielles différentes) avec une sélection de critères explicités (voir la partie Livrables).
L’architecture de développement devra adopter une approche Framework et proposer au maximum des outils structurés
et structurant, et soutenu par des éditeurs et/ou des communautés.
Ces éléments seront présentés dans une documentation technique incluant également un guide d’installation de la
solution.
Tests et recettes
L’apprenant devra concevoir et implémenter un plan de tests incluant trois types de tests :



Tests unitaires
Tests fonctionnels
Tests de non régression
Un outil d’automatisation devra être configuré pour implémenter les tests (unitaires à minima).
Un cahier de tests sera également proposé afin de formaliser les scenarii qui seront exploités pour chacun des types de
tests abordés. Ce cahier de tests devra intégrer les 2 modules obligatoires ainsi qu’un module au choix.
Consignes – INFCDAAL2 – Développer et tester les applications informatiques – V1 – 07/06/2024
Page 4/6Consignes sujet d’évaluation
Consignes – INFCDAAL2 – Développer et tester les applications informatiques – V1 – 07/06/2024
Une procédure de validation sera également rédigée afin de juger de la capacité de l’apprenant à organiser et animer
une recette et valider une livraison. Un modèle de PV de recette devra être réalisé.
Travail demandé/Livrable final
Les livrables attendus dans le cadre de ce projet sont les suivants :



Un prototype fonctionnel de l’application incluant les 2 modules obligatoires (comptes utilisateurs et
informations) et un module facultatif au choix
Une documentation technique incluant :
o La modélisation physique de la base de données : MLD
o Un comparatif des solutions techniques envisagées avec critères de sélection et argumentation du choix
final
o Un guide d’installation
Une documentation relative à la livraison, incluant :
o Un cahier de tests incluant des scenarii de tests complets pour les 2 modules obligatoires (comptes
utilisateurs et informations) et un module facultatif au choix
o Une procédure de validation incluant un modèle de PV de recette
Déroulement et livrables intermédiaires
Le projet sera réalisé sur une amplitude de 3 mois environ.
Aucun livrable intermédiaire ne sera demandé.
Le dossier complet d’une quinzaine de pages environ (20 pages maximum) sera remis au pilote de formation 1 semaine
avant les soutenances orales.
La soutenance orale est prévue pour une durée de 20 minutes par apprenant et sera suivie d’une phase de
questions/réponses de 10 minutes environ.
Consignes – INFCDAAL2 – Développer et tester les applications informatiques – V1 – 07/06/2024
Page 5/6Consignes sujet d’évaluation
Consignes – INFCDAAL2 – Développer et tester les applications informatiques – V1 – 07/06/2024
Barème de notation
Domaine de compétencesLivrable3
Documentation techniqueModèle Logique de Données (MLD)
Comparatif des solutions techniques - Méthodologie et
critères
Pertinence de la solution retenueGuide d'installation2
Livraison et démonstration du produit10
Cahier de recette et scenarii détaillées
Procédure de validation3
1
Modèle de PV de recette1
Qualité du dossier et de la soutenance4
Prototype fonctionnel
Tests et validation
Dossier et soutenance
Barème
4
2
Organisation
Le projet sera soumis aux apprenants dès le début du bloc 2 « Développer et tester les applications informatiques ».
Le projet sera réalisé en dehors des heures de présence dans le centre.
Pièces annexes
Sujet Détaillé - Projet CESIZen
Consignes – INFCDAAL2 – Développer et tester les applications informatiques – V1 – 07/06/2024
Page 6/6