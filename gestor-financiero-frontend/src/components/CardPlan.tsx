import React from "react";

export interface CardPlanProps {
  title: string;
  price: string;
  perks?: string[];
  ctaText: string;
  highlight?: boolean;
}

export default function CardPlan({ title, price, perks = [], ctaText, highlight }: CardPlanProps) {
  return (
    <div className={`p-6 rounded-2xl border ${highlight ? 'border-indigo-200 shadow-lg' : 'border-gray-100'} bg-white`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">{title}</h4>
          <p className="text-sm text-gray-500">Pago mensual</p>
        </div>
        <div className="text-2xl font-bold">${price}</div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-gray-600">
        {perks.map((p, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-4 h-4 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs">✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <button className={`w-full py-2 rounded-lg font-medium ${highlight ? 'bg-indigo-600 text-white' : 'border border-gray-200'}`}>{ctaText}</button>
      </div>
    </div>
  );
}


