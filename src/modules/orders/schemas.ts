import { z } from "zod";

const OrderItemSchema = z.object({
    productId: z.string().min(1),
    name: z.string().min(1),
    price: z.coerce.number().min(0),
    quantity: z.coerce.number().int().min(1),
});

export const CreateOrderSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        note: z.string().optional().nullable(),
        items: z.array(OrderItemSchema).min(1),
        total: z.coerce.number().min(0),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export const UpdateOrderStatusSchema = z.object({
    body: z.object({
        status: z.string().min(1),
    }),
    query: z.object({}).passthrough(),
    params: z.object({
        id: z.string().min(1),
    }),
});

export const GetOrderByIdSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
    params: z.object({ id: z.string().min(1) }),
});

/**
 * Spring defaults:
 * page default 0, size default 10:contentReference[oaicite:4]{index=4}
 */
export const ListOrdersSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({
        status: z.string().optional(),
        page: z.coerce.number().int().min(0).optional().default(0),
        size: z.coerce.number().int().min(1).max(100).optional().default(10),
    }),
    params: z.object({}).passthrough(),
});

export const SearchOrdersSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({
        status: z.string().optional(),
        from: z.string().optional(), // ISO date-time
        to: z.string().optional(),   // ISO date-time
        minTotal: z.coerce.number().optional(),
        maxTotal: z.coerce.number().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        page: z.coerce.number().int().min(0).optional().default(0),
        size: z.coerce.number().int().min(1).max(100).optional().default(10),
    }),
    params: z.object({}).passthrough(),
});

export const ExportOrdersSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export const DeleteOrderSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
    params: z.object({ id: z.string().min(1) }),
});

export const TrackOrderSchema = z.object({
    body: z.object({
        orderId: z.string().min(1), // Spring uses Long; Mongo uses string id
        email: z.string().email(),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export type CreateOrderBody = z.infer<typeof CreateOrderSchema>["body"];
export type TrackOrderBody = z.infer<typeof TrackOrderSchema>["body"];