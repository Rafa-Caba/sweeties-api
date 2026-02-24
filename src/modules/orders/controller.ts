import type { Request, Response } from "express";
import * as Service from "./service";

export async function createOrder(req: Request, res: Response): Promise<void> {
    const dto = (req as any).validated.body;

    const saved = await Service.createOrder(dto);

    res.status(201).json({ orderId: saved.id, message: "Pedido recibido" });
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
    const { id } = (req as any).validated.params;
    const { status } = (req as any).validated.body;

    const updated = await Service.updateOrderStatus(id, status);
    res.json(updated);
}

export async function getById(req: Request, res: Response): Promise<void> {
    const { id } = (req as any).validated.params;
    const order = await Service.getOrderById(id);
    res.json(order);
}

export async function list(req: Request, res: Response): Promise<void> {
    const { status, page, size } = (req as any).validated.query;
    const orders = await Service.getOrdersByStatus({ status, page, size });
    res.json(orders);
}

export async function search(req: Request, res: Response): Promise<void> {
    const { status, from, to, minTotal, maxTotal, phone, email, page, size } = (req as any).validated.query;
    const orders = await Service.filterOrders({ status, from, to, minTotal, maxTotal, phone, email, page, size });
    res.json(orders);
}

export async function exportCsv(_req: Request, res: Response): Promise<void> {
    const csv = await Service.exportOrdersAsCsv();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
    res.status(200).send(csv);
}

export async function remove(req: Request, res: Response): Promise<void> {
    const { id } = (req as any).validated.params;
    await Service.deleteOrder(id);
    res.json({ message: "Order deleted" });
}

export async function track(req: Request, res: Response): Promise<void> {
    const { orderId, email } = (req as any).validated.body;
    const order = await Service.trackOrder(orderId, email);
    res.json(order);
}