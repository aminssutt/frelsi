import 'dotenv/config'
import { supabase } from './config/supabase.js'

async function checkDatabase() {
  console.log('🔍 Checking database structure...\n')

  // Check auth_codes table
  console.log('📋 Checking auth_codes table...')
  const { data: authCodes, error: error1 } = await supabase
    .from('auth_codes')
    .select('*')
    .limit(1)

  if (error1) {
    console.log('❌ auth_codes table:', error1.message)
  } else {
    console.log('✅ auth_codes table exists')
    if (authCodes && authCodes.length > 0) {
      console.log('   Columns:', Object.keys(authCodes[0]).join(', '))
      if ('attempts' in authCodes[0]) {
        console.log('   ✅ Column "attempts" exists')
      } else {
        console.log('   ⚠️  Column "attempts" is MISSING - need to add it')
      }
    }
  }

  // Check auth_logs table
  console.log('\n📋 Checking auth_logs table...')
  const { data: authLogs, error: error2 } = await supabase
    .from('auth_logs')
    .select('*')
    .limit(1)

  if (error2) {
    if (error2.message.includes('does not exist')) {
      console.log('   ⚠️  Table "auth_logs" does NOT exist - need to create it')
    } else {
      console.log('   ❌ Error:', error2.message)
    }
  } else {
    console.log('   ✅ auth_logs table exists')
    if (authLogs && authLogs.length > 0) {
      console.log('   Columns:', Object.keys(authLogs[0]).join(', '))
    }
  }

  console.log('\n' + '='.repeat(60))
}

checkDatabase()
