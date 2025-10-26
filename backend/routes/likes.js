import express from 'express'
import rateLimit from 'express-rate-limit'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Rate limiting pour les likes: 15 likes par minute par IP (marge pour tests)
const likeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: { error: 'Trop de likes. Veuillez patienter.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// POST /api/likes/:id - Ajouter un like
router.post('/:id', likeLimiter, async (req, res) => {
  try {
    const { id } = req.params

    // Vérifier si l'item existe
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, likes')
      .eq('id', id)
      .single()

    if (itemError || !item) {
      return res.status(404).json({ error: 'Item non trouvé' })
    }

    // Incrémenter le compteur de likes
    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update({ likes: (item.likes || 0) + 1 })
      .eq('id', id)
      .select('likes')
      .single()

    if (updateError) {
      console.error('Error updating likes:', updateError)
      return res.status(500).json({ error: 'Erreur lors de l\'ajout du like' })
    }

    return res.json({ 
      success: true,
      likes: updatedItem.likes
    })
  } catch (err) {
    console.error('Error in like:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router

