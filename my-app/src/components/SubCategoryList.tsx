import React, { useEffect, useState } from 'react';
import { getSubCategories } from '../api';

export function SubCategoryList() {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSubCategories()
      .then(setSubCategories)
      .catch(() => setError('Failed to load sub-categories'));
  }, []);

  return (
    <div>
      <h2>SubCategories</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {subCategories.map((cat) => (
          <li key={cat.id || cat.name}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
}

export {}
