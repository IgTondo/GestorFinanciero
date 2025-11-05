// src/layouts/AuthenticatedLayout.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import logoGesta from "./assets/logoGesta.png";
import { Link } from "react-router-dom";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
}) => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* 🧾 MENÚ LATERAL DESLIZABLE */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden
            />

            {/* Drawer izquierdo */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2 }}
              className="relative z-50 h-full w-72 max-w-full bg-white shadow-2xl flex flex-col"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={logoGesta}
                      alt="Logo Gesta"
                      className="h-7 w-7 object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">
                      Gesta
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Que tus cuentas no te hagan cuentos.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <nav className="flex-1 py-4">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full text-left px-5 py-3 text-sm font-medium text-slate-800 hover:bg-indigo-50 flex items-center gap-3"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Cerrar sesión
                </button>
                <Link
                  to="/subscriptions"
                  onClick={() => setIsMenuOpen(false)} // Opcional: cerrar menú al navegar
                  className="w-full text-left px-5 py-3 text-sm font-medium text-slate-800 hover:bg-indigo-50 flex items-center gap-3"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Suscripciones
                </Link>
                <Link
                  to="/accounts" // 1. Redirige a /accounts
                  onClick={() => setIsMenuOpen(false)} // 2. Cierra el menú al hacer clic
                  className="w-full text-left px-5 py-3 text-sm font-medium text-slate-800 hover:bg-indigo-50 flex items-center gap-3"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Tus cuentas
                </Link>
              </nav>

              <div className="px-5 py-4 border-t border-slate-100 text-[11px] text-slate-400">
                © {new Date().getFullYear()} Gesta
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header superior */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-label="Abrir menú de navegación"
            >
              <span className="block w-5 h-0.5 bg-slate-800 rounded mb-1" />
              <span className="block w-5 h-0.5 bg-slate-800 rounded mb-1" />
              <span className="block w-5 h-0.5 bg-slate-800 rounded" />
            </button>

            {/* Logo + nombre */}
            <div className="flex items-center gap-2">
              <img
                src={logoGesta}
                alt="Logo Gesta"
                className="h-8 w-8 rounded-lg object-contain"
              />
              <span className="text-sm font-semibold tracking-tight text-slate-800">
                Gesta
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="text-xs md:text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido de la página autenticada */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default AuthenticatedLayout;
