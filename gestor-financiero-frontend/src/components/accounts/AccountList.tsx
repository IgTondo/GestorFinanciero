import React from "react";
import type { Account } from "../../views/AccountsPage";
import { AccountCard } from "./AccountCard";

interface AccountListProps {
  accounts: Account[];
}

export const AccountList: React.FC<AccountListProps> = ({ accounts }) => {
  if (accounts.length === 0) {
    return (
      <div className="border border-dashed border-slate-700/60 rounded-2xl p-8 text-center text-slate-400">
        Todavía no tenés cuentas creadas. Empezá creando una para organizar tus
        movimientos. 🧾
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  );
};
