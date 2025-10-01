import React, { useEffect, useState } from "react";
import axios from "axios";
import ChartExpenses from "../components/ChartExpenses";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);

  // Cargar transacciones desde el backend
  useEffect(() => {
    axios.get("http://localhost:8000/transactions/", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    })
    .then(res => setTransactions(res.data))
    .catch(err => console.error(err));
  }, []);

  const addTransaction = (tx: any) => {
    setTransactions([...transactions, tx]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartExpenses transactions={transactions} />
        <TransactionForm onAdd={addTransaction} />
      </div>

      <TransactionList transactions={transactions} />
    </div>
  );
}
