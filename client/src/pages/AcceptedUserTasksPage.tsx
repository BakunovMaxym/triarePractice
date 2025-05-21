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
    courseName: string;
}

interface UserTask {
    id: string;
    status: TaskStatus;
    deadline: string | null;
    completeTimestamp: string | null;
    grade: number | null;
    student: Student;
    task: Task;
    createdAt: Date;
}

export function AcceptedUserTasksPage({ token }: { token: string }) {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();

    const [groups, setGroups] = useState<Record<string, UserTask[]>>({});
    const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!studentId) return;
        fetch(`http://localhost:3000/user-task/student/${studentId}/accepted`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) throw new Error(`Помилка ${res.status}`);
                return res.json() as Promise<UserTask[]>;
            })
            .then(tasksObj => {
    const grouped: Record<string, UserTask[]> = {};
    const allTasks = Object.values(tasksObj).flat();

    for (const task of allTasks) {
        const courseName = task.task.courseName;
        if (!grouped[courseName]) grouped[courseName] = [];
        grouped[courseName].push(task);
    }

    setGroups(grouped);
    setLoading(false);
})

            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [studentId, token]);

    const toggleCourse = (courseName: string) => {
        setExpandedCourses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(courseName)) newSet.delete(courseName);
            else newSet.add(courseName);
            return newSet;
        });
    };

    if (loading) return <div style={{ padding: '1rem', textAlign: 'center' }}>Завантаження…</div>;
    if (error) return <div style={{ padding: '1rem', color: '#dc2626' }}>Помилка: {error}</div>;
    if (Object.keys(groups).length === 0) return <div style={{ padding: '1rem' }}>Завдання відсутні</div>;

    return (
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1rem' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Назад</button>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                Завдання студента
            </h1>

            <div style={{ overflow: 'hidden', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={thStyle}>Курс</th>
                            <th style={{ padding: '0.5rem 2rem 0.5rem 4rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: '#374151', }}>Дедлайн</th>
                            <th style={thStyle}>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groups).map(([courseName, tasks]) => {
                            const first = tasks[0];
                            const isOpen = expandedCourses.has(courseName);
                            return (
                                <React.Fragment key={courseName}>
                                    <tr
                                        onClick={() => toggleCourse(courseName)}
                                        style={{ cursor: 'pointer', fontWeight: 500, borderTop: "solid", borderWidth: 1 }}
                                        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                                        onMouseOut={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
                                    >
                                        <td style={tdStyle}>
                                            {courseName}
                                            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                                                ({tasks.length})
                                            </span>
                                        </td>
                                        <td style={tdStyle}></td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                ...statusStyles[first.status],
                                                display: 'inline-block',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                            }}>
                                                {first.status}
                                            </span>
                                        </td>
                                    </tr>

                                    {isOpen && tasks.map(ut => (
                                        <tr
                                            key={ut.id}
                                            onClick={() => navigate(`/user-task/${ut.id}`)}
                                            style={{ cursor: 'pointer', backgroundColor: '#fafafa' }}
                                            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                                            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                                        >
                                            <td style={{ padding: '0.5rem 0.1rem 0.5rem 1.5rem', fontSize: '0.875rem' }}>
                                                <b>Завдання:</b> {ut.task.name}
                                            </td>
                                            <td style={{ padding: '0.5rem 0rem 0.5rem 4rem', fontSize: '0.875rem' }}>
                                                {ut.deadline ? new Date(ut.deadline).toLocaleString('uk-UA') : '—'}
                                            </td>
                                            <td style={{
                                                ...statusStyles[ut.status],
                                                display: 'inline-block',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                marginLeft: 30,
                                            }}>
                                                {ut.status}
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
