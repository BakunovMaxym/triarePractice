import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getCourses,
    getFolders,
    createFolder,
    moveCourseToFolder,
    deleteFolder as apiDeleteFolder,
} from '../../api';
import { CreateCourseForm } from '../CreateCourseForm';
import { useTheme, Box, Typography, Dialog, DialogTitle, DialogContent, Menu, MenuItem, TextField, Button, Paper } from '@mui/material';
import { FilterBar } from './FilterBar';
import { FolderSection } from './FolderSection';
import { CourseGrid } from './CourseGrid';
import { FolderPopup } from '../FolderPopup';

interface Filters {
    ownerId: string;
    name: string;
    teacherId: string;
    category: string;
    subCategory: string;
}

function buildQuery(filters: Filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
    });
    return params.toString();
}

export function CourseList({ token, onSelectCourse, isTeacher, userId }: any) {
    const theme = useTheme();
    const navigate = useNavigate();

    const [folders, setFolders] = useState<any[]>([]);
    const [studentCourses, setStudentCourses] = useState<any[]>([]);
    const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
    const [userOptions, setUserOptions] = useState<any[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [FolderPopupCourse, setFolderPopupCourse] = useState<{ id: string, name: string } | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [folderError, setFolderError] = useState<string | null>(null);
    const [moving, setMoving] = useState(false);
    const [copiedCourseId, setCopiedCourseId] = useState<string | null>(null);

    const [filters, setFilters] = useState<Filters>({
        ownerId: '',
        name: '',
        teacherId: '',
        category: '',
        subCategory: '',
    });

    const [ownerLabel, setOwnerLabel] = useState('');
    const [teacherLabel, setTeacherLabel] = useState('');
    const [categoryLabel, setCategoryLabel] = useState('');
    const [subCategoryLabel, setSubCategoryLabel] = useState('');

    const getCourseIdsInFolders = (foldersList: any[]) => {
        const ids = new Set<string>();
        foldersList.forEach(folder => {
            if (Array.isArray(folder.childCourses)) {
                folder.childCourses.forEach((c: any) => {
                    if (typeof c === 'object' && c.id) ids.add(c.id);
                    else if (typeof c === 'string') ids.add(c);
                });
            }
        });
        return ids;
    };

    const fetchFolders = useCallback(() => {
        getFolders(token)
            .then(foldersFromApi => setFolders(foldersFromApi))
            .catch(() => setFolders([]));
    }, [token]);

    const fetchCourses = useCallback(() => {
        const query = buildQuery(filters);
        const url = `http://localhost:3000/course${query ? '?' + query : ''}`;

        Promise.all([getCourses(token, url), getFolders(token)])
            .then(([data, foldersFromApi]) => {
                setFolders(foldersFromApi);
                const courseIdsInFolders = getCourseIdsInFolders(foldersFromApi);

                const allStudentCourses = Array.isArray(data.studentCourses)
                    ? data.studentCourses
                    : [];
                const allTeacherCourses = [
                    ...(Array.isArray(data.ownerCourses) ? data.ownerCourses : []),
                    ...(Array.isArray(data.teacherCourses) ? data.teacherCourses : []),
                ];

                const uniqueStudentCourses = Array.from(
                    new Map(allStudentCourses.map((c: any) => [c.id, c])).values()
                ).filter((c: any) => !courseIdsInFolders.has(c.id));
                const uniqueTeacherCourses = Array.from(
                    new Map(allTeacherCourses.map((c: any) => [c.id, c])).values()
                ).filter((c: any) => !courseIdsInFolders.has(c.id));

                const map = new Map<string, string>();
                [...uniqueStudentCourses, ...uniqueTeacherCourses].forEach(c => {
                    map.set(c.owner.id, `${c.owner.lastName} ${c.owner.firstName}`);
                    (c.teachers || []).forEach((t: any) =>
                        map.set(t.id, `${t.lastName} ${t.firstName}`)
                    );
                });
                setUserOptions(
                    Array.from(map.entries()).map(([id, label]) => ({ id, label }))
                );

                setStudentCourses(uniqueStudentCourses);
                setTeacherCourses(uniqueTeacherCourses);

                const all = [...uniqueStudentCourses, ...uniqueTeacherCourses];
                const cats = Array.from(new Set(all.map(c => c.categoryName))).filter(
                    Boolean
                );
                const subcats = Array.from(
                    new Set(all.map(c => c.subCategoryName))
                ).filter(Boolean);
                setCategoryOptions(cats);
                setSubCategoryOptions(subcats);

                setError(null);
            })
            .catch(() => setError('Не вдалося завантажити курси'));
    }, [token, filters]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const applyFilters = () => {
        const owner = userOptions.find(u => u.label === ownerLabel)?.id || '';
        const teacher = userOptions.find(u => u.label === teacherLabel)?.id || '';
        setFilters({
            ownerId: owner,
            name: filters.name,
            teacherId: teacher,
            category: categoryLabel,
            subCategory: subCategoryLabel,
        });
    };

    const resetFilters = () => {
        setFilters({
            ownerId: '',
            name: '',
            teacherId: '',
            category: '',
            subCategory: '',
        });
        setOwnerLabel('');
        setTeacherLabel('');
        setCategoryLabel('');
        setSubCategoryLabel('');
    };

    const handleMoveCourse = async (courseId: string, folderId: string) => {
        setMoving(true);
        try {
            await moveCourseToFolder(token, folderId, courseId);
            setFolderPopupCourse(null);
            Promise.all([fetchCourses(), fetchFolders()]);
        } finally {
            setMoving(false);
        }
    };

    const handleCreateAndMove = async (courseId: string) => {
        if (!newFolderName.trim()) {
            setFolderError('Folder name required');
            return;
        }
        setMoving(true);
        try {
            const folder = await createFolder(token, newFolderName.trim(), userId, [
                courseId,
            ]);
            setFolders(prev => [...prev, folder]);
            setFolderPopupCourse(null);
            fetchCourses();
        } catch {
            setFolderError('Помилка при створенні папки');
        } finally {
            setMoving(false);
        }
    };

    const deleteFolder = async (id: string) => {
        await apiDeleteFolder(token, id);
        setFolders(prev => prev.filter(f => f.id !== id));
    };

    return (
        <Box>

            {isTeacher && <CreateCourseForm token={token} onCreated={fetchCourses} />}
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <FolderSection
                folders={folders}
                onViewFolder={(f: any) => navigate(`/folders/${f.id}`)}
                onDeleteFolder={deleteFolder}
                moving={moving}
            />

            <FilterBar
                ownerLabel={ownerLabel}
                setOwnerLabel={setOwnerLabel}
                teacherLabel={teacherLabel}
                setTeacherLabel={setTeacherLabel}
                categoryLabel={categoryLabel}
                setCategoryLabel={setCategoryLabel}
                subCategoryLabel={subCategoryLabel}
                setSubCategoryLabel={setSubCategoryLabel}
                userOptions={userOptions}
                categoryOptions={categoryOptions}
                subCategoryOptions={subCategoryOptions}
                applyFilters={applyFilters}
                resetFilters={resetFilters}
            />

            <CourseGrid
                title="Мої курси як студент"
                courses={studentCourses}
                token={token}
                userId={userId}
                isTeacher={isTeacher}
                onSelectCourse={onSelectCourse}
                folders={folders}
                FolderPopupCourse={FolderPopupCourse}
                setFolderPopupCourse={setFolderPopupCourse}
                folderError={folderError}
                setFolderError={setFolderError}
                newFolderName={newFolderName}
                setNewFolderName={setNewFolderName}
                moving={moving}
                fetchFolders={fetchFolders}
                onMoveCourse={handleMoveCourse}
                onCreateAndMove={handleCreateAndMove}
                copiedCourseId={copiedCourseId}
                setCopiedCourseId={setCopiedCourseId}
            />

            <CourseGrid
                title="Мої курси як викладач"
                courses={teacherCourses}
                token={token}
                userId={userId}
                isTeacher={isTeacher}
                onSelectCourse={onSelectCourse}
                folders={folders}
                FolderPopupCourse={FolderPopupCourse}
                setFolderPopupCourse={setFolderPopupCourse}
                folderError={folderError}
                setFolderError={setFolderError}
                newFolderName={newFolderName}
                setNewFolderName={setNewFolderName}
                moving={moving}
                fetchFolders={fetchFolders}
                onMoveCourse={handleMoveCourse}
                onCreateAndMove={handleCreateAndMove}
                copiedCourseId={copiedCourseId}
                setCopiedCourseId={setCopiedCourseId}
            />
            {FolderPopupCourse && (
                <Dialog open={!!FolderPopupCourse}
                    onClose={() => setFolderPopupCourse(null)}
                    fullWidth
                    maxWidth="sm"
                    slotProps={{
                        paper: {
                            sx: {
                                borderRadius: 3,
                                overflow: 'hidden',
                                bgcolor:
                                    theme.palette.mode === 'light'
                                        ? 'linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)'
                                        : 'linear-gradient(180deg, #1e1e22 0%, #151518 100%)',
                                boxShadow: theme.shadows[10],
                                border: `1px solid ${theme.palette.divider}`,
                                backdropFilter: 'blur(12px)',
                                p: 1,
                                transition: 'all 0.3s ease-in-out',
                            }
                        }
                    }}
                // sx={{
                //     background: theme.palette.mode === 'light'
                //         ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(240,247,255,0.95))'
                //         : 'linear-gradient(180deg, rgba(28,28,30,0.95), rgba(20,20,22,0.9))',
                // }}
                >
                    <DialogTitle
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            pb: 1,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Typography component="span" color="text.primary" fontWeight={700}>
                                Перемістити
                            </Typography>
                            <Typography component="span" color="primary.main" fontWeight={800}>
                                {FolderPopupCourse?.name}
                            </Typography>
                            <Typography component="span" color="text.primary" fontWeight={700}>
                                у папку
                            </Typography>
                        </Box>
                        <Button
                            onClick={() => setFolderPopupCourse(null)}
                            sx={{
                                minWidth: 0,
                                color: 'text.secondary',
                                '&:hover': {
                                    color: 'error.main',
                                    transform: 'scale(1.15)',
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        >
                            ✕
                        </Button>
                    </DialogTitle>
                    <DialogContent sx={{ mt: 1, pb: 3 }}>
                        {folderError && <Typography color="error" sx={{ ml: 2, mb: 1 }}>{folderError}</Typography>}
                        <Typography fontWeight={600} sx={{ mb: 1 }}>Оберіть існуючу папку:</Typography>
                        {folders.length === 0
                            ? <Typography sx={{ mt: 2 }} color='secondary'>Папок не знайдено.</Typography>
                            : <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.5,
                                    mb: 2,
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                    pr: 1,
                                    '&::-webkit-scrollbar': { width: 6 },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: theme.palette.action.hover,
                                        borderRadius: 3,
                                    },
                                }}>
                                {folders.map((folder: any) => (
                                    <MenuItem
                                        key={folder.id}
                                        onClick={() => handleMoveCourse(FolderPopupCourse.id, folder.id)}
                                        sx={{
                                            borderRadius: 1.5,
                                            transition: 'background 0.25s ease',
                                            '&:hover': {
                                                bgcolor:
                                                    theme.palette.mode === 'light'
                                                        ? 'rgba(89,184,247,0.15)'
                                                        : 'rgba(236,108,246,0.15)',
                                            },
                                        }}>
                                        {folder.name}
                                    </MenuItem>
                                ))}
                            </Box>
                        }
                        <Paper
                            component="form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCreateAndMove(FolderPopupCourse.id)
                            }}
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                boxShadow: theme.shadows[1],
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: theme.shadows[3],
                                },
                            }}
                        >
                            <Typography fontWeight={600}>
                                Або створіть нову папку:
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Назва нової папки"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                            />
                            {error && (
                                <Typography color="error" variant="caption">
                                    {error}
                                </Typography>
                            )}
                            <Button
                                type="submit"
                                variant="contained"
                                color="success"
                                disabled={moving}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    alignSelf: 'flex-end',
                                }}
                            >
                                Свторити і перемістити
                            </Button>
                        </Paper>
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    );
}
