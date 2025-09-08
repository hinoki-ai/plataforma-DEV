'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';

interface SimpleErrorBoundaryProps {
  children: ReactNode;
}

interface SimpleErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class SimpleErrorBoundary extends Component<
  SimpleErrorBoundaryProps,
  SimpleErrorBoundaryState
> {
  constructor(props: SimpleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Use enhanced error logging
    import('@/lib/logger').then(({ logger }) =>
      logger.logErrorBoundary(error, errorInfo, 'SimpleErrorBoundary')
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Error de aplicación
            </h1>
            <p className="text-muted-foreground mb-4">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
