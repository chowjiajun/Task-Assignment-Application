import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const developers = pgTable("developers", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Have to use any type for tasks because of the self-referencing foreign key (parentTaskId) which causes a circular reference issue with TypeScript.
export const tasks: any = pgTable("tasks", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    assignedTo: integer("assigned_to").references(() => developers.id),
    parentTaskId: integer("parent_task_id").references((): any => tasks.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
    name: varchar("name", { length: 255 }).primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const developerSkills = pgTable("developer_skills", {
    developerId: serial("developer_id").references(() => developers.id),
    skillId: varchar("skill_id", { length: 255 }).references(() => skills.name),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const taskSkills = pgTable("task_skills", {
    taskId: integer("task_id").references(() => tasks.id),
    skillName: varchar("skill_name", { length: 255 }).references(() => skills.name),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});