import mongoose from "mongoose";
import { ItemModel, toItemDTO } from "./model";
import type { ItemDTO } from "./types";
import type { CreateItemDTOInput, UpdateItemDTOInput } from "./schemas";
import { deleteFromCloudinaryByPublicId } from "../../utils/cloudinaryDelete";
import { Errors } from "../../utils/ApiError";

function assertValidObjectId(id: string, label: string): void {
    if (!mongoose.isValidObjectId(id)) {
        throw Errors.badRequest(`Invalid ${label} id`);
    }
}

export async function getAllItems(): Promise<ItemDTO[]> {
    const items = await ItemModel.find().sort({ _id: -1 });
    return items.map(toItemDTO);
}

export async function getItemById(id: string): Promise<ItemDTO> {
    assertValidObjectId(id, "item");

    const item = await ItemModel.findById(id);
    if (!item) {
        throw Errors.notFound("El artículo no existe");
    }

    return toItemDTO(item);
}

export async function createItem(params: {
    dto: CreateItemDTOInput;
    imageUrl: string;
    imagePublicId: string | null;
    spriteUrls: string[];
    spritePublicIds: string[];
}): Promise<ItemDTO> {
    const featured = params.dto.isFeatured ?? false;
    const visible = params.dto.isVisible ?? true;

    const doc = await ItemModel.create({
        name: params.dto.name,
        description: params.dto.description,
        price: params.dto.price,
        imageUrl: params.imageUrl,
        imagePublicId: params.imagePublicId,

        materials: params.dto.materials ?? [],
        size: params.dto.size ?? [],

        sprites: params.spriteUrls ?? [],
        spritesPublicIds: params.spritePublicIds ?? [],

        isFeatured: featured,
        isVisible: visible,
    });

    return toItemDTO(doc);
}

export async function updateItem(params: {
    id: string;
    dto: UpdateItemDTOInput;
    imageUrl?: string | null;
    imagePublicId?: string | null;

    spriteUrls?: string[] | null;
    spritePublicIds?: string[] | null;

    isPut: boolean;
}): Promise<ItemDTO> {
    assertValidObjectId(params.id, "item");

    const item = await ItemModel.findById(params.id);
    if (!item) {
        throw Errors.notFound("El artículo no existe");
    }

    // Basic fields
    if (params.dto.name !== undefined) item.name = params.dto.name;
    if (params.dto.description !== undefined) item.description = params.dto.description;
    if (params.dto.price !== undefined) item.price = params.dto.price;
    if (params.dto.materials !== undefined) item.materials = params.dto.materials;
    if (params.dto.size !== undefined) item.size = params.dto.size as any;

    // Main image replacement
    if (params.imageUrl && params.imagePublicId) {
        const oldPid = item.imagePublicId;
        if (oldPid) {
            try {
                await deleteFromCloudinaryByPublicId(oldPid);
            } catch {
                // best-effort
            }
        }
        item.imageUrl = params.imageUrl;
        item.imagePublicId = params.imagePublicId;
    }

    // Sprites replacement/clear
    if (params.spriteUrls !== undefined && params.spritePublicIds !== undefined) {
        if (item.spritesPublicIds?.length) {
            for (const pid of item.spritesPublicIds) {
                if (!pid) continue;
                try {
                    await deleteFromCloudinaryByPublicId(pid);
                } catch {
                    // best-effort
                }
            }
        }

        item.sprites = params.spriteUrls ?? [];
        item.spritesPublicIds = params.spritePublicIds ?? [];
    }

    // Visibility flags (null => no change)
    if (params.dto.isFeatured !== undefined && params.dto.isFeatured !== null) {
        item.isFeatured = params.dto.isFeatured;
    }
    if (params.dto.isVisible !== undefined && params.dto.isVisible !== null) {
        item.isVisible = params.dto.isVisible;
    }

    await item.save();
    return toItemDTO(item);
}

export async function deleteItem(id: string): Promise<void> {
    assertValidObjectId(id, "item");

    const item = await ItemModel.findById(id);
    if (!item) {
        throw Errors.notFound("El artículo no existe");
    }

    if (item.imagePublicId) {
        try {
            await deleteFromCloudinaryByPublicId(item.imagePublicId);
        } catch { }
    }

    if (Array.isArray(item.spritesPublicIds)) {
        for (const pid of item.spritesPublicIds) {
            if (!pid) continue;
            try {
                await deleteFromCloudinaryByPublicId(pid);
            } catch { }
        }
    }

    await ItemModel.deleteOne({ _id: id });
}