import type { JSONSchemaType } from "ajv";
import type { CreateTaskRequest, UpdateTaskRequest } from "./types.js";
import { TASK_STATUS } from "./constants.js";

const TASK_FIELDS = {
    type: "object" as const,
    properties: {
        title: { type: "string" as const, minLength: 1 },
        status: { type: "string" as const, enum: Object.values(TASK_STATUS) },
        skillsRequired: { type: "array" as const, items: { type: "string" as const } },
        assignedTo: { type: "integer" as const, nullable: true },
        subTasks: {
            type: "array" as const,
            items: { $ref: "#/$defs/taskBody" },
            nullable: true,
        },
    },
    required: ["title", "status", "skillsRequired"],
    additionalProperties: false,
};

// Prevent properties from being lost 
export const CREATE_TASK_REQUEST_SCHEMA = { $defs: { taskBody: TASK_FIELDS }, ...TASK_FIELDS } as unknown as JSONSchemaType<CreateTaskRequest>;

export const UPDATE_TASK_REQUEST_SCHEMA: JSONSchemaType<UpdateTaskRequest> = {
    type: "object",
    properties: {
        status: { type: "string", enum: Object.values(TASK_STATUS) },
        assignedTo: { type: "integer", nullable: true }
    },
    required: ["status"],
    additionalProperties: false
};