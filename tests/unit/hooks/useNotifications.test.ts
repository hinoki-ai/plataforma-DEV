import { renderHook, waitFor, act } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/hooks/useNotifications';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock EventSource
const mockEventSource = {
  onmessage: jest.fn(),
  onerror: jest.fn(),
  onopen: jest.fn(),
  close: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
};

global.EventSource = jest.fn().mockImplementation(() => mockEventSource);

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('useNotifications Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with empty state', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.loading).toBe(true);
  });

  it('should fetch notifications on mount', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'user@test.com',
        role: 'ADMIN',
        name: 'Test User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const mockNotifications = [
      {
        id: 'notif-1',
        title: 'Test Notification',
        message: 'This is a test',
        type: 'info',
        category: 'system',
        priority: 'medium',
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'notif-2',
        title: 'Another Notification',
        message: 'This is another test',
        type: 'success',
        category: 'academic',
        priority: 'high',
        read: true,
        createdAt: '2024-01-02T00:00:00Z',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        notifications: mockNotifications,
        pagination: { total: 2, limit: 50, offset: 0, hasMore: false },
      }),
    });

    const { result } = renderHook(() => useNotifications());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/notifications?status=all&limit=50', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.unreadCount).toBe(1); // Only one unread notification
  });

  it('should establish SSE connection', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'user@test.com',
        role: 'ADMIN',
        name: 'Test User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        notifications: [],
        pagination: { total: 0, limit: 50, offset: 0, hasMore: false },
      }),
    });

    renderHook(() => useNotifications());

    await waitFor(() => {
      expect(global.EventSource).toHaveBeenCalledWith('/api/notifications/stream');
    });
  });

  it('should handle real-time notifications', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'user@test.com',
        role: 'ADMIN',
        name: 'Test User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        notifications: [],
        pagination: { total: 0, limit: 50, offset: 0, hasMore: false },
      }),
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate receiving a real-time notification
    const mockMessageEvent = {
      data: JSON.stringify({
        type: 'notification',
        id: 'new-notif-1',
        title: 'New Real-time Notification',
        message: 'This came via SSE',
        type: 'info',
        category: 'system',
        priority: 'medium',
        actionUrl: '/test',
        timestamp: '2024-01-03T00:00:00Z',
      }),
    };

    act(() => {
      mockEventSource.onmessage(mockMessageEvent);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: 'new-notif-1',
      title: 'New Real-time Notification',
      message: 'This came via SSE',
      type: 'info',
      category: 'system',
      priority: 'medium',
      read: false,
      actionUrl: '/test',
      createdAt: '2024-01-03T00:00:00Z',
    });
    expect(result.current.unreadCount).toBe(1);
  });

  it('should mark notifications as read', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'user@test.com',
        role: 'ADMIN',
        name: 'Test User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const mockNotifications = [
      {
        id: 'notif-1',
        title: 'Test Notification',
        message: 'This is a test',
        type: 'info',
        category: 'system',
        priority: 'medium',
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          notifications: mockNotifications,
          pagination: { total: 1, limit: 50, offset: 0, hasMore: false },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Notificaciones marcadas como leídas' }),
      });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(1);

    act(() => {
      result.current.markAsRead(['notif-1']);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds: ['notif-1'],
        }),
      });
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should mark all notifications as read', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'user@test.com',
        role: 'ADMIN',
        name: 'Test User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const mockNotifications = [
      {
        id: 'notif-1',
        title: 'Test Notification 1',
        message: 'This is test 1',
        type: 'info',
        category: 'system',
        priority: 'medium',
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'notif-2',
        title: 'Test Notification 2',
        message: 'This is test 2',
        type: 'success',
        category: 'academic',
        priority: 'high',
        read: false,
        createdAt: '2024-01-02T00:00:00Z',
      },
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          notifications: mockNotifications,
          pagination: { total: 2, limit: 50, offset: 0, hasMore: false },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Notificaciones marcadas como leídas' }),
      });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(2);

    act(() => {
      result.current.markAsRead('all');
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markAll: true,
        }),
      });
    });

    expect(result.current.notifications.every(n => n.read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should create new notifications', async () => {
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

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          notifications: [],
          pagination: { total: 0, limit: 50, offset: 0, hasMore: false },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          message: 'Notificación enviada a todos los usuarios',
          sentTo: 150,
        }),
      });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const notificationData = {
      title: 'Test Broadcast',
      message: 'This is a broadcast notification',
      type: 'info' as const,
      isBroadcast: true,
    };

    const response = await act(async () => {
      return result.current.createNotification(notificationData);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData),
    });

    expect(response).toEqual({
      message: 'Notificación enviada a todos los usuarios',
      sentTo: 150,
    });
  });

  it('should handle API errors', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'user@test.com',
        role: 'ADMIN',
        name: 'Test User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch notifications');
  });

  it('should clean up EventSource on unmount', () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'user@test.com',
        role: 'ADMIN',
        name: 'Test User',
      },
      expires: '2024-12-31',
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        notifications: [],
        pagination: { total: 0, limit: 50, offset: 0, hasMore: false },
      }),
    });

    const { unmount } = renderHook(() => useNotifications());

    unmount();

    expect(mockEventSource.close).toHaveBeenCalled();
  });
});