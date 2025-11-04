import React, { useRef, useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  useTheme,
  InputAdornment,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  AddTask,
  AccessTime,
  UploadFile,
  Delete,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { createTask, CreatedTask } from '../api';

export function CreateTaskForm({
  token,
  courseId,
  onCreated,
}: {
  token: string;
  courseId: string;
  onCreated: (task: CreatedTask) => void;
}) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', textContent: '' });
  const [time, setTime] = useState({ hours: '', minutes: '', seconds: '' });
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTime({ ...time, [e.target.name]: e.target.value });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (!newFiles) return;

    const existing = files ? Array.from(files) : [];
    const all = [...existing, ...Array.from(newFiles)];
    const uniqueFiles = Array.from(new Map(all.map(f => [f.name, f])).values());

    const dt = new DataTransfer();
    uniqueFiles.forEach(f => dt.items.add(f));
    setFiles(dt.files);

    // 💡 дозволяє вибирати той самий файл повторно
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index: number) => {
    if (!files) return;
    const arr = Array.from(files);
    arr.splice(index, 1);
    const dt = new DataTransfer();
    arr.forEach(f => dt.items.add(f));
    setFiles(dt.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('textContent', form.textContent);

      const h = parseInt(time.hours) || 0;
      const m = parseInt(time.minutes) || 0;
      const s = parseInt(time.seconds) || 0;
      const total = h * 3600 + m * 60 + s;
      if (total > 0) formData.append('timeToComplete', total.toString());

      if (files) Array.from(files).forEach(f => formData.append('file', f, f.name));

      const createdTask = await createTask(token, courseId, formData);

      setForm({ name: '', textContent: '' });
      setTime({ hours: '', minutes: '', seconds: '' });
      setFiles(null);
      onCreated(createdTask);
      setOpen(false);
    } catch {
      setError('Не вдалося створити завдання');
    } finally {
      setLoading(false);
    }
  };

  // --- UI ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Paper
        elevation={6}
        sx={{
          mb: 4,
          borderRadius: 4,
          overflow: 'hidden',
          background: isLight
            ? 'linear-gradient(135deg, rgba(89,184,247,0.08), rgba(236,108,246,0.08))'
            : 'linear-gradient(135deg, rgba(66,165,245,0.1), rgba(236,108,246,0.05))',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'}`,
          boxShadow: theme.shadows[4],
          transition: theme.transitions.create(['box-shadow', 'transform']),
          '&:hover': { boxShadow: theme.shadows[8] },
        }}
      >
        {/* Заголовок, який згортує форму */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: isLight
                ? 'rgba(89,184,247,0.05)'
                : 'rgba(236,108,246,0.05)',
            },
          }}
          onClick={() => setOpen(prev => !prev)}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transition: 'opacity 0.3s',
              opacity: open ? 1 : 0.85,
            }}
          >
            Створити нове завдання
          </Typography>
          {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
        </Box>

        {/* Згортана форма */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  mt: 2,
                  px: 3,
                  pb: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.4,
                }}
              >
                {error && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}

                <TextField
                  name="name"
                  label="Назва завдання"
                  value={form.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AddTask color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  name="textContent"
                  label="Опис завдання"
                  value={form.textContent}
                  onChange={handleChange}
                  required
                  multiline
                  minRows={3}
                  fullWidth
                  size="small"
                  disabled={loading}
                />

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle1" fontWeight={600}>
                  Час на виконання
                </Typography>

                <Stack direction="row" spacing={1}>
                  <TextField
                    name="hours"
                    type="number"
                    label="Години"
                    inputProps={{ min: 0 }}
                    value={time.hours}
                    onChange={handleTimeChange}
                    size="small"
                    sx={{ width: 100 }}
                  />
                  <TextField
                    name="minutes"
                    type="number"
                    label="Хвилини"
                    inputProps={{ min: 0, max: 59 }}
                    value={time.minutes}
                    onChange={handleTimeChange}
                    size="small"
                    sx={{ width: 100 }}
                  />
                  <TextField
                    name="seconds"
                    type="number"
                    label="Секунди"
                    inputProps={{ min: 0, max: 59 }}
                    value={time.seconds}
                    onChange={handleTimeChange}
                    size="small"
                    sx={{ width: 100 }}
                  />
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle1" fontWeight={600}>
                  Прикріпити файли
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFile />}
                  sx={{ alignSelf: 'flex-start', borderRadius: 2 }}
                >
                  Обрати файли
                  <input
                    type="file"
                    hidden
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </Button>

                {files && files.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {Array.from(files).map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 0.8,
                          mt: 0.8,
                          borderRadius: 2,
                          bgcolor: isLight
                            ? 'rgba(66,165,245,0.08)'
                            : 'rgba(144,202,249,0.08)',
                        }}
                      >
                        <Typography variant="body2">{file.name}</Typography>
                        <IconButton
                          onClick={() => handleRemoveFile(index)}
                          color="error"
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}

                <Divider sx={{ my: 1 }} />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    alignSelf: 'flex-end',
                    mt: 1.5,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} sx={{ color: 'white' }} />
                  ) : (
                    'Створити завдання'
                  )}
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </motion.div>
  );
}
