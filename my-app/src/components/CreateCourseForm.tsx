import React, { useState } from 'react';
import { createCourse } from '../api';

export function CreateCourseForm({ token, onCreated }: { token: string; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', category: '', subCategory: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createCourse(token, form);
      setForm({ name: '', category: '', subCategory: '' });
      await onCreated(); // Додаємо await для впевненості, що оновлення відбудеться після створення
    } catch (err) {
      setError('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h3>Create Course</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input name="name" placeholder="Course Name" value={form.name} onChange={handleChange} required />
      <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
      <input name="subCategory" placeholder="SubCategory" value={form.subCategory} onChange={handleChange} required />
      <button type="submit" disabled={loading}>Create</button>
    </form>
  );
}

export {}
