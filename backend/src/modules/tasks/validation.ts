import type { JSONSchemaType } from "ajv";
import type { CreateTaskRequest } from "./types.js";
import { TASK_STATUS } from "./constants.js";

export const CREATE_TASK_REQUEST_SCHEMA: JSONSchemaType<CreateTaskRequest> = {
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