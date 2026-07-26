const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Construct a full API URL from a path.
 * @param path The API endpoint path
 * @returns The full URL as a string
 */
export function apiUrl(path: string): string {
    if (!BASE_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }
    return `${BASE_URL}${path}`;
}

/**
 * Extract an error message from any API response shape.
 * Handles: { error: string }, { message: string, errors: string[] }, or plain text.
 * @param response The fetch API Response object
 * @returns A string describing the error
 */
export async function extractApiError(response: Response): Promise<string> {
    try {
        const body = await response.json();
        if (typeof body.error === 'string') return body.error;
        if (typeof body.message === 'string') {
            if (Array.isArray(body.errors) && body.errors.length > 0) {
                return `${body.message}: ${body.errors.join('; ')}`;
            }
            return body.message;
        }
    } catch {
        // Response body isn't JSON, fall through
    }
    return `Request failed (${response.status})`;
}
