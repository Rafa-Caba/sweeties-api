import { z } from "zod";

export const ListThemesSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

// Spring payload: Map<String, Long> { themeId: ... }
export const SetMyThemeSchema = z.object({
    body: z.object({
        themeId: z.string().min(1), // Mongo id (string)
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export type SetMyThemeBody = z.infer<typeof SetMyThemeSchema>["body"];