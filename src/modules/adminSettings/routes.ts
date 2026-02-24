import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import * as Controller from "./controller";
import {
    GetAdminSettingsSchema,
    GetPublicSettingsSchema,
    UpdateAdminSettingsMultipartSchema,
} from "./schemas";
import { uploadAdminSettingsAssets } from "./upload";

export const adminSettingsRoutes = Router();

// Public
adminSettingsRoutes.get("/public", validate(GetPublicSettingsSchema), (req, res) =>
    void Controller.getPublic(req, res)
);

// Admin
adminSettingsRoutes.get("/", requireAuth, requireRole("admin"), validate(GetAdminSettingsSchema), (req, res) =>
    void Controller.getAdmin(req, res)
);

adminSettingsRoutes.put(
    "/",
    requireAuth,
    requireRole("admin"),
    uploadAdminSettingsAssets.fields([
        { name: "settings", maxCount: 1 }, // JSON string
        { name: "logoLight", maxCount: 1 },
        { name: "logoDark", maxCount: 1 },
        { name: "favicon", maxCount: 1 },
        { name: "ogImage", maxCount: 1 },
        { name: "aboutImage", maxCount: 1 },
    ]),
    validate(UpdateAdminSettingsMultipartSchema),
    (req, res) => void Controller.update(req, res)
);