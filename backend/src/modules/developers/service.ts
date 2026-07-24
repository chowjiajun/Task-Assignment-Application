import { retrieveDeveloperById } from "./repository.js";

export async function getDeveloperDetails(id: number) {
    return await retrieveDeveloperById(id);
}