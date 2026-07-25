import type { SkillClassificationResponse } from "./schema.js";
import { buildSkillClassificationPrompt } from "./prompt.js";
import { validate } from "./schema.js";
import { openai } from "../../config/openai.js";
import { config } from "../../config/env.js";

export class SkillClassificationAgent {
    async run(title: string, availableSkills: string[]): Promise<SkillClassificationResponse> {
        // Build prompt
        const prompt = buildSkillClassificationPrompt(title, availableSkills);

        // Invoke OpenAI API
        const response = await openai.responses.create({
            model: config.OPENAI_MODEL,
            input: prompt,
        });

        // Parse response
        const parsed = JSON.parse(response.output_text) as SkillClassificationResponse;
        console.log(parsed);

        // Validate
        if (!validate(parsed)) {
            throw new Error("Invalid LLM response");
        }

        // Return
        return parsed;
    }
}

export const skillClassificationAgent = new SkillClassificationAgent();