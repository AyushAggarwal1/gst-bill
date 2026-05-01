import NextAuth from "next-auth"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authConfig } from '@/auth.config'
import { findFirstAvailableFeature } from './lib/featureRedirect'

// Use only the edge-safe config — no bcrypt, no prisma, no native addons
const { auth } = NextAuth(authConfig)

// Feature flag mapping for protected routes
const FEATURE_ROUTE_MAP: Record<string, string> = {
  '/dashboard': 'DASHBOARD',
  '/dashboard/customers': 'CUSTOMERS',
  '/dashboard/items': 'ITEMS',
  '/dashboard/bills': 'BILLS',
  '/dashboard/templates': 'TEMPLATES',
  '/dashboard/user-management': 'USER_MANAGEMENT',
  '/dashboard/api-docs': 'API_DOCS',
  // '/search-gst': 'GST_SEARCH',
  // '/search-hsn': 'HSN_SEARCH',
}

function getRequiredFeature(path: string): string | null {
  if (FEATURE_ROUTE_MAP[path]) {
    return FEATURE_ROUTE_MAP[path]
  }
  for (const [route, feature] of Object.entries(FEATURE_ROUTE_MAP)) {
    if (path.startsWith(route + '/')) {
      return feature
    }
  }
  return null
}

export default auth(async function proxy(request: NextRequest & { auth: any }) {
  const path = request.nextUrl.pathname
  const session = request.auth

  const publicPaths = ['/', '/privacy-policy', '/search-gst', '/search-hsn', '/terms-of-service', '/forgot-password', '/reset-password', '/health', '/sitemap.xml', '/robots.txt']
  const authOnlyPaths = ['/login', '/register', '/']

  const isPublicPath = publicPaths.includes(path)
  const isAuthOnlyPath = authOnlyPaths.includes(path)

  if (isAuthOnlyPath && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isPublicPath && !isAuthOnlyPath && !session && !path.startsWith('/api') && !path.startsWith('/accept-invitation')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && !isPublicPath && !isAuthOnlyPath && !path.startsWith('/api')) {
    const tenantId = (session.user as any)?.tenantId

    if (tenantId) {
      const requiredFeature = getRequiredFeature(path)

      if (requiredFeature) {
        try {
          const baseUrl = process.env.FLAGS_SERVICE_URL
          if (baseUrl) {
            const response = await fetch(`${baseUrl}/api/tenants/${tenantId}/features`, {
              cache: 'no-store',
              headers: { 'Content-Type': 'application/json' },
            })

            if (response.ok) {
              const flags = await response.json()
              const featureFlag = flags.find((flag: any) => flag.feature === requiredFeature)

              if (featureFlag && !featureFlag.enabled) {
                const enabledFeatures = new Set<string>()
                for (const flag of flags) {
                  if (flag.enabled) enabledFeatures.add(flag.feature)
                }
                const redirectPath = findFirstAvailableFeature(enabledFeatures)
                const url = new URL(redirectPath, request.url)
                url.searchParams.set('message', 'feature_redirected')
                url.searchParams.set('from', requiredFeature)
                return NextResponse.redirect(url)
              }
            }
          }
        } catch (error) {
          console.warn('Failed to fetch feature flags:', error)
        }
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.*\\.svg|images|api).*)',
  ],
}
