import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Button, useTheme } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TaskActionsTeacher } from '../components/Task/TaskActionsTeacher';
import { TaskActionsStudent } from '../components/Task/TaskActionsStudent';
import { TaskInfoBlock } from '../components/Task/TaskInfoBlock';
import { TaskFilesSection } from '../components/Task/TaskFilesSection';
import { TaskCommentsSection } from '../components/Task/TaskCommentsSection';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_URL = process.env.REACT_APP_API_URL;

export function UserTaskDetailPage({ token, isTeacher }: { token: string; isTeacher: boolean }) {
    const { taskId, userId, userTaskId } = useParams<{ taskId?: string; userId?: string; userTaskId?: string }>();
    const navigate = useNavigate();

    const [detail, setDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const theme = useTheme();

    const fetchDetail = async () => {
        setLoading(true);
        try {
            let url = '';
            if (userTaskId) {
                url = `${API_URL}/user-task/${userTaskId}`;
            } else if (taskId && userId) {
                url = `${API_URL}/user-task/${taskId}/${userId}`;
            } else {
                throw new Error('Хибний маршрут');
            }

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error(`Сервер відповів ${res.status}`);

            const data = await res.json();
            setDetail(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [taskId, userId, userTaskId, token]);

    if (loading) return <CircularProgress sx={{ mt: 5, mx: 'auto', display: 'block' }} />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!detail) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box
                sx={{
                    maxWidth: 850,
                    mx: 'auto',
                    px: { xs: 0, sm: 1, md: 3 },
                    py: { xs: 2, md: 3 },
                }}
            >
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        mb: 2,
                        color: theme.palette.text.primary,
                        '&:hover': { color: theme.palette.primary.main },
                    }}
                >
                    Назад
                </Button>
                <TaskInfoBlock
                    taskName={detail.task.name}
                    course={detail.task.course}
                    owner={detail.task.owner}
                    student={isTeacher ? detail.student : undefined}
                    status={detail.status}
                    timeToComplete={detail.task.timeToComplete}
                    deadline={detail.deadline}
                    completeTimestamp={detail.completeTimestamp}
                    grade={detail.grade}
                />

                <Paper sx={{ p: 3, borderRadius: 3, mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Файли завдання
                    </Typography>
                    <TaskFilesSection files={detail.task.fileContent} />
                </Paper>

                <Paper sx={{ p: 3, borderRadius: 3, mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Файли студента
                    </Typography>
                    <TaskFilesSection files={detail.fileContent} />
                </Paper>

                {isTeacher ? (
                    <TaskActionsTeacher
                        token={token}
                        userTaskId={detail.id}
                        onUpdated={fetchDetail}
                    />
                ) : (
                    <TaskActionsStudent
                        token={token}
                        userTaskId={detail.id}
                        taskId={detail.task.id}
                        accepted={detail.status !== 'Призначено'}
                        completed={detail.status !== 'Прийнято' && detail.status !== 'Протерміновано'}
                        onUpdated={fetchDetail}
                        onReaccept={(newId) => navigate(`/user-task/${newId}`)}
                    />
                )}

                <TaskCommentsSection
                    comments={detail.task.comments}
                    taskId={detail.task.id}
                    token={token}
                    userId={detail.student.id}
                    refresh={fetchDetail}
                />
            </Box>
        </motion.div>
    );
}
