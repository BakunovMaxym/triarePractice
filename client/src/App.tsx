import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { UserTasksPage } from './pages/UserTasksPage';
import './App.css';
import { FolderPage } from './pages/FolderPage';
import { TaskDetailPage } from './pages/TaskDetailPage';

function AppContent() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('userId'));
  const [isTeacher, setIsTeacher] = useState<boolean>(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
  }, [token]);

  const handleLogin = (newToken: string, newUserId: string) => {
    setToken(newToken);
    setUserId(newUserId);
    localStorage.setItem('userId', newUserId);
    navigate('/courses');
  };

  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    setSelectedCourseId(null);
    navigate('/login');
  };

  return (
    <div className="app-container">
      <NavBar token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/courses" : "/login"} />} />
        <Route path="/login" element={
          token ? <Navigate to="/courses" /> : <LoginPage onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          token ? <Navigate to="/courses" /> : <RegisterPage onRegister={() => navigate('/login')} />
        } />
        <Route path="/courses" element={
          token && userId ? (
            <CoursesPage
              token={token}
              userId={userId}
              isTeacher={isTeacher}
              onSelectCourse={(id) => {
                setSelectedCourseId(id);
                navigate(`/courses/${id}`);
              }}
            />
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/courses/:courseId" element={
          token ? (
            <React.Suspense fallback={<div>Loading course...</div>}>
              <CourseDetailPage
                token={token}
                isTeacher={isTeacher}
                onBack={() => navigate('/courses')}
              />
            </React.Suspense>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/folders/:folderId" element={
          token ? (
            <React.Suspense fallback={<div>Loading course...</div>}>
              <FolderPage
                token={token}
                isTeacher={isTeacher}
                onBack={() => navigate('/courses')}
              />
            </React.Suspense>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/tasks/:taskId" element={
          token ? (
            <React.Suspense fallback={<div>Loading course...</div>}>
              <TaskDetailPage
                token={token}
                isTeacher={isTeacher}
                onBack={() => navigate('/courses')}
              />
            </React.Suspense>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/userTasks" element={
          token && userId ? (
            <UserTasksPage token={token} userId={userId} />
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
