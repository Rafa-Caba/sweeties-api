import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { AccessTokenPayload, RefreshTokenPayload } from "../modules/auth/types";

export type JwtKind = "access" | "refresh";

function secretFor(kind: JwtKind): jwt.Secret {
    return kind === "access" ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET;
}

function expiresFor(kind: JwtKind): NonNullable<SignOptions["expiresIn"]> {
    const raw =
        kind === "access" ? env.JWT_ACCESS_EXPIRES_IN : env.JWT_REFRESH_EXPIRES_IN;
    return raw as NonNullable<SignOptions["expiresIn"]>;
}

export function signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, secretFor("access"), {
        expiresIn: expiresFor("access"),
    });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, secretFor("refresh"), {
        expiresIn: expiresFor("refresh"),
    });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, secretFor("access")) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, secretFor("refresh")) as RefreshTokenPayload;
}