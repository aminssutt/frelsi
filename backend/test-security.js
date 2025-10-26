#!/usr/bin/env node

/**
 * Test script for rate limiting and brute force protection
 * Run with: node test-security.js
 */

const API_URL = 'http://localhost:3002'
const TEST_EMAIL = 'daivinnyy@gmail.com'

async function testRateLimit() {
  console.log('\n🧪 Test 1: Rate Limiting sur /request-code')
  console.log('═'.repeat(50))
  
  for (let i = 1; i <= 5; i++) {
    try {
      const response = await fetch(`${API_URL}/api/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_EMAIL })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        console.log(`✅ Tentative ${i}: Succès - ${data.message}`)
      } else {
        console.log(`❌ Tentative ${i}: Échec - ${data.error}`)
        if (response.status === 429) {
          console.log(`🚫 Rate limit atteint à la tentative ${i}`)
          break
        }
      }
      
      // Attendre 1 seconde entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.log(`💥 Tentative ${i}: Erreur - ${error.message}`)
    }
  }
}

async function testBruteForce() {
  console.log('\n🧪 Test 2: Brute Force Protection sur /verify-code')
  console.log('═'.repeat(50))
  
  // D'abord, demander un code valide
  console.log('📧 Demande d\'un code de test...')
  const requestResponse = await fetch(`${API_URL}/api/auth/request-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL })
  })
  
  if (!requestResponse.ok) {
    console.log('❌ Impossible de demander un code de test')
    return
  }
  
  console.log('✅ Code de test demandé')
  console.log('🔍 Test avec des codes incorrects...')
  
  // Tester avec des codes incorrects
  for (let i = 1; i <= 7; i++) {
    try {
      const wrongCode = `${100000 + i}` // Code forcément incorrect
      
      const response = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: TEST_EMAIL, 
          code: wrongCode 
        })
      })
      
      const data = await response.json()
      
      if (response.status === 401) {
        console.log(`🔄 Tentative ${i}: Code incorrect (normal)`)
      } else if (response.status === 429) {
        console.log(`🚫 Tentative ${i}: Code bloqué ! Protection activée`)
        console.log(`   Message: ${data.error}`)
        break
      } else {
        console.log(`❓ Tentative ${i}: Réponse inattendue (${response.status})`)
      }
      
      // Attendre 500ms entre les tentatives
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.log(`💥 Tentative ${i}: Erreur - ${error.message}`)
    }
  }
}

async function testValidFlow() {
  console.log('\n🧪 Test 3: Flow Normal (après 15 min de pause)')
  console.log('═'.repeat(50))
  console.log('⏰ Ce test nécessite d\'attendre 15 minutes pour reset le rate limit')
  console.log('   Ou redémarrer le serveur pour vider le cache du rate limiter')
  console.log('   Puis utiliser le vrai code reçu par email')
}

async function main() {
  console.log('🔐 Test des Protections de Sécurité')
  console.log('=' .repeat(50))
  console.log(`📍 API URL: ${API_URL}`)
  console.log(`📧 Test Email: ${TEST_EMAIL}`)
  
  try {
    // Vérifier que l'API est accessible
    const healthResponse = await fetch(`${API_URL}/health`)
    if (!healthResponse.ok) {
      console.log('❌ Backend non accessible. Assurez-vous qu\'il est lancé.')
      return
    }
    console.log('✅ Backend accessible')
    
    await testRateLimit()
    await testBruteForce()
    testValidFlow()
    
    console.log('\n📊 Résumé des Tests')
    console.log('═'.repeat(50))
    console.log('✅ Rate Limiting: Testez si les requêtes sont bloquées après 3 tentatives')
    console.log('✅ Brute Force: Testez si les codes sont bloqués après 5 tentatives')
    console.log('📝 Logs: Vérifiez les logs du backend et la table auth_logs dans Supabase')
    
  } catch (error) {
    console.log('💥 Erreur générale:', error.message)
  }
}

// Fonction utilitaire pour tester un vrai code
async function testWithRealCode(code) {
  console.log(`\n🧪 Test avec le vrai code: ${code}`)
  
  const response = await fetch(`${API_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: TEST_EMAIL, 
      code: code 
    })
  })
  
  const data = await response.json()
  
  if (response.ok) {
    console.log('✅ Authentification réussie!')
    console.log(`🔑 Token reçu: ${data.token.substring(0, 20)}...`)
  } else {
    console.log(`❌ Échec: ${data.error}`)
  }
}

main().catch(console.error)

// Export pour usage manuel
export { testWithRealCode }