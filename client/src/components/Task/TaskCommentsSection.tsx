import { Box, Paper, Stack, Typography, IconButton, TextField, Button } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useState, FormEvent } from 'react';

export function TaskCommentsSection({ comments, token, taskId, userId, refresh }: any) {
    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);

    const handleCommentSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setPosting(true);
        await fetch(`http://localhost:3000/comments/comment/${taskId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ content: newComment }),
        });
        setNewComment('');
        refresh?.();
        setPosting(false);
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
                Коментарі
            </Typography>

            {comments?.length === 0 ? (
                <Typography color="text.secondary">Коментарів поки немає.</Typography>
            ) : (
                <Stack spacing={1.5}>
                    {comments.map((c: any) => (
                        <Paper key={c.id} sx={{ p: 1.5, borderRadius: 2 }}>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography fontWeight={600}>
                                    {c.owner.firstName} {c.owner.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(c.createdAt).toLocaleString('uk-UA')}
                                </Typography>
                            </Stack>
                            <Typography sx={{ mt: 0.5 }}>{c.content}</Typography>
                            {c.owner.id === userId && (
                                <IconButton
                                    color="error"
                                    size="small"
                                    sx={{ position: 'absolute', top: 4, right: 4 }}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            )}
                        </Paper>
                    ))}
                </Stack>
            )}

            <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Залишити коментар..."
                />
                <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 1 }}
                    disabled={posting}
                >
                    {posting ? 'Надсилання...' : 'Опублікувати'}
                </Button>
            </Box>
        </Box>
    );
}
