CREATE TABLE "github_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"github_user_id" bigint NOT NULL,
	"github_username" varchar(255) NOT NULL,
	"installation_id" bigint NOT NULL,
	"repository_owner" varchar(255) NOT NULL,
	"repository_name" varchar(255) NOT NULL,
	"repository_url" varchar(500) NOT NULL,
	"access_token" varchar(4096),
	"refresh_token" varchar(4096),
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "github_connections_project_unique" UNIQUE("project_id")
);
--> statement-breakpoint
ALTER TABLE "github_connections" ADD CONSTRAINT "github_connections_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "github_connections_installation_id_idx" ON "github_connections" USING btree ("installation_id");--> statement-breakpoint
CREATE INDEX "github_connections_github_user_id_idx" ON "github_connections" USING btree ("github_user_id");