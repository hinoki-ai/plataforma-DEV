/**
 * Migration: Assign Existing Users to Institutions
 *
 * This script assigns existing users who don't have institution memberships
 * to appropriate institutions based on the domain mapping strategy.
 *
 * Run this after deploying the institution synchronization system.
 */

import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const migrateExistingUsers = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🚀 Starting migration of existing users to institutions...");

    // Get all users without currentInstitutionId
    const usersWithoutInstitution = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("currentInstitutionId"), undefined))
      .collect();

    console.log(
      `📊 Found ${usersWithoutInstitution.length} users without institution assignments`,
    );

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutInstitution) {
      try {
        // Skip users without email
        if (!user.email) {
          console.warn(`⚠️ Skipping user ${user._id}: no email address`);
          continue;
        }

        // Try to resolve institution from email domain
        const institutionId = await resolveInstitutionFromEmail(
          ctx,
          user.email,
        );

        if (!institutionId) {
          console.warn(
            `⚠️ No institution found for user ${user.email} (${user._id})`,
          );
          continue;
        }

        // Update user with institution
        await ctx.db.patch(user._id, {
          currentInstitutionId: institutionId,
          updatedAt: Date.now(),
        });

        // Create membership
        const membershipRole =
          user.role === "ADMIN"
            ? "ADMIN"
            : user.role === "PROFESOR"
              ? "PROFESOR"
              : user.role === "PARENT"
                ? "PARENT"
                : "STAFF";

        await ctx.db.insert("institutionMemberships", {
          institutionId,
          userId: user._id,
          role: membershipRole,
          status: "ACTIVE",
          invitedBy: undefined, // System migration
          joinedAt: Date.now(),
          lastAccessAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        console.log(`✅ Assigned user ${user.email} to institution`);
        successCount++;
      } catch (error) {
        console.error(
          `❌ Failed to migrate user ${user._id} (${user.email}):`,
          error,
        );
        errorCount++;
      }
    }

    console.log(`🎉 Migration completed:`);
    console.log(`   ✅ Successfully migrated: ${successCount} users`);
    console.log(`   ❌ Failed to migrate: ${errorCount} users`);
    console.log(
      `   📊 Total processed: ${usersWithoutInstitution.length} users`,
    );

    return {
      success: true,
      totalProcessed: usersWithoutInstitution.length,
      successCount,
      errorCount,
    };
  },
});

/**
 * Helper function to resolve institution from email domain
 * (Duplicated from users.ts for migration purposes)
 */
async function resolveInstitutionFromEmail(
  ctx: any,
  email: string,
): Promise<any | null> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;

  // Check explicit domain mapping first
  const INSTITUTION_DOMAIN_MAPPING: Record<string, any> = {
    // Add domain mappings here as needed
    // "astral.cl": "institution_id_here"
  };

  const mappedInstitutionId = INSTITUTION_DOMAIN_MAPPING[domain];
  if (mappedInstitutionId) {
    const institution = await ctx.db.get(mappedInstitutionId);
    if (institution?.isActive !== false) {
      return mappedInstitutionId;
    }
  }

  // Fallback to first active institution
  const institutions = await ctx.db
    .query("institutionInfo")
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .collect();

  return institutions.length > 0 ? institutions[0]._id : null;
}
