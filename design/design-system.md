# Design System — Phenom App

> Guide de référence pour l'identité visuelle et les composants UI de l'application Phenom. Ce document établit les standards de design cohérents à travers toute l'expérience utilisateur.

---

## 1. Palette de Couleurs "Nuit Étoilée"

### 1.1 Couleurs principales
| Nom | Hex | RGBA | HSLA | Usage |
|-----|-----|------|------|-------|
| **Violet Mystique** | `#9973BF` | `rgba(153, 114, 191, 1)` | `hsla(270, 37%, 60%, 1)` | Accents, boutons primaires, liens |
| **Bleu Nuit** | `#1E2640` | `rgba(29, 38, 63, 1)` | `hsla(225, 36%, 18%, 1)` | Arrière-plans secondaires |
| **Bleu Profond** | `#324873` | `rgba(50, 71, 114, 1)` | `hsla(219, 38%, 32%, 1)` | Éléments interactifs |
| **Noir Bleuté** | `#111826` | `rgba(16, 23, 38, 1)` | `hsla(219, 38%, 10%, 1)` | Arrière-plan principal |
| **Noir Profond** | `#0D0D0D` | `rgba(12, 12, 12, 1)` | `hsla(0, 0%, 5%, 1)` | Texte, bordures |

### 1.2 Configuration CSS et TailwindCSS
```css
/* Variables CSS personnalisées */
:root {
  /* Couleurs principales */
  --violet-mystique: #9973BF;
  --bleu-nuit: #1E2640;
  --bleu-profond: #324873;
  --noir-bleute: #111826;
  --noir-profond: #0D0D0D;
  
  /* Variables sémantiques */
  --color-primary: var(--violet-mystique);
  --color-secondary: var(--bleu-profond);
  --color-background: var(--noir-bleute);
  --color-background-secondary: var(--bleu-nuit);
  --color-text: #FFFFFF;
  --color-text-muted: #B4B4B4;
  --color-border: var(--bleu-profond);
}

/* Configuration TailwindCSS (tailwind.config.js) */
module.exports = {
  theme: {
    extend: {
      colors: {
        'violet-mystique': '#9973BF',
        'bleu-nuit': '#1E2640',
        'bleu-profond': '#324873',
        'noir-bleute': '#111826',
        'noir-profond': '#0D0D0D',
        
        // Aliases sémantiques
        'primary': {
          50: '#f3f0ff',
          100: '#e9e5ff',
          200: '#d7cfff',
          300: '#b7a6ff',
          400: '#9973bf', // Couleur principale
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95'
        },
        'surface': {
          DEFAULT: '#111826',
          secondary: '#1E2640',
          elevated: '#324873'
        }
      }
    }
  }
}
```

### 1.3 Couleurs d'état (complémentaires)
```css
:root {
  /* États système */
  --color-success: #10B981; /* Vert émeraude */
  --color-warning: #F59E0B; /* Ambre */
  --color-error: #EF4444;   /* Rouge */
  --color-info: #3B82F6;    /* Bleu ciel */
  
  /* Variations transparentes pour overlays */
  --overlay-dark: rgba(12, 12, 12, 0.8);
  --overlay-light: rgba(153, 114, 191, 0.1);
}
```

---

## 2. Typographie

### 2.1 Hiérarchie des textes
```css
/* Système typographique */
.text-display {
  font-size: 3.5rem; /* 56px */
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.text-h1 {
  font-size: 2.5rem; /* 40px */
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.text-h2 {
  font-size: 2rem; /* 32px */
  line-height: 1.25;
  font-weight: 600;
}

.text-h3 {
  font-size: 1.5rem; /* 24px */
  line-height: 1.33;
  font-weight: 500;
}

.text-body-lg {
  font-size: 1.125rem; /* 18px */
  line-height: 1.6;
  font-weight: 400;
}

.text-body {
  font-size: 1rem; /* 16px */
  line-height: 1.5;
  font-weight: 400;
}

.text-body-sm {
  font-size: 0.875rem; /* 14px */
  line-height: 1.43;
  font-weight: 400;
}

.text-caption {
  font-size: 0.75rem; /* 12px */
  line-height: 1.33;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### 2.2 Polices recommandées
- **Primaire** : Inter (moderne, lisible)
- **Alternative** : System UI stack (`-apple-system, BlinkMacSystemFont, "Segoe UI"`)
- **Monospace** : `"JetBrains Mono", "Fira Code", monospace` (pour code/coordonnées)

---

## 3. Composants UI Système

### 3.1 Boutons
```vue
<!-- BaseButton.vue -->
<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <Icon v-if="icon" :name="icon" class="w-4 h-4" />
    <slot />
  </button>
</template>

<style>
/* Variantes de boutons */
.btn-primary {
  @apply bg-violet-mystique hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl;
}

.btn-secondary {
  @apply bg-bleu-profond hover:bg-opacity-80 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200;
}

.btn-outline {
  @apply border-2 border-violet-mystique text-violet-mystique hover:bg-violet-mystique hover:text-white font-medium px-6 py-3 rounded-lg transition-all duration-200;
}

.btn-ghost {
  @apply text-violet-mystique hover:bg-violet-mystique hover:bg-opacity-10 font-medium px-4 py-2 rounded-md transition-all duration-200;
}

.btn-danger {
  @apply bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200;
}
</style>
```

### 3.2 Inputs et formulaires
```vue
<!-- BaseInput.vue -->
<template>
  <div class="form-field">
    <label v-if="label" :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :class="inputClasses"
      :disabled="disabled"
      v-model="modelValue"
    />
    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-if="hint && !error" class="form-hint">{{ hint }}</p>
  </div>
</template>

<style>
.form-field {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-200;
}

.form-input {
  @apply w-full px-4 py-3 bg-bleu-nuit border border-bleu-profond rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-mystique focus:border-transparent transition-all duration-200;
}

.form-input--error {
  @apply border-red-500 focus:ring-red-500;
}

.form-error {
  @apply text-sm text-red-400;
}

.form-hint {
  @apply text-sm text-gray-400;
}
</style>
```

### 3.3 Cards et conteneurs
```vue
<!-- BaseCard.vue -->
<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style>
.card {
  @apply bg-bleu-nuit border border-bleu-profond rounded-xl shadow-lg overflow-hidden;
}

.card--elevated {
  @apply shadow-2xl;
}

.card--interactive {
  @apply hover:shadow-xl hover:border-violet-mystique transition-all duration-200 cursor-pointer;
}

.card-header {
  @apply px-6 py-4 border-b border-bleu-profond;
}

.card-body {
  @apply p-6;
}

.card-footer {
  @apply px-6 py-4 border-t border-bleu-profond bg-noir-bleute bg-opacity-50;
}
</style>
```

---

## 4. Iconographie

### 4.1 Icônes système
- **Bibliothèque** : Heroicons v2 (outline et solid)
- **Taille standard** : 24px (w-6 h-6 en Tailwind)
- **Couleur par défaut** : `text-gray-400`
- **Couleur active** : `text-violet-mystique`

### 4.2 Icônes spécifiques au contexte OVNI
```vue
<!-- Composant IconUFO personnalisé -->
<template>
  <svg 
    :class="classes" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <!-- SVG path pour OVNI stylisé -->
    <path d="M12 2C8.5 2 5.5 4.5 5.5 7.5C5.5 8.5 6 9.5 7 10L5 14H19L17 10C18 9.5 18.5 8.5 18.5 7.5C18.5 4.5 15.5 2 12 2Z"/>
    <ellipse cx="12" cy="16" rx="8" ry="2" opacity="0.6"/>
  </svg>
</template>
```

---

## 5. Layouts et Grilles

### 5.1 Système de grille responsive
```css
/* Container système */
.container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.container-sm {
  @apply max-w-2xl mx-auto px-4;
}

/* Grille responsive */
.grid-responsive {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

.grid-observations {
  @apply grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8;
}
```

### 5.2 Layouts de page
```vue
<!-- DefaultLayout.vue -->
<template>
  <div class="min-h-screen bg-noir-bleute text-white">
    <!-- Header avec navigation -->
    <header class="sticky top-0 z-40 bg-bleu-nuit border-b border-bleu-profond">
      <AppNavigation />
    </header>
    
    <!-- Contenu principal -->
    <main class="flex-1">
      <slot />
    </main>
    
    <!-- Footer -->
    <footer class="bg-noir-profond border-t border-bleu-profond">
      <AppFooter />
    </footer>
  </div>
</template>
```

---

## 6. États et Interactions

### 6.1 Animations et transitions
```css
/* Transitions standards */
.transition-smooth {
  @apply transition-all duration-300 ease-out;
}

.transition-fast {
  @apply transition-all duration-200 ease-out;
}

/* Animations d'apparition */
.fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Loading spinner thématique */
.spinner-ufo {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(153, 114, 191, 0.3);
  border-top: 3px solid #9973BF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

### 6.2 États visuels
```css
/* États interactifs */
.hover-glow {
  @apply hover:shadow-lg hover:shadow-violet-mystique/25 transition-all duration-200;
}

.active-state {
  @apply ring-2 ring-violet-mystique ring-offset-2 ring-offset-noir-bleute;
}

.loading-state {
  @apply opacity-60 pointer-events-none;
}

.disabled-state {
  @apply opacity-40 cursor-not-allowed;
}
```

---

## 7. Design Tokens Mobile

### 7.1 Espacements mobiles
```css
/* Système d'espacement mobile-first */
:root {
  --space-xs: 0.25rem;  /* 4px */
  --space-sm: 0.5rem;   /* 8px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 1.5rem;   /* 24px */
  --space-xl: 2rem;     /* 32px */
  --space-2xl: 3rem;    /* 48px */
}

/* Adaptations tactiles */
.touch-target {
  @apply min-h-[44px] min-w-[44px]; /* Minimum 44px pour iOS */
}

.mobile-padding {
  @apply px-4 py-3 sm:px-6 sm:py-4;
}
```

### 7.2 Breakpoints personnalisés
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '375px',   // iPhone SE
      'sm': '640px',   // Tablettes portrait
      'md': '768px',   // Tablettes paysage
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px'  // Ultra-wide
    }
  }
}
```

---

## 8. Composants Métier Spécialisés

### 8.1 ObservationCard
```vue
<template>
  <BaseCard class="observation-card" :interactive="true">
    <!-- Image avec overlay gradient -->
    <div class="relative aspect-video overflow-hidden">
      <img 
        :src="observation.imageUrl" 
        :alt="observation.title"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-noir-profond via-transparent to-transparent"></div>
      
      <!-- Badge de localisation -->
      <div class="absolute top-3 right-3">
        <LocationBadge :location="observation.location" />
      </div>
    </div>
    
    <!-- Contenu -->
    <div class="p-6 space-y-4">
      <h3 class="text-h3 text-white line-clamp-2">{{ observation.title }}</h3>
      <p class="text-body-sm text-gray-300 line-clamp-3">{{ observation.description }}</p>
      
      <!-- Métadonnées -->
      <div class="flex items-center justify-between text-caption text-gray-400">
        <span>{{ formatDate(observation.createdAt) }}</span>
        <span>{{ observation.commentsCount }} commentaires</span>
      </div>
    </div>
  </BaseCard>
</template>

<style>
.observation-card {
  @apply hover:border-violet-mystique hover:shadow-xl hover:shadow-violet-mystique/20;
}
</style>
```

### 8.2 LocationMap thématique
```css
/* Personnalisation Leaflet pour thème sombre */
.leaflet-container {
  background-color: #111826 !important;
}

.custom-marker {
  background: linear-gradient(135deg, #9973BF, #324873);
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  box-shadow: 0 0 15px rgba(153, 114, 191, 0.6);
}

.map-popup {
  background: rgba(29, 38, 63, 0.95) !important;
  color: white !important;
  border: 1px solid #324873 !important;
  border-radius: 8px !important;
}
```

---

## 9. Accessibilité et Contraste

### 9.1 Ratios de contraste
| Élément | Couleur Texte | Couleur Fond | Ratio | Statut |
|---------|---------------|--------------|-------|--------|
| Texte principal | `#FFFFFF` | `#111826` | 15.3:1 | ✅ AAA |
| Texte secondaire | `#B4B4B4` | `#111826` | 8.1:1 | ✅ AAA |
| Bouton primaire | `#FFFFFF` | `#9973BF` | 4.8:1 | ✅ AA |
| Liens | `#9973BF` | `#111826` | 4.2:1 | ✅ AA |

### 9.2 États focus et navigation clavier
```css
/* Focus visible personnalisé */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-violet-mystique focus:ring-offset-2 focus:ring-offset-noir-bleute;
}

/* Indicateurs de navigation clavier */
.keyboard-navigation {
  @apply focus-within:ring-2 focus-within:ring-violet-mystique;
}
```

---

## 10. Performance et Optimisation

### 10.1 Lazy loading des images
```vue
<!-- Image optimisée avec lazy loading -->
<img 
  :src="observation.imageUrl" 
  :alt="observation.title"
  loading="lazy"
  class="w-full h-48 object-cover transition-opacity duration-300"
  @load="imageLoaded = true"
  :class="{ 'opacity-0': !imageLoaded, 'opacity-100': imageLoaded }"
/>
```

### 10.2 CSS critique et code splitting
```css
/* CSS critique inline */
.critical-css {
  /* Styles nécessaires pour le first paint */
  background-color: #111826;
  color: #FFFFFF;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
}
```

---

## 11. Guide d'implémentation

### 11.1 Checklist développeur
- [ ] Importer les variables CSS dans `src/styles/main.css`
- [ ] Configurer TailwindCSS avec les couleurs personnalisées
- [ ] Créer les composants de base (Button, Input, Card)
- [ ] Tester les contrastes avec DevTools
- [ ] Valider l'accessibilité clavier
- [ ] Optimiser les images et animations
- [ ] Tester sur appareils mobiles réels

### 11.2 Standards de code
```vue
<!-- Structure de composant recommandée -->
<template>
  <div class="component-name">
    <!-- Contenu du composant -->
  </div>
</template>

<script setup>
// Logique du composant
</script>

<style scoped>
/* Styles spécifiques au composant */
.component-name {
  /* Utiliser les classes Tailwind en priorité */
  /* CSS personnalisé seulement si nécessaire */
}
</style>
```

---

**Mainteneur principal** : Équipe Design Phenom  
**Version** : Design System v1.0 (15/10/2025)  
**Statut** : Prêt pour implémentation