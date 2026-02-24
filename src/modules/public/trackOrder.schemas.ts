import { z } from "zod";

export const TrackOrderSchema = z.object({
    body: z.object({
        orderId: z.string().min(1),
        email: z.string().email(),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export type TrackOrderBody = z.infer<typeof TrackOrderSchema>["body"];