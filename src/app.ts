import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";

import { buildCorsOptions } from "./config/cors";
import { httpLogger } from "./config/logger";
import { env } from "./config/env";

// Module Routes Imports
import { authRoutes } from "./modules/auth/routes";
import { usersRoutes } from "./modules/users/routes";
import { itemsRoutes } from "./modules/items/routes";
import { ordersRoutes } from "./modules/orders/routes";
import { adminSettingsRoutes } from "./modules/adminSettings/routes";
import { themesRoutes } from "./modules/themes/routes";
import { dashboardRoutes } from "./modules/dashboard/routes";
import { errorHandler } from "./middlewares/errorHandler";

// Public
import { publicRoutes } from "./modules/public/routes";

const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(cors(buildCorsOptions()));
app.use(compression());

const bodyLimit = `${env.MAX_REQUEST_SIZE_MB}mb`;
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

app.use(cookieParser());
app.use(httpLogger);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Module Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin/admin-settings", adminSettingsRoutes);
app.use("/api/themes", themesRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Public Route
app.use("/api/public", publicRoutes);

// Error handler
app.use(errorHandler);

app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    res.status(500).json({ message });
});

export default app;