import { config } from "./src/config/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/infrastructure/database/schema.ts",
    out: "./src/infrastructure/database/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: `postgresql://${config.DATABASE_USERNAME}:${config.DATABASE_PASSWORD}@${config.DATABASE_HOST}:${config.DATABASE_PORT}/${config.DATABASE_NAME}`,
    },
});