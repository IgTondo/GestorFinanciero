import React from "react";

interface Transaction {
  id: number;
  type: "ingreso" | "egreso";
  category: string;
  amount: number;
  date: string;
}

interface Props {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Transacciones</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay transacciones en este mes</p>
      ) : (
        <ul className="divide-y">
          {transactions.map(tx => (
            <li key={tx.id} className="py-2 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {tx.date} · {tx.category} ·{" "}
                <span className={tx.type === "ingreso" ? "text-green-600" : "text-red-600"}>
                  {tx.type}
                </span>
              </span>
              <span className="font-semibold">${tx.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
