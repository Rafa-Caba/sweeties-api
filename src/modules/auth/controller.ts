import type { Request, Response } from "express";
import { getRefreshTokenCookieName, setRefreshTokenCookie, clearRefreshTokenCookie } from "../../auth/refreshCookies";
import * as AuthService from "./service";

function getRefreshFromReq(req: Request): string | null {
    const fromBody = (req.body?.refreshToken as string | undefined) ?? null;
    if (fromBody && fromBody.trim()) return fromBody.trim();

    const cookieName = getRefreshTokenCookieName();
    const fromCookie = (req.cookies?.[cookieName] as string | undefined) ?? null;
    if (fromCookie && fromCookie.trim()) return fromCookie.trim();

    return null;
}

export async function login(req: Request, res: Response): Promise<void> {
    const { username, password } = (req as any).validated.body;

    const result = await AuthService.login({
        usernameOrEmail: username,
        password,
    });

    // Cookie is the source of truth for refresh
    setRefreshTokenCookie(res, result.refreshToken);

    // Response parity with Spring: accessToken + refreshToken + role
    res.json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken, // FE can ignore
        role: result.role,
        user: result.user,
    });
}

export async function register(req: Request, res: Response): Promise<void> {
    const { name, username, email, password } = (req as any).validated.body;

    const result = await AuthService.register({
        name,
        username,
        email,
        password,
    });

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(201).json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        role: result.role,
        user: result.user,
    });
}

export async function refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = getRefreshFromReq(req);

    if (!refreshToken) {
        res.status(401).json({ error: "Unauthorized", message: "Missing refresh token" });
        return;
    }

    const result = await AuthService.refreshRotate(refreshToken);

    setRefreshTokenCookie(res, result.refreshToken);

    res.json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        role: result.role,
    });
}

export async function logout(req: Request, res: Response): Promise<void> {
    const refreshToken = getRefreshFromReq(req);

    await AuthService.logoutToken(refreshToken);
    clearRefreshTokenCookie(res);

    res.json({ message: "Logout successful" });
}