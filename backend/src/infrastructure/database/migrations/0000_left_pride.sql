CREATE TABLE "developer_skills" (
	"developer_id" serial NOT NULL,
	"skill_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "developers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"name" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"assigned_to" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "developer_skills" ADD CONSTRAINT "developer_skills_developer_id_developers_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "developer_skills" ADD CONSTRAINT "developer_skills_skill_id_skills_name_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_developers_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."developers"("id") ON DELETE no action ON UPDATE no action;