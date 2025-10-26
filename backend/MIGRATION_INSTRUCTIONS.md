# Instructions pour les Migrations Supabase

## Étapes à suivre AVANT de lancer le backend :

### 1. Ouvrir Supabase Dashboard
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet Frelsi
3. Aller dans "SQL Editor" (menu de gauche)

### 2. Exécuter Migration 1 - Ajouter colonne attempts
Copier-coller ce SQL et cliquer "Run" :

```sql
-- Migration: Add attempts column to auth_codes table
ALTER TABLE auth_codes 
ADD COLUMN attempts INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_auth_codes_email_attempts 
ON auth_codes (email, attempts);
```

### 3. Exécuter Migration 2 - Créer table auth_logs
Copier-coller ce SQL et cliquer "Run" :

```sql
-- Migration: Create auth_logs table for audit trail
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'request_code', 'verify_success', 'verify_fail', 'code_blocked'
  ip_address TEXT,
  user_agent TEXT,
  details JSONB, -- Additional context (e.g., error messages, attempts count)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_auth_logs_email ON auth_logs (email);
CREATE INDEX idx_auth_logs_action ON auth_logs (action);
CREATE INDEX idx_auth_logs_created_at ON auth_logs (created_at);

-- RLS (Row Level Security) - optional
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own logs
CREATE POLICY "Users can view their own auth logs" ON auth_logs
  FOR SELECT USING (auth.email() = email);
```

### 4. Vérifier les Tables
Dans "Table Editor", vérifier que :
- La table `auth_codes` a maintenant une colonne `attempts`
- La table `auth_logs` a été créée avec toutes les colonnes

### 5. ENSUITE lancer le backend
Une fois les migrations faites, lancer : `npm run dev`

## Nouvelles Protections Implémentées

### Rate Limiting
- `/api/auth/request-code` : 3 requêtes par 15 minutes par IP+email
- `/api/auth/verify-code` : 10 tentatives par 15 minutes par IP+email

### Brute Force Protection
- Après 5 tentatives échouées sur un code, le code est bloqué
- Message explicite pour demander un nouveau code

### Audit Logging
- Toutes les tentatives d'auth sont loggées
- Informations : email, action, IP, user-agent, détails
- Actions : request_code, verify_success, verify_fail, code_blocked

### Sécurité Crypto
- Codes générés avec `crypto.randomInt()` au lieu de Math.random()
- Plus sécurisé cryptographiquement

### Configuration Flexible
- `AUTH_CODE_EXPIRY_MINUTES` configurable (défaut : 10 minutes)