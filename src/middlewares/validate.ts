import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export function validate<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse({
            body: (req.body ?? {}) as unknown,
            query: (req.query ?? {}) as unknown,
            params: (req.params ?? {}) as unknown,
        });

        if (!result.success) {
            res.status(400).json({
                error: "ValidationError",
                issues: result.error.issues,
            });
            return;
        }

        (req as any).validated = result.data;
        next();
    };
}