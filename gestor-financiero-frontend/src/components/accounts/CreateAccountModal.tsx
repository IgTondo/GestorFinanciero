// src/components/accounts/CreateAccountModal.tsx
import React, { useState } from "react";
import type { Account } from "../../views/AccountsPage";
import Modal from "../Modal"; // 👈 Importa el template modal

const API_BASE_URL = "http://localhost:8000";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (account: Account) => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null; // 👈 Evita render si no está abierto

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);

      let accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) {
        throw new Error("No se encontró un access token. Iniciá sesión.");
      }

      let res = await fetch(`${API_BASE_URL}/api/accounts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      // refresh token si expiró
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
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ name: name.trim() }),
          });
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          throw new Error("Sesión expirada. Volvé a iniciar sesión.");
        }
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const backendError =
          data?.detail || data?.error || "No se pudo crear la cuenta.";
        throw new Error(backendError);
      }

      const newAccount: Account = await res.json();
      onCreated(newAccount);
      setName("");
      onClose(); 
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Nueva cuenta" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre de la cuenta
          </label>
          <input
            type="text"
            placeholder="Ej: Ahorros, Gastos del hogar, Viaje a Europa..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-60 transition"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
