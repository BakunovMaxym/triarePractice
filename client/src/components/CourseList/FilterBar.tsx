import React from 'react';
import { Box, Grid, TextField, Button, Paper, useTheme, Fade, Typography } from '@mui/material';

export function FilterBar({
    ownerLabel,
    setOwnerLabel,
    teacherLabel,
    setTeacherLabel,
    categoryLabel,
    setCategoryLabel,
    subCategoryLabel,
    setSubCategoryLabel,
    userOptions,
    categoryOptions,
    subCategoryOptions,
    applyFilters,
    resetFilters,
}: any) {
    const theme = useTheme();

    return (
        <Fade in timeout={600}>
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    borderRadius: 3,
                    mb: 3,
                    background:
                        theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,0.9)'
                            : 'rgba(33,33,33,0.8)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                    Фільтри курсів
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            label="Власник"
                            fullWidth
                            value={ownerLabel}
                            onChange={(e) => setOwnerLabel(e.target.value)}
                            inputProps={{ list: 'owners' }} // ✅
                        />
                        <datalist id="owners">
                            {userOptions.map((u: any) => (
                                <option key={u.id} value={u.label} />
                            ))}
                        </datalist>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            label="Викладач"
                            fullWidth
                            value={teacherLabel}
                            onChange={(e) => setTeacherLabel(e.target.value)}
                            inputProps={{ list: 'teachers' }} // ✅
                        />
                        <datalist id="teachers">
                            {userOptions.map((u: any) => (
                                <option key={u.id} value={u.label} />
                            ))}
                        </datalist>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            label="Категорія"
                            fullWidth
                            value={categoryLabel}
                            onChange={(e) => setCategoryLabel(e.target.value)}
                            inputProps={{ list: 'categories' }} // ✅
                        />
                        <datalist id="categories">
                            {categoryOptions.map((cat: string) => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            label="Підкатегорія"
                            fullWidth
                            value={subCategoryLabel}
                            onChange={(e) => setSubCategoryLabel(e.target.value)}
                            inputProps={{ list: 'subCategories' }} // ✅
                        />
                        <datalist id="subCategories">
                            {subCategoryOptions.map((sub: string) => (
                                <option key={sub} value={sub} />
                            ))}
                        </datalist>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }} display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="contained" onClick={applyFilters}>
                            🔍 Застосувати
                        </Button>
                        <Button variant="outlined" onClick={resetFilters}>
                            ✖ Скинути
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Fade>
    );
}
