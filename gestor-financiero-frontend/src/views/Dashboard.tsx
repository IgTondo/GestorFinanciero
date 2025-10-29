import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ChartExpenses from "../components/ChartExpenses";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import { mockTransactions } from "./mockTransactions";

export interface Transaction {
  id: number;
  type: "ingreso" | "egreso";
  category: string;
  amount: number;
  date: string; // formato "YYYY-MM-DD"
}

export type NewTransaction = Omit<Transaction, "id">;

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = mes actual

  // Fecha del mes visualizado
  const currentDate = new Date();
  const viewDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + monthOffset,
    1
  );

  const monthName = viewDate.toLocaleString("es-ES", {
    month: "long",
    year: "numeric",
  });

  // Filtrar transacciones del mes actual
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const txDate = new Date(t.date);
      return (
        txDate.getMonth() === viewDate.getMonth() &&
        txDate.getFullYear() === viewDate.getFullYear()
      );
    });
  }, [transactions, viewDate]);

  const handleAddTransaction = (tx: NewTransaction) => {
    setTransactions((prev) => [...prev, { ...tx, id: prev.length + 1 }]);
  };

  const handleLogout = () => {
    // 1. Eliminar el token del almacenamiento local (localStorage)
    localStorage.removeItem('userToken'); 

    // 2. Redirigir al usuario a la página de inicio o login
    window.location.href = '/'; 
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8">

      {/*SECCIÓN DEL HEADER*/}
      <div className="flex justify-between items-center mb-8">
        <motion.div
          className="text-0" //
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Financiero
          </h1>
          <p className="text-gray-600">
            Visualizá tus ingresos y gastos mensuales
          </p>
        </motion.div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-red-400 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </button>

      </div>

      {/* Mes y slider */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <button
          onClick={() => setMonthOffset((m) => m - 1)}
          className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          ◀
        </button>
        <h2 className="text-xl font-semibold">{monthName}</h2>
        <button
          onClick={() => setMonthOffset((m) => m + 1)}
          className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          ▶
        </button>
      </div>

      {/* Contenido principal */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartExpenses transactions={filteredTransactions} />

        <TransactionForm onAddTransaction={handleAddTransaction} />
      </div>

      {/* Lista de transacciones */}
      <div className="mt-8">
        <TransactionList transactions={filteredTransactions} />
      </div>
    </div>
  );
}
