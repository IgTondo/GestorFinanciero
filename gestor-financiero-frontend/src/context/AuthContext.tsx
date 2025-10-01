// import React, { createContext, useState, ReactNode } from 'react';
// import { useNavigate } from 'react-router-dom';

// // Definimos el tipo para el contexto
// interface AuthContextType {
//   isAuthenticated: boolean;
//   login: (token: string) => void;
//   logout: () => void;
// }

// // Valor inicial vacío (lo completamos en el provider)
// export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Props del provider
// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider = ({ children }: AuthProviderProps): React.ReactElement => {
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('userToken'));
//   const navigate = useNavigate();

//   const login = (token: string) => {
//     localStorage.setItem('userToken', token);
//     setIsAuthenticated(true);
//     navigate('/dashboard');
//   };

//   const logout = () => {
//     localStorage.removeItem('userToken');
//     setIsAuthenticated(false);
//     navigate('/');
//   };

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
