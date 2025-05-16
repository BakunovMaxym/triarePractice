import React, { useEffect, useState } from 'react';
import { getCourse } from '../api';
import { CreateTaskForm } from './CreateTaskForm';
import { TaskComments } from './TaskComments';
import { Link, useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/formatTime';

export function CourseDetail({
  token,
  courseId,
  onBack,
  isTeacher,
  userId,
}: {
  token: string;
  courseId: string;
  onBack: () => void;
  isTeacher?: boolean;
  userId: string;
}) {
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userTasksByTask, setUserTasksByTask] = useState<Record<string, any[]>>({});
  const navigate = useNavigate();

  const fetchCourse = () => {
    getCourse(token, courseId)
      .then(setCourse)
      .catch(() => setError('Не вдалося завантажити курс'));
  };

  useEffect(() => {
    fetchCourse();
  }, [token, courseId]);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!course) return <div>Завантаження...</div>;

  return (
    <div>
      <div style={{ flex: 2 }}>
        <button onClick={onBack} style={{ marginBottom: 16 }}>Назад</button>
        <h2>{course.name}</h2>
        <div><strong>Категорія:</strong> {course.categoryName}</div>
        <div><strong>Підкатегорія:</strong> {course.subCategoryName}</div>
        <div><strong>Створено:</strong> {new Date(course.createdAt).toLocaleString()}</div>
        <div><strong>Власник:</strong> {course.owner?.firstName} {course.owner?.lastName}</div>
        <div><strong>Викладачі:</strong> {(course.teachers || []).map((t: any) => `${t.firstName} ${t.lastName}`).join(', ')}</div>

        <h3 style={{ marginTop: 24 }}>Завдання</h3>
        {isTeacher && <CreateTaskForm token={token} courseId={courseId} onCreated={fetchCourse} />}

        {Array.isArray(course.tasks) && course.tasks.length > 0 ? (
          <ul style={{ paddingLeft: 20 }}>
            {course.tasks.map((task: any) => (
              <li key={task.id} style={{ marginBottom: 24, padding: 0, border: "solid", borderRadius: 6 }}>
                <Link
                  to={isTeacher ? `/tasks/${task.id}` : `/user-task/${task.id}/${userId}`}
                  style={{ textDecoration: "none", padding: 12, color: "inherit", display: "block" }}
                >
                  <b>{task.name}</b>
                  <div><strong>Автор:</strong> {task.owner?.firstName} {task.owner?.lastName}</div>
                  <div><strong>Час на виконання:</strong> {formatTime(task.timeToComplete)}</div>
                </Link>

              </li>
            ))}
          </ul>
        ) : (
          <div>Немає завдань для цього курсу.</div>
        )}
      </div>

      <div style={{ flex: 1, background: '#f9f9f9', padding: 16, borderRadius: 8 }}>
        <h3>Студенти</h3>
        {course.students?.length ? (
          <ul>
            {course.students.map((s: any) => (
              <li key={s.id}
                onClick={() => (isTeacher || userId === s.id) && navigate(`/user-tasks/course/${course.id}/user/${s.id}`, { state: { courseId: course.id, studentId: s.id } })}
                style={{
                  cursor: (isTeacher || userId === s.id) ? 'pointer' : 'default',
                  transition: 'background-color 0.2s',
                  backgroundColor: userId === s.id ? "#a9cbfe" : "#f1f3f6"
                }}
              >
                {s.firstName} {s.lastName}
              </li>
            ))}
          </ul>
        ) : (
          <div>Студентів ще не додано.</div>
        )}
      </div>
    </div>
  );
}

export { }
