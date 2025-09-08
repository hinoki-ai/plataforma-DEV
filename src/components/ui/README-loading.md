# 🎯 Unified Loading System

## Overview
A modern, minimal loading system designed to replace complex loading ecosystems with just **3 core loaders**.

## Philosophy
- **SkeletonLoader**: For content areas (most common use case)
- **ActionLoader**: For buttons/forms (micro-interactions)
- **PageLoader**: For full-page transitions (rare, minimal design)

## Why This System?
✅ **Eliminates hated blue background loader**
✅ **Reduces complexity** from 15+ loaders to 3
✅ **Better performance** with unified animations
✅ **Consistent design language**
✅ **Accessibility built-in**
✅ **Easy to maintain and extend**

## Quick Start

### Content Loading
```tsx
import { SkeletonLoader } from '@/components/ui/dashboard-loader';

// Basic content skeleton
<SkeletonLoader lines={3} />

// Card layout skeleton
<SkeletonLoader variant="card" lines={4} />

// List with avatars skeleton
<SkeletonLoader variant="list" lines={5} />
```

### Action/Button Loading
```tsx
import { ActionLoader } from '@/components/ui/dashboard-loader';

// Spinner (default)
<ActionLoader size="sm" />

// Animated dots
<ActionLoader variant="dots" size="md" />

// Simple pulse
<ActionLoader variant="pulse" size="lg" />
```

### Page-Level Loading
```tsx
import { PageLoader } from '@/components/ui/dashboard-loader';

// Minimal loading
<PageLoader text="Loading..." />

// Centered with more space
<PageLoader variant="centered" text="Please wait..." />

// Full screen (rare use)
<PageLoader variant="fullscreen" text="Loading application..." />
```

## Migration Guide

### Old System → New System
| Old Component | New Component | Usage |
|---------------|---------------|--------|
| `DashboardLoader` | ❌ REMOVED (blue background hated) | - |
| `DataTransferLoader` | `PageLoader` | `<PageLoader />` |
| `VercelStyleLoader` | `PageLoader` | `<PageLoader />` |
| `LoadingSpinner` | `ActionLoader` | `<ActionLoader variant="spinner" />` |
| `FormSkeleton` | `SkeletonLoader` | `<SkeletonLoader variant="card" />` |
| `ListSkeleton` | `SkeletonLoader` | `<SkeletonLoader variant="list" />` |

## Best Practices

### When to Use Each Loader

#### 🎨 SkeletonLoader (Most Common)
- Content areas that are loading data
- Lists, tables, cards
- Dashboard components
- Any content that has a predictable structure

#### ⚡ ActionLoader (Micro-interactions)
- Button states during form submission
- File uploads
- API calls triggered by user actions
- Inline loading states

#### 📄 PageLoader (Rare)
- Initial page loads
- Route transitions (only when necessary)
- Full application state changes
- **Avoid overuse** - prefer skeleton loading

### Performance Tips
- Use `React.memo()` for frequently rendered loaders
- Prefer skeleton loading over page loading
- Use `variant="dots"` for subtle loading states
- Keep loading text concise and helpful

### Accessibility
- All loaders include proper ARIA labels
- Screen reader support built-in
- Keyboard navigation preserved
- Color contrast optimized

## Examples in Codebase

### Votaciones Page
```tsx
// Before: Custom full-screen spinner
if (isLoading) {
  return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-32 w-32 border-b-2 border-primary" />
  </div>
}

// After: Content skeleton
if (isLoading) {
  return <SkeletonLoader variant="list" lines={6} />
}
```

### Dynamic Imports
```tsx
// Before: Complex skeleton components
const CalendarSkeleton = () => <div>...</div>
const DashboardSkeleton = () => <div>...</div>

// After: Unified system
const CalendarSkeleton = () => <SkeletonLoader variant="content" lines={6} />
const DashboardSkeleton = () => <SkeletonLoader variant="content" lines={8} />
```

## Customization

### Extending Variants
```tsx
// Add new skeleton variant
export function CustomSkeleton({ className, ...props }: Props) {
  return (
    <SkeletonLoader
      variant="content"
      lines={3}
      className={cn("custom-styles", className)}
      {...props}
    />
  );
}
```

### Custom Colors
```tsx
// Use CSS custom properties for theming
<ActionLoader
  className="[&>svg]:text-primary"
  variant="spinner"
/>
```

## Maintenance
- Keep the 3-loader limit sacred
- Test all loaders in both light/dark modes
- Verify accessibility with screen readers
- Monitor performance impact
- Update documentation when adding features