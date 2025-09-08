-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PROFESOR', 'PARENT', 'PUBLIC');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('ACADEMIC', 'HOLIDAY', 'SPECIAL', 'PARENT', 'ADMINISTRATIVE', 'EXAM', 'MEETING', 'VACATION', 'EVENT', 'DEADLINE', 'OTHER');

-- CreateEnum
CREATE TYPE "EventPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RecurrencePattern" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "Day" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('PARENT_TEACHER', 'FOLLOW_UP', 'EMERGENCY', 'IEP_REVIEW', 'GRADE_CONFERENCE');

-- CreateEnum
CREATE TYPE "MeetingSource" AS ENUM ('STAFF_CREATED', 'PARENT_REQUESTED');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PROFESOR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "parent_role" TEXT,
    "status" "UserStatus" DEFAULT 'ACTIVE',
    "provider" TEXT,
    "is_oauth_user" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planning_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planning_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_info" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specialties" JSONB NOT NULL,
    "image_url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "student_name" TEXT NOT NULL,
    "student_grade" TEXT NOT NULL,
    "guardian_name" TEXT NOT NULL,
    "guardian_email" TEXT NOT NULL,
    "guardian_phone" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "scheduled_time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "location" TEXT NOT NULL DEFAULT 'Sala de Reuniones',
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "type" "MeetingType" NOT NULL DEFAULT 'PARENT_TEACHER',
    "assigned_to" TEXT NOT NULL,
    "notes" TEXT,
    "outcome" TEXT,
    "follow_up_required" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "source" "MeetingSource" NOT NULL DEFAULT 'STAFF_CREATED',
    "reason" TEXT,
    "parent_requested" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "type" "MeetingType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "category" "EventCategory" NOT NULL,
    "priority" "EventPriority" NOT NULL DEFAULT 'MEDIUM',
    "level" TEXT NOT NULL DEFAULT 'both',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "is_all_day" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "location" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "attachments" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurrence_rules" (
    "id" TEXT NOT NULL,
    "calendar_event_id" TEXT NOT NULL,
    "pattern" "RecurrencePattern" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "days_of_week" TEXT NOT NULL DEFAULT '',
    "month_of_year" INTEGER,
    "week_of_month" INTEGER,
    "end_date" TIMESTAMP(3),
    "occurrences" INTEGER,
    "exceptions" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "recurrence_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_event_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "EventCategory" NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'both',
    "color" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "is_all_day" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_event_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "category" TEXT,
    "tags" JSONB,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_capsules" (
    "id" TEXT NOT NULL DEFAULT 'default-capsule',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_capsules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_options" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "vote_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_responses" (
    "id" TEXT NOT NULL,
    "vote_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CalendarEventAttendees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "planning_documents_author_id_idx" ON "planning_documents"("author_id");

-- CreateIndex
CREATE INDEX "planning_documents_subject_idx" ON "planning_documents"("subject");

-- CreateIndex
CREATE INDEX "planning_documents_grade_idx" ON "planning_documents"("grade");

-- CreateIndex
CREATE INDEX "planning_documents_updated_at_idx" ON "planning_documents"("updated_at");

-- CreateIndex
CREATE INDEX "meetings_assigned_to_idx" ON "meetings"("assigned_to");

-- CreateIndex
CREATE INDEX "meetings_scheduled_date_idx" ON "meetings"("scheduled_date");

-- CreateIndex
CREATE INDEX "meetings_status_idx" ON "meetings"("status");

-- CreateIndex
CREATE INDEX "meetings_source_idx" ON "meetings"("source");

-- CreateIndex
CREATE INDEX "meetings_parent_requested_idx" ON "meetings"("parent_requested");

-- CreateIndex
CREATE INDEX "calendar_events_start_date_idx" ON "calendar_events"("start_date");

-- CreateIndex
CREATE INDEX "calendar_events_end_date_idx" ON "calendar_events"("end_date");

-- CreateIndex
CREATE INDEX "calendar_events_category_idx" ON "calendar_events"("category");

-- CreateIndex
CREATE INDEX "calendar_events_priority_idx" ON "calendar_events"("priority");

-- CreateIndex
CREATE INDEX "calendar_events_is_active_idx" ON "calendar_events"("is_active");

-- CreateIndex
CREATE INDEX "calendar_events_created_by_idx" ON "calendar_events"("created_by");

-- CreateIndex
CREATE INDEX "idx_calendar_events_date_category" ON "calendar_events"("start_date", "end_date", "category", "is_active");

-- CreateIndex
CREATE INDEX "idx_calendar_events_author_role" ON "calendar_events"("created_by", "category", "is_active");

-- CreateIndex
CREATE INDEX "idx_calendar_events_recurrence" ON "calendar_events"("is_recurring", "start_date");

-- CreateIndex
CREATE INDEX "idx_calendar_events_priority_date" ON "calendar_events"("priority", "start_date", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "recurrence_rules_calendar_event_id_key" ON "recurrence_rules"("calendar_event_id");

-- CreateIndex
CREATE INDEX "calendar_event_templates_category_idx" ON "calendar_event_templates"("category");

-- CreateIndex
CREATE INDEX "calendar_event_templates_created_by_idx" ON "calendar_event_templates"("created_by");

-- CreateIndex
CREATE INDEX "photos_uploaded_by_idx" ON "photos"("uploaded_by");

-- CreateIndex
CREATE INDEX "photos_created_at_idx" ON "photos"("created_at");

-- CreateIndex
CREATE INDEX "videos_uploaded_by_idx" ON "videos"("uploaded_by");

-- CreateIndex
CREATE INDEX "videos_category_idx" ON "videos"("category");

-- CreateIndex
CREATE INDEX "videos_is_public_idx" ON "videos"("is_public");

-- CreateIndex
CREATE INDEX "vote_options_vote_id_idx" ON "vote_options"("vote_id");

-- CreateIndex
CREATE UNIQUE INDEX "vote_responses_vote_id_user_id_key" ON "vote_responses"("vote_id", "user_id");

-- CreateIndex
CREATE INDEX "vote_responses_vote_id_idx" ON "vote_responses"("vote_id");

-- CreateIndex
CREATE INDEX "vote_responses_option_id_idx" ON "vote_responses"("option_id");

-- CreateIndex
CREATE INDEX "vote_responses_user_id_idx" ON "vote_responses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "_CalendarEventAttendees_AB_unique" ON "_CalendarEventAttendees"("A", "B");

-- CreateIndex
CREATE INDEX "_CalendarEventAttendees_B_index" ON "_CalendarEventAttendees"("B");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_documents" ADD CONSTRAINT "planning_documents_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence_rules" ADD CONSTRAINT "recurrence_rules_calendar_event_id_fkey" FOREIGN KEY ("calendar_event_id") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_event_templates" ADD CONSTRAINT "calendar_event_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_options" ADD CONSTRAINT "vote_options_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "votes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_responses" ADD CONSTRAINT "vote_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_responses" ADD CONSTRAINT "vote_responses_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "vote_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_responses" ADD CONSTRAINT "vote_responses_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "votes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalendarEventAttendees" ADD CONSTRAINT "_CalendarEventAttendees_A_fkey" FOREIGN KEY ("A") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalendarEventAttendees" ADD CONSTRAINT "_CalendarEventAttendees_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
