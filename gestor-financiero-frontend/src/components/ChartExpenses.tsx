import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Transaction, Category } from "../views/Dashboard";
import { getCategoryName } from "../views/Dashboard";

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

const COLORS = [
  "#6366F1",
  "#A855F7",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
];

const ChartExpenses: React.FC<Props> = ({ transactions, categories }) => {
  const data = useMemo(() => {
    const totals: Record<string, number> = {};

    transactions
      .filter((tx) => tx.transaction_type === "EXPENSE")
      .forEach((tx) => {
        const categoryName = getCategoryName(tx, categories);
        const amountNumber =
          typeof tx.amount === "string" ? parseFloat(tx.amount) : tx.amount;

        if (!isNaN(amountNumber)) {
          totals[categoryName] = (totals[categoryName] || 0) + amountNumber;
        }
      });

    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [transactions, categories]);

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center text-sm text-slate-500 h-full">
        <p>No hay gastos registrados en este mes.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `$ ${v}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ChartExpenses;
