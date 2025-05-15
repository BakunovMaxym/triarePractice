import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function NavBar({
  token,
  onLogout,
}: {
  token: string | null;
  onLogout: () => void;
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav style={{ marginBottom: 24 }}>
      {token ? (
        <>
          <Link to="/courses">
            <button>Courses</button>
          </Link>
          <Link to="/userTasks">
            <button>My Tasks</button>
          </Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </>
      )}
    </nav>
  );
}
