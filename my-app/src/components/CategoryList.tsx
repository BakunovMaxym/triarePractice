import React, { useEffect, useState } from 'react';
import { getCategories } from '../api';

export function CategoryList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('Failed to load categories'));
  }, []);

  return (
    <div>
      <h2>Categories</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {categories.map((cat) => (
          <li key={cat.name}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
}

export {}
