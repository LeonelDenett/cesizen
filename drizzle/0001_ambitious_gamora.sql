CREATE TYPE "public"."page_category" AS ENUM('alimentation', 'sport', 'meditation', 'stress', 'general');--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"page_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "info_pages" ADD COLUMN "category" "page_category" DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "info_pages" ADD COLUMN "image_url" varchar(500);--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_page_id_info_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."info_pages"("id") ON DELETE cascade ON UPDATE no action;