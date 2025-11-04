import React from "react";
import { motion } from "framer-motion";
import type { Account } from "../../views/AccountsPage";
import { useNavigate } from "react-router-dom";

interface AccountCardProps {
  account: Account;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/${account.id}`);
  };

  const memberCount = account.members?.length ?? 1;

  return (
    <motion.button
      onClick={handleClick}
      className="group relative flex flex-col items-stretch rounded-xl bg-white border border-slate-200 p-4 text-left shadow-sm hover:shadow-md hover:border-indigo-300 transition"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
            Cuenta
          </span>
          <h2 className="text-base font-semibold text-slate-900">
            {account.display_name || account.name}
          </h2>
          <span className="text-xs text-slate-500 mt-1">
            Creada el {new Date(account.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-col items-end text-right gap-1">
          <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-600 text-[11px] px-2.5 py-1 font-medium">
            {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
          </span>
          <span className="text-[11px] text-slate-500">
            Owner:{" "}
            <span className="font-medium text-slate-700">
              {account.owner?.first_name} {account.owner?.last_name}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Activa
        </span>
        <span className="opacity-0 group-hover:opacity-100 transition text-indigo-500 font-medium">
          Ver transacciones →
        </span>
      </div>
    </motion.button>
  );
};
