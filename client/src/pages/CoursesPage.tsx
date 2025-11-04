import React from 'react';
import { CourseList } from '../components/CourseList/CourseList';
import { Box, Typography, Fade, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

export function CoursesPage({
  token,
  userId,
  isTeacher,
  onSelectCourse,
  key,
}: {
  token: string;
  userId: string;
  isTeacher?: boolean;
  onSelectCourse: (id: string) => void;
  key: string;
}) {
  const theme = useTheme();

  return (
    <Fade in timeout={600}>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Мої курси
          </Typography>

          <CourseList
            token={token}
            userId={userId}
            isTeacher={isTeacher}
            onSelectCourse={onSelectCourse}
            key={key}
          />
        </Box>
      </motion.div>
    </Fade>
  );
}
