import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function NavBar({
  token,
  onLogout,
  onJoinCourseAsStudent,
  onJoinCourseAsTeacher,
  isTeacher,
}: {
  token: string | null;
  onLogout: () => void;
  onJoinCourseAsStudent?: (courseId: string) => Promise<void>;
  onJoinCourseAsTeacher?: (courseId: string) => Promise<void>;
  isTeacher?: boolean;
}) {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showJoinStudentInput, setShowJoinStudentInput] = useState(false);
  const [showJoinTeacherInput, setShowJoinTeacherInput] = useState(false);
  const [joinCourseIdStudent, setJoinCourseIdStudent] = useState('');
  const [joinCourseIdTeacher, setJoinCourseIdTeacher] = useState('');
  const [joinErrorStudent, setJoinErrorStudent] = useState<string | null>(null);
  const [joinErrorTeacher, setJoinErrorTeacher] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
        setShowJoinStudentInput(false);
        setShowJoinTeacherInput(false);
        setJoinErrorStudent(null);
        setJoinErrorTeacher(null);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const handleJoinStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinErrorStudent(null);
    if (!joinCourseIdStudent.trim()) {
      setJoinErrorStudent('Введіть ID курсу');
      return;
    }
    try {
      if (onJoinCourseAsStudent) {
        await onJoinCourseAsStudent(joinCourseIdStudent.trim());
        setShowJoinStudentInput(false);
        setProfileMenuOpen(false);
        setJoinCourseIdStudent('');
      }
    } catch (err: any) {
      setJoinErrorStudent(err?.message || 'Не вдалося приєднатися');
    }
  };

  const handleJoinTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinErrorTeacher(null);
    if (!joinCourseIdTeacher.trim()) {
      setJoinErrorTeacher('Введіть ID курсу');
      return;
    }
    try {
      if (onJoinCourseAsTeacher) {
        await onJoinCourseAsTeacher(joinCourseIdTeacher.trim());
        setShowJoinTeacherInput(false);
        setProfileMenuOpen(false);
        setJoinCourseIdTeacher('');
      }
    } catch (err: any) {
      setJoinErrorTeacher(err?.message || 'Не вдалося приєднатися');
    }
  };

  return (
    <nav style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {token ? (
          <>
            <Link to="/courses">
              <button>Курси</button>
            </Link>
            <Link to="/userTasks">
              <button>Мої завдання</button>
            </Link>
            <button onClick={handleLogout}>Вийти</button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button>Увійти</button>
            </Link>
            <Link to="/register">
              <button>Реєстрація</button>
            </Link>
          </>
        )}
      </div>
      {token && (
        <div ref={profileMenuRef} style={{ position: 'relative', marginRight: 8 }}>
          <button
            style={{
              borderRadius: '50%',
              width: 38,
              height: 38,
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
            }}
            onClick={() => setProfileMenuOpen((v) => !v)}
            aria-label="Профіль"
          >
            <span role="img" aria-label="profile">👤</span>
          </button>
          {profileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 44,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 8,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                minWidth: 220,
                zIndex: 100,
                padding: 12,
              }}
            >
              <button
                style={{
                  width: '100%',
                  background: 'none',
                  color: '#1976d2',
                  border: 'none',
                  textAlign: 'left',
                  padding: 8,
                  cursor: 'pointer',
                  borderRadius: 4,
                  fontSize: 16,
                  marginBottom: 4,
                }}
                onClick={() => {
                  setShowJoinStudentInput((v) => !v);
                  setShowJoinTeacherInput(false);
                }}
              >
                Приєднатися як студент
              </button>
              {showJoinStudentInput && (
                <form onSubmit={handleJoinStudent} style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    placeholder="ID курсу"
                    value={joinCourseIdStudent}
                    onChange={e => setJoinCourseIdStudent(e.target.value)}
                    style={{ width: '100%', marginBottom: 6, padding: 6, borderRadius: 4, border: '1px solid #bbb' }}
                  />
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      background: '#388e3c',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 0',
                      borderRadius: 6,
                      fontSize: 15,
                      cursor: 'pointer',
                    }}
                  >
                    Приєднатися
                  </button>
                  {joinErrorStudent && <div style={{ color: 'red', marginTop: 4 }}>{joinErrorStudent}</div>}
                </form>
              )}
              {isTeacher === true && (
                <>
                  <button
                    style={{
                      width: '100%',
                      background: 'none',
                      color: '#1976d2',
                      border: 'none',
                      textAlign: 'left',
                      padding: 8,
                      cursor: 'pointer',
                      borderRadius: 4,
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                    onClick={() => {
                      setShowJoinTeacherInput((v) => !v);
                      setShowJoinStudentInput(false);
                    }}
                  >
                    Приєднатися як вчитель
                  </button>
                  {showJoinTeacherInput && (
                    <form onSubmit={handleJoinTeacher} style={{ marginTop: 8 }}>
                      <input
                        type="text"
                        placeholder="ID курсу"
                        value={joinCourseIdTeacher}
                        onChange={e => setJoinCourseIdTeacher(e.target.value)}
                        style={{ width: '100%', marginBottom: 6, padding: 6, borderRadius: 4, border: '1px solid #bbb' }}
                      />
                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          background: '#388e3c',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 0',
                          borderRadius: 6,
                          fontSize: 15,
                          cursor: 'pointer',
                        }}
                      >
                        Приєднатися
                      </button>
                      {joinErrorTeacher && <div style={{ color: 'red', marginTop: 4 }}>{joinErrorTeacher}</div>}
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
