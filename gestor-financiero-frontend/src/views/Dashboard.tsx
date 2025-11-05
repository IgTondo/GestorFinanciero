// src/views/Dashboard.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import ChartExpenses from "../components/ChartExpenses";
import ManageAccountModal from "../components/accounts/ManageAccountModal";
import AuthenticatedLayout from "../AuthenticatedLayout";

const API_BASE_URL = "http://localhost:8000";

// 👇 Categorías que vienen de /api/accounts/:id/categories/
export interface Category {
  id: number;
  name: string;
}

// 👇 Transacciones que vienen de /api/accounts/:id/transactions/
export interface Transaction {
  id: number;
  amount: string | number;
  description: string;
  date: string;
  transaction_type: "INCOME" | "EXPENSE";
  // el backend puede devolver el id de categoría (número) o un objeto
  category: number | { id: number; name: string } | null;
}

// 👇 Helper para obtener el nombre real de la categoría
export function getCategoryName(
  tx: Transaction,
  categories: Category[]
): string {
  const cat = tx.category;
  if (cat == null) return "Sin categoría";

  // si ya viene como objeto { id, name }
  if (typeof cat === "object" && "name" in cat && cat.name) {
    return cat.name;
  }

  // si viene como número (id)
  const id =
    typeof cat === "number" ? cat : parseInt(String((cat as any).id), 10);

  const found = categories.find((c) => c.id === id);
  return found?.name ?? `Categoría ${id}`;
}

const Dashboard: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();

  const [account, setAccount] = useState<{
    id: number;
    name: string;
    display_name: string;
    created_at: string;
    owner: {
      id: number;
      email: string;
      first_name?: string;
      last_name?: string;
    };
  } | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loadingAccount, setLoadingAccount] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);

  // 📆 Mes/año seleccionados para el chart y filtros mensuales
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const MONTH_LABELS = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const monthLabel = `${MONTH_LABELS[selectedMonth]} ${selectedYear}`;

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => {
      if (prev === 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => {
      if (prev === 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // email del usuario actual (guardado al loguear), normalizado
  const userEmail = (localStorage.getItem("userEmail") || "")
    .trim()
    .toLowerCase();

  // email del owner de la cuenta, normalizado
  const ownerEmail = (account?.owner?.email || "").trim().toLowerCase();

  // es owner si los emails matchean ignorando mayúsculas/minúsculas
  const isOwner =
    !!account && !!userEmail && !!ownerEmail && userEmail === ownerEmail;

  // saldo (sobre todas las transacciones)
  const balance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const amountNum =
        typeof t.amount === "string" ? parseFloat(t.amount) : t.amount;
      if (isNaN(amountNum)) return acc;
      return t.transaction_type === "INCOME" ? acc + amountNum : acc - amountNum;
    }, 0);
  }, [transactions]);

  // 🔹 Cargar datos de la cuenta
  useEffect(() => {
    const fetchAccount = async () => {
      if (!accountId) return;
      try {
        setLoadingAccount(true);

        let accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!accessToken) {
          setError("No se encontró un access token. Iniciá sesión de nuevo.");
          setLoadingAccount(false);
          return;
        }

        let res = await fetch(`${API_BASE_URL}/api/accounts/${accountId}/`, {
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

            res = await fetch(`${API_BASE_URL}/api/accounts/${accountId}/`, {
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

        if (!res.ok) throw new Error("Error al cargar la cuenta");

        const data = await res.json();
        setAccount(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoadingAccount(false);
      }
    };

    fetchAccount();
  }, [accountId]);

  // 🔹 Cargar transacciones de la cuenta
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!accountId) return;
      try {
        setLoadingTransactions(true);

        let accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!accessToken) {
          setError("No se encontró un access token. Iniciá sesión de nuevo.");
          setLoadingTransactions(false);
          return;
        }

        let res = await fetch(
          `${API_BASE_URL}/api/accounts/${accountId}/transactions/`,
          {
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
              `${API_BASE_URL}/api/accounts/${accountId}/transactions/`,
              {
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

        if (!res.ok) throw new Error("Error al cargar las transacciones");

        const data: Transaction[] = await res.json();
        setTransactions(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [accountId]);

  // 🔹 Cargar categorías de la cuenta
  useEffect(() => {
    const fetchCategories = async () => {
      if (!accountId) return;
      try {
        let accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!accessToken) {
          console.warn("Sin accessToken para cargar categorías");
          return;
        }

        let res = await fetch(
          `${API_BASE_URL}/api/accounts/${accountId}/categories/`,
          {
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
              `${API_BASE_URL}/api/accounts/${accountId}/categories/`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
          } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            console.warn("No se pudieron refrescar categorías (sesión expirada)");
            return;
          }
        }

        if (!res.ok) {
          console.warn("Error al cargar categorías");
          return;
        }

        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.warn("Error cargando categorías:", err);
      }
    };

    fetchCategories();
  }, [accountId]);

  const isLoading = loadingAccount || loadingTransactions;

  const handleTransactionCreated = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  return (
    <AuthenticatedLayout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-800 via-violet-700 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <motion.p
              className="text-xs uppercase tracking-[0.2em] text-violet-200/80 mb-1"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Dashboard de cuenta
            </motion.p>

            <motion.h1
              className="text-2xl md:text-3xl font-semibold tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {loadingAccount
                ? "Cargando cuenta..."
                : account?.display_name || account?.name || "Cuenta"}
            </motion.h1>

            <motion.p
              className="mt-2 text-sm md:text-base text-violet-100/90 max-w-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Visualizá los movimientos, ingresos y gastos de esta cuenta en
              particular. Usá este espacio para seguir de cerca un objetivo
              financiero específico.
            </motion.p>
          </div>

          <motion.div
            className="mt-3 md:mt-0 flex flex-col items-start md:items-end gap-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <span className="text-xs text-violet-100/90">
              Saldo estimado de la cuenta
            </span>
            <span className="text-2xl font-semibold">
              {isNaN(balance)
                ? "—"
                : `$ ${balance.toLocaleString("es-UY", {
                    minimumFractionDigits: 2,
                  })}`}
            </span>
            <button
              type="button"
              onClick={() => setIsManageOpen(true)}
              className="mt-2 px-3 py-1.5 rounded-lg border border-violet-200 text-xs text-violet-100 hover:bg-white/10"
            >
              Gestionar cuenta
            </button>
          </motion.div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isLoading && !error && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700" />
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Form + resumen */}
              <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                  <h2 className="text-sm font-semibold text-slate-800 mb-3">
                    Registrar movimiento
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    Agregá ingresos o gastos para mantener al día esta cuenta.
                  </p>

                  <TransactionForm
                    accountId={accountId!}
                    categories={categories}
                    onTransactionCreated={handleTransactionCreated}
                  />
                </section>

                <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800 mb-3">
                      Resumen rápido
                    </h2>
                    <p className="text-xs text-slate-500 mb-4">
                      Un vistazo rápido al estado de esta cuenta.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Movimientos</span>
                        <span className="font-medium text-slate-800">
                          {transactions.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Saldo estimado</span>
                        <span className="font-medium text-emerald-600">
                          {isNaN(balance)
                            ? "—"
                            : `$ ${balance.toLocaleString("es-UY", {
                                minimumFractionDigits: 2,
                              })}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Chart de gastos */}
              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-800">
                    Distribución de gastos
                  </h2>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:opacity-90 transition"
                      aria-label="Mes anterior"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent capitalize">
                      {monthLabel}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:opacity-90 transition"
                      aria-label="Mes siguiente"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedYear}-${selectedMonth}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-[300px]"
                  >
                    <ChartExpenses
                      transactions={monthlyTransactions}
                      categories={categories}
                    />
                  </motion.div>
                </AnimatePresence>
              </section>

              {/* Lista de transacciones */}
              <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-800">
                    Movimientos de la cuenta
                  </h2>
                  <span className="text-[11px] text-slate-500">
                    Últimos movimientos primero
                  </span>
                </div>

                {accountId && (
                  <TransactionList
                    accountId={accountId}
                    transactions={[...transactions].sort(
                      (a, b) =>
                        new Date(b.date).getTime() -
                        new Date(a.date).getTime()
                    )}
                    categories={categories}
                    onTransactionUpdated={(updated) => {
                      setTransactions((prev) =>
                        prev.map((t) => (t.id === updated.id ? updated : t))
                      );
                    }}
                    onTransactionDeleted={(id) => {
                      setTransactions((prev) =>
                        prev.filter((t) => t.id !== id)
                      );
                    }}
                  />
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {account && accountId && (
        <ManageAccountModal
          isOpen={isManageOpen}
          accountId={accountId}
          currentName={account.name}
          isOwner={isOwner}
          onAccountRenamed={(newName: string) => {
            setAccount((prev) =>
              prev
                ? {
                    ...prev,
                    name: newName,
                    display_name:
                      prev.display_name && prev.display_name !== prev.name
                        ? prev.display_name
                        : newName,
                  }
                : prev
            );
          }}
          onClose={() => setIsManageOpen(false)}
        />
      )}
    </AuthenticatedLayout>
  );
};

export default Dashboard;
