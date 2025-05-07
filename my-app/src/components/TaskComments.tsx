import React, { useEffect, useState } from 'react';

type Comment = {
  id: string;
  content: string;
  ownerId: string;
};

export function TaskComments({
  taskId,
  userId,
}: {
  taskId: string;
  userId: string;
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
      const res = await fetch(`http://localhost:3000/comments/task/${taskId}`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      setComments(data);
    } catch (e) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newComment, ownerId: userId }),
        }
      );
      if (!res.ok) throw new Error('Failed to add comment');
      setNewComment('');
      await fetchComments();
    } catch (e) {
      setError('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="TaskComments">
      <h4>Comments</h4>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <ul>
          {comments.map((c) => (
            <li key={c.id}>
              <b>{c.ownerId.slice(0, 8)}:</b> {c.content}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleAddComment} style={{ marginTop: 8 }}>
        <input
          type="text"
          value={newComment}
          placeholder="Add a comment..."
          onChange={(e) => setNewComment(e.target.value)}
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !newComment.trim()}>
          Add
        </button>
      </form>
    </div>
  );
}

export {}
