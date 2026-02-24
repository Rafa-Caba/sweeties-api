import type { Request, Response } from "express";
import * as Service from "./service";
import { CreateItemDTOSchema, UpdateItemDTOSchema } from "./schemas";

function ensureImageFile(file?: Express.Multer.File | null): void {
    if (!file) return;
    const ct = file.mimetype;
    if (!ct || !ct.startsWith("image/")) {
        const err = new Error("Only image/* uploads are allowed");
        (err as any).status = 400;
        throw err;
    }
}

function parseItemJson(req: Request): any {
    const raw = (req.body as any)?.item;
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

function readSprites(req: Request): Array<{ url: string; publicId: string }> {
    // multer fields -> req.files can be object with arrays
    const filesObj = req.files as any;
    const sprites = filesObj?.sprites as any[] | undefined;
    if (!Array.isArray(sprites)) return [];

    const out: Array<{ url: string; publicId: string }> = [];
    for (const f of sprites) {
        const parsed = readCloudinaryFile(f);
        if (parsed) out.push(parsed);
    }
    return out;
}

export async function list(req: Request, res: Response): Promise<void> {
    const items = await Service.getAllItems();
    res.json(items);
}

export async function getById(req: Request, res: Response): Promise<void> {
    const { id } = (req as any).validated.params;
    const item = await Service.getItemById(id);
    res.json(item);
}

export async function create(req: Request, res: Response): Promise<void> {
    const itemJson = parseItemJson(req);
    const parsed = CreateItemDTOSchema.safeParse(itemJson);
    if (!parsed.success) {
        res.status(400).json({ error: "ValidationError", issues: parsed.error.issues });
        return;
    }

    const image = (req as any).files?.image?.[0] ?? (req as any).file; // just in case
    if (!image) {
        res.status(400).json({ message: "Main image is required" });
        return;
    }

    ensureImageFile(image);

    const main = readCloudinaryFile(image);
    if (!main) {
        res.status(502).json({ message: "Cloudinary upload (image) failed" });
        return;
    }

    const sprites = readSprites(req);
    for (const f of (req.files as any)?.sprites ?? []) ensureImageFile(f);

    const saved = await Service.createItem({
        dto: parsed.data,
        imageUrl: main.url,
        imagePublicId: main.publicId,
        spriteUrls: sprites.map((s) => s.url),
        spritePublicIds: sprites.map((s) => s.publicId),
    });

    res.status(201).json(saved);
}

async function handleUpsert(req: Request, res: Response, isPut: boolean): Promise<void> {
    const { id } = (req as any).validated.params;

    const itemJson = parseItemJson(req);
    const parsed = UpdateItemDTOSchema.safeParse(itemJson);
    if (!parsed.success) {
        res.status(400).json({ error: "ValidationError", issues: parsed.error.issues });
        return;
    }

    // main image optional
    const image = (req.files as any)?.image?.[0];
    if (image) ensureImageFile(image);

    let imageUrl: string | null | undefined;
    let imagePublicId: string | null | undefined;

    if (image) {
        const main = readCloudinaryFile(image);
        if (!main) {
            res.status(502).json({ message: "Cloudinary upload (image) failed" });
            return;
        }
        imageUrl = main.url;
        imagePublicId = main.publicId;
    }

    // sprites optional
    const spritesFiles = (req.files as any)?.sprites as any[] | undefined;

    let spriteUrls: string[] | null | undefined = undefined;
    let spritePublicIds: string[] | null | undefined = undefined;

    if (Array.isArray(spritesFiles)) {
        // If provided, normalize empties out
        const clean = spritesFiles.filter((f) => f && !f?.buffer && f?.size !== 0); // cloudinary storage doesn't keep buffer
        // But multer-storage-cloudinary won't include empty files. If FE sends none, spritesFiles may be [].
        // Semantics:
        // - cleanSprites present -> replace
        // - PUT with explicit empty array -> clear (we interpret spritesFiles.length===0 on PUT as clear)
        if (spritesFiles.length === 0 && isPut) {
            spriteUrls = [];
            spritePublicIds = [];
        } else if (spritesFiles.length > 0) {
            for (const f of spritesFiles) ensureImageFile(f);
            const sprites = readSprites(req);
            spriteUrls = sprites.map((s) => s.url);
            spritePublicIds = sprites.map((s) => s.publicId);

            // mirror into DTO (Spring does this)【:contentReference[oaicite:18]{index=18}】
            parsed.data.sprites = [...spriteUrls];
            parsed.data.spritesPublicIds = [...spritePublicIds];
        }
    }

    const updated = await Service.updateItem({
        id,
        dto: parsed.data,
        imageUrl,
        imagePublicId,
        spriteUrls,
        spritePublicIds,
        isPut,
    });

    res.json(updated);
}

export async function put(req: Request, res: Response): Promise<void> {
    await handleUpsert(req, res, true);
}

export async function patch(req: Request, res: Response): Promise<void> {
    await handleUpsert(req, res, false);
}

export async function remove(req: Request, res: Response): Promise<void> {
    const { id } = (req as any).validated.params;
    await Service.deleteItem(id);
    res.json({ message: "Item deleted" });
}