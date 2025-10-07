import { NextRequest } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { createApiRoute } from '@/lib/api-validation';
import { createSuccessResponse } from '@/lib/api-error';
import { Id } from '@/convex/_generated/dataModel';

// GET /api/profesor/dashboard - Teacher dashboard metrics
export const GET = createApiRoute(
  async (request, validated) => {
    const teacherId = (validated.session?.user?.id || '') as unknown as Id<"users">;
    const client = getConvexClient();

    // Optimized parallel queries for teacher data
    const [
      teacherInfo,
      studentsData,
      planningData,
      meetingsData
    ] = await Promise.all([
      // Teacher basic info
      client.query(api.users.getUserById, { userId: teacherId }),
      
      // Students managed by teacher
      client.query(api.students.getStudents, {
        teacherId,
        isActive: true,
      }),
      
      // All planning documents by teacher
      client.query(api.planning.getPlanningDocuments, {
        authorId: teacherId,
      }),
      
      // All meetings assigned to teacher
      client.query(api.meetings.getMeetingsByTeacher, {
        teacherId,
      }),
    ]);

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Filter meetings
    const upcomingMeetings = meetingsData.filter(m => m.scheduledDate >= now).length;
    const recentMeetings = meetingsData.filter(m => m.createdAt >= sevenDaysAgo).length;
    
    // Get recent planning documents
    const recentActivity = planningData.slice(0, 5); // Already sorted by updatedAt desc

    // Calculate student statistics
    const activeStudents = studentsData;
    const averageAttendance = activeStudents.length > 0
      ? activeStudents.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / activeStudents.length
      : 0;
    const averageProgress = activeStudents.length > 0
      ? activeStudents.reduce((sum, s) => sum + (s.academicProgress || 0), 0) / activeStudents.length
      : 0;

    // Group students by grade for overview
    const studentsByGrade = activeStudents.reduce((acc, student) => {
      const grade = student.grade || 'Sin Grado';
      if (!acc[grade]) {
        acc[grade] = [];
      }
      acc[grade].push(student);
      return acc;
    }, {} as Record<string, typeof activeStudents>);

    const profesorDashboard = {
      teacher: teacherInfo ? {
        id: teacherInfo._id,
        name: teacherInfo.name,
        email: teacherInfo.email,
        createdAt: new Date(teacherInfo.createdAt).toISOString(),
      } : null,
      
      overview: {
        totalStudents: activeStudents.length,
        totalGrades: Object.keys(studentsByGrade).length,
        planningDocuments: planningData.length,
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
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 3)
          .map(s => ({
            name: `${s.firstName} ${s.lastName}`,
            grade: s.grade || 'Sin Grado',
          })),
      },
      
      planning: {
        totalDocuments: planningData.length,
        recentDocuments: recentActivity.map(doc => ({
          id: doc._id,
          title: doc.title,
          subject: doc.subject || 'Sin Materia',
          grade: doc.grade || 'Sin Grado',
          lastUpdated: new Date(doc.updatedAt).toISOString(),
          isRecent: doc.updatedAt > sevenDaysAgo,
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
          doc.updatedAt > sevenDaysAgo
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