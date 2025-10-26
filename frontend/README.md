# Frelsi

Un site personnel one-page pour partager des notebooks, dessins et idées. Design convivial avec animations sophistiquées et authentification admin.

## ✨ Fonctionnalités

### Public
- **Hero animé** : 
  - Titre "Frelsi" avec animation typewriter élégante
  - 4 doodles créatifs qui flottent doucement sur les côtés
  - Tagline avec fade-in progressif
  - Bouton Discover avec effet hover scale
  
- **Exemples** : 
  - Grille responsive affichant les 6 premiers contenus publics
  - Animations au scroll (Intersection Observer)
  - Chaque carte arrive avec un slide-up décalé
  - Hovers sophistiqués : scale, shadow, gradient border reveal
  - Card-left qui s'anime au hover
  
- **Discover** : 
  - Section filtrable avec fade-in au scroll
  - Filtres par type (notebook/drawing/idea) + recherche textuelle
  - Gallery grid avec animations d'apparition progressives
  - Focus states sur les inputs
  
- **Design responsive** : 
  - Adapté mobile et desktop
  - Doodles masqués sur mobile pour clarté

### Admin (avec authentification)
- **Login requis** : Modal d'authentification sécurisée
- **Dashboard** : 
  - Vue d'ensemble avec 3 stat cards animées (total, public, private)
  - Bouton Logout
  - Interface claire et moderne
- **Gestion des contenus** :
  - Créer des notebooks (éditeur riche avec texte, images, dessins sur canvas)
  - Créer des dessins (upload d'image ou URL, prévisualisation)
  - Créer des idées (titre + texte)
- **Actions** :
  - Toggle public/private pour chaque item
  - Update : modifier n'importe quel contenu
- **Persistance locale** : Données sauvegardées dans localStorage

## 🎨 Animations & Effets

### Au chargement
1. **Hero** : Fade-in + typewriter "Frelsi" (160ms/lettre)
2. **Doodles** : Apparition en fondu avec float perpétuel (6-8s cycles)
3. **Tagline** : Fade-in avec délai de 0.3s
4. **Bouton Discover** : Fade-in avec délai de 0.5s

### Au scroll (Intersection Observer)
- **Section Examples** : Slide-up dès qu'elle entre dans le viewport
- **Chaque carte** : Slide-up + scale avec délais progressifs (0.1s-0.6s)
- **Section Discover** : Fade-in global
- **Gallery items** : Apparition progressive au scroll

### Hovers interactifs
- **Cards** : 
  - Transform: translateY(-8px) + scale(1.02)
  - Gradient border reveal
  - Card-left scale(1.05) avec gradient shift
  - Meta badge translateX + background change
  - Titre change de couleur vers accent
- **Boutons** : 
  - Scale(1.05) avec shadow expansion
  - Gradient overlay reveal
  - Active state: scale(0.95)
- **Inputs/Select** : 
  - Border-color vers accent
  - Box-shadow focus ring

### Doodles créatifs
4 illustrations SVG uniques positionnées stratégiquement :
1. **Top-left** : Lignes organiques fluides avec cercles et carrés
2. **Top-right** : Spirale avec formes géométriques et étoile
3. **Bottom-left** : Blob shape + œil abstrait + traits expressifs
4. **Bottom-right** : Visage conceptuel + lignes d'énergie + flèche

## � Contenu par défaut

Le site seed automatiquement avec 5 notebooks/idées riches :

1. **"Réflexions sur l'Innovation"** - Notebook avec liste, citations Einstein
2. **"Notes de Voyage Imaginaire"** - Notebook poétique avec blockquote
3. **"Projet: Jardins Urbains Connectés"** - Idée concrète avec impact
4. **"Méditations Matinales"** - Notebook avec routine, insight box stylé
5. **"Design: Interface sans Écran"** - Idée innovante sur interactions futures

## �🔐 Identifiants Admin (démo)

```
Username: admin
Password: admin123
```

> **Note** : Ces identifiants sont temporaires (hardcodés côté front). Ils seront remplacés par une vraie authentification backend plus tard.

## 🚀 Installation

```bash
cd C:\Users\k250079\Desktop\Projects\frelsi\frelsi
npm install
```

## 💻 Développement

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:5173/`

## 📦 Build

```bash
npm run build
npm run preview
```

## � Structure technique

### Technologies
- **React 18** avec hooks (useState, useEffect, useRef, useImperativeHandle)
- **Vite 5** pour le dev et build ultra-rapide
- **CSS3** avec animations, transitions, transforms
- **Intersection Observer API** pour animations au scroll
- **localStorage** pour persistance locale

### Architecture des animations
```javascript
// Typewriter hero
useEffect → setInterval → slice progressif du titre

// Scroll-triggered
IntersectionObserver → classe .visible → CSS transitions

// Hovers
CSS :hover → transforms + box-shadows + gradients
```

## 📝 Types de contenus

### Notebook
- Éditeur riche (texte formaté, titres, images flottantes)
- Mode dessin intégré sur canvas
- Export/import HTML
- Support bold, italic, underline, H1, H2

### Drawing
- Upload d'image locale (converti en Data URL)
- Support URL externe
- Prévisualisation et suppression
- Remplacement d'image facile

### Idea
- Titre + texte libre
- Format simple et rapide
- Parfait pour brainstorming

## 🎯 Roadmap

- [ ] Backend avec vraie authentification (JWT, bcrypt)
- [ ] Base de données (MongoDB/PostgreSQL)
- [ ] Upload d'images sur serveur/CDN
- [ ] Export PDF des notebooks
- [ ] Tags et catégories avancées
- [ ] Recherche full-text
- [ ] Mode sombre
- [ ] Animations GSAP/Framer Motion pour encore plus de fluidité
- [ ] Lazy loading des images
- [ ] Optimisation performance (React.memo, useMemo)

## 👤 Auteur

**Lakhdar Berache**
- LinkedIn: [À venir]
- GitHub: [À venir]

---

Made with ❤️ using React + Vite

*Design philosophy: Simple, attachant, innovant* It contains:

- Login screen (frontend only)
- Home page with a card list and navbar (New / Update / View / Generate buttons)

How to run:

1. cd into the project folder
2. npm install
3. npm run dev

Notes:
- This repo implements the initial frontend (login + home) only. No backend or AI integration yet.
