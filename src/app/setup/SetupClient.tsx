"use client";

import { useState } from "react";
import { Plus, Trash2, Building, Users, FileSignature, Briefcase } from "lucide-react";
import {
  addSource,
  deleteSource,
  addEmployee,
  deleteEmployee,
  addClient,
  deleteClient,
  addContract,
  deleteContract,
} from "../actions/setup";

function Card({ children, title, icon: Icon }: any) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl transition-all">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-indigo-400" />
        <h2 className="text-lg font-medium text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function SetupClient({
  initialSources,
  initialEmployees,
  initialClients,
  initialContracts,
}: any) {
  const [sourceName, setSourceName] = useState("");
  const [clientName, setClientName] = useState("");
  
  const [empName, setEmpName] = useState("");
  const [empRate, setEmpRate] = useState("");

  const [contractClientId, setContractClientId] = useState("");
  const [contractSourceId, setContractSourceId] = useState("");
  const [contractRate, setContractRate] = useState("");
  const [contractCurrency, setContractCurrency] = useState("USD");
  const [contractUpwork, setContractUpwork] = useState(false);
  const [contractWht, setContractWht] = useState("0.0000");

  const handleAddSource = async () => {
    if (!sourceName) return;
    await addSource(sourceName);
    setSourceName("");
  };

  const handleAddClient = async () => {
    if (!clientName) return;
    await addClient(clientName);
    setClientName("");
  };

  const handleAddEmployee = async () => {
    if (!empName || !empRate) return;
    await addEmployee(empName, parseFloat(empRate));
    setEmpName("");
    setEmpRate("");
  };

  const handleAddContract = async () => {
    if (!contractClientId || !contractSourceId || !contractRate) return;
    await addContract(
      contractClientId,
      contractSourceId,
      parseFloat(contractRate),
      contractCurrency,
      contractUpwork,
      contractWht
    );
    setContractRate("");
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
      
      {/* SOURCES */}
      <Card title="Sources" icon={Building}>
        <div className="flex gap-2 mb-4">
          <input
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="Source Name (e.g. Upwork)"
            className="flex-1 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          />
          <button onClick={handleAddSource} className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {initialSources.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-sm">
              <span>{s.name}</span>
              <button onClick={() => deleteSource(s.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </Card>

      {/* CLIENTS */}
      <Card title="Clients" icon={Briefcase}>
        <div className="flex gap-2 mb-4">
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client Name"
            className="flex-1 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          />
          <button onClick={handleAddClient} className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {initialClients.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-sm">
              <span>{c.name}</span>
              <button onClick={() => deleteClient(c.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </Card>

      {/* EMPLOYEES */}
      <Card title="Employees" icon={Users}>
        <div className="flex gap-2 mb-4">
          <input
            value={empName}
            onChange={(e) => setEmpName(e.target.value)}
            placeholder="Name"
            className="flex-1 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          />
          <input
            value={empRate}
            onChange={(e) => setEmpRate(e.target.value)}
            placeholder="Base Rate"
            type="number"
            step="0.01"
            className="w-24 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          />
          <button onClick={handleAddEmployee} className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {initialEmployees.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-sm">
              <span>{e.name}</span>
              <span className="font-mono text-xs text-slate-400">{(Number(e.baseRate) / 100).toFixed(2)}</span>
              <button onClick={() => deleteEmployee(e.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </Card>

      {/* CONTRACTS */}
      <Card title="Contracts" icon={FileSignature}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select
            value={contractClientId}
            onChange={(e) => setContractClientId(e.target.value)}
            className="rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          >
            <option value="">Select Client</option>
            {initialClients.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={contractSourceId}
            onChange={(e) => setContractSourceId(e.target.value)}
            className="rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          >
            <option value="">Select Source</option>
            {initialSources.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mb-4 items-center">
          <input
            value={contractRate}
            onChange={(e) => setContractRate(e.target.value)}
            placeholder="Rate"
            type="number"
            step="0.01"
            className="w-20 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          />
          <input
            value={contractCurrency}
            onChange={(e) => setContractCurrency(e.target.value)}
            placeholder="Currency"
            className="w-16 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          />
          <input
            value={contractWht}
            onChange={(e) => setContractWht(e.target.value)}
            placeholder="WHT (0.001)"
            className="w-24 rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
          />
          <label className="flex items-center gap-1 text-xs text-slate-300">
            <input type="checkbox" checked={contractUpwork} onChange={(e) => setContractUpwork(e.target.checked)} className="rounded bg-black/20" />
            Upwork
          </label>
          <button onClick={handleAddContract} className="ml-auto rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {initialContracts.map((c: any) => {
            const client = initialClients.find((cl: any) => cl.id === c.clientId)?.name;
            const source = initialSources.find((s: any) => s.id === c.sourceId)?.name;
            return (
              <div key={c.id} className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-white">{client}</span>
                  <span className="text-xs text-slate-400">{source} &bull; {(Number(c.billedRate) / 100).toFixed(2)} {c.currency} &bull; WHT: {c.whtRate}</span>
                </div>
                <button onClick={() => deleteContract(c.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
}
