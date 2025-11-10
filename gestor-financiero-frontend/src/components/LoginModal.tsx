import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        email: email,
        password: password,
      });

      // El backend devuelve { access, refresh }
      const {access, refresh, role} = response.data;

      if (access && refresh) {
        // 👇 NUEVO: guardamos el email del usuario logueado
        localStorage.setItem('userEmail', email);

        // esto sigue igual
        login(access, refresh, role);
        onClose();
      } else {
        setError('No se recibió un token. Intenta de nuevo.');
      }
    } catch (err: any) {
      setError('Credenciales incorrectas. Por favor, intenta de nuevo.');
      console.error('Error de login:', err.response?.data || err.message);
    }
  };

  return (
    <Modal title="Iniciar sesión" onClose={onClose}>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Usuario</label>
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-medium"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-lg border"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
