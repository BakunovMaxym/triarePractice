import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export enum TaskStatus {
    ASSIGNED = "Призначено",
    ACCEPTED = "Прийнято",
    SUBMITED = "Здано",
    EXPIRED = "Протерміновано",
    SUBMITED_LATE = "Здано з запізненням",
    GRADED = "Оцінено",
    REJECTED = "Відхилено"
}

const statusStyles: Record<TaskStatus, React.CSSProperties> = {
    [TaskStatus.ASSIGNED]: { color: '#2563eb', backgroundColor: '#dbeafe' },
    [TaskStatus.ACCEPTED]: { color: '#16a34a', backgroundColor: '#dcfce7' },
    [TaskStatus.SUBMITED]: { color: '#4f46e5', backgroundColor: '#e0e7ff' },
    [TaskStatus.EXPIRED]: { color: '#dc2626', backgroundColor: '#fee2e2' },
    [TaskStatus.SUBMITED_LATE]: { color: '#ca8a04', backgroundColor: '#fef9c3' },
    [TaskStatus.GRADED]: { color: '#0d9488', backgroundColor: '#ccfbf1' },
    [TaskStatus.REJECTED]: { color: '#52525b', backgroundColor: '#e5e7eb' },
};

interface Student {
    id: string;
    firstName: string;
    lastName: string;
}

interface Task {
    id: string;
    name: string;
}

interface UserTask {
    id: string;
    status: TaskStatus;
    grade: number | null;
    student: Student;
    task: Task;
}

export function TaskUserTasksPage({
    token,
    onBack
}: {
    token: string;
    onBack: () => void;
}) {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [userTasks, setUserTasks] = useState<UserTask[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const location = useLocation();
    const { taskName } = location.state || {};

    useEffect(() => {
        if (!taskId) return;
        fetch(`http://localhost:3000/task/${taskId}/user-tasks`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) throw new Error(`Помилка ${res.status}`);
                return res.json();
            })
            .then((data: UserTask[]) => {
                setUserTasks(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [taskId, token]);

    if (loading) return <div style={{ padding: '1rem', textAlign: 'center' }}>Завантаження…</div>;
    if (error) return <div style={{ padding: '1rem', color: '#dc2626' }}>Помилка: {error}</div>;

    return (
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                Журнал виконання завдання {taskName}
            </h1>
            <div style={{
                overflow: 'hidden',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                                Прізвище Ім'я
                            </th>
                            <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                                Статус
                            </th>
                            <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                                Оцінка
                            </th>
                        </tr>
                    </thead>
                    <tbody style={{ backgroundColor: '#ffffff' }}>
                        {userTasks.map(task => (
                            <tr
                                key={task.id}
                                onClick={() => navigate(`/user-task/${task.task.id}/${task.student.id}`)}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseOver={e => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                                onMouseOut={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
                            >
                                <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#111827' }}>
                                    {task.student.lastName} {task.student.firstName}
                                </td>
                                <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                                    <span
                                        style={{
                                            ...statusStyles[task.status],
                                            display: 'inline-block',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {task.status}
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#111827' }}>
                                    {task.grade !== null ? task.grade : '–'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
