import React, { useState } from 'react';
import Modal from './Modal';
// import { useAuth } from '../context/AuthContext';

export interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // const { login } = useAuth();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    // try {
    //         const response = await axios.post('http://localhost:8000/api/login/', { username, password });
    //         console.log('Login exitoso:', response.data);
    //         // Guarda el token y navega usando el contexto de autenticación
    //         login(response.data.token);
    //         onClose(); // Cierra el modal
    //     } catch (err) {
    //         setError('Credenciales incorrectas. Por favor, intenta de nuevo.');
    //         console.error('Error de login:', err?.response?.data || err?.message);
    //     }
    alert('Iniciando sesión (demo)');
    onClose();
  };

  return (
    <Modal title="Iniciar sesión" onClose={onClose}>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="text"
            required
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          <button type="submit" className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-medium">Entrar</button>
          <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg border">Cancelar</button>
        </div>
      </form>
    </Modal>
  );
}