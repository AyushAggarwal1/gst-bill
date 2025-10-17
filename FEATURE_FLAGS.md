# Feature Flags Implementation

This document describes the feature flag system implemented in the GST Bill application to control access to different features based on tenant configuration.

## Overview

The feature flag system allows administrators to enable or disable specific features for different tenants through the `gst-bill-flags` service. When a feature is disabled, users are automatically redirected to the first available enabled feature, providing a seamless user experience.

## Architecture

### Components

1. **gst-bill-flags Service**: Manages feature flags in the database
2. **gst-bills Application**: Consumes feature flags and enforces access control
3. **Middleware**: Server-side feature flag checking for route protection
4. **Client-side Components**: UI-level feature flag checking and display

### Feature Flag Flow

```
User Request → Middleware → Feature Flag Check → Allow/Smart Redirect
                     ↓
              Client-side Hook → UI Filtering + Redirect
                     ↓
              Notification → User Feedback
```

## Implementation Details

### 1. Middleware Protection (`src/middleware.ts`)

- Intercepts all requests to protected routes
- Fetches feature flags from the flags service
- **Smart Redirect**: Redirects users to first available enabled feature if requested feature is disabled
- Supports both exact route matches and dynamic routes (e.g., `/dashboard/bills/123`)
- Provides redirect notification parameters for user feedback

### 2. Feature Flags Hook (`src/hooks/useFeatureFlags.ts`)

- Provides consistent feature flag checking across the application
- Handles loading states and error conditions
- Implements "fail open" strategy (allows access if flags can't be fetched)

### 3. Feature Guard Component (`src/components/FeatureGuard.tsx`)

- Higher-order component for page-level protection
- Shows loading spinner while flags are loading
- **Smart Redirect**: Automatically redirects to first available feature when disabled
- Provides smooth user experience with loading states

### 4. Smart Redirect System (`src/lib/featureRedirect.ts`)

- Helper functions for finding first available enabled feature
- Prioritized fallback order: Dashboard → Bills → Customers → Items → Templates → ...
- Supports both server-side (middleware) and client-side (components) redirects

### 5. Redirect Notification (`src/components/FeatureRedirectNotification.tsx`)

- User-friendly notification when redirected from disabled features
- Auto-dismisses after 5 seconds
- Clear messaging about why the redirect occurred
- Professional design with helpful information

## Protected Features

The following features are protected by feature flags:

| Feature | Route | Flag |
|---------|-------|------|
| Dashboard | `/dashboard` | `DASHBOARD` |
| Customer Management | `/dashboard/customers` | `CUSTOMERS` |
| Item Management | `/dashboard/items` | `ITEMS` |
| Bill Management | `/dashboard/bills` | `BILLS` |
| Bill Templates | `/dashboard/templates` | `TEMPLATES` |
| User Management | `/dashboard/user-management` | `USER_MANAGEMENT` |
| API Documentation | `/dashboard/api-docs` | `API_DOCS` |
| GST Search | `/search-gst` | `GST_SEARCH` |
| HSN Search | `/search-hsn` | `HSN_SEARCH` |

## Smart Redirect Behavior

### Redirect Priority Order

When a user tries to access a disabled feature, they are redirected to the first available enabled feature in this priority order:

1. **Dashboard** (`/dashboard`) - Main overview page
2. **Bills** (`/dashboard/bills`) - Core billing functionality  
3. **Customers** (`/dashboard/customers`) - Customer management
4. **Items** (`/dashboard/items`) - Inventory management
5. **Templates** (`/dashboard/templates`) - Bill templates
6. **User Management** (`/dashboard/user-management`) - Admin features
7. **API Docs** (`/dashboard/api-docs`) - Documentation
8. **GST Search** (`/search-gst`) - GST verification
9. **HSN Search** (`/search-hsn`) - HSN code lookup

### User Experience

1. **Seamless Redirect**: Users are automatically taken to an available feature
2. **Clear Notification**: A friendly notification explains why they were redirected
3. **No Dead Ends**: Users never see error pages, always land on working functionality
4. **Consistent Navigation**: Disabled features are hidden from navigation menus

### Example Scenarios

**Scenario 1: Limited Tenant**
- User tries to access `/dashboard/customers` (disabled)
- Gets redirected to `/dashboard` (enabled)
- Sees notification: "Customer Management feature is currently disabled"

**Scenario 2: Basic Tenant**  
- User tries to access `/dashboard/bills` (disabled)
- Gets redirected to `/dashboard/customers` (enabled)
- Sees notification: "Bill Management feature is currently disabled"

## Usage Examples

### Page-Level Protection

```tsx
import FeatureGuard from '@/components/FeatureGuard'

export default function BillsPage() {
  return (
    <FeatureGuard feature="BILLS">
      <BillsPageContent />
    </FeatureGuard>
  )
}
```

### Hook Usage

```tsx
import { useFeatureFlags } from '@/hooks/useFeatureFlags'

function MyComponent() {
  const { isFeatureEnabled, isLoading } = useFeatureFlags()
  
  if (isLoading) return <LoadingSpinner />
  
  return (
    <div>
      {isFeatureEnabled('BILLS') && (
        <Link href="/dashboard/bills">Manage Bills</Link>
      )}
    </div>
  )
}
```

### Navigation Filtering

The navigation menu automatically filters out disabled features:

```tsx
{navigation.map((item) => (
  (!item.adminOnly || (item.adminOnly && isAdmin)) && 
  isFeatureEnabled(item.feature) && (
    <Link key={item.name} href={item.href}>
      {item.name}
    </Link>
  )
))}
```

## Configuration

### Environment Variables

- `FLAGS_SERVICE_URL`: URL of the gst-bill-flags service

### Database Schema

The feature flags are stored in the `TenantFeatureFlag` table:

```sql
model TenantFeatureFlag {
  id        String   @id @default(uuid())
  tenantId  String   // references gst-bill tenant id
  feature   Feature  // enum with all available features
  enabled   Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tenantId, feature])
}
```

## Error Handling

### Server-Side (Middleware)
- Network errors: Allow access (fail open)
- Invalid responses: Allow access (fail open)
- Feature disabled: Redirect to dashboard with error parameters

### Client-Side (Hook)
- Network errors: Allow access (fail open)
- Invalid responses: Allow access (fail open)
- Loading states: Show loading spinner

## Security Considerations

1. **Fail Open Strategy**: If feature flags can't be fetched, access is allowed to prevent service disruption
2. **Server-Side Validation**: Middleware provides the primary security layer
3. **Client-Side Enhancement**: UI filtering improves user experience but doesn't replace server-side checks
4. **Tenant Isolation**: Each tenant's feature flags are completely isolated

## Testing

To test the feature flag system:

1. **Enable/Disable Features**: Use the gst-bill-flags admin interface
2. **Test Navigation**: Verify disabled features don't appear in navigation
3. **Test Direct Access**: Try accessing disabled features directly via URL
4. **Test Error Handling**: Disconnect the flags service to test fail-open behavior

## Troubleshooting

### Common Issues

1. **Features not loading**: Check `FLAGS_SERVICE_URL` environment variable
2. **Infinite redirects**: Verify middleware route matching logic
3. **UI not updating**: Check if components are using the `useFeatureFlags` hook
4. **Performance issues**: Consider caching feature flags on the client side

### Debug Mode

Add logging to the middleware to debug feature flag checks:

```typescript
console.log('Checking feature:', requiredFeature, 'for path:', path)
console.log('Feature enabled:', featureFlag?.enabled)
```
