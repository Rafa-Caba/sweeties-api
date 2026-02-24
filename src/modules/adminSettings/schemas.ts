import { z } from "zod";
import { ROLES } from "../../types/roles";

const ThemeModeSchema = z.enum(["LIGHT", "DARK", "SYSTEM"]);

const FeaturesUpdateSchema = z.object({
    enableOrders: z.boolean().optional(),
    enableGallery: z.boolean().optional(),
    enableMaterials: z.boolean().optional(),
    enableContactPage: z.boolean().optional(),
    enableCart: z.boolean().optional(),
});

const SeoUpdateSchema = z.object({
    siteDescription: z.string().optional(),
    metaKeywords: z.array(z.string()).optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
});

const VisibilityUpdateSchema = z.object({
    showEmail: z.boolean().optional(),
    showPhone: z.boolean().optional(),
    showWhatsApp: z.boolean().optional(),
    showAddress: z.boolean().optional(),
    showSocial: z.boolean().optional(),
});

const HomeUpdateSchema = z.object({
    heroTitle: z.string().optional(),
    heroSubtitle: z.string().optional(),
    creatorName: z.string().optional(),
});

const AboutUpdateSchema = z.object({
    bio: z.string().optional(),
});

const GalleryUpdateSchema = z.object({
    itemsPerPage: z.coerce.number().int().min(1).max(100).optional(),
});

const AuxiliaryLinkSchema = z.object({
    label: z.string().min(1),
    url: z.string().min(1),
});

const FooterUpdateSchema = z.object({
    legalText: z.string().optional(),
    auxiliaryLinks: z.array(AuxiliaryLinkSchema).optional(),
});

const SocialSchema = z.object({
    facebook: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    tiktok: z.string().optional().nullable(),
    youtube: z.string().optional().nullable(),
    threads: z.string().optional().nullable(),
    x: z.string().optional().nullable(),
});

export const UpdateAdminSettingsDTOSchema = z.object({
    siteName: z.string().optional(),
    siteTagline: z.string().optional().nullable(),

    contactEmail: z.string().optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    contactWhatsApp: z.string().optional().nullable(),
    contactAddress: z.string().optional().nullable(),

    about: AboutUpdateSchema.optional(),
    social: SocialSchema.optional(),

    defaultThemeMode: ThemeModeSchema.optional(),
    publicThemeGroup: z.string().optional().nullable(),
    adminThemeGroup: z.string().optional().nullable(),

    features: FeaturesUpdateSchema.optional(),
    seo: SeoUpdateSchema.optional(),
    visibility: VisibilityUpdateSchema.optional(),
    home: HomeUpdateSchema.optional(),
    gallery: GalleryUpdateSchema.optional(),
    footer: FooterUpdateSchema.optional(),
});

export const UpdateAdminSettingsMultipartSchema = z.object({
    body: z.object({
        settings: z.string().min(2),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export const GetAdminSettingsSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export const GetPublicSettingsSchema = z.object({
    body: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export type UpdateAdminSettingsDTOInput = z.infer<typeof UpdateAdminSettingsDTOSchema>;