import { db } from "../../infrastructure/database/index.js"

export async function retrieveAllSkills() {
    return await db.query.skills.findMany();
}

export async function retrieveSkillByName(skill: string) {
    return await db.query.skills.findFirst({
        where: (skills, { eq }) => eq(skills.name, skill)
    });
}

export async function retrieveSkillsByNames(skillNames: string[]) {
    if (skillNames.length === 0) {
        return [];
    }
    return await db.query.skills.findMany({
        where: (skills, { inArray }) => inArray(skills.name, skillNames)
    });
}