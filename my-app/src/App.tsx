import React, { useState } from 'react';
import { NavBar } from './components/NavBar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { UserTasksPage } from './pages/UserTasksPage';
import './App.css';

type Page =
  | 'login'
  | 'register'
  | 'courses'
  | 'courseDetail'
  | 'categories'
  | 'subcategories'
  | 'userTasks';

export default function App() {
  const [token, setToken] = useState<string | null>(() => {
    // Try to restore token from localStorage on first load
    return localStorage.getItem('token');
  });
  const [userId, setUserId] = useState<string | null>(() => {
    // Try to restore token from localStorage on first load
    return localStorage.getItem('userId');
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState<boolean>(true); // You may want to set this from user info
  const [page, setPage] = useState<Page>(() => {
    // Try to restore last page from localStorage, fallback to login if not authenticated
    const savedPage = localStorage.getItem('page') as Page | null;
    if (savedPage && savedPage !== 'login' && savedPage !== 'register' && localStorage.getItem('token')) {
      return savedPage;
    }
    return localStorage.getItem('token') ? 'courses' : 'login';
  });

  // Persist token and page to localStorage
  React.useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
  }, [token]);

  React.useEffect(() => {
    localStorage.setItem('page', page);
  }, [page]);

  const handleLogin = (token: string, userId: string) => {
    setToken(token);
    setUserId(userId);
    localStorage.setItem('userId', userId);
    setPage('courses');
  };


  const handleLogout = () => {
    setToken(null);
    setPage('login');
    setSelectedCourseId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('page');
  };

  // Navigation handler that prevents unauthorized navigation
  const safeSetPage = (target: Page) => {
    if (!token && (target === 'courses' || target === 'categories' || target === 'subcategories' || target === 'userTasks' || target === 'courseDetail')) {
      setPage('login');
      return;
    }
    if (token && (target === 'login' || target === 'register')) {
      setPage('courses');
      return;
    }
    setPage(target);
  };

  return (
    <div className="app-container">
      <NavBar
        token={token}
        onNavigate={(page: string) => safeSetPage(page as Page)}
        onLogout={handleLogout}
      />
      {page === 'login' && <LoginPage onLogin={handleLogin} />}
      {page === 'register' && <RegisterPage onRegister={() => setPage('login')} />}
      {page === 'courses' && token && userId && (
        <CoursesPage
          token={token}
          userId={userId}
          isTeacher={isTeacher}
          onSelectCourse={(id) => {
            setSelectedCourseId(id);
            setPage('courseDetail');
          }}
        />
      )}
      {page === 'courseDetail' && token && selectedCourseId && (
        <React.Suspense fallback={<div>Loading course...</div>}>
          <CourseDetailPage
            token={token}
            courseId={selectedCourseId}
            isTeacher={isTeacher}
            onBack={() => setPage('courses')}
          />
        </React.Suspense>
      )}
      {page === 'userTasks' && token && userId && (
        <UserTasksPage token={token} userId={userId} />
      )}
    </div>
  );
}
