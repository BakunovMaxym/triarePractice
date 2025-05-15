import React from 'react';

export function FolderPopup({
  course,
  folders,
  moving,
  folderError,
  onMoveCourse,
  onCreateAndMove,
  setShowFolderPopup,
  newFolderName,
  setNewFolderName,
  userId,
}: any) {
  return (
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
        <h4>Перемістити "{course.name}" у папку</h4>
        {folderError && <div style={{ color: 'red' }}>{folderError}</div>}
        <div>
          <b>Оберіть існуючу папку:</b>
          <ul style={{ height: 300, overflow: "scroll" }}>
            {folders.length === 0 && <li>Папок не знайдено.</li>}
            {folders.map((folder: any) => (
              <li key={folder.id}>
                <button
                  disabled={moving}
                  onClick={() => onMoveCourse(course.id, folder.id)}
                >
                  {folder.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 16 }}>
          <b>Або створіть нову папку:</b>
          <input
            type="text"
            placeholder="Назва нової папки"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            disabled={moving}
            style={{ marginRight: 8 }}
          />
          <button
            disabled={moving}
            onClick={() => onCreateAndMove(course.id)}
          >
            Створити і перемістити
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
  );
}
