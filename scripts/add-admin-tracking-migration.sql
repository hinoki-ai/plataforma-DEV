-- LIKELY APPLIED: Add admin tracking field to users table
-- This migration adds the createdByAdmin field to track which admin created other users
-- Note: The createdByAdmin field already exists in the current Prisma schema
-- This migration may have already been applied to the database

ALTER TABLE "users" ADD COLUMN "created_by_admin" TEXT;

-- Add index for performance on admin creation queries
CREATE INDEX "users_created_by_admin_idx" ON "users"("created_by_admin");

-- Add foreign key constraint to ensure createdByAdmin references a valid user
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_admin_fkey" FOREIGN KEY ("created_by_admin") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Optional: Add comment for documentation
COMMENT ON COLUMN "users"."created_by_admin" IS 'ID of the admin who created this user account';