import { AdminSettingsModel } from "./model";

export async function ensureAdminSettings(): Promise<void> {
    const exists = await AdminSettingsModel.findOne();
    if (exists) return;

    await AdminSettingsModel.create({
        siteName: "Sweeties",
        siteTagline: null,

        // sensible defaults
        visibility: {
            showEmail: true,
            showPhone: true,
            showWhatsApp: true,
            showAddress: true,
            showSocial: true,
        },

        features: {
            enableOrders: true,
            enableGallery: true,
            enableMaterials: true,
            enableContactPage: true,
            enableCart: true,
        },

        gallery: { itemsPerPage: 10 },

        seo: {
            siteDescription: null,
            metaKeywords: [],
            ogTitle: null,
            ogDescription: null,
            ogImageUrl: null,
            ogImagePublicId: null,
        },

        about: {
            bio: null,
            imageUrl: null,
            imagePublicId: null,
        },

        social: {
            facebook: null,
            instagram: null,
            tiktok: null,
            youtube: null,
            threads: null,
            x: null,
        },

        home: {
            heroTitle: null,
            heroSubtitle: null,
            creatorName: null,
        },

        footer: {
            legalText: null,
            auxiliaryLinks: [],
        },

        defaultThemeMode: "SYSTEM",
        publicThemeGroup: null,
        adminThemeGroup: null,
    });
}