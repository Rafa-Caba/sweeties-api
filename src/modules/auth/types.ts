import type { Role } from "../../types/roles";
import type { PublicUser } from "../users/types";

export type AccessTokenPayload = {
    sub: string; // userId
    role: Role;
    email?: string | null;
};

export type RefreshTokenPayload = {
    sub: string; // userId
    tokenId: string; // optional if you ever bind refresh JWTs to DB records
};

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    role: Role;
    user: PublicUser;
};

export type RefreshResponse = {
    accessToken: string;
    refreshToken: string;
    role: Role;
};