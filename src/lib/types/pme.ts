export interface PMEGoal {
  id: string;
  userId?: string;
  title: string;
  description: string;
  category: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "PENDING_REVIEW"
    | "NEEDS_REVISION";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  level?: string;
  startDate: Date;
  endDate?: Date;
  targetDate?: Date;
  assignedTo?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  progress?: number;
  notes?: string;
  adminNotes?: string;
  evidence?: Array<{
    id: string;
    type: string;
    title: string;
    description?: string;
    url?: string;
    date?: Date;
    uploadDate?: Date;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}
