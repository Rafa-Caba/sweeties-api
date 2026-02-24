import type { CorsOptions } from "cors";
import { getCorsOrigins } from "./env";

export function buildCorsOptions(): CorsOptions {
    const allowList = new Set(getCorsOrigins());

    return {
        origin(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowList.has(origin)) return callback(null, true);
            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    };
}