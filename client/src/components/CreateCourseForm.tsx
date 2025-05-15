import React, { useEffect, useState } from 'react';
import { createCourse, getCategories, getSubCategories } from '../api';

export function CreateCourseForm({ token, onCreated }: { token: string; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategory, setSubCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    getSubCategories().then(setSubCategories).catch(() => setSubCategories([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = {
        name,
        category: category === 'new' ? newCategory : category,
        subCategory: subCategory === 'new' ? newSubCategory : subCategory,
      };
      if (!data.name || !data.category || !data.subCategory) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
      await createCourse(token, data);
      setName('');
      setCategory('');
      setNewCategory('');
      setSubCategory('');
      setNewSubCategory('');
      onCreated();
    } catch (err: any) {
      setError(err?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h3>Create Course</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <label>
        Course Name:
        <input value={name} onChange={e => setName(e.target.value)} disabled={loading} required />
      </label>
      <label>
        Category:
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          disabled={loading}
          required
        >
          <option value="">Select category</option>
          {categories.map((cat: any) => (
            <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
          ))}
          <option value="new">Add new...</option>
        </select>
        {category === 'new' && (
          <input
            placeholder="New category name"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            disabled={loading}
            required
          />
        )}
      </label>
      <label>
        SubCategory:
        <select
          value={subCategory}
          onChange={e => setSubCategory(e.target.value)}
          disabled={loading}
          required
        >
          <option value="">Select subcategory</option>
          {subCategories.map((sub: any) => (
            <option key={sub.id || sub.name} value={sub.name}>{sub.name}</option>
          ))}
          <option value="new">Add new...</option>
        </select>
        {subCategory === 'new' && (
          <input
            placeholder="New subcategory name"
            value={newSubCategory}
            onChange={e => setNewSubCategory(e.target.value)}
            disabled={loading}
            required
          />
        )}
      </label>
      <button type="submit" disabled={loading}>Create Course</button>
    </form>
  );
}

export {}
