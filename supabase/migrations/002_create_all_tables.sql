-- Migration: Create all missing tables for ElijoCreer
-- Run this in Vercel Postgres SQL Editor or via psql

-- 1. Group Activity (missing - causing 500 error)
CREATE TABLE IF NOT EXISTS "group_activity" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "group_id" uuid NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
  "user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "activity_type" text NOT NULL,
  "reference_id" uuid,
  "message" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "group_activity_group_id_idx" ON "group_activity"("group_id");
CREATE INDEX IF NOT EXISTS "group_activity_user_id_idx" ON "group_activity"("user_id");
CREATE INDEX IF NOT EXISTS "group_activity_created_at_idx" ON "group_activity"("created_at" DESC);

-- 2. Prediction History
CREATE TABLE IF NOT EXISTS "prediction_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "prediction_id" uuid NOT NULL REFERENCES "predictions"("id") ON DELETE CASCADE,
  "group_id" uuid NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
  "match_id" uuid NOT NULL REFERENCES "matches"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "previous_home_score" integer,
  "previous_away_score" integer,
  "new_home_score" integer NOT NULL,
  "new_away_score" integer NOT NULL,
  "edited_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "prediction_history_prediction_id_idx" ON "prediction_history"("prediction_id");
CREATE INDEX IF NOT EXISTS "prediction_history_group_id_idx" ON "prediction_history"("group_id");
CREATE INDEX IF NOT EXISTS "prediction_history_user_id_idx" ON "prediction_history"("user_id");

-- 3. Prediction Scores
CREATE TABLE IF NOT EXISTS "prediction_scores" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "prediction_id" uuid NOT NULL REFERENCES "predictions"("id") ON DELETE CASCADE,
  "group_id" uuid NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
  "match_id" uuid NOT NULL REFERENCES "matches"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "points_awarded" integer NOT NULL DEFAULT 0,
  "hit_exact_score" boolean NOT NULL DEFAULT false,
  "hit_outcome" boolean NOT NULL DEFAULT false,
  "hit_one_team_score" boolean NOT NULL DEFAULT false,
  "bonus_awarded" integer NOT NULL DEFAULT 0,
  "scoring_reason" text,
  "calculated_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "prediction_scores_prediction_id_idx" ON "prediction_scores"("prediction_id");
CREATE INDEX IF NOT EXISTS "prediction_scores_group_id_idx" ON "prediction_scores"("group_id");
CREATE INDEX IF NOT EXISTS "prediction_scores_user_id_idx" ON "prediction_scores"("user_id");

-- 4. Official Results
CREATE TABLE IF NOT EXISTS "official_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "match_id" uuid NOT NULL REFERENCES "matches"("id") ON DELETE CASCADE,
  "home_score" integer NOT NULL,
  "away_score" integer NOT NULL,
  "loaded_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "loaded_at" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "official_results_match_id_idx" ON "official_results"("match_id");

-- 5. Sessions table (for NextAuth)
CREATE TABLE IF NOT EXISTS "session" (
  "sessionToken" text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expires" timestamp with time zone NOT NULL
);

CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session"("userId");

-- 6. Verification Token (for NextAuth)
CREATE TABLE IF NOT EXISTS "verificationToken" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamp with time zone NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

-- 7. Add missing columns to existing tables

-- Add home_score and away_score to matches if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'home_score') THEN
    ALTER TABLE "matches" ADD COLUMN "home_score" integer;
    ALTER TABLE "matches" ADD COLUMN "away_score" integer;
    ALTER TABLE "matches" ADD COLUMN "home_penalty_score" integer;
    ALTER TABLE "matches" ADD COLUMN "away_penalty_score" integer;
  END IF;
END $$;

-- Add scores table reference to matches if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'status') THEN
    ALTER TABLE "matches" ADD COLUMN "status" text NOT NULL DEFAULT 'scheduled';
  END IF;
END $$;

-- Add visibility to groups if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'visibility') THEN
    ALTER TABLE "groups" ADD COLUMN "visibility" text NOT NULL DEFAULT 'private';
  END IF;
END $$;

-- Add isLocked and lockedAt to predictions if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictions' AND column_name = 'is_locked') THEN
    ALTER TABLE "predictions" ADD COLUMN "is_locked" boolean NOT NULL DEFAULT false;
    ALTER TABLE "predictions" ADD COLUMN "locked_at" timestamp with time zone;
  END IF;
END $$;

-- Add status to group_members if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'group_members' AND column_name = 'status') THEN
    ALTER TABLE "group_members" ADD COLUMN "status" text NOT NULL DEFAULT 'active';
  END IF;
END $$;

-- Add role to profiles if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE "profiles" ADD COLUMN "role" text NOT NULL DEFAULT 'user';
  END IF;
END $$;

SELECT 'Migration completed successfully!' as result;