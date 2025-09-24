// src/RegisterModal.js

import React, { use, useState } from 'react';
import './Modal.css';
import axios from 'axios';

const RegisterModal = ({ onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:8000/api/register/', { username, password, email });
            console.log('Registro exitoso:', response.data);
            // Aquí puedes redirigir al usuario o mostrar un mensaje de éxito
            onClose(); // Cierra el modal
        } catch (err) {
            setError('Error en el registro. El email puede ya estar en uso.');
            console.error('Error de registro:', err.response.data);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>
                    &times;
                </button>
                <h2>Registrarse</h2>
                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        Crear Cuenta
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;