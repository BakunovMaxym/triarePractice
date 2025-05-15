import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // імпортуємо useNavigate і useParams
import { getCourses, getFolders, createFolder, moveCourseToFolder, deleteFolder as apiDeleteFolder } from '../api';
import { CreateCourseForm } from './CreateCourseForm';
import { FolderList } from './FolderList';
import { CourseItem } from './CourseItem';

export function CourseList({
  token,
  onSelectCourse,
  isTeacher,
  userId,
}: {
  token: string;
  onSelectCourse: (id: string) => void;
  isTeacher?: boolean;
  userId: string;
}) {
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [showFolderPopup, setShowFolderPopup] = useState<string | null>(null); // courseId or null
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null);
  const [folderCourses, setFolderCourses] = useState<any[]>([]);

  const navigate = useNavigate(); // для переходу по маршруту
  const { courseId, folderId } = useParams(); // отримуємо параметри з URL

  const fetchFolders = useCallback(() => {
    getFolders(token)
      .then(foldersFromApi => {
        setFolders(foldersFromApi);
      })
      .catch(() => setFolders([]));
  }, [token]);

  // Допоміжна функція для отримання id курсів, які знаходяться в папках
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

  const fetchCourses = useCallback(() => {
    Promise.all([getCourses(token), getFolders(token)]).then(([data, foldersFromApi]) => {
      setFolders(foldersFromApi);
      const allCourses = [
        ...(data.ownerCourses || []),
        ...(data.teacherCourses || []),
        ...(data.studentCourses || []),
      ];
      const uniqueCourses = Array.from(
        new Map(allCourses.map(c => [c.id, c])).values()
      );
      // Фільтруємо курси, які вже є в папках
      const courseIdsInFolders = getCourseIdsInFolders(foldersFromApi);
      const filteredCourses = uniqueCourses.filter(c => !courseIdsInFolders.has(c.id));
      setCourses(filteredCourses);
      setError(null);
    }).catch(() => setError('Failed to load courses'));
  }, [token]);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // View folder and its courses (always use fresh data from folders state)
  const handleViewFolder = useCallback((folder: any) => {
    // Перехід на папку по її ID
    navigate(`/folders/${folder.id}`);
  }, [navigate]);

  // Move course to selected folder
  const handleMoveCourse = async (courseId: string, folderId: string) => {
    setMoving(true);
    setFolderError(null);
    try {
      await moveCourseToFolder(token, folderId, courseId);
      setShowFolderPopup(null);
      // Оновлюємо папки у стані без перезавантаження
      setFolders(prev => prev.map(f => {
        if (f.id === folderId) {
          const childCourses = Array.isArray(f.childCourses) ? [...f.childCourses] : [];
          if (!childCourses.some((c: any) => (typeof c === 'object' ? c.id : c) === courseId)) {
            childCourses.push(courseId);
          }
          return { ...f, childCourses };
        }
        return f;
      }));
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setSelectedFolder(null);
    } catch {
      setFolderError('Failed to move course');
    } finally {
      setMoving(false);
    }
  };

  // Create folder and move course
  const handleCreateAndMove = async (courseId: string) => {
    if (!newFolderName.trim()) {
      setFolderError('Folder name required');
      return;
    }

    setMoving(true);
    setFolderError(null);
    try {
      const folder = await createFolder(token, newFolderName.trim(), userId, [courseId]);
      setShowFolderPopup(null);
      setNewFolderName('');
      setFolders(prev => [...prev, folder]);
      setCourses(prev => prev.filter(c => c.id !== courseId));
    } catch {
      setFolderError('Failed to create folder or move course');
    } finally {
      setMoving(false);
    }
  };

  const deleteFolder = async (folderId: string) => {
    setMoving(true);
    setFolderError(null);
    try {
      await apiDeleteFolder(token, folderId);
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setSelectedFolder(null);
    } catch {
      setFolderError('Failed to delete folder');
    } finally {
      setMoving(false);
    }
  };

  return (
    <div>
      <h2>Курси</h2>
      {isTeacher && <CreateCourseForm token={token} onCreated={fetchCourses} />}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {folderId ? (
        <div>
          <button onClick={() => navigate('/courses')} style={{ marginBottom: 12 }}>← Назад до всіх курсів</button>
          <h3>Папка: {selectedFolder?.name}</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 12,
          }}>
            {folderCourses.length === 0 && <div>У цій папці немає курсів.</div>}
            {folderCourses.map(course => (
              <div
                key={course.id}
                style={{
                  background: '#f1f3f6',
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  minHeight: 90,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{course.name}</div>
                <button onClick={() => onSelectCourse(course.id)}>
                  Переглянути
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <FolderList
            folders={folders}
            onViewFolder={handleViewFolder}
            onDeleteFolder={deleteFolder}
            moving={moving}
          />
          <b>Курси:</b>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 12,
          }}>
            {courses.length === 0 && <div>Курсів не знайдено.</div>}
            {courses.map(course => (
              <div
                key={course.id}
                style={{
                  background: '#f1f3f6',
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  minHeight: 90,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{course.name}</div>
                <button onClick={() => onSelectCourse(course.id)}>
                  Переглянути
                </button>
                <button
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    setShowFolderPopup(course.id);
                    setFolderError(null);
                    setNewFolderName('');
                    fetchFolders();
                  }}
                >
                  Перемістити у папку
                </button>
                {showFolderPopup === course.id && (
                  <CourseItem
                    course={course}
                    onSelectCourse={onSelectCourse}
                    folders={folders}
                    token={token}
                    userId={userId}
                    onMoveCourse={handleMoveCourse}
                    onCreateAndMove={handleCreateAndMove}
                    moving={moving}
                    folderError={folderError}
                    setFolderError={setFolderError}
                    setNewFolderName={setNewFolderName}
                    newFolderName={newFolderName}
                    showFolderPopup={showFolderPopup}
                    setShowFolderPopup={setShowFolderPopup}
                    fetchFolders={fetchFolders}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
