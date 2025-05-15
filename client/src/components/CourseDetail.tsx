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
}: {
  token: string;
  courseId: string;
  onBack: () => void;
  isTeacher?: boolean;
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




  useEffect(() => {
    if (isTeacher && course && Array.isArray(course.tasks)) {
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
  if (!course) return <div>Завантаження...</div>;

  const userId = course.owner?.id || '';

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
                  to={`/tasks/${task.id}`}
                  style={{ textDecoration: "none", padding: 12, color: "inherit", display: "block" }}
                >
                  <b>{task.name}</b>
                  <div><strong>Автор:</strong> {task.owner?.firstName} {task.owner?.lastName}</div>
                  <div><strong>Час на виконання:</strong> {formatTime(task.timeToComplete)}</div>
                </Link>

                {isTeacher && userTasksByTask[task.id] && (
                  <div style={{ marginTop: 8, background: '#f5f5fa', padding: 8, borderRadius: 6 }}>
                    <strong>Призначено студентам:</strong>
                    <ul style={{ marginTop: 4 }}>
                      {userTasksByTask[task.id].length === 0 && <li>Немає призначених студентів</li>}
                      {userTasksByTask[task.id].map((ut: any) => (
                        <li key={ut.id}>
                          {ut.user?.firstName} {ut.user?.lastName} — <b>{ut.status}</b>
                          {ut.grade && <> | Оцінка: {ut.grade}</>}
                          {ut.deadline && <> | Дедлайн: {new Date(ut.deadline).toLocaleString()}</>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* <TaskComments taskId={task.id} userId={userId} /> */}
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
                onClick={() => navigate(`/user-tasks/course/${course.id}/user/${s.id}`, { state: { courseId: course.id, studentId: s.id } })}
                style={{
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
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
