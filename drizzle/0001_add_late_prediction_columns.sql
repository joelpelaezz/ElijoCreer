ALTER TABLE "predictions" ADD COLUMN "is_late" boolean NOT NULL DEFAULT false;
ALTER TABLE "predictions" ADD COLUMN "late_minutes" integer;
ALTER TABLE "predictions" ADD COLUMN "late_penalty_applied" boolean NOT NULL DEFAULT true;
ALTER TABLE "predictions" ADD COLUMN "late_excused_by" text;
ALTER TABLE "predictions" ADD COLUMN "late_excused_reason" text;
