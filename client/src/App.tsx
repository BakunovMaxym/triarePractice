import React, { useRef, useState } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useNavigate,
    useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { NavBar } from './components/navBar/NavBar';
import {
    Box,
    Paper,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { TaskUserTasksPage } from './pages/UserTasksPage';
import './App.css';
import { FolderPage } from './pages/FolderPage';
import { TaskDetailPage } from './pages/TaskTaskDetailPage';
import { StudentTasksPage } from './pages/StudentTasksPage';
import { UserTaskDetailPage } from './pages/UserTaskDetailPage';
import { AcceptedUserTasksPage } from './pages/AcceptedUserTasksPage';

// ---------- AnimatedRoutes ----------
function AnimatedRoutes({
    token,
    userId,
    isTeacher,
    coursesRefreshKey,
    handleLogin,
}: any) {
    const location = useLocation();
    const navigate = useNavigate();

    const variants = {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{ width: '100%', height: '100%' }}
            >
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Navigate to={token ? "/courses" : "/login"} />} />
                    <Route path="/login" element={
                        token ? <Navigate to="/courses" /> :
                            <LoginPage onLogin={handleLogin} />
                    } />
                    <Route path="/register" element={
                        token ? <Navigate to="/courses" /> :
                            <RegisterPage onRegister={() => navigate('/login')} />
                    } />
                    <Route path="/courses" element={
                        token && userId ? (
                            <CoursesPage
                                token={token}
                                userId={userId}
                                isTeacher={isTeacher}
                                onSelectCourse={(id) => navigate(`/courses/${id}`)}
                                key={String(coursesRefreshKey)}
                            />
                        ) : <Navigate to="/login" />
                    } />
                    <Route path="/courses/:courseId" element={
                        token ? (
                            <React.Suspense fallback={<div>Loading course...</div>}>
                                <CourseDetailPage token={token} isTeacher={isTeacher} userId={userId} />
                            </React.Suspense>
                        ) : <Navigate to="/login" />
                    } />
                    <Route path="/folders/:folderId" element={
                        token ? <FolderPage token={token} isTeacher={isTeacher} /> : <Navigate to="/login" />
                    } />
                    <Route path="/tasks/:taskId" element={
                        token ? <TaskDetailPage token={token} userId={userId} /> : <Navigate to="/login" />
                    } />
                    <Route path="/user-tasks/task/:taskId" element={
                        token ? <TaskUserTasksPage token={token} /> : <Navigate to="/login" />
                    } />
                    <Route path="/user-tasks/course/:courseId/user/:studentId" element={
                        token ? <StudentTasksPage token={token} /> : <Navigate to="/login" />
                    } />
                    <Route path="/user-task/student/:studentId/accepted" element={
                        token ? <AcceptedUserTasksPage token={token} /> : <Navigate to="/login" />
                    } />
                    <Route path="/user-task/:taskId/:userId" element={
                        token ? <UserTaskDetailPage token={token} isTeacher={isTeacher} /> : <Navigate to="/login" />
                    } />
                    <Route path="/user-task/:userTaskId" element={
                        token ? <UserTaskDetailPage token={token} isTeacher={isTeacher} /> : <Navigate to="/login" />
                    } />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}

// ---------- AppContent ----------
function AppContent() {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('userId'));
    const [isTeacher, setIsTeacher] = useState<boolean>(() => localStorage.getItem('role') === 'TEACHER');
    const [coursesRefreshKey, setCoursesRefreshKey] = useState(0);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const scrollRef = useRef<HTMLDivElement>(null);

    const handleLogin = (token: string, userId: string, role: string) => {
        setToken(token);
        setUserId(userId);
        setIsTeacher(role === 'TEACHER');
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('role', role);
        navigate('/courses');
    };

    const handleLogout = () => {
        setToken(null);
        setUserId(null);
        setIsTeacher(false);
        localStorage.clear();
        navigate('/login');
    };

    const handleJoinCourseAsStudent = async (courseId: string) => {
        if (!token) throw new Error('Не авторизовано');
        const res = await fetch(`http://localhost:3000/course/${courseId}/as`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Не вдалося приєднатися');
        setCoursesRefreshKey(k => k + 1);
    };

    const handleJoinCourseAsTeacher = async (courseId: string) => {
        if (!token) throw new Error('Не авторизовано');
        const res = await fetch(`http://localhost:3000/course/${courseId}/at/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Не вдалося приєднатися');
        setCoursesRefreshKey(k => k + 1);
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
                background: theme.palette.mode === 'light'
                    ? 'linear-gradient(120deg, rgba(66,165,245,0.15), rgba(236,108,246,0.1))'
                    : 'linear-gradient(120deg, rgba(66,165,245,0.05), rgba(236,108,246,0.05))',
                transition: `background ${theme.transitions.duration.standard}ms`,
            }}
        >

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    background: theme.palette.mode === 'light'
                        ? 'linear-gradient(120deg, rgba(66,165,245,0.15), rgba(236,108,246,0.1))'
                        : 'linear-gradient(120deg, rgba(66,165,245,0.05), rgba(236,108,246,0.05))',
                }}
            >
                <NavBar
                    token={token}
                    userId={userId}
                    onLogout={handleLogout}
                    onJoinCourseAsStudent={handleJoinCourseAsStudent}
                    onJoinCourseAsTeacher={handleJoinCourseAsTeacher}
                    isTeacher={isTeacher}
                    scrollContainerRef={scrollRef} // ← додаємо
                />

                <Box
                    ref={scrollRef}
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        px: isMobile ? 1.5 : 4,
                        py: isMobile ? 2 : 3,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                    }}
                >
                    <Paper
                        elevation={8}
                        sx={{
                            width: '100%',
                            maxWidth: { lg: '70vw', sx: '100%' },
                            minHeight: 'calc(100vh - 80px)',
                            borderRadius: isMobile ? 0 : 4,
                            mt: 7,
                            p: isMobile ? 2 : 4,
                            background: theme.palette.background.paper,
                            boxShadow: theme.shadows[4],
                            overflow: 'hidden',
                        }}
                    >
                        <AnimatedRoutes
                            token={token}
                            userId={userId}
                            isTeacher={isTeacher}
                            coursesRefreshKey={coursesRefreshKey}
                            handleLogin={handleLogin}
                            handleJoinCourseAsStudent={handleJoinCourseAsStudent}
                            handleJoinCourseAsTeacher={handleJoinCourseAsTeacher}
                        />
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}


// ---------- Root ----------
export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}
