import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import type { Request } from "express";

import {
    cloudinary,
    assertCloudinaryConfigured,
    buildPublicId,
    safeSlug,
} from "../../integrations/cloudinary";

assertCloudinaryConfigured();

function createStorage() {
    return new CloudinaryStorage({
        cloudinary,
        params: ((req: Request, file: Express.Multer.File) => {
            const isSprite = file.fieldname === "sprites";
            const base =
                file.originalname?.split(".").slice(0, -1).join(".") || (isSprite ? "sprite" : "item");

            const slug = safeSlug(base);
            const prefix = isSprite ? "sprite" : "item";
            const publicId = `${prefix}_${buildPublicId(slug)}`;

            return {
                folder: "sweeties-crochet/items",
                allowed_formats: ["jpg", "jpeg", "png", "webp"],
                public_id: publicId,
                transformation: [{ width: 1600, height: 1600, crop: "limit" }],
            } as any;
        }) as any,
    });
}

export const uploadItemAssets = multer({
    storage: createStorage(),
});