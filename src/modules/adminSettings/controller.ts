import type { Request, Response } from "express";
import { UpdateAdminSettingsDTOSchema } from "./schemas";
import * as Service from "./service";

function parseSettingsJson(req: Request): any {
    const raw = (req.body as any)?.settings;
    if (!raw || typeof raw !== "string") return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function readCloudinaryFile(file?: any): { url: string; publicId: string } | null {
    if (!file) return null;

    const url =
        typeof file.path === "string"
            ? file.path
            : typeof file.secure_url === "string"
                ? file.secure_url
                : typeof file.url === "string"
                    ? file.url
                    : null;

    const publicId =
        typeof file.filename === "string"
            ? file.filename
            : typeof file.public_id === "string"
                ? file.public_id
                : null;

    if (!url || !publicId) return null;
    return { url, publicId };
}

export async function getPublic(req: Request, res: Response): Promise<void> {
    const dto = await Service.getPublicSettings();
    res.json(dto);
}

export async function getAdmin(req: Request, res: Response): Promise<void> {
    const dto = await Service.getAdminSettings();
    res.json(dto);
}

export async function update(req: Request, res: Response): Promise<void> {
    const settingsJson = parseSettingsJson(req);

    const parsed = UpdateAdminSettingsDTOSchema.safeParse(settingsJson);
    if (!parsed.success) {
        res.status(400).json({ error: "ValidationError", issues: parsed.error.issues });
        return;
    }

    const filesObj = req.files as any;

    const pick = (field: string) => readCloudinaryFile(filesObj?.[field]?.[0]);

    const files = {
        logoLight: pick("logoLight") ?? undefined,
        logoDark: pick("logoDark") ?? undefined,
        favicon: pick("favicon") ?? undefined,
        ogImage: pick("ogImage") ?? undefined,
        aboutImage: pick("aboutImage") ?? undefined,
    };

    const updated = await Service.updateAdminSettings({ dto: parsed.data, files });
    res.json(updated);
}