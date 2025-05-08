import React, { useEffect, useState, useCallback } from 'react';
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

  const fetchCourses = useCallback(() => {
    getCourses(token)
      .then(data => {
        // Defensive: flatten arrays and filter out duplicates by id
        const allCourses = [
          ...(data.ownerCourses || []),
          ...(data.teacherCourses || []),
          ...(data.studentCourses || []),
        ];
        // Remove duplicates by id
        const uniqueCourses = Array.from(
          new Map(allCourses.map(c => [c.id, c])).values()
        );
        setCourses(uniqueCourses);
        setError(null); // clear error on success
      })
      .catch(() => setError('Failed to load courses'));
  }, [token]);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, fetchCourses]);

  return (
    <div>
      <h2>Courses</h2>
      {isTeacher && <CreateCourseForm token={token} onCreated={fetchCourses} />}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {courses.length === 0 && <li>No courses found.</li>}
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
