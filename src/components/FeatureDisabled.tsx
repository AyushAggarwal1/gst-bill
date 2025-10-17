import Link from 'next/link'

interface FeatureDisabledProps {
  feature: string
  title?: string
  description?: string
}

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

export default function FeatureDisabled({ 
  feature, 
  title, 
  description 
}: FeatureDisabledProps) {
  const featureName = FEATURE_NAMES[feature] || feature.replace('_', ' ')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {title || `${featureName} is Disabled`}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {description || `The ${featureName.toLowerCase()} feature has been disabled for your organization. Please contact your administrator if you need access to this feature.`}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Feature Access Restricted
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This feature is currently disabled for your organization. 
                    Contact your administrator to enable access to {featureName.toLowerCase()}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              Contact Support
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
