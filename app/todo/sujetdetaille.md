TITRE CONCEPTEUR DÉVELOPPEUR D’APPLICATIONS
SUJET : CESIZEN
Janvier 2024
Projet, notes et détails
Evaluation individuelle - Activité 2
Développer et tester les applications informatiquesSOMMAIRE
I.INTRODUCTION ............................................................................................................................... 4
II.CESIZEN : CONTEXTE ET ORIGINE ................................................................................................... 4
A.LE MAÎTRE MOT : SANTÉ MENTALE ET GESTION DU STRESS ..................................................................... 4
B.OBJECTIFS ...................................................................................................................................... 5
C.CONTEXTE DE LA DEMANDE : LE MINISTÈRE ......................................................................................... 5
D.ATTENTES FONCTIONNELLES .............................................................................................................. 6
1)Les acteurs ............................................................................................................................... 6
2)Besoins généraux identifiés..................................................................................................... 6
3)Liste des fonctionnalités attendues ........................................................................................ 6
4)Liste des modules et obligation de rendu ............................................................................... 7
5)Diagnostics : le questionnaire de stress .................................................................................. 8
6)Exercice de respiration et cohérence cardiaque ..................................................................... 8
7)Référentiel d’émotions pour le tracker ................................................................................... 8
E.
ERGONOMIE ET IDENTITÉ GRAPHIQUE ............................................................................................... 10
1)Généralités ............................................................................................................................ 10
2)Identité graphique ................................................................................................................. 10
3)Responsive Design et Mobile First ........................................................................................ 10
F.BUDGET ET DÉLAIS ......................................................................................................................... 10
G.STANDARDS ET QUALITÉ ................................................................................................................. 11
H.SÉCURITÉ ET PROTECTION DES DONNÉES............................................................................................ 11
III.
1)Vulnérabilités et attaques ..................................................................................................... 11
2)Gestion des risques ............................................................................................................... 11
3)Cryptages ............................................................................................................................... 11
4)Sécurité des données personnelles ....................................................................................... 11
5)Notification d’incidents/faille de sécurité ............................................................................. 11
STRUCTURE LOGICIELLE ET CONCEPTION ................................................................................ 12
A.STRUCTURE DES DONNÉES ............................................................................................................... 12
B.MODÉLISATION FONCTIONNELLE ...................................................................................................... 12
C.CONCEPTION MVC ........................................................................................................................ 12
IV.ARCHITECTURES ET INFRASTRUCTURES................................................................................... 13
D.CONCEPTION................................................................................................................................. 13
E.CHOIX TECHNIQUES ........................................................................................................................ 13
CDA - Activité 2
2024
2/18F.
V.
DOCUMENTATION TECHNIQUE ......................................................................................................... 13
TESTING ET VALIDATION .............................................................................................................. 14
1)Tests unitaires ....................................................................................................................... 14
2)Tests fonctionnels.................................................................................................................. 14
3)Tests de non régression......................................................................................................... 14
4)Outils d’automatisation ......................................................................................................... 14
5)Cahier de tests ....................................................................................................................... 14
6)Recette et validation ............................................................................................................. 14
VI.
DEPLOIEMENT ET SÉCURISATION ............................................................................................. 15
A.
PLAN DE DÉPLOIEMENT................................................................................................................... 15
1)Versioning .............................................................................................................................. 15
2)Automatisation ...................................................................................................................... 15
B.
SÉCURISATION............................................................................................................................... 15
1)Analyse et prévention ........................................................................................................... 15
2)Escalade d’information et gestion de crise ........................................................................... 15
VII.MAINTENANCE CORRECTIVE ET ÉVOLUTIVE ............................................................................ 16
A.MAINTENANCE CORRECTIVE ............................................................................................................ 16
B.MAINTENANCE ÉVOLUTIVE .............................................................................................................. 17
C.PILOTAGE ..................................................................................................................................... 17
VIII.LIVRABLES ................................................................................................................................. 17
1)Activité 1 : Concevoir les solutions logicielles ....................................................................... 17
2)Activité 2 : Développer et tester les applications informatiques : ........................................ 18
3)Activité 3 : Déployer et sécuriser les applications informatiques ......................................... 18
CDA - Activité 2
2024
3/18I. INTRODUCTION
Dans le cadre du titre « Concepteur développeur d’applications (CDA) », l’activité 2 fait intervenir les
compétences pour développer et tester les applications informatiques. Le présent projet représente
le sujet d’évaluation individuelle des apprenants concernant ces compétences.
Pour chaque bloc, un rendu individuel est attendu, une soutenance orale complètera l’évaluation.
Chaque apprenant sera désigné dans le présent document comme « le prestataire ».
Nous vous proposons ci-après le sujet du projet CESIZen 2024 du titre CDA intitulé « CESIZen :
l’application de votre santé mentale ».
II. CESIZEN : CONTEXTE ET ORIGINE
Le projet « CESIZen » est une simulation d’un projet qui pourrait être porté par le Ministère de la Santé
et de la Prévention, à destination du grand public.
Le sujet a été intégralement conçu à partir de cette idée, les documents fournis ne sont donc pas
officiels et n’émerge pas du Ministère de la Santé et de la Prévention.
Certains documents de présentation du Ministère contiennent néanmoins des informations réelles
issues du site internet du ministère : www.sante.gouv.fr
A. LE MAÎTRE MOT : SANTÉ MENTALE ET GESTION DU STRESS
Le principal enjeu du projet CESIZen est de proposer des outils de gestion du stress et d’informations
autour de la santé mentale.
Bien qu’une réponse constitutive de l’humain et son corps face à des situations perçues comme
menaçantes, le stress peut avoir des répercussions significatives sur la santé mentale et physique
lorsqu'il devient excessif ou chronique.
Notre capacité à gérer efficacement ce stress est primordiale pour maintenir un équilibre émotionnel,
optimiser notre santé mentale et psychique, et favoriser le bien-être général.
L’objectif principal de CESIZen est donc de proposer une plateforme grand public pour accompagner
le quotidien de chacun et l’aider à mieux comprendre les enjeux de sa santé mentale (et de celle des
autres) et agir efficacement sur son stress.
CDA - Activité 2
2024
4/18B. OBJECTIFS
Outre la mission d’informer le public quant à l’importance de la santé mentale, l’application CESIZen
met en lumière les objectifs suivants :




Proposer des outils de diagnostics et d’autodiagnostic
Fournir des exercices de respiration
Proposer des activités détente
Mettre à disposition un tracker des émotions
Outils diagnostics et
auto-diagnostics
Activités de gestion
du stress
personnalisables
Exercices de
respiration
Tracker des
émotions
C. CONTEXTE DE LA DEMANDE : LE MINISTÈRE
Le ministre de la Santé et de la Prévention prépare et met en œuvre la politique
Gouvernement dans les domaines de la santé publique et de l’organisation du
système de santé.
Sous réserve des compétences du ministre de l’Action et des Comptes publics,
il prépare et met en œuvre la politique du Gouvernement dans le domaine de
protection sociale.
du
la
Dans le cadre du présent projet ce sont les attributions liées à la santé mentale qui nous intéresse.
Les missions du ministère de la santé et de la prévention sont les suivantes :


Il est responsable de l’organisation de la prévention et des soins ; il élabore et met en œuvre,
en liaison avec les autres ministres compétents, les règles relatives à la politique de protection
de la santé contre les divers risques susceptibles de l’affecter ; il est également compétent
en matière de professions médicales et paramédicales et de fonction publique hospitalière. Il
est compétent en matière de lutte contre la toxicomanie. Il participe, avec les autres ministres
compétents, à l’action du Gouvernement en matière de recherche et de promotion de
l’innovation dans le domaine de la santé. Il prépare et suit les travaux du comité
interministériel pour la santé ;
Il prépare et met en œuvre, conjointement avec le ministre des Solidarités, de l’Autonomie et
des Personnes handicapées, les règles relatives aux régimes et à la gestion des organismes de
sécurité sociale ainsi qu’aux organismes complémentaires, en matière d’assurance vieillesse,
de prestations familiales et d’assurance maladie et maternité, et, conjointement avec le
ministre du Travail, en matière d’accidents du travail et de maladies professionnelles. Il est
chargé, conjointement avec le ministre des comptes publics, de la préparation de la loi de
financement de la sécurité sociale et du suivi de son exécution.
CDA - Activité 2
2024
5/18D. ATTENTES FONCTIONNELLES
Les attentes fonctionnelles proposées sont évidemment soumises à la sagacité des prestataires
qui pourront proposer des ajustements et des options fonctionnelles selon leur compréhension du
besoin.
1) Les acteurs
Nous avons ainsi identifié les acteurs suivants :



Visiteur anonyme
Utilisateur connecté
Administrateur de la solution
2) Besoins généraux identifiés
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
A noter que l’application devra proposer une vue publique (Front-Office) pour les visiteurs anonymes
et les utilisateurs connectés ainsi que vue d’administration (Back-Office) pour les administrateurs.
Visiteur
Front-
Office
Back-
Office
Administrateur
Utilisateur connecté
3) Liste des fonctionnalités attendues
Modules
fonctionnelsFonctions
Comptes
utilisateursCréation d’un compte utilisateur
Gestion du compte utilisateur
Création et gestion de comptes utilisateurs et
administrateurs
Désactivation / Suppression d’un compte utilisateur
Réinitialisation de son mot de passe
CDA - Activité 2
Acteurs
2024
Visiteur anonyme
Utilisateur connecté
Administrateur
Administrateur
Utilisateur connecté
6/18Visiteur anonyme
Utilisateur connecté
Affichage des menus et pages de contenus
Informations
Diagnostics
Exercices
respiration
Modification des contenus des menus et pages
d’information
Afficher et dérouler le questionnaire diagnostic de
stress
Configurer le questionnaire diagnostic de stress :
évènement / points associés
Configurer la page de résultat du diagnostic de stress
de Configure l’exercice de cohérence cardiaque
Lancer l’exercice de cohérence cardiaque
Consulter et filtrer le catalogue d’activités détente
Activités
détente
Tracker
d’émotions
de Consulter une activité détente
Marquer une activité comme favorite
Ajouter / Modifier une activité détente
Désactiver une activité détente
Afficher le journal de bord de son tracker d’émotions
Ajouter / Modifier un tracker (item) du journal de
bord
Supprimer un tracker (item) du journal de bord
Visualiser un rapport d’émotion sur une période
donnée (semaine, mois, trimestre, année)
Configurer la liste d’émotions disponibles : émotion
de base (niveau 1) – émotion niveau 2
Administrateur
Visiteur anonyme
Utilisateur connecté
Administrateur
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
Le prestataire établira une liste de critères de pondération de ces besoins fonctionnels de manière à
articuler et prioriser la réponse à ces besoins en conséquence.
4) Liste des modules et obligation de rendu
Le projet étant mené en individuel, tous les modules ne devront pas être couverts concernant les
spécifications fonctionnelles détaillées, le développement du prototype et le cahier de tests.
CDA - Activité 2
ModuleObligatoire / Au choix
Comptes utilisateursObligatoire
InformationsObligatoire
Diagnostics1 module au choix
Exercices de respiration1 module au choix
Activités de détente1 module au choix
Tracker d’émotions1 module au choix
2024
7/185) Diagnostics : le questionnaire de stress
Le diagnostic de stress est basé sur l’échelle de Holmes et Rahe.
Cette échelle exploite une liste d’évènements vécus dans les 12 derniers mois et associés à un nombre
de points. Plus le total de points est important, plus le niveau de stress est élevé.
Sources :


https://actinutrition.fr/sante/stress/echelle-de-stress-holmes-rahe/,
https://www.jeromepoiraud.fr/wp-content/uploads/2015/06/Echelle-de-Holmes-et-Rahe-v2.pdf
6) Exercice de respiration et cohérence cardiaque
L’exercice de respiration proposé se base sur la cohérence cardiaque et s’articule autour de trois
valeurs :



Durée d’inspiration
Durée d’apnée
Durée d’expiration
Dans la version initiale de la solution, seront proposées 3 alternatives :



748 : Inspiration : 7 secondes / Apnée : 4 secondes / Expiration : 8 secondes
55 : Inspiration : 5 secondes / Apnée : 0 secondes / Expiration : 5 secondes
46 : Inspiration : 4 secondes / Apnée : 0 secondes / Expiration : 6 secondes
7) Référentiel d’émotions pour le tracker
Pour le tracker d’émotion, un référentiel d’émotions simplifié sera mis en œuvre selon le schéma
suivant :
Émotion
Émotion de base
Fierté
Contentement
Enchantement
Joie
Excitation
Émerveillement
Gratitude
Frustration
Irritation
Rage
Colère
Ressentiment
Agacement
Hostilité
CDA - Activité 2
2024
8/18Inquiétude
Anxiété
Terreur
Peur
Appréhension
Panique
Crainte
Chagrin
Mélancolie
Abattement
Tristesse
Désespoir
Solitude
Dépression
Étonnement
Étonnement
Stupéfaction
Sidération
Surprise
Incrédule
Émerveillement
Confusion
Répulsion
Déplaisir
Nausée
Dégoût
Dédain
Horreur
Dégoût profond
CDA - Activité 2
2024
9/18E. ERGONOMIE ET IDENTITÉ GRAPHIQUE
1) Généralités
La plateforme s’adresse au grand public, celle-ci devra être adapté à un public hétérogène en termes
d’âges, de milieu et de perception. Ainsi, une attention particulière devra être accordée à l’ergonomie
et à l’efficacité des interfaces.
Aucune traduction en langue étrangère n’est attendue.
2) Identité graphique
L’identité graphique n’a volontairement pas été validée de manière à laisser toute latitude aux
soumissionnaires quant à la recherche graphique et la créativité ergonomique et visuelle.
Une ébauche de logo est proposée mais pourra être modifiée :
3) Responsive Design et Mobile First
Les contenus Web devront être lisibles via un smartphone grâce à des
technologies Responsive Design. De plus, une application mobile devra
être développée et pensée pour le mobile sur un modèle « Mobile First ».
Aussi la structure de l’application mobile devra être pensée pour le mobile
et ne pas représenter une simple adaptation du contenu desktop dans une
application mobile.
Une attention particulière sera apportée aux contraintes mobiles
(disposition à l’écran, accès des fonctionnalités, etc.).
F. BUDGET ET DÉLAIS
Dans le cadre de ce projet, un budget maximal a été fixé à 75.000€ pour la réalisation du projet.
L’administration souhaite se voir livrer l’application Web pour testing 12 mois à partir de la signature
du marché.
CDA - Activité 2
2024
10/18G. STANDARDS ET QUALITÉ
Les applications devront respecter les nombreux standards actuels notamment :




Comptabilités avec les navigateurs courant du marché (Chrome, Firefox, Edge, Safari)
Respect des standards du Web (XHTML, CSS) dans les versions les plus à jour sous réserve
du respect du point précédent
Respect de le Règlement Générale sur la Protection des Données (RGPD)
Anonymisation et cryptable des données sensibles
De manière générale, tout standard permettant d’améliorer la qualité du projet tant sur l’organisation
que la production, sera apprécié.
H. SÉCURITÉ ET PROTECTION DES DONNÉES
1) Vulnérabilités et attaques
Le prestataire devra identifier les vulnérabilités de l’infrastructure et des logiciels afin de décrire les
attaques potentielles contre l’application et son environnement.
S’agissant d’un projet porté par le Ministère, l’application sera vraisemblablement la cible de
nombreuses attaques.
2) Gestion des risques
Les vulnérabilités ainsi que tous les autres risques de coupure de l’activité du système devront faire
partie d’une analyse des risques représentée dans une matrice de risques.
Pour chaque vulnérabilité et risques, des actions préventives et correctives devront être proposées.
3) Cryptages
De manière générale, toutes les pages et requêtes Web devront passer par un protocole HTTPS de
manière à chiffrer les données entre le navigateur de l’utilisateur et le serveur de l’application.
Un cryptage particulier devra être proposé concernant les données personnelles et sensibles des
utilisateurs (mots de passe, adresses, etc).
4) Sécurité des données personnelles
Le prestataire s’engage à assurer la sécurité et la confidentialité des données personnelles qui lui sont
communiquées et auxquelles il pourrait avoir accès sur son environnement.
La réglementation RGPD en vigueur devra être appliquée.
Par ailleurs, aucune donnée personnelle ne pourra faire l’objet d’un transfert en dehors de l’Union
Européenne.
5) Notification d’incidents/faille de sécurité
En cas d’incident de sécurité, un protocole de notification et d’escalade d’informations devra être mis
en place de façon à réagir de la manière appropriée le plus rapidement possible.
Des outils de supervision seront proposés pour assurer la prise en compte des incidents au plus tôt.
CDA - Activité 2
2024
11/18III. STRUCTURE LOGICIELLE ET CONCEPTION
Le prestataire attachera une attention particulière à la structure logicielle et à la conception de
l’application attendue.
A.STRUCTURE DES DONNÉES
Dans un premier temps, les données manipulées par le système devront être décrites et structurées
autour de modèle Merise (Modèle Conceptuel de Données - MCD et Modèle Logique de Données -
MLD).
La structuration des données devra tenir compte des besoins exprimés ainsi que des évolutions
possibles de l’application tant au niveau technique et fonctionnel qu’au niveau de la sécurité et des
performances.
B. MODÉLISATION FONCTIONNELLE
Les fonctionnalités attendues devront faire l’objet d’une analyse et d’une modélisation précise et
complète. Le Ministère attend notamment des schémas UML qui permettront de valider la conception
aussi bien pour les chefs de projets que les développeurs de l’application. Nous pouvons notamment
retenir :




Les diagrammes de cas d’utilisations
Les diagrammes d’état transition
Les diagrammes de séquences
Les diagrammes de classes (voir paragraphe suivant concernant la conception MVC)
Le prestataire devra proposer les modèles nécessaires à la compréhension fonctionnelle selon sa
perception du besoin.
C. CONCEPTION MVC
L’application devra épouser les principes du Design Pattern MVC – Model – View – Controller.
L’idée principale est de structurer les codes sources autour de 3 concepts :
Model - ModèleView - VueController - Contrôlleur
La structure des
données et leurs
modes d'accèsLa présentation de
l'application, son
interfaceLa logique métier
de l'application
La modélisation technique de l’application devra tenir compte de ces principes. La documentation
fournit devra également présenter les garanties du respect de ce Design Pattern.
CDA - Activité 2
2024
12/18IV. ARCHITECTURES ET INFRASTRUCTURES
Une fois la phase d’analyse du besoin réalisée et validée, une proposition d’architecture sera transmise
au Ministère. Cette proposition intègrera notamment tous les éléments logiciels et réseaux liés à la
conception de la plateforme.
D.CONCEPTION
La conception de la base de données devra faire l’objet de schéma de modélisation Merise ou UML :


MCD : Modèle Conceptuel de Données
MLD : Modèle Logique de Données
E. CHOIX TECHNIQUES
Toute liberté est donnée aux prestataires en termes de choix techniques de manière à proposer la
solution la plus pertinente.
Le prestataire devra justifier ses choix à travers un comparatif des solutions envisagées (minimum 3
architectures logicielles différentes) avec une sélection de critères explicités (voir la partie Livrables).
L’architecture de développement devra adopter une approche Framework et proposer au maximum
des outils structurés et structurant, et soutenu par des éditeurs et/ou des communautés.
F. DOCUMENTATION TECHNIQUE
Une documentation technique concise est attendue et devra présenter à minima :



La modélisation de la base de données
L’architecture logicielle retenue
Le guide d’installation
CDA - Activité 2
2024
13/18V. TESTING ET VALIDATION
Le prestataire devra mettre en œuvre le nécessaire pour tester l’application logicielle de manière à en
assurer la qualité et la maintenance sur le long terme.
Différents types de tests devront être abordés :



Tests unitaires
Tests fonctionnels
Tests de non régression
1) Tests unitaires
Les tests unitaires feront l’objet d’une analyse particulière lors de la conception de manière à les
intégrer aux phases de développement.
Ces tests devront apparaître dans le cahier de tests (voir paragraphe 5) page 14 pour plus de détails).
2) Tests fonctionnels
Les tests fonctionnels seront réalisés au préalable par le prestataire puis par les équipes du Ministère
de manière à assurer l’adéquation de l’application avec les documents de conception ainsi que les
besoins du Ministère.
Ces tests devront apparaître dans le cahier de tests (voir paragraphe 5) page 14 pour plus de détails).
3) Tests de non régression
Pour assurer le maintien et la pérennité de l’application, des tests de non régression devront être
proposés et réaliser avant chaque mise à jour de l’application. Le non succès d’un ou plusieurs tests de
non régression fera nécessairement l’objet d’un refus de livraison.
Ces tests devront apparaître dans le cahier de tests (voir paragraphe 5) page 14 pour plus de détails).
4) Outils d’automatisation
Le prestataire devra proposer et configurer un outil d’automatisation des tests (unitaires à minima),
en justifiant le choix de l’outil.
Un même outil capable de gérer le versioning, les tests unitaires et de non régression serait un plus
apprécié par le Ministère.
5) Cahier de tests
Le prestataire proposera un cahier de tests intégrant notamment les trois types de tests évoqués ci-
avant en précisant notamment pour chaque test :




Scenarii des tests proposés
Description du scenario
Résultats attendus
Responsable du test
6) Recette et validation
Une procédure de validation devra être proposée pour assurer la cohérence entre l’application livrée
et le présent cahier des charges. Un modèle de PV de recette sera proposé.
CDA - Activité 2
2024
14/18VI. DEPLOIEMENT ET SÉCURISATION
A.PLAN DE DÉPLOIEMENT
Un plan de déploiement cohérent par rapport au contexte du projet tant au niveau de son organisation
que son dimensionnement devra être proposé par le prestataire afin de permettre au Ministère de
déléguer le déploiement de la solution.
Les différents environnements proposés seront décrits en détail :



Environnements de développement
Environnements de tests
Environnements production
1) Versioning
La gestion des sources et versions sera également décrite dans le plan de déploiement afin de proposer
une méthodologie de suivi des versions sur les différents environnements de déploiement ainsi que
les bonnes pratiques appliquées par les équipes de développement.
L’outil logiciel permettant la gestion des versions devra également être présenté.
2) Automatisation
Un logiciel d’automatisation devra également être proposé et configuré de manière à intégrer une
logique de déploiement et de mise à jour efficace.
L’outil d’automatisation sélectionné sera décrit dans le plan de déploiement avec le détail des
fonctionnalités utiles pour le Ministère (intégration des tests unitaires et de performances, suivi des
mises à jour, etc.).
B. SÉCURISATION
1) Analyse et prévention
Une attention particulière sera apportée à la sécurisation des données et de l’application.
Tout d’abord, les différentes vulnérabilités du logiciel et de son utilisation seront mises en évidence.
Puis une stratégie de gestion des risques sera proposée en intégrant notamment les éléments
suivants :
Vulnérabilités,
risques et criticité
Solutions de
chiffrement et
cryptage
Gestion des
données
personnelles
Structuration des
développements et
bonnes pratiques
2) Escalade d’information et gestion de crise
En cas d’incidents de sécurité, une organisation de gestion de crise devra être proposée en décrivant
les différents niveaux d’escalade d’information, les actions à mener et les conditions de
remontée/descente d’information.
CDA - Activité 2
2024
15/18VII. MAINTENANCE CORRECTIVE ET ÉVOLUTIVE
Le prestataire devra assurer la maintenance des applicatifs :
Maintenance
Corrective
Maintenance
Evolutive
A.MAINTENANCE CORRECTIVE
La maintenance corrective démarre dès la prise en compte du ticket d’incident, par l’analyse du
problème remonté et la mise en place de solutions de corrections ou de contournement.
La maintenance corrective équivaut à la résolution des erreurs et dysfonctionnements signalés par le
Ministère. Chaque incident devra être déclaré via un ticket sur un logiciel dédié.
La catégorisation de la sévérité d’un incident repose sur la distinction entre « incident bloquant », «
incident majeur » et « incident mineur ».
Est dit « bloquant », tout incident lié à une interruption non planifiée d’un service rendant
impossible l’usage de ce service ou de cet ensemble de services et pour lequel il n’existe pas
de solution palliative ou de contournement.
Est dit « majeur » un incident rendant le service inopérant, par intermittence ou par recours à
une solution de contournement.
Est dit « mineur » un incident provoquant une simple altération de la qualité de service, le
service demeurant malgré tout opérationnel.
Les délais exigés par le Ministère sont les suivants :
CorrectifDélai de prise en compte et
diagnosticDélai de correction
Incident bloquant priorité
critique1 heure ouvrée3 heures ouvrées
Incident bloquant priorité
forte2 heure ouvrées6 heures ouvrées
Incident majeur7h ouvrées16 heures ouvrées
Incident(s) mineur(s) par lots1 jour ouvré40 heures ouvrées
CDA - Activité 2
2024
16/18B. MAINTENANCE ÉVOLUTIVE
Concernant la maintenance évolutive, chaque demande fera l’objet d’un ticket, puis d’une analyse par
le prestataire avec une proposition de prestations :



Documentation fonctionnelle et technique
Délai de mise en œuvre
Coût associé
Le prestataire devra également faire force de propositions concernant la pérennité du logiciel en
effectuant une veille technologique adaptée aux besoins du Ministère.
C. PILOTAGE
Le prestataire devra proposer des tableaux de bord de suivi de la maintenance corrective et évolutive
à travers l’outil de ticketing ou un outil tiers de son choix.
VIII. LIVRABLES
1) Activité 1 : Concevoir les solutions logicielles
Les livrables attendus pour l’activité 1 sont les suivants :

Un cahier des charges complet incluant (à minima) :
 Recueil et analyse du besoin
o La remise en contexte du projet, ses objectifs et enjeux
o Les parties prenantes, leurs interactions et leur communication
o Les besoins exprimés et reformulés, ainsi qu’une priorisation de ceux-ci
o Toutes les contraintes identifiées et formulées : fonctionnelles, techniques,
organisationnelles, budgétaires, etc.
 Un document de spécifications fonctionnelles et techniques incluant :
o L’analyse fonctionnelle générale (UML)
o L’analyse fonctionnelle détaillée en vue du développement du logiciel
(fonctionnalités, règles de gestion, données, ergonomie, mockups, etc.) pour les 2
modules obligatoires (comptes utilisateurs et informations) et un module
facultatif au choix.
o L’analyse technique intégrant la structuration Design Pattern du logiciel et la
structuration des données (MCD)
o La gestion des données personnelles et sensibles
De plus une soutenance orale aura lieu pour présenter la production réalisée.
Cahier des charges
Besoins exprimés
CDA - Activité 2
Analyse du besoin
Spécifications fonctionnelles
2024
Architecture logicielle
17/182) Activité 2 : Développer et tester les applications informatiques :
Les livrables attendus pour l’activité 2 sont les suivants :



Un prototype fonctionnel de l’application incluant les 2 modules obligatoires (comptes
utilisateurs et informations) et un module facultatif au choix
Une documentation technique incluant :
o La modélisation physique de la base de données : MLD
o Un comparatif des solutions techniques envisagées avec critères de sélection et
argumentation du choix final
o Un guide d’installation
Une documentation relative à la livraison, incluant :
o Un cahier de tests incluant des scenarii de tests complets pour les 2 modules
obligatoires (comptes utilisateurs et informations) et un module facultatif au choix
o Une procédure de validation incluant un modèle de PV de recette
De plus une soutenance orale aura lieu pour présenter la production réalisée.
Prototype fonctionnel
Documentation
technique
(modélisation,
comparatif, guide
d'installation)
Cahier de tests
Procédure de
validation
Remarque importante concernant le prototype
Pour la réalisation du prototype fonctionnel, il n’est pas nécessaire que les technologies envisagées
dans la documentation technique soient respectées. Vous pourrez donc développer le prototype
dans une autre architecture technique, peut-être plus simple ou plus rapide à prendre en main.
3) Activité 3 : Déployer et sécuriser les applications informatiques
Les livrables attendus pour l’activité 3 sont les suivants :



Un plan de déploiement intégrant la description de l’architecture et des environnements mis
en place, des outils de versioning et d’automatisation configurés
Un plan de maintenance incluant un outil logiciel de gestion des évolutions de l’application et
de ticketing pour gérer et traiter les incidents et demandes d’évolution. La méthodologie de
gestion des incidents doit également être présentée.
Un plan de sécurisation incluant les risques de sécurité identifiés, les bonnes pratiques et
actions préventives mises en œuvre, ainsi que le traitement des incidents de sécurité
(méthodologie, communication, escalade d’informations, etc.)
Remarque : les outils logiciels (versioning, automatisation et ticketing) devront être configurés et
présenté lors de la soutenance orale qui permettra de présenter la production réalisée dans le cadre
de cette activité 3 :
Plan de déploiement
CDA - Activité 2
Plan de
maintenance
Plan de sécurisation
2024
Outils logicels
18/18