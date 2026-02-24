import type { Response } from "express";
import { env, isProd, getCookieSecure } from "../config/env";

const COOKIE_NAME = "refreshToken";

function sameSiteValue(): "lax" | "strict" | "none" {
    // In cross-domain prod (Vercel + Railway), you typically need "none" + secure=true
    return env.COOKIE_SAMESITE ?? (isProd ? "none" : "lax");
}

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
    const days = env.REFRESH_COOKIE_DAYS ?? 30;

    res.cookie(COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: getCookieSecure(), // prod => true
        sameSite: sameSiteValue(),
        path: "/",
        maxAge: days * 24 * 60 * 60 * 1000,
    });
}

export function clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: getCookieSecure(),
        sameSite: sameSiteValue(),
        path: "/",
    });
}

export function getRefreshTokenCookieName(): string {
    return COOKIE_NAME;
}