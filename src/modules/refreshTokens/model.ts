import mongoose, { type InferSchemaType } from "mongoose";

const RefreshTokenSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        token: { type: String, required: true, unique: true, index: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export type RefreshTokenDoc = InferSchemaType<typeof RefreshTokenSchema> & {
    _id: mongoose.Types.ObjectId;
};

export const RefreshTokenModel =
    (mongoose.models.RefreshToken as mongoose.Model<RefreshTokenDoc>) ||
    mongoose.model<RefreshTokenDoc>("RefreshToken", RefreshTokenSchema);