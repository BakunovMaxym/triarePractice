import React, { useEffect, useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Collapse,
  useTheme,
  InputAdornment,
} from '@mui/material';
import {
  AddCircleOutline,
  Category,
  SubdirectoryArrowRight,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { createCourse, getCategories, getSubCategories } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  token: string;
  onCreated: () => void;
}

export function CreateCourseForm({ token, onCreated }: Props) {
  const theme = useTheme();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategory, setSubCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    getSubCategories().then(setSubCategories).catch(() => setSubCategories([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = {
        name,
        category: category === 'new' ? newCategory : category,
        subCategory: subCategory === 'new' ? newSubCategory : subCategory,
      };

      if (!data.name || !data.category || !data.subCategory) {
        setError('Усі поля обовʼязкові');
        setLoading(false);
        return;
      }

      await createCourse(token, data);

      setName('');
      setCategory('');
      setNewCategory('');
      setSubCategory('');
      setNewSubCategory('');
      onCreated();
      setOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Не вдалося створити курс');
    } finally {
      setLoading(false);
    }
  };

  const isLight = theme.palette.mode === 'light';

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
          border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'
            }`,
          boxShadow: theme.shadows[4],
          transition: theme.transitions.create(['box-shadow', 'transform']),
          '&:hover': {
            boxShadow: theme.shadows[8],
          },
        }}
      >
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
          onClick={() => setOpen((prev) => !prev)}
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
            Створити новий курс
          </Typography>
          {open ? (
            <ExpandLess color="primary" />
          ) : (
            <ExpandMore color="primary" />
          )}
        </Box>

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
                  gap: 1.2,
                }}
              >
                {error && (
                  <Typography color="error" sx={{ mt: 1, mb: 1 }}>
                    {error}
                  </Typography>
                )}

                <TextField
                  label="Назва курсу"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AddCircleOutline color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  select
                  label="Категорія"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Category color="secondary" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">Оберіть категорію</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id || cat.name} value={cat.name}>
                      {cat.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="new">➕ Додати нову...</MenuItem>
                </TextField>

                {category === 'new' && (
                  <TextField
                    placeholder="Назва нової категорії"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                    fullWidth
                    size="small"
                    disabled={loading}
                  />
                )}

                {/* Підкатегорія */}
                <TextField
                  select
                  label="Підкатегорія"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SubdirectoryArrowRight color="secondary" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">Оберіть підкатегорію</MenuItem>
                  {subCategories.map((sub) => (
                    <MenuItem key={sub.id || sub.name} value={sub.name}>
                      {sub.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="new">➕ Додати нову...</MenuItem>
                </TextField>

                {subCategory === 'new' && (
                  <TextField
                    placeholder="Назва нової підкатегорії"
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    required
                    fullWidth
                    size="small"
                    disabled={loading}
                  />
                )}

                {/* Кнопка */}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
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
                  {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Створити курс'}
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </motion.div>
  );
}
