import { db } from "../../infrastructure/database/index.js"

export async function retrieveAllDevelopers() {
    return await db.query.developers.findMany();
}

export async function retrieveDeveloperById(id: number) {
    return await db.query.developers.findFirst({
        where: (developers, { eq }) => eq(developers.id, id)
    });
}