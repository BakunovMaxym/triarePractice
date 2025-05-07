import React, { useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { CourseList } from './components/CourseList';
import { CourseDetail } from './components/CourseDetail';
import { CategoryList } from './components/CategoryList';
import { SubCategoryList } from './components/SubCategoryList';
import './App.css';

type Page = 'login' | 'register' | 'courses' | 'courseDetail' | 'categories' | 'subcategories';

export default function App() {
  const [page, setPage] = useState<Page>('login');
  const [token, setToken] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isTeacher] = useState(true);

  const handleLogin = (token: string) => {
    setToken(token);
    setPage('courses');
  };

  const handleLogout = () => {
    setToken(null);
    setPage('login');
  };

  return (
    <div className="app-container">
      <nav style={{ marginBottom: 24 }}>
        {token ? (
          <>
            <button onClick={() => setPage('courses')}>Courses</button>
            <button onClick={() => setPage('categories')}>Categories</button>
            <button onClick={() => setPage('subcategories')}>SubCategories</button>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => setPage('login')}>Login</button>
            <button onClick={() => setPage('register')}>Register</button>
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
        <CourseDetail
          token={token}
          courseId={selectedCourseId}
          onBack={() => setPage('courses')}
          isTeacher={isTeacher}
        />
      )}
      {page === 'categories' && <CategoryList />}
      {page === 'subcategories' && <SubCategoryList />}
    </div>
  );
}
