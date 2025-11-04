import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
    Box,
    Button,
    Stack,
    Typography,
    CircularProgress,
} from '@mui/material';
import { Upload, Replay } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

type Props = {
    token: string;
    userTaskId: string;
    taskId: string;
    accepted: boolean;
    completed: boolean;
    onUpdated: () => void;
    /** опційно: якщо передано — викликаємо його з newId; інакше робимо navigate усередині */
    onReaccept?: (newId: string) => void;
};

export function TaskActionsStudent({
    token,
    userTaskId,
    taskId,
    accepted,
    completed,
    onUpdated,
    onReaccept,
}: Props) {
    const navigate = useNavigate();

    const [newFiles, setNewFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNewFiles = (e: ChangeEvent<HTMLInputElement>) => {
        setNewFiles(e.target.files);
    };

    const handleAccept = async () => {
        setError(null);
        try {
            const res = await fetch(`http://localhost:3000/user-task/${userTaskId}/accept`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Помилка ${res.status}`);
            onUpdated();
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleReaccept = async () => {
        setError(null);
        try {
            const res = await fetch(`http://localhost:3000/task/${taskId}/user-tasks`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Помилка при повторному прийнятті ${res.status}`);
            const { id } = await res.json();
            if (onReaccept) onReaccept(id);
            else navigate(`/user-task/${id}`);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleComplete = async (e: FormEvent) => {
        e.preventDefault();
        if (!newFiles || newFiles.length === 0) return;
        setUploading(true);
        setError(null);
        try {
            const fd = new FormData();
            Array.from(newFiles).forEach(f => fd.append('file', f));
            const res = await fetch(`http://localhost:3000/user-task/${userTaskId}/complete`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            if (!res.ok) throw new Error(`Помилка ${res.status}`);
            onUpdated();
            setNewFiles(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            {!accepted ? (
                <Button variant="contained" onClick={handleAccept}>
                    Прийняти завдання
                </Button>
            ) : completed ? (
                <Button
                    variant="outlined"
                    startIcon={<Replay />}
                    onClick={handleReaccept}
                >
                    Прийняти завдання повторно
                </Button>
            ) : (
                <form onSubmit={handleComplete}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <Button component="label" variant="outlined" startIcon={<Upload />}>
                            Додати файли
                            <input hidden multiple type="file" onChange={handleNewFiles} />
                        </Button>
                        {newFiles && newFiles.length > 0 && (
                            <Typography variant="body2" color="text.secondary">
                                Обрано: {Array.from(newFiles).map(f => f.name).join(', ')}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={uploading || !newFiles || newFiles.length === 0}
                        >
                            {uploading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Відправити виконання'}
                        </Button>
                    </Stack>
                </form>
            )}

            {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
}
