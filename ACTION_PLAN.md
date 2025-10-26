# 🔧 Actions Immédiates Avant Déploiement

## ❌ Problèmes détectés par les tests

### 1. **CRITIQUE : Migrations SQL non exécutées**
La colonne `likes` n'existe pas dans la table `items`.

**ACTION IMMÉDIATE :**
1. Ouvrir Supabase SQL Editor : https://supabase.com/dashboard/project/phouklsqlhstcmsbllgg/sql
2. Exécuter `backend/migrations-cleanup.sql`
3. Exécuter `backend/migrations.sql`
4. Exécuter `backend/migrations-likes.sql`

### 2. **Email test non autorisé**
L'email `test@example.com` n'est pas dans la liste autorisée.

**ACTION :**
- Les tests d'auth vont échouer avec l'email test
- C'est NORMAL en production (sécurité)
- En local, testez avec votre vraie adresse email autorisée

### 3. **Tests réussis ✅**
- Backend health check : ✅
- Backend API info : ✅  
- Rate limiting likes : ✅

---

## 📋 PLAN D'ACTION MAINTENANT

### Étape 1 : Exécuter les migrations (5 min)
```sql
-- Dans Supabase SQL Editor, exécuter dans cet ordre :

-- 1. migrations-cleanup.sql
DROP TRIGGER IF EXISTS trigger_increment_likes ON likes;
DROP TRIGGER IF EXISTS trigger_decrement_likes ON likes;
DROP FUNCTION IF EXISTS increment_likes_count();
DROP FUNCTION IF EXISTS decrement_likes_count();
DROP TABLE IF EXISTS likes CASCADE;
ALTER TABLE items DROP COLUMN IF EXISTS likes_count;

-- 2. migrations.sql
ALTER TABLE auth_codes 
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS auth_logs (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_logs_email ON auth_logs(email);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at DESC);

-- 3. migrations-likes.sql
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
```

### Étape 2 : Relancer les tests (2 min)
```powershell
python test-all.py
```

Cette fois, utilisez votre VRAI email quand on vous le demande (pas test@example.com).

### Étape 3 : Vérifier les résultats
**Attendu :**
- ✅ Backend health : OK
- ✅ Backend API : OK
- ⚠️  Auth avec test@example.com : Échouera (normal, email non autorisé)
- ✅ Items publics : OK (après migration)
- ✅ Likes : OK (après migration)
- ✅ Database structure : OK (après migration)

**Si 7+ tests sur 10 passent → Vous pouvez déployer !**

---

## 🚀 Après les migrations : Déploiement

### Option A : Déploiement Rapide (recommandé)
1. **Render** : 
   - Créer Web Service
   - Root Directory: `backend`
   - Ajouter les 10 variables d'env
   - Déployer

2. **Vercel** :
   ```powershell
   cd frelsi
   vercel
   ```
   - Ajouter `VITE_API_URL` dans settings
   - Redéployer : `vercel --prod`

### Option B : Test complet avant déploiement
1. Exécuter migrations
2. Relancer tests Python
3. Tester manuellement :
   - Login avec votre email
   - Créer un post
   - Le rendre public  
   - Tester le like
4. Ensuite déployer

---

## ⚡ COMMANDES RAPIDES

### Migrations Supabase
```
👉 https://supabase.com/dashboard/project/phouklsqlhstcmsbllgg/sql
Copier-coller chaque fichier .sql
```

### Tests
```powershell
python test-all.py
```

### Déploiement Backend (Render)
```
👉 https://dashboard.render.com
New → Web Service → Connect GitHub → backend/
```

### Déploiement Frontend (Vercel)
```powershell
cd frelsi
vercel
# Puis dans dashboard Vercel:
# Settings → Environment Variables → Add VITE_API_URL
vercel --prod
```

---

## 🎯 CHECKLIST FINALE

- [ ] Migrations SQL exécutées dans Supabase
- [ ] Tests Python passent (7+/10)
- [ ] Backend local fonctionne
- [ ] Frontend local fonctionne
- [ ] Backend déployé sur Render
- [ ] Frontend déployé sur Vercel
- [ ] Test en production : Login fonctionne
- [ ] Test en production : Likes fonctionnent

**Temps estimé total : 30 minutes**

---

## 🆘 Si problème

### Backend 500 error
→ Migrations pas exécutées. Vérifiez Supabase.

### Auth 403 forbidden
→ Email non autorisé. Normal pour test@example.com.
→ Utilisez votre vrai email pour tester.

### Likes ne fonctionnent pas
→ Colonne `likes` manquante. Exécutez migrations-likes.sql.

### Email ne s'envoie pas
→ Vérifiez SMTP_USER et SMTP_PASS.
→ SMTP_PASS doit être un "App Password" Gmail.
