import { db } from "@/db";
import { employees, contracts, clients, timeEntries, sources } from "@/db/schema";
import { eq } from "drizzle-orm";
import WorkClient from "./WorkClient";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const allEmployees = await db.select().from(employees);
  const allContracts = await db.select().from(contracts);
  const allClients = await db.select().from(clients);
  const allSources = await db.select().from(sources);
  
  const entries = await db.select().from(timeEntries).where(eq(timeEntries.status, "pending"));

  // Map to something readable for the UI
  const populatedContracts = allContracts.map((c) => ({
    ...c,
    clientName: allClients.find((cl) => cl.id === c.clientId)?.name || "Unknown",
    sourceName: allSources.find((s) => s.id === c.sourceId)?.name || "Unknown",
  }));

  const populatedEntries = entries.map((te) => ({
    ...te,
    employeeName: allEmployees.find((e) => e.id === te.employeeId)?.name || "Unknown",
    contract: populatedContracts.find((c) => c.id === te.contractId),
  }));

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] p-6 text-slate-200">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Weekly Work</h1>
          <p className="text-sm text-slate-400 mt-1">Log hours to build up the incoming payment queue</p>
        </header>

        <WorkClient
          employees={allEmployees}
          contracts={populatedContracts}
          timeEntries={populatedEntries}
        />
      </div>
    </div>
  );
}
