import type { ContactRequestBody } from "./contact.schemas";
import { sendContactFormToAdmin } from "../../integrations/mailerContact";

export async function submitContactForm(body: ContactRequestBody): Promise<void> {
    // Spring encola async; aquí lo hacemos best-effort (no bloquea UI)
    // No tiramos el request si falla el proveedor; solo log.
    try {
        await sendContactFormToAdmin(body);
    } catch (e) {
        console.log("[CONTACT] Failed to send contact email:", e);
        // Spring lanza 500 si falla encolar; aquí lo dejamos best-effort para UX.
    }
}