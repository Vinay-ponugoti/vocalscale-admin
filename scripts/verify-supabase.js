
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')

const envConfig = fs.readFileSync(envPath, 'utf8')
const env = {}
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
        env[key.trim()] = value.trim()
    }
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseServiceKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase Environment Variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTable(tableName) {
    const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true })
    if (error) {
        console.log(`Table '${tableName}': ERROR - ${error.message}`)
        return false
    } else {
        console.log(`Table '${tableName}': OK (Count: ${count})`)
        return true
    }
}

async function verify() {
    console.log('Verifying Supabase Tables...')
    await checkTable('profiles')
    await checkTable('subscriptions')
    await checkTable('invoices')
    await checkTable('calls')
    await checkTable('businesses')
    await checkTable('plans')
}

verify()
