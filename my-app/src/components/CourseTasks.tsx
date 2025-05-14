import React, { useEffect, useState } from 'react';
import { getTasks } from '../api';

type Task = {
  id: string;
  name: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
  course: {
    id: string;
    name: string;
  };
  timeToComplete: string;
};

export function CourseTasks({
  token,
  courseId,
  onSelectTask,
}: {
  token: string;
  courseId: string;
  onSelectTask?: (taskId: string) => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTasks(token, courseId)
      .then((data) => setTasks(data))
      .catch(() => setError('Не вдалося завантажити завдання'))
      .finally(() => setLoading(false));
  }, [token, courseId]);

  if (loading) return <div>Завантаження завдань...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h3>Завдання курсу</h3>
      {tasks.length === 0 && <div>Для цього курсу немає завдань.</div>}
      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: '1rem' }}>
            <div><strong>Назва:</strong> {task.name}</div>
            <div><strong>Автор:</strong> {task.owner.firstName} {task.owner.lastName}</div>
            <div><strong>Курс:</strong> {task.course.name}</div>
            <div><strong>Час на виконання:</strong> {task.timeToComplete} сек</div>
            {onSelectTask && (
              <button onClick={() => onSelectTask(task.id)}>Деталі</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export {}
