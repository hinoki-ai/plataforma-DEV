import { z } from 'zod';

// API Response Schemas
export const StudentProgressSchema = z.object({
  id: z.string(),
  studentName: z.string(),
  grade: z.string(),
  subjects: z.array(
    z.object({
      name: z.string(),
      currentGrade: z.number(),
      previousGrade: z.number(),
      targetGrade: z.number(),
      improvement: z.number(),
      trend: z.enum(['up', 'down', 'stable']),
    })
  ),
  attendance: z.number(),
  behavior: z.number(),
  overallAverage: z.number(),
});

export const CommunicationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  isNew: z.boolean(),
  date: z.string(),
  sender: z.string(),
  type: z.enum(['announcement', 'message', 'event']),
});

export const AcademicResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['pdf', 'video', 'link']),
  url: z.string(),
  subject: z.string(),
  grade: z.string(),
  downloadCount: z.number(),
});

export const AnalyticsDataSchema = z.object({
  performanceMetrics: z.array(
    z.object({
      subject: z.string(),
      currentGrade: z.number(),
      previousGrade: z.number(),
      trend: z.enum(['up', 'down', 'stable']),
      improvement: z.number(),
      target: z.number(),
    })
  ),
  behaviorMetrics: z.array(
    z.object({
      category: z.string(),
      score: z.number(),
      maxScore: z.number(),
      status: z.enum(['excellent', 'good', 'needs_improvement']),
    })
  ),
  attendanceData: z.array(
    z.object({
      month: z.string(),
      present: z.number(),
      absent: z.number(),
      late: z.number(),
    })
  ),
  recommendations: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      category: z.string(),
    })
  ),
});

// Type definitions
export type StudentProgress = z.infer<typeof StudentProgressSchema>;
export type Communication = z.infer<typeof CommunicationSchema>;
export type AcademicResource = z.infer<typeof AcademicResourceSchema>;
export type AnalyticsData = z.infer<typeof AnalyticsDataSchema>;

// API Service Class
export class ParentDashboardAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Student Progress API
  async getStudentProgress(studentId?: string): Promise<StudentProgress[]> {
    const endpoint = studentId
      ? `/parent/students/${studentId}/progress`
      : '/parent/students/progress';

    return this.request<StudentProgress[]>(endpoint);
  }

  async updateStudentProgress(
    studentId: string,
    data: Partial<StudentProgress>
  ): Promise<StudentProgress> {
    return this.request<StudentProgress>(
      `/parent/students/${studentId}/progress`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  // Communications API
  async getCommunications(filters?: {
    priority?: 'high' | 'medium' | 'low';
    isNew?: boolean;
    type?: 'announcement' | 'message' | 'event';
  }): Promise<Communication[]> {
    const params = new URLSearchParams();
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.isNew !== undefined)
      params.append('isNew', filters.isNew.toString());
    if (filters?.type) params.append('type', filters.type);

    const endpoint = `/parent/communications${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<Communication[]>(endpoint);
  }

  async markCommunicationAsRead(communicationId: string): Promise<void> {
    return this.request<void>(
      `/parent/communications/${communicationId}/read`,
      {
        method: 'PUT',
      }
    );
  }

  async sendReply(
    communicationId: string,
    message: string
  ): Promise<Communication> {
    return this.request<Communication>(
      `/parent/communications/${communicationId}/reply`,
      {
        method: 'POST',
        body: JSON.stringify({ message }),
      }
    );
  }

  // Academic Resources API
  async getAcademicResources(filters?: {
    subject?: string;
    grade?: string;
    type?: 'pdf' | 'video' | 'link';
  }): Promise<AcademicResource[]> {
    const params = new URLSearchParams();
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.grade) params.append('grade', filters.grade);
    if (filters?.type) params.append('type', filters.type);

    const endpoint = `/parent/resources${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<AcademicResource[]>(endpoint);
  }

  async downloadResource(resourceId: string): Promise<{ downloadUrl: string }> {
    return this.request<{ downloadUrl: string }>(
      `/parent/resources/${resourceId}/download`,
      {
        method: 'POST',
      }
    );
  }

  // Analytics API
  async getAnalyticsData(
    period: string,
    studentId?: string
  ): Promise<AnalyticsData> {
    const params = new URLSearchParams({ period });
    if (studentId) params.append('studentId', studentId);

    const endpoint = `/parent/analytics?${params.toString()}`;
    return this.request<AnalyticsData>(endpoint);
  }

  async getAttendanceTrends(studentId?: string): Promise<{
    monthly: Array<{
      month: string;
      present: number;
      absent: number;
      late: number;
    }>;
    total: { present: number; absent: number; late: number };
  }> {
    const endpoint = studentId
      ? `/parent/analytics/attendance/${studentId}`
      : '/parent/analytics/attendance';

    return this.request(endpoint);
  }

  async getBehaviorMetrics(studentId?: string): Promise<{
    categories: Array<{
      name: string;
      score: number;
      maxScore: number;
      status: string;
    }>;
    overall: { score: number; maxScore: number; status: string };
  }> {
    const endpoint = studentId
      ? `/parent/analytics/behavior/${studentId}`
      : '/parent/analytics/behavior';

    return this.request(endpoint);
  }

  // Dashboard Overview API
  async getDashboardOverview(): Promise<{
    overallAverage: number;
    attendanceRate: number;
    newMessagesCount: number;
    upcomingEvents: Array<{
      id: string;
      title: string;
      date: string;
      type: string;
    }>;
    recentActivity: Array<{
      id: string;
      type: string;
      title: string;
      date: string;
      description: string;
    }>;
  }> {
    return this.request('/parent/dashboard/overview');
  }

  // Real-time Updates
  async subscribeToUpdates(callback: (data: any) => void): Promise<() => void> {
    // WebSocket implementation for real-time updates
    const ws = new WebSocket(
      `${this.baseURL.replace('http', 'ws')}/parent/updates`
    );

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    return () => {
      ws.close();
    };
  }
}

// Export singleton instance
export const parentDashboardAPI = new ParentDashboardAPI();
