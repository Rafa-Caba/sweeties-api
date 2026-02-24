export type ThemeDTO = {
    id: string;
    name: string;
    isDark: boolean;

    primaryColor: string | null;
    accentColor: string | null;
    backgroundColor: string | null;
    textColor: string | null;
    cardColor: string | null;
    buttonColor: string | null;
    navColor: string | null;
};