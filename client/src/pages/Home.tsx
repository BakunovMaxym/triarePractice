import React from 'react';
import { Box, Typography, Paper, Button, Container } from '@mui/material';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { motion } from 'framer-motion';
import { duration, useTheme } from '@mui/material/styles';

export const Home: React.FC = () => {
    const theme = useTheme();

    return (
        <motion.div
            style={{ minHeight: '100vh' }}
            animate={{ backgroundColor: theme.palette.background.default }}
            transition={{ duration: 0.5 }}
        >
            <Container sx={{ pt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <ThemeToggleButton />
                </Box>

                <Typography variant="h4" gutterBottom color="text.primary">
                    Приклад сторінки з анімованою темою
                </Typography>

                <Paper sx={{ backgroundColor: theme.palette.background.paper, p: 4, mb: 2 }}>
                    <Typography variant="body1" gutterBottom color="text.primary">
                        Цей компонент плавно змінює свій фон при перемиканні теми.
                    </Typography>
                    <Button variant="contained" color="primary">
                        Кнопка з темою
                    </Button>
                </Paper>


                <Paper
                    sx={{
                        p: 4,
                        mb: 2,
                        bgcolor: 'secondary.main',
                        color: 'secondary.contrastText',
                    }}
                >
                    <Typography>Вторинний колір теж змінюється</Typography>
                </Paper>
            </Container>
        </motion.div >
    );
};
