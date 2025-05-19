import React from 'react';
import { useParams } from 'react-router-dom';
import { CourseDetail } from '../components/CourseDetail';

export function CourseDetailPage({
  token,
  isTeacher,
  userId,
}: {
  token: string;
  isTeacher?: boolean;
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
      userId={userId}
    />
  );
}
