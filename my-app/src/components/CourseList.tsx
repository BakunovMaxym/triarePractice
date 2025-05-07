import React, { useEffect, useState } from 'react';
import { getCourses } from '../api';
import { CreateCourseForm } from './CreateCourseForm';

export function CourseList({
  token,
  onSelectCourse,
  isTeacher,
}: {
  token: string;
  onSelectCourse: (id: string) => void;
  isTeacher?: boolean;
}) {
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = () => {
    getCourses(token)
      .then(data => {
        setCourses([
          ...data.ownerCourses,
          ...data.teacherCourses,
          ...data.studentCourses,
        ]);
      })
      .catch(() => setError('Failed to load courses'));
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div>
      <h2>Courses</h2>
      {isTeacher && <CreateCourseForm token={token} onCreated={fetchCourses} />}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {courses.map(course => (
          <li key={course.id}>
            <button onClick={() => onSelectCourse(course.id)}>
              {course.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export {}
