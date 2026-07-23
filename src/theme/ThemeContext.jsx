import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, } from 'react';
const THEME_STORAGE_KEY = 'appThemeMode';
const palette = {
    light: {
        mode: 'light',
        primary: '#0058bc',
        primaryLight: '#e8f0fe',
        secondary: '#006c4b',
        bg: '#f7f9fb',
        surface: '#ffffff',
        surfaceContainer: '#eceef0',
        surfaceContainerLow: '#f2f4f6',
        text: '#191c1e',
        textMuted: '#717786',
        border: '#c1c6d7',
        error: '#ba1a1a',
        errorLight: '#fdecea',
    },
    dark: {
        mode: 'dark',
        primary: '#7db7ff',
        primaryLight: '#102b46',
        secondary: '#68fcbf',
        bg: '#0f141a',
        surface: '#171d24',
        surfaceContainer: '#202832',
        surfaceContainerLow: '#1b222b',
        text: '#eef2f7',
        textMuted: '#a7b1c2',
        border: '#3a4656',
        error: '#ffb4ab',
        errorLight: '#3a1d1d',
    },
};
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
    const [mode, setThemeMode] = useState('light');
    useEffect(() => {
        const loadTheme = async () => {
            const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (storedMode === 'light' || storedMode === 'dark') {
                setThemeMode(storedMode);
            }
        };
        loadTheme();
    }, []);
    const setMode = async (nextMode) => {
        setThemeMode(nextMode);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    };
    const value = useMemo(() => ({
        colors: palette[mode],
        mode,
        isDark: mode === 'dark',
        setMode,
        toggleTheme: () => setMode(mode === 'dark' ? 'light' : 'dark'),
    }), [mode]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useAppTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useAppTheme must be used inside ThemeProvider');
    }
    return context;
}
