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
        <h4>Move "{course.name}" to Folder</h4>
        {folderError && <div style={{ color: 'red' }}>{folderError}</div>}
        <div>
          <b>Select existing folder:</b>
          <ul style={{ height: 300, overflow: "scroll" }}>
            {folders.length === 0 && <li>No folders found.</li>}
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
            onClick={() => onCreateAndMove(course.id)}
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
  );
}
