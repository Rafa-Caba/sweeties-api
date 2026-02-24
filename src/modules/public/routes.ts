import { Router } from "express";
import { validate } from "../../middlewares/validate";
import * as Controller from "./trackOrder.controller";
import { TrackOrderSchema } from "./trackOrder.schemas";

import { ContactRequestSchema } from "./contact.schemas";
import * as ContactController from "./contact.controller";

export const publicRoutes = Router();

publicRoutes.post("/orders/track", validate(TrackOrderSchema), (req, res) =>
    void Controller.trackOrder(req, res)
);

publicRoutes.post("/contact", validate(ContactRequestSchema), (req, res) =>
    void ContactController.contact(req, res)
);