import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default async function middleware(request: NextRequest) {
  if (process.env.DISABLE_MIDDLEWARE === 'true') {
    return NextResponse.next();
  }
  const path = request.nextUrl.pathname
  
  // Define public paths that don't require authentication
  const publicPaths = ['/', '/privacy-policy', '/terms-of-service', '/search-gst', '/search-hsn', '/forgot-password', '/reset-password']
  
  // Define auth-only paths that logged-in users shouldn't access
  const authOnlyPaths = ['/login', '/register', '/']
  
  const isPublicPath = publicPaths.includes(path)
  const isAuthOnlyPath = authOnlyPaths.includes(path)
  
  // Get the JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key'
  })

  // Redirect logic based on authentication state and requested path
  if (isAuthOnlyPath && token) {
    // If user is logged in and tries to access login/register page,
    // redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isPublicPath && !isAuthOnlyPath && !token && !path.startsWith('/api') && !path.startsWith('/accept-invitation')) {
    // If user is not logged in and tries to access a protected page,
    // redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.*\\.svg|images|api).*)',
  ],
}