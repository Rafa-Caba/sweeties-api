import nodemailer from "nodemailer";
import { env } from "../config/env";

type ContactRequestBody = {
    name: string;
    email: string;
    subject?: string | null;
    message: string;
};

function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) return null;

    // return nodemailer.createTransport({
    //     host,
    //     port,
    //     secure: port === 465,
    //     auth: { user, pass },
    // });

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        requireTLS: port === 587,
        tls: { servername: host },
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 20_000,
    });
}

function fromEmail(): string {
    return process.env.SMTP_FROM || env.SWEETIES_ADMIN_EMAIL;
}

export async function sendContactFormToAdmin(contact: ContactRequestBody): Promise<void> {
    const transporter = getTransporter();
    if (!transporter) {
        console.log("[MAIL] SMTP not configured. Skipping contact email.");
        return;
    }

    const subject = `Nuevo Mensaje de Contacto: ${contact.subject ?? contact.name}`;

    await transporter.sendMail({
        from: fromEmail(),
        to: env.SWEETIES_ADMIN_EMAIL,
        subject,
        replyTo: contact.email,
        text: `Nombre: ${contact.name}\nEmail: ${contact.email}\nAsunto: ${contact.subject ?? ""}\n\nMensaje:\n${contact.message}`,
    });
}
