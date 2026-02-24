import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";

import * as Controller from "./controller";
import {
    GetItemByIdSchema,
    ListItemsSchema,
    CreateItemMultipartSchema,
    UpdateItemMultipartSchema,
} from "./schemas";

import { uploadItemAssets } from "./upload";

export const itemsRoutes = Router();

// Public
itemsRoutes.get("/", validate(ListItemsSchema), (req, res) => void Controller.list(req, res));
itemsRoutes.get("/:id", validate(GetItemByIdSchema), (req, res) => void Controller.getById(req, res));

// Admin multipart (item JSON + image + sprites[])
itemsRoutes.post(
    "/",
    requireAuth,
    requireRole("admin"),
    uploadItemAssets.fields([
        { name: "image", maxCount: 1 },   // file
        { name: "sprites", maxCount: 20 } // files
    ]),
    validate(CreateItemMultipartSchema),
    (req, res) => void Controller.create(req, res)
);

itemsRoutes.put(
    "/:id",
    requireAuth,
    requireRole("admin"),
    uploadItemAssets.fields([
        { name: "image", maxCount: 1 },
        { name: "sprites", maxCount: 20 },
    ]),
    validate(UpdateItemMultipartSchema),
    (req, res) => void Controller.put(req, res)
);

itemsRoutes.patch(
    "/:id",
    requireAuth,
    requireRole("admin"),
    uploadItemAssets.fields([
        { name: "image", maxCount: 1 },
        { name: "sprites", maxCount: 20 },
    ]),
    validate(UpdateItemMultipartSchema),
    (req, res) => void Controller.patch(req, res)
);

itemsRoutes.delete(
    "/:id",
    requireAuth,
    requireRole("admin"),
    validate(UpdateItemMultipartSchema),
    (req, res) => void Controller.remove(req, res)
);