import React, { useState, useMemo, useEffect } from "react";
import type { Transaction, Category } from "../views/Dashboard";

const API_BASE_URL = "http://localhost:8000";

interface Props {
  accountId: string;
  categories: Category[];
  onTransactionCreated: (tx: Transaction) => void;
}

const TransactionForm: React.FC<Props> = ({
  accountId,
  categories,
  onTransactionCreated,
}) => {
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [categoryId, setCategoryId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(""); // 👈 fecha elegida por el usuario (YYYY-MM-DD)

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Categorías según tipo (igual que antes: INCOME -> "Ingreso", EXPENSE -> el resto)
  const visibleCategories = useMemo(() => {
    if (!categories.length) return [];
    if (type === "INCOME") {
      return categories.filter(
        (c) => c.name.toLowerCase() === "ingreso"
      );
    }
    return categories.filter(
      (c) => c.name.toLowerCase() !== "ingreso"
    );
  }, [categories, type]);

  // Si cambia el tipo, aseguramos que haya una categoría válida seleccionada
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        type === "INCOME"
          ? "No hay una categoría 'Ingreso' configurada."
          : "Seleccioná una categoría válida."
      );
      return;
    }

    try {
      setSaving(true);

      const body = {
        transaction_type: type,           // "INCOME" | "EXPENSE"
        category: Number(categoryId),     // id numérico
        amount: amount.toString(),        // string -> backend la parsea
        description: description.trim(),  
        date,                             // ACA va tal cual el input: "YYYY-MM-DD"
      };

      const res = await authFetch(
        `${API_BASE_URL}/api/accounts/${accountId}/transactions/`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      const dataJson = await res.json().catch(() => null);

      if (!res.ok) {
        const backendError =
          dataJson?.detail ||
          dataJson?.error ||
          dataJson?.non_field_errors?.[0] ||
          "No se pudo crear la transacción.";
        throw new Error(backendError);
      }

      const created = dataJson as Transaction;
      onTransactionCreated(created);

      // limpiamos solo lo que tiene sentido
      setAmount("");
      setDescription("");
      // si querés, dejá la fecha seleccionada, si no:
      // setDate("");
    } catch (err: any) {
      setError(err.message || "Error desconocido al crear la transacción.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Agregar transacción</h2>

      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        {/* Tipo */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("EXPENSE")}
            className={`w-full border rounded-lg p-2 text-xs ${
              type === "EXPENSE"
                ? "bg-rose-50 border-rose-300 text-rose-700 font-medium"
                : "border-slate-200 text-slate-600"
            }`}
          >
            Egreso
          </button>
          <button
            type="button"
            onClick={() => setType("INCOME")}
            className={`w-full border rounded-lg p-2 text-xs ${
              type === "INCOME"
                ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-medium"
                : "border-slate-200 text-slate-600"
            }`}
          >
            Ingreso
          </button>
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
          >
            {visibleCategories.length === 0 && (
              <option>
                {type === "INCOME"
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
            placeholder="Descripción Breve/Título"
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)} // 👈 guarda EXACTAMENTE el valor del input
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
