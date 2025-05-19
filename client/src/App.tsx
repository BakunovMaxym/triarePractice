import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
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
import { joinCourseAsStudent } from './api';

function AppContent() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('userId'));
  const [isTeacher, setIsTeacher] = useState<boolean>(() => {
    const role = localStorage.getItem('role');
    return role === 'TEACHER';
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [coursesRefreshKey, setCoursesRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
  }, [token]);

  const handleLogin = (newToken: string, newUserId: string, role: string) => {
    setToken(newToken);
    setUserId(newUserId);
    setIsTeacher(role === 'TEACHER');
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('role', role);
    navigate('/courses');
  };

  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    setIsTeacher(false);
    setSelectedCourseId(null);
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Функція для приєднання до курсу як студент
  const handleJoinCourseAsStudent = async (courseId: string) => {
    if (!token) throw new Error('Не авторизовано');
    const res = await fetch(`http://localhost:3000/course/${courseId}/as`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      let msg = 'Не вдалося приєднатися';
      try {
        const err = await res.json();
        if (err?.message) msg = err.message;
      } catch { }
      throw new Error(msg);
    }
    setCoursesRefreshKey(k => k + 1); // оновити курси
  };

  // Функція для приєднання до курсу як вчитель
  const handleJoinCourseAsTeacher = async (courseId: string) => {
    if (!token) throw new Error('Не авторизовано');
    const res = await fetch(`http://localhost:3000/course/${courseId}/at/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      let msg = 'Не вдалося приєднатися як вчитель';
      try {
        const err = await res.json();
        if (err?.message) msg = err.message;
      } catch { }
      throw new Error(msg);
    }
    setCoursesRefreshKey(k => k + 1);
  };

  return (
    <div className="app-container">
      <NavBar
        token={token}
        onLogout={handleLogout}
        onJoinCourseAsStudent={handleJoinCourseAsStudent}
        onJoinCourseAsTeacher={handleJoinCourseAsTeacher}
        isTeacher={isTeacher}
      />
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/courses" : "/login"} />} />
        <Route path="/login" element={
          token ? <Navigate to="/courses" /> : <LoginPage onLogin={(token: string, userId: string, role: string) => handleLogin(token, userId, role)} />
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
              key={String(coursesRefreshKey)}
            />
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/courses/:courseId" element={
          token && userId ? (
            <React.Suspense fallback={<div>Loading course...</div>}>
              <CourseDetailPage
                token={token}
                isTeacher={isTeacher}
                userId={userId}
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
              />
            </React.Suspense>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/tasks/:taskId" element={
          token && userId ? (
            <React.Suspense fallback={<div>Loading course...</div>}>
              <TaskDetailPage
                token={token}
                userId={userId}
              />
            </React.Suspense>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/user-tasks/task/:taskId" element={
          token ? (
            <TaskUserTasksPage token={token} />
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/user-tasks/course/:courseId/user/:studentId" element={
          token ? (
            <StudentTasksPage token={token} />
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/user-task/:taskId/:userId" element={
          token ? (
            <UserTaskDetailPage token={token} isTeacher={isTeacher}/>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/user-task/:userTaskId" element={
          token ? (
            <UserTaskDetailPage token={token} isTeacher={isTeacher} />
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
