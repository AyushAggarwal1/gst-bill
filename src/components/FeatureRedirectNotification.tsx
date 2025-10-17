import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const FEATURE_NAMES: Record<string, string> = {
  DASHBOARD: 'Dashboard',
  CUSTOMERS: 'Customer Management',
  ITEMS: 'Item Management',
  BILLS: 'Bill Management',
  TEMPLATES: 'Bill Templates',
  USER_MANAGEMENT: 'User Management',
  API_DOCS: 'API Documentation',
  GST_SEARCH: 'GST Search',
  HSN_SEARCH: 'HSN Search',
}

export default function FeatureRedirectNotification() {
  const searchParams = useSearchParams()
  const [showNotification, setShowNotification] = useState(false)
  const [redirectedFrom, setRedirectedFrom] = useState<string | null>(null)

  useEffect(() => {
    const message = searchParams?.get('message')
    const from = searchParams?.get('from')
    
    if (message === 'feature_redirected' && from) {
      setRedirectedFrom(from)
      setShowNotification(true)
      
      // Auto-hide notification after 5 seconds
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!showNotification || !redirectedFrom) {
    return null
  }

  const featureName = FEATURE_NAMES[redirectedFrom] || redirectedFrom.replace('_', ' ')

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Feature Access Redirected
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>
                The <strong>{featureName}</strong> feature is currently disabled. 
                You've been redirected to an available feature.
              </p>
            </div>
            <div className="mt-2">
              <button
                onClick={() => setShowNotification(false)}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
