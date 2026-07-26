ALTER TABLE "developer_skills" ALTER COLUMN "developer_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "developer_skills" ALTER COLUMN "skill_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "developer_skills" ADD CONSTRAINT "developer_skills_pkey" PRIMARY KEY ("developer_id", "skill_id");