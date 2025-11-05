// src/pages/AccountsPage.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AccountList } from "../components/accounts/AccountList";
import { CreateAccountModal } from "../components/accounts/CreateAccountModal";
import AuthenticatedLayout from "../AuthenticatedLayout";

export interface Account {
  id: number;
  name: string;
  display_name: string;
  created_at: string;
  owner: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  members: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  }[];
}

const API_BASE_URL = "http://localhost:8000";

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);

        let accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!accessToken) {
          setError("No se encontró un access token. Iniciá sesión de nuevo.");
          setLoading(false);
          return;
        }

        let res = await fetch(`${API_BASE_URL}/api/accounts/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401 && refreshToken) {
          const refreshRes = await fetch(
            `${API_BASE_URL}/api/auth/token/refresh/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh: refreshToken }),
            }
          );

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newAccess = data.access;
            localStorage.setItem("accessToken", newAccess);
            accessToken = newAccess;

            res = await fetch(`${API_BASE_URL}/api/accounts/`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            });
          } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            throw new Error("Sesión expirada. Volvé a iniciar sesión.");
          }
        }

        if (!res.ok) throw new Error("Error al cargar las cuentas");

        const data: Account[] = await res.json();
        setAccounts(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleAccountCreated = (newAccount: Account) => {
    setAccounts((prev) => [newAccount, ...prev]);
    setIsCreateModalOpen(false);
  };

  return (
    <AuthenticatedLayout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-800 via-violet-700 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <motion.p
              className="text-xs uppercase tracking-[0.2em] text-violet-200/80 mb-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {"Bienvenido a Gesta"}
            </motion.p>

            <motion.h1
              className="text-2xl md:text-3xl font-semibold tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Tus cuentas
            </motion.h1>
            <motion.p
              className="mt-2 text-sm md:text-base text-violet-100/90 max-w-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Organizá tus finanzas en espacios separados: gastos del hogar,
              ahorros, proyectos y metas específicas. Mantené todo bajo control
              con Gesta.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col items-start md:items-end gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-white text-indigo-700 px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 transition"
            >
              <span className="mr-2 text-lg">＋</span>
              Nueva cuenta
            </button>
            <span className="text-xs text-violet-100/80">
              Tip: usá una cuenta distinta para cada objetivo financiero.
            </span>
          </motion.div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700" />
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {accounts.length === 0
                    ? "Todavía no tenés cuentas creadas."
                    : `Tenés ${accounts.length} ${
                        accounts.length === 1 ? "cuenta" : "cuentas"
                      } activas.`}
                </span>
              </div>
              <AccountList accounts={accounts} />
            </>
          )}
        </div>
      </div>

      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleAccountCreated}
      />
    </AuthenticatedLayout>
  );
};
