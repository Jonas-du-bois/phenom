<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Phenom App - Structure des Pages (Mobile First PWA)

## Design System

**Couleurs**:

- Fond principal: `bg-[#000000]` (noir pur)
- Fond alternatif: `bg-[#080A0E]` (navy foncé)
- Accent: `text-[#00F0FF]` (cyan)
- Bordures: `border-white/10`
- Texte: `text-white`, `text-white/60`, `text-white/40`

**Typographie**: Inter, uppercase pour labels, tracking-wider `0.1em`

***

## 1. Feed Principal (`/feed`)

**Fonctionnalités**:

- Scroll vertical infini (une observation sous l'autre)
- Chaque post (pleine largeur mobile):
    - Image plein écran (ratio 4:3, Cloudinary)
    - Header: avatar + nom + localisation (inline)
    - Date relative ("il y a 2h")
    - Description (max 3 lignes, "voir plus")
    - Métadonnées visuelles:
        - Chips formes UFO (`ufoShapes`)
        - Durée formatée (`duration`)
        - Score crédibilité (jauge 0-15)
    - Compteur commentaires
- Boutons d'action (barre horizontale):
    - Commenter
    - Partager
    - Sauvegarder
- Filtres sticky top:
    - Tout
    - Récent (24h)
    - Proche (géoloc)
- Pull-to-refresh

**API**: `GET /api/v1/observations?page={n}&limit=20`

***

## 2. Explore (`/explore`)

**Fonctionnalités**:

- Barre de recherche (sticky top)
- Liste verticale d'observations (une sous l'autre, pas de grille)
- Sections scrollables:
    - Trending (5 cards verticales)
    - Près de toi (liste)
    - Tags populaires (chips horizontales)
- Filtres avancés (bottom sheet ou modal):
    - Pays, locale, formes UFO
    - Types observateurs, phénomènes
    - Période (date picker)
    - Crédibilité (range 0-15 avec inputs numériques)
    - Étrangeté (range 0-10 avec inputs numériques)
    - Durée (en secondes, inputs numériques)
    - Toggles: avec coordonnées, avec images
- Tri: date, crédibilité, étrangeté

**API**: `GET /api/v1/observations?search={query}&...`

***

## 3. Caméra/Nouvelle Observation (`/camera`)

**Fonctionnalités**:

### Étape 1 - Capture

- Caméra plein écran
- Overlay minimal: switch caméra, flash
- Bouton capture (grand, centré bas)
- Bouton "Galerie" (petit, coin)


### Étape 2 - Édition

- Prévisualisation image
- Outils de dessin/marquage
- Bouton "Suivant"


### Étape 3 - Formulaire

Champs:

- **Date** (date picker, auto-remplie)
- **Heure** (time picker HH:MM, auto-remplie)
- **Localisation GPS** (auto, carte ajustable)
- **Pays** (text input, auto)
- **Type de lieu** (select `locale`)
- **Description** (textarea 10-5000 chars)
- **Durée** (input numérique en secondes + conversion affichée "2min 30s")
- **Types observateurs** (multi-select avec chips)
- **Formes UFO** (multi-select avec icônes)
- **Phénomènes** (input tags)
- **Crédibilité** (input numérique 0-15)
- **Étrangeté** (input numérique 0-10)

Boutons:

- "Publier" (sticky bottom, pleine largeur)
- "Annuler" (top left)

**API**:

- `POST /api/v1/observations`
- `POST /api/v1/observations/:id/images`

***

## 4. Détail Observation (`/observation/:id`)

**Fonctionnalités**:

- Header sticky:
    - Avatar + nom
    - Date
    - Menu (⋮): partager, signaler, supprimer
- Galerie photos:
    - Swipe horizontal si multiple
    - Pinch-to-zoom
    - Indicateurs (dots)
- Métadonnées (section):
    - 📍 Localisation (tap → carte)
    - 📅 Date/heure exacte
    - ⏱️ Durée
    - 🛸 Formes (chips)
    - 👁️ Types observateurs (chips)
    - Jauges crédibilité/étrangeté
- Description complète
- Commentaires:
    - Liste chronologique
    - Input sticky bottom (si auth)
    - Swipe left pour supprimer (si auteur/admin)
- Observations similaires (carrousel horizontal)

**API**:

- `GET /api/v1/observations/:id`
- `GET /api/v1/observations/:id/comments`
- `POST /api/v1/observations/:id/comments`
- `DELETE /api/v1/comments/:id`

***

## 5. Carte (`/map`)

**Fonctionnalités**:

- Carte plein écran
- Markers avec clustering
- Icônes selon forme UFO
- Popup: miniature + bouton "Voir"
- Filtres (drawer bottom):
    - Rayon (slider km)
    - Période
- Bouton "Ma position"
- Basculer en liste

**API**: `GET /api/v1/observations/nearby`

***

## 6. Alertes (`/alerts`)

**Fonctionnalités**:

- Section proximité:
    - Liste observations proches
    - Badge compteur
- Section notifications:
    - Commentaires
    - Réponses
- Swipe pour supprimer
- WebSocket temps réel

**API**:

- `GET /api/v1/observations/nearby`
- WebSocket

***

## 7. Profil (`/profile`)

**Fonctionnalités**:

- Header:
    - Photo profil (grande)
    - Nom, rôle
    - Bouton "Modifier"
- Stats (inline):
    - Observations
    - Commentaires
- Liste observations (verticale, une sous l'autre)
- Pull-to-refresh

**API**:

- `GET /api/v1/auth/me`
- `GET /api/v1/users/me/observations`

***

## 8. Connexion (`/login`)

**Fonctionnalités**:

- Logo (grand, centré)
- Input email
- Input mot de passe (toggle visibilité)
- Checkbox "Se souvenir"
- Bouton "Connexion" (pleine largeur)
- Lien "Mot de passe oublié"
- Lien inscription

**API**: `POST /api/v1/auth/login`

***

## 9. Inscription (`/signup`)

**Fonctionnalités**:

- Logo
- Input nom (3-50 chars)
- Input email
- Input mot de passe (indicateur force)
- Confirmation mot de passe
- Checkbox CGU
- Bouton "S'inscrire"
- Lien connexion

**API**: `POST /api/v1/auth/signup`

***

## 10. Paramètres (`/settings`)

**Fonctionnalités**:

- Liste sections:
    - Compte (nom, email, mot de passe)
    - Notifications (push, types, rayon alertes)
    - Confidentialité (localisation)
    - Apparence (mode sombre/clair)
    - À propos (version, CGU, déconnexion)

**API**:

- `PUT /api/v1/users/me`
- `POST /api/v1/auth/logout`

***

## 11. Admin (`/admin`)

**Fonctionnalités**:

- Dashboard stats
- Liste observations (verticale)
- Liste utilisateurs
- Actions: supprimer, changer rôle

**API**:

- `GET /api/v1/admin/stats`
- `DELETE /api/v1/admin/observations/:id`
- `PUT /api/v1/admin/users/:id/role`

***

## Navigation

**Bottom Tab Bar** (fixe):

1. Feed (🏠)
2. Explore (🔍)
3. Caméra (➕ central)
4. Alertes (🔔 + badge)
5. Profil (👤)

**Pas de**: likes, mentions, heatmap, brouillons
<span style="display:none">[^1][^2][^3]</span>

<div align="center">⁂</div>

[^1]: COMPONENTS_LIBRARY.md

[^2]: STYLES_REFERENCE.md

[^3]: DESIGN_SYSTEM.md

