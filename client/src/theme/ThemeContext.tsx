import React, { createContext, useState, useMemo, useContext, ReactNode, useEffect } from 'react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { getDesignTokens } from './theme';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeContextProvider');
    }
    return context;
};

export const ThemeContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => { setIsDark((prev) => !prev); localStorage.setItem('preferred-theme', !isDark ? 'dark' : 'light') };

    const theme = useMemo(() => createTheme(getDesignTokens(isDark ? 'dark' : 'light')), [isDark]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('preferred-theme');
        if (savedTheme) {
            setIsDark(savedTheme === 'dark');
        }
    }, [])

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
