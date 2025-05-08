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

export async function register(data: { firstName: string; lastName: string; email: string; password: string; role: string }) {
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

export async function getTasks(token: string, courseId: string) {
  const res = await fetch(`${API_URL}/course/${courseId}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createCourse(token: string, data: { name: string; category: string; subCategory: string }) {
  const res = await fetch(`${API_URL}/course`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create course');
  return res.json();
}

export async function createTask(token: string, courseId: string, data: { name: string; textContent: string }) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('textContent', data.textContent);
  // Add file upload support if needed

  const res = await fetch(`${API_URL}/course/${courseId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function getTask(token: string, taskId: string) {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch task');
  return res.json();
}

export async function getUserTasks(token: string) {
  const res = await fetch(`${API_URL}/user-tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch user tasks');
  return res.json();
}

export async function createUserTask(token: string, data: { userId: string; taskId: string; status?: string; deadline?: string }) {
  const res = await fetch(`${API_URL}/user-tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create user task');
  return res.json();
}

export {}
