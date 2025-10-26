import express from 'express'
import { supabase } from '../config/supabase.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /api/items
 * Get all public items (no authentication required)
 */
router.get('/', async (req, res) => {
  try {
    const { type, author, q } = req.query

    let query = supabase
      .from('items')
      .select('*')
      .eq('isPublic', true)
      .order('createdAt', { ascending: false })

    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }
    if (author) {
      query = query.eq('author', author)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to fetch items' })
    }

    // Client-side text search (if needed)
    let items = data || []
    if (q) {
      const searchTerm = q.toLowerCase()
      items = items.filter(item => {
        const searchable = `${item.title} ${item.type} ${item.text || ''} ${item.bodyHtml || ''}`.toLowerCase()
        return searchable.includes(searchTerm)
      })
    }

    res.json({ items })
  } catch (error) {
    console.error('Get items error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * GET /api/items/admin
 * Get all items (authenticated only)
 */
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to fetch items' })
    }

    res.json({ items: data || [] })
  } catch (error) {
    console.error('Get admin items error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * GET /api/items/:id
 * Get single item by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Item not found' })
      }
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to fetch item' })
    }

    // Check if item is public or user is authenticated
    const authHeader = req.headers['authorization']
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ')

    if (!data.isPublic && !isAuthenticated) {
      return res.status(403).json({ error: 'This item is private' })
    }

    res.json({ item: data })
  } catch (error) {
    console.error('Get item error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * POST /api/items
 * Create new item (authenticated only)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, title, author, isPublic, bodyHtml, imageUrl, text } = req.body

    // Validate required fields
    if (!type || !title || !author) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, title, author' 
      })
    }

    // Validate type
    if (!['notebook', 'idea', 'drawing'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid type. Must be: notebook, idea, or drawing' 
      })
    }

    // Validate author
    if (!['lakhdar', 'amar'].includes(author)) {
      return res.status(400).json({ 
        error: 'Invalid author. Must be: lakhdar or amar' 
      })
    }

    const itemData = {
      type,
      title,
      author,
      isPublic: isPublic || false,
      createdAt: new Date().toISOString()
    }

    // Add type-specific fields
    if (type === 'notebook') {
      itemData.bodyHtml = bodyHtml || ''
    } else if (type === 'drawing') {
      itemData.imageUrl = imageUrl || ''
    } else if (type === 'idea') {
      itemData.text = text || ''
    }

    const { data, error } = await supabase
      .from('items')
      .insert(itemData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to create item' })
    }

    console.log(`✅ Item created: ${data.id} - ${data.title}`)

    res.status(201).json({ 
      success: true,
      item: data 
    })
  } catch (error) {
    console.error('Create item error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * PUT /api/items/:id
 * Update item (authenticated only)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { title, author, isPublic, bodyHtml, imageUrl, text } = req.body

    // Build update object (only include provided fields)
    const updates = {}
    if (title !== undefined) updates.title = title
    if (author !== undefined) {
      if (!['lakhdar', 'amar'].includes(author)) {
        return res.status(400).json({ error: 'Invalid author' })
      }
      updates.author = author
    }
    if (isPublic !== undefined) updates.isPublic = isPublic
    if (bodyHtml !== undefined) updates.bodyHtml = bodyHtml
    if (imageUrl !== undefined) updates.imageUrl = imageUrl
    if (text !== undefined) updates.text = text

    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Item not found' })
      }
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to update item' })
    }

    console.log(`✅ Item updated: ${data.id} - ${data.title}`)

    res.json({ 
      success: true,
      item: data 
    })
  } catch (error) {
    console.error('Update item error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * PATCH /api/items/:id/toggle-public
 * Toggle item public status (authenticated only)
 */
router.patch('/:id/toggle-public', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Get current item
    const { data: currentItem, error: fetchError } = await supabase
      .from('items')
      .select('isPublic')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Item not found' })
      }
      console.error('Database error:', fetchError)
      return res.status(500).json({ error: 'Failed to fetch item' })
    }

    // Toggle public status
    const { data, error } = await supabase
      .from('items')
      .update({ isPublic: !currentItem.isPublic })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to update item' })
    }

    console.log(`✅ Item visibility toggled: ${data.id} - Public: ${data.isPublic}`)

    res.json({ 
      success: true,
      item: data 
    })
  } catch (error) {
    console.error('Toggle public error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * DELETE /api/items/:id
 * Delete item (authenticated only)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to delete item' })
    }

    console.log(`✅ Item deleted: ${id}`)

    res.json({ 
      success: true,
      message: 'Item deleted successfully'
    })
  } catch (error) {
    console.error('Delete item error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
