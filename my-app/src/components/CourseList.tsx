import React, { useEffect, useState, useCallback } from 'react';
import { getCourses, getFolders, createFolder, moveCourseToFolder } from '../api';
import { CreateCourseForm } from './CreateCourseForm';

export function CourseList({
  token,
  onSelectCourse,
  isTeacher,
}: {
  token: string;
  onSelectCourse: (id: string) => void;
  isTeacher?: boolean;
}) {
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [showFolderPopup, setShowFolderPopup] = useState<string | null>(null); // courseId or null
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  const fetchFolders = useCallback(() => {
    getFolders(token)
      .then(setFolders)
      .catch(() => setFolders([]));
  }, [token]);

  const fetchCourses = useCallback(() => {
    getCourses(token)
      .then(data => {
        // Defensive: flatten arrays and filter out duplicates by id
        const allCourses = [
          ...(data.ownerCourses || []),
          ...(data.teacherCourses || []),
          ...(data.studentCourses || []),
        ];
        // Remove duplicates by id
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
  }, [token, fetchCourses]);

  // Move course to selected folder
  const handleMoveCourse = async (courseId: string, folderId: string) => {
    setMoving(true);
    setFolderError(null);
    try {
      await moveCourseToFolder(token, folderId, courseId);
      setShowFolderPopup(null);
      fetchCourses();
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
      const folder = await createFolder(token, newFolderName.trim());
      await moveCourseToFolder(token, folder.id, courseId);
      setShowFolderPopup(null);
      setNewFolderName('');
      fetchCourses();
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
    </div>
  );
}

export {}
