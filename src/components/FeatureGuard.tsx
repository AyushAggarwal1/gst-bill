import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import FeatureDisabled from './FeatureDisabled'
import { LoadingSpinner } from './Spinner'
import { findFirstAvailableFeature } from '@/lib/featureRedirect'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface FeatureGuardProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function FeatureGuard({ 
  feature, 
  children, 
  fallback 
}: FeatureGuardProps) {
  const { isFeatureEnabled, isLoading, enabledFeatures } = useFeatureFlags()
  const router = useRouter()

  // Always call useEffect - no conditional hooks
  useEffect(() => {
    if (!isLoading && !isFeatureEnabled(feature)) {
      const redirectPath = findFirstAvailableFeature(enabledFeatures)
      router.replace(`${redirectPath}?message=feature_redirected&from=${feature}`)
    }
  }, [isLoading, isFeatureEnabled, feature, enabledFeatures, router])

  // Show loading spinner while feature flags are loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    )
  }

  // If feature is disabled, show loading while redirecting
  if (!isFeatureEnabled(feature)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Redirecting to available feature..." />
      </div>
    )
  }

  // Feature is enabled, render children
  return <>{children}</>
}
