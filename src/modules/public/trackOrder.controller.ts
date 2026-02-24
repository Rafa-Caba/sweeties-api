import type { Request, Response } from "express";
import * as Service from "./trackOrder.service";

export async function trackOrder(req: Request, res: Response): Promise<void> {
    const { orderId, email } = (req as any).validated.body;
    const order = await Service.trackOrder({ orderId, email });
    res.json(order);
}