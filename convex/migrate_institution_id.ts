/**
 * Migration script to add institutionId to existing records
 * This fixes records created before institutionId became required
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const checkRecord = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id as any);
  },
});

export const migrateInstitutionIds = mutation({
  args: {},
  handler: async (ctx) => {
    // Get the first institution to use as default
    const defaultInstitution = await ctx.db.query("institutionInfo").first();
    if (!defaultInstitution) {
      throw new Error("No institutions found. Cannot perform migration.");
    }

    const institutionId = defaultInstitution._id;

    let totalCount = 0;

    // Tables to migrate (add more as needed)
    const tablesToMigrate = [
      "institutionMemberships",
      "calendarEvents",
      "meetings",
      "students",
      "courses",
      "activities",
      "notifications",
      "votes",
      "voteOptions",
      "voteResponses",
      "studentProgressReports",
      "photos",
      "videos",
      "videoCapsules",
      "documents",
      "planningDocuments",
      "teamMembers",
      "parentProfiles",
      "meetingTemplates",
      "calendarEventTemplates",
      "recurrenceRules",
      "calendarEventTemplates",
      "courses",
      "courseStudents",
      "classAttendance",
      "learningObjectives",
      "evaluationIndicators",
      "classContentOA",
      "curriculumCoverage",
      "recordCertifications",
      "recordLocks",
      "classContent",
      "studentObservations",
      "classGrades",
      "parentMeetingAttendance",
      "extraCurricularActivities",
      "extraCurricularParticipants",
    ];

    for (const tableName of tablesToMigrate) {
      try {
        const records = await ctx.db.query(tableName as any).collect();
        let count = 0;
        for (const record of records) {
          if (!record.institutionId) {
            await ctx.db.patch(record._id, { institutionId });
            count++;
            totalCount++;
          }
        }
        if (count > 0) {
        }
      } catch (error) {}
    }

    return {
      success: true,
      message: `Migration completed. Updated ${totalCount} records across ${tablesToMigrate.length} tables.`,
    };
  },
});
