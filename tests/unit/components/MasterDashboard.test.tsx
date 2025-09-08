import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MasterDashboard } from '@/components/master/MasterDashboard';

// Mock next-auth
const mockSession = {
  user: {
    name: 'Test Master',
    email: 'master@test.com',
  },
  expires: '2024-12-31T23:59:59.999Z',
};

const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the imported components
vi.mock('@/components/layout/RoleAwareNavigation', () => ({
  RoleIndicator: ({ role }: { role: string }) => <div data-testid="role-indicator">{role}</div>,
  RoleAwareBreadcrumb: () => <div data-testid="breadcrumb">Breadcrumb</div>,
  RoleAwareHeader: ({ title, subtitle, actions }: any) => (
    <div data-testid="role-aware-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div>{actions}</div>
    </div>
  ),
}));

vi.mock('@/components/auth/RoleSwitcher', () => ({
  RoleSwitcher: () => <div data-testid="role-switcher">Role Switcher</div>,
}));

vi.mock('@/components/master/SystemHealthCard', () => ({
  SystemHealthCard: () => <div data-testid="system-health-card">System Health</div>,
}));

vi.mock('@/components/master/MasterStatsCard', () => ({
  MasterStatsCard: () => <div data-testid="master-stats-card">Master Stats</div>,
}));

vi.mock('@/components/master/SecurityAlertsCard', () => ({
  SecurityAlertsCard: () => <div data-testid="security-alerts-card">Security Alerts</div>,
}));

describe('MasterDashboard Component', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({ data: mockSession });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the main dashboard with supreme authority header', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('🏛️ SUPREME MASTER CONTROL')).toBeInTheDocument();
      expect(screen.getByText(`Bienvenido, Arquitecto Supremo Test Master`)).toBeInTheDocument();
    });

    it('renders the role indicator and switcher', () => {
      render(<MasterDashboard />);

      expect(screen.getByTestId('role-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('role-switcher')).toBeInTheDocument();
    });

    it('renders the GOD MODE badge', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('MODO DIOS ACTIVADO')).toBeInTheDocument();
    });

    it('renders breadcrumb navigation', () => {
      render(<MasterDashboard />);

      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    });
  });

  describe('Quick Actions Section', () => {
    it('renders the quick actions card with correct title', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Acciones Rápidas - Poder Supremo')).toBeInTheDocument();
      expect(screen.getByText('Herramientas avanzadas disponibles solo para el Arquitecto Supremo')).toBeInTheDocument();
    });

    it('renders all quick action categories', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Sistema')).toBeInTheDocument();
      expect(screen.getByText('Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Desarrollo')).toBeInTheDocument();
      expect(screen.getByText('Global')).toBeInTheDocument();
    });

    it('renders system monitor action', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Monitor del Sistema')).toBeInTheDocument();
      expect(screen.getByText('Supervisión en tiempo real')).toBeInTheDocument();
    });

    it('renders database tools action', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Herramientas BD')).toBeInTheDocument();
      expect(screen.getByText('Gestión de base de datos')).toBeInTheDocument();
    });

    it('renders security center action', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Centro de Seguridad')).toBeInTheDocument();
      expect(screen.getByText('Análisis de amenazas')).toBeInTheDocument();
    });

    it('renders user analytics action', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Análisis de Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Estadísticas detalladas')).toBeInTheDocument();
    });

    it('renders role management action', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Gestión de Roles')).toBeInTheDocument();
      expect(screen.getByText('Control de permisos')).toBeInTheDocument();
    });

    it('renders advanced tools action', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Herramientas Avanzadas')).toBeInTheDocument();
      expect(screen.getByText('Utilidades de desarrollo')).toBeInTheDocument();
    });

    it('renders debug console action', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Consola Debug')).toBeInTheDocument();
    });

    it('renders performance analyzer action', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Analizador de Rendimiento')).toBeInTheDocument();
      expect(screen.getByText('Optimización del sistema')).toBeInTheDocument();
    });

    it('renders global settings action', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Configuración Global')).toBeInTheDocument();
      expect(screen.getByText('Ajustes del sistema')).toBeInTheDocument();
    });

    it('renders global oversight action', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Vigilancia Global')).toBeInTheDocument();
      expect(screen.getByText('Supervisión completa')).toBeInTheDocument();
    });

    it('renders audit logs action', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Registros de Auditoría')).toBeInTheDocument();
      expect(screen.getByText('Actividad del sistema')).toBeInTheDocument();
    });

    it('renders audit master action', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Auditoría Maestra')).toBeInTheDocument();
      expect(screen.getByText('Control total del sistema')).toBeInTheDocument();
    });
  });

  describe('System Overview Section', () => {
    it('renders system overview cards', () => {
      render(<MasterDashboard />);

      expect(screen.getByTestId('system-health-card')).toBeInTheDocument();
      expect(screen.getByTestId('master-stats-card')).toBeInTheDocument();
      expect(screen.getByTestId('security-alerts-card')).toBeInTheDocument();
    });
  });

  describe('Development Tools Section', () => {
    it('renders development tools section', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Herramientas de Desarrollo Avanzado')).toBeInTheDocument();
      expect(screen.getByText('Funcionalidades exclusivas para el desarrollo y mantenimiento del sistema')).toBeInTheDocument();
    });

    it('renders debug console tool', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Consola Debug')).toBeInTheDocument();
      expect(screen.getByText('Ejecutar comandos')).toBeInTheDocument();
    });

    it('renders real-time monitor tool', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Monitor en Tiempo Real')).toBeInTheDocument();
      expect(screen.getByText('Supervisión continua')).toBeInTheDocument();
    });

    it('renders database optimization tool', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Optimización BD')).toBeInTheDocument();
      expect(screen.getByText('Performance queries')).toBeInTheDocument();
    });

    it('renders security audit tool', () => {
      render(<MasterDashboard />);

      expect(screen.getByText('Auditoría de Seguridad')).toBeInTheDocument();
      expect(screen.getByText('Análisis forense')).toBeInTheDocument();
    });
  });

  describe('Session Handling', () => {
    it('displays default name when session user name is not available', () => {
      mockUseSession.mockReturnValue({
        data: { ...mockSession, user: { ...mockSession.user, name: undefined } }
      });

      render(<MasterDashboard />);

      expect(screen.getByText('Bienvenido, Arquitecto Supremo Master Developer')).toBeInTheDocument();
    });

    it('handles session loading state', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'loading' });

      render(<MasterDashboard />);

      expect(screen.getByText('Bienvenido, Arquitecto Supremo Master Developer')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('renders correct href attributes for quick actions', () => {
      render(<MasterDashboard />);

      const systemMonitorLink = screen.getByText('Monitor del Sistema').closest('a');
      expect(systemMonitorLink).toHaveAttribute('href', '/master/system-monitor');

      const databaseToolsLink = screen.getByText('Herramientas BD').closest('a');
      expect(databaseToolsLink).toHaveAttribute('href', '/master/database-tools');

      const securityCenterLink = screen.getByText('Centro de Seguridad').closest('a');
      expect(securityCenterLink).toHaveAttribute('href', '/master/security');
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct CSS classes for layout', () => {
      render(<MasterDashboard />);

      const mainContainer = screen.getByText('🏛️ SUPREME MASTER CONTROL').closest('.space-y-6');
      expect(mainContainer).toBeInTheDocument();
    });

    it('applies purple theme styling to cards', () => {
      render(<MasterDashboard />);

      const quickActionsCard = screen.getByText('Acciones Rápidas - Poder Supremo').closest('[class*="border-purple"]');
      expect(quickActionsCard).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders with proper heading hierarchy', () => {
      render(<MasterDashboard />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });

    it('renders buttons with proper labels', () => {
      render(<MasterDashboard />);

      const actionButtons = screen.getAllByRole('button');
      expect(actionButtons.length).toBeGreaterThan(0);
    });
  });
});