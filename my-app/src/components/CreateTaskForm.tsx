import React, { useState } from 'react';
import { createTask } from '../api';

export function CreateTaskForm({
  token,
  courseId,
  onCreated,
}: {
  token: string;
  courseId: string;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ name: '', textContent: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createTask(token, courseId, form);
      setForm({ name: '', textContent: '' });
      onCreated();
    } catch (err) {
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <h4>Create Task</h4>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input name="name" placeholder="Task Name" value={form.name} onChange={handleChange} required />
      <textarea name="textContent" placeholder="Task Description" value={form.textContent} onChange={handleChange} required />
      <button type="submit" disabled={loading}>Create Task</button>
    </form>
  );
}

export {}
