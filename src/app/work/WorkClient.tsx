"use client";

import { useState } from "react";
import { Plus, Clock } from "lucide-react";
import { addTimeEntry } from "../actions/work";

export default function WorkClient({ employees, contracts, timeEntries }: any) {
  const [employeeId, setEmployeeId] = useState("");
  const [contractId, setContractId] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [hours, setHours] = useState("");

  const handleAdd = async () => {
    if (!employeeId || !contractId || !weekStart || !hours) return;
    await addTimeEntry(employeeId, contractId, weekStart, hours);
    setHours("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-medium text-white">Log Hours</h2>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
            >
              <option value="">Select...</option>
              {employees.map((e: any) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Contract</label>
            <select
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              className="rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
            >
              <option value="">Select...</option>
              {contracts.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.clientName} via {c.sourceName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Week Start</label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Hours</label>
            <input
              type="number"
              step="0.25"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-24 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleAdd}
            className="rounded-md bg-indigo-600 px-4 py-1.5 text-white hover:bg-indigo-500 transition-colors"
          >
            Log Entry
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
        <h3 className="mb-4 text-md font-medium text-white">Pending Entries</h3>
        {timeEntries.length === 0 ? (
          <p className="text-sm text-slate-400">No pending time entries. You're all caught up!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 text-xs text-slate-400">
                <tr>
                  <th className="pb-2 font-medium">Employee</th>
                  <th className="pb-2 font-medium">Contract</th>
                  <th className="pb-2 font-medium">Week Start</th>
                  <th className="pb-2 font-medium">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {timeEntries.map((te: any) => (
                  <tr key={te.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2">{te.employeeName}</td>
                    <td className="py-2">{te.contract?.clientName} via {te.contract?.sourceName}</td>
                    <td className="py-2">{te.weekStart}</td>
                    <td className="py-2">{te.hours}</td>
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
