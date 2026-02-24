import { z } from "zod";

// Spring LoginRequestDTO: username (username OR email), password
export const LoginSchema = z.object({
    body: z.object({
        username: z.string().min(1),
        password: z.string().min(1),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

// Spring RegisterRequestDTO: name, username, email, password
export const RegisterSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        username: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

// Spring RefreshRequestDTO: refreshToken
// In our Node design, refreshToken may come from cookie; body is optional for compatibility.
export const RefreshSchema = z.object({
    body: z.object({
        refreshToken: z.string().optional(),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

// Logout uses RefreshRequestDTO in Spring
// We also allow cookie-only logout.
export const LogoutSchema = z.object({
    body: z.object({
        refreshToken: z.string().optional(),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export type LoginInput = z.infer<typeof LoginSchema>["body"];
export type RegisterInput = z.infer<typeof RegisterSchema>["body"];
export type RefreshInput = z.infer<typeof RefreshSchema>["body"];
export type LogoutInput = z.infer<typeof LogoutSchema>["body"];