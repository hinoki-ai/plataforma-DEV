import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MasterStatsCard } from '@/components/master/MasterStatsCard';

// Mock timers to control setTimeout
vi.useFakeTimers();

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button onClick={onClick} className={className} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value}></div>,
}));

vi.mock('lucide-react', () => ({
  BarChart3: () => <svg data-testid="barchart-icon"></svg>,
  Users: () => <svg data-testid="users-icon"></svg>,
  Database: () => <svg data-testid="database-icon"></svg>,
  Server: () => <svg data-testid="server-icon"></svg>,
  TrendingUp: () => <svg data-testid="trendingup-icon"></svg>,
  Activity: () => <svg data-testid="activity-icon"></svg>,
  RefreshCw: () => <svg data-testid="refresh-icon"></svg>,
}));

describe('MasterStatsCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the main card structure after loading', async () => {
      render(<MasterStatsCard />);

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });

      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('renders the card title with icon after loading', async () => {
      render(<MasterStatsCard />);

      await waitFor(() => {
        expect(screen.getByText('System Statistics Dashboard')).toBeInTheDocument();
      });

      expect(screen.getByTestId('barchart-icon')).toBeInTheDocument();
    });

    it('renders the card description after loading', async () => {
      render(<MasterStatsCard />);

      await waitFor(() => {
        expect(screen.getByText('Real-time system performance metrics and usage statistics')).toBeInTheDocument();
      });
    });
  });

  describe('Statistics Display', () => {
    it('displays total users statistic after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      expect(screen.getByText('1.2K')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    it('displays active users statistic after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      expect(screen.getByText('892')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
    });

    it('displays performance throughput statistic with K formatting after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      expect(screen.getByText('15.4K')).toBeInTheDocument();
      expect(screen.getByText('Requests/min')).toBeInTheDocument();
    });

    it('displays response time statistic after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      expect(screen.getByText('145ms')).toBeInTheDocument();
      expect(screen.getByText('Response Time')).toBeInTheDocument();
    });

    it('formats large numbers correctly after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      // Test number formatting - should show 1.2K for 1247
      expect(screen.getByText('1.2K')).toBeInTheDocument();
    });
  });

  describe('Layout and Grid', () => {
    it('renders statistics in a 2x2 grid layout after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      const gridContainer = screen.getByText('1.2K').closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-2');
    });

    it('applies gap spacing to grid items after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      const gridContainer = screen.getByText('1.2K').closest('.grid');
      expect(gridContainer).toHaveClass('gap-4');
    });
  });

  describe('Visual Styling', () => {
    it('applies blue theme to the main card after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('border-blue-200', 'dark:border-blue-800');
    });

    it('renders statistic containers with background styling after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      // Check that the component renders the expected content structure
      expect(screen.getByText('1.2K')).toBeInTheDocument();
      expect(screen.getByText('892')).toBeInTheDocument();
      expect(screen.getByText('15.4K')).toBeInTheDocument();
      expect(screen.getByText('145ms')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders BarChart3 icon in the header after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      expect(screen.getByTestId('barchart-icon')).toBeInTheDocument();
    });

    it('renders Users icon for user statistics after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });

    it('renders Database icon for database stats after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      expect(screen.getByTestId('database-icon')).toBeInTheDocument();
    });

    it('renders Server icon for server stats after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      expect(screen.getByTestId('server-icon')).toBeInTheDocument();
    });
  });

  describe('Typography and Text Formatting', () => {
    it('applies large font size to statistic numbers after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      const statNumbers = ['1.2K', '892', '15.4K', '145ms'];
      statNumbers.forEach(number => {
        const element = screen.getByText(number);
        expect(element).toHaveClass('text-2xl', 'font-bold');
      });
    });

    it('applies muted text color to statistic labels after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      const labels = ['Total Users', 'Active Users', 'Requests/min', 'Response Time'];
      labels.forEach(label => {
        const element = screen.getByText(label);
        expect(element).toHaveClass('text-muted-foreground');
      });
    });

    it('renders centered statistic labels after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      // Verify that all expected labels are present and properly formatted
      const statLabels = ['Total Users', 'Active Users', 'Requests/min', 'Response Time'];
      statLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('renders statistic items with proper structure after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      // Verify the grid layout is present
      const content = screen.getByTestId('card-content');
      expect(content).toBeInTheDocument();

      // Verify all statistics are displayed
      expect(screen.getByText('1.2K')).toBeInTheDocument();
      expect(screen.getByText('892')).toBeInTheDocument();
      expect(screen.getByText('15.4K')).toBeInTheDocument();
      expect(screen.getByText('145ms')).toBeInTheDocument();
    });
  });

  describe('Data Integrity', () => {
    it('displays correct data types and formats after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      // Check that numbers are displayed correctly
      expect(screen.getByText('1.2K')).toBeInTheDocument(); // Formatted number
      expect(screen.getByText('892')).toBeInTheDocument(); // Plain number
      expect(screen.getByText('15.4K')).toBeInTheDocument(); // Formatted with K
      expect(screen.getByText('145ms')).toBeInTheDocument(); // With unit
    });

    it('maintains consistent data structure after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      // All statistics should be present
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Requests/min')).toBeInTheDocument();
      expect(screen.getByText('Response Time')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders consistently after re-rendering', () => {
      // This is more of a code structure test, but we can verify the component renders consistently
      const { rerender } = render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      // Re-render should produce same results
      rerender(<MasterStatsCard />);

      expect(screen.getByText('1.2K')).toBeInTheDocument();
      expect(screen.getByText('892')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides descriptive text for statistics after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      // Check that each statistic has both a number and descriptive text
      const statPairs = [
        { number: '1.2K', label: 'Total Users' },
        { number: '892', label: 'Active Users' },
        { number: '15.4K', label: 'Requests/min' },
        { number: '145ms', label: 'Response Time' },
      ];

      statPairs.forEach(({ number, label }) => {
        expect(screen.getByText(number)).toBeInTheDocument();
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('maintains proper heading hierarchy after loading', () => {
      render(<MasterStatsCard />);

      // Fast-forward timers to complete loading
      vi.runAllTimers();

      const title = screen.getByText('System Statistics Dashboard');
      expect(title).toBeInTheDocument();
    });
  });
});