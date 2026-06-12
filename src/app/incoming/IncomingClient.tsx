"use client";

import { useState } from "react";
import { CheckSquare, Square, DollarSign } from "lucide-react";
import { createIncomingTransaction } from "../actions/incoming";

export default function IncomingClient({ timeEntries }: any) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exchangeRate, setExchangeRate] = useState("");
  const [serviceCharge, setServiceCharge] = useState("");
  const [receivedDate, setReceivedDate] = useState("");

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selId) => selId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleProcess = async () => {
    if (selectedIds.length === 0 || !exchangeRate || !receivedDate) return;
    await createIncomingTransaction(selectedIds, exchangeRate, serviceCharge, receivedDate);
    setSelectedIds([]);
    setExchangeRate("");
    setServiceCharge("");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* QUEUE */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl lg:col-span-2">
        <h2 className="mb-4 text-lg font-medium text-white">Payment Queue</h2>
        {timeEntries.length === 0 ? (
          <p className="text-sm text-slate-400">No pending time entries to process.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 text-xs text-slate-400">
                <tr>
                  <th className="pb-2 w-10"></th>
                  <th className="pb-2 font-medium">Client / Source</th>
                  <th className="pb-2 font-medium">Employee</th>
                  <th className="pb-2 font-medium">Week Start</th>
                  <th className="pb-2 font-medium text-right">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {timeEntries.map((te: any) => {
                  const isSelected = selectedIds.includes(te.id);
                  return (
                    <tr 
                      key={te.id} 
                      className={`hover:bg-white/10 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-500/10' : ''}`}
                      onClick={() => toggleSelection(te.id)}
                    >
                      <td className="py-3">
                        {isSelected ? <CheckSquare className="h-4 w-4 text-indigo-400" /> : <Square className="h-4 w-4 text-slate-500" />}
                      </td>
                      <td className="py-3">{te.clientName} via {te.sourceName}</td>
                      <td className="py-3">{te.employeeName}</td>
                      <td className="py-3 text-slate-400">{te.weekStart}</td>
                      <td className="py-3 text-right font-mono text-indigo-300">{te.hours}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ACTION PANEL */}
      <div className="rounded-xl border border-white/10 bg-indigo-950/30 p-6 backdrop-blur-md shadow-xl border-t-indigo-500/50 h-fit">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-medium text-white">Process Transaction</h2>
        </div>
        <p className="mb-6 text-sm text-indigo-200">
          Selected Entries: <span className="font-bold text-white">{selectedIds.length}</span>
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-indigo-200">Date Received</label>
            <input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="w-full rounded-md border border-indigo-500/30 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-indigo-200">Service Charge / Platform Fee</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-indigo-500/30 bg-black/40 pl-7 pr-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-indigo-200">Actual Exchange Rate (Gateway)</label>
            <input
              type="number"
              step="0.0001"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="e.g. 83.5020"
              className="w-full rounded-md border border-indigo-500/30 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
            />
          </div>
          
          <button
            onClick={handleProcess}
            disabled={selectedIds.length === 0}
            className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Incoming Payment
          </button>
        </div>
      </div>
    </div>
  );
}
