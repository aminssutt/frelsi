-- Migration pour le système de likes
-- À exécuter dans Supabase SQL Editor

-- Ajouter simplement la colonne likes à la table items
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

