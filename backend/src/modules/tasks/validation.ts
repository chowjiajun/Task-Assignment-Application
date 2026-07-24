import type { JSONSchemaType } from "ajv";
import type { CreateTaskRequest } from "./types.js";
import { TASK_STATUS } from "./constants.js";

export const CREATE_TASK_REQUEST_SCHEMA: JSONSchemaType<CreateTaskRequest> = {
    type: "object",
    properties: {
        title: { type: "string" },
        status: { type: "string", enum: Object.values(TASK_STATUS) },
        assignedTo: { type: "integer", nullable: true }
    },
    required: ["title", "status"],
    additionalProperties: false
};