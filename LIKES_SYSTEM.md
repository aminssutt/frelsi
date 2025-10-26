# Système de Likes - Installation et Utilisation

## 📋 Résumé des modifications

Le système de likes permet aux visiteurs de liker les posts publics. Chaque IP peut liker une seule fois par post (toggle like/unlike).

## 🗄️ Modifications de la base de données

### 1. Exécuter la migration SQL dans Supabase

Ouvrir le SQL Editor dans Supabase :
https://supabase.com/dashboard/project/phouklsqlhstcmsbllgg/sql

Copier et exécuter le contenu de `backend/migrations-likes.sql`

**Ce que fait cette migration :**
- Ajoute la colonne `likes_count` à la table `items`
- Crée la table `likes` (id, item_id, ip_address, user_agent, created_at)
- Ajoute un constraint UNIQUE sur (item_id, ip_address) - 1 like par IP par item
- Crée des index pour optimiser les requêtes
- Crée des triggers pour auto-incrémenter/décrémenter `likes_count`

## 🔧 Backend

### API Endpoints créés

**POST `/api/likes/:id/like`**
- Toggle like/unlike sur un item
- Rate limit: 10 likes par minute par IP
- Retourne: `{ liked: boolean, likes_count: number }`

**GET `/api/likes/:id/like-status`**
- Vérifie si l'IP actuelle a liké l'item
- Retourne: `{ liked: boolean, likes_count: number }`

**GET `/api/likes/:id/likes`** (Admin)
- Liste tous les likes d'un item avec détails (IP, user-agent, date)
- Retourne: `{ likes: [...], count: number }`

### Fichiers modifiés
- `backend/routes/likes.js` - Nouveau fichier avec les routes
- `backend/server.js` - Import de likesRoutes

## 🎨 Frontend

### Composants créés/modifiés

**`src/components/LikeButton.jsx`** - Nouveau composant
- Bouton like avec coeur animé
- Auto-load du statut au montage
- Affiche le nombre de likes
- Animation heartBeat quand on like

**`src/services/api.js`**
- Ajout de `toggleLike(itemId)`
- Ajout de `getLikeStatus(itemId)`
- Ajout de `getItemLikes(itemId)`

**`src/App.jsx`**
- Import de LikeButton
- Modification de PublicItemCard pour ajouter le bouton like
- Gestion du click pour éviter l'ouverture quand on clique sur le bouton

**`src/components/AdminPanel.jsx`**
- Affichage du badge ❤️ avec le nombre de likes dans chaque row

**`src/components/EmailLogin.jsx`**
- Changement du placeholder email de "lakhdarberache@gmail.com" à "exemple@email.com"

### Styles CSS (`src/styles.css`)

Nouveaux styles ajoutés :
- `.like-btn` - Bouton principal
- `.like-btn.liked` - État liké avec gradient
- `.like-count` - Compteur de likes
- `.like-error` - Message d'erreur
- `.likes-badge` - Badge dans l'admin panel
- `@keyframes heartBeat` - Animation du coeur

## 🚀 Utilisation

### Pour les visiteurs
1. Voir un post public sur Home ou Discover
2. Cliquer sur le bouton ❤️ pour liker
3. Cliquer à nouveau pour unliker
4. Le compteur s'actualise en temps réel

### Pour l'admin
1. Ouvrir l'Admin Panel
2. Voir le badge ❤️ avec le nombre de likes à côté de chaque post
3. Les stats se mettent à jour automatiquement

## 🔒 Sécurité

- **Rate limiting**: 10 likes par minute par IP
- **IP tracking**: Un seul like par IP par item
- **Validation**: Vérification que l'item existe avant de liker
- **Auto-cleanup**: Si un item est supprimé, ses likes sont supprimés (CASCADE)

## 📊 Base de données

### Structure de la table `likes`
```sql
id UUID PRIMARY KEY
item_id UUID (référence items.id)
ip_address TEXT
user_agent TEXT
created_at TIMESTAMP
```

### Structure mise à jour de `items`
```sql
-- Nouvelle colonne ajoutée:
likes_count INTEGER DEFAULT 0
```

## 🧪 Testing

Pour tester localement :
1. Lancer le backend: `cd backend && npm start`
2. Lancer le frontend: `cd frelsi && npm run dev`
3. Créer un post et le rendre public
4. Tester le like/unlike
5. Vérifier dans AdminPanel que le compteur s'affiche
6. Vérifier dans Supabase que la table `likes` se remplit

## ✅ Checklist de déploiement

- [x] Migration SQL créée
- [ ] Migration exécutée dans Supabase production
- [x] Backend routes likes créées
- [x] Frontend LikeButton créé
- [x] UI intégrée dans PublicItemCard
- [x] Stats affichées dans AdminPanel
- [x] Styles CSS ajoutés
- [ ] Tests en local
- [ ] Déploiement backend
- [ ] Déploiement frontend
- [ ] Tests en production
