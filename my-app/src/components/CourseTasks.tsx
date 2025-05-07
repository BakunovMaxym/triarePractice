import React, { useEffect, useState } from 'react';
import { getTasks } from '../api';

type Task = {
  id: string;
  name: string;
  textContent: string;
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
      .catch(() => setError('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, [token, courseId]);

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h3>Tasks</h3>
      {tasks.length === 0 && <div>No tasks for this course.</div>}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <b>{task.name}</b>
            <div>{task.textContent}</div>
            {onSelectTask && (
              <button onClick={() => onSelectTask(task.id)}>Details</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export {}
