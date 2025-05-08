import React, { useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { CourseList } from './components/CourseList';
import { CourseDetail } from './components/CourseDetail';
import { CategoryList } from './components/CategoryList';
import { SubCategoryList } from './components/SubCategoryList';
import { UserTasks } from './components/UserTasks';
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
    }
  }, [token]);
  React.useEffect(() => {
    localStorage.setItem('page', page);
  }, [page]);

  const handleLogin = (token: string) => {
    setToken(token);
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
      <nav style={{ marginBottom: 24 }}>
        {token ? (
          <>
            <button onClick={() => safeSetPage('courses')}>Courses</button>
            <button onClick={() => safeSetPage('categories')}>Categories</button>
            <button onClick={() => safeSetPage('subcategories')}>SubCategories</button>
            <button onClick={() => safeSetPage('userTasks')}>My Tasks</button>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => safeSetPage('login')}>Login</button>
            <button onClick={() => safeSetPage('register')}>Register</button>
          </>
        )}
      </nav>

      {page === 'login' && <Login onLogin={handleLogin} />}
      {page === 'register' && <Register onRegister={() => setPage('login')} />}
      {page === 'courses' && token && (
        <CourseList
          token={token}
          onSelectCourse={(id) => {
            setSelectedCourseId(id);
            setPage('courseDetail');
          }}
          isTeacher={isTeacher}
        />
      )}
      {page === 'courseDetail' && token && selectedCourseId && (
        <React.Suspense fallback={<div>Loading course...</div>}>
          <CourseDetail
            token={token}
            courseId={selectedCourseId}
            onBack={() => setPage('courses')}
            isTeacher={isTeacher}
          />
        </React.Suspense>
      )}
      {page === 'categories' && token && <CategoryList />}
      {page === 'subcategories' && token && <SubCategoryList />}
      {page === 'userTasks' && token && (
        <UserTasks token={token} userId={token} />
      )}
    </div>
  );
}
