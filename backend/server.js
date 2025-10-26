import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initializeDatabase } from './config/supabase.js'
import authRoutes from './routes/auth.js'
import itemsRoutes from './routes/items.js'
import likesRoutes from './routes/likes.js'

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy for Render deployment (needed for rate limiting)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL,
        'https://frelsi.vercel.app',
        /https:\/\/frelsi-.*\.vercel\.app$/
      ]
    : true, // Allow all origins in development
  credentials: true
}))
app.use(express.json({ limit: '10mb' })) // For base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Frelsi Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      items: '/api/items',
      likes: '/api/likes'
    }
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/likes', likesRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting Frelsi Backend...')
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
    
    // Initialize database
    await initializeDatabase()
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`)
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`)
      console.log(`📧 Admin email: ${process.env.ADMIN_EMAIL}`)
      console.log(`\n📚 API Endpoints:`)
      console.log(`   POST   /api/auth/request-code  - Request authentication code`)
      console.log(`   POST   /api/auth/verify-code   - Verify code and get token`)
      console.log(`   GET    /api/items              - Get public items`)
      console.log(`   GET    /api/items/admin        - Get all items (auth)`)
      console.log(`   POST   /api/items              - Create item (auth)`)
      console.log(`   PUT    /api/items/:id          - Update item (auth)`)
      console.log(`   PATCH  /api/items/:id/toggle-public - Toggle visibility (auth)`)
      console.log(`   DELETE /api/items/:id          - Delete item (auth)`)
      console.log(`\n🎉 Backend ready!\n`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
