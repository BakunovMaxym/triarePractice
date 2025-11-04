import { Button, Card, Typography } from '@mui/material';
import { Box, Grid } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import React, { useEffect } from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import { motion } from 'framer-motion';

export function FolderList({ folders, onViewFolder, onDeleteFolder, moving }: {
  folders: any[];
  onViewFolder: (folder: any) => void;
  onDeleteFolder: (folderId: string) => void;
  moving: boolean;
}) {
  const rootFolders = folders.filter(f => !f.parentFolder);
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  useEffect(() => {
    console.log(folders)
  }, [folders]);
  return (
    <Box sx={{ mb: 5 }}>
      {rootFolders?.length === 0
        ? <Typography color='text.secondary'>Папок не знайдено.</Typography>
        : <Grid container spacing={3}>
          {rootFolders.map((folder: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={folder.id}>
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
                    padding: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, height: 30 }}>
                    <FolderIcon sx={{ fontSize: 24, color: 'text.primary' }} />
                    <Typography color='text.primary' variant='h6' fontWeight={700}>{folder.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Елементів у папці: {folder.childCourses?.length + folder.childFolders?.length}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => onViewFolder(folder)}
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
                      color='error'
                      onClick={async () => {
                        if (window.confirm(`Видалити папку "${folder.name}"?`)) {
                          onDeleteFolder(folder.id);
                          window.location.reload();
                        }
                      }}
                    >
                      Видалити
                    </Button>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      }
    </Box>
  );
}
