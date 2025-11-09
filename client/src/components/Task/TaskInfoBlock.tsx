import { Box, Chip, Stack, Typography } from '@mui/material';
import { Grade } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { formatTime } from '../../utils/formatTime';
import { useEffect } from 'react';

interface Props {
    taskName?: string;
    course?: { id: string; name: string };
    student?: { firstName: string; lastName: string };
    owner?: { firstName: string; lastName: string };
    status?: string;
    timeToComplete?: number;
    deadline?: string | null;
    completeTimestamp?: string | null;
    grade?: number | null;
}

export function TaskInfoBlock({
    taskName,
    course,
    student,
    owner,
    status,
    timeToComplete,
    deadline,
    completeTimestamp,
    grade,
}: Props) {

    return (
        <Stack spacing={1.2}>
            {taskName && (
                <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                        background: 'linear-gradient(90deg, #42a5f5, #ec6cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {taskName}
                </Typography>
            )}

            {course && (
                <Typography color="text.secondary">
                    <Box component="span" color="text.primary" fontWeight={600}>
                        Курс:
                    </Box>{' '}
                    <Link to={`/courses/${course.id}`} style={{ color: '#42a5f5', textDecoration: 'none' }}>
                        {course.name}
                    </Link>
                </Typography>
            )}

            {owner && (
                <Typography color="text.secondary">
                    <Box component="span" color="text.primary" fontWeight={600}>
                        Автор:
                    </Box>{' '}
                    {owner.firstName} {owner.lastName}
                </Typography>
            )}

            {student && (
                <Typography color="text.secondary">
                    <Box component="span" color="text.primary" fontWeight={600}>
                        Студент:
                    </Box>{' '}
                    {student.firstName} {student.lastName}
                </Typography>
            )}

            {status && (
                <Typography color="text.secondary" component="div">
                    <Box component="span" color="text.primary" fontWeight={600}>
                        Статус:
                    </Box>{' '}
                    <Chip
                        label={status}
                        color={
                            status.includes('Виконано')
                                ? 'success'
                                : status.includes('Відхилено')
                                    ? 'error'
                                    : 'info'
                        }
                        size="small"
                    />
                </Typography>
            )}

            {timeToComplete && (
                <Typography color="text.secondary">
                    <Box component="span" color="text.primary" fontWeight={600}>
                        Час на виконання:
                    </Box>{' '}
                    {formatTime(timeToComplete)}
                </Typography>
            )}

            {deadline && (
                <Typography color="text.secondary">
                    <Box component="span" color="text.primary" fontWeight={600}>
                        Дедлайн:
                    </Box>{' '}
                    {new Date(deadline).toLocaleString('uk-UA')}
                </Typography>
            )}

            {completeTimestamp && (
                <Typography color="text.secondary">
                    <Box component="span" color="text.primary" fontWeight={600}>
                        Виконано о:
                    </Box>{' '}
                    {new Date(completeTimestamp).toLocaleString('uk-UA')}
                </Typography>
            )}

            {grade !== undefined && (
                <Typography color="text.secondary" component="div">
                    <Box component="span" color="text.primary" fontWeight={600}>
                        Оцінка:
                    </Box>{' '}
                    {grade !== null ? (
                        <Chip label={`${grade}/100`} color="primary" size="small" icon={<Grade />} />
                    ) : (
                        '—'
                    )}
                </Typography>
            )}
        </Stack>
    );
}
