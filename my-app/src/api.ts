const API_URL = 'http://localhost:3000';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function register(data: { firstName: string; lastName: string; email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Register failed');
  return res.json();
}

export async function getCourses(token: string) {
  const res = await fetch(`${API_URL}/course`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
}

export async function getCourse(token: string, id: string) {
  const res = await fetch(`${API_URL}/course/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch course');
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function getSubCategories() {
  const res = await fetch(`${API_URL}/sub-categories`);
  if (!res.ok) throw new Error('Failed to fetch sub-categories');
  return res.json();
}

export {}
