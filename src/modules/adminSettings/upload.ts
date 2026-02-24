import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import type { Request } from "express";
import { cloudinary, assertCloudinaryConfigured } from "../../integrations/cloudinary";

assertCloudinaryConfigured();

/**
 * Spring parity:
 * Use fixed public_id: setting_<fieldName> so uploads overwrite. :contentReference[oaicite:10]{index=10}
 */
export const uploadAdminSettingsAssets = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: ((req: Request, file: Express.Multer.File) => {
            const field = file.fieldname; // logoLight, logoDark, favicon, ogImage, aboutImage
            const extOk =
                ["logoLight", "logoDark", "ogImage", "aboutImage"].includes(field)
                    ? ["jpg", "jpeg", "png", "webp"]
                    : ["jpg", "jpeg", "png", "webp", "ico"];

            return {
                folder: "sweeties-crochet/admin-settings",
                allowed_formats: extOk,
                public_id: `setting_${field}`,
                transformation: [{ width: 1600, height: 1600, crop: "limit" }],
            } as any;
        }) as any,
    }),
});