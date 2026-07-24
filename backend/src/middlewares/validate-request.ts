import { Ajv } from "ajv";
import { HTTP_400, HTTP_500 } from "../constants/http-status.js";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/error-messages.js";
import type { JSONSchemaType } from "ajv";
import type { NextFunction, Request, Response } from "express";

const ajv = new Ajv({ allErrors: true, strict: true });

export function validateBody<T>(schema: JSONSchemaType<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validate = ajv.compile(schema);
            const valid = validate(req.body);

            if (!valid) {
                res.status(HTTP_400).json({
                    message: BAD_REQUEST,

                    // Best practice is to not expose validation errors in production
                    errors: validate.errors?.map(error => (error.message))
                });
                return;
            }
        } catch (error) {
            // If there's an error during validation, respond with a 500 Internal Server Error
            console.error("Validation error:", error);
            res.status(HTTP_500).json({ message: INTERNAL_SERVER_ERROR });
            return;
        }

        next();
    };
}