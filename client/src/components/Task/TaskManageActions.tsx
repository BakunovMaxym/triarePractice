import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Stack,
    IconButton,
    CircularProgress,
    Paper,
} from '@mui/material';
import { Delete, Edit, Save, Cancel } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Props {
    token: string;
    task: any;
    onUpdated: () => void;
    onDeleted: () => void;
}

export function TaskManageActions({ token, task, onUpdated, onDeleted }: Props) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(task.name);
    const [textContent, setTextContent] = useState(task.textContent);

    // 🧩 Тепер зберігаємо масив File[] для гнучкості
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState(task.fileContent || []);
    const [toRemove, setToRemove] = useState<Set<string>>(new Set());

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🔁 Синхронізація при оновленні task
    useEffect(() => {
        setExistingFiles(task.fileContent || []);
        setName(task.name);
        setTextContent(task.textContent);
        setNewFiles([]);
    }, [task]);

    // 📂 Додати нові файли
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length === 0) return;

        // об'єднуємо без дублікатів
        const unique = Array.from(new Map([...newFiles, ...files].map(f => [f.name, f])).values());
        setNewFiles(unique);
        e.target.value = ''; // дозволяє вибирати ті самі файли повторно
    };

    // ❌ Видалити (відкріпити) новий файл
    const handleRemoveNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    // 🗑️ Позначити існуючий файл на видалення
    const toggleRemove = (fileId: string) => {
        setToRemove((prev) => {
            const newSet = new Set(prev);
            newSet.has(fileId) ? newSet.delete(fileId) : newSet.add(fileId);
            return newSet;
        });
    };

    // 💾 Зберегти зміни
    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('textContent', textContent);

            const remain = existingFiles.filter((f: any) => !toRemove.has(f.fileId));
            formData.append('fileContents', JSON.stringify(remain));

            // додаємо нові файли
            newFiles.forEach((file) => formData.append('file', file));

            const res = await fetch(`http://localhost:3000/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error(`Помилка ${res.status}`);
            const updated = await res.json();

            setExistingFiles(updated.fileContent || []);
            setName(updated.name);
            setTextContent(updated.textContent);
            setNewFiles([]);
            setToRemove(new Set());
            onUpdated();
            setEditing(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // 🗑️ Видалити завдання
    const handleDelete = async () => {
        if (!window.confirm('Ви справді хочете видалити це завдання?')) return;
        try {
            const res = await fetch(`http://localhost:3000/tasks/${task.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Помилка ${res.status}`);
            onDeleted();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <Paper
            sx={{
                mt: 3,
                p: 3,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.04)',
            }}
        >
            {!editing ? (
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => setEditing(true)}
                    >
                        Редагувати
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={handleDelete}
                    >
                        Видалити
                    </Button>
                </Stack>
            ) : (
                <motion.form
                    onSubmit={handleSave}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Stack spacing={2}>
                        <TextField
                            label="Назва завдання"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            label="Опис"
                            multiline
                            fullWidth
                            minRows={3}
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                        />

                        {/* Існуючі файли */}
                        <Box>
                            <Typography variant="subtitle2">Прикріплені файли:</Typography>
                            {existingFiles.length ? (
                                existingFiles.map((f: any) => (
                                    <Stack
                                        key={f.fileId}
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        sx={{
                                            p: 1,
                                            mt: 1,
                                            borderRadius: 1,
                                            bgcolor: toRemove.has(f.fileId)
                                                ? 'rgba(244,67,54,0.1)'
                                                : 'rgba(255,255,255,0.05)',
                                        }}
                                    >
                                        <Typography variant="body2">{f.fileName}</Typography>
                                        <IconButton
                                            size="small"
                                            color={toRemove.has(f.fileId) ? 'success' : 'error'}
                                            onClick={() => toggleRemove(f.fileId)}
                                        >
                                            {toRemove.has(f.fileId) ? <Cancel /> : <Delete />}
                                        </IconButton>
                                    </Stack>
                                ))
                            ) : (
                                <Typography color="text.secondary">
                                    Немає прикріплених файлів
                                </Typography>
                            )}
                        </Box>

                        {/* Нові файли */}
                        <Box>
                            <Button component="label" variant="outlined">
                                Додати файли
                                <input hidden multiple type="file" onChange={handleFileChange} />
                            </Button>

                            {newFiles.length > 0 && (
                                <Box mt={1}>
                                    <Typography variant="subtitle2">Нові файли:</Typography>
                                    {newFiles.map((file, index) => (
                                        <Stack
                                            key={file.name + index}
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            sx={{
                                                p: 1,
                                                mt: 1,
                                                borderRadius: 1,
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                            }}
                                        >
                                            <Typography variant="body2">{file.name}</Typography>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleRemoveNewFile(index)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Stack>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        {/* Кнопки дій */}
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                startIcon={<Save />}
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? <CircularProgress size={20} /> : 'Зберегти зміни'}
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<Cancel />}
                                onClick={() => setEditing(false)}
                            >
                                Скасувати
                            </Button>
                        </Stack>

                        {error && (
                            <Typography color="error" variant="body2">
                                {error}
                            </Typography>
                        )}
                    </Stack>
                </motion.form>
            )}
        </Paper>
    );
}
