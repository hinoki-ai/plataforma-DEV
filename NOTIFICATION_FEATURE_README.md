# Notification Badge Feature

This package contains a complete implementation of a minimalistic notification dot (badge) system, styled with the Mineduc red color (`#E30613`).

## Contents

1.  `components/ui/notification-badge.tsx`: The core component.
2.  `app/page.tsx`: A demo page showing usage examples.

## Installation

1.  Copy `components/ui/notification-badge.tsx` to your project's `components/ui` folder.
2.  Ensure you have `class-variance-authority`, `clsx`, and `tailwind-merge` installed (standard in shadcn/ui projects).

## Usage

### Method 1: Manual Wrapper (Recommended)

Wrap any element in a `relative` container and place the `NotificationBadge` inside.

\`\`\`tsx
import { Button } from "@/components/ui/button"
import { NotificationBadge } from "@/components/ui/notification-badge"

export function MyComponent() {
  return (
    <div className="relative inline-flex">
      <Button>Notifications</Button>
      <NotificationBadge show={true} />
    </div>
  )
}
\`\`\`

### Method 2: Higher Order Component

Create a reusable component that accepts a `showBadge` prop.

\`\`\`tsx
import { Button } from "@/components/ui/button"
import { withNotification } from "@/components/ui/notification-badge"

const BadgeButton = withNotification(Button)

export function MyComponent() {
  return <BadgeButton showBadge>Click Me</BadgeButton>
}
\`\`\`

## Customization

The badge uses the Mineduc red color (`#E30613`) by default. You can change this in `components/ui/notification-badge.tsx` or pass a different `variant` prop.
