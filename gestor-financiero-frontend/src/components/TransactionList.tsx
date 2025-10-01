import React from "react";

interface Props {
  transactions: any[];
}

export default function TransactionList({ transactions }: Props) {
  return (
    <div className="mt-8 bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Movimientos recientes</h2>
      <ul className="divide-y text-sm">
        {transactions.map(tx => (
          <li key={tx.id} className="flex justify-between py-2">
            <span>{tx.type === "egreso" ? "🔴" : "🟢"} {tx.category}</span>
            <span className="font-medium">${tx.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
