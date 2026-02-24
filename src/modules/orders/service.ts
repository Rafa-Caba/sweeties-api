import mongoose from "mongoose";
import { OrderModel, toOrderDTO } from "./model";
import type { OrderDTO, OrderStatus } from "./types";
import type { CreateOrderBody } from "./schemas";
import { sendOrderConfirmationToAdmin, sendOrderConfirmationToGuest } from "../../integrations/mailer";
import { Errors } from "../../utils/ApiError";

function parseStatus(input?: string | null): OrderStatus | null {
    if (!input) return null;
    const v = input.trim().toUpperCase();
    if (v === "PENDIENTE" || v === "ENVIADO" || v === "ENTREGADO") return v;
    return null;
}

function toDateOrNull(iso?: string): Date | null {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
}

function assertValidObjectId(id: string, label: string): void {
    if (!mongoose.isValidObjectId(id)) {
        throw Errors.badRequest(`Invalid ${label} id`);
    }
}

export async function createOrder(dto: CreateOrderBody): Promise<OrderDTO> {
    const order = await OrderModel.create({
        name: dto.name,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        note: dto.note ?? null,
        items: dto.items,
        total: dto.total,
        status: "PENDIENTE",
    });

    const saved = toOrderDTO(order as any);

    // best-effort mail
    try {
        await sendOrderConfirmationToGuest(saved);
        await sendOrderConfirmationToAdmin(saved);
    } catch (e) {
        console.log("[MAIL] Failed to send order emails:", e);
    }

    return saved;
}

export async function updateOrderStatus(id: string, status: string): Promise<OrderDTO> {
    assertValidObjectId(id, "order");

    const next = parseStatus(status);
    if (!next) {
        throw Errors.badRequest(`Estado inválido: ${status}`);
    }

    const order = await OrderModel.findById(id);
    if (!order) {
        throw Errors.notFound("El pedido no existe");
    }

    order.status = next;
    await order.save();

    return toOrderDTO(order as any);
}

export async function getOrderById(id: string): Promise<OrderDTO> {
    assertValidObjectId(id, "order");

    const order = await OrderModel.findById(id);
    if (!order) {
        throw Errors.notFound("El pedido no existe");
    }

    return toOrderDTO(order as any);
}

export async function getOrdersByStatus(params: {
    status?: string;
    page: number;
    size: number;
}): Promise<OrderDTO[]> {
    const status = parseStatus(params.status);
    const skip = params.page * params.size;

    // invalid status => empty list (Spring behavior)
    if (params.status && !status) return [];

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const orders = await OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(params.size);

    return orders.map((o) => toOrderDTO(o as any));
}

export async function filterOrders(params: {
    status?: string;
    from?: string;
    to?: string;
    minTotal?: number;
    maxTotal?: number;
    phone?: string;
    email?: string;
    page: number;
    size: number;
}): Promise<OrderDTO[]> {
    const status = parseStatus(params.status);
    if (params.status && !status) return [];

    const filter: Record<string, any> = {};
    if (status) filter.status = status;

    if (params.phone?.trim()) filter.phone = { $regex: params.phone.trim(), $options: "i" };
    if (params.email?.trim()) filter.email = { $regex: params.email.trim(), $options: "i" };

    if (params.minTotal != null || params.maxTotal != null) {
        filter.total = {};
        if (params.minTotal != null) filter.total.$gte = params.minTotal;
        if (params.maxTotal != null) filter.total.$lte = params.maxTotal;
    }

    const fromD = toDateOrNull(params.from);
    const toD = toDateOrNull(params.to);
    if (fromD || toD) {
        filter.createdAt = {};
        if (fromD) filter.createdAt.$gte = fromD;
        if (toD) filter.createdAt.$lte = toD;
    }

    const skip = params.page * params.size;

    const orders = await OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(params.size);

    return orders.map((o) => toOrderDTO(o as any));
}

function csvEscape(v: unknown): string {
    const s = String(v ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

export async function exportOrdersAsCsv(): Promise<string> {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    const dtos = orders.map((o) => toOrderDTO(o as any));

    const lines: string[] = [];
    lines.push("id,name,email,phone,total,status,createdAt,updatedAt");

    for (const o of dtos) {
        lines.push(
            [
                csvEscape(o.id),
                csvEscape(o.name),
                csvEscape(o.email),
                csvEscape(o.phone),
                csvEscape(o.total.toFixed(2)),
                csvEscape(o.status),
                csvEscape(o.createdAt ?? ""),
                csvEscape(o.updatedAt ?? ""),
            ].join(",")
        );
    }

    return lines.join("\n");
}

export async function deleteOrder(id: string): Promise<void> {
    assertValidObjectId(id, "order");

    const res = await OrderModel.deleteOne({ _id: id });
    if (res.deletedCount === 0) {
        throw Errors.notFound("El pedido no existe");
    }
}

export async function trackOrder(orderId: string, email: string): Promise<OrderDTO> {
    // keep generic 404 to avoid leaking existence
    if (!mongoose.isValidObjectId(orderId)) {
        throw Errors.notFound("Pedido no encontrado o email incorrecto");
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
        throw Errors.notFound("Pedido no encontrado");
    }

    if (order.email.toLowerCase() !== email.toLowerCase()) {
        throw Errors.notFound("Pedido no encontrado o email incorrecto");
    }

    return toOrderDTO(order as any);
}