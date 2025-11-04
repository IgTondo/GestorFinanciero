import React, { createContext, useState, type ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Definimos el tipo para el contexto
interface AuthContextType {
    isAuthenticated: boolean;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

// Valor inicial vacío (lo completamos en el provider)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

// Props del provider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): React.ReactElement => {
  
    //Verifica si el usuario ya esta logeado
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('accessToken'));
  
  
    const navigate = useNavigate();
    //Acepta el usuario y le envia al dashboard
    const login = (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken',refreshToken);
        setIsAuthenticated(true);
        navigate('/accounts');
    };

    //le quita el token al usuario y envia a la landing page
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken')
        setIsAuthenticated(false);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
};
