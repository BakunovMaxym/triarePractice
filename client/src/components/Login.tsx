import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { login } from '../api';

export function Login({
  onLogin,
}: {
  onLogin: (token: string, userId: string, role: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      onLogin(data.token.accessToken, data.user.id, data.user.role);
    } catch (err) {
      setError('Некоректні дані для входу');
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
        maxWidth: 400,
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
        Вхід до системи
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
          label="Електронна пошта"
          type="email"
          value={email}
          required
          variant="outlined"
          fullWidth
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Пароль"
          type="password"
          value={password}
          required
          variant="outlined"
          fullWidth
          onChange={(e) => setPassword(e.target.value)}
        />

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
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Увійти'}
        </Button>
      </Box>
    </Box>
  );
}
