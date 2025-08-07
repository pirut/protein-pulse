import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAppTheme, ThemeMode } from "./theme";
import { StorageService } from "./services/storage";

type ThemeContextValue = {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useThemeMode = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
    return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setModeState] = useState<ThemeMode>("light");

    useEffect(() => {
        (async () => {
            const profile = await StorageService.getUserProfile();
            setModeState(profile.theme);
        })();
    }, []);

    const setMode = (next: ThemeMode) => {
        setModeState(next);
    };

    const value = useMemo(() => ({ mode, setMode }), [mode]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const usePaperTheme = () => {
    const { mode } = useThemeMode();
    return getAppTheme(mode);
};
