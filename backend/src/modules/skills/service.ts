import { retrieveSkillByName } from './repository.js';

export async function getSkillByName(skill: string) {
    return await retrieveSkillByName(skill);
}