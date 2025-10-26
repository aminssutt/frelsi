# 🚀 Plan de Déploiement Frelsi - Étapes Complètes

## ✅ Pré-requis (À faire MAINTENANT avant déploiement)

### 1. Exécuter les migrations SQL dans Supabase
👉 **URL**: https://supabase.com/dashboard/project/phouklsqlhstcmsbllgg/sql

**A. D'abord, nettoyer l'ancienne table (si elle existe)**
```sql
-- Copier et exécuter backend/migrations-cleanup.sql
```

**B. Ensuite, migration pour le rate limiting et brute force**
```sql
-- Copier et exécuter backend/migrations.sql
-- Ajoute: colonne attempts à auth_codes, table auth_logs
```

**C. Enfin, migration pour les likes**
```sql
-- Copier et exécuter backend/migrations-likes.sql
-- Ajoute: colonne likes à items
```

### 2. Tester en local

**A. Backend**
```powershell
cd backend
npm start
```
✅ Devrait démarrer sur port 3001 ou 3002
✅ Vérifier: http://localhost:3001/health

**B. Frontend**
```powershell
cd frelsi
npm run dev
```
✅ Devrait démarrer sur port 5173
✅ Tester:
  - Login avec email (vérifier que le mail arrive)
  - Créer un post
  - Le rendre public
  - Cliquer sur le bouton like ❤️
  - Vérifier dans AdminPanel que le compteur s'affiche

---

## 🌐 Déploiement Backend sur Render

### 1. Créer un nouveau Web Service sur Render
👉 **URL**: https://render.com

**Settings:**
- **Repository**: Connecter votre repo GitHub
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free

### 2. Variables d'environnement Render

Ajouter ces 7 variables dans Render Dashboard:

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://phouklsqlhstcmsbllgg.supabase.co
SUPABASE_ANON_KEY=<votre_anon_key>
SUPABASE_SERVICE_KEY=<votre_service_key>
JWT_SECRET=<votre_jwt_secret_fort>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<votre_email_gmail>
SMTP_PASS=<votre_app_password_gmail>
FRONTEND_URL=https://frelsi.vercel.app
```

⚠️ **IMPORTANT pour Gmail:**
- Activer "Validation en 2 étapes" sur votre compte Gmail
- Générer un "Mot de passe d'application" pour SMTP_PASS
- URL: https://myaccount.google.com/apppasswords

### 3. Déployer

- Cliquer sur "Create Web Service"
- Render va build et déployer automatiquement
- Noter l'URL du backend: `https://frelsi-backend.onrender.com`

### 4. Tester le backend déployé

```bash
# Health check
curl https://frelsi-backend.onrender.com/health

# Devrait retourner: {"status":"healthy","timestamp":"..."}
```

---

## 🎨 Déploiement Frontend sur Vercel

### 1. Installer Vercel CLI (si pas déjà fait)

```powershell
npm install -g vercel
```

### 2. Se connecter à Vercel

```powershell
vercel login
```

### 3. Déployer depuis le dossier frelsi

```powershell
cd frelsi
vercel
```

**Répondre aux questions:**
- Set up and deploy "frelsi"? → `Y`
- Which scope? → (Choisir votre compte)
- Link to existing project? → `N`
- Project name? → `frelsi`
- In which directory? → `./` (laisser par défaut)
- Want to override settings? → `N`

### 4. Ajouter la variable d'environnement

Sur le dashboard Vercel:
👉 **Project Settings** → **Environment Variables**

Ajouter:
```
VITE_API_URL=https://frelsi-backend.onrender.com
```

### 5. Redéployer avec la variable

```powershell
vercel --prod
```

---

## 🔍 Tests Post-Déploiement

### 1. Tester l'authentification email

- Aller sur https://frelsi.vercel.app
- Cliquer sur "Admin"
- Demander un code par email
- ✅ Vérifier que l'email arrive bien
- Entrer le code et se connecter

### 2. Tester le rate limiting

- Demander un code 4 fois d'affilée rapidement
- ✅ La 4ème requête devrait être bloquée (rate limit: 3/15min)

### 3. Tester le brute force protection

- Demander un code
- Entrer 6 mauvais codes
- ✅ Le 6ème devrait être bloqué (max 5 tentatives)

### 4. Tester le système de likes

- Créer un post et le rendre public
- Aller sur la page d'accueil
- Cliquer sur le bouton ❤️
- ✅ Le compteur devrait s'incrémenter
- ✅ Vérifier dans AdminPanel que le nombre s'affiche

### 5. Vérifier les logs

**Render:**
- Dashboard → Logs
- Vérifier qu'il n'y a pas d'erreurs

**Vercel:**
- Dashboard → Deployments → View Function Logs
- Vérifier qu'il n'y a pas d'erreurs

---

## 📊 Checklist Finale

### Backend
- [ ] Migrations SQL exécutées dans Supabase
- [ ] Backend déployé sur Render
- [ ] 7 variables d'environnement configurées
- [ ] Health check fonctionne
- [ ] Logs Render sans erreurs

### Frontend
- [ ] Frontend déployé sur Vercel
- [ ] Variable VITE_API_URL configurée
- [ ] Site accessible et responsive
- [ ] Logs Vercel sans erreurs

### Fonctionnalités
- [ ] Login par email fonctionne
- [ ] Rate limiting actif (3 req/15min)
- [ ] Brute force protection active (5 tentatives max)
- [ ] Création de posts (notebook/idea/drawing)
- [ ] Toggle public/private
- [ ] Système de likes fonctionnel
- [ ] AdminPanel affiche les stats de likes
- [ ] Page Discover affiche tous les posts publics

### Email (Gmail)
- [ ] Validation en 2 étapes activée
- [ ] Mot de passe d'application généré
- [ ] SMTP configuré dans Render
- [ ] Test d'envoi réussi

---

## 🆘 Troubleshooting

### Backend ne démarre pas
```bash
# Vérifier les logs Render
# Vérifier que toutes les variables d'env sont définies
# Vérifier que les migrations SQL ont été exécutées
```

### Emails ne s'envoient pas
```bash
# Vérifier SMTP_USER et SMTP_PASS dans Render
# Vérifier que c'est bien un "App Password" Gmail
# Vérifier les logs backend pour voir l'erreur exacte
```

### Likes ne fonctionnent pas
```bash
# Vérifier que la migration migrations-likes.sql a été exécutée
# Vérifier dans Supabase que la colonne "likes" existe dans items
# Vérifier les logs backend: GET /api/likes/:id devrait retourner 200
```

### Frontend affiche des erreurs
```bash
# Vérifier que VITE_API_URL pointe vers Render
# Faire un hard refresh (Ctrl+Shift+R)
# Vérifier la console Chrome pour les erreurs CORS
```

---

## 🎯 URLs Finales

- **Frontend**: https://frelsi.vercel.app
- **Backend**: https://frelsi-backend.onrender.com
- **Supabase**: https://supabase.com/dashboard/project/phouklsqlhstcmsbllgg
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 📝 Notes Importantes

1. **Premier déploiement Render** : Peut prendre 2-3 minutes (instance free)
2. **Cold start Render** : Si le backend n'est pas utilisé pendant 15 min, il s'endort. Premier appel prend ~30 secondes
3. **Logs** : Toujours vérifier les logs en cas de problème
4. **Migrations** : Ne jamais les re-exécuter une fois en production
5. **Secrets** : Ne JAMAIS commit les variables d'environnement dans Git

---

**Prêt pour le déploiement ? Suivez les étapes une par une ! 🚀**
