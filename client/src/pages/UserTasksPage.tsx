import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Collapse,
    CircularProgress,
    Paper,
    Chip,
    Stack,
    Button,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { ExpandMore, ExpandLess, ArrowBack } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export enum TaskStatus {
    ASSIGNED = 'Призначено',
    ACCEPTED = 'Прийнято',
    SUBMITED = 'Здано',
    EXPIRED = 'Протерміновано',
    SUBMITED_LATE = 'Здано з запізненням',
    GRADED = 'Оцінено',
    REJECTED = 'Відхилено',
}

const statusColors: Record<TaskStatus, { bg: string; color: string }> = {
    [TaskStatus.ASSIGNED]: { bg: '#dbeafe', color: '#2563eb' },
    [TaskStatus.ACCEPTED]: { bg: '#dcfce7', color: '#16a34a' },
    [TaskStatus.SUBMITED]: { bg: '#e0e7ff', color: '#4f46e5' },
    [TaskStatus.EXPIRED]: { bg: '#fee2e2', color: '#dc2626' },
    [TaskStatus.SUBMITED_LATE]: { bg: '#fef9c3', color: '#ca8a04' },
    [TaskStatus.GRADED]: { bg: '#ccfbf1', color: '#0d9488' },
    [TaskStatus.REJECTED]: { bg: '#e5e7eb', color: '#52525b' },
};

interface Student {
    id: string;
    firstName: string;
    lastName: string;
}

interface Task {
    id: string;
    name: string;
}

interface UserTask {
    id: string;
    status: TaskStatus;
    grade: number | null;
    student: Student;
    task: Task;
    createdAt: Date;
}

export function TaskUserTasksPage({ token }: { token: string }) {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { taskName } = location.state || {};
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [groups, setGroups] = useState<{ student: Student; tasks: UserTask[] }[]>([]);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!taskId) return;
        fetch(`http://localhost:3000/task/${taskId}/user-tasks`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Помилка ${res.status}`);
                return res.json() as Promise<Record<string, UserTask[]>>;
            })
            .then((data) => {
                const arr = Object.values(data).map((tasks) => ({
                    student: tasks[0].student,
                    tasks,
                }));
                setGroups(arr);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [taskId, token]);

    const toggle = (studentId: string) => {
        setExpanded((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) newSet.delete(studentId);
            else newSet.add(studentId);
            return newSet;
        });
    };

    if (loading)
        return (
            <Box textAlign="center" mt={5}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" mt={1}>
                    Завантаження…
                </Typography>
            </Box>
        );

    if (error)
        return (
            <Typography color="error" textAlign="center" mt={5}>
                Помилка: {error}
            </Typography>
        );

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', py: 3, px: { xs: 0, sm: 0, md: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={3} flexWrap="wrap">
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 3,
                        mb: { xs: 1, sm: 0 },
                    }}
                >
                    Назад
                </Button>
                <Typography variant="h5" fontWeight={600}>
                    Журнал виконання завдання
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    «{taskName}»
                </Typography>
            </Stack>

            {!isMobile ? (
                // 💻 TABLE VIEW
                <Paper
                    component={motion.div}
                    layout
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Студент</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Статус</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Оцінка</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {groups.map(({ student, tasks }) => {
                                const first = tasks[0];
                                const isOpen = expanded.has(student.id);
                                return (
                                    <React.Fragment key={student.id}>
                                        <motion.tr
                                            layout
                                            onClick={() => toggle(student.id)}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s ease',
                                            }}
                                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                                        >
                                            <TableCell sx={{ py: 1.5, fontWeight: 500 }}>
                                                {student.lastName} {student.firstName}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={first.status}
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        bgcolor: statusColors[first.status].bg,
                                                        color: statusColors[first.status].color,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={600}>
                                                    {first.grade ?? '–'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell width="5%">
                                                <IconButton size="small" color="inherit">
                                                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </TableCell>
                                        </motion.tr>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <TableRow>
                                                    <TableCell colSpan={4} sx={{ p: 0, bgcolor: 'rgba(255,255,255,0.02)' }}>
                                                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                            <Box component={motion.div} layout p={2}>
                                                                {tasks.map((t) => (
                                                                    <motion.div
                                                                        key={t.id}
                                                                        whileHover={{
                                                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                                                        }}
                                                                        onClick={() => navigate(`/user-task/${t.id}`)}
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                                                                            padding: '0.6rem 0.8rem',
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center',
                                                                        }}
                                                                    >
                                                                        <Typography variant="body2">
                                                                            {new Date(t.createdAt).toLocaleString('uk-UA')}
                                                                        </Typography>
                                                                        <Chip
                                                                            label={t.status}
                                                                            size="small"
                                                                            sx={{
                                                                                fontSize: '0.7rem',
                                                                                fontWeight: 600,
                                                                                bgcolor: statusColors[t.status].bg,
                                                                                color: statusColors[t.status].color,
                                                                            }}
                                                                        />
                                                                        <Typography variant="body2" fontWeight={600}>
                                                                            {t.grade ?? '–'}
                                                                        </Typography>
                                                                    </motion.div>
                                                                ))}
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Paper>
            ) : (
                // 📱 MOBILE CARD VIEW
                <Stack spacing={2}>
                    {groups.map(({ student, tasks }) => {
                        const first = tasks[0];
                        const isOpen = expanded.has(student.id);
                        return (
                            <Paper
                                key={student.id}
                                sx={{
                                    p: 0,
                                    borderRadius: 3,
                                    background:
                                        theme.palette.mode === 'light'
                                            ? 'rgba(255,255,255,0.9)'
                                            : 'rgba(255,255,255,0.05)',
                                }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    onClick={() => toggle(student.id)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <Typography fontWeight={600}>
                                        {student.lastName} {student.firstName}
                                    </Typography>
                                    <IconButton size="small" color="inherit">
                                        {isOpen ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                </Stack>

                                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                                    <Chip
                                        label={first.status}
                                        size="small"
                                        sx={{
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            bgcolor: statusColors[first.status].bg,
                                            color: statusColors[first.status].color,
                                        }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        Оцінка: {first.grade ?? '–'}
                                    </Typography>
                                </Stack>

                                <AnimatePresence>
                                    {isOpen && (
                                        <Box
                                            component={motion.div}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            mt={1}
                                        >
                                            {tasks.map((t) => (
                                                <Box
                                                    key={t.id}
                                                    onClick={() => navigate(`/user-task/${t.id}`)}
                                                    sx={{
                                                        p: 1.2,
                                                        mt: 0.7,
                                                        borderRadius: 2,
                                                        bgcolor:
                                                            theme.palette.mode === 'light'
                                                                ? 'rgba(240,247,255,0.6)'
                                                                : 'rgba(255,255,255,0.06)',
                                                        '&:hover': {
                                                            bgcolor:
                                                                theme.palette.mode === 'light'
                                                                    ? 'rgba(66,165,245,0.15)'
                                                                    : 'rgba(255,255,255,0.1)',
                                                        },
                                                    }}
                                                >
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {new Date(t.createdAt).toLocaleString('uk-UA')}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Статус: {t.status}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Оцінка: {t.grade ?? '–'}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </AnimatePresence>
                            </Paper>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
}
