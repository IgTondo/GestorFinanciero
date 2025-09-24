// src/LoginModal.js

import React, { useState, useContext } from 'react';
import './Modal.css'; // Usaremos un solo archivo CSS para todos los modales
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const LoginModal = ({ onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:8000/api/login/', { username, password });
            console.log('Login exitoso:', response.data);
            // Guarda el token y navega usando el contexto de autenticación
            login(response.data.token);
            onClose(); // Cierra el modal
        } catch (err) {
            setError('Credenciales incorrectas. Por favor, intenta de nuevo.');
            console.error('Error de login:', err?.response?.data || err?.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>
                    &times;
                </button>
                <h2>Ingresar</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="submit-button">
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;