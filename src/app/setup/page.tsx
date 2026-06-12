import { db } from "@/db";
import { sources, employees, clients, contracts } from "@/db/schema";
import SetupClient from "./SetupClient";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const allSources = await db.select().from(sources);
  const allEmployees = await db.select().from(employees);
  const allClients = await db.select().from(clients);
  const allContracts = await db.select().from(contracts);

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] p-6 text-slate-200">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Setup</h1>
          <p className="text-sm text-slate-400 mt-1">Manage foundational agency data</p>
        </header>

        <SetupClient
          initialSources={allSources}
          initialEmployees={allEmployees}
          initialClients={allClients}
          initialContracts={allContracts}
        />
      </div>
    </div>
  );
}
