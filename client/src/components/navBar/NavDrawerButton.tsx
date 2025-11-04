import React from 'react';
import { ButtonBase, Box, Typography, useTheme } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavDrawerButtonProps {
    to: string;
    label: string;
    icon?: React.ReactNode;
    onClose?: () => void;
}

export const NavDrawerButton: React.FC<NavDrawerButtonProps> = ({
    to,
    label,
    icon,
    onClose,
}) => {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const active = location.pathname.startsWith(to);

    return (
        <ButtonBase
            onClick={() => {
                navigate(to);
                onClose?.();
            }}
            sx={{
                width: '100%',
                borderRadius: 2,
                px: 2,
                py: 1.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1.5,
                color: active
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                backgroundColor: active
                    ? theme.palette.primary.main
                    : 'transparent',
                '&:hover': {
                    backgroundColor: active
                        ? theme.palette.primary.dark
                        : theme.palette.action.hover,
                },
                transition: theme.transitions.create(['background-color', 'transform'], {
                    duration: 200,
                }),
            }}
        >
            {icon && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: active
                            ? theme.palette.primary.contrastText
                            : theme.palette.text.secondary,
                    }}
                >
                    {icon}
                </Box>
            )}
            <Typography
                sx={{
                    fontWeight: active ? 600 : 500,
                    fontSize: '0.95rem',
                    flexGrow: 1,
                    color: active
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                }}
            >
                {label}
            </Typography>
        </ButtonBase>
    );
};
