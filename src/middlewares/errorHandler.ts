import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

function safeSerializeError(err: unknown): Record<string, unknown> {
    if (err instanceof Error) {
        return {
            name: err.name,
            message: err.message,
            stack: err.stack,
        };
    }
    try {
        return { value: err };
    } catch {
        return { value: String(err) };
    }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
    // Always log the root error on the server for debugging
    // This is critical to avoid "silent 500" situations.
    const serialized = safeSerializeError(err);
    console.error("🔥 ErrorHandler caught an error:", {
        method: req.method,
        path: req.originalUrl,
        ...serialized,
    });

    // Known, controlled errors
    if (err instanceof ApiError) {
        res.status(err.status).json({
            code: err.code,
            message: err.message,
            details: err.details ?? null,
        });
        return;
    }

    if ((err as any)?.name === "MulterError") {
        res.status(400).json({
            code: "BAD_REQUEST",
            message: (err as any).message || "Multer error",
            details: null,
        });
        return;
    }

    const httpCode = typeof (err as any)?.http_code === "number" ? (err as any).http_code : null;
    const status = typeof (err as any)?.status === "number"
        ? (err as any).status
        : httpCode ?? 500;

    const message = err instanceof Error ? err.message : "Unexpected server error";

    // Show details only in development to help debugging
    const isDev = process.env.NODE_ENV !== "production";

    res.status(status).json({
        code: status === 500 ? "INTERNAL_ERROR" : "BAD_REQUEST",
        message,
        details: isDev ? serialized : null,
    });
}