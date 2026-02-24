import mongoose, { type InferSchemaType } from "mongoose";
import type {
    About,
    AdminSettingsDTO,
    AuxiliaryLink,
    Features,
    Footer,
    Gallery,
    Home,
    PublicAdminSettingsDTO,
    Seo,
    Social,
    ThemeMode,
    Visibility,
} from "./types";

const AuxiliaryLinkSchema = new mongoose.Schema(
    {
        label: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const AboutSchema = new mongoose.Schema(
    {
        bio: { type: String, default: null },
        imageUrl: { type: String, default: null },
        imagePublicId: { type: String, default: null },
    },
    { _id: false }
);

const SocialSchema = new mongoose.Schema(
    {
        facebook: { type: String, default: null },
        instagram: { type: String, default: null },
        tiktok: { type: String, default: null },
        youtube: { type: String, default: null },
        threads: { type: String, default: null },
        x: { type: String, default: null },
    },
    { _id: false }
);

const FeaturesSchema = new mongoose.Schema(
    {
        enableOrders: { type: Boolean, default: true },
        enableGallery: { type: Boolean, default: true },
        enableMaterials: { type: Boolean, default: true },
        enableContactPage: { type: Boolean, default: true },
        enableCart: { type: Boolean, default: true },
    },
    { _id: false }
);

const SeoSchema = new mongoose.Schema(
    {
        siteDescription: { type: String, default: null },
        metaKeywords: { type: [String], default: [] },
        ogTitle: { type: String, default: null },
        ogDescription: { type: String, default: null },
        ogImageUrl: { type: String, default: null },
        ogImagePublicId: { type: String, default: null },
    },
    { _id: false }
);

const VisibilitySchema = new mongoose.Schema(
    {
        showEmail: { type: Boolean, default: true },
        showPhone: { type: Boolean, default: true },
        showWhatsApp: { type: Boolean, default: true },
        showAddress: { type: Boolean, default: true },
        showSocial: { type: Boolean, default: true },
    },
    { _id: false }
);

const HomeSchema = new mongoose.Schema(
    {
        heroTitle: { type: String, default: null },
        heroSubtitle: { type: String, default: null },
        creatorName: { type: String, default: null },
    },
    { _id: false }
);

const GallerySchema = new mongoose.Schema(
    {
        itemsPerPage: { type: Number, default: 10, min: 1, max: 100 },
    },
    { _id: false }
);

const FooterSchema = new mongoose.Schema(
    {
        legalText: { type: String, default: null },
        auxiliaryLinks: { type: [AuxiliaryLinkSchema], default: [] },
    },
    { _id: false }
);

const AdminSettingsSchema = new mongoose.Schema(
    {
        // Branding
        siteName: { type: String, required: true, default: "Sweeties" },
        siteTagline: { type: String, default: null },

        logoLightUrl: { type: String, default: null },
        logoLightPublicId: { type: String, default: null },
        logoDarkUrl: { type: String, default: null },
        logoDarkPublicId: { type: String, default: null },
        faviconUrl: { type: String, default: null },
        faviconPublicId: { type: String, default: null },

        // Contact
        contactEmail: { type: String, default: null },
        contactPhone: { type: String, default: null },
        contactWhatsApp: { type: String, default: null },
        contactAddress: { type: String, default: null },

        about: { type: AboutSchema, default: () => ({}) },
        social: { type: SocialSchema, default: () => ({}) },

        defaultThemeMode: {
            type: String,
            enum: ["LIGHT", "DARK", "SYSTEM"],
            default: "SYSTEM",
        },

        publicThemeGroup: { type: String, default: null },
        adminThemeGroup: { type: String, default: null },

        features: { type: FeaturesSchema, default: () => ({}) },
        seo: { type: SeoSchema, default: () => ({}) },
        visibility: { type: VisibilitySchema, default: () => ({}) },
        home: { type: HomeSchema, default: () => ({}) },
        gallery: { type: GallerySchema, default: () => ({}) },
        footer: { type: FooterSchema, default: () => ({}) },
    },
    { timestamps: true }
);

export type AdminSettingsDoc = InferSchemaType<typeof AdminSettingsSchema> & {
    _id: mongoose.Types.ObjectId;
};

export const AdminSettingsModel =
    (mongoose.models.AdminSettings as mongoose.Model<AdminSettingsDoc>) ||
    mongoose.model<AdminSettingsDoc>("AdminSettings", AdminSettingsSchema);

export function toAdminSettingsDTO(s: AdminSettingsDoc): AdminSettingsDTO {
    return {
        siteName: s.siteName,
        siteTagline: s.siteTagline ?? null,

        logoLightUrl: s.logoLightUrl ?? null,
        logoLightPublicId: s.logoLightPublicId ?? null,
        logoDarkUrl: s.logoDarkUrl ?? null,
        logoDarkPublicId: s.logoDarkPublicId ?? null,
        faviconUrl: s.faviconUrl ?? null,
        faviconPublicId: s.faviconPublicId ?? null,

        contactEmail: s.contactEmail ?? null,
        contactPhone: s.contactPhone ?? null,
        contactWhatsApp: s.contactWhatsApp ?? null,
        contactAddress: s.contactAddress ?? null,

        about: (s.about as About) ?? { bio: null, imageUrl: null, imagePublicId: null },
        social: (s.social as Social) ?? {},

        defaultThemeMode: (s.defaultThemeMode as ThemeMode) ?? "SYSTEM",
        publicThemeGroup: s.publicThemeGroup ?? null,
        adminThemeGroup: s.adminThemeGroup ?? null,

        features: (s.features as Features) ?? {
            enableOrders: true,
            enableGallery: true,
            enableMaterials: true,
            enableContactPage: true,
            enableCart: true,
        },

        seo: (s.seo as Seo) ?? {
            siteDescription: null,
            metaKeywords: [],
            ogTitle: null,
            ogDescription: null,
            ogImageUrl: null,
            ogImagePublicId: null,
        },

        visibility: (s.visibility as Visibility) ?? {
            showEmail: true,
            showPhone: true,
            showWhatsApp: true,
            showAddress: true,
            showSocial: true,
        },

        home: (s.home as Home) ?? { heroTitle: null, heroSubtitle: null, creatorName: null },
        gallery: (s.gallery as Gallery) ?? { itemsPerPage: 10 },

        footer: (s.footer as Footer) ?? { legalText: null, auxiliaryLinks: [] },
    };
}

export function toPublicAdminSettingsDTO(s: AdminSettingsDoc): PublicAdminSettingsDTO {
    const v = (s.visibility as Visibility) ?? {
        showEmail: true,
        showPhone: true,
        showWhatsApp: true,
        showAddress: true,
        showSocial: true,
    };

    return {
        siteName: s.siteName,
        siteTagline: s.siteTagline ?? null,

        logoLightUrl: s.logoLightUrl ?? null,
        logoDarkUrl: s.logoDarkUrl ?? null,
        faviconUrl: s.faviconUrl ?? null,

        contactEmail: v.showEmail ? (s.contactEmail ?? null) : null,
        contactPhone: v.showPhone ? (s.contactPhone ?? null) : null,
        contactWhatsApp: v.showWhatsApp ? (s.contactWhatsApp ?? null) : null,
        contactAddress: v.showAddress ? (s.contactAddress ?? null) : null,

        about: (s.about as About) ?? { bio: null, imageUrl: null, imagePublicId: null },
        social: v.showSocial ? ((s.social as Social) ?? {}) : null,

        defaultThemeMode: (s.defaultThemeMode as ThemeMode) ?? "SYSTEM",
        publicThemeGroup: s.publicThemeGroup ?? null,

        siteDescription: s.seo?.siteDescription ?? null,
        metaKeywords: (s.seo?.metaKeywords as string[]) ?? [],
        ogTitle: s.seo?.ogTitle ?? null,
        ogDescription: s.seo?.ogDescription ?? null,
        ogImageUrl: s.seo?.ogImageUrl ?? null,

        visibility: v,
        home: (s.home as Home) ?? { heroTitle: null, heroSubtitle: null, creatorName: null },
        gallery: (s.gallery as Gallery) ?? { itemsPerPage: 10 },
        footer: (s.footer as Footer) ?? { legalText: null, auxiliaryLinks: [] },
    };
}