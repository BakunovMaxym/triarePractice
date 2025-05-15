import React, { useEffect, useState } from 'react';

type Comment = {
  id: string;
  content: string;
  ownerId: string;
  owner?: { firstName?: string; lastName?: string; email?: string };
};

export function TaskComments({
  taskId,
  userId,
  token,
}: {
  taskId: string;
  userId: string;
  token: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function fetchComments() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/comments/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to fetch comments: ${res.status} ${errText}`);
      }
      const data = await res.json();
      setComments(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, token]);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:3000/comments/comment/${taskId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newComment, ownerId: userId }),
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to add comment: ${res.status} ${errText}`);
      }
      setNewComment('');
      await fetchComments();
    } catch (e: any) {
      setError(e?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  }

  function renderUser(comment: Comment) {
    if (comment.owner && (comment.owner.firstName || comment.owner.lastName)) {
      return (
        <b>
          {comment.owner.firstName || ''} {comment.owner.lastName || ''}
        </b>
      );
    }
    if (comment.owner && comment.owner.email) {
      return <b>{comment.owner.email}</b>;
    }
    if (comment.ownerId) {
      return <b>{comment.ownerId.slice(0, 8)}</b>;
    }
    return <b>Unknown</b>;
  }

  return (
    <div className="TaskComments">
      <h4>Коментарі</h4>
      {loading ? (
        <div>Завантаження...</div>
      ) : error ? (
        <div style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</div>
      ) : (
        <ul>
          {comments.map((c) => (
            <li key={c.id}>
              {renderUser(c)}: {c.content}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleAddComment} style={{ marginTop: 8 }}>
        <input
          type="text"
          value={newComment}
          placeholder="Додати коментар..."
          onChange={(e) => setNewComment(e.target.value)}
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !newComment.trim()}>
          Додати
        </button>
      </form>
    </div>
  );
}

export {}
