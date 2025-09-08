import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ParentDashboardFeatures from '@/components/dashboard/ParentDashboardFeatures';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock Next.js Link
vi.mock('next/link', () => {
  return {
    default: ({ children, href, ...props }: any) => {
      return React.createElement('a', { href, ...props }, children);
    },
  };
});

describe('ParentDashboardFeatures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the main dashboard', () => {
      render(<ParentDashboardFeatures />);

      expect(screen.getByText('Panel de Apoderados')).toBeInTheDocument();
      expect(
        screen.getByText('Monitoreo académico y comunicación con la escuela')
      ).toBeInTheDocument();
    });

    it('renders all tabs', () => {
      render(<ParentDashboardFeatures />);

      expect(screen.getByRole('tab', { name: 'Resumen' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Progreso' })).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: 'Comunicación' })
      ).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Recursos' })).toBeInTheDocument();
    });

    it('shows overview content by default', () => {
      render(<ParentDashboardFeatures />);

      expect(screen.getByText('Promedio General')).toBeInTheDocument();
      expect(screen.getByText('6.9')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays attendance percentage', () => {
      render(<ParentDashboardFeatures />);

      expect(screen.getByText('95%')).toBeInTheDocument();
    });

    it('shows correct grade values in overview', () => {
      render(<ParentDashboardFeatures />);

      expect(screen.getByText('6.9')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('has clickable configuration button', () => {
      render(<ParentDashboardFeatures />);

      const configButton = screen.getByText('Configuración');
      expect(configButton).toBeInTheDocument();
      expect(configButton.closest('a')).toHaveAttribute(
        'href',
        '/parent/settings'
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<ParentDashboardFeatures />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Panel de Apoderados');
    });

    it('has accessible tab controls', () => {
      render(<ParentDashboardFeatures />);

      const tabTriggers = screen.getAllByRole('tab');
      expect(tabTriggers).toHaveLength(4);

      tabTriggers.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('has proper tab labels', () => {
      render(<ParentDashboardFeatures />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);
      expect(tabs[0]).toHaveTextContent('Resumen');
      expect(tabs[1]).toHaveTextContent('Progreso');
      expect(tabs[2]).toHaveTextContent('Comunicación');
      expect(tabs[3]).toHaveTextContent('Recursos');
    });
  });
});
