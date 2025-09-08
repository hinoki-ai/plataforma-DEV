import { NextRequest } from 'next/server';
import { prisma, checkDatabaseConnection } from '@/lib/db';
import { createApiRoute } from '@/lib/api-validation';
import { createSuccessResponse } from '@/lib/api-error';

// GET /api/parent/dashboard/overview - Parent dashboard overview
export const GET = createApiRoute(
  async (request, validated) => {
    const parentId = validated.session.user.id;
    
    // Verify database health
    const isDbHealthy = await checkDatabaseConnection();
    if (!isDbHealthy) {
      throw new Error('Database connection failed');
    }

    // Optimized queries for parent dashboard
    const [
      parentInfo,
      childrenData,
      upcomingMeetings,
      recentCommunications,
      schoolEvents
    ] = await Promise.all([
      // Parent basic info
      prisma.user.findUnique({
        where: { id: parentId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      }),
      
      // Children associated with parent
      prisma.student.findMany({
        where: { parentId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          grade: {
            select: {
              gradeName: true,
              gradeCode: true,
              educationalLevel: {
                select: {
                  levelName: true,
                },
              },
            },
          },
          teacher: {
            select: {
              name: true,
              email: true,
            },
          },
          attendanceRate: true,
          academicProgress: true,
          progressReports: {
            select: {
              id: true,
              reportDate: true,
              subject: {
                select: {
                  subjectName: true,
                },
              },
              gradeValue: true,
              comments: true,
              score: true,
            },
            orderBy: { reportDate: 'desc' },
            take: 3,
          },
          isActive: true,
        },
        where: {
          isActive: true,
        },
        orderBy: { firstName: 'asc' },
      }),
      
      // Upcoming meetings for parent's children
      prisma.meeting.findMany({
        where: {
          student: {
            parentId,
          },
          scheduledDate: {
            gte: new Date(),
          },
        },
        select: {
          id: true,
          title: true,
          scheduledDate: true,
          scheduledTime: true,
          location: true,
          teacher: {
            select: {
              name: true,
            },
          },
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          status: true,
          type: true,
        },
        orderBy: { scheduledDate: 'asc' },
        take: 5,
      }),
      
      // Recent communications (notifications)
      prisma.notification.findMany({
        where: {
          recipientId: parentId,
        },
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          priority: true,
          read: true,
          createdAt: true,
          sender: {
            select: {
              name: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      
      // Upcoming school events
      prisma.calendarEvent.findMany({
        where: {
          startDate: {
            gte: new Date(),
          },
          isActive: true,
          OR: [
            { category: 'PARENT' },
            { category: 'SPECIAL' },
            { category: 'EVENT' },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          category: true,
          priority: true,
          location: true,
          isAllDay: true,
        },
        orderBy: { startDate: 'asc' },
        take: 5,
      }),
    ]);

    // Process children data for dashboard
    const processedChildren = childrenData.map(child => {
      const recentGrades = child.progressReports.map(report => ({
        subject: report.subject?.subjectName || 'General',
        grade: report.gradeValue,
        score: report.score,
        date: report.reportDate,
        comments: report.comments,
      }));

      // Calculate average score
      const scores = child.progressReports.filter(r => r.score).map(r => r.score!);
      const averageScore = scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
        : null;

      return {
        id: child.id,
        name: `${child.firstName} ${child.lastName}`,
        grade: child.grade?.gradeName || 'Sin Grado',
        level: child.grade?.educationalLevel?.levelName || 'Sin Nivel',
        teacher: child.teacher?.name || 'Sin Asignar',
        teacherEmail: child.teacher?.email,
        attendance: {
          rate: child.attendanceRate || 0,
          status: (child.attendanceRate || 0) >= 0.9 ? 'excellent' : 
                  (child.attendanceRate || 0) >= 0.8 ? 'good' : 'needs_attention',
        },
        academic: {
          progress: child.academicProgress || 0,
          averageScore,
          status: (child.academicProgress || 0) >= 80 ? 'excellent' : 
                  (child.academicProgress || 0) >= 70 ? 'good' : 'needs_attention',
        },
        recentGrades,
      };
    });

    // Calculate family overview
    const totalChildren = processedChildren.length;
    const avgAttendance = totalChildren > 0
      ? processedChildren.reduce((sum, child) => sum + child.attendance.rate, 0) / totalChildren
      : 0;
    const avgProgress = totalChildren > 0
      ? processedChildren.reduce((sum, child) => sum + child.academic.progress, 0) / totalChildren
      : 0;

    const parentDashboard = {
      parent: parentInfo,
      
      overview: {
        totalChildren,
        upcomingMeetings: upcomingMeetings.length,
        unreadMessages: recentCommunications.filter(n => !n.read).length,
        upcomingEvents: schoolEvents.length,
        familyAttendance: Math.round(avgAttendance * 100) / 100,
        familyProgress: Math.round(avgProgress * 100) / 100,
      },
      
      children: processedChildren,
      
      meetings: {
        upcoming: upcomingMeetings.map(meeting => ({
          id: meeting.id,
          title: meeting.title,
          date: meeting.scheduledDate,
          time: meeting.scheduledTime,
          location: meeting.location,
          teacher: meeting.teacher?.name,
          student: `${meeting.student?.firstName} ${meeting.student?.lastName}`,
          status: meeting.status,
          type: meeting.type,
          isUrgent: meeting.scheduledDate < new Date(Date.now() + 24 * 60 * 60 * 1000), // Within 24 hours
        })),
      },
      
      communications: {
        recent: recentCommunications.map(comm => ({
          id: comm.id,
          title: comm.title,
          message: comm.message,
          type: comm.type,
          priority: comm.priority,
          read: comm.read,
          sender: comm.sender?.name,
          senderRole: comm.sender?.role,
          date: comm.createdAt,
          isImportant: comm.priority === 'HIGH',
        })),
        unreadCount: recentCommunications.filter(n => !n.read).length,
      },
      
      events: {
        upcoming: schoolEvents.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.startDate,
          endDate: event.endDate,
          location: event.location,
          category: event.category,
          priority: event.priority,
          isAllDay: event.isAllDay,
          isThisWeek: new Date(event.startDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })),
      },
      
      alerts: {
        attendanceAlerts: processedChildren.filter(child => child.attendance.status === 'needs_attention'),
        academicAlerts: processedChildren.filter(child => child.academic.status === 'needs_attention'),
        meetingAlerts: upcomingMeetings.filter(meeting => 
          new Date(meeting.scheduledDate) < new Date(Date.now() + 24 * 60 * 60 * 1000)
        ),
        unreadImportant: recentCommunications.filter(n => !n.read && n.priority === 'HIGH'),
      },
      
      quickActions: [
        { type: 'schedule_meeting', label: 'Agendar Reunión', available: true },
        { type: 'view_grades', label: 'Ver Notas', available: totalChildren > 0 },
        { type: 'contact_teacher', label: 'Contactar Profesor', available: totalChildren > 0 },
        { type: 'calendar', label: 'Ver Calendario', available: true },
        { type: 'notifications', label: 'Ver Notificaciones', available: recentCommunications.length > 0 },
      ],
      
      lastUpdated: new Date().toISOString(),
    };

    return createSuccessResponse(parentDashboard);
  },
  {
    requiredRole: 'PARENT_PLUS',
  }
);

export const runtime = 'nodejs';