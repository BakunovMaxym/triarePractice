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
  const res = await fetch(`${API_URL}/course?nocache=${Date.now()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch courses');
  const data = await res.json();
  // Expect flat structure: { ownerCourses, teacherCourses, studentCourses }
  if (!data) {
    return { ownerCourses: [], teacherCourses: [], studentCourses: [] };
  }
  return data;
}

export async function getCourse(token: string, id: string) {
  const res = await fetch(`${API_URL}/course/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch course');
  return res.json();
}

export async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    if (!data) return [];
    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
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

  console.log(res.json)
  return res.json();
}

export async function createTask(token: string, courseId: string, data: FormData) {
  const res = await fetch(`${API_URL}/courses/${courseId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  if (!res.ok) {
    let errorMsg = 'Failed to create task';
    try {
      const err = await res.json();
      if (err?.message) errorMsg += `: ${JSON.stringify(err.message)}`;
    } catch { }
    throw new Error(errorMsg);
  }

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

export async function getFolders(token: string) {
  const res = await fetch(`${API_URL}/folder`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch folders');
  // Просто повертаємо всі папки, які приходять з бекенду
  return await res.json();
}

export async function createFolder(token: string, name: string, ownerId: string, /*parentFolderId?: string,*/ courseIds?: string[]) {
  // Ensure all required fields are present and types are correct
  const body: any = { name, ownerId, courseIds };

  console.log('Request Body:', body);

  // if (parentFolderId) body.parentFolderId = parentFolderId;
  if (courseIds) body.courseIds = courseIds;
  const res = await fetch(`${API_URL}/folder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  console.log(res)
  if (!res.ok) {
    // Try to extract error details for debugging
    let errorMsg = 'Failed to create folder';
    try {
      const err = await res.json();
      if (err && err.message) errorMsg += `: ${JSON.stringify(err.message)}`;
    } catch { }
    throw new Error(errorMsg);
  }

  console.log(res)
  return res.json();
}

export async function moveCourseToFolder(token: string, folderId: string, courseId: string) {
  const res = await fetch(`${API_URL}/folder/${folderId}/add-child`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ childCourseId: courseId }),
  });
  if (!res.ok) throw new Error('Failed to move course to folder');
  return res.json();
}

export async function getUser(token: string, id: string) {
  if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid UUID format');
  }

  const res = await fetch(`${API_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch user');
  }

  return res.json();
}

export { }
