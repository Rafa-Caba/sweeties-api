import { z } from "zod";

const ObjectIdParam = z.object({
    id: z.string().min(1),
});

export const MeSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export const ListUsersSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        limit: z.coerce.number().int().positive().max(100).optional().default(10),
        search: z.string().optional(),
        role: z.enum(["admin", "editor", "viewer", "guest"]).optional(),
    }),
    params: z.object({}).passthrough(),
});

export const GetUserByIdSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
    params: ObjectIdParam,
});

export const CreateUserSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        username: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["admin", "editor", "viewer", "guest"]).optional().default("guest"),
        bio: z.string().optional().nullable(),
        themeId: z.string().optional().nullable(),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export const UpdateUserSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        username: z.string().min(1).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        role: z.enum(["admin", "editor", "viewer", "guest"]).optional(),
        bio: z.string().optional().nullable(),
        themeId: z.string().optional().nullable(),
    }),
    query: z.object({}).passthrough(),
    params: ObjectIdParam,
});

/**
 * Multipart variant: FE sends a single field `user` with JSON string.
 * Example:
 *  data.append("user", new Blob([JSON.stringify(dto)], { type: "application/json" }));
 *  data.append("image", file);
 */
export const UpdateUserMultipartSchema = z.object({
    body: z.object({
        user: z.string().min(2), // JSON string
    }),
    query: z.object({}).passthrough(),
    params: ObjectIdParam,
});

export const DeleteUserSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
    params: ObjectIdParam,
});

export type ListUsersQuery = z.infer<typeof ListUsersSchema>["query"];
export type CreateUserBody = z.infer<typeof CreateUserSchema>["body"];
export type UpdateUserBody = z.infer<typeof UpdateUserSchema>["body"];
export type UpdateUserMultipartBody = z.infer<typeof UpdateUserMultipartSchema>["body"];