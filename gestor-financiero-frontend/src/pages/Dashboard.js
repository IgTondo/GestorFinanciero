// src/pages/Dashboard.js

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import GastoForm from '../components/GastoForm';
import GastoList from '../components/GastoList';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { logout } = useContext(AuthContext);
    const [gastos, setGastos] = useState([]);

    const fetchGastos = async () => {
        try {
            // El token de autenticación se enviará en el header para la petición
            const token = localStorage.getItem('userToken');
            const response = await axios.get('http://localhost:8000/api/gastos/', {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            setGastos(response.data);
        } catch (error) {
            console.error('Hubo un error al obtener los gastos:', error);
            // Si la petición falla, podría ser un token expirado o inválido
            logout();
        }
    };

    useEffect(() => {
        fetchGastos();
    }, []);

    const handleGastoAgregado = () => {
        fetchGastos();
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Tu Panel de Gastos</h1>
                <button onClick={logout} className="logout-button">Cerrar Sesión</button>
            </header>
            {/* <main className="dashboard-main">
                <GastoForm onGastoAgregado={handleGastoAgregado} />
                <GastoList gastos={gastos} />
            </main> */}
        </div>
    );
};

export default Dashboard;