CREATE TYPE "public"."post_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"body" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comments_body_check" CHECK (char_length("comments"."body") <= 5000 AND "comments"."body" ~ '[^[:space:]]'),
	CONSTRAINT "comments_score_check" CHECK ("comments"."score" >= 0)
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"author_id" uuid,
	"title" text NOT NULL,
	"url" text,
	"header_image_url" text,
	"body" text,
	"tag" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"status" "post_status" NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "posts_title_check" CHECK (char_length("posts"."title") <= 200 AND "posts"."title" ~ '[^[:space:]]' AND strpos("posts"."title", chr(13)) = 0 AND strpos("posts"."title", chr(10)) = 0),
	CONSTRAINT "posts_url_length_check" CHECK (char_length("posts"."url") <= 2048),
	CONSTRAINT "posts_header_image_url_length_check" CHECK (char_length("posts"."header_image_url") <= 2048),
	CONSTRAINT "posts_body_length_check" CHECK (char_length("posts"."body") <= 20000),
	CONSTRAINT "posts_tag_check" CHECK (char_length("posts"."tag") <= 30 AND "posts"."tag" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "posts_score_check" CHECK ("posts"."score" >= 0),
	CONSTRAINT "posts_comment_count_check" CHECK ("posts"."comment_count" >= 0),
	CONSTRAINT "posts_published_at_check" CHECK ("posts"."status" <> 'published' OR "posts"."published_at" IS NOT NULL),
	CONSTRAINT "posts_deleted_status_check" CHECK ("posts"."deleted_at" IS NULL OR "posts"."status" = 'published')
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_post_id_idx" ON "comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "comments_post_parent_idx" ON "comments" USING btree ("post_id","parent_comment_id");--> statement-breakpoint
CREATE INDEX "posts_publication_idx" ON "posts" USING btree ("status","deleted_at","published_at");--> statement-breakpoint
CREATE INDEX "posts_tag_idx" ON "posts" USING btree ("tag");