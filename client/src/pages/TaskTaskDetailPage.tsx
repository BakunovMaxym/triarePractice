import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Button, useTheme } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TaskInfoBlock } from '../components/Task/TaskInfoBlock';
import { TaskFilesSection } from '../components/Task/TaskFilesSection';
import { TaskCommentsSection } from '../components/Task/TaskCommentsSection';
import { TaskManageActions } from '../components/Task/TaskManageActions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


export function TaskDetailPage({ token, userId, isTeacher }: any) {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();

  const fetchTask = async () => {
    const res = await fetch(`http://localhost:3000/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTask(data);
    setLoading(false);
  };

  const handleDeleted = () => navigate(-1);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  if (loading) return <CircularProgress sx={{ mt: 5, mx: 'auto', display: 'block' }} />;
  if (!task) return <Typography color="error">Помилка завантаження</Typography>;

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
          taskName={task.name}
          owner={task.owner}
          course={task.course}
          timeToComplete={task.timeToComplete}
        />

        {!isTeacher && (
          <TaskManageActions
            token={token}
            task={task}
            onUpdated={fetchTask}
            onDeleted={handleDeleted}
          />
        )}

        <Paper sx={{ p: 3, borderRadius: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Файли
          </Typography>
          <TaskFilesSection files={task.fileContent} />
        </Paper>

        <TaskCommentsSection
          comments={task.comments}
          taskId={task.id}
          token={token}
          userId={userId}
          refresh={fetchTask}
        />
      </Box>
    </motion.div>
  );
}
