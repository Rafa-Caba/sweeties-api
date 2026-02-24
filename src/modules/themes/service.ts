import mongoose from "mongoose";
import { ThemeModel, toThemeDTO } from "./model";
import type { ThemeDTO } from "./types";
import { UserModel, toPublicUser } from "../users/model";
import { Errors } from "../../utils/ApiError";
import { PublicUser } from "../users/types";

function assertValidObjectId(id: string, label: string): void {
    if (!mongoose.isValidObjectId(id)) {
        throw Errors.badRequest(`Invalid ${label} id`);
    }
}

export async function getAllThemes(): Promise<ThemeDTO[]> {
    const themes = await ThemeModel.find().sort({ name: 1 });
    return themes.map(toThemeDTO);
}

export async function setMyTheme(params: { userId: string; themeId: string }): Promise<PublicUser> {
    assertValidObjectId(params.userId, "user");
    assertValidObjectId(params.themeId, "theme");

    const theme = await ThemeModel.findById(params.themeId);
    if (!theme) {
        throw Errors.notFound("Tema no encontrado");
    }

    const user = await UserModel.findById(params.userId);
    if (!user) {
        throw Errors.notFound("Usuario no encontrado");
    }

    user.themeId = theme._id;
    await user.save();

    return toPublicUser(user);
}