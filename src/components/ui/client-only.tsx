'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

/**
 * Component that only renders its children on the client side
 * Prevents hydration mismatches for client-only content
 */
export function ClientOnly({ 
  children, 
  fallback = null,
  className 
}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return (
    <div className={className} suppressHydrationWarning>
      {children}
    </div>
  );
}

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Alternative component name for ClientOnly
 * Some developers prefer this naming convention
 */
export function NoSSR({ children, fallback }: NoSSRProps) {
  return <ClientOnly fallback={fallback}>{children}</ClientOnly>;
}

interface ConditionalRenderProps {
  condition: () => boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders based on a client-side condition
 * The condition is only evaluated on the client to prevent mismatches
 */
export function ConditionalRender({ 
  condition, 
  children, 
  fallback = null 
}: ConditionalRenderProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setShouldRender(condition());
  }, [condition]);

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface DynamicContentProps {
  children: ReactNode | (() => ReactNode);
  placeholder?: ReactNode;
  className?: string;
}

/**
 * Wrapper for dynamic content that might differ between server and client
 * Properly handles hydration by waiting for client-side mount
 */
export function DynamicContent({
  children,
  placeholder = null,
  className
}: DynamicContentProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [content, setContent] = useState<ReactNode>(placeholder);

  useEffect(() => {
    setHasMounted(true);
    setContent(typeof children === 'function' ? children() : children);
  }, [children]);

  // Don't render anything until after hydration to prevent mismatches
  if (!hasMounted) {
    return <div className={className}>{placeholder}</div>;
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}