"use client";

import { useState } from "react";
import { Copy, Plus, Trash2, ReceiptText, CalendarClock } from "lucide-react";
import {
  addRecurringExpense,
  deleteRecurringExpense,
  addExpense,
  deleteExpense,
  generateMonthlyExpenses,
} from "../actions/expenses";

export default function ExpensesClient({ templates, ledgers }: any) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Template Form
  const [tplName, setTplName] = useState("");
  const [tplAmount, setTplAmount] = useState("");
  const [tplCategory, setTplCategory] = useState("Software");

  // One-off Form
  const [expCategory, setExpCategory] = useState("Software");
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState("");

  // Generator
  const [genMonth, setGenMonth] = useState("");

  const handleAddTemplate = async () => {
    if (!tplName || !tplAmount) return;
    await addRecurringExpense(tplName, parseFloat(tplAmount), tplCategory);
    setTplName("");
    setTplAmount("");
  };

  const handleAddExpense = async () => {
    if (!expDesc || !expAmount || !expDate) return;
    await addExpense(expCategory, expDesc, parseFloat(expAmount), expDate, false);
    setExpDesc("");
    setExpAmount("");
  };

  const handleGenerate = async () => {
    try {
      setErrorMsg(null);
      if (!genMonth) {
        setErrorMsg("Please select a month (YYYY-MM).");
        return;
      }
      await generateMonthlyExpenses(genMonth);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate expenses.");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="col-span-full rounded-md bg-red-950/50 p-4 border border-red-500/50 text-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      {/* RECURRING TEMPLATES */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl h-fit">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-medium text-white">Recurring Templates</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <input
            value={tplName}
            onChange={(e) => setTplName(e.target.value)}
            placeholder="Name (e.g. GitHub Copilot)"
            className="flex-1 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          />
          <input
            type="number"
            step="0.01"
            value={tplAmount}
            onChange={(e) => setTplAmount(e.target.value)}
            placeholder="Amount"
            className="w-24 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          />
          <select
            value={tplCategory}
            onChange={(e) => setTplCategory(e.target.value)}
            className="w-28 rounded-md border border-white/10 bg-black/20 px-2 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          >
            <option value="Software">Software</option>
            <option value="Hardware">Hardware</option>
            <option value="Services">Services</option>
            <option value="Office">Office</option>
            <option value="Other">Other</option>
          </select>
          <button
            onClick={handleAddTemplate}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {templates.length === 0 ? (
          <p className="text-sm text-slate-400">No recurring templates setup.</p>
        ) : (
          <div className="space-y-2 mt-4">
            {templates.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between rounded bg-black/20 px-3 py-2 text-sm border border-white/5">
                <div className="flex flex-col">
                  <span className="font-medium text-white">{t.name}</span>
                  <span className="text-xs text-slate-400">{t.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-indigo-300">{(Number(t.amount) / 100).toFixed(2)}</span>
                  <button onClick={() => deleteRecurringExpense(t.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GENERATOR TRIGGER */}
        <div className="mt-8 rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock className="h-4 w-4 text-indigo-400" />
            <h3 className="font-medium text-sm text-indigo-100">Instantiate Month</h3>
          </div>
          <p className="text-xs text-indigo-200/70 mb-3">
            Safely generates the ledger using the templates above. Locked Point-in-Time pricing applies.
          </p>
          <div className="flex gap-2">
            <input
              type="month"
              value={genMonth}
              onChange={(e) => setGenMonth(e.target.value)}
              className="rounded-md border border-indigo-500/30 bg-black/40 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-400 [color-scheme:dark]"
            />
            <button
              onClick={handleGenerate}
              className="flex-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
            >
              Generate Month's Expenses
            </button>
          </div>
        </div>
      </div>

      {/* LEDGER */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl h-fit">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-medium text-white">Immutable Ledger</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <input
            value={expDesc}
            onChange={(e) => setExpDesc(e.target.value)}
            placeholder="One-off Description"
            className="flex-1 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          />
          <input
            type="number"
            step="0.01"
            value={expAmount}
            onChange={(e) => setExpAmount(e.target.value)}
            placeholder="Amount"
            className="w-20 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          />
          <input
            type="date"
            value={expDate}
            onChange={(e) => setExpDate(e.target.value)}
            className="w-32 rounded-md border border-white/10 bg-black/20 px-2 py-1.5 text-sm text-white outline-none focus:border-indigo-500 [color-scheme:dark]"
          />
          <button
            onClick={handleAddExpense}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {ledgers.length === 0 ? (
          <p className="text-sm text-slate-400">Ledger is empty.</p>
        ) : (
          <div className="overflow-x-auto mt-4 max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="sticky top-0 bg-[#0f172a] border-b border-white/10 text-xs text-slate-400">
                <tr>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ledgers.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((l: any) => (
                  <tr key={l.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 text-xs text-slate-400 whitespace-nowrap">{l.createdAt}</td>
                    <td className="py-2 text-white truncate max-w-[200px]" title={l.description}>{l.description}</td>
                    <td className="py-2 text-right font-mono text-indigo-300">{(Number(l.amount) / 100).toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => deleteExpense(l.id)} className="text-slate-500 hover:text-red-400 transition-colors">
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
