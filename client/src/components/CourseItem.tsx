import React from 'react';
import { FolderPopup } from './FolderPopup';

export function CourseItem({
  course,
  onSelectCourse,
  folders,
  token,
  userId,
  onMoveCourse,
  onCreateAndMove,
  fetchFolders,
  moving,
  folderError,
  setFolderError,
  setNewFolderName,
  newFolderName,
  showFolderPopup,
  setShowFolderPopup,
}: any) {
  return (
    <li style={{ marginBottom: 8 }}>
      <button onClick={() => onSelectCourse(course.id)}>
        {course.name}
      </button>
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
      {showFolderPopup === course.id && (
        <FolderPopup
          course={course}
          folders={folders}
          moving={moving}
          folderError={folderError}
          onMoveCourse={onMoveCourse}
          onCreateAndMove={onCreateAndMove}
          setShowFolderPopup={setShowFolderPopup}
          newFolderName={newFolderName}
          setNewFolderName={setNewFolderName}
          userId={userId}
        />
      )}
    </li>
  );
}
