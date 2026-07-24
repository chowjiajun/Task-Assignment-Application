import dotenv from 'dotenv';

dotenv.config({ quiet: true });

interface Config {
    // Application variables
    ENVIRONMENT: 'development' | 'production'; 

    // Express variables
    EXPRESS_PORT: number;
}

/**
 * Validates that an environment variable has one of the expected values.
 * @param envVar The environment variable value.
 * @param expectedValues The list of expected values.
 * @returns The environment variable value if it is valid.
 * @throws Error if the environment variable value is not valid.
 */
function validateExpectedValues(envVar: string | undefined, expectedValues: string[]): string {
    if (!envVar || !expectedValues.includes(envVar)) {
        throw new Error(`Invalid value for environment variable: ${envVar}. Expected one of: ${expectedValues.join(', ')}`);
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

// Validate environment variables
const ENVIRONMENT = validateExpectedValues(process.env.ENVIRONMENT, ['development', 'production']);
const EXPRESS_PORT = validateNumber(process.env.EXPRESS_PORT, 'EXPRESS_PORT');

export const config: Config = {
    ENVIRONMENT: ENVIRONMENT as 'development' | 'production',
    EXPRESS_PORT: EXPRESS_PORT,
}