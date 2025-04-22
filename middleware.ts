import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Create potentially modified response object right away
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Use createServerClient directly, passing request and response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set/updated, update the request and response cookies
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ // Re-create response to ensure headers are fresh
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request and response cookies
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ // Re-create response
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session - this will potentially set cookies via the handlers above
  const { data: { session } } = await supabase.auth.getSession()

  const { data: { user } } = await supabase.auth.getUser()

  // Define routes
  const currentPath = request.nextUrl.pathname
  const protectedRoutes = ['/dashboard'] // Add any other routes that need protection
  const publicAuthRoutes = ['/login', '/signup'] // Routes for authentication

  // --- IMPORTANT: Handle non-page routes first ---
  if (
    currentPath.startsWith('/api') ||
    currentPath.startsWith('/static') ||
    currentPath.startsWith('/_next') ||
    currentPath.includes('.') // Assume paths with dots are files (e.g., favicon.ico)
  ) {
    return response // Use the potentially modified response
  }

  // --- Redirection Logic based on Refreshed Session ---

  // If NO session exists and user tries to access a protected route
  if (!session && protectedRoutes.some(path => currentPath.startsWith(path))) {
    console.log(`Middleware: No session, accessing protected route ${currentPath}. Redirecting to /login.`);
    const url = request.nextUrl.clone()
    url.pathname = '/login' // Redirect to login page
    return NextResponse.redirect(url)
  }

  // If a session DOES exist and user tries to access login/signup pages
  if (session && publicAuthRoutes.includes(currentPath)) {
    console.log(`Middleware: Session exists, accessing auth route ${currentPath}. Redirecting to /dashboard.`);
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard' // Redirect to dashboard
    return NextResponse.redirect(url)
  }

  // If user is logged in and session is expired, redirect to login (optional, session refresh might handle this)
  // This is an extra check, Supabase SSR handles refresh, but good for explicit control
  // if (!session && user && protectedRoutes.includes(currentPath)) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   await supabase.auth.signOut() // Ensure user is logged out server-side too
  //   return NextResponse.redirect(url)
  // }

  // --- Allow request and ensure session cookie is updated ---
  // If none of the redirection conditions met, continue with the request.
  // Returning the response object is crucial for setting/refreshing the session cookie.
  console.log(`Middleware: Allowing request for ${currentPath}. Session exists: ${!!session}`);
  // Return the response object which now contains any cookies set by getSession()
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/dashboard/:path*', // Ensure dashboard and its subpaths are matched
    '/login',
    '/signup',
  ],
} 