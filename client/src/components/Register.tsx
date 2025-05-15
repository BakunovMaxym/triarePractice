import React, { useState } from 'react';
import { register } from '../api';

export function Register({ onRegister }: { onRegister: () => void }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      onRegister();
    } catch (err) {
      setError('Не вдалося зареєструватися');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Реєстрація</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <input name="firstName" placeholder="Ім'я" value={form.firstName} onChange={handleChange} required />
      </div>
      <div>
        <input name="lastName" placeholder="Прізвище" value={form.lastName} onChange={handleChange} required />
      </div>
      <div>
        <input name="email" type="email" placeholder="Електронна пошта" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} required />
      </div>
      <div>
        <select name="role" value={form.role} onChange={handleChange} required>
          <option value="STUDENT">Студент</option>
          <option value="TEACHER">Викладач</option>
        </select>
      </div>
      <button type="submit" onClick={handleSubmit}>Зареєструватися</button>
    </form>
  );
}

export {}
