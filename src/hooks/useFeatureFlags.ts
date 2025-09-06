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

export function useFeatureFlags(): UseFeatureFlagsReturn {
  const [enabledFeatures, setEnabledFeatures] = useState<Set<string> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeatureFlags = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/feature-flags', { 
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch feature flags')
      }
      
      const flags: FeatureFlag[] = await response.json()
      const enabledSet = new Set<string>()
      
      for (const flag of flags) {
        if (flag.enabled) {
          enabledSet.add(flag.feature)
        }
      }
      
      setEnabledFeatures(enabledSet)
    } catch (err) {
      console.error('Error fetching feature flags:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Default to allowing all features if there's an error (fail open)
      setEnabledFeatures(null)
    } finally {
      setIsLoading(false)
    }
  }

  const isFeatureEnabled = (feature: string): boolean => {
    if (!feature) return true
    return enabledFeatures ? enabledFeatures.has(feature) : true
  }

  const refetch = async () => {
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
