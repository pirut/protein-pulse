import { MD3LightTheme as PaperDefaultTheme, MD3DarkTheme as PaperDarkTheme } from "react-native-paper";

export type ThemeMode = "light" | "dark";

export const getAppTheme = (mode: ThemeMode) => {
    const base = mode === "dark" ? PaperDarkTheme : PaperDefaultTheme;

    // Keep palette modern and accessible. Use only keys Paper understands and add a "custom" bucket for app-level tokens.
    const colors = {
        ...base.colors,
        // Emerald green palette
        primary: mode === "dark" ? "#34D399" : "#10B981",
        secondary: mode === "dark" ? "#22C55E" : "#059669",
        background: mode === "dark" ? "#0B1220" : "#F6F8FA",
        surface: mode === "dark" ? "#111827" : "#FFFFFF",
        surfaceVariant: mode === "dark" ? "#1F2937" : "#F1F5F9",
        outline: mode === "dark" ? "#374151" : "#E5E7EB",
        onSurface: mode === "dark" ? "#E5E7EB" : "#0F172A",
        onBackground: mode === "dark" ? "#E5E7EB" : "#0F172A",
    } as typeof base.colors & {
        surfaceVariant?: string;
        outline?: string;
        onSurface?: string;
        onBackground?: string;
    };

    return {
        ...base,
        roundness: 12,
        colors,
        // App-level tokens
        custom: {
            radius: 12,
            spacing: 16,
            smallSpacing: 8,
            headerTitleSize: 22,
            // Typography scale
            typography: {
                h1: { fontSize: 32, fontWeight: "700" as const },
                h2: { fontSize: 28, fontWeight: "600" as const },
                h3: { fontSize: 24, fontWeight: "600" as const },
                h4: { fontSize: 20, fontWeight: "600" as const },
                body: { fontSize: 16, fontWeight: "400" as const },
                bodySmall: { fontSize: 14, fontWeight: "400" as const },
                caption: { fontSize: 12, fontWeight: "400" as const },
            },
        },
    } as typeof base & {
        custom: {
            radius: number;
            spacing: number;
            smallSpacing: number;
            headerTitleSize: number;
            typography: {
                h1: { fontSize: number; fontWeight: "700" };
                h2: { fontSize: number; fontWeight: "600" };
                h3: { fontSize: number; fontWeight: "600" };
                h4: { fontSize: number; fontWeight: "600" };
                body: { fontSize: number; fontWeight: "400" };
                bodySmall: { fontSize: number; fontWeight: "400" };
                caption: { fontSize: number; fontWeight: "400" };
            };
        };
    };
};
