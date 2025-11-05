import React from "react";

export interface StepProps {
  number: number;
  title: string;
  desc: string;
}

export default function Step({ number, title, desc }: StepProps) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">{number}</div>
        <div>
          <h5 className="font-semibold">{title}</h5>
          <p className="text-sm text-gray-600 mt-1">{desc}</p>
        </div>
      </div>
    </div>
  );
}


