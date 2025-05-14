import React, { useEffect, useState, useCallback } from 'react';
import { getCourses, getFolders, createFolder, moveCourseToFolder } from '../api';
import { CreateCourseForm } from './CreateCourseForm';

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
        // console.log('Fetched folders:', foldersFromApi); // Для дебагу
      })
      .catch(() => setFolders([]));
  }, [token]);

  const fetchCourses = useCallback(() => {
    getCourses(token)
      .then(data => {
        // Use the correct structure returned by backend
        const allCourses = [
          ...(data.ownerCourses || []),
          ...(data.teacherCourses || []),
          ...(data.studentCourses || []),
        ];
        const uniqueCourses = Array.from(
          new Map(allCourses.map(c => [c.id, c])).values()
        );
        setCourses(uniqueCourses);
        setError(null); // clear error on success
      })
      .catch(() => setError('Failed to load courses'));
    fetchFolders();
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
      // Оновлюємо папки після переміщення
      await fetchFolders();
      // Додаємо оновлення selectedFolder та folderCourses після fetchFolders
      setFolders((prev) => {
        const updated = prev.find(f => f.id === folderId);
        if (selectedFolder && selectedFolder.id === folderId && updated) {
          setSelectedFolder(updated);
          setFolderCourses(updated.childCourses || []);
        }
        return prev;
      });
      // Додатково: якщо selectedFolder відкритий, оновити його після fetchFolders
      setTimeout(() => {
        setFolders((prev) => {
          const updated = prev.find(f => f.id === folderId);
          if (selectedFolder && selectedFolder.id === folderId && updated) {
            setSelectedFolder(updated);
            setFolderCourses(updated.childCourses || []);
          }
          return prev;
        });
      }, 200); // невелика затримка для гарантії оновлення
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
      // Always pass courseIds as an empty array
      const folder = await createFolder(token, newFolderName.trim(), userId, undefined, []);
      await moveCourseToFolder(token, folder.id, courseId);
      setShowFolderPopup(null);
      setNewFolderName('');
      await fetchFolders();
      setTimeout(() => {
        setFolders((prev) => {
          const updated = prev.find(f => f.id === folder.id);
          if (selectedFolder && selectedFolder.id === folder.id && updated) {
            setSelectedFolder(updated);
            setFolderCourses(updated.childCourses || []);
          }
          return prev;
        });
      }, 200);
    } catch {
      setFolderError('Failed to create folder or move course');
    } finally {
      setMoving(false);
    }
  };

  return (
    <div>
      <h2>Courses</h2>
      {isTeacher && <CreateCourseForm token={token} onCreated={fetchCourses} />}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* If a folder is selected, display its contents */}
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
          {/* List of folders with view button */}
          <div style={{ marginBottom: 16 }}>
            <b>Folders:</b>
            <ul>
              {folders.length === 0 && <li>No folders found.</li>}
              {folders.map(folder => (
                <li key={folder.id}>
                  {folder.name}{' '}
                  <button onClick={() => handleViewFolder(folder)}>
                    View
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <ul>
            {courses.length === 0 && <li>No courses found.</li>}
            {courses.map(course => (
              <li key={course.id} style={{ marginBottom: 8 }}>
                <button onClick={() => onSelectCourse(course.id)}>
                  {course.name}
                </button>
                {/* Move to Folder button for all users */}
                <button
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    setShowFolderPopup(course.id);
                    setFolderError(null);
                    setNewFolderName('');
                    fetchFolders();
                  }}
                >
                  Move to Folder
                </button>
                {/* Popup for folder selection/creation */}
                {showFolderPopup === course.id && (
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      background: 'rgba(0,0,0,0.2)',
                      zIndex: 1000,
                    }}
                    onClick={() => setShowFolderPopup(null)}
                  >
                    <div
                      style={{
                        background: '#fff',
                        padding: 24,
                        borderRadius: 8,
                        maxWidth: 350,
                        margin: '100px auto',
                        position: 'relative',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <h4>Move "{course.name}" to Folder</h4>
                      {folderError && <div style={{ color: 'red' }}>{folderError}</div>}
                      <div>
                        <b>Select existing folder:</b>
                        <ul>
                          {folders.length === 0 && <li>No folders found.</li>}
                          {folders.map(folder => (
                            <li key={folder.id}>
                              <button
                                disabled={moving}
                                onClick={() => handleMoveCourse(course.id, folder.id)}
                              >
                                {folder.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <b>Or create new folder:</b>
                        <input
                          type="text"
                          placeholder="New folder name"
                          value={newFolderName}
                          onChange={e => setNewFolderName(e.target.value)}
                          disabled={moving}
                          style={{ marginRight: 8 }}
                        />
                        <button
                          disabled={moving}
                          onClick={() => handleCreateAndMove(course.id)}
                        >
                          Create & Move
                        </button>
                      </div>
                      <button
                        style={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => setShowFolderPopup(null)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export {}
