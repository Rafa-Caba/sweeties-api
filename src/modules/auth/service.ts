import { hashPassword, verifyPassword } from "../../auth/password";
import { signAccessToken } from "../../auth/jwt";
import { UserModel, toPublicUser } from "../users/model";
import { RefreshTokenModel } from "../refreshTokens/model";
import { Errors } from "../../utils/ApiError";
import { AuthResponse } from "./types";

function now(): number {
    return Date.now();
}

function addDays(d: number): Date {
    return new Date(now() + d * 24 * 60 * 60 * 1000);
}

const REFRESH_DAYS_DEFAULT = 7;

function randomToken(): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require("crypto") as typeof import("crypto");
    return crypto.randomUUID();
}

export async function login(params: { usernameOrEmail: string; password: string }): Promise<AuthResponse> {
    const loginIdentifier = params.usernameOrEmail.trim().toLowerCase();

    const user = await UserModel.findOne({
        $or: [{ username: loginIdentifier }, { email: loginIdentifier }],
    });

    if (!user) {
        throw Errors.unauthorized("Invalid credentials");
    }

    const ok = await verifyPassword(params.password, user.passwordHash);
    if (!ok) {
        throw Errors.unauthorized("Invalid credentials");
    }

    const accessToken = signAccessToken({
        sub: user._id.toString(),
        role: user.role,
        email: user.email,
    });

    const refreshTokenValue = randomToken();

    await RefreshTokenModel.create({
        userId: user._id,
        token: refreshTokenValue,
        expiresAt: addDays(REFRESH_DAYS_DEFAULT),
    });

    return {
        accessToken,
        refreshToken: refreshTokenValue,
        role: user.role as any,
        user: toPublicUser(user as any),
    };
}

export async function register(params: {
    name: string;
    username: string;
    email: string;
    password: string;
}): Promise<AuthResponse> {
    const username = params.username.trim().toLowerCase();
    const email = params.email.trim().toLowerCase();

    const existsEmail = await UserModel.findOne({ email });
    if (existsEmail) {
        throw Errors.conflict("Email already in use");
    }

    const existsUsername = await UserModel.findOne({ username });
    if (existsUsername) {
        throw Errors.conflict("Username already in use");
    }

    const passwordHash = await hashPassword(params.password);

    const user = await UserModel.create({
        name: params.name.trim(),
        username,
        email,
        passwordHash,
        role: "admin", // parity with your Spring register default
    });

    const accessToken = signAccessToken({
        sub: user._id.toString(),
        role: user.role,
        email: user.email,
    });

    const refreshTokenValue = randomToken();
    await RefreshTokenModel.create({
        userId: user._id,
        token: refreshTokenValue,
        expiresAt: addDays(REFRESH_DAYS_DEFAULT),
    });

    return {
        accessToken,
        refreshToken: refreshTokenValue,
        role: user.role as any,
        user: toPublicUser(user as any),
    };
}

export async function refreshRotate(oldToken: string): Promise<{ accessToken: string; refreshToken: string; role: string }> {
    const existing = await RefreshTokenModel.findOne({ token: oldToken });

    if (!existing || existing.expiresAt.getTime() <= now()) {
        throw Errors.unauthorized("Token inválido o expirado");
    }

    const user = await UserModel.findById(existing.userId);
    if (!user) {
        await RefreshTokenModel.deleteOne({ _id: existing._id });
        throw Errors.unauthorized("Token inválido o expirado");
    }

    await RefreshTokenModel.deleteOne({ _id: existing._id });

    const newToken = randomToken();
    await RefreshTokenModel.create({
        userId: user._id,
        token: newToken,
        expiresAt: addDays(REFRESH_DAYS_DEFAULT),
    });

    const accessToken = signAccessToken({
        sub: user._id.toString(),
        role: user.role,
        email: user.email,
    });

    return { accessToken, refreshToken: newToken, role: user.role };
}

export async function logoutToken(token?: string | null): Promise<void> {
    if (!token) return;
    await RefreshTokenModel.deleteOne({ token });
}