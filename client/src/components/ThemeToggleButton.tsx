import React from 'react';
import { IconButton } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '../theme/ThemeContext';

export const ThemeToggleButton: React.FC = () => {
    const theme = useTheme();
    const { toggleTheme } = useThemeContext();

    return (
        <IconButton onClick={toggleTheme} color="inherit">
            {theme.palette.mode === 'light' ? <DarkMode /> : <LightMode />}
        </IconButton>
    );
};
