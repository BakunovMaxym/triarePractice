import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react';
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
    owner: { id: string; firstName: string; lastName: string };
    course: { id: string; name: string };
    timeToComplete: number;
    textContent: string;
    fileContent: FileContent[] | string[];
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
    fileContent: FileContent[];
};

export function UserTaskDetailPage({
    token,
    isTeacher,
}: {
    token: string;
    isTeacher: boolean;
}) {
    const { taskId, userId, userTaskId } = useParams<{ taskId?: string, userId?: string, userTaskId?: string }>();

    const nav = useNavigate();

    const [detail, setDetail] = useState<UserTaskDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // студентські стани
    const [accepted, setAccepted] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newFiles, setNewFiles] = useState<FileList | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // викладацькі стани
    const [gradeValue, setGradeValue] = useState<number | ''>('');
    const [grading, setGrading] = useState(false);
    const [gradeError, setGradeError] = useState<string | null>(null);
    const [rejecting, setRejecting] = useState(false);
    const [rejectError, setRejectError] = useState<string | null>(null);

    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        console.log(detail?.task.comments);
    }, [detail])

    useEffect(() => {
        async function fetchDetail() {
            setLoading(true);
            let url = "";
            if (userTaskId) {
                url = `http://localhost:3000/user-task/${userTaskId}`
            } else if (taskId && userId) {
                url = `http://localhost:3000/user-task/${taskId}/${userId}`;
            } else {
                setError('Хибний маршрут');
                setLoading(false);
                return;
            }
            console.log("bdfbdfbdfbdb");
            try {
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Сервер відповів ${res.status}`);
                const data: UserTaskDetail = await res.json();
                setDetail(data);

                setAccepted(data.status !== "Призначено");
                // setNeedsToUpload(data.status === "Прийнято" || data.status === "Протерміновано")
                setCompleted(data.status !== "Прийнято" && data.status !== "Протерміновано")
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        if (taskId && userId || userTaskId) fetchDetail();
    }, [taskId, userId, userTaskId, token]);

    // студент: прийняти завдання
    const handleAccept = async () => {
        if (!detail) return;
        try {
            const res = await fetch(`http://localhost:3000/user-task/${detail.id}/accept`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Помилка ${res.status}`);
            const updated: UserTaskDetail = await res.json();
            setDetail(updated);
            // setNeedsToUpload(true)
            setAccepted(true);
            setCompleted(false)
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleReaccept = async () => {
        if (!detail) return;
        console.log(detail.task.id);
        console.log(detail.id);
        try {
            const res = await fetch(`http://localhost:3000/task/${detail.task.id}/user-tasks`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Помилка при спробі прийняти завдання повторно ${res.status}`);
            const { id } = await res.json();
            console.log(id);
            navigate(`/user-task/${id}`)
        } catch (e: any) {
            setError(e.message);
        }
    };

    // студент: виконати завдання
    const handleNewFiles = (e: ChangeEvent<HTMLInputElement>) => setNewFiles(e.target.files);
    const handleComplete = async (e: FormEvent) => {
        e.preventDefault();
        if (!detail) return;
        setUploading(true);
        setUploadError(null);
        try {
            const fd = new FormData();
            if (newFiles) Array.from(newFiles).forEach(f => fd.append('file', f));
            const res = await fetch(
                `http://localhost:3000/user-task/${detail.id}/complete`,
                { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: fd }
            );
            if (!res.ok) throw new Error(`Помилка ${res.status}`);
            const upd: UserTaskDetail = await res.json();
            setDetail(upd);
            setCompleted(true)
        } catch (e: any) {
            setUploadError(e.message);
        } finally {
            setUploading(false);
        }
    };

    // викладач: оцінити
    const handleGrade = async () => {
        if (!detail) return;
        setGradeError(null);
        setGrading(true);
        try {
            const res = await fetch(
                `http://localhost:3000/user-task/${detail.id}/grade`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ grade: gradeValue }),
                }
            );
            if (!res.ok) throw new Error(`Сервер ${res.status}`);
            const upd = await res.json();
            setDetail(d => d ? { ...d, grade: upd.grade, status: upd.status } : d);
        } catch (e: any) {
            setGradeError(e.message);
        } finally {
            setGrading(false);
        }
    };
    // викладач: відхилити
    const handleReject = async () => {
        if (!detail) return;
        setRejectError(null);
        setRejecting(true);
        try {
            const res = await fetch(
                `http://localhost:3000/user-task/${detail.id}/reject`,
                { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error(`Сервер ${res.status}`);
            const upd = await res.json();
            setDetail(d => d ? { ...d, status: upd.status } : d);
        } catch (e: any) {
            setRejectError(e.message);
        } finally {
            setRejecting(false);
        }
    };

    if (loading) return <div>Завантаження…</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!detail) return null;

    const handleCommentSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setPostError(null);
        setPosting(true);
        try {
            const res = await fetch(
                `http://localhost:3000/comments/comment/${detail.task.id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ content: newComment }),
                }
            );
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const created: Comment = await res.json();
            setDetail((t) =>
                t
                    ? {
                        ...t,
                        task: {
                            ...t.task,
                            comments: [...t.task.comments, created],
                        },
                    }
                    : t
            );
            setNewComment('');
        } catch (err: any) {
            setPostError(err.message || 'Failed to post comment');
        } finally {
            setPosting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm('Впевнені, що хочете видалити цей коментар?')) return;

        try {
            const res = await fetch(
                `http://localhost:3000/comments/${commentId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            if (!res.ok) throw new Error(`Server returned ${res.status}`);

            setDetail((t) => {
                if (!t) return t;
                return {
                    ...t,
                    task: {
                        ...t.task,
                        comments: t.task.comments.filter((comment) => comment.id !== commentId),
                    },
                };
            });

        } catch (err: any) {
            alert(err.message || 'Failed to delete comment');
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: 'auto' }}>
            <button onClick={() => navigate(-1)}>← Назад</button>
            <h2>{detail.task.name}</h2>
            <p><strong>Курс:</strong> <Link to={`/courses/${detail.task.course.id}`}>{detail.task.course.name}</Link></p>
            <p><strong>Студент:</strong> {detail.student.firstName} {detail.student.lastName}</p>
            <p><strong>Статус:</strong> {detail.status}</p>
            <p><strong>Час на виконання:</strong> {formatTime(detail.task.timeToComplete)}</p>
            <p><strong>Дедлайн:</strong> {detail.deadline ? new Date(detail.deadline).toLocaleString() : '—'}</p>
            <p><strong>Виконано о:</strong> {detail.completeTimestamp ? new Date(detail.completeTimestamp).toLocaleString() : '—'}</p>
            <p><strong>Оцінка:</strong> {detail.grade !== null ? detail.grade : '—'}</p>
            <p><strong>Опис завдання: </strong>{detail.task.textContent}</p>

            <h3>Файли завдання</h3>
            {detail.task.fileContent.length !== 0
                ? (
                    <section style={{ marginTop: 24 }}>
                        {detail.task.fileContent.map((f, index) => typeof f === 'object'
                            ? (
                                <div key={f.fileId} style={{ marginBottom: 16, border: '1px solid #ccc', borderRadius: 4 }}>
                                    <iframe src={f.fileUrl.replace('/view', '/preview')} title={f.fileName} style={{ width: '100%', height: 300, border: 0 }} />
                                    <div style={{ padding: 8 }}><a href={f.fileUrl} target="_blank" rel="noopener noreferrer">{f.fileName}</a></div>
                                </div>
                            )
                            : <div key={index} style={{ marginBottom: 16, border: '1px solid #ccc', borderRadius: 4 }}>
                                <div style={{ padding: 8 }}>{f}</div>
                            </div>)}
                    </section>


                )
                : <p>Не прикріплено  жодного файлу</p>}

            <section style={{ marginTop: 24 }}>
                <h3>Файли студента</h3>
                {detail.fileContent.length ? detail.fileContent.map(f => (
                    <div key={f.fileId} style={{ marginBottom: 16, border: '1px solid #ccc', borderRadius: 4 }}>
                        <iframe src={f.fileUrl.replace('/view', '/preview')} title={f.fileName} style={{ width: '100%', height: 300, border: 0 }} />
                        <div style={{ padding: 8 }}><a href={f.fileUrl} target="_blank" rel="noopener noreferrer">{f.fileName}</a></div>
                    </div>
                )) : <p>Студент не прикріпив файлів.</p>}
            </section>

            {
                isTeacher ? (
                    /* ==== Інтерфейс викладача ==== */
                    <section style={{ marginTop: 24 }}>
                        <h3>Оцінювання</h3>
                        <input
                            type="number"
                            min={0} max={100}
                            value={gradeValue}
                            onChange={e => setGradeValue(e.target.value === '' ? '' : +e.target.value)}
                        />
                        <button onClick={handleGrade} disabled={grading}>
                            {grading ? 'Збереження…' : 'Зберегти оцінку'}
                        </button>
                        {gradeError && <div style={{ color: 'red' }}>{gradeError}</div>}

                        <h3>Дії</h3>
                        <button onClick={handleReject} disabled={rejecting}>
                            {rejecting ? '…' : 'Відхилити'}
                        </button>
                        {rejectError && <div style={{ color: 'red' }}>{rejectError}</div>}
                    </section>
                ) : (
                    /* ==== Інтерфейс студента ==== */
                    <section style={{ marginTop: 24 }}>
                        {!accepted
                            ? <button onClick={handleAccept}>Прийняти завдання</button>
                            : (completed ?
                                (
                                    <button onClick={handleReaccept}>Прийняти завдання повторно</button>
                                )
                                : (
                                    <form onSubmit={handleComplete}>
                                        <h3>Завантажити виконані файли</h3>
                                        <input type="file" multiple onChange={handleNewFiles} />
                                        <button type="submit" disabled={uploading}>
                                            {uploading ? 'Завантаження…' : 'Відправити виконання'}
                                        </button>
                                        {uploadError && <div style={{ color: 'red' }}>{uploadError}</div>}
                                    </form>
                                )
                            )}
                    </section>

                )
            }
            <section style={{ marginTop: 32 }}>
                <h3>Коментарі</h3>
                {detail.task.comments.length === 0
                    ? <p>Секція коментарів порожня.</p>
                    : <ul style={{ listStyle: 'none', padding: 0 }}>
                        {detail.task.comments.map((c) => (
                            <li
                                key={c.id}
                                style={{
                                    borderBottom: '1px solid #eee',
                                    padding: '8px 8px',
                                    position: 'relative',
                                }}
                            >
                                <strong>{c.owner?.firstName} {c.owner?.lastName}</strong>
                                <p style={{ margin: 5 }}>{c.content}</p>
                                <small style={{ color: '#666' }}>
                                    {new Date(c.createdAt).toLocaleString()}
                                </small>
                                {c.owner?.id === userId && (
                                    <button
                                        onClick={() => handleDeleteComment(c.id)}
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: 8,
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'red',
                                            cursor: 'pointer',
                                        }}
                                        title="Видалити коментар"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                }
                <form onSubmit={handleCommentSubmit} style={{ marginTop: 16 }}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        style={{ width: '100%', padding: 8, borderRadius: 4 }}
                        placeholder="Текст коментаря..."
                        required
                    />
                    {postError && (
                        <div style={{ color: 'red', marginTop: 4 }}>{postError}</div>
                    )}
                    <button
                        type="submit"
                        disabled={posting}
                        style={{
                            marginTop: 8,
                            padding: '8px 16px',
                            background: '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                        }}
                    >
                        {posting ? 'Надсилання...' : 'Залишити коментар'}
                    </button>
                </form>
            </section>
        </div >
    );
}
