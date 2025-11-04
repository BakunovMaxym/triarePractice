import React, { useEffect, useState } from 'react';
import { getUserTasks, createUserTask, getTasks } from '../api';
const API_URL = process.env.REACT_APP_API_URL;

type UserTask = {
  id: string;
  status: string;
  deadline?: string;
  task?: { id: string; name: string };
};

type TaskDetails = {
  id: string;
  name: string;
  textContent: string;
  fileContent?: { fileName: string; fileUrl: string }[];
};

export function UserTasks({ token, userId }: { token: string; userId: string }) {
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track which task details are shown (by taskId)
  const [shownTaskDetails, setShownTaskDetails] = useState<Record<string, TaskDetails | null>>({});
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});

  const fetchTasks = () => {
    setLoading(true);
    setError(null);
    getUserTasks(token)
      .then(setTasks)
      .catch(() => setError('Не вдалося завантажити завдання користувача'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fetch full task details after assignment
  const handleGetTask = async (taskId: string) => {
    setAssigning(a => ({ ...a, [taskId]: true }));
    setError(null);
    try {
      // Assign the task to the user
      await createUserTask(token, { userId, taskId });
      // Fetch the full task details (single task endpoint)
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не вдалося отримати деталі завдання');
      const details = await res.json();
      setShownTaskDetails(d => ({ ...d, [taskId]: details }));
      fetchTasks();
    } catch {
      setError('Не вдалося призначити або отримати завдання');
    } finally {
      setAssigning(a => ({ ...a, [taskId]: false }));
    }
  };

  return (
    <div>
      <h3>Ваші призначені завдання</h3>
      {loading ? (
        <div>Завантаження...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <ul>
          {tasks.map((t) => (
            <li key={t.id} style={{ marginBottom: 16 }}>
              <b>{t.task?.name || t.task?.id || 'Завдання'}:</b> {t.status}
              {t.deadline && <> (Дедлайн: {t.deadline})</>}
              {!shownTaskDetails[t.task?.id || ''] ? (
                <button
                  style={{ marginLeft: 8 }}
                  disabled={assigning[t.task?.id || '']}
                  onClick={() => t.task?.id && handleGetTask(t.task.id)}
                >
                  {assigning[t.task?.id || ''] ? 'Завантаження...' : 'Отримати завдання'}
                </button>
              ) : null}
              {/* Show task details if fetched */}
              {shownTaskDetails[t.task?.id || ''] && (
                <div style={{ marginTop: 8, paddingLeft: 16 }}>
                  <div>
                    <strong>Опис:</strong> {shownTaskDetails[t.task?.id || '']?.textContent}
                  </div>
                  {shownTaskDetails[t.task?.id || '']?.fileContent?.length ? (
                    <div>
                      <strong>Файли:</strong>
                      <ul>
                        {shownTaskDetails[t.task?.id || '']?.fileContent?.map(f => (
                          <li key={f.fileName}>
                            <a href={f.fileUrl} target="_blank" rel="noopener noreferrer">{f.fileName}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { }
