/**
 * Service Response Types - Standardized interfaces for all service returns
 * Created as part of Stage 1.2: Service Layer Standardization
 */

import { User, PlanningDocument, Meeting, TeamMember } from '@prisma/client';

// Base service response types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QueryResponse<T = any> extends ServiceResponse<T> {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

// Planning document responses
export type PlanningDocumentResponse = ServiceResponse<
  PlanningDocument & {
    author: Pick<User, 'id' | 'name' | 'email'>;
  }
>;

export type PlanningDocumentsResponse = QueryResponse<
  (PlanningDocument & {
    author: Pick<User, 'id' | 'name' | 'email'>;
  })[]
>;

// Meeting responses
export type MeetingResponse = ServiceResponse<
  Meeting & {
    teacher?: Pick<User, 'id' | 'name' | 'email'>;
  }
>;

export type MeetingsResponse = ServiceResponse<
  (Meeting & {
    teacher?: Pick<User, 'id' | 'name' | 'email'>;
  })[]
>;

// Team member responses
export type TeamMemberResponse = ServiceResponse<TeamMember>;

export type TeamMembersResponse = ServiceResponse<TeamMember[]>;

// School info responses
export type SchoolInfoResponse = ServiceResponse<any>;

// Calendar responses
export type CalendarEventsResponse = ServiceResponse<any[]>;

export type CalendarStatisticsResponse = ServiceResponse<any>;

// User responses
export type UserResponse = ServiceResponse<User>;

export type UsersResponse = ServiceResponse<User[]>;

// Filter types
export interface PlanningFilters {
  q?: string;
  subject?: string;
  grade?: string;
  page?: number;
  limit?: number;
}

export interface MeetingFilters {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
  studentGrade?: string;
  page?: number;
  limit?: number;
}

// Meeting statistics response
export type MeetingStatsResponse = ServiceResponse<{
  totalMeetings: number;
  scheduledMeetings: number;
  confirmedMeetings: number;
  completedMeetings: number;
  cancelledMeetings: number;
}>;

// Generic responses
export type SuccessResponse = ServiceResponse<{ message: string }>;

export type ErrorResponse = ServiceResponse<{ error: string }>;
