import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { findFirstAvailableFeature } from './lib/featureRedirect'

// Feature flag mapping for protected routes
const FEATURE_ROUTE_MAP: Record<string, string> = {
  '/dashboard': 'DASHBOARD',
  '/dashboard/customers': 'CUSTOMERS',
  '/dashboard/items': 'ITEMS',
  '/dashboard/bills': 'BILLS',
  '/dashboard/templates': 'TEMPLATES',
  '/dashboard/user-management': 'USER_MANAGEMENT',
  '/dashboard/api-docs': 'API_DOCS',
  '/search-gst': 'GST_SEARCH',
  '/search-hsn': 'HSN_SEARCH',
}

// Helper function to check if a path matches any feature-protected route
function getRequiredFeature(path: string): string | null {
  // Check exact matches first
  if (FEATURE_ROUTE_MAP[path]) {
    return FEATURE_ROUTE_MAP[path]
  }
  
  // Check for dynamic routes (e.g., /dashboard/bills/123)
  for (const [route, feature] of Object.entries(FEATURE_ROUTE_MAP)) {
    if (path.startsWith(route + '/')) {
      return feature
    }
  }
  
  return null
}

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Define public paths that don't require authentication
  const publicPaths = ['/', '/privacy-policy', '/terms-of-service', '/forgot-password', '/reset-password', '/health', '/sitemap.xml', '/robots.txt']
  
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

  // Check feature flags for authenticated users
  if (token && !isPublicPath && !isAuthOnlyPath && !path.startsWith('/api')) {
    const user = token as any
    const tenantId = user.tenantId

    if (tenantId) {
      // Check if the current path requires a feature flag
      const requiredFeature = getRequiredFeature(path)
      
      if (requiredFeature) {
        try {
          // Fetch feature flags from the flags service
          const baseUrl = process.env.FLAGS_SERVICE_URL
          if (baseUrl) {
            const response = await fetch(`${baseUrl}/api/tenants/${tenantId}/features`, {
              cache: 'no-store',
              headers: {
                'Content-Type': 'application/json',
              },
            })

            if (response.ok) {
              const flags = await response.json()
              const featureFlag = flags.find((flag: any) => flag.feature === requiredFeature)
              
              // If feature is explicitly disabled, redirect to first available feature
              if (featureFlag && !featureFlag.enabled) {
                // Create a set of enabled features
                const enabledFeatures = new Set<string>()
                for (const flag of flags) {
                  if (flag.enabled) {
                    enabledFeatures.add(flag.feature)
                  }
                }
                
                // Find first available feature and redirect there
                const redirectPath = findFirstAvailableFeature(enabledFeatures)
                const url = new URL(redirectPath, request.url)
                url.searchParams.set('message', 'feature_redirected')
                url.searchParams.set('from', requiredFeature)
                return NextResponse.redirect(url)
              }
            }
          }
        } catch (error) {
          // If there's an error fetching flags, allow access (fail open)
          console.warn('Failed to fetch feature flags:', error)
        }
      }
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.svg, favicon-16x16.svg (favicon files)
     * - images (public images folder)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.*\\.svg|images|api).*)',
  ],
} 