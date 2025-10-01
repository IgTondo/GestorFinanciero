import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props {
  transactions: any[];
}

export default function ChartExpenses({ transactions }: Props) {
  const expenses = transactions.filter(t => t.type === "egreso");

  const dataByCategory = expenses.reduce((acc: Record<string, number>, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});

  let chartData = Object.entries(dataByCategory).map(([cat, value]) => ({
    name: cat,
    value,
  }));

  // 👉 Si no hay egresos, forzar un slice ficticio
  if (chartData.length === 0) {
    chartData = [{ name: "Sin gastos", value: 1 }];
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Gastos por Categoría</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name }) => name} // siempre muestra el label
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Total real de egresos */}
      <div className="mt-4 text-center text-gray-700">
        <span className="text-sm">Total de egresos: </span>
        <span className="font-semibold">${total}</span>
      </div>
    </div>
  );
}
