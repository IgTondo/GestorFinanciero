// src/components/ProtectedRoute.js

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ component: Component }) => {
    const { isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        // Redirige al usuario a la página de inicio si no está autenticado
        return <Navigate to="/" />;
    }

    // Si está autenticado, renderiza el componente solicitado
    return <Component />;
};

export default ProtectedRoute;