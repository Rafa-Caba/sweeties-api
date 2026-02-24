import "dotenv/config";

import mongoose from "mongoose";
import app from "./app";
import { env } from "./config/env";
import { log } from "./config/logger";
import { ensureAdminSettings } from "./modules/adminSettings/bootstrap";
import { ensureThemes } from "./modules/themes/bootstrap";

async function connectDb(): Promise<void> {
    await mongoose.connect(env.MONGO_URI, {
        dbName: env.MONGO_DB_NAME,
    });
    log.info("✅ MongoDB connected", { dbName: env.MONGO_DB_NAME });
}

async function start(): Promise<void> {
    await connectDb();

    // Bootstrap singleton settings (safe no-op if already exists)
    await ensureAdminSettings();
    await ensureThemes();

    const server = app.listen(env.PORT, () => {
        log.info(`🚀 sweeties-api listening on port ${env.PORT}`);
    });

    const shutdown = async (signal: string) => {
        try {
            log.warn(`🧯 Received ${signal}. Shutting down...`);
            server.close(async () => {
                await mongoose.connection.close();
                log.info("✅ Shutdown complete");
                process.exit(0);
            });
            setTimeout(() => process.exit(1), 10_000).unref();
        } catch (e) {
            log.error("❌ Shutdown error", e);
            process.exit(1);
        }
    };

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch((e) => {
    log.error("❌ Failed to start server", e);
    process.exit(1);
});