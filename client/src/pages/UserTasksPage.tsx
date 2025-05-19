import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formatTime } from '../utils/formatTime';

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
    createdAt: Date
}

export function TaskUserTasksPage({
    token,
}: {
    token: string;
}) {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { taskName } = location.state || {};

    // Масив груп: кожна група — студент + його userTasks
    const [groups, setGroups] = useState<{ student: Student; tasks: UserTask[] }[]>([]);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                return res.json() as Promise<Record<string, UserTask[]>>;
            })
            .then(data => {
                // Перетворюємо Record<string, UserTask[]> в масив
                const arr = Object.values(data).map(tasks => ({
                    student: tasks[0].student,
                    tasks,
                }));
                console.log(arr);
                setGroups(arr);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [taskId, token]);

    const toggle = (studentId: string) => {
        setExpanded(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) newSet.delete(studentId);
            else newSet.add(studentId);
            return newSet;
        });
    };

    if (loading) return <div style={{ padding: '1rem', textAlign: 'center' }}>Завантаження…</div>;
    if (error) return <div style={{ padding: '1rem', color: '#dc2626' }}>Помилка: {error}</div>;

    return (
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1rem' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Назад</button>
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
                            <th style={{ padding: '0.5rem 1rem', textAlign: 'left' }}>Студент</th>
                            <th style={{ padding: '0.5rem 1rem', textAlign: 'left' }}>Статус</th>
                            <th style={{ padding: '0.5rem 1rem', textAlign: 'left' }}>Оцінка</th>
                        </tr>
                    </thead>
                    <tbody style={{ backgroundColor: '#ffffff' }}>
                        {groups.map(({ student, tasks }) => {
                            const first = tasks[0];
                            const isOpen = expanded.has(student.id);

                            return (
                                <React.Fragment key={student.id}>
                                    <tr
                                        onClick={() => toggle(student.id)}
                                        style={{ cursor: 'pointer', fontWeight: 500, borderTop: "solid", borderWidth: 1 }}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                                    >
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            {student.lastName} {student.firstName}
                                            {tasks.length > 1 && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                                                ({tasks.length})
                                            </span>}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <span
                                                style={{
                                                    ...statusStyles[first.status],
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {first.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            {first.grade !== null ? first.grade : '–'}
                                        </td>
                                    </tr>

                                    {isOpen && tasks.map(t => (
                                        <tr
                                            key={t.id}
                                            onClick={() => navigate(`/user-task/${t.id}`)}
                                            style={{ cursor: 'pointer', backgroundColor: '#fafafa' }}
                                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                                        >
                                            <td style={{ padding: '0.5rem 1rem 0.5rem 2rem', fontSize: '0.875rem' }}>
                                                {new Date(t.createdAt).toLocaleString('uk-UA')}
                                            </td>
                                            <td style={{
                                                ...statusStyles[t.status],
                                                display: 'inline-block',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                marginLeft: 30,
                                            }}>
                                                {t.status}
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                {t.grade !== null ? t.grade : '–'}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
