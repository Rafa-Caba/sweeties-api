import mongoose, { type InferSchemaType } from "mongoose";
import type { PublicUser } from "./types";
import type { Role } from "../../types/roles";

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },

        username: { type: String, required: true, trim: true, lowercase: true },
        email: { type: String, required: true, trim: true, lowercase: true },

        passwordHash: { type: String, required: true },

        role: {
            type: String,
            enum: ["admin", "editor", "viewer", "guest"],
            default: "guest",
            required: true,
        },

        bio: { type: String, default: null },
        imageUrl: { type: String, default: null },
        imagePublicId: { type: String, default: null },

        themeId: { type: mongoose.Schema.Types.ObjectId, ref: "Theme", default: null },
    },
    { timestamps: true }
);

UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const UserModel =
    (mongoose.models.User as mongoose.Model<UserDoc>) ||
    mongoose.model<UserDoc>("User", UserSchema);

export function toPublicUser(u: UserDoc): PublicUser {
    return {
        id: u._id.toString(),
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role as Role,
        bio: u.bio ?? null,
        imageUrl: u.imageUrl ?? null,
        imagePublicId: u.imagePublicId ?? null,
        themeId: u.themeId ? String(u.themeId) : null,
    };
}