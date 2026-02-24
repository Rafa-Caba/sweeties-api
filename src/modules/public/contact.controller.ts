import type { Request, Response } from "express";
import * as Service from "./contact.service";

export async function contact(req: Request, res: Response): Promise<void> {
    const dto = (req as any).validated.body;
    await Service.submitContactForm(dto);

    res.json({ message: "Mensaje recibido. ¡Gracias por contactarnos!" });
}