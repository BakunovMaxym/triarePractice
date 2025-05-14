import React, { useEffect, useState } from 'react';
import { getCourse } from '../api';
import { CreateTaskForm } from './CreateTaskForm';
import { TaskComments } from './TaskComments';

export function CourseDetail({
  token,
  courseId,
  onBack,
  isTeacher,
}: {
  token: string;
  courseId: string;
  onBack: () => void;
  isTeacher?: boolean;
}) {
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userTasksByTask, setUserTasksByTask] = useState<Record<string, any[]>>({});

  const fetchCourse = () => {
    getCourse(token, courseId)
      .then(setCourse)
      .catch(() => setError('Failed to load course'));
  };

  // Fetch user-tasks for each task if teacher
  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, courseId]);

  useEffect(() => {
    if (isTeacher && course && Array.isArray(course.tasks)) {
      // For each task, fetch user-tasks assigned to it
      Promise.all(
        course.tasks.map(async (task: any) => {
          const res = await fetch(`/task/${task.id}/user-tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) return [task.id, []];
          const userTasks = await res.json();
          return [task.id, userTasks];
        })
      ).then(results => {
        const map: Record<string, any[]> = {};
        results.forEach(([taskId, uts]) => {
          map[taskId] = uts;
        });
        setUserTasksByTask(map);
      });
    }
  }, [isTeacher, course, token]);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!course) return <div>Loading...</div>;

  const userId = course.owner?.id || '';

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 16 }}>Back</button>
      <h2>{course.name}</h2>
      <div style={{ marginBottom: 8 }}>
        <strong>Owner:</strong> {course.owner?.firstName} {course.owner?.lastName}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Teachers:</strong>{' '}
        {(course.teachers || []).map((t: any) => `${t.firstName} ${t.lastName}`).join(', ')}
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Students:</strong>{' '}
        {(course.students || []).map((s: any) => `${s.firstName} ${s.lastName}`).join(', ')}
      </div>
      <h3>Tasks</h3>
      {isTeacher && <CreateTaskForm token={token} courseId={courseId} onCreated={fetchCourse} />}
      {Array.isArray(course.tasks) && course.tasks.length > 0 ? (
        <ul>
          {course.tasks.map((task: any) => (
            <li key={task.id} style={{ marginBottom: 32 }}>
              <b>{task.name}</b>
              <div style={{ marginBottom: 8 }}>{task.textContent}</div>
              {/* Teacher-only: show user-task info */}
              {isTeacher && userTasksByTask[task.id] && (
                <div style={{ margin: '8px 0', padding: '8px', background: '#f5f5fa', borderRadius: 6 }}>
                  <strong>Assigned to:</strong>
                  <ul>
                    {userTasksByTask[task.id].length === 0 && <li>No students assigned</li>}
                    {userTasksByTask[task.id].map((ut: any) => (
                      <li key={ut.id}>
                        {ut.user?.firstName} {ut.user?.lastName} — <b>{ut.status}</b>
                        {/* Optionally show grade if available: */}
                        {ut.grade && <> | Grade: {ut.grade}</>}
                        {ut.deadline && <> | Deadline: {ut.deadline}</>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <TaskComments taskId={task.id} userId={userId} token={token} />
            </li>
          ))}
        </ul>
      ) : (
        <div>No tasks for this course.</div>
      )}
    </div>
  );
}

export {}
