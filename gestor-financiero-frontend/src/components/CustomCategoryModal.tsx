// src/components/categories/CustomCategoryModal.tsx
import React, { useState } from "react";
import Modal from "./Modal"; // 👉 ajustá el path según dónde guardaste tu Modal

const API_BASE_URL = "http://localhost:8000";

export interface Category {
  id: number;
  name: string;
}

interface CustomCategoryModalProps {
  isOpen: boolean;
  accountId: string;
  onClose: () => void;
  onCategoryCreated: (category: Category) => void;
  onError: (message: string) => void;
}

const CustomCategoryModal: React.FC<CustomCategoryModalProps> = ({
  isOpen,
  accountId,
  onClose,
  onCategoryCreated,
  onError,
}) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);

      let accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) {
        onError("No se encontró un access token. Iniciá sesión de nuevo.");
        setIsSubmitting(false);
        return;
      }

      let res = await fetch(
        `${API_BASE_URL}/api/accounts/${accountId}/categories/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: name.trim() }),
        }
      );

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

          res = await fetch(
            `${API_BASE_URL}/api/accounts/${accountId}/categories/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ name: name.trim() }),
            }
          );
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          throw new Error("Sesión expirada. Volvé a iniciar sesión.");
        }
      }

      if (!res.ok) throw new Error("Error al crear la categoría");

      const newCategory: Category = await res.json();
      onCategoryCreated(newCategory);
      setName("");
      onClose();
    } catch (err: any) {
      onError(err.message || "Error desconocido al crear la categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Nueva categoría personalizada" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-500">
          Creá categorías de gasto a tu medida para organizar mejor tus
          movimientos.
        </p>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Nombre de la categoría
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: Comida afuera, Viajes, Gimnasio..."
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting && (
              <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Crear categoría
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomCategoryModal;
