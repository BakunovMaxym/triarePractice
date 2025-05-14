import React, { useState } from 'react';
import { createTask, CreatedTask } from '../api';

export function CreateTaskForm({
  token,
  courseId,
  onCreated,
}: {
  token: string;
  courseId: string;
  onCreated: (task: CreatedTask) => void;
}) {
  const [form, setForm] = useState({ name: '', textContent: '' });
  const [time, setTime] = useState({ hours: '', minutes: '', seconds: '' });
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime({ ...time, [e.target.name]: e.target.value });
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

      const h = parseInt(time.hours) || 0;
      const m = parseInt(time.minutes) || 0;
      const s = parseInt(time.seconds) || 0;
      const totalSeconds = h * 3600 + m * 60 + s;
      if (totalSeconds > 0) {
        formData.append('timeToComplete', totalSeconds.toString());
      }

      if (files) {
        Array.from(files).forEach(file => {
          formData.append('file', file);
        });
      }

      const createdTask = await createTask(token, courseId, formData);

      setForm({ name: '', textContent: '' });
      setTime({ hours: '', minutes: '', seconds: '' });
      setFiles(null);

      onCreated(createdTask);
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
      <div style={{ marginBottom: 8 }}>
        <label>
          Time to complete:
          <input
            name="hours"
            type="number"
            min="0"
            step="1"
            placeholder="hh"
            value={time.hours}
            onChange={handleTimeChange}
            style={{ width: 50, marginLeft: 8 }}
          /> h
          <input
            name="minutes"
            type="number"
            min="0"
            max="59"
            step="1"
            placeholder="mm"
            value={time.minutes}
            onChange={handleTimeChange}
            style={{ width: 50, marginLeft: 8 }}
          /> m
          <input
            name="seconds"
            type="number"
            min="0"
            max="59"
            step="1"
            placeholder="ss"
            value={time.seconds}
            onChange={handleTimeChange}
            style={{ width: 50, marginLeft: 8 }}
          /> s
        </label>
      </div>
      <input type="file" multiple onChange={handleFileChange} />
      <button type="submit" disabled={loading}>Create Task</button>
    </form>
  );
}
