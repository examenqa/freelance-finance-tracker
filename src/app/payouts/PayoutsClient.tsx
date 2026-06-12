"use client";

import { useState } from "react";
import { Wallet, CheckCircle, Trash2 } from "lucide-react";
import { markPayoutPaid, deletePayout } from "../actions/payouts";

export default function PayoutsClient({ payouts }: any) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paidDates, setPaidDates] = useState<{ [id: string]: string }>({});

  const unpaidPayouts = payouts.filter((p: any) => p.status === "unpaid");
  const paidPayouts = payouts.filter((p: any) => p.status === "paid");

  const handleMarkPaid = async (id: string) => {
    try {
      setErrorMsg(null);
      const dateVal = paidDates[id];
      if (!dateVal) {
        setErrorMsg("Please select a valid date for the payout.");
        return;
      }
      await markPayoutPaid(id, dateVal);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to mark payout as paid.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setErrorMsg(null);
      await deletePayout(id);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete payout.");
    }
  };

  const handleDateChange = (id: string, val: string) => {
    setPaidDates(prev => ({ ...prev, [id]: val }));
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="rounded-md bg-red-950/50 p-4 border border-red-500/50 text-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      {/* UNPAID PAYOUTS */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-medium text-white">Unpaid Ledger</h2>
        </div>
        
        {unpaidPayouts.length === 0 ? (
          <p className="text-sm text-slate-400">All payouts are settled.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 text-xs text-slate-400">
                <tr>
                  <th className="pb-2 font-medium">Employee</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Source Transaction</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {unpaidPayouts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-medium text-white">{p.employeeName}</td>
                    <td className="py-3 font-mono text-indigo-300">{(Number(p.amount) / 100).toFixed(2)}</td>
                    <td className="py-3 text-xs text-slate-400">{p.transactionDesc}</td>
                    <td className="py-3 flex justify-end items-center gap-2">
                      <input
                        type="date"
                        value={paidDates[p.id] || ""}
                        onChange={(e) => handleDateChange(p.id, e.target.value)}
                        className="rounded-md border border-indigo-500/30 bg-black/40 px-2 py-1 text-xs text-white outline-none focus:border-indigo-400 [color-scheme:dark]"
                      />
                      <button
                        onClick={() => handleMarkPaid(p.id)}
                        className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500 transition-colors"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded p-1 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Unpaid Payout"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SETTLED PAYOUTS */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-md shadow-xl">
        <div className="mb-4 flex items-center gap-2 opacity-70">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-medium text-white">Settled Ledger</h2>
        </div>
        
        {paidPayouts.length === 0 ? (
          <p className="text-sm text-slate-400">No settled payouts.</p>
        ) : (
          <div className="overflow-x-auto opacity-80">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 text-xs text-slate-400">
                <tr>
                  <th className="pb-2 font-medium">Employee</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Paid Date</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paidPayouts.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-3 font-medium text-white">{p.employeeName}</td>
                    <td className="py-3 font-mono text-emerald-300">{(Number(p.amount) / 100).toFixed(2)}</td>
                    <td className="py-3 font-mono text-slate-400">{p.paidDate}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded p-1 text-slate-600 hover:text-red-400 transition-colors"
                        title="Attempt Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
