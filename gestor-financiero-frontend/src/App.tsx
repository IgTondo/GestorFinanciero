import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./views/landing_page_fin_gestor";
import Dashboard from "./views/Dashboard";
import { useAuth } from "./context/AuthContext";

// Un componente simple para rutas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          // Si ya está autenticado, ir directo al dashboard
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
        }
      />

      {/* Si no esta logeado hace que pase pro la ruta protegida para asegurarse que tiene usuario */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Puedes agregar una ruta 404 aquí si quieres */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}