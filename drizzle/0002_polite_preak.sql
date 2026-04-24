CREATE TABLE "breathing_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"exercise_id" varchar(20) NOT NULL,
	"exercise_name" varchar(100) NOT NULL,
	"times_per_day" integer DEFAULT 1 NOT NULL,
	"days_per_week" integer DEFAULT 7 NOT NULL,
	"cycles_per_session" integer DEFAULT 6 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "breathing_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"challenge_id" uuid,
	"exercise_id" varchar(20) NOT NULL,
	"cycles" integer NOT NULL,
	"duration_seconds" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "breathing_challenges" ADD CONSTRAINT "breathing_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breathing_logs" ADD CONSTRAINT "breathing_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breathing_logs" ADD CONSTRAINT "breathing_logs_challenge_id_breathing_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."breathing_challenges"("id") ON DELETE set null ON UPDATE no action;