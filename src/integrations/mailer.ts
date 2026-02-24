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

        // STARTTLS support if you ever switch to 587
        requireTLS: port === 587,

        // Helps some providers with TLS/SNI
        tls: { servername: host },

        // Prevent long hangs in production (Railway timeouts)
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 20_000,
    });
}

function fromEmail(): string {
    return process.env.SMTP_FROM || env.SWEETIES_ADMIN_EMAIL;
}

function orderSummaryText(order: OrderDTO): string {
    const itemsText = (order.items || [])
        .map((it) => `${it.quantity}x ${it.name} ($${Number(it.price).toFixed(2)} c/u)`)
        .join("\n");

    return [
        `ID: ${order.id}`,
        `Cliente: ${order.name}`,
        `Email: ${order.email}`,
        `Tel: ${order.phone}`,
        `Total: $${Number(order.total).toFixed(2)}`,
        `Estado: ${order.status}`,
        "",
        "Items:",
        itemsText || "(sin items)",
    ].join("\n");
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
        replyTo: env.SWEETIES_ADMIN_EMAIL,
        text: `Hola ${order.name}!\n\nTu pedido fue recibido.\n\n${orderSummaryText(order)}\n\nGracias!`,
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
        replyTo: order.email,
        text: `Nuevo pedido:\n\n${orderSummaryText(order)}`,
    });
}