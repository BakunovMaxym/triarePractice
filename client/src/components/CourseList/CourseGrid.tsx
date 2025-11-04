import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { CourseCard } from './CourseCard';

export function CourseGrid({
    title,
    courses,
    ...courseCardProps
}: any) {
    return (
        <Box sx={{ mb: 5 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                {title}
            </Typography>

            {courses.length === 0 ? (
                <Typography color="text.secondary">Курсів не знайдено.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {courses.map((course: any) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={course.id}>
                            <CourseCard course={course} {...courseCardProps} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
