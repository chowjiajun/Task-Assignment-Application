import { retrieveAllSkills, retrieveSkillByName, retrieveSkillsByNames } from './repository.js';

export async function getAllSkills() {
    return await retrieveAllSkills();
}

export async function getSkillByName(skill: string) {
    return await retrieveSkillByName(skill);
}

export async function validateSkills(skillNames: string[]) {
    if (skillNames.length === 0) {
        return true;
    }
    const foundSkills = await retrieveSkillsByNames(skillNames);
    const foundSkillNames = new Set(foundSkills.map(s => s.name));
    const missingSkills = skillNames.filter(name => !foundSkillNames.has(name));
    
    if (missingSkills.length > 0) {
        throw new Error(`The following skills do not exist: ${missingSkills.join(', ')}`);
    }
    return true;
}