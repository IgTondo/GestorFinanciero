import React, { useState } from "react";
import type { Transaction, Category } from "../views/Dashboard";
import { getCategoryName } from "../views/Dashboard";
import EditTransactionModal from "./EditTransactionModal";

interface Props {
  accountId: string;
  transactions: Transaction[];
  categories: Category[];
  onTransactionUpdated: (tx: Transaction) => void;
  onTransactionDeleted: (id: number) => void;
}

export default function TransactionList({
  accountId,
  transactions,
  categories,
  onTransactionUpdated,
  onTransactionDeleted,
}: Props) {
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Ordenar por fecha (más recientes primero)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Transacciones</h2>

      {sortedTransactions.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No hay transacciones registradas.
        </p>
      ) : (
        <ul className="divide-y">
          {sortedTransactions.map((tx) => {
            const amountNum =
              typeof tx.amount === "string"
                ? parseFloat(tx.amount)
                : tx.amount;

            const isIncome = tx.transaction_type === "INCOME";
            const categoryName = getCategoryName(tx, categories);

            return (
              <li
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-gray-900">
                    {tx.description || categoryName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {tx.date.slice(0, 10)} · {categoryName} ·{" "}
                    <span
                      className={
                        isIncome ? "text-green-600" : "text-red-600"
                      }
                    >
                      {isIncome ? "Ingreso" : "Egreso"}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`font-semibold ${
                      isIncome ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {isNaN(amountNum)
                      ? "—"
                      : `$ ${amountNum.toLocaleString("es-UY", {
                          minimumFractionDigits: 2,
                        })}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingTx(tx)}
                    className="text-xs text-indigo-600 hover:text-indigo-500"
                  >
                    Editar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editingTx && (
        <EditTransactionModal
          accountId={accountId}
          transaction={editingTx}
          categories={categories}
          onUpdated={(updated) => {
            onTransactionUpdated(updated);
          }}
          onDeleted={(id) => {
            onTransactionDeleted(id);
          }}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  );
}
