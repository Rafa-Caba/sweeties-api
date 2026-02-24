import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { requireAuth } from "../../middlewares/requireAuth";
import * as Controller from "./controller";
import { ListThemesSchema, SetMyThemeSchema } from "./schemas";

export const themesRoutes = Router();

// Public: GET /api/themes
themesRoutes.get("/", validate(ListThemesSchema), (req, res) => void Controller.list(req, res));

// Authenticated: PUT /api/themes/me
themesRoutes.put("/me", requireAuth, validate(SetMyThemeSchema), (req, res) =>
    void Controller.setMyTheme(req, res)
);