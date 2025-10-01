import React, { useState } from "react";
import axios from "axios";

interface Props {
  onAdd: (tx: any) => void;
}

export default function TransactionForm({ onAdd }: Props) {
  const [form, setForm] = useState({ type: "egreso", category: "", amount: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.amount) return;

    axios.post("http://localhost:8000/transactions/", form, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    })
    .then(res => {
      onAdd(res.data);
      setForm({ type: "egreso", category: "", amount: "" });
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Registrar Transacción</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
        <select
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
          className="border rounded-lg p-2"
        >
          <option value="egreso">Egreso</option>
          <option value="ingreso">Ingreso</option>
        </select>

        <input
          type="text"
          placeholder="Categoría"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="border rounded-lg p-2"
        />

        <input
          type="number"
          placeholder="Monto"
          value={form.amount}
          onChange={e => setForm({ ...form, amount: e.target.value })}
          className="border rounded-lg p-2"
        />

        <button
          type="submit"
          className="md:col-span-3 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:opacity-90"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
