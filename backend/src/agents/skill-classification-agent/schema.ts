import type { JSONSchemaType } from "ajv";
import { Ajv } from "ajv";

export interface SkillClassificationResponse {
    skills: string[];
}

export const skillClassificationSchema: JSONSchemaType<SkillClassificationResponse> = {
    type: "object",
    properties: {
        skills: {
            type: "array",
            items: {
                type: "string",
            },
        },
    },
    required: ["skills"],
    additionalProperties: false,
};

export const validate = new Ajv().compile(skillClassificationSchema);