import { z } from "zod";

const SizeSchema = z.object({
    alto: z.coerce.number().min(0).nullable().optional(),
    ancho: z.coerce.number().min(0).nullable().optional(),
});

export const GetItemByIdSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
    params: z.object({ id: z.string().min(1) }),
});

export const ListItemsSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

// For multipart: item is JSON string (matches Spring @RequestPart("item"))【:contentReference[oaicite:9]{index=9}】
export const CreateItemMultipartSchema = z.object({
    body: z.object({
        item: z.string().min(2),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export const UpdateItemMultipartSchema = z.object({
    body: z.object({
        item: z.string().min(2),
    }),
    query: z.object({}).passthrough(),
    params: z.object({ id: z.string().min(1) }),
});

// DTO validation (CreateItemDTO)【:contentReference[oaicite:10]{index=10}】
export const CreateItemDTOSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.coerce.number().min(0),
    materials: z.array(z.string()).optional().default([]),
    size: z.array(SizeSchema).optional().default([]),
    isFeatured: z.boolean().optional().nullable(),
    isVisible: z.boolean().optional().nullable(),
});

// DTO validation (UpdateItemDTO)【:contentReference[oaicite:11]{index=11}】
export const UpdateItemDTOSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.coerce.number().min(0).optional(),
    materials: z.array(z.string()).optional(),
    size: z.array(SizeSchema).optional(),

    // service semantics: null/undefined -> no change; [] -> clear; list -> replace
    sprites: z.array(z.string()).optional(),
    spritesPublicIds: z.array(z.string()).optional(),

    isFeatured: z.boolean().optional().nullable(),
    isVisible: z.boolean().optional().nullable(),
});

export type CreateItemDTOInput = z.infer<typeof CreateItemDTOSchema>;
export type UpdateItemDTOInput = z.infer<typeof UpdateItemDTOSchema>;