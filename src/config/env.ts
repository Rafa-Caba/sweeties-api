import { z } from "zod";

const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Spring: server.port: 8080
    PORT: z.coerce.number().int().positive().default(8080),

    MONGO_URI: z.string().min(1, "MONGO_URI is required"),
    MONGO_DB_NAME: z.string().min(1).default("sweeties"),

    JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
    JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
    JWT_ACCESS_EXPIRES_IN: z.string().min(1).default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().min(1).default("30d"),

    // Spring style: sweeties.admin-email default
    SWEETIES_ADMIN_EMAIL: z
        .string()
        .email()
        .optional()
        .default("sweeties_crochet@infinitummail.com"),

    // Comma-separated list
    CORS_ORIGINS: z.string().optional().default("http://localhost:5173"),

    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    // Spring multipart:
    // max-file-size: 10MB
    // max-request-size: 50MB
    MAX_FILE_SIZE_MB: z.coerce.number().int().positive().optional().default(10),
    MAX_REQUEST_SIZE_MB: z.coerce.number().int().positive().optional().default(50),

    // Cookie flags (para refresh token cookie httpOnly cuando lo implementemos)
    COOKIE_SECURE: z
        .union([z.literal("true"), z.literal("false")])
        .optional()
        .default("false"),
    COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).optional().default("lax"),
    REFRESH_COOKIE_DAYS: z.coerce.number().int().positive().optional().default(30),
});

export type Env = z.infer<typeof EnvSchema>;

function parseEnv(): Env {
    const result = EnvSchema.safeParse(process.env);
    if (!result.success) {
        const formatted = result.error.format();
        // eslint-disable-next-line no-console
        console.error("❌ Invalid environment variables:", formatted);
        throw new Error("Invalid environment variables");
    }
    return result.data;
}

export const env = parseEnv();

export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";

export function getCorsOrigins(): string[] {
    const raw = env.CORS_ORIGINS ?? "";
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

export function getCookieSecure(): boolean {
    return env.COOKIE_SECURE === "true" || isProd;
}