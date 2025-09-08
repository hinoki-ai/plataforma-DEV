import { NextRequest } from 'next/server';
import { prisma, checkDatabaseConnection } from '@/lib/db';
import { createApiRoute } from '@/lib/api-validation';
import { createSuccessResponse } from '@/lib/api-error';

// GET /api/profesor/dashboard - Teacher dashboard metrics
export const GET = createApiRoute(
  async (request, validated) => {
    const teacherId = validated.session.user.id;
    
    // Verify database health
    const isDbHealthy = await checkDatabaseConnection();
    if (!isDbHealthy) {
      throw new Error('Database connection failed');
    }

    // Optimized parallel queries for teacher data
    const [
      teacherInfo,
      studentsData,
      planningData,
      meetingsData,
      recentActivity
    ] = await Promise.all([
      // Teacher basic info
      prisma.user.findUnique({
        where: { id: teacherId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
      
      // Students managed by teacher
      prisma.student.findMany({
        where: { teacherId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          grade: {
            select: {
              gradeName: true,
              gradeCode: true,
            },
          },
          attendanceRate: true,
          academicProgress: true,
          isActive: true,
        },
        orderBy: { firstName: 'asc' },
      }),
      
      // Planning documents by teacher
      prisma.planningDocument.aggregate({
        where: { authorId: teacherId },
        _count: { id: true },
      }),
      
      // Meetings assigned to teacher
      Promise.all([
        prisma.meeting.count({
          where: {
            assignedTo: teacherId,
            scheduledDate: { gte: new Date() },
          },
        }),
        prisma.meeting.count({
          where: {
            assignedTo: teacherId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]),
      
      // Recent planning documents
      prisma.planningDocument.findMany({
        where: { authorId: teacherId },
        select: {
          id: true,
          title: true,
          subject: {
            select: {
              subjectName: true,
              subjectCode: true,
            },
          },
          grade: {
            select: {
              gradeName: true,
              gradeCode: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    const [upcomingMeetings, recentMeetings] = meetingsData;

    // Calculate student statistics
    const activeStudents = studentsData.filter(s => s.isActive);
    const averageAttendance = activeStudents.length > 0
      ? activeStudents.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / activeStudents.length
      : 0;
    const averageProgress = activeStudents.length > 0
      ? activeStudents.reduce((sum, s) => sum + (s.academicProgress || 0), 0) / activeStudents.length
      : 0;

    // Group students by grade for overview
    const studentsByGrade = activeStudents.reduce((acc, student) => {
      const grade = student.grade?.gradeName || 'Sin Grado';
      if (!acc[grade]) {
        acc[grade] = [];
      }
      acc[grade].push(student);
      return acc;
    }, {} as Record<string, typeof activeStudents>);

    const profesorDashboard = {
      teacher: teacherInfo,
      
      overview: {
        totalStudents: activeStudents.length,
        totalGrades: Object.keys(studentsByGrade).length,
        planningDocuments: planningData._count.id,
        upcomingMeetings,
        averageAttendance: Math.round(averageAttendance * 100) / 100,
        averageProgress: Math.round(averageProgress * 100) / 100,
      },
      
      students: {
        total: activeStudents.length,
        byGrade: Object.entries(studentsByGrade).map(([gradeName, students]) => ({
          grade: gradeName,
          count: students.length,
          averageAttendance: students.length > 0
            ? Math.round((students.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / students.length) * 100) / 100
            : 0,
          averageProgress: students.length > 0
            ? Math.round((students.reduce((sum, s) => sum + (s.academicProgress || 0), 0) / students.length) * 100) / 100
            : 0,
        })),
        recentlyAdded: activeStudents
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 3)
          .map(s => ({
            name: `${s.firstName} ${s.lastName}`,
            grade: s.grade?.gradeName || 'Sin Grado',
          })),
      },
      
      planning: {
        totalDocuments: planningData._count.id,
        recentDocuments: recentActivity.map(doc => ({
          id: doc.id,
          title: doc.title,
          subject: doc.subject?.subjectName || 'Sin Materia',
          grade: doc.grade?.gradeName || 'Sin Grado',
          lastUpdated: doc.updatedAt,
          isRecent: new Date(doc.updatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
        })),
      },
      
      meetings: {
        upcoming: upcomingMeetings,
        recent: recentMeetings,
        needsAttention: upcomingMeetings > 5, // Alert if too many upcoming meetings
      },
      
      quickStats: {
        studentsNeedingAttention: activeStudents.filter(s => 
          (s.attendanceRate || 0) < 0.8 || (s.academicProgress || 0) < 60
        ).length,
        documentsThisWeek: recentActivity.filter(doc => 
          new Date(doc.updatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        ).length,
        averageClassSize: activeStudents.length / Math.max(Object.keys(studentsByGrade).length, 1),
      },
      
      lastUpdated: new Date().toISOString(),
    };

    return createSuccessResponse(profesorDashboard);
  },
  {
    requiredRole: 'TEACHER_PLUS',
  }
);

export const runtime = 'nodejs';