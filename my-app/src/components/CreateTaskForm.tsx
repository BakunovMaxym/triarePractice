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
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('textContent', form.textContent);
      if (files) {
        Array.from(files).forEach(file => {
          formData.append('file', file);
        });
      }
      await createTask(token, courseId, formData);
      setForm({ name: '', textContent: '' });
      setFiles(null);
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
      <input type="file" multiple onChange={handleFileChange} />
      <button type="submit" disabled={loading}>Create Task</button>
    </form>
  );
}

export {}
