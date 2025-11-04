import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Collapse,
    IconButton,
    CircularProgress,
    useTheme,
    Button,
    TableContainer,
    Stack,
    Chip,
    useMediaQuery,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export enum TaskStatus {
    ASSIGNED = 'Призначено',
    ACCEPTED = 'Прийнято',
    SUBMITED = 'Здано',
    EXPIRED = 'Протерміновано',
    SUBMITED_LATE = 'Здано з запізненням',
    GRADED = 'Оцінено',
    REJECTED = 'Відхилено',
}

const statusStyles: Record<TaskStatus, { color: string; bg: string }> = {
    [TaskStatus.ASSIGNED]: { color: '#2563eb', bg: '#dbeafe' },
    [TaskStatus.ACCEPTED]: { color: '#16a34a', bg: '#dcfce7' },
    [TaskStatus.SUBMITED]: { color: '#4f46e5', bg: '#e0e7ff' },
    [TaskStatus.EXPIRED]: { color: '#dc2626', bg: '#fee2e2' },
    [TaskStatus.SUBMITED_LATE]: { color: '#ca8a04', bg: '#fef9c3' },
    [TaskStatus.GRADED]: { color: '#0d9488', bg: '#ccfbf1' },
    [TaskStatus.REJECTED]: { color: '#52525b', bg: '#e5e7eb' },
};

interface Student {
    id: string;
    firstName: string;
    lastName: string;
}

interface Task {
    id: string;
    name: string;
    courseName: string;
}

interface UserTask {
    id: string;
    status: TaskStatus;
    deadline: string | null;
    completeTimestamp: string | null;
    grade: number | null;
    student: Student;
    task: Task;
    createdAt: Date;
}

export function AcceptedUserTasksPage({ token }: { token: string }) {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [groups, setGroups] = useState<Record<string, UserTask[]>>({});
    const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!studentId) return;
        fetch(`http://localhost:3000/user-task/student/${studentId}/accepted`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Помилка ${res.status}`);
                return res.json() as Promise<UserTask[]>;
            })
            .then((tasksObj) => {
                const grouped: Record<string, UserTask[]> = {};
                const allTasks = Object.values(tasksObj).flat();
                for (const task of allTasks) {
                    const courseName = task.task.courseName;
                    if (!grouped[courseName]) grouped[courseName] = [];
                    grouped[courseName].push(task);
                }
                setGroups(grouped);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [studentId, token]);

    const toggleCourse = (courseName: string) => {
        setExpandedCourses((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(courseName)) newSet.delete(courseName);
            else newSet.add(courseName);
            return newSet;
        });
    };

    if (loading)
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress color="primary" />
            </Box>
        );

    if (error)
        return (
            <Typography color="error" sx={{ p: 4 }}>
                Помилка: {error}
            </Typography>
        );

    if (Object.keys(groups).length === 0)
        return (
            <Typography sx={{ p: 4 }} color="text.secondary">
                Завдання відсутні
            </Typography>
        );

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
                maxWidth: 1000,
                mx: 'auto',
                my: 4,
                px: { xs: 0, sm: 3 },
            }}
        >
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{
                    mb: 2,
                    color: theme.palette.text.primary,
                    '&:hover': {
                        color: theme.palette.primary.main,
                    },
                }}
            >
                Назад
            </Button>

            <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                    mb: 3,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    color: 'transparent',
                }}
            >
                Прийняті завдання студента
            </Typography>

            {!isMobile ? (
                // 💻 DESKTOP: TABLE VIEW
                <TableContainer
                    component={Paper}
                    elevation={3}
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        background:
                            theme.palette.mode === 'light'
                                ? 'rgba(255,255,255,0.9)'
                                : 'rgba(25,25,28,0.9)',
                        backdropFilter: 'blur(6px)',
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Курс</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Дедлайн</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Статус</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(groups).map(([courseName, tasks]) => {
                                const first = tasks[0];
                                const isOpen = expandedCourses.has(courseName);
                                return (
                                    <React.Fragment key={courseName}>
                                        <TableRow
                                            hover
                                            onClick={() => toggleCourse(courseName)}
                                            sx={{
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s',
                                                '&:hover': { backgroundColor: theme.palette.action.hover },
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography fontWeight={600}>{courseName}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        ({tasks.length})
                                                    </Typography>
                                                    <IconButton size="small" sx={{ ml: 'auto' }}>
                                                        {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                            <TableCell />
                                            <TableCell>
                                                <Chip
                                                    label={first.status}
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        bgcolor: statusStyles[first.status].bg,
                                                        color: statusStyles[first.status].color,
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <TableRow
                                                    component={motion.tr}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <TableCell colSpan={3} sx={{ p: 0 }}>
                                                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                            {tasks.map((ut) => (
                                                                <Box
                                                                    key={ut.id}
                                                                    sx={{
                                                                        px: 4,
                                                                        py: 1.5,
                                                                        borderTop: `1px solid ${theme.palette.divider}`,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'space-between',
                                                                        '&:hover': { backgroundColor: theme.palette.action.hover },
                                                                    }}
                                                                    onClick={() => navigate(`/user-task/${ut.id}`)}
                                                                >
                                                                    <Box>
                                                                        <Typography fontWeight={600}>
                                                                            {ut.task.name}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Дедлайн:{' '}
                                                                            {ut.deadline
                                                                                ? new Date(ut.deadline).toLocaleString('uk-UA')
                                                                                : '—'}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Chip
                                                                        label={ut.status}
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            fontSize: '0.75rem',
                                                                            bgcolor: statusStyles[ut.status].bg,
                                                                            color: statusStyles[ut.status].color,
                                                                        }}
                                                                    />
                                                                </Box>
                                                            ))}
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
                </TableContainer>
            ) : (
                // 📱 MOBILE: CARD VIEW
                <Stack spacing={2}>
                    {Object.entries(groups).map(([courseName, tasks]) => {
                        const first = tasks[0];
                        const isOpen = expandedCourses.has(courseName);
                        return (
                            <Paper
                                key={courseName}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    background:
                                        theme.palette.mode === 'light'
                                            ? 'rgba(255,255,255,0.95)'
                                            : 'rgba(25,25,28,0.95)',
                                }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    onClick={() => toggleCourse(courseName)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <Typography fontWeight={600}>{courseName}</Typography>
                                    <IconButton size="small" color="inherit">
                                        {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </Stack>

                                <Stack direction="row" spacing={1} mt={1} alignItems="center">
                                    <Chip
                                        label={first.status}
                                        size="small"
                                        sx={{
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            bgcolor: statusStyles[first.status].bg,
                                            color: statusStyles[first.status].color,
                                        }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        Завдань: {tasks.length}
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
                                            {tasks.map((ut) => (
                                                <Box
                                                    key={ut.id}
                                                    onClick={() => navigate(`/user-task/${ut.id}`)}
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
                                                        {ut.task.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Дедлайн:{' '}
                                                        {ut.deadline
                                                            ? new Date(ut.deadline).toLocaleString('uk-UA')
                                                            : '—'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Статус: {ut.status}
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
