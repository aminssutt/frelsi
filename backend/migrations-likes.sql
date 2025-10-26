-- Migration pour le système de likes
-- À exécuter dans Supabase SQL Editor

-- Ajouter la colonne likes_count à la table items
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

