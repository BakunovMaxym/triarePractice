import React from 'react';
import { CourseDetail } from '../components/CourseDetail';

export function CourseDetailPage({
  token,
  courseId,
  isTeacher,
  onBack,
}: {
  token: string;
  courseId: string;
  isTeacher?: boolean;
  onBack: () => void;
}) {
  return (
    <CourseDetail
      token={token}
      courseId={courseId}
      isTeacher={isTeacher}
      onBack={onBack}
    />
  );
}
