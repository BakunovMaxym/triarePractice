import React from 'react';
import { CourseList } from '../components/CourseList';

export function CoursesPage({
  token,
  userId,
  isTeacher,
  onSelectCourse,
}: {
  token: string;
  userId: string;
  isTeacher?: boolean;
  onSelectCourse: (id: string) => void;
}) {
  return (
    <CourseList
      token={token}
      userId={userId}
      isTeacher={isTeacher}
      onSelectCourse={onSelectCourse}
    />
  );
}
