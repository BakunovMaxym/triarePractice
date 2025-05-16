import React from 'react';

export function FolderList({ folders, onViewFolder, onDeleteFolder, moving }: {
  folders: any[];
  onViewFolder: (folder: any) => void;
  onDeleteFolder: (folderId: string) => void;
  moving: boolean;
}) {
  // Фільтруємо тільки кореневі папки (без parentFolder)
  const rootFolders = folders.filter(f => !f.parentFolder);

  return (
    <div style={{ marginBottom: 16 }}>
      <b>Папки:</b>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        marginTop: 12,
      }}>
        {rootFolders.length === 0 && <div>Папок не знайдено.</div>}
        {rootFolders.map(folder => (
          <div
            key={folder.id}
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
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{folder.name}</div>
            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={() => onViewFolder(folder)}>
                Переглянути
              </button>
              <button
                style={{ color: 'red' }}
                disabled={moving}
                onClick={async () => {
                  if (window.confirm(`Видалити папку "${folder.name}"?`)) {
                    await onDeleteFolder(folder.id);
                    window.location.reload();
                  }
                }}
              >
                Видалити
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
