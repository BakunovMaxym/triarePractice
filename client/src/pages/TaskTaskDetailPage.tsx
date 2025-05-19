import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate, Link, data } from 'react-router-dom';
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
  owner: { id: string, firstName: string; lastName: string };
  course: { id: string; name: string };
  timeToComplete: number;
  textContent: string;
  fileContent: FileContent[];
  comments: Comment[];
};

export function TaskDetailPage({
  token,
  userId,
}: {
  token: string;
  userId: string,
}) {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [existingFiles, setExistingFiles] = useState<FileContent[]>([]);
  const [toRemove, setToRemove] = useState<Set<string>>(new Set());
  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  async function fetchTask() {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: Task = await res.json();
      console.log(data);
      setTask(data);
      // init edit fields
      setName(data.name);
      setTextContent(data.textContent);
      setExistingFiles(data.fileContent);
    } catch (err: any) {
      setError(err.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  }

  // Toggle remove existing file
  const toggleRemove = (fileId: string) => {
    setToRemove((prev) => {
      const nxt = new Set(prev);
      nxt.has(fileId) ? nxt.delete(fileId) : nxt.add(fileId);
      return nxt;
    });
  };

  // Handle file input
  const onNewFiles = (e: ChangeEvent<HTMLInputElement>) => {
    setNewFiles(e.target.files);
  };

  // Submit edits
  const submitEdit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    // build FormData
    const fd = new FormData();
    fd.append('name', name);
    fd.append('textContent', textContent);

    // remaining files:
    const remain = existingFiles.filter(f => !toRemove.has(f.fileId));
    fd.append('fileContents', JSON.stringify(remain));

    // new file uploads
    if (newFiles) {
      Array.from(newFiles).forEach(file => fd.append('file', file));
    }

    try {
      const res = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      await fetchTask();      // reload updated
      setEditing(false);
      setToRemove(new Set());
      setNewFiles(null);
      setExistingFiles((await res.json()).fileContent)
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save');
    } finally {
      setSaving(false);

    }
  };

  // Delete task
  const deleteTask = async () => {
    if (!window.confirm('Ви справді хочете видалити завдання?')) return;
    try {
      const res = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      navigate(`/courses/${task?.course.id}`); // back to list
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

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
            'Authorization': `Bearer ${token}`,
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

      setTask((t) => {
        if (!t) return t;
        return {
          ...t,
          comments: t.comments.filter((comment) => comment.id !== commentId),
        };
      });
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment');
    }
  };


  if (loading) return <div>Завантаження…</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!task) return null;

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 24 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Назад
      </button>

      {task.owner.id === userId && (
        <>
          <button
            onClick={() => setEditing(!editing)}
            style={{ marginLeft: 8, background: '#ffc107' }}
          >
            {editing ? 'Скасувати' : 'Редагувати'}
          </button>
          <button
            onClick={deleteTask}
            style={{ marginLeft: 8, background: '#dc3545', color: '#fff' }}
          >
            Видалити завдання
          </button>
        </>
      )}

      {editing ? (
        <form onSubmit={submitEdit} style={{ marginTop: 16 }}>
          <div>
            <label>Назва:</label><br />
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Опис:</label><br />
            <textarea
              value={textContent}
              onChange={e => setTextContent(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: 8 }}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <label>Існуючі файли:</label>
            <ul>
              {existingFiles.map(f => (
                <li key={f.fileId}>
                  <input
                    type="checkbox"
                    checked={toRemove.has(f.fileId)}
                    onChange={() => toggleRemove(f.fileId)}
                  /> Видалити
                  <a
                    href={f.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: 8 }}
                  >{f.fileName}</a>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 12 }}>
            <label>Додати файли:</label><br />
            <input type="file" multiple onChange={onNewFiles} />
          </div>

          {saveError && <div style={{ color: 'red', marginTop: 8 }}>{saveError}</div>}
          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              background: '#28a745',
              color: '#fff',
            }}
          >
            {saving ? 'Збереження…' : 'Зберегти зміни'}
          </button>
        </form>
      ) : (
        <>
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
          {task.fileContent.map(f => (
            <div key={f.fileId} style={{ margin: '16px 0' }}>
              <iframe
                src={f.fileUrl.replace('/view', '/preview')}
                style={{ width: '100%', height: 300 }}
                title={f.fileName}
              />
            </div>
          ))}
        </>
      )}

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
                  position: 'relative',
                }}
              >
                <small>{c.owner.firstName} {c.owner.lastName}</small>
                <p style={{ margin: 5 }}>{c.content}</p>
                <small style={{ color: '#666' }}>
                  {new Date(c.createdAt).toLocaleString()}
                </small>
                {c.owner.id === userId && (
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
    </div>
  );
}
