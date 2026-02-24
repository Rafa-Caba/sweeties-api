import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../auth/jwt";
import type { Role } from "../types/roles";

export type AuthUser = {
    id: string;
    role: Role;
    email: string | null;
};

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

function getBearerToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header) return null;

    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) return null;

    return token.trim();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const token = getBearerToken(req);

    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const payload = verifyAccessToken(token);

        req.user = {
            id: payload.sub,
            role: payload.role as Role,
            email: payload.email ?? null,
        };

        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}