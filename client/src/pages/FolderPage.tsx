import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

  if (!folder) return <div>Завантаження...</div>;

  return (
    <div>
      <h2>Папка: {folder.name}</h2>
      <p>Власник: {folder.owner.firstName} {folder.owner.lastName}</p>

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
              </div>
            ))}
          </div>
        </div>
      )}

      {folder.childCourses.length > 0 && (
        <div>
          <h3>Курси:</h3>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
