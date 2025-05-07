import React, { useState } from 'react';
import { register } from '../api';

export function Register({ onRegister }: { onRegister: () => void }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      onRegister();
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
      </div>
      <div>
        <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
      </div>
      <div>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      </div>
      <button type="submit">Register</button>
    </form>
  );
}

export {}
