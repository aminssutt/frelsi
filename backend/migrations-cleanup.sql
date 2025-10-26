-- Script de nettoyage pour supprimer l'ancienne table likes
-- À exécuter dans Supabase SQL Editor AVANT la migration likes

-- 1. Supprimer les triggers
DROP TRIGGER IF EXISTS trigger_increment_likes ON likes;
DROP TRIGGER IF EXISTS trigger_decrement_likes ON likes;

-- 2. Supprimer les fonctions
DROP FUNCTION IF EXISTS increment_likes_count();
DROP FUNCTION IF EXISTS decrement_likes_count();

-- 3. Supprimer la table likes (si elle existe)
DROP TABLE IF EXISTS likes CASCADE;

-- 4. Supprimer l'ancienne colonne likes_count (si elle existe)
ALTER TABLE items DROP COLUMN IF EXISTS likes_count;
