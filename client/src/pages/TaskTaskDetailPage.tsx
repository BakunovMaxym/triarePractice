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

type Task = {
    id: string;
    name: string;
    owner: { firstName: string; lastName: string };
    course: { id: string; name: string };
    timeToComplete: number;
    textContent: string;
    fileContent: FileContent[];
    comments: Comment[];
};

export function TaskDetailPage({ token, isTeacher, onBack }: { token: string, isTeacher: boolean, onBack: () => void, }) {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTask() {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/tasks/${taskId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Server returned ${res.status}`);
                const data: Task = await res.json();
                setTask(data);
                console.log(data.comments);
            } catch (err: any) {
                setError(err.message || 'Failed to load task');
            } finally {
                setLoading(false);
            }
        }
        if (taskId) fetchTask();
    }, [taskId, token]);

    const handleCommentSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setPostError(null);
        setPosting(true);
        try {
            const res = await fetch(
                `http://localhost:3000/comments/comment/${taskId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ content: newComment }),
                }
            );
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const created: Comment = await res.json();
            setTask((t) =>
                t ? { ...t, comments: [...t.comments, created] } : t
            );
            setNewComment('');
        } catch (err: any) {
            setPostError(err.message || 'Failed to post comment');
        } finally {
            setPosting(false);
        }
    };

    if (loading) return <div>Loading task…</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!task) return null;

    return (
        <div style={{ maxWidth: 800, margin: 'auto', padding: 24 }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
                ← Back
            </button>

            <h2>{task.name}</h2>
            <p>
                <strong>Автор:</strong> {task.owner.firstName}{' '}
                {task.owner.lastName}
            </p>
            <p>
                <strong>Курс:</strong>{' '}
                <Link to={`/courses/${task.course.id}`}>{task.course.name}</Link>
            </p>
            <p>
                <strong>Час на виконання:</strong>{' '}
                {formatTime(task.timeToComplete)}
            </p>
            <p>{task.textContent}</p>

            {task.fileContent.map((f) => (
                <div
                    key={f.fileId}
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: 15,
                    }}
                >
                    <iframe
                        src={f.fileUrl.replace("/view", "/preview")}
                        title={f.fileName}
                        style={{
                            width: "100%",
                            height: "400px",
                            border: 0,
                        }}
                    />
                    <div style={{ padding: 8 }}>
                        <a href={f.fileUrl} target="_blank" rel="noopener noreferrer">
                            Відкрити "{f.fileName}" в Google Drive
                        </a>
                    </div>
                </div>
            ))}


            <button
                onClick={() => navigate(`/user-tasks/task/${task.id}`, { state: { taskName: task.name } })}
                style={{
                    margin: '24px 0',
                    padding: '8px 16px',
                    background: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                }}
            >
                Огляд призначених завдань
            </button>

            <section style={{ marginTop: 32 }}>
                <h3>Коментарі</h3>
                {task.comments.length === 0
                    ? <p>Секція коментарів порожня.</p>
                    : <ul style={{ listStyle: 'none', padding: 0 }}>
                        {task.comments.map((c) => (
                            <li
                                key={c.id}
                                style={{
                                    borderBottom: '1px solid #eee',
                                    padding: '8px 0',
                                }}
                            >
                                <small>{c.owner.firstName} {c.owner.lastName}</small>
                                <p style={{ margin: 5 }}>{c.content}</p>
                                <small style={{ color: '#666' }}>
                                    {new Date(c.createdAt).toLocaleString()}
                                </small>
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
                        placeholder="Текст коментарю..."
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
        </div>
    );
}
