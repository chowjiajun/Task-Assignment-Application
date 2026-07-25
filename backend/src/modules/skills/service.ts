import { retrieveAllSkills, retrieveSkillByName } from './repository.js';

export async function getAllSkills() {
    return await retrieveAllSkills();
}

export async function getSkillByName(skill: string) {
    return await retrieveSkillByName(skill);
}