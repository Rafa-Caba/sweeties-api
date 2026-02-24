import { Router } from "express";
import { validate } from "../../middlewares/validate";
import * as Controller from "./controller";
import { LoginSchema, RegisterSchema, RefreshSchema, LogoutSchema } from "./schemas";

export const authRoutes = Router();

// Public
authRoutes.post("/login", validate(LoginSchema), (req, res) => void Controller.login(req, res));
authRoutes.post("/register", validate(RegisterSchema), (req, res) => void Controller.register(req, res));
authRoutes.post("/refresh", validate(RefreshSchema), (req, res) => void Controller.refresh(req, res));

// Logout is also public (works with refresh cookie), same spirit as Spring
authRoutes.post("/logout", validate(LogoutSchema), (req, res) => void Controller.logout(req, res));