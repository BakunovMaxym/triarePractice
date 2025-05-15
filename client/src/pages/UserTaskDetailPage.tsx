import React, { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatTime } from '../utils/formatTime';

type FileContent = {
    fileId: string;
    fileName: string;
    fileUrl: string;
};

type Comment = {
    id: string;
    createdAt: string;
    content: string;
    owner: {
        id: string;
        firstName: string;
        lastName: string;
    };
};

type TaskInfo = {
    id: string;
    name: string;
    owner: { firstName: string; lastName: string };
    course: { id: string; name: string };
    timeToComplete: number;
    textContent: string;
    fileContent: FileContent[];
    comments: Comment[];
};

type UserTaskDetail = {
    id: string;
    status: string;
    deadline: string | null;
    completeTimestamp: string | null;
    student: { id: string; firstName: string; lastName: string };
    task: TaskInfo;
    grade: number | null;
    fileContent: FileContent[]; // student attachments
};

export function UserTaskDetailPage({ token, isTeacher, onBack }: { token: string; isTeacher: boolean; onBack: () => void; }) {
    const { userTaskId } = useParams<{ userTaskId: string }>();
    const navigate = useNavigate();
    const [detail, setDetail] = useState<UserTaskDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [gradeValue, setGradeValue] = useState<number | undefined>(undefined);
    const [grading, setGrading] = useState(false);
    const [gradeError, setGradeError] = useState<string | null>(null);

    const [rejecting, setRejecting] = useState(false);
    const [rejectError, setRejectError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDetail() {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/user-task/${userTaskId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Server returned ${res.status}`);
                const data: UserTaskDetail = await res.json();
                setDetail(data);
                // init gradeValue
                if (data.grade !== null) setGradeValue(data.grade);
            } catch (err: any) {
                setError(err.message || 'Failed to load task detail');
            } finally {
                setLoading(false);
            }
        }
        if (userTaskId) fetchDetail();
    }, [userTaskId, token]);

    const handleGrade = async () => {
        if (!detail) return;
        setGradeError(null);
        setGrading(true);
        try {
            console.log(detail.id)
            const res = await fetch(`http://localhost:3000/user-task/${detail.id}/grade`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ grade: gradeValue }),
            });
            console.log(res)
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const updated = await res.json();
            setDetail(d => d ? { ...d, grade: updated.grade, status: updated.status ?? d.status } : d);
        } catch (err: any) {
            setGradeError(err.message || 'Failed to set grade');
        } finally {
            setGrading(false);
        }
    };

    const handleReject = async () => {
        if (!detail) return;
        setRejectError(null);
        setRejecting(true);
        try {
            const res = await fetch(`http://localhost:3000/user-task/${detail.id}/reject`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const updated = await res.json();
            setDetail(d => d ? { ...d, status: updated.status ?? 'Відхилено' } : d);
        } catch (err: any) {
            setRejectError(err.message || 'Failed to reject task');
        } finally {
            setRejecting(false);
            setGradeValue(undefined)
        }
    };

    if (loading) return <div>Loading…</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!detail) return null;

    return (
        <div style={{ maxWidth: 800, margin: 'auto', padding: 24 }}>
            <button onClick={onBack} style={{ marginBottom: 16 }}>← Back</button>

            <h2>{detail.task.name}</h2>
            <p><strong>Студент:</strong> {detail.student.firstName} {detail.student.lastName}</p>
            <p><strong>Курс:</strong> <Link to={`/courses/${detail.task.course.id}`}>{detail.task.course.name}</Link></p>
            <p><strong>Статус:</strong> {detail.status}</p>
            <p><strong>Дедлайн:</strong> {detail.deadline ? new Date(detail.deadline).toLocaleString() : '—'}</p>
            <p><strong>Час виконання:</strong> {detail.completeTimestamp ? new Date(detail.completeTimestamp).toLocaleString() : '—'}</p>
            <p><strong>Оцінка:</strong> {detail.grade !== null ? detail.grade : '—'}</p>

            <section style={{ marginTop: 24 }}>
                <h3>Опис завдання</h3>
                <p>{detail.task.textContent}</p>
            </section>

            <section style={{ marginTop: 24 }}>
                <h3>Файли завдання</h3>
                {detail.task.fileContent.map(f => (
                    <div key={f.fileId} style={{ marginBottom: 16, border: '1px solid #ccc', borderRadius: 4 }}>
                        <iframe src={f.fileUrl.replace('/view', '/preview')} title={f.fileName} style={{ width: '100%', height: 300, border: 0 }} />
                        <div style={{ padding: 8 }}><a href={f.fileUrl} target="_blank" rel="noopener noreferrer">{f.fileName}</a></div>
                    </div>
                ))}
            </section>

            <section style={{ marginTop: 24 }}>
                <h3>Файли студента</h3>
                {detail.fileContent.length ? detail.fileContent.map(f => (
                    <div key={f.fileId} style={{ marginBottom: 16, border: '1px solid #ccc', borderRadius: 4 }}>
                        <iframe src={f.fileUrl.replace('/view', '/preview')} title={f.fileName} style={{ width: '100%', height: 300, border: 0 }} />
                        <div style={{ padding: 8 }}><a href={f.fileUrl} target="_blank" rel="noopener noreferrer">{f.fileName}</a></div>
                    </div>
                )) : <p>Студент не прикріпив файлів.</p>}
            </section>

            {isTeacher && (
                <section style={{ marginTop: 24, padding: 16, border: '1px solid #ddd', borderRadius: 4 }}>
                    <h3>Оцінювання</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={gradeValue}
                            onChange={e => setGradeValue(Number(e.target.value))}
                            style={{ width: 80, padding: 4 }}
                        />
                        <button onClick={handleGrade} disabled={grading} style={{ padding: '8px 16px', cursor: 'pointer' }}>{grading ? 'Збереження...' : 'Зберегти оцінку'}</button>
                        {gradeError && <span style={{ color: 'red' }}>{gradeError}</span>}
                    </div>

                    <h3 style={{ marginTop: 16 }}>Дії</h3>
                    <button onClick={handleReject} disabled={rejecting} style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', cursor: 'pointer' }}>{rejecting ? 'Обробка...' : 'Відхилити завдання'}</button>
                    {rejectError && <div style={{ color: 'red', marginTop: 8 }}>{rejectError}</div>}
                </section>
            )}
        </div>
    );
}
