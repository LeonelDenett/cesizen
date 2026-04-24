CREATE TYPE "public"."exercise_category" AS ENUM('basic', 'advanced');--> statement-breakpoint
CREATE TABLE "breathing_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"inspire" integer NOT NULL,
	"hold" integer DEFAULT 0 NOT NULL,
	"expire" integer NOT NULL,
	"category" "exercise_category" DEFAULT 'basic' NOT NULL,
	"benefit" varchar(100) NOT NULL,
	"color" varchar(100) DEFAULT 'from-green-400 to-green-600' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "breathing_exercises_code_unique" UNIQUE("code")
);
