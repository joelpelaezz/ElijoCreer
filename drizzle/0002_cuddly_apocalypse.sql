CREATE TABLE "app_config" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text,
	"description" text,
	"category" text,
	"updated_at" timestamp DEFAULT now()
);
