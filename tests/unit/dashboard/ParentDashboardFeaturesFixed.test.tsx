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

// Test with more flexible assertions
const waitForTabs = async () => {
  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Resumen' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Progreso' })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Comunicación' })
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Recursos' })).toBeInTheDocument();
  });
};

describe('Parent Dashboard Fixed Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main dashboard', async () => {
    render(<ParentDashboardFeatures />);

    await waitFor(() => {
      expect(screen.getByText('Panel de Apoderados')).toBeInTheDocument();
      expect(
        screen.getByText('Monitoreo académico y comunicación con la escuela')
      ).toBeInTheDocument();
    });
  });

  it('has all expected tabs', async () => {
    render(<ParentDashboardFeatures />);

    await waitForTabs();
  });

  it('shows overview content by default', async () => {
    render(<ParentDashboardFeatures />);

    await waitFor(() => {
      expect(screen.getByText('Promedio General')).toBeInTheDocument();
      expect(screen.getByText('6.9')).toBeInTheDocument();
      expect(screen.getByText('Asistencia')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
    });
  });

  it('renders all tab content in DOM', async () => {
    render(<ParentDashboardFeatures />);

    // Check that all tab content is rendered in the DOM
    // This tests that the component structure is correct

    // Overview content should be visible by default
    expect(screen.getByText('Promedio General')).toBeInTheDocument();
    expect(screen.getByText('6.9')).toBeInTheDocument();

    // Check that tabs are rendered
    expect(screen.getByRole('tab', { name: 'Resumen' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Progreso' })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Comunicación' })
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Recursos' })).toBeInTheDocument();
  });

  it('has proper tab structure', async () => {
    render(<ParentDashboardFeatures />);

    // Check that tabs have proper attributes
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);

    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected');
      expect(tab).toHaveAttribute('role', 'tab');
    });
  });

  it('has configuration button', async () => {
    render(<ParentDashboardFeatures />);

    const configButton = screen.getByText('Configuración');
    expect(configButton).toBeInTheDocument();
    expect(configButton.closest('a')).toHaveAttribute(
      'href',
      '/parent/settings'
    );
  });
});
