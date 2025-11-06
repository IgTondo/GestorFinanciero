// src/components/rules/CreateEventRuleModal.tsx
import React, { useState } from "react";
import Modal from "./Modal"; 

export interface Category {
  id: number;
  name: string;
}

export interface EventRule {
  id: number;
  name: string;
  is_active: boolean;
  trigger_category: number;
  trigger_transaction_type: "INCOME" | "EXPENSE";
  action_type: "FIXED" | "PERCENTAGE";
  action_destination_category: number;
  action_description: string;
  action_fixed_amount: string | null;
  action_percentage: string | null;
}

interface CreateEventRuleModalProps {
  isOpen: boolean;
  accountId: string;
  categories: Category[];
  onClose: () => void;
  onCreated: (rule: EventRule) => void;
  onError: (msg: string) => void;
}

const API_BASE_URL = "http://localhost:8000";

const CreateEventRuleModal: React.FC<CreateEventRuleModalProps> = ({
  isOpen,
  accountId,
  categories,
  onClose,
  onCreated,
  onError,
}) => {
  const [name, setName] = useState("");
  const [triggerCategory, setTriggerCategory] = useState<number | "">("");
  const [triggerType, setTriggerType] = useState<"INCOME" | "EXPENSE">(
    "INCOME"
  );
  const [actionType, setActionType] = useState<"FIXED" | "PERCENTAGE">(
    "PERCENTAGE"
  );
  const [destinationCategory, setDestinationCategory] = useState<number | "">(
    ""
  );
  const [description, setDescription] = useState("Ahorro automático");
  const [fixedAmount, setFixedAmount] = useState("");
  const [percentage, setPercentage] = useState("20");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!triggerCategory || !destinationCategory) return;

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
        trigger_category: triggerCategory,
        trigger_transaction_type: triggerType,
        action_type: actionType,
        action_destination_category: destinationCategory,
        action_description: description.trim(),
        action_fixed_amount:
          actionType === "FIXED" ? fixedAmount.trim() || null : null,
        action_percentage:
          actionType === "PERCENTAGE" ? percentage.trim() || null : null,
      };

      let res = await fetch(
        `${API_BASE_URL}/api/accounts/${accountId}/event-rules/`,
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
            `${API_BASE_URL}/api/accounts/${accountId}/event-rules/`,
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

      if (!res.ok) throw new Error("Error al crear la regla de evento.");

      const newRule: EventRule = await res.json();
      onCreated(newRule);
      onClose();
      setName("");
      setDescription("Ahorro automático");
      setPercentage("20");
      setFixedAmount("");
    } catch (err: any) {
      onError(err.message || "Error desconocido al crear la regla.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Regla de evento" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <p className="text-xs text-slate-500">
          Estas reglas se disparan automáticamente cuando se crea una
          transacción que coincide con el disparador (por ejemplo, “al recibir
          un ingreso en Sueldo, guardar un 20% en Ahorros”).
        </p>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Nombre de la regla
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: Ahorrar 20% del sueldo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Disparador – categoría
            </label>
            <select
              value={triggerCategory}
              onChange={(e) =>
                setTriggerCategory(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Seleccioná una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Disparador – tipo de transacción
            </label>
            <select
              value={triggerType}
              onChange={(e) =>
                setTriggerType(e.target.value as "INCOME" | "EXPENSE")
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="INCOME">Ingreso</option>
              <option value="EXPENSE">Gasto</option>
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
              onClick={() => setActionType("PERCENTAGE")}
              className={`px-3 py-1.5 rounded-lg border text-xs ${
                actionType === "PERCENTAGE"
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Porcentaje
            </button>
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
          </div>
        </div>

        {actionType === "PERCENTAGE" ? (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Porcentaje a mover (%)
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
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Monto fijo a mover
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
        )}

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Destino – categoría
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
            <option value="">Seleccioná una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

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
              !triggerCategory ||
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

export default CreateEventRuleModal;
