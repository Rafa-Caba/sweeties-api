import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import * as Controller from "./controller";
import {
    CreateOrderSchema,
    UpdateOrderStatusSchema,
    GetOrderByIdSchema,
    ListOrdersSchema,
    SearchOrdersSchema,
    ExportOrdersSchema,
    DeleteOrderSchema,
    RetryOrderEmailsSchema,
} from "./schemas";

export const ordersRoutes = Router();

// ------- PUBLIC CHECKOUT -------
ordersRoutes.post("/", validate(CreateOrderSchema), (req, res) => void Controller.createOrder(req, res));

// ------- ADMIN MANAGEMENT -------
// Put static routes BEFORE "/:id" to avoid route capture issues
ordersRoutes.get(
    "/export",
    requireAuth,
    requireRole("admin"),
    validate(ExportOrdersSchema),
    (req, res) => void Controller.exportCsv(req, res)
);

ordersRoutes.get(
    "/search",
    requireAuth,
    requireRole("admin"),
    validate(SearchOrdersSchema),
    (req, res) => void Controller.search(req, res)
);

ordersRoutes.get(
    "/",
    requireAuth,
    requireRole("admin"),
    validate(ListOrdersSchema),
    (req, res) => void Controller.list(req, res)
);

ordersRoutes.patch(
    "/:id/status",
    requireAuth,
    requireRole("admin"),
    validate(UpdateOrderStatusSchema),
    (req, res) => void Controller.updateStatus(req, res)
);

ordersRoutes.patch(
    "/:id/retry-emails",
    requireAuth,
    requireRole("admin"),
    validate(RetryOrderEmailsSchema),
    (req, res) => void Controller.retryEmails(req, res)
);

ordersRoutes.get(
    "/:id",
    requireAuth,
    requireRole("admin"),
    validate(GetOrderByIdSchema),
    (req, res) => void Controller.getById(req, res)
);

ordersRoutes.delete(
    "/:id",
    requireAuth,
    requireRole("admin"),
    validate(DeleteOrderSchema),
    (req, res) => void Controller.remove(req, res)
);