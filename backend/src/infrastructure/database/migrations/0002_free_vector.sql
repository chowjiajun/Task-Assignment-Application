CREATE TABLE "task_skills" (
	"task_id" integer,
	"skill_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task_skills" ADD CONSTRAINT "task_skills_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_skills" ADD CONSTRAINT "task_skills_skill_name_skills_name_fk" FOREIGN KEY ("skill_name") REFERENCES "public"."skills"("name") ON DELETE no action ON UPDATE no action;