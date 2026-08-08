import { useState, useEffect } from 'react'

interface FeatureFlag {
  feature: string
  enabled: boolean
}

interface UseFeatureFlagsReturn {
  enabledFeatures: Set<string> | null
  isFeatureEnabled: (feature: string) => boolean
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Module-level cache — shared across all hook instances and page navigations
const cache: { flags: Set<string> | null; ts: number } = { flags: null, ts: 0 }
const CACHE_TTL = 60_000 // 60 seconds
let inFlight: Promise<Set<string> | null> | null = null

async function loadFlags(): Promise<Set<string> | null> {
  if (cache.flags !== null && Date.now() - cache.ts < CACHE_TTL) {
    return cache.flags
  }
  if (inFlight) return inFlight

  inFlight = (async () => {
    try {
      const response = await fetch('/api/feature-flags', {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Failed to fetch feature flags')
      const flags: FeatureFlag[] = await response.json()
      const set = new Set<string>(flags.filter(f => f.enabled).map(f => f.feature))
      cache.flags = set
      cache.ts = Date.now()
      return set
    } catch {
      return null
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}

export function useFeatureFlags(): UseFeatureFlagsReturn {
  const [enabledFeatures, setEnabledFeatures] = useState<Set<string> | null>(cache.flags)
  const [isLoading, setIsLoading] = useState(cache.flags === null)
  const [error, setError] = useState<string | null>(null)

  const fetchFeatureFlags = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await loadFlags()
      setEnabledFeatures(result)
    } catch (err) {
      console.error('Error fetching feature flags:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setEnabledFeatures(null)
    } finally {
      setIsLoading(false)
    }
  }

  const isFeatureEnabled = (feature: string): boolean => {
    if (!feature) return true
    // Fail open when flags couldn't be fetched OR the tenant has no flags
    // configured at all — matches the middleware, which only blocks a route
    // when an explicit flag row exists with enabled=false.
    if (!enabledFeatures || enabledFeatures.size === 0) return true
    return enabledFeatures.has(feature)
  }

  const refetch = async () => {
    cache.ts = 0 // invalidate cache
    await fetchFeatureFlags()
  }

  useEffect(() => {
    fetchFeatureFlags()
  }, [])

  return {
    enabledFeatures,
    isFeatureEnabled,
    isLoading,
    error,
    refetch,
  }
}
