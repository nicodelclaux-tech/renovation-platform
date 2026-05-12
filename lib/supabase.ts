import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jnwjmuahutzmixddtskx.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_VJsS_z8frD83md1MQLbnnQ_Dy99k7jY'

export const supabase = createClient(supabaseUrl, supabaseKey)
