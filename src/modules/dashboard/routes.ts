import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import * as Controller from "./controller";

export const dashboardRoutes = Router();

dashboardRoutes.get("/stats", requireAuth, requireRole("admin"), (req, res) =>
    void Controller.stats(req, res)
);