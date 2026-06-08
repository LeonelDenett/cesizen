# Ticket #003 — Correctif de sécurité : headers HTTP

## Informations

| Champ | Valeur |
|-------|--------|
| **Titre** | Renforcer les headers de sécurité HTTP (CSP, HSTS, X-Frame-Options) |
| **Type** | Sécurité |
| **Priorité** | Critique |
| **Statut** | Résolu |
| **Créé le** | 2026-05-10 |

## Description

L'audit de sécurité interne a révélé que certains headers de protection contre les attaques courantes (XSS, clickjacking, MITM) ne sont pas encore configurés ou sont insuffisants sur l'application Next.js.

## Risques identifiés

| Risque | Sévérité | Description |
|--------|----------|-------------|
| XSS (Reflected / Stored) | Élevée | Absence de Content-Security-Policy (CSP) stricte. |
| Clickjacking | Moyenne | Manque de `X-Frame-Options: DENY` ou `SAMEORIGIN`. |
| MITM / downgrade | Moyenne | Pas de `Strict-Transport-Security` (HSTS). |
| Fuite d'informations | Faible | `X-Content-Type-Options: nosniff` manquant. |

## Reproduction / Preuve

1. Lancer l'application en local.
2. Exécuter : `curl -I http://localhost:3000/api/health`
3. Observer l'absence des headers suivants dans la réponse :
   - `Content-Security-Policy`
   - `X-Frame-Options`
   - `Strict-Transport-Security`
   - `X-Content-Type-Options`

## Solution appliquée

Les headers ont été configurés directement dans `next.config.ts` via la fonction `headers()` :

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` restrictive autorisant `images.unsplash.com` pour les images.

> **Note** : `Strict-Transport-Security` (HSTS) est laissé au reverse proxy (Nginx/Traefik) pour ne pas bloquer l'accès en développement sans HTTPS.

## Actions correctives

- [x] Ajouter les headers dans `next.config.ts`.
- [x] Vérifier le bon fonctionnement des ressources externes (Unsplash).
- [ ] Documenter la configuration dans `docs/deployment-plan.md` (à mettre à jour).
- [ ] Ajouter un test E2E vérifiant la présence des headers critiques.

## Branche proposée

`security/003-headers-http`

## Références

- OWASP Secure Headers Project
- MDN : Content-Security-Policy
- Next.js docs : `headers` in `next.config.js`

## Validation

- [ ] Tests E2E passants
- [ ] Vérification manuelle via `curl` et browser DevTools
- [ ] Scan Trivy / npm audit sans régression
