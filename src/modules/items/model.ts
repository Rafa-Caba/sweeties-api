import mongoose, { type InferSchemaType } from "mongoose";
import type { ItemDTO, Size } from "./types";

const SizeSchema = new mongoose.Schema(
    {
        alto: { type: Number, default: null, min: 0 },
        ancho: { type: Number, default: null, min: 0 },
    },
    { _id: false }
);

const ItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },

        imageUrl: { type: String, required: true },
        imagePublicId: { type: String, default: null },

        materials: { type: [String], default: [] },
        size: { type: [SizeSchema], default: [] },

        sprites: { type: [String], default: [] },
        spritesPublicIds: { type: [String], default: [] },

        isFeatured: { type: Boolean, default: false },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export type ItemDoc = InferSchemaType<typeof ItemSchema> & { _id: mongoose.Types.ObjectId };

export const ItemModel =
    (mongoose.models.Item as mongoose.Model<ItemDoc>) ||
    mongoose.model<ItemDoc>("Item", ItemSchema);

function toSizeList(v: any): Size[] {
    if (!Array.isArray(v)) return [];
    return v.map((x) => ({
        alto: typeof x?.alto === "number" ? x.alto : x?.alto ?? null,
        ancho: typeof x?.ancho === "number" ? x.ancho : x?.ancho ?? null,
    }));
}

export function toItemDTO(item: ItemDoc): ItemDTO {
    const dto: ItemDTO = {
        id: item._id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,

        imageUrl: item.imageUrl,
        imagePublicId: item.imagePublicId ?? null,

        materials: Array.isArray(item.materials) ? item.materials : [],
        size: toSizeList(item.size),

        sprites: Array.isArray(item.sprites) ? item.sprites : [],
        spritesPublicIds: Array.isArray(item.spritesPublicIds) ? item.spritesPublicIds : [],

        isFeatured: !!item.isFeatured,
        isVisible: !!item.isVisible,

        // Spring DTO virtuals: info = description, available = isVisible【:contentReference[oaicite:8]{index=8}】
        info: item.description,
        available: !!item.isVisible,
    };

    return dto;
}