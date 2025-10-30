import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';


export interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      // 4. Llamar a la API del backend
      const response = await axios.post('http://localhost:8000/api/login/', {
        username: username,
        password: password,
      });

      // 5. Si es exitoso, llamar a la función 'login' del contexto
      //    (Esta se encargará de guardar el token y redirigir)
      if (response.data.token) {
        login(response.data.token);
        onClose(); // Cierra el modal
      } else {
        setError('No se recibió un token. Intenta de nuevo.');
      }
    } catch (err:any) {
      // 6. Manejar errores
      setError('Credenciales incorrectas. Por favor, intenta de nuevo.');
      console.error('Error de login:', err.response?.data || err.message);
    }
  };
   

  return (
    <Modal title="Iniciar sesión" onClose={onClose}>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          {/* Cambiamos la etiqueta a 'Usuario' ya que el backend espera 'username' */}
          <label className="text-sm text-gray-600">Usuario</label>
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