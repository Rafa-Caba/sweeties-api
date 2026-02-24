export type ThemeMode = "LIGHT" | "DARK" | "SYSTEM";

export type Social = {
    facebook?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    threads?: string | null;
    x?: string | null;
};

export type AuxiliaryLink = {
    label: string;
    url: string;
};

export type About = {
    bio?: string | null;
    imageUrl?: string | null;
    imagePublicId?: string | null;
};

export type Features = {
    enableOrders: boolean;
    enableGallery: boolean;
    enableMaterials: boolean;
    enableContactPage: boolean;
    enableCart: boolean;
};

export type Seo = {
    siteDescription?: string | null;
    metaKeywords?: string[] | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImageUrl?: string | null;
    ogImagePublicId?: string | null;
};

export type Visibility = {
    showEmail: boolean;
    showPhone: boolean;
    showWhatsApp: boolean;
    showAddress: boolean;
    showSocial: boolean;
};

export type Home = {
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    creatorName?: string | null;
};

export type Gallery = {
    itemsPerPage?: number | null;
};

export type Footer = {
    legalText?: string | null;
    auxiliaryLinks?: AuxiliaryLink[] | null;
};

export type AdminSettingsDTO = {
    siteName: string;
    siteTagline: string | null;

    logoLightUrl: string | null;
    logoLightPublicId: string | null;
    logoDarkUrl: string | null;
    logoDarkPublicId: string | null;
    faviconUrl: string | null;
    faviconPublicId: string | null;

    contactEmail: string | null;
    contactPhone: string | null;
    contactWhatsApp: string | null;
    contactAddress: string | null;

    about: About;
    social: Social;

    defaultThemeMode: ThemeMode;
    publicThemeGroup: string | null;
    adminThemeGroup: string | null;

    features: Features;
    seo: Seo;
    visibility: Visibility;
    home: Home;
    gallery: Gallery;
    footer: Footer;
};

export type PublicAdminSettingsDTO = {
    siteName: string;
    siteTagline: string | null;

    logoLightUrl: string | null;
    logoDarkUrl: string | null;
    faviconUrl: string | null;

    contactEmail: string | null;
    contactPhone: string | null;
    contactWhatsApp: string | null;
    contactAddress: string | null;

    about: About | null;
    social: Social | null;

    defaultThemeMode: ThemeMode;
    publicThemeGroup: string | null;

    // SEO excerpt exposed publicly in Spring
    siteDescription: string | null;
    metaKeywords: string[] | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageUrl: string | null;

    visibility: Visibility;
    home: Home;
    gallery: Gallery;
    footer: Footer;
};