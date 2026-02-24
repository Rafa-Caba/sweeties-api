import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../auth/jwt";

function getBearerToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header) return null;

    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) return null;

    return token.trim();
}

export function attachUser(req: Request, _res: Response, next: NextFunction): void {
    const token = getBearerToken(req);
    if (!token) return next();

    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.sub,
            role: payload.role,
            email: payload.email ?? null,
        };
    } catch {
        // ignore invalid token for attach middleware
    }

    next();
}