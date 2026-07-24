import dotenv from 'dotenv';

dotenv.config({ quiet: true });

interface Config {
    // Application variables
    ENVIRONMENT: 'development' | 'production'; 

    // Express variables
    EXPRESS_PORT: number;

    // Database variables
    DATABASE_USERNAME: string;
    DATABASE_PASSWORD: string;
    DATABASE_HOST: string;
    DATABASE_PORT: number;
    DATABASE_NAME: string;
    DATABASE_LOGGING: boolean;
    DATABASE_DIALECT: 'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mssql';
    DATABASE_POOLING_MAX: number;
}

/**
 * Validates that an environment variable has one of the expected values.
 * @param envVar The environment variable value.
 * @param varName The name of the environment variable.
 * @param expectedValues The list of expected values.
 * @returns The environment variable value if it is valid.
 * @throws Error if the environment variable value is not valid.
 */
function validateExpectedValues(envVar: string | undefined, varName: string, expectedValues: string[]): string {
    if (!envVar || !expectedValues.includes(envVar)) {
        throw new Error(`Invalid value for environment variable ${varName}: ${envVar}. Expected values: ${expectedValues.join(', ')}`);
    }
    return envVar;
}

/**
 * Validates that an environment variable is a number.
 * @param envVar The environment variable value.
 * @param varName The name of the environment variable.
 * @returns The environment variable value as a number if it is valid.
 * @throws Error if the environment variable is not set or is not a valid number.
 */
function validateNumber(envVar: string | undefined, varName: string): number {
    if (!envVar) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
    const num = Number(envVar);
    if (Number.isNaN(num)) {
        throw new TypeError(`Invalid number for environment variable: ${varName}`);
    }
    return num;
}

/**
 * Validates that an environment variable is a required string.
 * @param envVar The environment variable value.
 * @param varName The name of the environment variable.
 * @returns The environment variable value if it is valid.
 * @throws Error if the environment variable is not set.
 */
function validateRequiredString(envVar: string | undefined, varName: string): string {
    if (!envVar) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
    return envVar;
}

// Validate environment variables
const ENVIRONMENT = validateExpectedValues(process.env.ENVIRONMENT, 'ENVIRONMENT', ['development', 'production'])  as 'development' | 'production';
const EXPRESS_PORT = validateNumber(process.env.EXPRESS_PORT, 'EXPRESS_PORT');
const DATABASE_USERNAME = validateRequiredString(process.env.DATABASE_USERNAME, 'DATABASE_USERNAME');
const DATABASE_PASSWORD = validateRequiredString(process.env.DATABASE_PASSWORD, 'DATABASE_PASSWORD');
const DATABASE_HOST = validateRequiredString(process.env.DATABASE_HOST, 'DATABASE_HOST');
const DATABASE_PORT = validateNumber(process.env.DATABASE_PORT, 'DATABASE_PORT');
const DATABASE_NAME = validateRequiredString(process.env.DATABASE_NAME, 'DATABASE_NAME');
const DATABASE_LOGGING = validateExpectedValues(process.env.DATABASE_LOGGING, 'DATABASE_LOGGING', ['true', 'false']) === 'true';
const DATABASE_DIALECT = validateExpectedValues(process.env.DATABASE_DIALECT, 'DATABASE_DIALECT', ['postgres', 'mysql', 'sqlite', 'mariadb', 'mssql']) as 'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mssql';
const DATABASE_POOLING_MAX = validateNumber(process.env.DATABASE_POOLING_MAX, 'DATABASE_POOLING_MAX');

export const config: Config = {
    ENVIRONMENT,
    EXPRESS_PORT,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_NAME,
    DATABASE_LOGGING,
    DATABASE_DIALECT,
    DATABASE_POOLING_MAX,
};