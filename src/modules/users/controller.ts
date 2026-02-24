import type { Request, Response } from "express";
import * as Service from "./service";
import { UpdateUserSchema } from "./schemas";

function readCloudinaryFromFile(req: Request): { imageUrl?: string; imagePublicId?: string } {
    const f = req.file as any;
    if (!f) return {};

    // multer-storage-cloudinary most common:
    // - path = url
    // - filename = public_id
    const imageUrl =
        typeof f.path === "string"
            ? f.path
            : typeof f.secure_url === "string"
                ? f.secure_url
                : typeof f.url === "string"
                    ? f.url
                    : undefined;

    const imagePublicId =
        typeof f.filename === "string"
            ? f.filename
            : typeof f.public_id === "string"
                ? f.public_id
                : undefined;

    return { imageUrl, imagePublicId };
}

function parseMultipartUser(req: Request): Record<string, unknown> | null {
    // In multipart, `req.body.user` comes as string
    const raw = (req.body as any)?.user;
    if (!raw || typeof raw !== "string") return null;

    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;
        return parsed as Record<string, unknown>;
    } catch {
        return null;
    }
}

export async function me(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const user = await Service.getMe(userId);
    res.json(user);
}

export async function list(req: Request, res: Response): Promise<void> {
    const { page, limit, search, role } = (req as any).validated.query;
    const data = await Service.listUsers({ page, limit, search, role });
    res.json(data);
}

export async function getById(req: Request, res: Response): Promise<void> {
    const { id } = (req as any).validated.params;
    const user = await Service.getUserById(id);
    res.json(user);
}

export async function create(req: Request, res: Response): Promise<void> {
    const body = (req as any).validated.body;
    const { imageUrl, imagePublicId } = readCloudinaryFromFile(req);

    const user = await Service.createUser({
        name: body.name,
        username: body.username,
        email: body.email,
        password: body.password,
        role: body.role,
        bio: body.bio ?? null,
        themeId: body.themeId ?? null,
        imageUrl,
        imagePublicId,
    });

    res.status(201).json(user);
}

export async function update(req: Request, res: Response): Promise<void> {
    const { id } = (req as any).validated.params;

    // If multipart, the data is inside req.body.user
    const multipartUser = parseMultipartUser(req);

    const patchCandidate = multipartUser ?? (req as any).validated.body;

    // Validate patchCandidate against UpdateUserSchema.body
    const validatedPatch = UpdateUserSchema.shape.body.safeParse(patchCandidate);
    if (!validatedPatch.success) {
        res.status(400).json({
            error: "ValidationError",
            issues: validatedPatch.error.issues,
        });
        return;
    }

    const patch = validatedPatch.data;

    const { imageUrl, imagePublicId } = readCloudinaryFromFile(req);

    const user = await Service.updateUser({
        id,
        patch: {
            name: patch.name,
            username: patch.username,
            email: patch.email,
            password: patch.password,
            role: patch.role,
            bio: patch.bio,
            themeId: patch.themeId,
        },
        ...(req.file ? { imageUrl, imagePublicId } : {}),
    });

    res.json(user);
}

export async function remove(req: Request, res: Response): Promise<void> {
    const { id } = (req as any).validated.params;
    await Service.deleteUser(id);
    res.json({ message: "User deleted" });
}