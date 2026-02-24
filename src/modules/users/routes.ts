import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import { uploadUserImage } from "../../middlewares/cloudinaryUploaders";
import * as Controller from "./controller";
import {
    MeSchema,
    ListUsersSchema,
    GetUserByIdSchema,
    CreateUserSchema,
    UpdateUserMultipartSchema,
    DeleteUserSchema,
} from "./schemas";

export const usersRoutes = Router();

// Profile parity: GET /api/users/me
usersRoutes.get("/me", requireAuth, validate(MeSchema), (req, res) => void Controller.me(req, res));

// Admin CRUD
usersRoutes.get("/", requireAuth, requireRole("admin"), validate(ListUsersSchema), (req, res) =>
    void Controller.list(req, res)
);

usersRoutes.get("/:id", requireAuth, requireRole("admin"), validate(GetUserByIdSchema), (req, res) =>
    void Controller.getById(req, res)
);

// Create: supports normal JSON body (you can also create a multipart version later if needed)
usersRoutes.post(
    "/",
    requireAuth,
    requireRole("admin"),
    uploadUserImage.single("image"),
    validate(CreateUserSchema),
    (req, res) => void Controller.create(req, res)
);

// Update: supports multipart with `user` JSON string + optional `image`
usersRoutes.patch(
    "/:id",
    requireAuth,
    requireRole("admin"),
    uploadUserImage.single("image"),
    validate(UpdateUserMultipartSchema),
    (req, res) => void Controller.update(req, res)
);

usersRoutes.delete("/:id", requireAuth, requireRole("admin"), validate(DeleteUserSchema), (req, res) =>
    void Controller.remove(req, res)
);