import React, { useState } from "react";
import type { NewTransaction } from "../views/Dashboard";

const CATEGORIES = [
  "Deportes",
  "Comidas",
  "Salidas",
  "Educación",
  "Supermercado",
];

interface Props {
  onAddTransaction: (tx: NewTransaction) => void;
}

export default function TransactionForm({ onAddTransaction }: Props) {
  const [type, setType] = useState<"ingreso" | "egreso">("egreso");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    onAddTransaction({ type, category, amount, date });
    setAmount(0);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Agregar Transacción</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "ingreso" | "egreso")}
          className="w-full border rounded-lg p-2"
        >
          <option value="ingreso">Ingreso</option>
          <option value="egreso">Egreso</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full border rounded-lg p-2"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-lg p-2"
        />

        <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
