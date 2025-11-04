import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Stack,
    Typography,
    CircularProgress,
    useTheme,
} from '@mui/material';
import { Grade, Block } from '@mui/icons-material';

interface Props {
    token: string;
    userTaskId: string;
    onUpdated: () => void;
}

export function TaskActionsTeacher({ token, userTaskId, onUpdated }: Props) {
    const [gradeValue, setGradeValue] = useState<number | ''>('');
    const [grading, setGrading] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();

    const handleGrade = async () => {
        if (gradeValue === '') return;
        setError(null);
        setGrading(true);
        try {
            const res = await fetch(
                `http://localhost:3000/user-task/${userTaskId}/grade`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ grade: gradeValue }),
                }
            );
            if (!res.ok) throw new Error(`Сервер ${res.status}`);
            onUpdated();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setGrading(false);
        }
    };

    const handleReject = async () => {
        setError(null);
        setRejecting(true);
        try {
            const res = await fetch(
                `http://localhost:3000/user-task/${userTaskId}/reject`,
                { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error(`Сервер ${res.status}`);
            onUpdated();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setRejecting(false);
        }
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                    mb: 2,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    color: 'transparent',
                }}
            >
                Оцінювання
            </Typography>

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', sm: 'center' }}
            >
                <TextField
                    label="Оцінка"
                    type="number"
                    size="small"
                    value={gradeValue}
                    onChange={(e) =>
                        setGradeValue(e.target.value === '' ? '' : +e.target.value)
                    }
                    sx={{ width: { xs: '100%', sm: 120 } }}
                    inputProps={{ min: 0, max: 100 }}
                />

                <Button
                    variant="contained"
                    onClick={handleGrade}
                    disabled={grading}
                    startIcon={!grading && <Grade />}
                    sx={{
                        flex: 1,
                        minWidth: { xs: '100%', sm: 'auto' },
                        fontWeight: 600,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        '&:hover': {
                            background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                        },
                    }}
                >
                    {grading ? <CircularProgress size={20} color="inherit" /> : 'Оцінити'}
                </Button>

                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleReject}
                    disabled={rejecting}
                    startIcon={!rejecting && <Block />}
                    sx={{
                        flex: 1,
                        minWidth: { xs: '100%', sm: 'auto' },
                        fontWeight: 600,
                        borderWidth: 2,
                        '&:hover': {
                            borderWidth: 2,
                            backgroundColor: theme.palette.error.light,
                            color: theme.palette.error.contrastText,
                        },
                    }}
                >
                    {rejecting ? <CircularProgress size={20} /> : 'Відхилити'}
                </Button>
            </Stack>

            {error && (
                <Typography color="error" sx={{ mt: 1 }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
}
