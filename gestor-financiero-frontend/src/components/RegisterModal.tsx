import React, { useState } from 'react';
import Modal from './Modal';

export interface RegisterModalProps {
  onClose: () => void;
}

export default function RegisterModal({ onClose }: RegisterModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    // Demo: aquí conectarías con tu API real
    alert('Registrando usuario (demo)');
    onClose();
  };

  return (
    <Modal title="Registrarse" onClose={onClose}>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            required
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Contraseña</label>
          <input
            type="password"
            required
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Confirmar contraseña</label>
          <input
            type="password"
            required
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center justify-between gap-3">
          <button type="submit" className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-medium">Crear cuenta</button>
          <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg border">Cancelar</button>
        </div>
      </form>
    </Modal>
  );
}


