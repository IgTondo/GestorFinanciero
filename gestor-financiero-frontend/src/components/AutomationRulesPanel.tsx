// src/components/rules/AutomationRulesPanel.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreateEventRuleModal, {
  type EventRule,
  type Category,
} from "./CreateEventRuleModal";
import CreateScheduledRuleModal, {
  type ScheduledRule,
} from "./CreateScheduledRuleModal";

const API_BASE_URL = "http://localhost:8000";

interface AutomationRulesPanelProps {
  accountId: string;
  categories: Category[];
}

type Tab = "event" | "scheduled";

const AutomationRulesPanel: React.FC<AutomationRulesPanelProps> = ({
  accountId,
  categories,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("event");
  const [eventRules, setEventRules] = useState<EventRule[]>([]);
  const [scheduledRules, setScheduledRules] = useState<ScheduledRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [scheduledModalOpen, setScheduledModalOpen] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true);
        setError(null);

        let accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!accessToken) {
          setError(
            "No se encontró un access token. Volvé a iniciar sesión para ver tus reglas."
          );
          setLoading(false);
          return;
        }

        const fetchWithAuth = async (url: string) => {
          let res = await fetch(url, {
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

              res = await fetch(url, {
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

          if (res.status === 403) {
            throw new Error(
              "Esta sección es solo para usuarios premium. Actualizá tu plan para usar automatizaciones."
            );
          }

          if (!res.ok) {
            throw new Error("Error al cargar las reglas de automatización.");
          }

          return res.json();
        };

        const [eventData, scheduledData] = await Promise.all([
          fetchWithAuth(
            `${API_BASE_URL}/api/accounts/${accountId}/event-rules/`
          ),
          fetchWithAuth(
            `${API_BASE_URL}/api/accounts/${accountId}/scheduled-rules/`
          ),
        ]);

        setEventRules(eventData || []);
        setScheduledRules(scheduledData || []);
      } catch (err: any) {
        setError(err.message || "Error desconocido al cargar las reglas.");
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchRules();
    }
  }, [accountId]);

  const getCategoryName = (id: number | null | undefined) => {
    if (id == null) return "—";
    return categories.find((c) => c.id === id)?.name ?? `Categoría ${id}`;
  };

  const toggleEventRuleActive = async (rule: EventRule) => {
    try {
      let accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) {
        setError("No se encontró un access token. Iniciá sesión de nuevo.");
        return;
      }

      let res = await fetch(
        `${API_BASE_URL}/api/accounts/${accountId}/event-rules/${rule.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ is_active: !rule.is_active }),
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
            `${API_BASE_URL}/api/accounts/${accountId}/event-rules/${rule.id}/`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ is_active: !rule.is_active }),
            }
          );
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          throw new Error("Sesión expirada. Volvé a iniciar sesión.");
        }
      }

      if (!res.ok) throw new Error("Error al actualizar la regla.");

      const updated = await res.json();
      setEventRules((prev) =>
        prev.map((r) => (r.id === rule.id ? updated : r))
      );
    } catch (err: any) {
      setError(err.message || "Error desconocido al actualizar la regla.");
    }
  };

  const deleteEventRule = async (rule: EventRule) => {
    if (!window.confirm(`¿Eliminar la regla "${rule.name}"?`)) return;

    try {
      let accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) {
        setError("No se encontró un access token. Iniciá sesión de nuevo.");
        return;
      }

      let res = await fetch(
        `${API_BASE_URL}/api/accounts/${accountId}/event-rules/${rule.id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
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
            `${API_BASE_URL}/api/accounts/${accountId}/event-rules/${rule.id}/`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          throw new Error("Sesión expirada. Volvé a iniciar sesión.");
        }
      }

      if (!res.ok && res.status !== 204)
        throw new Error("Error al eliminar la regla.");

      setEventRules((prev) => prev.filter((r) => r.id !== rule.id));
    } catch (err: any) {
      setError(err.message || "Error desconocido al eliminar la regla.");
    }
  };

  const deleteScheduledRule = async (rule: ScheduledRule) => {
    if (!window.confirm(`¿Eliminar la regla "${rule.name}"?`)) return;

    try {
      let accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) {
        setError("No se encontró un access token. Iniciá sesión de nuevo.");
        return;
      }

      let res = await fetch(
        `${API_BASE_URL}/api/accounts/${accountId}/scheduled-rules/${rule.id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
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
            `${API_BASE_URL}/api/accounts/${accountId}/scheduled-rules/${rule.id}/`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          throw new Error("Sesión expirada. Volvé a iniciar sesión.");
        }
      }

      if (!res.ok && res.status !== 204)
        throw new Error("Error al eliminar la regla.");

      setScheduledRules((prev) => prev.filter((r) => r.id !== rule.id));
    } catch (err: any) {
      setError(err.message || "Error desconocido al eliminar la regla.");
    }
  };

  const toggleScheduledRuleActive = async (rule: ScheduledRule) => {
    try {
      let accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) {
        setError("No se encontró un access token. Iniciá sesión de nuevo.");
        return;
      }

      let res = await fetch(
        `${API_BASE_URL}/api/accounts/${accountId}/scheduled-rules/${rule.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ is_active: !rule.is_active }),
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
            `${API_BASE_URL}/api/accounts/${accountId}/scheduled-rules/${rule.id}/`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ is_active: !rule.is_active }),
            }
          );
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          throw new Error("Sesión expirada. Volvé a iniciar sesión.");
        }
      }

      if (!res.ok) throw new Error("Error al actualizar la regla.");

      const updated = await res.json();
      setScheduledRules((prev) =>
        prev.map((r) => (r.id === rule.id ? updated : r))
      );
    } catch (err: any) {
      setError(err.message || "Error desconocido al actualizar la regla.");
    }
  };

  const renderRuleBadge = (label: string, value: string) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-50 text-slate-600 border border-slate-200">
      <span className="font-medium mr-1">{label}:</span>
      {value}
    </span>
  );

  const renderEventRules = () => {
    if (eventRules.length === 0) {
      return (
        <div className="text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg p-4 text-center">
          Todavía no tenés reglas de evento. Probá crear una que ahorre
          automáticamente una parte de tu sueldo o mueva dinero al recibir un
          gasto específico.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {eventRules.map((rule) => (
          <motion.div
            key={rule.id}
            layout
            className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-amber-600 font-semibold">
                    Evento
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      rule.is_active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-50 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {rule.is_active ? "Activa" : "Pausada"}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {rule.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {rule.action_description || "Sin descripción"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() => toggleEventRuleActive(rule)}
                  className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  {rule.is_active ? "Pausar" : "Activar"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteEventRule(rule)}
                  className="text-[11px] px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              {renderRuleBadge(
                "Cuando",
                `${rule.trigger_transaction_type === "INCOME" ? "Ingreso" : "Gasto"} en ${getCategoryName(
                  rule.trigger_category
                )}`
              )}
              {renderRuleBadge(
                "Enviar a",
                getCategoryName(rule.action_destination_category)
              )}
              {renderRuleBadge(
                "Acción",
                rule.action_type === "PERCENTAGE"
                  ? `${rule.action_percentage ?? "?"}% del monto`
                  : `$ ${rule.action_fixed_amount ?? "?"}`
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderScheduledRules = () => {
    if (scheduledRules.length === 0) {
      return (
        <div className="text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg p-4 text-center">
          No tenés reglas programadas. Podés crear una para pagar gastos fijos
          (alquiler, gimnasio, suscripciones) automáticamente todos los meses.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {scheduledRules.map((rule) => (
          <motion.div
            key={rule.id}
            layout
            className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">
                    Programada
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      rule.is_active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-50 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {rule.is_active ? "Activa" : "Pausada"}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {rule.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {rule.action_description || "Sin descripción"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() => toggleScheduledRuleActive(rule)}
                  className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  {rule.is_active ? "Pausar" : "Activar"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteScheduledRule(rule)}
                  className="text-[11px] px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              {renderRuleBadge(
                "Día",
                `Día ${rule.schedule_day_of_month} de cada mes`
              )}
              {renderRuleBadge(
                "Desde",
                getCategoryName(rule.source_category)
              )}
              {renderRuleBadge(
                "Hacia",
                getCategoryName(rule.action_destination_category)
              )}
              {renderRuleBadge(
                "Acción",
                rule.action_type === "FIXED"
                  ? `$ ${rule.action_fixed_amount ?? "?"}`
                  : `${rule.action_percentage ?? "?"}% del saldo`
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Automatizaciones
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Premium
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-900">
            Reglas inteligentes para tu cuenta
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            Automatizá ahorros y pagos repetitivos. Creá reglas que se ejecuten
            ante un evento o en una fecha fija del mes.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 rounded-full p-1 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("event")}
            className={`px-3 py-1 rounded-full ${
              activeTab === "event"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Por evento
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("scheduled")}
            className={`px-3 py-1 rounded-full ${
              activeTab === "scheduled"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Programadas
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-3">
            <p className="text-[11px] text-slate-500">
              {activeTab === "event"
                ? "Se ejecutan cuando se crea una transacción que coincide con el disparador."
                : "Se ejecutan automáticamente un día fijo del mes."}
            </p>
            <button
              type="button"
              onClick={() =>
                activeTab === "event"
                  ? setEventModalOpen(true)
                  : setScheduledModalOpen(true)
              }
              className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <span className="text-xs">＋</span>
              Nueva regla
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "event"
                ? renderEventRules()
                : renderScheduledRules()}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* Modales */}
      <CreateEventRuleModal
        isOpen={eventModalOpen}
        accountId={accountId}
        categories={categories}
        onClose={() => setEventModalOpen(false)}
        onCreated={(rule) => setEventRules((prev) => [...prev, rule])}
        onError={(msg) => setError(msg)}
      />

      <CreateScheduledRuleModal
        isOpen={scheduledModalOpen}
        accountId={accountId}
        categories={categories}
        onClose={() => setScheduledModalOpen(false)}
        onCreated={(rule) => setScheduledRules((prev) => [...prev, rule])}
        onError={(msg) => setError(msg)}
      />
    </section>
  );
};

export default AutomationRulesPanel;
