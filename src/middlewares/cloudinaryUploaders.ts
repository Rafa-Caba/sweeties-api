import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import type { Request } from "express";

import {
    cloudinary,
    assertCloudinaryConfigured,
    buildPublicId,
    safeSlug,
} from "../integrations/cloudinary";

assertCloudinaryConfigured();

type UploaderConfig = {
    folder: string;
    allowedFormats: string[];
    prefix: string; // e.g. "usuario", "item", "settings"
    maxWidth?: number;
    maxHeight?: number;
};

function createCloudinaryUploader(config: UploaderConfig) {
    const { folder, allowedFormats, prefix, maxWidth = 1600, maxHeight = 1600 } =
        config;

    return multer({
        storage: new CloudinaryStorage({
            cloudinary,
            // multer-storage-cloudinary typings vary a lot across versions
            // so we keep params callback typed and return a plain object.
            params: ((req: Request, file: Express.Multer.File) => {
                const originalBase =
                    file.originalname?.split(".").slice(0, -1).join(".") || prefix;
                const slug = safeSlug(originalBase);

                const publicId = `${prefix}_${buildPublicId(slug)}`;

                const params: Record<string, unknown> = {
                    folder,
                    allowed_formats: allowedFormats,
                    public_id: publicId,
                    transformation: [{ width: maxWidth, height: maxHeight, crop: "limit" }],
                };

                return params;
            }) as any,
        }),
    });
}

/** Upload profile picture */
export const uploadUserImage = createCloudinaryUploader({
    folder: "sweeties-crochet/users",
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
    prefix: "usuario",
});

/** Upload for product items */
export const uploadItemImage = createCloudinaryUploader({
    folder: "sweeties-crochet/items",
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
    prefix: "item",
});

/** Upload for Admin Settings (logo / icon / etc.) */
export const uploadSettingsImages = createCloudinaryUploader({
    folder: "sweeties-crochet/admin-settings",
    allowedFormats: ["jpg", "jpeg", "png", "webp", "ico"],
    prefix: "settings",
});