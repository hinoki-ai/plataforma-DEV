import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface StudentSubjectSummary {
  name: string;
  grade: string;
  progress: number;
}

interface StudentActivitySummary {
  title: string;
  date: string;
  type: string;
}

interface StudentReportSummary {
  title: string;
  date: string;
  type: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role !== "PARENT") {
      return NextResponse.json(
        { error: "Acceso restringido" },
        { status: 403 },
      );
    }

    const client = await getAuthenticatedConvexClient();
    const parentId = session.user.id as unknown as Id<"users">;

    const [students, meetings] = await Promise.all([
      client.query(api.students.getStudents, {
        parentId,
        isActive: true,
      }),
      client.query(api.meetings.getMeetingsByParent, {
        parentId,
      }),
    ]);

    if (students.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const formatted = await Promise.all(
      students.map(async (student) => {
        const studentId = student._id as Id<"students">;

        const [teacher, grades, attendanceSummary] = await Promise.all([
          client.query(api.users.getUserById, {
            userId: student.teacherId,
          }),
          client.query(api.grades.getStudentGrades, {
            studentId,
          }),
          client.query(api.attendance.getStudentAttendanceSummary, {
            studentId,
          }),
        ]);

        // Aggregate grades by subject
        const subjectsMap = new Map<
          string,
          { total: number; count: number; lastUpdated: number }
        >();
        for (const grade of grades) {
          const subjectKey = grade.subject || "General";
          const existing = subjectsMap.get(subjectKey) || {
            total: 0,
            count: 0,
            lastUpdated: 0,
          };
          existing.total += grade.grade;
          existing.count += 1;
          existing.lastUpdated = Math.max(existing.lastUpdated, grade.date);
          subjectsMap.set(subjectKey, existing);
        }

        const subjectAverages: number[] = [];
        const subjects: StudentSubjectSummary[] = Array.from(
          subjectsMap.entries(),
        ).map(([subject, summary]) => {
          const average = summary.count > 0 ? summary.total / summary.count : 0;
          if (summary.count > 0) {
            subjectAverages.push(average);
          }
          return {
            name: subject,
            grade: summary.count > 0 ? average.toFixed(1) : "-",
            progress:
              summary.count > 0
                ? Math.max(0, Math.min(100, Math.round((average / 7) * 100)))
                : 0,
          };
        });

        const overallAverage = subjectAverages.length
          ? subjectAverages.reduce((sum, value) => sum + value, 0) /
            subjectAverages.length
          : 0;

        const academicProgress = Math.max(
          0,
          Math.min(100, Math.round((overallAverage / 7) * 100)),
        );

        const attendanceSource =
          attendanceSummary?.attendanceRate ??
          (student.attendanceRate !== undefined
            ? student.attendanceRate * 100
            : null);

        const attendance =
          attendanceSource !== null && attendanceSource !== undefined
            ? Math.max(0, Math.min(100, Math.round(attendanceSource)))
            : 0;

        // Meetings related to this student
        const studentName = `${student.firstName} ${student.lastName}`.trim();
        const upcomingActivities: StudentActivitySummary[] = meetings
          .filter((meeting) =>
            meeting.studentName
              ? meeting.studentName.toLowerCase() === studentName.toLowerCase()
              : false,
          )
          .filter((meeting) => meeting.scheduledDate >= Date.now())
          .slice(0, 3)
          .map((meeting) => ({
            title: meeting.title,
            date: new Date(meeting.scheduledDate).toISOString(),
            type: meeting.type,
          }));

        const recentReports: StudentReportSummary[] = grades
          .sort((a, b) => b.date - a.date)
          .slice(0, 3)
          .map((grade) => ({
            title: grade.evaluationName,
            date: new Date(grade.date).toISOString(),
            type: grade.subject,
          }));

        return {
          id: String(student._id),
          name: studentName,
          grade: student.grade,
          enrollmentDate: new Date(student.enrollmentDate).toISOString(),
          attendance,
          academicProgress,
          teacher: {
            name: teacher?.name ?? "Profesor asignado",
            email: teacher?.email ?? "",
            phone: teacher?.phone ?? "",
          },
          subjects,
          upcomingActivities,
          recentReports,
        };
      }),
    );

    return NextResponse.json({ data: formatted });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
