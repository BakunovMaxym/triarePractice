import React from 'react';
import { Paper, Typography, TextField, Button } from '@mui/material';

interface JoinCourseFormProps {
    joinCourseId: string;
    error: string | null;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const JoinCourseForm: React.FC<JoinCourseFormProps> = ({
    joinCourseId,
    error,
    onChange,
    onSubmit,
}) => (
    <Paper
        component="form"
        onSubmit={onSubmit}
        sx={{
            p: 2,
            m: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
        }}
    >
        <Typography variant="body2" fontWeight={600}>
            Введіть ID курсу
        </Typography>
        <TextField
            size="small"
            placeholder="ID курсу"
            value={joinCourseId}
            onChange={(e) => onChange(e.target.value)}
        />
        {error && (
            <Typography color="error" variant="caption">
                {error}
            </Typography>
        )}
        <Button type="submit" variant="contained" color="success">
            Приєднатися
        </Button>
    </Paper>
);
