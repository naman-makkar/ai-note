import { type NextRequest, NextResponse } from 'next/server'
import { type CookieOptions, createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log(`Auth Callback: Received request for origin: ${origin}, next: ${next}`);

  if (code) {
    console.log(`Auth Callback: Received code: ${code.substring(0, 10)}...`); // Log first part of code
    
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            console.log(`Auth Callback: Setting cookie '${name}'`); // Log cookie setting
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            console.log(`Auth Callback: Removing cookie '${name}'`); // Log cookie removal
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    console.log('Auth Callback: Attempting to exchange code for session...');
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log('Auth Callback: Exchange successful! Redirecting to:', response.headers.get('location'));
      // Return the response object which includes the redirect and set cookies
      return response;
    }
    
    // Log the specific error if exchange failed
    console.error('Auth Callback: Error exchanging code for session:', error.message, error);
    return NextResponse.redirect(`${origin}/login?error=AuthExchangeFailed&message=${encodeURIComponent(error.message)}`);

  } else {
    // Log if no code was found
    console.error('Auth Callback Error: No code found in search parameters.');
    return NextResponse.redirect(`${origin}/login?error=NoAuthCode`);
  }
}
