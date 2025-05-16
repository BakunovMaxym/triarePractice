import React from 'react';
import { useParams } from 'react-router-dom';
import { CourseDetail } from '../components/CourseDetail';

export function CourseDetailPage({
  token,
  isTeacher,
  onBack,
  userId,
}: {
  token: string;
  isTeacher?: boolean;
  onBack: () => void;
  userId: string,
}) {
  const { courseId } = useParams<{ courseId: string }>();

  if (!courseId) {
    return <div>Course ID is missing.</div>;
  }

  return (
    <CourseDetail
      token={token}
      courseId={courseId}
      isTeacher={isTeacher}
      onBack={onBack}
      userId={userId}
    />
  );
}
