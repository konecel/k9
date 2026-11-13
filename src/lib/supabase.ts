import { createClient } from '@supabase/supabase-js'
import { CLOUD_ENABLED, SUPABASE_ANON_KEY, SUPABASE_URL } from './cloud-config'

export const supabase = CLOUD_ENABLED ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null
