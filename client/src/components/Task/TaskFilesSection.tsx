import { Paper, Typography, Box, useMediaQuery, useTheme } from '@mui/material';

export function TaskFilesSection({ files }: { files: any[] }) {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // <600px
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600–900px

    if (!files?.length)
        return <Typography color="text.secondary">Файли відсутні</Typography>;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: isSmallScreen ? 1.5 : 2,
                mt: 1,
            }}
        >
            {files.map((f, i) =>
                typeof f === 'object' ? (
                    <Paper
                        key={i}
                        elevation={4}
                        sx={{
                            borderRadius: 3,
                            p: isSmallScreen ? 1 : isMediumScreen ? 1.5 : 2.5,
                            mx: isSmallScreen ? -1.5 : isMediumScreen ? -1 : 0, // розтягуємо картку ближче до країв
                            overflow: 'hidden',
                            background:
                                theme.palette.mode === 'light'
                                    ? 'rgba(255,255,255,0.9)'
                                    : 'rgba(25,25,28,0.9)',
                            backdropFilter: 'blur(6px)',
                            border: `1px solid ${theme.palette.divider}`,
                            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                            '&:hover': {
                                transform: 'scale(1.01)',
                                boxShadow: theme.shadows[6],
                            },
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                height: isSmallScreen ? 220 : isMediumScreen ? 260 : 320,
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <iframe
                                src={f.fileUrl.replace('/view', '/preview')}
                                title={f.fileName}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 0,
                                    borderRadius: '8px',
                                }}
                            />
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{
                                mt: 1.5,
                                textAlign: 'center',
                                wordBreak: 'break-word',
                                '& a': {
                                    textDecoration: 'none',
                                    color: theme.palette.primary.main,
                                    fontWeight: 500,
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                },
                            }}
                        >
                            <a href={f.fileUrl} target="_blank" rel="noopener noreferrer">
                                {f.fileName}
                            </a>
                        </Typography>
                    </Paper>
                ) : null
            )}
        </Box>
    );
}
