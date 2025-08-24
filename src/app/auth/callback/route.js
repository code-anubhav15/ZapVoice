// src/app/auth/callback/route.js

// ❌ Incorrect import
// import { createServerClient } from '@supabase/auth-helpers-nextjs';

// ✅ Correct import
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    // ✅ Use the correct function and its syntax
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`https://zapvoiceai.vercel.app/dashboard`);
}