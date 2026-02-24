import { z } from "zod";

export const ContactRequestSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().optional().nullable(),
        message: z.string().min(1),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export type ContactRequestBody = z.infer<typeof ContactRequestSchema>["body"];