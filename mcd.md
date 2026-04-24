# CESIZen — Modèle Conceptuel de Données (MCD)

## Diagramme entité-association

```
                              ┌─────────────────────┐
                              │     UTILISATEUR      │
                              ├─────────────────────┤
                              │ id (PK)             │
                              │ nom                 │
                              │ email (UNIQUE)      │
                              │ mot_de_passe_hash   │
                              │ rôle                │
                              │ est_actif           │
                              │ créé_le             │
                              │ modifié_le          │
                              └────────┬────────────┘
                                       │
              ┌────────────┬───────────┼───────────┬────────────┐
              │            │           │           │            │
              │ 0,N        │ 0,N       │ 0,N       │ 0,N        │ 0,N
              ▼            ▼           ▼           ▼            ▼
        ┌──────────┐ ┌────────┐ ┌────────────┐ ┌────────────────┐ ┌──────────┐
        │  TOKEN   │ │ FAVORI │ │   DÉFI     │ │    SESSION     │ │  TOKEN   │
        │  RESET   │ │        │ │RESPIRATION │ │  RESPIRATION   │ │  RESET   │
        ├──────────┤ ├────────┤ ├────────────┤ ├────────────────┤ └──────────┘
        │id (PK)   │ │id (PK) │ │id (PK)     │ │id (PK)         │
        │token     │ │créé_le │ │exercice_id │ │exercice_id     │
        │expire    │ └───┬────┘ │nom_exercice│ │cycles          │
        │utilisé   │     │      │fois_par_j  │ │durée_secondes  │
        │créé_le   │     │      │jours_par_s │ │complété_le     │
        └──────────┘     │      │cycles_sess │ └───────┬────────┘
                         │      │est_actif   │         │
                         │      │créé_le     │         │
                         │ 0,N  │modifié_le  │         │ 0,N
                         │      └─────┬──────┘         │
                         │            │                │
                         │            │ 0,1            │
                         │            └────────────────┘
                         │
                         │ 1,1
                         ▼
                   ┌──────────┐
                   │ ARTICLE  │
                   │  SANTÉ   │
                   ├──────────┤
                   │id (PK)   │
                   │titre     │
                   │slug (UQ) │
                   │contenu   │
                   │catégorie │
                   │image_url │
                   │statut    │
                   │créé_le   │
                   │modifié_le│
                   └────┬─────┘
                        │
                        │ 0,N
                        ▼
                  ┌──────────┐
                  │ ÉLÉMENT  │
                  │  MENU    │
                  ├──────────┤
                  │id (PK)   │
                  │label     │
                  │ordre     │
                  │créé_le   │
                  └──────────┘


                  ┌──────────────────┐
                  │    EXERCICE      │
                  │   RESPIRATION    │
                  ├──────────────────┤
                  │id (PK)           │
                  │code (UNIQUE)     │
                  │nom               │
                  │description       │
                  │inspire (sec)     │
                  │rétention (sec)   │
                  │expire (sec)      │
                  │catégorie         │
                  │bénéfice          │
                  │couleur           │
                  │est_actif         │
                  │ordre             │
                  │créé_le           │
                  │modifié_le        │
                  └──────────────────┘
```

---

## Entités et attributs détaillés

### UTILISATEUR (`users`)
| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | UUID | PK, auto-généré |
| nom | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| mot_de_passe_hash | VARCHAR(255) | NOT NULL |
| rôle | ENUM(utilisateur, administrateur) | NOT NULL, défaut: utilisateur |
| est_actif | BOOLEAN | NOT NULL, défaut: true |
| créé_le | TIMESTAMP | NOT NULL, défaut: now() |
| modifié_le | TIMESTAMP | NOT NULL, défaut: now() |

### TOKEN_RÉINITIALISATION (`password_reset_tokens`)
| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | UUID | PK, auto-généré |
| utilisateur_id | UUID | FK → users (CASCADE) |
| token | VARCHAR(255) | NOT NULL, UNIQUE |
| expire_le | TIMESTAMP | NOT NULL |
| utilisé | BOOLEAN | NOT NULL, défaut: false |
| créé_le | TIMESTAMP | NOT NULL, défaut: now() |

### ARTICLE_SANTÉ (`info_pages`)
| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | UUID | PK, auto-généré |
| titre | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(255) | NOT NULL, UNIQUE |
| contenu | TEXT | NOT NULL |
| catégorie | ENUM(alimentation, sport, meditation, stress, general) | NOT NULL, défaut: general |
| image_url | VARCHAR(500) | NULLABLE |
| statut | ENUM(published, draft) | NOT NULL, défaut: draft |
| créé_le | TIMESTAMP | NOT NULL, défaut: now() |
| modifié_le | TIMESTAMP | NOT NULL, défaut: now() |

### FAVORI (`favorites`)
| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | UUID | PK, auto-généré |
| utilisateur_id | UUID | FK → users (CASCADE) |
| article_id | UUID | FK → info_pages (CASCADE) |
| créé_le | TIMESTAMP | NOT NULL, défaut: now() |

### ÉLÉMENT_MENU (`menu_items`)
| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | UUID | PK, auto-généré |
| label | VARCHAR(255) | NOT NULL |
| article_id | UUID | FK → info_pages (CASCADE) |
| ordre_affichage | INTEGER | NOT NULL, défaut: 0 |
| créé_le | TIMESTAMP | NOT NULL, défaut: now() |

### EXERCICE_RESPIRATION (`breathing_exercises`)
| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | UUID | PK, auto-généré |
| code | VARCHAR(20) | NOT NULL, UNIQUE |
| nom | VARCHAR(100) | NOT NULL |
| description | TEXT | NOT NULL |
| inspire | INTEGER | NOT NULL (secondes) |
| rétention | INTEGER | NOT NULL, défaut: 0 (secondes) |
| expire | INTEGER | NOT NULL (secondes) |
| catégorie | ENUM(basic, advanced) | NOT NULL, défaut: basic |
| bénéfice | VARCHAR(100) | NOT NULL |
| couleur | VARCHAR(100) | NOT NULL |
| est_actif | BOOLEAN | NOT NULL, défaut: true |
| ordre_affichage | INTEGER | NOT NULL, défaut: 0 |
| créé_le | TIMESTAMP | NOT NULL, défaut: now() |
| modifié_le | TIMESTAMP | NOT NULL, défaut: now() |

### DÉFI_RESPIRATION (`breathing_challenges`)
| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | UUID | PK, auto-généré |
| utilisateur_id | UUID | FK → users (CASCADE) |
| exercice_id | VARCHAR(20) | NOT NULL |
| nom_exercice | VARCHAR(100) | NOT NULL |
| fois_par_jour | INTEGER | NOT NULL, défaut: 1 |
| jours_par_semaine | INTEGER | NOT NULL, défaut: 7 |
| cycles_par_session | INTEGER | NOT NULL, défaut: 6 |
| est_actif | BOOLEAN | NOT NULL, défaut: true |
| créé_le | TIMESTAMP | NOT NULL, défaut: now() |
| modifié_le | TIMESTAMP | NOT NULL, défaut: now() |

### SESSION_RESPIRATION (`breathing_logs`)
| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | UUID | PK, auto-généré |
| utilisateur_id | UUID | FK → users (CASCADE) |
| défi_id | UUID | FK → breathing_challenges (SET NULL), NULLABLE |
| exercice_id | VARCHAR(20) | NOT NULL |
| cycles | INTEGER | NOT NULL |
| durée_secondes | INTEGER | NOT NULL |
| complété_le | TIMESTAMP | NOT NULL, défaut: now() |

---

## Relations (cardinalités)

| Relation | Entité A | Cardinalité | Entité B | Règle de suppression |
|----------|----------|-------------|----------|---------------------|
| demande_reset | UTILISATEUR | 1,1 → 0,N | TOKEN_RÉINITIALISATION | CASCADE |
| ajoute_favori | UTILISATEUR | 1,1 → 0,N | FAVORI | CASCADE |
| concerne | ARTICLE_SANTÉ | 1,1 → 0,N | FAVORI | CASCADE |
| affiché_dans | ARTICLE_SANTÉ | 1,1 → 0,N | ÉLÉMENT_MENU | CASCADE |
| se_fixe | UTILISATEUR | 1,1 → 0,N | DÉFI_RESPIRATION | CASCADE |
| complète | UTILISATEUR | 1,1 → 0,N | SESSION_RESPIRATION | CASCADE |
| lié_à | DÉFI_RESPIRATION | 0,1 → 0,N | SESSION_RESPIRATION | SET NULL |

---

## Enums PostgreSQL

| Enum | Valeurs |
|------|---------|
| `user_role` | utilisateur, administrateur |
| `page_status` | published, draft |
| `page_category` | alimentation, sport, meditation, stress, general |
| `exercise_category` | basic, advanced |

---

## Règles de gestion

1. Un **utilisateur** peut avoir le rôle `utilisateur` ou `administrateur`
2. Un **email** est unique dans le système
3. Un **mot de passe** est haché avec bcryptjs avant stockage
4. La **suppression d'un utilisateur** entraîne la suppression en cascade de toutes ses données (tokens, favoris, défis, sessions de respiration)
5. Un **token de réinitialisation** expire après 1 heure et ne peut être utilisé qu'une seule fois
6. Un **article santé** peut être en statut `published` (visible publiquement) ou `draft` (visible uniquement par l'admin)
7. Un **favori** est un lien unique entre un utilisateur et un article (toggle)
8. Un **élément de menu** pointe vers un article et définit son ordre d'affichage dans le header
9. Un **exercice de respiration** est défini par 3 durées : inspiration, rétention, expiration (en secondes)
10. Un **défi de respiration** définit un objectif : nombre de fois par jour × jours par semaine × cycles par session
11. Une **session de respiration** peut être liée à un défi (optionnel) — si le défi est supprimé, le lien passe à NULL
12. L'**exercice de respiration** est une entité indépendante administrable (CRUD par l'admin)
