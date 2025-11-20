import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("absolute flex h-3 w-3 rounded-full z-50 pointer-events-none", {
  variants: {
    variant: {
      default: "bg-red-500",
      mineduc: "bg-[#E30613]", // Mineduc Red
      success: "bg-green-500",
      warning: "bg-yellow-500",
    },
    position: {
      "top-right": "top-0 right-0 -mt-1 -mr-1",
      "top-left": "top-0 left-0 -mt-1 -ml-1",
      "bottom-right": "bottom-0 right-0 -mb-1 -mr-1",
      "bottom-left": "bottom-0 left-0 -mb-1 -ml-1",
    },
  },
  defaultVariants: {
    variant: "mineduc",
    position: "top-right",
  },
})

export interface NotificationBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  show?: boolean
  animate?: boolean
}

export function NotificationBadge({
  className,
  variant,
  position,
  show = true,
  animate = true,
  ...props
}: NotificationBadgeProps) {
  if (!show) return null

  return (
    <span className={cn(badgeVariants({ variant, position }), className)} {...props}>
      {animate && (
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            variant === "mineduc"
              ? "bg-[#E30613]"
              : variant === "success"
                ? "bg-green-500"
                : variant === "warning"
                  ? "bg-yellow-500"
                  : "bg-red-500",
          )}
        ></span>
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full h-3 w-3",
          variant === "mineduc"
            ? "bg-[#E30613]"
            : variant === "success"
              ? "bg-green-500"
              : variant === "warning"
                ? "bg-yellow-500"
                : "bg-red-500",
        )}
      ></span>
    </span>
  )
}

export function withNotification<P extends object>(
  Component: React.ComponentType<P>,
  badgeProps?: NotificationBadgeProps,
) {
  return function WrappedComponent(props: P & { showBadge?: boolean }) {
    const { showBadge, ...rest } = props
    return (
      <div className="relative inline-flex">
        <Component {...(rest as P)} />
        <NotificationBadge show={showBadge} {...badgeProps} />
      </div>
    )
  }
}
