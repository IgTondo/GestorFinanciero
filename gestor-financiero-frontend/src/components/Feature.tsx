import React from "react";

export interface FeatureProps {
  title: string;
  description: string;
}

export default function Feature({ title, description }: FeatureProps) {
  return (
    <article className="p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </article>
  );
}


