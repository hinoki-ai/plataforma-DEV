/**
 * Migration script to add institutionId to existing records
 * This fixes records created before institutionId became required
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const migrateInstitutionIds = mutation({
  args: {},
  handler: async (ctx) => {
    // Get the first institution to use as default
    const defaultInstitution = await ctx.db.query("institutionInfo").first();
    if (!defaultInstitution) {
      throw new Error("No institutions found. Cannot perform migration.");
    }

    const institutionId = defaultInstitution._id;
    console.log(`Using institution ${institutionId} as default for migration`);

    // Migrate calendar events
    const calendarEvents = await ctx.db.query("calendarEvents").collect();
    let calendarCount = 0;
    for (const event of calendarEvents) {
      if (!event.institutionId) {
        await ctx.db.patch(event._id, { institutionId });
        calendarCount++;
      }
    }
    console.log(`Migrated ${calendarCount} calendar events`);

    // Migrate meetings
    const meetings = await ctx.db.query("meetings").collect();
    let meetingsCount = 0;
    for (const meeting of meetings) {
      if (!meeting.institutionId) {
        await ctx.db.patch(meeting._id, { institutionId });
        meetingsCount++;
      }
    }
    console.log(`Migrated ${meetingsCount} meetings`);

    // Add more migrations here for other tables as needed

    return {
      success: true,
      message: `Migration completed. Updated ${calendarCount} calendar events and ${meetingsCount} meetings.`,
    };
  },
});
