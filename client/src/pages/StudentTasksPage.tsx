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
}

export function StudentTasksPage({ token, onBack }: { token: string, onBack: () => void, }) {
    const { courseId, studentId } = useParams<{ courseId: string; studentId: string }>();
    const [tasks, setTasks] = useState<UserTask[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        console.log(courseId)
        console.log(studentId)
        if (!courseId || !studentId) return;

        fetch(`http://localhost:3000/course/${courseId}/user-task/student/${studentId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Помилка ${res.status}`);
                return res.json();
            })
            .then((data: UserTask[]) => {
                setTasks(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [courseId, studentId, token]);

    if (loading) return <div style={{ padding: '1rem', textAlign: 'center' }}>Завантаження…</div>;
    if (error) return <div style={{ padding: '1rem', color: '#dc2626' }}>Помилка: {error}</div>;
    if (tasks.length === 0) return <div style={{ padding: '1rem' }}>Завдання відсутні</div>;

    const student = tasks[0]?.student;

    return (
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                Завдання студента: {student?.lastName} {student?.firstName}
            </h1>

            <div style={{
                overflow: 'hidden',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={thStyle}>Назва завдання</th>
                            <th style={thStyle}>Статус</th>
                            <th style={thStyle}>Оцінка</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((ut) => (
                            <tr
                                key={ut.id}
                                onClick={() => navigate(`/user-task/${ut.id}`)}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                            >
                                <td style={tdStyle}>{ut.task.name}</td>
                                <td style={tdStyle}>
                                    <span
                                        style={{
                                            ...statusStyles[ut.status],
                                            display: 'inline-block',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {ut.status}
                                    </span>
                                </td>
                                <td style={tdStyle}>{ut.grade !== null ? ut.grade : '–'}</td>
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
