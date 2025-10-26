# 🚀 Guide de Configuration Supabase

## ⚠️ IMPORTANT : Créer les tables MAINTENANT

Avant de lancer le backend, vous devez créer les tables dans Supabase.

### 📍 Étape 1 : Aller dans Supabase SQL Editor

1. Ouvrez votre dashboard Supabase : https://supabase.com/dashboard/project/phouklsqlhstcmsbllgg
2. Dans le menu de gauche, cliquez sur **"SQL Editor"** (icône 📝)
3. Cliquez sur **"New query"** (bouton en haut)

### 📝 Étape 2 : Copier-coller ce SQL

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

-- Create auth_codes table for email authentication
CREATE TABLE IF NOT EXISTS auth_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_public ON items("isPublic");
CREATE INDEX IF NOT EXISTS idx_items_author ON items(author);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_auth_codes_email ON auth_codes(email);

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public items are viewable by everyone" 
  ON items FOR SELECT 
  USING ("isPublic" = true);

-- Allow all operations for authenticated users (your backend)
CREATE POLICY "Backend can do everything on items" 
  ON items FOR ALL 
  USING (true);

CREATE POLICY "Backend can do everything on auth_codes" 
  ON auth_codes FOR ALL 
  USING (true);
```

### ▶️ Étape 3 : Exécuter

1. Cliquez sur **"Run"** (bouton en bas à droite) ou appuyez sur `Ctrl+Enter`
2. Vous devriez voir : **"Success. No rows returned"** ✅

### ✅ Étape 4 : Vérifier

1. Allez dans **"Table Editor"** (menu de gauche)
2. Vous devriez voir 2 tables :
   - `items`
   - `auth_codes`

---

## 🎉 C'est fait ? Lancez le backend !

```bash
npm run dev
```

Si vous voyez "✅ Database tables are ready", c'est parfait ! 🚀
