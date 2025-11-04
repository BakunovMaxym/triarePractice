import { ThemeOptions } from '@mui/material/styles';
import '@mui/material/styles';

declare module '@mui/material/styles' {
    interface TypeBackground {
        elevated: string;
    }
    interface Theme {
        customGradients: {
            accent: string;
            card: string;
        };
    }
    interface ThemeOptions {
        customGradients?: {
            accent?: string;
            card?: string;
        };
    }
}
const lightShadows = [
    'none',
    ...Array.from({ length: 24 }, (_, i) =>
        `0px ${i + 1}px ${2 * (i + 1)}px rgba(0,0,0,${0.08 + i * 0.005})`
    ),
] as ThemeOptions['shadows'];

const darkShadows = [
    'none',
    ...Array.from({ length: 24 }, (_, i) =>
        `0px ${i + 1}px ${2 * (i + 1)}px rgba(89,184,247,${0.03 + i * 0.002})`
    ),
] as ThemeOptions['shadows'];

export const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
    customGradients: {
        accent:
            mode === 'light'
                ? 'linear-gradient(90deg, #42a5f5, #ec6cf6)'
                : 'linear-gradient(90deg, #64b5f6, #ba68c8)',
        card:
            mode === 'light'
                ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(240,247,255,0.95))'
                : 'linear-gradient(180deg, rgba(22,27,34,0.9), rgba(28,33,40,0.9))',
    },
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                primary: {
                    main: '#42a5f5',
                    light: '#90caf9',
                    dark: '#1976d2',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#ec6cf6',
                    light: '#f48fb1',
                    dark: '#9c27b0',
                    contrastText: '#ffffff',
                },
                info: {
                    main: '#29b6f6',
                    light: '#4fc3f7',
                    dark: '#0288d1',
                    contrastText: '#ffffff',
                },
                success: {
                    main: '#4caf50',
                    light: '#81c784',
                    dark: '#388e3c',
                    contrastText: '#ffffff',
                },
                warning: {
                    main: '#ffb74d',
                    dark: '#f57c00',
                    contrastText: '#1e1e1e',
                },
                background: {
                    default: '#f4f7fb',
                    paper: '#ffffff',
                    elevated: '#f9fbff',
                },
                text: {
                    primary: '#1e1e1e',
                    secondary: '#555',
                },
            }
            : {
                primary: {
                    main: '#64b5f6',
                    light: '#90caf9',
                    dark: '#42a5f5',
                    contrastText: '#0d1117',
                },
                secondary: {
                    main: '#ba68c8',
                    light: '#ce93d8',
                    dark: '#9c27b0',
                    contrastText: '#0d1117',
                },
                info: {
                    main: '#29b6f6',
                    light: '#4fc3f7',
                    dark: '#0288d1',
                    contrastText: '#0d1117',
                },
                success: {
                    main: '#81c784',
                    dark: '#388e3c',
                    contrastText: '#0d1117',
                },
                warning: {
                    main: '#ffb74d',
                    dark: '#f57c00',
                    contrastText: '#0d1117',
                },
                background: {
                    default: '#0d1117',
                    paper: '#161b22',
                    elevated: '#1f2733',
                },
                text: {
                    primary: '#e8eaed',
                    secondary: '#b0b3b8',
                },
            }),
    },

    shadows: mode === 'light' ? lightShadows : darkShadows,

    transitions: {
        duration: {
            short: 250,
            standard: 600,
            complex: 1200,
        },
        easing: {
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
    },

    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h6: { fontWeight: 600 },
        h5: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 },
    },

    components: {
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 16,
                    backgroundImage:
                        theme.palette.mode === 'light'
                            ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(240,247,255,0.9))'
                            : 'linear-gradient(180deg, rgba(22,27,34,0.9), rgba(28,33,40,0.9))',
                    border: `1px solid ${theme.palette.mode === 'light'
                        ? 'rgba(66,165,245,0.15)'
                        : 'rgba(144,202,249,0.12)'
                        }`,
                    boxShadow:
                        theme.palette.mode === 'light'
                            ? '0 4px 16px rgba(0,0,0,0.05)'
                            : '0 4px 16px rgba(89,184,247,0.1)',
                    transition: theme.transitions.create(
                        ['background-color', 'box-shadow', 'border-color'],
                        {
                            duration: theme.transitions.duration.standard,
                            easing: theme.transitions.easing.easeInOut,
                        }
                    ),
                }),
            },
        },

        MuiButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 10,
                    paddingInline: 16,
                    fontWeight: 600,
                    transition: theme.transitions.create(
                        ['background-color', 'color', 'transform', 'box-shadow'],
                        { duration: theme.transitions.duration.standard }
                    ),
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[7],
                    },
                }),
            },
        },

        MuiAppBar: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: '0 0 16px 16px',
                    backdropFilter: 'blur(12px)',
                    backgroundImage:
                        theme.palette.mode === 'light'
                            ? 'linear-gradient(90deg, rgba(66,165,245,0.85), rgba(236,108,246,0.35))'
                            : 'linear-gradient(90deg, rgba(66,165,245,0.15), rgba(236,108,246,0.25))',
                    borderBottom: `1px solid ${theme.palette.mode === 'light'
                        ? 'rgba(255,255,255,0.4)'
                        : 'rgba(255,255,255,0.1)'
                        }`,
                    color: theme.palette.text.primary,
                    transition: theme.transitions.create(['background-color'], {
                        duration: theme.transitions.duration.standard,
                    }),
                }),
            },
        },

        MuiMenu: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    borderRadius: 12,
                    backdropFilter: 'blur(10px)',
                    backgroundColor:
                        theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,0.95)'
                            : 'rgba(25,25,25,0.9)',
                    boxShadow: theme.shadows[6],
                    transition: theme.transitions.create(['background-color'], {
                        duration: theme.transitions.duration.short,
                    }),
                }),
            },
        },
    },
});
