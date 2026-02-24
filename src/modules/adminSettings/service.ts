import { AdminSettingsModel, toAdminSettingsDTO, toPublicAdminSettingsDTO } from "./model";
import type { UpdateAdminSettingsDTOInput } from "./schemas";
import { deleteFromCloudinaryByPublicId } from "../../utils/cloudinaryDelete";

type UploadedFile = { url: string; publicId: string };

async function getSingleton(): Promise<any> {
    let doc = await AdminSettingsModel.findOne();
    if (!doc) {
        doc = await AdminSettingsModel.create({ siteName: "Sweeties" });
    }
    return doc;
}

function updateIfDefined<T>(value: T | undefined | null, setter: (v: T) => void): void {
    if (value !== undefined && value !== null) setter(value);
}

export async function getAdminSettings() {
    const s = await getSingleton();
    return toAdminSettingsDTO(s);
}

export async function getPublicSettings() {
    const s = await getSingleton();
    return toPublicAdminSettingsDTO(s);
}

export async function updateAdminSettings(params: {
    dto: UpdateAdminSettingsDTOInput;
    files: Partial<Record<"logoLight" | "logoDark" | "favicon" | "ogImage" | "aboutImage", UploadedFile>>;
}) {
    const s = await getSingleton();
    const dto = params.dto;

    // 1) Patch-like updates (Spring updateField logic):contentReference[oaicite:12]{index=12}
    updateIfDefined(dto.siteName, (v) => (s.siteName = v));
    updateIfDefined(dto.siteTagline, (v) => (s.siteTagline = v));

    updateIfDefined(dto.contactEmail, (v) => (s.contactEmail = v));
    updateIfDefined(dto.contactPhone, (v) => (s.contactPhone = v));
    updateIfDefined(dto.contactWhatsApp, (v) => (s.contactWhatsApp = v));
    updateIfDefined(dto.contactAddress, (v) => (s.contactAddress = v));

    if (dto.about?.bio !== undefined && dto.about?.bio !== null) {
        s.about = s.about ?? {};
        s.about.bio = dto.about.bio;
    }

    if (dto.social !== undefined && dto.social !== null) {
        s.social = dto.social;
    }

    updateIfDefined(dto.defaultThemeMode, (v) => (s.defaultThemeMode = v));
    updateIfDefined(dto.publicThemeGroup, (v) => (s.publicThemeGroup = v));
    updateIfDefined(dto.adminThemeGroup, (v) => (s.adminThemeGroup = v));

    if (dto.features) {
        s.features = s.features ?? {};
        Object.assign(s.features, dto.features);
    }

    if (dto.seo) {
        s.seo = s.seo ?? {};
        Object.assign(s.seo, dto.seo);
    }

    if (dto.visibility) {
        s.visibility = s.visibility ?? {};
        Object.assign(s.visibility, dto.visibility);
    }

    if (dto.home) {
        s.home = s.home ?? {};
        Object.assign(s.home, dto.home);
    }

    if (dto.gallery) {
        s.gallery = s.gallery ?? {};
        Object.assign(s.gallery, dto.gallery);
    }

    if (dto.footer) {
        s.footer = s.footer ?? {};
        Object.assign(s.footer, dto.footer);
    }

    // 2) Uploads (Spring: delete old best-effort, upload fixed public id):contentReference[oaicite:13]{index=13}
    const f = params.files;

    async function setBrandingImage(field: "logoLight" | "logoDark" | "favicon", urlKey: string, pidKey: string) {
        const file = f[field];
        if (!file) return;

        const oldPid = (s as any)[pidKey] as string | null;
        if (oldPid) {
            try { await deleteFromCloudinaryByPublicId(oldPid); } catch { }
        }

        (s as any)[urlKey] = file.url;
        (s as any)[pidKey] = file.publicId;
    }

    await setBrandingImage("logoLight", "logoLightUrl", "logoLightPublicId");
    await setBrandingImage("logoDark", "logoDarkUrl", "logoDarkPublicId");
    await setBrandingImage("favicon", "faviconUrl", "faviconPublicId");

    // SEO og image
    if (f.ogImage) {
        const oldPid = s.seo?.ogImagePublicId;
        if (oldPid) {
            try { await deleteFromCloudinaryByPublicId(oldPid); } catch { }
        }

        s.seo = s.seo ?? {};
        s.seo.ogImageUrl = f.ogImage.url;
        s.seo.ogImagePublicId = f.ogImage.publicId;
    }

    // About image
    if (f.aboutImage) {
        const oldPid = s.about?.imagePublicId;
        if (oldPid) {
            try { await deleteFromCloudinaryByPublicId(oldPid); } catch { }
        }

        s.about = s.about ?? {};
        s.about.imageUrl = f.aboutImage.url;
        s.about.imagePublicId = f.aboutImage.publicId;
    }

    await s.save();
    return toAdminSettingsDTO(s);
}