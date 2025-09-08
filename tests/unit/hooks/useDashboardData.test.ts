import { renderHook, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useDashboardData } from '@/hooks/useDashboardData';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('useDashboardData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty data when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useDashboardData());

    expect(result.current.stats).toEqual({});
    expect(result.current.loading).toBe(true);
  });

  it('should fetch admin dashboard data', async () => {
    const mockSession = {
      user: {
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'ADMIN',
        name: 'Admin User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const mockDashboardData = {
      users: {
        total: 150,
        active: 140,
        admins: 5,
        profesores: 25,
        parents: 120,
      },
      meetings: {
        total: 50,
        upcoming: 15,
      },
      documents: {
        total: 200,
        recent: 25,
      },
      team: {
        total: 12,
        active: 10,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    });

    const { result } = renderHook(() => useDashboardData());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(result.current.stats).toEqual(mockDashboardData);
    expect(result.current.error).toBe(null);
  });

  it('should fetch profesor dashboard data', async () => {
    const mockSession = {
      user: {
        id: 'profesor-1',
        email: 'profesor@test.com',
        role: 'PROFESOR',
        name: 'Profesor User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const mockDashboardData = {
      plannings: {
        total: 45,
        completed: 38,
      },
      meetings: {
        total: 15,
        upcoming: 4,
      },
      students: {
        total: 25,
        active: 24,
      },
      activities: {
        total: 30,
        upcoming: 8,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/profesor/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(result.current.stats).toEqual(mockDashboardData);
  });

  it('should fetch parent dashboard data', async () => {
    const mockSession = {
      user: {
        id: 'parent-1',
        email: 'parent@test.com',
        role: 'PARENT',
        name: 'Parent User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const mockDashboardData = {
      overallAverage: 87,
      attendanceRate: 94,
      newMessagesCount: 5,
      childrenCount: 2,
      upcomingEvents: [],
      recentActivity: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/parent/dashboard/overview', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(result.current.stats).toEqual(mockDashboardData);
  });

  it('should fetch master dashboard data', async () => {
    const mockSession = {
      user: {
        id: 'master-1',
        email: 'master@test.com',
        role: 'MASTER',
        name: 'Master User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const mockDashboardData = {
      users: {
        total: 1247,
        active: 892,
        newToday: 5,
        byRole: {
          MASTER: 1,
          ADMIN: 5,
          PROFESOR: 25,
          PARENT: 1216,
        },
      },
      performance: {
        responseTime: 45,
        uptime: '99.98%',
        throughput: 15420,
      },
      security: {
        threats: 3,
        blocked: 47,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/master/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(result.current.stats).toEqual(mockDashboardData);
  });

  it('should handle API errors gracefully', async () => {
    const mockSession = {
      user: {
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'ADMIN',
        name: 'Admin User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch dashboard data');
    expect(result.current.stats).toEqual({});
  });

  it('should handle HTTP errors', async () => {
    const mockSession = {
      user: {
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'ADMIN',
        name: 'Admin User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('HTTP error! status: 500');
  });

  it('should return empty data for public users', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'public-1',
          email: 'public@test.com',
          role: 'PUBLIC',
          name: 'Public User',
        },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useDashboardData());

    expect(result.current.stats).toEqual({});
    expect(result.current.loading).toBe(true);
  });
});