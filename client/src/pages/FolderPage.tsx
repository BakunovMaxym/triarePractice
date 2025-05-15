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
        console.error('Failed to fetch folder:', err);
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
          <ul>
            {folder.childFolders.map((f) => (
              <li key={f.id}>
                <button onClick={() => navigate(`/folders/${f.id}`)}>
                  {f.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {folder.childCourses.length > 0 && (
        <div>
          <h3>Курси:</h3>
          <ul>
            {folder.childCourses.map((course) => (
              <li key={course.id}>
                <button onClick={() => navigate(`/courses/${course.id}`)}>
                  {course.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
