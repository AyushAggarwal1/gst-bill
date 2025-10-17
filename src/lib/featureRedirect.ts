// Helper function to find the first available enabled feature for redirect
export function findFirstAvailableFeature(enabledFeatures: Set<string> | null): string {
  // Default fallback order - prioritize most commonly used features
  const fallbackOrder = [
    'DASHBOARD',
    'BILLS', 
    'CUSTOMERS',
    'ITEMS',
    'TEMPLATES',
    'USER_MANAGEMENT',
    'API_DOCS',
    'GST_SEARCH',
    'HSN_SEARCH'
  ]

  // If no feature flags loaded, default to dashboard
  if (!enabledFeatures) {
    return '/dashboard'
  }

  // Find first enabled feature in fallback order
  for (const feature of fallbackOrder) {
    if (enabledFeatures.has(feature)) {
      return getRouteForFeature(feature)
    }
  }

  // If no features are enabled (edge case), default to dashboard
  return '/dashboard'
}

// Map features to their routes
function getRouteForFeature(feature: string): string {
  const featureRouteMap: Record<string, string> = {
    'DASHBOARD': '/dashboard',
    'CUSTOMERS': '/dashboard/customers',
    'ITEMS': '/dashboard/items',
    'BILLS': '/dashboard/bills',
    'TEMPLATES': '/dashboard/templates',
    'USER_MANAGEMENT': '/dashboard/user-management',
    'API_DOCS': '/dashboard/api-docs',
    'GST_SEARCH': '/search-gst',
    'HSN_SEARCH': '/search-hsn',
  }
  
  return featureRouteMap[feature] || '/dashboard'
}

// Get all available features for a user
export function getAvailableFeatures(enabledFeatures: Set<string> | null): string[] {
  if (!enabledFeatures) {
    return ['/dashboard'] // Default fallback
  }

  const availableRoutes: string[] = []
  
  for (const feature of enabledFeatures) {
    const route = getRouteForFeature(feature)
    if (route) {
      availableRoutes.push(route)
    }
  }
  
  return availableRoutes
}
