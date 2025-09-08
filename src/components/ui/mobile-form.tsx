'use client';

import { cn } from '@/lib/utils';
import { ActionLoader } from '@/components/ui/dashboard-loader';

interface MobileFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function MobileForm({
  children,
  title,
  description,
  className,
  ...props
}: MobileFormProps) {
  return (
    <div className="w-full max-w-full sm:max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <div
        className={cn(
          'bg-card rounded-lg shadow-sm border p-4 sm:p-6 md:p-8',
          className
        )}
      >
        {title && (
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">
            {title}
          </h1>
        )}

        {description && (
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            {description}
          </p>
        )}

        <form className="space-y-4 sm:space-y-6" {...props}>
          {children}
        </form>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface FormGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
  className?: string;
}

export function FormGrid({ children, cols = 1, className }: FormGridProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
  }[cols];

  return (
    <div className={cn('grid gap-4 sm:gap-6', gridClass, className)}>
      {children}
    </div>
  );
}

interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function MobileButton({
  variant = 'primary',
  loading,
  loadingText,
  children,
  className,
  disabled,
  ...props
}: MobileButtonProps) {
  const baseClasses =
    'w-full sm:w-auto py-3 px-4 sm:py-2 sm:px-6 text-base font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 transition-transform';

  const variantClasses = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary-500',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary-500',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-ring',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        (loading || disabled) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <ActionLoader size="sm" className="mr-2" />
          {loadingText || 'Cargando...'}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// Touch-friendly input wrapper
export function MobileInput({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        className={cn(
          'w-full py-3 px-3 text-base rounded-lg border transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors',
          error ? 'border-red-500' : 'border-border',
          'min-h-12 touch-manipulation'
        )}
        {...props}
      />
    </div>
  );
}

// Touch-friendly select wrapper
export function MobileSelect({
  error,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <div>
      <select
        className={cn(
          'w-full py-3 px-3 text-base rounded-lg border transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors',
          error ? 'border-red-500' : 'border-border',
          'min-h-12 touch-manipulation'
        )}
        {...props}
      />
    </div>
  );
}

// Touch-friendly textarea wrapper
export function MobileTextarea({
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <div>
      <textarea
        className={cn(
          'w-full py-3 px-3 text-base rounded-lg border transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors',
          error ? 'border-red-500' : 'border-border',
          'min-h-24 touch-manipulation resize-none'
        )}
        {...props}
      />
    </div>
  );
}

// Mobile-safe area component
export function MobileSafeArea({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('pt-safe pb-safe', className)}>{children}</div>;
}

// Floating action button for mobile
export function FloatingActionButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg',
        'hover:bg-primary/90 transition-all duration-200',
        'min-h-14 min-w-14 flex items-center justify-center',
        'touch-manipulation',
        className
      )}
    >
      {children}
    </button>
  );
}
