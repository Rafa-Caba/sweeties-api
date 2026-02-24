import morgan from "morgan";
import { isProd } from "./env";

// Express middleware logger
export const httpLogger = morgan(isProd ? "combined" : "dev");

// Small app logger helper (no extra deps)
export const log = {
    info: (...args: unknown[]) => console.log("[INFO]", ...args),
    warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
    error: (...args: unknown[]) => console.error("[ERROR]", ...args),
};