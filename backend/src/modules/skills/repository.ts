import { db } from "../../infrastructure/database/index.js"

export async function retrieveSkillByName(skill: string) {
    return await db.query.skills.findFirst({
        where: (skills, { eq }) => eq(skills.name, skill)
    });
}