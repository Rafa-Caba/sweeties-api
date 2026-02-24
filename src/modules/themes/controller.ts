import type { Request, Response } from "express";
import * as Service from "./service";

export async function list(req: Request, res: Response): Promise<void> {
    const themes = await Service.getAllThemes();
    res.json(themes);
}

export async function setMyTheme(req: Request, res: Response): Promise<void> {
    const { themeId } = (req as any).validated.body;
    const userId = req.user!.id;

    const updatedUser = await Service.setMyTheme({ userId, themeId });
    res.json(updatedUser);
}