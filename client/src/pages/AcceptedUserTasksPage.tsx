import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
    deadline: string | null;
    completeTimestamp: string | null;
    grade: number | null;
    student: Student;
    task: Task;
    createdAt: string;
}

export function AcceptedUserTasksPage({ token }: { token: string }) {
    const { courseId, studentId } = useParams<{ courseId: string; studentId: string }>();
    const navigate = useNavigate();

    const [courseName, setCourseName] = useState<string>('');
    const [tasks, setTasks] = useState<UserTask[]>([]);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId || !studentId) return;

        // Паралельно завантажуємо назву курсу
        Promise.all([
            fetch(`http://localhost:3000/courses/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => {
                if (!res.ok) throw new Error(`Не вдалося завантажити курс: ${res.status}`);
                return res.json();
            }),
            fetch(`http://localhost:3000/user-task/student/${studentId}/course/${courseId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }).then(res => {
                if (!res.ok) throw new Error(`Помилка завантаження завдань: ${res.status}`);
                return res.json() as Promise<UserTask[]>;
            })
        ])
        .then(([courseData, tasksData]) => {
            setCourseName(courseData.name);
            setTasks(tasksData);
            setLoading(false);
        })
        .catch(err => {
            setError(err.message);
            setLoading(false);
        });
    }, [courseId, studentId, token]);

    const toggle = () => setExpanded(prev => !prev);

    if (loading) return <div style={{ padding: '1rem', textAlign: 'center' }}>Завантаження…</div>;
    if (error) return <div style={{ padding: '1rem', color: '#dc2626' }}>Помилка: {error}</div>;
    if (!tasks.length) return <div style={{ padding: '1rem' }}>Завдання відсутні</div>;

    return (
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1rem' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Назад</button>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                Завдання курсу: {courseName}
            </h1>

            <div style={{ overflow: 'hidden', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={thStyle}>Курс</th>
                            <th style={thStyle}>Завдання</th>
                            <th style={thStyle}>Дедлайн</th>
                            <th style={thStyle}>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            onClick={toggle}
                            style={{ cursor: 'pointer', fontWeight: 500, borderTop: 'solid 1px #e5e7eb' }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                            <td style={tdStyle}>{courseName}</td>
                            <td style={tdStyle}>{tasks.length} завдань</td>
                            <td style={tdStyle}>{expanded ? '▲' : '▼'}</td>
                            <td style={tdStyle}></td>
                        </tr>

                        {expanded && tasks.map(ut => (
                            <tr
                                key={ut.id}
                                onClick={() => navigate(`/user-task/${ut.id}`)}
                                style={{ cursor: 'pointer', backgroundColor: '#fafafa' }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                            >
                                <td style={{ padding: '0.5rem 1rem' }}></td>
                                <td style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>{ut.task.name}</td>
                                <td style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    {ut.deadline ? new Date(ut.deadline).toLocaleDateString('uk-UA') : '–'}
                                </td>
                                <td style={{ padding: '0.5rem 1rem' }}>
                                    <span style={{
                                        ...statusStyles[ut.status],
                                        display: 'inline-block',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}>
                                        {ut.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const thStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    textAlign: 'left',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
};

const tdStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: '#111827',
};
