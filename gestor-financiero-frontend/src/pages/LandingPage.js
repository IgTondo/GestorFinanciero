// src/pages/LandingPage.js

import React, { useState } from 'react';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import './LandingPage.css';

const LandingPage = () => {
    // Estados para controlar la visibilidad de los modales
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    // Función para cerrar cualquier modal
    const handleCloseModal = () => {
        setShowLogin(false);
        setShowRegister(false);
    };

    return (
        <div className="landing-container">
            <header className="landing-header">
                <nav className="header-nav">
                    <button className="nav-button" onClick={() => setShowRegister(true)}>
                        Registrarse
                    </button>
                    <button className="nav-button" onClick={() => setShowLogin(true)}>
                        Ingresar
                    </button>
                </nav>
            </header>
            <main className="landing-main">
                <div className="main-content">
                    <h1>Gestiona tus finanzas, un gasto a la vez.</h1>
                    <p>
                        Nuestro gestor de gastos te ayuda a registrar tus ingresos y egresos
                        diarios de manera simple e intuitiva. Toma el control total de tu dinero
                        y alcanza tus metas financieras.
                    </p>
                    <div className="info-section">
                        <h2>Características clave</h2>
                        <ul>
                            <li>Registro rápido de gastos.</li>
                            <li>Visualización de tu historial financiero.</li>
                            <li>Organización por categorías.</li>
                        </ul>
                    </div>
                </div>
            </main>

            {/* Renderizado condicional de los modales */}
            {showLogin && <LoginModal onClose={handleCloseModal} />}
            {showRegister && <RegisterModal onClose={handleCloseModal} />}
        </div>
    );
};

export default LandingPage;