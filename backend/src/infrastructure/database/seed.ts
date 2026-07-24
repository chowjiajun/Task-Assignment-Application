import { db } from "./index.js";
import { developers, skills } from "./schema.js";

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

    console.log("Database seeded successfully");
}

try {
    await seed();
} catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
}