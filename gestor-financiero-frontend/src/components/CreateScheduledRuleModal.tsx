// src/components/rules/CreateScheduledRuleModal.tsx
import React, { useState } from "react";
import Modal from "./Modal"; // ajustá path

export interface Category {
  id: number;
  name: string;
}

export interface ScheduledRule {
  id: number;
  name: string;
  is_active: boolean;
  schedule_day_of_month: number;
  source_category: number;
  action_type: "FIXED" | "PERCENTAGE";
  action_destination_category: number;
  action_description: string;
  action_fixed_amount: string | null;
  action_percentage: string | null;
}

interface CreateScheduledRuleModalProps {
  isOpen: boolean;
  accountId: string;
  categories: Category[];
  onClose: () => void;
  onCreated: (rule: ScheduledRule) => void;
  onError: (msg: string) => void;
}

const API_BASE_URL = "http://localhost:8000";

const CreateScheduledRuleModal: React.FC<CreateScheduledRuleModalProps> = ({
  isOpen,
  accountId,
  categories,
  onClose,
  onCreated,
  onError,
}) => {
  const [name, setName] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState(5);
  const [sourceCategory, setSourceCategory] = useState<number | "">("");
  const [destinationCategory, setDestinationCategory] = useState<number | "">(
    ""
  );
  const [actionType, setActionType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [fixedAmount, setFixedAmount] = useState("2000");
  const [percentage, setPercentage] = useState("20");
  const [description, setDescription] = useState("Pago automático");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!sourceCategory || !destinationCategory) return;

    try {
      setSubmitting(true);

      let accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) {
        onError("No se encontró un access token. Iniciá sesión de nuevo.");
        setSubmitting(false);
        return;
      }

      const body: any = {
        name: name.trim(),
        is_active: true,
        schedule_day_of_month: dayOfMonth,
        source_category: sourceCategory,
        action_type: actionType,
        action_destination_category: destinationCategory,
        action_description: description.trim(),
        action_fixed_amount:
          actionType === "FIXED" ? fixedAmount.trim() || null : null,
        action_percentage:
          actionType === "PERCENTAGE" ? percentage.trim() || null : null,
      };

      let res = await fetch(
        `${API_BASE_URL}/api/accounts/${accountId}/scheduled-rules/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(body),
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
            `${API_BASE_URL}/api/accounts/${accountId}/scheduled-rules/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(body),
            }
          );
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          throw new Error("Sesión expirada. Volvé a iniciar sesión.");
        }
      }

      if (res.status === 403) {
        throw new Error("Necesitás ser usuario premium para usar reglas.");
      }

      if (!res.ok) throw new Error("Error al crear la regla programada.");

      const newRule: ScheduledRule = await res.json();
      onCreated(newRule);
      onClose();
      setName("");
      setDescription("Pago automático");
    } catch (err: any) {
      onError(err.message || "Error desconocido al crear la regla.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Regla programada" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <p className="text-xs text-slate-500">
          Estas reglas se ejecutan automáticamente un día fijo del mes (por
          ejemplo, “el día 10 mover $2000 de Sueldo a Gimnasio”).
        </p>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Nombre de la regla
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: Pago mensual gimnasio"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Día del mes
            </label>
            <input
              type="number"
              min={1}
              max={31}
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(Number(e.target.value) || 1)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Desde
            </label>
            <select
              value={sourceCategory}
              onChange={(e) =>
                setSourceCategory(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Categoría origen</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Hacia
            </label>
            <select
              value={destinationCategory}
              onChange={(e) =>
                setDestinationCategory(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Categoría destino</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Acción – tipo
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActionType("FIXED")}
              className={`px-3 py-1.5 rounded-lg border text-xs ${
                actionType === "FIXED"
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Monto fijo
            </button>
            <button
              type="button"
              onClick={() => setActionType("PERCENTAGE")}
              className={`px-3 py-1.5 rounded-lg border text-xs ${
                actionType === "PERCENTAGE"
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Porcentaje
            </button>
          </div>
        </div>

        {actionType === "FIXED" ? (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Monto fijo
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={fixedAmount}
              onChange={(e) => setFixedAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Porcentaje (%)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Descripción de la acción
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={
              submitting ||
              !name.trim() ||
              !sourceCategory ||
              !destinationCategory
            }
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting && (
              <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Crear regla
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateScheduledRuleModal;
