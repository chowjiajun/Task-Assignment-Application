import { retrieveAllDevelopers, retrieveDeveloperById } from "./repository.js";

export async function getAllDevelopers() {
    return await retrieveAllDevelopers();
}

export async function getDeveloperById(id: number) {
    return await retrieveDeveloperById(id);
}