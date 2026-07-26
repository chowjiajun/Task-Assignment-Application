import { db } from "./index.js";
import { developers, skills, developerSkills } from "./schema.js";
import { logger } from "../../config/logger.js";

async function seed() {
    // Insert developers
    await db.insert(developers).values([
        { name: "Alice" },
        { name: "Bob" },
        { name: "Carol" },
        { name: "Dave" },
    ]).onConflictDoNothing();

    // Insert skills
    await db.insert(skills).values([
        { name: "Frontend" },
        { name: "Backend" },
    ]).onConflictDoNothing();

    // Retrieve developer IDs and skill names for the junction table
    const allDevelopers = await db.query.developers.findMany();
    const allSkills = await db.query.skills.findMany();

    const developerMap = new Map(allDevelopers.map(d => [d.name, d.id]));
    const skillMap = new Map(allSkills.map(s => [s.name, s.name]));

    // Map developers to their skills
    await db.insert(developerSkills).values([
        { developerId: developerMap.get("Alice")!, skillId: skillMap.get("Frontend")! },
        { developerId: developerMap.get("Bob")!, skillId: skillMap.get("Backend")! },
        { developerId: developerMap.get("Carol")!, skillId: skillMap.get("Frontend")! },
        { developerId: developerMap.get("Carol")!, skillId: skillMap.get("Backend")! },
        { developerId: developerMap.get("Dave")!, skillId: skillMap.get("Backend")! },
    ]).onConflictDoNothing();

    logger.info("Database seeded successfully");
}

try {
    await seed();
} catch (error) {
    logger.error("Error during seeding", { error });
    process.exit(1);
}