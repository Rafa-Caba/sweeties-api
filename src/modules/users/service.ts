import mongoose from "mongoose";
import { hashPassword } from "../../auth/password";
import { UserModel, toPublicUser, type UserDoc } from "./model";
import { Errors } from "../../utils/ApiError";
import { PublicUser } from "./types";

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function normalizeUsername(username: string): string {
    return username.trim().toLowerCase();
}

function assertValidObjectId(id: string, label: string): void {
    if (!mongoose.isValidObjectId(id)) {
        throw Errors.badRequest(`Invalid ${label} id`);
    }
}

async function ensureUnique(params: {
    email?: string;
    username?: string;
    ignoreUserId?: string;
}): Promise<void> {
    const { email, username, ignoreUserId } = params;

    if (email) {
        const existing = await UserModel.findOne({
            email,
            ...(ignoreUserId ? { _id: { $ne: ignoreUserId } } : {}),
        });
        if (existing) {
            throw Errors.conflict("Email already in use");
        }
    }

    if (username) {
        const existing = await UserModel.findOne({
            username,
            ...(ignoreUserId ? { _id: { $ne: ignoreUserId } } : {}),
        });
        if (existing) {
            throw Errors.conflict("Username already in use");
        }
    }
}

export async function getMe(userId: string): Promise<PublicUser> {
    assertValidObjectId(userId, "user");

    const user = await UserModel.findById(userId);
    if (!user) {
        throw Errors.notFound("User not found");
    }
    return toPublicUser(user);
}

export async function listUsers(query: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
}): Promise<{ page: number; limit: number; total: number; items: PublicUser[] }> {
    const { page, limit, search, role } = query;

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;

    if (search && search.trim()) {
        const s = search.trim();
        (filter as any).$or = [
            { name: { $regex: s, $options: "i" } },
            { username: { $regex: s, $options: "i" } },
            { email: { $regex: s, $options: "i" } },
        ];
    }

    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
        UserModel.countDocuments(filter),
        UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return {
        page,
        limit,
        total,
        items: docs.map(toPublicUser),
    };
}

export async function getUserById(id: string): Promise<PublicUser> {
    assertValidObjectId(id, "user");

    const user = await UserModel.findById(id);
    if (!user) {
        throw Errors.notFound("User not found");
    }

    return toPublicUser(user);
}

export async function createUser(params: {
    name: string;
    username: string;
    email: string;
    password: string;
    role: "admin" | "editor" | "viewer" | "guest";
    bio?: string | null;
    themeId?: string | null;
    imageUrl?: string | null;
    imagePublicId?: string | null;
}): Promise<PublicUser> {
    const email = normalizeEmail(params.email);
    const username = normalizeUsername(params.username);

    await ensureUnique({ email, username });

    const passwordHash = await hashPassword(params.password);

    const user = await UserModel.create({
        name: params.name.trim(),
        username,
        email,
        passwordHash,
        role: params.role,
        bio: params.bio ?? null,
        themeId: params.themeId ?? null,
        imageUrl: params.imageUrl ?? null,
        imagePublicId: params.imagePublicId ?? null,
    });

    return toPublicUser(user as UserDoc);
}

export async function updateUser(params: {
    id: string;
    patch: {
        name?: string;
        username?: string;
        email?: string;
        password?: string;
        role?: "admin" | "editor" | "viewer" | "guest";
        bio?: string | null;
        themeId?: string | null;
    };
    imageUrl?: string | null;
    imagePublicId?: string | null;
}): Promise<PublicUser> {
    const { id, patch } = params;

    assertValidObjectId(id, "user");

    const user = await UserModel.findById(id);
    if (!user) {
        throw Errors.notFound("User not found");
    }

    const nextEmail = patch.email ? normalizeEmail(patch.email) : undefined;
    const nextUsername = patch.username ? normalizeUsername(patch.username) : undefined;

    await ensureUnique({
        email: nextEmail,
        username: nextUsername,
        ignoreUserId: id,
    });

    if (patch.name !== undefined) user.name = patch.name.trim();
    if (nextUsername !== undefined) user.username = nextUsername;
    if (nextEmail !== undefined) user.email = nextEmail;

    if (patch.role !== undefined) user.role = patch.role;
    if (patch.bio !== undefined) user.bio = patch.bio ?? null;
    if (patch.themeId !== undefined) user.themeId = patch.themeId ? (patch.themeId as any) : null;

    if (patch.password !== undefined) {
        user.passwordHash = await hashPassword(patch.password);
    }

    if (params.imageUrl !== undefined) user.imageUrl = params.imageUrl ?? null;
    if (params.imagePublicId !== undefined) user.imagePublicId = params.imagePublicId ?? null;

    await user.save();
    return toPublicUser(user);
}

export async function deleteUser(id: string): Promise<void> {
    assertValidObjectId(id, "user");

    const res = await UserModel.deleteOne({ _id: id });
    if (res.deletedCount === 0) {
        throw Errors.notFound("User not found");
    }
}