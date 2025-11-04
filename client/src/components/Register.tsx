import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
  InputLabel,
  FormControl,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import { motion } from 'framer-motion';
import { register } from '../api';

export function Register({ onRegister }: { onRegister: () => void }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setForm((prev) => ({ ...prev, role: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      onRegister();
    } catch {
      setError('Не вдалося зареєструватися');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      sx={{
        width: '100%',
        maxWidth: 450,
        mx: 'auto',
        mt: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        transition: theme.transitions.create(['background', 'box-shadow'], {
          duration: theme.transitions.duration.standard,
        }),
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        sx={{
          mb: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Реєстрація
      </Typography>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <TextField
          label="Ім’я"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          required
          variant="outlined"
          fullWidth
        />

        <TextField
          label="Прізвище"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          required
          variant="outlined"
          fullWidth
        />

        <TextField
          label="Електронна пошта"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          variant="outlined"
          fullWidth
        />

        <TextField
          label="Пароль"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          variant="outlined"
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel id="role-label">Роль</InputLabel>
          <Select
            labelId="role-label"
            name="role"
            value={form.role}
            label="Роль"
            onChange={handleSelectChange}
          >
            <MenuItem value="STUDENT">Студент</MenuItem>
            <MenuItem value="TEACHER">Викладач</MenuItem>
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            mt: 1,
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: '#fff',
            '&:hover': {
              transform: 'translateY(-1px)',
              background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            },
            transition: theme.transitions.create(['transform', 'background'], {
              duration: theme.transitions.duration.short,
            }),
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Зареєструватися'}
        </Button>
      </Box>
    </Box>
  );
}

export { };
