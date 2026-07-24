import { db } from "./index.js";
import { developers, skills } from "./schema.js";

async function seed() {
    // Insert developers
    await db.insert(developers).values([
        { name: "Alice" },
        { name: "Bob" },
        { name: "Carol" },
        { name: "Dave" },
    ]);

    // Insert skills
    await db.insert(skills).values([
        { name: "Frontend" },
        { name: "Backend" },
    ]);

    console.log("Database seeded successfully");
}

try {
    await seed();
} catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
}