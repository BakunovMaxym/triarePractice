import React from 'react';
import { Typography, Box, Fade } from '@mui/material';
import { FolderList } from '../FolderList';

export function FolderSection({ folders, onViewFolder, onDeleteFolder, moving }: any) {
    return (
        <Fade in timeout={500}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                    Папки
                </Typography>
                <FolderList
                    folders={folders}
                    onViewFolder={onViewFolder}
                    onDeleteFolder={onDeleteFolder}
                    moving={moving}
                />
            </Box>
        </Fade>
    );
}
