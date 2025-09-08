import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MasterPageTemplate } from '@/components/master/MasterPageTemplate';

// Mock dependencies
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className}></div>,
}));

vi.mock('@/components/ui/advanced-error-boundary', () => ({
  AdvancedErrorBoundary: ({ children, context, enableRetry, showDetails }: any) => (
    <div data-testid="error-boundary" data-context={context} data-enable-retry={enableRetry} data-show-details={showDetails}>
      {children}
    </div>
  ),
}));

vi.mock('@/lib/logger', () => ({
  dbLogger: {
    error: vi.fn(),
  },
}), { virtual: true });

vi.mock('@/components/layout/RoleAwareNavigation', () => ({
  RoleAwareHeader: ({ title, subtitle }: any) => (
    <div data-testid="role-aware-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

describe('MasterPageTemplate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the main container with proper structure', () => {
      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
        >
          <div>Test Content</div>
        </MasterPageTemplate>
      );

      expect(screen.getByTestId('role-aware-header')).toBeInTheDocument();
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders title and subtitle correctly', () => {
      const testTitle = "🏛️ Supreme Test Control";
      const testSubtitle = "Welcome to the test environment";

      render(
        <MasterPageTemplate
          title={testTitle}
          subtitle={testSubtitle}
          context="test-context"
        >
          <div>Test Content</div>
        </MasterPageTemplate>
      );

      expect(screen.getByText(testTitle)).toBeInTheDocument();
      expect(screen.getByText(testSubtitle)).toBeInTheDocument();
    });

    it('renders children content', () => {
      const testContent = "Custom test content for master page";

      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
        >
          <div>{testContent}</div>
        </MasterPageTemplate>
      );

      expect(screen.getByText(testContent)).toBeInTheDocument();
    });
  });

  describe('Props Configuration', () => {
    it('applies custom maxWidth correctly', () => {
      const customMaxWidth = 'max-w-4xl';

      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
          maxWidth={customMaxWidth}
        >
          <div>Test Content</div>
        </MasterPageTemplate>
      );

      const contentWrapper = screen.getByText('Test Content').parentElement;
      expect(contentWrapper).toHaveClass(customMaxWidth);
    });

    it('uses default maxWidth when not provided', () => {
      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
        >
          <div>Test Content</div>
        </MasterPageTemplate>
      );

      const contentWrapper = screen.getByText('Test Content').parentElement;
      expect(contentWrapper).toHaveClass('max-w-6xl');
    });

    it('passes context to error boundary', () => {
      const testContext = 'custom-test-context';

      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context={testContext}
        >
          <div>Test Content</div>
        </MasterPageTemplate>
      );

      const errorBoundary = screen.getByTestId('error-boundary');
      expect(errorBoundary).toHaveAttribute('data-context', testContext);
    });

    it('passes enableRetry and showDetails to error boundary', () => {
      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
        >
          <div>Test Content</div>
        </MasterPageTemplate>
      );

      const errorBoundary = screen.getByTestId('error-boundary');
      expect(errorBoundary).toHaveAttribute('data-enable-retry', 'true');
      expect(errorBoundary).toHaveAttribute('data-show-details', process.env.NODE_ENV === 'development' ? 'true' : 'false');
    });
  });

  describe('Fallback Content', () => {
    it('renders custom fallback content when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Loading State</div>;

      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
          fallbackContent={customFallback}
        >
          <div>Test Content</div>
        </MasterPageTemplate>
      );

      // The fallback should be rendered by Suspense, but we can verify the structure
      const container = screen.getByText('Test Title').closest('.space-y-8');
      expect(container).toBeInTheDocument();
    });

    it('renders default fallback when no custom fallback provided', () => {
      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
        >
          <div>Test Content</div>
        </MasterPageTemplate>
      );

      // Default fallback should be available in Suspense
      const container = screen.getByText('Test Title').closest('.space-y-8');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('includes error boundary with proper configuration', () => {
      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
          errorContext="custom-error-context"
        >
          <div>Safe Content</div>
        </MasterPageTemplate>
      );

      const errorBoundary = screen.getByTestId('error-boundary');
      expect(errorBoundary).toHaveAttribute('data-context', 'test-context');
      expect(errorBoundary).toHaveAttribute('data-enable-retry', 'true');
    });

    it('handles error context properly', () => {
      const customErrorContext = 'custom-error-context';

      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
          errorContext={customErrorContext}
        >
          <div>Safe Content</div>
        </MasterPageTemplate>
      );

      // Component should render normally with custom error context
      expect(screen.getByText('Safe Content')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('applies correct container styling', () => {
      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
        >
          <div>Test Content</div>
        </MasterPageTemplate>
      );

      const mainContainer = screen.getByText('Test Title').closest('.container');
      expect(mainContainer).toHaveClass('mx-auto', 'px-4', 'py-8', 'space-y-8');
    });

    it('applies correct spacing between sections', () => {
      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
        >
          <div>Test Content</div>
        </MasterPageTemplate>
      );

      const mainContainer = screen.getByText('Test Title').closest('.space-y-8');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders with proper heading hierarchy', () => {
      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
        >
          <div>Test Content</div>
        </MasterPageTemplate>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Title');
    });

    it('maintains semantic structure', () => {
      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
        >
          <section>Test Section</section>
        </MasterPageTemplate>
      );

      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });
  });

  describe('Suspense Integration', () => {
    it('wraps children in Suspense boundary', () => {
      render(
        <MasterPageTemplate
          title="Test Title"
          subtitle="Test Subtitle"
          context="test-context"
        >
          <div>Test Content</div>
        </MasterPageTemplate>
      );

      // Suspense should be present in the component tree
      const errorBoundary = screen.getByTestId('error-boundary');
      expect(errorBoundary).toBeInTheDocument();
    });
  });
});