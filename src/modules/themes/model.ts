import mongoose, { type InferSchemaType } from "mongoose";
import type { ThemeDTO } from "./types";

const ThemeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        isDark: { type: Boolean, default: false },

        primaryColor: { type: String, default: null },
        accentColor: { type: String, default: null },
        backgroundColor: { type: String, default: null },
        textColor: { type: String, default: null },
        cardColor: { type: String, default: null },
        buttonColor: { type: String, default: null },
        navColor: { type: String, default: null },
    },
    { timestamps: true }
);

ThemeSchema.index({ name: 1 }, { unique: true });

export type ThemeDoc = InferSchemaType<typeof ThemeSchema> & {
    _id: mongoose.Types.ObjectId;
};

export const ThemeModel =
    (mongoose.models.Theme as mongoose.Model<ThemeDoc>) ||
    mongoose.model<ThemeDoc>("Theme", ThemeSchema);

export function toThemeDTO(t: ThemeDoc): ThemeDTO {
    return {
        id: t._id.toString(),
        name: t.name,
        isDark: !!t.isDark,

        primaryColor: t.primaryColor ?? null,
        accentColor: t.accentColor ?? null,
        backgroundColor: t.backgroundColor ?? null,
        textColor: t.textColor ?? null,
        cardColor: t.cardColor ?? null,
        buttonColor: t.buttonColor ?? null,
        navColor: t.navColor ?? null,
    };
}