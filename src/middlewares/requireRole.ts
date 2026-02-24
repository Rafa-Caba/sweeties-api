import type { NextFunction, Request, Response } from "express";
import type { Role } from "../types/roles";

export function requireRole(...allowed: Role[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const role = req.user?.role as Role | undefined;

        if (!role) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!allowed.includes(role)) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        next();
    };
}