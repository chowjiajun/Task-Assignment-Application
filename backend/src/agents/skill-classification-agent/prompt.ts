export function buildSkillClassificationPrompt(taskTitle: string, availableSkills: string[]): string {
    const skills = availableSkills
        .map(skill => `- ${skill}`)
        .join("\n");

    return `
You are a skills classification agent. Your task is to analyze the provided task title and identify the relevant skills required to complete the task.

Please follow these instructions:
1. Identify the skills provided that are necessary to complete the task.
2. Do not include any skills that are not listed in the available skills.
3. Do not invent any new skills; only use the skills provided in the list.
4. If none of the available skills are relevant, return an empty array.

Example:

{
    "skills": [
        "Frontend",
        "Backend"
    ]
}

Task Title: 
${taskTitle}

Available Skills:
${skills}
`;
}