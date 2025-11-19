/**
 * Learning Objectives (OA) and Evaluation Indicators Management
 * Chilean Educational System - Decreto 67 Compliance
 * Manages Objetivos de Aprendizaje (OA) and Indicadores de Evaluación
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { tenantQuery, tenantMutation } from "./tenancy";
import { Id, Doc } from "./_generated/dataModel";
import {
  SEMESTER_SCHEMA,
  EVALUATION_LEVEL_SCHEMA,
  COVERAGE_STATUS_SCHEMA,
  COVERAGE_TYPE_SCHEMA,
} from "./constants";
import { now } from "./validation";

// ==================== QUERIES ====================

/**
 * Get learning objectives by subject, level, and grade
 */
export const getLearningObjectives = tenantQuery({
  args: {
    subject: v.optional(v.string()),
    level: v.optional(v.string()),
    grade: v.optional(v.string()),
    semester: v.optional(SEMESTER_SCHEMA),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args, tenancy) => {
    let objectives;

    // Use the most selective index
    if (args.subject && args.level && args.grade) {
      objectives = await ctx.db
        .query("learningObjectives")
        .withIndex("by_subject_level", (q: any) =>
          q
            .eq("subject", args.subject!)
            .eq("level", args.level!)
            .eq("grade", args.grade!)
            .eq("institutionId", tenancy.institution._id),
        )
        .collect();
    } else if (args.subject) {
      objectives = await ctx.db
        .query("learningObjectives")
        .withIndex("by_subject", (q: any) =>
          q
            .eq("subject", args.subject!)
            .eq("institutionId", tenancy.institution._id),
        )
        .collect();
    } else if (args.level) {
      objectives = await ctx.db
        .query("learningObjectives")
        .withIndex("by_level", (q: any) =>
          q
            .eq("level", args.level!)
            .eq("institutionId", tenancy.institution._id),
        )
        .collect();
    } else {
      objectives = await ctx.db
        .query("learningObjectives")
        .withIndex("by_institutionId", (q: any) =>
          q.eq("institutionId", tenancy.institution._id),
        )
        .collect();
    }

    // Filter by semester if provided
    if (args.semester) {
      objectives = objectives.filter(
        (o: Doc<"learningObjectives">) => o.semester === args.semester,
      );
    }

    // Filter by active status if provided
    if (args.isActive !== undefined) {
      objectives = objectives.filter(
        (o: Doc<"learningObjectives">) => o.isActive === args.isActive,
      );
    }

    // Get evaluation indicators for each objective
    const objectivesWithIndicators = await Promise.all(
      objectives.map(async (obj: Doc<"learningObjectives">) => {
        const indicators = await ctx.db
          .query("evaluationIndicators")
          .withIndex("by_learningObjectiveId", (q: any) =>
            q.eq("learningObjectiveId", obj._id),
          )
          .filter((q: any) => q.eq(q.field("isActive"), true))
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
export const getLearningObjectiveById = tenantQuery({
  args: { objectiveId: v.id("learningObjectives") },
  handler: async (ctx, { objectiveId }, tenancy) => {
    const objective = await ctx.db.get(objectiveId);
    if (!objective || objective.institutionId !== tenancy.institution._id) {
      throw new Error("Learning objective not found");
    }

    const indicators = await ctx.db
      .query("evaluationIndicators")
      .withIndex("by_learningObjectiveId", (q: any) =>
        q
          .eq("learningObjectiveId", objectiveId)
          .eq("institutionId", tenancy.institution._id),
      )
      .filter((q: any) => q.eq(q.field("isActive"), true))
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
export const getEvaluationIndicators = tenantQuery({
  args: {
    learningObjectiveId: v.id("learningObjectives"),
    level: v.optional(EVALUATION_LEVEL_SCHEMA),
  },
  handler: async (ctx, { learningObjectiveId, level }, tenancy) => {
    let indicators = await ctx.db
      .query("evaluationIndicators")
      .withIndex("by_learningObjectiveId", (q: any) =>
        q
          .eq("learningObjectiveId", learningObjectiveId)
          .eq("institutionId", tenancy.institution._id),
      )
      .filter((q: any) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter by level if provided
    if (level) {
      indicators = indicators.filter(
        (i: Doc<"evaluationIndicators">) => i.level === level,
      );
    }

    return indicators.sort(
      (a: Doc<"evaluationIndicators">, b: Doc<"evaluationIndicators">) =>
        a.code.localeCompare(b.code),
    );
  },
});

/**
 * Get curriculum coverage for a course and subject
 */
export const getCurriculumCoverage = tenantQuery({
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
  handler: async (ctx, { courseId, subject, period }, tenancy) => {
    const course = await ctx.db.get(courseId);
    if (!course || course.institutionId !== tenancy.institution._id) {
      throw new Error("Course not found");
    }

    let coverage = await ctx.db
      .query("curriculumCoverage")
      .withIndex("by_courseId", (q: any) =>
        q.eq("courseId", courseId).eq("institutionId", tenancy.institution._id),
      )
      .collect();

    // Filter by subject if provided
    if (subject) {
      coverage = coverage.filter(
        (c: Doc<"curriculumCoverage">) => c.subject === subject,
      );
    }

    // Filter by period if provided
    if (period) {
      coverage = coverage.filter(
        (c: Doc<"curriculumCoverage">) => c.period === period,
      );
    }

    // Get learning objective details for each coverage entry
    const coverageWithDetails = await Promise.all(
      coverage.map(async (c: Doc<"curriculumCoverage">) => {
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
export const getClassContentOA = tenantQuery({
  args: { classContentId: v.id("classContent") },
  handler: async (ctx, { classContentId }, tenancy) => {
    const links = await ctx.db
      .query("classContentOA")
      .withIndex("by_classContentId", (q: any) =>
        q
          .eq("classContentId", classContentId)
          .eq("institutionId", tenancy.institution._id),
      )
      .collect();

    const linksWithDetails = await Promise.all(
      links.map(async (link: Doc<"classContentOA">) => {
        const objective = await ctx.db.get(link.learningObjectiveId);
        const indicators = link.evaluationIndicatorIds
          ? await Promise.all(
              link.evaluationIndicatorIds.map(
                (id: Id<"evaluationIndicators">) => ctx.db.get(id),
              ),
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
export const getCoverageStatistics = tenantQuery({
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
  handler: async (ctx, { courseId, subject, period }, tenancy) => {
    // Ensure course belongs to the current institution
    const course = await ctx.db.get(courseId);
    if (!course || course.institutionId !== tenancy.institution._id) {
      throw new Error("Course not found");
    }

    // Get all objectives for the course's subjects and level
    const subjectsToCheck = subject ? [subject] : course.subjects;

    let allObjectives: any[] = [];
    for (const subj of subjectsToCheck) {
      // Get objectives matching subject, level, grade, and institution
      const allObjectivesForSubject = await ctx.db
        .query("learningObjectives")
        .withIndex("by_subject_level", (q: any) =>
          q
            .eq("subject", subj)
            .eq("level", course.level)
            .eq("grade", course.grade)
            .eq("institutionId", tenancy.institution._id),
        )
        .filter((q: any) => q.eq(q.field("isActive"), true))
        .collect();

      const objectives = allObjectivesForSubject;

      // Filter by period if provided
      if (period) {
        allObjectives.push(
          ...objectives.filter(
            (o: Doc<"learningObjectives">) =>
              o.semester === period || o.semester === "ANUAL",
          ),
        );
      } else {
        allObjectives.push(...objectives);
      }
    }

    // Get coverage records for this institution
    let coverage = await ctx.db
      .query("curriculumCoverage")
      .withIndex("by_courseId", (q: any) =>
        q.eq("courseId", courseId).eq("institutionId", tenancy.institution._id),
      )
      .collect();

    if (subject) {
      coverage = coverage.filter(
        (c: Doc<"curriculumCoverage">) => c.subject === subject,
      );
    }

    if (period) {
      coverage = coverage.filter(
        (c: Doc<"curriculumCoverage">) => c.period === period,
      );
    }

    const coverageMap = new Map<
      Id<"learningObjectives">,
      Doc<"curriculumCoverage">
    >(
      coverage.map((c: Doc<"curriculumCoverage">) => [
        c.learningObjectiveId,
        c,
      ]),
    );

    // Calculate statistics
    const total = allObjectives.length;
    const noIniciado = allObjectives.filter((o: Doc<"learningObjectives">) => {
      const coverage = coverageMap.get(o._id as Id<"learningObjectives">);
      return !coverage || coverage.coverageStatus === "NO_INICIADO";
    }).length;
    const enProgreso = allObjectives.filter((o: Doc<"learningObjectives">) => {
      const coverage = coverageMap.get(o._id as Id<"learningObjectives">);
      return coverage?.coverageStatus === "EN_PROGRESO";
    }).length;
    const cubierto = allObjectives.filter((o: Doc<"learningObjectives">) => {
      const coverage = coverageMap.get(o._id as Id<"learningObjectives">);
      return coverage?.coverageStatus === "CUBIERTO";
    }).length;
    const reforzado = allObjectives.filter((o: Doc<"learningObjectives">) => {
      const coverage = coverageMap.get(o._id as Id<"learningObjectives">);
      return coverage?.coverageStatus === "REFORZADO";
    }).length;

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
export const createLearningObjective = tenantMutation({
  args: {
    code: v.string(),
    subject: v.string(),
    level: v.string(),
    grade: v.string(),
    description: v.string(),
    unit: v.optional(v.string()),
    semester: SEMESTER_SCHEMA,
  },
  handler: async (ctx, args, tenancy) => {
    // Check if code already exists for this institution
    const existing = await ctx.db
      .query("learningObjectives")
      .withIndex("by_code", (q: any) =>
        q.eq("code", args.code).eq("institutionId", tenancy.institution._id),
      )
      .first();

    if (existing) {
      throw new Error(
        `Learning objective with code ${args.code} already exists`,
      );
    }

    const currentTime = now();

    return await ctx.db.insert("learningObjectives", {
      institutionId: tenancy.institution._id,
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
export const updateLearningObjective = tenantMutation({
  args: {
    objectiveId: v.id("learningObjectives"),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    unit: v.optional(v.string()),
    semester: v.optional(SEMESTER_SCHEMA),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { objectiveId, ...updates }, tenancy) => {
    const objective = await ctx.db.get(objectiveId);
    if (!objective || objective.institutionId !== tenancy.institution._id) {
      throw new Error("Learning objective not found");
    }

    // Check code uniqueness if updating code
    if (updates.code && updates.code !== objective.code) {
      const existing = await ctx.db
        .query("learningObjectives")
        .withIndex("by_code", (q: any) =>
          q
            .eq("code", updates.code!)
            .eq("institutionId", tenancy.institution._id),
        )
        .first();

      if (existing) {
        throw new Error(
          `Learning objective with code ${updates.code} already exists`,
        );
      }
    }

    await ctx.db.patch(objectiveId, {
      ...updates,
      updatedAt: now(),
    });

    return await ctx.db.get(objectiveId);
  },
});

/**
 * Create an evaluation indicator
 */
export const createEvaluationIndicator = tenantMutation({
  args: {
    learningObjectiveId: v.id("learningObjectives"),
    code: v.string(),
    description: v.string(),
    evaluationCriteria: v.optional(v.string()),
    level: EVALUATION_LEVEL_SCHEMA,
  },
  handler: async (ctx, args, tenancy) => {
    // Validate learning objective exists and belongs to institution
    const objective = await ctx.db.get(args.learningObjectiveId);
    if (!objective || objective.institutionId !== tenancy.institution._id) {
      throw new Error("Learning objective not found");
    }

    // Check if code already exists for this objective
    const existing = await ctx.db
      .query("evaluationIndicators")
      .withIndex("by_learningObjectiveId", (q: any) =>
        q
          .eq("learningObjectiveId", args.learningObjectiveId)
          .eq("institutionId", tenancy.institution._id),
      )
      .filter((q: any) => q.eq(q.field("code"), args.code))
      .first();

    if (existing) {
      throw new Error(
        `Evaluation indicator with code ${args.code} already exists for this objective`,
      );
    }

    const currentTime = now();

    return await ctx.db.insert("evaluationIndicators", {
      institutionId: tenancy.institution._id,
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
export const updateEvaluationIndicator = tenantMutation({
  args: {
    indicatorId: v.id("evaluationIndicators"),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    evaluationCriteria: v.optional(v.string()),
    level: v.optional(EVALUATION_LEVEL_SCHEMA),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { indicatorId, ...updates }, tenancy) => {
    const indicator = await ctx.db.get(indicatorId);
    if (!indicator || indicator.institutionId !== tenancy.institution._id) {
      throw new Error("Evaluation indicator not found");
    }

    // Check code uniqueness if updating code
    if (updates.code && updates.code !== indicator.code) {
      const existing = await ctx.db
        .query("evaluationIndicators")
        .withIndex("by_learningObjectiveId", (q: any) =>
          q
            .eq("learningObjectiveId", indicator.learningObjectiveId)
            .eq("institutionId", tenancy.institution._id),
        )
        .filter((q: any) => q.eq(q.field("code"), updates.code!))
        .first();

      if (existing) {
        throw new Error(
          `Evaluation indicator with code ${updates.code} already exists for this objective`,
        );
      }
    }

    await ctx.db.patch(indicatorId, {
      ...updates,
      updatedAt: now(),
    });

    return await ctx.db.get(indicatorId);
  },
});

/**
 * Link OA and indicators to class content
 */
export const linkClassContentToOA = tenantMutation({
  args: {
    classContentId: v.id("classContent"),
    learningObjectiveId: v.id("learningObjectives"),
    evaluationIndicatorIds: v.optional(v.array(v.id("evaluationIndicators"))),
    coverage: v.optional(COVERAGE_TYPE_SCHEMA),
  },
  handler: async (ctx, args, tenancy) => {
    // Validate class content exists and belongs to institution
    const classContent = await ctx.db.get(args.classContentId);
    if (
      !classContent ||
      classContent.institutionId !== tenancy.institution._id
    ) {
      throw new Error("Class content not found");
    }

    // Validate learning objective exists and belongs to institution
    const objective = await ctx.db.get(args.learningObjectiveId);
    if (!objective || objective.institutionId !== tenancy.institution._id) {
      throw new Error("Learning objective not found");
    }

    // Validate indicators if provided
    if (args.evaluationIndicatorIds) {
      for (const indicatorId of args.evaluationIndicatorIds) {
        const indicator = await ctx.db.get(indicatorId);
        if (!indicator || indicator.institutionId !== tenancy.institution._id) {
          throw new Error(`Evaluation indicator ${indicatorId} not found`);
        }
        if (indicator.learningObjectiveId !== args.learningObjectiveId) {
          throw new Error(
            `Indicator ${indicatorId} does not belong to the specified objective`,
          );
        }
      }
    }

    const currentTime = now();

    // Create link
    const linkId = await ctx.db.insert("classContentOA", {
      institutionId: tenancy.institution._id,
      classContentId: args.classContentId,
      learningObjectiveId: args.learningObjectiveId,
      evaluationIndicatorIds: args.evaluationIndicatorIds,
      coverage: args.coverage,
      createdAt: now,
    });

    // Update curriculum coverage
    const course = await ctx.db.get(classContent.courseId);
    if (!course || course.institutionId !== tenancy.institution._id) {
      throw new Error("Course not found");
    }

    // Get or create coverage record
    let coverage = await ctx.db
      .query("curriculumCoverage")
      .withIndex("by_courseId_subject", (q: any) =>
        q
          .eq("courseId", classContent.courseId)
          .eq("subject", classContent.subject)
          .eq("institutionId", tenancy.institution._id),
      )
      .filter((q: any) =>
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
        institutionId: tenancy.institution._id,
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
export const unlinkClassContentFromOA = tenantMutation({
  args: {
    linkId: v.id("classContentOA"),
  },
  handler: async (ctx, { linkId }, tenancy) => {
    const link = await ctx.db.get(linkId);
    if (!link || link.institutionId !== tenancy.institution._id) {
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
export const updateCurriculumCoverage = tenantMutation({
  args: {
    coverageId: v.id("curriculumCoverage"),
    coverageStatus: COVERAGE_STATUS_SCHEMA,
  },
  handler: async (ctx, { coverageId, coverageStatus }, tenancy) => {
    const coverage = await ctx.db.get(coverageId);
    if (!coverage || coverage.institutionId !== tenancy.institution._id) {
      throw new Error("Curriculum coverage not found");
    }

    await ctx.db.patch(coverageId, {
      coverageStatus,
      updatedAt: now(),
    });

    return await ctx.db.get(coverageId);
  },
});
