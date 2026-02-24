import nodemailer from "nodemailer";
import { env } from "../config/env";
import type { OrderDTO } from "../modules/orders/types";

/**
 * If SMTP is not configured, we just log and skip.
 * Set these envs if you want real emails:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) return null;

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
}

function fromEmail(): string {
    return process.env.SMTP_FROM || env.SWEETIES_ADMIN_EMAIL;
}

export async function sendOrderConfirmationToGuest(order: OrderDTO): Promise<void> {
    const transporter = getTransporter();
    if (!transporter) {
        console.log("[MAIL] SMTP not configured. Skipping guest email.");
        return;
    }

    await transporter.sendMail({
        from: fromEmail(),
        to: order.email,
        subject: `Sweeties - Pedido recibido (${order.id})`,
        text: `Hola ${order.name}!\n\nTu pedido fue recibido.\nID: ${order.id}\nTotal: $${order.total}\nEstado: ${order.status}\n\nGracias!`,
    });
}

export async function sendOrderConfirmationToAdmin(order: OrderDTO): Promise<void> {
    const transporter = getTransporter();
    if (!transporter) {
        console.log("[MAIL] SMTP not configured. Skipping admin email.");
        return;
    }

    await transporter.sendMail({
        from: fromEmail(),
        to: env.SWEETIES_ADMIN_EMAIL,
        subject: `Nuevo pedido Sweeties (${order.id})`,
        text: `Nuevo pedido:\nID: ${order.id}\nCliente: ${order.name}\nEmail: ${order.email}\nTel: ${order.phone}\nTotal: $${order.total}\nEstado: ${order.status}`,
    });
}