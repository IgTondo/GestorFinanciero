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

// 👇 HE CREADO ESTA FUNCIÓN PARA REUTILIZARLA
const formatValue = (value: number | string) => {
  return Number(value).toLocaleString("es-UY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

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

    // 👇 AQUÍ REDONDEAMOS EL VALOR ANTES DE PASARLO AL GRÁFICO
    //    Aunque el formateo de la etiqueta y el tooltip lo harían
    //    visualmente, redondear la data aquí es más limpio y previene
    //    que el "label" por defecto (si se usara) muestre decimales largos.
    //    (Actualización: `recharts` prefiere formatear en el label/tooltip,
    //    así que dejaremos la data precisa y formatearemos en el render)
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
          // 👇 ESTE ES EL CAMBIO PRINCIPAL
          // Le pasamos una función a 'label'
          label={(entry) => formatValue(entry.value)}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip
          // Usamos la misma función, pero agregamos el signo '$'
          formatter={(value) => `$ ${formatValue(value)}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ChartExpenses;