# RGPD — Registre des traitements et mesures CESIZen

## 1. Responsable du traitement

**CESIZen** (projet académique / MVP)  
Contact : admin@cesizen.fr

## 2. Données collectées

| Donnée | Finalité | Base légale | Durée de conservation |
|--------|----------|-------------|----------------------|
| Nom, Email | Authentification, personnalisation | Consentement (art. 6.1.a RGPD) | Durée du compte + 3 ans d'inactivité |
| Mot de passe | Sécurisation de l'accès | Exécution du contrat (art. 6.1.b) | Hashé — durée du compte |
| Émotions / Tracker | Suivi du bien-être personnel | Consentement explicite | 3 ans (anonymisation possible) |
| Logs de respiration | Historique des exercices | Consentement | 2 ans |
| Cookies de session | Maintien de la connexion | Intérêt légitime (art. 6.1.f) | Session / 30 jours (remember me) |

## 3. Mesures techniques et organisationnelles

### 3.1 Sécurité

- **Hashage des mots de passe** : `bcryptjs` avec salt rounds ≥ 10.
- **Sessions signées** : `NEXTAUTH_SECRET` de 32+ caractères généré aléatoirement.
- **Transport chiffré** : TLS 1.2+ obligatoire en production (via reverse proxy).
- **Base de données** : port non exposé publiquement (`127.0.0.1:5477`), accès restreint au réseau Docker interne.
- **Conteneurisation** : utilisateur non-root (UID 1001), image minimale (Alpine).

### 3.2 Minimisation et droits des utilisateurs

- **Consentement** : modal RGPD affichée à l'inscription (case obligatoire).
- **Minimisation** : seules les données strictement nécessaires au service sont collectées.
- **Droit à l'accès** : l'utilisateur peut consulter son profil (`/profile`) et télécharger ses données (à implémenter via `/api/account/export`).
- **Droit à l'effacement** : endpoint `/api/account` (méthode DELETE) permettant la suppression complète du compte et de ses données associées (émotions, favoris, logs).
- **Droit à la rectification** : formulaire de profil permettant la modification du nom et de l'email.

### 3.3 Transferts de données

- Aucun transfert hors UE.
- Images des articles : hébergées sur `images.unsplash.com` (service US — attention, pour un vrai projet il faudrait un DPA ou héberger les images en UE).

## 4. Registre des traitements

| Traitement | Données | Catégorie de personnes | Destinataires | Mesures |
|------------|---------|----------------------|---------------|---------|
| Création de compte | Email, nom, hash mdp | Utilisateurs | Admin (lecture restreinte) | Hashage, RBAC |
| Tracker d'émotions | Émotions, notes, dates | Utilisateurs connectés | Aucun (interne) | Pseudonymisation (userId) |
| Exercices de respiration | Durée, type, dates | Utilisateurs connectés | Aucun (interne) | Pseudonymisation |
| Favoris | Références articles | Utilisateurs connectés | Aucun (interne) | Clés étrangères anonymisées |

## 5. Politique de conservation et suppression

- **Compte actif** : données conservées indéfiniment (tant que l'utilisateur se connecte).
- **Compte inactif** : suppression automatique programmée après 3 ans d'inactivité (cron ou tâche planifiée à mettre en place en production).
- **Suppression manuelle** : immédiate via le bouton "Supprimer mon compte" dans le profil.
- **Anonymisation** : possibilité de remplacer l'email par un hash et de supprimer les notes textuelles du tracker tout en conservant les statistiques agrégées (pour la recherche).

## 6. Communication en cas de violation

En cas de violation de données personnelles :
1. **Détection** : monitoring des logs + alertes healthcheck.
2. **Évaluation** : déterminer la nature et l'ampleur de la fuite dans les 24h.
3. **Notification CNIL** : sous 72h si risque élevé pour les droits et libertés (art. 33 RGPD).
4. **Notification utilisateurs** : message sur l'application + email si adresse disponible.
5. **Documentation** : ticket d'incident sécurité + mise à jour du registre.

## 7. Checklist RGPD — Avant chaque mise en production

- [ ] Consentement explicite vérifié sur le formulaire d'inscription.
- [ ] Droit à l'effacement testé (suppression compte + cascade).
- [ ] Variables sensibles (`NEXTAUTH_SECRET`, `DATABASE_URL`) injectées par l'environnement, jamais dans le code.
- [ ] Logs d'accès sans données personnelles (pas d'email dans les logs stdout).
- [ ] Backup de la base chiffré ou stocké dans un environnement sécurisé.

---
*Document RGPD — CESIZen — Juin 2026*
*À jour avec le règlement (UE) 2016/679*
