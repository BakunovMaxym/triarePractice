import React from 'react';

export function FolderList({ folders, onViewFolder, onDeleteFolder, moving }: {
  folders: any[];
  onViewFolder: (folder: any) => void;
  onDeleteFolder: (folderId: string) => void;
  moving: boolean;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <b>Folders:</b>
      <ul>
        {folders.length === 0 && <li>No folders found.</li>}
        {folders.map(folder => (
          <li key={folder.id}>
            {folder.name}{' '}
            <button onClick={() => onViewFolder(folder)}>
              View
            </button>
            <button
              style={{ marginLeft: 8, color: 'red' }}
              disabled={moving}
              onClick={() => {
                if (window.confirm(`Delete folder "${folder.name}"?`)) {
                  onDeleteFolder(folder.id);
                }
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
