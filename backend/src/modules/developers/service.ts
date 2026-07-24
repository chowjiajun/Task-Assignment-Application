import { retrieveDeveloperById } from "./repository.js";

export async function getDeveloperById(id: number) {
    return await retrieveDeveloperById(id);
}