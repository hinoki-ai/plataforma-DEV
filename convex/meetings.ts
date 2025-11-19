/**
 * Meeting Queries and Mutations
 * Handles parent-teacher meetings
 */

import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { ensureInstitutionMatch, tenantMutation, tenantQuery } from "./tenancy";
import { MEETING_TYPE_SCHEMA } from "./constants";
import { now, userInInstitution } from "./validation";

type MeetingDoc = Doc<"meetings">;
type UserDoc = Doc<"users">;
type AnyCtx = QueryCtx | MutationCtx;

async function enrichMeetingsWithTeacher<C extends AnyCtx>(
  ctx: C,
  meetings: MeetingDoc[],
) {
  if (meetings.length === 0) {
    return meetings;
  }

  const teacherIds = Array.from(
    new Set(meetings.map((m: any) => m.assignedTo)),
  );
  const teacherEntries = await Promise.all(
    teacherIds.map(async (id) => {
      const teacher = await ctx.db.get(id);
      return teacher ? ([id, teacher] as const) : null;
    }),
  );

  const teacherMap = new Map(
    teacherEntries.filter(
      (entry): entry is readonly [Id<"users">, UserDoc] => entry !== null,
    ),
  );

  return meetings.map((meeting: any) => {
    const teacher = teacherMap.get(meeting.assignedTo);
    return {
      ...meeting,
      teacher: teacher
        ? {
            id: teacher._id,
            name: teacher.name,
            email: teacher.email,
          }
        : null,
    };
  });
}

// ==================== QUERIES ====================

export const getMeetings = tenantQuery({
  args: {
    filter: v.optional(
      v.object({
        status: v.optional(v.string()),
        type: v.optional(v.string()),
      }),
    ),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    assignedTo: v.optional(v.id("users")),
    parentRequested: v.optional(v.boolean()),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (
    ctx,
    { filter, page = 1, limit = 20, assignedTo, parentRequested },
    tenancy,
  ) => {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);

    let meetings = await ctx.db
      .query("meetings")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    const enforcedAssignedTo =
      tenancy.membershipRole === "PROFESOR" && !tenancy.isMaster
        ? tenancy.user._id
        : assignedTo;

    if (enforcedAssignedTo) {
      meetings = meetings.filter(
        (m: any) => m.assignedTo === enforcedAssignedTo,
      );
    }

    if (filter?.status) {
      meetings = meetings.filter((m: any) => m.status === filter.status);
    }

    if (filter?.type) {
      meetings = meetings.filter((m: any) => m.type === filter.type);
    }

    if (parentRequested !== undefined) {
      meetings = meetings.filter(
        (m: any) => m.parentRequested === parentRequested,
      );
    }

    meetings.sort((a: any, b: any) => b.scheduledDate - a.scheduledDate);

    const total = meetings.length;
    const skip = (safePage - 1) * safeLimit;
    const pagedMeetings = meetings.slice(skip, skip + safeLimit);

    const meetingsWithTeacher = await enrichMeetingsWithTeacher(
      ctx,
      pagedMeetings,
    );

    return {
      meetings: meetingsWithTeacher,
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit),
    };
  },
});

export const getMeetingById = tenantQuery({
  args: { id: v.id("meetings") },
  roles: ["ADMIN", "STAFF", "PROFESOR", "PARENT", "MASTER"],
  handler: async (ctx, { id }, tenancy) => {
    const meeting = ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Meeting not found",
    );

    if (!tenancy.isMaster) {
      if (
        tenancy.membershipRole === "PROFESOR" &&
        meeting.assignedTo !== tenancy.user._id
      ) {
        throw new Error("No permission to view this meeting");
      }

      if (
        tenancy.membershipRole === "PARENT" &&
        meeting.guardianEmail !== (tenancy.user.email ?? "")
      ) {
        throw new Error("No permission to view this meeting");
      }
    }

    const [enriched] = await enrichMeetingsWithTeacher(ctx, [meeting]);
    return enriched;
  },
});

export const getMeetingsByTeacher = tenantQuery({
  args: { teacherId: v.id("users") },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { teacherId }, tenancy) => {
    const effectiveTeacherId =
      tenancy.membershipRole === "PROFESOR" && !tenancy.isMaster
        ? tenancy.user._id
        : teacherId;

    // Validate effectiveTeacherId
    if (!effectiveTeacherId) {
      throw new Error("Teacher ID is required");
    }

    // Verify the teacher exists
    const teacher = await ctx.db.get(effectiveTeacherId);
    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Verify teacher is in the same institution (if not master)
    if (
      !tenancy.isMaster &&
      !(await userInInstitution(
        ctx,
        effectiveTeacherId,
        tenancy.institution._id as Id<"institutionInfo">,
      ))
    ) {
      throw new Error("Teacher is not part of this institution");
    }

    const meetings = await ctx.db
      .query("meetings")
      .withIndex("by_assignedTo", (q: any) =>
        q.eq("assignedTo", effectiveTeacherId),
      )
      .collect();

    const scoped = meetings.filter(
      (meeting: any) => meeting.institutionId === tenancy.institution._id,
    );

    return await enrichMeetingsWithTeacher(ctx, scoped);
  },
});

export const getMeetingsByStudent = tenantQuery({
  args: { studentId: v.id("students") },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { studentId }, tenancy) => {
    let meetings = await ctx.db
      .query("meetings")
      .withIndex("by_studentId", (q: any) => q.eq("studentId", studentId))
      .collect();

    meetings = meetings.filter(
      (meeting: any) => meeting.institutionId === tenancy.institution._id,
    );

    if (tenancy.membershipRole === "PROFESOR" && !tenancy.isMaster) {
      meetings = meetings.filter(
        (meeting: any) => meeting.assignedTo === tenancy.user._id,
      );
    }

    meetings.sort((a: any, b: any) => b.scheduledDate - a.scheduledDate);

    return await enrichMeetingsWithTeacher(ctx, meetings);
  },
});

export const getUpcomingMeetings = tenantQuery({
  args: { userId: v.optional(v.id("users")) },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { userId }, tenancy) => {
    const currentTime = now();

    let meetings = await ctx.db
      .query("meetings")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    meetings = meetings.filter((meeting: any) => meeting.scheduledDate >= now);

    const effectiveUserId =
      tenancy.membershipRole === "PROFESOR" && !tenancy.isMaster
        ? tenancy.user._id
        : userId;

    if (effectiveUserId) {
      meetings = meetings.filter(
        (meeting: any) => meeting.assignedTo === effectiveUserId,
      );
    }

    meetings.sort((a: any, b: any) => a.scheduledDate - b.scheduledDate);

    return await enrichMeetingsWithTeacher(ctx, meetings);
  },
});

export const getMeetingsByGuardian = tenantQuery({
  args: { guardianEmail: v.string() },
  roles: ["ADMIN", "STAFF", "PROFESOR", "PARENT", "MASTER"],
  handler: async (ctx, { guardianEmail }, tenancy) => {
    const effectiveEmail =
      tenancy.membershipRole === "PARENT" && !tenancy.isMaster
        ? (tenancy.user.email ?? guardianEmail)
        : guardianEmail;

    let meetings = await ctx.db
      .query("meetings")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    meetings = meetings
      .filter((meeting: any) => meeting.guardianEmail === effectiveEmail)
      .sort((a: any, b: any) => b.scheduledDate - a.scheduledDate);

    return await enrichMeetingsWithTeacher(ctx, meetings);
  },
});

export const getMeetingStats = tenantQuery({
  args: {},
  roles: ["ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, _args, tenancy) => {
    const currentTime = now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const meetings = await ctx.db
      .query("meetings")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    return {
      total: meetings.length,
      upcoming: meetings.filter((m: any) => m.scheduledDate >= now).length,
      recent: meetings.filter((m: any) => m.createdAt >= sevenDaysAgo).length,
      completed: meetings.filter((m: any) => m.status === "COMPLETED").length,
      pending: meetings.filter((m: any) => m.status === "SCHEDULED").length,
    };
  },
});

export const getMeetingsByParent = tenantQuery({
  args: { parentId: v.id("users") },
  roles: ["ADMIN", "STAFF", "PROFESOR", "PARENT", "MASTER"],
  handler: async (ctx, { parentId }, tenancy) => {
    const effectiveParentId =
      tenancy.membershipRole === "PARENT" && !tenancy.isMaster
        ? tenancy.user._id
        : parentId;

    const parent = await ctx.db.get(effectiveParentId);
    if (!parent) return [];

    if (
      !tenancy.isMaster &&
      !(await userInInstitution(
        ctx,
        effectiveParentId,
        tenancy.institution._id as Id<"institutionInfo">,
      ))
    ) {
      throw new Error("Parent is not part of this institution");
    }

    const meetings = await ctx.db
      .query("meetings")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    const filtered = meetings
      .filter((meeting: any) => meeting.guardianEmail === parent.email)
      .sort((a: any, b: any) => b.scheduledDate - a.scheduledDate);

    return await enrichMeetingsWithTeacher(ctx, filtered);
  },
});

export const getParentMeetingRequests = tenantQuery({
  args: {},
  roles: ["ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, _args, tenancy) => {
    const meetings = await ctx.db
      .query("meetings")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    const filtered = meetings
      .filter(
        (meeting: any) =>
          meeting.parentRequested && meeting.status === "SCHEDULED",
      )
      .sort((a: any, b: any) => a.scheduledDate - b.scheduledDate);

    return await enrichMeetingsWithTeacher(ctx, filtered);
  },
});

// ==================== MUTATIONS ====================

export const createMeeting = tenantMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    studentName: v.string(),
    studentGrade: v.string(),
    guardianName: v.string(),
    guardianEmail: v.string(),
    guardianPhone: v.string(),
    scheduledDate: v.number(),
    scheduledTime: v.string(),
    duration: v.optional(v.number()),
    location: v.optional(v.string()),
    type: MEETING_TYPE_SCHEMA,
    assignedTo: v.id("users"),
    reason: v.optional(v.string()),
    parentRequested: v.optional(v.boolean()),
    studentId: v.optional(v.id("students")),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, args, tenancy) => {
    if (
      tenancy.membershipRole === "PROFESOR" &&
      !tenancy.isMaster &&
      args.assignedTo !== tenancy.user._id
    ) {
      throw new Error("Teachers can only assign meetings to themselves");
    }

    const teacher = await ctx.db.get(args.assignedTo);
    if (!teacher) {
      throw new Error("Teacher not found");
    }

    if (
      !tenancy.isMaster &&
      !(await userInInstitution(
        ctx,
        args.assignedTo,
        tenancy.institution._id as Id<"institutionInfo">,
      ))
    ) {
      throw new Error("Teacher is not part of this institution");
    }

    if (args.studentId) {
      const student = await ctx.db.get(args.studentId);
      if (!student || student.institutionId !== tenancy.institution._id) {
        throw new Error("Student not found for this institution");
      }
    }

    const currentTime = now();

    return await ctx.db.insert("meetings", {
      ...args,
      duration: args.duration ?? 30,
      location: args.location ?? "Sala de Reuniones",
      followUpRequired: false,
      parentRequested: args.parentRequested ?? false,
      source: args.parentRequested ? "PARENT_REQUESTED" : "STAFF_CREATED",
      status: "SCHEDULED",
      createdAt: now,
      updatedAt: now,
      institutionId: tenancy.institution._id,
    });
  },
});

export const updateMeeting = tenantMutation({
  args: {
    id: v.id("meetings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    scheduledTime: v.optional(v.string()),
    duration: v.optional(v.number()),
    location: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("SCHEDULED"),
        v.literal("CONFIRMED"),
        v.literal("IN_PROGRESS"),
        v.literal("COMPLETED"),
        v.literal("CANCELLED"),
        v.literal("RESCHEDULED"),
      ),
    ),
    notes: v.optional(v.string()),
    outcome: v.optional(v.string()),
    followUpRequired: v.optional(v.boolean()),
    assignedTo: v.optional(v.id("users")),
    studentId: v.optional(v.id("students")),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { id, ...updates }, tenancy) => {
    const meeting = ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Meeting not found",
    );

    if (
      tenancy.membershipRole === "PROFESOR" &&
      !tenancy.isMaster &&
      meeting.assignedTo !== tenancy.user._id
    ) {
      throw new Error("No permission to update this meeting");
    }

    if (updates.assignedTo && updates.assignedTo !== meeting.assignedTo) {
      if (tenancy.membershipRole === "PROFESOR" && !tenancy.isMaster) {
        throw new Error("Teachers cannot reassign meetings");
      }

      const newTeacher = await ctx.db.get(updates.assignedTo);
      if (!newTeacher) {
        throw new Error("Assigned teacher not found");
      }

      if (
        !tenancy.isMaster &&
        !(await userInInstitution(
          ctx,
          updates.assignedTo,
          tenancy.institution._id as Id<"institutionInfo">,
        ))
      ) {
        throw new Error("Assigned teacher is not part of this institution");
      }
    }

    if (updates.studentId && updates.studentId !== meeting.studentId) {
      const student = await ctx.db.get(updates.studentId);
      if (!student || student.institutionId !== tenancy.institution._id) {
        throw new Error("Student not found for this institution");
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now(),
    });

    return await ctx.db.get(id);
  },
});

export const deleteMeeting = tenantMutation({
  args: { id: v.id("meetings") },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { id }, tenancy) => {
    const meeting = ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Meeting not found",
    );

    if (
      tenancy.membershipRole === "PROFESOR" &&
      !tenancy.isMaster &&
      meeting.assignedTo !== tenancy.user._id
    ) {
      throw new Error("No permission to delete this meeting");
    }

    await ctx.db.delete(id);
  },
});

export const cancelMeeting = tenantMutation({
  args: {
    id: v.id("meetings"),
    reason: v.optional(v.string()),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { id, reason }, tenancy) => {
    const meeting = ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Meeting not found",
    );

    if (
      tenancy.membershipRole === "PROFESOR" &&
      !tenancy.isMaster &&
      meeting.assignedTo !== tenancy.user._id
    ) {
      throw new Error("No permission to cancel this meeting");
    }

    await ctx.db.patch(id, {
      status: "CANCELLED",
      notes: reason ?? meeting.notes,
      updatedAt: now(),
    });
  },
});

export const updateMeetingStatus = tenantMutation({
  args: {
    id: v.id("meetings"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { id, status, notes }, tenancy) => {
    const meeting = ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Meeting not found",
    );

    if (
      tenancy.membershipRole === "PROFESOR" &&
      !tenancy.isMaster &&
      meeting.assignedTo !== tenancy.user._id
    ) {
      throw new Error("No permission to update this meeting");
    }

    const updates: Record<string, any> = {
      status,
      updatedAt: now(),
    };

    if (notes) {
      updates.notes = notes;
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const requestMeeting = tenantMutation({
  args: {
    studentName: v.string(),
    studentGrade: v.string(),
    guardianName: v.string(),
    guardianEmail: v.string(),
    guardianPhone: v.string(),
    preferredDate: v.number(),
    preferredTime: v.string(),
    reason: v.string(),
    type: MEETING_TYPE_SCHEMA,
    teacherId: v.optional(v.id("users")),
  },
  roles: ["PARENT", "ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, args, tenancy) => {
    const currentTime = now();

    const guardianEmail =
      tenancy.membershipRole === "PARENT" && !tenancy.isMaster
        ? (tenancy.user.email ?? args.guardianEmail)
        : args.guardianEmail;

    const guardianName =
      tenancy.membershipRole === "PARENT" && !tenancy.isMaster
        ? (tenancy.user.name ?? args.guardianName)
        : args.guardianName;

    const guardianPhone =
      tenancy.membershipRole === "PARENT" && !tenancy.isMaster
        ? (tenancy.user.phone ?? args.guardianPhone)
        : args.guardianPhone;

    const memberships = await ctx.db
      .query("institutionMemberships")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    let assignedTeacherId: Id<"users"> | null = null;

    if (args.teacherId) {
      const teacherMembership = memberships.find(
        (membership: any) =>
          membership.userId === args.teacherId &&
          membership.role === "PROFESOR",
      );

      if (!teacherMembership) {
        throw new Error("Assigned teacher is not part of this institution");
      }

      const teacher = await ctx.db.get(args.teacherId);
      if (!teacher) {
        throw new Error("Assigned teacher not found");
      }

      assignedTeacherId = teacher._id;
    } else {
      const fallbackTeacherMembership = memberships.find(
        (membership: any) => membership.role === "PROFESOR",
      );

      if (!fallbackTeacherMembership) {
        throw new Error("No teacher available to assign meeting");
      }

      const fallbackTeacher = await ctx.db.get(
        fallbackTeacherMembership.userId,
      );

      if (!fallbackTeacher) {
        throw new Error("Assigned teacher not found");
      }

      assignedTeacherId = fallbackTeacher._id;
    }

    return await ctx.db.insert("meetings", {
      title: `Reunión solicitada: ${args.studentName}`,
      description: args.reason,
      studentName: args.studentName,
      studentGrade: args.studentGrade,
      guardianName,
      guardianEmail,
      guardianPhone,
      scheduledDate: args.preferredDate,
      scheduledTime: args.preferredTime,
      duration: 30,
      location: "Por definir",
      type: args.type,
      status: "SCHEDULED",
      reason: args.reason,
      assignedTo: assignedTeacherId,
      parentRequested: true,
      source: "PARENT_REQUESTED",
      followUpRequired: false,
      createdAt: now,
      updatedAt: now,
      institutionId: tenancy.institution._id,
    });
  },
});
