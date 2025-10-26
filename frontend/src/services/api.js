// API Service for Frelsi Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

// Token management
let authToken = localStorage.getItem('frelsi_token')

export function setAuthToken(token) {
  authToken = token
  if (token) {
    localStorage.setItem('frelsi_token', token)
  } else {
    localStorage.removeItem('frelsi_token')
  }
}

export function getAuthToken() {
  return authToken
}

export function clearAuthToken() {
  authToken = null
  localStorage.removeItem('frelsi_token')
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!authToken
}

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const config = {
    ...options,
    headers
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// ============================================
// AUTH API
// ============================================

/**
 * Request authentication code
 * @param {string} email - Admin email
 */
export async function requestAuthCode(email) {
  return fetchAPI('/api/auth/request-code', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

/**
 * Verify authentication code and get JWT token
 * @param {string} email - Admin email
 * @param {string} code - 6-digit code
 */
export async function verifyAuthCode(email, code) {
  const data = await fetchAPI('/api/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code })
  })
  
  // Store token
  if (data.token) {
    setAuthToken(data.token)
  }
  
  return data
}

/**
 * Logout (clear token)
 */
export function logout() {
  clearAuthToken()
}

// ============================================
// ITEMS API
// ============================================

/**
 * Get all public items
 * @param {Object} filters - Optional filters { type, author, q }
 */
export async function getPublicItems(filters = {}) {
  const params = new URLSearchParams()
  if (filters.type) params.append('type', filters.type)
  if (filters.author) params.append('author', filters.author)
  if (filters.q) params.append('q', filters.q)
  
  const query = params.toString()
  const endpoint = `/api/items${query ? `?${query}` : ''}`
  
  const data = await fetchAPI(endpoint)
  return data.items
}

/**
 * Get all items (authenticated - admin only)
 */
export async function getAllItems() {
  const data = await fetchAPI('/api/items/admin')
  return data.items
}

/**
 * Get single item by ID
 * @param {number} id - Item ID
 */
export async function getItem(id) {
  const data = await fetchAPI(`/api/items/${id}`)
  return data.item
}

/**
 * Create new item (authenticated)
 * @param {Object} itemData - Item data
 */
export async function createItem(itemData) {
  const data = await fetchAPI('/api/items', {
    method: 'POST',
    body: JSON.stringify(itemData)
  })
  return data.item
}

/**
 * Update item (authenticated)
 * @param {number} id - Item ID
 * @param {Object} updates - Fields to update
 */
export async function updateItem(id, updates) {
  const data = await fetchAPI(`/api/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  })
  return data.item
}

/**
 * Toggle item public status (authenticated)
 * @param {number} id - Item ID
 */
export async function toggleItemPublic(id) {
  const data = await fetchAPI(`/api/items/${id}/toggle-public`, {
    method: 'PATCH'
  })
  return data.item
}

/**
 * Delete item (authenticated)
 * @param {number} id - Item ID
 */
export async function deleteItem(id) {
  await fetchAPI(`/api/items/${id}`, {
    method: 'DELETE'
  })
}

// ============================================
// HELPERS
// ============================================

/**
 * Check if token is still valid
 */
export async function validateToken() {
  try {
    await getAllItems()
    return true
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('403')) {
      clearAuthToken()
      return false
    }
    return false
  }
}

/**
 * Like an item
 * @param {number} itemId - Item ID
 */
export async function likeItem(itemId) {
  return fetchAPI(`/api/items/${itemId}/like`, {
    method: 'POST'
  })
}

/**
 * Get like count for an item
 * @param {number} itemId - Item ID
 */
export async function getLikeCount(itemId) {
  return fetchAPI(`/api/items/${itemId}/likes`)
}

export default {
  // Auth
  requestAuthCode,
  verifyAuthCode,
  logout,
  isAuthenticated,
  validateToken,
  
  // Items
  getPublicItems,
  getAllItems,
  getItem,
  createItem,
  updateItem,
  toggleItemPublic,
  deleteItem,
  
  // Likes
  likeItem,
  getLikeCount
}
