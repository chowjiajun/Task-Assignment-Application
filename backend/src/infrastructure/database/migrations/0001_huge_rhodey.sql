ALTER TABLE "tasks" ALTER COLUMN "assigned_to" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "assigned_to" DROP NOT NULL;