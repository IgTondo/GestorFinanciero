// src/components/EditTransactionModal.tsx
import React, { useState, useMemo, useEffect } from "react";
import Modal from "./Modal";
import type { Transaction, Category } from "../views/Dashboard";

const API_BASE_URL = "http://localhost:8000";

interface EditTransactionModalProps {
  accountId: string;
  transaction: Transaction;
  categories: Category[];
  onUpdated: (tx: Transaction) => void;
  onDeleted: (id: number) => void;
  onClose: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  accountId,
  transaction,
  categories,
  onUpdated,
  onDeleted,
  onClose,
}) => {
  // 🔒 Tipo fijo: no se puede cambiar ingreso/egreso
  const [transactionType] = useState<"INCOME" | "EXPENSE">(
    transaction.transaction_type
  );

  const [categoryId, setCategoryId] = useState<string>(() => {
    if (typeof transaction.category === "number") {
      return String(transaction.category);
    }
    if (transaction.category && typeof transaction.category === "object") {
      // @ts-ignore
      return transaction.category.id ? String(transaction.category.id) : "";
    }
    return "";
  });

  const [amount, setAmount] = useState<string>(
    typeof transaction.amount === "string"
      ? transaction.amount
      : transaction.amount.toString()
  );
  const [description, setDescription] = useState<string>(
    transaction.description || ""
  );
  const [date, setDate] = useState<string>(transaction.date.slice(0, 10)); // YYYY-MM-DD

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Categorías visibles según el tipo (igual que en TransactionForm)
  const visibleCategories = useMemo(() => {
    if (!categories.length) return [];

    if (transactionType === "INCOME") {
      return categories.filter(
        (c) => c.name.toLowerCase() === "ingreso"
      );
    }

    return categories.filter(
      (c) => c.name.toLowerCase() !== "ingreso"
    );
  }, [categories, transactionType]);

  // Asegurarnos de que la categoría seleccionada sea válida para el tipo
  useEffect(() => {
    if (!visibleCategories.length) {
      setCategoryId("");
      return;
    }

    const exists = visibleCategories.some(
      (c) => String(c.id) === categoryId
    );

    if (!exists) {
      setCategoryId(String(visibleCategories[0].id));
    }
  }, [visibleCategories, categoryId]);

  // helper con refresh de token
  const authFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    let accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken) {
      throw new Error("No se encontró un access token. Iniciá sesión de nuevo.");
    }

    const withAuth: RequestInit = {
      ...(init || {}),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init?.headers || {}),
      },
    };

    let res = await fetch(input, withAuth);

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

        const retryInit: RequestInit = {
          ...(init || {}),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            ...(init?.headers || {}),
          },
        };

        res = await fetch(input, retryInit);
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        throw new Error("Sesión expirada. Volvé a iniciar sesión.");
      }
    }

    return res;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amount || isNaN(Number(amount))) {
      setError("Ingresá un monto válido.");
      return;
    }
    if (!date) {
      setError("Seleccioná una fecha.");
      return;
    }
    if (!visibleCategories.length || !categoryId) {
      setError(
        transactionType === "INCOME"
          ? "No hay una categoría 'Ingreso' configurada."
          : "Seleccioná una categoría válida."
      );
      return;
    }

    try {
      setSaving(true);

      const body = {
        transaction_type: transactionType, // 🔒 no cambia
        category: Number(categoryId),
        amount: amount.toString(),
        description: description.trim(),
        date,
      };

      const res = await authFetch(
        `${API_BASE_URL}/api/accounts/${accountId}/transactions/${transaction.id}/`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        }
      );

      const dataJson = await res.json().catch(() => null);

      if (!res.ok) {
        const backendError =
          dataJson?.detail ||
          dataJson?.error ||
          dataJson?.non_field_errors?.[0] ||
          "No se pudo actualizar la transacción.";
        throw new Error(backendError);
      }

      const updated = dataJson as Transaction;
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error desconocido al actualizar la transacción.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "¿Seguro que querés eliminar esta transacción? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const res = await authFetch(
        `${API_BASE_URL}/api/accounts/${accountId}/transactions/${transaction.id}/`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok && res.status !== 204) {
        const dataJson = await res.json().catch(() => null);
        const backendError =
          dataJson?.detail ||
          dataJson?.error ||
          "No se pudo eliminar la transacción.";
        throw new Error(backendError);
      }

      onDeleted(transaction.id);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al eliminar la transacción.");
    } finally {
      setDeleting(false);
    }
  };

  const isIncome = transactionType === "INCOME";

  return (
    <Modal title="Editar transacción" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4 text-sm">
        {/* Tipo (solo lectura) */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Tipo de transacción</span>
          <span
            className={`px-2 py-1 rounded-full text-[11px] font-medium ${
              isIncome
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {isIncome ? "Ingreso" : "Egreso"}
          </span>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Categoría
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
            disabled={
              visibleCategories.length === 0 ||
              (transactionType === "INCOME" && visibleCategories.length === 1)
            }
          >
            {visibleCategories.length === 0 && (
              <option>
                {transactionType === "INCOME"
                  ? "No hay categoría 'Ingreso' configurada"
                  : "No hay categorías disponibles"}
              </option>
            )}

            {visibleCategories.length > 0 &&
              visibleCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        {/* Monto */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Monto</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Descripción
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Detalle (opcional)"
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-2 rounded-lg border border-red-300 text-red-600 text-xs hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border text-xs text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditTransactionModal;
