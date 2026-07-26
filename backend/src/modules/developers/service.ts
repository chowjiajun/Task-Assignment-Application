import { retrieveAllDevelopers, retrieveDeveloperById, retrieveDeveloperSkills } from "./repository.js";

export async function getAllDevelopers() {
    return await retrieveAllDevelopers();
}

export async function getDeveloperById(id: number) {
    return await retrieveDeveloperById(id);
}

export async function getDeveloperSkills(developerId: number) {
    const rows = await retrieveDeveloperSkills(developerId);
    return rows.map(row => row.skillId);
}