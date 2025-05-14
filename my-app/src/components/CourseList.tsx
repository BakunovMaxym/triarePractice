import React, { useEffect, useState, useCallback } from 'react';
import { getCourses, getFolders, createFolder, moveCourseToFolder, deleteFolder as apiDeleteFolder } from '../api';
import { CreateCourseForm } from './CreateCourseForm';
import { FolderList } from './FolderList';
import { CourseItem } from './CourseItem';

export function CourseList({
  token,
  onSelectCourse,
  isTeacher,
  userId, // <-- add this prop
}: {
  token: string;
  onSelectCourse: (id: string) => void;
  isTeacher?: boolean;
  userId: string; // <-- add this prop
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
  }, [token, fetchFolders]);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // View folder and its courses (always use fresh data from folders state)
  const handleViewFolder = useCallback((folder: any) => {
    // Ensure folder.childCourses is always an array
    const freshFolder = folders.find((f) => f.id === folder.id) || folder;
    // If childCourses is array of objects with .id, use as is; if it's array of ids, map to course objects
    let folderCoursesArr = [];
    if (Array.isArray(freshFolder.childCourses) && freshFolder.childCourses.length > 0) {
      if (typeof freshFolder.childCourses[0] === 'object') {
        folderCoursesArr = freshFolder.childCourses;
      } else {
        // childCourses is array of ids, map to course objects
        folderCoursesArr = courses.filter(c => freshFolder.childCourses.includes(c.id));
      }
    }
    setSelectedFolder(freshFolder);
    setFolderCourses(folderCoursesArr);
  }, [folders, courses]);

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
          // Додаємо курс до childCourses, якщо його там ще немає
          const childCourses = Array.isArray(f.childCourses) ? [...f.childCourses] : [];
          if (!childCourses.some((c: any) => (typeof c === 'object' ? c.id : c) === courseId)) {
            childCourses.push(courseId);
          }
          return { ...f, childCourses };
        }
        return f;
      }));
      // Видаляємо курс зі списку courses
      setCourses(prev => prev.filter(c => c.id !== courseId));
      // Оновлюємо selectedFolder, якщо треба
      setFolders(prev => {
        const updated = prev.find(f => f.id === folderId);
        if (selectedFolder && selectedFolder.id === folderId && updated) {
          setSelectedFolder(updated);
          setFolderCourses(updated.childCourses || []);
        }
        return prev;
      });
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
    if (!userId) {
      setFolderError('user id required');
      return;
    }
    if (!courseId) {
      setFolderError('user id required');
      return;
    }

    setMoving(true);
    setFolderError(null);
    try {
      // Передаємо ownerId як третій аргумент
      const folder = await createFolder(token, newFolderName.trim(), userId, [courseId]);
      setShowFolderPopup(null);
      setNewFolderName('');
      // Додаємо нову папку у стан
      setFolders(prev => [...prev, folder]);
      // Видаляємо курс зі списку courses
      setCourses(prev => prev.filter(c => c.id !== courseId));
    } catch {
      setFolderError('Failed to create folder or move course');
    } finally {
      setMoving(false);
    }
  };

  // Додаємо функцію для видалення папки
  const deleteFolder = async (folderId: string) => {
    setMoving(true);
    setFolderError(null);
    try {
      await apiDeleteFolder(token, folderId);
      const deletedFolder = folders.find(f => f.id === folderId);
      let coursesToReturn: any[] = [];
      if (deletedFolder && Array.isArray(deletedFolder.childCourses)) {
        if (typeof deletedFolder.childCourses[0] === 'object') {
          coursesToReturn = deletedFolder.childCourses;
        } else {
          const allCourses = [
            ...(courses || []),
            ...(folders.flatMap(f => Array.isArray(f.childCourses) ? f.childCourses : []))
          ];
          coursesToReturn = deletedFolder.childCourses
            .map((id: string) => allCourses.find(c => c.id === id))
            .filter(Boolean);
        }
      }
      setCourses(prev => {
        const ids = new Set(prev.map(c => c.id));
        const toAdd = coursesToReturn.filter(c => !ids.has(c.id));
        return [...prev, ...toAdd];
      });
      setFolders(prev => prev.filter(f => f.id !== folderId));
      if (selectedFolder && selectedFolder.id === folderId) {
        setSelectedFolder(null);
        setFolderCourses([]);
      }
      fetchCourses();
    } catch {
      setFolderError('Failed to delete folder');
    } finally {
      setMoving(false);
    }
  };

  return (
    <div>
      <h2>Courses</h2>
      {isTeacher && <CreateCourseForm token={token} onCreated={fetchCourses} />}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {selectedFolder ? (
        <div>
          <button onClick={() => setSelectedFolder(null)} style={{ marginBottom: 12 }}>← Back to all courses</button>
          <h3>Folder: {selectedFolder.name}</h3>
          <ul>
            {folderCourses.length === 0 && <li>No courses in this folder.</li>}
            {folderCourses.map(course => (
              <li key={course.id}>
                <button onClick={() => onSelectCourse(course.id)}>
                  {course.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          {/* Use FolderList component */}
          <FolderList
            folders={folders}
            onViewFolder={handleViewFolder}
            onDeleteFolder={deleteFolder}
            moving={moving}
          />
          <ul>
            {courses.length === 0 && <li>No courses found.</li>}
            <b>Courses:</b>
            {courses.map(course => (
              <CourseItem
                key={course.id}
                course={course}
                onSelectCourse={onSelectCourse}
                folders={folders}
                token={token}
                userId={userId}
                onMoveCourse={handleMoveCourse}
                onCreateAndMove={handleCreateAndMove}
                fetchFolders={fetchFolders}
                moving={moving}
                folderError={folderError}
                setFolderError={setFolderError}
                setNewFolderName={setNewFolderName}
                newFolderName={newFolderName}
                showFolderPopup={showFolderPopup}
                setShowFolderPopup={setShowFolderPopup}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export { }
