/**
 * Digital Signatures and Record Certification
 * Chilean Educational System - Circular N°30 Compliance
 * Manages digital signatures for libro de clases entries and certification
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ==================== QUERIES ====================

/**
 * Get signature for a specific record
 */
export const getSignature = query({
  args: {
    recordType: v.union(
      v.literal("CLASS_CONTENT"),
      v.literal("ATTENDANCE"),
      v.literal("OBSERVATION"),
      v.literal("GRADE"),
      v.literal("MEETING"),
      v.literal("PARENT_MEETING"),
    ),
    recordId: v.string(),
  },
  handler: async (ctx, { recordType, recordId }) => {
    const signature = await ctx.db
      .query("digitalSignatures")
      .withIndex("by_recordType_recordId")
      .filter(q => q.eq(q.field("recordType"), recordType))
      .filter(q => q.eq(q.field("recordId"), recordId))
      .first();

    if (!signature) {
      return null;
    }

    // Get signer info
    const signer = await ctx.db.get(signature.signedBy);
    const certifier = signature.certifiedBy
      ? await ctx.db.get(signature.certifiedBy)
      : null;

    return {
      ...signature,
      signer,
      certifier,
    };
  },
});

/**
 * Get all signatures for a user
 */
export const getSignaturesByUser = query({
  args: {
    userId: v.id("users"),
    isCertified: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, isCertified }) => {
    let signatures = await ctx.db
      .query("digitalSignatures")
      .filter(q => q.eq(q.field("signedBy"), userId))
      .collect();

    if (isCertified !== undefined) {
      signatures = signatures.filter((s) => s.isCertified === isCertified);
    }

    const signaturesWithDetails = await Promise.all(
      signatures.map(async (signature) => {
        const signer = await ctx.db.get(signature.signedBy);
        const certifier = signature.certifiedBy
          ? await ctx.db.get(signature.certifiedBy)
          : null;

        return {
          ...signature,
          signer,
          certifier,
        };
      }),
    );

    return signaturesWithDetails.sort((a, b) => (b as any).createdAt - (a as any).createdAt);
  },
});

/**
 * Get pending certifications
 */
export const getPendingCertifications = query({
  args: {
    recordType: v.optional(
      v.union(
        v.literal("CLASS_CONTENT"),
        v.literal("ATTENDANCE"),
        v.literal("OBSERVATION"),
        v.literal("GRADE"),
        v.literal("MEETING"),
        v.literal("PARENT_MEETING"),
        v.literal("PERIOD"),
      ),
    ),
  },
  handler: async (ctx, { recordType }) => {
    let certifications = await ctx.db
      .query("recordCertifications")
      .filter(q => q.eq(q.field("status"), "PENDING"))
      .collect();

    if (recordType) {
      certifications = certifications.filter(
        (c) => c.recordType === recordType,
      );
    }

    // Get certifier info
    const certificationsWithDetails = await Promise.all(
      certifications.map(async (cert) => {
        const certifier = await ctx.db.get(cert.certifiedBy);
        return {
          ...cert,
          certifier,
        };
      }),
    );

    return certificationsWithDetails.sort(
      (a, b) => (b as any).certificationDate - (a as any).certificationDate,
    );
  },
});

/**
 * Get certification for a record
 */
export const getCertification = query({
  args: {
    recordType: v.union(
      v.literal("CLASS_CONTENT"),
      v.literal("ATTENDANCE"),
      v.literal("OBSERVATION"),
      v.literal("GRADE"),
      v.literal("MEETING"),
      v.literal("PARENT_MEETING"),
      v.literal("PERIOD"),
    ),
    recordId: v.string(),
  },
  handler: async (ctx, { recordType, recordId }) => {
    const certification = await ctx.db
      .query("recordCertifications")
      .withIndex("by_recordType_recordId")
      .filter(q => q.eq(q.field("recordType"), recordType))
      .filter(q => q.eq(q.field("recordId"), recordId))
      .first();

    if (!certification) {
      return null;
    }

    const certifier = await ctx.db.get(certification.certifiedBy);

    return {
      ...certification,
      certifier,
    };
  },
});

/**
 * Check if records are locked for a course
 */
export const getRecordLocks = query({
  args: {
    courseId: v.id("courses"),
    period: v.optional(
      v.union(
        v.literal("PRIMER_SEMESTRE"),
        v.literal("SEGUNDO_SEMESTRE"),
        v.literal("ANUAL"),
      ),
    ),
  },
  handler: async (ctx, { courseId, period }) => {
    let locks = await ctx.db
      .query("recordLocks")
      .withIndex("by_courseId")
      .filter(q => q.eq(q.field("courseId"), courseId))
      .filter(q => q.eq(q.field("isLocked"), true))
      .collect();

    if (period) {
      locks = locks.filter((l) => l.period === period);
    }

    const locksWithDetails = await Promise.all(
      locks.map(async (lock) => {
        const lockedBy = await ctx.db.get(lock.lockedBy);
        const unlockedBy = lock.unlockedBy
          ? await ctx.db.get(lock.unlockedBy)
          : null;

        return {
          ...lock,
          lockedByUser: lockedBy,
          unlockedByUser: unlockedBy,
        };
      }),
    );

    return locksWithDetails;
  },
});

/**
 * Get all uncertified signatures for admin review
 */
export const getUncertifiedSignatures = query({
  args: {
    recordType: v.optional(
      v.union(
        v.literal("CLASS_CONTENT"),
        v.literal("ATTENDANCE"),
        v.literal("OBSERVATION"),
        v.literal("GRADE"),
        v.literal("MEETING"),
        v.literal("PARENT_MEETING"),
      ),
    ),
  },
  handler: async (ctx, { recordType }) => {
    let signatures = await ctx.db
      .query("digitalSignatures")
      .filter(q => q.eq(q.field("isCertified"), false))
      .collect();

    if (recordType) {
      signatures = signatures.filter((s) => s.recordType === recordType);
    }

    // Get signer info
    const signaturesWithDetails = await Promise.all(
      signatures.map(async (sig) => {
        const signer = await ctx.db.get(sig.signedBy);
        return {
          ...sig,
          signer,
        };
      }),
    );

    return signaturesWithDetails.sort((a, b) => (b as any).createdAt - (a as any).createdAt);
  },
});

/**
 * Get unsigned records for a course
 */
export const getUnsignedRecords = query({
  args: {
    courseId: v.id("courses"),
    recordType: v.optional(
      v.union(
        v.literal("CLASS_CONTENT"),
        v.literal("ATTENDANCE"),
        v.literal("OBSERVATION"),
        v.literal("GRADE"),
      ),
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { courseId, recordType, startDate, endDate }) => {
    const unsigned: any[] = [];

    // Check class content
    if (!recordType || recordType === "CLASS_CONTENT") {
      let classContent = await ctx.db
        .query("classContent")
        .withIndex("by_courseId")
        .filter(q => q.eq(q.field("courseId"), courseId))
        .filter(q => q.eq(q.field("isSigned"), false))
        .collect();

      if (startDate) {
        classContent = classContent.filter((c) => c.date >= startDate);
      }
      if (endDate) {
        classContent = classContent.filter((c) => c.date <= endDate);
      }

      unsigned.push(
        ...classContent.map((c) => ({
          type: "CLASS_CONTENT" as const,
          id: c._id,
          date: c.date,
          subject: c.subject,
          record: c,
        })),
      );
    }

    // Check attendance - we need to check if dates have been signed
    // This is more complex as attendance is per student per date
    // For now, we'll check if there are any attendance records without signatures
    if (!recordType || recordType === "ATTENDANCE") {
      // Get unique dates with attendance
      const attendanceDates = await ctx.db
        .query("classAttendance")
        .filter(q => q.eq(q.field("courseId"), courseId))
        .collect();

      const uniqueDates = new Set(attendanceDates.map((a) => a.date));

      // Check which dates don't have signatures
      for (const date of Array.from(uniqueDates)) {
        if (startDate && date < startDate) continue;
        if (endDate && date > endDate) continue;

        const signature = await ctx.db
          .query("digitalSignatures")
          .withIndex("by_recordType_recordId")
          .filter(q => q.eq(q.field("recordType"), "ATTENDANCE"))
          .filter(q => q.eq(q.field("recordId"), `${courseId}-${date}`))
          .first();

        if (!signature) {
          unsigned.push({
            type: "ATTENDANCE" as const,
            id: `${courseId}-${date}`,
            date,
            subject: "Asistencia",
            record: null,
          });
        }
      }
    }

    return unsigned.sort((a, b) => b.date - a.date);
  },
});

// ==================== MUTATIONS ====================

/**
 * Create a digital signature for a record
 */
export const createSignature = mutation({
  args: {
    recordType: v.union(
      v.literal("CLASS_CONTENT"),
      v.literal("ATTENDANCE"),
      v.literal("OBSERVATION"),
      v.literal("GRADE"),
      v.literal("MEETING"),
      v.literal("PARENT_MEETING"),
    ),
    recordId: v.string(),
    signatureData: v.string(), // Hash, biometric data, or signature
    signatureMethod: v.union(
      v.literal("ELECTRONIC"),
      v.literal("BIOMETRIC"),
      v.literal("DIGITAL_CERTIFICATE"),
    ),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    signedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Validate user is teacher or admin
    const user = await ctx.db.get(args.signedBy);
    if (!user) {
      throw new Error("User not found");
    }

    if (
      user.role !== "PROFESOR" &&
      user.role !== "ADMIN" &&
      user.role !== "MASTER"
    ) {
      throw new Error("Only teachers and administrators can sign records");
    }

    // Check if signature already exists
    const existing = await ctx.db
      .query("digitalSignatures")
      .withIndex("by_recordType_recordId")
      .filter(q => q.eq(q.field("recordType"), args.recordType))
      .filter(q => q.eq(q.field("recordId"), args.recordId))
      .first();

    if (existing) {
      throw new Error("Record already has a signature");
    }

    // Check if record is locked
    if (
      args.recordType === "CLASS_CONTENT" ||
      args.recordType === "ATTENDANCE"
    ) {
      // Extract courseId from recordId (format depends on record type)
      let courseId: Id<"courses"> | null = null;

      if (args.recordType === "CLASS_CONTENT") {
        const classContent = await ctx.db.get(
          args.recordId as Id<"classContent">,
        );
        if (classContent) {
          courseId = classContent.courseId;
        }
      } else if (args.recordType === "ATTENDANCE") {
        // RecordId format: courseId-date
        const parts = args.recordId.split("-");
        if (parts.length >= 2) {
          courseId = parts[0] as Id<"courses">;
        }
      }

      if (courseId) {
        const locks = await ctx.db
          .query("recordLocks")
          .withIndex("by_courseId")
          .filter(q => q.eq(q.field("courseId"), courseId!))
          .filter(q => q.eq(q.field("isLocked"), true))
          .collect();

        const relevantLock = locks.find(
          (l) => l.recordType === args.recordType || l.recordType === "ALL",
        );

        if (relevantLock) {
          throw new Error(
            "Records are locked for this period and cannot be signed",
          );
        }
      }
    }

    const now = Date.now();

    // Get institutionId from user or record
    let institutionId: Id<"institutionInfo"> | null =
      user.currentInstitutionId ?? null;

    // If user doesn't have currentInstitutionId, try to get from the record
    if (!institutionId) {
      if (args.recordType === "CLASS_CONTENT") {
        const classContent = await ctx.db.get(
          args.recordId as Id<"classContent">,
        );
        if (classContent) {
          institutionId = classContent.institutionId ?? null;
        }
      } else if (
        args.recordType === "ATTENDANCE" ||
        args.recordType === "GRADE"
      ) {
        // For attendance and grades, we might need to get from course
        // Try to extract courseId from recordId if possible
        const courseId = args.recordId.split("-")[0] as Id<"courses">;
        const course = await ctx.db.get(courseId);
        if (course) {
          institutionId = course.institutionId ?? null;
        }
      }
    }

    if (!institutionId) {
      throw new Error("Cannot determine institution for signature");
    }

    const signatureId = await ctx.db.insert("digitalSignatures", {
      institutionId,
      recordType: args.recordType,
      recordId: args.recordId,
      signedBy: args.signedBy,
      signatureData: args.signatureData,
      signatureMethod: args.signatureMethod,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      isCertified: false,
      createdAt: now,
    });

    // Update the record itself to mark as signed (if applicable)
    if (args.recordType === "CLASS_CONTENT") {
      const classContent = await ctx.db.get(
        args.recordId as Id<"classContent">,
      );
      if (classContent) {
        await ctx.db.patch(args.recordId as Id<"classContent">, {
          isSigned: true,
          signedAt: now,
          updatedAt: now,
        });
      }
    }

    return signatureId;
  },
});

/**
 * Certify a signature (admin/director action)
 */
export const certifySignature = mutation({
  args: {
    signatureId: v.id("digitalSignatures"),
    certifiedBy: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { signatureId, certifiedBy, notes }) => {
    // Validate certifier is admin
    const certifier = await ctx.db.get(certifiedBy);
    if (!certifier) {
      throw new Error("Certifier not found");
    }

    if (certifier.role !== "ADMIN" && certifier.role !== "MASTER") {
      throw new Error("Only administrators can certify signatures");
    }

    const signature = await ctx.db.get(signatureId);
    if (!signature) {
      throw new Error("Signature not found");
    }

    if (signature.isCertified) {
      throw new Error("Signature is already certified");
    }

    await ctx.db.patch(signatureId, {
      isCertified: true,
      certifiedBy,
      certifiedAt: Date.now(),
      notes,
    });

    return await ctx.db.get(signatureId);
  },
});

/**
 * Create a record certification
 */
export const createCertification = mutation({
  args: {
    recordType: v.union(
      v.literal("CLASS_CONTENT"),
      v.literal("ATTENDANCE"),
      v.literal("OBSERVATION"),
      v.literal("GRADE"),
      v.literal("MEETING"),
      v.literal("PARENT_MEETING"),
      v.literal("PERIOD"),
    ),
    recordId: v.string(),
    period: v.optional(
      v.union(
        v.literal("PRIMER_SEMESTRE"),
        v.literal("SEGUNDO_SEMESTRE"),
        v.literal("ANUAL"),
      ),
    ),
    certifiedBy: v.id("users"),
    certificationType: v.union(
      v.literal("DAILY"),
      v.literal("WEEKLY"),
      v.literal("MONTHLY"),
      v.literal("PERIOD_CLOSURE"),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate certifier is admin
    const certifier = await ctx.db.get(args.certifiedBy);
    if (!certifier) {
      throw new Error("Certifier not found");
    }

    if (certifier.role !== "ADMIN" && certifier.role !== "MASTER") {
      throw new Error("Only administrators can create certifications");
    }

    const now = Date.now();

    // Get institutionId from certifier or record
    let institutionId: Id<"institutionInfo"> | null =
      certifier.currentInstitutionId ?? null;

    if (!institutionId) {
      // Try to get from the record based on type
      if (args.recordType === "CLASS_CONTENT") {
        const classContent = await ctx.db.get(
          args.recordId as Id<"classContent">,
        );
        if (classContent) {
          institutionId = classContent.institutionId ?? null;
        }
      } else if (
        args.recordType === "ATTENDANCE" ||
        args.recordType === "GRADE"
      ) {
        const courseId = args.recordId.split("-")[0] as Id<"courses">;
        const course = await ctx.db.get(courseId);
        if (course) {
          institutionId = course.institutionId ?? null;
        }
      }
    }

    if (!institutionId) {
      throw new Error("Cannot determine institution for certification");
    }

    return await ctx.db.insert("recordCertifications", {
      institutionId,
      recordType: args.recordType,
      recordId: args.recordId,
      period: args.period,
      certifiedBy: args.certifiedBy,
      certificationDate: now,
      certificationType: args.certificationType,
      status: "CERTIFIED",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Lock records for a course and period
 */
export const lockRecords = mutation({
  args: {
    courseId: v.id("courses"),
    period: v.union(
      v.literal("PRIMER_SEMESTRE"),
      v.literal("SEGUNDO_SEMESTRE"),
      v.literal("ANUAL"),
    ),
    recordType: v.union(
      v.literal("ATTENDANCE"),
      v.literal("GRADE"),
      v.literal("CLASS_CONTENT"),
      v.literal("ALL"),
    ),
    lockedBy: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate locker is admin
    const locker = await ctx.db.get(args.lockedBy);
    if (!locker) {
      throw new Error("User not found");
    }

    if (locker.role !== "ADMIN" && locker.role !== "MASTER") {
      throw new Error("Only administrators can lock records");
    }

    // Check if lock already exists
    const existingLock = await ctx.db
      .query("recordLocks")
      .withIndex("by_courseId_period")
      .filter(q => q.eq(q.field("courseId"), args.courseId))
      .filter(q => q.eq(q.field("period"), args.period))
      .filter(q =>
        q.or(
          q.eq(q.field("recordType"), args.recordType),
          q.eq(q.field("recordType"), "ALL"),
        ),
      )
      .filter(q => q.eq(q.field("isLocked"), true))
      .first();

    if (existingLock) {
      throw new Error("Records are already locked for this period");
    }

    // Get institutionId from course
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const now = Date.now();

    return await ctx.db.insert("recordLocks", {
      institutionId: course.institutionId,
      courseId: args.courseId,
      period: args.period,
      recordType: args.recordType,
      lockedBy: args.lockedBy,
      lockedAt: now,
      reason: args.reason,
      isLocked: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Unlock records for a course and period
 */
export const unlockRecords = mutation({
  args: {
    lockId: v.id("recordLocks"),
    unlockedBy: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { lockId, unlockedBy, reason }) => {
    // Validate unlocker is admin
    const unlocker = await ctx.db.get(unlockedBy);
    if (!unlocker) {
      throw new Error("User not found");
    }

    if (unlocker.role !== "ADMIN" && unlocker.role !== "MASTER") {
      throw new Error("Only administrators can unlock records");
    }

    const lock = await ctx.db.get(lockId);
    if (!lock) {
      throw new Error("Lock not found");
    }

    if (!lock.isLocked) {
      throw new Error("Records are already unlocked");
    }

    await ctx.db.patch(lockId, {
      isLocked: false,
      unlockedBy,
      unlockedAt: Date.now(),
      updatedAt: Date.now(),
      // Keep reason for audit trail, but can also update it
    });

    return await ctx.db.get(lockId);
  },
});
