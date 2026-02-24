import { ThemeModel } from "./model";

type SeedTheme = {
    name: string;
    isDark: boolean;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    cardColor: string;
    buttonColor: string;
    navColor: string;
};

const SEED_THEMES: SeedTheme[] = [
    {
        name: "Clásico",
        isDark: false,
        primaryColor: "#a88ff7",
        accentColor: "#673ab7",
        backgroundColor: "#fefefe",
        textColor: "#2a2a2a",
        cardColor: "#ffffff",
        buttonColor: "#6a0dad",
        navColor: "rgba(255, 255, 255, 0.85)",
    },
    {
        name: "Noche",
        isDark: true,
        primaryColor: "#bca2ff",
        accentColor: "#c792ea",
        backgroundColor: "#1e1e1e",
        textColor: "#fefefe",
        cardColor: "#2a2a2a",
        buttonColor: "#a774f9",
        navColor: "rgba(28, 24, 36, 0.85)",
    },
    {
        name: "Dulce",
        isDark: false,
        primaryColor: "#ff8fab",
        accentColor: "#fb6f92",
        backgroundColor: "#fff0f3",
        textColor: "#590d22",
        cardColor: "#fff5f8",
        buttonColor: "#ff4d6d",
        navColor: "rgba(255, 240, 243, 0.9)",
    },
];

export async function ensureThemes(): Promise<void> {
    // If any theme exists, we still upsert by name to keep them aligned
    for (const t of SEED_THEMES) {
        await ThemeModel.updateOne(
            { name: t.name },
            {
                $set: {
                    isDark: t.isDark,
                    primaryColor: t.primaryColor,
                    accentColor: t.accentColor,
                    backgroundColor: t.backgroundColor,
                    textColor: t.textColor,
                    cardColor: t.cardColor,
                    buttonColor: t.buttonColor,
                    navColor: t.navColor,
                },
            },
            { upsert: true }
        );
    }
}