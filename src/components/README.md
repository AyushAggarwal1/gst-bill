# Component Structure Documentation

This document outlines the refactored component structure for the GSTly application.

## Overview

The component library has been restructured to follow atomic design principles and provide consistent UI patterns across the application.

## Component Categories

### 1. Base UI Components (`/ui`)

These are the foundational building blocks of the UI:

#### Form Components
- **Button** - Consistent button with variants (primary, secondary, success, warning, danger, ghost, outline)
- **Input** - Text input with label, error states, and icon support
- **Select** - Dropdown select with consistent styling
- **Checkbox** - Checkbox with label and description support
- **Toggle** - Switch/toggle component for boolean values
- **FormField** - Wrapper for form inputs with label and error handling
- **FormSection** - Groups related form fields with title and description

#### Layout Components
- **Card** - Container with header, content, and footer sections
- **Modal** - Consistent modal dialog with size variants
- **PageHeader** - Standard page header with title, description, and actions
- **StatsCard** - Displays statistics with icon, value, and optional link
- **QuickActionCard** - Action cards for dashboard quick actions
- **LoadingSpinner** - Loading indicator with size variants
- **EmptyState** - Empty state component with icon, title, and optional action

#### Feedback Components
- **Alert** - Alert messages with variants (info, success, warning, error)
- **Toast** - Toast notifications
- **ConfirmDialog** - Confirmation dialog for destructive actions
- **Badge** - Small status indicators

### 2. Business Components

These are application-specific components that use the base UI components:

- **EditUserModal** - Modal for editing user details and permissions
- **ConfirmDialog** - Application-specific confirm dialog wrapper

## Design System

### Colors

The application uses a consistent color palette defined in `tailwind.config.js`:

- **Primary**: Blue tones for main actions and branding
- **Secondary**: Gray tones for secondary elements
- **Success**: Green tones for positive actions
- **Warning**: Yellow/amber tones for warnings
- **Danger**: Red tones for destructive actions

### Typography

- Font family: Inter
- Consistent font sizes and line heights
- Semantic heading hierarchy

### Spacing

- Consistent spacing scale using Tailwind's spacing system
- Responsive spacing with `sm:` breakpoints

## Usage Examples

### Basic Form

```tsx
import { FormSection, FormField, Input, Button } from '@/components/ui';

function MyForm() {
  return (
    <FormSection title="User Information">
      <FormField label="Name" required>
        <Input placeholder="Enter your name" />
      </FormField>
      <Button variant="primary">Save</Button>
    </FormSection>
  );
}
```

### Dashboard Stats

```tsx
import { StatsCard } from '@/components/ui';

function Dashboard() {
  return (
    <StatsCard
      title="Total Customers"
      value={150}
      icon={<CustomerIcon />}
      href="/customers"
      linkText="View all customers"
      iconBgColor="bg-blue-100"
    />
  );
}
```

### Modal with Form

```tsx
import { Modal, FormField, Input, Button } from '@/components/ui';

function EditModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Item">
      <FormField label="Item Name">
        <Input placeholder="Enter item name" />
      </FormField>
      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary">Save</Button>
      </div>
    </Modal>
  );
}
```

## Component Props

### Common Props

Most components accept these common props:

- `className?: string` - Additional CSS classes
- `children?: ReactNode` - Child elements

### Variant Props

Many components support variant props for consistent theming:

- `variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'`
- `size?: 'sm' | 'md' | 'lg'`

## Accessibility

All components follow accessibility best practices:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility

## Responsive Design

Components are built mobile-first with responsive breakpoints:

- Base styles for mobile
- `sm:` prefix for tablet and up (640px+)
- `lg:` prefix for desktop (1024px+)

## Best Practices

1. **Use semantic HTML** - Components use appropriate HTML elements
2. **Consistent spacing** - Use the design system spacing scale
3. **Proper TypeScript** - All components are fully typed
4. **Composition over inheritance** - Build complex UIs by composing simple components
5. **Accessibility first** - Always consider accessibility in component design

## Migration Guide

When migrating existing components:

1. Replace custom styling with design system components
2. Use consistent prop naming conventions
3. Implement proper TypeScript interfaces
4. Add accessibility attributes
5. Test responsive behavior

## Future Enhancements

- Add animation/transition components
- Implement theme switching
- Add more form components (date picker, file upload, etc.)
- Create layout templates for common page structures 