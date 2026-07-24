import type { CreateTaskRequest } from "./types.js";
import { createTask as createTaskInRepository, getTaskById as getTaskByIdInRepository } from "./repository.js";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { DatabaseError } from "pg";
import { FOREIGN_KEY_VIOLATION } from "../../constants/postgres-error-codes.js";
import { PostgresForeignKeyViolationError } from "../../errors/database.js";

export async function createTask(taskData: CreateTaskRequest) {
    try {
        await createTaskInRepository(taskData);
    } catch (error) {
        // Drizzle doesnt throw a specific error for foreign key violations, so we need to check the error code from the underlying database error
        if (error instanceof DrizzleQueryError) {
            if (error.cause instanceof DatabaseError) {
                if (error.cause.code === FOREIGN_KEY_VIOLATION) {
                    throw new PostgresForeignKeyViolationError("Foreign key violation: The assigned developer does not exist.");
                }
            }
        } else {
            throw error;
        }
    }
}

export async function getTaskById(id: number) {
    return await getTaskByIdInRepository(id);
}