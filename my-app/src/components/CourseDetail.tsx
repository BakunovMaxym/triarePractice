import React, { useEffect, useState } from 'react';
import { getCourse } from '../api';

export function CourseDetail({
  token,
  courseId,
  onBack,
}: {
  token: string;
  courseId: string;
  onBack: () => void;
}) {
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCourse(token, courseId)
      .then(setCourse)
      .catch(() => setError('Failed to load course'));
  }, [token, courseId]);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!course) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h2>{course.name}</h2>
      <div>
        <strong>Owner:</strong> {course.owner?.firstName} {course.owner?.lastName}
      </div>
      <div>
        <strong>Teachers:</strong>{' '}
        {(course.teachers || []).map((t: any) => `${t.firstName} ${t.lastName}`).join(', ')}
      </div>
      <div>
        <strong>Students:</strong>{' '}
        {(course.students || []).map((s: any) => `${s.firstName} ${s.lastName}`).join(', ')}
      </div>
    </div>
  );
}

export {}
