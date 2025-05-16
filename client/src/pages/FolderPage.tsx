import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deleteFolder } from '../api';

type Course = {
  id: string;
  name: string;
};

type Folder = {
  id: string;
  name: string;
  childFolders: Folder[];
  childCourses: Course[];
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export function FolderPage({
  token,
  isTeacher,
  onBack
}: {
  token: string;
  isTeacher?: boolean;
  onBack: () => void;
}) {
  const { folderId } = useParams<{ folderId: string }>();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [newChildName, setNewChildName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState<{ [courseId: string]: string }>({});
  const [movingCourseId, setMovingCourseId] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFolder = async () => {
      try {
        const res = await fetch(`http://localhost:3000/folder/${folderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log(data)
        setFolder(data);
      } catch (err) {
        console.error('Не вдалося завантажити папку:', err);
      }
    };

    if (folderId) {
      fetchFolder();
    }
  }, [folderId, token]);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) {
      setCreateError('Введіть назву папки');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch(`http://localhost:3000/folder/${folderId}/add-child`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ childName: newChildName }),
      });
      if (!res.ok) throw new Error('Не вдалося створити папку');
      const updated = await res.json();
      setFolder(updated);
      setNewChildName('');
    } catch (err: any) {
      setCreateError(err.message || 'Помилка створення папки');
    } finally {
      setCreating(false);
    }
  };

  const handleMoveCourse = async (courseId: string) => {
    const targetFolderId = moveTarget[courseId];
    if (!targetFolderId) {
      setMoveError('Оберіть папку для переміщення');
      return;
    }
    setMovingCourseId(courseId);
    setMoveError(null);
    try {
      const res = await fetch(`http://localhost:3000/folder/${targetFolderId}/add-child`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ childCourseId: courseId }),
      });
      if (!res.ok) throw new Error('Не вдалося перемістити курс');
      const updated = await res.json();
      setFolder(updated);
      setMoveTarget(t => ({ ...t, [courseId]: '' }));
    } catch (err: any) {
      setMoveError(err.message || 'Помилка переміщення курсу');
    } finally {
      setMovingCourseId(null);
    }
  };

  const handleDeleteChildFolder = async (childFolderId: string) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю папку та всі її дочірні папки?')) return;
    try {
      await deleteFolder(token, childFolderId);
      // Оновити поточну папку після видалення
      if (folderId) {
        const res = await fetch(`http://localhost:3000/folder/${folderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFolder(data);
      }
    } catch (err: any) {
      alert(err.message || 'Не вдалося видалити папку');
    }
  };

  if (!folder) return <div>Завантаження...</div>;

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 16 }}>Назад</button>
      <h2>Папка: {folder.name}</h2>
      <p>
        Власник:{" "}
        {folder.owner
          ? `${folder.owner.firstName} ${folder.owner.lastName}`
          : <span style={{ color: "gray" }}>невідомо</span>}
      </p>

      {/* --- Додати дочірню папку --- */}
      <form onSubmit={handleAddChild} style={{ marginBottom: 20 }}>
        <label>
          <b>Додати дочірню папку:</b>
          <input
            type="text"
            value={newChildName}
            onChange={e => setNewChildName(e.target.value)}
            placeholder="Назва нової папки"
            disabled={creating}
            style={{ marginLeft: 8, marginRight: 8 }}
          />
        </label>
        <button type="submit" disabled={creating}>
          {creating ? 'Створення...' : 'Створити'}
        </button>
        {createError && <span style={{ color: 'red', marginLeft: 8 }}>{createError}</span>}
      </form>
      {/* --- /Додати дочірню папку --- */}

      {folder.childFolders.length > 0 && (
        <div>
          <h3>Дочірні папки:</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginTop: 12,
          }}>
            {folder.childFolders.map((f) => (
              <div
                key={f.id}
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
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{f.name}</div>
                <button onClick={() => navigate(`/folders/${f.id}`)}>
                  Переглянути
                </button>
                <button
                  style={{ color: 'red', marginTop: 8 }}
                  onClick={() => handleDeleteChildFolder(f.id)}
                >
                  Видалити
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {folder.childCourses.length > 0 && (
        <div>
          <h3>Курси:</h3>
          {moveError && <div style={{ color: 'red', marginBottom: 8 }}>{moveError}</div>}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 12,
          }}>
            {folder.childCourses.map((course) => (
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
                <button onClick={() => navigate(`/courses/${course.id}`)}>
                  Переглянути
                </button>
                {/* --- Перемістити курс у дочірню папку --- */}
                {folder.childFolders.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <select
                      value={moveTarget[course.id] || ''}
                      onChange={e =>
                        setMoveTarget(t => ({ ...t, [course.id]: e.target.value }))
                      }
                      disabled={movingCourseId === course.id}
                    >
                      <option value="">Оберіть папку для переміщення</option>
                      {folder.childFolders.map(f =>
                        <option key={f.id} value={f.id}>{f.name}</option>
                      )}
                    </select>
                    <button
                      style={{ marginLeft: 8 }}
                      disabled={!moveTarget[course.id] || movingCourseId === course.id}
                      onClick={() => handleMoveCourse(course.id)}
                    >
                      {movingCourseId === course.id ? 'Переміщення...' : 'Перемістити'}
                    </button>
                  </div>
                )}
                {/* --- /Перемістити курс у дочірню папку --- */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
