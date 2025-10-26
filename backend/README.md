# Frelsi Backend API

Backend API pour Frelsi avec authentification par email et gestion de contenu.

## 🚀 Technologies

- **Node.js** + Express
- **Supabase** (PostgreSQL)
- **Resend** (Email service)
- **JWT** (Authentication)

## 📦 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du dossier backend :

```env
# Supabase
SUPABASE_URL=https://phouklsqlhstcmsbllgg.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend
RESEND_API_KEY=re_your_resend_key

# Admin
ADMIN_EMAIL=daivinnyy@gmail.com

# JWT
JWT_SECRET=your_very_long_random_secret

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5174
```

## 🗄️ Configuration Supabase

### 1. Créer les tables

Allez dans **Supabase Dashboard → SQL Editor** et exécutez :

```sql
-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('notebook', 'idea', 'drawing')),
  title TEXT NOT NULL,
  author VARCHAR(50) NOT NULL CHECK (author IN ('lakhdar', 'amar')),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "isPublic" BOOLEAN DEFAULT false,
  "bodyHtml" TEXT,
  "imageUrl" TEXT,
  text TEXT
);

-- Create auth_codes table
CREATE TABLE IF NOT EXISTS auth_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_items_public ON items("isPublic");
CREATE INDEX IF NOT EXISTS idx_items_author ON items(author);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_auth_codes_email ON auth_codes(email);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public items are viewable by everyone" 
  ON items FOR SELECT 
  USING ("isPublic" = true);

CREATE POLICY "Backend can do everything on items" 
  ON items FOR ALL 
  USING (true);

CREATE POLICY "Backend can do everything on auth_codes" 
  ON auth_codes FOR ALL 
  USING (true);
```

## 🏃 Lancement

```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Authentication

**POST** `/api/auth/request-code`
```json
{
  "email": "daivinnyy@gmail.com"
}
```
→ Envoie un code à 6 chiffres par email

**POST** `/api/auth/verify-code`
```json
{
  "email": "daivinnyy@gmail.com",
  "code": "123456"
}
```
→ Retourne un JWT token

### Items (Public)

**GET** `/api/items`
- Query params: `?type=notebook&author=lakhdar&q=search`
- Retourne tous les items publics

**GET** `/api/items/:id`
- Retourne un item spécifique

### Items (Authenticated)

**GET** `/api/items/admin`
- Headers: `Authorization: Bearer <token>`
- Retourne tous les items (publics et privés)

**POST** `/api/items`
```json
{
  "type": "notebook",
  "title": "Mon titre",
  "author": "lakhdar",
  "isPublic": true,
  "bodyHtml": "<p>Contenu...</p>"
}
```

**PUT** `/api/items/:id`
```json
{
  "title": "Nouveau titre",
  "isPublic": false
}
```

**PATCH** `/api/items/:id/toggle-public`
- Toggle le statut public/privé

**DELETE** `/api/items/:id`
- Supprime un item

## 🚀 Déploiement Railway

### 1. Créer un compte Railway
→ https://railway.app

### 2. Nouveau projet depuis GitHub
1. Cliquez "New Project"
2. "Deploy from GitHub repo"
3. Sélectionnez votre repo `frelsi`
4. Root directory: `/backend`

### 3. Configurer les variables d'environnement

Dans Railway → Variables :
```
SUPABASE_URL=https://phouklsqlhstcmsbllgg.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
RESEND_API_KEY=re_jKSHz5Bu...
ADMIN_EMAIL=daivinnyy@gmail.com
JWT_SECRET=frelsi_super_secret_key_2025
NODE_ENV=production
FRONTEND_URL=https://frelsi.vercel.app
```

### 4. Déployer
Railway détecte automatiquement Node.js et déploie !

## 🔒 Sécurité

- ✅ JWT tokens avec expiration (7 jours)
- ✅ Codes à 6 chiffres valides 10 minutes
- ✅ CORS configuré
- ✅ Rate limiting recommandé en production
- ✅ Variables d'environnement sécurisées

## 📝 Logs

Le serveur log automatiquement :
- Toutes les requêtes HTTP
- Création/modification/suppression d'items
- Envoi d'emails
- Erreurs

## 🐛 Debug

Si problème au démarrage, vérifiez :
1. ✅ Tables Supabase créées
2. ✅ Variables d'environnement définies
3. ✅ Resend API key valide
4. ✅ Port 3001 disponible

## 📧 Support

Email: daivinnyy@gmail.com

---

Made with ❤️ by Lakhdar Berache
