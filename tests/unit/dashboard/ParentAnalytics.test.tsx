import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ParentAnalytics from '@/components/dashboard/ParentAnalytics';

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

describe('ParentAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the main heading', () => {
      render(<ParentAnalytics />);

      expect(screen.getByText('Analytics Avanzados')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Métricas detalladas del progreso académico y comportamiento'
        )
      ).toBeInTheDocument();
    });

    it('renders select controls', () => {
      render(<ParentAnalytics />);

      const selectors = screen.getAllByRole('combobox');
      expect(selectors).toHaveLength(2);
    });

    it('shows key metrics cards', () => {
      render(<ParentAnalytics />);

      expect(screen.getByText('Promedio General')).toBeInTheDocument();
      expect(screen.getByText('Asistencia')).toBeInTheDocument();
      expect(screen.getByText('Comportamiento')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays overall progress', () => {
      render(<ParentAnalytics />);

      // Check that the overall average is displayed
      expect(screen.getByText('6.9')).toBeInTheDocument();
    });

    it('displays attendance rate', () => {
      render(<ParentAnalytics />);

      // Check that attendance percentage is displayed
      const attendanceElement = screen.getByText(/^\d+\.\d+%$/);
      expect(attendanceElement).toBeInTheDocument();
    });

    it('displays behavior score', () => {
      render(<ParentAnalytics />);

      expect(screen.getByText('8.2')).toBeInTheDocument();
    });
  });

  describe('Subject Performance', () => {
    it('displays subject grades', () => {
      render(<ParentAnalytics />);

      expect(screen.getByText('6.8')).toBeInTheDocument(); // Math
      expect(screen.getByText('7.2')).toBeInTheDocument(); // Language
      expect(screen.getByText('6.5')).toBeInTheDocument(); // Science
    });

    it('shows improvement trends', () => {
      render(<ParentAnalytics />);

      // Check that improvement values are displayed
      const improvements = screen.getAllByText('+0.3');
      expect(improvements.length).toBeGreaterThan(0);

      expect(screen.getByText('+0.2')).toBeInTheDocument();
      expect(screen.getByText('-0.3')).toBeInTheDocument();
    });
  });

  describe('Behavior Metrics', () => {
    it('displays behavior categories', () => {
      render(<ParentAnalytics />);

      expect(screen.getByText('Respeto')).toBeInTheDocument();
      expect(screen.getByText('Responsabilidad')).toBeInTheDocument();
      expect(screen.getByText('Colaboración')).toBeInTheDocument();
      expect(screen.getByText('Puntualidad')).toBeInTheDocument();
      expect(screen.getByText('Organización')).toBeInTheDocument();
    });

    it('shows behavior scores', () => {
      render(<ParentAnalytics />);

      // Check that score badges are displayed
      const scoreBadges = screen.getAllByText(/^\d+\/10$/);
      expect(scoreBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Attendance Trends', () => {
    it('displays month names', () => {
      render(<ParentAnalytics />);

      expect(screen.getByText('Enero')).toBeInTheDocument();
      expect(screen.getByText('Febrero')).toBeInTheDocument();
      expect(screen.getByText('Marzo')).toBeInTheDocument();
      expect(screen.getByText('Abril')).toBeInTheDocument();
    });

    it('shows attendance data', () => {
      render(<ParentAnalytics />);

      // Check that attendance numbers are displayed
      expect(screen.getByText('18')).toBeInTheDocument(); // January present
      expect(screen.getByText('19')).toBeInTheDocument(); // February present
      expect(screen.getByText('17')).toBeInTheDocument(); // March present
      expect(screen.getByText('20')).toBeInTheDocument(); // April present
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<ParentAnalytics />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      const mainHeading = screen.getByText('Analytics Avanzados');
      expect(mainHeading).toBeInTheDocument();
    });

    it('has accessible select controls', () => {
      render(<ParentAnalytics />);

      const selectors = screen.getAllByRole('combobox');
      expect(selectors).toHaveLength(2);
    });
  });

  describe('Responsive Design', () => {
    it('renders with proper grid layouts', () => {
      render(<ParentAnalytics />);

      // Check that the component uses responsive grid classes
      const gridContainers = document.querySelectorAll('[class*="grid"]');
      expect(gridContainers.length).toBeGreaterThan(0);
    });

    it('has proper spacing and layout', () => {
      render(<ParentAnalytics />);

      // Check that cards and sections are properly spaced
      const cards = document.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });
});
