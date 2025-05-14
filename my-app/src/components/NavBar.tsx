import React from 'react';

export function NavBar({
  token,
  onNavigate,
  onLogout,
}: {
  token: string | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}) {
  return (
    <nav style={{ marginBottom: 24 }}>
      {token ? (
        <>
          <button onClick={() => onNavigate('courses')}>Courses</button>
          <button onClick={() => onNavigate('userTasks')}>My Tasks</button>
          <button onClick={onLogout}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={() => onNavigate('login')}>Login</button>
          <button onClick={() => onNavigate('register')}>Register</button>
        </>
      )}
    </nav>
  );
}
