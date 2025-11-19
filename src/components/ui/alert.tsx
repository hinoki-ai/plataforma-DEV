import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 transition-all duration-200 animate-in fade-in slide-in-from-top-2 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default:
          "bg-background text-foreground border-border [&>svg]:text-foreground",
        destructive:
          "border-destructive/50 text-foreground dark:border-destructive/80 bg-destructive/10 dark:bg-destructive/20 [&>svg]:text-destructive backdrop-blur-sm shadow-sm",
        success:
          "border-secondary/50 text-foreground dark:border-secondary/80 bg-secondary/10 dark:bg-secondary/20 [&>svg]:text-secondary backdrop-blur-sm shadow-sm",
        info: "border-primary/50 text-foreground dark:border-primary/80 bg-primary/10 dark:bg-primary/20 [&>svg]:text-primary backdrop-blur-sm shadow-sm",
        warning:
          "border-accent/50 text-foreground dark:border-accent/80 bg-accent/10 dark:bg-accent/20 [&>svg]:text-accent backdrop-blur-sm shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
