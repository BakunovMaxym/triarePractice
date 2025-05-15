import React from 'react';
import { Register } from '../components/Register';

export function RegisterPage({ onRegister }: { onRegister: () => void }) {
  return <Register onRegister={onRegister} />;
}
