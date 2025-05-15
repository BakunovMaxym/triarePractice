import React from 'react';
import { Login } from '../components/Login';

export function LoginPage({ onLogin }: { onLogin: (token: string, userId: string, role: string) => void }) {
  return <Login onLogin={onLogin} />;
}
