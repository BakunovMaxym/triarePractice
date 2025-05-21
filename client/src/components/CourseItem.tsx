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
    <>
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
    </>
  );
}
