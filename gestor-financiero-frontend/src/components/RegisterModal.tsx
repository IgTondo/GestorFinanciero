import React, { useState } from 'react';
import Modal from './Modal';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export interface RegisterModalProps {
  onClose: () => void;
}

export default function RegisterModal({ onClose }: RegisterModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
     
      const response = await axios.post('http://localhost:8000/api/register/', {
        username: username,
        email: email,
        password: password,
        first_name: firstName, 
        last_name: lastName
      });

      if (response.data.token) {
        login(response.data.token);
        onClose();
      } else {
        setError('Error en el registro. Intenta de nuevo.');
      }

    } catch (err: any) {
      if (err.response?.data) {
        const backendErrors = Object.values(err.response.data).join(' ');
        setError(backendErrors || 'Error en el servidor.');
      } else {
        setError('Error de conexión. Por favor, intenta de nuevo.');
      }
      console.error('Error de registro:', err.response?.data || err.message);
    }
  };

  return (
    <Modal title="Registrarse" onClose={onClose}>
      <form onSubmit={handleRegister} className="space-y-4">
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Nombre</label>
            <input
              type="text"
              required
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-600">Apellido</label>
            <input
              type="text"
              required
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Nombre de Usuario</label>
          <input
            type="text"
            required
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

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