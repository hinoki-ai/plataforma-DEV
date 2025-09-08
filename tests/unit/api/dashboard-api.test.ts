import { NextRequest } from 'next/server';
import { GET as getAdminDashboard } from '@/app/api/admin/dashboard/route';
import { GET as getProfesorDashboard } from '@/app/api/profesor/dashboard/route';
import { GET as getParentDashboard } from '@/app/api/parent/dashboard/overview/route';
import { GET as getMasterDashboard } from '@/app/api/master/dashboard/route';

// Mock the auth function
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

// Mock the database
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    meeting: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    planningDocument: {
      count: jest.fn(),
    },
    teamMember: {
      count: jest.fn(),
    },
    calendarEvent: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    activity: {
      count: jest.fn(),
    },
    student: {
      count: jest.fn(),
    },
  },
}));

// Mock the calendar service
jest.mock('@/services/queries/calendar', () => ({
  getUpcomingEvents: jest.fn(),
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getUpcomingEvents } from '@/services/queries/calendar';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGetUpcomingEvents = getUpcomingEvents as jest.MockedFunction<typeof getUpcomingEvents>;

describe('Dashboard API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Admin Dashboard API', () => {
    it('should return dashboard data for admin user', async () => {
      // Mock authenticated admin user
      mockAuth.mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@test.com',
          role: 'ADMIN',
          name: 'Admin User',
        },
      });

      // Mock database responses
      mockPrisma.user.count
        .mockResolvedValueOnce(150) // total users
        .mockResolvedValueOnce(140) // active users
        .mockResolvedValueOnce(5) // admins
        .mockResolvedValueOnce(25) // profesores
        .mockResolvedValueOnce(120); // parents

      mockPrisma.meeting.count
        .mockResolvedValueOnce(50) // total meetings
        .mockResolvedValueOnce(15); // upcoming meetings

      mockPrisma.planningDocument.count
        .mockResolvedValueOnce(200) // total documents
        .mockResolvedValueOnce(25); // recent documents

      mockPrisma.teamMember.count
        .mockResolvedValueOnce(12) // total team members
        .mockResolvedValueOnce(10); // active team members

      mockPrisma.calendarEvent.findMany.mockResolvedValue([
        {
          id: 'event-1',
          title: 'School Meeting',
          startDate: new Date(),
          category: 'ACADEMIC',
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/admin/dashboard');
      const response = await getAdminDashboard();

      expect(response).toBeDefined();
      expect(mockAuth).toHaveBeenCalled();

      // Verify database calls
      expect(mockPrisma.user.count).toHaveBeenCalledTimes(5);
      expect(mockPrisma.meeting.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.planningDocument.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.teamMember.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.calendarEvent.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/dashboard');
      const response = await getAdminDashboard();

      expect(response.status).toBe(401);
    });

    it('should return 401 for non-admin user', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: 'profesor-1',
          email: 'profesor@test.com',
          role: 'PROFESOR',
          name: 'Profesor User',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/admin/dashboard');
      const response = await getAdminDashboard();

      expect(response.status).toBe(401);
    });
  });

  describe('Profesor Dashboard API', () => {
    it('should return dashboard data for profesor user', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: 'profesor-1',
          email: 'profesor@test.com',
          role: 'PROFESOR',
          name: 'Profesor User',
        },
      });

      mockPrisma.planningDocument.count
        .mockResolvedValueOnce(45) // total plannings
        .mockResolvedValueOnce(38); // completed plannings

      mockPrisma.meeting.count
        .mockResolvedValueOnce(15) // total meetings
        .mockResolvedValueOnce(4); // upcoming meetings

      mockPrisma.student.count
        .mockResolvedValueOnce(25) // total students
        .mockResolvedValueOnce(24); // active students

      mockPrisma.activity.count
        .mockResolvedValueOnce(30) // total activities
        .mockResolvedValueOnce(8); // upcoming activities

      mockPrisma.studentProgressReport.count.mockResolvedValue(12);

      mockPrisma.calendarEvent.findMany.mockResolvedValue([
        {
          id: 'event-1',
          title: 'Class Event',
          startDate: new Date(),
          category: 'ACADEMIC',
          level: 'class',
        },
      ]);

      const response = await getProfesorDashboard();

      expect(response).toBeDefined();
      expect(mockAuth).toHaveBeenCalled();
      expect(mockPrisma.planningDocument.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.meeting.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.student.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.activity.count).toHaveBeenCalledTimes(2);
    });
  });

  describe('Parent Dashboard API', () => {
    it('should return dashboard data for parent user', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: 'parent-1',
          email: 'parent@test.com',
          role: 'PARENT',
          name: 'Parent User',
        },
      });

      // Mock database user lookup
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'parent-1',
        email: 'parent@test.com',
        role: 'PARENT',
        isActive: true,
      });

      mockGetUpcomingEvents.mockResolvedValue({
        success: true,
        data: [
          {
            id: 'event-1',
            title: 'Parent Meeting',
            startDate: new Date().toISOString(),
            category: 'PARENT',
          },
        ],
      });

      mockPrisma.meeting.findMany.mockResolvedValue([
        {
          id: 'meeting-1',
          title: 'Parent-Teacher Meeting',
          scheduledDate: new Date(),
          studentName: 'Student Name',
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/parent/dashboard/overview');
      const response = await getParentDashboard(request);

      expect(response).toBeDefined();
      expect(mockAuth).toHaveBeenCalled();
      expect(mockGetUpcomingEvents).toHaveBeenCalledWith(5);
      expect(mockPrisma.meeting.findMany).toHaveBeenCalled();
    });
  });

  describe('Master Dashboard API', () => {
    it('should return comprehensive dashboard data for master user', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: 'master-1',
          email: 'master@test.com',
          role: 'MASTER',
          name: 'Master User',
        },
      });

      // Mock comprehensive data for master dashboard
      mockPrisma.user.count
        .mockResolvedValueOnce(1247) // total users
        .mockResolvedValueOnce(892); // active users

      mockPrisma.user.groupBy.mockResolvedValue([
        { role: 'MASTER', _count: { id: 1 } },
        { role: 'ADMIN', _count: { id: 5 } },
        { role: 'PROFESOR', _count: { id: 25 } },
        { role: 'PARENT', _count: { id: 1216 } },
      ]);

      mockPrisma.calendarEvent.count
        .mockResolvedValueOnce(150) // total events
        .mockResolvedValueOnce(25); // upcoming events

      mockPrisma.meeting.count
        .mockResolvedValueOnce(200) // total meetings
        .mockResolvedValueOnce(45); // scheduled meetings

      const response = await getMasterDashboard();

      expect(response).toBeDefined();
      expect(mockAuth).toHaveBeenCalled();
      expect(mockPrisma.user.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.user.groupBy).toHaveBeenCalledTimes(1);
      expect(mockPrisma.calendarEvent.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.meeting.count).toHaveBeenCalledTimes(2);
    });

    it('should return 401 for non-master user', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@test.com',
          role: 'ADMIN',
          name: 'Admin User',
        },
      });

      const response = await getMasterDashboard();

      expect(response.status).toBe(401);
    });
  });
});