import React, { useEffect, useState } from 'react';
import { getCourses } from '../api';

export function CourseList({
  token,
  onSelectCourse,
}: {
  token: string;
  onSelectCourse: (id: string) => void;
}) {
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCourses(token)
      .then(data => {
        // data: { ownerCourses, teacherCourses, studentCourses }
        setCourses([
          ...data.ownerCourses,
          ...data.teacherCourses,
          ...data.studentCourses,
        ]);
      })
      .catch(() => setError('Failed to load courses'));
  }, [token]);

  return (
    <div>
      <h2>Courses</h2>
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
