import { db } from "./index.js";
import { developers, skills } from "./schema.js";
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

    logger.info("Database seeded successfully");
}

try {
    await seed();
} catch (error) {
    logger.error("Error during seeding", { error });
    process.exit(1);
}