import type { Request, Response } from "express";
import * as Service from "./service";

export async function stats(_req: Request, res: Response): Promise<void> {
    const dto = await Service.getStats();
    res.json(dto);
}