import { db } from "../../infrastructure/database/index.js";
import { developerSkills } from "../../infrastructure/database/schema.js";
import { eq } from "drizzle-orm";

export async function retrieveAllDevelopers() {
    return await db.query.developers.findMany();
}

export async function retrieveDeveloperById(id: number) {
    return await db.query.developers.findFirst({
        where: (developers, { eq }) => eq(developers.id, id)
    });
}

export async function retrieveDeveloperSkills(developerId: number) {
    return await db.select({
        skillId: developerSkills.skillId,
    }).from(developerSkills).where(eq(developerSkills.developerId, developerId));
}