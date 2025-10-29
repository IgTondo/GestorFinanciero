import type { Transaction } from "./Dashboard";

export const mockTransactions: Transaction[] = [
  // Octubre 2025 (mes actual)
  { id: 1, type: "egreso", category: "Comidas", amount: 450, date: "2025-10-01" },
  { id: 2, type: "ingreso", category: "Salario", amount: 8000, date: "2025-10-01" },
  { id: 3, type: "egreso", category: "Supermercado", amount: 3200, date: "2025-10-03" },
  { id: 4, type: "egreso", category: "Deportes", amount: 800, date: "2025-10-05" },
  { id: 5, type: "egreso", category: "Educación", amount: 1500, date: "2025-10-10" },
  { id: 6, type: "egreso", category: "Salidas", amount: 600, date: "2025-10-12" },

  // Septiembre 2025
  { id: 7, type: "egreso", category: "Comidas", amount: 400, date: "2025-09-02" },
  { id: 8, type: "egreso", category: "Supermercado", amount: 2800, date: "2025-09-05" },
  { id: 9, type: "ingreso", category: "Salario", amount: 7500, date: "2025-09-01" },
  { id: 10, type: "egreso", category: "Deportes", amount: 600, date: "2025-09-10" },
  { id: 11, type: "egreso", category: "Educación", amount: 1200, date: "2025-09-15" },
  { id: 12, type: "egreso", category: "Salidas", amount: 500, date: "2025-09-20" },

  // Agosto 2025
  { id: 13, type: "egreso", category: "Comidas", amount: 500, date: "2025-08-03" },
  { id: 14, type: "ingreso", category: "Salario", amount: 7800, date: "2025-08-01" },
  { id: 15, type: "egreso", category: "Salidas", amount: 700, date: "2025-08-20" },
  { id: 16, type: "egreso", category: "Supermercado", amount: 2900, date: "2025-08-07" },
  { id: 17, type: "egreso", category: "Deportes", amount: 400, date: "2025-08-15" },
  { id: 18, type: "egreso", category: "Educación", amount: 1000, date: "2025-08-10" },

  // Julio 2025 (solo para testear mes sin gastos)
  { id: 19, type: "ingreso", category: "Salario", amount: 7800, date: "2025-07-01" },
];
