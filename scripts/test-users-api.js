
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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY)

async function testUsersApi() {
    console.log('Testing users API query...')

    const page = 1
    const pageSize = 10

    let query = supabase
        .from('profiles')
        .select(`
      *,
      businesses(business_name, subscription_status, category, created_at),
      subscriptions(status, plan_id, plans(name, price_amount))
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

    const { data, error, count } = await query

    if (error) {
        console.error('API Error:', error)
        return
    }

    console.log('Raw Data Count:', data.length)
    console.log('Total Count:', count)

    if (data.length > 0) {
        console.log('First Raw Record:', JSON.stringify(data[0], null, 2))

        const users = (data || []).map((profile) => {
            const business = Array.isArray(profile.businesses)
                ? profile.businesses[0]
                : profile.businesses
            const subscription = Array.isArray(profile.subscriptions)
                ? profile.subscriptions[0]
                : profile.subscriptions
            const plan = subscription?.plans

            return {
                id: profile.id,
                fullName: profile.full_name || 'N/A',
                email: profile.email || 'N/A',
                phone: profile.contact_phone || '',
                businessName: business?.business_name || profile.business_name || 'No business',
                subscriptionStatus: business?.subscription_status || subscription?.status || 'inactive',
                planName: Array.isArray(plan) ? plan[0]?.name : plan?.name || 'Free',
                category: business?.category || '',
                createdAt: profile.created_at,
            }
        })
        console.log('Mapped User:', users[0])
    }
}

testUsersApi()
