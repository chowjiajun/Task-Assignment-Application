import type { JSONSchemaType } from "ajv";
import type { CreateTaskRequest, CreateSubTaskRequest, UpdateTaskRequest } from "./types.js";
import { TASK_STATUS } from "./constants.js";

const SUB_TASK_SCHEMA: JSONSchemaType<CreateSubTaskRequest> = {
    type: "object",
    properties: {
        title: { type: "string", minLength: 1 },
        status: { type: "string", enum: Object.values(TASK_STATUS) },
        skillsRequired: { type: "array", items: { type: "string" } },
        assignedTo: { type: "integer", nullable: true }
    },
    required: ["title", "status", "skillsRequired"],
    additionalProperties: false
};

export const CREATE_TASK_REQUEST_SCHEMA: JSONSchemaType<CreateTaskRequest> = {
    type: "object",
    properties: {
        title: { type: "string", minLength: 1 },
        status: { type: "string", enum: Object.values(TASK_STATUS) },
        skillsRequired: { type: "array", items: { type: "string" } },
        assignedTo: { type: "integer", nullable: true },
        subTasks: {
            type: "array",
            items: SUB_TASK_SCHEMA,
            nullable: true
        }
    },
    required: ["title", "status", "skillsRequired"],
    additionalProperties: false
};

export const UPDATE_TASK_REQUEST_SCHEMA: JSONSchemaType<UpdateTaskRequest> = {
    type: "object",
    properties: {
        status: { type: "string", enum: Object.values(TASK_STATUS) },
        assignedTo: { type: "integer", nullable: true }
    },
    required: ["status"],
    additionalProperties: false
};