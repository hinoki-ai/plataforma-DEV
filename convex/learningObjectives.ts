/**
 * Learning Objectives (OA) and Evaluation Indicators Management
 * Chilean Educational System - Decreto 67 Compliance
 * Manages Objetivos de Aprendizaje (OA) and Indicadores de Evaluación
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ==================== QUERIES ====================

/**
 * Get learning objectives by subject, level, and grade
 */
export const getLearningObjectives = query({
  args: {
    subject: v.optional(v.string()),
    level: v.optional(v.string()),
    grade: v.optional(v.string()),
    semester: v.optional(
      v.union(
        v.literal("PRIMER_SEMESTRE"),
        v.literal("SEGUNDO_SEMESTRE"),
        v.literal("ANUAL"),
      ),
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let objectives;

    // Use the most selective index
    if (args.subject && args.level && args.grade) {
      objectives = await ctx.db
        .query("learningObjectives")
        .withIndex("by_subject_level", (q) =>
          q
            .eq("subject", args.subject!)
            .eq("level", args.level!)
            .eq("grade", args.grade!),
        )
        .collect();
    } else if (args.subject) {
      objectives = await ctx.db
        .query("learningObjectives")
        .withIndex("by_subject", (q) => q.eq("subject", args.subject!))
        .collect();
    } else if (args.level) {
      objectives = await ctx.db
        .query("learningObjectives")
        .withIndex("by_level", (q) => q.eq("level", args.level!))
        .collect();
    } else {
      objectives = await ctx.db.query("learningObjectives").collect();
    }

    // Filter by semester if provided
    if (args.semester) {
      objectives = objectives.filter((o) => o.semester === args.semester);
    }

    // Filter by active status if provided
    if (args.isActive !== undefined) {
      objectives = objectives.filter((o) => o.isActive === args.isActive);
    }

    // Get evaluation indicators for each objective
    const objectivesWithIndicators = await Promise.all(
      objectives.map(async (obj) => {
        const indicators = await ctx.db
          .query("evaluationIndicators")
          .withIndex("by_learningObjectiveId", (q) =>
            q.eq("learningObjectiveId", obj._id),
          )
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        return {
          ...obj,
          indicators,
        };
      }),
    );

    return objectivesWithIndicators.sort((a, b) =>
      a.code.localeCompare(b.code),
    );
  },
});

/**
 * Get a single learning objective with its indicators
 */
export const getLearningObjectiveById = query({
  args: { objectiveId: v.id("learningObjectives") },
  handler: async (ctx, { objectiveId }) => {
    const objective = await ctx.db.get(objectiveId);
    if (!objective) {
      throw new Error("Learning objective not found");
    }

    const indicators = await ctx.db
      .query("evaluationIndicators")
      .withIndex("by_learningObjectiveId", (q) =>
        q.eq("learningObjectiveId", objectiveId),
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return {
      ...objective,
      indicators,
    };
  },
});

/**
 * Get evaluation indicators for a learning objective
 */
export const getEvaluationIndicators = query({
  args: {
    learningObjectiveId: v.id("learningObjectives"),
    level: v.optional(
      v.union(
        v.literal("INICIAL"),
        v.literal("BASICO"),
        v.literal("INTERMEDIO"),
        v.literal("AVANZADO"),
      ),
    ),
  },
  handler: async (ctx, { learningObjectiveId, level }) => {
    let indicators = await ctx.db
      .query("evaluationIndicators")
      .withIndex("by_learningObjectiveId", (q) =>
        q.eq("learningObjectiveId", learningObjectiveId),
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter by level if provided
    if (level) {
      indicators = indicators.filter((i) => i.level === level);
    }

    return indicators.sort((a, b) => a.code.localeCompare(b.code));
  },
});

/**
 * Get curriculum coverage for a course and subject
 */
export const getCurriculumCoverage = query({
  args: {
    courseId: v.id("courses"),
    subject: v.optional(v.string()),
    period: v.optional(
      v.union(
        v.literal("PRIMER_SEMESTRE"),
        v.literal("SEGUNDO_SEMESTRE"),
        v.literal("ANUAL"),
      ),
    ),
  },
  handler: async (ctx, { courseId, subject, period }) => {
    const course = await ctx.db.get(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    let coverage = await ctx.db
      .query("curriculumCoverage")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    // Filter by subject if provided
    if (subject) {
      coverage = coverage.filter((c) => c.subject === subject);
    }

    // Filter by period if provided
    if (period) {
      coverage = coverage.filter((c) => c.period === period);
    }

    // Get learning objective details for each coverage entry
    const coverageWithDetails = await Promise.all(
      coverage.map(async (c) => {
        const objective = await ctx.db.get(c.learningObjectiveId);
        return {
          ...c,
          objective,
        };
      }),
    );

    return coverageWithDetails;
  },
});

/**
 * Get OA linked to a class content entry
 */
export const getClassContentOA = query({
  args: { classContentId: v.id("classContent") },
  handler: async (ctx, { classContentId }) => {
    const links = await ctx.db
      .query("classContentOA")
      .withIndex("by_classContentId", (q) =>
        q.eq("classContentId", classContentId),
      )
      .collect();

    const linksWithDetails = await Promise.all(
      links.map(async (link) => {
        const objective = await ctx.db.get(link.learningObjectiveId);
        const indicators = link.evaluationIndicatorIds
          ? await Promise.all(
              link.evaluationIndicatorIds.map((id) => ctx.db.get(id)),
            )
          : [];

        return {
          ...link,
          objective,
          indicators: indicators.filter((i) => i !== null),
        };
      }),
    );

    return linksWithDetails;
  },
});

/**
 * Get coverage statistics for a course
 */
export const getCoverageStatistics = query({
  args: {
    courseId: v.id("courses"),
    subject: v.optional(v.string()),
    period: v.optional(
      v.union(
        v.literal("PRIMER_SEMESTRE"),
        v.literal("SEGUNDO_SEMESTRE"),
        v.literal("ANUAL"),
      ),
    ),
  },
  handler: async (ctx, { courseId, subject, period }) => {
    const course = await ctx.db.get(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Get all objectives for the course's subjects and level
    const subjectsToCheck = subject ? [subject] : course.subjects;

    let allObjectives: any[] = [];
    for (const subj of subjectsToCheck) {
      // Get objectives matching subject, level, and grade
      const allObjectivesForSubject = await ctx.db
        .query("learningObjectives")
        .withIndex("by_subject", (q) => q.eq("subject", subj))
        .filter((q) =>
          q.and(
            q.eq(q.field("level"), course.level),
            q.eq(q.field("grade"), course.grade),
            q.eq(q.field("isActive"), true),
          ),
        )
        .collect();

      const objectives = allObjectivesForSubject;

      // Filter by period if provided
      if (period) {
        allObjectives.push(
          ...objectives.filter(
            (o) => o.semester === period || o.semester === "ANUAL",
          ),
        );
      } else {
        allObjectives.push(...objectives);
      }
    }

    // Get coverage records
    let coverage = await ctx.db
      .query("curriculumCoverage")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    if (subject) {
      coverage = coverage.filter((c) => c.subject === subject);
    }

    if (period) {
      coverage = coverage.filter((c) => c.period === period);
    }

    const coverageMap = new Map(
      coverage.map((c) => [c.learningObjectiveId, c]),
    );

    // Calculate statistics
    const total = allObjectives.length;
    const noIniciado = allObjectives.filter(
      (o) =>
        !coverageMap.has(o._id) ||
        coverageMap.get(o._id)!.coverageStatus === "NO_INICIADO",
    ).length;
    const enProgreso = allObjectives.filter(
      (o) =>
        coverageMap.has(o._id) &&
        coverageMap.get(o._id)!.coverageStatus === "EN_PROGRESO",
    ).length;
    const cubierto = allObjectives.filter(
      (o) =>
        coverageMap.has(o._id) &&
        coverageMap.get(o._id)!.coverageStatus === "CUBIERTO",
    ).length;
    const reforzado = allObjectives.filter(
      (o) =>
        coverageMap.has(o._id) &&
        coverageMap.get(o._id)!.coverageStatus === "REFORZADO",
    ).length;

    const percentage = total > 0 ? ((cubierto + reforzado) / total) * 100 : 0;

    return {
      total,
      noIniciado,
      enProgreso,
      cubierto,
      reforzado,
      percentage: Math.round(percentage * 100) / 100,
      objectives: allObjectives.map((o) => ({
        ...o,
        coverage: coverageMap.get(o._id) || null,
      })),
    };
  },
});

// ==================== MUTATIONS ====================

/**
 * Create a new learning objective
 */
export const createLearningObjective = mutation({
  args: {
    code: v.string(),
    subject: v.string(),
    level: v.string(),
    grade: v.string(),
    description: v.string(),
    unit: v.optional(v.string()),
    semester: v.union(
      v.literal("PRIMER_SEMESTRE"),
      v.literal("SEGUNDO_SEMESTRE"),
      v.literal("ANUAL"),
    ),
  },
  handler: async (ctx, args) => {
    // Check if code already exists
    const existing = await ctx.db
      .query("learningObjectives")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existing) {
      throw new Error(
        `Learning objective with code ${args.code} already exists`,
      );
    }

    // Get user from auth to get institutionId
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || !user.currentInstitutionId) {
      throw new Error("User must have a current institution");
    }

    const now = Date.now();

    return await ctx.db.insert("learningObjectives", {
      institutionId: user.currentInstitutionId,
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update a learning objective
 */
export const updateLearningObjective = mutation({
  args: {
    objectiveId: v.id("learningObjectives"),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    unit: v.optional(v.string()),
    semester: v.optional(
      v.union(
        v.literal("PRIMER_SEMESTRE"),
        v.literal("SEGUNDO_SEMESTRE"),
        v.literal("ANUAL"),
      ),
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { objectiveId, ...updates }) => {
    const objective = await ctx.db.get(objectiveId);
    if (!objective) {
      throw new Error("Learning objective not found");
    }

    // Check code uniqueness if updating code
    if (updates.code && updates.code !== objective.code) {
      const existing = await ctx.db
        .query("learningObjectives")
        .withIndex("by_code", (q) => q.eq("code", updates.code!))
        .first();

      if (existing) {
        throw new Error(
          `Learning objective with code ${updates.code} already exists`,
        );
      }
    }

    await ctx.db.patch(objectiveId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(objectiveId);
  },
});

/**
 * Create an evaluation indicator
 */
export const createEvaluationIndicator = mutation({
  args: {
    learningObjectiveId: v.id("learningObjectives"),
    code: v.string(),
    description: v.string(),
    evaluationCriteria: v.optional(v.string()),
    level: v.union(
      v.literal("INICIAL"),
      v.literal("BASICO"),
      v.literal("INTERMEDIO"),
      v.literal("AVANZADO"),
    ),
  },
  handler: async (ctx, args) => {
    // Validate learning objective exists
    const objective = await ctx.db.get(args.learningObjectiveId);
    if (!objective) {
      throw new Error("Learning objective not found");
    }

    // Check if code already exists for this objective
    const existing = await ctx.db
      .query("evaluationIndicators")
      .withIndex("by_learningObjectiveId", (q) =>
        q.eq("learningObjectiveId", args.learningObjectiveId),
      )
      .filter((q) => q.eq(q.field("code"), args.code))
      .first();

    if (existing) {
      throw new Error(
        `Evaluation indicator with code ${args.code} already exists for this objective`,
      );
    }

    const now = Date.now();

    return await ctx.db.insert("evaluationIndicators", {
      institutionId: objective.institutionId,
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an evaluation indicator
 */
export const updateEvaluationIndicator = mutation({
  args: {
    indicatorId: v.id("evaluationIndicators"),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    evaluationCriteria: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal("INICIAL"),
        v.literal("BASICO"),
        v.literal("INTERMEDIO"),
        v.literal("AVANZADO"),
      ),
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { indicatorId, ...updates }) => {
    const indicator = await ctx.db.get(indicatorId);
    if (!indicator) {
      throw new Error("Evaluation indicator not found");
    }

    // Check code uniqueness if updating code
    if (updates.code && updates.code !== indicator.code) {
      const existing = await ctx.db
        .query("evaluationIndicators")
        .withIndex("by_learningObjectiveId", (q) =>
          q.eq("learningObjectiveId", indicator.learningObjectiveId),
        )
        .filter((q) => q.eq(q.field("code"), updates.code!))
        .first();

      if (existing) {
        throw new Error(
          `Evaluation indicator with code ${updates.code} already exists for this objective`,
        );
      }
    }

    await ctx.db.patch(indicatorId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(indicatorId);
  },
});

/**
 * Link OA and indicators to class content
 */
export const linkClassContentToOA = mutation({
  args: {
    classContentId: v.id("classContent"),
    learningObjectiveId: v.id("learningObjectives"),
    evaluationIndicatorIds: v.optional(v.array(v.id("evaluationIndicators"))),
    coverage: v.optional(v.union(v.literal("PARCIAL"), v.literal("COMPLETA"))),
  },
  handler: async (ctx, args) => {
    // Validate class content exists
    const classContent = await ctx.db.get(args.classContentId);
    if (!classContent) {
      throw new Error("Class content not found");
    }

    // Validate learning objective exists
    const objective = await ctx.db.get(args.learningObjectiveId);
    if (!objective) {
      throw new Error("Learning objective not found");
    }

    // Validate indicators if provided
    if (args.evaluationIndicatorIds) {
      for (const indicatorId of args.evaluationIndicatorIds) {
        const indicator = await ctx.db.get(indicatorId);
        if (!indicator) {
          throw new Error(`Evaluation indicator ${indicatorId} not found`);
        }
        if (indicator.learningObjectiveId !== args.learningObjectiveId) {
          throw new Error(
            `Indicator ${indicatorId} does not belong to the specified objective`,
          );
        }
      }
    }

    const now = Date.now();

    // Create link
    const linkId = await ctx.db.insert("classContentOA", {
      institutionId: classContent.institutionId,
      classContentId: args.classContentId,
      learningObjectiveId: args.learningObjectiveId,
      evaluationIndicatorIds: args.evaluationIndicatorIds,
      coverage: args.coverage,
      createdAt: now,
    });

    // Update curriculum coverage
    const course = await ctx.db.get(classContent.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Get or create coverage record
    let coverage = await ctx.db
      .query("curriculumCoverage")
      .withIndex("by_courseId_subject", (q) =>
        q
          .eq("courseId", classContent.courseId)
          .eq("subject", classContent.subject),
      )
      .filter((q) =>
        q.eq(q.field("learningObjectiveId"), args.learningObjectiveId),
      )
      .first();

    const period =
      classContent.period === "PRIMER_SEMESTRE" ||
      classContent.period === "SEGUNDO_SEMESTRE"
        ? classContent.period
        : "ANUAL";

    if (coverage) {
      // Update existing coverage
      const timesCovered = coverage.timesCovered + 1;
      let coverageStatus = coverage.coverageStatus;

      if (coverageStatus === "NO_INICIADO") {
        coverageStatus = "EN_PROGRESO";
      } else if (timesCovered >= 2) {
        coverageStatus = "CUBIERTO";
      }
      if (timesCovered >= 3) {
        coverageStatus = "REFORZADO";
      }

      await ctx.db.patch(coverage._id, {
        lastCoveredDate: classContent.date,
        timesCovered,
        coverageStatus,
        updatedAt: now,
      });
    } else {
      // Create new coverage record
      await ctx.db.insert("curriculumCoverage", {
        institutionId: classContent.institutionId,
        courseId: classContent.courseId,
        subject: classContent.subject,
        learningObjectiveId: args.learningObjectiveId,
        firstCoveredDate: classContent.date,
        lastCoveredDate: classContent.date,
        timesCovered: 1,
        coverageStatus: "EN_PROGRESO",
        period,
        updatedAt: now,
      });
    }

    return linkId;
  },
});

/**
 * Remove OA link from class content
 */
export const unlinkClassContentFromOA = mutation({
  args: {
    linkId: v.id("classContentOA"),
  },
  handler: async (ctx, { linkId }) => {
    const link = await ctx.db.get(linkId);
    if (!link) {
      throw new Error("Link not found");
    }

    await ctx.db.delete(linkId);

    // Note: We don't automatically update curriculum coverage here
    // as removing a link doesn't necessarily mean the OA wasn't covered
    // in that class (it might have been covered in other ways)

    return { success: true };
  },
});

/**
 * Update curriculum coverage status manually
 */
export const updateCurriculumCoverage = mutation({
  args: {
    coverageId: v.id("curriculumCoverage"),
    coverageStatus: v.union(
      v.literal("NO_INICIADO"),
      v.literal("EN_PROGRESO"),
      v.literal("CUBIERTO"),
      v.literal("REFORZADO"),
    ),
  },
  handler: async (ctx, { coverageId, coverageStatus }) => {
    const coverage = await ctx.db.get(coverageId);
    if (!coverage) {
      throw new Error("Curriculum coverage not found");
    }

    await ctx.db.patch(coverageId, {
      coverageStatus,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(coverageId);
  },
});
