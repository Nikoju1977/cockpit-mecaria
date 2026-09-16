# Cockpit MECARIA

Cockpit de direction de site pour un atelier d'usinage de précision : qualité, métrologie, production, flux, SAV, amélioration continue et IA gouvernée. Application web en un seul fichier (`index.html`), sans serveur ni dépendance à installer.

## Modules

- **Pilotage** : tableau de bord, revue de direction (ISO 9001 § 9.3.2), agents de contrôle, fil d'affaire.
- **Qualité** : matrice exigences/preuves, NC, audits, métrologie (échéances d'étalonnage), SAV et 8D.
- **Amélioration** : les 7 outils de base (feuille de relevé, histogramme, Pareto, Ishikawa 6M, dispersion, cartes de contrôle, stratification), QQOQCP et 5 Pourquoi, MSP et capabilité (Cp, Cpk, Pp, Ppk), étude R&R (AIAG), AMDEC, TRS, 5S, PDCA, DMAIC.
- **Flux** : commercial, industrialisation, méthodes, production, logistique.
- **Système** : ERP, machines connectées (lecture seule), gouvernance IA, journal.

## Données

- Stockées dans le navigateur (IndexedDB), **non chiffrées** et non partagées entre postes.
- Export et import JSON pour les sauvegardes ; export CSV par registre.
- Le rôle est déclaratif : ce n'est pas une authentification.

## IA gouvernée

- Désactivée par défaut ; activation par décision enregistrée de la direction, avec date de réexamen.
- Fournisseurs autorisés par l'entreprise (Mistral, Groq, Cerebras) ; clés chiffrées AES-256-GCM dans le navigateur, jamais exportées.
- Pseudonymisation, exclusion des fiches « IA interdite » et « Défense / export contrôlé », validation humaine obligatoire, registre des traitements.
- Exigences applicables à qualifier : AI Act, RGPD, ISO 9001, EN 9100, ISO/IEC 27001 et 42001, contrôle des exportations.

## Limites

L'application ne vaut pas preuve de conformité sans validation par le système qualité. Avant un usage multi-utilisateur : serveur, authentification, chiffrement et sauvegardes.

---
Studio Niko Design
