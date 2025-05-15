import React, { useEffect, useState } from 'react';
import { getCategories } from '../api';

export function CategoryList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load categories';
        setError(message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div style={{ color: 'red', padding: '10px' }}>{error}</div>;
  if (categories.length === 0) return <div>No categories found.</div>;

  return (
    <div>
      <h2>Categories</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {categories.map((cat) => (
          <li key={cat.id || cat.name} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ddd' }}>
            <strong>{cat.name}</strong>
            {cat.courses && (
              <div style={{ fontSize: '0.9em', marginTop: '4px', color: '#666' }}>
                Courses: {cat.courses.length}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export {}
