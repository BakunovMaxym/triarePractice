import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  useTheme,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Tooltip,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getCourse } from '../api';
import { CreateTaskForm } from './CreateTaskForm';
import { formatTime } from '../utils/formatTime';
import { Stack } from '@mui/system';

export function CourseDetail({
  token,
  courseId,
  isTeacher,
  userId,
}: {
  token: string;
  courseId: string;
  isTeacher?: boolean;
  userId: string;
}) {
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const fetchCourse = () => {
    getCourse(token, courseId)
      .then(setCourse)
      .catch(() => setError('Не вдалося завантажити курс'));
  };

  useEffect(() => {
    fetchCourse();
  }, [token, courseId]);

  if (error)
    return (
      <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
        {error}
      </Typography>
    );

  if (!course)
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2 }}>Завантаження...</Typography>
      </Box>
    );

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        maxWidth: 1100,
        mx: 'auto',
        my: 4,
        px: 3,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
      }}
    >
      <Box flex={2}>
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

        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 1,
            background: theme.customGradients.accent,
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {course.name}
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 2 }}>
          <SchoolIcon sx={{ fontSize: 18, mr: 1 }} />
          Курс для розвитку та навчання
        </Typography>

        <Paper
          elevation={6}
          sx={{
            p: 3,
            borderRadius: 4,
            backgroundColor: theme.palette.background.elevated,
            boxShadow: theme.shadows[8],
            mb: 3,
            border: `1px solid ${theme.palette.mode === 'light'
              ? 'rgba(66,165,245,0.25)'
              : 'rgba(144,202,249,0.15)'}`,
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom color="text.primary">
            Інформація про курс
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.2}>
            <Typography color="text.secondary">
              <Box component="span" color="text.primary" fontWeight={600}>
                Категорія:
              </Box>{' '}
              {course.categoryName}
            </Typography>

            <Typography color="text.secondary">
              <Box component="span" color="text.primary" fontWeight={600}>
                Підкатегорія:
              </Box>{' '}
              {course.subCategoryName}
            </Typography>

            <Typography color="text.secondary">
              <Box component="span" color="text.primary" fontWeight={600}>
                Створено:
              </Box>{' '}
              {new Date(course.createdAt).toLocaleString('uk-UA')}
            </Typography>

            <Typography color="text.secondary">
              <Box component="span" color="text.primary" fontWeight={600}>
                Власник:
              </Box>{' '}
              {course.owner?.firstName} {course.owner?.lastName}
            </Typography>

            <Typography color="text.secondary">
              <Box component="span" color="text.primary" fontWeight={600}>
                Викладачі:
              </Box>{' '}
              {course.teachers.map((t: any) => `${t.firstName} ${t.lastName}`).join(', ')}
            </Typography>
          </Stack>
        </Paper>

        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Завдання
        </Typography>

        {isTeacher && (
          <Box sx={{ mb: 3 }}>
            <CreateTaskForm
              token={token}
              courseId={courseId}
              onCreated={fetchCourse}
            />
          </Box>
        )}

        {Array.isArray(course.tasks) && course.tasks.length > 0 ? (
          <Grid container spacing={2}>
            {course.tasks.map((task: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
                <Card
                  elevation={4}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    background:
                      theme.palette.mode === 'light'
                        ? 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(240,247,255,0.9))'
                        : 'linear-gradient(180deg, rgba(25,25,28,0.95), rgba(20,20,22,0.9))',
                    transition: theme.transitions.create(['transform', 'box-shadow']),
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[6],
                    },
                  }}
                >
                  <CardActionArea
                    component={Link}
                    to={
                      isTeacher
                        ? `/tasks/${task.id}`
                        : `/user-task/${task.id}/${userId}`
                    }
                    sx={{ height: '100%' }}
                  >
                    <CardContent>

                      <Tooltip title={task.name} arrow enterDelay={400}>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="text.primary"
                          noWrap
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 260,
                          }}
                        >
                          {task.name}
                        </Typography>
                      </Tooltip>



                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon
                          sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {task.owner?.firstName} {task.owner?.lastName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon
                          sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(task.timeToComplete)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">
            Немає завдань для цього курсу.
          </Typography>
        )}
      </Box>

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          p: 3,
          borderRadius: 3,
          background:
            theme.palette.mode === 'light'
              ? 'rgba(255,255,255,0.9)'
              : 'rgba(25,25,28,0.9)',
          height: 'fit-content',
          backdropFilter: 'blur(6px)',
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Студенти
        </Typography>

        {course.students?.length ? (
          <List dense>
            {course.students.map((s: any) => (
              <Tooltip
                key={s.id}
                title={
                  isTeacher
                    ? 'Переглянути завдання студента'
                    : userId === s.id
                      ? 'Мої завдання'
                      : ''
                }
                arrow
              >
                <ListItem
                  onClick={() =>
                    (isTeacher || userId === s.id) &&
                    navigate(`/user-tasks/course/${course.id}/user/${s.id}`, {
                      state: { courseId: course.id, studentId: s.id },
                    })
                  }
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    mb: 1,
                    cursor: isTeacher || userId === s.id ? 'pointer' : 'default',
                    bgcolor:
                      userId === s.id
                        ? theme.palette.primary.light
                        : theme.palette.action.hover,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor:
                        isTeacher || userId === s.id
                          ? theme.palette.action.selected
                          : undefined,
                    },
                  }}
                >
                  <ListItemText
                    primary={`${s.firstName} ${s.lastName}`}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  />
                </ListItem>
              </Tooltip>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">Студентів ще не додано.</Typography>
        )}
      </Paper>
    </Box>
  );
}
