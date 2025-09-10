import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware to handle authentication, session management, and security headers
 * This runs on every request to the application
 */
export async function middleware(request: NextRequest) {
  // Create a response object that we'll modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Skip middleware for static files, API routes, and auth routes
  const path = request.nextUrl.pathname
  if (
    path.startsWith('/_next/static') ||
    path.startsWith('/api/') ||
    path.startsWith('/_next/webpack-hmr') ||
    path.includes('.')
  ) {
    return response
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
              sameSite: 'lax',
              path: '/',
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
              path: '/',
              expires: new Date(0),
            })
          },
        },
      }
    )

    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession()

    // Handle protected admin routes
    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
      if (!session) {
        const redirectUrl = new URL('/admin/login', request.url)
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // If user is logged in and tries to access login page, redirect to dashboard
    if (path.startsWith('/admin/login') && session) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // Add security headers
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };

    // Add security headers to all responses
    Object.entries(securityHeaders).forEach(([header, value]) => {
      response.headers.set(header, value);
    });

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, return the response without modifications
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
}