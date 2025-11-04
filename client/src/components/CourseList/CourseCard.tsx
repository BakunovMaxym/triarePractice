import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Box,
    useTheme,
    Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { CourseItem } from '../CourseItem';

export function CourseCard({
    course,
    onSelectCourse,
    isTeacher,
    folders,
    FolderPopupCourse,
    setFolderPopupCourse,
    folderError,
    setFolderError,
    newFolderName,
    setNewFolderName,
    moving,
    fetchFolders,
    onMoveCourse,
    onCreateAndMove,
    copiedCourseId,
    setCopiedCourseId,
    addFilter,
    userId,
    token,
}: any) {
    const theme = useTheme();

    const copyId = async () => {
        await navigator.clipboard.writeText(course.id);
        setCopiedCourseId(course.id);
        setTimeout(() => setCopiedCourseId(null), 1500);
    };

    const isLight = theme.palette.mode === 'light';

    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.35 }}
        >
            <Card
                elevation={8}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: isLight
                        ? '0 4px 12px rgba(89,184,247,0.15)'
                        : theme.shadows[6],
                    background: isLight
                        ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(240,247,255,0.95))'
                        : 'linear-gradient(180deg, rgba(28,28,30,0.95), rgba(20,20,22,0.9))',
                    border: `1px solid ${isLight ? 'rgba(89,184,247,0.25)' : 'rgba(255,255,255,0.1)'
                        }`,
                    transition: theme.transitions.create(['box-shadow', 'transform']),
                    '&:hover': {
                        boxShadow: isLight
                            ? '0 6px 16px rgba(89,184,247,0.25)'
                            : '0 6px 16px rgba(236,108,246,0.25)',
                    },
                }}
            >
                <Box
                    sx={{
                        height: 6,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}
                />

                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        {course.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Власник: {course.owner?.lastName} {course.owner?.firstName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Викладач: {course.teachers?.[0]?.lastName} {course.teachers?.[0]?.firstName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Категорія: {course.categoryName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Підкатегорія: {course.subCategoryName}
                    </Typography>
                </CardContent>

                <Divider />
                <CardActions sx={{ flexDirection: 'column', gap: 1, py: 2, px: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => onSelectCourse(course.id)}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            color: '#fff',
                            textTransform: 'none',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                            },
                        }}
                    >
                        Переглянути
                    </Button>

                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                            setFolderPopupCourse(course);
                            setFolderError(null);
                            setNewFolderName('');
                            fetchFolders();
                        }}
                    >
                        Перемістити у папку
                    </Button>

                    {isTeacher && (
                        <Button fullWidth variant="outlined" onClick={copyId}>
                            Поділитися ID
                        </Button>
                    )}

                    {copiedCourseId === course.id && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'success.main',
                                fontWeight: 600,
                                textAlign: 'center',
                            }}
                        >
                            ID скопійовано!
                        </Typography>
                    )}
                </CardActions>
            </Card>
        </motion.div>
    );
}
