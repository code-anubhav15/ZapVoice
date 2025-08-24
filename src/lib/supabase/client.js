// src/lib/supabase/client.js

// ❌ Incorrect
// import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

// ✅ Correct
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () =>
  createClientComponentClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )